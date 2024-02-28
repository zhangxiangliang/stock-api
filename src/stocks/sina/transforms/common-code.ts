// Stocks
import BaseCommonCodeTransform from "../../../stocks/base/transforms/common-code";

// Utils
import { ERROR_COMMON_CODE } from "../../../utils/constant";
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
 * 【新浪】统一代码转换股票代码
 */
class SinaCommonCodeTransform extends BaseCommonCodeTransform {
  /**
   * 交易所统一代码转换股票代码
   * @param code 统一代码
   */
  public transform(code: string): string {
    return super.transform(code);
  }

  /**
   * 交易所统一代码组转换股票代码组
   * @param codes 统一代码组
   */
  public transforms(codes: string[]): string[] {
    return super.transforms(codes);
  }

  /**
   * 深交所统一代码转换股票代码
   * @param code 统一代码
   */
  public SZTransform(code: string): string {
    if (code.indexOf(COMMON_SZ) !== 0) {
      throw new Error(ERROR_COMMON_CODE);
    }

    return SINA_SZ + code.replace(COMMON_SZ, "");
  }

  /**
   * 上交所统一代码转换股票代码
   * @param code 统一代码
   */
  public SHTransform(code: string): string {
    if (code.indexOf(COMMON_SH) !== 0) {
      throw new Error(ERROR_COMMON_CODE);
    }

    return SINA_SH + code.replace(COMMON_SH, "");
  }

  /**
   * 港交所统一代码转换股票代码
   * @param code 统一代码
   */
  public HKTransform(code: string): string {
    if (code.indexOf(COMMON_HK) !== 0) {
      throw new Error(ERROR_COMMON_CODE);
    }

    return SINA_HK + code.replace(COMMON_HK, "");
  }

  /**
   * 美交所统一代码转换股票代码
   * @param code 统一代码
   */
  public USTransform(code: string): string {
    if (code.indexOf(COMMON_US) !== 0) {
      throw new Error(ERROR_COMMON_CODE);
    }

    return SINA_US + code.replace(COMMON_US, "").toLowerCase();
  }
}

export default SinaCommonCodeTransform;
