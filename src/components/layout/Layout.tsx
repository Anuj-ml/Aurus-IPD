import React from 'react';
import Topbar from './Topbar';
import PolicyAssistant from '../PolicyAssistant';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen w-full font-sans text-gray-900 bg-[#242426] p-4 lg:p-6 p-4">
      <div className="flex flex-col flex-1 rounded-[32px] overflow-hidden drop-shadow-2xl" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="px-6 pt-6 shrink-0">
          <Topbar />
        </div>
        <main className="flex-1 overflow-hidden flex flex-col min-h-0 relative">
          <div className="h-full overflow-y-auto px-6 pb-6">
            {children}
          </div>
        </main>
        <PolicyAssistant />
      </div>
    </div>
  );
}

