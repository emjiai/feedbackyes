// components/voice/ModelSelector.tsx
'use client';

import React from 'react';
import { dataService } from '@/lib/services/dataService';

interface ModelSelectorProps {
  value: string;
  onChange: (model: string) => void;
  compact?: boolean;
  showDescription?: boolean;
  disabled?: boolean;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  value,
  onChange,
  compact = false,
  showDescription = false,
  disabled = false
}) => {
  const config = dataService.getConfig();
  const models = config.models;
  const uiText = config.ui.labels;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  if (compact) {
    return (
      <select
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        aria-label={uiText.selectModel}
      >
        {models.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {uiText.selectModel}
      </label>
      
      {showDescription ? (
        <div className="space-y-2">
          {models.map((model) => (
            <label
              key={model.id}
              className={`flex items-start p-3 border rounded-lg cursor-pointer transition-all ${
                value === model.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="radio"
                name="model"
                value={model.id}
                checked={value === model.id}
                onChange={() => !disabled && onChange(model.id)}
                disabled={disabled}
                className="mt-1 mr-3"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">{model.name}</div>
                <div className="text-sm text-gray-600">{model.description}</div>
              </div>
            </label>
          ))}
        </div>
      ) : (
        <select
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default ModelSelector;
