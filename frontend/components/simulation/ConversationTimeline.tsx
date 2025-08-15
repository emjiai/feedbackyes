// components/simulation/ConversationTimeline.tsx
'use client';

import React, { useState, useEffect } from 'react';
import VoiceCard from '@/components/voice/VoiceCard';
import { dataService } from '@/lib/services/dataService';

interface ConversationTimelineProps {
  scenario: any;
  model: string;
  language: string;
  onUpdate?: (data: any[]) => void;
  onComplete?: () => void;
}

interface ConversationTurn {
  id: string;
  role: 'user' | 'ai';
  transcript: string;
  audioUrl?: string;
  timestamp: Date;
}

const ConversationTimeline: React.FC<ConversationTimelineProps> = ({
  scenario,
  model,
  language,
  onUpdate,
  onComplete
}) => {
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [isWaitingForAI, setIsWaitingForAI] = useState(false);
  
  const config = dataService.getConfig();
  const { ui } = config;

  useEffect(() => {
    // Initialize with AI's opening statement
    const initialTurn: ConversationTurn = {
      id: 'turn-0',
      role: 'ai',
      transcript: scenario.initialPrompt,
      timestamp: new Date()
    };
    setTurns([initialTurn]);
  }, [scenario]);

  useEffect(() => {
    if (onUpdate) {
      onUpdate(turns);
    }
  }, [turns, onUpdate]);

  const handleUserComplete = (transcript: string, audioUrl?: string) => {
    const newTurn: ConversationTurn = {
      id: `turn-${turns.length}`,
      role: 'user',
      transcript,
      audioUrl,
      timestamp: new Date()
    };
    
    setTurns([...turns, newTurn]);
    setIsWaitingForAI(true);
    
    // Trigger AI response
    setTimeout(() => {
      addAIResponse();
    }, 500);
  };

  const handleAIComplete = (transcript: string, audioUrl?: string) => {
    // AI response is already added, just update if needed
    setIsWaitingForAI(false);
    setCurrentTurnIndex(currentTurnIndex + 2);
  };

  const addAIResponse = () => {
    const aiTurn: ConversationTurn = {
      id: `turn-${turns.length + 1}`,
      role: 'ai',
      transcript: '', // Will be filled by VoiceCard
      timestamp: new Date()
    };
    
    setTurns(prev => [...prev, aiTurn]);
    setCurrentTurnIndex(currentTurnIndex + 1);
  };

  const handleEndSession = () => {
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className="space-y-4">
      {/* Session Header */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Session Active</span>
            <span className="text-sm text-gray-500">
              {turns.length} exchanges
            </span>
          </div>
          
          <button
            onClick={handleEndSession}
            className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
          >
            {ui.buttons.endSession}
          </button>
        </div>
      </div>

      {/* Conversation Turns */}
      <div className="space-y-4">
        {turns.map((turn, index) => (
          <VoiceCard
            key={turn.id}
            role={turn.role}
            initialTranscript={turn.transcript}
            audioUrl={turn.audioUrl}
            model={model}
            language={language}
            isActive={
              (turn.role === 'user' && index === turns.length - 1 && !isWaitingForAI) ||
              (turn.role === 'ai' && index === turns.length - 1 && isWaitingForAI)
            }
            onComplete={
              turn.role === 'user' ? handleUserComplete : handleAIComplete
            }
            showModelSelector={false}
          />
        ))}
        
        {/* Add User Turn Button */}
        {!isWaitingForAI && turns.length > 0 && turns[turns.length - 1].role === 'ai' && (
          <VoiceCard
            role="user"
            model={model}
            language={language}
            isActive={true}
            onComplete={handleUserComplete}
            showModelSelector={false}
          />
        )}
      </div>

      {/* Session Stats */}
      {turns.length > 3 && (
        <div className="bg-gray-50 rounded-lg p-4 text-sm">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-700">{Math.floor(turns.length / 2)}</p>
              <p className="text-gray-500">Rounds</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-700">
                {Math.floor((Date.now() - turns[0].timestamp.getTime()) / 60000)}
              </p>
              <p className="text-gray-500">Minutes</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-700">Active</p>
              <p className="text-gray-500">Status</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationTimeline;