import {
  ERROR_API_CODE,
  ERROR_UNDEFINED_HK_API_CODE,
  ERROR_UNDEFINED_SH_API_CODE,
  ERROR_UNDEFINED_SZ_API_CODE,
  ERROR_UNDEFINED_US_API_CODE,
} from "../../../utils/constant";
import { createUnimplementedCodeMapper } from "../../shared/code-mapper";

const BaseApiCodeTransform = createUnimplementedCodeMapper({
  unknownError: ERROR_API_CODE,
  marketErrors: {
    SZ: ERROR_UNDEFINED_SZ_API_CODE,
    SH: ERROR_UNDEFINED_SH_API_CODE,
    HK: ERROR_UNDEFINED_HK_API_CODE,
    US: ERROR_UNDEFINED_US_API_CODE,
  },
});

export default BaseApiCodeTransform;
