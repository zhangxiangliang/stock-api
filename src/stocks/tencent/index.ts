// Stocks
import Base from "@stocks/base";
import TencentStockTransform from "@stocks/tencent/transforms/stock";
import TencentExchangeTransform from "@stocks/tencent/transforms/exchange";

// Utils
import fetch from "@utils/fetch";
import iconv from "@utils/iconv";

// Types
import Stock from "types/utils/stock";

/**
 * 腾讯股票代码接口
 */
class Tencent extends Base {
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
    const transform = (new TencentExchangeTransform).transform(code);

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
  }

  /**
   * 获取股票组数据
   * @param codes 需要获取的股票组代码
   */
  async getStocks(codes: string[]): Promise<Stock[]> {
    const transforms = (new TencentExchangeTransform).transforms(codes);

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
