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

<p align="center">
  <a href="https://zhangxiangliang.github.io/stock-api/web-demo/">
    <img src="https://img.shields.io/badge/Live%20Demo-WEB%20DEMO-3b82f6?style=for-the-badge" alt="Live Demo">
  </a>
  <a href="https://zhangxiangliang.github.io/stock-api/">
    <img src="https://img.shields.io/badge/Home%20Page-HOME%20PAGE-24292f?style=for-the-badge" alt="Home Page">
  </a>
</p>

`stock-api` is a zero-runtime-dependency stock market data toolkit for Node.js, browsers, CLI usage, and MCP-compatible AI clients. Use `stocks.auto` by default to read from the first available provider.

## Supported Usage

<p>
  <img src="https://img.shields.io/badge/Node.js-TypeScript%20API-22c55e?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Browser-CDN%20%2F%20Bundler-38bdf8?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Browser">
  <img src="https://img.shields.io/badge/CLI-npx%20stock--api-f97316?style=for-the-badge&logo=gnubash&logoColor=white" alt="CLI">
  <img src="https://img.shields.io/badge/MCP-AI%20Tools-a855f7?style=for-the-badge&logo=openai&logoColor=white" alt="MCP">
</p>

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

Browser example: [GitHub Pages](https://zhangxiangliang.github.io/stock-api/web-demo/)

## CLI

```shell
npx stock-api get-stock SH510500
npx stock-api get-stocks SH510500 SZ000651
npx stock-api get-klines SH600519 --period day --count 120
npx stock-api search-stocks 格力电器
```

## MCP

Use `stock-api` from any MCP-compatible AI client:

```json
{
  "mcpServers": {
    "stock-api": {
      "command": "npx",
      "args": ["-y", "stock-api", "mcp"]
    }
  }
}
```

Built-in tools: `get_stock`, `get_stocks`, `get_klines`, `search_stocks`, and `inspect_stock`.

## AI Agent (any tool)

Don't want to set up MCP? Send this line to any AI tool (Claude Code, Codex, GLM, etc.) and it will learn how to use `stock-api` on its own:

```text
Read https://raw.githubusercontent.com/zhangxiangliang/stock-api/main/SKILL.md
and use stock-api to answer my stock questions.
```

`SKILL.md` contains the exact `npx stock-api` commands, so it shares the same
data logic as MCP — it's just a simpler, tool-agnostic way to plug in.

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
