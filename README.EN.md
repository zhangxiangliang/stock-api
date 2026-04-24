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
  <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fzhangxiangliang%2Fstock-api%2Fapi-status%2Findex.json" alt="API Status">
  <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fzhangxiangliang%2Fstock-api%2Fapi-status%2Ftencent.json" alt="Tencent Status">
  <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fzhangxiangliang%2Fstock-api%2Fapi-status%2Fsina.json" alt="Sina Status">
  <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fzhangxiangliang%2Fstock-api%2Fapi-status%2Feastmoney.json" alt="Eastmoney Status">
</p>

`stock-api` is a zero-runtime-dependency stock market data toolkit for Node.js. It provides a TypeScript API and CLI for retrieving stock quotes and searching symbols from public market data sources.

> Market data comes from third-party public endpoints. This package keeps provider responses transparent and does not silently fall back across data sources.

## Features

- Node.js stock market data API with TypeScript types
- CLI commands for quick stock quote lookup and symbol search
- Tencent and Sina market data sources
- A-share, Hong Kong, and US market code formats
- Zero runtime dependencies

## Installation

```shell
npm install stock-api
```

Requires Node.js `>=18`.

## Quick Start

### JavaScript

```typescript
import { stocks } from "stock-api";

const stock = await stocks.tencent.getStock("SH510500");
const list = await stocks.tencent.getStocks(["SH510500", "SZ000651"]);
const results = await stocks.tencent.searchStocks("Gree Electric");
const eastmoneyStock = await stocks.eastmoney.getStock("SH600519");
```

CommonJS:

```javascript
const { stocks } = require("stock-api");
```

### CLI

```shell
npx stock-api get-stock SH510500
npx stock-api get-stocks SH510500 SZ000651
npx stock-api search Gree
```

Use a specific data source:

```shell
npx stock-api get-stock SH510500 --source sina
npx stock-api get-stock SH600519 --source eastmoney
npx stock-api search Gree -s sina
```

## Data Sources

| Name | source | Status |
| --- | --- | --- |
| Tencent | `tencent` | Search, single quote, batch quotes |
| Sina | `sina` | Search, single quote, batch quotes |
| Eastmoney | `eastmoney` | A-share search, single quote, batch quotes |

## Stock Code Format

Use `exchange prefix + stock code`:

| Market | Prefix | Example |
| --- | --- | --- |
| Shanghai Stock Exchange | `SH` | `SH510500` |
| Shenzhen Stock Exchange | `SZ` | `SZ000651` |
| Hong Kong market | `HK` | `HK02020` |
| US market | `US` | `USDJI` |

Return shape:

```typescript
type Stock = {
  code: string;
  name: string;
  percent: number;
  now: number;
  low: number;
  high: number;
  yesterday: number;
};
```

## Documentation

| Document | Description |
| --- | --- |
| [CLI usage](docs/cli.md) | Commands, options, output, exit codes, and local `npx` simulation |
| [Architecture](docs/architecture.md) | Directory layout, provider flow, parsing, and error model |
| [Development guide](docs/development.md) | Local development, tests, CI, release checks, and adding providers |
| [API monitoring](docs/monitoring.md) | Scheduled third-party API checks and README status badges |

## Browser Usage

`stock-api` is designed for Node.js, backend services, serverless functions, and CLI usage. Direct browser usage is not recommended because third-party market data endpoints may block cross-origin requests or return non-UTF-8 encoded responses.

Recommended architecture:

```text
frontend -> your backend API -> stock-api -> market data source
```

## Development

```shell
npm install
npm run validate
npm run test:integration
```

Test the CLI locally:

```shell
npm run build
node dist/cli.js --help
node dist/cli.js get-stock SH510500
```

## Release

This project uses semantic-release to publish to npm automatically. After changes are merged or pushed to `main`, GitHub Actions analyzes commit messages, calculates the next version, updates the changelog, creates a GitHub Release, and publishes the npm package.

Commit messages should follow Conventional Commits:

```shell
fix: fix a bug                # patch, for example 2.0.8 -> 2.0.9
feat: add a feature           # minor, for example 2.0.8 -> 2.1.0
feat!: introduce breaking API # major, for example 2.0.8 -> 3.0.0
```

Maintenance commits such as `chore:` do not publish a new npm version.

## License

MIT
