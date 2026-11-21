"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Tracking codes the visitor looked up recently (public /track page). */
interface RecentTrackingState {
  codes: string[];
  remember: (code: string) => void;
  forget: (code: string) => void;
}

export const useRecentTracking = create<RecentTrackingState>()(
  persist(
    (set) => ({
      codes: [],
      remember: (code) => set((s) => ({ codes: [code, ...s.codes.filter((c) => c !== code)].slice(0, 5) })),
      forget: (code) => set((s) => ({ codes: s.codes.filter((c) => c !== code) })),
    }),
    { name: "cityfix:recent-tracking" },
  ),
);
