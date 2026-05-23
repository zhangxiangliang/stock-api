// Stocks
import { parseSinaStock } from "../../stocks/sina/transforms/stock";
import SinaCommonCodeTransform from "../../stocks/sina/transforms/common-code";

// Utils
import {
  COMMON_HK,
  COMMON_SH,
  COMMON_SZ,
  COMMON_US,
} from "../../stocks/base/utils/constant";
import {
  createStockProvider,
  getAssignedValue,
  normalizeCodes,
} from "../shared/provider";
import { assertProviderFeatureSupported } from "../shared/capabilities";
import {
  createKline,
  normalizeKlineOptions,
} from "../shared/kline";
import Kline, { KlineOptions } from "../../types/utils/kline";
import fetch from "../../utils/fetch";

type SinaKlineRow = {
  close?: string;
  day?: string;
  high?: string;
  low?: string;
  open?: string;
  volume?: string;
};

const refererHeader = [["Referer", "https://finance.sina.com.cn/"]] as const;

function getQuoteUrl(apiCodes: string[]): string {
  return `https://hq.sinajs.cn/list=${apiCodes.join(",")}`;
}

function getSearchUrl(key: string): string {
  return `https://suggest3.sinajs.cn/suggest/type=2&key=${encodeURIComponent(
    key
  )}`;
}

function getKlineUrl(apiCode: string, options: Required<KlineOptions>): string {
  return `https://quotes.sina.cn/cn/api/json_v2.php/CN_MarketData.getKLineData?symbol=${apiCode}&scale=${getScale(
    options.period
  )}&ma=no&datalen=${options.count}`;
}

async function getKlines(code: string, options?: KlineOptions): Promise<Kline[]> {
  assertProviderFeatureSupported("sina", "kline");

  const normalizedOptions = normalizeKlineOptions(options);

  if (normalizedOptions.adjust !== "none") {
    return [];
  }

  const apiCode = SinaCommonCodeTransform.transform(code);
  const rows = await requestJson<SinaKlineRow[]>(
    getKlineUrl(apiCode, normalizedOptions)
  );

  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.map((row) =>
    createKline({
      close: row.close,
      date: row.day || "",
      high: row.high,
      low: row.low,
      open: row.open,
      source: "sina",
      volume: row.volume,
    })
  );
}

async function requestJson<T>(url: string): Promise<T> {
  const response = await fetch
    .get(url)
    .set("Accept", "application/json,text/plain,*/*")
    .set("Referer", "https://finance.sina.com.cn/");

  return JSON.parse(response.text) as T;
}

function getScale(period: KlineOptions["period"]): string {
  switch (period) {
    case "week":
      return "1200";
    case "month":
      return "7200";
    case "day":
    default:
      return "240";
  }
}

/**
 * 新浪股票代码接口
 */
const Sina = createStockProvider({
  kline: { getKlines },
  source: "sina",
  quote: {
    codeTransform: SinaCommonCodeTransform,
    delimiter: ",",
    encoding: "gb18030",
    headers: refererHeader,
    getUrl(apiCodes) {
      return getQuoteUrl(apiCodes);
    },
    isMissing(row) {
      return getAssignedValue(row) === '""';
    },
    parseStock(code, params) {
      return parseSinaStock(code, params);
    },
  },
  search: {
    encoding: "gb18030",
    headers: refererHeader,
    getUrl(key) {
      return getSearchUrl(key);
    },
    parseCodes(body) {
      const rows = body
        .replace('var suggestvalue="', "")
        .replace('";', "")
        .split(";");

      const codes = rows.flatMap((row) => {
        const code = row.split(",")[0];

        if (code.indexOf("us") === 0) {
          return [COMMON_US + code.replace("us", "")];
        }

        if (code.indexOf("sz") === 0) {
          return [COMMON_SZ + code.replace("sz", "")];
        }

        if (code.indexOf("sh") === 0) {
          return [COMMON_SH + code.replace("sh", "")];
        }

        if (code.indexOf("hk") === 0) {
          return [COMMON_HK + code.replace("hk", "")];
        }

        if (code.indexOf("of") === 0) {
          const fundCode = code.replace("of", "");
          return [COMMON_SZ + fundCode, COMMON_SH + fundCode];
        }

        return [];
      });

      return normalizeCodes(codes);
    },
  },
});

export default Sina;
