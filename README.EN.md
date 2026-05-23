<h1 align="center">stock-api</h1>

<p align="center">
  TypeScript stock market data API for Node.js and browsers.
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

`stock-api` is a zero-runtime-dependency stock market data toolkit for Node.js, browsers, and CLI usage. Use `stocks.auto` by default to read from the first available provider.

## Installation

```shell
npm install stock-api
```

Node.js usage requires `>=18`.

## Usage

```typescript
import { stocks } from "stock-api";

const stock = await stocks.auto.getStock("SH510500");
const list = await stocks.auto.getStocks(["SH510500", "SZ000651"]);
const klines = await stocks.auto.getKlines("SH600519", { period: "day" });
const results = await stocks.auto.searchStocks("格力电器");
```

Stock codes use `SH` / `SZ` / `HK` / `US` prefixes, such as `SH510500` and `SZ000651`.

## Browser Usage

```html
<script src="https://cdn.jsdelivr.net/npm/stock-api/dist/browser/stock-api.iife.min.js"></script>
<script>
  StockApi.stocks.auto.getStock("SH510500").then(console.log);
  StockApi.stocks.auto.getStocks(["SH510500", "SZ000651"]).then(console.log);
  StockApi.stocks.auto.getKlines("SH600519", { period: "day" }).then(console.log);
  StockApi.stocks.auto.searchStocks("格力电器").then(console.log);
</script>
```

## CLI

```shell
npx stock-api get-stock SH510500
npx stock-api get-stocks SH510500 SZ000651
npx stock-api get-klines SH600519 --period day --count 120
npx stock-api search 格力电器
```

## Providers

Built-in providers include Tencent, Sina, and Eastmoney. `stocks.auto` handles provider fallback by default.

## Documentation

| Document                                    | Description                                             |
| ------------------------------------------- | ------------------------------------------------------- |
| [API usage](docs/api.EN.md)                 | TypeScript API, automatic fallback, inspection output   |
| [CLI usage](docs/cli.EN.md)                 | Commands, options, output, and exit codes               |
| [Architecture](docs/architecture.EN.md)     | Directory layout, provider factory, parsing, and errors |
| [Development guide](docs/development.EN.md) | Local development, tests, release checks, and providers |
| [API monitoring](docs/monitoring.EN.md)     | Scheduled third-party API checks and status badges      |

## Disclaimer

`stock-api` uses third-party public market data endpoints and does not guarantee accuracy, completeness, real-time delivery, or continuous availability. This project does not provide investment advice. Any trading or investment decision is your own responsibility. Before commercial, high-frequency, or production use, verify the terms, authorization scope, and compliance requirements of the third-party data sources.

## License

MIT
