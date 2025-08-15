// pages/index.tsx
import React from 'react';
import Link from 'next/link';
import { dataService } from '@/lib/services/dataService';

const HomePage: React.FC = () => {
  const config = dataService.getConfig();
  const { brand, pillars, ui } = config;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <section className="text-center py-12 px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          {ui.messages.welcome}
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          {brand.tagline}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/practice"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            {ui.buttons.startPractice}
          </Link>
          <Link
            href="/pulse-check"
            className="px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            Take Pulse Check
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-12">
          Practice Across Six Core Pillars
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((pillar) => (
            <div
              key={pillar.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">{pillar.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{pillar.name}</h3>
              <p className="text-gray-600 mb-4">{pillar.description}</p>
              <Link
                href={`/practice?pillar=${pillar.id}`}
                className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
              >
                Practice Now
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 bg-gray-50 -mx-4 px-4 mt-12">
        <h2 className="text-3xl font-bold text-center mb-12">
          How It Works
        </h2>
        
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Select a Scenario</h3>
                <p className="text-gray-600">
                  Choose from our library of realistic workplace scenarios across six pillars
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Practice with AI</h3>
                <p className="text-gray-600">
                  Engage in voice-first conversations with our AI role-play partner
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Receive Real-time Coaching</h3>
                <p className="text-gray-600">
                  Get immediate feedback on your communication style and suggestions for improvement
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Track Progress</h3>
                <p className="text-gray-600">
                  Monitor your improvement over time and align with your team
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Transform Your Team's Communication?
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Start practicing difficult conversations in a safe, supportive environment
        </p>
        <Link
          href="/practice"
          className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium text-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
        >
          Get Started Now
        </Link>
      </section>
    </div>
  );
};

export default HomePage;