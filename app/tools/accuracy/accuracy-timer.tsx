"use client";

import { useState, useEffect, useRef } from "react";

export function AccuracyTimer() {
  const [running, setRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [now, setNow] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 200);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (running && startTime) {
      intervalRef.current = setInterval(() => {
        setElapsed(Date.now() - startTime);
      }, 200);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, startTime]);

  const handleStart = () => {
    setStartTime(Date.now());
    setElapsed(0);
    setRunning(true);
  };

  const handleStop = () => {
    setRunning(false);
  };

  const handleReset = () => {
    setRunning(false);
    setStartTime(null);
    setElapsed(0);
  };

  const formatElapsed = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const seconds = now ? now.getSeconds().toString().padStart(2, "0") : "--";
  const ms = now ? Math.floor(now.getMilliseconds() / 100) : 0;

  return (
    <div>
      {/* Reference seconds display */}
      <div className="text-center mb-10">
        <p className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-medium mb-3">
          Reference Seconds
        </p>
        <div className="flex items-baseline justify-center">
          <span className="font-serif text-[80px] leading-none text-[#8a7a5a] tabular-nums">
            {seconds}
          </span>
          <span className="text-[20px] text-[rgba(26,24,20,0.2)] ml-1 tabular-nums">.{ms}</span>
        </div>
        <p className="text-[12px] text-[rgba(26,24,20,0.25)] mt-2">
          Match your watch&apos;s second hand to this display
        </p>
      </div>

      {/* Timer */}
      <div className="border-t border-[rgba(26,24,20,0.06)] pt-8">
        <p className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-medium mb-3 text-center">
          Elapsed Time
        </p>
        <p className="text-center font-serif text-[36px] text-foreground tabular-nums">
          {formatElapsed(elapsed)}
        </p>

        <div className="flex justify-center gap-3 mt-6">
          {!running ? (
            <button
              onClick={handleStart}
              className="px-6 py-2.5 text-[13px] font-semibold bg-[#1a1814] text-[#f6f4ef] rounded-full hover:opacity-90 transition-opacity"
            >
              {startTime ? "Resume" : "Start Timer"}
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="px-6 py-2.5 text-[13px] font-semibold bg-[#8a7a5a] text-[#f6f4ef] rounded-full hover:opacity-90 transition-opacity"
            >
              Stop
            </button>
          )}
          {(startTime || elapsed > 0) && (
            <button
              onClick={handleReset}
              className="px-6 py-2.5 text-[13px] font-medium text-[rgba(26,24,20,0.4)] border border-[rgba(26,24,20,0.1)] rounded-full hover:bg-[rgba(26,24,20,0.03)] transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
