// components/simulation/CulturalCoachingPanel.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { dataService } from '@/lib/services/dataService';

interface CulturalCoachingPanelProps {
  culturalContext: {
    region: string;
    country: string;
    culturalNotes?: string;
  };
  feedbackMethod: string;
}

const CulturalCoachingPanel: React.FC<CulturalCoachingPanelProps> = ({
  culturalContext,
  feedbackMethod
}) => {
  const [tips, setTips] = useState<string[]>([]);
  const [dosList, setDosList] = useState<string[]>([]);
  const [dontsList, setDontsList] = useState<string[]>([]);
  
  const config = dataService.getConfig();
  const { culturalContexts, feedbackMethods } = config;

  useEffect(() => {
    generateCulturalTips();
  }, [culturalContext, feedbackMethod]);

  const generateCulturalTips = () => {
    const region = culturalContexts.regions.find(r => r.id === culturalContext.region);
    const method = feedbackMethods.find(m => m.id === feedbackMethod);
    
    if (!region) return;

    // Generate tips based on cultural characteristics
    const newTips: string[] = [];
    const newDos: string[] = [];
    const newDonts: string[] = [];

    // Communication style tips
    if (region.characteristics.communication.includes('indirect')) {
      newTips.push('Use softer language and implied meanings');
      newDos.push('Start with positive context before concerns');
      newDonts.push("Don't be too blunt or direct");
    } else if (region.characteristics.communication.includes('direct')) {
      newTips.push('Be clear and straightforward');
      newDos.push('Get to the point efficiently');
      newDonts.push("Don't beat around the bush");
    }

    // Hierarchy considerations
    if (region.characteristics.hierarchy.includes('high power distance')) {
      newTips.push('Show appropriate respect for position');
      newDos.push('Use formal titles and honorifics');
      newDonts.push("Don't challenge authority publicly");
    } else if (region.characteristics.hierarchy.includes('low power distance')) {
      newTips.push('Encourage open dialogue');
      newDos.push('Treat as equals regardless of position');
      newDonts.push("Don't be overly formal");
    }

    // Feedback approach
    if (region.characteristics.feedback.includes('save face')) {
      newTips.push('Preserve dignity and reputation');
      newDos.push('Give negative feedback privately');
      newDonts.push("Don't criticize in front of others");
    } else if (region.characteristics.feedback.includes('straightforward')) {
      newTips.push('Be honest and transparent');
      newDos.push('Provide specific examples');
      newDonts.push("Don't sugarcoat important issues");
    }

    // Conflict handling
    if (region.characteristics.conflict.includes('avoid')) {
      newTips.push('Frame as collaborative problem-solving');
      newDos.push('Use "we" language');
      newDonts.push("Don't create confrontation");
    } else if (region.characteristics.conflict.includes('direct')) {
      newTips.push('Address issues head-on');
      newDos.push('Be prepared for debate');
      newDonts.push("Don't avoid difficult topics");
    }

    // Method-specific tips
    if (method) {
      if (method.id === 'nvc' && region.id === 'east-asia') {
        newTips.push('Focus on needs without direct requests');
      } else if (method.id === 'desc' && region.id === 'latin-america') {
        newTips.push('Build personal connection before feedback');
      } else if (method.id === 'sbi' && region.id === 'middle-east') {
        newTips.push('Consider group impact over individual');
      }
    }

    setTips(newTips.slice(0, 3));
    setDosList(newDos.slice(0, 3));
    setDontsList(newDonts.slice(0, 3));
  };

  const getCulturalDimensions = () => {
    const region = culturalContexts.regions.find(r => r.id === culturalContext.region);
    if (!region) return [];

    const dimensions = [];
    
    // Determine cultural dimensions based on characteristics
    if (region.characteristics.hierarchy.includes('high')) {
      dimensions.push({ name: 'Power Distance', level: 'High', color: 'red' });
    } else {
      dimensions.push({ name: 'Power Distance', level: 'Low', color: 'green' });
    }

    if (region.characteristics.communication.includes('direct')) {
      dimensions.push({ name: 'Directness', level: 'High', color: 'blue' });
    } else {
      dimensions.push({ name: 'Directness', level: 'Low', color: 'yellow' });
    }

    if (region.characteristics.feedback.includes('individual')) {
      dimensions.push({ name: 'Individualism', level: 'High', color: 'purple' });
    } else {
      dimensions.push({ name: 'Individualism', level: 'Low', color: 'orange' });
    }

    return dimensions;
  };

  return (
    <div className="space-y-4">
      {/* Cultural Context Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Cultural Context</h3>
        
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {culturalContext.country}
            </span>
            <span className="text-xs text-gray-500">
              {culturalContext.region.replace('-', ' ').toUpperCase()}
            </span>
          </div>
          
          {/* Cultural Dimensions */}
          <div className="space-y-2">
            {getCulturalDimensions().map((dim, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{dim.name}</span>
                <span className={`font-medium ${
                  dim.color === 'red' ? 'text-red-600' :
                  dim.color === 'green' ? 'text-green-600' :
                  dim.color === 'blue' ? 'text-blue-600' :
                  dim.color === 'yellow' ? 'text-yellow-600' :
                  dim.color === 'purple' ? 'text-purple-600' :
                  'text-orange-600'
                }`}>
                  {dim.level}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Tips */}
        {tips.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Cultural Tips</h4>
            <ul className="space-y-1">
              {tips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <svg className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-blue-800">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Do's and Don'ts */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Cultural Do's & Don'ts</h3>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Do's */}
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2 flex items-center">
              <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Do's
            </h4>
            <ul className="space-y-1">
              {dosList.map((item, index) => (
                <li key={index} className="text-sm text-green-800">
                  • {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Don'ts */}
          <div className="bg-red-50 rounded-lg p-4">
            <h4 className="font-medium text-red-900 mb-2 flex items-center">
              <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Don'ts
            </h4>
            <ul className="space-y-1">
              {dontsList.map((item, index) => (
                <li key={index} className="text-sm text-red-800">
                  • {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Communication Style Guide */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Communication Adjustments</h3>
        
        <div className="space-y-3">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium">
              1
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Opening</p>
              <p className="text-sm text-gray-600">
                {getOpeningStyle(culturalContext.region)}
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium">
              2
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Delivery</p>
              <p className="text-sm text-gray-600">
                {getDeliveryStyle(culturalContext.region)}
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium">
              3
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Closing</p>
              <p className="text-sm text-gray-600">
                {getClosingStyle(culturalContext.region)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  function getOpeningStyle(region: string): string {
    const styles: Record<string, string> = {
      'north-america': 'Get to business quickly after brief pleasantries',
      'east-asia': 'Build rapport first, inquire about wellbeing',
      'western-europe': 'Professional greeting, then to the point',
      'latin-america': 'Warm personal connection, ask about family',
      'middle-east': 'Extended greetings, show respect and honor',
      'africa': 'Community acknowledgment, ubuntu spirit',
      'south-asia': 'Respectful greeting with appropriate formality',
      'oceania': 'Casual, friendly opener with humor'
    };
    return styles[region] || 'Standard professional greeting';
  }

  function getDeliveryStyle(region: string): string {
    const styles: Record<string, string> = {
      'north-america': 'Direct, specific examples, solutions-focused',
      'east-asia': 'Indirect, suggestive, preserve harmony',
      'western-europe': 'Structured, evidence-based, professional',
      'latin-america': 'Personal, emotional consideration, diplomatic',
      'middle-east': 'Respectful, private feedback, honor-preserving',
      'africa': 'Community impact focus, collective benefit',
      'south-asia': 'Hierarchical awareness, respectful tone',
      'oceania': 'Straightforward but friendly, balanced'
    };
    return styles[region] || 'Clear and respectful delivery';
  }

  function getClosingStyle(region: string): string {
    const styles: Record<string, string> = {
      'north-america': 'Clear next steps and timeline',
      'east-asia': 'Reaffirm relationship, indirect commitment',
      'western-europe': 'Summary and action items',
      'latin-america': 'Personal reassurance, relationship emphasis',
      'middle-east': 'Respectful closing, honor maintained',
      'africa': 'Collective success emphasis, ubuntu',
      'south-asia': 'Respectful acknowledgment of hierarchy',
      'oceania': 'Casual but clear commitments'
    };
    return styles[region] || 'Professional closing with next steps';
  }
};

export default CulturalCoachingPanel;