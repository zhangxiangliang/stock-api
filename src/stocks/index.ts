// Stocks
import auto from "./auto";
import base from "./base";
import eastmoney from "./eastmoney";
import sina from "./sina";
import tencent from "./tencent";

export type StockProviderName = "eastmoney" | "sina" | "tencent";

const sourceNames: StockProviderName[] = ["tencent", "sina", "eastmoney"];

export function getSources(): StockProviderName[] {
  return [...sourceNames];
}

export { auto, base, eastmoney, sina, tencent };

export default {
  auto,
  base,
  eastmoney,
  getSources,
  sina,
  tencent,
};
