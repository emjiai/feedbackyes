## FeedbackYes Backend (FastAPI)

This backend powers realtime, voice-based practice sessions and analytics for the FeedbackYes app. It integrates with OpenAI's Realtime API for low-latency audio conversations and the Chat Completions API for post-session feedback analysis.

Backend entry point: `backend/main.py`


## Features
- Realtime voice session relay to OpenAI Realtime API (WebSocket and WebRTC token support)
- Ephemeral token generation for browser-side WebRTC
- Scenario metadata APIs
- Conversation analysis API (uses Chat Completions with JSON output)
- Pulse checks and dashboard mock endpoints
- CORS enabled for local Next.js dev


## Requirements
- Python 3.10+
- OpenAI API key


## Setup
1) Create a virtual environment and install dependencies
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate
pip install -r requirements.txt
```

2) Configure environment variables
- Create `backend/.env` (this file is gitignored) and set:
```
OPENAI_API_KEY=sk-...
```
- Optional overrides (defaults are set in code):
```
OPENAI_API_BASE=https://api.openai.com/v1
OPENAI_REALTIME_URL=wss://api.openai.com/v1/realtime
```

3) Run the server
- Option A (uses the `if __name__ == "__main__"` block):
```powershell
python main.py
```
- Option B (recommended for dev with reload):
```powershell
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

4) Verify
- Health: http://localhost:8000/health
- Docs (Swagger UI): http://localhost:8000/docs


## CORS
CORS is configured in `main.py` to allow the Next.js app during local development:
```python
allow_origins=["http://localhost:3000", "http://localhost:3001"]
```
Add or adjust origins as needed for your environment.


## Key Modules in `main.py`
- `RealtimeSession` and `SessionManager` — manages live sessions, relays messages to/from OpenAI Realtime API, buffers transcript lines
- FastAPI app and lifespan — startup/shutdown housekeeping and session cleanup
- CORS middleware — enables frontend access
- Routes for token generation, scenarios, analysis, pulse checks, dashboard data
- WebSocket endpoint — for server-controlled realtime sessions


## API Overview
Below are the primary endpoints used by the frontend.

### Health
GET `/health`
- Returns health status and timestamp.

Example:
```bash
curl http://localhost:8000/health
```

### Ephemeral Token for WebRTC
POST `/api/token`
- Returns an ephemeral OpenAI Realtime token for the browser to create a direct WebRTC connection to OpenAI.
- Request body (all fields optional):
```json
{
  "scenario_id": "conflict-resolution",
  "cultural_context": "US-English",
  "session_config": {
    "voice": "alloy"
  }
}
```
- Response contains `value` (ephemeral token) and `expires_at`.

Example:
```bash
curl -X POST http://localhost:8000/api/token \
  -H "Content-Type: application/json" \
  -d '{"scenario_id":"conflict-resolution"}'
```

### Realtime WebSocket (Server-controlled)
WEBSOCKET `/ws/realtime/{session_id}`
- The browser connects to the backend via WebSocket.
- The backend establishes a separate WebSocket to OpenAI Realtime API and relays both directions.
- The backend collects transcripts on events like:
  - `conversation.item.input_audio_transcription.completed` (user speech)
  - `response.audio_transcript.done` (assistant speech)

Client message examples (JSON):
```json
{ "type": "session.update", "session": { "type": "realtime", "model": "gpt-realtime" } }
{ "type": "input_audio_buffer.append", "audio": "<base64-encoded-pcm16>" }
{ "type": "response.create" }
```

### Scenarios
GET `/api/scenarios`
- Returns a list of mock scenarios.

GET `/api/scenarios/{scenario_id}`
- Returns details for a specific scenario (role, context, objectives, etc.).

### Conversation Analysis
POST `/api/feedback/analyze`
- Analyzes a completed session. The backend compiles the buffered transcript and calls OpenAI Chat Completions with a JSON response format.
- Request body:
```json
{
  "session_id": "session_123",
  "transcript": "<optional raw transcript text>",
  "scenario_id": "conflict-resolution",
  "duration_seconds": 300
}
```
- Response: JSON object with scores, feedback, and metadata.

### Pulse & Dashboard (Mock)
- POST `/api/pulse` — submit team pulse results
- GET `/api/pulse/trends` — returns mock trend data
- GET `/api/dashboard/stats` — returns mock dashboard stats

### SIP Webhook (Optional)
POST `/webhooks/sip`
- Placeholder endpoint for phone-based sessions. Creates a session for an incoming call and connects to OpenAI in the background.


## Internals: Realtime Flow
1) Browser uses one of two strategies:
   - WebRTC mode: frontend fetches ephemeral token from `/api/token`, then directly negotiates with OpenAI Realtime API via SDP offer/answer; events flow over a DataChannel.
   - WebSocket mode: frontend connects to `/ws/realtime/{session_id}` and streams mic audio chunks (base64) to the backend; the backend relays to OpenAI and forwards events back.
2) `RealtimeSession` stores structured transcript entries in `transcript_buffer` for later analysis.
3) `POST /api/feedback/analyze` converts `transcript_buffer` into a plain-text transcript and calls Chat Completions for structured feedback.


## Troubleshooting
- Missing key: If `OPENAI_API_KEY` is not set, startup will fail with `OPENAI_API_KEY environment variable is required`.
- Microphone capture (WebSocket mode): Ensure the browser has permission to access the mic.
- CORS: If using a non-standard frontend port, add it to the `allow_origins` list in `main.py`.
- Networking: Confirm `http://localhost:8000` is reachable from the frontend.
- OpenAI access: Ensure your API key has access to required models (`gpt-realtime`, `gpt-4o-transcribe`, etc.).


## Development Notes
- Logging is configured with `logging.basicConfig(level=logging.INFO)`.
- Consider persisting sessions (e.g., Redis/DB) if you need durability beyond in-memory `SessionManager`.
- Replace mock scenario and analytics endpoints with your data sources as needed.