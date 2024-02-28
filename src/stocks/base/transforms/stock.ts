// Utils
import {
  ERROR_UNDEFINED_GET_CODE,
  ERROR_UNDEFINED_GET_NAME,
  ERROR_UNDEFINED_GET_NOW,
  ERROR_UNDEFINED_GET_LOW,
  ERROR_UNDEFINED_GET_HIGH,
  ERROR_UNDEFINED_GET_YESTERDAY,
  ERROR_UNDEFINED_GET_PERCENT,
  ERROR_UNDEFINED_GET_STOCK,
} from "../../../utils/constant";

// Types
import Stock from "../../../types/utils/stock";

/**
 * 基础股票数据解析
 */
class BaseStockTransform {
  /**
   * 获取代码
   */
  getCode(): string {
    throw new Error(ERROR_UNDEFINED_GET_CODE);
  }

  /**
   * 获取名称
   */
  getName(): string {
    throw new Error(ERROR_UNDEFINED_GET_NAME);
  }

  /**
   * 获取现价
   */
  getNow(): number {
    throw new Error(ERROR_UNDEFINED_GET_NOW);
  }

  /**
   * 获取最低价
   */
  getLow(): number {
    throw new Error(ERROR_UNDEFINED_GET_LOW);
  }

  /**
   * 获取最高价
   */
  getHigh(): number {
    throw new Error(ERROR_UNDEFINED_GET_HIGH);
  }

  /**
   * 获取昨日收盘价
   */
  getYesterday(): number {
    throw new Error(ERROR_UNDEFINED_GET_YESTERDAY);
  }

  /**
   * 获取涨跌
   */
  getPercent(): number {
    throw new Error(ERROR_UNDEFINED_GET_PERCENT);
  }

  /**
   * 获取股票数据
   */
  getStock(): Stock {
    throw new Error(ERROR_UNDEFINED_GET_STOCK);
  }
}

export default BaseStockTransform;
