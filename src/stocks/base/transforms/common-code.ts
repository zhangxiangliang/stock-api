// Utils
import {
  ERROR_COMMON_CODE,
  ERROR_UNDEFINED_SZ_COMMON_CODE,
  ERROR_UNDEFINED_SH_COMMON_CODE,
  ERROR_UNDEFINED_HK_COMMON_CODE,
  ERROR_UNDEFINED_US_COMMON_CODE,
} from "../../../utils/constant";

// Types
import CommonCodeTransform from "../../../types/stocks/transforms/common-code";
import { COMMON_SH, COMMON_SZ, COMMON_HK, COMMON_US } from "../utils/constant";

/**
 * 【基础】统一代码转换股票代码
 */
class BaseCommonCodeTransform implements CommonCodeTransform {
  /**
   * 交易所统一代码转换股票代码
   * @param code 统一代码
   */
  public transform(code: string): string {
    if (code.indexOf(COMMON_SH) === 0) {
      return this.SHTransform(code);
    }

    if (code.indexOf(COMMON_SZ) === 0) {
      return this.SZTransform(code);
    }

    if (code.indexOf(COMMON_HK) === 0) {
      return this.HKTransform(code);
    }

    if (code.indexOf(COMMON_US) === 0) {
      return this.USTransform(code);
    }

    throw new Error(ERROR_COMMON_CODE);
  }

  /**
   * 交易所统一代码组转股票代码组
   * @param codes 统一代码组
   */
  public transforms(codes: string[]): string[] {
    return codes.map((code) => this.transform(code));
  }

  /**
   * 深交所统一代码转换股票代码
   * @param code 统一代码
   */
  public SZTransform(code: string): string {
    throw new Error(ERROR_UNDEFINED_SZ_COMMON_CODE);
  }

  /**
   * 上交所统一代码转换股票代码
   * @param code 统一代码
   */
  public SHTransform(code: string): string {
    throw new Error(ERROR_UNDEFINED_SH_COMMON_CODE);
  }

  /**
   * 港交所统一代码转换股票代码
   * @param code 统一代码
   */
  public HKTransform(code: string): string {
    throw new Error(ERROR_UNDEFINED_HK_COMMON_CODE);
  }

  /**
   * 美交所统一代码转换股票代码
   * @param code 统一代码
   */
  public USTransform(code: string): string {
    throw new Error(ERROR_UNDEFINED_US_COMMON_CODE);
  }
}

export default BaseCommonCodeTransform;
