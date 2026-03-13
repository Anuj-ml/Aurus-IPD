interface EngagementChartProps {
	data: number[];
}

export default function EngagementChart({ data }: EngagementChartProps) {
	const series = [...data].reverse();
	const max = Math.max(...series, 1);
	const width = 300;
	const height = 120;

	const points = series
		.map((value, index) => {
			const x = (index / Math.max(series.length - 1, 1)) * width;
			const y = height - (value / max) * (height - 16) - 8;
			return `${x},${y}`;
		})
		.join(' ');

	const areaPath = `M 0 ${height} L ${points} L ${width} ${height} Z`;

	return (
		<div style={{ marginTop: 8 }}>
			<div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 8 }}>Transaction Activity - Last 6 Months</div>
			<svg viewBox={`0 0 ${width} ${height}`} width="100%" height="200" preserveAspectRatio="none">
				<defs>
					<linearGradient id="amberFill" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
						<stop offset="100%" stopColor="var(--accent)" stopOpacity="0.04" />
					</linearGradient>
				</defs>
				<path d={areaPath} fill="url(#amberFill)" />
				<polyline points={points} fill="none" stroke="var(--accent)" strokeWidth="2" />
			</svg>
		</div>
	);
}
