import React, { useState } from "react";
import { Gift, Download } from "lucide-react";
import { useTranslation } from "react-i18next";

interface GiftCodeInputProps {
  onSubmit: (code: string) => void;
  disabled?: boolean;
  hasAccounts?: boolean;
}

const GiftCodeInput: React.FC<GiftCodeInputProps> = ({
  onSubmit,
  disabled = false,
  hasAccounts = true,
}) => {
  const [giftCode, setGiftCode] = useState("");
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (giftCode.trim()) {
      onSubmit(giftCode.trim());
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Gift className="w-5 h-5 text-purple-400" />
        <h2 className="text-xl font-bold text-white">{t("giftCode.title")}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="giftCode"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            {t("giftCode.inputLabel")}
          </label>
          <input
            type="text"
            id="giftCode"
            value={giftCode}
            onChange={(e) => setGiftCode(e.target.value)}
            placeholder={t("giftCode.inputPlaceholder") as string}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            disabled={disabled}
          />
        </div>

        <button
          type="submit"
          disabled={!giftCode.trim() || disabled || !hasAccounts}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          {disabled
            ? t("giftCode.processing")
            : !hasAccounts
            ? t("giftCode.needAccounts")
            : t("giftCode.startAll")}
        </button>
      </form>
    </div>
  );
};

export default GiftCodeInput;
