"use client";

// pages/practice/custom.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { dataService } from '@/lib/services/dataService';
import ConversationTimeline from '@/components/simulation/ConversationTimeline';
import FeedbackPanel from '@/components/simulation/FeedbackPanel';
import CulturalCoachingPanel from '@/components/simulation/CulturalCoachingPanel';

export default function CustomPracticePage() {
  const router = useRouter();
  const [rolePlayConfig, setRolePlayConfig] = useState<any>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [conversationData, setConversationData] = useState<any[]>([]);
  
  const config = dataService.getConfig();
  const { ui, feedbackMethods, feedbackTypes } = config;

  useEffect(() => {
    // Load role-play configuration from session storage
    const savedConfig = sessionStorage.getItem('rolePlayConfig');
    if (savedConfig) {
      setRolePlayConfig(JSON.parse(savedConfig));
    } else {
      // Redirect if no config found
      router.push('/practice');
    }
  }, [router]);

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

  if (!rolePlayConfig) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">{ui.messages.loading}</p>
      </div>
    );
  }

  const feedbackMethod = feedbackMethods.find(m => m.id === rolePlayConfig.feedbackMethod);
  const feedbackType = feedbackTypes.find(t => t.id === rolePlayConfig.situation.type);

  // Create a scenario object compatible with existing components
  const customScenario = {
    id: 'custom',
    title: `${feedbackType?.name} to ${rolePlayConfig.recipient.name}`,
    pillar: 'communication',
    difficulty: 'medium',
    estimatedTime: 10,
    description: rolePlayConfig.situation.description || `Practice giving ${feedbackType?.name?.toLowerCase()} using ${feedbackMethod?.name}`,
    context: rolePlayConfig.situation.context,
    roles: [
      { id: 'giver', name: rolePlayConfig.giver.name },
      { id: 'recipient', name: rolePlayConfig.recipient.name }
    ],
    suggestedStyle: rolePlayConfig.feedbackMethod,
    initialPrompt: generateInitialPrompt(rolePlayConfig),
    aiPersona: {
      name: rolePlayConfig.recipient.name,
      role: rolePlayConfig.recipient.role,
      personality: generatePersonality(rolePlayConfig)
    },
    learningObjectives: generateLearningObjectives(rolePlayConfig),
    successCriteria: generateSuccessCriteria(rolePlayConfig)
  };

  function generateInitialPrompt(config: any) {
    const type = feedbackTypes.find(t => t.id === config.situation.type);
    const prompts: Record<string, string> = {
      positive: "Hi! I heard you wanted to talk to me about something?",
      corrective: "You wanted to discuss something with me?",
      difficult: "I understand you need to speak with me. What's this about?",
      developmental: "Thanks for setting up this meeting. What did you want to discuss?",
      recognition: "Hello! You mentioned you had some feedback for me?"
    };
    return prompts[config.situation.type] || "Hi, what did you want to discuss?";
  }

  function generatePersonality(config: any) {
    const region = config.culturalContext.region;
    const relationship = config.recipient.relationship;
    const type = config.situation.type;
    
    let personality = `${config.recipient.role} from ${config.culturalContext.country}. `;
    
    // Add cultural traits
    if (region === 'east-asia') {
      personality += 'Values harmony and face-saving, indirect communication style. ';
    } else if (region === 'north-america') {
      personality += 'Direct communicator, values efficiency and clarity. ';
    } else if (region === 'latin-america') {
      personality += 'Warm and relationship-focused, values personal connections. ';
    }
    
    // Add relationship dynamics
    if (relationship === 'manager') {
      personality += 'Authoritative but open to feedback. ';
    } else if (relationship === 'peer') {
      personality += 'Collaborative and supportive colleague. ';
    } else if (relationship === 'direct-report') {
      personality += 'Respectful and eager to improve. ';
    }
    
    // Add emotional state based on feedback type
    if (type === 'corrective' || type === 'difficult') {
      personality += 'May be defensive initially but willing to listen.';
    } else if (type === 'positive' || type === 'recognition') {
      personality += 'Appreciative and engaged.';
    } else {
      personality += 'Open and receptive to discussion.';
    }
    
    return personality;
  }

  function generateLearningObjectives(config: any) {
    const method = feedbackMethods.find(m => m.id === config.feedbackMethod);
    const objectives = [
      `Apply the ${method?.fullName} framework effectively`,
      `Adapt communication style for ${config.culturalContext.country} cultural context`,
      `Navigate ${config.recipient.relationship} relationship dynamics appropriately`
    ];
    
    if (config.situation.type === 'corrective' || config.situation.type === 'difficult') {
      objectives.push('Manage defensive reactions constructively');
    }
    
    return objectives;
  }

  function generateSuccessCriteria(config: any) {
    const method = feedbackMethods.find(m => m.id === config.feedbackMethod);
    const mustInclude = method?.steps || [];
    const mustAvoid = ['judgmental language', 'generalizations', 'cultural insensitivity'];
    
    if (config.culturalContext.region === 'east-asia') {
      mustInclude.push('face-saving approach');
      mustAvoid.push('direct confrontation');
    }
    
    return { mustInclude, mustAvoid };
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Session Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">Custom Role-Play Session</h1>
            <p className="text-gray-600">
              {rolePlayConfig.giver.name} → {rolePlayConfig.recipient.name} ({rolePlayConfig.recipient.relationship})
            </p>
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

        {/* Role-Play Configuration Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg text-sm">
          <div>
            <span className="text-gray-500">Cultural Context:</span>
            <p className="font-medium">{rolePlayConfig.culturalContext.country}</p>
          </div>
          <div>
            <span className="text-gray-500">Feedback Type:</span>
            <p className="font-medium">{feedbackType?.name}</p>
          </div>
          <div>
            <span className="text-gray-500">Method:</span>
            <p className="font-medium">{feedbackMethod?.name}</p>
          </div>
          <div>
            <span className="text-gray-500">Language:</span>
            <p className="font-medium">
              {config.languages.find(l => l.code === rolePlayConfig.language)?.name}
            </p>
          </div>
        </div>

        {/* Cultural Considerations Alert */}
        {rolePlayConfig.culturalContext.culturalNotes && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-medium text-yellow-900 mb-2">Cultural Considerations</h3>
            <p className="text-sm text-yellow-800">
              {rolePlayConfig.culturalContext.culturalNotes}
            </p>
          </div>
        )}
      </div>

      {/* Pre-Session Setup */}
      {!isSessionActive && !sessionComplete && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Prepare Your Practice</h2>
          
          {/* Method Steps Guide */}
          <div className="mb-6">
            <h3 className="font-medium mb-3">
              {feedbackMethod?.fullName} Framework
            </h3>
            <div className="space-y-2">
              {feedbackMethod?.steps.map((step, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium text-sm">
                    {index + 1}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">{step}</p>
                    <p className="text-sm text-gray-600">
                      {getStepDescription(feedbackMethod.id, step)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scenario Context */}
          {rolePlayConfig.situation.description && (
            <div className="mb-6">
              <h3 className="font-medium mb-2">Scenario Context</h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded">
                {rolePlayConfig.situation.description}
              </p>
            </div>
          )}

          {/* Learning Objectives */}
          <div className="mb-6">
            <h3 className="font-medium mb-2">Learning Objectives</h3>
            <ul className="space-y-1">
              {customScenario.learningObjectives.map((objective: string, idx: number) => (
                <li key={idx} className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">{objective}</span>
                </li>
              ))}
            </ul>
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
              scenario={customScenario}
              model={rolePlayConfig.model}
              language={rolePlayConfig.language}
              onUpdate={handleConversationUpdate}
              onComplete={handleEndSession}
            />
          </div>
          
          <div className="lg:col-span-1 space-y-4">
            <FeedbackPanel
              scenario={customScenario}
              conversationData={conversationData}
            />
            <CulturalCoachingPanel
              culturalContext={rolePlayConfig.culturalContext}
              feedbackMethod={rolePlayConfig.feedbackMethod}
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
            <p className="text-gray-600">Great job completing your custom role-play session!</p>
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
                {feedbackMethod?.name}
              </p>
              <p className="text-sm text-gray-600">Method Used</p>
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
              New Role-Play Setup
            </button>
          </div>
        </div>
      )}
    </div>
  );

  function getStepDescription(methodId: string, step: string): string {
    const descriptions: Record<string, Record<string, string>> = {
      sbi: {
        'Situation': 'Describe when and where the behavior occurred',
        'Behavior': 'Explain the specific actions you observed',
        'Impact': 'Share the effect on you, the team, or the organization'
      },
      desc: {
        'Describe': 'Objectively state what you observed',
        'Express': 'Share your feelings or concerns',
        'Specify': 'Clearly state what you want to see',
        'Consequences': 'Explain the positive outcomes of change'
      },
      star: {
        'Situation/Task': 'Set the context and the goal',
        'Action': 'Describe what was done',
        'Result': 'Explain the outcome and impact'
      },
      eec: {
        'Example': 'Give a specific instance',
        'Effect': 'Explain the impact',
        'Change/Continue': 'Suggest next steps'
      }
    };
    
    return descriptions[methodId]?.[step] || '';
  }
}