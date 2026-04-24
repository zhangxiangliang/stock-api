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
import { ERROR_API_CODE } from "../../../utils/constant";
import { createCodeMapper } from "../../shared/code-mapper";

const TencentApiCodeTransform = createCodeMapper({
  inputPrefixes: {
    SZ: TENCENT_SZ,
    SH: TENCENT_SH,
    HK: TENCENT_HK,
    US: TENCENT_US,
  },
  outputPrefixes: {
    SZ: COMMON_SZ,
    SH: COMMON_SH,
    HK: COMMON_HK,
    US: COMMON_US,
  },
  unknownError: ERROR_API_CODE,
});

export default TencentApiCodeTransform;
