"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commonPrefixes = void 0;
exports.createCodeMapper = createCodeMapper;
exports.createUnimplementedCodeMapper = createUnimplementedCodeMapper;
const constant_1 = require("../base/utils/constant");
const errors_1 = require("../../errors");
const commonPrefixes = {
    SZ: constant_1.COMMON_SZ,
    SH: constant_1.COMMON_SH,
    HK: constant_1.COMMON_HK,
    US: constant_1.COMMON_US,
};
exports.commonPrefixes = commonPrefixes;
function createCodeMapper(options) {
    function transformByMarket(market, code) {
        var _a;
        const inputPrefix = options.inputPrefixes[market];
        if (code.indexOf(inputPrefix) !== 0) {
            throw new errors_1.StockCodeError(((_a = options.marketErrors) === null || _a === void 0 ? void 0 : _a[market]) || options.unknownError);
        }
        const value = code.replace(inputPrefix, "");
        const normalizedValue = options.formatOutputCode
            ? options.formatOutputCode(market, value)
            : value;
        return options.outputPrefixes[market] + normalizedValue;
    }
    const mapper = {
        transform(code) {
            const market = getMarket(code, options.inputPrefixes);
            if (!market) {
                throw new errors_1.StockCodeError(options.unknownError);
            }
            return transformByMarket(market, code);
        },
        transforms(codes) {
            return codes.map((code) => mapper.transform(code));
        },
        SZTransform(code) {
            return transformByMarket("SZ", code);
        },
        SHTransform(code) {
            return transformByMarket("SH", code);
        },
        HKTransform(code) {
            return transformByMarket("HK", code);
        },
        USTransform(code) {
            return transformByMarket("US", code);
        },
    };
    return mapper;
}
function createUnimplementedCodeMapper(options) {
    function fail(market) {
        throw new errors_1.StockCodeError(options.marketErrors[market]);
    }
    const mapper = {
        transform(code) {
            const market = getMarket(code, commonPrefixes);
            if (!market) {
                throw new errors_1.StockCodeError(options.unknownError);
            }
            return fail(market);
        },
        transforms(codes) {
            return codes.map((code) => mapper.transform(code));
        },
        SZTransform() {
            return fail("SZ");
        },
        SHTransform() {
            return fail("SH");
        },
        HKTransform() {
            return fail("HK");
        },
        USTransform() {
            return fail("US");
        },
    };
    return mapper;
}
function getMarket(code, prefixes) {
    return Object.keys(prefixes).find((market) => code.startsWith(prefixes[market]));
}
