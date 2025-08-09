/**
 * 玩家資訊介面定義
 */
export interface PlayerInfo {
  fid: number; // 玩家 ID
  nickname: string; // 玩家暱稱
  kid: number; // 王國 ID
  stove_lv: number; // 主堡等級數值
  stove_lv_content: string; // 主堡等級圖示 URL
  avatar_image: string; // 玩家頭像 URL
  total_recharge_amount: number; // 總充值金額
}

/**
 * 帳號狀態類型
 */
export type AccountStatus =
  | "idle"
  | "processing"
  | "success"
  | "error"
  | "validating";

/**
 * 帳號介面定義
 */
export interface Account {
  id: string; // 唯一識別碼
  accountNumber: string; // 帳號號碼
  status: AccountStatus; // 帳號狀態
  lastResult?: string; // 最後操作結果訊息
  playerInfo?: PlayerInfo; // 玩家資訊（查詢成功後才有）
  isValidated: boolean; // 是否已驗證
}

/**
 * Gift Code 處理結果
 */
export interface GiftCodeResult {
  accountId: string; // 帳號 ID
  accountNumber: string; // 帳號號碼
  success: boolean; // 是否成功
  message: string; // 結果訊息
  code?: string; // Gift Code（可選）
}

/**
 * Alert 類型
 */
export type AlertType = "error" | "warning" | "info" | "success";

/**
 * Alert 介面定義
 */
export interface AlertState {
  message: string;
  type: AlertType;
  isVisible: boolean;
}

/**
 * API 回應基礎介面
 */
export interface BaseApiResponse {
  code: number;
  msg: string;
  err_code: string | number;
}

/**
 * 本地儲存鍵值常數
 */
export const STORAGE_KEYS = {
  ACCOUNTS: "kingshot-gift-code-accounts",
} as const;

/**
 * PersistedAccount 類型，描述儲存時保留的最小欄位
 */
export interface PersistedAccount {
  id: string;
  accountNumber: string;
  status: "idle"; // 總是以 idle 形式儲存
  isValidated: boolean;
  playerInfo?: PlayerInfo;
}
