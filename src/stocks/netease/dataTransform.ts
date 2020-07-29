// Stocks
import BaseDataTransform from "@stocks/base/dataTransform";

// Types
import Dictionary from "types/dictionary";

/**
 * 网易股票数据解析
 */
class NeteaseDataTransform extends BaseDataTransform {
  /**
   * 构造函数
   */
  constructor(public code: string, public params: Dictionary<number | string>) {
    super();
  }

  /**
   * 获取代码
   */
  getCode(): string {
    return String(this.code);
  }

  /**
   * 获取名称
   */
  getName(): string {
    return String(this.params.name);
  }

  /**
   * 获取现价
   */
  getNow(): number {
    return Number(this.params.price);
  }

  /**
   * 获取最低价
   */
  getLow(): number {
    return Number(this.params.low);
  }

  /**
   * 获取最高价
   */
  getHigh(): number {
    return Number(this.params.high);
  }

  /**
   * 获取昨日收盘价
   */
  getYesterday(): number {
    return Number(this.params.yestclose);
  }

  /**
   * 获取涨跌
   */
  getPercent(): number {
    return Number(this.params.percent);
  }
}

export default NeteaseDataTransform;
