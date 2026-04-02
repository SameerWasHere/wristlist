"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface EditProfileHeaderProps {
  currentDisplayName: string;
  currentBio: string;
  currentCollectingSince?: number;
}

export function EditProfileHeader({
  currentDisplayName,
  currentBio,
  currentCollectingSince,
}: EditProfileHeaderProps) {
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(currentDisplayName);
  const [bio, setBio] = useState(currentBio);
  const [collectingSince, setCollectingSince] = useState(
    currentCollectingSince ? String(currentCollectingSince) : ""
  );
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: undefined, // don't change username from here
          displayName: displayName.trim(),
          bio: bio.trim(),
          collectingSince: collectingSince ? parseInt(collectingSince) : null,
        }),
      });
      if (res.ok) {
        setEditing(false);
        router.refresh();
      }
    } catch {
      // silent
    }
    setSaving(false);
  };

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-[rgba(26,24,20,0.04)] hover:bg-[rgba(26,24,20,0.08)] transition-colors"
        title="Edit profile"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[rgba(26,24,20,0.35)]">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="absolute top-0 left-0 right-0 bg-white border border-[rgba(26,24,20,0.08)] rounded-[20px] p-5 shadow-[0_8px_32px_rgba(26,24,20,0.1)] z-10">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[14px] font-bold">Edit Profile</h3>
        <button
          onClick={() => {
            setEditing(false);
            setDisplayName(currentDisplayName);
            setBio(currentBio);
            setCollectingSince(currentCollectingSince ? String(currentCollectingSince) : "");
          }}
          className="text-[12px] text-[rgba(26,24,20,0.4)] hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-[11px] uppercase tracking-[2px] text-[rgba(26,24,20,0.3)] font-semibold mb-1.5">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-3 py-2 text-[16px] border border-[rgba(26,24,20,0.1)] rounded-[10px] bg-[#f6f4ef] focus:outline-none focus:border-[rgba(138,122,90,0.4)] transition-all"
            maxLength={50}
          />
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-[2px] text-[rgba(26,24,20,0.3)] font-semibold mb-1.5">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A few words about your watch journey..."
            className="w-full px-3 py-2 text-[16px] border border-[rgba(26,24,20,0.1)] rounded-[10px] bg-[#f6f4ef] focus:outline-none focus:border-[rgba(138,122,90,0.4)] transition-all resize-none"
            rows={3}
            maxLength={200}
          />
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-[2px] text-[rgba(26,24,20,0.3)] font-semibold mb-1.5">
            Collecting Since
          </label>
          <input
            type="number"
            value={collectingSince}
            onChange={(e) => setCollectingSince(e.target.value)}
            placeholder="e.g. 2019"
            min={1950}
            max={2099}
            className="w-full px-3 py-2 text-[16px] border border-[rgba(26,24,20,0.1)] rounded-[10px] bg-[#f6f4ef] focus:outline-none focus:border-[rgba(138,122,90,0.4)] transition-all"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2.5 text-[13px] font-semibold bg-[#1a1814] text-[#f6f4ef] rounded-full hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
