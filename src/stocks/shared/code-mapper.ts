import {
  COMMON_HK,
  COMMON_SH,
  COMMON_SZ,
  COMMON_US,
} from "../base/utils/constant";
import { StockCodeError } from "../../errors";

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

const commonPrefixes: PrefixMap = {
  SZ: COMMON_SZ,
  SH: COMMON_SH,
  HK: COMMON_HK,
  US: COMMON_US,
};

export function createCodeMapper(options: {
  inputPrefixes: PrefixMap;
  outputPrefixes: PrefixMap;
  unknownError: string;
  marketErrors?: ErrorMap;
  formatOutputCode?: (market: Market, code: string) => string;
}): CodeMapper {
  function transformByMarket(market: Market, code: string): string {
    const inputPrefix = options.inputPrefixes[market];

    if (code.indexOf(inputPrefix) !== 0) {
      throw new StockCodeError(
        options.marketErrors?.[market] || options.unknownError
      );
    }

    const value = code.replace(inputPrefix, "");
    const normalizedValue = options.formatOutputCode
      ? options.formatOutputCode(market, value)
      : value;

    return options.outputPrefixes[market] + normalizedValue;
  }

  const mapper: CodeMapper = {
    transform(code: string): string {
      const market = getMarket(code, options.inputPrefixes);

      if (!market) {
        throw new StockCodeError(options.unknownError);
      }

      return transformByMarket(market, code);
    },

    transforms(codes: string[]): string[] {
      return codes.map((code) => mapper.transform(code));
    },

    SZTransform(code: string): string {
      return transformByMarket("SZ", code);
    },

    SHTransform(code: string): string {
      return transformByMarket("SH", code);
    },

    HKTransform(code: string): string {
      return transformByMarket("HK", code);
    },

    USTransform(code: string): string {
      return transformByMarket("US", code);
    },
  };

  return mapper;
}

export function createUnimplementedCodeMapper(options: {
  unknownError: string;
  marketErrors: ErrorMap;
}): CodeMapper {
  function fail(market: Market): never {
    throw new StockCodeError(options.marketErrors[market]);
  }

  const mapper: CodeMapper = {
    transform(code: string): string {
      const market = getMarket(code, commonPrefixes);

      if (!market) {
        throw new StockCodeError(options.unknownError);
      }

      return fail(market);
    },

    transforms(codes: string[]): string[] {
      return codes.map((code) => mapper.transform(code));
    },

    SZTransform(): string {
      return fail("SZ");
    },

    SHTransform(): string {
      return fail("SH");
    },

    HKTransform(): string {
      return fail("HK");
    },

    USTransform(): string {
      return fail("US");
    },
  };

  return mapper;
}

export { commonPrefixes };

function getMarket(code: string, prefixes: PrefixMap): Market | undefined {
  return (Object.keys(prefixes) as Market[]).find((market) =>
    code.startsWith(prefixes[market])
  );
}
