import React from 'react';
import { ComplaintInbox } from './ComplaintInbox';
import { ComplaintDetail } from './ComplaintDetail';
import { useComplaintsStore } from '../../stores/complaintsStore';

export const ResolvePage: React.FC = () => {
  const selectedId = useComplaintsStore((state) => state.selectedId);

  return (
    <div className="max-w-[1600px] mx-auto w-full h-[calc(100vh-100px)] pt-6 pb-6 px-6 lg:px-8 flex gap-6 overflow-hidden z-10 relative">
      <div className="w-[380px] shrink-0 h-full flex flex-col bg-white rounded-[32px] overflow-hidden shadow-[0_8px_32px_rgba(20,20,20,0.06)] border border-gray-100/50 backdrop-blur-xl">
        <ComplaintInbox />
      </div>
      <div className="flex-1 h-full flex flex-col bg-white rounded-[32px] overflow-hidden shadow-[0_8px_32px_rgba(20,20,20,0.06)] border border-gray-100/50 backdrop-blur-xl">
        {selectedId ? (
          <ComplaintDetail />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 font-medium h-full">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            Select a resolution trace to view details
          </div>
        )}
      </div>
    </div>
  );
};


