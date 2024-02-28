export interface ApiCodeTransform {
  transform(code: string): string;
  transforms(codes: string[]): string[];
  SZTransform(code: string): string;
  SHTransform(code: string): string;
  HKTransform(code: string): string;
  USTransform(code: string): string;
}

export default ApiCodeTransform;
