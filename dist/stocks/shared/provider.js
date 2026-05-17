"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeCodes = normalizeCodes;
exports.createMissingStock = createMissingStock;
exports.splitRows = splitRows;
exports.getAssignedValue = getAssignedValue;
exports.getDelimitedParams = getDelimitedParams;
exports.createStockProvider = createStockProvider;
exports.createStockInspection = createStockInspection;
const array_1 = require("../../utils/array");
const fetch_1 = __importDefault(require("../../utils/fetch"));
const iconv_1 = __importDefault(require("../../utils/iconv"));
const constant_1 = require("../../utils/constant");
const normalize_1 = require("./normalize");
function normalizeCodes(codes) {
    return (0, array_1.uniq)(codes.filter((code) => code !== ""));
}
function createMissingStock(code) {
    return { ...constant_1.DEFAULT_STOCK, code };
}
function splitRows(body) {
    return body.split(";\n").filter((row) => row !== "");
}
function getAssignedValue(row) {
    const [, value = ""] = row.split("=");
    return value;
}
function getDelimitedParams(row, delimiter) {
    return getAssignedValue(row).replace('"', "").split(delimiter);
}
function createStockProvider(config) {
    async function getStocks(codes) {
        const normalizedCodes = normalizeCodes(codes);
        if (normalizedCodes.length === 0) {
            return [];
        }
        const apiCodes = config.quote.codeTransform.transforms(normalizedCodes);
        const body = await requestText({
            encoding: config.quote.encoding,
            headers: config.quote.headers,
            url: config.quote.getUrl(apiCodes),
        });
        const rows = splitRows(body);
        return normalizedCodes.map((code, index) => {
            const apiCode = apiCodes[index];
            const row = rows.find((item) => item.includes(apiCode)) || "";
            if (config.quote.isMissing(row, apiCode)) {
                return createMissingStock(code);
            }
            const params = getDelimitedParams(row, config.quote.delimiter);
            return config.quote.parseStock(code, params);
        });
    }
    const api = {
        async getStock(code) {
            const [stock] = await getStocks([code]);
            return stock || createMissingStock(code);
        },
        getStocks,
        async searchStocks(key) {
            const body = await requestText({
                encoding: config.search.encoding,
                headers: config.search.headers,
                url: config.search.getUrl(key),
            });
            return getStocks(config.search.parseCodes(body));
        },
        async inspectStock(code) {
            return createStockInspection(config.source, code, api.getStock);
        },
    };
    return api;
}
async function createStockInspection(source, code, getStock) {
    try {
        const stock = (0, normalize_1.normalizeStock)(await getStock(code), source);
        return {
            code,
            source,
            status: isAvailableStock(stock) ? "success" : "empty",
            stock,
        };
    }
    catch (error) {
        return {
            code,
            source,
            status: "error",
            error: getErrorMessage(error),
        };
    }
}
function isAvailableStock(stock) {
    return Boolean(stock && stock.name !== constant_1.DEFAULT_STOCK.name);
}
function getErrorMessage(error) {
    return error instanceof Error ? error.message : String(error);
}
async function requestText(options) {
    const req = fetch_1.default.get(options.url).responseType("blob");
    for (const [name, value] of options.headers || []) {
        req.set(name, value);
    }
    const res = await req;
    return iconv_1.default.decode(res.body, options.encoding);
}
