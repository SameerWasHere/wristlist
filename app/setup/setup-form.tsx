"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SetupForm() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleaned = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (cleaned.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }
    if (cleaned.length > 30) {
      setError("Username must be 30 characters or less");
      return;
    }

    setChecking(true);

    try {
      const res = await fetch("/api/user/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: cleaned }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setChecking(false);
        return;
      }

      // Success — redirect to dashboard
      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setChecking(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-white border border-[rgba(26,24,20,0.08)] rounded-[20px] p-6">
        <label className="block text-[11px] uppercase tracking-[2px] text-[rgba(26,24,20,0.3)] font-semibold mb-3">
          Choose your username
        </label>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[15px] text-[rgba(26,24,20,0.25)] font-medium">wristlist.com/</span>
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""));
              setError("");
            }}
            placeholder="yourname"
            maxLength={30}
            className="flex-1 px-3 py-2.5 text-[16px] font-medium border border-[rgba(26,24,20,0.1)] rounded-[12px] bg-[#f6f4ef] focus:outline-none focus:border-[rgba(138,122,90,0.4)] focus:shadow-[0_0_0_3px_rgba(138,122,90,0.08)] transition-all"
            autoFocus
          />
        </div>
        {error && (
          <p className="text-[12px] text-red-500 mb-3">{error}</p>
        )}
        <p className="text-[11px] text-[rgba(26,24,20,0.25)] mb-4">
          This is your public profile URL. Letters, numbers, hyphens, and underscores only.
        </p>
        <button
          type="submit"
          disabled={checking || username.length < 3}
          className="w-full py-3 text-[13px] font-semibold bg-[#1a1814] text-[#f6f4ef] rounded-full hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {checking ? "Setting up..." : "Continue"}
        </button>
      </div>
    </form>
  );
}
