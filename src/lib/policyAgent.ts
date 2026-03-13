import { useState, useEffect, useRef } from 'react';
import { getDocuments, DocLoadState } from './policyLoader';
import { groqStream } from './groq';
import { useSettingsStore } from '../stores/settingsStore';

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  sourceDocs?: string[];
  timestamp: Date;
}

const POLICY_AGENT_SYSTEM = `You are a knowledgeable banking policy assistant for Union Bank of India branch staff. You have access to RBI Master Circulars and banking guidelines.

Rules:
- You must always respond in the exact same language that the user asks the question in (e.g., if asked in Hindi, respond in Hindi).
- Answer conversationally and remember full conversation context
- Keep answers concise (3-5 sentences) unless asked for more detail
- Always end with the source: 'Source: [document name]'
- For unauthorized transaction queries always mention RBI zero-liability rules
- For complaint queries always mention the 30-day resolution mandate
- Offer to go deeper: end complex answers with 'Want more detail on any part?'
- If situation needs ombudsman escalation, flag it clearly
- Never make up policy — if unsure, say so`;

export function usePolicyAgent() {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [docLoadState, setDocLoadState] = useState<DocLoadState>('idle');
  const [docSources, setDocSources] = useState<string[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const groqKey = useSettingsStore(state => state.groqKey);

  useEffect(() => {
    async function load() {
      setDocLoadState('loading');
      try {
        const docs = await getDocuments();
        setDocSources(docs.sources);
        setDocLoadState(docs.text.trim() ? 'ready' : 'error');
      } catch (e) {
        setDocLoadState('error');
      }
    }
    load();
  }, []);

  const sendMessage = async (userText: string) => {
    if (!userText.trim()) return;

    const userMsgId = Date.now().toString() + '-user';
    const asstMsgId = Date.now().toString() + '-asst';
    
    setMessages(prev => [
      ...prev,
      {
        id: userMsgId,
        role: 'user',
        content: userText,
        timestamp: new Date()
      },
      {
        id: asstMsgId,
        role: 'assistant',
        content: '',
        isStreaming: true,
        timestamp: new Date()
      }
    ]);

    setIsThinking(true);

    abortControllerRef.current = new AbortController();

    try {
      const docs = await getDocuments();
      
      const groqMessages = [
        { role: 'system', content: POLICY_AGENT_SYSTEM },
        { 
          role: 'user', 
          content: `RBI Policy Documents:\n\n${docs.text}\n\n---\nYou have read these documents. Answer all questions based on them.` 
        },
        { 
          role: 'assistant', 
          content: 'Understood. I have read the RBI policy documents and banking guidelines. I am ready to assist branch staff with accurate, policy-grounded answers.' 
        },
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: userText }
      ];

      setIsThinking(false);

      await groqStream(
        groqKey,
        groqMessages,
        (chunk) => {
          setMessages(prev => prev.map(m => 
            m.id === asstMsgId 
              ? { ...m, content: m.content + chunk }
              : m
          ));
        },
        { signal: abortControllerRef.current.signal }
      );

      setMessages(prev => prev.map(m => 
        m.id === asstMsgId 
          ? { ...m, isStreaming: false, sourceDocs: docs.sources }
          : m
      ));
    } catch (err: any) {
      setIsThinking(false);
      if (err.name === 'AbortError') {
        // Interrupted, don't show error
      } else {
        console.error("Policy agent stream error", err);
        setMessages(prev => prev.map(m => 
          m.id === asstMsgId 
            ? { ...m, isStreaming: false, content: m.content + '\n[Error: Connection failed]' }
            : m
        ));
      }
    }
  };

  const interrupt = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setMessages(prev => {
      const newMessages = [...prev];
      if (newMessages.length > 0) {
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg.role === 'assistant' && lastMsg.isStreaming) {
          lastMsg.content += ' [interrupted]';
          lastMsg.isStreaming = false;
        }
      }
      return newMessages;
    });
    setIsThinking(false);
  };

  const reset = () => {
    setMessages([]);
    interrupt();
  };

  return {
    messages,
    isThinking,
    docLoadState,
    docSources,
    sendMessage,
    interrupt,
    reset,
    abortController: abortControllerRef.current
  };
}