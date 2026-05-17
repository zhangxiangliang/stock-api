"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Utils
const constant_1 = require("../../utils/constant");
/**
 * 基础股票代码接口
 */
const Base = {
    /**
     * 获取股票数据
     * @param code 股票代码
     */
    async getStock(_code) {
        throw new Error(constant_1.ERROR_UNDEFINED_GET_STOCK);
    },
    /**
     * 获取股票数据组
     * @param codes 股票代码组
     */
    async getStocks(_codes) {
        throw new Error(constant_1.ERROR_UNDEFINED_GET_STOCKS);
    },
    /**
     * 搜索股票代码
     * @param key 关键字
     */
    async searchStocks(_key) {
        throw new Error(constant_1.ERROR_UNDEFINED_SEARCH_STOCK);
    },
};
exports.default = Base;
