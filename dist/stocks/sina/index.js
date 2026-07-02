"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Stocks
const stock_1 = require("../../stocks/sina/transforms/stock");
const common_code_1 = __importDefault(require("../../stocks/sina/transforms/common-code"));
// Utils
const constant_1 = require("../../stocks/base/utils/constant");
const provider_1 = require("../shared/provider");
const capabilities_1 = require("../shared/capabilities");
const kline_1 = require("../shared/kline");
const fetch_1 = __importDefault(require("../../utils/fetch"));
const refererHeader = [["Referer", "https://finance.sina.com.cn/"]];
function getQuoteUrl(apiCodes) {
    return `https://hq.sinajs.cn/list=${apiCodes.join(",")}`;
}
function getSearchUrl(key) {
    return `https://suggest3.sinajs.cn/suggest/type=2&key=${encodeURIComponent(key)}`;
}
function getKlineUrl(apiCode, options) {
    return `https://quotes.sina.cn/cn/api/json_v2.php/CN_MarketData.getKLineData?symbol=${apiCode}&scale=${getScale(options.period)}&ma=no&datalen=${options.count}`;
}
async function getKlines(code, options) {
    (0, capabilities_1.assertProviderFeatureSupported)("sina", "kline");
    const normalizedOptions = (0, kline_1.normalizeKlineOptions)(options);
    if (normalizedOptions.adjust !== "none") {
        return [];
    }
    const apiCode = common_code_1.default.transform(code);
    const rows = await requestJson(getKlineUrl(apiCode, normalizedOptions));
    if (!Array.isArray(rows)) {
        return [];
    }
    return rows.map((row) => (0, kline_1.createKline)({
        close: row.close,
        date: row.day || "",
        high: row.high,
        low: row.low,
        open: row.open,
        source: "sina",
        volume: row.volume,
    }));
}
async function requestJson(url) {
    const response = await fetch_1.default
        .get(url)
        .set("Accept", "application/json,text/plain,*/*")
        .set("Referer", "https://finance.sina.com.cn/");
    return JSON.parse(response.text);
}
function getScale(period) {
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
const Sina = (0, provider_1.createStockProvider)({
    kline: { getKlines },
    source: "sina",
    quote: {
        codeTransform: common_code_1.default,
        delimiter: ",",
        encoding: "gb18030",
        headers: refererHeader,
        getUrl(apiCodes) {
            return getQuoteUrl(apiCodes);
        },
        isMissing(row) {
            return (0, provider_1.getAssignedValue)(row) === '""';
        },
        parseStock(code, params) {
            return (0, stock_1.parseSinaStock)(code, params);
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
                    return [constant_1.COMMON_US + code.replace("us", "")];
                }
                if (code.indexOf("sz") === 0) {
                    return [constant_1.COMMON_SZ + code.replace("sz", "")];
                }
                if (code.indexOf("sh") === 0) {
                    return [constant_1.COMMON_SH + code.replace("sh", "")];
                }
                if (code.indexOf("hk") === 0) {
                    return [constant_1.COMMON_HK + code.replace("hk", "")];
                }
                if (code.indexOf("of") === 0) {
                    const fundCode = code.replace("of", "");
                    return [constant_1.COMMON_SZ + fundCode, constant_1.COMMON_SH + fundCode];
                }
                return [];
            });
            return (0, provider_1.normalizeCodes)(codes);
        },
    },
});
exports.default = Sina;
