// Stocks
import Base from "@stocks/base";
import SinaStockTransform from "@stocks/sina/transforms/stock";
import SinaExchangeTransform from "@stocks/sina/transforms/exchange";

// Utils
import fetch from "@utils/fetch";
import iconv from "@utils/iconv";

// Types
import Stock from "types/utils/stock";

/**
 * 新浪股票代码接口
 */
class Sina extends Base {
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
    const transform = (new SinaExchangeTransform).transform(code);

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
  }

  /**
   * 获取股票组数据
   * @param codes 需要获取的股票组代码
   */
  async getStocks(codes: string[]): Promise<Stock[]> {
    const transforms = (new SinaExchangeTransform).transforms(codes);

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
