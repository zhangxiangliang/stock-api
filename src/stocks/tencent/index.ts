// Stocks
import { parseTencentStock } from "../../stocks/tencent/transforms/stock";
import TencentCommonCodeTransform from "../../stocks/tencent/transforms/common-code";

// Utils
import {
  COMMON_HK,
  COMMON_SH,
  COMMON_SZ,
  COMMON_US,
} from "../../stocks/base/utils/constant";
import { createStockProvider, normalizeCodes } from "../shared/provider";
import { assertProviderFeatureSupported } from "../shared/capabilities";
import {
  createKline,
  normalizeKlineOptions,
} from "../shared/kline";
import Kline, { KlineOptions } from "../../types/utils/kline";
import fetch from "../../utils/fetch";
import { loadBrowserScriptValue } from "../../utils/browser-script";

type TencentKlineResponse = {
  data?: Record<string, Record<string, string[][]>>;
};

function getSearchUrl(key: string): string {
  return `https://smartbox.gtimg.cn/s3/?v=2&t=all&c=1&q=${encodeURIComponent(
    key
  )}`;
}

async function requestBrowserSearchText(key: string): Promise<string> {
  const value = await loadBrowserScriptValue({
    charset: "gbk",
    url: getSearchUrl(key),
    variableName: "v_hint",
  });

  return `v_hint="${value}"`;
}

async function getKlines(code: string, options?: KlineOptions): Promise<Kline[]> {
  assertProviderFeatureSupported("tencent", "kline");

  const normalizedOptions = normalizeKlineOptions(options);
  const apiCode = TencentCommonCodeTransform.transform(code);
  const endpoint =
    normalizedOptions.adjust === "none" ? "kline/kline" : "fqkline/get";
  const adjustPrefix =
    normalizedOptions.adjust === "none" ? "" : normalizedOptions.adjust;
  const dataKey = `${adjustPrefix}${normalizedOptions.period}`;
  const adjustParam =
    normalizedOptions.adjust === "none" ? "" : `,${normalizedOptions.adjust}`;
  const url = `https://web.ifzq.gtimg.cn/appstock/app/${endpoint}?param=${apiCode},${normalizedOptions.period},,,${normalizedOptions.count}${adjustParam}`;
  const response = await requestJson<TencentKlineResponse>(url);
  const rows = response.data?.[apiCode]?.[dataKey] || [];

  return rows.map(([date, open, close, high, low, volume]) =>
    createKline({
      close,
      date,
      high,
      low,
      open,
      source: "tencent",
      volume,
    })
  );
}

async function requestJson<T>(url: string): Promise<T> {
  const response = await fetch.get(url).set("Accept", "application/json,text/plain,*/*");
  return JSON.parse(response.text) as T;
}

/**
 * 腾讯股票代码接口
 */
const Tencent = createStockProvider({
  kline: { getKlines },
  source: "tencent",
  quote: {
    codeTransform: TencentCommonCodeTransform,
    delimiter: "~",
    encoding: "gbk",
    getUrl(apiCodes) {
      return `https://qt.gtimg.cn/q=${apiCodes.join(",")}`;
    },
    isMissing(row, apiCode) {
      return !row.includes(apiCode);
    },
    parseStock(code, params) {
      return parseTencentStock(code, params);
    },
  },
  search: {
    browserRequestText: requestBrowserSearchText,
    encoding: "gbk",
    getUrl(key) {
      return getSearchUrl(key);
    },
    parseCodes(body) {
      const rows = body.replace('v_hint="', "").replace('"', "").split("^");
      const codes = rows.map((row) => {
        const [type, code] = row.split("~");

        switch (type) {
          case "sz":
            return COMMON_SZ + code;
          case "sh":
            return COMMON_SH + code;
          case "hk":
            return COMMON_HK + code;
          case "us":
            return COMMON_US + code.split(".")[0].toUpperCase();
          default:
            return "";
        }
      });

      return normalizeCodes(codes);
    },
  },
});

export default Tencent;
