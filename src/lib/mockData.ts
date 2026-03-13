// src/lib/mockData.ts
import { Complaint, Customer } from '../types';
import { addHours, formatDistanceToNow } from 'date-fns';

// --- Helpers ---

export function getChurnColor(score: number): string {
  if (score >= 75) return '#EF4444'; // critical (red)
  if (score >= 50) return '#F59E0B'; // high (amber)
  if (score >= 30) return '#3B82F6'; // medium (blue)
  return '#22C55E'; // low (green)
}

export function getSLADeadline(complaint: Complaint): Date {
  return addHours(new Date(complaint.timestamp), complaint.slaHours);
}

export function getSLAStatus(complaint: Complaint): { label: string; pct: number; color: string; breached: boolean } {
  const deadline = getSLADeadline(complaint);
  const now = new Date();
  const totalDuration = complaint.slaHours * 60 * 60 * 1000;
  const elapsed = now.getTime() - new Date(complaint.timestamp).getTime();
  const remaining = deadline.getTime() - now.getTime();
  
  const pct = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  const breached = remaining < 0;

  let label = '';
  let color = '';

  if (complaint.status === 'resolved') {
    label = 'Resolved';
    color = 'bg-green-500';
    return { label, pct: 100, color, breached: false };
  }

  if (breached) {
    label = `Breached by ${formatDistanceToNow(deadline)}`;
    color = 'bg-red-500';
  } else {
    label = `${formatDistanceToNow(deadline)} remaining`;
    if (pct > 75) color = 'bg-orange-500';
    else if (pct > 50) color = 'bg-yellow-500';
    else color = 'bg-blue-500';
  }

  return { label, pct, color, breached };
}

// --- Mock Data ---

// 12 Customers
// 3 Critical (75-95), 4 High (50-74), 3 Medium (30-49), 2 Low (0-29)

export const MOCK_CUSTOMERS: Customer[] = [
  // Critical 1
  {
    id: 'CUST-001',
    name: 'Rajesh Mehta',
    accountNo: 'SB-7823',
    segment: 'mass_affluent',
    products: ['savings', 'credit_card', 'home_loan'],
    churnRiskScore: 92,
    churnRiskLevel: 'critical',
    churnDrivers: ['Unresolved fraud complaint (4 days)', 'Declining balance (-40% MoM)', 'Competitor inquiry detected'],
    engagementScore: 15,
    lastActive: '12 hours ago',
    txnLast6Months: [45, 42, 38, 31, 24, 18], // Declining
    lifetimeValue: 850000,
    pendingComplaints: 1,
    recommendedAction: 'Immediate retention call - waive fraud liability pending invest.',
    sentimentScore: 0.1,
    phone: '+91 98200 12345',
    branch: 'Mumbai Main',
    joinedYear: 2019
  },
  // Critical 2
  {
    id: 'CUST-002',
    name: 'Vikram Nair',
    accountNo: 'SB-9921',
    segment: 'hni',
    products: ['savings', 'mutual_fund', 'demat'],
    churnRiskScore: 88,
    churnRiskLevel: 'critical',
    churnDrivers: ['Large outbound transfer to HDFC', 'No RM contact in 90 days', 'FD premature closure'],
    engagementScore: 22,
    lastActive: '2 days ago',
    txnLast6Months: [120, 110, 80, 60, 40, 10], // Sharp drop
    lifetimeValue: 2400000,
    pendingComplaints: 0,
    recommendedAction: 'Schedule RM visit immediately',
    sentimentScore: 0.3,
    phone: '+91 98400 54321',
    branch: 'Kolkata Park Street',
    joinedYear: 2015
  },
  // Critical 3
  {
    id: 'CUST-003',
    name: 'Anjali Desai',
    accountNo: 'SB-8822',
    segment: 'retail',
    products: ['savings'],
    churnRiskScore: 78,
    churnRiskLevel: 'critical',
    churnDrivers: ['Repeated ATM failures', 'Branch service complaint', 'Low balance'],
    engagementScore: 10,
    lastActive: '5 days ago',
    txnLast6Months: [20, 18, 15, 12, 5, 2],
    lifetimeValue: 45000,
    pendingComplaints: 1,
    recommendedAction: 'Offer fee waiver & card replacement',
    sentimentScore: 0.2,
    phone: '+91 99999 88888',
    branch: 'Pune FC Road',
    joinedYear: 2021
  },
  // High 1
  {
    id: 'CUST-004',
    name: 'Priya Sharma',
    accountNo: 'CA-4421',
    segment: 'sme',
    products: ['current', 'od', 'pos_machine'],
    churnRiskScore: 72,
    churnRiskLevel: 'high',
    churnDrivers: ['POS settlement delays', 'High transaction failure rate'],
    engagementScore: 45,
    lastActive: '3 hours ago',
    txnLast6Months: [200, 195, 190, 180, 160, 150], // Slow decline
    lifetimeValue: 1200000,
    pendingComplaints: 1,
    recommendedAction: 'Expedite technical support for POS',
    sentimentScore: 0.4,
    phone: '+91 98765 43210',
    branch: 'Delhi Connaught',
    joinedYear: 2020
  },
  // High 2
  {
    id: 'CUST-005',
    name: 'Amit Patel',
    accountNo: 'SB-3321',
    segment: 'retail',
    products: ['savings', 'credit_card'],
    churnRiskScore: 65,
    churnRiskLevel: 'high',
    churnDrivers: ['Credit limit increase rejected', 'Interest rate query'],
    engagementScore: 50,
    lastActive: '1 day ago',
    txnLast6Months: [30, 32, 28, 25, 20, 22],
    lifetimeValue: 150000,
    pendingComplaints: 0,
    recommendedAction: 'Review credit limit eligibility manually',
    sentimentScore: 0.5,
    phone: '+91 98989 89898',
    branch: 'Ahmedabad CG Road',
    joinedYear: 2022
  },
  // High 3
  {
    id: 'CUST-006',
    name: 'Sneha Gupta',
    accountNo: 'SB-1122',
    segment: 'mass_affluent',
    products: ['savings', 'insurance'],
    churnRiskScore: 58,
    churnRiskLevel: 'high',
    churnDrivers: ['Insurance claim delay', 'Low app usage'],
    engagementScore: 40,
    lastActive: '1 week ago',
    txnLast6Months: [15, 15, 14, 12, 10, 8],
    lifetimeValue: 300000,
    pendingComplaints: 1,
    recommendedAction: 'Connect with claims department',
    sentimentScore: 0.45,
    phone: '+91 88888 77777',
    branch: 'Lucknow Hazratganj',
    joinedYear: 2018
  },
  // High 4
  {
    id: 'CUST-007',
    name: 'Rohit Verma',
    accountNo: 'SB-6655',
    segment: 'retail',
    products: ['savings'],
    churnRiskScore: 55,
    churnRiskLevel: 'high',
    churnDrivers: ['KYC update pending', 'Debit card mostly unused'],
    engagementScore: 35,
    lastActive: '10 days ago',
    txnLast6Months: [10, 10, 9, 8, 7, 5],
    lifetimeValue: 80000,
    pendingComplaints: 1,
    recommendedAction: 'Assist with video KYC',
    sentimentScore: 0.5,
    phone: '+91 77777 66666',
    branch: 'Jaipur MI Road',
    joinedYear: 2023
  },
  // Medium 1
  {
    id: 'CUST-008',
    name: 'Fatima Shaikh',
    accountNo: 'SB-5544',
    segment: 'retail',
    products: ['savings', 'fd'],
    churnRiskScore: 45,
    churnRiskLevel: 'medium',
    churnDrivers: ['FD maturity approaching', 'Branch visits decreased'],
    engagementScore: 60,
    lastActive: '3 days ago',
    txnLast6Months: [25, 25, 24, 26, 25, 24], // Stable
    lifetimeValue: 500000,
    pendingComplaints: 0,
    recommendedAction: 'Propose FD renewal with better rates',
    sentimentScore: 0.6,
    phone: '+91 99887 76655',
    branch: 'Hyderabad Banjara Hills',
    joinedYear: 2017
  },
  // Medium 2
  {
    id: 'CUST-009',
    name: 'Arjun Singh',
    accountNo: 'SB-2233',
    segment: 'mass_affluent',
    products: ['savings', 'credit_card', 'gold_loan'],
    churnRiskScore: 38,
    churnRiskLevel: 'medium',
    churnDrivers: ['Gold loan renewal due'],
    engagementScore: 65,
    lastActive: '2 days ago',
    txnLast6Months: [40, 42, 40, 38, 40, 39],
    lifetimeValue: 900000,
    pendingComplaints: 1,
    recommendedAction: 'Remind about renewal benefits',
    sentimentScore: 0.65,
    phone: '+91 91234 56789',
    branch: 'Amritsar Mall Road',
    joinedYear: 2019
  },
  // Medium 3
  {
    id: 'CUST-010',
    name: 'Kavitha Reddy',
    accountNo: 'SB-7788',
    segment: 'retail',
    products: ['savings'],
    churnRiskScore: 32,
    churnRiskLevel: 'medium',
    churnDrivers: ['Address change request'],
    engagementScore: 55,
    lastActive: '5 days ago',
    txnLast6Months: [12, 14, 12, 13, 12, 11],
    lifetimeValue: 120000,
    pendingComplaints: 0,
    recommendedAction: 'Verify address details',
    sentimentScore: 0.7,
    phone: '+91 98765 09876',
    branch: 'Chennai Anna Nagar',
    joinedYear: 2021
  },
  // Low 1
  {
    id: 'CUST-011',
    name: 'Sunita Menon',
    accountNo: 'SB-9900',
    segment: 'hni',
    products: ['savings', 'wealth_management', 'credit_card'],
    churnRiskScore: 15,
    churnRiskLevel: 'low',
    churnDrivers: [],
    engagementScore: 90,
    lastActive: '4 hours ago',
    txnLast6Months: [80, 85, 90, 88, 92, 95], // Growing
    lifetimeValue: 5500000,
    pendingComplaints: 0,
    recommendedAction: 'Offer portfolio review',
    sentimentScore: 0.9,
    phone: '+91 90000 10000',
    branch: 'Bangalore MG Road',
    joinedYear: 2010
  },
  // Low 2
  {
    id: 'CUST-012',
    name: 'Mohammed Ali',
    accountNo: 'SB-1010',
    segment: 'retail',
    products: ['savings', 'upi'],
    churnRiskScore: 10,
    churnRiskLevel: 'low',
    churnDrivers: [],
    engagementScore: 88,
    lastActive: '1 hour ago',
    txnLast6Months: [50, 52, 55, 58, 60, 65], // Growing
    lifetimeValue: 200000,
    pendingComplaints: 0,
    recommendedAction: 'None - user is happy',
    sentimentScore: 0.85,
    phone: '+91 91111 22222',
    branch: 'Mumbai Bandra',
    joinedYear: 2022
  }
];

// 8 Complaints
// 2 Critical, 2 High, 2 Medium, 2 Low
// Staggered timestamps

const NOW = new Date();

export const MOCK_COMPLAINTS: Complaint[] = [
  // Critical 1 - Rajesh Mehta (matches CUST-001)
  {
    id: 'CMP-0001',
    customerId: 'CUST-001',
    customerName: 'Rajesh Mehta',
    accountNo: 'SB-7823',
    subject: 'Unrecognized UPI Transaction - Fraud Report',
    body: 'I am extremely distressed to report a transaction of ₹45,000 via UPI that I did not authorize. It happened at 2 AM last night while I was asleep. I have already blocked my card but the money is gone! This is my hard earned savings. Please reverse this immediately or I will have to go to the police and consumer court. My trust in this bank is shaken.',
    channel: 'email',
    severity: 'critical',
    category: 'Fraud',
    status: 'open',
    timestamp: addHours(NOW, -2), // 2 hours ago
    slaHours: 4,
    unread: true,
    aiAnalysis: null,
    draftResponse: null,
    finalResponse: ''
  },
  // Critical 2 - Anjali Desai (matches CUST-003)
  {
    id: 'CMP-0002',
    customerId: 'CUST-003',
    customerName: 'Anjali Desai',
    accountNo: 'SB-8822',
    subject: 'ATM Swallowed my Card',
    body: 'I was at the FC Road branch ATM and the machine malfunctioned and swallowed my debit card. It shows "Card Captured". I have a flight tomorrow and I need cash and my card! The security guard said he cannot help. This is urgent, please help me retrieve my card or issue a new one instantly.',
    channel: 'branch',
    severity: 'critical',
    category: 'ATM Service',
    status: 'open',
    timestamp: addHours(NOW, -3),
    slaHours: 4,
    unread: true,
    aiAnalysis: null,
    draftResponse: null,
    finalResponse: ''
  },
  // High 1 - Priya Sharma (matches CUST-004)
  {
    id: 'CMP-0003',
    customerId: 'CUST-004',
    customerName: 'Priya Sharma',
    accountNo: 'CA-4421',
    subject: 'Double EMI Deduction',
    body: 'My business loan EMI was deducted twice this month! Once on the 5th and again on the 7th. This has caused a cash flow issue for my supplier payments. I tried calling customer care but waited 20 minutes with no answer. Please refund the duplicate amount of ₹24,500 immediately back to my current account.',
    channel: 'portal',
    severity: 'high',
    category: 'Loan',
    status: 'open',
    timestamp: addHours(NOW, -15), // 15 hours ago
    slaHours: 24,
    unread: true,
    aiAnalysis: null,
    draftResponse: null,
    finalResponse: ''
  },
  // High 2 - Rohit Verma (matches CUST-007)
  {
    id: 'CMP-0004',
    customerId: 'CUST-007',
    customerName: 'Rohit Verma',
    accountNo: 'SB-6655',
    subject: 'KYC Aadhaar Rejection Loop',
    body: 'I am trying to update my KYC via the video portal for the last 3 days. Every time it says "Aadhaar mismatch" even though details differ only by a space in my name. I visited the branch and they said do it online. Why is this so difficult? My account is at risk of freezing. Please resolve manually.',
    channel: 'ivr',
    severity: 'high',
    category: 'KYC',
    status: 'open',
    timestamp: addHours(NOW, -20),
    slaHours: 24,
    unread: true,
    aiAnalysis: null,
    draftResponse: null,
    finalResponse: ''
  },
  // Medium 1 - Arjun Singh
  {
    id: 'CMP-0005',
    customerId: 'CUST-009',
    customerName: 'Arjun Singh',
    accountNo: 'SB-2233',
    subject: 'Net Banking Session Timeout',
    body: 'Your net banking portal keeps logging me out every 2 minutes. I cannot complete my fund transfer. Is there a system issue? It is very annoying. I have tried Chrome and Edge browsers.',
    channel: 'portal',
    severity: 'medium',
    category: 'Digital Channels',
    status: 'open',
    timestamp: addHours(NOW, -40),
    slaHours: 72,
    unread: false,
    aiAnalysis: null,
    draftResponse: null,
    finalResponse: ''
  },
  // Medium 2 - Fatima Shaikh
  {
    id: 'CMP-0006',
    customerId: 'CUST-008',
    customerName: 'Fatima Shaikh',
    accountNo: 'SB-5544',
    subject: 'FD Premature Closure Query',
    body: 'I want to close my FD ending in 9988 prematurely. What will be the penalty charges? The website FAQ is unclear. Please email me the calculation.',
    channel: 'email',
    severity: 'medium',
    category: 'Fixed Deposit',
    status: 'open',
    timestamp: addHours(NOW, -45),
    slaHours: 72,
    unread: false,
    aiAnalysis: null,
    draftResponse: null,
    finalResponse: ''
  },
  // Low 1 - Kavitha Reddy
  {
    id: 'CMP-0007',
    customerId: 'CUST-010',
    customerName: 'Kavitha Reddy',
    accountNo: 'SB-7788',
    subject: 'Address Update Request',
    body: 'I have moved to a new flat in Anna Nagar. Please update my communication address. I have attached the electricity bill as proof in the previous mail.',
    channel: 'email',
    severity: 'low',
    category: 'Service Request',
    status: 'open',
    timestamp: addHours(NOW, -90),
    slaHours: 168,
    unread: false,
    aiAnalysis: null,
    draftResponse: null,
    finalResponse: ''
  },
  // Low 2 - Mohammed Ali
  {
    id: 'CMP-0008',
    customerId: 'CUST-012',
    customerName: 'Mohammed Ali',
    accountNo: 'SB-1010',
    subject: 'Account Statement Request',
    body: 'Please send me the account statement for the last financial year for tax filing purposes. PDF format preferred.',
    channel: 'portal',
    severity: 'low',
    category: 'Service Request',
    status: 'open',
    timestamp: addHours(NOW, -100),
    slaHours: 168,
    unread: false,
    aiAnalysis: null,
    draftResponse: null,
    finalResponse: ''
  }
];

export const SEED_COMPLAINTS = MOCK_COMPLAINTS;
export const SEED_CUSTOMERS = MOCK_CUSTOMERS;
