// StockApi
import Base from "@stocks/base";
import NeteaseTransform from "@stocks/netease/transform";

// Types
import Stock from "@interfaces/Stock";

/**
 * 网易股票代码接口
 */
class Netease extends Base {
  /**
   * 构造函数
   */
  constructor() {
    super(new NeteaseTransform);
  }

  /**
   * 获取股票数据
   * @param code 需要获取的股票代码
   */
  async getStock(code: string): Promise<Stock> {
    throw new Error("未实现获取股票组数据");
  }

  /**
   * 获取股票组数据
   * @param codes 需要获取的股票组代码
   */
  async getStocks(codes: string[]): Promise<Stock[]> {
    throw new Error("未实现获取股票组数据");
  }
}

export default Netease;
