"use client";

import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  icon?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

interface StatsCardsProps {
  metrics: any;
}

function StatCard({ title, value, subtitle, trend, trendValue, icon, color = 'blue' }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
    orange: 'bg-orange-50 border-orange-200 text-orange-600'
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    stable: 'text-gray-600'
  };

  const trendIcons = {
    up: '↗️',
    down: '↘️',
    stable: '→'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {icon && <span className="text-2xl" aria-hidden="true">{icon}</span>}
            <h3 className="text-sm font-medium text-gray-700">{title}</h3>
          </div>
          
          <div className="mb-2">
            <span className="text-3xl font-bold text-gray-900">{value}</span>
          </div>
          
          {subtitle && (
            <p className="text-sm text-gray-500 mb-2">{subtitle}</p>
          )}
          
          {trend && trendValue && (
            <div className="flex items-center gap-1">
              <span className="text-sm" aria-hidden="true">{trendIcons[trend]}</span>
              <span className={`text-sm font-medium ${trendColors[trend]}`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        
        <div className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center ${colorClasses[color]}`}>
          {icon && <span className="text-xl" aria-hidden="true">{icon}</span>}
        </div>
      </div>
    </div>
  );
}

export default function StatsCards({ metrics }: StatsCardsProps) {
  const { overview, practiceMetrics, feedbackScores, pulseResults } = metrics;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Practice Sessions"
        value={overview.totalPracticeSessions}
        subtitle="Total completed"
        trend="up"
        trendValue={`+${practiceMetrics.sessionsThisWeek} this week`}
        icon="🎯"
        color="blue"
      />
      
      <StatCard
        title="Avg Feedback Score"
        value={feedbackScores.overall}
        subtitle="Out of 10"
        trend={feedbackScores.trend === 'improving' ? 'up' : feedbackScores.trend === 'declining' ? 'down' : 'stable'}
        trendValue={feedbackScores.trend === 'improving' ? '+0.3 this month' : 'Stable'}
        icon="⭐"
        color="green"
      />
      
      <StatCard
        title="Team Members"
        value={overview.teamMembers}
        subtitle="Active participants"
        icon="👥"
        color="purple"
      />
      
      <StatCard
        title="Pulse Participation"
        value={`${pulseResults.participationRate}%`}
        subtitle="Last pulse check"
        trend={pulseResults.participationRate > 80 ? 'up' : pulseResults.participationRate > 60 ? 'stable' : 'down'}
        trendValue={`${pulseResults.participationRate > 80 ? 'Excellent' : pulseResults.participationRate > 60 ? 'Good' : 'Needs improvement'}`}
        icon="📊"
        color="orange"
      />
    </div>
  );
}