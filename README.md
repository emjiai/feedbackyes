# FeedbackYes — Realtime Voice Practice App

This repository contains a Next.js frontend and a FastAPI backend that together power a realtime, voice-based team communication practice experience. The system integrates with OpenAI’s Realtime API for bidirectional audio and with Chat Completions for post-session feedback analysis.


## Contents
- Frontend-Backend Architecture
- How the new frontend files integrate with the backend
- Backend endpoints used by the frontend
- Environment variables
- Local development: how to run
- Data flow walkthroughs (WebRTC and WebSocket)
- Troubleshooting


## Frontend-Backend Architecture
- Frontend (Next.js App Router) lives under `frontend/`.
- Backend (FastAPI) lives under `backend/` and exposes HTTP and WebSocket endpoints on port `8000` by default.
- CORS in the backend allows `http://localhost:3000` and `http://localhost:3001`.
- The backend communicates with OpenAI’s Realtime API for live audio and with Chat Completions for analysis.


## How the new frontend files integrate with the backend
The following new frontend modules provide a complete flow to start a realtime practice session, stream audio, and get feedback at the end.

1) `frontend/lib/hooks/use-realtime-voice.ts`
   - A React hook that encapsulates two connection strategies to the backend/OpenAI Realtime API:
     - WebRTC mode (recommended for browsers):
       - Fetches an ephemeral client token from the backend `POST /api/token`.
       - Creates an `RTCPeerConnection`, attaches the microphone track, and establishes a DataChannel (`oai-events`).
       - Exchanges SDP with OpenAI’s Realtime API using the ephemeral token to complete the WebRTC connection.
       - Sends session updates and receives transcription/events via the DataChannel.
     - WebSocket mode (server-controlled alternative):
       - Connects the browser directly to the backend `ws://localhost:8000/ws/realtime/{session_id}`.
       - Captures mic audio chunks in the browser, encodes as base64, and streams to the backend using messages like `input_audio_buffer.append`.
       - The backend relays messages to/from OpenAI’s Realtime API.
   - Exposes helpers: `connectWebRTC`, `connectWebSocket`, `sendText`, `interrupt`, `disconnect`, plus state and the live transcript list.

2) `frontend/components/voice/realtime-voice-card.tsx`
   - A client component that uses the `useRealtimeVoice` hook to provide a simple UI for:
     - Starting a session (WebRTC connect), interrupting, and ending a session.
     - Displaying connection status and a short transcript preview.
     - Notifying the parent when the session ends so it can request analysis.

3) `frontend/app/practice/[id]/cluade_page_for_api.tsx`
   - The scenario practice page that orchestrates the flow:
     - Loads scenario details from the backend: `GET /api/scenarios/{id}`.
     - Renders the `RealtimeVoiceCard` to run a live session.
     - When the session ends, posts the conversation for analysis to `POST /api/feedback/analyze` and displays the results.


## Backend endpoints used by the frontend
Backend file: `backend/main.py`

- `GET /health`
  - Health check used for diagnostics.

- `POST /api/token`
  - Returns an ephemeral OpenAI Realtime client token for browser-side WebRTC.
  - Body accepts optional fields: `scenario_id`, `cultural_context`, and `session_config` overrides.

- `WEBSOCKET /ws/realtime/{session_id}`
  - Server-controlled realtime session via WebSocket.
  - Forwards messages between the browser and OpenAI Realtime API and aggregates a transcript.

- `GET /api/scenarios/{scenario_id}`
  - Returns scenario metadata like role, context, and objectives shown on the practice page.

- `POST /api/feedback/analyze`
  - Submits a completed session for analysis using OpenAI Chat Completions.
  - Returns structured feedback with scores and recommendations.

Note: There are additional endpoints (e.g., `/api/scenarios`, `/api/pulse`, `/api/dashboard/stats`) for broader app features, but the realtime voice flow primarily uses those listed above.


## Environment variables
The backend requires your OpenAI API key.

- Location: `backend/.env` (ignored by Git via `backend/.gitignore`)
- Required:
  - `OPENAI_API_KEY=your-openai-key`
- Optional (defaults are set in code):
  - `OPENAI_API_BASE=https://api.openai.com/v1`
  - `OPENAI_REALTIME_URL=wss://api.openai.com/v1/realtime`

The frontend does not require special env for local use of these features; it calls `http://localhost:8000` directly.


## Local development — how to run
1) Backend setup
   - Windows PowerShell (from `backend/`):
     ```powershell
     cd backend
     python -m venv .venv
     .\.venv\Scripts\Activate
     pip install -r requirements.txt
     # Or install manually if needed:
     # pip install fastapi uvicorn httpx websockets python-dotenv pydantic

     # Set your key for this session
     $env:OPENAI_API_KEY = "sk-..."

     # Start backend (either):
     python main.py
     # or
     uvicorn main:app --host 0.0.0.0 --port 8000 --reload
     ```
   - Verify: open `http://localhost:8000/health` and `http://localhost:8000/docs`.

2) Frontend setup
   - From `frontend/` in another terminal:
     ```bash
     npm install
     npm run dev
     # App will run at http://localhost:3000
     ```


## Data flow walkthroughs

### A) WebRTC mode (browser to OpenAI via ephemeral token)
- `use-realtime-voice.ts` calls `POST http://localhost:8000/api/token` to obtain an ephemeral Realtime token.
- The hook creates an `RTCPeerConnection`, attaches the microphone track, and opens a DataChannel.
- It sends the local SDP offer to `https://api.openai.com/v1/realtime/calls?model=gpt-realtime` with the ephemeral token and sets the remote answer.
- Realtime events come back over the DataChannel; transcripts are surfaced in the hook via `onTranscript` and stored in `transcript` state.
- `realtime-voice-card.tsx` displays status, allows interrupt/end, and shows a short transcript.

### B) WebSocket mode (browser to backend WebSocket)
- `use-realtime-voice.ts` connects to `ws://localhost:8000/ws/realtime/{session_id}`.
- The browser captures mic audio (`MediaRecorder`), chunks to base64, and sends messages such as:
  - `{ type: 'input_audio_buffer.append', audio: '<base64>' }`
  - `{ type: 'response.create' }`
- The backend (`RealtimeSession`) relays all messages to OpenAI Realtime and forwards events back to the browser.
- The backend aggregates transcripts and stores them in `session.transcript_buffer` for later analysis.

### C) Post-session analysis
- When the user ends a session (`onSessionEnd` in `realtime-voice-card.tsx`), the practice page posts to `POST /api/feedback/analyze` with:
  - `session_id`, `transcript` (as text), `scenario_id`, and `duration_seconds`.
- The backend formats the conversation and calls OpenAI Chat Completions with a JSON response format.
- The page displays the returned scores and key feedback.


## Troubleshooting
- Mic permissions: The browser will prompt for permission. If blocked, WebRTC or audio capture will fail.
- CORS: Backend already allows `http://localhost:3000` and `http://localhost:3001`. If you use another port, add it in `backend/main.py` CORS config.
- Missing API key: Backend will raise `OPENAI_API_KEY environment variable is required` on startup. Set it in `backend/.env` or your shell environment.
- Network: Ensure `http://localhost:8000` is reachable from the frontend; adjust firewall/antivirus if necessary.


## Notes
- The hook exposes both WebRTC and WebSocket modes for flexibility. WebRTC is generally lower-latency and preferred in browsers; WebSocket mode is useful if you want the server to own the connection to OpenAI.
- The mock scenario and analytics data in the backend can be replaced with real database-backed content as needed.