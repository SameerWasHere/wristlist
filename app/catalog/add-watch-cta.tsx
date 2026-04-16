"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { AddToCatalogModal } from "@/components/add-to-catalog-modal";

export function AddWatchCta() {
  const [open, setOpen] = useState(false);
  const { isSignedIn } = useUser();
  const router = useRouter();

  function handleClick() {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }
    setOpen(true);
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="inline-block px-6 py-3 text-[13px] font-semibold bg-[#1a1814] text-[#f6f4ef] rounded-full hover:opacity-90 transition-opacity"
      >
        Don&apos;t see your watch? Add it
      </button>

      <AddToCatalogModal
        open={open}
        onClose={() => setOpen(false)}
        onCreated={() => {
          setOpen(false);
          router.refresh();
        }}
      />
    </>
  );
}
