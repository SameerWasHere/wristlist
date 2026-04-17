"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChipPicker } from "@/components/chip-picker";
import { KNOWN } from "@/lib/known-values";

interface EditReferenceModalProps {
  open: boolean;
  onClose: () => void;
  referenceId: number;
  current: {
    brand?: string | null;
    model?: string | null;
    reference: string;
    sizeMm: number | null;
    movement: string | null;
    material: string | null;
    color: string | null;
    category: string | null;
    braceletType: string | null;
    bezelType: string | null;
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

  const [brand, setBrand] = useState(current.brand || "");
  const [model, setModel] = useState(current.model || "");
  const [reference, setReference] = useState(current.reference);
  const [sizeMm, setSizeMm] = useState(current.sizeMm?.toString() || "");
  const [movement, setMovement] = useState(current.movement || "");
  const [material, setMaterial] = useState(current.material || "");
  const [color, setColor] = useState(current.color || "");
  const [category, setCategory] = useState(current.category || "");
  const [braceletType, setBraceletType] = useState(current.braceletType || "");
  const [bezelType, setBezelType] = useState(current.bezelType || "");
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
          brand: brand.trim() || null,
          model: model.trim() || null,
          reference: reference.trim(),
          sizeMm: sizeMm ? parseFloat(sizeMm) : null,
          movement: movement.trim() || null,
          material: material.trim() || null,
          color: color.trim() || null,
          category: category.trim() || null,
          braceletType: braceletType.trim() || null,
          bezelType: bezelType.trim() || null,
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

  const textFields = [
    { label: "Brand", value: brand, set: setBrand },
    { label: "Model", value: model, set: setModel },
    { label: "Reference", value: reference, set: setReference },
    { label: "Size (mm)", value: sizeMm, set: setSizeMm, type: "number" },
    { label: "Water Resistance (m)", value: waterResistanceM, set: setWaterResistanceM, type: "number" },
    { label: "Image URL", value: imageUrl, set: setImageUrl },
  ];

  function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

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

          {/* Text fields */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {textFields.map((f) => (
              <div key={f.label}>
                <label className="text-[10px] uppercase tracking-[1.5px] text-[rgba(26,24,20,0.4)] font-medium block mb-1">
                  {f.label}
                </label>
                <input
                  type={f.type || "text"}
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                  className="w-full text-[16px] px-3 py-2.5 rounded-[10px] border border-[rgba(26,24,20,0.1)] bg-white focus:outline-none focus:border-[#8a7a5a]"
                />
              </div>
            ))}
          </div>

          {/* Dimension chip pickers */}
          <div className="space-y-4 mb-5">
            <ChipPicker label="Category" options={KNOWN.category} value={category || null} onChange={(v) => setCategory(v || "")} formatLabel={capitalize} />
            <ChipPicker label="Movement" options={KNOWN.movement} value={movement || null} onChange={(v) => setMovement(v || "")} formatLabel={capitalize} />
            <ChipPicker label="Case Material" options={KNOWN.material} value={material || null} onChange={(v) => setMaterial(v || "")} formatLabel={capitalize} />
            <ChipPicker label="Dial Color" options={KNOWN.color} value={color || null} onChange={(v) => setColor(v || "")} formatLabel={capitalize} />
            <ChipPicker label="Case Shape" options={KNOWN.shape} value={shape || null} onChange={(v) => setShape(v || "")} formatLabel={capitalize} />
            <ChipPicker label="Crystal" options={KNOWN.crystal} value={crystal || null} onChange={(v) => setCrystal(v || "")} formatLabel={capitalize} />
            <ChipPicker label="Bezel Type" options={KNOWN.bezel_type} value={bezelType || null} onChange={(v) => setBezelType(v || "")} formatLabel={capitalize} />
            <ChipPicker label="Bracelet" options={KNOWN.bracelet_type} value={braceletType || null} onChange={(v) => setBraceletType(v || "")} formatLabel={capitalize} />
            <ChipPicker label="Case Back" options={KNOWN.case_back} value={caseBack || null} onChange={(v) => setCaseBack(v || "")} formatLabel={capitalize} />
            <ChipPicker label="Origin" options={KNOWN.origin} value={origin || null} onChange={(v) => setOrigin(v || "")} />
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

          {/* Community warning */}
          <div className="mt-6 px-3 py-2.5 bg-[rgba(138,122,90,0.06)] border border-[rgba(138,122,90,0.12)] rounded-[10px]">
            <p className="text-[11px] text-[rgba(26,24,20,0.5)] leading-relaxed">
              <strong className="text-[#8a7a5a] font-semibold">Community edit.</strong>{" "}
              Your changes will be visible to all WristList users. Please ensure accuracy — editing privileges may be revoked for inaccurate or abusive edits.
            </p>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={onClose}
              className="flex-1 text-[14px] font-medium py-3 rounded-full border border-[rgba(26,24,20,0.1)] text-[rgba(26,24,20,0.5)] hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#8a7a5a]/30 focus:ring-offset-2 focus:ring-offset-[#f6f4ef] whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 text-[14px] font-semibold py-3 rounded-full bg-[#8a7a5a] text-white hover:opacity-90 transition-opacity disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#8a7a5a]/40 focus:ring-offset-2 focus:ring-offset-[#f6f4ef] whitespace-nowrap"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
