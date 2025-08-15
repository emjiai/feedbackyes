// pages/practice/index.tsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { dataService } from '@/lib/services/dataService';
import ScenarioList from '@/components/simulation/ScenarioList';
import RolePlaySetup from '@/components/simulation/RolePlaySetup';

const PracticePage: React.FC = () => {
  const router = useRouter();
  const [selectedPillar, setSelectedPillar] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [scenarios, setScenarios] = useState(dataService.getAllScenarios());
  const [showRolePlaySetup, setShowRolePlaySetup] = useState(false);
  
  const config = dataService.getConfig();
  const { pillars, ui } = config;

  useEffect(() => {
    // Filter scenarios based on pillar from URL query
    const pillarParam = router.query.pillar as string;
    if (pillarParam) {
      setSelectedPillar(pillarParam);
    }
  }, [router.query]);

  useEffect(() => {
    // Filter scenarios
    let filtered = dataService.getAllScenarios();
    
    if (selectedPillar !== 'all') {
      filtered = filtered.filter(s => s.pillar === selectedPillar);
    }
    
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(s => s.difficulty === selectedDifficulty);
    }
    
    setScenarios(filtered);
  }, [selectedPillar, selectedDifficulty]);

  const handleRolePlayComplete = (config: any) => {
    // Save config to session storage and navigate to custom practice session
    sessionStorage.setItem('rolePlayConfig', JSON.stringify(config));
    router.push('/practice/custom');
  };

  if (showRolePlaySetup) {
    return (
      <RolePlaySetup
        onComplete={handleRolePlayComplete}
        onCancel={() => setShowRolePlaySetup(false)}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{ui.labels.selectScenario}</h1>
        <p className="text-gray-600">
          Choose a workplace scenario to practice your communication skills
        </p>
      </div>

      {/* Custom Role-Play Card */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">🎭 Create Custom Role-Play</h2>
            <p className="opacity-90">
              Design your own feedback scenario with specific cultural context and relationship dynamics
            </p>
          </div>
          <button
            onClick={() => setShowRolePlaySetup(true)}
            className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Start Custom Setup
          </button>
        </div>
      </div>

      {/* Filters */}// pages/practice/index.tsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { dataService } from '../../services/dataService';
import ScenarioList from '../../components/simulation/ScenarioList';

const PracticePage: React.FC = () => {
  const router = useRouter();
  const [selectedPillar, setSelectedPillar] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [scenarios, setScenarios] = useState(dataService.getAllScenarios());
  
  const config = dataService.getConfig();
  const { pillars, ui } = config;

  useEffect(() => {
    // Filter scenarios based on pillar from URL query
    const pillarParam = router.query.pillar as string;
    if (pillarParam) {
      setSelectedPillar(pillarParam);
    }
  }, [router.query]);

  useEffect(() => {
    // Filter scenarios
    let filtered = dataService.getAllScenarios();
    
    if (selectedPillar !== 'all') {
      filtered = filtered.filter(s => s.pillar === selectedPillar);
    }
    
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(s => s.difficulty === selectedDifficulty);
    }
    
    setScenarios(filtered);
  }, [selectedPillar, selectedDifficulty]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{ui.labels.selectScenario}</h1>
        <p className="text-gray-600">
          Choose a workplace scenario to practice your communication skills
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pillar Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pillar
            </label>
            <select
              value={selectedPillar}
              onChange={(e) => setSelectedPillar(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Pillars</option>
              {pillars.map((pillar) => (
                <option key={pillar.id} value={pillar.id}>
                  {pillar.icon} {pillar.name}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Scenarios List */}
      {scenarios.length > 0 ? (
        <ScenarioList scenarios={scenarios} />
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">{ui.messages.noScenarios}</p>
        </div>
      )}
    </div>
  );
};

export default PracticePage;