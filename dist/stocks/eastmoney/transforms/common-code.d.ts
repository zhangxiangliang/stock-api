export declare function transformEastmoneyCommonCode(code: string): string;
declare const EastmoneyCommonCodeTransform: {
    transform: typeof transformEastmoneyCommonCode;
    transforms(codes: string[]): string[];
};
export default EastmoneyCommonCodeTransform;
