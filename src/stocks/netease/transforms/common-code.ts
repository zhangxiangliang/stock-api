// Stocks
import BaseCommonCodeTransform from "@stocks/base/transforms/common-code";

// Utils
import { COMMON_SH, COMMON_SZ, COMMON_HK, COMMON_US } from "@stocks/base/utils/constant";
import { NETEASE_SZ, NETEASE_SH, NETEASE_HK, NETEASE_US } from "@stocks/netease/utils/constant";

/**
 * 【网易】统一代码转股票代码
 */
class NeteaseCommonCodeTransform extends BaseCommonCodeTransform {
  /**
   * 构造函数
   */
  constructor() {
    super();
  }

  /**
   * 交易所统一代码转股票代码
   * @param code 统一代码
   */
  public transform(code: string): string {
    return super.transform(code);
  }

  /**
   * 交易所股票组代码转换
   * @param codes 股票代码
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
      throw new Error("请检查统一代码是否正确");
    }

    return NETEASE_SZ + code.replace(COMMON_SZ, "");
  }

  /**
   * 上交所统一代码转股票代码
   * @param code 统一代码
   */
  public SHTransform(code: string): string {
    if (!code.includes(COMMON_SH)) {
      throw new Error("请检查统一代码是否正确");
    }

    return NETEASE_SH + code.replace(COMMON_SH, "");
  }

  /**
   * 港交所统一代码转股票代码
   * @param code 统一代码
   */
  public HKTransform(code: string): string {
    if (!code.includes(COMMON_HK)) {
      throw new Error("请检查统一代码是否正确");
    }

    return NETEASE_HK + code.replace(COMMON_HK, "");
  }

  /**
   * 美交所统一代码转股票代码
   * @param code 统一代码
   */
  public USTransform(code: string): string {
    if (!code.includes(COMMON_US)) {
      throw new Error("请检查统一代码是否正确");
    }

    return NETEASE_US + code.replace(COMMON_US, "");
  }
}

export default NeteaseCommonCodeTransform;
