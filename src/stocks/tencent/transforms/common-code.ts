import {
  COMMON_HK,
  COMMON_SH,
  COMMON_SZ,
  COMMON_US,
} from "../../../stocks/base/utils/constant";
import {
  TENCENT_HK,
  TENCENT_SH,
  TENCENT_SZ,
  TENCENT_US,
} from "../../../stocks/tencent/utils/constant";
import { ERROR_COMMON_CODE } from "../../../utils/constant";
import { createCodeMapper } from "../../shared/code-mapper";

const TencentCommonCodeTransform = createCodeMapper({
  inputPrefixes: {
    SZ: COMMON_SZ,
    SH: COMMON_SH,
    HK: COMMON_HK,
    US: COMMON_US,
  },
  outputPrefixes: {
    SZ: TENCENT_SZ,
    SH: TENCENT_SH,
    HK: TENCENT_HK,
    US: TENCENT_US,
  },
  unknownError: ERROR_COMMON_CODE,
  formatOutputCode(market, code) {
    return market === "HK" || market === "US" ? code.toUpperCase() : code;
  },
});

export default TencentCommonCodeTransform;
