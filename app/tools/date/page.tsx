import Link from "next/link";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getCalendarGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = getDaysInMonth(year, month);
  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = Array(firstDay).fill(null);

  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

export default function DateCorrectorPage() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const dayOfWeek = now.toLocaleDateString("en-US", { weekday: "long" });
  const monthName = now.toLocaleDateString("en-US", { month: "long" });
  const weeks = getCalendarGrid(year, month);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Build quick-set table: if your watch shows date X, advance Y clicks
  const daysInMonth = getDaysInMonth(year, month);
  const quickSetEntries: { wrongDate: number; clicks: number }[] = [];
  for (let d = 1; d <= 31; d++) {
    if (d === today) continue;
    const clicks = d < today
      ? today - d
      : (daysInMonth - d) + today; // wrap around
    quickSetEntries.push({ wrongDate: d, clicks });
  }

  return (
    <div className="min-h-screen bg-[#f6f4ef]">
      <Nav />

      <div className="max-w-[640px] mx-auto px-6 py-16">
        <Link
          href="/tools"
          className="text-[12px] text-[#8a7a5a] hover:text-[#6b5b3a] transition-colors"
        >
          &larr; Back to Tools
        </Link>

        <div className="mt-8 mb-12">
          <p className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-medium mb-2">
            Date Corrector
          </p>
          <h1 className="font-serif text-[28px] text-foreground">
            Set Your Date Wheel
          </h1>
        </div>

        {/* Today's date display */}
        <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(26,24,20,0.04)] border border-[rgba(26,24,20,0.06)] p-10 text-center">
          <p className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-medium mb-1">
            Today
          </p>
          <p className="text-[16px] text-[#8a7a5a] font-medium mb-2">{dayOfWeek}</p>
          <p className="font-serif text-[72px] leading-none text-foreground">{today}</p>
          <p className="font-serif text-[24px] text-[rgba(26,24,20,0.4)] mt-2">
            {monthName} {year}
          </p>
        </div>

        {/* Calendar */}
        <div className="mt-8 bg-white rounded-[20px] shadow-[0_4px_24px_rgba(26,24,20,0.04)] border border-[rgba(26,24,20,0.06)] p-8">
          <p className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-medium mb-4 text-center">
            {monthName} {year}
          </p>
          <div className="grid grid-cols-7 gap-1 text-center">
            {dayNames.map((d) => (
              <div key={d} className="text-[11px] text-[rgba(26,24,20,0.3)] font-medium py-2">
                {d}
              </div>
            ))}
            {weeks.flat().map((day, i) => (
              <div
                key={i}
                className={`text-[14px] py-2 rounded-lg ${
                  day === today
                    ? "bg-[#1a1814] text-[#f6f4ef] font-bold"
                    : day
                    ? "text-foreground"
                    : ""
                }`}
              >
                {day ?? ""}
              </div>
            ))}
          </div>
        </div>

        {/* Quick set table */}
        <div className="mt-8 bg-white rounded-[20px] shadow-[0_4px_24px_rgba(26,24,20,0.04)] border border-[rgba(26,24,20,0.06)] p-8">
          <p className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-medium mb-2">
            Quick Set Guide
          </p>
          <p className="text-[13px] text-[rgba(26,24,20,0.4)] mb-6 leading-relaxed">
            If your watch has been sitting and shows the wrong date, find it below to see how many
            times to advance the date wheel.
          </p>
          <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
            {quickSetEntries.map(({ wrongDate, clicks }) => (
              <div
                key={wrongDate}
                className="text-center p-2 rounded-lg bg-[rgba(26,24,20,0.02)] border border-[rgba(26,24,20,0.04)]"
              >
                <p className="text-[13px] font-medium text-foreground">{wrongDate}</p>
                <p className="text-[11px] text-[#8a7a5a]">+{clicks}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[rgba(26,24,20,0.25)] mt-4 text-center">
            Top number = date your watch shows. Bottom number = clicks to advance.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-medium mb-3">
            Go Further
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 text-[13px] font-semibold bg-[#1a1814] text-[#f6f4ef] rounded-full hover:opacity-90 transition-opacity"
          >
            Track your watches on WristList
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
