// components/simulation/ScenarioList.tsx
import React from 'react';
import Link from 'next/link';
import { dataService } from '@/lib/services/dataService';

interface ScenarioListProps {
  scenarios: Array<{
    id: string;
    title: string;
    pillar: string;
    difficulty: string;
    estimatedTime: number;
    description: string;
    suggestedStyle: string;
  }>;
}

const ScenarioList: React.FC<ScenarioListProps> = ({ scenarios }) => {
  const config = dataService.getConfig();
  const { pillars, feedbackMethods } = config;

  const getPillar = (pillarId: string) => {
    return pillars.find(p => p.id === pillarId);
  };

  const getStyle = (styleId: string) => {
    return feedbackMethods.find((s: { id: string; name: string }) => s.id === styleId);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {scenarios.map((scenario) => {
        const pillar = getPillar(scenario.pillar);
        const style = getStyle(scenario.suggestedStyle);
        
        return (
          <Link
            key={scenario.id}
            href={`/practice/${scenario.id}`}
            className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{scenario.title}</h3>
                  <p className="text-gray-600 text-sm">{scenario.description}</p>
                </div>
                <div className="ml-4 text-3xl">{pillar?.icon}</div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(scenario.difficulty)}`}>
                  {scenario.difficulty.charAt(0).toUpperCase() + scenario.difficulty.slice(1)}
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                  {scenario.estimatedTime} min
                </span>
                {style && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                    {style.name}
                  </span>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-sm text-gray-500">
                  {pillar?.name}
                </span>
                <span className="text-blue-600 font-medium text-sm flex items-center">
                  Start Practice
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default ScenarioList;