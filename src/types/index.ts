export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';
export type ComplaintStatus = 'open' | 'in_progress' | 'escalated' | 'resolved';
export type Channel = 'email' | 'whatsapp' | 'branch' | 'ivr' | 'portal';
export type Segment = 'retail' | 'mass_affluent' | 'sme' | 'hni';

export interface Customer {
  id: string;
  name: string;
  accountNo: string;
  segment: Segment;
  products: string[];
  churnRiskScore: number;
  churnRiskLevel: RiskLevel;
  churnDrivers: string[];
  engagementScore: number;
  lastActive: string;
  txnLast6Months: number[];
  lifetimeValue: number;
  balance?: number;
  creditScore?: number;
  tenure?: number;
  geography?: string;
  gender?: string;
  age?: number;
  numOfProducts?: number;
  hasCreditCard?: boolean;
  isActiveMember?: boolean;
  estimatedSalary?: number;
  pendingComplaints: number;
  recommendedAction: string;
  sentimentScore: number;
  phone: string;
  branch: string;
  joinedYear: number;
}

export interface Complaint {
  id: string;
  customerId?: string;
  customerName: string;
  accountNo?: string;
  subject: string;
  body: string;
  channel: Channel;
  severity: Severity;
  category: string;
  status: ComplaintStatus;
  timestamp: Date;
  slaHours: number;
  unread: boolean;
  aiAnalysis: AIAnalysis | null;
  draftResponse: string | null;
  finalResponse: string;
}

export interface AIAnalysis {
  category: string;
  subcategory: string;
  severity: Severity;
  sentimentScore: number;
  summary: string;
  keyIssues: string[];
  urgencyReason: string;
  regulatoryRisk: 'high' | 'medium' | 'low' | 'none';
  recommendedAction: string;
}

export interface TranslationTurn {
  id: string;
  speaker: 'customer' | 'agent';
  originalText: string;
  translatedText: string;
  fromLang: string;
  toLang: string;
  timestamp: Date;
}

export interface Language {
  code: string;
  label: string;
  nativeLabel: string;
}
