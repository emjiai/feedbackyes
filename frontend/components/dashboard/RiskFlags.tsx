"use client";

import React from 'react';
import Link from 'next/link';

interface RiskFlag {
  id: string;
  level: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  impact: string;
  recommendation: string;
  linkedAgreement?: string;
  affectedMembers: number;
}

interface RiskFlagsProps {
  riskFlags: RiskFlag[];
}

export default function RiskFlags({ riskFlags }: RiskFlagsProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'high':
        return '🚨';
      case 'medium':
        return '⚠️';
      case 'low':
        return 'ℹ️';
      default:
        return '📋';
    }
  };

  const getPriorityOrder = (level: string) => {
    switch (level) {
      case 'high': return 1;
      case 'medium': return 2;
      case 'low': return 3;
      default: return 4;
    }
  };

  const sortedRiskFlags = [...riskFlags].sort((a, b) => 
    getPriorityOrder(a.level) - getPriorityOrder(b.level)
  );

  if (riskFlags.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span aria-hidden="true">✅</span>
          Risk Assessment
        </h2>
        <div className="text-center py-8">
          <div className="text-green-500 text-4xl mb-4">🎉</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">All Clear!</h3>
          <p className="text-gray-600">
            No risk flags detected. Your team communication is on track.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <span aria-hidden="true">🚩</span>
        Risk Flags ({riskFlags.length})
      </h2>
      
      <div className="space-y-4">
        {sortedRiskFlags.map((risk) => (
          <div 
            key={risk.id} 
            className={`border-2 rounded-lg p-4 ${getLevelColor(risk.level)}`}
            role="alert"
            aria-labelledby={`risk-${risk.id}-title`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
              <div className="flex-shrink-0">
                <span className="text-2xl" aria-hidden="true">
                  {getLevelIcon(risk.level)}
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <h3 
                    id={`risk-${risk.id}-title`}
                    className="font-semibold text-lg"
                  >
                    {risk.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getLevelColor(risk.level)}`}>
                      {risk.level.toUpperCase()} RISK
                    </span>
                    <span className="text-sm text-gray-600">
                      {risk.affectedMembers} member{risk.affectedMembers !== 1 ? 's' : ''} affected
                    </span>
                  </div>
                </div>
                
                <p className="text-sm mb-3 leading-relaxed">
                  {risk.description}
                </p>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Impact:</span>
                    <span className="ml-2">{risk.impact}</span>
                  </div>
                  
                  <div>
                    <span className="font-medium">Recommendation:</span>
                    <span className="ml-2">{risk.recommendation}</span>
                  </div>
                </div>
                
                {risk.linkedAgreement && (
                  <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                    <Link
                      href={`/agreements#${risk.linkedAgreement}`}
                      className="inline-flex items-center gap-1 text-sm font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-current focus:ring-opacity-50 rounded"
                    >
                      <span>📋</span>
                      View Related Agreement
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">Quick Actions</h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <Link
            href="/practice"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-center text-sm font-medium"
          >
            Practice Scenarios
          </Link>
          <Link
            href="/pulse-check"
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-center text-sm font-medium"
          >
            Take Pulse Check
          </Link>
          <Link
            href="/agreements"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-center text-sm font-medium"
          >
            Review Agreements
          </Link>
        </div>
      </div>
    </div>
  );
}