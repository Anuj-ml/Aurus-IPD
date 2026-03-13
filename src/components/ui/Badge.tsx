import React from 'react';
import clsx from 'clsx';
import { Severity } from '../../types';

interface BadgeProps {
  severity?: Severity;
  variant?: 'channel' | 'status' | 'custom';
  color?: string;
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ severity, variant, color, children, className }: BadgeProps) {
  let bg = 'bg-gray-100';
  let text = 'text-gray-800';
  let border = 'border-gray-200';

  if (severity) {
    switch (severity) {
      case 'critical':
        bg = 'bg-red-100';
        text = 'text-red-700';
        border = 'border-red-200';
        break;
      case 'high':
        bg = 'bg-amber-100';
        text = 'text-amber-700';
        border = 'border-amber-200';
        break;
      case 'medium':
        bg = 'bg-blue-100';
        text = 'text-blue-700';
        border = 'border-blue-200';
        break;
      case 'low':
        bg = 'bg-green-100';
        text = 'text-green-700';
        border = 'border-green-200';
        break;
    }
  } else if (variant === 'status') {
    if (children === 'open') {
      bg = 'bg-gray-100'; text = 'text-gray-700'; border = 'border-gray-200';
    } else if (children === 'in_progress') {
      bg = 'bg-amber-100'; text = 'text-amber-700'; border = 'border-amber-200';
    } else if (children === 'escalated') {
      bg = 'bg-red-100'; text = 'text-red-700'; border = 'border-red-200';
    } else if (children === 'resolved') {
      bg = 'bg-green-100'; text = 'text-green-700'; border = 'border-green-200';
    }
  }

  return (
    <span 
      className={clsx(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium border",
        !color && bg,
        !color && text,
        !color && border,
        className
      )}
      style={color ? { backgroundColor: `${color}20`, color, borderColor: `${color}40` } : undefined}
    >
      {children}
    </span>
  );
}
