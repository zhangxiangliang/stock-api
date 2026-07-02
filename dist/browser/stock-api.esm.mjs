// src/utils/constant.ts
var DEFAULT_NUMBER = 0;
var DEFAULT_STRING = "---";
var ERROR_COMMON_CODE = "\u8BF7\u68C0\u67E5\u7EDF\u4E00\u4EE3\u7801\u662F\u5426\u6B63\u786E";
var ERROR_UNDEFINED_GET_STOCK = "\u672A\u5B9E\u73B0\u83B7\u53D6\u80A1\u7968\u6570\u636E";
var ERROR_UNDEFINED_GET_STOCKS = "\u672A\u5B9E\u73B0\u83B7\u53D6\u80A1\u7968\u6570\u636E\u7EC4";
var ERROR_UNDEFINED_GET_KLINES = "\u672A\u5B9E\u73B0\u83B7\u53D6 K \u7EBF\u6570\u636E";
var ERROR_UNDEFINED_SEARCH_STOCK = "\u672A\u5B9E\u73B0\u641C\u7D22\u80A1\u7968\u4EE3\u7801";
var DEFAULT_STOCK = {
  code: DEFAULT_STRING,
  name: DEFAULT_STRING,
  percent: DEFAULT_NUMBER,
  now: DEFAULT_NUMBER,
  low: DEFAULT_NUMBER,
  high: DEFAULT_NUMBER,
  yesterday: DEFAULT_NUMBER
};

// src/errors.ts
var StockApiError = class extends Error {
  constructor(message) {
    super(message);
    this.name = new.target.name;
  }
};
var StockRequestError = class extends StockApiError {
};
var StockCodeError = class extends StockApiError {
};
var StockParseError = class extends StockApiError {
};

// src/utils/browser-script.ts
function isBrowserRuntime() {
  return Boolean(globalThis.document);
}
async function loadBrowserScript(options) {
  const runtime = globalThis;
  const document = runtime.document;
  const parent = document?.head || document?.body || document?.documentElement;
  if (!document || !parent) {
    throw new StockRequestError("Browser document is not available");
  }
  await new Promise((resolve, reject) => {
    const script = document.createElement("script");
    const timeout = options.timeout || 15e3;
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new StockRequestError(`Script request timed out after ${timeout}ms`));
    }, timeout);
    function cleanup() {
      clearTimeout(timeoutId);
      script.onload = null;
      script.onerror = null;
      script.parentNode?.removeChild?.(script);
    }
    script.async = true;
    script.charset = options.charset || "utf-8";
    script.onload = () => {
      cleanup();
      resolve();
    };
    script.onerror = () => {
      cleanup();
      reject(new StockRequestError("Script request failed"));
    };
    script.src = options.url;
    parent.appendChild(script);
  });
}
async function loadBrowserScriptValue(options) {
  const runtime = globalThis;
  await loadBrowserScript(options);
  const value = runtime[options.variableName];
  delete runtime[options.variableName];
  return typeof value === "string" ? value : "";
}
async function loadBrowserJsonp(options) {
  const runtime = globalThis;
  const callbackParam = options.callbackParam || "callback";
  const callbackName = `stockApiJsonp${Date.now()}${Math.floor(
    Math.random() * 1e5
  )}`;
  let result;
  runtime[callbackName] = (value) => {
    result = value;
  };
  try {
    const url = appendQueryParam(options.url, callbackParam, callbackName);
    await loadBrowserScript({
      charset: options.charset,
      timeout: options.timeout,
      url
    });
  } finally {
    delete runtime[callbackName];
  }
  if (result === void 0) {
    throw new StockRequestError("JSONP response did not invoke callback");
  }
  return result;
}
function appendQueryParam(url, name, value) {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${encodeURIComponent(name)}=${encodeURIComponent(
    value
  )}`;
}

// src/utils/fetch.ts
var RequestBuilder = class {
  constructor(url) {
    this.url = url;
    this.options = {
      headers: {
        Accept: "*/*",
        "User-Agent": "Mozilla/5.0 (compatible; stock-api/2.0)"
      },
      retries: 2,
      timeout: 15e3
    };
  }
  set(name, value) {
    this.options.headers[name] = value;
    return this;
  }
  responseType(_type) {
    return this;
  }
  retries(count) {
    this.options.retries = count;
    return this;
  }
  timeout(ms) {
    this.options.timeout = ms;
    return this;
  }
  then(onfulfilled, onrejected) {
    return this.send().then(onfulfilled, onrejected);
  }
  async send() {
    let lastError;
    for (let attempt = 0; attempt <= this.options.retries; attempt++) {
      try {
        return await request(this.url, this.options);
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError;
  }
};
async function request(url, options) {
  if (typeof globalThis.fetch !== "function") {
    throw new StockRequestError("globalThis.fetch is not available");
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout);
  try {
    const response = await globalThis.fetch(url, {
      headers: createRequestHeaders(options.headers),
      redirect: "follow",
      signal: controller.signal
    });
    const status = response.status;
    const body = await response.arrayBuffer();
    const result = {
      body,
      headers: getResponseHeaders(response.headers),
      status,
      text: new TextDecoder("utf-8").decode(body)
    };
    if (!response.ok) {
      throw new StockRequestError(`Request failed with status ${status}`);
    }
    return result;
  } catch (error) {
    if (isAbortError(error)) {
      throw new StockRequestError(`Request timed out after ${options.timeout}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
function createRequestHeaders(headers) {
  const result = new Headers();
  for (const [name, value] of Object.entries(headers)) {
    if (isBrowserForbiddenHeader(name)) {
      continue;
    }
    result.set(name, value);
  }
  return result;
}
function getResponseHeaders(headers) {
  const result = {};
  headers.forEach((value, name) => {
    result[name] = value;
  });
  return result;
}
function isBrowserForbiddenHeader(name) {
  if (!isBrowser()) {
    return false;
  }
  return ["referer", "user-agent"].includes(name.toLowerCase());
}
function isBrowser() {
  return "window" in globalThis && "document" in globalThis;
}
function isAbortError(error) {
  return error instanceof DOMException && error.name === "AbortError";
}
var requestClient = {
  get(url) {
    return new RequestBuilder(url);
  }
};
var fetch_default = requestClient;

// src/stocks/shared/capabilities.ts
var supported = { supported: true };
var sinaBrowserUnsupported = {
  supported: false,
  note: "Sina requires a valid Referer that browser JavaScript cannot set. Use stocks.auto, Node.js, or a backend proxy."
};
var capabilities = {
  eastmoney: {
    browser: {
      kline: supported,
      quote: supported,
      search: supported
    },
    node: {
      kline: supported,
      quote: supported,
      search: supported
    },
    source: "eastmoney"
  },
  sina: {
    browser: {
      kline: supported,
      quote: sinaBrowserUnsupported,
      search: sinaBrowserUnsupported
    },
    node: {
      kline: supported,
      quote: supported,
      search: supported
    },
    source: "sina"
  },
  tencent: {
    browser: {
      kline: supported,
      quote: supported,
      search: supported
    },
    node: {
      kline: supported,
      quote: supported,
      search: supported
    },
    source: "tencent"
  }
};
function getProviderCapabilities() {
  return Object.values(capabilities).map((capability) => ({
    browser: cloneRuntimeCapability(capability.browser),
    node: cloneRuntimeCapability(capability.node),
    source: capability.source
  }));
}
function assertProviderFeatureSupported(source, feature) {
  const runtime = isBrowserRuntime() ? "browser" : "node";
  const support = capabilities[source][runtime][feature];
  if (!support.supported) {
    throw new StockRequestError(
      `${source} ${feature} is not available in ${runtime}. ${support.note || ""}`.trim()
    );
  }
}
function cloneRuntimeCapability(capability) {
  return {
    kline: { ...capability.kline },
    quote: { ...capability.quote },
    search: { ...capability.search }
  };
}

// src/stocks/shared/kline.ts
var defaultOptions = {
  adjust: "none",
  count: 120,
  period: "day"
};
function normalizeKlineOptions(options = {}) {
  return {
    adjust: normalizeAdjust(options.adjust),
    count: normalizeCount(options.count),
    period: normalizePeriod(options.period)
  };
}
function parseKlineNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}
function createKline(row) {
  const kline = {
    close: parseKlineNumber(row.close),
    date: row.date,
    high: parseKlineNumber(row.high),
    low: parseKlineNumber(row.low),
    open: parseKlineNumber(row.open),
    source: row.source
  };
  if (row.volume !== void 0) {
    kline.volume = parseKlineNumber(row.volume);
  }
  return kline;
}
function normalizePeriod(period) {
  return period || defaultOptions.period;
}
function normalizeAdjust(adjust) {
  return adjust || defaultOptions.adjust;
}
function normalizeCount(count) {
  if (count === void 0) {
    return defaultOptions.count;
  }
  if (!Number.isFinite(count) || count <= 0) {
    return defaultOptions.count;
  }
  return Math.floor(count);
}

// src/utils/array.ts
function uniq(items) {
  return Array.from(new Set(items));
}

// src/utils/iconv.ts
function normalizeEncoding(encoding) {
  return encoding.toLowerCase() === "gbk" ? "gb18030" : encoding;
}
var iconv = {
  decode(body, encoding) {
    return new TextDecoder(normalizeEncoding(encoding)).decode(body);
  }
};
var iconv_default = iconv;

// src/stocks/shared/normalize.ts
function normalizeStock(stock, source) {
  return {
    ...stock,
    source
  };
}

// src/stocks/shared/provider.ts
function normalizeCodes(codes) {
  return uniq(codes.filter((code) => code !== ""));
}
function createMissingStock(code) {
  return { ...DEFAULT_STOCK, code };
}
function splitRows(body) {
  return body.split(";\n").filter((row) => row !== "");
}
function getAssignedValue(row) {
  const [, value = ""] = row.split("=");
  return value;
}
function getDelimitedParams(row, delimiter) {
  return getAssignedValue(row).replace('"', "").split(delimiter);
}
function createStockProvider(config) {
  async function getStocks2(codes) {
    const normalizedCodes = normalizeCodes(codes);
    if (normalizedCodes.length === 0) {
      return [];
    }
    assertProviderFeatureSupported(config.source, "quote");
    const apiCodes = config.quote.codeTransform.transforms(normalizedCodes);
    const body = await requestQuoteText(config.quote, apiCodes);
    const rows = splitRows(body);
    return normalizedCodes.map((code, index) => {
      const apiCode = apiCodes[index];
      const row = rows.find((item) => item.includes(apiCode)) || "";
      if (config.quote.isMissing(row, apiCode)) {
        return createMissingStock(code);
      }
      const params = getDelimitedParams(row, config.quote.delimiter);
      return config.quote.parseStock(code, params);
    });
  }
  async function requestQuoteText(quote, apiCodes) {
    if (isBrowserRuntime() && quote.browserRequestText) {
      return quote.browserRequestText(apiCodes);
    }
    return requestText({
      encoding: quote.encoding,
      headers: quote.headers,
      url: quote.getUrl(apiCodes)
    });
  }
  const api = {
    async getStock(code) {
      const [stock] = await getStocks2([code]);
      return stock || createMissingStock(code);
    },
    getStocks: getStocks2,
    getKlines(code, options) {
      return config.kline.getKlines(code, options);
    },
    async searchStocks(key) {
      assertProviderFeatureSupported(config.source, "search");
      const body = await requestSearchText(config.search, key);
      return getStocks2(config.search.parseCodes(body));
    },
    async inspectStock(code) {
      return createStockInspection(config.source, code, api.getStock);
    }
  };
  return api;
}
async function requestSearchText(search, key) {
  if (isBrowserRuntime() && search.browserRequestText) {
    return search.browserRequestText(key);
  }
  return requestText({
    encoding: search.encoding,
    headers: search.headers,
    url: search.getUrl(key)
  });
}
async function createStockInspection(source, code, getStock) {
  try {
    const stock = normalizeStock(await getStock(code), source);
    return {
      code,
      source,
      status: isAvailableStock(stock) ? "success" : "empty",
      stock
    };
  } catch (error) {
    return {
      code,
      source,
      status: "error",
      error: getErrorMessage(error)
    };
  }
}
function isAvailableStock(stock) {
  return Boolean(stock && stock.name !== DEFAULT_STOCK.name);
}
function getErrorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}
async function requestText(options) {
  const req = fetch_default.get(options.url).responseType("blob");
  for (const [name, value] of options.headers || []) {
    req.set(name, value);
  }
  const res = await req;
  return iconv_default.decode(res.body, options.encoding);
}

// src/stocks/base/utils/constant.ts
var COMMON_SZ = "SZ";
var COMMON_SH = "SH";
var COMMON_HK = "HK";
var COMMON_US = "US";

// src/stocks/eastmoney/transforms/common-code.ts
function transformEastmoneyCommonCode(code) {
  const normalizedCode = String(code).toUpperCase();
  if (normalizedCode.startsWith(COMMON_SH)) {
    return `1.${normalizedCode.slice(COMMON_SH.length)}`;
  }
  if (normalizedCode.startsWith(COMMON_SZ)) {
    return `0.${normalizedCode.slice(COMMON_SZ.length)}`;
  }
  throw new StockCodeError(ERROR_COMMON_CODE);
}
var EastmoneyCommonCodeTransform = {
  transform: transformEastmoneyCommonCode,
  transforms(codes) {
    return codes.map(transformEastmoneyCommonCode);
  }
};
var common_code_default = EastmoneyCommonCodeTransform;

// src/stocks/eastmoney/transforms/stock.ts
function parseEastmoneyStock(code, quote) {
  const now = getEastmoneyStockNow(quote);
  const yesterday = getEastmoneyStockYesterday(quote);
  const percentValue = numberValue(quote?.f170 ?? quote?.f3);
  return {
    code: getEastmoneyStockCode(code),
    name: getEastmoneyStockName(quote),
    percent: percentValue ? percentValue / 100 : now && yesterday ? now / yesterday - 1 : DEFAULT_NUMBER,
    now,
    low: getEastmoneyStockLow(quote),
    high: getEastmoneyStockHigh(quote),
    yesterday
  };
}
function getEastmoneyStockCode(code) {
  return String(code).toUpperCase();
}
function getEastmoneyStockName(quote) {
  return String(quote?.f58 || quote?.f14 || DEFAULT_STRING);
}
function getEastmoneyStockNow(quote) {
  return numberValue(quote?.f43 ?? quote?.f2);
}
function getEastmoneyStockLow(quote) {
  return numberValue(quote?.f45 ?? quote?.f16);
}
function getEastmoneyStockHigh(quote) {
  return numberValue(quote?.f44 ?? quote?.f15);
}
function getEastmoneyStockYesterday(quote) {
  return numberValue(quote?.f60 ?? quote?.f18);
}
function numberValue(value) {
  if (value === void 0 || value === null || value === "-") return DEFAULT_NUMBER;
  const next = Number(value);
  return Number.isFinite(next) ? next : DEFAULT_NUMBER;
}

// src/stocks/eastmoney/index.ts
var quoteFields = "f43,f44,f45,f57,f58,f60,f170";
var klineFields = "f51,f52,f53,f54,f55,f56";
var suggestToken = "D43BF722C8E33BDC906FB84D85E326E8";
var requestTimeoutMs = 4e3;
var defaultPush2Host = "push2delay.eastmoney.com";
var defaultPush2HisHost = "push2his.eastmoney.com";
var push2HisHosts = [
  defaultPush2HisHost,
  "7.push2his.eastmoney.com",
  "33.push2his.eastmoney.com",
  "63.push2his.eastmoney.com",
  "91.push2his.eastmoney.com"
];
function getSuggestUrl(key) {
  return `https://searchapi.eastmoney.com/api/suggest/get?input=${encodeURIComponent(
    key
  )}&type=14&token=${suggestToken}`;
}
async function getStocks(codes) {
  const normalizedCodes = normalizeCodes(codes);
  if (normalizedCodes.length === 0) {
    return [];
  }
  assertProviderFeatureSupported("eastmoney", "quote");
  return Promise.all(normalizedCodes.map(fetchOneStock));
}
var Eastmoney = {
  async getStock(code) {
    const [stock] = await getStocks([code]);
    return stock || createMissingStock2(code);
  },
  getStocks,
  async getKlines(code, options) {
    return getKlines(code, options);
  },
  async searchStocks(key) {
    assertProviderFeatureSupported("eastmoney", "search");
    const response = await requestSuggestJson(key);
    const codes = (response.QuotationCodeTable?.Data || []).map(parseSuggestCode).filter(Boolean);
    return getStocks(codes);
  },
  async inspectStock(code) {
    return createStockInspection("eastmoney", code, Eastmoney.getStock);
  }
};
async function getKlines(code, options) {
  assertProviderFeatureSupported("eastmoney", "kline");
  const normalizedOptions = normalizeKlineOptions(options);
  const apiCode = common_code_default.transform(code);
  const url = `https://${defaultPush2HisHost}/api/qt/stock/kline/get?fields1=f1,f2,f3,f4,f5,f6&fields2=${klineFields}&ut=7eea3edcaed734bea9cbfc24409ed989&klt=${getKlinePeriodCode(
    normalizedOptions.period
  )}&fqt=${getAdjustCode(normalizedOptions.adjust)}&secid=${encodeURIComponent(
    apiCode
  )}&beg=19700101&end=20500101&lmt=${normalizedOptions.count}`;
  const response = await requestJsonFromHosts(
    url,
    push2HisHosts
  );
  const rows = response.data?.klines || [];
  return rows.map((line) => {
    const [date, open, close, high, low, volume] = line.split(",");
    return createKline({
      close,
      date,
      high,
      low,
      open,
      source: "eastmoney",
      volume
    });
  });
}
async function fetchOneStock(code) {
  const apiCode = common_code_default.transform(code);
  const url = `https://${defaultPush2Host}/api/qt/stock/get?fltt=2&invt=2&secid=${encodeURIComponent(
    apiCode
  )}&fields=${quoteFields}`;
  const quote = await requestQuote(url);
  if (!quote?.f57 && !quote?.f58) {
    return createMissingStock2(code);
  }
  return parseEastmoneyStock(code, quote);
}
async function requestQuote(url) {
  const response = await requestJson(url, 1);
  const quote = response.data;
  if (quote?.f57 || quote?.f58) {
    return quote;
  }
  return void 0;
}
async function requestJson(url, retries = 0) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch_default.get(url).set("Accept", "application/json,text/plain,*/*").set("Referer", "https://quote.eastmoney.com/").retries(0).timeout(requestTimeoutMs);
      return JSON.parse(response.text);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}
function getKlinePeriodCode(period) {
  switch (period) {
    case "week":
      return "102";
    case "month":
      return "103";
    case "day":
    default:
      return "101";
  }
}
function getAdjustCode(adjust) {
  switch (adjust) {
    case "qfq":
      return "1";
    case "hfq":
      return "2";
    case "none":
    default:
      return "0";
  }
}
async function requestSuggestJson(key) {
  const url = getSuggestUrl(key);
  if (isBrowserRuntime()) {
    return loadBrowserJsonp({
      callbackParam: "cb",
      url
    });
  }
  return requestJson(url, 1);
}
function parseSuggestCode(item) {
  const quoteId = item.QuoteID || "";
  const code = item.Code || quoteId.split(".")[1] || "";
  const market = item.MktNum || quoteId.split(".")[0] || "";
  if (!code) return "";
  if (market === "1") return `SH${code}`;
  if (market === "0") return `SZ${code}`;
  return "";
}
function createMissingStock2(code) {
  return { ...DEFAULT_STOCK, code };
}
async function requestJsonFromHosts(url, hosts) {
  let lastError;
  for (const host of hosts) {
    try {
      return await requestJson(replaceUrlHost(url, host));
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}
function replaceUrlHost(url, host) {
  const parsedUrl = new URL(url);
  parsedUrl.hostname = host;
  return parsedUrl.toString();
}
var eastmoney_default = Eastmoney;

// src/stocks/sina/transforms/stock.ts
var fieldMap = {
  [COMMON_SH]: { name: 0, now: 3, low: 5, high: 4, yesterday: 2 },
  [COMMON_SZ]: { name: 0, now: 3, low: 5, high: 4, yesterday: 2 },
  [COMMON_HK]: { name: 1, now: 6, low: 5, high: 4, yesterday: 3 },
  [COMMON_US]: { name: 0, now: 1, low: 7, high: 6, yesterday: 26 }
};
function parseSinaStock(code, params) {
  const fields = fieldMap[code.slice(0, 2)];
  const now = fields ? numberAt(params, fields.now) : DEFAULT_NUMBER;
  const yesterday = fields ? numberAt(params, fields.yesterday) : DEFAULT_NUMBER;
  return {
    code: String(code).toUpperCase(),
    name: fields ? stringAt(params, fields.name) : DEFAULT_STRING,
    percent: now ? now / yesterday - 1 : DEFAULT_NUMBER,
    now,
    low: fields ? numberAt(params, fields.low) : DEFAULT_NUMBER,
    high: fields ? numberAt(params, fields.high) : DEFAULT_NUMBER,
    yesterday
  };
}
function numberAt(params, index) {
  return Number(params[index] || DEFAULT_NUMBER);
}
function stringAt(params, index) {
  return String(params[index] || DEFAULT_STRING);
}

// src/stocks/sina/utils/constant.ts
var SINA_SZ = "sz";
var SINA_SH = "sh";
var SINA_HK = "hk";
var SINA_US = "gb_";

// src/stocks/shared/code-mapper.ts
function createCodeMapper(options) {
  function transformByMarket(market, code) {
    const inputPrefix = options.inputPrefixes[market];
    if (code.indexOf(inputPrefix) !== 0) {
      throw new StockCodeError(
        options.marketErrors?.[market] || options.unknownError
      );
    }
    const value = code.replace(inputPrefix, "");
    const normalizedValue = options.formatOutputCode ? options.formatOutputCode(market, value) : value;
    return options.outputPrefixes[market] + normalizedValue;
  }
  const mapper = {
    transform(code) {
      const market = getMarket(code, options.inputPrefixes);
      if (!market) {
        throw new StockCodeError(options.unknownError);
      }
      return transformByMarket(market, code);
    },
    transforms(codes) {
      return codes.map((code) => mapper.transform(code));
    },
    SZTransform(code) {
      return transformByMarket("SZ", code);
    },
    SHTransform(code) {
      return transformByMarket("SH", code);
    },
    HKTransform(code) {
      return transformByMarket("HK", code);
    },
    USTransform(code) {
      return transformByMarket("US", code);
    }
  };
  return mapper;
}
function getMarket(code, prefixes) {
  return Object.keys(prefixes).find(
    (market) => code.startsWith(prefixes[market])
  );
}

// src/stocks/sina/transforms/common-code.ts
var SinaCommonCodeTransform = createCodeMapper({
  inputPrefixes: {
    SZ: COMMON_SZ,
    SH: COMMON_SH,
    HK: COMMON_HK,
    US: COMMON_US
  },
  outputPrefixes: {
    SZ: SINA_SZ,
    SH: SINA_SH,
    HK: SINA_HK,
    US: SINA_US
  },
  unknownError: ERROR_COMMON_CODE,
  formatOutputCode(market, code) {
    return market === "US" ? code.toLowerCase() : code;
  }
});
var common_code_default2 = SinaCommonCodeTransform;

// src/stocks/sina/index.ts
var refererHeader = [["Referer", "https://finance.sina.com.cn/"]];
function getQuoteUrl(apiCodes) {
  return `https://hq.sinajs.cn/list=${apiCodes.join(",")}`;
}
function getSearchUrl(key) {
  return `https://suggest3.sinajs.cn/suggest/type=2&key=${encodeURIComponent(
    key
  )}`;
}
function getKlineUrl(apiCode, options) {
  return `https://quotes.sina.cn/cn/api/json_v2.php/CN_MarketData.getKLineData?symbol=${apiCode}&scale=${getScale(
    options.period
  )}&ma=no&datalen=${options.count}`;
}
async function getKlines2(code, options) {
  assertProviderFeatureSupported("sina", "kline");
  const normalizedOptions = normalizeKlineOptions(options);
  if (normalizedOptions.adjust !== "none") {
    return [];
  }
  const apiCode = common_code_default2.transform(code);
  const rows = await requestJson2(
    getKlineUrl(apiCode, normalizedOptions)
  );
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map(
    (row) => createKline({
      close: row.close,
      date: row.day || "",
      high: row.high,
      low: row.low,
      open: row.open,
      source: "sina",
      volume: row.volume
    })
  );
}
async function requestJson2(url) {
  const response = await fetch_default.get(url).set("Accept", "application/json,text/plain,*/*").set("Referer", "https://finance.sina.com.cn/");
  return JSON.parse(response.text);
}
function getScale(period) {
  switch (period) {
    case "week":
      return "1200";
    case "month":
      return "7200";
    case "day":
    default:
      return "240";
  }
}
var Sina = createStockProvider({
  kline: { getKlines: getKlines2 },
  source: "sina",
  quote: {
    codeTransform: common_code_default2,
    delimiter: ",",
    encoding: "gb18030",
    headers: refererHeader,
    getUrl(apiCodes) {
      return getQuoteUrl(apiCodes);
    },
    isMissing(row) {
      return getAssignedValue(row) === '""';
    },
    parseStock(code, params) {
      return parseSinaStock(code, params);
    }
  },
  search: {
    encoding: "gb18030",
    headers: refererHeader,
    getUrl(key) {
      return getSearchUrl(key);
    },
    parseCodes(body) {
      const rows = body.replace('var suggestvalue="', "").replace('";', "").split(";");
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
    }
  }
});
var sina_default = Sina;

// src/stocks/tencent/transforms/stock.ts
function parseTencentStock(code, params) {
  const now = getTencentStockNow(params);
  const yesterday = getTencentStockYesterday(params);
  return {
    code: getTencentStockCode(code),
    name: getTencentStockName(params),
    percent: now ? now / yesterday - 1 : DEFAULT_NUMBER,
    now,
    low: getTencentStockLow(params),
    high: getTencentStockHigh(params),
    yesterday
  };
}
function getTencentStockCode(code) {
  return String(code).toUpperCase();
}
function getTencentStockName(params) {
  return String(params[1] || DEFAULT_STRING);
}
function getTencentStockNow(params) {
  return numberAt2(params, 3);
}
function getTencentStockLow(params) {
  return numberAt2(params, 34);
}
function getTencentStockHigh(params) {
  return numberAt2(params, 33);
}
function getTencentStockYesterday(params) {
  return numberAt2(params, 4);
}
function numberAt2(params, index) {
  return Number(params[index] || DEFAULT_NUMBER);
}

// src/stocks/tencent/utils/constant.ts
var TENCENT_SZ = "sz";
var TENCENT_SH = "sh";
var TENCENT_HK = "hk";
var TENCENT_US = "us";

// src/stocks/tencent/transforms/common-code.ts
var TencentCommonCodeTransform = createCodeMapper({
  inputPrefixes: {
    SZ: COMMON_SZ,
    SH: COMMON_SH,
    HK: COMMON_HK,
    US: COMMON_US
  },
  outputPrefixes: {
    SZ: TENCENT_SZ,
    SH: TENCENT_SH,
    HK: TENCENT_HK,
    US: TENCENT_US
  },
  unknownError: ERROR_COMMON_CODE,
  formatOutputCode(market, code) {
    return market === "HK" || market === "US" ? code.toUpperCase() : code;
  }
});
var common_code_default3 = TencentCommonCodeTransform;

// src/stocks/tencent/index.ts
function getSearchUrl2(key) {
  return `https://smartbox.gtimg.cn/s3/?v=2&t=all&c=1&q=${encodeURIComponent(
    key
  )}`;
}
async function requestBrowserSearchText(key) {
  const value = await loadBrowserScriptValue({
    charset: "gbk",
    url: getSearchUrl2(key),
    variableName: "v_hint"
  });
  return `v_hint="${value}"`;
}
async function getKlines3(code, options) {
  assertProviderFeatureSupported("tencent", "kline");
  const normalizedOptions = normalizeKlineOptions(options);
  const apiCode = common_code_default3.transform(code);
  const endpoint = normalizedOptions.adjust === "none" ? "kline/kline" : "fqkline/get";
  const adjustPrefix = normalizedOptions.adjust === "none" ? "" : normalizedOptions.adjust;
  const dataKey = `${adjustPrefix}${normalizedOptions.period}`;
  const adjustParam = normalizedOptions.adjust === "none" ? "" : `,${normalizedOptions.adjust}`;
  const url = `https://web.ifzq.gtimg.cn/appstock/app/${endpoint}?param=${apiCode},${normalizedOptions.period},,,${normalizedOptions.count}${adjustParam}`;
  const response = await requestJson3(url);
  const rows = response.data?.[apiCode]?.[dataKey] || [];
  return rows.map(
    ([date, open, close, high, low, volume]) => createKline({
      close,
      date,
      high,
      low,
      open,
      source: "tencent",
      volume
    })
  );
}
async function requestJson3(url) {
  const response = await fetch_default.get(url).set("Accept", "application/json,text/plain,*/*");
  return JSON.parse(response.text);
}
var Tencent = createStockProvider({
  kline: { getKlines: getKlines3 },
  source: "tencent",
  quote: {
    codeTransform: common_code_default3,
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
    }
  },
  search: {
    browserRequestText: requestBrowserSearchText,
    encoding: "gbk",
    getUrl(key) {
      return getSearchUrl2(key);
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
    }
  }
});
var tencent_default = Tencent;

// src/stocks/auto/index.ts
var providers = [
  { name: "tencent", api: tencent_default },
  { name: "sina", api: sina_default },
  { name: "eastmoney", api: eastmoney_default }
];
function createAutoStockApi(autoProviders) {
  const api = {
    async getStock(code) {
      return (await api.inspectStock(code)).stock;
    },
    async getStocks(codes) {
      return Promise.all(normalizeCodes(codes).map((code) => api.getStock(code)));
    },
    async getKlines(code, options) {
      for (const provider of getKlineProviders(autoProviders)) {
        const klines = await getProviderKlines(provider, code, options);
        if (klines.length > 0) {
          return klines;
        }
      }
      return [];
    },
    async searchStocks(key) {
      for (const provider of autoProviders) {
        const stocks = await searchProviderStocks(provider, key);
        const availableStocks = stocks.filter(isAvailableStock2);
        if (availableStocks.length > 0) {
          return availableStocks.map(
            (stock) => normalizeStock(stock, provider.name)
          );
        }
      }
      return [];
    },
    async inspectStock(code) {
      const sources = [];
      let selectedStock;
      let selectedSource = "base";
      for (const provider of autoProviders) {
        const inspection = await provider.api.inspectStock(code);
        sources.push(inspection);
        if (!selectedStock && inspection.status === "success" && inspection.stock) {
          selectedStock = inspection.stock;
          selectedSource = inspection.source;
        }
      }
      const stock = selectedStock || normalizeStock({ ...DEFAULT_STOCK, code }, "base");
      return {
        code,
        source: selectedSource,
        stock,
        sources
      };
    }
  };
  return api;
}
var Auto = createAutoStockApi(providers);
function getKlineProviders(autoProviders) {
  const order = /* @__PURE__ */ new Map([
    ["tencent", 0],
    ["sina", 1],
    ["eastmoney", 2]
  ]);
  return [...autoProviders].sort(
    (left, right) => (order.get(left.name) ?? Number.MAX_SAFE_INTEGER) - (order.get(right.name) ?? Number.MAX_SAFE_INTEGER)
  );
}
async function getProviderKlines(provider, code, options) {
  try {
    return await provider.api.getKlines(code, options);
  } catch {
    return [];
  }
}
async function searchProviderStocks(provider, key) {
  try {
    return await provider.api.searchStocks(key);
  } catch {
    return [];
  }
}
function isAvailableStock2(stock) {
  return Boolean(stock && stock.name !== DEFAULT_STOCK.name);
}
var auto_default = Auto;

// src/stocks/base/index.ts
var Base = {
  /**
   * 获取股票数据
   * @param code 股票代码
   */
  async getStock(_code) {
    throw new Error(ERROR_UNDEFINED_GET_STOCK);
  },
  /**
   * 获取股票数据组
   * @param codes 股票代码组
   */
  async getStocks(_codes) {
    throw new Error(ERROR_UNDEFINED_GET_STOCKS);
  },
  /**
   * 获取 K 线数据
   * @param code 股票代码
   */
  async getKlines(_code, _options) {
    throw new Error(ERROR_UNDEFINED_GET_KLINES);
  },
  /**
   * 搜索股票代码
   * @param key 关键字
   */
  async searchStocks(_key) {
    throw new Error(ERROR_UNDEFINED_SEARCH_STOCK);
  }
};
var base_default = Base;

// src/stocks/index.ts
var sourceNames = ["tencent", "sina", "eastmoney"];
function getSources() {
  return [...sourceNames];
}
var stocks_default = {
  auto: auto_default,
  base: base_default,
  eastmoney: eastmoney_default,
  getProviderCapabilities,
  getSources,
  sina: sina_default,
  tencent: tencent_default
};

// src/index.ts
var index_default = { stocks: stocks_default };
export {
  StockApiError,
  StockCodeError,
  StockParseError,
  StockRequestError,
  index_default as default,
  stocks_default as stocks
};
//# sourceMappingURL=stock-api.esm.mjs.map
