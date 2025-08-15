// components/layout/ClientLayout.tsx
'use client';

import React, { useState } from 'react';

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Clone children and pass sidebar props to Header component
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      // Check if this is the Header component
      if (child.type && (child.type as any).name === 'Header') {
        return React.cloneElement(child as React.ReactElement<any>, {
          onMenuClick: () => setIsSidebarOpen(!isSidebarOpen),
        });
      }
    }
    return child;
  });

  return (
    <>
      <div className="flex flex-1">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close sidebar"
          />
        )}
        
        {/* Mobile Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 lg:hidden ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4">
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <nav className="mt-8 space-y-2">
              <MobileNavLinks onItemClick={() => setIsSidebarOpen(false)} />
            </nav>
          </div>
        </aside>

        {/* Main content wrapper */}
        <div className="flex-1">
          {childrenWithProps}
        </div>
      </div>
    </>
  );
};

// Mobile Navigation Links Component
const MobileNavLinks: React.FC<{ onItemClick: () => void }> = ({ onItemClick }) => {
  const navItems = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/practice', label: 'Practice', icon: '🎯' },
    { href: '/pulse-check', label: 'Pulse Check', icon: '📊' },
    { href: '/agreements', label: 'Team Agreements', icon: '📝' },
    { href: '/dashboard', label: 'Dashboard', icon: '📈' },
  ];

  return (
    <>
      {navItems.map((item) => (
        <a
          key={item.href}
          href={item.href}
          onClick={onItemClick}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <span className="text-xl">{item.icon}</span>
          <span className="font-medium">{item.label}</span>
        </a>
      ))}
    </>
  );
};

export default ClientLayout;