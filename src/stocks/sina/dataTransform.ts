// Stocks
import BaseDataTransform from "@stocks/base/dataTransform";

// Utils
import { SZ, HK, US, SH } from "@utils/constant";

/**
 * 新浪股票数据解析
 */
class SinaDataTransform extends BaseDataTransform {
  /**
   * 构造函数
   */
  constructor(public code: string, public params: string[]) {
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
    switch (this.code.slice(0, 2)) {
      case SH:
        return String(this.params[0]);
      case SZ:
        return String(this.params[0]);
      case HK:
        return String(this.params[1]);
      case US:
        return String(this.params[0]);
      default:
        throw new Error('不支持当前交易所');
    }
  }

  /**
   * 获取现价
   */
  getNow(): number {
    switch (this.code.slice(0, 2)) {
      case SH:
        return Number(this.params[3]);
      case SZ:
        return Number(this.params[3]);
      case HK:
        return Number(this.params[6]);
      case US:
        return Number(this.params[1]);
      default:
        throw new Error('不支持当前交易所');
    }
  }

  /**
   * 获取最低价
   */
  getLow(): number {
    switch (this.code.slice(0, 2)) {
      case SH:
        return Number(this.params[5]);
      case SZ:
        return Number(this.params[5]);
      case HK:
        return Number(this.params[5]);
      case US:
        return Number(this.params[7]);
      default:
        throw new Error('不支持当前交易所');
    }
  }

  /**
   * 获取最高价
   */
  getHigh(): number {
    switch (this.code.slice(0, 2)) {
      case SH:
        return Number(this.params[4]);
      case SZ:
        return Number(this.params[4]);
      case HK:
        return Number(this.params[4]);
      case US:
        return Number(this.params[6]);
      default:
        throw new Error('不支持当前交易所');
    }
  }

  /**
   * 获取昨日收盘价
   */
  getYesterday(): number {
    switch (this.code.slice(0, 2)) {
      case SH:
        return Number(this.params[2]);
      case SZ:
        return Number(this.params[2]);
      case HK:
        return Number(this.params[3]);
      case US:
        return Number(this.params[26]);
      default:
        throw new Error('不支持当前交易所');
    }
  }

  /**
   * 获取涨跌
   */
  getPercent(): number {
    return this.getNow() ? this.getNow() / this.getYesterday() - 1 : 0;
  }
}

export default SinaDataTransform;
