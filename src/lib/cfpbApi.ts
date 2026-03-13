// src/lib/cfpbApi.ts
import { Complaint, Severity, Channel } from '../types';
import { SEED_COMPLAINTS } from './mockData';

const CFPB_BASE = 'https://www.consumerfinance.gov/data-research/consumer-complaints/search/api/v1/';

// Map Indian banking categories to CFPB product filters
const CATEGORY_MAP: Record<string, string> = {
  'ATM/Debit Card':       'Checking or savings account',
  'Loan Grievance':       'Mortgage',
  'Fraud/Unauthorized':   'Checking or savings account',
  'Credit Card':          'Credit card or prepaid card',
  'Net Banking':          'Checking or savings account',
  'General':              'Bank account or service',
};

export interface CFPBComplaint {
  complaint_id: string;
  product: string;
  issue: string;
  consumer_complaint_narrative: string;
  company: string;
  date_received: string;
  state: string;
  submitted_via: string;
}

export async function fetchComplaints(
  category: string = 'Checking or savings account',
  size: number = 20
): Promise<CFPBComplaint[]> {
  const params = new URLSearchParams({
    product: CATEGORY_MAP[category] || category,
    has_narrative: 'true',
    size: String(size),
    sort: 'created_date_desc',
  });

  const res = await fetch(`${CFPB_BASE}?${params}`);
  if (!res.ok) throw new Error('Failed to fetch complaints');
  const data = await res.json();
  return data.hits?.hits?.map((h: any) => h._source) ?? [];
}

// Transform CFPB complaint → our Complaint type
export function transformComplaint(cfpb: CFPBComplaint, index: number): Complaint {
  // Map CFPB issue → our severity
  const severityMap: Record<string, Severity> = {
    'Fraud or scam': 'critical',
    'Unauthorized transactions/Unauthorized transfers': 'critical',
    'Problem with a lender or other company charging your account': 'high',
    'Closing an account': 'high',
    'Managing an account': 'medium',
    'Opening an account': 'low',
  };

  // Map submitted_via → our Channel
  const channelMap: Record<string, Channel> = {
    'Web': 'portal',
    'Phone': 'ivr',
    'Referral': 'branch',
    'Email': 'email',
    'Postal mail': 'email',
    'Fax': 'email',
  };

  // Indian bank names for display realism
  // const indianBankNames = ['Union Bank of India', 'State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Bank of Baroda'];
  const indianCustomerNames = [
    'Rajesh Mehta', 'Priya Sharma', 'Sunil Patil', 'Fatima Shaikh',
    'Vikram Nair', 'Anita Desai', 'Ravi Kumar', 'Sunita Gupta',
    'Mohammed Ansari', 'Deepika Iyer', 'Arjun Singh', 'Kavitha Reddy',
  ];

  const severity = severityMap[cfpb.issue] ?? 
    (['critical', 'high', 'medium', 'medium', 'low'][index % 5] as Severity);

  return {
    id: `CMP-${String(index + 1).padStart(4, '0')}`,
    customerName: indianCustomerNames[index % indianCustomerNames.length],
    accountNo: `SB-${Math.floor(1000 + Math.random() * 9000)}`,
    subject: cfpb.issue || 'Banking Service Complaint',
    body: cfpb.consumer_complaint_narrative
      ?.replace(/X{2,}/g, '[REDACTED]')   // CFPB redacts with XXX
      .slice(0, 800) ?? 'Complaint text unavailable',
    channel: channelMap[cfpb.submitted_via] ?? 'portal',
    severity,
    category: cfpb.product,
    status: 'open',
    timestamp: new Date(cfpb.date_received || Date.now()),
    slaHours: { critical: 4, high: 24, medium: 72, low: 168 }[severity],
    unread: true,
    aiAnalysis: null,
    draftResponse: null,
    finalResponse: '',
  };
}

// Called at app startup — loads real complaints into store
export async function loadInitialComplaints(): Promise<Complaint[]> {
  try {
    // Fetch across multiple categories for variety
    const [checking, mortgage, cards] = await Promise.all([
      fetchComplaints('Checking or savings account', 8),
      fetchComplaints('Mortgage', 5),
      fetchComplaints('Credit card or prepaid card', 5),
    ]);

    return [...checking, ...mortgage, ...cards]
      .filter(c => c.consumer_complaint_narrative?.length > 50) // must have real text
      .slice(0, 15)
      .map(transformComplaint);
  } catch (err) {
    console.error('CFPB API failed, falling back to seed data', err);
    return SEED_COMPLAINTS; // fallback defined below
  }
}
