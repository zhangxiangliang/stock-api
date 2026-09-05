import auto from "./auto";
import base from "./base";
import eastmoney from "./eastmoney";
import sina from "./sina";
import tencent from "./tencent";
import { getProviderCapabilities } from "./shared/capabilities";
export type StockProviderName = "eastmoney" | "sina" | "tencent";
export declare function getSources(): StockProviderName[];
export { auto, base, eastmoney, getProviderCapabilities, sina, tencent };
declare const _default: {
    auto: import("./auto").AutoStockApi;
    base: import("../types/stocks").StockApi;
    eastmoney: import("./shared/provider").StockProviderApi;
    getProviderCapabilities: typeof getProviderCapabilities;
    getSources: typeof getSources;
    sina: import("./shared/provider").StockProviderApi;
    tencent: import("./shared/provider").StockProviderApi;
};
export default _default;
