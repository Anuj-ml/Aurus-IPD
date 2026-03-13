import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { differenceInMinutes } from 'date-fns';

interface SLATimerProps {
  deadline: Date;
  slaHours: number;
}

export default function SLATimer({ deadline, slaHours }: SLATimerProps) {
  const [, setTick] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const now = new Date();
  const diffMins = differenceInMinutes(deadline, now);
  const totalMins = slaHours * 60;
  
  const pctRemaining = Math.max(0, Math.min(100, (diffMins / totalMins) * 100));
  const isBreached = diffMins < 0;
  const isCritical = !isBreached && diffMins <= 120; // < 2 hours

  let color = 'bg-green-500';
  if (isBreached || pctRemaining <= 20) {
    color = 'bg-red-500';
  } else if (pctRemaining <= 50) {
    color = 'bg-amber-500';
  }

  const formatTime = (mins: number) => {
    const absMins = Math.abs(mins);
    const h = Math.floor(absMins / 60);
    const m = absMins % 60;
    return `${h}h ${m}m`;
  };

  const label = isBreached 
    ? `BREACHED by ${formatTime(diffMins)}`
    : `${formatTime(diffMins)} remaining`;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between">
        <span className={clsx(
          "text-xs font-semibold tracking-wide",
          isBreached ? "text-red-600" : "text-gray-600",
          isCritical && "flex items-center gap-2"
        )}>
          {isCritical && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
          {label}
        </span>
      </div>
      
      <div className="h-[4px] w-full bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={clsx("h-full rounded-full transition-all duration-1000", color)}
          style={{ width: `${isBreached ? 100 : pctRemaining}%` }}
        />
      </div>
    </div>
  );
}
