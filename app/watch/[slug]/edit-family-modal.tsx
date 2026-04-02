"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface EditFamilyModalProps {
  open: boolean;
  onClose: () => void;
  familyId: number;
  currentModel: string;
  currentDescription: string | null;
  currentImageUrl: string | null;
  currentCollection: string | null;
}

export function EditFamilyModal({
  open,
  onClose,
  familyId,
  currentModel,
  currentDescription,
  currentImageUrl,
  currentCollection,
}: EditFamilyModalProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [model, setModel] = useState(currentModel);
  const [description, setDescription] = useState(currentDescription || "");
  const [imageUrl, setImageUrl] = useState(currentImageUrl || "");
  const [collection, setCollection] = useState(currentCollection || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setVisible(true));
      document.body.style.overflow = "hidden";
    } else {
      setVisible(false);
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/catalog/families/${familyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: model.trim() || currentModel,
          description: description.trim() || null,
          imageUrl: imageUrl.trim() || null,
          collection: collection.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save");
        setSaving(false);
        return;
      }

      router.refresh();
      onClose();
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center transition-colors duration-200 ${
        visible ? "bg-black/30" : "bg-transparent"
      }`}
      onClick={onClose}
    >
      <div
        className={`w-full max-w-[520px] bg-[#f6f4ef] rounded-t-[24px] shadow-[0_-8px_40px_rgba(26,24,20,0.15)] transition-transform duration-300 ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-[rgba(26,24,20,0.12)]" />
        </div>

        <div className="px-6 pb-8">
          <h2 className="text-[18px] font-bold text-[#1a1814] mb-6">
            Edit Watch Family
          </h2>

          {error && (
            <p className="text-[13px] text-red-600 mb-4">{error}</p>
          )}

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-[11px] uppercase tracking-[2px] text-[rgba(26,24,20,0.4)] font-medium block mb-1">
                Model
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full text-[16px] px-4 py-3 rounded-[12px] border border-[rgba(26,24,20,0.1)] bg-white focus:outline-none focus:border-[#8a7a5a]"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-[2px] text-[rgba(26,24,20,0.4)] font-medium block mb-1">
                Collection
              </label>
              <input
                type="text"
                value={collection}
                onChange={(e) => setCollection(e.target.value)}
                placeholder="e.g. Submariner, Speedmaster"
                className="w-full text-[16px] px-4 py-3 rounded-[12px] border border-[rgba(26,24,20,0.1)] bg-white focus:outline-none focus:border-[#8a7a5a]"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-[2px] text-[rgba(26,24,20,0.4)] font-medium block mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full text-[16px] px-4 py-3 rounded-[12px] border border-[rgba(26,24,20,0.1)] bg-white focus:outline-none focus:border-[#8a7a5a] resize-none"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-[2px] text-[rgba(26,24,20,0.4)] font-medium block mb-1">
                Image URL
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full text-[16px] px-4 py-3 rounded-[12px] border border-[rgba(26,24,20,0.1)] bg-white focus:outline-none focus:border-[#8a7a5a]"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 text-[14px] font-medium py-3 rounded-full border border-[rgba(26,24,20,0.1)] text-[rgba(26,24,20,0.5)] hover:bg-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 text-[14px] font-semibold py-3 rounded-full bg-[#8a7a5a] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
