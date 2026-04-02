"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface InlineEditProps {
  value: string;
  placeholder: string;
  onSave: (value: string) => Promise<boolean>;
  type?: "text" | "textarea" | "number";
  className?: string;
  emptyClassName?: string;
}

export function InlineEdit({
  value,
  placeholder,
  onSave,
  type = "text",
  className = "",
  emptyClassName = "",
}: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  const save = useCallback(async () => {
    setSaving(true);
    const ok = await onSave(draft.trim());
    setSaving(false);
    if (ok) setEditing(false);
  }, [draft, onSave]);

  if (!editing) {
    return (
      <span className="group cursor-pointer inline" onClick={() => { setDraft(value); setEditing(true); }}>
        {value ? (
          <span className={className}>{value}</span>
        ) : (
          <span className={`${emptyClassName} italic`}>{placeholder}</span>
        )}
        <span className="inline-flex ml-1 opacity-0 group-hover:opacity-100 transition-opacity align-middle">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#8a7a5a]">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 w-full">
      {type === "textarea" ? (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          rows={2}
          autoFocus
          onKeyDown={(e) => { if (e.key === "Escape") { setDraft(value); setEditing(false); } }}
          className="flex-1 px-2 py-1 text-[16px] border border-[rgba(138,122,90,0.4)] rounded-[8px] bg-white focus:outline-none resize-none min-w-0"
        />
      ) : (
        <input
          type={type === "number" ? "number" : "text"}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") { setDraft(value); setEditing(false); }
          }}
          className="flex-1 px-2 py-1 text-[16px] border border-[rgba(138,122,90,0.4)] rounded-[8px] bg-white focus:outline-none min-w-0"
        />
      )}
      <button onClick={save} disabled={saving} className="text-[11px] font-semibold text-[#8a7a5a] hover:text-[#6b5b3a] flex-shrink-0 disabled:opacity-40">
        {saving ? "..." : "Save"}
      </button>
      <button onClick={() => { setDraft(value); setEditing(false); }} className="text-[11px] text-[rgba(26,24,20,0.3)] hover:text-foreground flex-shrink-0">
        Cancel
      </button>
    </span>
  );
}

interface EditableProfileProps {
  username: string;
  displayName: string;
  bio: string;
  collectingSince?: number;
  avatarUrl?: string;
  children?: React.ReactNode;
}

export function EditableProfileHeader({
  username,
  displayName,
  bio,
  collectingSince,
  avatarUrl,
}: EditableProfileProps) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const initial = (displayName || username).charAt(0).toUpperCase();

  const save = useCallback(async (field: string, value: string) => {
    setErr(null);
    const body: Record<string, unknown> = {};
    if (field === "username") {
      const clean = value.toLowerCase().replace(/[^a-z0-9_-]/g, "");
      if (clean.length < 3) { setErr("Username must be at least 3 characters"); return false; }
      body.username = clean;
    }
    if (field === "displayName") body.displayName = value || username;
    if (field === "bio") body.bio = value;
    if (field === "collectingSince") body.collectingSince = value ? parseInt(value) : null;

    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setErr(d.error || "Failed to save");
        return false;
      }
      if (field === "username") {
        // Username changed — redirect to new profile URL
        const d = await res.json().catch(() => ({}));
        window.location.href = `/${d.user?.username || value}`;
        return true;
      }
      router.refresh();
      return true;
    } catch {
      setErr("Something went wrong");
      return false;
    }
  }, [router, username]);

  return (
    <div className="flex items-start gap-4 flex-1">
      {/* Avatar */}
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={displayName}
          className="w-[56px] h-[56px] sm:w-[64px] sm:h-[64px] rounded-full object-cover flex-shrink-0 border border-[rgba(26,24,20,0.08)]"
        />
      ) : (
        <div className="w-[56px] h-[56px] sm:w-[64px] sm:h-[64px] rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-[#1a1814] to-[#2a2a30] text-white font-bold text-[20px] sm:text-[24px]">
          {initial}
        </div>
      )}

      <div className="min-w-0 flex-1">
        {/* Display Name — editable */}
        <h1 className="text-[22px] sm:text-[28px] font-black tracking-tighter leading-none mb-0.5">
          <InlineEdit
            value={displayName}
            placeholder="Add display name"
            onSave={(v) => save("displayName", v)}
            className="text-[22px] sm:text-[28px] font-black tracking-tighter"
            emptyClassName="text-[rgba(26,24,20,0.2)] text-[18px] font-normal"
          />
        </h1>

        {/* Username — editable */}
        <p className="text-[13px] text-[rgba(26,24,20,0.35)] mb-2">
          @<InlineEdit
            value={username}
            placeholder="username"
            onSave={(v) => save("username", v)}
            className="text-[13px] text-[rgba(26,24,20,0.35)]"
            emptyClassName="text-[rgba(26,24,20,0.15)]"
          />
          {collectingSince ? (
            <span>
              {" "}&middot; Collecting since{" "}
              <InlineEdit
                value={String(collectingSince)}
                placeholder="year"
                onSave={(v) => save("collectingSince", v)}
                type="number"
                className="text-[13px] text-[rgba(26,24,20,0.35)]"
                emptyClassName="text-[rgba(26,24,20,0.15)]"
              />
            </span>
          ) : (
            <span>
              {" "}&middot;{" "}
              <InlineEdit
                value=""
                placeholder="Add collecting since year"
                onSave={(v) => save("collectingSince", v)}
                type="number"
                className="text-[13px] text-[rgba(26,24,20,0.35)]"
                emptyClassName="text-[rgba(26,24,20,0.15)] text-[12px]"
              />
            </span>
          )}
        </p>

        {/* Bio — editable */}
        <div className="max-w-[420px]">
          <InlineEdit
            value={bio}
            placeholder="Add a bio — tell people about your watch journey"
            onSave={(v) => save("bio", v)}
            type="textarea"
            className="text-[14px] text-[rgba(26,24,20,0.55)] leading-relaxed"
            emptyClassName="text-[rgba(26,24,20,0.2)] text-[13px]"
          />
        </div>

        {err && (
          <p className="text-[12px] text-red-500 mt-1">{err}</p>
        )}
      </div>
    </div>
  );
}
