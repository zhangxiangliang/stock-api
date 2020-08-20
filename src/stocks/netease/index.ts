// Stocks
import Base from "@stocks/base";
import NeteaseStockTransform from "@stocks/netease/transforms/stock";
import NeteaseCommonCodeTransform from "@stocks/netease/transforms/common-code";

// Utils
import fetch from "@utils/fetch";

// Types
import Stock from "types/utils/stock";
import StockApi from "types/stocks/index";

/**
 * 网易股票代码接口
 */
const Netease: StockApi = {
  /**
   * 获取股票数据
   * @param code 股票代码
   */
  async getStock(code: string): Promise<Stock> {
    const transform = (new NeteaseCommonCodeTransform).transform(code);

    const url = `https://api.money.126.net/data/feed/${transform},money.api?callback=topstock`;
    const res = await fetch.get(url);

    const items = JSON.parse(res.body.toString().replace(/\(|\)|;|(topstock)|\s/g, '').replace('{{', '{').replace('}}}', "}}"));
    const params = items[transform];
    const data = (new NeteaseStockTransform(code, params));

    return params ? data.getStock() : {
      code: transform,
      name: '---',
      percent: 0,

      now: 0,
      low: 0,
      high: 0,
      yesterday: 0,
    };
  },

  /**
   * 获取股票数据组
   * @param codes 股票代码组
   */
  async getStocks(codes: string[]): Promise<Stock[]> {
    const transforms = (new NeteaseCommonCodeTransform).transforms(codes);

    const url = `https://api.money.126.net/data/feed/${transforms.join(',')},money.api?callback=topstock`;
    const res = await fetch.get(url);

    const items = JSON.parse(res.body.toString().replace(/\(|\)|;|(topstock)|\s/g, '').replace('{{', '{').replace('}}}', "}}"));
    return codes.map(code => {
      const transform = (new NeteaseCommonCodeTransform).transform(code);
      const params = items[transform];
      const data = (new NeteaseStockTransform(code, params));

      return params ? data.getStock() : {
        code: transform,
        name: '---',
        percent: 0,

        now: 0,
        low: 0,
        high: 0,
        yesterday: 0,
      };
    });
  },

  /**
   * 搜索股票代码
   * @param key 关键字
   */
  async searchStocks(key: string): Promise<Stock[]> {
    throw new Error("未实现搜索股票代码");
  }
}

export default Netease;
