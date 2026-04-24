import Stock from "../../../types/utils/stock";
import {
  ERROR_UNDEFINED_GET_CODE,
  ERROR_UNDEFINED_GET_HIGH,
  ERROR_UNDEFINED_GET_LOW,
  ERROR_UNDEFINED_GET_NAME,
  ERROR_UNDEFINED_GET_NOW,
  ERROR_UNDEFINED_GET_PERCENT,
  ERROR_UNDEFINED_GET_STOCK,
  ERROR_UNDEFINED_GET_YESTERDAY,
} from "../../../utils/constant";

const BaseStockTransform = {
  getCode(): string {
    throw new Error(ERROR_UNDEFINED_GET_CODE);
  },

  getName(): string {
    throw new Error(ERROR_UNDEFINED_GET_NAME);
  },

  getNow(): number {
    throw new Error(ERROR_UNDEFINED_GET_NOW);
  },

  getLow(): number {
    throw new Error(ERROR_UNDEFINED_GET_LOW);
  },

  getHigh(): number {
    throw new Error(ERROR_UNDEFINED_GET_HIGH);
  },

  getYesterday(): number {
    throw new Error(ERROR_UNDEFINED_GET_YESTERDAY);
  },

  getPercent(): number {
    throw new Error(ERROR_UNDEFINED_GET_PERCENT);
  },

  getStock(): Stock {
    throw new Error(ERROR_UNDEFINED_GET_STOCK);
  },
};

export default BaseStockTransform;
