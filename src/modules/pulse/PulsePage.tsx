import { useEffect, useMemo, useState } from 'react';
import { Plus, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import StatWidget from '../../components/ui/StatWidget';
import { loadChurnData } from '../../lib/churnData';
import { useComplaintsStore } from '../../stores/complaintsStore';
import { useCustomersStore } from '../../stores/customersStore';
import { useSettingsStore } from '../../stores/settingsStore';
import CustomerPanel from './CustomerPanel';
import CustomerTable from './CustomerTable';

export default function PulsePage() {
	const agentName = useSettingsStore((state) => state.agentName);
	const { customers, setCustomers } = useCustomersStore();
	const complaints = useComplaintsStore((state) => state.complaints);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		let active = true;
		async function hydrateFromCsv() {
			if (customers.length > 12) return;
			setIsLoading(true);
			try {
				const data = await loadChurnData();
				if (active && data.length > 0) {
					setCustomers(data);
				}
			} finally {
				if (active) setIsLoading(false);
			}
		}
		hydrateFromCsv();
		return () => {
			active = false;
		};
	}, [customers.length, setCustomers]);

	const atRisk = useMemo(
		() => customers.filter((c) => c.churnRiskLevel === 'critical' || c.churnRiskLevel === 'high').length,
		[customers]
	);
	const avgScore = useMemo(() => {
		if (!customers.length) return 0;
		return Math.round(customers.reduce((sum, c) => sum + c.churnRiskScore, 0) / customers.length);
	}, [customers]);
	const actionedIds = useCustomersStore((state) => state.actionedIds);
	const actionsPending = useMemo(() => {
		return customers.filter((c) => c.churnRiskScore >= 50 && !actionedIds.has(c.id)).length;
	}, [customers, actionedIds]);
	const complaintsOpen = complaints.filter((c) => c.status !== 'resolved').length;

	return (
		<div className="flex flex-col gap-6 flex-1 min-h-0 pt-4">
			{/* Header Header */}
			<div className="flex justify-between items-end mb-2">
				<div className="flex flex-col gap-1">
					<h1 className="text-4xl font-normal text-gray-900 tracking-tight">
						Good Morning <span className="font-bold">{agentName}</span>
					</h1>
					<p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
						<span className="w-4 h-4 rounded-full border border-red-200 bg-red-50 text-red-500 flex items-center justify-center text-[10px]">!</span>
						You have <span className="font-bold text-gray-900 border-b border-gray-900">{actionsPending} pending</span> actions today!
					</p>
				</div>
				
				<div className="flex items-center gap-3">
					<button className="flex items-center gap-2 bg-[#F6F4EB] hover:bg-[#EAE6DA] border border-dashed border-gray-400 text-sm font-bold text-gray-900 px-5 py-2.5 rounded-full transition-colors">
						<div className="bg-black text-white rounded-full w-5 h-5 flex items-center justify-center">
							<Plus className="w-3.5 h-3.5" />
						</div>
						Create Request Action
					</button>
					<div className="flex items-center gap-2 bg-white text-sm font-bold text-gray-700 px-5 py-3 rounded-full shadow-sm">
						<Calendar className="w-4 h-4" />
						{format(new Date(), 'EEE, dd MMM')}
					</div>
				</div>
			</div>

			<div className="grid grid-cols-4 gap-4 shrink-0">
				<StatWidget label="At-Risk Customers" value={atRisk} color="var(--warning)" />
				<StatWidget label="Avg Churn Score" value={avgScore} color="var(--accent)" />
				<StatWidget label="Actions Pending" value={actionsPending} color="var(--accent)" />
				<StatWidget label="Complaints Open" value={complaintsOpen} color="var(--info)" />
			</div>

			<div className="grid grid-cols-[65%_35%] gap-6 min-h-0 flex-1 mt-2">
				<div className="flex flex-col min-h-0 bg-white rounded-[32px] p-6 shadow-sm border border-white">
					<CustomerTable />
				</div>
				<div className="flex flex-col min-h-0">
					{isLoading ? (
						<div className="bg-white rounded-[32px] p-6 shadow-sm border border-white flex-1 animate-pulse" />
					) : (
						<CustomerPanel />
					)}
				</div>
			</div>
		</div>
	);
}
