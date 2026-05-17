"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockParseError = exports.StockCodeError = exports.StockRequestError = exports.StockApiError = void 0;
class StockApiError extends Error {
    constructor(message) {
        super(message);
        this.name = new.target.name;
    }
}
exports.StockApiError = StockApiError;
class StockRequestError extends StockApiError {
}
exports.StockRequestError = StockRequestError;
class StockCodeError extends StockApiError {
}
exports.StockCodeError = StockCodeError;
class StockParseError extends StockApiError {
}
exports.StockParseError = StockParseError;
