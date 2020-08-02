// Stocks
import Base from "@stocks/base";
import NeteaseStockTransform from "@stocks/netease/transforms/stock";
import NeteaseExchangeTransform from "@stocks/netease/transforms/exchange";

// Utils
import fetch from "@utils/fetch";

// Types
import Stock from "types/stock";

/**
 * 网易股票代码接口
 */
class Netease extends Base {
  /**
   * 构造函数
   */
  constructor() {
    super();
  }

  /**
   * 获取股票数据
   * @param code 需要获取的股票代码
   */
  async getStock(code: string): Promise<Stock> {
    const transform = (new NeteaseExchangeTransform).transform(code);

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
  }

  /**
   * 获取股票组数据
   * @param codes 需要获取的股票组代码
   */
  async getStocks(codes: string[]): Promise<Stock[]> {
    const transforms = (new NeteaseExchangeTransform).transforms(codes);

    const url = `https://api.money.126.net/data/feed/${transforms.join(',')},money.api?callback=topstock`;
    const res = await fetch.get(url);

    const items = JSON.parse(res.body.toString().replace(/\(|\)|;|(topstock)|\s/g, '').replace('{{', '{').replace('}}}', "}}"));
    return codes.map(code => {
      const transform = (new NeteaseExchangeTransform).transform(code);
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
  }
}

export default Netease;
