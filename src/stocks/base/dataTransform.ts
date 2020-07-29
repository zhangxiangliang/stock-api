// Types
import Dictionary from "types/dictionary";

/**
 * 基础股票数据解析
 */
class BaseDataTransform {
  /**
   * 获取代码
   */
  getCode(): string {
    throw new Error('未实现获取代码');
  }

  /**
   * 获取名称
   */
  getName(): string {
    throw new Error('未实现获取名称');
  }

  /**
   * 获取现价
   */
  getNow(): number {
    throw new Error('未实现获取现价');
  }

  /**
   * 获取最低价
   */
  getLow(): number {
    throw new Error('未实现获取最低价');
  }

  /**
   * 获取最高价
   */
  getHigh(): number {
    throw new Error('未实现获取最高价');
  }

  /**
   * 获取昨日收盘价
   */
  getYesterday(): number {
    throw new Error('未实现获取昨日收盘价');
  }

  /**
   * 获取涨跌
   */
  getPercent(): number {
    throw new Error('未实现获取涨跌');
  }
}

export default BaseDataTransform;
