# Architecture

[English](architecture.EN.md) | [简体中文](architecture.md)

This document explains the project structure, provider flow, and extension points.

## Goals

`stock-api` supports:

- Node.js library usage through `import` / `require`
- CLI usage through `npx stock-api ...`

Principles:

- Zero runtime dependencies
- Shared provider flow, provider-specific parsing
- Unit tests do not require network access
- Integration tests use real provider endpoints
- Direct provider calls keep provider behavior; `auto` adds fallback

## Directory Layout

```text
src/
  cli.ts
  errors.ts
  index.ts
  stocks/
    index.ts
    auto/
    base/
    shared/
      code-mapper.ts
      normalize.ts
      provider.ts
    eastmoney/
    sina/
    tencent/
  types/
  utils/

test/
  fixtures/
  integration/
  unit/
```

## Public API

```typescript
import { stocks } from "stock-api";
```

Available entries:

```typescript
stocks.auto
stocks.tencent
stocks.sina
stocks.eastmoney
stocks.getSources()
```

Provider interface:

```typescript
type StockApi = {
  getStock(code: string): Promise<Stock>;
  getStocks(codes: string[]): Promise<Stock[]>;
  searchStocks(key: string): Promise<Stock[]>;
  inspectStock(code: string): Promise<AutoStockInspection | StockProviderInspection>;
};
```

`stocks.auto` tries providers in this order:

```text
tencent -> sina -> eastmoney
```

`stocks.auto.inspectStock(code)` checks all providers and returns each status. Direct provider `inspectStock` checks only that provider.

## Provider Flow

For `stocks.tencent.getStocks(["SH510500", "SZ000651"])`:

1. Normalize and deduplicate input codes
2. Convert normalized codes to provider API codes
3. Build the request URL
4. Request data through native `http` / `https`
5. Decode text through `TextDecoder`
6. Split provider response rows
7. Parse rows into `Stock`
8. Return normalized stock objects

## Provider Factory

`src/stocks/shared/provider.ts` implements shared behavior:

- `getStock`
- `getStocks`
- `searchStocks`
- `inspectStock`
- request and decoding
- missing quote fallback data
- row and parameter splitting

Provider modules only describe differences:

```typescript
const Tencent = createStockProvider({
  source: "tencent",
  quote: {
    codeTransform,
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
      return `https://smartbox.gtimg.cn/s3/?v=2&t=all&c=1&q=${encodeURIComponent(key)}`;
    },
    parseCodes(body) {
      return [];
    },
  },
});
```

## Code Mapping

Public codes use:

```text
SH510500
SZ000651
HK02020
USDJI
```

Provider-specific formats differ:

| Provider | SH | SZ | HK | US |
| --- | --- | --- | --- | --- |
| Public | `SH510500` | `SZ000651` | `HK02020` | `USDJI` |
| Tencent | `sh510500` | `sz000651` | `hk02020` | `usDji` style |
| Sina | `sh510500` | `sz000651` | `hk02020` | `gb_dji` style |
| Eastmoney | `1.510500` | `0.000651` | Not supported yet | Not supported yet |

`src/stocks/shared/code-mapper.ts` creates reusable code transformers.

## Parsing

Parsing is implemented as pure functions:

```typescript
parseTencentStock(code, params)
parseSinaStock(code, params)
parseEastmoneyStock(code, quote)
```

This keeps parsing stateless and easy to test with fixtures.

## Errors

Root exports:

```typescript
StockApiError
StockCodeError
StockRequestError
StockParseError
```

Usage:

- invalid code format throws `StockCodeError`
- request failure and timeout throw `StockRequestError`
- `StockParseError` is reserved for stricter parsing failures

If a provider clearly returns a missing quote, the API returns the default empty stock instead of throwing, preserving historical behavior.

## Published Package

`npm pack` includes:

- `dist/**/*`
- `docs/**/*`
- `README.md`
- `LICENSE`
- `package.json`

It does not include source, tests, coverage, or `node_modules`.
