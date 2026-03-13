import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsStore {
  groqKey: string;
  geminiKey: string;
  agentName: string;
  agentBranch: string;
  setGroqKey: (k: string) => void;
  setGeminiKey: (k: string) => void;
  setAgentName: (n: string) => void;
  setAgentBranch: (n: string) => void;
  hasGroqKey: () => boolean;
  hasGeminiKey: () => boolean;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      groqKey: import.meta.env.VITE_GROQ_API_KEY || '',
      geminiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
      agentName: 'Agent',
      agentBranch: 'Mumbai Main',
      setGroqKey: (k) => set({ groqKey: k }),
      setGeminiKey: (k) => set({ geminiKey: k }),
      setAgentName: (n) => set({ agentName: n }),
      setAgentBranch: (b) => set({ agentBranch: b }),
      hasGroqKey: () => !!get().groqKey,
      hasGeminiKey: () => !!get().geminiKey,
    }),
    {
      name: 'clearbank-settings',
    }
  )
);

