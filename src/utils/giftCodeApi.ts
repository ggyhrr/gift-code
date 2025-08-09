import { generateSign } from "./apiSign";
import type { BaseApiResponse } from "../types";
import {
  API_ENDPOINTS,
  API_ERROR_CODES,
  DEFAULT_HEADERS,
  REFERRER,
} from "../constants";
import i18n from "../i18n";

// 專供 API 模組使用的翻譯 helper
const tApi = (key: string, fallback: string, vars?: Record<string, unknown>) =>
  i18n.t(key, { defaultValue: fallback, ...vars });

export interface GiftCodeResponse extends BaseApiResponse {
  data: unknown[];
}

export class GiftCodeApiError extends Error {
  public readonly errorCode: string | number;
  public readonly responseCode: number;

  constructor(
    message: string,
    errorCode: string | number,
    responseCode: number
  ) {
    super(message);
    this.name = "GiftCodeApiError";
    this.errorCode = errorCode;
    this.responseCode = responseCode;
  }
}

/**
 * 提交 Gift Code 領取請求
 * @param accountNumber - 帳號 ID (fid)
 * @param giftCode - Gift Code
 * @returns API 回應
 */
export const submitGiftCode = async (
  accountNumber: string,
  giftCode: string
): Promise<GiftCodeResponse> => {
  try {
    const time = Date.now();
    const params = {
      fid: accountNumber,
      time,
      cdk: giftCode,
      captcha_code: "",
    };
    const sign = generateSign(params);

    const response = await fetch(API_ENDPOINTS.GIFT_CODE, {
      headers: DEFAULT_HEADERS,
      referrer: REFERRER,
      body: `sign=${sign}&fid=${accountNumber}&cdk=${giftCode}&captcha_code=&time=${time}`,
      method: "POST",
      mode: "cors",
      credentials: "omit",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: GiftCodeResponse = await response.json();

    // 檢查 API 回應是否表示錯誤
    if (data.code !== 0) {
      let errorMessage = data.msg;

      switch (data.err_code) {
        case API_ERROR_CODES.GIFT_CODE_ALREADY_CLAIMED:
          errorMessage = tApi("giftCode.alreadyClaimed", "已經領過此禮包碼");
          break;
        case API_ERROR_CODES.GIFT_CODE_NOT_EXISTS:
          errorMessage = tApi("giftCode.notExists", "禮包碼不存在");
          break;
        case API_ERROR_CODES.GIFT_CODE_QUOTA_EXCEEDED:
          errorMessage = tApi("giftCode.quotaExceeded", "禮包碼超過領取次數");
          break;
        case API_ERROR_CODES.GIFT_CODE_EXPIRED:
          errorMessage = tApi("giftCode.expired", "超出領取時間");
          break;
        default:
          errorMessage = tApi("giftCode.failed", data.msg || "領取失敗");
      }

      throw new GiftCodeApiError(errorMessage, data.err_code, data.code);
    }

    return data;
  } catch (error) {
    if (error instanceof GiftCodeApiError) {
      throw error;
    }

    // 網路或其他錯誤
    throw new Error(
      tApi(
        "giftCode.networkError",
        `網路請求失敗: ${
          error instanceof Error ? error.message : String(error)
        }`,
        { error: error instanceof Error ? error.message : String(error) }
      )
    );
  }
};

/**
 * 取得 Gift Code 結果的顯示訊息
 * @param response - API 回應
 * @returns 顯示給用戶的訊息
 */
export const getGiftCodeResultMessage = (
  response: GiftCodeResponse
): string => {
  if (response.code === 0) {
    return tApi("giftCode.successShort", "領取成功！");
  }

  switch (response.err_code) {
    case API_ERROR_CODES.GIFT_CODE_ALREADY_CLAIMED:
      return tApi("giftCode.alreadyClaimedShort", "已經領過");
    case API_ERROR_CODES.GIFT_CODE_NOT_EXISTS:
      return tApi("giftCode.notExistsShort", "禮包碼不存在");
    case API_ERROR_CODES.GIFT_CODE_QUOTA_EXCEEDED:
      return tApi("giftCode.quotaExceededShort", "超過領取次數");
    case API_ERROR_CODES.GIFT_CODE_EXPIRED:
      return tApi("giftCode.expiredShort", "超出領取時間");
    default:
      return tApi("giftCode.failed", response.msg || "領取失敗");
  }
};
