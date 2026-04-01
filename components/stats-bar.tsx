interface Stat {
  label: string;
  value: string;
  accent?: string;
}

interface StatsBarProps {
  stats: Stat[];
}

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="grid grid-cols-3 rounded-[18px] bg-[rgba(26,24,20,0.06)] gap-px overflow-hidden">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col items-center justify-center py-3 sm:py-4 bg-background"
        >
          <span
            className="text-[18px] sm:text-[22px] font-black tracking-tight leading-none"
            style={stat.accent ? { color: stat.accent } : undefined}
          >
            {stat.value}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-[rgba(26,24,20,0.4)] font-medium mt-1.5">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
}
