"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeStock = normalizeStock;
function normalizeStock(stock, source) {
    return {
        ...stock,
        source,
    };
}
