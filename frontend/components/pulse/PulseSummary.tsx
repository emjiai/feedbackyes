"use client"

// components/pulse/PulseSummary.tsx
import React from 'react';
import Link from 'next/link';
import { dataService } from '@/lib/services/dataService';

interface PulseSummaryProps {
  responses: Record<string, number>;
  recommendedScenarios: string[];
  onReset: () => void;
}

const PulseSummary: React.FC<PulseSummaryProps> = ({
  responses,
  recommendedScenarios,
  onReset
}) => {
  const config = dataService.getConfig();
  const { ui, pillars } = config;
  const questions = dataService.getCurrentPulseQuestions();
  
  // Calculate average scores by pillar
  const pillarScores: Record<string, { total: number; count: number }> = {};
  
  questions.forEach(question => {
    const score = responses[question.id];
    if (!pillarScores[question.pillar]) {
      pillarScores[question.pillar] = { total: 0, count: 0 };
    }
    pillarScores[question.pillar].total += score;
    pillarScores[question.pillar].count += 1;
  });
  
  const pillarAverages = Object.entries(pillarScores).map(([pillarId, scores]) => ({
    pillarId,
    average: scores.total / scores.count
  }));
  
  const overallAverage = pillarAverages.reduce((sum, p) => sum + p.average, 0) / pillarAverages.length;
  
  const getPillar = (pillarId: string) => {
    return pillars.find(p => p.id === pillarId);
  };
  
  const getScenario = (scenarioId: string) => {
    return dataService.getScenarioById(scenarioId);
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600';
    if (score >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getScoreBgColor = (score: number) => {
    if (score >= 4) return 'bg-green-100';
    if (score >= 3) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Success Message */}
      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-8">
        <div className="flex items-center">
          <svg className="w-8 h-8 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div>
            <h2 className="text-xl font-semibold text-green-800">
              {ui.messages.pulseSubmitted}
            </h2>
            <p className="text-green-700 mt-1">
              Your responses have been recorded and analyzed.
            </p>
          </div>
        </div>
      </div>

      {/* Overall Score */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Overall Team Health</h3>
        <div className={`rounded-lg p-6 text-center ${getScoreBgColor(overallAverage)}`}>
          <p className={`text-5xl font-bold ${getScoreColor(overallAverage)}`}>
            {overallAverage.toFixed(1)}/5
          </p>
          <p className="text-gray-600 mt-2">Team Health Score</p>
        </div>
      </div>

      {/* Pillar Breakdown */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Breakdown by Pillar</h3>
        <div className="space-y-3">
          {pillarAverages.map(({ pillarId, average }) => {
            const pillar = getPillar(pillarId);
            return (
              <div key={pillarId} className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <span className="text-2xl mr-3">{pillar?.icon}</span>
                  <span className="font-medium">{pillar?.name}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className={`h-2 rounded-full ${
                        average >= 4 ? 'bg-green-500' :
                        average >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${(average / 5) * 100}%` }}
                    />
                  </div>
                  <span className={`font-medium ${getScoreColor(average)}`}>
                    {average.toFixed(1)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended Practice Scenarios */}
      {recommendedScenarios.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Recommended Practice Scenarios</h3>
          <p className="text-gray-600 mb-4">
            Based on your responses, we recommend practicing these scenarios:
          </p>
          <div className="space-y-3">
            {recommendedScenarios.map(scenarioId => {
              const scenario = getScenario(scenarioId);
              if (!scenario) return null;
              
              return (
                <Link
                  key={scenarioId}
                  href={`/practice/${scenarioId}`}
                  className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-900">{scenario.title}</h4>
                      <p className="text-sm text-blue-700 mt-1">{scenario.description}</p>
                    </div>
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Next Steps</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/practice"
            className="flex items-center p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium">Practice Scenarios</h4>
              <p className="text-sm text-gray-600">Improve your skills with role-play</p>
            </div>
          </Link>
          
          <Link
            href="/agreements"
            className="flex items-center p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 100 4h4a2 2 0 100-4h-.586l.293-.293a1 1 0 00-1.414-1.414l-2 2a1 1 0 000 1.414l2 2a1 1 0 001.414-1.414L9.414 9H14a2 2 0 110 4H6a2 2 0 01-2-2V5z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium">Team Agreements</h4>
              <p className="text-sm text-gray-600">Review and update team norms</p>
            </div>
          </Link>
        </div>
        
        <button
          onClick={onReset}
          className="w-full mt-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          Take Another Pulse Check
        </button>
      </div>
    </div>
  );
};

export default PulseSummary;