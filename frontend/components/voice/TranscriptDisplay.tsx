// components/voice/TranscriptDisplay.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { dataService } from '@/lib/services/dataService';

interface TranscriptDisplayProps {
  transcript: string;
  isInterim?: boolean;
  language?: string;
  showTranslation?: boolean;
  translationLanguage?: string;
  maxHeight?: string;
}

const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({
  transcript,
  isInterim = false,
  language = 'en',
  showTranslation = false,
  translationLanguage = 'es',
  maxHeight = '200px'
}) => {
  const [translation, setTranslation] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  
  const config = dataService.getConfig();
  const languages = config.languages;
  const uiText = config.ui.labels;

  useEffect(() => {
    if (showTranslation && transcript && !isInterim) {
      translateText();
    }
  }, [transcript, showTranslation, translationLanguage]);

  const translateText = async () => {
    // In production, this would call a translation API
    setIsTranslating(true);
    
    // Simulate translation delay
    setTimeout(() => {
      // Mock translation
      const mockTranslations: Record<string, string> = {
        es: '[Traducción al español del texto]',
        fr: '[Traduction française du texte]',
        de: '[Deutsche Übersetzung des Textes]',
        zh: '[文本的中文翻译]',
        ja: '[テキストの日本語翻訳]'
      };
      
      setTranslation(mockTranslations[translationLanguage] || '[Translation not available]');
      setIsTranslating(false);
    }, 500);
  };

  const getLanguageName = (code: string) => {
    const lang = languages.find(l => l.code === code);
    return lang ? lang.name : code.toUpperCase();
  };

  if (!transcript) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg min-h-[100px] flex items-center justify-center">
        <p className="text-gray-400 text-sm italic">
          {isInterim ? 'Listening...' : 'No transcript available'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Original Transcript */}
      <div
        className={`p-4 rounded-lg ${
          isInterim ? 'bg-yellow-50 border border-yellow-200' : 'bg-white border border-gray-200'
        }`}
        style={{ maxHeight, overflowY: 'auto' }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500 uppercase">
            {uiText.transcript} ({getLanguageName(language)})
          </span>
          {isInterim && (
            <span className="text-xs text-yellow-600 flex items-center">
              <svg className="w-3 h-3 mr-1 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="8" />
              </svg>
              Interim
            </span>
          )}
        </div>
        <p className={`${isInterim ? 'text-gray-600 italic' : 'text-gray-800'} whitespace-pre-wrap`}>
          {transcript}
        </p>
      </div>

      {/* Translation */}
      {showTranslation && !isInterim && (
        <div
          className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
          style={{ maxHeight, overflowY: 'auto' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-blue-600 uppercase">
              Translation ({getLanguageName(translationLanguage)})
            </span>
            {isTranslating && (
              <span className="text-xs text-blue-600">Translating...</span>
            )}
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">
            {isTranslating ? (
              <span className="italic">Translating...</span>
            ) : (
              translation || <span className="italic text-gray-500">Translation pending...</span>
            )}
          </p>
        </div>
      )}

      {/* Character/Word Count */}
      <div className="flex justify-end space-x-4 text-xs text-gray-500">
        <span>{transcript.split(' ').filter(w => w).length} words</span>
        <span>{transcript.length} characters</span>
      </div>
    </div>
  );
};

export default TranscriptDisplay;