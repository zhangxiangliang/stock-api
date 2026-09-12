"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSinaStock = parseSinaStock;
exports.getSinaStockCode = getSinaStockCode;
exports.getSinaStockName = getSinaStockName;
exports.getSinaStockNow = getSinaStockNow;
exports.getSinaStockLow = getSinaStockLow;
exports.getSinaStockHigh = getSinaStockHigh;
exports.getSinaStockYesterday = getSinaStockYesterday;
exports.getSinaStockPercent = getSinaStockPercent;
const constant_1 = require("../../../stocks/base/utils/constant");
const constant_2 = require("../../../utils/constant");
const fieldMap = {
    [constant_1.COMMON_SH]: { name: 0, now: 3, low: 5, high: 4, yesterday: 2 },
    [constant_1.COMMON_SZ]: { name: 0, now: 3, low: 5, high: 4, yesterday: 2 },
    [constant_1.COMMON_HK]: { name: 1, now: 6, low: 5, high: 4, yesterday: 3 },
    [constant_1.COMMON_US]: { name: 0, now: 1, low: 7, high: 6, yesterday: 26 },
};
function parseSinaStock(code, params) {
    const fields = fieldMap[code.slice(0, 2)];
    const now = fields ? numberAt(params, fields.now) : constant_2.DEFAULT_NUMBER;
    const yesterday = fields ? numberAt(params, fields.yesterday) : constant_2.DEFAULT_NUMBER;
    return {
        code: String(code).toUpperCase(),
        name: fields ? stringAt(params, fields.name) : constant_2.DEFAULT_STRING,
        percent: now ? now / yesterday - 1 : constant_2.DEFAULT_NUMBER,
        now,
        low: fields ? numberAt(params, fields.low) : constant_2.DEFAULT_NUMBER,
        high: fields ? numberAt(params, fields.high) : constant_2.DEFAULT_NUMBER,
        yesterday,
    };
}
function getSinaStockCode(code) {
    return String(code).toUpperCase();
}
function getSinaStockName(code, params) {
    const fields = fieldMap[code.slice(0, 2)];
    return fields ? stringAt(params, fields.name) : constant_2.DEFAULT_STRING;
}
function getSinaStockNow(code, params) {
    return getSinaStockNumber(code, params, "now");
}
function getSinaStockLow(code, params) {
    return getSinaStockNumber(code, params, "low");
}
function getSinaStockHigh(code, params) {
    return getSinaStockNumber(code, params, "high");
}
function getSinaStockYesterday(code, params) {
    return getSinaStockNumber(code, params, "yesterday");
}
function getSinaStockPercent(code, params) {
    const now = getSinaStockNow(code, params);
    const yesterday = getSinaStockYesterday(code, params);
    return now ? now / yesterday - 1 : constant_2.DEFAULT_NUMBER;
}
const SinaStockTransform = {
    parse: parseSinaStock,
    getCode: getSinaStockCode,
    getName: getSinaStockName,
    getNow: getSinaStockNow,
    getLow: getSinaStockLow,
    getHigh: getSinaStockHigh,
    getYesterday: getSinaStockYesterday,
    getPercent: getSinaStockPercent,
    getStock: parseSinaStock,
};
function getSinaStockNumber(code, params, field) {
    const fields = fieldMap[code.slice(0, 2)];
    return fields ? numberAt(params, fields[field]) : constant_2.DEFAULT_NUMBER;
}
function numberAt(params, index) {
    return Number(params[index] || constant_2.DEFAULT_NUMBER);
}
function stringAt(params, index) {
    return String(params[index] || constant_2.DEFAULT_STRING);
}
exports.default = SinaStockTransform;
