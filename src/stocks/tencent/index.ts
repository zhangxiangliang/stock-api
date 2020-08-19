// Stocks
import Base from "@stocks/base";
import TencentStockTransform from "@stocks/tencent/transforms/stock";
import TencentCommonCodeTransform from "@stocks/tencent/transforms/common-code";

// Utils
import fetch from "@utils/fetch";
import iconv from "@utils/iconv";

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
    const transforms = (new TencentCommonCodeTransform).transforms(codes);

    // 数据获取
    const url = `https://qt.gtimg.cn/q=${transforms.join(',')}`;
    const res = await fetch.get(url).responseType('blob');

    const body = iconv.decode(res.body, "gbk");
    const rows = body.split(";\n");

    return codes.map((code, index) => {
      // 数据深解析
      const [_, paramsUnformat] = rows[index].split('=');
      const params = paramsUnformat.replace('"', '').split("~");
      const data = (new TencentStockTransform(code, params));

      return data.getStock();
    })
  }
}

export default Tencent;
