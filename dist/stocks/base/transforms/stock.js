"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constant_1 = require("../../../utils/constant");
const BaseStockTransform = {
    getCode() {
        throw new Error(constant_1.ERROR_UNDEFINED_GET_CODE);
    },
    getName() {
        throw new Error(constant_1.ERROR_UNDEFINED_GET_NAME);
    },
    getNow() {
        throw new Error(constant_1.ERROR_UNDEFINED_GET_NOW);
    },
    getLow() {
        throw new Error(constant_1.ERROR_UNDEFINED_GET_LOW);
    },
    getHigh() {
        throw new Error(constant_1.ERROR_UNDEFINED_GET_HIGH);
    },
    getYesterday() {
        throw new Error(constant_1.ERROR_UNDEFINED_GET_YESTERDAY);
    },
    getPercent() {
        throw new Error(constant_1.ERROR_UNDEFINED_GET_PERCENT);
    },
    getStock() {
        throw new Error(constant_1.ERROR_UNDEFINED_GET_STOCK);
    },
};
exports.default = BaseStockTransform;
