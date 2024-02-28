import StockApi from "./stocks/index";

export declare const stocks: {
  base: StockApi;
  netease: StockApi;
  sina: StockApi;
  tencent: StockApi;
  xueqiu: StockApi;
};

export declare const root: {
  stocks: {
    base: StockApi;
    netease: StockApi;
    sina: StockApi;
    tencent: StockApi;
    xueqiu: StockApi;
  };
};

export default root;
