// Types
import CommonCodeTransform from "types/stocks/transforms/common-code";

// Utils
import { COMMON_SH, COMMON_SZ, COMMON_HK, COMMON_US } from "@stocks/base/utils/constant";

/**
 * 【基础】统一代码转换股票代码
 */
class BaseCommonCodeTransform implements CommonCodeTransform {
  /**
   * 构造函数
   */
  constructor() { }

  /**
   * 交易所统一代码转换股票代码
   * @param code 统一代码
   */
  public transform(code: string): string {
    if (code.includes(COMMON_SH)) {
      return this.SHTransform(code);
    }

    if (code.includes(COMMON_SZ)) {
      return this.SZTransform(code);
    }

    if (code.includes(COMMON_HK)) {
      return this.HKTransform(code);
    }

    if (code.includes(COMMON_US)) {
      return this.USTransform(code);
    }

    throw new Error("请检查统一代码是否正确");
  }

  /**
   * 交易所统一代码组转股票代码组
   * @param codes 股票代码
   */
  public transforms(codes: string[]): string[] {
    return codes.map((code) => this.transform(code));
  }

  /**
   * 深交所统一代码转换股票代码
   * @param code 统一代码
   */
  public SZTransform(code: string): string {
    if (!code.includes(COMMON_SZ)) {
      throw new Error("请检查统一代码是否正确");
    }

    throw new Error("未实现深交所统一代码转换股票代码");
  }

  /**
   * 上交所统一代码转换股票代码
   * @param code 统一代码
   */
  public SHTransform(code: string): string {
    if (!code.includes(COMMON_SH)) {
      throw new Error("请检查统一代码是否正确");
    }

    throw new Error("未实现上交所统一代码转换股票代码");
  }

  /**
   * 港交所统一代码转换股票代码
   * @param code 统一代码
   */
  public HKTransform(code: string): string {
    if (!code.includes(COMMON_HK)) {
      throw new Error("请检查统一代码是否正确");
    }

    throw new Error("未实现港交所统一代码转换股票代码");
  }

  /**
   * 美交所统一代码转换股票代码
   * @param code 统一代码
   */
  public USTransform(code: string): string {
    if (!code.includes(COMMON_US)) {
      throw new Error("请检查统一代码是否正确");
    }

    throw new Error("未实现美交所统一代码转换股票代码");
  }
}

export default BaseCommonCodeTransform;
