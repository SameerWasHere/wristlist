"use client";

import { WatchSearch } from "@/components/watch-search";
import { useRouter } from "next/navigation";

export function DashboardSearch() {
  const router = useRouter();

  return (
    <WatchSearch
      onWatchAdded={() => {
        // Refresh the page to show new data after adding a watch
        router.refresh();
      }}
    />
  );
}
