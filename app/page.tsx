import { Nav } from "@/components/nav";
import { TopList } from "@/components/top-list";
import { CollectorCard } from "@/components/collector-card";
import { CtaBanner } from "@/components/cta-banner";
import { HeroSection } from "./hero-section";

const mostCollected = [
  { rank: 1, name: "Rolex Submariner Date", detail: "126610LN · Diver · 41mm", count: 4823, brand: "Rolex", initial: "R" },
  { rank: 2, name: "Omega Speedmaster Moonwatch", detail: "310.30.42.50.01.001 · Chronograph · 42mm", count: 3941, brand: "Omega", initial: "O" },
  { rank: 3, name: "Tudor Black Bay 58", detail: "M79030N-0001 · Diver · 39mm", count: 2817, brand: "Tudor", initial: "T" },
  { rank: 4, name: "Seiko Prospex Alpinist", detail: "SPB121 · Field · 39.5mm", count: 2204, brand: "Seiko", initial: "S" },
  { rank: 5, name: "Cartier Tank Must", detail: "WSTA0065 · Dress · 33.7mm", count: 1956, brand: "Cartier", initial: "C" },
];

const mostWishlisted = [
  { rank: 1, name: "Grand Seiko Shunbun", detail: "SBGA413 · Dress · 40mm", count: 3102, brand: "Grand Seiko", initial: "G" },
  { rank: 2, name: "Omega Seamaster 300M", detail: "210.30.42.20.03.001 · Diver · 42mm", count: 2670, brand: "Omega", initial: "O" },
  { rank: 3, name: "Nomos Tangente 2date", detail: "135 · Dress · 37.5mm", count: 1843, brand: "Nomos", initial: "N" },
  { rank: 4, name: "Tissot PRX Powermatic 80", detail: "T137.407.11.041.00 · Dress · 40mm", count: 1521, brand: "Tissot", initial: "T" },
  { rank: 5, name: "Sinn 556 I B", detail: "556.010 · Field · 38.5mm", count: 1389, brand: "Sinn", initial: "S" },
];

const featuredCollectors = [
  { name: "James K.", archetype: "The Purist", watchCount: 12, score: 87, value: "$48k", tags: ["Swiss Made", "Mechanical", "Diver"], avatarColor: "#4a6741" },
  { name: "Sarah M.", archetype: "The Eclectic", watchCount: 23, score: 94, value: "$31k", tags: ["Vintage", "Dress", "Japanese"], avatarColor: "#8a5a5a" },
  { name: "David R.", archetype: "The Strategist", watchCount: 8, score: 78, value: "$62k", tags: ["Investment", "Limited Edition", "Rolex"], avatarColor: "#5a6a8a" },
  { name: "Mika T.", archetype: "The Explorer", watchCount: 17, score: 91, value: "$22k", tags: ["Tool Watch", "Field", "Micro-brand"], avatarColor: "#8a7a5a" },
];

const tools = [
  { icon: "clock", title: "Beat Counter", description: "Measure your watch's beats per hour with your phone's microphone" },
  { icon: "moon", title: "Moon Phase", description: "Current moon phase and next moonphase complication alignment" },
  { icon: "calendar", title: "Date Corrector", description: "Calculate date-wheel adjustments after your watch has been sitting" },
  { icon: "target", title: "Accuracy Log", description: "Track daily drift and rate consistency over time" },
];

const recentActivity = [
  { user: "Alex P.", action: "added", watch: "Omega Speedmaster Moonwatch", time: "2 min ago" },
  { user: "Jordan L.", action: "wishlisted", watch: "Grand Seiko Shunbun SBGA413", time: "8 min ago" },
  { user: "Taylor R.", action: "added", watch: "Tudor Black Bay 58", time: "14 min ago" },
  { user: "Morgan S.", action: "added", watch: "Casio G-Shock CasiOak", time: "23 min ago" },
  { user: "Casey W.", action: "wishlisted", watch: "Cartier Tank Must", time: "31 min ago" },
];

function ToolIcon({ type }: { type: string }) {
  if (type === "clock") {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    );
  }
  if (type === "moon") {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    );
  }
  if (type === "calendar") {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    );
  }
  // target
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f6f4ef]">
      <Nav />

      {/* Hero */}
      <HeroSection />

      {/* Top Lists */}
      <section id="top-lists" className="max-w-[960px] mx-auto px-6 py-16 scroll-mt-16">
        <p className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-medium mb-6">
          Top Lists
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TopList
            title="Most Collected"
            subtitle="Watches owned by the most collectors"
            items={mostCollected}
          />
          <TopList
            title="Most Wishlisted"
            subtitle="The watches everyone wants next"
            items={mostWishlisted}
          />
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-[960px] mx-auto px-6 pb-16">
        <CtaBanner />
      </section>

      {/* Featured Collectors */}
      <section id="collectors" className="max-w-[960px] mx-auto px-6 pb-16 scroll-mt-16">
        <p className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-medium mb-6">
          Featured Collectors
        </p>
        <div className="flex gap-5 overflow-x-auto pb-4 -mx-6 px-6 snap-x">
          {featuredCollectors.map((c) => (
            <div key={c.name} className="snap-start flex-shrink-0">
              <CollectorCard
                name={c.name}
                archetype={c.archetype}
                watchCount={c.watchCount}
                score={c.score}
                value={c.value}
                tags={c.tags}
                avatarColor={c.avatarColor}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Watch Tools */}
      <section id="tools" className="max-w-[960px] mx-auto px-6 pb-16 scroll-mt-16">
        <p className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-medium mb-6">
          Watch Tools
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tools.map((tool) => (
            <div
              key={tool.title}
              className="bg-white rounded-[16px] shadow-[0_4px_24px_rgba(26,24,20,0.04)] border border-[rgba(26,24,20,0.06)] p-5 hover:-translate-y-[2px] hover:shadow-[0_8px_32px_rgba(26,24,20,0.08)] transition-all duration-300 cursor-pointer"
            >
              <div className="text-[#8a7a5a] mb-3">
                <ToolIcon type={tool.icon} />
              </div>
              <h3 className="text-[14px] font-bold text-foreground mb-1">{tool.title}</h3>
              <p className="text-[12px] text-[rgba(26,24,20,0.4)] leading-relaxed">{tool.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="max-w-[960px] mx-auto px-6 pb-16">
        <p className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-medium mb-6">
          Recent Activity
        </p>
        <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(26,24,20,0.04)] border border-[rgba(26,24,20,0.06)] overflow-hidden">
          {recentActivity.map((item, i) => (
            <div
              key={i}
              className={`flex items-center gap-4 px-6 py-4 ${i > 0 ? "border-t border-[rgba(26,24,20,0.06)]" : ""}`}
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-[rgba(26,24,20,0.06)] flex items-center justify-center flex-shrink-0">
                <span className="text-[13px] font-bold text-[rgba(26,24,20,0.3)]">
                  {item.user.charAt(0)}
                </span>
              </div>
              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-[14px] text-foreground truncate">
                  <span className="font-semibold">{item.user}</span>
                  {" "}
                  <span className="text-[rgba(26,24,20,0.4)]">{item.action}</span>
                  {" "}
                  <span className="font-medium">{item.watch}</span>
                </p>
              </div>
              {/* Time */}
              <span className="text-[12px] text-[rgba(26,24,20,0.3)] flex-shrink-0">{item.time}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgba(26,24,20,0.06)] py-12">
        <div className="max-w-[960px] mx-auto px-6 text-center">
          <p className="text-[15px] font-light tracking-[4px] uppercase text-foreground">
            <strong className="font-bold">WRIST</strong>LIST
          </p>
          <p className="text-[14px] font-serif italic text-[rgba(26,24,20,0.3)] mt-2">
            Every collection tells a story.
          </p>
        </div>
      </footer>
    </div>
  );
}
