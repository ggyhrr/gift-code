import React, { useState, useRef, useEffect } from "react";
import { Trash2, Plus, User, Download, Upload } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Account } from "../types";
import {
  getStatusIcon,
  getStatusColor,
  getStatusBgColor,
} from "../utils/statusUtils";
import {
  readTextFile,
  parseAccountsFromText,
  validateAccountList,
  exportAccountsToFile,
  isTextFile,
  formatFileSize,
} from "../utils/fileUtils";

interface AccountManagerProps {
  accounts: Account[];
  onAddAccount: (
    accountNumber: string,
    options?: { silent?: boolean }
  ) => Promise<boolean> | boolean; // silent 控制是否逐筆 alert
  onDeleteAccount: (id: string) => void;
  onShowAlert: (
    message: string,
    type?: "error" | "warning" | "info" | "success"
  ) => void;
  delayMs?: number; // 動態延遲 (用於匯入節流)
}

const AccountManager: React.FC<AccountManagerProps> = ({
  accounts,
  onAddAccount,
  onDeleteAccount,
  onShowAlert,
  delayMs = 1000,
}) => {
  const [newAccount, setNewAccount] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importTotal, setImportTotal] = useState<number>(0);
  const [importRemaining, setImportRemaining] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const listScrollRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef<number>(accounts.length);
  const { t } = useTranslation();

  const handleAddAccount = () => {
    if (newAccount.trim() && /^\d+$/.test(newAccount.trim())) {
      onAddAccount(newAccount.trim());
      setNewAccount("");
      setIsAdding(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddAccount();
    } else if (e.key === "Escape") {
      setNewAccount("");
      setIsAdding(false);
    }
  };

  // 匯出帳號到 txt 檔案
  const handleExportAccounts = () => {
    if (accounts.length === 0) {
      onShowAlert(t("accountManager.noAccountsToExport"), "warning");
      return;
    }

    const filename = `kingshot-accounts-${new Date()
      .toISOString()
      .slice(0, 10)}.txt`;
    exportAccountsToFile(accounts, filename, false);
    onShowAlert(
      t("messages.exportSuccess", { count: accounts.length }),
      "success"
    );
  };

  // 匯入帳號從檔案
  const handleImportAccounts = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 檢查檔案格式和大小
    if (!isTextFile(file)) {
      onShowAlert(t("messages.importFileFormatError"), "error");
      return;
    }

    if (file.size > 1024 * 1024) {
      // 1MB 限制
      onShowAlert(
        t("messages.importFileTooLarge", { size: formatFileSize(file.size) }),
        "error"
      );
      return;
    }

    setIsImporting(true);
    setImportErrors([]);
    setImportTotal(0);
    setImportRemaining(0);

    try {
      const text = await readTextFile(file);
      const accountNumbers = parseAccountsFromText(text);

      if (accountNumbers.length === 0) {
        onShowAlert(t("messages.importFileEmpty"), "warning");
        setIsImporting(false);
        return;
      }

      // 驗證帳號格式並檢查重複
      const {
        valid: validAccounts,
        invalid,
        duplicates,
      } = validateAccountList(accountNumbers);
      const errors: string[] = [];

      // 檢查已存在的帳號
      const existingAccounts = validAccounts.filter((account) =>
        accounts.some((existing) => existing.accountNumber === account)
      );

      const newAccounts = validAccounts.filter(
        (account) =>
          !accounts.some((existing) => existing.accountNumber === account)
      );

      // 收集錯誤訊息
      if (invalid.length > 0) {
        errors.push(
          t("messages.importFormatInvalid", {
            list: invalid.slice(0, 5).join(", "),
            more:
              invalid.length > 5
                ? t("messages.moreCount", { count: invalid.length })
                : "",
          })
        );
      }

      if (duplicates.length > 0) {
        errors.push(
          t("messages.importDuplicate", {
            list: duplicates.slice(0, 3).join(", "),
            more:
              duplicates.length > 3
                ? t("messages.moreCount", { count: duplicates.length })
                : "",
          })
        );
      }

      if (existingAccounts.length > 0) {
        errors.push(
          t("messages.importExisting", {
            list: existingAccounts.slice(0, 3).join(", "),
            more:
              existingAccounts.length > 3
                ? t("messages.moreCount", { count: existingAccounts.length })
                : "",
          })
        );
      }

      // 逐一添加新帳號
      let successAdded = 0;
      let failedAdded = 0;
      for (let i = 0; i < newAccounts.length; i++) {
        const accountNumber = newAccounts[i];
        if (i === 0) {
          setImportTotal(newAccounts.length);
          setImportRemaining(newAccounts.length);
        }
        try {
          // 適當延遲避免過快請求
          if (i > 0)
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          const ok = await onAddAccount(accountNumber, { silent: true });
          if (ok) successAdded += 1;
          else failedAdded += 1;
        } catch {
          failedAdded += 1;
          errors.push(
            t("messages.importAddFailed", { account: accountNumber })
          );
        } finally {
          setImportRemaining((r) => Math.max(0, r - 1));
        }
      }

      // 顯示結果錯誤列表（格式/重複/已存在 + 逐筆失敗彙總）
      setImportErrors(errors);

      const totalTried = newAccounts.length;
      if (totalTried === 0) {
        // 沒有新帳號可匯入（全部都屬於已存在/格式錯誤等）
        if (errors.length > 0) {
          onShowAlert(t("messages.importAllFailed"), "error");
        }
      } else {
        // 統一彈出彙總 alert：總數 / 成功 / 失敗（不含已存在與格式錯誤等被排除者，僅針對嘗試新增的新帳號）
        onShowAlert(
          t("messages.importSummary", {
            total: totalTried,
            success: successAdded,
            failed: failedAdded,
          }),
          failedAdded > 0 ? "warning" : "success"
        );
      }
    } catch (error) {
      onShowAlert(
        `${t("messages.fileReadError")}: ${
          error instanceof Error ? error.message : "Unknown"
        }`,
        "error"
      );
    } finally {
      setIsImporting(false);
      setImportTotal(0);
      setImportRemaining(0);
      // 清空檔案選擇
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const getAccountStatusIcon = (status: Account["status"]) => {
    const IconComponent = getStatusIcon(status);
    const colorClass = getStatusColor(status);
    return (
      <IconComponent
        className={`w-4 h-4 ${colorClass} ${
          status === "processing" || status === "validating"
            ? "animate-spin"
            : ""
        }`}
      />
    );
  };

  const getAccountStatusBgColor = (status: Account["status"]) => {
    return getStatusBgColor(status);
  };

  // 帳號新增後自動滾動到底部（僅在數量增加時觸發）
  useEffect(() => {
    if (accounts.length > prevCountRef.current) {
      // 延遲到 DOM 更新後再滾動
      requestAnimationFrame(() => {
        const el = listScrollRef.current;
        if (el) {
          el.scrollTop = el.scrollHeight;
        }
      });
    }
    prevCountRef.current = accounts.length;
  }, [accounts]);

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg flex flex-col h-full max-h-full">
      {/* 標題區域 */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <User className="w-5 h-5" />
          {t("accountManager.title")}
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm">
            {t("accountManager.count", { count: accounts.length })}
          </span>

          {/* 匯入匯出按鈕 */}
          <div className="flex gap-1">
            <button
              onClick={handleImportAccounts}
              disabled={isImporting}
              className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
              title={t("accountManager.import") as string}
            >
              <Upload className="w-4 h-4" />
            </button>
            <button
              onClick={handleExportAccounts}
              disabled={accounts.length === 0}
              className="p-2 text-gray-400 hover:text-green-400 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
              title={t("accountManager.export") as string}
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 隱藏的檔案輸入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.csv"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </div>

      {/* 帳號列表 - 可滾動區域 */}
      <div className="flex-1 min-h-0 mb-4">
        <div
          ref={listScrollRef}
          className="h-full max-h-[400px] md:max-h-none overflow-y-auto space-y-3 pr-2 scrollbar-thin"
        >
          {accounts.length === 0 ? (
            <div className="text-gray-400 text-center py-8 flex items-center justify-center h-full">
              {t("accountManager.empty")}
            </div>
          ) : (
            accounts.map((account, index) => (
              <div
                key={account.id}
                className={`flex items-center justify-between bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition-colors ${getAccountStatusBgColor(
                  account.status
                )}`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0 overflow-hidden">
                  {/* 頭像 */}
                  {account.playerInfo?.avatar_image ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-gray-600">
                      <img
                        src={account.playerInfo.avatar_image}
                        alt={account.playerInfo.nickname}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `<div class="w-full h-full bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">${
                              index + 1
                            }</div>`;
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                  )}

                  <div className="flex flex-col min-w-0 flex-1">
                    {/* 玩家資訊 */}
                    {account.playerInfo ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-lg text-white">
                          <span
                            className="text-blue-400 font-bold flex-1 min-w-0 truncate"
                            title={account.playerInfo.nickname}
                          >
                            {account.playerInfo.nickname}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm min-w-0 gap-2">
                          <span className="text-gray-300 font-mono truncate">
                            {account.accountNumber}
                          </span>
                          <span className="px-2 py-0.5 bg-gray-600 text-gray-300 text-[11px] rounded whitespace-nowrap flex-shrink-0">
                            {t("accountManager.kingdom", {
                              kid: account.playerInfo.kid,
                            })}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <span>{t("accountManager.castleLevel")}</span>
                          {account.playerInfo.stove_lv_content && (
                            <img
                              src={account.playerInfo.stove_lv_content}
                              alt={`${t("accountManager.castleLevel")} ${
                                account.playerInfo.stove_lv
                              }`}
                              className="w-[34px] h-[34px] inline-block"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                const span =
                                  target.nextElementSibling as HTMLSpanElement;
                                if (span) span.style.display = "inline";
                              }}
                            />
                          )}
                          <span
                            className={
                              account.playerInfo.stove_lv_content
                                ? "hidden"
                                : "inline"
                            }
                          >
                            {account.playerInfo.stove_lv}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-white font-mono text-lg truncate">
                        {account.accountNumber}
                      </span>
                    )}

                    {/* 狀態訊息 */}
                    {account.lastResult && (
                      <span
                        className={`text-sm truncate ${getStatusColor(
                          account.status
                        )}`}
                      >
                        {account.lastResult}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 ml-3 pl-1">
                  {/* Kingdom badge removed from here (moved beside account number) */}
                  {getAccountStatusIcon(account.status)}
                  <button
                    onClick={() => onDeleteAccount(account.id)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-600 rounded-lg transition-colors"
                    title={t("accountManager.delete") as string}
                    disabled={
                      account.status === "processing" ||
                      account.status === "validating"
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 新增帳號區域 */}
      <div className="flex-shrink-0">
        {/* 匯入錯誤訊息 */}
        {importErrors.length > 0 && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
            <div className="text-red-400 text-sm font-semibold mb-1">
              {t("accountManager.importProblems")}
            </div>
            <div className="text-red-300 text-xs max-h-20 overflow-y-auto space-y-1">
              {importErrors.map((error, index) => (
                <div key={index}>• {error}</div>
              ))}
            </div>
            <button
              onClick={() => setImportErrors([])}
              className="mt-2 text-xs text-red-300 hover:text-red-200 underline"
            >
              {t("accountManager.close")}
            </button>
          </div>
        )}

        {isAdding ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={newAccount}
              onChange={(e) => setNewAccount(e.target.value.replace(/\D/g, ""))}
              onKeyPress={handleKeyPress}
              placeholder={t("accountManager.inputPlaceholder") as string}
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              autoFocus
            />
            <button
              onClick={handleAddAccount}
              disabled={!newAccount.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors whitespace-nowrap"
            >
              {t("accountManager.confirm")}
            </button>
            <button
              onClick={() => {
                setNewAccount("");
                setIsAdding(false);
              }}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors whitespace-nowrap"
            >
              {t("accountManager.cancel")}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-600 hover:border-blue-500 text-gray-400 hover:text-blue-400 rounded-lg transition-colors"
            disabled={isImporting}
          >
            <Plus className="w-5 h-5" />
            {isImporting
              ? importTotal > 0
                ? t("accountManager.importProgress", {
                    remaining: importRemaining,
                    total: importTotal,
                  })
                : t("accountManager.importing")
              : t("accountManager.add")}
          </button>
        )}
      </div>
    </div>
  );
};

export default AccountManager;
