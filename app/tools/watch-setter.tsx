"use client";

import { useState, useEffect } from "react";

function getMoonPhase(date: Date) {
  const knownNew = new Date(2000, 0, 6, 18, 14, 0).getTime();
  const synodic = 29.53058867;
  const diff = (date.getTime() - knownNew) / (1000 * 60 * 60 * 24);
  const phase = ((diff % synodic) + synodic) % synodic;
  const normalized = phase / synodic;

  let name: string;
  let emoji: string;
  if (normalized < 0.03 || normalized > 0.97) { name = "New Moon"; emoji = "🌑"; }
  else if (normalized < 0.22) { name = "Waxing Crescent"; emoji = "🌒"; }
  else if (normalized < 0.28) { name = "First Quarter"; emoji = "🌓"; }
  else if (normalized < 0.47) { name = "Waxing Gibbous"; emoji = "🌔"; }
  else if (normalized < 0.53) { name = "Full Moon"; emoji = "🌕"; }
  else if (normalized < 0.72) { name = "Waning Gibbous"; emoji = "🌖"; }
  else if (normalized < 0.78) { name = "Last Quarter"; emoji = "🌗"; }
  else { name = "Waning Crescent"; emoji = "🌘"; }

  const illumination = normalized <= 0.5
    ? Math.round(normalized * 2 * 100)
    : Math.round((1 - normalized) * 2 * 100);

  // Days into lunar cycle (for moon phase complication setting)
  const daysInCycle = Math.round(phase * 10) / 10;

  return { name, illumination, emoji, daysInCycle };
}

export function WatchSetterTool() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const hours12 = hours % 12 || 12;
  const ampm = hours >= 12 ? "PM" : "AM";
  const pad = (n: number) => String(n).padStart(2, "0");

  const moon = getMoonPhase(now);

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthNamesFull = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const dayName = dayNames[now.getDay()];
  const monthName = monthNames[now.getMonth()];
  const monthFull = monthNamesFull[now.getMonth()];
  const dateNum = now.getDate();
  const year = now.getFullYear();

  // Clock hand angles
  const secondAngle = seconds * 6;
  const minuteAngle = minutes * 6 + seconds * 0.1;
  const hourAngle = (hours % 12) * 30 + minutes * 0.5;

  return (
    <div className="space-y-6">

      {/* ── Time ──────────────────────────────────────── */}
      <div className="bg-white border border-[rgba(26,24,20,0.06)] rounded-[24px] p-6 sm:p-8">
        <p className="text-[10px] uppercase tracking-[3px] text-[rgba(26,24,20,0.25)] font-semibold mb-6 text-center">
          Current Time
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
          {/* Analog clock */}
          <div className="relative w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] flex-shrink-0">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {/* Outer ring */}
              <circle cx="100" cy="100" r="96" fill="none" stroke="rgba(26,24,20,0.04)" strokeWidth="1" />

              {/* Minute markers */}
              {[...Array(60)].map((_, i) => {
                const angle = (i * 6 - 90) * (Math.PI / 180);
                const isHour = i % 5 === 0;
                const r1 = isHour ? 78 : 84;
                const r2 = 90;
                return (
                  <line
                    key={i}
                    x1={100 + r1 * Math.cos(angle)}
                    y1={100 + r1 * Math.sin(angle)}
                    x2={100 + r2 * Math.cos(angle)}
                    y2={100 + r2 * Math.sin(angle)}
                    stroke={isHour ? "#1a1814" : "rgba(26,24,20,0.12)"}
                    strokeWidth={isHour ? 2.5 : 0.8}
                    strokeLinecap="round"
                  />
                );
              })}

              {/* Hour numbers */}
              {[...Array(12)].map((_, i) => {
                const num = i === 0 ? 12 : i;
                const angle = (i * 30 - 60) * (Math.PI / 180);
                return (
                  <text
                    key={i}
                    x={100 + 66 * Math.cos(angle)}
                    y={100 + 66 * Math.sin(angle)}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="text-[11px] font-semibold"
                    fill="rgba(26,24,20,0.35)"
                  >
                    {num}
                  </text>
                );
              })}

              {/* Hour hand */}
              <line
                x1="100" y1="100"
                x2={100 + 46 * Math.cos((hourAngle - 90) * Math.PI / 180)}
                y2={100 + 46 * Math.sin((hourAngle - 90) * Math.PI / 180)}
                stroke="#1a1814" strokeWidth="4" strokeLinecap="round"
              />

              {/* Minute hand */}
              <line
                x1="100" y1="100"
                x2={100 + 66 * Math.cos((minuteAngle - 90) * Math.PI / 180)}
                y2={100 + 66 * Math.sin((minuteAngle - 90) * Math.PI / 180)}
                stroke="#1a1814" strokeWidth="2.5" strokeLinecap="round"
              />

              {/* Second hand */}
              <line
                x1={100 - 18 * Math.cos((secondAngle - 90) * Math.PI / 180)}
                y1={100 - 18 * Math.sin((secondAngle - 90) * Math.PI / 180)}
                x2={100 + 78 * Math.cos((secondAngle - 90) * Math.PI / 180)}
                y2={100 + 78 * Math.sin((secondAngle - 90) * Math.PI / 180)}
                stroke="#8a7a5a" strokeWidth="1" strokeLinecap="round"
              />

              {/* Center */}
              <circle cx="100" cy="100" r="4" fill="#1a1814" />
              <circle cx="100" cy="100" r="2" fill="#8a7a5a" />
            </svg>
          </div>

          {/* Digital display */}
          <div className="flex-1 text-center sm:text-left">
            <div className="text-[48px] sm:text-[56px] font-black tracking-[-3px] leading-none text-foreground tabular-nums">
              {pad(hours12)}:{pad(minutes)}
              <span className="text-[32px] sm:text-[36px] text-[rgba(26,24,20,0.3)]">:{pad(seconds)}</span>
            </div>
            <div className="text-[14px] text-[rgba(26,24,20,0.35)] mt-2 font-medium">
              {ampm}
            </div>
            <div className="mt-3 pt-3 border-t border-[rgba(26,24,20,0.06)] inline-block">
              <span className="text-[13px] text-[rgba(26,24,20,0.3)] font-mono">
                {pad(hours)}:{pad(minutes)}:{pad(seconds)}
              </span>
              <span className="text-[11px] text-[rgba(26,24,20,0.2)] ml-2">24H</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Date & Moon Phase side by side ────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

        {/* Date & Day */}
        <div className="bg-white border border-[rgba(26,24,20,0.06)] rounded-[24px] p-6 sm:p-8 text-center">
          <p className="text-[10px] uppercase tracking-[3px] text-[rgba(26,24,20,0.25)] font-semibold mb-4">
            Date &amp; Day
          </p>

          <div className="text-[13px] text-[#8a7a5a] font-semibold tracking-wide mb-1">
            {dayName}
          </div>
          <div className="text-[64px] font-black tracking-[-4px] leading-none text-foreground">
            {dateNum}
          </div>
          <div className="text-[16px] font-medium text-[rgba(26,24,20,0.45)] mt-1">
            {monthFull} {year}
          </div>

          {/* Quick-set reference */}
          <div className="mt-5 pt-5 border-t border-[rgba(26,24,20,0.06)]">
            <div className="flex justify-center gap-6">
              <div>
                <div className="text-[9px] uppercase tracking-[2px] text-[rgba(26,24,20,0.2)] font-semibold mb-1">Day</div>
                <div className="text-[15px] font-bold text-foreground">{dayName.slice(0, 3)}</div>
              </div>
              <div className="w-px bg-[rgba(26,24,20,0.06)]" />
              <div>
                <div className="text-[9px] uppercase tracking-[2px] text-[rgba(26,24,20,0.2)] font-semibold mb-1">Date</div>
                <div className="text-[15px] font-bold text-foreground">{dateNum}</div>
              </div>
              <div className="w-px bg-[rgba(26,24,20,0.06)]" />
              <div>
                <div className="text-[9px] uppercase tracking-[2px] text-[rgba(26,24,20,0.2)] font-semibold mb-1">Month</div>
                <div className="text-[15px] font-bold text-foreground">{monthName}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Moon Phase */}
        <div className="bg-white border border-[rgba(26,24,20,0.06)] rounded-[24px] p-6 sm:p-8 text-center">
          <p className="text-[10px] uppercase tracking-[3px] text-[rgba(26,24,20,0.25)] font-semibold mb-4">
            Moon Phase
          </p>

          <div className="text-[72px] leading-none mb-3">{moon.emoji}</div>
          <div className="text-[18px] font-bold tracking-tight text-foreground">{moon.name}</div>
          <div className="text-[13px] text-[rgba(26,24,20,0.35)] mt-1">
            {moon.illumination}% illuminated
          </div>

          {/* Phase strip */}
          <div className="flex justify-center gap-2.5 mt-5">
            {["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"].map((emoji, i) => (
              <span
                key={i}
                className={`text-[18px] transition-all ${emoji === moon.emoji ? "opacity-100 scale-[1.3]" : "opacity-15"}`}
              >
                {emoji}
              </span>
            ))}
          </div>

          {/* Lunar day for complication setting */}
          <div className="mt-5 pt-5 border-t border-[rgba(26,24,20,0.06)]">
            <div className="text-[9px] uppercase tracking-[2px] text-[rgba(26,24,20,0.2)] font-semibold mb-1">
              Lunar Day
            </div>
            <div className="text-[15px] font-bold text-foreground">
              {moon.daysInCycle} <span className="text-[12px] font-normal text-[rgba(26,24,20,0.3)]">of 29.5</span>
            </div>
            <p className="text-[11px] text-[rgba(26,24,20,0.25)] mt-1">
              Set your moon phase complication to day {Math.round(moon.daysInCycle)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
