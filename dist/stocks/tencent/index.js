"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Stocks
const stock_1 = require("../../stocks/tencent/transforms/stock");
const common_code_1 = __importDefault(require("../../stocks/tencent/transforms/common-code"));
// Utils
const constant_1 = require("../../stocks/base/utils/constant");
const provider_1 = require("../shared/provider");
const capabilities_1 = require("../shared/capabilities");
const kline_1 = require("../shared/kline");
const fetch_1 = __importDefault(require("../../utils/fetch"));
const browser_script_1 = require("../../utils/browser-script");
function getSearchUrl(key) {
    return `https://smartbox.gtimg.cn/s3/?v=2&t=all&c=1&q=${encodeURIComponent(key)}`;
}
async function requestBrowserSearchText(key) {
    const value = await (0, browser_script_1.loadBrowserScriptValue)({
        charset: "gbk",
        url: getSearchUrl(key),
        variableName: "v_hint",
    });
    return `v_hint="${value}"`;
}
async function getKlines(code, options) {
    var _a, _b;
    (0, capabilities_1.assertProviderFeatureSupported)("tencent", "kline");
    const normalizedOptions = (0, kline_1.normalizeKlineOptions)(options);
    const apiCode = common_code_1.default.transform(code);
    const endpoint = normalizedOptions.adjust === "none" ? "kline/kline" : "fqkline/get";
    const adjustPrefix = normalizedOptions.adjust === "none" ? "" : normalizedOptions.adjust;
    const dataKey = `${adjustPrefix}${normalizedOptions.period}`;
    const adjustParam = normalizedOptions.adjust === "none" ? "" : `,${normalizedOptions.adjust}`;
    const url = `https://web.ifzq.gtimg.cn/appstock/app/${endpoint}?param=${apiCode},${normalizedOptions.period},,,${normalizedOptions.count}${adjustParam}`;
    const response = await requestJson(url);
    const rows = ((_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a[apiCode]) === null || _b === void 0 ? void 0 : _b[dataKey]) || [];
    return rows.map(([date, open, close, high, low, volume]) => (0, kline_1.createKline)({
        close,
        date,
        high,
        low,
        open,
        source: "tencent",
        volume,
    }));
}
async function requestJson(url) {
    const response = await fetch_1.default.get(url).set("Accept", "application/json,text/plain,*/*");
    return JSON.parse(response.text);
}
/**
 * 腾讯股票代码接口
 */
const Tencent = (0, provider_1.createStockProvider)({
    kline: { getKlines },
    source: "tencent",
    quote: {
        codeTransform: common_code_1.default,
        delimiter: "~",
        encoding: "gbk",
        getUrl(apiCodes) {
            return `https://qt.gtimg.cn/q=${apiCodes.join(",")}`;
        },
        isMissing(row, apiCode) {
            return !row.includes(apiCode);
        },
        parseStock(code, params) {
            return (0, stock_1.parseTencentStock)(code, params);
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
                        return constant_1.COMMON_SZ + code;
                    case "sh":
                        return constant_1.COMMON_SH + code;
                    case "hk":
                        return constant_1.COMMON_HK + code;
                    case "us":
                        return constant_1.COMMON_US + code.split(".")[0].toUpperCase();
                    default:
                        return "";
                }
            });
            return (0, provider_1.normalizeCodes)(codes);
        },
    },
});
exports.default = Tencent;
