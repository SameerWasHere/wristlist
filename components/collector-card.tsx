import Link from "next/link";

interface CollectorCardProps {
  name: string;
  archetype: string;
  watchCount: number;
  score: number;
  value: string;
  tags: string[];
  avatarColor?: string;
  href?: string;
}

export function CollectorCard({
  name,
  archetype,
  watchCount,
  score,
  value,
  tags,
  avatarColor = "#8a7a5a",
  href = "/sameer",
}: CollectorCardProps) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <Link href={href} className="block bg-white rounded-[20px] shadow-[0_4px_24px_rgba(26,24,20,0.04)] border border-[rgba(26,24,20,0.06)] p-5 min-w-[200px] sm:min-w-[220px] hover:-translate-y-[3px] hover:shadow-[0_12px_48px_rgba(26,24,20,0.12)] transition-all duration-300 cursor-pointer no-underline text-inherit">
      {/* Avatar + identity */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}88)`,
          }}
        >
          <span className="text-white font-bold text-[16px]">{initial}</span>
        </div>
        <div>
          <p className="text-[15px] font-bold text-foreground leading-tight">{name}</p>
          <p className="text-[12px] font-serif italic text-[#8a7a5a]">{archetype}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 mb-4 text-center">
        <div className="flex-1">
          <p className="text-[16px] font-black text-foreground leading-none">{watchCount}</p>
          <p className="text-[9px] uppercase tracking-wider text-[rgba(26,24,20,0.4)] mt-1">
            Watches
          </p>
        </div>
        <div className="w-px h-6 bg-[rgba(26,24,20,0.06)]" />
        <div className="flex-1">
          <p className="text-[16px] font-black text-foreground leading-none">{score}</p>
          <p className="text-[9px] uppercase tracking-wider text-[rgba(26,24,20,0.4)] mt-1">
            Score
          </p>
        </div>
        <div className="w-px h-6 bg-[rgba(26,24,20,0.06)]" />
        <div className="flex-1">
          <p className="text-[16px] font-black text-foreground leading-none">{value}</p>
          <p className="text-[9px] uppercase tracking-wider text-[rgba(26,24,20,0.4)] mt-1">
            Value
          </p>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 text-[10px] font-medium rounded-full bg-[rgba(26,24,20,0.04)] text-[rgba(26,24,20,0.4)]"
          >
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
