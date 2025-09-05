// lib/hooks/use-realtime-voice.ts
import { useState, useCallback, useRef, useEffect } from 'react';

interface RealtimeConfig {
  scenarioId?: string;
  culturalContext?: string;
  voice?: string;
  onTranscript?: (transcript: TranscriptEvent) => void;
  onError?: (error: Error) => void;
  onStateChange?: (state: SessionState) => void;
}

interface TranscriptEvent {
  type: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

type SessionState = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

export function useRealtimeVoice(config: RealtimeConfig = {}) {
  const [state, setState] = useState<SessionState>('idle');
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEvent[]>([]);
  
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  // Update state and notify
  const updateState = useCallback((newState: SessionState) => {
    setState(newState);
    config.onStateChange?.(newState);
  }, [config]);

  // Connect using WebRTC (recommended for browser)
  const connectWebRTC = useCallback(async () => {
    try {
      updateState('connecting');

      // Get ephemeral token from backend
      const tokenResponse = await fetch('http://localhost:8000/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario_id: config.scenarioId,
          cultural_context: config.culturalContext,
          session_config: {
            voice: config.voice || 'alloy',
          }
        })
      });

      if (!tokenResponse.ok) throw new Error('Failed to get token');
      
      const { value: ephemeralKey } = await tokenResponse.json();

      // Create peer connection
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      // Set up audio output
      audioElementRef.current = document.createElement('audio');
      audioElementRef.current.autoplay = true;
      pc.ontrack = (e) => {
        if (audioElementRef.current) {
          audioElementRef.current.srcObject = e.streams[0];
        }
      };

      // Add microphone input
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      pc.addTrack(stream.getTracks()[0]);

      // Set up data channel for events
      const dc = pc.createDataChannel('oai-events');
      dcRef.current = dc;

      dc.onopen = () => {
        updateState('connected');
        
        // Send initial session update
        dc.send(JSON.stringify({
          type: 'session.update',
          session: {
            type: 'realtime',
            model: 'gpt-realtime',
            instructions: getInstructions(config.scenarioId),
            input_audio_transcription: {
              model: 'gpt-4o-transcribe'
            }
          }
        }));
      };

      dc.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleRealtimeEvent(data);
      };

      dc.onerror = (error) => {
        console.error('DataChannel error:', error);
        config.onError?.(new Error('Data channel error'));
      };

      // Create offer and connect
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpResponse = await fetch(
        `https://api.openai.com/v1/realtime/calls?model=gpt-realtime`,
        {
          method: 'POST',
          body: offer.sdp,
          headers: {
            Authorization: `Bearer ${ephemeralKey}`,
            'Content-Type': 'application/sdp',
          },
        }
      );

      const answerSdp = await sdpResponse.text();
      await pc.setRemoteDescription({
        type: 'answer',
        sdp: answerSdp,
      });

      setIsRecording(true);

    } catch (error) {
      console.error('WebRTC connection error:', error);
      updateState('error');
      config.onError?.(error as Error);
    }
  }, [config, updateState]);

  // Alternative: Connect using WebSocket (for server-side control)
  const connectWebSocket = useCallback(async () => {
    try {
      updateState('connecting');
      
      const sessionId = `session_${Date.now()}`;
      sessionIdRef.current = sessionId;

      const ws = new WebSocket(`ws://localhost:8000/ws/realtime/${sessionId}`);
      wsRef.current = ws;

      ws.onopen = () => {
        updateState('connected');
        
        // Send session configuration
        ws.send(JSON.stringify({
          type: 'session.update',
          session: {
            type: 'realtime',
            model: 'gpt-realtime',
            voice: config.voice || 'alloy',
            instructions: getInstructions(config.scenarioId),
            input_audio_transcription: {
              model: 'gpt-4o-transcribe'
            }
          }
        }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleRealtimeEvent(data);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        updateState('error');
        config.onError?.(new Error('WebSocket connection failed'));
      };

      ws.onclose = () => {
        updateState('disconnected');
        setIsRecording(false);
      };

      // Set up audio streaming (you'll need to implement audio capture)
      startAudioStreaming(ws);

    } catch (error) {
      console.error('WebSocket connection error:', error);
      updateState('error');
      config.onError?.(error as Error);
    }
  }, [config, updateState]);

  // Handle events from OpenAI Realtime API
  const handleRealtimeEvent = useCallback((event: any) => {
    switch (event.type) {
      case 'conversation.item.input_audio_transcription.completed':
        const userTranscript: TranscriptEvent = {
          type: 'user',
          text: event.transcript,
          timestamp: new Date().toISOString()
        };
        setTranscript(prev => [...prev, userTranscript]);
        config.onTranscript?.(userTranscript);
        break;

      case 'response.audio_transcript.done':
        const assistantTranscript: TranscriptEvent = {
          type: 'assistant',
          text: event.transcript,
          timestamp: new Date().toISOString()
        };
        setTranscript(prev => [...prev, assistantTranscript]);
        config.onTranscript?.(assistantTranscript);
        break;

      case 'error':
        console.error('Realtime API error:', event);
        config.onError?.(new Error(event.error?.message || 'Unknown error'));
        break;
    }
  }, [config]);

  // Start audio streaming for WebSocket connection
  const startAudioStreaming = useCallback(async (ws: WebSocket) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
          // Convert blob to base64
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result?.toString().split(',')[1];
            if (base64) {
              ws.send(JSON.stringify({
                type: 'input_audio_buffer.append',
                audio: base64
              }));
            }
          };
          reader.readAsDataURL(event.data);
        }
      };

      mediaRecorder.start(100); // Send chunks every 100ms
      setIsRecording(true);

    } catch (error) {
      console.error('Audio streaming error:', error);
      config.onError?.(error as Error);
    }
  }, [config]);

  // Send text message
  const sendText = useCallback((text: string) => {
    const message = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{
          type: 'input_text',
          text: text
        }]
      }
    };

    if (dcRef.current?.readyState === 'open') {
      dcRef.current.send(JSON.stringify(message));
      dcRef.current.send(JSON.stringify({ type: 'response.create' }));
    } else if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      wsRef.current.send(JSON.stringify({ type: 'response.create' }));
    }
  }, []);

  // Interrupt current response
  const interrupt = useCallback(() => {
    const message = { type: 'response.cancel' };
    
    if (dcRef.current?.readyState === 'open') {
      dcRef.current.send(JSON.stringify(message));
    } else if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  // Disconnect
  const disconnect = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (audioElementRef.current) {
      audioElementRef.current.srcObject = null;
    }
    setIsRecording(false);
    updateState('disconnected');
  }, [updateState]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    state,
    isRecording,
    transcript,
    connectWebRTC,
    connectWebSocket,
    sendText,
    interrupt,
    disconnect,
  };
}

// Helper function to get scenario-specific instructions
function getInstructions(scenarioId?: string): string {
  const baseInstructions = `
    You are a helpful communication coach participating in a practice session.
    Be natural, conversational, and supportive.
    Provide constructive feedback when appropriate.
    Keep responses concise and focused.
  `;

  const scenarioInstructions: Record<string, string> = {
    'conflict-resolution': `
      ${baseInstructions}
      You are playing the role of a team member in a conflict situation.
      Express frustration professionally and be open to finding solutions.
      Help the user practice active listening and de-escalation techniques.
    `,
    'performance-review': `
      ${baseInstructions}
      You are in a performance review discussion.
      Be receptive to feedback while also expressing your perspective.
      Help the user practice delivering constructive feedback effectively.
    `,
    'team-standup': `
      ${baseInstructions}
      You are participating in a daily standup meeting.
      Share updates concisely and ask clarifying questions.
      Help the user practice facilitating efficient meetings.
    `,
  };

  return scenarioInstructions[scenarioId || ''] || baseInstructions;
}