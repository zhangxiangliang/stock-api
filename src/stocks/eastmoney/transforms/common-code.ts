import {
  COMMON_SH,
  COMMON_SZ,
} from "../../base/utils/constant";
import { StockCodeError } from "../../../errors";
import { ERROR_COMMON_CODE } from "../../../utils/constant";

export function transformEastmoneyCommonCode(code: string): string {
  const normalizedCode = String(code).toUpperCase();

  if (normalizedCode.startsWith(COMMON_SH)) {
    return `1.${normalizedCode.slice(COMMON_SH.length)}`;
  }

  if (normalizedCode.startsWith(COMMON_SZ)) {
    return `0.${normalizedCode.slice(COMMON_SZ.length)}`;
  }

  throw new StockCodeError(ERROR_COMMON_CODE);
}

const EastmoneyCommonCodeTransform = {
  transform: transformEastmoneyCommonCode,
  transforms(codes: string[]): string[] {
    return codes.map(transformEastmoneyCommonCode);
  },
};

export default EastmoneyCommonCodeTransform;
