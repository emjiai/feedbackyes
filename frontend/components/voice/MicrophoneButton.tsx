// components/voice/MicrophoneButton.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { dataService } from '@/lib/services/dataService';
import { voiceService } from '@/lib/services/voiceService';

interface MicrophoneButtonProps {
  onRecordingStart?: () => void;
  onRecordingStop?: (audioBlob: Blob) => void;
  onInterimTranscript?: (transcript: string) => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const MicrophoneButton: React.FC<MicrophoneButtonProps> = ({
  onRecordingStart,
  onRecordingStop,
  onInterimTranscript,
  disabled = false,
  size = 'medium'
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const interimIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const config = dataService.getConfig();
  const uiText = config.ui.buttons;

  useEffect(() => {
    // Check browser support
    const support = voiceService.checkBrowserSupport();
    if (!support.supported) {
      console.warn('Missing audio features:', support.missingFeatures);
    }

    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (interimIntervalRef.current) {
        clearInterval(interimIntervalRef.current);
      }
    };
  }, []);

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setPermissionGranted(true);
      return stream;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setPermissionGranted(false);
      return null;
    }
  };

  const startRecording = async () => {
    if (disabled || isRecording) return;

    // Get or request microphone permission
    let stream = streamRef.current;
    if (!stream) {
      stream = await requestMicrophonePermission();
      if (!stream) return;
    }

    try {
      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (onRecordingStop) {
          onRecordingStop(audioBlob);
        }
        audioChunksRef.current = [];
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      
      if (onRecordingStart) {
        onRecordingStart();
      }

      // Simulate interim transcripts
      if (onInterimTranscript) {
        let counter = 0;
        interimIntervalRef.current = setInterval(async () => {
          counter++;
          if (counter % 10 === 0 && audioChunksRef.current.length > 0) {
            // Create interim blob
            const interimBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const interimText = await voiceService.getInterimTranscript(interimBlob);
            onInterimTranscript(interimText);
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (!isRecording || !mediaRecorderRef.current) return;

    try {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (interimIntervalRef.current) {
        clearInterval(interimIntervalRef.current);
        interimIntervalRef.current = null;
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsHolding(true);
    startRecording();
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isHolding) {
      setIsHolding(false);
      stopRecording();
    }
  };

  const handleMouseLeave = () => {
    if (isHolding) {
      setIsHolding(false);
      stopRecording();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsHolding(true);
    startRecording();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    if (isHolding) {
      setIsHolding(false);
      stopRecording();
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-12 h-12 text-xl';
      case 'large':
        return 'w-20 h-20 text-3xl';
      default:
        return 'w-16 h-16 text-2xl';
    }
  };

  const getButtonColor = () => {
    if (disabled) return 'bg-gray-300 cursor-not-allowed';
    if (isRecording) return 'bg-red-500 hover:bg-red-600 animate-pulse';
    if (isHolding) return 'bg-red-400';
    return 'bg-blue-500 hover:bg-blue-600';
  };

  if (permissionGranted === false) {
    return (
      <div className="text-center p-4 bg-red-50 rounded-lg">
        <p className="text-red-600 text-sm mb-2">Microphone permission required</p>
        <button
          onClick={requestMicrophonePermission}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
        >
          Grant Permission
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        disabled={disabled}
        className={`${getSizeClasses()} ${getButtonColor()} rounded-full text-white flex items-center justify-center transition-all duration-200 shadow-lg select-none`}
        aria-label={isRecording ? uiText.recording : uiText.record}
      >
        {isRecording ? (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <rect x="7" y="6" width="6" height="8" rx="1" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
          </svg>
        )}
      </button>
      
      <p className="text-sm text-gray-600 text-center">
        {isRecording ? uiText.recording : uiText.record}
      </p>
      
      {/* Visual feedback for audio levels */}
      {isRecording && (
        <div className="flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-green-500 animate-pulse"
              style={{
                height: `${10 + Math.random() * 20}px`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MicrophoneButton;