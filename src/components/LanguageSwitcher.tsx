import React from "react";
import { useTranslation } from "react-i18next";

interface LanguageSwitcherProps {
  className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = "",
}) => {
  const { i18n, t } = useTranslation();
  const currentRaw = i18n.language;
  const current = currentRaw.startsWith("en")
    ? "en"
    : currentRaw.startsWith("zh")
    ? "zh"
    : currentRaw.startsWith("ko")
    ? "ko"
    : "zh";

  const changeLanguage = (lng: string) => {
    void i18n.changeLanguage(lng);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label className="text-sm text-gray-400 hidden md:block">
        {t("language.switch")}
      </label>
      <div className="flex rounded overflow-hidden border border-gray-600">
        <button
          type="button"
          onClick={() => changeLanguage("zh")}
          className={`px-3 py-1 text-sm transition-colors flex items-center gap-1 ${
            current === "zh"
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          <span aria-hidden>🇹🇼</span>
          {t("language.zh")}
        </button>
        <button
          type="button"
          onClick={() => changeLanguage("en")}
          className={`px-3 py-1 text-sm transition-colors flex items-center gap-1 ${
            current === "en"
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          <span aria-hidden>🇺🇸</span>
          {t("language.en")}
        </button>
        <button
          type="button"
          onClick={() => changeLanguage("ko")}
          className={`px-3 py-1 text-sm transition-colors flex items-center gap-1 ${
            current === "ko"
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          <span aria-hidden>🇰🇷</span>
          {t("language.ko")}
        </button>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
