// Utils
import {
  COMMON_SH,
  COMMON_SZ,
  COMMON_HK,
  COMMON_US,
} from "../../../stocks/base/utils/constant";
import {
  ERROR_UNDEFINED_API_CODE,
  ERROR_UNDEFINED_SZ_API_CODE,
  ERROR_UNDEFINED_SH_API_CODE,
  ERROR_UNDEFINED_HK_API_CODE,
  ERROR_UNDEFINED_US_API_CODE,
  ERROR_API_CODE,
} from "../../../utils/constant";

// Types
import ApiCodeTransform from "../../../types/stocks/transforms/api-code";

/**
 * 【基础】股票代码转换统一代码
 */
class BaseApiCodeTransform implements ApiCodeTransform {
  /**
   * 股票代码转换统一代码
   * @param code 股票代码
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

    throw new Error(ERROR_API_CODE);
  }

  /**
   * 股票代码组转换统一代码组
   * @param codes 股票代码组
   */
  public transforms(codes: string[]): string[] {
    return codes.map((code) => this.transform(code));
  }

  /**
   * 深交所股票代码转换统一代码
   * @param code 股票代码
   */
  public SZTransform(code: string): string {
    throw new Error(ERROR_UNDEFINED_SZ_API_CODE);
  }

  /**
   * 上交所股票代码转换统一代码
   * @param code 股票代码
   */
  public SHTransform(code: string): string {
    throw new Error(ERROR_UNDEFINED_SH_API_CODE);
  }

  /**
   * 港交所股票代码转换统一代码
   * @param code 股票代码
   */
  public HKTransform(code: string): string {
    throw new Error(ERROR_UNDEFINED_HK_API_CODE);
  }

  /**
   * 美交所股票代码转换统一代码
   * @param code 股票代码
   */
  public USTransform(code: string): string {
    throw new Error(ERROR_UNDEFINED_US_API_CODE);
  }
}

export default BaseApiCodeTransform;
