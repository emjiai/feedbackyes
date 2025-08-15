// components/simulation/FeedbackPanel.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { dataService } from '@/lib/services/dataService';

interface FeedbackPanelProps {
  scenario: any;
  conversationData: any[];
}

const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
  scenario,
  conversationData
}) => {
  const [currentScore, setCurrentScore] = useState(70);
  const [tips, setTips] = useState<string[]>([]);
  const [successMetrics, setSuccessMetrics] = useState({
    included: [] as string[],
    avoided: [] as string[]
  });
  
  const config = dataService.getConfig();
  const { ui } = config;

  useEffect(() => {
    // Update feedback based on conversation
    if (conversationData.length > 0) {
      updateFeedback();
    }
  }, [conversationData]);

  const updateFeedback = () => {
    // Simulate feedback analysis
    const randomTips = ui.coachingTips
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);
    setTips(randomTips);

    // Update score based on conversation length
    const newScore = Math.min(100, 70 + conversationData.length * 5);
    setCurrentScore(newScore);

    // Check success criteria
    const included = scenario.successCriteria.mustInclude
      .filter(() => Math.random() > 0.5);
    const avoided = scenario.successCriteria.mustAvoid
      .filter(() => Math.random() > 0.7);
    
    setSuccessMetrics({ included, avoided });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="space-y-4">
      {/* Current Score */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">{ui.labels.progress}</h3>
        
        <div className={`rounded-lg p-4 text-center ${getScoreBgColor(currentScore)}`}>
          <p className={`text-4xl font-bold ${getScoreColor(currentScore)}`}>
            {currentScore}%
          </p>
          <p className="text-sm text-gray-600 mt-1">Current Score</p>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${currentScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Live Coaching Tips */}
      {tips.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Live Coaching</h3>
          
          <div className="space-y-3">
            {tips.map((tip, index) => (
              <div key={index} className="flex items-start">
                <svg className="w-5 h-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-gray-700">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success Criteria Tracking */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Success Criteria</h3>
        
        <div className="space-y-4">
          {/* Must Include */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Must Include:</h4>
            <div className="space-y-1">
              {scenario.successCriteria.mustInclude.map((item: string, index: number) => (
                <div key={index} className="flex items-center">
                  {successMetrics.included.includes(item) ? (
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded mr-2" />
                  )}
                  <span className={`text-sm ${successMetrics.included.includes(item) ? 'text-green-700' : 'text-gray-600'}`}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Must Avoid */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Must Avoid:</h4>
            <div className="space-y-1">
              {scenario.successCriteria.mustAvoid.map((item: string, index: number) => (
                <div key={index} className="flex items-center">
                  {!successMetrics.avoided.includes(item) ? (
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className={`text-sm ${successMetrics.avoided.includes(item) ? 'text-red-700' : 'text-gray-600'}`}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-blue-50 rounded-lg p-4">
        <p className="text-sm text-blue-800 mb-2 font-medium">Need Help?</p>
        <div className="space-y-2">
          <button className="w-full text-left text-sm text-blue-600 hover:text-blue-700">
            → View example phrases
          </button>
          <button className="w-full text-left text-sm text-blue-600 hover:text-blue-700">
            → Review feedback style guide
          </button>
          <button className="w-full text-left text-sm text-blue-600 hover:text-blue-700">
            → Get more coaching tips
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPanel;