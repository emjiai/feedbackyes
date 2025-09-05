# FastAPI Backend for Realtime Voice Communication with Next.js
# main.py

import os
import json
import asyncio
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from contextlib import asynccontextmanager
import uuid
import base64

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends, Header, BackgroundTasks
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import httpx
import websockets
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_REALTIME_URL = "wss://api.openai.com/v1/realtime"
OPENAI_API_BASE = "https://api.openai.com/v1"

if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable is required")

# Pydantic Models
class EphemeralTokenRequest(BaseModel):
    session_config: Optional[Dict[str, Any]] = None
    scenario_id: Optional[str] = None
    cultural_context: Optional[str] = None

class TranscriptionSession(BaseModel):
    session_id: str
    model: str = "gpt-4o-transcribe"
    language: Optional[str] = None
    prompt: Optional[str] = None

class ScenarioConfig(BaseModel):
    id: str
    title: str
    description: str
    role: str
    context: str
    objectives: List[str]
    cultural_context: Optional[str] = None
    difficulty_level: str = "intermediate"

class FeedbackAnalysis(BaseModel):
    session_id: str
    transcript: str
    scenario_id: str
    duration_seconds: int
    
class SessionUpdate(BaseModel):
    instructions: Optional[str] = None
    voice: Optional[str] = None
    turn_detection: Optional[Dict[str, Any]] = None
    tools: Optional[List[Dict[str, Any]]] = None
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None

class RealtimeSession:
    """Manages a realtime voice session"""
    
    def __init__(self, session_id: str, call_id: Optional[str] = None):
        self.session_id = session_id
        self.call_id = call_id
        self.websocket_to_openai: Optional[websockets.WebSocketClientProtocol] = None
        self.client_websocket: Optional[WebSocket] = None
        self.is_active = False
        self.transcript_buffer = []
        self.metadata = {}
        
    async def connect_to_openai(self, call_id: Optional[str] = None):
        """Establish WebSocket connection to OpenAI Realtime API"""
        try:
            url = OPENAI_REALTIME_URL
            if call_id:
                url = f"{url}?call_id={call_id}"
            else:
                url = f"{url}?model=gpt-realtime"
                
            headers = {
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "OpenAI-Beta": "realtime=v1"
            }
            
            self.websocket_to_openai = await websockets.connect(url, extra_headers=headers)
            self.is_active = True
            logger.info(f"Connected to OpenAI Realtime API for session {self.session_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to OpenAI: {str(e)}")
            return False
    
    async def relay_messages(self):
        """Relay messages between client and OpenAI"""
        try:
            while self.is_active:
                # Wait for messages from OpenAI
                if self.websocket_to_openai:
                    message = await self.websocket_to_openai.recv()
                    parsed = json.loads(message)
                    
                    # Process specific event types
                    await self.process_openai_event(parsed)
                    
                    # Forward to client
                    if self.client_websocket:
                        await self.client_websocket.send_json(parsed)
        except websockets.exceptions.ConnectionClosed:
            logger.info(f"OpenAI connection closed for session {self.session_id}")
        except Exception as e:
            logger.error(f"Error in relay_messages: {str(e)}")
        finally:
            self.is_active = False
    
    async def process_openai_event(self, event: Dict[str, Any]):
        """Process events from OpenAI for analytics and storage"""
        event_type = event.get("type")
        
        # Capture transcription events
        if event_type == "conversation.item.input_audio_transcription.completed":
            transcript = event.get("transcript", "")
            self.transcript_buffer.append({
                "timestamp": datetime.utcnow().isoformat(),
                "type": "user",
                "text": transcript
            })
        elif event_type == "response.audio_transcript.done":
            transcript = event.get("transcript", "")
            self.transcript_buffer.append({
                "timestamp": datetime.utcnow().isoformat(),
                "type": "assistant",
                "text": transcript
            })
        elif event_type == "response.done":
            # Log response completion for analytics
            if event.get("response", {}).get("usage"):
                logger.info(f"Usage for session {self.session_id}: {event['response']['usage']}")
    
    async def send_to_openai(self, message: Dict[str, Any]):
        """Send message to OpenAI Realtime API"""
        if self.websocket_to_openai and self.is_active:
            await self.websocket_to_openai.send(json.dumps(message))
    
    async def close(self):
        """Close the session"""
        self.is_active = False
        if self.websocket_to_openai:
            await self.websocket_to_openai.close()
        logger.info(f"Session {self.session_id} closed")

# Session Manager
class SessionManager:
    """Manages all active realtime sessions"""
    
    def __init__(self):
        self.sessions: Dict[str, RealtimeSession] = {}
    
    def create_session(self, session_id: str, call_id: Optional[str] = None) -> RealtimeSession:
        """Create a new session"""
        session = RealtimeSession(session_id, call_id)
        self.sessions[session_id] = session
        return session
    
    def get_session(self, session_id: str) -> Optional[RealtimeSession]:
        """Get an existing session"""
        return self.sessions.get(session_id)
    
    async def remove_session(self, session_id: str):
        """Remove and close a session"""
        if session_id in self.sessions:
            await self.sessions[session_id].close()
            del self.sessions[session_id]

# Initialize session manager
session_manager = SessionManager()

# FastAPI app with lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting FastAPI Realtime Voice Backend")
    yield
    # Shutdown - clean up all sessions
    for session_id in list(session_manager.sessions.keys()):
        await session_manager.remove_session(session_id)
    logger.info("Shutting down FastAPI Realtime Voice Backend")

app = FastAPI(
    title="Team Communication Realtime Voice API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Add your Next.js URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

# Generate ephemeral token for client-side WebRTC connection
@app.post("/api/token")
async def generate_ephemeral_token(request: EphemeralTokenRequest):
    """Generate ephemeral API key for client-side WebRTC connection"""
    try:
        # Build session configuration
        session_config = {
            "session": {
                "type": "realtime",
                "model": "gpt-realtime",
                "audio": {
                    "input": {
                        "format": "pcm16",
                        "turn_detection": {
                            "type": "semantic_vad",
                            "create_response": True,
                            "threshold": 0.5,
                            "prefix_padding_ms": 300,
                            "silence_duration_ms": 500
                        }
                    },
                    "output": {
                        "format": "pcm16",
                        "voice": "alloy",
                        "speed": 1.0
                    }
                },
                "input_audio_transcription": {
                    "model": "gpt-4o-transcribe"
                }
            }
        }
        
        # Add custom instructions based on scenario
        if request.scenario_id:
            session_config["session"]["instructions"] = f"""
            You are participating in a team communication practice scenario.
            Scenario ID: {request.scenario_id}
            Be natural, conversational, and help the user practice effective communication.
            Provide constructive feedback when appropriate.
            """
        
        # Add cultural context if provided
        if request.cultural_context:
            session_config["session"]["instructions"] += f"\nCultural context: {request.cultural_context}"
        
        # Override with custom config if provided
        if request.session_config:
            session_config["session"].update(request.session_config)
        
        # Request ephemeral token from OpenAI
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{OPENAI_API_BASE}/realtime/client_secrets",
                headers={
                    "Authorization": f"Bearer {OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                },
                json=session_config
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Failed to generate token")
            
            data = response.json()
            return {
                "value": data.get("value"),
                "expires_at": data.get("expires_at"),
                "session_config": session_config["session"]
            }
            
    except Exception as e:
        logger.error(f"Error generating ephemeral token: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# WebSocket endpoint for server-side session control
@app.websocket("/ws/realtime/{session_id}")
async def websocket_realtime_session(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for realtime voice session with server-side control"""
    await websocket.accept()
    
    # Create new session
    session = session_manager.create_session(session_id)
    session.client_websocket = websocket
    
    try:
        # Connect to OpenAI
        connected = await session.connect_to_openai()
        if not connected:
            await websocket.send_json({
                "type": "error",
                "error": "Failed to connect to OpenAI Realtime API"
            })
            return
        
        # Send session created event to client
        await websocket.send_json({
            "type": "session.created",
            "session_id": session_id,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        # Start relay task
        relay_task = asyncio.create_task(session.relay_messages())
        
        # Handle messages from client
        while True:
            data = await websocket.receive_json()
            
            # Process client commands
            if data.get("type") == "session.update":
                # Update session configuration
                await session.send_to_openai(data)
            elif data.get("type") == "input_audio_buffer.append":
                # Forward audio data
                await session.send_to_openai(data)
            elif data.get("type") == "response.create":
                # Trigger response generation
                await session.send_to_openai(data)
            else:
                # Forward any other message types
                await session.send_to_openai(data)
                
    except WebSocketDisconnect:
        logger.info(f"Client disconnected from session {session_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        await websocket.send_json({
            "type": "error",
            "error": str(e)
        })
    finally:
        await session_manager.remove_session(session_id)

# Transcription-only endpoint
@app.post("/api/transcription/start")
async def start_transcription_session(config: TranscriptionSession):
    """Start a transcription-only session"""
    try:
        session_id = config.session_id or str(uuid.uuid4())
        
        # Create transcription session configuration
        session_config = {
            "object": "realtime.transcription_session",
            "id": session_id,
            "input_audio_format": "pcm16",
            "input_audio_transcription": [{
                "model": config.model,
                "prompt": config.prompt or "",
                "language": config.language or ""
            }],
            "turn_detection": {
                "type": "server_vad",
                "threshold": 0.5,
                "prefix_padding_ms": 300,
                "silence_duration_ms": 500
            },
            "input_audio_noise_reduction": {
                "type": "near_field"
            },
            "include": ["item.input_audio_transcription.logprobs"]
        }
        
        # Store session config (you might want to use Redis or a database)
        session = session_manager.create_session(session_id)
        session.metadata = session_config
        
        return {
            "session_id": session_id,
            "config": session_config,
            "status": "ready"
        }
        
    except Exception as e:
        logger.error(f"Error starting transcription session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Scenario management endpoints
@app.get("/api/scenarios")
async def get_scenarios():
    """Get available practice scenarios"""
    # In production, this would come from a database
    scenarios = [
        {
            "id": "conflict-resolution",
            "title": "Conflict Resolution",
            "description": "Practice resolving workplace conflicts diplomatically",
            "difficulty": "intermediate",
            "duration_minutes": 10,
            "objectives": [
                "Active listening",
                "Finding common ground",
                "De-escalation techniques"
            ]
        },
        {
            "id": "performance-review",
            "title": "Performance Review",
            "description": "Conduct effective performance discussions",
            "difficulty": "advanced",
            "duration_minutes": 15,
            "objectives": [
                "Constructive feedback",
                "Goal setting",
                "Motivation techniques"
            ]
        },
        {
            "id": "team-standup",
            "title": "Daily Standup",
            "description": "Run efficient team standup meetings",
            "difficulty": "beginner",
            "duration_minutes": 5,
            "objectives": [
                "Clear communication",
                "Time management",
                "Team coordination"
            ]
        }
    ]
    return {"scenarios": scenarios}

@app.get("/api/scenarios/{scenario_id}")
async def get_scenario(scenario_id: str):
    """Get detailed scenario configuration"""
    # In production, fetch from database
    scenario_configs = {
        "conflict-resolution": {
            "id": "conflict-resolution",
            "title": "Conflict Resolution",
            "description": "Practice resolving workplace conflicts",
            "role": "Team Lead",
            "context": """You are mediating a conflict between two team members 
            who disagree on the technical approach for a critical project.""",
            "objectives": [
                "Listen to both perspectives",
                "Find common ground",
                "Reach a constructive solution"
            ],
            "ai_role": "One of the conflicting team members",
            "ai_personality": "Frustrated but professional",
            "success_criteria": {
                "active_listening": 0.8,
                "empathy": 0.7,
                "solution_focus": 0.75
            }
        }
    }
    
    if scenario_id not in scenario_configs:
        raise HTTPException(status_code=404, detail="Scenario not found")
    
    return scenario_configs[scenario_id]

# Feedback and analytics endpoints
@app.post("/api/feedback/analyze")
async def analyze_feedback(analysis: FeedbackAnalysis):
    """Analyze conversation for feedback"""
    try:
        # Get session data
        session = session_manager.get_session(analysis.session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Prepare transcript for analysis
        transcript_text = "\n".join([
            f"{t['type']}: {t['text']}" 
            for t in session.transcript_buffer
        ])
        
        # Use OpenAI API to analyze the conversation
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{OPENAI_API_BASE}/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-4",
                    "messages": [
                        {
                            "role": "system",
                            "content": """Analyze this team communication practice session.
                            Provide feedback on:
                            1. Communication effectiveness
                            2. Active listening
                            3. Empathy and emotional intelligence
                            4. Problem-solving approach
                            5. Areas for improvement
                            
                            Format as JSON with scores (0-100) and specific feedback."""
                        },
                        {
                            "role": "user",
                            "content": f"Scenario: {analysis.scenario_id}\n\nTranscript:\n{transcript_text}"
                        }
                    ],
                    "temperature": 0.3,
                    "response_format": {"type": "json_object"}
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Analysis failed")
            
            result = response.json()
            feedback = json.loads(result["choices"][0]["message"]["content"])
            
            # Add metadata
            feedback["session_id"] = analysis.session_id
            feedback["scenario_id"] = analysis.scenario_id
            feedback["duration_seconds"] = analysis.duration_seconds
            feedback["timestamp"] = datetime.utcnow().isoformat()
            
            return feedback
            
    except Exception as e:
        logger.error(f"Error analyzing feedback: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Pulse check endpoints
@app.post("/api/pulse")
async def submit_pulse_check(data: Dict[str, Any]):
    """Submit team pulse check data"""
    try:
        # In production, save to database
        pulse_data = {
            "id": str(uuid.uuid4()),
            "timestamp": datetime.utcnow().isoformat(),
            "user_id": data.get("user_id"),
            "team_id": data.get("team_id"),
            "responses": data.get("responses", {}),
            "overall_score": sum(data.get("responses", {}).values()) / len(data.get("responses", {1: 1}))
        }
        
        # Calculate insights
        insights = []
        if pulse_data["overall_score"] < 3:
            insights.append("Team morale appears low - consider team building activities")
        if data.get("responses", {}).get("communication", 0) < 3:
            insights.append("Communication challenges detected - schedule alignment meeting")
        
        pulse_data["insights"] = insights
        
        return pulse_data
        
    except Exception as e:
        logger.error(f"Error submitting pulse check: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/pulse/trends")
async def get_pulse_trends(team_id: Optional[str] = None, days: int = 30):
    """Get pulse check trends"""
    # In production, query from database
    # This is mock data for demonstration
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    trends = {
        "period": {
            "start": start_date.isoformat(),
            "end": end_date.isoformat()
        },
        "average_score": 3.8,
        "trend": "improving",
        "categories": {
            "communication": {"current": 4.1, "previous": 3.8, "change": 0.3},
            "collaboration": {"current": 3.9, "previous": 3.7, "change": 0.2},
            "morale": {"current": 3.6, "previous": 3.5, "change": 0.1},
            "productivity": {"current": 4.0, "previous": 3.9, "change": 0.1}
        },
        "participation_rate": 0.85
    }
    
    return trends

# Team agreements endpoints
@app.get("/api/agreements")
async def get_team_agreements(team_id: Optional[str] = None):
    """Get team agreements"""
    # Mock data - in production, fetch from database
    agreements = [
        {
            "id": "agr-001",
            "title": "Communication Standards",
            "description": "How we communicate as a team",
            "created_at": "2024-01-15T10:00:00Z",
            "updated_at": "2024-01-20T14:30:00Z",
            "status": "active",
            "items": [
                "Respond to messages within 24 hours",
                "Use threads for discussions",
                "Camera on for important meetings"
            ]
        },
        {
            "id": "agr-002",
            "title": "Meeting Protocol",
            "description": "Our meeting guidelines",
            "created_at": "2024-01-10T09:00:00Z",
            "updated_at": "2024-01-10T09:00:00Z",
            "status": "active",
            "items": [
                "Start and end on time",
                "Share agenda 24 hours before",
                "Action items documented"
            ]
        }
    ]
    
    return {"agreements": agreements}

# Dashboard analytics
@app.get("/api/dashboard/stats")
async def get_dashboard_stats(user_id: Optional[str] = None):
    """Get dashboard statistics"""
    stats = {
        "practice_sessions": {
            "total": 42,
            "this_week": 8,
            "average_duration_minutes": 12.5,
            "improvement_rate": 0.15
        },
        "team_health": {
            "overall_score": 4.2,
            "trend": "stable",
            "last_pulse": "2024-01-25T10:00:00Z"
        },
        "skills_progress": {
            "active_listening": 0.85,
            "conflict_resolution": 0.72,
            "feedback_delivery": 0.68,
            "cultural_awareness": 0.90
        },
        "upcoming": {
            "practice_sessions": 3,
            "team_meetings": 2,
            "pulse_checks": 1
        }
    }
    
    return stats

# MCP (Model Context Protocol) tools configuration
@app.post("/api/mcp/tools")
async def configure_mcp_tools(tools_config: Dict[str, Any]):
    """Configure MCP tools for the realtime session"""
    # This would integrate with MCP servers for additional capabilities
    # For now, we'll return a mock configuration
    return {
        "status": "configured",
        "tools": [
            {
                "name": "calendar_check",
                "description": "Check team calendar for availability",
                "enabled": True
            },
            {
                "name": "team_metrics",
                "description": "Access team performance metrics",
                "enabled": True
            },
            {
                "name": "cultural_context",
                "description": "Get cultural communication guidelines",
                "enabled": True
            }
        ]
    }

# Webhook endpoint for SIP integration (if needed)
@app.post("/webhooks/sip")
async def handle_sip_webhook(data: Dict[str, Any], background_tasks: BackgroundTasks):
    """Handle SIP webhooks for phone-based sessions"""
    event_type = data.get("type")
    
    if event_type == "realtime.call.incoming":
        call_id = data.get("data", {}).get("call_id")
        
        # Create session for the call
        session_id = str(uuid.uuid4())
        session = session_manager.create_session(session_id, call_id)
        
        # Connect to the call in the background
        background_tasks.add_task(session.connect_to_openai, call_id)
        
        return {
            "status": "accepted",
            "session_id": session_id,
            "call_id": call_id
        }
    
    return {"status": "processed"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)