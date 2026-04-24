import {
  ERROR_COMMON_CODE,
  ERROR_UNDEFINED_HK_COMMON_CODE,
  ERROR_UNDEFINED_SH_COMMON_CODE,
  ERROR_UNDEFINED_SZ_COMMON_CODE,
  ERROR_UNDEFINED_US_COMMON_CODE,
} from "../../../utils/constant";
import { createUnimplementedCodeMapper } from "../../shared/code-mapper";

const BaseCommonCodeTransform = createUnimplementedCodeMapper({
  unknownError: ERROR_COMMON_CODE,
  marketErrors: {
    SZ: ERROR_UNDEFINED_SZ_COMMON_CODE,
    SH: ERROR_UNDEFINED_SH_COMMON_CODE,
    HK: ERROR_UNDEFINED_HK_COMMON_CODE,
    US: ERROR_UNDEFINED_US_COMMON_CODE,
  },
});

export default BaseCommonCodeTransform;
