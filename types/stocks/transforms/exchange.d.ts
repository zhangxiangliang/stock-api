export interface ExchangeTransform {
  transform(code: string): string;
  transforms(codes: string[]): string[];
  SZExchangeTransform(code: string): string;
  SHExchangeTransform(code: string): string;
  HKExchangeTransform(code: string): string;
  USExchangeTransform(code: string): string;
}

export default ExchangeTransform;
