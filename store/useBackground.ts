import { create } from "zustand";

interface BackgroundState {
  selectedBackground: number;
  setSelectedBackground: (index: number) => void;
}

const useBackgroundStore = create<BackgroundState>((set) => ({
  selectedBackground: 0,
  setSelectedBackground: (index) => set({ selectedBackground: index }),
}));

export default useBackgroundStore;
