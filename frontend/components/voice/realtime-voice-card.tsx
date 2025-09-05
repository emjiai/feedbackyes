// components/voice/realtime-voice-card.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRealtimeVoice } from '@/lib/hooks/use-realtime-voice';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Volume2,
  Loader2,
  AlertCircle 
} from 'lucide-react';

interface RealtimeVoiceCardProps {
  scenarioId?: string;
  culturalContext?: string;
  onSessionEnd?: (transcript: any[]) => void;
}

export function RealtimeVoiceCard({ 
  scenarioId, 
  culturalContext,
  onSessionEnd 
}: RealtimeVoiceCardProps) {
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const {
    state,
    isRecording,
    transcript,
    connectWebRTC,
    sendText,
    interrupt,
    disconnect,
  } = useRealtimeVoice({
    scenarioId,
    culturalContext,
    voice: 'alloy',
    onTranscript: (event) => {
      console.log('New transcript:', event);
    },
    onError: (error) => {
      console.error('Realtime error:', error);
    },
    onStateChange: (newState) => {
      if (newState === 'connected' && !startTime) {
        setStartTime(new Date());
      }
    }
  });

  // Update duration timer
  useEffect(() => {
    if (startTime && state === 'connected') {
      const interval = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime, state]);

  const handleConnect = async () => {
    await connectWebRTC();
  };

  const handleDisconnect = () => {
    disconnect();
    if (onSessionEnd) {
      onSessionEnd(transcript);
    }
    setStartTime(null);
    setDuration(0);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    switch (state) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`} />
          <h3 className="text-lg font-semibold">Realtime Voice Session</h3>
          {state === 'connected' && (
            <Badge variant="outline">{formatDuration(duration)}</Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {isRecording && <Volume2 className="w-5 h-5 text-green-500 animate-pulse" />}
        </div>
      </div>

      {/* Status Message */}
      <div className="text-sm text-muted-foreground">
        {state === 'idle' && 'Ready to start voice session'}
        {state === 'connecting' && 'Connecting to voice service...'}
        {state === 'connected' && 'Voice session active - start speaking'}
        {state === 'disconnected' && 'Session ended'}
        {state === 'error' && 'Connection error - please try again'}
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {state === 'idle' || state === 'disconnected' ? (
          <Button 
            onClick={handleConnect}
            className="flex-1"
            size="lg"
          >
            <Phone className="w-5 h-5 mr-2" />
            Start Voice Session
          </Button>
        ) : state === 'connecting' ? (
          <Button disabled className="flex-1" size="lg">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Connecting...
          </Button>
        ) : (
          <>
            <Button
              onClick={interrupt}
              variant="outline"
              className="flex-1"
            >
              Interrupt
            </Button>
            <Button
              onClick={handleDisconnect}
              variant="destructive"
              className="flex-1"
            >
              <PhoneOff className="w-5 h-5 mr-2" />
              End Session
            </Button>
          </>
        )}
      </div>

      {/* Transcript Preview */}
      {transcript.length > 0 && (
        <div className="border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
          {transcript.slice(-3).map((entry, idx) => (
            <div key={idx} className="text-sm">
              <span className={`font-medium ${
                entry.type === 'user' ? 'text-blue-600' : 'text-green-600'
              }`}>
                {entry.type === 'user' ? 'You: ' : 'Coach: '}
              </span>
              <span className="text-muted-foreground">{entry.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {state === 'error' && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Failed to connect. Please check your microphone permissions.</span>
        </div>
      )}
    </Card>
  );
}