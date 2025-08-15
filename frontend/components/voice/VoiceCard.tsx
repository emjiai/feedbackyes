// components/voice/VoiceCard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import MicrophoneButton from './MicrophoneButton';
import ModelSelector from './ModelSelector';
import TranscriptDisplay from './TranscriptDisplay';
import AudioPlayer from './AudioPlayer';
import { voiceService } from '@/lib/services/voiceService';
import { dataService } from '@/lib/services/dataService';

interface VoiceCardProps {
  role: 'user' | 'ai';
  onComplete?: (transcript: string, audioUrl?: string) => void;
  initialTranscript?: string;
  audioUrl?: string;
  model?: string;
  onModelChange?: (model: string) => void;
  language?: string;
  isActive?: boolean;
  showModelSelector?: boolean;
}

const VoiceCard: React.FC<VoiceCardProps> = ({
  role,
  onComplete,
  initialTranscript = '',
  audioUrl: initialAudioUrl,
  model = 'openai',
  onModelChange,
  language = 'en',
  isActive = false,
  showModelSelector = false
}) => {
  const [transcript, setTranscript] = useState(initialTranscript);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [audioUrl, setAudioUrl] = useState(initialAudioUrl);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: string; suggestions: string[] } | null>(null);

  const config = dataService.getConfig();
  const uiText = config.ui;

  useEffect(() => {
    if (role === 'ai' && isActive && !transcript) {
      // Simulate AI response when card becomes active
      generateAIResponse();
    }
  }, [isActive, role, transcript]);

  const generateAIResponse = async () => {
    setIsProcessing(true);
    try {
      const response = await voiceService.processVoiceInput({
        model,
        language,
        text: '' // AI generates without input in this context
      });
      
      setTranscript(response.transcript);
      setAudioUrl(response.audioUrl);
      
      if (onComplete) {
        onComplete(response.transcript, response.audioUrl);
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRecordingStart = () => {
    setIsRecording(true);
    setInterimTranscript('');
    setTranscript('');
    setFeedback(null);
  };

  const handleRecordingStop = async (audioBlob: Blob) => {
    setIsRecording(false);
    setIsProcessing(true);

    try {
      // Get final transcript
      const response = await voiceService.processVoiceInput({
        audioBlob,
        model,
        language
      });
      
      setTranscript(response.transcript);
      
      // Analyze for coaching feedback if user role
      if (role === 'user') {
        const analysis = await voiceService.analyzeSpeech(response.transcript);
        if (analysis.suggestions.length > 0) {
          setFeedback(analysis);
        }
      }
      
      if (onComplete) {
        onComplete(response.transcript, response.audioUrl);
      }
    } catch (error) {
      console.error('Error processing recording:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInterimTranscript = (text: string) => {
    setInterimTranscript(text);
  };

  const getRoleStyles = () => {
    if (role === 'user') {
      return 'bg-blue-50 border-blue-200';
    }
    return 'bg-gray-50 border-gray-200';
  };

  const getRoleLabel = () => {
    if (role === 'user') {
      return uiText.labels.yourTurn;
    }
    return uiText.labels.aiResponse;
  };

  return (
    <div className={`rounded-lg border-2 p-4 space-y-3 transition-all ${getRoleStyles()} ${isActive ? 'ring-2 ring-blue-400' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'}`}>
            {role === 'user' ? 'U' : 'AI'}
          </div>
          <span className="font-medium text-sm">{getRoleLabel()}</span>
        </div>
        
        {showModelSelector && role === 'ai' && (
          <ModelSelector
            value={model}
            onChange={onModelChange || (() => {})}
            compact
          />
        )}
      </div>

      {/* Recording/Processing Status */}
      {(isRecording || isProcessing) && (
        <div className="flex items-center space-x-2 text-sm">
          {isRecording && (
            <>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-600">{uiText.buttons.recording}</span>
            </>
          )}
          {isProcessing && (
            <>
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              <span className="text-yellow-600">{uiText.buttons.processing}</span>
            </>
          )}
        </div>
      )}

      {/* Transcript Display */}
      <TranscriptDisplay
        transcript={transcript || interimTranscript}
        isInterim={!transcript && !!interimTranscript}
        language={language}
      />

      {/* Coaching Feedback */}
      {feedback && feedback.suggestions.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
          <p className="font-medium text-yellow-800 mb-1">Coaching Tips:</p>
          <ul className="space-y-1">
            {feedback.suggestions.map((suggestion, idx) => (
              <li key={idx} className="text-yellow-700 flex items-start">
                <span className="mr-2">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between">
        {role === 'user' && isActive && (
          <MicrophoneButton
            onRecordingStart={handleRecordingStart}
            onRecordingStop={handleRecordingStop}
            onInterimTranscript={handleInterimTranscript}
            disabled={isProcessing}
          />
        )}
        
        {audioUrl && (
          <AudioPlayer
            audioUrl={audioUrl}
            autoPlay={role === 'ai'}
          />
        )}
      </div>

      {/* Empty state for inactive cards */}
      {!isActive && !transcript && (
        <div className="text-center py-4 text-gray-400">
          <p className="text-sm">
            {role === 'user' ? 'Waiting for your turn...' : 'AI will respond here...'}
          </p>
        </div>
      )}
    </div>
  );
};

export default VoiceCard;