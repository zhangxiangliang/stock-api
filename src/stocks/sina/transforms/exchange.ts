// Stocks
import BaseTransform from "@stocks/base/transforms/exchange";

// Utils
import { SZ, HK, US, SH } from "@utils/constant";

/**
 * 新浪股票代码转换
 */
class SinaExchangeTransform extends BaseTransform {
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

    return "sz" + code.replace(SZ, "");
  }

  /**
   * 上交所股票代码转换
   * @param code 股票代码
   */
  public SHExchangeTransform(code: string): string {
    if (!code.includes(SH)) {
      throw new Error("请检查股票代码是否正确");
    }

    return "sh" + code.replace(SH, "");
  }

  /**
   * 港交所股票代码转换
   * @param code 股票代码
   */
  public HKExchangeTransform(code: string): string {
    if (!code.includes(HK)) {
      throw new Error("请检查股票代码是否正确");
    }

    return "hk" + code.replace(HK, "");
  }

  /**
   * 美交所股票代码转换
   * @param code 股票代码
   */
  public USExchangeTransform(code: string): string {
    if (!code.includes(US)) {
      throw new Error("请检查股票代码是否正确");
    }

    return "gb_" + code.replace(US, "").toLowerCase();
  }
}

export default SinaExchangeTransform;
