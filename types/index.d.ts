import StockApi from './stocks/index';

declare namespace Root {
  export const stocks: {
    base: StockApi,
    netease: StockApi,
    sina: StockApi,
    tencent: StockApi,
    xueqiu: StockApi,
  };
}

export = Root;
