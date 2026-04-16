import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[rgba(26,24,20,0.06)] py-12">
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 text-center">
        <Link href="/" className="text-[15px] font-light tracking-[4px] uppercase text-foreground hover:opacity-70 transition-opacity">
          <strong className="font-bold">WRIST</strong>LIST
        </Link>
        <p className="text-[14px] font-serif italic text-[rgba(26,24,20,0.3)] mt-2">
          Every collection tells a story.
        </p>
      </div>
    </footer>
  );
}
