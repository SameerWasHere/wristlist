"use client";

import { useState } from "react";

interface FollowButtonProps {
  userId: number;
  isFollowing: boolean;
  followerCount: number;
}

export function FollowButton({
  userId: _userId,
  isFollowing: initialFollowing,
  followerCount: initialCount,
}: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [count, setCount] = useState(initialCount);

  function handleClick() {
    // Optimistic toggle — API wiring comes later
    setFollowing((prev) => !prev);
    setCount((prev) => (following ? prev - 1 : prev + 1));
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleClick}
        className={`
          px-5 py-2 text-[12px] font-semibold rounded-full transition-all
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
