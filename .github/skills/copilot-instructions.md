# Project Context: "Community Guardian"
You are an expert full-stack developer helping build a take-home assessment within a strict 4-6 hour timebox. The project is "Community Guardian," a platform that aggregates local safety data and uses AI to filter noise and provide actionable safety digests.

## Core Evaluation Rubric (CRITICAL TO FOLLOW)
1. **AI & Fallback:** Every AI API call (Summarize, Categorize, Filter) MUST be wrapped in a `try/catch`. The `catch` block MUST implement a robust, rule-based manual fallback (e.g., keyword matching) when the AI fails or times out.
2. **Testing:** All core business logic and API routes must have at least two tests:
   - One Happy Path test.
   - One Edge Case test (specifically testing the AI failure/fallback mechanism).
3. **Data Safety:** Never scrape live sites. Use ONLY synthetic data read from/written to a local `data/incidents.json` file.
4. **Security:** NEVER hardcode API keys. Always use `process.env` or `os.getenv()` and ensure keys are loaded from a `.env` file.
5. **Quality:** Always include strict input validation, clear error messages for the user, and loading states for asynchronous actions.

## Coding Standards & Best Practices
- **Prioritize Functionality over Polish:** UI should be clean but minimal (use Tailwind utility classes). Focus on the backend logic, error handling, and data flow.
- **Simplicity:** Do not over-engineer. Use local JSON or in-memory arrays for database operations to save time. 
- **Modularity:** Keep components small and focused. Separate AI API logic, file system operations (JSON reading/writing), and route handlers into distinct modules/services.
- **Typing:** Use strict TypeScript types or Python Pydantic models/TypeHints for all data structures (especially the incident schemas and AI response payloads).
- **Comments:** Keep comments minimal but explicitly comment the "AI Fallback Mechanism" and "Edge Case Handling" to make it easy for the reviewers to spot.

## Component Generation Rules
- When generating UI components, include a search/filter bar and a form to submit new incidents.
- When generating API routes, include input validation (e.g., Zod for TS, Pydantic for Python).
- When generating tests, use standard frameworks (Jest/Vitest for TS, Pytest for Python) and mock the AI API response to ensure tests run fast and without network dependencies.
