import { useState, useEffect, useRef } from "react";
import AccountManager from "./components/AccountManager";
import GiftCodeInput from "./components/GiftCodeInput";
import StatusStats from "./components/StatusStats";
import Alert from "./components/Alert";
import { Gift } from "lucide-react";
import { useAlert } from "./hooks/useAlert";
import { useAccountActions } from "./hooks/useAccountActions";
import { accountStorage } from "./utils/storageUtils";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./components/LanguageSwitcher";
import type { PersistedAccount } from "./types";

function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [delayMs, setDelayMs] = useState<number>(() => {
    const saved = localStorage.getItem("kingshot-delay-ms");
    return saved ? parseInt(saved, 10) : 2000; // default 2s
  });
  const initStartedRef = useRef(false); // 保留以防未來擴充

  // 使用共用的 Alert Hook (移除未使用的 showError / showWarning)
  const { alert, showAlert, hideAlert } = useAlert();
  const { t } = useTranslation();

  // 帳號操作 Hook（不再需要 validateAccounts）
  const {
    accounts,
    setAccounts,
    isProcessing,
    addAccount,
    deleteAccount,
    submitGiftCodeToAccounts,
    processingRemaining,
  } = useAccountActions({ onShowAlert: showAlert, delayMs });

  // 初始化：僅載入既有帳號，不進行重新驗證
  useEffect(() => {
    if (initStartedRef.current) return;
    initStartedRef.current = true;
    const savedAccounts = accountStorage.loadAccounts();
    if (savedAccounts.length > 0) {
      setAccounts(savedAccounts);
    }
    setIsInitializing(false);
  }, [setAccounts]);

  // 帳號變動時自動儲存（簡化：初始化完成後每次變動即同步）
  useEffect(() => {
    if (isInitializing) return;
    const sanitized: PersistedAccount[] = accounts.map((a) => ({
      id: a.id,
      accountNumber: a.accountNumber,
      playerInfo: a.playerInfo,
      isValidated: a.isValidated,
      status: "idle",
    }));
    accountStorage.saveAccounts(sanitized as PersistedAccount[]);
  }, [accounts, isInitializing]);

  const handleAddAccount = async (accountNumber: string) => {
    return await addAccount(accountNumber);
  };

  const handleDeleteAccount = (id: string) => {
    deleteAccount(id);
  };

  const handleGiftCodeSubmit = async (code: string) => {
    await submitGiftCodeToAccounts(code);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 flex flex-col">
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-6 flex flex-col md:h-screen max-w-6xl">
        {/* 標題區域 */}
        <div className="mb-4 md:mb-6 flex-shrink-0 relative">
          <div className="flex flex-col items-center gap-3 md:gap-4">
            <div className="flex items-center gap-2 md:gap-3">
              <Gift className="w-8 h-8 text-blue-400" />
              <h1 className="text-3xl md:text-4xl font-bold leading-tight bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent whitespace-nowrap">
                {t("app.title")}
              </h1>
            </div>
            <p className="text-gray-400 text-sm md:text-lg text-center px-4 md:px-0 max-w-xl">
              {t("app.subtitle")}
            </p>
            <LanguageSwitcher className="mt-1" />
            <div className="flex items-center gap-2 mt-2">
              <label className="text-xs text-gray-400" htmlFor="delaySelect">
                {t("settings.requestInterval")}
              </label>
              <select
                id="delaySelect"
                value={delayMs}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  setDelayMs(v);
                  localStorage.setItem("kingshot-delay-ms", String(v));
                }}
                className="bg-gray-700 border border-gray-600 text-gray-200 text-xs rounded px-2 py-1 focus:outline-none focus:border-blue-500"
              >
                <option value={500}>0.5s</option>
                <option value={1000}>1s</option>
                <option value={1500}>1.5s</option>
                <option value={2000}>2s</option>
                <option value={3000}>3s</option>
              </select>
            </div>
          </div>
          {isInitializing && (
            <div className="mt-3 flex items-center justify-center gap-2 text-blue-400">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs md:text-sm">
                {t("app.loadingAccounts")}
              </span>
            </div>
          )}
        </div>

        {/* 主要內容區域 */}
        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col gap-4 min-h-0">
          <div className="flex md:flex-row flex-col gap-4 flex-1 min-h-0">
            {/* 左側 - 帳號管理 */}
            <div className="flex-1 min-h-0">
              <AccountManager
                accounts={accounts}
                onAddAccount={handleAddAccount}
                onDeleteAccount={handleDeleteAccount}
                onShowAlert={showAlert}
                delayMs={delayMs}
              />
            </div>

            {/* 右側 - 狀態統計 + Gift Code */}
            <div className="flex-1 flex flex-col gap-4 min-h-0">
              <div className="flex-1 min-h-0">
                <StatusStats
                  accounts={accounts}
                  processingRemaining={processingRemaining}
                />
              </div>
              <div className="flex-shrink-0">
                <GiftCodeInput
                  onSubmit={handleGiftCodeSubmit}
                  disabled={isProcessing}
                  hasAccounts={accounts.length > 0}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Alert
        message={alert.message}
        type={alert.type}
        isVisible={alert.isVisible}
        onClose={hideAlert}
      />
    </div>
  );
}

export default App;
