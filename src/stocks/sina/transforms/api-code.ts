// Stocks
import BaseCommonCodeTransform from "../../../stocks/base/transforms/common-code";

// Utils
import { ERROR_API_CODE } from "../../../utils/constant";
import {
  SINA_SZ,
  SINA_SH,
  SINA_HK,
  SINA_US,
} from "../../../stocks/sina/utils/constant";
import {
  COMMON_SH,
  COMMON_SZ,
  COMMON_HK,
  COMMON_US,
} from "../../../stocks/base/utils/constant";

/**
 * 【新浪】股票代码转换统一代码
 */
class SinaCommonCodeTransform extends BaseCommonCodeTransform {
  /**
   * 交易所股票代码转换统一代码
   * @param code 股票代码
   */
  public transform(code: string): string {
    if (code.indexOf(SINA_SZ) === 0) {
      return this.SZTransform(code);
    }

    if (code.indexOf(SINA_SH) === 0) {
      return this.SHTransform(code);
    }

    if (code.indexOf(SINA_HK) === 0) {
      return this.HKTransform(code);
    }

    if (code.indexOf(SINA_US) === 0) {
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
    if (code.indexOf(SINA_SZ) !== 0) {
      throw new Error(ERROR_API_CODE);
    }

    return COMMON_SZ + code.replace(SINA_SZ, "");
  }

  /**
   * 上交所股票代码转换统一代码
   * @param code 股票代码
   */
  public SHTransform(code: string): string {
    if (code.indexOf(SINA_SH) !== 0) {
      throw new Error(ERROR_API_CODE);
    }

    return COMMON_SH + code.replace(SINA_SH, "");
  }

  /**
   * 港交所股票代码转换统一代码
   * @param code 股票代码
   */
  public HKTransform(code: string): string {
    if (code.indexOf(SINA_HK) !== 0) {
      throw new Error(ERROR_API_CODE);
    }

    return COMMON_HK + code.replace(SINA_HK, "");
  }

  /**
   * 美交所股票代码转换统一代码
   * @param code 股票代码
   */
  public USTransform(code: string): string {
    if (code.indexOf(SINA_US) !== 0) {
      throw new Error(ERROR_API_CODE);
    }

    return COMMON_US + code.replace(SINA_US, "").toLowerCase();
  }
}

export default SinaCommonCodeTransform;
