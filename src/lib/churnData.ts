// src/lib/churnData.ts
import Papa from 'papaparse';
import { Customer, RiskLevel } from '../types';
import { SEED_CUSTOMERS } from './mockData';

const BRANCHES = ['Mumbai Main','Delhi Connaught','Bangalore MG Road','Chennai Anna Nagar','Pune FC Road','Hyderabad Banjara Hills','Kolkata Park Street'];
const PRODUCTS = ['savings','home_loan','fd','credit_card','insurance','mutual_fund'];

export interface ChurnRow {
  CustomerId: number;
  Surname: string;
  CreditScore: number;
  Geography: string;
  Gender: string;
  Age: number;
  Tenure: number;
  Balance: number;
  "Num Of Products": number;
  "Has Credit Card": number;
  "Is Active Member": number;
  "Estimated Salary": number;
  Churn: number;
}

function rowToCustomer(row: ChurnRow, index: number): Customer {
  // Compute churn risk score from actual data features
  let risk = 0;
  if (row["Is Active Member"] == 0) risk += 25;
  if (row["Num Of Products"] == 1) risk += 20;
  if (row.Balance < 1000) risk += 18;
  if (row.CreditScore < 600) risk += 15;
  if (row.Tenure < 2) risk += 10;
  if (row.Churn == 1) risk = Math.max(risk, 72);
  risk = Math.min(100, risk);

  const riskLevel: RiskLevel = risk >= 70 ? 'critical' : risk >= 50 ? 'high' : risk >= 30 ? 'medium' : 'low';

  // Realistic churn drivers from actual features
  const drivers: string[] = [];
  if (row["Is Active Member"] == 0) drivers.push('No digital banking activity in 90 days');
  if (row["Num Of Products"] == 1) drivers.push('Single product — low relationship depth');
  if (row.Balance < 1000) drivers.push('Low balance — account dormancy risk');
  if (row.CreditScore < 600) drivers.push(`Low credit score (${row.CreditScore}) — financial stress signal`);
  if (row.Tenure < 2) drivers.push('New customer — high early-churn window');
  if (drivers.length === 0) drivers.push('Declining engagement trend');
  
  // Synthetic txn trend
  const base = row["Is Active Member"] ? (10 + row["Num Of Products"] * 6) : 8;
  const txnLast6Months = row["Is Active Member"]
    ? Array.from({ length: 6 }, () => Math.max(0, base + Math.floor(Math.random() * 5 - 2)))
    : Array.from({ length: 6 }, (_, i) => Math.max(0, base - i * 2));

  const lastActiveDays = row["Is Active Member"] 
    ? Math.floor(Math.random() * 14) + 1 
    : Math.floor(Math.random() * 91) + 30;

  // Pick branch
  const branch = BRANCHES[index % BRANCHES.length];

  // Map products
  const productList = PRODUCTS.slice(0, Math.max(1, row["Num Of Products"]));

  return {
    id: String(row.CustomerId),
    name: row.Surname,
    accountNo: `SB-${row.CustomerId.toString().slice(-4)}`,
    segment: row["Estimated Salary"] > 150000 ? 'hni' : row["Estimated Salary"] > 80000 ? 'mass_affluent' : 'retail',
    products: productList,
    churnRiskScore: risk,
    churnRiskLevel: riskLevel,
    churnDrivers: drivers.slice(0, 3),
    engagementScore: row["Is Active Member"] ? 85 : 30,
    lastActive: `${lastActiveDays} days ago`,
    txnLast6Months: txnLast6Months,
    lifetimeValue: Math.floor(row.Balance * 0.1),
    balance: row.Balance,
    creditScore: row.CreditScore,
    tenure: row.Tenure,
    geography: row.Geography,
    gender: row.Gender,
    age: row.Age,
    numOfProducts: row["Num Of Products"],
    hasCreditCard: row["Has Credit Card"] === 1,
    isActiveMember: row["Is Active Member"] === 1,
    estimatedSalary: row["Estimated Salary"],
    pendingComplaints: 0,
    recommendedAction: riskLevel === 'critical' ? 'Immediate retention call' : 'Cross-sell insurance',
    sentimentScore: row.Churn ? 0.2 : 0.7,
    phone: '+91 98765 43210',
    branch: branch,
    joinedYear: 2024 - row.Tenure
  };
}

export async function loadChurnData(): Promise<Customer[]> {
  try {
    const response = await fetch('/churn_data.csv');
    if (!response.ok) throw new Error('Failed to fetch CSV');
    const csvText = await response.text();
    
    return new Promise((resolve) => {
      Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          const rows = results.data as ChurnRow[];
          if (rows.length > 0) {
            console.log('First parsed row:', rows[0]);
          }
          const customers = rows
            .filter(r => r.CustomerId) // filter empty rows
            .map((row, index) => rowToCustomer(row, index));
          resolve(customers);
        },
        error: (err: any) => {
          console.error('CSV Parse error:', err);
          resolve(SEED_CUSTOMERS);
        }
      });
    });
  } catch (err) {
    console.error('Failed to load churn data:', err);
    return SEED_CUSTOMERS;
  }
}
