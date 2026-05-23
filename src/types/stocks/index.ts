import Stock from "../utils/stock";
import Kline, { KlineOptions } from "../utils/kline";

export interface StockApi {
  getStock(code: string): Promise<Stock>;
  getStocks(codes: string[]): Promise<Stock[]>;
  getKlines(code: string, options?: KlineOptions): Promise<Kline[]>;
  searchStocks(key: string): Promise<Stock[]>;
}

export default StockApi;
