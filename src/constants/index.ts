/**
 * API 端點常數
 */
export const API_ENDPOINTS = {
  GIFT_CODE: "https://kingshot-giftcode.centurygame.com/api/gift_code",
  PLAYER_INFO: "https://kingshot-giftcode.centurygame.com/api/player",
} as const;

/**
 * API 錯誤代碼
 */
export const API_ERROR_CODES = {
  ACCOUNT_NOT_EXISTS: 40004,
  GIFT_CODE_ALREADY_CLAIMED: 40008,
  GIFT_CODE_NOT_EXISTS: 40014,
  GIFT_CODE_QUOTA_EXCEEDED: 40005,
  GIFT_CODE_EXPIRED: 40007,
} as const;

/**
 * API 請求 Headers
 */
export const DEFAULT_HEADERS = {
  accept: "application/json, text/plain, */*",
  "accept-language":
    "zh-TW,zh;q=0.9,zh-HK;q=0.8,zh-CN;q=0.7,en;q=0.6,en-US;q=0.5",
  "content-type": "application/x-www-form-urlencoded",
  priority: "u=1, i",
  "sec-ch-ua":
    '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"macOS"',
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-site",
} as const;

/**
 * 網站 Referrer
 */
export const REFERRER = "https://ks-giftcode.centurygame.com/" as const;
