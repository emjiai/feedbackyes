// services/voiceService.ts

export interface VoiceResponse {
    transcript: string;
    audioUrl?: string;
    confidence?: number;
    duration?: number;
    model: string;
    timestamp: Date;
  }
  
  export interface VoiceRequest {
    audioBlob?: Blob;
    text?: string;
    model: string;
    language: string;
    voice?: string;
  }
  
  class VoiceService {
    private demoResponses: Record<string, string[]> = {
      openai: [
        "I understand your concern about the changing requirements. Can you give me specific examples of what's been unclear?",
        "That's a valid point. Let me clarify the priorities for you.",
        "I appreciate you bringing this up. How can we better align our expectations moving forward?"
      ],
      gemini: [
        "Thank you for sharing that feedback. Let's work through this together.",
        "I hear what you're saying. What would help make this clearer for you?",
        "You're right to raise this concern. Let's find a solution that works for everyone."
      ],
      elevenlabs: [
        "I can see why that would be frustrating. Tell me more about the impact this has had.",
        "Your perspective is important. How do you think we should approach this?",
        "Let's take a step back and align on what success looks like here."
      ],
      opensource: [
        "I appreciate your candor. What specific changes would you suggest?",
        "That's helpful context. How has this affected your work?",
        "Let's collaborate on finding a better approach. What are your thoughts?"
      ]
    };
  
    private demoAudioFiles: string[] = [
      '/audio/response1.mp3',
      '/audio/response2.mp3',
      '/audio/response3.mp3'
    ];
  
    /**
     * Simulates sending audio to voice API and getting transcript + response
     * In production, this would call OpenAI Realtime API, ElevenLabs, etc.
     */
    async processVoiceInput(request: VoiceRequest): Promise<VoiceResponse> {
      // Simulate processing delay
      await this.simulateDelay(1000, 2000);
  
      // Get model-specific responses
      const modelResponses = this.demoResponses[request.model] || this.demoResponses.openai;
      const randomResponse = modelResponses[Math.floor(Math.random() * modelResponses.length)];
  
      // Simulate transcription of user input
      const userTranscript = request.text || this.generateDemoTranscript();
  
      return {
        transcript: randomResponse,
        audioUrl: this.getRandomAudioFile(),
        confidence: 0.92 + Math.random() * 0.08, // 92-100% confidence
        duration: 2.5 + Math.random() * 2, // 2.5-4.5 seconds
        model: request.model,
        timestamp: new Date()
      };
    }
  
    /**
     * Simulates real-time transcription during recording
     */
    async getInterimTranscript(audioBlob: Blob): Promise<string> {
      await this.simulateDelay(100, 300);
      
      const interimPhrases = [
        "I wanted to discuss...",
        "There's been some confusion about...",
        "I'm finding it challenging to...",
        "Can we talk about...",
        "I need clarity on..."
      ];
      
      return interimPhrases[Math.floor(Math.random() * interimPhrases.length)];
    }
  
    /**
     * Converts text to speech
     * In production, this would call TTS APIs
     */
    async textToSpeech(text: string, model: string, voice?: string): Promise<string> {
      await this.simulateDelay(500, 1000);
      
      // Return a demo audio file URL
      return this.getRandomAudioFile();
    }
  
    /**
     * Analyzes speech for coaching feedback
     */
    async analyzeSpeech(transcript: string): Promise<{
      tone: 'positive' | 'neutral' | 'negative';
      suggestions: string[];
      score: number;
    }> {
      await this.simulateDelay(200, 500);
  
      // Simple keyword-based analysis for demo
      const negativeWords = ['blame', 'fault', 'always', 'never', 'stupid', 'incompetent'];
      const positiveWords = ['appreciate', 'understand', 'help', 'collaborate', 'together', 'solution'];
      
      const lowerTranscript = transcript.toLowerCase();
      const hasNegative = negativeWords.some(word => lowerTranscript.includes(word));
      const hasPositive = positiveWords.some(word => lowerTranscript.includes(word));
  
      let tone: 'positive' | 'neutral' | 'negative' = 'neutral';
      let score = 70;
      const suggestions: string[] = [];
  
      if (hasNegative) {
        tone = 'negative';
        score -= 20;
        suggestions.push("Try to avoid absolute terms like 'always' or 'never'");
        suggestions.push("Focus on specific behaviors rather than generalizations");
      }
  
      if (hasPositive) {
        tone = tone === 'negative' ? 'neutral' : 'positive';
        score += 15;
      }
  
      if (!hasPositive && !hasNegative) {
        suggestions.push("Consider adding more collaborative language");
        suggestions.push("Express empathy to build connection");
      }
  
      return {
        tone,
        suggestions: suggestions.slice(0, 2), // Max 2 suggestions
        score: Math.min(100, Math.max(0, score))
      };
    }
  
    /**
     * Gets available voices for a given model
     */
    getAvailableVoices(model: string): Array<{ id: string; name: string; gender: string }> {
      const voices: Record<string, Array<{ id: string; name: string; gender: string }>> = {
        openai: [
          { id: 'alloy', name: 'Alloy', gender: 'neutral' },
          { id: 'echo', name: 'Echo', gender: 'male' },
          { id: 'fable', name: 'Fable', gender: 'female' },
          { id: 'nova', name: 'Nova', gender: 'female' }
        ],
        elevenlabs: [
          { id: 'adam', name: 'Adam', gender: 'male' },
          { id: 'rachel', name: 'Rachel', gender: 'female' },
          { id: 'clyde', name: 'Clyde', gender: 'male' },
          { id: 'nicole', name: 'Nicole', gender: 'female' }
        ],
        gemini: [
          { id: 'casual', name: 'Casual', gender: 'neutral' },
          { id: 'professional', name: 'Professional', gender: 'neutral' }
        ],
        opensource: [
          { id: 'default', name: 'Default', gender: 'neutral' }
        ]
      };
  
      return voices[model] || voices.opensource;
    }
  
    /**
     * Checks if browser supports required audio APIs
     */
    checkBrowserSupport(): {
      supported: boolean;
      missingFeatures: string[];
    } {
      const missingFeatures: string[] = [];
  
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        missingFeatures.push('Media recording');
      }
  
      if (!window.AudioContext && !(window as any).webkitAudioContext) {
        missingFeatures.push('Audio processing');
      }
  
      if (!window.MediaRecorder) {
        missingFeatures.push('MediaRecorder API');
      }
  
      return {
        supported: missingFeatures.length === 0,
        missingFeatures
      };
    }
  
    // Helper methods
    private simulateDelay(min: number, max: number): Promise<void> {
      const delay = min + Math.random() * (max - min);
      return new Promise(resolve => setTimeout(resolve, delay));
    }
  
    private generateDemoTranscript(): string {
      const transcripts = [
        "I've been working on this project for two weeks, but the requirements keep changing.",
        "I feel like we need better communication about priorities.",
        "Can we establish clearer expectations for deliverables?",
        "I'm concerned about the timeline given the current scope.",
        "I'd appreciate more regular check-ins to stay aligned."
      ];
      
      return transcripts[Math.floor(Math.random() * transcripts.length)];
    }
  
    private getRandomAudioFile(): string {
      // In a real app, these would be actual audio files
      // For demo, we'll return placeholder URLs
      return this.demoAudioFiles[Math.floor(Math.random() * this.demoAudioFiles.length)];
    }
  }
  
  // Export singleton instance
  export const voiceService = new VoiceService();
  export default voiceService;