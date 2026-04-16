"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

interface FollowButtonProps {
  userId: number;
  isFollowing: boolean;
  followerCount: number;
}

export function FollowButton({
  userId,
  isFollowing: initialFollowing,
  followerCount: initialCount,
}: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);
  const { isSignedIn } = useUser();
  const router = useRouter();

  async function handleClick() {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }
    if (busy) return;

    // Optimistic update
    const wasFollowing = following;
    const prevCount = count;
    setFollowing(!wasFollowing);
    setCount(wasFollowing ? prevCount - 1 : prevCount + 1);
    setBusy(true);

    try {
      const res = await fetch("/api/follow", {
        method: wasFollowing ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followingId: userId }),
      });
      if (!res.ok) {
        // Revert on failure
        setFollowing(wasFollowing);
        setCount(prevCount);
      }
    } catch {
      // Revert on failure
      setFollowing(wasFollowing);
      setCount(prevCount);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleClick}
        disabled={busy}
        className={`
          px-5 py-2 text-[12px] font-semibold rounded-full transition-all
          ${busy ? "opacity-60 cursor-not-allowed" : ""}
          ${
            following
              ? "bg-[#8a7a5a] text-white border border-[#8a7a5a]"
              : "bg-transparent text-[#8a7a5a] border border-[#8a7a5a] hover:bg-[#8a7a5a]/10"
          }
        `}
      >
        {following ? "Following" : "Follow"}
      </button>
      <span className="text-[12px] text-[rgba(26,24,20,0.4)]">
        {count} follower{count !== 1 ? "s" : ""}
      </span>
    </div>
  );
}
