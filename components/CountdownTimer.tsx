import React, { useState, useEffect } from 'react';

const CountdownTimer: React.FC = () => {
  // Initialize with 12 hours for demo purposes
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        // Loop back to start for the demo effect
        return { hours: 12, minutes: 0, seconds: 0 }; 
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const format = (num: number) => num.toString().padStart(2, '0');

  return (
    <span className="inline-flex items-center gap-1 font-mono font-bold bg-white/20 px-2 py-0.5 rounded text-xs ml-2 tabular-nums">
      <span>{format(timeLeft.hours)}</span>:
      <span>{format(timeLeft.minutes)}</span>:
      <span>{format(timeLeft.seconds)}</span>
    </span>
  );
};

export default CountdownTimer;