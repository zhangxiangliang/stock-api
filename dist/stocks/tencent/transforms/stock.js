"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTencentStock = parseTencentStock;
exports.getTencentStockCode = getTencentStockCode;
exports.getTencentStockName = getTencentStockName;
exports.getTencentStockNow = getTencentStockNow;
exports.getTencentStockLow = getTencentStockLow;
exports.getTencentStockHigh = getTencentStockHigh;
exports.getTencentStockYesterday = getTencentStockYesterday;
exports.getTencentStockPercent = getTencentStockPercent;
const constant_1 = require("../../../utils/constant");
function parseTencentStock(code, params) {
    const now = getTencentStockNow(params);
    const yesterday = getTencentStockYesterday(params);
    return {
        code: getTencentStockCode(code),
        name: getTencentStockName(params),
        percent: now ? now / yesterday - 1 : constant_1.DEFAULT_NUMBER,
        now,
        low: getTencentStockLow(params),
        high: getTencentStockHigh(params),
        yesterday,
    };
}
function getTencentStockCode(code) {
    return String(code).toUpperCase();
}
function getTencentStockName(params) {
    return String(params[1] || constant_1.DEFAULT_STRING);
}
function getTencentStockNow(params) {
    return numberAt(params, 3);
}
function getTencentStockLow(params) {
    return numberAt(params, 34);
}
function getTencentStockHigh(params) {
    return numberAt(params, 33);
}
function getTencentStockYesterday(params) {
    return numberAt(params, 4);
}
function getTencentStockPercent(params) {
    const now = getTencentStockNow(params);
    const yesterday = getTencentStockYesterday(params);
    return now ? now / yesterday - 1 : constant_1.DEFAULT_NUMBER;
}
const TencentStockTransform = {
    parse: parseTencentStock,
    getCode: getTencentStockCode,
    getName: getTencentStockName,
    getNow: getTencentStockNow,
    getLow: getTencentStockLow,
    getHigh: getTencentStockHigh,
    getYesterday: getTencentStockYesterday,
    getPercent: getTencentStockPercent,
    getStock: parseTencentStock,
};
function numberAt(params, index) {
    return Number(params[index] || constant_1.DEFAULT_NUMBER);
}
exports.default = TencentStockTransform;
