// deleted
import { motion } from 'framer-motion';

interface SentimentBarProps {
  score: number;
  showLabel?: boolean;
}

export default function SentimentBar({ score, showLabel = true }: SentimentBarProps) {
  let color = 'var(--success)';
  let label = 'Positive';
  
  if (score < 35) {
    color = 'var(--danger)';
    label = 'Very Negative';
  } else if (score <= 65) {
    color = 'var(--warning)';
    label = 'Neutral';
  }

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="h-[6px] w-full bg-gray-200 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      {showLabel && (
        <div 
          className="font-['DM_Mono'] text-[11px] font-medium"
          style={{ color }}
        >
          {score}/100 · {label}
        </div>
      )}
    </div>
  );
}
