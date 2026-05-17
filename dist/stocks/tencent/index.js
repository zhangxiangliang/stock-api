"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Stocks
const stock_1 = require("../../stocks/tencent/transforms/stock");
const common_code_1 = __importDefault(require("../../stocks/tencent/transforms/common-code"));
// Utils
const constant_1 = require("../../stocks/base/utils/constant");
const provider_1 = require("../shared/provider");
/**
 * 腾讯股票代码接口
 */
const Tencent = (0, provider_1.createStockProvider)({
    source: "tencent",
    quote: {
        codeTransform: common_code_1.default,
        delimiter: "~",
        encoding: "gbk",
        getUrl(apiCodes) {
            return `https://qt.gtimg.cn/q=${apiCodes.join(",")}`;
        },
        isMissing(row, apiCode) {
            return !row.includes(apiCode);
        },
        parseStock(code, params) {
            return (0, stock_1.parseTencentStock)(code, params);
        },
    },
    search: {
        encoding: "gbk",
        getUrl(key) {
            return `https://smartbox.gtimg.cn/s3/?v=2&t=all&c=1&q=${encodeURIComponent(key)}`;
        },
        parseCodes(body) {
            const rows = body.replace('v_hint="', "").replace('"', "").split("^");
            const codes = rows.map((row) => {
                const [type, code] = row.split("~");
                switch (type) {
                    case "sz":
                        return constant_1.COMMON_SZ + code;
                    case "sh":
                        return constant_1.COMMON_SH + code;
                    case "hk":
                        return constant_1.COMMON_HK + code;
                    case "us":
                        return constant_1.COMMON_US + code.split(".")[0].toUpperCase();
                    default:
                        return "";
                }
            });
            return (0, provider_1.normalizeCodes)(codes);
        },
    },
});
exports.default = Tencent;
