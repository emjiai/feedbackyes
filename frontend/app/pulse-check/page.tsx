"use client";

import React, { useState } from 'react';
import { dataService } from '@/lib/services/dataService';

export default function PulseCheckPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [responses, setResponses] = useState<Record<string, number>>({});
  
  const config = dataService.getConfig();
  const questions = dataService.getCurrentPulseQuestions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-green-800">
            Pulse Check Submitted!
          </h2>
          <p className="text-green-700 mt-1">
            Your responses have been recorded.
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Take Another Pulse Check
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Weekly Pulse Check</h1>
        <p className="text-gray-600">
          Take a few minutes to reflect on your team's dynamics this week.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {questions.map((question: any) => (
          <div key={question.id} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium mb-4">{question.question}</h3>
            
            {question.type === 'scale' && (
              <div className="flex justify-between items-center">
                {[...Array(5)].map((_, index) => {
                  const value = index + 1;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setResponses({...responses, [question.id]: value})}
                      className={`w-12 h-12 rounded-full font-medium transition-all ${
                        responses[question.id] === value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Submit Pulse Check
        </button>
      </form>
    </div>
  );
}