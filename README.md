<h1 align="center">stock-api</h1>

<p align="center">
  支持 A 股、港股、美股行情查询的 Node.js 股票数据工具。
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
  <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fzhangxiangliang%2Fstock-api%2Fapi-status%2Findex.zh-CN.json&cacheSeconds=300&v=202604270050" alt="接口状态">
  <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fzhangxiangliang%2Fstock-api%2Fapi-status%2Ftencent.zh-CN.json&cacheSeconds=300&v=202604270050" alt="腾讯状态">
  <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fzhangxiangliang%2Fstock-api%2Fapi-status%2Fsina.zh-CN.json&cacheSeconds=300&v=202604270050" alt="新浪状态">
  <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fzhangxiangliang%2Fstock-api%2Fapi-status%2Feastmoney.zh-CN.json&cacheSeconds=300&v=202604270050" alt="东方财富状态">
</p>

`stock-api` 是一个零运行时依赖的股票行情工具，提供 Node.js API 和 CLI。默认使用 `stocks.auto` 自动兜底数据源，也可以显式指定腾讯、新浪或东方财富。

## 特性

- Node.js API + TypeScript 类型
- CLI 查询股票行情和搜索股票
- 默认自动兜底：`tencent -> sina -> eastmoney`
- 指定数据源：`stocks.tencent` / `stocks.sina` / `stocks.eastmoney`
- 支持 A 股、港股、美股代码格式
- 零运行时依赖

## 安装

```shell
npm install stock-api
```

要求 Node.js `>=18`。

## 快速使用

默认用 `stocks.auto`：

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

指定某个数据源时，把 `auto` 换成数据源名称：

```typescript
const stock = await stocks.tencent.getStock("SH510500");
const list = await stocks.sina.getStocks(["SH510500", "SZ000651"]);
const results = await stocks.eastmoney.searchStocks("贵州茅台");
```

检查数据源状态：

```typescript
const autoInspection = await stocks.auto.inspectStock("SH510500");
const sinaInspection = await stocks.sina.inspectStock("SH510500");
```

## CLI

CLI 默认也是 `auto` 模式：

```shell
npx stock-api get-stock SH510500
npx stock-api get-stocks SH510500 SZ000651
npx stock-api search 格力电器
```

指定数据源：

```shell
npx stock-api get-stock SH510500 --source sina
npx stock-api search 贵州茅台 --source eastmoney
```

## 数据源

| 数据源 | 用法 | 能力 |
| --- | --- | --- |
| 自动兜底 | `stocks.auto` | 单只行情、批量行情、搜索、诊断 |
| 腾讯 | `stocks.tencent` | 单只行情、批量行情、搜索、诊断 |
| 新浪 | `stocks.sina` | 单只行情、批量行情、搜索、诊断 |
| 东方财富 | `stocks.eastmoney` | A 股单只行情、批量行情、搜索、诊断 |

可用数据源：

```typescript
const sources = stocks.getSources();
// ["tencent", "sina", "eastmoney"]
```

## 股票代码

统一使用 `交易所 + 股票代码`：

| 市场 | 前缀 | 示例 |
| --- | --- | --- |
| 上海交易所 | `SH` | `SH510500` |
| 深圳交易所 | `SZ` | `SZ000651` |
| 香港市场 | `HK` | `HK02020` |
| 美国市场 | `US` | `USDJI` |

## 返回结构

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

`source` 用于标记实际返回数据的数据源。`stocks.auto` 和 `inspectStock` 会带上 `source`；直接使用 `stocks.tencent.getStock`、`stocks.sina.getStock`、`stocks.eastmoney.getStock` 时不会自动兜底，返回结构保持该数据源的原始行为。

## 文档

| 文档 | 内容 |
| --- | --- |
| [API 使用](docs/api.md) | Node.js API、自动兜底、诊断返回结构 |
| [CLI 使用](docs/cli.md) | 命令、参数、输出、退出码 |
| [项目架构](docs/architecture.md) | 目录结构、provider 工厂、解析和错误模型 |
| [开发指南](docs/development.md) | 本地开发、测试、发布前检查、新增数据源 |
| [API 监控](docs/monitoring.md) | 定时检查第三方数据源并更新状态徽章 |

## 浏览器使用

`stock-api` 面向 Node.js、后端服务、Serverless 函数和 CLI。不建议在浏览器前端直接请求第三方行情接口，因为数据源可能存在 CORS 限制和编码问题。

```text
frontend -> your backend API -> stock-api -> market data source
```

## License

MIT
