import React, { useState } from 'react';
import { useComplaintsStore } from '../../stores/complaintsStore';
import { useSettingsStore } from '../../stores/settingsStore';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import SLATimer from '../../components/ui/SLATimer';
import { AIAnalysisCard } from './AIAnalysisCard';
import { ResponseEditor } from './ResponseEditor';
import { getSLAStatus } from '../../lib/mockData';
import { groqJSON, PROMPT_ANALYZE_COMPLAINT } from '../../lib/groq';
import { AIAnalysis } from '../../types';
import { format } from 'date-fns';
import { 
  Mail, MessageCircle, Building, Phone, Globe, 
  Sparkles, Clock, AlertTriangle, User, Hash, FileText
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const ChannelIcons = {
  email: Mail,
  whatsapp: MessageCircle,
  branch: Building,
  ivr: Phone,
  portal: Globe,
};

export const ComplaintDetail: React.FC = () => {
  const { complaints, selectedId, updateComplaint } = useComplaintsStore();
  const settings = useSettingsStore();

  const complaint = complaints.find(c => c.id === selectedId);
  const [analyzing, setAnalyzing] = useState(false);

  if (!complaint) return null;

  const Icon = ChannelIcons[complaint.channel] || Mail;

  const handleAnalyze = async () => {
    if (!settings.hasGroqKey()) {
      alert('Please add your Groq API key in Settings');
      return;
    }

    setAnalyzing(true);
    try {
      const result = await groqJSON<AIAnalysis>(
        settings.groqKey,
        PROMPT_ANALYZE_COMPLAINT,
        `Customer: ${complaint.customerName}\nCategory: ${complaint.category}\nComplaint Body: ${complaint.body}`
      );
      updateComplaint(complaint.id, { aiAnalysis: result });
    } catch (error) {
      console.error('Analysis failed', error);
      alert('Failed to analyze complaint. Check console for details.');
    } finally {
      setAnalyzing(false);
    }
  };

  const getSeverityBadgeColor = (sev: string) => {
    switch (sev) {
      case 'critical': return 'bg-danger/10 text-danger border-danger/20';
      case 'high': return 'bg-warning/10 text-warning border-warning/20';
      case 'medium': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'low': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-surface-2 text-text-2 border-border';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-surface-2 text-text-1 border-border';
      case 'in_progress': return 'bg-accent/10 text-accent border-accent/20';
      case 'escalated': return 'bg-danger/10 text-danger border-danger/20';
      case 'resolved': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-surface-2 text-text-2 border-border';
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 w-full h-full overflow-y-auto pr-2 no-scrollbar pl-4">
      <div className="bg-white rounded-3xl p-8 mb-6 border border-gray-100 shadow-sm shadow-gray-100/50 mt-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#FF5533]/5 to-orange-100/10 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3"></div>
        <div className="">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-5">
              <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-white shadow-sm border border-gray-100 text-gray-500"
              )}>
                <Icon size={28} />
              </div>
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="font-mono text-[13px] text-gray-400 font-medium tracking-wide">{complaint.id}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
                  <span className="text-[13px] text-gray-500 font-medium">{complaint.customerName}</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight font-instrument">
                  {complaint.subject || complaint.category}
                </h1>
                <div className="flex items-center gap-2">
                  <Badge color={getSeverityBadgeColor(complaint.severity)}>
                    {complaint.severity.toUpperCase()}
                  </Badge>
                  <Badge color="bg-gray-50 text-gray-500 border-gray-100 capitalize">
                    {complaint.channel}
                  </Badge>
                  <Badge color={getStatusBadgeColor(complaint.status)}>
                    {complaint.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                  {complaint.aiAnalysis && (
                    <Badge color="bg-orange-50 text-[#FF5533] border-orange-100/50 flex gap-1 items-center px-2 py-0.5">
                      <Sparkles size={12} className="text-[#FF5533]" /> AI Analyzed
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3 z-10 relative">
              <div className="flex gap-2">
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing || !!complaint.aiAnalysis}
                  className={clsx(
                    "flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200",
                    complaint.aiAnalysis 
                      ? "bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-100" 
                      : "bg-[#2A2A2A] text-white hover:bg-black shadow-md shadow-black/10 active:scale-95"
                  )}
                >
                  <Sparkles size={16} className={complaint.aiAnalysis ? "text-gray-400" : "text-[#FF5533]"} />
                  {analyzing ? 'Analyzing...' : complaint.aiAnalysis ? 'Analyzed' : 'AI Analyze'}
                </button>
                <select 
                  className="bg-white border border-gray-200 text-gray-700 text-sm rounded-xl px-4 py-2 font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF5533]/20 focus:border-[#FF5533]"
                  value={complaint.status}
                  onChange={(e) => updateComplaint(complaint.id, { status: e.target.value as any })}
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="escalated">Escalated</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-8 pt-6 border-t border-gray-100/60 bg-gray-50/30 rounded-2xl p-4">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">
                <Clock size={14} className="text-gray-400" /> Received
              </div>
              <div className="text-sm font-semibold text-gray-700">
                {format(new Date(complaint.timestamp), "MMM d, yyyy h:mm a")}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">
                <AlertTriangle size={14} className="text-gray-400" /> SLA Deadline
              </div>
              <div className="text-sm font-semibold">
                <SLATimer 
                  deadline={new Date(new Date(complaint.timestamp).getTime() + complaint.slaHours * 60 * 60 * 1000)} 
                  slaHours={complaint.slaHours} 
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">
                <Hash size={14} className="text-gray-400" /> Account No
              </div>
              <div className="text-sm font-mono font-bold text-gray-600">
                {complaint.accountNo || 'Unknown'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 mb-8 pb-4">
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2 text-gray-500 font-semibold text-sm uppercase tracking-wide">
            <FileText size={16} className="text-[#FF5533]" /> Customer Message
          </div>
          <div className="text-xs text-gray-400 font-mono font-medium bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
            {complaint.body.split(/\s+/).filter(Boolean).length} words
          </div>
        </div>
        <div className="bg-white border-l-4 border-[#FF5533] p-6 rounded-2xl rounded-l-none text-[16px] leading-relaxed text-gray-600 font-medium shadow-sm border-t border-r border-b border-gray-50 relative">
          <div className="absolute top-4 left-4 text-4xl text-gray-100 font-serif leading-none h-6 select-none -translate-x-1 -translate-y-2">"</div>
          <div className="relative z-10 ml-6 italic">{complaint.body}</div>
        </div>
      </div>

      <AnimatePresence>
        {(complaint.aiAnalysis || analyzing) && (
          <AIAnalysisCard analysis={complaint.aiAnalysis} loading={analyzing} />
        )}
      </AnimatePresence>

      <ResponseEditor key={complaint.id} complaint={complaint} />
    </div>
  );
};

