"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseEastmoneyStock = parseEastmoneyStock;
exports.getEastmoneyStockCode = getEastmoneyStockCode;
exports.getEastmoneyStockName = getEastmoneyStockName;
exports.getEastmoneyStockNow = getEastmoneyStockNow;
exports.getEastmoneyStockLow = getEastmoneyStockLow;
exports.getEastmoneyStockHigh = getEastmoneyStockHigh;
exports.getEastmoneyStockYesterday = getEastmoneyStockYesterday;
exports.getEastmoneyStockPercent = getEastmoneyStockPercent;
const constant_1 = require("../../../utils/constant");
function parseEastmoneyStock(code, quote) {
    var _a;
    const now = getEastmoneyStockNow(quote);
    const yesterday = getEastmoneyStockYesterday(quote);
    const percentValue = numberValue((_a = quote === null || quote === void 0 ? void 0 : quote.f170) !== null && _a !== void 0 ? _a : quote === null || quote === void 0 ? void 0 : quote.f3);
    return {
        code: getEastmoneyStockCode(code),
        name: getEastmoneyStockName(quote),
        percent: percentValue ? percentValue / 100 : now && yesterday ? now / yesterday - 1 : constant_1.DEFAULT_NUMBER,
        now,
        low: getEastmoneyStockLow(quote),
        high: getEastmoneyStockHigh(quote),
        yesterday,
    };
}
function getEastmoneyStockCode(code) {
    return String(code).toUpperCase();
}
function getEastmoneyStockName(quote) {
    return String((quote === null || quote === void 0 ? void 0 : quote.f58) || (quote === null || quote === void 0 ? void 0 : quote.f14) || constant_1.DEFAULT_STRING);
}
function getEastmoneyStockNow(quote) {
    var _a;
    return numberValue((_a = quote === null || quote === void 0 ? void 0 : quote.f43) !== null && _a !== void 0 ? _a : quote === null || quote === void 0 ? void 0 : quote.f2);
}
function getEastmoneyStockLow(quote) {
    var _a;
    return numberValue((_a = quote === null || quote === void 0 ? void 0 : quote.f45) !== null && _a !== void 0 ? _a : quote === null || quote === void 0 ? void 0 : quote.f16);
}
function getEastmoneyStockHigh(quote) {
    var _a;
    return numberValue((_a = quote === null || quote === void 0 ? void 0 : quote.f44) !== null && _a !== void 0 ? _a : quote === null || quote === void 0 ? void 0 : quote.f15);
}
function getEastmoneyStockYesterday(quote) {
    var _a;
    return numberValue((_a = quote === null || quote === void 0 ? void 0 : quote.f60) !== null && _a !== void 0 ? _a : quote === null || quote === void 0 ? void 0 : quote.f18);
}
function getEastmoneyStockPercent(quote) {
    var _a;
    const percentValue = numberValue((_a = quote === null || quote === void 0 ? void 0 : quote.f170) !== null && _a !== void 0 ? _a : quote === null || quote === void 0 ? void 0 : quote.f3);
    if (percentValue)
        return percentValue / 100;
    const now = getEastmoneyStockNow(quote);
    const yesterday = getEastmoneyStockYesterday(quote);
    return now && yesterday ? now / yesterday - 1 : constant_1.DEFAULT_NUMBER;
}
const EastmoneyStockTransform = {
    parse: parseEastmoneyStock,
    getCode: getEastmoneyStockCode,
    getName: getEastmoneyStockName,
    getNow: getEastmoneyStockNow,
    getLow: getEastmoneyStockLow,
    getHigh: getEastmoneyStockHigh,
    getYesterday: getEastmoneyStockYesterday,
    getPercent: getEastmoneyStockPercent,
    getStock: parseEastmoneyStock,
};
function numberValue(value) {
    if (value === undefined || value === null || value === "-")
        return constant_1.DEFAULT_NUMBER;
    const next = Number(value);
    return Number.isFinite(next) ? next : constant_1.DEFAULT_NUMBER;
}
exports.default = EastmoneyStockTransform;
