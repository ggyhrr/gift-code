import type { Account, AccountStatus } from "../types";

// 統計數據介面
export interface AccountStats {
  total: number;
  validated: number;
  processing: number;
  success: number;
  error: number;
  validationRate: number;
  successRate: number;
  remaining?: number; // 尚未處理的已驗證帳號數 (領取流程中使用)
}

// 計算帳號統計數據
export const calculateAccountStats = (accounts: Account[]): AccountStats => {
  const total = accounts.length;
  const validated = accounts.filter((acc) => acc.isValidated).length;
  // processing 僅代表 Gift Code 處理，不再包含 validating (新增/驗證過程不影響右側進度顯示)
  const processing = accounts.filter(
    (acc) => acc.status === "processing"
  ).length;
  const success = accounts.filter((acc) => acc.status === "success").length;
  const error = accounts.filter((acc) => acc.status === "error").length;
  const remaining = accounts.filter(
    (acc) =>
      acc.isValidated &&
      !["success", "error", "processing"].includes(acc.status)
  ).length;

  const validationRate = total > 0 ? (validated / total) * 100 : 0;
  const successRate = validated > 0 ? (success / validated) * 100 : 0;

  return {
    total,
    validated,
    processing,
    success,
    error,
    validationRate,
    successRate,
    remaining,
  };
};

// 按狀態分組帳號
export const groupAccountsByStatus = (
  accounts: Account[]
): Record<AccountStatus, Account[]> => {
  const groups: Record<AccountStatus, Account[]> = {
    idle: [],
    processing: [],
    success: [],
    error: [],
    validating: [],
  };

  accounts.forEach((account) => {
    groups[account.status].push(account);
  });

  return groups;
};

// 計算進度百分比
export const calculateProgress = (completed: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

// 格式化百分比
export const formatPercentage = (
  value: number,
  decimals: number = 1
): string => {
  return value.toFixed(decimals) + "%";
};

// 計算處理時間估算
export const estimateProcessingTime = (
  remainingAccounts: number,
  averageTimePerAccount: number = 2000 // 預設每個帳號處理時間 (毫秒)
): string => {
  const totalMs = remainingAccounts * averageTimePerAccount;
  const totalSeconds = Math.ceil(totalMs / 1000);

  if (totalSeconds < 60) {
    return `約 ${totalSeconds} 秒`;
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (seconds === 0) {
    return `約 ${minutes} 分鐘`;
  }

  return `約 ${minutes} 分 ${seconds} 秒`;
};

// 檢查是否有進行中的操作
export const hasActiveOperations = (accounts: Account[]): boolean => {
  return accounts.some(
    (acc) => acc.status === "processing" || acc.status === "validating"
  );
};

// 獲取可提交 Gift Code 的帳號數量
export const getEligibleAccountsCount = (accounts: Account[]): number => {
  return accounts.filter((acc) => acc.isValidated).length;
};

// 獲取需要驗證的帳號
export const getUnvalidatedAccounts = (accounts: Account[]): Account[] => {
  return accounts.filter((acc) => !acc.isValidated && acc.status !== "error");
};

// 檢查是否所有帳號都已處理完成
export const areAllAccountsProcessed = (accounts: Account[]): boolean => {
  return accounts.every(
    (acc) =>
      acc.status === "success" ||
      acc.status === "error" ||
      acc.status === "idle"
  );
};
