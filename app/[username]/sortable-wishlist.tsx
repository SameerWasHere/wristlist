"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { RemoveWatchButton } from "@/components/remove-watch-button";
import { WishlistEditButton } from "./wishlist-edit-button";
import { PromoteButton } from "./promote-button";

interface WishlistItem {
  rank: number;
  userWatchId: number;
  brand: string;
  model: string;
  reference: string;
  category?: string;
  sizeMm?: number;
  movement?: string;
  origin?: string;
  caption?: string;
  milestone?: string;
  modelYear?: number;
  acquiredYear?: number;
  modifications?: string[];
  photos?: string[];
  gapsFilled: number;
  slug?: string;
  imageUrl?: string;
}

function SortableWishlistRow({
  item,
  isOwner,
}: {
  item: WishlistItem;
  isOwner: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.userWatchId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex gap-3 sm:gap-4 items-center px-3 sm:px-5 py-3 sm:py-4 bg-white border border-[rgba(26,24,20,0.06)] rounded-[18px] ${
        isDragging ? "shadow-[0_8px_32px_rgba(26,24,20,0.15)]" : ""
      }`}
    >
      {/* Drag handle */}
      {isOwner && (
        <button
          {...attributes}
          {...listeners}
          className="flex-shrink-0 cursor-grab active:cursor-grabbing p-1 touch-none"
          aria-label="Drag to reorder"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[rgba(26,24,20,0.2)]"
          >
            <circle cx="9" cy="6" r="1" fill="currentColor" />
            <circle cx="15" cy="6" r="1" fill="currentColor" />
            <circle cx="9" cy="12" r="1" fill="currentColor" />
            <circle cx="15" cy="12" r="1" fill="currentColor" />
            <circle cx="9" cy="18" r="1" fill="currentColor" />
            <circle cx="15" cy="18" r="1" fill="currentColor" />
          </svg>
        </button>
      )}

      {/* Thumbnail */}
      <div
        className="w-12 h-12 rounded-[14px] flex-shrink-0 flex items-center justify-center overflow-hidden"
        style={{ background: "linear-gradient(145deg,#20202a,#10101a)" }}
      >
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={`${item.brand} ${item.model}`}
            className="w-full h-full object-contain p-1"
          />
        ) : (
          <span className="font-black text-[18px] text-white/5">
            {item.brand.charAt(0)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        {item.slug ? (
          <Link href={`/watch/${item.slug}`} className="group">
            <p className="text-[8px] uppercase tracking-[1.5px] text-[rgba(26,24,20,0.25)] font-bold">
              {item.brand}
            </p>
            <p className="text-[14px] font-bold tracking-[-0.2px] truncate group-hover:text-[#8a7a5a] transition-colors">
              {item.model}
            </p>
          </Link>
        ) : (
          <>
            <p className="text-[8px] uppercase tracking-[1.5px] text-[rgba(26,24,20,0.25)] font-bold">
              {item.brand}
            </p>
            <p className="text-[14px] font-bold tracking-[-0.2px] truncate">
              {item.model}
            </p>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {item.gapsFilled > 0 && (
          <span className="text-[9px] font-bold text-[#6b8f4e] mr-1">
            Fills {item.gapsFilled} gap
            {item.gapsFilled !== 1 ? "s" : ""}
          </span>
        )}
        {isOwner && item.userWatchId > 0 && (
          <>
            <PromoteButton
              userWatchId={item.userWatchId}
              brand={item.brand}
              model={item.model}
              reference={item.reference}
              category={item.category}
              sizeMm={item.sizeMm}
              movement={item.movement}
              origin={item.origin}
              wishlistNote={item.caption}
            />
            <WishlistEditButton
              userWatchId={item.userWatchId}
              brand={item.brand}
              model={item.model}
              reference={item.reference}
              category={item.category}
              sizeMm={item.sizeMm}
              movement={item.movement}
              origin={item.origin}
              caption={item.caption}
              milestone={item.milestone}
              modelYear={item.modelYear}
              acquiredYear={item.acquiredYear}
              modifications={item.modifications}
              photos={item.photos}
            />
            <RemoveWatchButton
              userWatchId={item.userWatchId}
              type="wishlist"
            />
          </>
        )}
      </div>
    </div>
  );
}

export function SortableWishlist({
  items,
  isOwner,
}: {
  items: WishlistItem[];
  isOwner: boolean;
}) {
  const [wishlist, setWishlist] = useState(items);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = wishlist.findIndex((w) => w.userWatchId === active.id);
      const newIndex = wishlist.findIndex((w) => w.userWatchId === over.id);
      const newOrder = arrayMove(wishlist, oldIndex, newIndex);

      setWishlist(newOrder);
      setSaving(true);

      try {
        await fetch("/api/wishlist/reorder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderedIds: newOrder.map((w) => w.userWatchId),
          }),
        });
        router.refresh();
      } catch {
        // Revert on error
        setWishlist(wishlist);
      } finally {
        setSaving(false);
      }
    },
    [wishlist, router]
  );

  if (!isOwner) {
    // Non-owner: static list, no drag
    return (
      <div className="flex flex-col gap-3">
        {items.map((w) => (
          <SortableWishlistRow key={w.userWatchId} item={w} isOwner={false} />
        ))}
      </div>
    );
  }

  return (
    <div>
      {saving && (
        <p className="text-[11px] text-[#8a7a5a] mb-2 animate-pulse">
          Saving order...
        </p>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={wishlist.map((w) => w.userWatchId)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-3">
            {wishlist.map((w) => (
              <SortableWishlistRow
                key={w.userWatchId}
                item={w}
                isOwner={true}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
