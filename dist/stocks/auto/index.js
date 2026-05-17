"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAutoStockApi = createAutoStockApi;
const constant_1 = require("../../utils/constant");
const eastmoney_1 = __importDefault(require("../eastmoney"));
const sina_1 = __importDefault(require("../sina"));
const normalize_1 = require("../shared/normalize");
const provider_1 = require("../shared/provider");
const tencent_1 = __importDefault(require("../tencent"));
const providers = [
    { name: "tencent", api: tencent_1.default },
    { name: "sina", api: sina_1.default },
    { name: "eastmoney", api: eastmoney_1.default },
];
function createAutoStockApi(autoProviders) {
    const api = {
        async getStock(code) {
            return (await api.inspectStock(code)).stock;
        },
        async getStocks(codes) {
            return Promise.all((0, provider_1.normalizeCodes)(codes).map((code) => api.getStock(code)));
        },
        async searchStocks(key) {
            for (const provider of autoProviders) {
                const stocks = await searchProviderStocks(provider, key);
                const availableStocks = stocks.filter(isAvailableStock);
                if (availableStocks.length > 0) {
                    return availableStocks.map((stock) => (0, normalize_1.normalizeStock)(stock, provider.name));
                }
            }
            return [];
        },
        async inspectStock(code) {
            const sources = [];
            let selectedStock;
            let selectedSource = "base";
            for (const provider of autoProviders) {
                const inspection = await provider.api.inspectStock(code);
                sources.push(inspection);
                if (!selectedStock && inspection.status === "success" && inspection.stock) {
                    selectedStock = inspection.stock;
                    selectedSource = inspection.source;
                }
            }
            const stock = selectedStock || (0, normalize_1.normalizeStock)({ ...constant_1.DEFAULT_STOCK, code }, "base");
            return {
                code,
                source: selectedSource,
                stock,
                sources,
            };
        },
    };
    return api;
}
const Auto = createAutoStockApi(providers);
async function searchProviderStocks(provider, key) {
    try {
        return await provider.api.searchStocks(key);
    }
    catch {
        return [];
    }
}
function isAvailableStock(stock) {
    return Boolean(stock && stock.name !== constant_1.DEFAULT_STOCK.name);
}
exports.default = Auto;
