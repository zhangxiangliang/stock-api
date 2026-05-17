import StockApi from "../../types/stocks";
import Stock, { StockSource } from "../../types/utils/stock";
import { StockProviderApi, StockProviderInspection } from "../shared/provider";
export type AutoStockProvider = {
    name: Exclude<StockSource, "base">;
    api: StockProviderApi;
};
export type AutoStockInspection = {
    code: string;
    source: StockSource;
    stock: Stock;
    sources: StockProviderInspection[];
};
export interface AutoStockApi extends StockApi {
    inspectStock(code: string): Promise<AutoStockInspection>;
}
export declare function createAutoStockApi(autoProviders: AutoStockProvider[]): AutoStockApi;
declare const Auto: AutoStockApi;
export default Auto;
