// components/common/Footer.tsx
import React from 'react';
import { dataService } from '@/lib/services/dataService';

const Footer: React.FC = () => {
  const config = dataService.getConfig();
  const { brand } = config;

  return (
    <footer className="bg-gray-800 text-white mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold">{brand.name}</h3>
            <p className="text-sm text-gray-400">{brand.tagline}</p>
          </div>
          
          <div className="text-sm text-gray-400">
            <p>© 2025 {brand.name}. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;