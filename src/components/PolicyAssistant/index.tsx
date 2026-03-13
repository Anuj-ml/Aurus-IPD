import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, X, RotateCcw, Mic, Volume2, Send, Loader2 } from 'lucide-react';
import { usePolicyAgent } from '../../lib/policyAgent';
import { speechHandler } from '../../lib/speech';
import AIStreamText from '../ui/AIStreamText';

export default function PolicyAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isThinking,
    docLoadState,
    sendMessage,
    interrupt,
    reset
  } = usePolicyAgent();

  const isSpeaking = speechHandler.isSpeaking();
  const isListening = speechHandler.isListening();

  useEffect(() => {
    speechHandler.setOnInterrupt(() => {
      interrupt();
      setIsVoiceMode(false);
    });
  }, [interrupt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Auto-speak when assistant finishes streaming
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'assistant' && !lastMsg.isStreaming && lastMsg.content && !lastMsg.content.includes('[interrupted]')) {
        // Find if this specific message was already spoken (to avoid repeat)
        // Just speak it if it was voice mode earlier. For now let's just speak if it's the last new fully streamed one
        const justFinished = !isThinking; // Simplification
        if (justFinished && isVoiceMode) {
          speechHandler.speak(lastMsg.content.replace(/\[interrupted\]/g, ''), 'en-IN', () => {
            setIsVoiceMode(false);
          });
        }
      }
    }
  }, [messages, isThinking, isVoiceMode]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
    setInterimText('');
    setIsVoiceMode(false);
  };

  const toggleMic = () => {
    if (!speechHandler.isSupported()) {
      alert("Voice not supported in this browser");
      return;
    }

    if (isListening) {
      speechHandler.stopListening();
    } else {
      setIsVoiceMode(true);
      speechHandler.startListening(
        'en-IN',
        (text, isFinal) => {
          if (isFinal) {
            setInterimText('');
            sendMessage(text);
          } else {
            setInterimText(text);
          }
        },
        () => {
          setInterimText('');
        },
        (err) => {
          console.error("Speech error", err);
          setIsVoiceMode(false);
          setInterimText('');
        }
      );
    }
  };

  const handleInterrupt = () => {
    speechHandler.stopSpeaking();
    interrupt();
    // Start listening again naturally
    setTimeout(() => {
      toggleMic();
    }, 300);
  };

  const unreadCount = isOpen ? 0 : messages.length;

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 lg:bottom-6 lg:right-6 z-50 flex items-center justify-center w-16 h-16 bg-[#FF5533] text-white rounded-[24px] rounded-tl-full rounded-tr-full rounded-bl-full shadow-[0_8px_24px_rgba(255,85,51,0.3)] hover:scale-105 active:scale-95 transition-all"
          title="Policy Assistant"
        >
          <BookOpen size={24} />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-4 top-4 bottom-4 lg:right-6 lg:top-6 lg:bottom-6 w-[400px] bg-white/95 backdrop-blur-xl border border-gray-100 rounded-[32px] shadow-[0_16px_40px_rgba(20,20,20,0.12)] flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="text-[#FF5533]">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 font-instrument text-lg leading-none">Policy Agent</h2>
                  <div className="text-[11px] font-bold tracking-widest uppercase text-gray-400 flex items-center gap-1 mt-1">
                    {docLoadState === 'loading' && <><Loader2 size={12} className="animate-spin" /> Loading RBI documents...</>}
                    {docLoadState === 'ready' && <><span className="w-2 h-2 bg-green-500 rounded-full"></span> 2 RBI documents loaded</>}
                    {docLoadState === 'error' && <><span className="w-2 h-2 bg-red-500 rounded-full"></span> Documents unavailable</>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={reset} className="p-2 text-gray-400 hover:text-[#FF5533] bg-white rounded-xl shadow-sm border border-gray-100 transition-colors" title="Reset Conversation">
                  <RotateCcw size={18} />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-[#FF5533] bg-white rounded-xl shadow-sm border border-gray-100 transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6 border border-orange-100/50">
                    <BookOpen size={32} className="text-[#FF5533]" />
                  </div>
                  <p className="font-bold text-gray-500 mb-6 tracking-tight">Ask anything about RBI guidelines</p>
                  <div className="grid grid-cols-2 gap-3 w-full">
                    {[
                      "UPI fraud — reversal timeline?",
                      "Zero liability rules",
                      "KYC rejection — customer options",
                      "When to escalate to Ombudsman?"
                    ].map(q => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="p-3 text-[13px] font-bold text-left bg-white hover:bg-orange-50 border border-gray-100 hover:border-orange-200 rounded-2xl text-gray-600 transition-colors shadow-sm"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`max-w-[85%] rounded-[24px] p-4 shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-[#FF5533] text-white rounded-tr-sm self-end'
                          : 'bg-white border border-gray-100 text-gray-900 rounded-tl-sm self-start'
                      }`}
                    >
                      {msg.role === 'assistant' ? (
                        <>
                          <div className="prose prose-sm prose-p:my-1 max-w-none font-medium leading-relaxed">
                            {msg.isStreaming ? (
                              <AIStreamText text={msg.content} isStreaming={true} />
                            ) : (
                              msg.content.includes('[interrupted]') ? (
                                <span className="text-red-500/80">{msg.content}</span>
                              ) : (
                                msg.content
                              )
                            )}
                          </div>
                          {!msg.isStreaming && msg.sourceDocs && (
                            <div className="mt-3 text-[11px] font-bold tracking-tight text-gray-500 flex items-center gap-1 bg-gray-50 px-2.5 py-1.5 rounded-lg inline-block border border-gray-100">
                              📄 {msg.sourceDocs.join(', ')}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-[14px] font-medium leading-relaxed">{msg.content}</div>
                      )}
                      <div className={`text-[10px] mt-2 text-right font-medium ${msg.role === 'user' ? 'text-white/80' : 'text-gray-400'}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                  {isThinking && (
                    <div className="bg-white shadow-sm border border-gray-100 text-gray-900 rounded-[24px] rounded-tl-sm self-start p-5 flex gap-1.5">
                      <div className="w-2.5 h-2.5 bg-[#FF5533]/80 rounded-full animate-bounce"></div>
                      <div className="w-2.5 h-2.5 bg-[#FF5533]/80 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2.5 h-2.5 bg-[#FF5533]/80 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Speaking / Interrupt strip */}
            {isSpeaking && (
              <button
                onClick={handleInterrupt}
                className="w-full py-3 bg-red-500 hover:bg-red-600 text-white text-[13px] font-bold tracking-tight animate-pulse flex items-center justify-center gap-2 transition-colors"
              >
                <div className="w-2 h-2 bg-white rounded-full"></div>
                Tap to interrupt
              </button>
            )}

            {/* Input area */}
            <div className="p-5 border-t border-gray-100 bg-white/80 backdrop-blur-md">
              {isListening && (
                <div className="mb-3 text-[13px] font-bold text-red-500 flex items-center gap-2">
                  <Mic size={14} className="animate-pulse" />
                  Listening... <span className="text-gray-500 ml-1 italic font-medium">{interimText}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleMic}
                  disabled={isSpeaking}
                  className={`p-4 rounded-[16px] transition-all shadow-sm ${
                    isSpeaking 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : isListening
                        ? 'bg-red-50 text-red-500 ring-2 ring-red-500 ring-offset-2 animate-pulse'
                        : 'bg-orange-50 text-[#FF5533] hover:bg-orange-100'
                  }`}
                >
                  {isSpeaking ? <Volume2 size={20} /> : <Mic size={20} />}
                </button>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask a policy question..."
                  disabled={isSpeaking}
                  className="flex-1 bg-white border border-gray-200 rounded-[16px] px-4 py-4 text-[14px] font-medium text-gray-900 outline-none focus:ring-2 focus:ring-[#FF5533]/20 focus:border-[#FF5533] disabled:opacity-50 shadow-sm placeholder:text-gray-400"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim() || isThinking || isSpeaking}
                  className="p-4 bg-[#FF5533] text-white rounded-[16px] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_4px_12px_rgba(255,85,51,0.2)]"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}