import React from 'react';
import Card from './Card';
import clsx from 'clsx';
import { ArrowUpRight, ArrowDownRight, Settings } from 'lucide-react';

interface StatWidgetProps {
  label: string;
  value: string | number;
  trend?: string;
  trendDir?: 'up' | 'down';
  color?: string;
  icon?: React.ReactNode;
}

export default function StatWidget({ label, value, trend, trendDir, color, icon }: StatWidgetProps) {
  const isUp = trendDir === 'up';
  
  return (
    <Card padding="24px" className="relative flex flex-col justify-between h-[180px] bg-white border border-white">
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center shadow-sm">
          {icon || <div className="w-5 h-5 rounded-full border-[3px] border-black" style={{ borderColor: color || 'black' }} />}
        </div>
        <button className="text-xs font-semibold text-orange-400 bg-orange-50 px-3 py-1.5 rounded-full hover:bg-orange-100 transition-colors">
          See Detail
        </button>
      </div>
      
      <div className="flex flex-col gap-1 mt-auto">
        <div className="font-['DM_Sans'] text-4xl font-bold flex items-baseline gap-3 text-gray-900">
          {value}
          {trend && (
            <span 
              className={clsx(
                "text-sm font-medium flex items-center mb-1",
                isUp ? "text-green-600" : "text-amber-600"
              )}
            >
              {isUp ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
              {trend}
            </span>
          )}
        </div>
        <div className="text-sm font-medium text-gray-500">
          {label}
        </div>
      </div>
    </Card>
  );
}
