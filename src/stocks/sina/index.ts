// Stocks
import SinaStockTransform from "@stocks/sina/transforms/stock";
import SinaCommonCodeTransform from "@stocks/sina/transforms/common-code";

// Utils
import fetch from "@utils/fetch";
import iconv from "@utils/iconv";
import { DEFAULT_STOCK } from "@stocks/base/utils/constant";

// Types
import Stock from "types/utils/stock";
import StockApi from "types/stocks/index";

/**
 * 新浪股票代码接口
 */
const Sina: StockApi = {
  /**
   * 获取股票数据
   * @param code 股票代码
   */
  async getStock(code: string): Promise<Stock> {
    const transform = (new SinaCommonCodeTransform).transform(code);

    // 数据获取
    const url = `https://hq.sinajs.cn/list=${transform}`;
    const res = await fetch.get(url);

    const body = iconv.decode(res.body, "gb18030");
    const rows = body.split(";\n");
    const row = rows[0];

    // 数据深解析
    const [_, paramsUnformat] = row.split('=');

    if (paramsUnformat === '') {
      return { ...DEFAULT_STOCK, code };
    }

    const params = paramsUnformat.replace('"', '').split(",");
    const data = (new SinaStockTransform(code, params));

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

    const transforms = (new SinaCommonCodeTransform).transforms(codes);

    // 数据获取
    const url = `https://hq.sinajs.cn/list=${transforms.join(',')}`;
    const res = await fetch.get(url);

    const body = iconv.decode(res.body, "gb18030");
    const rows = body.split(";\n");

    return codes.map((code, index) => {
      // 数据深解析
      const [_, paramsUnformat] = rows[index].split('=');

      if (paramsUnformat === '') {
        return { ...DEFAULT_STOCK, code };
      }

      const params = paramsUnformat.replace('"', '').split(",");
      const data = (new SinaStockTransform(code, params));

      return data.getStock();
    })
  },

  /**
   * 搜索股票代码
   * @param key 关键字
   */
  async searchStocks(key: string): Promise<Stock[]> {
    throw new Error("未实现搜索股票代码");
  }
}

export default Sina;
