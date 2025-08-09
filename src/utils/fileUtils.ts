import type { Account } from "../types";

// 讀取文字檔案內容
export const readTextFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      resolve(content);
    };

    reader.onerror = () => {
      reject(new Error("檔案讀取失敗"));
    };

    reader.readAsText(file, "UTF-8");
  });
};

// 從文字內容解析帳號列表
export const parseAccountsFromText = (text: string): string[] => {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#")); // 過濾空行和註解行
};

// 驗證帳號格式 (可以根據需求調整)
export const validateAccountFormat = (account: string): boolean => {
  // 基本格式驗證：只包含字母、數字和常見符號
  const accountRegex = /^[a-zA-Z0-9_\-@.]+$/;
  return (
    accountRegex.test(account) && account.length >= 3 && account.length <= 50
  );
};

// 匯出帳號到文字檔案
export const exportAccountsToFile = (
  accounts: Account[],
  filename: string = "accounts.txt",
  includeStatus: boolean = false
) => {
  let content = "";

  if (includeStatus) {
    content = accounts
      .map((account) => {
        const status = account.isValidated ? "✓" : "✗";
        const playerName = account.playerInfo?.nickname || "Unknown";
        return `${account.accountNumber} [${status}] ${playerName}`;
      })
      .join("\n");
  } else {
    content = accounts.map((account) => account.accountNumber).join("\n");
  }

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

// 批量驗證帳號格式
export const validateAccountList = (
  accounts: string[]
): {
  valid: string[];
  invalid: string[];
  duplicates: string[];
} => {
  const valid: string[] = [];
  const invalid: string[] = [];
  const seen = new Set<string>();
  const duplicates: string[] = [];

  accounts.forEach((account) => {
    if (seen.has(account)) {
      duplicates.push(account);
      return;
    }

    seen.add(account);

    if (validateAccountFormat(account)) {
      valid.push(account);
    } else {
      invalid.push(account);
    }
  });

  return { valid, invalid, duplicates };
};

// 格式化檔案大小
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// 檢查檔案類型
export const isTextFile = (file: File): boolean => {
  const textMimeTypes = [
    "text/plain",
    "text/csv",
    "application/csv",
    "text/tab-separated-values",
  ];

  const textExtensions = [".txt", ".csv", ".tsv"];

  return (
    textMimeTypes.includes(file.type) ||
    textExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
  );
};
