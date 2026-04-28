// Stocks
import { parseTencentStock } from "../../stocks/tencent/transforms/stock";
import TencentCommonCodeTransform from "../../stocks/tencent/transforms/common-code";

// Utils
import {
  COMMON_HK,
  COMMON_SH,
  COMMON_SZ,
  COMMON_US,
} from "../../stocks/base/utils/constant";
import { createStockProvider, normalizeCodes } from "../shared/provider";

/**
 * 腾讯股票代码接口
 */
const Tencent = createStockProvider({
  source: "tencent",
  quote: {
    codeTransform: TencentCommonCodeTransform,
    delimiter: "~",
    encoding: "gbk",
    getUrl(apiCodes) {
      return `https://qt.gtimg.cn/q=${apiCodes.join(",")}`;
    },
    isMissing(row, apiCode) {
      return !row.includes(apiCode);
    },
    parseStock(code, params) {
      return parseTencentStock(code, params);
    },
  },
  search: {
    encoding: "gbk",
    getUrl(key) {
      return `https://smartbox.gtimg.cn/s3/?v=2&t=all&c=1&q=${encodeURIComponent(
        key
      )}`;
    },
    parseCodes(body) {
      const rows = body.replace('v_hint="', "").replace('"', "").split("^");
      const codes = rows.map((row) => {
        const [type, code] = row.split("~");

        switch (type) {
          case "sz":
            return COMMON_SZ + code;
          case "sh":
            return COMMON_SH + code;
          case "hk":
            return COMMON_HK + code;
          case "us":
            return COMMON_US + code.split(".")[0].toUpperCase();
          default:
            return "";
        }
      });

      return normalizeCodes(codes);
    },
  },
});

export default Tencent;
