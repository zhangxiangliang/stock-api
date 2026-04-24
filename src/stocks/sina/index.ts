// Stocks
import { parseSinaStock } from "../../stocks/sina/transforms/stock";
import SinaCommonCodeTransform from "../../stocks/sina/transforms/common-code";

// Utils
import {
  COMMON_HK,
  COMMON_SH,
  COMMON_SZ,
  COMMON_US,
} from "../../stocks/base/utils/constant";
import {
  createStockProvider,
  getAssignedValue,
  normalizeCodes,
} from "../shared/provider";

const refererHeader = [["Referer", "https://finance.sina.com.cn/"]] as const;

/**
 * 新浪股票代码接口
 */
const Sina = createStockProvider({
  quote: {
    codeTransform: SinaCommonCodeTransform,
    delimiter: ",",
    encoding: "gb18030",
    headers: refererHeader,
    getUrl(apiCodes) {
      return `https://hq.sinajs.cn/list=${apiCodes.join(",")}`;
    },
    isMissing(row) {
      return getAssignedValue(row) === '""';
    },
    parseStock(code, params) {
      return parseSinaStock(code, params);
    },
  },
  search: {
    encoding: "gb18030",
    headers: refererHeader,
    getUrl(key) {
      return `http://suggest3.sinajs.cn/suggest/type=2&key=${encodeURIComponent(
        key
      )}`;
    },
    parseCodes(body) {
      const rows = body
        .replace('var suggestvalue="', "")
        .replace('";', "")
        .split(";");

      const codes = rows.flatMap((row) => {
        const code = row.split(",")[0];

        if (code.indexOf("us") === 0) {
          return [COMMON_US + code.replace("us", "")];
        }

        if (code.indexOf("sz") === 0) {
          return [COMMON_SZ + code.replace("sz", "")];
        }

        if (code.indexOf("sh") === 0) {
          return [COMMON_SH + code.replace("sh", "")];
        }

        if (code.indexOf("hk") === 0) {
          return [COMMON_HK + code.replace("hk", "")];
        }

        if (code.indexOf("of") === 0) {
          const fundCode = code.replace("of", "");
          return [COMMON_SZ + fundCode, COMMON_SH + fundCode];
        }

        return [];
      });

      return normalizeCodes(codes);
    },
  },
});

export default Sina;
