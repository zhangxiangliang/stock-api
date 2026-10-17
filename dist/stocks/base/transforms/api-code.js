"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constant_1 = require("../../../utils/constant");
const code_mapper_1 = require("../../shared/code-mapper");
const BaseApiCodeTransform = (0, code_mapper_1.createUnimplementedCodeMapper)({
    unknownError: constant_1.ERROR_API_CODE,
    marketErrors: {
        SZ: constant_1.ERROR_UNDEFINED_SZ_API_CODE,
        SH: constant_1.ERROR_UNDEFINED_SH_API_CODE,
        HK: constant_1.ERROR_UNDEFINED_HK_API_CODE,
        US: constant_1.ERROR_UNDEFINED_US_API_CODE,
    },
});
exports.default = BaseApiCodeTransform;
