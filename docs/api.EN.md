# API Usage

[English](api.EN.md) | [简体中文](api.md)

This document explains the Node.js API. Most users should start with `stocks.auto`.

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
const results = await stocks.auto.searchStocks("格力电器");
```

`stocks.auto` adds `source` to show which provider returned the quote.

## Direct Providers

Use a provider directly when you do not want fallback:

```typescript
const stock = await stocks.tencent.getStock("SH510500");
const list = await stocks.sina.getStocks(["SH510500", "SZ000651"]);
const results = await stocks.eastmoney.searchStocks("贵州茅台");
```

Direct provider calls do not switch to another provider.

## Available Providers

```typescript
const sources = stocks.getSources();
// ["tencent", "sina", "eastmoney"]
```

## Provider Interface

`stocks.auto`, `stocks.tencent`, `stocks.sina`, and `stocks.eastmoney` support:

```typescript
type StockApi = {
  getStock(code: string): Promise<Stock>;
  getStocks(codes: string[]): Promise<Stock[]>;
  searchStocks(keyword: string): Promise<Stock[]>;
  inspectStock(code: string): Promise<AutoStockInspection | StockProviderInspection>;
};
```

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
