import Stock from '../utils/stock';

export interface StockApi {
  /**
   * 获取股票数据
   * @param code 股票代码
   */
  getStock(code: string): Promise<Stock>;

  /**
   * 获取股票数据组
   * @param codes 股票代码组
   */
  getStocks(codes: string[]): Promise<Stock[]>;
}

export default StockApi;
