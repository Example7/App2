import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import translationPL from "./locales/pl/translation.json";
import translationEN from "./locales/en/translation.json";

i18n.use(initReactI18next).init({
  resources: {
    pl: { translation: translationPL },
    en: { translation: translationEN },
  },
  lng: "pl",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
