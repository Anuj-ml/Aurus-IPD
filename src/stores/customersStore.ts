import { create } from 'zustand';
import { Customer } from '../types';
import { MOCK_CUSTOMERS } from '../lib/mockData';

interface CustomersState {
  customers: Customer[];
  selectedId: string | null;
  sortBy: 'churnRiskScore' | 'lastActive' | 'lifetimeValue';
  sortDir: 'asc' | 'desc';
  filter: 'all' | 'critical' | 'high' | 'actioned';
  actionedIds: Set<string>;
  
  setSelected: (id: string | null) => void;
  setSortBy: (field: 'churnRiskScore' | 'lastActive' | 'lifetimeValue') => void;
  toggleSortDir: () => void;
  setFilter: (filter: 'all' | 'critical' | 'high' | 'actioned') => void;
  markActioned: (id: string) => void;
  updateCustomer: (id: string, patch: Partial<Customer>) => void;
  setCustomers: (customers: Customer[]) => void;
}

export const useCustomersStore = create<CustomersState>((set, get) => ({
  customers: MOCK_CUSTOMERS,
  selectedId: null,
  sortBy: 'churnRiskScore',
  sortDir: 'desc',
  filter: 'all',
  actionedIds: new Set<string>(),

  setSelected: (id) => set({ selectedId: id }),
  
  setSortBy: (field) => set({ sortBy: field }),
  
  toggleSortDir: () => set((state) => ({ sortDir: state.sortDir === 'asc' ? 'desc' : 'asc' })),
  
  setFilter: (f) => set({ filter: f }),
  
  markActioned: (id) => set((state) => {
    const newActioned = new Set(state.actionedIds);
    newActioned.add(id);
    return {
      actionedIds: newActioned,
      customers: state.customers.map(c => 
        c.id === id ? { ...c, recommendedAction: '✓ Actioned today' } : c
      )
    };
  }),

  updateCustomer: (id, patch) => set((state) => ({
    customers: state.customers.map(c => c.id === id ? { ...c, ...patch } : c)
  })),

  setCustomers: (customers) => set({ customers }),
}));

