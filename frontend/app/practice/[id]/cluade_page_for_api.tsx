// app/practice/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { RealtimeVoiceCard } from '@/components/voice/realtime-voice-card';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Target, Clock, Award } from 'lucide-react';
import Link from 'next/link';

export default function PracticeScenarioPage() {
  const params = useParams();
  const scenarioId = params.id as string;
  const [scenario, setScenario] = useState<any>(null);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);

  useEffect(() => {
    // Fetch scenario details
    fetchScenario();
  }, [scenarioId]);

  const fetchScenario = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/scenarios/${scenarioId}`);
      const data = await response.json();
      setScenario(data);
    } catch (error) {
      console.error('Failed to fetch scenario:', error);
    }
  };

  const handleSessionEnd = async (transcript: any[]) => {
    setSessionComplete(true);
    
    // Analyze the session
    try {
      const response = await fetch('http://localhost:8000/api/feedback/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: `session_${Date.now()}`,
          transcript: JSON.stringify(transcript),
          scenario_id: scenarioId,
          duration_seconds: 300 // You'd calculate this properly
        })
      });
      
      const feedbackData = await response.json();
      setFeedback(feedbackData);
    } catch (error) {
      console.error('Failed to analyze session:', error);
    }
  };

  if (!scenario) {
    return <div>Loading scenario...</div>;
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/practice">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Scenarios
          </Button>
        </Link>
      </div>

      {/* Scenario Info */}
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-2">{scenario.title}</h1>
        <p className="text-muted-foreground mb-4">{scenario.description}</p>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-sm">Role: {scenario.role}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm">Duration: ~10 mins</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" />
            <span className="text-sm">Level: Intermediate</span>
          </div>
        </div>

        <div className="bg-muted rounded-lg p-4">
          <h3 className="font-semibold mb-2">Context</h3>
          <p className="text-sm">{scenario.context}</p>
        </div>
      </Card>

      {/* Objectives */}
      <Card className="p-6">
        <h3 className="font-semibold mb-3">Learning Objectives</h3>
        <ul className="space-y-2">
          {scenario.objectives.map((objective: string, idx: number) => (
            <li key={idx} className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center mt-0.5">
                {idx + 1}
              </div>
              <span className="text-sm">{objective}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Voice Session */}
      {!sessionComplete ? (
        <RealtimeVoiceCard
          scenarioId={scenarioId}
          culturalContext={scenario.cultural_context}
          onSessionEnd={handleSessionEnd}
        />
      ) : (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Session Complete!</h3>
          
          {feedback && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Communication</span>
                  <Progress value={feedback.communication_effectiveness || 75} className="mt-1" />
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Active Listening</span>
                  <Progress value={feedback.active_listening || 80} className="mt-1" />
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Empathy</span>
                  <Progress value={feedback.empathy || 70} className="mt-1" />
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Problem Solving</span>
                  <Progress value={feedback.problem_solving || 85} className="mt-1" />
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Key Feedback</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {feedback.feedback?.map((item: string, idx: number) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/practice">Back to Scenarios</Link>
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}