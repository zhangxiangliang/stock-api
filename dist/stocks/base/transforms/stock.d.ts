import Stock from "../../../types/utils/stock";
declare const BaseStockTransform: {
    getCode(): string;
    getName(): string;
    getNow(): number;
    getLow(): number;
    getHigh(): number;
    getYesterday(): number;
    getPercent(): number;
    getStock(): Stock;
};
export default BaseStockTransform;
