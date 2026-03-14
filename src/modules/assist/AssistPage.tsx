import React, { useState, useRef, useEffect } from 'react';
import { Mic, Volume2, Globe2, AlertCircle, CheckCircle2, ChevronRight, FileText } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import { speechHandler, SUPPORTED_LANGUAGES } from '../../lib/speech';
import { groqComplete, PROMPT_TRANSLATE } from '../../lib/groq';
import { useSettingsStore } from '../../stores/settingsStore';

interface TranslationLog {
  id: string;
  source: 'customer' | 'agent';
  originalText: string;
  translatedText: string;
  timestamp: Date;
}

export default function AssistPage() {
  const [customerLang, setCustomerLang] = useState('hi-IN');
  const [mode, setMode] = useState<'voice' | 'text'>('voice');
  const [logs, setLogs] = useState<TranslationLog[]>([]);
  const [listeningTo, setListeningTo] = useState<'customer' | 'agent' | null>(null);
  const [interimText, setInterimText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  
  // Process Guide State
  const [guideTopic, setGuideTopic] = useState('');
  const [guideSteps, setGuideSteps] = useState<string[]>([]);
  const [guideLoading, setGuideLoading] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});

  const groqKey = useSettingsStore(state => state.groqKey);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, interimText]);

  const handleTranslate = async (text: string, fromAgent: boolean) => {
    setIsTranslating(true);
    try {
      const sourceLangCode = fromAgent ? 'en-IN' : customerLang;
      const targetLangCode = fromAgent ? customerLang : 'en-IN';
      const targetLangName = SUPPORTED_LANGUAGES.find(l => l.code === targetLangCode)?.label || 'English';

      const prompt = `Translate the following text to ${targetLangName}:\n\n${text}`;
      
      const translated = await groqComplete(
        groqKey,
        PROMPT_TRANSLATE,
        prompt
      );

      const log: TranslationLog = {
        id: Date.now().toString(),
        source: fromAgent ? 'agent' : 'customer',
        originalText: text,
        translatedText: translated,
        timestamp: new Date()
      };

      setLogs(prev => [...prev, log]);

      // Speak in output language
      speechHandler.speak(translated, targetLangCode);

    } catch (e) {
      console.error(e);
    } finally {
      setIsTranslating(false);
    }
  };

  const toggleListen = (speaker: 'customer' | 'agent') => {
    if (listeningTo === speaker) {
      speechHandler.stopListening();
      setListeningTo(null);
      setInterimText('');
      return;
    }

    // if already listening to the other, stop first
    if (listeningTo) {
      speechHandler.stopListening();
    }

    setListeningTo(speaker);
    setInterimText('');

    const langCode = speaker === 'customer' ? customerLang : 'en-IN';

    speechHandler.startListening(
      langCode,
      (text, isFinal) => {
        if (isFinal) {
          setInterimText('');
          setListeningTo(null);
          handleTranslate(text, speaker === 'agent');
        } else {
          setInterimText(text);
        }
      },
      () => {
        setListeningTo(null);
        setInterimText('');
      },
      (err) => {
        console.error("Mic error:", err);
        // Only alert if it's a real error, not a standard 'no-speech' timeout
        if (err !== 'no-speech') {
          alert(err);
        }
        setListeningTo(null);
        setInterimText('');
      }
    );
  };

  const getProcessGuide = async (topic: string) => {
    setGuideTopic(topic);
    if (!topic) {
      setGuideSteps([]);
      return;
    }
    setGuideLoading(true);
    setCheckedSteps({});
    try {
      const prompt = `Provide a step-by-step process guide for bank branch staff to handle "${topic}". Format as a plain numbered list (1. Step one\n2. Step two). Limit to 5-7 concise steps.`;
      const result = await groqComplete(groqKey, "You are a banking process expert.", prompt);
      const steps = result.split('\n').filter(s => s.trim().match(/^\d+\./)).map(s => s.replace(/^\d+\.\s*/, ''));
      setGuideSteps(steps);
    } catch (e) {
      console.error(e);
    } finally {
      setGuideLoading(false);
    }
  };

  const translateGuide = async () => {
    if (!guideSteps.length) return;
    setGuideLoading(true);
    try {
      const targetLangName = SUPPORTED_LANGUAGES.find(l => l.code === customerLang)?.label || 'Hindi';
      const textToTranslate = guideSteps.join('\n');
      const prompt = `Translate this to ${targetLangName}:\n\n${textToTranslate}`;
      const result = await groqComplete(groqKey, PROMPT_TRANSLATE, prompt);
      setGuideSteps(result.split('\n').filter(s => s.trim()));
    } catch (e) {
      console.error(e);
    } finally {
      setGuideLoading(false);
    }
  };

  const [textInputAgent, setTextInputAgent] = useState('');
  const [textInputCustomer, setTextInputCustomer] = useState('');

  return (
    <div className="max-w-[1600px] mx-auto w-full h-[calc(100vh-100px)] pt-6 pb-6 px-6 lg:px-8 flex gap-6 overflow-hidden z-10 relative animate-in fade-in slide-in-from-bottom-4">
      {/* LEFT: Translation Panel */}
      <div className="flex-1 flex flex-col h-full bg-white rounded-[32px] border border-gray-100/50 shadow-[0_8px_32px_rgba(20,20,20,0.06)] backdrop-blur-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 font-instrument flex items-center gap-2">
              <Globe2 size={24} className="text-[#FF5533]" />
              Branch Interpreter
            </h2>
            <p className="text-sm text-gray-500 font-medium">Real-time voice mapping</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-[#FF5533]/20 transition-all">
              <span className="text-sm font-bold text-gray-600 uppercase tracking-widest text-[11px]">Customer:</span>
              <select 
                className="text-sm font-semibold text-gray-900 border-none outline-none bg-transparent cursor-pointer"
                value={customerLang}
                onChange={(e) => setCustomerLang(e.target.value)}
              >
                {SUPPORTED_LANGUAGES.map(l => (
                  <option key={l.code} value={l.code}>{l.nativeLabel} ({l.label})</option>
                ))}
              </select>
            </div>
            <div className="text-gray-300 text-lg">↔</div>
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-400">
              <span className="text-sm font-bold uppercase tracking-widest text-[11px]">Agent:</span>
              <span className="text-sm font-semibold">English</span>
            </div>
          </div>
        </div>

        {/* Status Strip */}
        <div className="h-1.5 bg-gray-50 relative overflow-hidden">
          {isTranslating && <div className="absolute inset-0 bg-blue-500/20 animate-pulse"></div>}
          {listeningTo && <div className="absolute inset-y-0 w-1/3 bg-[#FF5533] animate-[slide_1s_infinite]"></div>}
        </div>

        {/* Conversation Log */}
        <div className="flex-1 overflow-y-auto p-8 bg-white flex flex-col gap-6">
          {logs.length === 0 && !listeningTo && (
            <div className="m-auto flex flex-col items-center text-gray-400">
              <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-6 border border-gray-100">
                <Volume2 size={32} className="opacity-50 text-gray-400" />
              </div>
              <p className="font-medium">Start speaking to begin translation</p>
            </div>
          )}
          
          {logs.map(log => (
            <div key={log.id} className={`flex flex-col max-w-[80%] ${log.source === 'agent' ? 'self-end items-end' : 'self-start items-start'}`}>
              <div className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 mx-2">
                {log.source === 'agent' ? 'You' : 'Customer'} • {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className={`p-4 rounded-3xl ${log.source === 'agent' ? 'bg-[#FF5533]/10 border border-[#FF5533]/20 rounded-tr-sm text-gray-900' : 'bg-gray-50 border border-gray-100 rounded-tl-sm shadow-sm text-gray-900'}`}>
                <div className="font-semibold mb-2">{log.originalText}</div>
                <div className="text-gray-500 font-medium text-[13px] pt-3 border-t border-gray-200/60">{log.translatedText}</div>
              </div>
            </div>
          ))}

          {listeningTo && (
            <div className={`flex flex-col max-w-[80%] ${listeningTo === 'agent' ? 'self-end items-end' : 'self-start items-start'}`}>
              <div className={`p-4 rounded-2xl min-w-[140px] ${listeningTo === 'agent' ? 'bg-[#FF5533]/10 border border-[#FF5533]/20 rounded-tr-sm' : 'bg-gray-50 border border-gray-100 rounded-tl-sm shadow-sm'}`}>
                <div className="flex items-center gap-2 text-red-500 mb-2">
                  <Mic size={14} className="animate-pulse" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">Listening...</span>
                </div>
                <div className="text-gray-600 font-medium italic min-h-[20px]">{interimText}</div>
              </div>
            </div>
          )}
          <div ref={logsEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-100 px-6 py-4">
          <div className="flex bg-gray-100/50 rounded-xl p-1 w-fit mb-4 border border-gray-100">
            <button onClick={() => setMode('voice')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${mode === 'voice' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Voice</button>
            <button onClick={() => setMode('text')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${mode === 'text' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Text</button>
          </div>

          {mode === 'voice' ? (
            <div className="flex gap-4 items-center justify-center py-2">
              <button
                onClick={() => toggleListen('customer')}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all flex-1 max-w-[280px] ${
                  listeningTo === 'customer' 
                    ? 'bg-red-50 border-2 border-red-500 shadow-md scale-[1.02]' 
                    : 'bg-white border border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${listeningTo === 'customer' ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30' : 'bg-gray-100 text-gray-400'}`}>
                  <Mic size={24} />
                </div>
                <div className="text-left overflow-hidden">
                  <div className="font-bold text-gray-900 text-sm whitespace-nowrap">Customer</div>
                  <div className="text-[11px] font-medium text-gray-500 mt-0.5 truncate uppercase tracking-wider">Speak in {SUPPORTED_LANGUAGES.find(l => l.code === customerLang)?.label}</div>
                </div>
              </button>

              <div className="text-gray-300 font-bold">VS</div>

              <button
                onClick={() => toggleListen('agent')}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all flex-1 max-w-[280px] ${
                  listeningTo === 'agent' 
                    ? 'bg-red-50 border-2 border-red-500 shadow-md scale-[1.02]' 
                    : 'bg-[#FFF5F2] border border-[#FF5533]/20 shadow-sm hover:border-[#FF5533]/40 hover:shadow-md'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${listeningTo === 'agent' ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30' : 'bg-[#FF5533] text-white shadow-lg shadow-[#FF5533]/30'}`}>
                  <Mic size={24} />
                </div>
                <div className="text-left overflow-hidden">
                  <div className="font-bold text-gray-900 text-sm whitespace-nowrap">You (Agent)</div>
                  <div className="text-[11px] font-medium text-[#FF5533] mt-0.5 uppercase tracking-wider">Speak in English</div>
                </div>
              </button>
            </div>
          ) : (
            <div className="flex gap-4">
              <div className="flex-1 flex flex-col gap-2">
                <textarea 
                  value={textInputCustomer}
                  onChange={e => setTextInputCustomer(e.target.value)}
                  placeholder={`Type in ${SUPPORTED_LANGUAGES.find(l => l.code === customerLang)?.label}...`}
                  className="w-full h-24 p-3 rounded-xl border border-gray-200 resize-none text-sm font-medium text-gray-700 bg-gray-50 outline-none focus:ring-2 focus:ring-[#FF5533]/20 focus:border-[#FF5533] shadow-inner"
                />
                <button 
                  onClick={() => { handleTranslate(textInputCustomer, false); setTextInputCustomer(''); }}
                  disabled={!textInputCustomer.trim()}
                  className="bg-gray-900 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-black disabled:opacity-50 transition-all shadow-sm active:scale-95"
                >
                  Translate to English
                </button>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <textarea 
                  value={textInputAgent}
                  onChange={e => setTextInputAgent(e.target.value)}
                  placeholder="Type in English..."
                  className="w-full h-24 p-3 rounded-xl border border-[#FF5533]/20 resize-none text-sm font-medium text-gray-700 bg-[#FFF5F2] outline-none focus:ring-2 focus:ring-[#FF5533]/20 focus:border-[#FF5533] shadow-inner"
                />
                <button 
                  onClick={() => { handleTranslate(textInputAgent, true); setTextInputAgent(''); }}
                  disabled={!textInputAgent.trim()}
                  className="bg-[#FF5533] text-white py-2.5 rounded-xl text-xs font-bold hover:bg-[#E64D2E] disabled:opacity-50 transition-all shadow-sm active:scale-95"
                >
                  Translate to {SUPPORTED_LANGUAGES.find(l => l.code === customerLang)?.label}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Process Guide */}
      <div className="w-[360px] flex flex-col gap-6 shrink-0 h-full">
        <div className="flex-1 flex flex-col bg-white rounded-[32px] overflow-hidden shadow-[0_8px_32px_rgba(20,20,20,0.06)] border border-gray-100/50 backdrop-blur-xl">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <FileText size={20} className="text-[#FF5533]" />
              Process Guide
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </div>
          
          <div className="flex flex-col h-full p-6">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Enquiry Type</label>
            <select
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#FF5533]/20 focus:border-[#FF5533] mb-6 shadow-inner cursor-pointer"
              value={guideTopic}
              onChange={(e) => getProcessGuide(e.target.value)}
            >
              <option value="">Select a topic...</option>
              <option value="Account Opening">Account Opening</option>
              <option value="Loan Enquiry">Loan Enquiry</option>
              <option value="KYC Update">KYC Update</option>
              <option value="UPI/Fraud">UPI/Fraud</option>
              <option value="FD/RD">FD/RD</option>
              <option value="Complaint Filing">Complaint Filing</option>
              <option value="Card Services">Card Services</option>
            </select>

            <div className="flex-1 overflow-y-auto no-scrollbar">
              {guideLoading ? (
                <div className="flex items-center justify-center h-40 text-gray-400">
                  <div className="w-8 h-8 border-4 border-[#FF5533]/30 border-t-[#FF5533] rounded-full animate-spin"></div>
                </div>
              ) : guideSteps.length > 0 ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">Steps</span>
                    <button onClick={translateGuide} className="text-[11px] font-bold text-[#FF5533] hover:underline uppercase tracking-wide">
                      Show in {SUPPORTED_LANGUAGES.find(l => l.code === customerLang)?.label}
                    </button>
                  </div>
                  {guideSteps.map((step, idx) => (
                    <label key={idx} className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${checkedSteps[idx] ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-white border-gray-100 hover:border-gray-300 shadow-sm'}`}>
                      <input 
                        type="checkbox" 
                        checked={!!checkedSteps[idx]}
                        onChange={(e) => setCheckedSteps(prev => ({...prev, [idx]: e.target.checked}))}
                        className="mt-0.5 w-5 h-5 rounded-md border-gray-300 text-[#FF5533] focus:ring-[#FF5533] cursor-pointer"
                      />
                      <span className={`text-[15px] font-medium leading-snug ${checkedSteps[idx] ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                        {step}
                      </span>
                    </label>
                  ))}
                  
                  {Object.keys(checkedSteps).length === guideSteps.length && (
                    <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center gap-2 text-emerald-600 font-bold shadow-sm shadow-emerald-500/10">
                      <CheckCircle2 size={20} />
                      Process complete!
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center h-48 text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 px-6">
                  <AlertCircle size={28} className="mb-3 text-gray-300" />
                  <p className="text-sm font-medium">Select an enquiry type above to load the step-by-step process</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
