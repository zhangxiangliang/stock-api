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
  XUEQIU_SZ,
  XUEQIU_SH,
  XUEQIU_HK,
  XUEQIU_US,
} from "../../../stocks/xueqiu/utils/constant";

/**
 * 【雪球】统一代码转换股票代码
 */
class XueqiuCommonCodeTransform extends BaseCommonCodeTransform {
  /**
   * 交易所统一代码转换股票代码
   * @param code 统一代码
   */
  public transform(code: string): string {
    return super.transform(code);
  }

  /**
   * 交易所股 统一代码 转换 票组代码
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
    if (!code.includes(COMMON_SZ)) {
      throw new Error(ERROR_COMMON_CODE);
    }

    return XUEQIU_SZ + code.replace(COMMON_SZ, "");
  }

  /**
   * 上交所统一代码转换股票代码
   * @param code 统一代码
   */
  public SHTransform(code: string): string {
    if (!code.includes(COMMON_SH)) {
      throw new Error(ERROR_COMMON_CODE);
    }

    return XUEQIU_SH + code.replace(COMMON_SH, "");
  }

  /**
   * 港交所统一代码转换股票代码
   * @param code 统一代码
   */
  public HKTransform(code: string): string {
    if (!code.includes(COMMON_HK)) {
      throw new Error(ERROR_COMMON_CODE);
    }

    return XUEQIU_HK + code.replace(COMMON_HK, "");
  }

  /**
   * 美交所统一代码转换股票代码
   * @param code 统一代码
   */
  public USTransform(code: string): string {
    if (!code.includes(COMMON_US)) {
      throw new Error(ERROR_COMMON_CODE);
    }

    return XUEQIU_US + code.replace(COMMON_US, "");
  }
}

export default XueqiuCommonCodeTransform;
