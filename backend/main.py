import os
import json
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from schemas import IncidentCreate, IncidentResponse, SafeCircleUpdateCreate, SafeCircleUpdateResponse
from ai_service import classify_incident, summarize_incidents

# Load environment variables from exactly one directory up (.env in root)
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path)

app = FastAPI(title="Community Guardian API")

origins = [
    os.getenv("FRONTEND_URL", "http://localhost:5173"),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_FILE = os.path.join(os.path.dirname(__file__), "data", "incidents.json")
CIRCLES_DATA_FILE = os.path.join(os.path.dirname(__file__), "data", "circles.json")

def load_data(file_path: str = DATA_FILE) -> List[dict]:
    if not os.path.exists(file_path):
        return []
    with open(file_path, "r") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []

def save_data(data: List[dict], file_path: str = DATA_FILE):
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, "w") as f:
        json.dump(data, f, indent=2)

def load_circles() -> dict:
    if not os.path.exists(CIRCLES_DATA_FILE):
        return {}
    with open(CIRCLES_DATA_FILE, "r") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return {}

def save_circles(data: dict):
    os.makedirs(os.path.dirname(CIRCLES_DATA_FILE), exist_ok=True)
    with open(CIRCLES_DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)

@app.get("/api/incidents/summary")
def get_neighborhood_summary(neighborhood: str = Query(...)):
    incidents = load_data()
    filtered_incidents = [inc for inc in incidents if inc.get("neighborhood") == neighborhood]
    
    if not filtered_incidents:
        return {"summary": f"Things are looking quiet and safe in {neighborhood} recently. No major incidents to report."}
        
    incidents_text = "\n".join([f"- {inc['title']}: {inc['description']} (Category: {inc.get('category', 'unknown')})" for inc in filtered_incidents[:10]]) # limit to last 10 to fit context
    
    summary = summarize_incidents(incidents_text, neighborhood)
    return {"summary": summary}
    
@app.get("/api/incidents/stats")
def get_incident_stats():
    data = load_data()
    stats = {}
    for item in data:
        nh = item.get("neighborhood", "Unknown")
        cat = item.get("category", "unknown")
        if nh not in stats:
            stats[nh] = {"verified_alert": 0, "noise": 0, "digital_threat": 0}
        stats[nh][cat] = stats[nh].get(cat, 0) + 1
    return stats

@app.get("/api/incidents", response_model=List[IncidentResponse])
def get_incidents(
    category: Optional[str] = None,
    neighborhood: Optional[str] = None,
    search: Optional[str] = Query(None, description="Search in title or description")
):
    data = load_data()
    
    if category:
        data = [item for item in data if item.get("category") == category]
    if neighborhood:
        data = [item for item in data if item.get("neighborhood", "").lower() == neighborhood.lower()]
    if search:
        s = search.lower()
        data = [item for item in data if s in item.get("title", "").lower() or s in item.get("description", "").lower()]
        
    return data

@app.post("/api/incidents", response_model=IncidentResponse)
def create_incident(incident: IncidentCreate):
    classification = classify_incident(incident.description)
    
    new_incident = {
        "id": str(uuid.uuid4()),
        "title": incident.title,
        "description": incident.description,
        "neighborhood": incident.neighborhood,
        "category": classification.get("category", "noise"),
        "action_steps": classification.get("action_steps", []),
        "upvotes": 0,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    data = load_data()
    data.insert(0, new_incident)
    save_data(data)
    
    return new_incident

@app.patch("/api/incidents/{incident_id}/verify", response_model=IncidentResponse)
def verify_incident(incident_id: str):
    data = load_data()
    for index, item in enumerate(data):
        if item["id"] == incident_id:
            data[index]["upvotes"] = data[index].get("upvotes", 0) + 1
            save_data(data)
            return data[index]
    raise HTTPException(status_code=404, detail="Incident not found")

@app.put("/api/incidents/{incident_id}", response_model=IncidentResponse)
def update_incident(incident_id: str, incident_update: IncidentCreate):
    data = load_data()
    for index, item in enumerate(data):
        if item["id"] == incident_id:
            # Reclassify based on new description
            classification = classify_incident(incident_update.description)
            data[index]["title"] = incident_update.title
            data[index]["description"] = incident_update.description
            data[index]["neighborhood"] = incident_update.neighborhood
            data[index]["category"] = classification.get("category", "noise")
            data[index]["action_steps"] = classification.get("action_steps", [])
            save_data(data)
            return data[index]
    raise HTTPException(status_code=404, detail="Incident not found")

@app.delete("/api/incidents/{incident_id}")
def delete_incident(incident_id: str):
    data = load_data()
    filtered_data = [item for item in data if item["id"] != incident_id]
    if len(data) == len(filtered_data):
        raise HTTPException(status_code=404, detail="Incident not found")
    save_data(filtered_data)
    return {"message": "Incident deleted successfully"}

@app.post("/api/circles/{circle_id}/updates", response_model=SafeCircleUpdateResponse)
def create_circle_update(circle_id: str, update: SafeCircleUpdateCreate):
    circles = load_circles()
    
    new_update = {
        "id": str(uuid.uuid4()),
        "status": update.status,
        "location_status": update.location_status,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    if circle_id not in circles:
        circles[circle_id] = []
        
    circles[circle_id].insert(0, new_update)
    save_circles(circles)
    
    return new_update

@app.get("/api/circles/{circle_id}/updates", response_model=List[SafeCircleUpdateResponse])
def get_circle_updates(circle_id: str):
    circles = load_circles()
    return circles.get(circle_id, [])
