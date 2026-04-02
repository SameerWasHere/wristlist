"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface EditReferenceModalProps {
  open: boolean;
  onClose: () => void;
  referenceId: number;
  current: {
    reference: string;
    sizeMm: number | null;
    movement: string | null;
    material: string | null;
    color: string | null;
    category: string | null;
    braceletType: string | null;
    shape: string | null;
    waterResistanceM: number | null;
    crystal: string | null;
    caseBack: string | null;
    origin: string | null;
    description: string | null;
    imageUrl: string | null;
  };
}

export function EditReferenceModal({
  open,
  onClose,
  referenceId,
  current,
}: EditReferenceModalProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [reference, setReference] = useState(current.reference);
  const [sizeMm, setSizeMm] = useState(current.sizeMm?.toString() || "");
  const [movement, setMovement] = useState(current.movement || "");
  const [material, setMaterial] = useState(current.material || "");
  const [color, setColor] = useState(current.color || "");
  const [category, setCategory] = useState(current.category || "");
  const [braceletType, setBraceletType] = useState(current.braceletType || "");
  const [shape, setShape] = useState(current.shape || "");
  const [waterResistanceM, setWaterResistanceM] = useState(current.waterResistanceM?.toString() || "");
  const [crystal, setCrystal] = useState(current.crystal || "");
  const [caseBack, setCaseBack] = useState(current.caseBack || "");
  const [origin, setOrigin] = useState(current.origin || "");
  const [description, setDescription] = useState(current.description || "");
  const [imageUrl, setImageUrl] = useState(current.imageUrl || "");

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
      const res = await fetch(`/api/catalog/references/${referenceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: reference.trim(),
          sizeMm: sizeMm ? parseFloat(sizeMm) : null,
          movement: movement.trim() || null,
          material: material.trim() || null,
          color: color.trim() || null,
          category: category.trim() || null,
          braceletType: braceletType.trim() || null,
          shape: shape.trim() || null,
          waterResistanceM: waterResistanceM ? parseInt(waterResistanceM, 10) : null,
          crystal: crystal.trim() || null,
          caseBack: caseBack.trim() || null,
          origin: origin.trim() || null,
          description: description.trim() || null,
          imageUrl: imageUrl.trim() || null,
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

  const fields = [
    { label: "Reference", value: reference, set: setReference },
    { label: "Size (mm)", value: sizeMm, set: setSizeMm },
    { label: "Movement", value: movement, set: setMovement },
    { label: "Material", value: material, set: setMaterial },
    { label: "Color", value: color, set: setColor },
    { label: "Category", value: category, set: setCategory },
    { label: "Bracelet Type", value: braceletType, set: setBraceletType },
    { label: "Shape", value: shape, set: setShape },
    { label: "Water Resistance (m)", value: waterResistanceM, set: setWaterResistanceM },
    { label: "Crystal", value: crystal, set: setCrystal },
    { label: "Case Back", value: caseBack, set: setCaseBack },
    { label: "Origin", value: origin, set: setOrigin },
    { label: "Image URL", value: imageUrl, set: setImageUrl },
  ];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center transition-colors duration-200 ${
        visible ? "bg-black/30" : "bg-transparent"
      }`}
      onClick={onClose}
    >
      <div
        className={`w-full max-w-[520px] max-h-[85vh] bg-[#f6f4ef] rounded-t-[24px] shadow-[0_-8px_40px_rgba(26,24,20,0.15)] transition-transform duration-300 flex flex-col ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-[rgba(26,24,20,0.12)]" />
        </div>

        <div className="px-6 pb-8 overflow-y-auto flex-1">
          <h2 className="text-[18px] font-bold text-[#1a1814] mb-6">
            Edit Variation
          </h2>

          {error && (
            <p className="text-[13px] text-red-600 mb-4">{error}</p>
          )}

          <div className="grid grid-cols-2 gap-3">
            {fields.map((f) => (
              <div key={f.label}>
                <label className="text-[10px] uppercase tracking-[1.5px] text-[rgba(26,24,20,0.4)] font-medium block mb-1">
                  {f.label}
                </label>
                <input
                  type="text"
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                  className="w-full text-[16px] px-3 py-2.5 rounded-[10px] border border-[rgba(26,24,20,0.1)] bg-white focus:outline-none focus:border-[#8a7a5a]"
                />
              </div>
            ))}
          </div>

          <div className="mt-3">
            <label className="text-[10px] uppercase tracking-[1.5px] text-[rgba(26,24,20,0.4)] font-medium block mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full text-[16px] px-3 py-2.5 rounded-[10px] border border-[rgba(26,24,20,0.1)] bg-white focus:outline-none focus:border-[#8a7a5a] resize-none"
            />
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
