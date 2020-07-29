// Stocks
import Base from "@stocks/base/api";
import TencentDataTransform from "@stocks/tencent/dataTransform";
import TencentExchangeTransform from "@stocks/tencent/exchangeTransform";

// Utils
import fetch from "@utils/fetch";

// Types
import Stock from "types/stock";

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
    const res = await fetch.get(url);

    const body = res.text;
    const rows = body.split(";\n");
    const row = rows[0];

    // 数据深解析
    const [_, paramsUnformat] = row.split('=');
    const params = paramsUnformat.replace('"', '').split("~");
    const data = (new TencentDataTransform(code, params));

    return {
      code: data.getCode(),
      name: data.getName(),
      percent: data.getPercent(),

      now: data.getNow(),
      low: data.getLow(),
      high: data.getHigh(),
      yesterday: data.getYesterday(),
    };
  }

  /**
   * 获取股票组数据
   * @param codes 需要获取的股票组代码
   */
  async getStocks(codes: string[]): Promise<Stock[]> {
    const transforms = (new TencentExchangeTransform).transforms(codes);

    // 数据获取
    const url = `https://qt.gtimg.cn/q=${transforms.join(',')}`;
    const res = await fetch.get(url);

    const body = res.text;
    const rows = body.split(";\n");

    return codes.map((code, index) => {
      // 数据深解析
      const [_, paramsUnformat] = rows[index].split('=');
      const params = paramsUnformat.replace('"', '').split("~");
      const data = (new TencentDataTransform(code, params));

      return {
        code: data.getCode(),
        name: data.getName(),
        percent: data.getPercent(),

        now: data.getNow(),
        low: data.getLow(),
        high: data.getHigh(),
        yesterday: data.getYesterday(),
      };
    })
  }
}

export default Tencent;
