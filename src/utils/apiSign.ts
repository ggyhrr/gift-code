import CryptoJS from "crypto-js";

/**
 * API 簽名生成器
 * 根據指定的邏輯生成 API 請求所需的簽名
 */

interface SignParams {
  [key: string]: string | number | boolean | object | null | undefined;
}

/**
 * 生成 API 請求的簽名
 * @param params - API 請求參數物件
 * @param salt - 鹽值，預設為指定的鹽值
 * @returns 生成的簽名字串
 */
export function generateSign(
  params: SignParams,
  salt: string = "mN4!pQs6JrYwV9"
): string {
  // 取得所有鍵值並排序
  const keys = Object.keys(params).sort();

  // 構建查詢字串
  const query = keys
    .map((key) => {
      const value =
        typeof params[key] === "object"
          ? JSON.stringify(params[key])
          : params[key];
      return `${key}=${value}`;
    })
    .join("&");

  // 組合字串 = 查詢字串 + 鹽值
  const str = query + salt;

  // 使用 MD5 生成雜湊
  const hash = CryptoJS.MD5(str);

  // 回傳十六進位字串
  return hash.toString(CryptoJS.enc.Hex);
}

/**
 * 建立帶有簽名的完整請求參數
 * @param params - 原始請求參數
 * @param salt - 鹽值（可選）
 * @returns 包含簽名的完整參數物件
 */
export function createSignedParams(
  params: SignParams,
  salt?: string
): SignParams & { sign: string } {
  const sign = generateSign(params, salt);
  return {
    ...params,
    sign,
  };
}

/**
 * 驗證簽名是否正確
 * @param params - 包含簽名的參數物件
 * @param salt - 鹽值（可選）
 * @returns 簽名是否有效
 */
export function verifySign(
  params: SignParams & { sign: string },
  salt?: string
): boolean {
  const { sign, ...paramsWithoutSign } = params;
  const expectedSign = generateSign(paramsWithoutSign, salt);
  return sign === expectedSign;
}

// 使用範例：
/*
// 基本使用
const params = {
  userId: '12345',
  action: 'getGiftCode',
  code: 'ABC123',
  timestamp: Math.floor(Date.now() / 1000)
};

// 生成簽名
const signature = generateSign(params);
console.log('Generated sign:', signature);

// 建立帶有簽名的完整參數
const signedParams = createSignedParams(params);
console.log('Signed params:', signedParams);

// 驗證簽名
const isValid = verifySign(signedParams);
console.log('Signature valid:', isValid);
*/
