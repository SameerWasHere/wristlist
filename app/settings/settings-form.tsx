"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SettingsFormProps {
  currentUsername: string;
  currentDisplayName: string;
  currentBio: string;
  currentCollectingSince?: number;
}

export function SettingsForm({
  currentUsername,
  currentDisplayName,
  currentBio,
  currentCollectingSince,
}: SettingsFormProps) {
  const [username, setUsername] = useState(currentUsername);
  const [displayName, setDisplayName] = useState(currentDisplayName);
  const [bio, setBio] = useState(currentBio);
  const [collectingSince, setCollectingSince] = useState(
    currentCollectingSince ? String(currentCollectingSince) : ""
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const cleaned = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (cleaned.length < 3) {
      setMessage({ type: "error", text: "Username must be at least 3 characters" });
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: cleaned,
          displayName: displayName.trim() || cleaned,
          bio: bio.trim(),
          collectingSince: collectingSince ? parseInt(collectingSince) : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Something went wrong" });
        setSaving(false);
        return;
      }

      setMessage({ type: "success", text: "Settings saved" });
      setUsername(cleaned);
      router.refresh();
    } catch {
      setMessage({ type: "error", text: "Something went wrong" });
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Username */}
      <div>
        <label className="block text-[11px] uppercase tracking-[2px] text-[rgba(26,24,20,0.3)] font-semibold mb-2">
          Username
        </label>
        <div className="flex items-center gap-2">
          <span className="text-[14px] text-[rgba(26,24,20,0.25)] font-medium flex-shrink-0">
            wristlist.com/
          </span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
            maxLength={30}
            className="flex-1 px-3 py-2.5 text-[16px] font-medium border border-[rgba(26,24,20,0.1)] rounded-[12px] bg-[#f6f4ef] focus:outline-none focus:border-[rgba(138,122,90,0.4)] focus:shadow-[0_0_0_3px_rgba(138,122,90,0.08)] transition-all"
          />
        </div>
        <p className="text-[11px] text-[rgba(26,24,20,0.25)] mt-1">
          Letters, numbers, hyphens, underscores. This is your public profile URL.
        </p>
      </div>

      {/* Display Name */}
      <div>
        <label className="block text-[11px] uppercase tracking-[2px] text-[rgba(26,24,20,0.3)] font-semibold mb-2">
          Display Name
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="How you appear on your profile"
          maxLength={50}
          className="w-full px-3 py-2.5 text-[16px] border border-[rgba(26,24,20,0.1)] rounded-[12px] bg-[#f6f4ef] focus:outline-none focus:border-[rgba(138,122,90,0.4)] focus:shadow-[0_0_0_3px_rgba(138,122,90,0.08)] transition-all"
        />
      </div>

      {/* Bio */}
      <div>
        <label className="block text-[11px] uppercase tracking-[2px] text-[rgba(26,24,20,0.3)] font-semibold mb-2">
          Bio <span className="text-[rgba(26,24,20,0.15)]">(optional)</span>
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="A few words about your watch journey..."
          maxLength={200}
          rows={3}
          className="w-full px-3 py-2.5 text-[16px] border border-[rgba(26,24,20,0.1)] rounded-[12px] bg-[#f6f4ef] focus:outline-none focus:border-[rgba(138,122,90,0.4)] focus:shadow-[0_0_0_3px_rgba(138,122,90,0.08)] transition-all resize-none"
        />
      </div>

      {/* Collecting Since */}
      <div>
        <label className="block text-[11px] uppercase tracking-[2px] text-[rgba(26,24,20,0.3)] font-semibold mb-2">
          Collecting Since <span className="text-[rgba(26,24,20,0.15)]">(optional)</span>
        </label>
        <input
          type="number"
          value={collectingSince}
          onChange={(e) => setCollectingSince(e.target.value)}
          placeholder="e.g. 2019"
          min={1950}
          max={2099}
          className="w-full px-3 py-2.5 text-[16px] border border-[rgba(26,24,20,0.1)] rounded-[12px] bg-[#f6f4ef] focus:outline-none focus:border-[rgba(138,122,90,0.4)] focus:shadow-[0_0_0_3px_rgba(138,122,90,0.08)] transition-all"
        />
      </div>

      {/* Message */}
      {message && (
        <p className={`text-[13px] font-medium ${message.type === "success" ? "text-[#059669]" : "text-red-500"}`}>
          {message.text}
        </p>
      )}

      {/* Save */}
      <button
        type="submit"
        disabled={saving || username.length < 3}
        className="w-full py-3 text-[13px] font-semibold bg-[#1a1814] text-[#f6f4ef] rounded-full hover:opacity-90 transition-opacity disabled:opacity-40"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
