import { StockSource } from "../../types/utils/stock";
export type StockProviderFeature = "kline" | "quote" | "search";
export type StockProviderRuntime = "browser" | "node";
export type StockProviderSupport = {
    supported: boolean;
    note?: string;
};
export type StockProviderCapability = {
    browser: Record<StockProviderFeature, StockProviderSupport>;
    node: Record<StockProviderFeature, StockProviderSupport>;
    source: Exclude<StockSource, "base">;
};
export declare function getProviderCapabilities(): StockProviderCapability[];
export declare function assertProviderFeatureSupported(source: Exclude<StockSource, "base">, feature: StockProviderFeature): void;
