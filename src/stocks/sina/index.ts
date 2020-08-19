// Stocks
import Base from "@stocks/base";
import SinaStockTransform from "@stocks/sina/transforms/stock";
import SinaCommonCodeTransform from "@stocks/sina/transforms/common-code";

// Utils
import fetch from "@utils/fetch";
import iconv from "@utils/iconv";

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
    const params = paramsUnformat.replace('"', '').split(",");
    const data = (new SinaStockTransform(code, params));

    return data.getStock();
  },

  /**
   * 获取股票数据组
   * @param codes 股票代码组
   */
  async getStocks(codes: string[]): Promise<Stock[]> {
    const transforms = (new SinaCommonCodeTransform).transforms(codes);

    // 数据获取
    const url = `https://hq.sinajs.cn/list=${transforms.join(',')}`;
    const res = await fetch.get(url);

    const body = iconv.decode(res.body, "gb18030");
    const rows = body.split(";\n");

    return codes.map((code, index) => {
      // 数据深解析
      const [_, paramsUnformat] = rows[index].split('=');
      const params = paramsUnformat.replace('"', '').split(",");
      const data = (new SinaStockTransform(code, params));

      return data.getStock();
    })
  }
}

export default Sina;
