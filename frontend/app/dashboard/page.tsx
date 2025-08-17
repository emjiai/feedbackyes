"use client";

import React from 'react';
import { dataService } from '@/lib/services/dataService';
import StatsCards from '@/components/dashboard/StatsCards';
import RiskFlags from '@/components/dashboard/RiskFlags';

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

export default function DashboardPage() {
  const dashboardMetrics = dataService.getDashboardMetrics();
  const config = dataService.getConfig();
  const { pillars } = config;

  const getPillarInfo = (pillarId: string) => {
    return pillars.find((p: any) => p.id === pillarId) || { name: pillarId, icon: '📋' };
  };

  // Type assertion to fix the RiskFlag type issue
  const riskFlags = dashboardMetrics.riskFlags as RiskFlag[];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">Team Communication Dashboard</h1>
        <p className="text-gray-600">
          Monitor your team's communication progress and insights.
        </p>
        <div className="text-sm text-gray-500 mt-2">
          Last updated: {new Date(dashboardMetrics.overview.lastUpdated).toLocaleString()}
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards metrics={dashboardMetrics} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column - Practice Metrics & Pulse Results */}
        <div className="xl:col-span-2 space-y-8">
          {/* Practice Sessions by Pillar */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <span aria-hidden="true">🎯</span>
              Practice Sessions by Pillar
            </h2>
            <div className="space-y-4">
              {dashboardMetrics.practiceMetrics.topPillars.map((pillar: any) => {
                const pillarInfo = getPillarInfo(pillar.pillar);
                const percentage = (pillar.sessions / dashboardMetrics.practiceMetrics.totalSessions) * 100;
                
                return (
                  <div key={pillar.pillar} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg" aria-hidden="true">{pillarInfo.icon}</span>
                        <span className="font-medium">{pillarInfo.name}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {pillar.sessions} sessions • Avg score: {pillar.avgScore}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                        role="progressbar"
                        aria-valuenow={percentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${pillarInfo.name}: ${percentage.toFixed(1)}% of total sessions`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Feedback Methods Performance */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <span aria-hidden="true">📊</span>
              Feedback Methods Performance
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dashboardMetrics.feedbackScores.byMethod.map((method: any) => (
                <div key={method.method} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900 uppercase text-sm">
                      {method.method}
                    </h3>
                    <span className="text-2xl font-bold text-blue-600">
                      {method.avgScore}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Used {method.usage} times
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-green-500 h-1 rounded-full"
                      style={{ width: `${(method.avgScore / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pulse Results */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <span aria-hidden="true">💓</span>
              Latest Pulse Check Results
            </h2>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Sentiment</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  dashboardMetrics.pulseResults.overallSentiment === 'positive' 
                    ? 'bg-green-100 text-green-800'
                    : dashboardMetrics.pulseResults.overallSentiment === 'neutral'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {dashboardMetrics.pulseResults.overallSentiment.toUpperCase()}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-4">
                {dashboardMetrics.pulseResults.participationRate}% participation rate • 
                Last check: {new Date(dashboardMetrics.pulseResults.lastPulseDate).toLocaleDateString()}
              </div>
            </div>
            
            <div className="space-y-3">
              {Object.entries(dashboardMetrics.pulseResults.averageRatings).map(([category, rating]: [string, any]) => {
                const trend = dashboardMetrics.pulseResults.trends.find((t: any) => t.category === category);
                const trendIcon = trend?.trend === 'improving' ? '↗️' : trend?.trend === 'declining' ? '↘️' : '→';
                
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{rating}/5</span>
                        <span className="text-xs" title={`Trend: ${trend?.trend}`}>
                          {trendIcon}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          rating >= 4 ? 'bg-green-500' : rating >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(rating / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column - Risk Flags & Achievements */}
        <div className="space-y-8">
          {/* Risk Flags */}
          <RiskFlags riskFlags={riskFlags} />

          {/* Recent Achievements */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <span aria-hidden="true">🏆</span>
              Recent Achievements
            </h2>
            {dashboardMetrics.achievements.length > 0 ? (
              <div className="space-y-4">
                {dashboardMetrics.achievements.map((achievement: any) => (
                  <div key={achievement.id} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <span className="text-2xl" aria-hidden="true">{achievement.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-medium text-green-900">{achievement.title}</h3>
                      <p className="text-sm text-green-700 mb-1">{achievement.description}</p>
                      <div className="text-xs text-green-600">
                        Earned {new Date(achievement.earnedDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="text-gray-400 text-3xl mb-2">🎯</div>
                <p className="text-gray-500 text-sm">Keep practicing to earn achievements!</p>
              </div>
            )}
          </div>

          {/* Upcoming Milestones */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <span aria-hidden="true">📅</span>
              Upcoming Milestones
            </h2>
            <div className="space-y-3">
              {dashboardMetrics.upcomingMilestones.map((milestone: any, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{milestone.title}</h3>
                    <div className="text-sm text-gray-600">
                      {new Date(milestone.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}