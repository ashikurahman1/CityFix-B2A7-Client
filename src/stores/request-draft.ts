"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Priority } from "@/types/api";

/**
 * Draft of the multi-step "New request" wizard. Persisted to sessionStorage so a citizen who
 * refreshes or navigates away mid-way does not lose what they typed.
 */
export interface RequestDraft {
  categoryId: string;
  title: string;
  description: string;
  priority: Priority;
  address: string;
  ward: string;
  latitude: string;
  longitude: string;
}

const empty: RequestDraft = {
  categoryId: "",
  title: "",
  description: "",
  priority: "MEDIUM",
  address: "",
  ward: "",
  latitude: "",
  longitude: "",
};

interface DraftState {
  draft: RequestDraft;
  step: number;
  patch: (values: Partial<RequestDraft>) => void;
  setStep: (step: number) => void;
  reset: () => void;
}

export const useRequestDraft = create<DraftState>()(
  persist(
    (set) => ({
      draft: empty,
      step: 0,
      patch: (values) => set((s) => ({ draft: { ...s.draft, ...values } })),
      setStep: (step) => set({ step }),
      reset: () => set({ draft: empty, step: 0 }),
    }),
    { name: "cityfix:request-draft", storage: createJSONStorage(() => sessionStorage) },
  ),
);
