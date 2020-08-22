// NPM
import { uniqBy } from 'lodash';

// Stocks
import XueqiuStockTransform from "@stocks/xueqiu/transforms/stock";
import XueqiuApiCodeTransform from "@stocks/xueqiu/transforms/api-code";
import XueqiuCommonCodeTransform from "@stocks/xueqiu/transforms/common-code";

// Utils
import fetch from "@utils/fetch";
import { DEFAULT_STOCK } from "@utils/constant";

// Types
import Stock from "types/utils/stock";
import StockApi from "types/stocks/index";
import Dictionary from "types/utils/dictionary";

let token: string = '';

/**
 * 雪球股票代码接口
 */
const Xueqiu: StockApi & { getToken(): Promise<string> } = {
  /**
   * 获取 Token
   */
  async getToken(): Promise<string> {
    if (token !== '') return token;

    const res = await fetch.get('https://xueqiu.com/');
    const cookies: string[] = res.headers['set-cookie'];

    const param: string = cookies.filter(key => key.includes('xq_a_token'))[0] || '';
    token = param.split(';')[0] || '';

    return token;
  },

  /**
   * 获取股票数据
   * @param code 股票代码
   */
  async getStock(code: string): Promise<Stock> {
    const token = await this.getToken();
    const transform = (new XueqiuCommonCodeTransform).transform(code);

    // 数据获取
    const url = `https://stock.xueqiu.com/v5/stock/quote.json?symbol=${transform}`;
    const res = await fetch.get(url).set('Cookie', token);

    const body = JSON.parse(res.text);
    const row: Dictionary<number | string> = body.data.quote;

    // 数据深解析
    const params = row;
    const data = (new XueqiuStockTransform(code, params));

    return params ? data.getStock() : { ...DEFAULT_STOCK, code };
  },

  /**
   * 获取股票数据组
   * @param codes 股票代码组
   */
  async getStocks(codes: string[]): Promise<Stock[]> {
    // 无股票时返回空数组
    if (codes.length === 0) {
      return [];
    }

    const token = await this.getToken();
    const transforms = (new XueqiuCommonCodeTransform).transforms(codes);

    // 数据获取
    const url = `https://stock.xueqiu.com/v5/stock/batch/quote.json?symbol=${transforms.join(',')}`;
    const res = await fetch.get(url).set('Cookie', token);

    const body = JSON.parse(res.text);
    const rows: Dictionary<Dictionary<number | string>>[] = body.data.items;

    return codes.map(code => {
      // 数据深解析
      const transform = (new XueqiuCommonCodeTransform).transform(code);
      const params = rows.find(i => i.quote && i.quote.symbol === transform) || null;

      if (!params) {
        return { ...DEFAULT_STOCK, code };
      }

      const data = (new XueqiuStockTransform(code, params.quote));
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
    const url = `https://xueqiu.com/stock/search.json?code=${encodeURIComponent(key)}`;
    const res = await fetch.get(url).set('Cookie', token);

    const body = JSON.parse(res.text);
    const rows: Dictionary<string>[] = body.stocks;
    const codes: string[] = rows.map(i => (new XueqiuApiCodeTransform).transform(i.code));

    return uniqBy(await Xueqiu.getStocks(codes), (code: Stock) => code.name);
  }
}

export default Xueqiu;
