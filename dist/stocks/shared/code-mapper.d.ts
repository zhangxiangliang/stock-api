type Market = "SZ" | "SH" | "HK" | "US";
export type CodeMapper = {
    transform(code: string): string;
    transforms(codes: string[]): string[];
    SZTransform(code: string): string;
    SHTransform(code: string): string;
    HKTransform(code: string): string;
    USTransform(code: string): string;
};
type PrefixMap = Record<Market, string>;
type ErrorMap = Record<Market, string>;
declare const commonPrefixes: PrefixMap;
export declare function createCodeMapper(options: {
    inputPrefixes: PrefixMap;
    outputPrefixes: PrefixMap;
    unknownError: string;
    marketErrors?: ErrorMap;
    formatOutputCode?: (market: Market, code: string) => string;
}): CodeMapper;
export declare function createUnimplementedCodeMapper(options: {
    unknownError: string;
    marketErrors: ErrorMap;
}): CodeMapper;
export { commonPrefixes };
