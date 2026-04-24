import {
  COMMON_HK,
  COMMON_SH,
  COMMON_SZ,
  COMMON_US,
} from "../../../stocks/base/utils/constant";
import {
  SINA_HK,
  SINA_SH,
  SINA_SZ,
  SINA_US,
} from "../../../stocks/sina/utils/constant";
import { ERROR_COMMON_CODE } from "../../../utils/constant";
import { createCodeMapper } from "../../shared/code-mapper";

const SinaCommonCodeTransform = createCodeMapper({
  inputPrefixes: {
    SZ: COMMON_SZ,
    SH: COMMON_SH,
    HK: COMMON_HK,
    US: COMMON_US,
  },
  outputPrefixes: {
    SZ: SINA_SZ,
    SH: SINA_SH,
    HK: SINA_HK,
    US: SINA_US,
  },
  unknownError: ERROR_COMMON_CODE,
  formatOutputCode(market, code) {
    return market === "US" ? code.toLowerCase() : code;
  },
});

export default SinaCommonCodeTransform;
