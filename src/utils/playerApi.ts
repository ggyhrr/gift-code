import { generateSign } from "./apiSign";
import type { PlayerInfo, BaseApiResponse } from "../types";
import { API_ENDPOINTS, DEFAULT_HEADERS, REFERRER } from "../constants";

/**
 * API 回應介面定義
 */
interface PlayerInfoResponse extends BaseApiResponse {
  data: PlayerInfo | [];
}

/**
 * API 錯誤類型
 */
export class ApiError extends Error {
  public code: number;
  public errorCode: string | number;

  constructor(code: number, message: string, errorCode: string | number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.errorCode = errorCode;
  }
}

/**
 * 查詢玩家資訊
 * @param fid - 玩家 ID (帳號)
 * @returns Promise<PlayerInfo> - 玩家資訊
 * @throws ApiError - 當查詢失敗時拋出錯誤
 */
export async function fetchPlayerInfo(fid: string): Promise<PlayerInfo> {
  const time = Date.now();
  const params = { fid, time };
  const sign = generateSign(params);

  const response = await fetch(API_ENDPOINTS.PLAYER_INFO, {
    headers: DEFAULT_HEADERS,
    referrer: REFERRER,
    body: `sign=${sign}&fid=${fid}&time=${time}`,
    method: "POST",
    mode: "cors",
    credentials: "omit",
  });

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `HTTP Error: ${response.status} ${response.statusText}`,
      response.status
    );
  }

  const data: PlayerInfoResponse = await response.json();

  if (data.code !== 0) {
    throw new ApiError(data.code, data.msg || "Unknown error", data.err_code);
  }

  // 如果 data 是陣列表示查不到資料
  if (Array.isArray(data.data)) {
    throw new ApiError(
      data.code,
      data.msg || "Player not found",
      data.err_code
    );
  }

  return data.data;
}

export type { PlayerInfoResponse };
