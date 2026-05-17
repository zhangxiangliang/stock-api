import Stock from "../../utils/stock";
export interface StockTransform {
    getCode(): string;
    getName(): string;
    getNow(): number;
    getLow(): number;
    getHigh(): number;
    getYesterday(): number;
    getPercent(): number;
    getStock(): Stock;
}
export default StockTransform;
