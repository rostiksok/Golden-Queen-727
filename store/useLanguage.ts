import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "../i18n";

const LANG_STORAGE_KEY = "APP_LANGUAGE";

type LanguageState = {
  selectedLanguage: string;
  setSelectedLanguage: (language: string) => void;
};

const useLanguageStore = create<LanguageState>((set) => ({
  selectedLanguage: "EN",
  setSelectedLanguage: async (language: string) => {
    set({ selectedLanguage: language });
    i18n.changeLanguage(language);
    await AsyncStorage.setItem(LANG_STORAGE_KEY, language);
  },
}));

export default useLanguageStore;
