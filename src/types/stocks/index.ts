import Stock from "../utils/stock";

export interface StockApi {
  getStock(code: string): Promise<Stock>;
  getStocks(codes: string[]): Promise<Stock[]>;
  searchStocks(key: string): Promise<Stock[]>;
}

export default StockApi;
