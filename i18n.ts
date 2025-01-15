import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform, NativeModules } from "react-native";

import en from "./locales/en/translation.json";
import ru from "./locales/ru/translation.json";
import de from "./locales/de/translation.json";
import tr from "./locales/tr/translation.json";
import useLanguageStore from "./store/useLanguage";

const LANG_STORAGE_KEY = "APP_LANGUAGE";
type Language = "EN" | "RU" | "DE" | "TR";

const getSystemLanguage = (): string => {
  let locale: string = "en";

  if (Platform.OS === "ios") {
    const locales = NativeModules.SettingsManager.settings.AppleLanguages;
    locale = locales ? locales[0].substring(0, 2).toUpperCase() : "EN";
  } else if (Platform.OS === "android") {
    locale = NativeModules.I18nManager.localeIdentifier
      .substring(0, 2)
      .toUpperCase();
  }

  return locale;
};

const resources = {
  EN: { translation: en },
  RU: { translation: ru },
  DE: { translation: de },
  TR: { translation: tr },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "EN",
  fallbackLng: "EN",
  interpolation: {
    escapeValue: false,
  },
});

const setInitialLanguage = async () => {
  try {
    const storedLang = await AsyncStorage.getItem(LANG_STORAGE_KEY);
    if (storedLang && resources[storedLang as Language]) {
      await i18n.changeLanguage(storedLang as Language);
      useLanguageStore.getState().setSelectedLanguage(storedLang as Language);
    } else {
      const systemLang = getSystemLanguage();
      if (resources[systemLang as Language]) {
        await i18n.changeLanguage(systemLang as Language);
        await AsyncStorage.setItem(LANG_STORAGE_KEY, systemLang as Language);
        useLanguageStore.getState().setSelectedLanguage(systemLang as Language);
      } else {
        await i18n.changeLanguage("EN");
        useLanguageStore.getState().setSelectedLanguage("EN");
      }
    }
  } catch (error) {
    console.error("Error setting initial language:", error);
    // Fallback to default language in case of error
    await i18n.changeLanguage("EN");
    useLanguageStore.getState().setSelectedLanguage("EN");
  }
};

setInitialLanguage();

export default i18n;
