"use client";

import React, { useState } from 'react';
import { dataService } from '@/lib/services/dataService';

interface Agreement {
  id?: string;
  title: string;
  pillar: string;
  content: string;
  status: 'draft' | 'active';
  tags: string[];
  linkedScenarios: string[];
}

interface AgreementEditorProps {
  agreement?: Agreement;
  onSave: (agreement: Agreement) => void;
  onCancel: () => void;
}

export default function AgreementEditor({ agreement, onSave, onCancel }: AgreementEditorProps) {
  const [formData, setFormData] = useState<Agreement>({
    title: agreement?.title || '',
    pillar: agreement?.pillar || 'communication',
    content: agreement?.content || '',
    status: agreement?.status || 'draft',
    tags: agreement?.tags || [],
    linkedScenarios: agreement?.linkedScenarios || [],
    ...agreement
  });

  const [newTag, setNewTag] = useState('');
  const config = dataService.getConfig();
  const { pillars } = config;
  const scenarios = dataService.getAllScenarios();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const toggleScenario = (scenarioId: string) => {
    const isLinked = formData.linkedScenarios.includes(scenarioId);
    setFormData({
      ...formData,
      linkedScenarios: isLinked
        ? formData.linkedScenarios.filter(id => id !== scenarioId)
        : [...formData.linkedScenarios, scenarioId]
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4">
          <h2 className="text-2xl font-bold">
            {agreement ? 'Edit Agreement' : 'Create New Agreement'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Agreement Title *
            </label>
            <input
              type="text"
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Clear Communication Standards"
            />
          </div>

          {/* Pillar */}
          <div>
            <label htmlFor="pillar" className="block text-sm font-medium text-gray-700 mb-2">
              Related Pillar *
            </label>
            <select
              id="pillar"
              required
              value={formData.pillar}
              onChange={(e) => setFormData({ ...formData, pillar: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {pillars.map((pillar: any) => (
                <option key={pillar.id} value={pillar.id}>
                  {pillar.icon} {pillar.name}
                </option>
              ))}
            </select>
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Agreement Content *
            </label>
            <textarea
              id="content"
              required
              rows={8}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the specific behaviors and commitments..."
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={formData.status === 'draft'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'active' })}
                  className="mr-2"
                />
                Draft
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="status"
                  value="active"
                  checked={formData.status === 'active'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'active' })}
                  className="mr-2"
                />
                Active
              </label>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                    aria-label={`Remove ${tag} tag`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a tag"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Add
              </button>
            </div>
          </div>

          {/* Linked Scenarios */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link to Practice Scenarios
            </label>
            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3">
              {scenarios.map((scenario: any) => (
                <label key={scenario.id} className="flex items-center space-x-2 py-1">
                  <input
                    type="checkbox"
                    checked={formData.linkedScenarios.includes(scenario.id)}
                    onChange={() => toggleScenario(scenario.id)}
                    className="rounded"
                  />
                  <span className="text-sm">{scenario.title}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {agreement ? 'Update Agreement' : 'Create Agreement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}