import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface BranchState {
  activeBranchId: string | "all";
  setActiveBranchId: (id: string | "all") => void;
}

export const useBranchStore = create<BranchState>()(
  persist(
    (set) => ({
      activeBranchId: "all",
      setActiveBranchId: (id) => set({ activeBranchId: id }),
    }),
    {
      name: "tf-active-branch",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
