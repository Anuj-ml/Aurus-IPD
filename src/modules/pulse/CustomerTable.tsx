import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import { useCustomersStore } from '../../stores/customersStore';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function getScoreColor(score: number) {
	if (score >= 70) return '#EF4444';
	if (score >= 50) return '#F59E0B';
	return '#22C55E';
}

export default function CustomerTable() {
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 12;

	const {
		customers,
		filter,
		selectedId,
		sortBy,
		sortDir,
		actionedIds,
		setFilter,
		setSelected,
		setSortBy,
		toggleSortDir,
		markActioned,
	} = useCustomersStore();

	const filtered = customers.filter((c) => {
		if (filter === 'critical') return c.churnRiskLevel === 'critical';
		if (filter === 'high') return c.churnRiskLevel === 'high';
		if (filter === 'actioned') return actionedIds.has(c.id);
		return true;
	});

	const sorted = [...filtered].sort((a, b) => {
		const m = sortDir === 'asc' ? 1 : -1;
		if (sortBy === 'lastActive') return m * a.lastActive.localeCompare(b.lastActive);
		return m * ((a[sortBy] as number) - (b[sortBy] as number));
	});

	// Reset page when filter changes
	useEffect(() => {
		setCurrentPage(1);
	}, [filter]);

	const totalPages = Math.ceil(sorted.length / itemsPerPage);
	const paginated = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

	const tabCount = (tab: 'all' | 'critical' | 'high' | 'actioned') => {
		if (tab === 'all') return customers.length;
		if (tab === 'critical') return customers.filter((c) => c.churnRiskLevel === 'critical').length;
		if (tab === 'high') return customers.filter((c) => c.churnRiskLevel === 'high').length;
		return actionedIds.size;
	};

	return (
		<Card padding="0" className="h-full overflow-hidden">
			<div style={{ padding: 16, display: 'flex', gap: 8, borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
				{(['all', 'critical', 'high', 'actioned'] as const).map((tab) => (
					<button
						key={tab}
						onClick={() => setFilter(tab)}
						style={{
							border: 'none',
							borderRadius: 999,
							padding: '6px 10px',
							background: filter === tab ? 'var(--accent)' : 'var(--surface-2)',
							color: filter === tab ? '#111' : 'var(--text-2)',
							fontSize: 12,
							cursor: 'pointer',
						}}
					>
						{tab} ({tabCount(tab)})
					</button>
				))}
			</div>

			<div style={{ flex: 1, overflowX: 'auto', overflowY: 'auto', minHeight: 0 }}>
				<table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 1000 }}>
					<thead style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1, boxShadow: '0 1px 0 var(--border)' }}>
						<tr style={{ textAlign: 'left', whiteSpace: 'nowrap' }}>
							<th style={{ padding: '12px 16px', fontWeight: 600 }}>Customer</th>
							<th style={{ padding: '12px 16px', fontWeight: 600 }}>Age</th>
							<th style={{ padding: '12px 16px', fontWeight: 600 }}>Tenure</th>
							<th style={{ padding: '12px 16px', fontWeight: 600, cursor: 'pointer' }} onClick={() => (sortBy === ('balance' as any) ? toggleSortDir() : setSortBy('balance' as any))}>Balance</th>
							<th style={{ padding: '12px 16px', fontWeight: 600 }}>Products</th>
							<th style={{ padding: '12px 16px', fontWeight: 600 }}>Salary</th>
							<th style={{ padding: '12px 16px', fontWeight: 600, cursor: 'pointer' }} onClick={() => (sortBy === ('creditScore' as any) ? toggleSortDir() : setSortBy('creditScore' as any))}>Credit Score</th>
							<th style={{ padding: '12px 16px', fontWeight: 600, cursor: 'pointer' }} onClick={() => (sortBy === 'churnRiskScore' ? toggleSortDir() : setSortBy('churnRiskScore'))}>Churn Risk</th>
							<th style={{ padding: '12px 16px', fontWeight: 600 }}>Action</th>
						</tr>
					</thead>
					<tbody>
						{paginated.map((c) => {
							const color = getScoreColor(c.churnRiskScore);
							const selected = selectedId === c.id;
							const actioned = actionedIds.has(c.id);
							return (
								<tr
									key={c.id}
									onClick={() => setSelected(c.id)}
									style={{
										borderBottom: '1px solid var(--border)',
										background: selected ? 'var(--accent-bg)' : 'transparent',
										cursor: 'pointer',
										whiteSpace: 'nowrap'
									}}
								>
									<td style={{ padding: '12px 16px' }}>
										<div style={{ fontWeight: 500 }}>{c.name}</div>
										<div style={{ fontFamily: 'DM Mono, monospace', color: 'var(--text-3)', fontSize: 12 }}>{c.accountNo}</div>
									</td>
									<td style={{ padding: '12px 16px' }}>{c.age}</td>
									<td style={{ padding: '12px 16px' }}>{c.tenure} yrs</td>
									<td style={{ padding: '12px 16px', fontFamily: 'DM Mono, monospace' }}>
										{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(c.balance || 0)}
									</td>
									<td style={{ padding: '12px 16px' }}>{c.numOfProducts}</td>
									<td style={{ padding: '12px 16px', fontFamily: 'DM Mono, monospace' }}>
										{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(c.estimatedSalary || 0)}
									</td>
									<td style={{ padding: '12px 16px' }}>
										<span style={{
											display: 'inline-flex',
											alignItems: 'center',
											justifyContent: 'center',
											padding: '2px 8px',
											borderRadius: 999,
											background: (c.creditScore || 0) < 600 ? 'var(--error-bg)' : 'var(--surface-2)',
											color: (c.creditScore || 0) < 600 ? 'auto' : 'var(--text-2)',
											fontWeight: 500,
											fontSize: 12
										}}>
											{c.creditScore}
										</span>
									</td>
									<td style={{ padding: '12px 16px' }}>
										<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
											<div style={{ width: 80, height: 6, borderRadius: 999, background: 'var(--border-2)' }}>
												<div style={{ width: `${c.churnRiskScore}%`, height: 6, borderRadius: 999, background: color }} />
											</div>
											<span style={{ fontFamily: 'DM Mono, monospace', color }}>{c.churnRiskScore}</span>
										</div>
									</td>
									<td style={{ padding: '12px 16px' }}>
										{actioned ? (
											<span style={{ color: 'var(--success)' }}>✓</span>
										) : c.churnRiskLevel === 'critical' || c.churnRiskLevel === 'high' ? (
											<button
												onClick={(e) => {
													e.stopPropagation();
													markActioned(c.id);
												}}
												style={{
													border: 'none',
													borderRadius: 999,
													padding: '4px 10px',
													background: 'var(--accent)',
													color: '#111',
													cursor: 'pointer',
													fontSize: 12,
												}}
											>
												Call Now
											</button>
										) : null}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			{totalPages > 1 && (
				<div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', background: 'white' }}>
					<div style={{ fontSize: 13, color: 'var(--text-2)' }}>
						Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sorted.length)} of {sorted.length} entries
					</div>
					<div style={{ display: 'flex', gap: 4 }}>
						<button
							onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
							disabled={currentPage === 1}
							style={{
								padding: '4px 8px',
								border: '1px solid var(--border)',
								background: currentPage === 1 ? 'var(--surface-2)' : 'white',
								borderRadius: 6,
								cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
								display: 'flex',
								alignItems: 'center',
								opacity: currentPage === 1 ? 0.5 : 1
							}}
						>
							<ChevronLeft size={16} />
						</button>
						<span style={{ padding: '4px 12px', fontSize: 13, display: 'flex', alignItems: 'center' }}>
							Page {currentPage} of {totalPages}
						</span>
						<button
							onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
							disabled={currentPage === totalPages}
							style={{
								padding: '4px 8px',
								border: '1px solid var(--border)',
								background: currentPage === totalPages ? 'var(--surface-2)' : 'white',
								borderRadius: 6,
								cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
								display: 'flex',
								alignItems: 'center',
								opacity: currentPage === totalPages ? 0.5 : 1
							}}
						>
							<ChevronRight size={16} />
						</button>
					</div>
				</div>
			)}
		</Card>
	);
}
