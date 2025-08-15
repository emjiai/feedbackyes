// components/pulse/PulseForm.tsx
'use client';

import React, { useState } from 'react';
import { dataService } from '@/lib/services/dataService';

interface PulseFormProps {
  questions: any[];
  onSubmit: (responses: Record<string, number>) => void;
}

const PulseForm: React.FC<PulseFormProps> = ({ questions, onSubmit }) => {
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  const config = dataService.getConfig();
  const { ui, pillars } = config;

  const handleResponseChange = (questionId: string, value: number) => {
    setResponses({ ...responses, [questionId]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if all questions are answered
    const allAnswered = questions.every(q => responses[q.id] !== undefined);
    if (!allAnswered) {
      alert('Please answer all questions before submitting.');
      return;
    }
    
    onSubmit(responses);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const getPillar = (pillarId: string) => {
    return pillars.find(p => p.id === pillarId);
  };

  const renderQuestion = (question: any) => {
    const pillar = getPillar(question.pillar);
    
    return (
      <div key={question.id} className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start mb-4">
          <span className="text-3xl mr-3">{pillar?.icon}</span>
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-1">{pillar?.name}</p>
            <h3 className="text-lg font-medium">{question.question}</h3>
          </div>
        </div>

        {question.type === 'scale' && (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{question.scale.minLabel}</span>
              <span>{question.scale.maxLabel}</span>
            </div>
            
            <div className="flex justify-between items-center">
              {[...Array(question.scale.max - question.scale.min + 1)].map((_, index) => {
                const value = question.scale.min + index;
                const isSelected = responses[question.id] === value;
                
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleResponseChange(question.id, value)}
                    className={`w-12 h-12 rounded-full font-medium transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white scale-110'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {question.type === 'radio' && (
          <div className="space-y-2 mt-4">
            {question.options.map((option: any) => (
              <label
                key={option.value}
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                  responses[question.id] === option.score
                    ? 'bg-blue-50 border-2 border-blue-500'
                    : 'bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.score}
                  checked={responses[question.id] === option.score}
                  onChange={() => handleResponseChange(question.id, option.score)}
                  className="mr-3"
                />
                <span className="text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    );
  };

  const progress = (Object.keys(responses).length / questions.length) * 100;

  return (
    <form onSubmit={handleSubmit}>
      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{Object.keys(responses).length} of {questions.length} answered</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Questions - Show all or paginated */}
      <div className="space-y-6">
        {questions.map((question, index) => (
          <div
            key={question.id}
            className={index === currentQuestionIndex ? 'block' : 'hidden lg:block'}
          >
            {renderQuestion(question)}
          </div>
        ))}
      </div>

      {/* Navigation for mobile */}
      <div className="lg:hidden flex justify-between items-center mt-6">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="px-4 py-2 text-gray-600 disabled:text-gray-400"
        >
          {ui.buttons.previous}
        </button>
        
        <span className="text-sm text-gray-600">
          {currentQuestionIndex + 1} / {questions.length}
        </span>
        
        <button
          type="button"
          onClick={handleNext}
          disabled={currentQuestionIndex === questions.length - 1}
          className="px-4 py-2 text-gray-600 disabled:text-gray-400"
        >
          {ui.buttons.next}
        </button>
      </div>

      {/* Submit Button */}
      <div className="mt-8">
        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          disabled={Object.keys(responses).length < questions.length}
        >
          {ui.buttons.submit} Pulse Check
        </button>
      </div>
    </form>
  );
};

export default PulseForm;