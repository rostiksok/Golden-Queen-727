import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persist, PersistStorage } from "zustand/middleware";

interface SoundVibrationState {
  soundVolume: number;
  setSoundVolume: (value: number) => void;
  vibrationIntensity: number;
  setVibrationIntensity: (value: number) => void;
}

const asyncStorage: PersistStorage<SoundVibrationState> = {
  getItem: async (name) => {
    const item = await AsyncStorage.getItem(name);
    return item ? JSON.parse(item) : null;
  },
  setItem: async (name, value) => {
    await AsyncStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: async (name) => {
    await AsyncStorage.removeItem(name);
  },
};

const useSoundVibrationStore = create<SoundVibrationState>()(
  persist(
    (set) => ({
      soundVolume: 0.5,
      setSoundVolume: (value: number) =>
        set({ soundVolume: Math.max(0, Math.min(1, value)) }),
      vibrationIntensity: 0.5,
      setVibrationIntensity: (value: number) =>
        set({ vibrationIntensity: Math.max(0, Math.min(1, value)) }),
    }),
    {
      name: "sound-vibration-storage",
      storage: asyncStorage,
    }
  )
);

export default useSoundVibrationStore;
