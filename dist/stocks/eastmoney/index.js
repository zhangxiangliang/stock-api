"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const browser_script_1 = require("../../utils/browser-script");
const constant_1 = require("../../utils/constant");
const fetch_1 = __importDefault(require("../../utils/fetch"));
const capabilities_1 = require("../shared/capabilities");
const kline_1 = require("../shared/kline");
const provider_1 = require("../shared/provider");
const common_code_1 = __importDefault(require("./transforms/common-code"));
const stock_1 = require("./transforms/stock");
const quoteFields = "f43,f44,f45,f57,f58,f60,f170";
const klineFields = "f51,f52,f53,f54,f55,f56";
const suggestToken = "D43BF722C8E33BDC906FB84D85E326E8";
const requestTimeoutMs = 4000;
const defaultPush2Host = "push2delay.eastmoney.com";
const defaultPush2HisHost = "push2his.eastmoney.com";
const push2HisHosts = [
    defaultPush2HisHost,
    "7.push2his.eastmoney.com",
    "33.push2his.eastmoney.com",
    "63.push2his.eastmoney.com",
    "91.push2his.eastmoney.com",
];
function getSuggestUrl(key) {
    return `https://searchapi.eastmoney.com/api/suggest/get?input=${encodeURIComponent(key)}&type=14&token=${suggestToken}`;
}
async function getStocks(codes) {
    const normalizedCodes = (0, provider_1.normalizeCodes)(codes);
    if (normalizedCodes.length === 0) {
        return [];
    }
    (0, capabilities_1.assertProviderFeatureSupported)("eastmoney", "quote");
    return Promise.all(normalizedCodes.map(fetchOneStock));
}
const Eastmoney = {
    async getStock(code) {
        const [stock] = await getStocks([code]);
        return stock || createMissingStock(code);
    },
    getStocks,
    async getKlines(code, options) {
        return getKlines(code, options);
    },
    async searchStocks(key) {
        var _a;
        (0, capabilities_1.assertProviderFeatureSupported)("eastmoney", "search");
        const response = await requestSuggestJson(key);
        const codes = (((_a = response.QuotationCodeTable) === null || _a === void 0 ? void 0 : _a.Data) || [])
            .map(parseSuggestCode)
            .filter(Boolean);
        return getStocks(codes);
    },
    async inspectStock(code) {
        return (0, provider_1.createStockInspection)("eastmoney", code, Eastmoney.getStock);
    },
};
async function getKlines(code, options) {
    var _a;
    (0, capabilities_1.assertProviderFeatureSupported)("eastmoney", "kline");
    const normalizedOptions = (0, kline_1.normalizeKlineOptions)(options);
    const apiCode = common_code_1.default.transform(code);
    const url = `https://${defaultPush2HisHost}/api/qt/stock/kline/get?fields1=f1,f2,f3,f4,f5,f6&fields2=${klineFields}&ut=7eea3edcaed734bea9cbfc24409ed989&klt=${getKlinePeriodCode(normalizedOptions.period)}&fqt=${getAdjustCode(normalizedOptions.adjust)}&secid=${encodeURIComponent(apiCode)}&beg=19700101&end=20500101&lmt=${normalizedOptions.count}`;
    const response = await requestJsonFromHosts(url, push2HisHosts);
    const rows = ((_a = response.data) === null || _a === void 0 ? void 0 : _a.klines) || [];
    return rows.map((line) => {
        const [date, open, close, high, low, volume] = line.split(",");
        return (0, kline_1.createKline)({
            close,
            date,
            high,
            low,
            open,
            source: "eastmoney",
            volume,
        });
    });
}
async function fetchOneStock(code) {
    const apiCode = common_code_1.default.transform(code);
    const url = `https://${defaultPush2Host}/api/qt/stock/get?fltt=2&invt=2&secid=${encodeURIComponent(apiCode)}&fields=${quoteFields}`;
    const quote = await requestQuote(url);
    if (!(quote === null || quote === void 0 ? void 0 : quote.f57) && !(quote === null || quote === void 0 ? void 0 : quote.f58)) {
        return createMissingStock(code);
    }
    return (0, stock_1.parseEastmoneyStock)(code, quote);
}
async function requestQuote(url) {
    const response = await requestJson(url, 1);
    const quote = response.data;
    if ((quote === null || quote === void 0 ? void 0 : quote.f57) || (quote === null || quote === void 0 ? void 0 : quote.f58)) {
        return quote;
    }
    return undefined;
}
async function requestJson(url, retries = 0) {
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await fetch_1.default
                .get(url)
                .set("Accept", "application/json,text/plain,*/*")
                .set("Referer", "https://quote.eastmoney.com/")
                .retries(0)
                .timeout(requestTimeoutMs);
            return JSON.parse(response.text);
        }
        catch (error) {
            lastError = error;
        }
    }
    throw lastError;
}
function getKlinePeriodCode(period) {
    switch (period) {
        case "week":
            return "102";
        case "month":
            return "103";
        case "day":
        default:
            return "101";
    }
}
function getAdjustCode(adjust) {
    switch (adjust) {
        case "qfq":
            return "1";
        case "hfq":
            return "2";
        case "none":
        default:
            return "0";
    }
}
async function requestSuggestJson(key) {
    const url = getSuggestUrl(key);
    if ((0, browser_script_1.isBrowserRuntime)()) {
        return (0, browser_script_1.loadBrowserJsonp)({
            callbackParam: "cb",
            url,
        });
    }
    return requestJson(url, 1);
}
function parseSuggestCode(item) {
    const quoteId = item.QuoteID || "";
    const code = item.Code || quoteId.split(".")[1] || "";
    const market = item.MktNum || quoteId.split(".")[0] || "";
    if (!code)
        return "";
    if (market === "1")
        return `SH${code}`;
    if (market === "0")
        return `SZ${code}`;
    return "";
}
function createMissingStock(code) {
    return { ...constant_1.DEFAULT_STOCK, code };
}
async function requestJsonFromHosts(url, hosts) {
    let lastError;
    for (const host of hosts) {
        try {
            return await requestJson(replaceUrlHost(url, host));
        }
        catch (error) {
            lastError = error;
        }
    }
    throw lastError;
}
function replaceUrlHost(url, host) {
    const parsedUrl = new URL(url);
    parsedUrl.hostname = host;
    return parsedUrl.toString();
}
exports.default = Eastmoney;
