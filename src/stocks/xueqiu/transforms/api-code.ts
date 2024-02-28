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
  XUEQIU_SZ,
  XUEQIU_SH,
  XUEQIU_HK,
  XUEQIU_US,
} from "../../../stocks/xueqiu/utils/constant";

/**
 * 【雪球】股票代码转换统一代码
 */
class XueqiuApiCodeTransform extends BaseApiCodeTransform {
  /**
   * 交易所股票代码转换统一代码
   * @param code 股票代码
   */
  public transform(code: string): string {
    if (code.includes(XUEQIU_SZ)) {
      return this.SZTransform(code);
    }

    if (code.includes(XUEQIU_SH)) {
      return this.SHTransform(code);
    }

    if (code.includes(XUEQIU_HK)) {
      return this.HKTransform(code);
    }

    return this.USTransform(code);
  }

  /**
   * 交易所股票组代码组转换统一代码组
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
    if (!code.includes(XUEQIU_SZ)) {
      throw new Error(ERROR_API_CODE);
    }

    return COMMON_SZ + code.replace(XUEQIU_SZ, "");
  }

  /**
   * 上交所股票代码转换统一代码
   * @param code 股票代码
   */
  public SHTransform(code: string): string {
    if (!code.includes(XUEQIU_SH)) {
      throw new Error(ERROR_API_CODE);
    }

    return COMMON_SH + code.replace(XUEQIU_SH, "");
  }

  /**
   * 港交所股票代码转换统一代码
   * @param code 股票代码
   */
  public HKTransform(code: string): string {
    if (!code.includes(XUEQIU_HK)) {
      throw new Error(ERROR_API_CODE);
    }

    return COMMON_HK + code.replace(XUEQIU_HK, "");
  }

  /**
   * 美交所股票代码转换统一代码
   * @param code 股票代码
   */
  public USTransform(code: string): string {
    if (
      code.includes(XUEQIU_SZ) ||
      code.includes(XUEQIU_SH) ||
      code.includes(XUEQIU_HK)
    ) {
      throw new Error(ERROR_API_CODE);
    }

    return COMMON_US + code.replace(XUEQIU_US, "");
  }
}

export default XueqiuApiCodeTransform;
