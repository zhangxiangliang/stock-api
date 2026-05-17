"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockRequestError = exports.StockParseError = exports.StockCodeError = exports.StockApiError = exports.stocks = void 0;
// Stocks
const index_1 = __importDefault(require("./stocks/index"));
exports.stocks = index_1.default;
var errors_1 = require("./errors");
Object.defineProperty(exports, "StockApiError", { enumerable: true, get: function () { return errors_1.StockApiError; } });
Object.defineProperty(exports, "StockCodeError", { enumerable: true, get: function () { return errors_1.StockCodeError; } });
Object.defineProperty(exports, "StockParseError", { enumerable: true, get: function () { return errors_1.StockParseError; } });
Object.defineProperty(exports, "StockRequestError", { enumerable: true, get: function () { return errors_1.StockRequestError; } });
exports.default = { stocks: index_1.default };
