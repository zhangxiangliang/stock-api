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
  <img src="https://raw.githubusercontent.com/zhangxiangliang/stock-api/api-status/index.zh-CN.svg?v=202604270050" alt="接口状态">
  <img src="https://raw.githubusercontent.com/zhangxiangliang/stock-api/api-status/tencent.zh-CN.svg?v=202604270050" alt="腾讯状态">
  <img src="https://raw.githubusercontent.com/zhangxiangliang/stock-api/api-status/sina.zh-CN.svg?v=202604270050" alt="新浪状态">
  <img src="https://raw.githubusercontent.com/zhangxiangliang/stock-api/api-status/eastmoney.zh-CN.svg?v=202604270050" alt="东方财富状态">
</p>

`stock-api` 是一个零运行时依赖的股票行情数据工具，支持 Node.js API 和命令行查询，可用于 A 股、港股、美股行情查询和股票搜索。

> 行情数据来自第三方公开接口。库会尽量保留数据源真实返回，不做跨源兜底。

## 功能特性

- 提供带 TypeScript 类型的 Node.js 股票行情 API
- 支持 CLI 快速查询股票行情和搜索股票代码
- 支持腾讯股票、新浪股票数据源
- 支持 A 股、港股、美股代码格式
- 零运行时依赖

## 安装

```shell
npm install stock-api
```

要求 Node.js `>=18`。

## 快速使用

### JavaScript

```typescript
import { stocks } from "stock-api";

const stock = await stocks.tencent.getStock("SH510500");
const list = await stocks.tencent.getStocks(["SH510500", "SZ000651"]);
const results = await stocks.tencent.searchStocks("格力电器");
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
npx stock-api search 格力电器
```

指定数据源：

```shell
npx stock-api get-stock SH510500 --source sina
npx stock-api get-stock SH600519 --source eastmoney
npx stock-api search 格力电器 -s sina
```

## 数据源

| 名称 | source | 状态 |
| --- | --- | --- |
| 腾讯股票 | `tencent` | 支持搜索、单只行情、批量行情 |
| 新浪股票 | `sina` | 支持搜索、单只行情、批量行情 |
| 东方财富 | `eastmoney` | 支持 A 股搜索、单只行情、批量行情 |

## 股票代码

统一使用 `交易所 + 股票代码`：

| 交易所 | 前缀 | 示例 |
| --- | --- | --- |
| 上海交易所 | `SH` | `SH510500` |
| 深圳交易所 | `SZ` | `SZ000651` |
| 香港交易所 | `HK` | `HK02020` |
| 美国市场 | `US` | `USDJI` |

返回结构：

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

## 文档

| 文档 | 内容 |
| --- | --- |
| [CLI 使用](docs/cli.md) | 命令、参数、输出、退出码、本地模拟 `npx` |
| [项目架构](docs/architecture.md) | 目录结构、数据流、provider 工厂、解析和错误模型 |
| [开发指南](docs/development.md) | 本地开发、测试策略、CI、发布前检查、新增数据源 |
| [API 监控](docs/monitoring.md) | 定时检查第三方数据源并更新 README 状态徽章 |

## 浏览器使用

`stock-api` 主要面向 Node.js、后端服务、Serverless 函数和 CLI 场景。不建议在浏览器前端直接请求第三方行情接口，因为数据源可能存在 CORS 限制和非 UTF-8 编码问题。

推荐架构：

```text
frontend -> your backend API -> stock-api -> market data source
```

## 开发

```shell
npm install
npm run validate
npm run test:integration
```

本地测试 CLI：

```shell
npm run build
node dist/cli.js --help
node dist/cli.js get-stock SH510500
```

## 发布

项目使用 semantic-release 自动发布到 npm。合并或推送到 `main` 后，GitHub Actions 会根据 commit message 自动计算版本号、更新 changelog、创建 GitHub Release，并发布 npm 包。

commit message 需要遵循 Conventional Commits：

```shell
fix: 修复问题      # patch，例如 2.0.8 -> 2.0.9
feat: 增加功能     # minor，例如 2.0.8 -> 2.1.0
feat!: 不兼容变更  # major，例如 2.0.8 -> 3.0.0
```

普通维护类改动可以使用 `chore:`，不会触发 npm 新版本发布。

## License

MIT
