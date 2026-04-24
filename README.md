<h1 align="center">股票数据小助手</h1>

<p align="center">
  <a href="https://npmcharts.com/compare/stock-api?minimal=true"><img src="https://img.shields.io/npm/dm/stock-api.svg?sanitize=true" alt="Downloads"></a>
  <a href="https://www.npmjs.com/package/stock-api"><img src="https://img.shields.io/npm/v/stock-api.svg?sanitize=true" alt="Version"></a>
  <a href="https://www.npmjs.com/package/stock-api"><img src="https://img.shields.io/npm/l/stock-api.svg?sanitize=true" alt="License"></a>
  <a href="https://www.npmjs.com/package/stock-api"><img src="https://img.shields.io/badge/language-typescript-blue" alt="TypeScript"></a>
</p>

`stock-api` 是一个零运行时依赖的股票行情数据工具，支持 Node.js API 和命令行查询。

> 行情数据来自第三方公开接口。库会尽量保留数据源真实返回，不做跨源兜底。

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
npx stock-api search 格力电器 -s sina
```

## 数据源

| 名称 | source | 状态 |
| --- | --- | --- |
| 腾讯股票 | `tencent` | 支持搜索、单只行情、批量行情 |
| 新浪股票 | `sina` | 支持搜索、单只行情、批量行情 |

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
