// NPM
import { uniq } from "lodash";

// Stocks
import XueqiuStockTransform from "../xueqiu/transforms/stock";
import XueqiuCommonCodeTransform from "../xueqiu/transforms/common-code";

// Utils
import fetch from "../../utils/fetch";
import { DEFAULT_STOCK } from "../../utils/constant";
import {
  COMMON_SZ,
  COMMON_SH,
  COMMON_HK,
  COMMON_US,
} from "../base/utils/constant";

// Types
import Stock from "../../types/utils/stock";
import StockApi from "../../types/stocks/index";
import Dictionary from "../../types/utils/dictionary";

let token: string = "";

/**
 * 雪球股票代码接口
 */
const Xueqiu: StockApi & { getToken(): Promise<string> } = {
  /**
   * 获取 Token
   */
  async getToken(): Promise<string> {
    if (token !== "") return token;

    const res = await fetch.get("https://xueqiu.com/");
    const cookies: string[] = res.headers["set-cookie"] as any;

    const param: string =
      cookies.filter((key) => key.includes("xq_a_token"))[0] || "";
    token = param.split(";")[0] || "";

    return token;
  },

  /**
   * 获取股票数据
   * @param code 股票代码
   */
  async getStock(code: string): Promise<Stock> {
    const token = await this.getToken();
    const transform = new XueqiuCommonCodeTransform().transform(code);

    // 数据获取
    const url = `https://stock.xueqiu.com/v5/stock/quote.json?symbol=${transform}`;
    const res = await fetch.get(url).set("Cookie", token);

    const body = JSON.parse(res.text);
    const row: Dictionary<number | string> = body.data.quote;

    // 数据深解析
    const params = row;
    const data = new XueqiuStockTransform(code, params);

    return params ? data.getStock() : { ...DEFAULT_STOCK, code };
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

    const token = await this.getToken();
    const transforms = new XueqiuCommonCodeTransform().transforms(codes);

    // 数据获取
    const url = `https://stock.xueqiu.com/v5/stock/batch/quote.json?symbol=${transforms.join(
      ","
    )}`;
    const res = await fetch.get(url).set("Cookie", token);

    const body = JSON.parse(res.text);
    const rows: Dictionary<Dictionary<number | string>>[] = body.data.items;

    return codes.map((code) => {
      // 数据深解析
      const transform = new XueqiuCommonCodeTransform().transform(code);

      const params =
        rows.find((i) => {
          if (!i.quote) {
            return false;
          }

          if (i.market.region === "US") {
            return i.quote.code === transform;
          }

          if (i.market.region === "CN") {
            return i.quote.symbol === transform;
          }

          if (i.market.region === "HK") {
            return i.market.region + i.quote.code === transform;
          }
        }) || null;

      if (!params) {
        return { ...DEFAULT_STOCK, code };
      }

      const data = new XueqiuStockTransform(code, params.quote);
      return data.getStock();
    });
  },

  /**
   * 搜索股票代码
   * @param key 关键字
   */
  async searchStocks(key: string): Promise<Stock[]> {
    const token = await this.getToken();

    // 数据获取
    const url = `https://xueqiu.com/stock/search.json?code=${encodeURIComponent(
      key
    )}`;
    const res = await fetch.get(url).set("Cookie", token);

    const body = JSON.parse(res.text);
    const rows: Dictionary<string>[] = body.stocks;

    let codes: string[] = [];
    for (let i = 0; i < rows.length; i++) {
      let code: string = rows[i].code;

      if (code.indexOf("SZ") === 0) {
        code = code.replace("SZ", "");
        codes = [...codes, COMMON_SZ + code];
        continue;
      }

      if (code.indexOf("SH") === 0) {
        code = code.replace("SH", "");
        codes = [...codes, COMMON_SH + code];
        continue;
      }

      codes = [...codes, COMMON_HK + code, COMMON_US + code];
    }

    return await Xueqiu.getStocks(uniq(codes.filter((i) => i !== "")));
  },
};

export default Xueqiu;
