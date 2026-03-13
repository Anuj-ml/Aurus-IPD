import React from 'react';
import Badge from '../../components/ui/Badge';
import SentimentBar from '../../components/ui/SentimentBar';
import { AIAnalysis } from '../../types';
import { Sparkles, ArrowRight, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface AIAnalysisCardProps {
  analysis: AIAnalysis | null;
  loading: boolean;
}

export const AIAnalysisCard: React.FC<AIAnalysisCardProps> = ({ analysis, loading }) => {
  if (!analysis && !loading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 mb-8"
    >
      <div className="bg-white rounded-3xl border border-[#FF5533]/20 shadow-[0_8px_32px_rgba(255,85,51,0.06)] overflow-hidden">
        <div className="flex items-center gap-2 text-[#FF5533] px-6 py-4 border-b border-[#FF5533]/10 bg-orange-50/50">
          <Sparkles size={18} />
          <span className="font-bold tracking-wide uppercase text-xs">AI Analysis</span>
        </div>
        
        {loading ? (
          <div className="p-6 space-y-4 animate-pulse">
            <div className="h-4 bg-gray-100 rounded w-1/3"></div>
            <div className="h-4 bg-gray-100 rounded w-1/2"></div>
            <div className="space-y-2 mt-4">
              <div className="h-3 bg-gray-100 rounded w-full"></div>
              <div className="h-3 bg-gray-100 rounded w-5/6"></div>
              <div className="h-3 bg-gray-100 rounded w-4/6"></div>
            </div>
            <div className="h-10 bg-gray-100 rounded w-full mt-4"></div>
          </div>
        ) : analysis ? (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-3">Customer Sentiment</div>
                <SentimentBar score={analysis.sentimentScore * 100} showLabel />
              </div>
              <div>
                <div className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-3">Classification</div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge color="bg-gray-50 text-gray-700 border-gray-200 px-3 py-1 font-semibold">{analysis.category}</Badge>
                  <span className="text-gray-400 text-sm flex items-center">
                    <ArrowRight size={14} className="mx-1" />
                    <span className="font-medium text-gray-600">{analysis.subcategory}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-gray-100">
              <div>
                <div className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-4">Key Issues Found</div>
                <ul className="space-y-3">
                  {(analysis.keyIssues || []).map((issue, idx) => (
                    <li key={idx} className="flex gap-2.5 text-sm text-gray-600 font-medium">
                      <ArrowRight size={16} className="text-[#FF5533] shrink-0 mt-0.5" />
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-6">
                {analysis.urgencyReason && (
                  <div>
                    <div className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-2">Urgency</div>
                    <div className="text-sm font-semibold text-[#FF5533]">
                      {analysis.urgencyReason}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-2">Regulatory Risk</div>
                  <Badge 
                    color={
                      analysis.regulatoryRisk === 'high' ? 'bg-red-50 text-red-600 border-red-200 px-3 py-1 font-bold' :
                      analysis.regulatoryRisk === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-200 px-3 py-1 font-bold' :
                      analysis.regulatoryRisk === 'low' ? 'bg-gray-50 text-gray-500 border-gray-200 px-3 py-1 font-bold' :
                      'bg-emerald-50 text-emerald-600 border-emerald-200 px-3 py-1 font-bold'
                    }
                  >
                    {analysis.regulatoryRisk.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="bg-orange-50/50 border border-orange-100/80 p-5 rounded-2xl mt-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF5533]/5 rounded-full blur-2xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} className="text-[#FF5533]" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#FF5533]">Recommended Action</span>
              </div>
              <p className="text-[15px] text-gray-800 font-medium pl-6 leading-relaxed">
                {analysis.recommendedAction}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
};


