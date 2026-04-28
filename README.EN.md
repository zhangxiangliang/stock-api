<h1 align="center">stock-api</h1>

<p align="center">
  Stock market data API for Node.js and TypeScript.
</p>

<p align="center">
  <a href="./README.EN.md">English</a> |
  <a href="./README.md">简体中文</a>
</p>

<p align="center">
  <a href="https://npmcharts.com/compare/stock-api?minimal=true"><img src="https://img.shields.io/npm/dm/stock-api.svg?sanitize=true" alt="Downloads"></a>
  <a href="https://www.npmjs.com/package/stock-api"><img src="https://img.shields.io/npm/v/stock-api.svg?sanitize=true" alt="Version"></a>
  <a href="https://www.npmjs.com/package/stock-api"><img src="https://img.shields.io/npm/l/stock-api.svg?sanitize=true" alt="License"></a>
  <a href="https://www.npmjs.com/package/stock-api"><img src="https://img.shields.io/badge/language-typescript-blue" alt="TypeScript"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fzhangxiangliang%2Fstock-api%2Fapi-status%2Findex.json&cacheSeconds=300" alt="API Status">
  <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fzhangxiangliang%2Fstock-api%2Fapi-status%2Ftencent.json&cacheSeconds=300" alt="Tencent Status">
  <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fzhangxiangliang%2Fstock-api%2Fapi-status%2Fsina.json&cacheSeconds=300" alt="Sina Status">
  <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fzhangxiangliang%2Fstock-api%2Fapi-status%2Feastmoney.json&cacheSeconds=300" alt="Eastmoney Status">
</p>

`stock-api` is a zero-runtime-dependency stock market data toolkit with a Node.js API and CLI. Use `stocks.auto` by default for provider fallback, or call Tencent, Sina, or Eastmoney directly.

## Features

- Node.js API with TypeScript types
- CLI for quote lookup and symbol search
- Default fallback order: `tencent -> sina -> eastmoney`
- Direct providers: `stocks.tencent` / `stocks.sina` / `stocks.eastmoney`
- A-share, Hong Kong, and US market code formats
- Zero runtime dependencies

## Installation

```shell
npm install stock-api
```

Requires Node.js `>=18`.

## Quick Start

Use `stocks.auto` by default:

```typescript
import { stocks } from "stock-api";

const stock = await stocks.auto.getStock("SH510500");
const list = await stocks.auto.getStocks(["SH510500", "SZ000651"]);
const results = await stocks.auto.searchStocks("格力电器");
```

CommonJS:

```javascript
const { stocks } = require("stock-api");
```

To use one provider directly, replace `auto` with the provider name:

```typescript
const stock = await stocks.tencent.getStock("SH510500");
const list = await stocks.sina.getStocks(["SH510500", "SZ000651"]);
const results = await stocks.eastmoney.searchStocks("贵州茅台");
```

Inspect provider status:

```typescript
const autoInspection = await stocks.auto.inspectStock("SH510500");
const sinaInspection = await stocks.sina.inspectStock("SH510500");
```

## CLI

The CLI uses `auto` mode by default:

```shell
npx stock-api get-stock SH510500
npx stock-api get-stocks SH510500 SZ000651
npx stock-api search 格力电器
```

Use one provider directly:

```shell
npx stock-api get-stock SH510500 --source sina
npx stock-api search 贵州茅台 --source eastmoney
```

## Providers

| Provider | API | Features |
| --- | --- | --- |
| Auto fallback | `stocks.auto` | Single quote, batch quotes, search, inspection |
| Tencent | `stocks.tencent` | Single quote, batch quotes, search, inspection |
| Sina | `stocks.sina` | Single quote, batch quotes, search, inspection |
| Eastmoney | `stocks.eastmoney` | A-share single quote, batch quotes, search, inspection |

Available direct providers:

```typescript
const sources = stocks.getSources();
// ["tencent", "sina", "eastmoney"]
```

## Stock Codes

Use `market prefix + symbol`:

| Market | Prefix | Example |
| --- | --- | --- |
| Shanghai Stock Exchange | `SH` | `SH510500` |
| Shenzhen Stock Exchange | `SZ` | `SZ000651` |
| Hong Kong market | `HK` | `HK02020` |
| US market | `US` | `USDJI` |

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

`source` identifies the provider that returned the quote. `stocks.auto` and `inspectStock` include `source`; direct calls such as `stocks.tencent.getStock`, `stocks.sina.getStock`, and `stocks.eastmoney.getStock` do not fall back and keep that provider's response shape.

## Documentation

| Document | Description |
| --- | --- |
| [API usage](docs/api.EN.md) | Node.js API, automatic fallback, inspection output |
| [CLI usage](docs/cli.EN.md) | Commands, options, output, and exit codes |
| [Architecture](docs/architecture.EN.md) | Directory layout, provider factory, parsing, and errors |
| [Development guide](docs/development.EN.md) | Local development, tests, release checks, and adding providers |
| [API monitoring](docs/monitoring.EN.md) | Scheduled third-party API checks and status badges |

## Browser Usage

`stock-api` is designed for Node.js, backend services, serverless functions, and CLI usage. Direct browser usage is not recommended because third-party endpoints may block CORS or return non-UTF-8 encoded responses.

```text
frontend -> your backend API -> stock-api -> market data source
```

## License

MIT
