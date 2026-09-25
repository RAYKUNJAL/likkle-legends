import React, { useState, useEffect } from 'react';

type Props = {
  /** ISO timestamp from server/CMS. Timer renders only while this is in the future. */
  endDate?: string | null;
};

const CountdownTimer: React.FC<Props> = ({ endDate }) => {
  const end = endDate ? new Date(endDate) : null;
  const valid = end && !Number.isNaN(end.getTime()) && end.getTime() > Date.now();
  const [remainingMs, setRemainingMs] = useState(() =>
    valid && end ? end.getTime() - Date.now() : 0
  );

  useEffect(() => {
    if (!valid || !end) return;
    const timer = setInterval(() => {
      setRemainingMs(end.getTime() - Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, [valid, endDate]);

  if (!valid || remainingMs <= 0) return null;

  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const format = (num: number) => num.toString().padStart(2, '0');

  return (
    <span className="inline-flex items-center gap-1 font-mono font-bold bg-white/20 px-2 py-0.5 rounded text-xs ml-2 tabular-nums">
      <span>{format(hours)}</span>:
      <span>{format(minutes)}</span>:
      <span>{format(seconds)}</span>
    </span>
  );
};

export default CountdownTimer;
