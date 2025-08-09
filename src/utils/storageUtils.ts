import type { Account, PersistedAccount } from "../types";
import { STORAGE_KEYS } from "../types";

// 通用 localStorage 操作
export const storage = {
  // 保存數據到 localStorage
  set: <T>(key: string, data: T): void => {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error(`Failed to save to localStorage:`, error);
    }
  },

  // 從 localStorage 讀取數據
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Failed to read from localStorage:`, error);
      return defaultValue;
    }
  },

  // 從 localStorage 移除數據
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove from localStorage:`, error);
    }
  },

  // 清空 localStorage
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error(`Failed to clear localStorage:`, error);
    }
  },

  // 檢查 localStorage 是否可用
  isAvailable: (): boolean => {
    try {
      const testKey = "__test__";
      localStorage.setItem(testKey, "test");
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  },
};

// 帳號相關的 localStorage 操作
export const accountStorage = {
  // 保存帳號清單
  saveAccounts: (accounts: Account[] | PersistedAccount[]): void => {
    storage.set(STORAGE_KEYS.ACCOUNTS, accounts);
  },

  // 讀取帳號清單
  loadAccounts: (): Account[] => {
    return storage.get(STORAGE_KEYS.ACCOUNTS, [] as Account[]);
  },

  // 清除帳號清單
  clearAccounts: (): void => {
    storage.remove(STORAGE_KEYS.ACCOUNTS);
  },

  // 添加單個帳號
  addAccount: (account: Account): void => {
    const accounts = accountStorage.loadAccounts();
    const exists = accounts.some(
      (acc) => acc.accountNumber === account.accountNumber
    );

    if (!exists) {
      accounts.push(account);
      accountStorage.saveAccounts(accounts);
    }
  },

  // 更新單個帳號
  updateAccount: (accountId: string, updates: Partial<Account>): void => {
    const accounts = accountStorage.loadAccounts();
    const index = accounts.findIndex((acc) => acc.id === accountId);

    if (index !== -1) {
      accounts[index] = { ...accounts[index], ...updates };
      accountStorage.saveAccounts(accounts);
    }
  },

  // 刪除單個帳號
  deleteAccount: (accountId: string): void => {
    const accounts = accountStorage.loadAccounts();
    const filteredAccounts = accounts.filter((acc) => acc.id !== accountId);
    accountStorage.saveAccounts(filteredAccounts);
  },
};

// 自動保存 Hook 的輔助函數
export const createAutoSave = <T>(
  key: string,
  data: T,
  debounceMs: number = 1000
): (() => void) => {
  const timeoutId = setTimeout(() => {
    storage.set(key, data);
  }, debounceMs);

  // 清除之前的 timeout (debounce)
  return () => clearTimeout(timeoutId);
};
