// NPM
import { uniq } from "lodash";

// Stocks
import NeteaseStockTransform from "../../stocks/netease/transforms/stock";
import NeteaseCommonCodeTransform from "../../stocks/netease/transforms/common-code";

// Utils
import fetch from "../../utils/fetch";
import { DEFAULT_STOCK } from "../../utils/constant";
import { COMMON_SZ, COMMON_SH } from "../../stocks/base/utils/constant";

// Types
import Stock from "../../types/utils/stock";
import StockApi from "../../types/stocks/index";
import Dictionary from "../../types/utils/dictionary";

/**
 * 网易股票代码接口
 */
const Netease: StockApi = {
  /**
   * 获取股票数据
   * @param code 股票代码
   */
  async getStock(code: string): Promise<Stock> {
    const transform = new NeteaseCommonCodeTransform().transform(code);

    const url = `https://api.money.126.net/data/feed/${transform},money.api?callback=topstock`;
    const res = await fetch.get(url);

    const items = JSON.parse(
      res.body
        .toString()
        .replace(/\(|\)|;|(topstock)|\s/g, "")
        .replace("{{", "{")
        .replace("}}}", "}}")
    );
    const params = items[transform];

    if (!params) {
      return { ...DEFAULT_STOCK, code };
    }

    const data = new NeteaseStockTransform(code, params);
    return data.getStock();
  },

  /**
   * 获取股票数据组
   * @param codes 股票代码组
   */
  async getStocks(codes: string[]): Promise<Stock[]> {
    codes = uniq(codes.filter((i) => i !== ""));

    // 无股票时返回空数组
    if (codes.length === 0) {
      return [];
    }

    const transforms = new NeteaseCommonCodeTransform().transforms(codes);

    // 数据获取
    const url = `https://api.money.126.net/data/feed/${transforms.join(
      ","
    )},money.api?callback=topstock`;
    const res = await fetch.get(url);

    // 解析数据
    const items = JSON.parse(
      res.body
        .toString()
        .replace(/\(|\)|;|(topstock)|\s/g, "")
        .replace("{{", "{")
        .replace("}}}", "}}")
    );
    return codes.map((code) => {
      const transform = new NeteaseCommonCodeTransform().transform(code);
      const params = items[transform];

      if (!params) {
        return { ...DEFAULT_STOCK, code };
      }

      const data = new NeteaseStockTransform(code, params);

      return data.getStock();
    });
  },

  /**
   * 搜索股票代码
   * @param key 关键字
   */
  async searchStocks(key: string): Promise<Stock[]> {
    // 数据获取
    const url = `https://quotes.money.163.com/stocksearch/json.do?type=&count=5&word=${encodeURIComponent(
      key
    )}&callback=topstock`;
    const res = await fetch.get(url);

    // 解析数据
    const row = res.body
      .toString()
      .replace(/\(|\)|;|(topstock)|\s/g, "")
      .replace("{{", "{")
      .replace("}}}", "}}");
    const items: Dictionary<string>[] = JSON.parse(row);

    const codes: string[] = items.map((i) => {
      if (i.tag.includes(COMMON_SZ) || i.type.includes(COMMON_SZ)) {
        return COMMON_SZ + i.symbol;
      }

      if (i.tag.includes(COMMON_SH) || i.type.includes(COMMON_SH)) {
        return COMMON_SH + i.symbol;
      }

      return "";
    });

    return await Netease.getStocks(uniq(codes.filter((i) => i !== "")));
  },
};

export default Netease;
