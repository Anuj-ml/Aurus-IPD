import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import AIStreamText from '../../components/ui/AIStreamText';
import { useComplaintsStore } from '../../stores/complaintsStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { groqStream, PROMPT_DRAFT_RESPONSE } from '../../lib/groq';
import { Sparkles, Send, Save, Zap } from 'lucide-react';
import { Complaint } from '../../types';
import { clsx } from 'clsx';

interface ResponseEditorProps {
  complaint: Complaint;
}

export const ResponseEditor: React.FC<ResponseEditorProps> = ({ complaint }) => {
  const settings = useSettingsStore();
  const updateComplaint = useComplaintsStore(state => state.updateComplaint);
  const markResolved = useComplaintsStore(state => state.markResolved);
  const markEscalated = useComplaintsStore(state => state.markEscalated);

  const [isStreaming, setIsStreaming] = useState(false);
  const [draft, setDraft] = useState(complaint.draftResponse || '');

  // Reset local state when a different complaint is selected
  React.useEffect(() => {
    setDraft(complaint.draftResponse || '');
    setIsStreaming(false);
  }, [complaint.id, complaint.draftResponse]);

  const hasGroqKey = settings.hasGroqKey();
  const canDraft = complaint.aiAnalysis !== null;

  const handleDraft = async () => {
    if (!hasGroqKey) {
      alert('Please add your Groq API key in Settings');
      return;
    }

    setIsStreaming(true);
    setDraft('');
    
    try {
      const userData = `
Customer: ${complaint.customerName}
Category: ${complaint.category}
Complaint: ${complaint.body}
AI Analysis:
${JSON.stringify(complaint.aiAnalysis, null, 2)}
      `;
      
      const fullText = await groqStream(
        settings.groqKey,
        [
          { role: 'system', content: PROMPT_DRAFT_RESPONSE },
          { role: 'user', content: userData }
        ],
        (chunk) => {
          setDraft(prev => prev + chunk);
        }
      );
      
      updateComplaint(complaint.id, { draftResponse: fullText });
    } catch (err) {
      console.error('Failed to draft response', err);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="mt-8 mb-4">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
          <div className="font-bold text-gray-800 text-sm uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF5533]"></span> Response Draft
          </div>
        </div>
        <div className="p-6 flex flex-col gap-5">
          {!draft && !isStreaming ? (
            <div className="flex flex-col items-center justify-center p-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 gap-4">
              <button
                onClick={handleDraft}
                disabled={!canDraft}
                title={!canDraft ? 'Requires AI Analysis first' : ''}
                className={clsx(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm",
                  canDraft 
                    ? "bg-[#2A2A2A] text-white hover:bg-black active:scale-95 shadow-black/10" 
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                )}
              >
                <Sparkles size={18} className={canDraft ? "text-[#FF5533]" : "text-gray-400"} />
                AI Draft Response
              </button>
              {!hasGroqKey && canDraft && <div className="text-sm font-medium text-gray-400">Requires Groq API Key in Settings</div>}
              {!canDraft && <div className="text-sm font-medium text-gray-400">Analyze trace first to enable AI drafting</div>}
            </div>
          ) : isStreaming ? (
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 min-h-[200px]">
              <AIStreamText text={draft} isStreaming={true} />
            </div>
          ) : (
            <textarea
              className="w-full h-56 bg-gray-50 border border-gray-200 rounded-2xl p-5 text-[15px] leading-relaxed font-medium text-gray-700 outline-none focus:ring-2 focus:ring-[#FF5533]/20 focus:border-[#FF5533] resize-none transition-all shadow-inner"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write your response..."
            />
          )}

          <div className="flex items-center justify-between mt-3 pt-5 border-t border-gray-100">
            <button 
              className="flex items-center gap-1.5 text-red-500 font-bold text-sm hover:text-red-600 transition-colors uppercase tracking-wider px-3 py-1.5 hover:bg-red-50 rounded-lg"
              onClick={() => markEscalated(complaint.id)}
            >
              <Zap size={16} /> Escalate
            </button>
            <div className="flex gap-3">
              <button 
                className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
                onClick={() => updateComplaint(complaint.id, { draftResponse: draft })}
              >
                <Save size={16} /> Save Draft
              </button>
              <button 
                className={clsx(
                  "px-5 py-2.5 font-bold text-sm rounded-xl transition-all shadow-sm flex items-center gap-2",
                  !draft || isStreaming ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20 active:scale-95"
                )}
                onClick={() => {
                  updateComplaint(complaint.id, { draftResponse: draft, finalResponse: draft });
                  markResolved(complaint.id);
                }}
                disabled={!draft || isStreaming}
              >
                <Send size={16} /> Send & Resolve
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

