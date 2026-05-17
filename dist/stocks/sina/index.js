"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Stocks
const stock_1 = require("../../stocks/sina/transforms/stock");
const common_code_1 = __importDefault(require("../../stocks/sina/transforms/common-code"));
// Utils
const constant_1 = require("../../stocks/base/utils/constant");
const provider_1 = require("../shared/provider");
const refererHeader = [["Referer", "https://finance.sina.com.cn/"]];
/**
 * 新浪股票代码接口
 */
const Sina = (0, provider_1.createStockProvider)({
    source: "sina",
    quote: {
        codeTransform: common_code_1.default,
        delimiter: ",",
        encoding: "gb18030",
        headers: refererHeader,
        getUrl(apiCodes) {
            return `https://hq.sinajs.cn/list=${apiCodes.join(",")}`;
        },
        isMissing(row) {
            return (0, provider_1.getAssignedValue)(row) === '""';
        },
        parseStock(code, params) {
            return (0, stock_1.parseSinaStock)(code, params);
        },
    },
    search: {
        encoding: "gb18030",
        headers: refererHeader,
        getUrl(key) {
            return `http://suggest3.sinajs.cn/suggest/type=2&key=${encodeURIComponent(key)}`;
        },
        parseCodes(body) {
            const rows = body
                .replace('var suggestvalue="', "")
                .replace('";', "")
                .split(";");
            const codes = rows.flatMap((row) => {
                const code = row.split(",")[0];
                if (code.indexOf("us") === 0) {
                    return [constant_1.COMMON_US + code.replace("us", "")];
                }
                if (code.indexOf("sz") === 0) {
                    return [constant_1.COMMON_SZ + code.replace("sz", "")];
                }
                if (code.indexOf("sh") === 0) {
                    return [constant_1.COMMON_SH + code.replace("sh", "")];
                }
                if (code.indexOf("hk") === 0) {
                    return [constant_1.COMMON_HK + code.replace("hk", "")];
                }
                if (code.indexOf("of") === 0) {
                    const fundCode = code.replace("of", "");
                    return [constant_1.COMMON_SZ + fundCode, constant_1.COMMON_SH + fundCode];
                }
                return [];
            });
            return (0, provider_1.normalizeCodes)(codes);
        },
    },
});
exports.default = Sina;
