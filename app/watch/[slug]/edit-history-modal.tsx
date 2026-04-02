"use client";

import { useState, useEffect } from "react";

interface EditEntry {
  id: number;
  action: string;
  fieldChanged: string | null;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
}

interface EditHistoryModalProps {
  open: boolean;
  onClose: () => void;
  targetType: string;
  targetId: number;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export function EditHistoryModal({
  open,
  onClose,
  targetType,
  targetId,
}: EditHistoryModalProps) {
  const [visible, setVisible] = useState(false);
  const [edits, setEdits] = useState<EditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setVisible(true));
      document.body.style.overflow = "hidden";
      setLoading(true);
      fetch(`/api/catalog/history?targetType=${targetType}&targetId=${targetId}`)
        .then((r) => r.json())
        .then((data) => setEdits(data.edits || []))
        .catch(() => setEdits([]))
        .finally(() => setLoading(false));
    } else {
      setVisible(false);
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, targetType, targetId]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center transition-colors duration-200 ${
        visible ? "bg-black/30" : "bg-transparent"
      }`}
      onClick={onClose}
    >
      <div
        className={`w-full max-w-[520px] max-h-[70vh] bg-[#f6f4ef] rounded-t-[24px] shadow-[0_-8px_40px_rgba(26,24,20,0.15)] transition-transform duration-300 flex flex-col ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-[rgba(26,24,20,0.12)]" />
        </div>

        <div className="px-6 pb-8 overflow-y-auto flex-1">
          <h2 className="text-[18px] font-bold text-[#1a1814] mb-6">
            Edit History
          </h2>

          {loading && (
            <p className="text-[13px] text-[rgba(26,24,20,0.4)]">Loading...</p>
          )}

          {!loading && edits.length === 0 && (
            <p className="text-[13px] text-[rgba(26,24,20,0.4)]">No edits yet.</p>
          )}

          {!loading && edits.length > 0 && (
            <div className="flex flex-col gap-3">
              {edits.map((edit) => (
                <div
                  key={edit.id}
                  className="flex items-start gap-3 py-2 border-b border-[rgba(26,24,20,0.06)] last:border-0"
                >
                  <div className="w-7 h-7 rounded-full bg-[rgba(26,24,20,0.06)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {edit.avatarUrl ? (
                      <img src={edit.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-bold text-[rgba(26,24,20,0.3)]">
                        {(edit.displayName || edit.username).charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-[#1a1814]">
                      <span className="font-semibold">@{edit.username}</span>{" "}
                      {edit.action === "create" ? "created this" : (
                        <>
                          edited{" "}
                          <span className="font-medium">{edit.fieldChanged}</span>
                        </>
                      )}
                    </p>
                    {edit.action === "edit" && edit.oldValue && edit.newValue && (
                      <p className="text-[11px] text-[rgba(26,24,20,0.4)] mt-0.5 truncate">
                        {edit.oldValue} → {edit.newValue}
                      </p>
                    )}
                    <p className="text-[11px] text-[rgba(26,24,20,0.3)] mt-0.5">
                      {timeAgo(edit.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
