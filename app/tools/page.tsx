import { Nav } from "@/components/nav";
import { WatchSetterTool } from "./watch-setter";

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-[#f6f4ef]">
      <Nav />

      <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <p className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-medium mb-2 text-center">
          Watch Tools
        </p>
        <h1 className="font-serif italic text-[28px] sm:text-[36px] text-foreground mb-2 text-center tracking-tight">
          Set Your Watch
        </h1>
        <p className="text-[14px] text-[rgba(26,24,20,0.4)] leading-relaxed mb-10 text-center max-w-md mx-auto">
          Everything you need to set the time, date, and moon phase complication on your watch.
        </p>

        <WatchSetterTool />
      </div>

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
