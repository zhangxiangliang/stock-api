"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeKlineOptions = normalizeKlineOptions;
exports.parseKlineNumber = parseKlineNumber;
exports.createKline = createKline;
exports.isAvailableKlines = isAvailableKlines;
const defaultOptions = {
    adjust: "none",
    count: 120,
    period: "day",
};
function normalizeKlineOptions(options = {}) {
    return {
        adjust: normalizeAdjust(options.adjust),
        count: normalizeCount(options.count),
        period: normalizePeriod(options.period),
    };
}
function parseKlineNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
}
function createKline(row) {
    const kline = {
        close: parseKlineNumber(row.close),
        date: row.date,
        high: parseKlineNumber(row.high),
        low: parseKlineNumber(row.low),
        open: parseKlineNumber(row.open),
        source: row.source,
    };
    if (row.volume !== undefined) {
        kline.volume = parseKlineNumber(row.volume);
    }
    return kline;
}
function isAvailableKlines(klines) {
    return klines.length > 0;
}
function normalizePeriod(period) {
    return period || defaultOptions.period;
}
function normalizeAdjust(adjust) {
    return adjust || defaultOptions.adjust;
}
function normalizeCount(count) {
    if (count === undefined) {
        return defaultOptions.count;
    }
    if (!Number.isFinite(count) || count <= 0) {
        return defaultOptions.count;
    }
    return Math.floor(count);
}
