// 默认股票名称常量
export const DEFAULT_NUMBER = 0;
export const DEFAULT_STRING = "---";

// 默认错误提示常量
export const ERROR_API_CODE = "请检查股票代码是否正确";
export const ERROR_COMMON_CODE = "请检查统一代码是否正确";

export const ERROR_UNDEFINED_GET_STOCK = "未实现获取股票数据";
export const ERROR_UNDEFINED_GET_STOCKS = "未实现获取股票数据组";
export const ERROR_UNDEFINED_SEARCH_STOCK = "未实现搜索股票代码";

export const ERROR_UNDEFINED_COMMON_CODE = "未实现统一代码转换股票代码";
export const ERROR_UNDEFINED_SZ_COMMON_CODE =
  "未实现深交所统一代码转换股票代码";
export const ERROR_UNDEFINED_SH_COMMON_CODE =
  "未实现上交所统一代码转换股票代码";
export const ERROR_UNDEFINED_HK_COMMON_CODE =
  "未实现港交所统一代码转换股票代码";
export const ERROR_UNDEFINED_US_COMMON_CODE =
  "未实现美交所统一代码转换股票代码";

export const ERROR_UNDEFINED_API_CODE = "未实现股票代码转换统一代码";
export const ERROR_UNDEFINED_API_CODES = "未实现股票代码组转换统一代码组";
export const ERROR_UNDEFINED_SZ_API_CODE = "未实现深交所股票代码转换统一代码";
export const ERROR_UNDEFINED_SH_API_CODE = "未实现上交所股票代码转换统一代码";
export const ERROR_UNDEFINED_HK_API_CODE = "未实现港交所股票代码转换统一代码";
export const ERROR_UNDEFINED_US_API_CODE = "未实现美交所股票代码转换统一代码";

export const ERROR_UNDEFINED_GET_CODE = "未实现获取代码";
export const ERROR_UNDEFINED_GET_NAME = "未实现获取名称";
export const ERROR_UNDEFINED_GET_NOW = "未实现获取现价";
export const ERROR_UNDEFINED_GET_LOW = "未实现获取最低价";
export const ERROR_UNDEFINED_GET_HIGH = "未实现获取最高价";
export const ERROR_UNDEFINED_GET_PERCENT = "未实现获取涨跌";
export const ERROR_UNDEFINED_GET_YESTERDAY = "未实现获取昨日收盘价";

// 默认股票数据常量
export const DEFAULT_STOCK = {
  code: DEFAULT_STRING,
  name: DEFAULT_STRING,
  percent: DEFAULT_NUMBER,

  now: DEFAULT_NUMBER,
  low: DEFAULT_NUMBER,
  high: DEFAULT_NUMBER,
  yesterday: DEFAULT_NUMBER,
};
