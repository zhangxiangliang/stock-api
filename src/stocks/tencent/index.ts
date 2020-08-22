// Stocks
import TencentStockTransform from "@stocks/tencent/transforms/stock";
import TencentCommonCodeTransform from "@stocks/tencent/transforms/common-code";

// Utils
import fetch from "@utils/fetch";
import iconv from "@utils/iconv";
import { DEFAULT_STOCK, ERROR_UNDEFINED_SEARCH_STOCK } from "@utils/constant";

// Types
import Stock from "types/utils/stock";
import StockApi from "types/stocks/index";

/**
 * 腾讯股票代码接口
 */
const Tencent: StockApi = {
  /**
   * 获取股票数据
   * @param code 股票代码
   */
  async getStock(code: string): Promise<Stock> {
    const transform = (new TencentCommonCodeTransform).transform(code);

    // 数据获取
    const url = `https://qt.gtimg.cn/q=${transform}`;
    const res = await fetch.get(url).responseType('blob');

    const body = iconv.decode(res.body, "gbk");
    const rows = body.split(";\n");
    const row = rows[0];

    if (!row.includes(transform)) {
      return { ...DEFAULT_STOCK, code };
    }

    // 数据深解析
    const [_, paramsUnformat] = row.split('=');
    const params = paramsUnformat.replace('"', '').split("~");
    const data = (new TencentStockTransform(code, params));

    return data.getStock();
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

    const transforms = (new TencentCommonCodeTransform).transforms(codes);

    // 数据获取
    const url = `https://qt.gtimg.cn/q=${transforms.join(',')}`;
    const res = await fetch.get(url).responseType('blob');

    const body = iconv.decode(res.body, "gbk");
    const rows: string[] = body.split(";\n");

    return codes.map((code, index) => {
      const transform = (new TencentCommonCodeTransform).transform(code);
      if (!rows.find(row => row.includes(transform))) {
        return { ...DEFAULT_STOCK, code };
      }

      // 数据深解析
      const [_, paramsUnformat] = rows[index].split('=');
      const params = paramsUnformat.replace('"', '').split("~");
      const data = (new TencentStockTransform(code, params));

      return data.getStock();
    })
  },

  /**
   * 搜索股票代码
   * @param key 关键字
   */
  async searchStocks(key: string): Promise<Stock[]> {
    throw new Error(ERROR_UNDEFINED_SEARCH_STOCK);
  }
}

export default Tencent;
