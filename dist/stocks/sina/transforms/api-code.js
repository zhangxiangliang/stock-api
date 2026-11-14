"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constant_1 = require("../../../stocks/base/utils/constant");
const constant_2 = require("../../../stocks/sina/utils/constant");
const constant_3 = require("../../../utils/constant");
const code_mapper_1 = require("../../shared/code-mapper");
const SinaApiCodeTransform = (0, code_mapper_1.createCodeMapper)({
    inputPrefixes: {
        SZ: constant_2.SINA_SZ,
        SH: constant_2.SINA_SH,
        HK: constant_2.SINA_HK,
        US: constant_2.SINA_US,
    },
    outputPrefixes: {
        SZ: constant_1.COMMON_SZ,
        SH: constant_1.COMMON_SH,
        HK: constant_1.COMMON_HK,
        US: constant_1.COMMON_US,
    },
    unknownError: constant_3.ERROR_API_CODE,
    formatOutputCode(market, code) {
        return market === "US" ? code.toLowerCase() : code;
    },
});
exports.default = SinaApiCodeTransform;
