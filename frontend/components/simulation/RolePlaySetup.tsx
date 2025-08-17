// components/simulation/RolePlaySetup.tsx
'use client';

import React, { useState } from 'react';
import { dataService } from '@/lib/services/dataService';
import ModelSelector from '@/components/voice/ModelSelector';

interface RolePlayConfig {
  giver: {
    name: string;
    role: string;
    avatar?: string;
  };
  recipient: {
    name: string;
    role: string;
    relationship: string; // peer, manager, direct report, client
  };
  culturalContext: {
    region: string;
    country: string;
    culturalNotes?: string;
  };
  situation: {
    type: string; // positive, corrective, difficult, developmental, custom
    description: string;
    context?: string;
  };
  feedbackMethod: string;
  language: string;
  model: string;
}

interface RolePlaySetupProps {
  onComplete: (config: RolePlayConfig) => void;
  onCancel: () => void;
}

export default function RolePlaySetup({ onComplete, onCancel }: RolePlaySetupProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState<RolePlayConfig>({
    giver: { name: '', role: '' },
    recipient: { name: '', role: '', relationship: '' },
    culturalContext: { region: '', country: '' },
    situation: { type: '', description: '' },
    feedbackMethod: 'sbi',
    language: 'en',
    model: dataService.getDefaultModel().id
  });

  const configData = dataService.getConfig();
  const { culturalContexts, feedbackTypes, feedbackMethods, languages } = configData;

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerateRolePlay = () => {
    // Add AI-generated scene details
    const enhancedConfig = {
      ...config,
      culturalContext: {
        ...config.culturalContext,
        culturalNotes: getCulturalNotes(config.culturalContext.region)
      },
      situation: {
        ...config.situation,
        context: generateScenarioContext(config)
      }
    };
    onComplete(enhancedConfig);
  };

  const getCulturalNotes = (regionId: string) => {
    const region = culturalContexts.regions.find(r => r.id === regionId);
    if (!region) return '';
    
    return `Communication style: ${region.characteristics.communication}. 
            Feedback approach: ${region.characteristics.feedback}. 
            Hierarchy: ${region.characteristics.hierarchy}.`;
  };

  const generateScenarioContext = (config: RolePlayConfig) => {
    const feedbackType = feedbackTypes.find(f => f.id === config.situation.type);
    const method = feedbackMethods.find(m => m.id === config.feedbackMethod);
    
    return `${config.giver.name} (${config.giver.role}) will practice giving ${feedbackType?.name} 
            to ${config.recipient.name} (${config.recipient.role}) using the ${method?.fullName} method. 
            Cultural considerations for ${config.culturalContext.country} will be applied.`;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 1: Who's Giving Feedback?</h3>
            <p className="text-gray-600">Enter your details or choose a role-play avatar</p>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={config.giver.name}
                  onChange={(e) => setConfig({
                    ...config,
                    giver: { ...config.giver, name: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Role
                </label>
                <input
                  type="text"
                  value={config.giver.role}
                  onChange={(e) => setConfig({
                    ...config,
                    giver: { ...config.giver, role: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Team Lead, Senior Developer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or Choose an Avatar
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Professional', 'Casual', 'Formal'].map((avatar) => (
                    <button
                      key={avatar}
                      type="button"
                      onClick={() => setConfig({
                        ...config,
                        giver: { 
                          name: avatar === 'Professional' ? 'Alex Chen' : 
                                avatar === 'Casual' ? 'Jordan Smith' : 'Dr. Morgan Davis',
                          role: avatar === 'Professional' ? 'Project Manager' : 
                                avatar === 'Casual' ? 'Team Member' : 'Department Director',
                          avatar
                        }
                      })}
                      className={`p-3 border rounded-lg text-sm ${
                        config.giver.avatar === avatar
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 2: Who Are You Talking To?</h3>
            <p className="text-gray-600">Enter the recipient's details and your relationship</p>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient's Name
                </label>
                <input
                  type="text"
                  value={config.recipient.name}
                  onChange={(e) => setConfig({
                    ...config,
                    recipient: { ...config.recipient, name: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter recipient's name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient's Role
                </label>
                <input
                  type="text"
                  value={config.recipient.role}
                  onChange={(e) => setConfig({
                    ...config,
                    recipient: { ...config.recipient, role: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Software Engineer, Marketing Analyst"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relationship to You
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Peer', 'Manager', 'Direct Report', 'Client', 'Cross-functional', 'External Partner'].map((rel) => (
                    <button
                      key={rel}
                      type="button"
                      onClick={() => setConfig({
                        ...config,
                        recipient: { ...config.recipient, relationship: rel.toLowerCase().replace(' ', '-') }
                      })}
                      className={`p-2 border rounded-lg text-sm ${
                        config.recipient.relationship === rel.toLowerCase().replace(' ', '-')
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {rel}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 3: Where Are They From?</h3>
            <p className="text-gray-600">Select the cultural context for your conversation</p>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Region
                </label>
                <select
                  value={config.culturalContext.region}
                  onChange={(e) => {
                    const region = culturalContexts.regions.find(r => r.id === e.target.value);
                    setConfig({
                      ...config,
                      culturalContext: {
                        ...config.culturalContext,
                        region: e.target.value,
                        country: region?.countries[0] || ''
                      }
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a region...</option>
                  {culturalContexts.regions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name}
                    </option>
                  ))}
                </select>
              </div>

              {config.culturalContext.region && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Country
                  </label>
                  <select
                    value={config.culturalContext.country}
                    onChange={(e) => setConfig({
                      ...config,
                      culturalContext: { ...config.culturalContext, country: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {culturalContexts.regions
                      .find(r => r.id === config.culturalContext.region)
                      ?.countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {config.culturalContext.region && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Cultural Characteristics</h4>
                  <div className="space-y-1 text-sm text-blue-800">
                    {Object.entries(
                      culturalContexts.regions.find(r => r.id === config.culturalContext.region)?.characteristics || {}
                    ).map(([key, value]) => (
                      <div key={key}>
                        <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                        <span className="ml-2">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 4: What's the Situation?</h3>
            <p className="text-gray-600">Choose the type of feedback or describe your own scenario</p>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {feedbackTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setConfig({
                        ...config,
                        situation: { ...config.situation, type: type.id }
                      })}
                      className={`p-3 border rounded-lg text-left ${
                        config.situation.type === type.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-start">
                        <span className="text-2xl mr-2">{type.icon}</span>
                        <div>
                          <div className="font-medium">{type.name}</div>
                          <div className="text-xs text-gray-600">{type.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Describe the Situation (Optional)
                </label>
                <textarea
                  value={config.situation.description}
                  onChange={(e) => setConfig({
                    ...config,
                    situation: { ...config.situation, description: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="e.g., Project deadline was missed, Outstanding presentation to client, Team collaboration issues..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Feedback Method
                </label>
                <select
                  value={config.feedbackMethod}
                  onChange={(e) => setConfig({ ...config, feedbackMethod: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {feedbackMethods
                    .filter(m => m.bestFor.includes(config.situation.type) || config.situation.type === '')
                    .map((method) => (
                      <option key={method.id} value={method.id}>
                        {method.name} - {method.fullName}
                      </option>
                    ))}
                </select>
              </div>

              {config.feedbackMethod && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm">
                    <span className="font-medium">Method Steps: </span>
                    {feedbackMethods.find(m => m.id === config.feedbackMethod)?.steps.join(' → ')}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 5: Additional Settings</h3>
            <p className="text-gray-600">Configure language and AI model preferences</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conversation Language
                </label>
                <select
                  value={config.language}
                  onChange={(e) => setConfig({ ...config, language: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <ModelSelector
                value={config.model}
                onChange={(model) => setConfig({ ...config, model })}
                showDescription
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 6: Review Your Role-Play Setup</h3>
            <p className="text-gray-600">Confirm your settings and start the conversation</p>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Feedback Giver:</span>
                  <p className="text-gray-900">{config.giver.name} ({config.giver.role})</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Recipient:</span>
                  <p className="text-gray-900">{config.recipient.name} ({config.recipient.role})</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Relationship:</span>
                  <p className="text-gray-900 capitalize">{config.recipient.relationship.replace('-', ' ')}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Cultural Context:</span>
                  <p className="text-gray-900">{config.culturalContext.country}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Feedback Type:</span>
                  <p className="text-gray-900">
                    {feedbackTypes.find(f => f.id === config.situation.type)?.name}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Method:</span>
                  <p className="text-gray-900">
                    {feedbackMethods.find(m => m.id === config.feedbackMethod)?.name}
                  </p>
                </div>
              </div>

              {config.situation.description && (
                <div>
                  <span className="font-medium text-gray-600 text-sm">Situation:</span>
                  <p className="text-gray-900 text-sm mt-1">{config.situation.description}</p>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">AI Scene Setting</h4>
              <p className="text-sm text-blue-800">
                The AI will simulate {config.recipient.name} with appropriate emotional state, 
                communication style, and cultural nuances for {config.culturalContext.country}. 
                You'll practice using the {feedbackMethods.find(m => m.id === config.feedbackMethod)?.fullName} method
                to deliver {feedbackTypes.find(f => f.id === config.situation.type)?.name?.toLowerCase()}.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return config.giver.name && config.giver.role;
      case 2:
        return config.recipient.name && config.recipient.role && config.recipient.relationship;
      case 3:
        return config.culturalContext.region && config.culturalContext.country;
      case 4:
        return config.situation.type && config.feedbackMethod;
      case 5:
        return true;
      case 6:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold">Role-Play Setup</h2>
          <span className="text-sm text-gray-600">Step {currentStep} of 6</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {renderStep()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={currentStep === 1 ? onCancel : handlePrevious}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {currentStep === 1 ? 'Cancel' : 'Previous'}
        </button>

        {currentStep < 6 ? (
          <button
            onClick={handleNext}
            disabled={!isStepValid()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleGenerateRolePlay}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Start Conversation
          </button>
        )}
      </div>
    </div>
  )
}