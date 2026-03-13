import { useEffect, useMemo, useState } from 'react';

interface ChurnRiskGaugeProps {
	score: number;
	color: string;
}

export default function ChurnRiskGauge({ score, color }: ChurnRiskGaugeProps) {
	const [displayScore, setDisplayScore] = useState(0);

	useEffect(() => {
		const timer = setTimeout(() => setDisplayScore(score), 60);
		return () => clearTimeout(timer);
	}, [score]);

	const radius = 84;
	const circumference = Math.PI * radius;
	const progress = useMemo(() => Math.max(0, Math.min(100, displayScore)), [displayScore]);
	const dashOffset = circumference * (1 - progress / 100);

	return (
		<div style={{ width: 220, margin: '0 auto', position: 'relative' }}>
			<svg viewBox="0 0 220 130" width="220" height="130" aria-label="Churn risk gauge">
				<path d="M 26 110 A 84 84 0 0 1 194 110" fill="none" stroke="var(--border-2)" strokeWidth="16" />
				<path
					d="M 26 110 A 84 84 0 0 1 194 110"
					fill="none"
					stroke={color}
					strokeWidth="16"
					strokeLinecap="round"
					strokeDasharray={circumference}
					strokeDashoffset={dashOffset}
					style={{ transition: 'stroke-dashoffset 900ms ease' }}
				/>
			</svg>
			<div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', alignContent: 'center', transform: 'translateY(14px)' }}>
				<div style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, fontSize: 36 }}>{score}</div>
				<div style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)' }}>Risk Score</div>
			</div>
		</div>
	);
}
