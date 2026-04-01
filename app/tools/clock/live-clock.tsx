"use client";

import { useEffect, useState } from "react";

export function LiveClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 100);
    return () => clearInterval(interval);
  }, []);

  if (!time) {
    return (
      <div className="text-center py-16">
        <p className="text-[rgba(26,24,20,0.3)] text-[14px]">Loading...</p>
      </div>
    );
  }

  const hours12 = time.getHours() % 12 || 12;
  const hours24 = time.getHours();
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const seconds = time.getSeconds().toString().padStart(2, "0");
  const ms = Math.floor(time.getMilliseconds() / 100);
  const ampm = time.getHours() >= 12 ? "PM" : "AM";

  return (
    <div className="text-center">
      {/* 12-hour display */}
      <div className="mb-2">
        <p className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-medium mb-3">
          12-Hour
        </p>
        <div className="flex items-baseline justify-center gap-1">
          <span className="font-serif text-[72px] leading-none text-foreground tabular-nums">
            {hours12}
          </span>
          <span className="font-serif text-[72px] leading-none text-[rgba(26,24,20,0.2)]">:</span>
          <span className="font-serif text-[72px] leading-none text-foreground tabular-nums">
            {minutes}
          </span>
          <span className="font-serif text-[72px] leading-none text-[rgba(26,24,20,0.2)]">:</span>
          <span className="font-serif text-[72px] leading-none text-[#8a7a5a] tabular-nums">
            {seconds}
          </span>
          <span className="text-[14px] text-[rgba(26,24,20,0.3)] ml-1 tabular-nums">.{ms}</span>
          <span className="text-[18px] font-medium text-[rgba(26,24,20,0.3)] ml-2">{ampm}</span>
        </div>
      </div>

      {/* 24-hour display */}
      <div className="mt-8">
        <p className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-medium mb-3">
          24-Hour
        </p>
        <div className="flex items-baseline justify-center gap-1">
          <span className="font-serif text-[48px] leading-none text-[rgba(26,24,20,0.5)] tabular-nums">
            {hours24.toString().padStart(2, "0")}
          </span>
          <span className="font-serif text-[48px] leading-none text-[rgba(26,24,20,0.15)]">:</span>
          <span className="font-serif text-[48px] leading-none text-[rgba(26,24,20,0.5)] tabular-nums">
            {minutes}
          </span>
          <span className="font-serif text-[48px] leading-none text-[rgba(26,24,20,0.15)]">:</span>
          <span className="font-serif text-[48px] leading-none text-[#8a7a5a] tabular-nums opacity-70">
            {seconds}
          </span>
        </div>
      </div>

      {/* Date line */}
      <p className="mt-8 text-[14px] text-[rgba(26,24,20,0.3)]">
        {time.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      <p className="mt-6 text-[12px] text-[rgba(26,24,20,0.25)] leading-relaxed max-w-[400px] mx-auto">
        This clock uses your device&apos;s system time. For the highest accuracy, ensure your
        device syncs with a network time server.
      </p>
    </div>
  );
}
