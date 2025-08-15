// pages/practice/[id].tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { dataService } from '../../services/dataService';
import ConversationTimeline from '../../components/simulation/ConversationTimeline';
import FeedbackPanel from '../../components/simulation/FeedbackPanel';
import ModelSelector from '../../components/voice/ModelSelector';

const PracticeSessionPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [scenario, setScenario] = useState<any>(null);
  const [selectedModel, setSelectedModel] = useState(dataService.getDefaultModel().id);
  const [selectedLanguage, setSelectedLanguage] = useState(dataService.getDefaultLanguage().code);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [conversationData, setConversationData] = useState<any[]>([]);
  
  const config = dataService.getConfig();
  const { ui, languages } = config;

  useEffect(() => {
    if (id && typeof id === 'string') {
      const scenarioData = dataService.getScenarioById(id);
      if (scenarioData) {
        setScenario(scenarioData);
      } else {
        // Redirect if scenario not found
        router.push('/practice');
      }
    }
  }, [id, router]);

  const handleStartSession = () => {
    setIsSessionActive(true);
    setSessionComplete(false);
    setConversationData([]);
  };

  const handleEndSession = () => {
    setIsSessionActive(false);
    setSessionComplete(true);
  };

  const handleConversationUpdate = (data: any) => {
    setConversationData(data);
  };

  if (!scenario) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">{ui.messages.loading}</p>
      </div>
    );
  }

  const pillar = config.pillars.find(p => p.id === scenario.pillar);
  const style = config.feedbackStyles.find(s => s.id === scenario.suggestedStyle);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Scenario Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-3xl">{pillar?.icon}</span>
              <h1 className="text-2xl font-bold">{scenario.title}</h1>
            </div>
            <p className="text-gray-600">{scenario.description}</p>
          </div>
          
          {!isSessionActive && !sessionComplete && (
            <button
              onClick={() => router.push('/practice')}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Scenario Context */}
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <h3 className="font-semibold mb-2">Context:</h3>
          <p className="text-gray-700">{scenario.context}</p>
        </div>

        {/* Meta Information */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Difficulty:</span>
            <span className="ml-2 font-medium capitalize">{scenario.difficulty}</span>
          </div>
          <div>
            <span className="text-gray-500">Time:</span>
            <span className="ml-2 font-medium">{scenario.estimatedTime} min</span>
          </div>
          <div>
            <span className="text-gray-500">Style:</span>
            <span className="ml-2 font-medium">{style?.name}</span>
          </div>
          <div>
            <span className="text-gray-500">Role:</span>
            <span className="ml-2 font-medium">{scenario.roles[0]?.name}</span>
          </div>
        </div>
      </div>

      {/* Pre-Session Setup */}
      {!isSessionActive && !sessionComplete && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Prepare Your Practice</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <ModelSelector
              value={selectedModel}
              onChange={setSelectedModel}
              showDescription
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {ui.labels.selectLanguage}
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Learning Objectives */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Learning Objectives:</h3>
            <ul className="space-y-1">
              {scenario.learningObjectives.map((objective: string, idx: number) => (
                <li key={idx} className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">{objective}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* AI Persona Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-2">You'll be practicing with:</h3>
            <p className="font-medium">{scenario.aiPersona.name} - {scenario.aiPersona.role}</p>
            <p className="text-sm text-gray-600 mt-1">{scenario.aiPersona.personality}</p>
          </div>

          <button
            onClick={handleStartSession}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            {ui.buttons.startPractice}
          </button>
        </div>
      )}

      {/* Active Session */}
      {isSessionActive && !sessionComplete && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ConversationTimeline
              scenario={scenario}
              model={selectedModel}
              language={selectedLanguage}
              onUpdate={handleConversationUpdate}
              onComplete={handleEndSession}
            />
          </div>
          
          <div className="lg:col-span-1">
            <FeedbackPanel
              scenario={scenario}
              conversationData={conversationData}
            />
          </div>
        </div>
      )}

      {/* Session Complete */}
      {sessionComplete && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <h2 className="text-2xl font-bold mb-2">{ui.messages.practiceComplete}</h2>
            <p className="text-gray-600">Great job completing this practice scenario!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">85%</p>
              <p className="text-sm text-gray-600">Overall Score</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-green-600">
                {conversationData.length}
              </p>
              <p className="text-sm text-gray-600">Exchanges</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-purple-600">
                {scenario.estimatedTime}
              </p>
              <p className="text-sm text-gray-600">Minutes</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleStartSession}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Practice Again
            </button>
            <button
              onClick={() => router.push('/practice')}
              className="flex-1 py-2 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              Choose Another Scenario
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeSessionPage;