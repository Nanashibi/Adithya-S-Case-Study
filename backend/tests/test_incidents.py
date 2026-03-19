import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
import os
import json
import sys

# Ensure backend folder is discoverable
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app, DATA_FILE

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_teardown():
    """Backup synthetic data and restore after tests"""
    backup = None
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            backup = f.read()
    
    # Initialize empty data for test duration
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    with open(DATA_FILE, 'w') as f:
        json.dump([], f)
        
    yield
    
    # Teardown: Restore the data
    if backup is not None:
        with open(DATA_FILE, 'w') as f:
            f.write(backup)

@patch('ai_service.genai.Client')
def test_create_incident_happy_path(mock_client):
    """
    Happy Path: Validating correct incident parsing, AI integration routing,
    and Pydantic schemas. 
    """
    mock_instance = mock_client.return_value
    
    class MockResponse:
        text = '{"category": "verified_alert", "action_steps": []}'
        
    mock_instance.models.generate_content.return_value = MockResponse()
    
    response = client.post("/api/incidents", json={
        "title": "Suspicious van",
        "description": "A white van has been circling our block for hours without a license plate.",
        "neighborhood": "Uptown"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Suspicious van"
    assert data["category"] == "verified_alert"
    assert data["neighborhood"] == "Uptown"

# Edge Case Handling: AI Failure / Fallback test
@patch('ai_service.genai.Client')
def test_create_incident_ai_fallback_edge_case(mock_client):
    """
    Edge Case: AI API goes down, we verify the fallback rule-based categorize
    captures the 'phishing' keyword and classifies it properly.
    """
    mock_instance = mock_client.return_value
    mock_instance.models.generate_content.side_effect = Exception("API Timeout")
    
    response = client.post("/api/incidents", json={
        "title": "Weird Email",
        "description": "Got a strange phishing email asking for my password. Don't click it!",
        "neighborhood": "Downtown"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert data["category"] == "digital_threat"
    assert "action_steps" in data
    assert len(data["action_steps"]) > 0
    # Confirm fallback list contains keyword referencing passwords

@patch('ai_service.genai.Client')
def test_get_incident_summary(mock_client):
    """
    Test the neighborhood summarization feature mapping.
    """
    mock_instance = mock_client.return_value

    # First, mock the classification so we can create an incident
    class MockClassificationResponse:
        text = '{"category": "general_observation", "action_steps": []}'
    mock_instance.models.generate_content.return_value = MockClassificationResponse()

    # Create an incident to summarize
    client.post("/api/incidents", json={
        "title": "Lost Cat",
        "description": "A furry little orange tabby is wandering around the park.",
        "neighborhood": "Riverside"
    })

    # Now, mock the summarization AI call
    class MockSummaryResponse:
        text = "A lost orange tabby cat was spotted near the park in Riverside. Keep an eye out."
    mock_instance.models.generate_content.return_value = MockSummaryResponse()

    response = client.get("/api/incidents/summary?neighborhood=Riverside")
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert "orange tabby" in data["summary"]

def test_get_incident_summary_empty():
    """
    Test behavior when there are no incidents for a neighborhood.
    AI shouldn't be called, it should just return the default safe message.
    """
    response = client.get("/api/incidents/summary?neighborhood=GhostTown")
    assert response.status_code == 200
    data = response.json()
    assert "Things are looking quiet and safe" in data["summary"]
