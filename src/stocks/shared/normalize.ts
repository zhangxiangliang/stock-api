import Stock, { StockSource } from "../../types/utils/stock";

export function normalizeStock(
  stock: Stock,
  source: StockSource
): Stock {
  return {
    ...stock,
    source,
  };
}
