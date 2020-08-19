// Types
import ApiCodeTransform from "types/stocks/transforms/api-code";

/**
 * 【基础】股票代码转换统一代码
 */
class BaseApiCodeTransform implements ApiCodeTransform {
  /**
  * 构造函数
  */
  constructor() { }

  /**
   * 交易所股票代码转换统一代码
   * @param code 股票代码
   */
  public transform(code: string): string {
    throw new Error("未实现股票代码转换统一代码");
  }

  /**
   * 交易所股票组代码转换统一代码组
   * @param codes 股票代码
   */
  public transforms(codes: string[]): string[] {
    return codes.map((code) => this.transform(code));
  }

  /**
   * 深交所股票代码转换统一代码
   * @param code 股票代码
   */
  public SZTransform(code: string): string {
    throw new Error("未实现深交所股票代码转换统一代码");
  }

  /**
   * 上交所股票代码转换统一代码
   * @param code 股票代码
   */
  public SHTransform(code: string): string {
    throw new Error("未实现上交所股票代码转换统一代码");
  }

  /**
   * 港交所股票代码转换统一代码
   * @param code 股票代码
   */
  public HKTransform(code: string): string {
    throw new Error("未实现港交所股票代码转换统一代码");
  }

  /**
   * 美交所股票代码转换统一代码
   * @param code 股票代码
   */
  public USTransform(code: string): string {
    throw new Error("未实现美交所股票代码转换统一代码");
  }
}

export default BaseApiCodeTransform;
