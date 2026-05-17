import StockApi from "../../types/stocks";
import Stock, { StockSource } from "../../types/utils/stock";
type CodeTransform = {
    transform(code: string): string;
    transforms(codes: string[]): string[];
};
type Header = readonly [name: string, value: string];
type QuoteConfig = {
    codeTransform: CodeTransform;
    delimiter: string;
    encoding: string;
    headers?: readonly Header[];
    getUrl(apiCodes: string[]): string;
    isMissing(row: string, apiCode: string): boolean;
    parseStock(code: string, params: string[]): Stock;
};
type SearchConfig = {
    encoding: string;
    headers?: readonly Header[];
    getUrl(key: string): string;
    parseCodes(body: string): string[];
};
export type StockProviderConfig = {
    source: Exclude<StockSource, "base">;
    quote: QuoteConfig;
    search: SearchConfig;
};
export type StockInspectionStatus = "empty" | "error" | "success";
export type StockProviderInspection = {
    code: string;
    source: Exclude<StockSource, "base">;
    status: StockInspectionStatus;
    stock?: Stock;
    error?: string;
};
export interface StockProviderApi extends StockApi {
    inspectStock(code: string): Promise<StockProviderInspection>;
}
export declare function normalizeCodes(codes: string[]): string[];
export declare function createMissingStock(code: string): Stock;
export declare function splitRows(body: string): string[];
export declare function getAssignedValue(row: string): string;
export declare function getDelimitedParams(row: string, delimiter: string): string[];
export declare function createStockProvider(config: StockProviderConfig): StockProviderApi;
export declare function createStockInspection(source: Exclude<StockSource, "base">, code: string, getStock: (code: string) => Promise<Stock>): Promise<StockProviderInspection>;
export {};
