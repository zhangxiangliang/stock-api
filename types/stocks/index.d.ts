import Stock from '../utils/stock';

export interface StockApi {
  /**
   * 构造函数
   */
  new();

  /**
   * 构造函数
   */
  constructor();

  /**
   * 获取股票数据
   * @param code 需要获取的股票代码
   */
  getStock(code: string): Promise<Stock>;

  /**
   * 获取股票组数据
   * @param codes 需要获取的股票组代码
   */
  getStocks(codes: string[]): Promise<Stock[]>;
}

export default StockApi;
