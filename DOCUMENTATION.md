# Community Guardian - Design & Architecture Documentation

## 1. Project Overview
**Scenario Chosen:** Community Safety & Digital Wellness (Scenario 3)  
**Objective:** To build the "Community Guardian" platform, a local-first safety app that aggregates physical and digital security data, utilizes AI to filter out noise, categorizes threats, and provides actionable steps—thus lowering community anxiety.

## 2. Architecture & Tech Stack
The platform uses a decoupled frontend and backend architecture to ensure clean separation of concerns, scalability, and ease of testing.

* **Frontend:** React 18 using Vite.
  * **Styling:** Tailwind CSS v4, providing robust utility-first styling to create a clean, calm user interface (reducing anxiety). 
  * **Routing/State:** React standard hooks (`useState`, `useEffect`). We designed the AI features to be manually triggered to optimize client-side performance.
  * **Icons:** `lucide-react`.
* **Backend:** FastAPI (Python).
  * **Why FastAPI?** It provides extremely fast execution, automatic interactive API documentation (Swagger UI), and built-in data validation using Pydantic schemas.
* **Storage:** Local Synthetic JSON (`incidents.json`, `circles.json`).
  * **Why JSON?** The prompt strictly required synthetic data over a short development window (4-6 hours). Flat JSON files mimic database I/O while removing the overhead of ORMs and database provisioning.
* **AI Integration:** Google GenAI SDK (Gemini 2.5 Flash).
  * Used for fast text classification and contextual neighborhood summarization.
 
## 3. Best practices followed
**Granular Github commits:**  Ensured multiple granular commits with meaningful messages
**Agent Skill:** An agent skill file .github/skills/copilot-instructions.md is used to ensure AI agent follows best practices while generating code
**Virtual environment:** A virtual environment is used for Python backend so that all libraries are installed only in the .venv
**Documentation and comments:** Meaningful and concise comments are added to the files for better understanding

## 4. Key Features & AI Implementation
### Feature 1: AI-Powered Noise-to-Signal Categorization
When a user submits a report, the backend does not just blind-save it. The text is passed to the Gemini API with a strict system prompt to categorize the text into one of three buckets:
1. `verified_alert`: Physical threats, break-ins, suspicious activity.
2. `digital_threat`: Scams, phishing, hacking.
3. `noise`: General venting, loud music, minor inconveniences.

If a `digital_threat` is detected, the AI generates a dynamic 3-step actionable checklist (e.g., "1. Change passwords, 2. Do not click links...").

### Feature 2: Manual AI Neighborhood Digest
Instead of scrolling through dozens of reports, users can click **"Generate Digest"**. The backend compiles recent incidents for that neighborhood and asks the AI to generate a calm, objective, anxiety-reducing summary of the current security climate.

## 5. Fallback Mechanism
AI APIs can fail due to rate limits, network timeouts, or schema mismatches. To ensure 100% uptime for core features, I implemented a robust **Rule-Based Fallback Mechanism**.
* **How it works:** In `backend/ai_service.py`, the GenAI call is wrapped in a `try/except` block.
* **The Fallback:** If an exception is caught, the app invokes `classify_incident_fallback()`. This function scans the description against predefined arrays of keywords (e.g., "password", "phishing", "stolen"). If a match is found, it mimics the AI response structure, assigning the correct category and providing hardcoded action steps. 

## 6. Testing Strategy
We utilized `pytest` and `fastapi.testclient` to ensure endpoints operate correctly.
1. **Happy Path (`test_create_incident_happy_path`):** Mocks an ideal AI response and validates that the JSON payload successfully populates the synthetic database.
2. **Edge Case (`test_create_incident_ai_fallback_edge_case`):** Intentionally causes the AI mock to throw an `Exception("API Timeout")`. It then asserts that the backend successfully recovers and correctly labels a "phishing schema" text array using the fallback logic.

## 7. Trade-offs and Prioritization
* **Dropped Database:** Skipped implementing PostgreSQL/SQLAlchemy to focus entirely on full-stack CRUD capabilities, the robust AI integration, and a polished frontend UI within the time limit.
* **Manual AI vs Auto-Polling:** Initially, the app auto-generated AI summaries every time a user changed their neighborhood filter. I deliberately shifted this to a manual "Generate Digest" button. This was a crucial design trade-off to protect against API rate limits and unbounded costs, giving the user agency over computational requests.
* **Authentication:** We bypassed explicit OAuth/Login to stay focused on the required AI workflows and fallback mechanisms.

## 8. Future Enhancements
* **Real-time Safe Circles:** Integration with Twilio/WebSockets to send SMS or push notifications to a small group of trusted contacts when a severe `verified_alert` is made.
* **Map Views:** Integrating Google Maps or other Map API to cluster reports visually.
* **Persistent DB:** Migrating from JSON to a persistent, containerized SQL database like PostgreSQL.
