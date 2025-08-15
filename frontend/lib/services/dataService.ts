// services/dataService.ts
import config from '@/data/config.json';
import scenarios from '@/data/scenarios.json';
import pulseQuestions from '@/data/pulseQuestions.json';
import teamAgreements from '@/data/teamAgreements.json';

export interface Config {
  brand: {
    name: string;
    tagline: string;
    logo: string;
    colors: Record<string, string>;
  };
  models: Array<{
    id: string;
    name: string;
    description: string;
    default?: boolean;
  }>;
  languages: Array<{
    code: string;
    name: string;
    default?: boolean;
  }>;
  pillars: Array<{
    id: string;
    name: string;
    icon: string;
    description: string;
  }>;
  feedbackTypes: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    tone: string;
  }>;
  feedbackMethods: Array<{
    id: string;
    name: string;
    fullName: string;
    description: string;
    steps: string[];
    bestFor: string[];
  }>;
  culturalContexts: {
    regions: Array<{
      id: string;
      name: string;
      countries: string[];
      characteristics: {
        communication: string;
        feedback: string;
        hierarchy: string;
        conflict: string;
      };
    }>;
    dimensions: Record<string, any>;
  };
  ui: {
    buttons: Record<string, string>;
    labels: Record<string, string>;
    messages: Record<string, string>;
    coachingTips: string[];
  };
  navigation: Record<string, string>;
}

export interface Scenario {
  id: string;
  title: string;
  pillar: string;
  difficulty: string;
  estimatedTime: number;
  description: string;
  context: string;
  roles: Array<{ id: string; name: string }>;
  suggestedStyle: string;
  initialPrompt: string;
  aiPersona: {
    name: string;
    role: string;
    personality: string;
  };
  learningObjectives: string[];
  successCriteria: {
    mustInclude: string[];
    mustAvoid: string[];
  };
}

export interface PulseQuestion {
  id: string;
  pillar: string;
  question: string;
  type: 'scale' | 'radio';
  scale?: {
    min: number;
    max: number;
    minLabel: string;
    maxLabel: string;
  };
  options?: Array<{
    value: string;
    label: string;
    score: number;
  }>;
  followUpThreshold: number;
  followUpScenario: string;
}

export interface TeamAgreement {
  id: string;
  title: string;
  pillar: string;
  status: "active" | "draft";
  createdBy: string;
  createdDate: string;
  lastModified: string;
  content: string;
  linkedScenarios: string[];
  endorsements: number;
  tags: string[];
}

class DataService {
  // Config methods
  getConfig(): Config {
    return config as Config;
  }

  getBrandConfig() {
    return config.brand;
  }

  getModels() {
    return config.models;
  }

  getDefaultModel() {
    return config.models.find(m => m.default) || config.models[0];
  }

  getLanguages() {
    return config.languages;
  }

  getDefaultLanguage() {
    return config.languages.find(l => l.default) || config.languages[0];
  }

  getPillars() {
    return config.pillars;
  }

  getFeedbackTypes() {
    return config.feedbackTypes || [];
  }

  getFeedbackMethods() {
    return config.feedbackMethods || [];
  }

  getCulturalContexts() {
    return config.culturalContexts || { regions: [], dimensions: {} };
  }

  getUIText(category: keyof typeof config.ui) {
    return config.ui[category];
  }

  getCoachingTips() {
    return config.ui.coachingTips;
  }

  getNavigation() {
    return config.navigation;
  }

  // Scenario methods
  getAllScenarios(): Scenario[] {
    return scenarios.scenarios;
  }

  getScenarioById(id: string): Scenario | undefined {
    return scenarios.scenarios.find(s => s.id === id);
  }

  getScenariosByPillar(pillar: string): Scenario[] {
    return scenarios.scenarios.filter(s => s.pillar === pillar);
  }

  getScenariosByDifficulty(difficulty: string): Scenario[] {
    return scenarios.scenarios.filter(s => s.difficulty === difficulty);
  }

  // Pulse methods
  getCurrentPulseQuestions(): PulseQuestion[] {
    // In a real app, this would determine the current week
    // For demo, return week 1 questions
    const currentWeek = pulseQuestions.pulseChecks[0];
    return currentWeek.questions as PulseQuestion[];
  }

  getPulseQuestionsByWeek(week: number): PulseQuestion[] {
    const weekData = pulseQuestions.pulseChecks.find(p => p.week === week);
    return weekData ? (weekData.questions as PulseQuestion[]) : [];
  }

  getAdaptiveQuestions() {
    return pulseQuestions.adaptiveQuestions;
  }

  // Team Agreement methods
  getAllAgreements(): TeamAgreement[] {
    return teamAgreements.agreements as TeamAgreement[];
  }

  getAgreementById(id: string): TeamAgreement | undefined {
    return teamAgreements.agreements.find(a => a.id === id) as TeamAgreement | undefined;
  }

  getAgreementsByPillar(pillar: string): TeamAgreement[] {
    return teamAgreements.agreements.filter(a => a.pillar === pillar) as TeamAgreement[];
  }

  getActiveAgreements(): TeamAgreement[] {
    return teamAgreements.agreements.filter(a => a.status === 'active') as TeamAgreement[];
  }

  getAgreementTemplates() {
    return teamAgreements.templates;
  }

  // Mock data creation methods (for demo purposes)
  async saveAgreement(agreement: Partial<TeamAgreement>): Promise<TeamAgreement> {
    // In a real app, this would save to a database
    const newAgreement: TeamAgreement = {
      id: `agreement-${Date.now()}`,
      title: agreement.title || 'New Agreement',
      pillar: agreement.pillar || 'general',
      status: 'draft',
      createdBy: 'Current User',
      createdDate: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      content: agreement.content || '',
      linkedScenarios: agreement.linkedScenarios || [],
      endorsements: 0,
      tags: agreement.tags || [],
      ...agreement
    };
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return newAgreement;
  }

  async savePulseResponse(responses: Record<string, number>): Promise<void> {
    // In a real app, this would save to a database
    console.log('Saving pulse responses:', responses);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Analytics methods (mock data)
  getTeamAnalytics() {
    return {
      practiceSessionsCompleted: 47,
      averageFeedbackScore: 4.2,
      pulseCompletionRate: 85,
      activeUsers: 12,
      trends: {
        communication: { current: 4.1, previous: 3.8, trend: 'up' },
        collaboration: { current: 4.3, previous: 4.2, trend: 'stable' },
        decisionMaking: { current: 3.9, previous: 4.1, trend: 'down' },
        valuesCulture: { current: 4.5, previous: 4.3, trend: 'up' },
        stressWellbeing: { current: 3.6, previous: 3.8, trend: 'down' },
        conflictManagement: { current: 4.0, previous: 3.9, trend: 'up' }
      },
      riskFlags: ['stress-wellbeing', 'decision-making'],
      recentActivity: [
        { user: 'Alex', action: 'Completed practice', scenario: 'unclear-expectations', time: '2 hours ago' },
        { user: 'Jordan', action: 'Submitted pulse', time: '3 hours ago' },
        { user: 'Sam', action: 'Updated agreement', agreement: 'Team Charter', time: '5 hours ago' }
      ]
    };
  }
}

// Export singleton instance
export const dataService = new DataService();
export default dataService;