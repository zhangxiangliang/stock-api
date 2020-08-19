// Types
import LocalCodeTransform from "types/stocks/transforms/local-code";

/**
 * 基础股票代码转换统一码
 */
class BaseLocalCodeTransform implements LocalCodeTransform {
  /**
   * 构造函数
   */
  constructor() { }

  /**
   * 交易所股票代码转换统一码
   * @param code 股票代码
   */
  public transform(code: string): string {
    throw new Error("未实现股票代码转换统一码");
  }

  /**
   * 交易所股票组代码转换统一码
   * @param codes 股票代码
   */
  public transforms(codes: string[]): string[] {
    return codes.map((code) => this.transform(code));
  }

  /**
   * 深交所股票代码转换统一码
   * @param code 股票代码
   */
  public SZTransform(code: string): string {
    throw new Error("未实现深交所股票代码转换统一码");
  }

  /**
   * 上交所股票代码转换统一码
   * @param code 股票代码
   */
  public SHTransform(code: string): string {
    throw new Error("未实现上交所股票代码转换统一码");
  }

  /**
   * 港交所股票代码转换统一码
   * @param code 股票代码
   */
  public HKTransform(code: string): string {
    throw new Error("未实现港交所股票代码转换统一码");
  }

  /**
   * 美交所股票代码转换统一码
   * @param code 股票代码
   */
  public USTransform(code: string): string {
    throw new Error("未实现美交所股票代码转换统一码");
  }
}

export default BaseLocalCodeTransform;
