import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// 匯入語系資源
import zhTW from "./locales/zh-TW.json";
import enUS from "./locales/en-US.json";
import koKR from "./locales/ko-KR.json";

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      zh: { translation: zhTW },
      en: { translation: enUS },
      ko: { translation: koKR },
    },
    fallbackLng: "zh",
    supportedLngs: ["zh", "en", "ko"],
    interpolation: { escapeValue: false },
    detection: {
      order: ["querystring", "localStorage", "navigator"],
      lookupQuerystring: "lang",
      caches: ["localStorage"],
    },
  });

export default i18n;
