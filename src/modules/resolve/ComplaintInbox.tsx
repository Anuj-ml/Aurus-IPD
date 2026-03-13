import React, { useState } from 'react';
import { useComplaintsStore, useFilteredComplaints } from '../../stores/complaintsStore';
import { clsx } from 'clsx';
import { Mail, MessageCircle, Building, Phone, Globe, Plus, AlertCircle, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getSLAStatus, MOCK_COMPLAINTS } from '../../lib/mockData';
import { Complaint, Severity, Channel } from '../../types';

const ChannelIcons: Record<Channel, React.FC<any>> = {
  email: Mail,
  whatsapp: MessageCircle,
  branch: Building,
  ivr: Phone,
  portal: Globe,
};

export const ComplaintInbox: React.FC = () => {
  const { complaints, selectedId, filter, setSelected, setFilter, markRead, addComplaint } = useComplaintsStore();
  const filtered = useFilteredComplaints();
  
  const [showModal, setShowModal] = useState(false);
  const [newComp, setNewComp] = useState<Partial<Complaint>>({
    customerName: '',
    accountNo: '',
    channel: 'email',
    severity: 'medium',
    subject: '',
    body: '',
    category: 'Service Request',
  });

  const unreadCount = complaints.filter(c => c.unread).length;

  const handleSelect = (id: string, unread: boolean) => {
    setSelected(id);
    if (unread) markRead(id);
  };

  const getSeverityColor = (sev: Severity) => {
    switch (sev) {
      case 'critical': return 'bg-danger';
      case 'high': return 'bg-warning';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-success';
      default: return 'bg-gray-400';
    }
  };

  const CATEGORIES = ['Fraud', 'ATM Service', 'Loan', 'KYC', 'Digital Channels', 'Fixed Deposit', 'Service Request'];

  const handlePreset = (preset: Partial<Complaint>) => {
    setNewComp({ ...newComp, ...preset });
  };

  const handleSubmit = () => {
    const slaHours = newComp.severity === 'critical' ? 4 : newComp.severity === 'high' ? 24 : newComp.severity === 'medium' ? 72 : 168;
    const complaint: Complaint = {
      id: `CMP-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      customerName: newComp.customerName!,
      accountNo: newComp.accountNo!,
      channel: newComp.channel as Channel,
      severity: newComp.severity as Severity,
      subject: newComp.subject!,
      body: newComp.body!,
      category: newComp.category!,
      status: 'open',
      timestamp: new Date(),
      slaHours,
      unread: true,
      aiAnalysis: null,
      draftResponse: null,
      finalResponse: ''
    };
    addComplaint(complaint);
    setShowModal(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-900 font-instrument">Resolution Inbox</h2>
          {unreadCount > 0 && (
            <span className="bg-[#FF5533] text-white text-xs px-2.5 py-1 rounded-full font-medium shadow-sm">
              {unreadCount} new
            </span>
          )}
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-[#FF5533] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#E64D2E] transition-colors shadow-sm shadow-[#FF5533]/20"
        >
          <Plus size={16} /> New Trace
        </button>
      </div>

      <div className="flex px-6 pt-3 pb-0 gap-6 border-b border-gray-100 text-sm overflow-x-auto no-scrollbar">
        {(['all', 'open', 'critical', 'escalated'] as const).map(f => {
          let count = 0;
          if (f === 'all') count = complaints.length;
          else if (f === 'open') count = complaints.filter(c => c.status === 'open' || c.status === 'in_progress').length;
          else if (f === 'critical') count = complaints.filter(c => c.severity === 'critical').length;
          else if (f === 'escalated') count = complaints.filter(c => c.status === 'escalated').length;

          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                "capitalize font-medium pb-3 border-b-2 whitespace-nowrap transition-colors",
                filter === f ? "border-[#FF5533] text-[#FF5533]" : "border-transparent text-gray-500 hover:text-gray-900"
              )}
            >
              {f} <span className="ml-1.5 text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-semibold">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto mt-2">
        {filtered.map(c => {
          const Icon = ChannelIcons[c.channel] || Mail;
          const sla = getSLAStatus(c);
          
          return (
            <div
              key={c.id}
              onClick={() => handleSelect(c.id, c.unread)}
              className={clsx(
                "mx-4 my-2 p-4 rounded-2xl cursor-pointer transition-all border outline outline-1 outline-transparent flex gap-3 relative group",
                selectedId === c.id ? "bg-[#FFF5F2] border-[#FF5533]/20 outline-[#FF5533]/10 shadow-sm" : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm"
              )}
            >
              <div className="pt-1">
                <div className={clsx("w-2.5 h-2.5 rounded-full mt-1.5 ring-2 ring-white shadow-sm", getSeverityColor(c.severity))} />
              </div>
              <div className="flex-1 min-w-0 pr-2">
                <h3 className={clsx("text-sm font-semibold truncate", c.unread ? "text-gray-900" : "text-gray-600 group-hover:text-gray-900")}>
                  {c.subject || c.category}
                </h3>
                <div className="flex items-center gap-2 text-[13px] text-gray-500 mt-1.5">
                  <span className="truncate font-medium text-gray-700">{c.customerName || c.id}</span>
                  <span className="text-gray-300">•</span>
                  <Icon size={14} className={selectedId === c.id ? "text-[#FF5533]" : "text-gray-400"} />
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-400">{formatDistanceToNow(c.timestamp, { addSuffix: true })}</span>
                </div>
              </div>
              <div className="flex flex-col items-end shrink-0 gap-2.5">
                <div className={clsx("text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wide uppercase border", 
                  sla.breached ? "bg-red-50 text-red-600 border-red-100" : 
                  sla.pct < 20 ? "bg-red-50 text-red-600 border-red-100" :
                  sla.pct < 50 ? "bg-amber-50 text-amber-600 border-amber-100" :
                  "bg-emerald-50 text-emerald-600 border-emerald-100"
                )}>
                  {sla.breached ? 'BREACHED' : sla.label}
                </div>
                {c.unread && <div className="w-2 h-2 rounded-full bg-[#FF5533] shadow-[0_0_8px_rgba(255,85,51,0.5)]" />}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="p-12 text-center text-gray-400 text-sm flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
              <AlertCircle size={28} className="text-gray-300" />
            </div>
            <p>No complaints found.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-gray-100/50">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-xl font-semibold text-gray-900 font-instrument">New Trace</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-400 hover:text-gray-900 hover:shadow-sm border border-gray-100 transition-all">
                <X size={16} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[70vh]">
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar">
                <button type="button" onClick={() => handlePreset({ customerName: 'Rajesh Mehta', accountNo: 'SB-7823', channel: 'email', severity: 'critical', category: 'Fraud', subject: 'UPI fraud ₹45,000', body: 'Someone debited ₹45,000 from my account via UPI. I did not authorize this!' })} className="px-3 py-1.5 bg-surface-2 text-xs font-medium rounded whitespace-nowrap hover:bg-border">UPI Fraud</button>
                <button type="button" onClick={() => handlePreset({ customerName: 'Priya Sharma', accountNo: 'CA-4421', channel: 'portal', severity: 'high', category: 'Loan', subject: 'Double EMI deduction', body: 'My home loan EMI was deducted twice this month.' })} className="px-3 py-1.5 bg-surface-2 text-xs font-medium rounded whitespace-nowrap hover:bg-border">Double EMI</button>
                <button type="button" onClick={() => handlePreset({ customerName: 'Amit Singh', accountNo: 'SB-9988', channel: 'branch', severity: 'critical', category: 'ATM Service', subject: 'ATM card swallowed', body: 'The ATM at MG Road swallowed my card and did not dispense cash.' })} className="px-3 py-1.5 bg-surface-2 text-xs font-medium rounded whitespace-nowrap hover:bg-border">ATM Card</button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-text-2">Customer Name</label>
                  <input type="text" className="px-3 py-2 bg-surface-2 border border-border rounded text-sm focus:outline-accent" value={newComp.customerName} onChange={e => setNewComp({...newComp, customerName: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-text-2">Account No</label>
                  <input type="text" className="px-3 py-2 bg-surface-2 border border-border rounded text-sm focus:outline-accent" value={newComp.accountNo} onChange={e => setNewComp({...newComp, accountNo: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-text-2">Channel</label>
                  <select className="px-3 py-2 bg-surface-2 border border-border rounded text-sm focus:outline-accent" value={newComp.channel} onChange={e => setNewComp({...newComp, channel: e.target.value as any})}>
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="branch">Branch</option>
                    <option value="ivr">IVR</option>
                    <option value="portal">Portal</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-text-2">Severity</label>
                  <select className="px-3 py-2 bg-surface-2 border border-border rounded text-sm focus:outline-accent" value={newComp.severity} onChange={e => setNewComp({...newComp, severity: e.target.value as any})}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-text-2">Category</label>
                  <select className="px-3 py-2 bg-surface-2 border border-border rounded text-sm focus:outline-accent" value={newComp.category} onChange={e => setNewComp({...newComp, category: e.target.value})}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1 mb-4">
                <label className="text-xs font-medium text-text-2">Subject</label>
                <input type="text" className="px-3 py-2 bg-surface-2 border border-border rounded text-sm focus:outline-accent" value={newComp.subject} onChange={e => setNewComp({...newComp, subject: e.target.value})} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-text-2">Message Body</label>
                <textarea rows={4} className="px-3 py-2 bg-surface-2 border border-border rounded text-sm resize-none focus:outline-accent" value={newComp.body} onChange={e => setNewComp({...newComp, body: e.target.value})} />
              </div>
            </div>

            <div className="p-4 border-t border-border flex justify-end gap-3 bg-surface-2">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-text-2 hover:text-text-1">Cancel</button>
              <button type="button" onClick={handleSubmit} disabled={!newComp.customerName || !newComp.subject || !newComp.body} className="px-4 py-2 bg-accent text-white text-sm font-medium rounded hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed">Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

