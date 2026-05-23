# API Usage

[English](api.EN.md) | [简体中文](api.md)

This document explains the Node.js and browser API. Most users should start with `stocks.auto`.

## Import

ESM / TypeScript:

```typescript
import { stocks } from "stock-api";
```

CommonJS:

```javascript
const { stocks } = require("stock-api");
```

## Default API: stocks.auto

`stocks.auto` falls back across providers in this fixed order:

```text
tencent -> sina -> eastmoney
```

If one provider fails or returns an empty quote, the next provider is tried.

```typescript
const stock = await stocks.auto.getStock("SH510500");
const list = await stocks.auto.getStocks(["SH510500", "SZ000651"]);
const klines = await stocks.auto.getKlines("SH600519", { period: "day" });
const results = await stocks.auto.searchStocks("格力电器");
```

`stocks.auto` adds `source` to show which provider returned the quote.

## Direct Providers

Use a provider directly when you do not want fallback:

```typescript
const stock = await stocks.tencent.getStock("SH510500");
const list = await stocks.sina.getStocks(["SH510500", "SZ000651"]);
const klines = await stocks.tencent.getKlines("SH600519", { period: "week" });
const results = await stocks.eastmoney.searchStocks("贵州茅台");
```

Direct provider calls do not switch to another provider.

## Available Providers

```typescript
const sources = stocks.getSources();
// ["tencent", "sina", "eastmoney"]

const capabilities = stocks.getProviderCapabilities();
```

## Provider Interface

`stocks.auto`, `stocks.tencent`, `stocks.sina`, and `stocks.eastmoney` support:

```typescript
type StockApi = {
  getStock(code: string): Promise<Stock>;
  getStocks(codes: string[]): Promise<Stock[]>;
  getKlines(code: string, options?: KlineOptions): Promise<Kline[]>;
  searchStocks(keyword: string): Promise<Stock[]>;
  inspectStock(code: string): Promise<AutoStockInspection | StockProviderInspection>;
};
```

## K-lines

`getKlines` supports daily, weekly, and monthly K-lines:

```typescript
const klines = await stocks.auto.getKlines("SH600519", {
  period: "day",
  count: 120,
});
```

Use one provider directly:

```typescript
const weekly = await stocks.tencent.getKlines("SH600519", { period: "week" });
const monthly = await stocks.sina.getKlines("SH600519", { period: "month" });
```

`stocks.auto.getKlines` falls back in this order: `tencent -> sina -> eastmoney`.

```typescript
type KlineOptions = {
  period?: "day" | "week" | "month";
  count?: number;
  adjust?: "none" | "qfq" | "hfq";
};

type Kline = {
  date: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume?: number;
  source?: "tencent" | "sina" | "eastmoney";
};
```

The default `period` is `day`, default `count` is `120`, and default `adjust` is `none`. Sina K-lines do not support adjusted prices; `qfq` / `hfq` returns an empty array.

## Return Shape

```typescript
type Stock = {
  code: string;
  name: string;
  percent: number;
  now: number;
  low: number;
  high: number;
  yesterday: number;
  source?: "base" | "tencent" | "sina" | "eastmoney";
};
```

| Field | Meaning |
| --- | --- |
| `code` | Normalized stock code |
| `name` | Stock name |
| `percent` | Change rate, `0.01` means `1%` |
| `now` | Current price |
| `low` | Day low |
| `high` | Day high |
| `yesterday` | Previous close |
| `source` | Provider that returned the quote |

`source` is guaranteed on `stocks.auto` results and inspection results. Direct provider `getStock` / `getStocks` / `searchStocks` calls do not fall back and keep that provider's response shape.

## Field Contract

`Stock` is the stable public API contract, not a direct copy of third-party payloads.

- Patch and minor releases do not change the meaning or type of existing fields
- New capabilities are added as optional fields when possible
- Changing, removing, or redefining existing fields requires a major release
- Raw third-party payloads are not included in `Stock`
- If raw provider data is ever exposed, it will be added through a separate capability or clearly separated field instead of changing the default shape

The goal is to let users rely on `code`, `name`, `percent`, `now`, `low`, `high`, and `yesterday` without rewriting business code whenever one provider changes.

## Caching and Rate Limiting

`stock-api` does not include built-in caching, queues, or rate limiting. Those concerns usually depend on your deployment environment, and adding them here would break the zero-runtime-dependency design.

For production usage, handle them in your own service layer:

- Cache by `source + code` with a short TTL
- Apply stricter limits to search endpoints
- Coalesce concurrent requests for the same stock
- Cache short-lived failures to avoid repeatedly hitting a failing third-party endpoint

Example:

```text
client -> your API/cache/rate limit -> stock-api -> market data source
```

Use in-memory cache, Redis, backend CDN cache, or your framework's cache layer. The library does not bind you to a specific cache implementation.

## Browser Boundary

`stock-api` can adapt to Node.js and modern browser bundler environments. Regular endpoints use `fetch`; providers with JSONP/script endpoints automatically switch to lower-level browser adapters.

Browser builds are published under:

```text
dist/browser/stock-api.iife.js
dist/browser/stock-api.iife.min.js
dist/browser/stock-api.iife.min.js.map
dist/browser/stock-api.esm.mjs
dist/browser/stock-api.esm.min.mjs
```

The IIFE build exposes a `StockApi` global:

```html
<script src="https://cdn.jsdelivr.net/npm/stock-api/dist/browser/stock-api.iife.min.js"></script>
<script>
  StockApi.stocks.auto.getStock("SH510500").then(console.log);
  StockApi.stocks.auto.getStocks(["SH510500", "SZ000651"]).then(console.log);
  StockApi.stocks.auto.getKlines("SH600519", { period: "day" }).then(console.log);
  StockApi.stocks.auto.searchStocks("格力电器").then(console.log);
</script>
```

The ESM build can be imported directly:

```html
<script type="module">
  import { stocks } from "https://cdn.jsdelivr.net/npm/stock-api/dist/browser/stock-api.esm.mjs";

  const stock = await stocks.auto.getStock("SH510500");
  const list = await stocks.auto.getStocks(["SH510500", "SZ000651"]);
  const klines = await stocks.auto.getKlines("SH600519", { period: "day" });
  const results = await stocks.auto.searchStocks("格力电器");
</script>
```

Current direct browser status:

| API | Status |
| --- | --- |
| `stocks.auto.getStock` / `stocks.auto.getStocks` / `stocks.auto.searchStocks` / `stocks.auto.getKlines` | Supported, Tencent first by default |
| `stocks.tencent.getStock` / `stocks.tencent.getStocks` / `stocks.tencent.searchStocks` / `stocks.tencent.getKlines` | Supported |
| `stocks.eastmoney.getStock` / `stocks.eastmoney.getStocks` / `stocks.eastmoney.searchStocks` / `stocks.eastmoney.getKlines` | Supported |
| `stocks.sina.getKlines` | Supported |
| `stocks.sina.getStock` / `stocks.sina.getStocks` / `stocks.sina.searchStocks` | Not supported for direct browser usage; Sina requires a valid Referer that browsers cannot spoof, so use Node.js or a backend proxy |

For production apps, it is still recommended to call `stock-api` from your backend service, serverless function, or API route, and let the frontend call your own endpoint.

Reasons:

- You can centralize caching, rate limiting, and fallback behavior
- High-frequency browser requests are more likely to trigger third-party limits
- Third-party providers may change browser access rules at any time
- Keeping requests behind your own endpoint makes call volume easier to control

For low-frequency tools, internal pages, or experiments, browser bundler usage can use the same API shape.

## Inspect Providers

Inspect automatic fallback:

```typescript
const inspection = await stocks.auto.inspectStock("SH510500");
```

Return shape:

```typescript
type AutoStockInspection = {
  code: string;
  source: "base" | "tencent" | "sina" | "eastmoney";
  stock: Stock;
  sources: StockProviderInspection[];
};
```

`sources` contains the status of every provider:

```json
{
  "code": "SH510500",
  "source": "tencent",
  "stock": {
    "code": "SH510500",
    "name": "中证500ETF南方",
    "percent": -0.001,
    "now": 8.36,
    "low": 8.31,
    "high": 8.39,
    "yesterday": 8.37,
    "source": "tencent"
  },
  "sources": [
    { "source": "tencent", "status": "success" },
    { "source": "sina", "status": "success" },
    { "source": "eastmoney", "status": "empty" }
  ]
}
```

Inspect one provider:

```typescript
const inspection = await stocks.sina.inspectStock("SH510500");
```

Single-provider inspection:

```typescript
type StockProviderInspection = {
  code: string;
  source: "tencent" | "sina" | "eastmoney";
  status: "success" | "empty" | "error";
  stock?: Stock;
  error?: string;
};
```

## Stock Codes

Use `market prefix + symbol`:

| Market | Prefix | Example |
| --- | --- | --- |
| Shanghai Stock Exchange | `SH` | `SH510500` |
| Shenzhen Stock Exchange | `SZ` | `SZ000651` |
| Hong Kong market | `HK` | `HK02020` |
| US market | `US` | `USDJI` |

Provider coverage differs. Eastmoney currently focuses on A-shares.
