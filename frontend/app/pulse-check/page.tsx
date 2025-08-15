// pages/pulse-check/index.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { dataService } from '../../services/dataService';
import PulseForm from '../../components/pulse/PulseForm';
import PulseSummary from '../../components/pulse/PulseSummary';

const PulseCheckPage: React.FC = () => {
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [recommendedScenarios, setRecommendedScenarios] = useState<string[]>([]);
  
  const config = dataService.getConfig();
  const questions = dataService.getCurrentPulseQuestions();

  const handleSubmit = async (formResponses: Record<string, number>) => {
    setResponses(formResponses);
    
    // Save responses
    await dataService.savePulseResponse(formResponses);
    
    // Determine recommended scenarios based on low scores
    const recommendations: string[] = [];
    questions.forEach(question => {
      const score = formResponses[question.id];
      if (score < question.followUpThreshold) {
        recommendations.push(question.followUpScenario);
      }
    });
    
    setRecommendedScenarios([...new Set(recommendations)]); // Remove duplicates
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setResponses({});
    setRecommendedScenarios([]);
  };

  if (isSubmitted) {
    return (
      <PulseSummary
        responses={responses}
        recommendedScenarios={recommendedScenarios}
        onReset={handleReset}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Weekly Pulse Check</h1>
        <p className="text-gray-600">
          Take a few minutes to reflect on your team's dynamics this week. Your responses help identify areas for improvement.
        </p>
      </div>

      <PulseForm
        questions={questions}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default PulseCheckPage;