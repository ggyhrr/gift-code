import { useState, useCallback, useRef, useEffect } from "react";
import type { Account, AccountStatus } from "../types";
import { fetchPlayerInfo, ApiError } from "../utils/playerApi";
import { submitGiftCode, GiftCodeApiError } from "../utils/giftCodeApi";
import { API_ERROR_CODES } from "../constants";
import { useTranslation } from "react-i18next";

export interface UseAccountActionsProps {
  onShowAlert: (
    message: string,
    type?: "error" | "warning" | "info" | "success"
  ) => void;
  delayMs: number; // 動態請求間隔 (帳號驗證與 Gift Code 提交共用)
}

export const useAccountActions = ({
  onShowAlert,
  delayMs,
}: UseAccountActionsProps) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingRemaining, setProcessingRemaining] = useState<number | null>(
    null
  );
  const { t } = useTranslation();
  const accountsRef = useRef<Account[]>([]);
  useEffect(() => {
    accountsRef.current = accounts;
  }, [accounts]);
  // 紀錄使用者在批次驗證過程中刪除的帳號 (避免後續請求)
  const cancelledIdsRef = useRef<Set<string>>(new Set());

  // 更新帳號狀態的通用函數
  const updateAccountStatus = useCallback(
    (
      accountId: string,
      status: AccountStatus,
      lastResult?: string,
      playerInfo?: Account["playerInfo"]
    ) => {
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id !== accountId) return acc;
          const resolvedPlayerInfo =
            playerInfo !== undefined ? playerInfo : acc.playerInfo;
          const wasValidated = acc.isValidated;
          const nowValidated =
            wasValidated || (status === "idle" && !!resolvedPlayerInfo);
          return {
            ...acc,
            status,
            lastResult,
            playerInfo: resolvedPlayerInfo,
            isValidated: nowValidated,
          };
        })
      );
    },
    []
  );

  // 批量更新帳號狀態
  const updateAccountStatusBatch = useCallback(
    (
      updates: Array<{
        accountId: string;
        status: AccountStatus;
        lastResult?: string;
        playerInfo?: Account["playerInfo"];
      }>
    ) => {
      setAccounts((prev) =>
        prev.map((acc) => {
          const update = updates.find((u) => u.accountId === acc.id);
          if (!update) return acc;
          const resolvedPlayerInfo =
            update.playerInfo !== undefined
              ? update.playerInfo
              : acc.playerInfo;
          const wasValidated = acc.isValidated;
          const nowValidated =
            wasValidated || (update.status === "idle" && !!resolvedPlayerInfo);
          return {
            ...acc,
            status: update.status,
            lastResult: update.lastResult,
            playerInfo: resolvedPlayerInfo,
            isValidated: nowValidated,
          };
        })
      );
    },
    []
  );

  // 添加帳號
  const addAccount = useCallback(
    async (
      accountNumber: string,
      options?: { silent?: boolean }
    ): Promise<boolean> => {
      const silent = options?.silent === true;
      // 檢查帳號是否已存在
      const existingAccount = accounts.find(
        (account) => account.accountNumber === accountNumber
      );

      if (existingAccount) {
        if (!silent) {
          onShowAlert(
            t("messages.accountExists", { account: accountNumber }),
            "warning"
          );
        }
        return false;
      }

      // 創建臨時帳號
      const tempAccount: Account = {
        id: Date.now().toString(),
        accountNumber,
        status: "validating",
        lastResult: t("messages.accountQuerying"),
        isValidated: false,
      };

      setAccounts((prev) => [...prev, tempAccount]);

      try {
        const playerInfo = await fetchPlayerInfo(accountNumber);
        updateAccountStatus(tempAccount.id, "idle", undefined, playerInfo);
        return true;
      } catch (error) {
        let errorMessage = t("messages.queryFailed");

        if (error instanceof ApiError) {
          if (error.errorCode === API_ERROR_CODES.ACCOUNT_NOT_EXISTS) {
            errorMessage = t("messages.accountNotExists");
          } else {
            errorMessage = error.message;
          }
        }

        setAccounts((prev) => prev.filter((acc) => acc.id !== tempAccount.id));
        if (!silent) {
          onShowAlert(
            t("messages.accountAddFailed", {
              account: accountNumber,
              error: errorMessage,
            }),
            "error"
          );
        }
        return false;
      }
    },
    [accounts, onShowAlert, updateAccountStatus, t]
  );

  // 刪除帳號
  const deleteAccount = useCallback((id: string) => {
    cancelledIdsRef.current.add(id); // 標記為已取消，批次驗證將跳過
    setAccounts((prev) => prev.filter((account) => account.id !== id));
  }, []);

  // 批量驗證帳號
  const validateAccounts = useCallback(
    async (accountsToValidate: Account[]) => {
      console.log(`開始查詢 ${accountsToValidate.length} 個帳號的玩家資訊`);

      let processed = 0;

      for (let i = 0; i < accountsToValidate.length; i++) {
        const account = accountsToValidate[i];

        // 如果帳號在過程中被刪除，跳過
        if (cancelledIdsRef.current.has(account.id)) {
          console.log(`帳號 ${account.accountNumber} 已刪除，跳過後續查詢`);
          continue;
        }

        processed += 1;
        const dynamicTotal = accountsToValidate.filter(
          (a) => !cancelledIdsRef.current.has(a.id)
        ).length;

        // 標記為驗證中
        updateAccountStatus(
          account.id,
          "validating",
          t("messages.playerInfoQueryingProgress", {
            current: processed,
            total: dynamicTotal,
          })
        );

        try {
          const playerInfo = await fetchPlayerInfo(account.accountNumber);
          // 再次確認未被刪除
          if (!cancelledIdsRef.current.has(account.id)) {
            updateAccountStatus(account.id, "idle", undefined, playerInfo);
          }
        } catch (error) {
          let errorMessage = t("messages.validationFailed");

          if (error instanceof ApiError) {
            if (error.errorCode === API_ERROR_CODES.ACCOUNT_NOT_EXISTS) {
              errorMessage = t("messages.accountNotExists");
            } else {
              errorMessage = error.message;
            }
          }

          if (!cancelledIdsRef.current.has(account.id)) {
            updateAccountStatus(account.id, "error", errorMessage);
          }
        }

        // 是否需要等待下一個 (確認還有未取消的後續帳號)
        if (i < accountsToValidate.length - 1) {
          const hasRemaining = accountsToValidate
            .slice(i + 1)
            .some((a) => !cancelledIdsRef.current.has(a.id));
          if (hasRemaining) {
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          } else {
            break; // 沒有剩餘可驗證帳號，提前結束
          }
        }
      }

      console.log("帳號玩家資訊查詢完成 (跳過已刪除帳號)");
      // 批次完成後清空取消集合，避免影響之後的操作
      cancelledIdsRef.current.clear();
    },
    [updateAccountStatus, t, delayMs]
  );

  // 提交 Gift Code
  const submitGiftCodeToAccounts = useCallback(
    async (code: string) => {
      if (accounts.length === 0) {
        onShowAlert(t("messages.needAddAccount"), "warning");
        return;
      }

      // 只考慮已驗證帳號
      const validatedAccounts = accounts.filter(
        (account) => account.isValidated
      );
      if (validatedAccounts.length === 0) {
        onShowAlert(t("messages.noValidatedAccounts"), "warning");
        return;
      }

      // 在新一輪開始前清空上一輪的成功 / 失敗結果 (保持驗證狀態與玩家資訊)
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.status === "success" || acc.status === "error") {
            return { ...acc, status: "idle", lastResult: undefined };
          }
          return acc;
        })
      );

      setIsProcessing(true);
      setProcessingRemaining(validatedAccounts.length);

      for (let i = 0; i < validatedAccounts.length; i++) {
        const account = validatedAccounts[i];

        // 重新查詢當前帳號最新玩家資訊
        updateAccountStatus(
          account.id,
          "processing",
          t("messages.accountQuerying")
        );
        let refreshedInfo: Account["playerInfo"] | undefined = undefined;
        try {
          refreshedInfo = await fetchPlayerInfo(account.accountNumber);
          updateAccountStatus(
            account.id,
            "processing",
            undefined,
            refreshedInfo
          );
        } catch (infoErr) {
          let infoErrorMessage = t("messages.validationFailed");
          if (infoErr instanceof ApiError) {
            if (infoErr.errorCode === API_ERROR_CODES.ACCOUNT_NOT_EXISTS) {
              infoErrorMessage = t("messages.accountNotExists");
            } else {
              infoErrorMessage = infoErr.message;
            }
          }
          updateAccountStatus(account.id, "error", infoErrorMessage);
          // 完成當前帳號（查詢失敗）立即遞減剩餘數
          setProcessingRemaining((prev) =>
            prev !== null ? Math.max(prev - 1, 0) : 0
          );
          if (i < validatedAccounts.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          }
          continue;
        }

        try {
          if (!account.isValidated || !refreshedInfo) {
            throw new Error(t("messages.accountNotValidated"));
          }

          await submitGiftCode(account.accountNumber, code);
          updateAccountStatus(
            account.id,
            "success",
            t("messages.redeemSuccess")
          );
        } catch (error) {
          let errorMessage = t("messages.redeemFailed");

          if (error instanceof GiftCodeApiError) {
            errorMessage = error.message;
          } else if (error instanceof Error) {
            errorMessage = error.message;
          }

          updateAccountStatus(account.id, "error", errorMessage);
        }

        // 完成本帳號（成功或失敗）立即遞減剩餘數
        setProcessingRemaining((prev) =>
          prev !== null ? Math.max(prev - 1, 0) : 0
        );

        if (i < validatedAccounts.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }

      setIsProcessing(false);
      setTimeout(() => setProcessingRemaining(0), 0); // 確保 UI 立即更新為 0
    },
    [accounts, onShowAlert, updateAccountStatus, t, delayMs]
  );

  return {
    accounts,
    setAccounts,
    isProcessing,
    processingRemaining,
    addAccount,
    deleteAccount,
    validateAccounts,
    submitGiftCodeToAccounts,
    updateAccountStatus,
    updateAccountStatusBatch,
  };
};
