"use client";

import React, { useState } from 'react';
import { dataService } from '@/lib/services/dataService';
import AgreementEditor from '@/components/agreements/AgreementEditor';

export default function AgreementsPage() {
  const [showEditor, setShowEditor] = useState(false);
  const [editingAgreement, setEditingAgreement] = useState<any>(undefined);
  const [filterPillar, setFilterPillar] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const config = dataService.getConfig();
  const { pillars } = config;
  const agreementsData = dataService.getTeamAgreements();
  const agreements = agreementsData.agreements;

  const filteredAgreements = agreements.filter((agreement: any) => {
    const pillarMatch = filterPillar === 'all' || agreement.pillar === filterPillar;
    const statusMatch = filterStatus === 'all' || agreement.status === filterStatus;
    return pillarMatch && statusMatch;
  });

  const handleCreateNew = () => {
    setEditingAgreement(undefined);
    setShowEditor(true);
  };

  const handleEdit = (agreement: any) => {
    setEditingAgreement(agreement);
    setShowEditor(true);
  };

  const handleSave = (agreementData: any) => {
    // In a real app, this would save to the backend
    console.log('Saving agreement:', agreementData);
    setShowEditor(false);
    setEditingAgreement(undefined);
  };

  const handleCancel = () => {
    setShowEditor(false);
    setEditingAgreement(undefined);
  };

  const getPillarInfo = (pillarId: string) => {
    return pillars.find((p: any) => p.id === pillarId) || { name: pillarId, icon: '📋' };
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">Team Agreement Canvas</h1>
        <p className="text-gray-600 mb-6">
          Establish and manage your team's communication agreements and guidelines.
        </p>
        
        <button
          onClick={handleCreateNew}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          aria-label="Create new team agreement"
        >
          + Create New Agreement
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Filter Agreements</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="pillar-filter" className="block text-sm font-medium text-gray-700 mb-2">
              By Pillar
            </label>
            <select
              id="pillar-filter"
              value={filterPillar}
              onChange={(e) => setFilterPillar(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Pillars</option>
              {pillars.map((pillar: any) => (
                <option key={pillar.id} value={pillar.id}>
                  {pillar.icon} {pillar.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
              By Status
            </label>
            <select
              id="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Agreements Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAgreements.map((agreement: any) => {
          const pillarInfo = getPillarInfo(agreement.pillar);
          
          return (
            <div key={agreement.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              {/* Agreement Header */}
              <div className="p-4 sm:p-6 border-b">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl" aria-hidden="true">{pillarInfo.icon}</span>
                      <span className="text-sm text-gray-500">{pillarInfo.name}</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{agreement.title}</h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(agreement.status)}`}>
                        {agreement.status.charAt(0).toUpperCase() + agreement.status.slice(1)}
                      </span>
                      <span className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        {agreement.endorsements} endorsements
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleEdit(agreement)}
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                    aria-label={`Edit ${agreement.title} agreement`}
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* Agreement Content */}
              <div className="p-4 sm:p-6">
                <div className="mb-4">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                    {agreement.content}
                  </pre>
                </div>

                {/* Tags */}
                {agreement.tags && agreement.tags.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {agreement.tags.map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Linked Scenarios */}
                {agreement.linkedScenarios && agreement.linkedScenarios.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Linked Practice Scenarios ({agreement.linkedScenarios.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {agreement.linkedScenarios.map((scenarioId: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded border border-blue-200"
                        >
                          {scenarioId}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span>Created by {agreement.createdBy}</span>
                    <span>Last modified {new Date(agreement.lastModified).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAgreements.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No agreements found</h3>
          <p className="text-gray-500 mb-4">
            {filterPillar !== 'all' || filterStatus !== 'all' 
              ? 'Try adjusting your filters or create a new agreement.'
              : 'Get started by creating your first team agreement.'
            }
          </p>
          <button
            onClick={handleCreateNew}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Create First Agreement
          </button>
        </div>
      )}

      {/* Agreement Editor Modal */}
      {showEditor && (
        <AgreementEditor
          agreement={editingAgreement}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}