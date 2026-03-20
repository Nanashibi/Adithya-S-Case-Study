Candidate Name: Adithya S
Scenario Chosen: 3. Community Safety & Digital Wellness
Estimated Time Spent: 5 hours

Quick Start: 
● Prerequisites: Node.js, Python 3.8+
● Run Commands: 
  - Backend: `cd backend` -> `pip install -r requirements.txt` -> `uvicorn main:app --reload`
  - Frontend: `cd frontend` -> `npm install` -> `npm run dev`
● Test Commands: `cd backend` -> `pytest tests/test_incidents.py`

AI Disclosure:  
● Did you use an AI assistant (Copilot, ChatGPT, etc.)? Yes.
● How did you verify the suggestions? I manually checked the instructions documents to see if the suggestions align with the requirements and also used another AI tool if there are better and more efficient ways to perform the same task.
● Give one example of a suggestion you rejected or changed: The AI suggested running the AI summarization via a reactive `useEffect` hook that triggered every time the neighborhood dropdown changed. I rejected this and rewrote it to use a manual explicit "Generate Digest" button to avoid excessive rate limits with Gemini API and costly API spam.

Tradeoffs & Prioritization:  
● What did you cut to stay within the 4–6 hour limit? I cut out setting up a persistent SQL database (like Postgres) and instead used functional JSON file to mimic I/O. I also skipped formal User Authentication flows due to the time constraint.
● What would you build next if you had more time? I would add user-specific "Safe Circles" with Twilio SMS integration so users could instantly push severe verified alerts directly to a trusted group of family members. I would also add User Authentication.
● Known limitations: Since it relies on a local JSON file, simultaneous concurrent network writes might overwrite each other (no file locks). There is also no User Authentication and the Safe Circles is generated using synthetic JSON data. The Gemini API summarization length is hardcoded to limit to 10 most recent incidents and may be cut off if an area has an abnormally huge surge of incidents. 
