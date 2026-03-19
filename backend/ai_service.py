import os
import json
import logging
from google import genai

logger = logging.getLogger(__name__)

# AI Fallback Mechanism
def classify_incident_fallback(description: str) -> dict:
    """
    Rule-based manual fallback mechanism for when the AI is unavailable, times out, or fails.
    """
    desc_lower = description.lower()
    
    # Catch digital threats
    if any(word in desc_lower for word in ["password", "phishing", "scam", "hack", "breach", "link", "fake"]):
        return {
            "category": "digital_threat",
            "action_steps": [
                "Do not click any unfamiliar links.", 
                "Change your passwords immediately.", 
                "Report the incident to IT or local authorities."
            ]
        }
    # Catch physical threats/verified alerts
    elif any(word in desc_lower for word in ["break-in", "stolen", "fire", "emergency", "police", "robbery", "theft"]):
        return {
            "category": "verified_alert",
            "action_steps": []
        }
    # Default to noise for venting or miscellaneous
    else:
        return {
            "category": "noise",
            "action_steps": []
        }

def classify_incident(description: str) -> dict:
    try:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key or api_key == "your_gemini_api_key_here":
            raise ValueError("Invalid or missing GEMINI_API_KEY")
        
        client = genai.Client(api_key=api_key)
        
        prompt = f"""
        Analyze the following neighborhood incident report.
        Classify it into exactly one of these categories: "verified_alert", "noise", "digital_threat".
        If it is a "digital_threat", provide a 1-2-3 checklist array of actionable steps to secure accounts as "action_steps".
        Otherwise, "action_steps" should be an empty array.
        
        Respond ONLY with a valid JSON object matching this exact schema:
        {{"category": "string", "action_steps": ["step1", "step2", "step3"]}}
        
        Incident Description:
        "{description}"
        """
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        
        # Cleanup markdown formatting safely
        text = response.text.replace('```json', '').replace('```', '').strip()
        result = json.loads(text)
        
        category = result.get("category", "noise")
        if category not in ["verified_alert", "noise", "digital_threat"]:
            category = "noise"
            
        return {
            "category": category,
            "action_steps": result.get("action_steps", [])
        }
        
    except Exception as e:
        logger.error(f"AI Classification failed: {str(e)}. Using fallback mechanism.")
        # Invoke the manual rule-based AI fallback gracefully
        return classify_incident_fallback(description)

def summarize_incidents_fallback(incidents_text: str) -> str:
    """
    Fallback for summarization if the AI fails. Returns a generic safe message.
    """
    return "Summary currently unavailable due to system load. Please review the individual safety stats below."

def summarize_incidents(incidents_text: str, neighborhood: str) -> str:
    """
    Generates a calm, anxiety-reducing digest of recent incidents for a neighborhood.
    """
    if not incidents_text.strip():
        return f"Things are looking quiet and safe in {neighborhood} recently. No major incidents to report."
        
    try:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key or api_key == "your_gemini_api_key_here":
            raise ValueError("Invalid or missing GEMINI_API_KEY")
            
        client = genai.Client(api_key=api_key)
        
        prompt = f"""
        You are a reassuring community safety guardian for the neighborhood of "{neighborhood}". 
        Read the following recent incident titles and descriptions. 
        Write a calm, anxiety-reducing digest (maximum 3 sentences) summarizing the activity.
        Do not cause panic. Focus on trends and actionable advice. Do not use markdown bullet points.

        Incidents:
        {incidents_text}
        """
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        
        return response.text.strip()
        
    except Exception as e:
        logger.error(f"AI Summarization failed: {str(e)}. Using fallback mechanism.")
        return summarize_incidents_fallback(incidents_text)
