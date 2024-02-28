// Stocks
import BaseCommonCodeTransform from "../../../stocks/base/transforms/common-code";

// Utils
import { ERROR_COMMON_CODE } from "../../../utils/constant";
import {
  COMMON_SH,
  COMMON_SZ,
  COMMON_HK,
  COMMON_US,
} from "../../../stocks/base/utils/constant";
import {
  NETEASE_SZ,
  NETEASE_SH,
  NETEASE_HK,
  NETEASE_US,
} from "../../../stocks/netease/utils/constant";

/**
 * 【网易】统一代码转股票代码
 */
class NeteaseCommonCodeTransform extends BaseCommonCodeTransform {
  /**
   * 统一代码转股票代码
   * @param code 统一代码
   */
  public transform(code: string): string {
    return super.transform(code);
  }

  /**
   * 统一代码组转换股票代码组
   * @param codes 统一代码组
   */
  public transforms(codes: string[]): string[] {
    return super.transforms(codes);
  }

  /**
   * 深交所统一代码转股票代码
   * @param code 统一代码
   */
  public SZTransform(code: string): string {
    if (!code.includes(COMMON_SZ)) {
      throw new Error(ERROR_COMMON_CODE);
    }

    return NETEASE_SZ + code.replace(COMMON_SZ, "");
  }

  /**
   * 上交所统一代码转股票代码
   * @param code 统一代码
   */
  public SHTransform(code: string): string {
    if (!code.includes(COMMON_SH)) {
      throw new Error(ERROR_COMMON_CODE);
    }

    return NETEASE_SH + code.replace(COMMON_SH, "");
  }

  /**
   * 港交所统一代码转股票代码
   * @param code 统一代码
   */
  public HKTransform(code: string): string {
    if (!code.includes(COMMON_HK)) {
      throw new Error(ERROR_COMMON_CODE);
    }

    return NETEASE_HK + code.replace(COMMON_HK, "");
  }

  /**
   * 美交所统一代码转股票代码
   * @param code 统一代码
   */
  public USTransform(code: string): string {
    if (!code.includes(COMMON_US)) {
      throw new Error(ERROR_COMMON_CODE);
    }

    return NETEASE_US + code.replace(COMMON_US, "");
  }
}

export default NeteaseCommonCodeTransform;
