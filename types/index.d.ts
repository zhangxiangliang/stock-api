import StockApi from './stocks/index';

export { Stock } from './utils/stock';

declare namespace Root {
  export const stocks: {
    base: StockApi,
    netease: StockApi,
    sina: StockApi,
    tencent: StockApi,
    xueqiu: StockApi,
  };
}

export default Root;
