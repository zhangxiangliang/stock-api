// Stocks
import BaseApiCodeTransform from "../../../stocks/base/transforms/api-code";

// Utils
import { ERROR_API_CODE } from "../../../utils/constant";
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
 * 网易股票代码转统一代码
 */
class NeteaseApiCodeTransform extends BaseApiCodeTransform {
  /**
   * 股票代码转统一代码
   * @param code 股票代码
   */
  public transform(code: string): string {
    if (code.indexOf(NETEASE_SZ) === 0) {
      return this.SZTransform(code);
    }

    if (code.indexOf(NETEASE_SH) === 0) {
      return this.SHTransform(code);
    }

    if (code.indexOf(NETEASE_HK) === 0) {
      return this.HKTransform(code);
    }

    if (code.indexOf(NETEASE_US) === 0) {
      return this.USTransform(code);
    }

    throw new Error(ERROR_API_CODE);
  }

  /**
   * 股票代码组转统一代码组
   * @param codes 股票代码组
   */
  public transforms(codes: string[]): string[] {
    return codes.map((code) => this.transform(code));
  }

  /**
   * 深交所股票代码转统一代码
   * @param code 股票代码
   */
  public SZTransform(code: string): string {
    if (code.indexOf(NETEASE_SZ) !== 0) {
      throw new Error(ERROR_API_CODE);
    }

    return COMMON_SZ + code.replace(NETEASE_SZ, "");
  }

  /**
   * 上交所股票代码转统一代码
   * @param code 股票代码
   */
  public SHTransform(code: string): string {
    if (!code.includes(NETEASE_SH)) {
      throw new Error(ERROR_API_CODE);
    }

    return COMMON_SH + code.replace(NETEASE_SH, "");
  }

  /**
   * 港交所股票代码转统一代码
   * @param code 股票代码
   */
  public HKTransform(code: string): string {
    if (!code.includes(NETEASE_HK)) {
      throw new Error(ERROR_API_CODE);
    }

    return COMMON_HK + code.replace(NETEASE_HK, "");
  }

  /**
   * 美交所股票代码转统一代码
   * @param code 股票代码
   */
  public USTransform(code: string): string {
    if (!code.includes(NETEASE_US)) {
      throw new Error(ERROR_API_CODE);
    }

    return COMMON_US + code.replace(NETEASE_US, "");
  }
}

export default NeteaseApiCodeTransform;
