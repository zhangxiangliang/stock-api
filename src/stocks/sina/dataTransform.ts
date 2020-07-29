// Utils
import { SZ, HK, US, SH } from "@utils/constant";

/**
 * 网易数据解析
 */
class SinaDataTransform {
  /**
   * 构造函数
   */
  constructor(public code: string, public params: string[]) { }

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
  getPrice(): number {
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
    return this.getPrice() ? this.getPrice() / this.getYesterday() - 1 : 0;
  }
}

export default SinaDataTransform;
