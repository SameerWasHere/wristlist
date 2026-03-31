import { WatchCard } from "./watch-card";

interface Watch {
  brand: string;
  model: string;
  reference: string;
  category: string;
  sizeMm: number;
  movement: string;
  price: number;
  imageUrl?: string;
  color?: string;
}

interface WatchGridProps {
  watches: Watch[];
}

export function WatchGrid({ watches }: WatchGridProps) {
  if (watches.length === 0) return null;

  // Find the most expensive watch for featured slot
  const sorted = [...watches].sort((a, b) => b.price - a.price);
  const featured = sorted[0];
  const rest = sorted.slice(1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Featured watch spans full width */}
      <div className="md:col-span-2">
        <WatchCard {...featured} featured />
      </div>

      {/* Rest in 2-col grid */}
      {rest.map((watch) => (
        <WatchCard key={watch.reference} {...watch} />
      ))}
    </div>
  );
}
