"use client";

import { useState, useEffect } from "react";

// Moon phase calculation
function getMoonPhase(date: Date): { name: string; illumination: number; emoji: string } {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Known new moon: Jan 6, 2000 18:14 UTC
  const knownNew = new Date(2000, 0, 6, 18, 14, 0).getTime();
  const synodic = 29.53058867;
  const diff = (date.getTime() - knownNew) / (1000 * 60 * 60 * 24);
  const phase = ((diff % synodic) + synodic) % synodic;
  const normalized = phase / synodic; // 0-1

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

  return { name, illumination, emoji };
}

export function WatchToolsLive() {
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
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const dayName = dayNames[now.getDay()];
  const monthName = monthNames[now.getMonth()];
  const dateNum = now.getDate();
  const year = now.getFullYear();

  // Clock hand angles
  const secondAngle = seconds * 6; // 360/60
  const minuteAngle = minutes * 6 + seconds * 0.1;
  const hourAngle = (hours % 12) * 30 + minutes * 0.5;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

      {/* Time */}
      <div className="bg-white border border-[rgba(26,24,20,0.06)] rounded-[20px] p-6 text-center relative overflow-hidden">
        {/* Analog clock face */}
        <div className="relative w-[140px] h-[140px] mx-auto mb-4">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {/* Outer ring */}
            <circle cx="100" cy="100" r="95" fill="none" stroke="rgba(26,24,20,0.06)" strokeWidth="1" />
            <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(26,24,20,0.03)" strokeWidth="0.5" />

            {/* Hour markers */}
            {[...Array(12)].map((_, i) => {
              const angle = (i * 30 - 90) * (Math.PI / 180);
              const isMain = i % 3 === 0;
              const r1 = isMain ? 76 : 80;
              const r2 = 88;
              return (
                <line
                  key={i}
                  x1={100 + r1 * Math.cos(angle)}
                  y1={100 + r1 * Math.sin(angle)}
                  x2={100 + r2 * Math.cos(angle)}
                  y2={100 + r2 * Math.sin(angle)}
                  stroke={isMain ? "#1a1814" : "rgba(26,24,20,0.2)"}
                  strokeWidth={isMain ? 2.5 : 1}
                  strokeLinecap="round"
                />
              );
            })}

            {/* Hour hand */}
            <line
              x1="100" y1="100"
              x2={100 + 50 * Math.cos((hourAngle - 90) * Math.PI / 180)}
              y2={100 + 50 * Math.sin((hourAngle - 90) * Math.PI / 180)}
              stroke="#1a1814" strokeWidth="3.5" strokeLinecap="round"
            />

            {/* Minute hand */}
            <line
              x1="100" y1="100"
              x2={100 + 68 * Math.cos((minuteAngle - 90) * Math.PI / 180)}
              y2={100 + 68 * Math.sin((minuteAngle - 90) * Math.PI / 180)}
              stroke="#1a1814" strokeWidth="2" strokeLinecap="round"
            />

            {/* Second hand */}
            <line
              x1={100 - 15 * Math.cos((secondAngle - 90) * Math.PI / 180)}
              y1={100 - 15 * Math.sin((secondAngle - 90) * Math.PI / 180)}
              x2={100 + 75 * Math.cos((secondAngle - 90) * Math.PI / 180)}
              y2={100 + 75 * Math.sin((secondAngle - 90) * Math.PI / 180)}
              stroke="#8a7a5a" strokeWidth="1" strokeLinecap="round"
            />

            {/* Center dot */}
            <circle cx="100" cy="100" r="3" fill="#1a1814" />
            <circle cx="100" cy="100" r="1.5" fill="#8a7a5a" />
          </svg>
        </div>

        {/* Digital readout */}
        <div className="font-mono">
          <div className="text-[32px] font-black tracking-[-2px] leading-none text-foreground">
            {pad(hours12)}:{pad(minutes)}:{pad(seconds)}
          </div>
          <div className="text-[11px] text-[rgba(26,24,20,0.3)] mt-1 font-semibold tracking-wide">
            {ampm} &middot; {pad(hours)}:{pad(minutes)} 24H
          </div>
        </div>
      </div>

      {/* Moon Phase */}
      <div className="bg-white border border-[rgba(26,24,20,0.06)] rounded-[20px] p-6 text-center">
        <div className="text-[64px] leading-none mb-3">{moon.emoji}</div>
        <div className="text-[18px] font-bold tracking-tight text-foreground">{moon.name}</div>
        <div className="text-[12px] text-[rgba(26,24,20,0.35)] mt-1">
          {moon.illumination}% illuminated
        </div>

        {/* Mini moon phase strip */}
        <div className="flex justify-center gap-2 mt-4">
          {["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"].map((emoji, i) => (
            <span
              key={i}
              className={`text-[16px] ${emoji === moon.emoji ? "opacity-100 scale-125" : "opacity-20"} transition-all`}
            >
              {emoji}
            </span>
          ))}
        </div>
      </div>

      {/* Date & Day */}
      <div className="bg-white border border-[rgba(26,24,20,0.06)] rounded-[20px] p-6 text-center flex flex-col justify-center">
        <div className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.25)] font-semibold mb-1">
          {dayName}
        </div>
        <div className="text-[56px] font-black tracking-[-3px] leading-none text-foreground">
          {dateNum}
        </div>
        <div className="text-[15px] font-medium text-[rgba(26,24,20,0.5)] mt-1">
          {monthName} {year}
        </div>

        {/* Quick reference for date wheel */}
        <div className="mt-4 pt-4 border-t border-[rgba(26,24,20,0.06)]">
          <div className="text-[9px] uppercase tracking-[2px] text-[rgba(26,24,20,0.25)] font-semibold mb-2">
            Quick Set
          </div>
          <div className="text-[12px] text-[rgba(26,24,20,0.4)]">
            Day: <span className="font-bold text-foreground">{dayName.slice(0, 3).toUpperCase()}</span>
            {" "}&middot;{" "}
            Date: <span className="font-bold text-foreground">{dateNum}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
