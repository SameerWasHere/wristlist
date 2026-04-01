import Link from "next/link";
import { Nav } from "@/components/nav";

export default function SignInPage() {
  return (
    <div className="min-h-screen">
      <Nav />
      <div className="max-w-[400px] mx-auto px-6 pt-24 text-center">
        <h1 className="text-[28px] font-light tracking-tight mb-2">
          Welcome to{" "}
          <span className="font-bold">WRIST</span>
          <span className="font-light">LIST</span>
        </h1>
        <p className="text-[14px] text-[rgba(26,24,20,0.4)] mb-8">
          Sign in to manage your collection and discover your collector DNA.
        </p>

        {/* Placeholder sign-in form — will be replaced with Clerk */}
        <div className="bg-white border border-[rgba(26,24,20,0.08)] rounded-[20px] p-8">
          <div className="space-y-4">
            <div>
              <label className="block text-left text-[11px] uppercase tracking-[2px] text-[rgba(26,24,20,0.3)] font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 text-[14px] border border-[rgba(26,24,20,0.1)] rounded-[12px] bg-[#f6f4ef] focus:outline-none focus:border-[rgba(138,122,90,0.4)] focus:shadow-[0_0_0_3px_rgba(138,122,90,0.08)] transition-all"
              />
            </div>
            <div>
              <label className="block text-left text-[11px] uppercase tracking-[2px] text-[rgba(26,24,20,0.3)] font-semibold mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 text-[14px] border border-[rgba(26,24,20,0.1)] rounded-[12px] bg-[#f6f4ef] focus:outline-none focus:border-[rgba(138,122,90,0.4)] focus:shadow-[0_0_0_3px_rgba(138,122,90,0.08)] transition-all"
              />
            </div>
            <button className="w-full py-3 text-[13px] font-semibold bg-[#1a1814] text-[#f6f4ef] rounded-full hover:opacity-90 transition-opacity mt-2">
              Sign In
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-[rgba(26,24,20,0.06)]">
            <p className="text-[12px] text-[rgba(26,24,20,0.3)]">
              Don&apos;t have an account?{" "}
              <span className="text-[#8a7a5a] font-semibold cursor-pointer">
                Create one
              </span>
            </p>
          </div>
        </div>

        <p className="text-[11px] text-[rgba(26,24,20,0.2)] mt-8">
          Auth powered by Clerk — coming soon.
        </p>

        <Link
          href="/"
          className="inline-block mt-4 text-[12px] text-[#8a7a5a] font-medium hover:underline"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
