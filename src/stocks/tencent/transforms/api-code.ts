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
  TENCENT_SZ,
  TENCENT_SH,
  TENCENT_HK,
  TENCENT_US,
} from "../../../stocks/tencent/utils/constant";

/**
 * 【腾讯】股票代码转换统一代码
 */
class TencentApiCodeTransform extends BaseApiCodeTransform {
  /**
   * 交易所股票代码转换统一代码
   * @param code 股票代码
   */
  public transform(code: string): string {
    if (code.indexOf(TENCENT_SZ) === 0) {
      return this.SZTransform(code);
    }

    if (code.indexOf(TENCENT_SH) === 0) {
      return this.SHTransform(code);
    }

    if (code.indexOf(TENCENT_HK) === 0) {
      return this.HKTransform(code);
    }

    if (code.indexOf(TENCENT_US) === 0) {
      return this.USTransform(code);
    }

    throw new Error(ERROR_API_CODE);
  }

  /**
   * 交易所股票代码组转换统一代码组
   * @param codes 股票代码组
   */
  public transforms(codes: string[]): string[] {
    return super.transforms(codes);
  }

  /**
   * 深交所股票代码转换统一代码
   * @param code 股票代码
   */
  public SZTransform(code: string): string {
    if (!code.includes(TENCENT_SZ)) {
      throw new Error(ERROR_API_CODE);
    }

    return COMMON_SZ + code.replace(TENCENT_SZ, "");
  }

  /**
   * 上交所股票代码转换统一代码
   * @param code 股票代码
   */
  public SHTransform(code: string): string {
    if (!code.includes(TENCENT_SH)) {
      throw new Error(ERROR_API_CODE);
    }

    return COMMON_SH + code.replace(TENCENT_SH, "");
  }

  /**
   * 港交所股票代码转换统一代码
   * @param code 股票代码
   */
  public HKTransform(code: string): string {
    if (!code.includes(TENCENT_HK)) {
      throw new Error(ERROR_API_CODE);
    }

    return COMMON_HK + code.replace(TENCENT_HK, "");
  }

  /**
   * 美交所股票代码转换统一代码
   * @param code 股票代码
   */
  public USTransform(code: string): string {
    if (!code.includes(TENCENT_US)) {
      throw new Error(ERROR_API_CODE);
    }

    return COMMON_US + code.replace(TENCENT_US, "");
  }
}

export default TencentApiCodeTransform;
