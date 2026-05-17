import stocks from "./stocks/index";
export { stocks };
export { StockApiError, StockCodeError, StockParseError, StockRequestError, } from "./errors";
declare const _default: {
    stocks: {
        auto: import("./stocks/auto").AutoStockApi;
        base: import("./types/stocks").StockApi;
        eastmoney: import("./stocks/shared/provider").StockProviderApi;
        getSources: typeof import("./stocks/index").getSources;
        sina: import("./stocks/shared/provider").StockProviderApi;
        tencent: import("./stocks/shared/provider").StockProviderApi;
    };
};
export default _default;
