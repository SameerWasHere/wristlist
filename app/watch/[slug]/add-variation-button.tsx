"use client";

import { useState } from "react";
import { AddToCatalogModal } from "@/components/add-to-catalog-modal";

interface AddVariationButtonProps {
  brand: string;
  model: string;
}

export function AddVariationButton({ brand, model }: AddVariationButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-1.5 text-[12px] font-semibold bg-[#8a7a5a] text-white rounded-full hover:opacity-90 transition-opacity"
      >
        + Add Variation
      </button>

      <AddToCatalogModal
        open={open}
        onClose={() => setOpen(false)}
        onCreated={() => {
          setOpen(false);
          window.location.reload();
        }}
        initialBrand={brand}
        initialModel={model}
      />
    </>
  );
}
