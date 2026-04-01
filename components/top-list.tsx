interface TopListItem {
  rank: number;
  name: string;
  detail: string;
  count: number;
  brand: string;
  initial: string;
  imageUrl?: string | null;
}

interface TopListProps {
  title: string;
  subtitle: string;
  items: TopListItem[];
}

export function TopList({ title, subtitle, items }: TopListProps) {
  return (
    <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(26,24,20,0.04)] border border-[rgba(26,24,20,0.06)] overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-6 pt-5 sm:pt-6 pb-4">
        <h3 className="text-[18px] font-bold text-foreground">{title}</h3>
        <p className="text-[13px] text-[rgba(26,24,20,0.4)] mt-0.5">{subtitle}</p>
      </div>

      {/* Ranked list */}
      <div>
        {items.map((item) => {
          const isGold = item.rank <= 2;
          return (
            <div
              key={item.rank}
              className="flex items-center gap-3 sm:gap-4 px-3 sm:px-6 py-3 sm:py-3.5 border-t border-[rgba(26,24,20,0.06)] hover:bg-[rgba(26,24,20,0.015)] transition-colors"
            >
              {/* Rank */}
              <span
                className={`text-[15px] font-bold w-6 text-center ${
                  isGold ? "text-[#8a7a5a]" : "text-[rgba(26,24,20,0.25)]"
                }`}
              >
                {item.rank}
              </span>

              {/* Thumb */}
              <div className="w-9 h-9 rounded-[9px] bg-gradient-to-br from-[#0a0a0a] to-[#1a1a20] flex items-center justify-center flex-shrink-0 overflow-hidden">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain p-0.5" />
                ) : (
                  <span className="text-white/30 text-[13px] font-bold">{item.initial}</span>
                )}
              </div>

              {/* Name + detail */}
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-foreground truncate">{item.name}</p>
                <p className="text-[11px] text-[rgba(26,24,20,0.4)] truncate">{item.detail}</p>
              </div>

              {/* Count */}
              <span className="text-[11px] sm:text-[13px] font-bold text-[rgba(26,24,20,0.3)] flex-shrink-0">
                {item.count.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
