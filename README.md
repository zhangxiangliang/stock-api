<h1 align="center">stock-api</h1>

<p align="center">
  支持 A 股、港股、美股行情查询的 TypeScript 股票数据工具。
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
  <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fzhangxiangliang%2Fstock-api%2Fapi-status%2Findex.zh-CN.json&cacheSeconds=300" alt="接口状态">
  <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fzhangxiangliang%2Fstock-api%2Fapi-status%2Ftencent.zh-CN.json&cacheSeconds=300" alt="腾讯状态">
  <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fzhangxiangliang%2Fstock-api%2Fapi-status%2Fsina.zh-CN.json&cacheSeconds=300" alt="新浪状态">
  <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fzhangxiangliang%2Fstock-api%2Fapi-status%2Feastmoney.zh-CN.json&cacheSeconds=300" alt="东方财富状态">
</p>

<p align="center">
  <a href="https://zhangxiangliang.github.io/stock-api/stock-api-web-example/">
    <img src="https://img.shields.io/badge/%E5%9C%A8%E7%BA%BF%E4%BD%93%E9%AA%8C-Web%20Demo-3b82f6?style=for-the-badge" alt="在线体验">
  </a>
</p>

<p align="center">
  <a href="https://zhangxiangliang.github.io/stock-api/stock-api-web-example/">
    <img src="docs/assets/demo-zh.png" alt="stock-api 在线示例" width="860">
  </a>
</p>

`stock-api` 是一个零运行时依赖的股票行情工具，支持 Node.js、浏览器和 CLI。默认使用 `stocks.auto`，自动从可用数据源获取行情。

## 特性

- Node.js / Browser bundler API + TypeScript 类型
- CLI 查询股票行情、K 线和搜索股票
- 默认自动兜底：`tencent -> sina -> eastmoney`
- 指定数据源：`stocks.tencent` / `stocks.sina` / `stocks.eastmoney`
- 支持 A 股、港股、美股代码格式
- 零运行时依赖

## Node.js

### 安装

Node.js 环境要求 `>=18`。

```shell
npm install stock-api
```

### 使用

```typescript
import { stocks } from "stock-api";

const stock = await stocks.auto.getStock("SH510500");
const list = await stocks.auto.getStocks(["SH510500", "SZ000651"]);
const klines = await stocks.auto.getKlines("SH600519", { period: "day" });
const results = await stocks.auto.searchStocks("格力电器");
```

股票代码使用 `SH` / `SZ` / `HK` / `US` 前缀，例如 `SH510500`、`SZ000651`。

## 浏览器

### 引用

```html
<script src="https://cdn.jsdelivr.net/npm/stock-api/dist/browser/stock-api.iife.min.js"></script>
```

### 使用

```html
<script>
  StockApi.stocks.auto.getStock("SH510500").then(console.log);
  StockApi.stocks.auto.getStocks(["SH510500", "SZ000651"]).then(console.log);
  StockApi.stocks.auto.getKlines("SH600519", { period: "day" }).then(console.log);
  StockApi.stocks.auto.searchStocks("格力电器").then(console.log);
</script>
```

浏览器示例：[GitHub Pages](https://zhangxiangliang.github.io/stock-api/stock-api-web-example/)

## CLI

```shell
npx stock-api get-stock SH510500
npx stock-api get-stocks SH510500 SZ000651
npx stock-api get-klines SH600519 --period day --count 120
npx stock-api search-stocks 格力电器
```

## 数据源

内置腾讯、新浪、东方财富数据源，默认由 `stocks.auto` 自动处理。

| 数据源 | 用法 | 能力 |
| --- | --- | --- |
| 自动兜底 | `stocks.auto` | 单只行情、批量行情、K 线、搜索、诊断 |
| 腾讯 | `stocks.tencent` | 单只行情、批量行情、K 线、搜索、诊断 |
| 新浪 | `stocks.sina` | 单只行情、批量行情、K 线、搜索、诊断 |
| 东方财富 | `stocks.eastmoney` | A 股单只行情、批量行情、K 线、搜索、诊断 |

## 文档

| 文档 | 内容 |
| --- | --- |
| [API 使用](docs/api.md) | TypeScript API、自动兜底、诊断返回结构 |
| [CLI 使用](docs/cli.md) | 命令、参数、输出、退出码 |
| [项目架构](docs/architecture.md) | 目录结构、provider 工厂、解析和错误模型 |
| [开发指南](docs/development.md) | 本地开发、测试、发布前检查、新增数据源 |
| [API 监控](docs/monitoring.md) | 定时检查第三方数据源并更新状态徽章 |

## 免责声明

`stock-api` 使用第三方公开行情接口作为数据来源，不保证数据的准确性、完整性、实时性或持续可用性。本项目不提供投资建议，任何交易或投资决策都应由你自行判断。商业、高频或生产使用前，请自行确认第三方数据源的服务条款、授权范围和合规要求。

## License

MIT
