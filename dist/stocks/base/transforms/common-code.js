"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constant_1 = require("../../../utils/constant");
const code_mapper_1 = require("../../shared/code-mapper");
const BaseCommonCodeTransform = (0, code_mapper_1.createUnimplementedCodeMapper)({
    unknownError: constant_1.ERROR_COMMON_CODE,
    marketErrors: {
        SZ: constant_1.ERROR_UNDEFINED_SZ_COMMON_CODE,
        SH: constant_1.ERROR_UNDEFINED_SH_COMMON_CODE,
        HK: constant_1.ERROR_UNDEFINED_HK_COMMON_CODE,
        US: constant_1.ERROR_UNDEFINED_US_COMMON_CODE,
    },
});
exports.default = BaseCommonCodeTransform;
