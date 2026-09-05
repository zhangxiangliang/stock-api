"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constant_1 = require("../../../stocks/base/utils/constant");
const constant_2 = require("../../../stocks/tencent/utils/constant");
const constant_3 = require("../../../utils/constant");
const code_mapper_1 = require("../../shared/code-mapper");
const TencentApiCodeTransform = (0, code_mapper_1.createCodeMapper)({
    inputPrefixes: {
        SZ: constant_2.TENCENT_SZ,
        SH: constant_2.TENCENT_SH,
        HK: constant_2.TENCENT_HK,
        US: constant_2.TENCENT_US,
    },
    outputPrefixes: {
        SZ: constant_1.COMMON_SZ,
        SH: constant_1.COMMON_SH,
        HK: constant_1.COMMON_HK,
        US: constant_1.COMMON_US,
    },
    unknownError: constant_3.ERROR_API_CODE,
});
exports.default = TencentApiCodeTransform;
