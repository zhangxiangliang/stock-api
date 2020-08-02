// Stocks
import BaseTransform from "@stocks/base/transforms/exchange";

// Utils
import { SZ, HK, US, SH } from "@utils/constant";

/**
 * 雪球股票代码转换
 */
class XueqiuExchangeTransform extends BaseTransform {
  /**
   * 构造函数
   */
  constructor() {
    super();
  }

  /**
   * 交易所股票代码转换
   * @param code 股票代码
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
   * 深交所股票代码转换
   * @param code 股票代码
   */
  public SZExchangeTransform(code: string): string {
    if (!code.includes(SZ)) {
      throw new Error("请检查股票代码是否正确");
    }

    return "SZ" + code.replace(SZ, "");
  }

  /**
   * 上交所股票代码转换
   * @param code 股票代码
   */
  public SHExchangeTransform(code: string): string {
    if (!code.includes(SH)) {
      throw new Error("请检查股票代码是否正确");
    }

    return "SH" + code.replace(SH, "");
  }

  /**
   * 港交所股票代码转换
   * @param code 股票代码
   */
  public HKExchangeTransform(code: string): string {
    if (!code.includes(HK)) {
      throw new Error("请检查股票代码是否正确");
    }

    return "HK" + code.replace(HK, "");
  }

  /**
   * 美交所股票代码转换
   * @param code 股票代码
   */
  public USExchangeTransform(code: string): string {
    if (!code.includes(US)) {
      throw new Error("请检查股票代码是否正确");
    }

    return "" + code.replace(US, "");
  }
}

export default XueqiuExchangeTransform;
