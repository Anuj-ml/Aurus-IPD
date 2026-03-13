import { useState } from 'react';
import { AlertTriangle, Sparkles } from 'lucide-react';
import AIStreamText from '../../components/ui/AIStreamText';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import { geminiComplete } from '../../lib/gemini';
import { groqComplete, PROMPT_CUSTOMER_SUMMARY } from '../../lib/groq';
import { useCustomersStore } from '../../stores/customersStore';
import { useSettingsStore } from '../../stores/settingsStore';
import ChurnRiskGauge from './ChurnRiskGauge';
import EngagementChart from './EngagementChart';

function getScoreColor(score: number) {
	if (score >= 70) return '#EF4444';
	if (score >= 50) return '#F59E0B';
	return '#22C55E';
}

export default function CustomerPanel() {
	const { customers, selectedId, markActioned } = useCustomersStore();
	const geminiKey = useSettingsStore((state) => state.geminiKey);
	const actionedIds = useCustomersStore((state) => state.actionedIds);
	const customer = customers.find((c) => c.id === selectedId);
	const [insight, setInsight] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	if (!customer) {
		return (
			<Card className="h-full" title="Customer Panel">
				<div style={{ color: 'var(--text-3)' }}>Select a customer to view details.</div>
			</Card>
		);
	}

	const isActioned = actionedIds.has(customer.id);

	async function handleGenerateInsight() {
		if (!geminiKey) {
			setInsight('Add Gemini key in Settings');
			return;
		}
		setIsLoading(true);
		setInsight('');
		try {
			const summary = await geminiComplete(
				geminiKey,
				`Generate a concise 2-sentence retention brief for ${customer.name}. Risk score: ${customer.churnRiskScore}. Drivers: ${customer.churnDrivers.join(', ')}.`
			);
			setInsight(summary);
		} catch {
			setInsight('Unable to generate AI insight right now.');
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<Card className="h-full overflow-hidden" title="Customer Details">
			<div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', flex: 1, paddingRight: 4 }}>
				<div>
					<div style={{ fontSize: 20, fontWeight: 600 }}>{customer.name}</div>
					<div style={{ color: 'var(--text-3)', fontFamily: 'DM Mono, monospace', fontSize: 12 }}>{customer.accountNo}</div>
					<div style={{ marginTop: 8 }}>
						<Badge variant="custom" color="var(--border-2)">{customer.segment}</Badge>
					</div>
				</div>

				<ChurnRiskGauge score={customer.churnRiskScore} color={getScoreColor(customer.churnRiskScore)} />

				<div>
					<div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 8 }}>Why at risk:</div>
					<div style={{ display: 'grid', gap: 8 }}>
						{customer.churnDrivers.map((d, i) => (
							<div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: 'var(--surface-2)', borderRadius: 10, padding: '8px 10px' }}>
								<AlertTriangle size={14} color="var(--accent)" style={{ marginTop: 2 }} />
								<div style={{ fontSize: 13 }}>{d}</div>
							</div>
						))}
					</div>
				</div>

				<EngagementChart data={customer.txnLast6Months} />

				<div style={{ background: 'var(--accent-bg)', borderLeft: '4px solid var(--accent)', borderRadius: 10, padding: 12 }}>
					<div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--text-2)', marginBottom: 6 }}>Recommended Action</div>
					<div style={{ fontWeight: 500, marginBottom: 10 }}>{customer.recommendedAction}</div>
					<button
						onClick={() => markActioned(customer.id)}
						disabled={isActioned}
						style={{
							borderRadius: 999,
							border: isActioned ? 'none' : '1px solid var(--accent)',
							background: isActioned ? 'var(--accent)' : 'white',
							color: '#111',
							padding: '6px 12px',
							cursor: isActioned ? 'default' : 'pointer',
						}}
					>
						{isActioned ? '✓ Actioned' : '✓ Mark Actioned'}
					</button>
				</div>

				<div>
					<button
						onClick={handleGenerateInsight}
						style={{
							border: '1px solid var(--accent)',
							background: 'white',
							borderRadius: 999,
							padding: '8px 12px',
							cursor: 'pointer',
							display: 'inline-flex',
							alignItems: 'center',
							gap: 6,
							marginBottom: 10,
						}}
					>
						<Sparkles size={14} color="var(--accent)" />
						Generate AI Insight
					</button>
					<AIStreamText text={insight} isStreaming={isLoading} placeholder="AI summary will appear here" />
				</div>
			</div>
		</Card>
	);
}

