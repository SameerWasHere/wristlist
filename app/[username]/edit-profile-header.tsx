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
        className="px-4 py-2 text-[12px] font-semibold border border-[rgba(26,24,20,0.12)] rounded-full text-[rgba(26,24,20,0.5)] hover:border-[rgba(26,24,20,0.25)] hover:text-foreground transition-colors flex items-center gap-1.5"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        Edit
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20"
        onClick={() => setEditing(false)}
      />

      {/* Modal */}
      <div className="relative bg-white border border-[rgba(26,24,20,0.08)] rounded-[20px] p-6 shadow-[0_12px_48px_rgba(26,24,20,0.15)] w-full max-w-[420px]">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-[16px] font-bold">Edit Profile</h3>
          <button
            onClick={() => {
              setEditing(false);
              setDisplayName(currentDisplayName);
              setBio(currentBio);
              setCollectingSince(currentCollectingSince ? String(currentCollectingSince) : "");
            }}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[rgba(26,24,20,0.04)] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[rgba(26,24,20,0.4)]">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
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
              className="w-full px-3 py-2.5 text-[16px] border border-[rgba(26,24,20,0.1)] rounded-[12px] bg-[#f6f4ef] focus:outline-none focus:border-[rgba(138,122,90,0.4)] transition-all"
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
              className="w-full px-3 py-2.5 text-[16px] border border-[rgba(26,24,20,0.1)] rounded-[12px] bg-[#f6f4ef] focus:outline-none focus:border-[rgba(138,122,90,0.4)] transition-all resize-none"
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
              className="w-full px-3 py-2.5 text-[16px] border border-[rgba(26,24,20,0.1)] rounded-[12px] bg-[#f6f4ef] focus:outline-none focus:border-[rgba(138,122,90,0.4)] transition-all"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 text-[13px] font-semibold bg-[#1a1814] text-[#f6f4ef] rounded-full hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
