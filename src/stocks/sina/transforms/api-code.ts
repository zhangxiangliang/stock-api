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
import { ERROR_API_CODE } from "../../../utils/constant";
import { createCodeMapper } from "../../shared/code-mapper";

const SinaApiCodeTransform = createCodeMapper({
  inputPrefixes: {
    SZ: SINA_SZ,
    SH: SINA_SH,
    HK: SINA_HK,
    US: SINA_US,
  },
  outputPrefixes: {
    SZ: COMMON_SZ,
    SH: COMMON_SH,
    HK: COMMON_HK,
    US: COMMON_US,
  },
  unknownError: ERROR_API_CODE,
  formatOutputCode(market, code) {
    return market === "US" ? code.toLowerCase() : code;
  },
});

export default SinaApiCodeTransform;
