import React from 'react';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: string | number;
  title?: React.ReactNode;
  action?: React.ReactNode;
}

export default function Card({ children, className, padding = '20px', title, action }: CardProps) {
  return (
    <div 
      className={clsx('bg-white rounded-[var(--radius)] shadow-[var(--shadow)] flex flex-col min-h-0', className)}
    >
      {title && (
        <div className="flex items-center justify-between px-[20px] py-4 border-b border-[var(--border)]">
          <h3 className="text-[14px] font-medium text-[var(--text-2)]">{title}</h3>
          {action && <div>{action}</div>}
        </div>
      )}
      <div style={{ padding }} className="flex-1 flex flex-col min-h-0">
        {children}
      </div>
    </div>
  );
}
