import { create } from 'zustand';
import { Complaint } from '../types';
import { MOCK_COMPLAINTS } from '../lib/mockData';

interface ComplaintsState {
  complaints: Complaint[];
  selectedId: string | null;
  filter: 'all' | 'open' | 'critical' | 'escalated';
  setSelected: (id: string | null) => void;
  setFilter: (filter: 'all' | 'open' | 'critical' | 'escalated') => void;
  updateComplaint: (id: string, patch: Partial<Complaint>) => void;
  addComplaint: (c: Complaint) => void;
  markRead: (id: string) => void;
  markResolved: (id: string) => void;
  markEscalated: (id: string) => void;
  markInProgress: (id: string) => void;
}

export const useComplaintsStore = create<ComplaintsState>((set, get) => ({
  complaints: MOCK_COMPLAINTS,
  selectedId: null,
  filter: 'all',
  
  setSelected: (id) => set({ selectedId: id }),
  setFilter: (f) => set({ filter: f }),
  
  updateComplaint: (id, patch) => set((state) => ({
    complaints: state.complaints.map(c => c.id === id ? { ...c, ...patch } : c)
  })),
  
  addComplaint: (c) => set((state) => ({
    complaints: [c, ...state.complaints]
  })),
  
  markRead: (id) => set((state) => ({
    complaints: state.complaints.map(c => c.id === id ? { ...c, unread: false } : c)
  })),
  
  markResolved: (id) => set((state) => ({
    complaints: state.complaints.map(c => c.id === id ? { ...c, status: 'resolved' } : c)
  })),
  
  markEscalated: (id) => set((state) => ({
    complaints: state.complaints.map(c => c.id === id ? { ...c, status: 'escalated' } : c)
  })),
  
  markInProgress: (id) => set((state) => ({
    complaints: state.complaints.map(c => c.id === id ? { ...c, status: 'in_progress' } : c)
  })),
}));

export const useFilteredComplaints = () => {
  const { complaints, filter } = useComplaintsStore();
  
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  
  let filtered = [...complaints];
  
  if (filter === 'open') {
    filtered = filtered.filter(c => c.status === 'open' || c.status === 'in_progress');
  } else if (filter === 'critical') {
    filtered = filtered.filter(c => c.severity === 'critical');
  } else if (filter === 'escalated') {
    filtered = filtered.filter(c => c.status === 'escalated');
  }
  
  return filtered.sort((a, b) => {
    const sevDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (sevDiff !== 0) return sevDiff;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
};

