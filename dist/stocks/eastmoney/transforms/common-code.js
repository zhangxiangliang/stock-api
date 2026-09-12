"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformEastmoneyCommonCode = transformEastmoneyCommonCode;
const constant_1 = require("../../base/utils/constant");
const errors_1 = require("../../../errors");
const constant_2 = require("../../../utils/constant");
function transformEastmoneyCommonCode(code) {
    const normalizedCode = String(code).toUpperCase();
    if (normalizedCode.startsWith(constant_1.COMMON_SH)) {
        return `1.${normalizedCode.slice(constant_1.COMMON_SH.length)}`;
    }
    if (normalizedCode.startsWith(constant_1.COMMON_SZ)) {
        return `0.${normalizedCode.slice(constant_1.COMMON_SZ.length)}`;
    }
    throw new errors_1.StockCodeError(constant_2.ERROR_COMMON_CODE);
}
const EastmoneyCommonCodeTransform = {
    transform: transformEastmoneyCommonCode,
    transforms(codes) {
        return codes.map(transformEastmoneyCommonCode);
    },
};
exports.default = EastmoneyCommonCodeTransform;
