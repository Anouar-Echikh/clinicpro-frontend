import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";

// We use message-as-key so non-technical users can edit plain English keys
// in JSON files under public/locales/<lng>/common.json

void i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    lowerCaseLng: true,
    supportedLngs: [
      "en",
      "en-us",
      "en-nz",
      "en-za",
      "es",
      "fr",
      "ha",
      "hi",
      "vi",
      "pt-br",
      "pl",
      "ar",
      "ar-om",
      "ar-eg",
    ],
    ns: ["common"],
    defaultNS: "common",
    interpolation: { escapeValue: false },
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
    detection: {
      order: ["querystring", "localStorage", "cookie", "navigator", "htmlTag"],
      caches: ["localStorage", "cookie"],
    },
    keySeparator: false,
    nsSeparator: false,
    returnNull: false,
    returnEmptyString: false,
    cleanCode: true,
  });

// Update document direction based on language (handles RTL like Arabic)
i18n.on("languageChanged", (lng) => {
  const isRtl = lng?.toLowerCase().startsWith("ar") || ["he", "fa", "ur"].includes(lng);
  const dir = isRtl ? "rtl" : "ltr";
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", lng);
  }
});

export default i18n;


