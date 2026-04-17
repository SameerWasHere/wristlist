"use client";

import { useState } from "react";
import { EditFamilyModal } from "./edit-family-modal";
import { EditReferenceModal } from "./edit-reference-modal";
import { EditHistoryModal } from "./edit-history-modal";

// Pencil icon SVG
function PencilIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.5 1.5L10.5 3.5L3.5 10.5H1.5V8.5L8.5 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// --- Family Edit Button ---
export function FamilyEditButton({
  familyId,
  currentModel,
  currentDescription,
}: {
  familyId: number;
  currentModel: string;
  currentDescription: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-semibold text-[#8a7a5a] border border-[rgba(138,122,90,0.25)] rounded-full hover:bg-[rgba(138,122,90,0.06)] hover:border-[rgba(138,122,90,0.4)] transition-all"
      >
        <PencilIcon /> Edit Page
      </button>
      <EditFamilyModal
        open={open}
        onClose={() => setOpen(false)}
        familyId={familyId}
        currentModel={currentModel}
        currentDescription={currentDescription}
      />
    </>
  );
}

// --- Reference Edit Button ---
export function ReferenceEditButton({
  referenceId,
  current,
}: {
  referenceId: number;
  current: {
    brand?: string | null;
    model?: string | null;
    reference: string;
    variantName?: string | null;
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
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-[#8a7a5a] border border-[rgba(138,122,90,0.2)] rounded-full hover:bg-[rgba(138,122,90,0.06)] hover:border-[rgba(138,122,90,0.4)] transition-all"
        title="Edit variation specs"
      >
        <PencilIcon /> Edit Specs
      </button>
      <EditReferenceModal
        open={open}
        onClose={() => setOpen(false)}
        referenceId={referenceId}
        current={current}
      />
    </>
  );
}

// --- History Button ---
export function HistoryButton({
  targetType,
  targetId,
}: {
  targetType: string;
  targetId: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-[12px] font-medium text-[rgba(26,24,20,0.35)] hover:text-[#8a7a5a] transition-colors underline underline-offset-2"
      >
        View history
      </button>
      <EditHistoryModal
        open={open}
        onClose={() => setOpen(false)}
        targetType={targetType}
        targetId={targetId}
      />
    </>
  );
}
