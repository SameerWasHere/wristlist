import Link from "next/link";
import { Nav } from "@/components/nav";

const tools = [
  {
    href: "/tools/clock",
    title: "Live Clock",
    description: "Real-time precision display for setting your watch to the exact second.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    href: "/tools/moonphase",
    title: "Moon Phase",
    description: "Current lunar phase, illumination percentage, and upcoming moon dates.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    ),
  },
  {
    href: "/tools/date",
    title: "Date Corrector",
    description: "Calculate how many clicks to advance your date wheel after your watch has been sitting.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    href: "/tools/accuracy",
    title: "Accuracy Logger",
    description: "Measure your mechanical watch's daily drift against atomic time.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
  },
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-[#f6f4ef]">
      <Nav />

      <div className="max-w-[640px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <p className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-medium mb-2">
          Watch Tools
        </p>
        <h1 className="font-serif text-[32px] text-foreground mb-2">
          Essentials for Every Collector
        </h1>
        <p className="text-[15px] text-[rgba(26,24,20,0.4)] leading-relaxed mb-12">
          Free utilities designed for the mechanical watch enthusiast. No account required.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="bg-white rounded-[16px] shadow-[0_4px_24px_rgba(26,24,20,0.04)] border border-[rgba(26,24,20,0.06)] p-6 hover:-translate-y-[2px] hover:shadow-[0_8px_32px_rgba(26,24,20,0.08)] transition-all duration-300 block"
            >
              <div className="text-[#8a7a5a] mb-4">
                {tool.icon}
              </div>
              <h2 className="text-[16px] font-bold text-foreground mb-1">
                {tool.title}
              </h2>
              <p className="text-[13px] text-[rgba(26,24,20,0.4)] leading-relaxed">
                {tool.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[rgba(26,24,20,0.06)] py-12">
        <div className="max-w-[960px] mx-auto px-4 sm:px-6 text-center">
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
