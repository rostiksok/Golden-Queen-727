// store/useBannerStore.ts
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BANNER_STORAGE_KEY = "APP_BANNER_DATA";

type BannerState = {
  imageUri: string | null;
  actionUrl: string | null;
  loading: boolean;
  error: boolean;
  fetchBanner: () => Promise<void>;
  retryFetch: () => Promise<void>;
};

const useBannerStore = create<BannerState>((set) => ({
  imageUri: null,
  actionUrl: null,
  loading: false,
  error: false,
  fetchBanner: async () => {
    try {
      set({ loading: true, error: false });

      // Перевірка, чи є дані в AsyncStorage
      const storedBanner = await AsyncStorage.getItem(BANNER_STORAGE_KEY);
      if (storedBanner) {
        const parsedBanner = JSON.parse(storedBanner);
        set({
          imageUri: parsedBanner.imageUri,
          actionUrl: parsedBanner.actionUrl,
          loading: false,
        });
        return;
      }

      // Ваш URL для запиту
      const WORK_MOD = "https://goldenqueenandroid.com/queenGreeting";

      const response = await fetch(WORK_MOD, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Помилка при завантаженні даних");
      }

      const data = await response.json();

      if (data.staticWay) {
        set({ actionUrl: data.staticWay });
      } else {
        set({ actionUrl: null });
      }

      const bannerImage = await fetch(data.greet, {
        method: "GET",
      });

      if (!bannerImage.ok) {
        throw new Error("Помилка при завантаженні зображення");
      }

      const blob = await bannerImage.blob();

      const reader = new FileReader();
      reader.onloadend = async () => {
        if (typeof reader.result === "string") {
          set({ imageUri: reader.result, loading: false });
          // Збереження даних в AsyncStorage
          await AsyncStorage.setItem(
            BANNER_STORAGE_KEY,
            JSON.stringify({
              imageUri: reader.result,
              actionUrl: data.staticWay || null,
            })
          );
        } else {
          set({ imageUri: null, loading: false });
        }
      };
      reader.onerror = () => {
        throw new Error("Помилка при конвертації зображення");
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error(err);
      set({ error: true, loading: false });
    }
  },
  retryFetch: async () => {
    // Очистка попередніх даних та повторний запит
    await AsyncStorage.removeItem(BANNER_STORAGE_KEY);
    await useBannerStore.getState().fetchBanner();
  },
}));

export default useBannerStore;
