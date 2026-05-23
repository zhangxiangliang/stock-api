# API 使用

[English](api.EN.md) | [简体中文](api.md)

这份文档说明 `stock-api` 的 Node.js 和浏览器 API。大多数用户只需要使用 `stocks.auto`。

## 导入

ESM / TypeScript:

```typescript
import { stocks } from "stock-api";
```

CommonJS:

```javascript
const { stocks } = require("stock-api");
```

## 默认用法：stocks.auto

`stocks.auto` 会按固定顺序自动兜底：

```text
tencent -> sina -> eastmoney
```

当某个数据源请求失败或返回空数据时，会继续尝试下一个数据源。

```typescript
const stock = await stocks.auto.getStock("SH510500");
const list = await stocks.auto.getStocks(["SH510500", "SZ000651"]);
const klines = await stocks.auto.getKlines("SH600519", { period: "day" });
const results = await stocks.auto.searchStocks("格力电器");
```

`stocks.auto` 返回的股票会包含 `source`，表示最终返回数据的数据源。

## 指定数据源

如果你只想使用某个数据源，可以直接调用对应 provider：

```typescript
const stock = await stocks.tencent.getStock("SH510500");
const list = await stocks.sina.getStocks(["SH510500", "SZ000651"]);
const klines = await stocks.tencent.getKlines("SH600519", { period: "week" });
const results = await stocks.eastmoney.searchStocks("贵州茅台");
```

这些调用不会自动切换到其他数据源。

## 可用数据源

```typescript
const sources = stocks.getSources();
// ["tencent", "sina", "eastmoney"]

const capabilities = stocks.getProviderCapabilities();
```

## Provider 接口

`stocks.auto`、`stocks.tencent`、`stocks.sina`、`stocks.eastmoney` 都支持：

```typescript
type StockApi = {
  getStock(code: string): Promise<Stock>;
  getStocks(codes: string[]): Promise<Stock[]>;
  getKlines(code: string, options?: KlineOptions): Promise<Kline[]>;
  searchStocks(keyword: string): Promise<Stock[]>;
  inspectStock(code: string): Promise<AutoStockInspection | StockProviderInspection>;
};
```

## K 线

`getKlines` 支持日 K、周 K、月 K：

```typescript
const klines = await stocks.auto.getKlines("SH600519", {
  period: "day",
  count: 120,
});
```

指定数据源：

```typescript
const weekly = await stocks.tencent.getKlines("SH600519", { period: "week" });
const monthly = await stocks.sina.getKlines("SH600519", { period: "month" });
```

`stocks.auto.getKlines` 会按 `tencent -> sina -> eastmoney` 顺序兜底。

```typescript
type KlineOptions = {
  period?: "day" | "week" | "month";
  count?: number;
  adjust?: "none" | "qfq" | "hfq";
};

type Kline = {
  date: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume?: number;
  source?: "tencent" | "sina" | "eastmoney";
};
```

默认 `period` 是 `day`，默认 `count` 是 `120`，默认 `adjust` 是 `none`。新浪 K 线不支持复权，传 `qfq` / `hfq` 时会返回空数组。

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

字段含义：

| 字段 | 说明 |
| --- | --- |
| `code` | 统一股票代码 |
| `name` | 股票名称 |
| `percent` | 涨跌幅，`0.01` 表示 `1%` |
| `now` | 当前价 |
| `low` | 最低价 |
| `high` | 最高价 |
| `yesterday` | 昨收价 |
| `source` | 实际返回数据的数据源 |

`source` 只在 `stocks.auto` 返回结果和 `inspectStock` 诊断结果中保证存在。直接调用单个数据源的 `getStock` / `getStocks` / `searchStocks` 时，不会自动兜底，返回结构保持该数据源的原始行为。

## 字段契约

`Stock` 是公共 API 的稳定契约，不是第三方接口原始数据的直出。

- patch / minor 版本不会改变已有字段的含义和类型
- 新能力会优先通过可选字段增加，避免影响已有用户
- 需要改变已有字段含义、类型或删除字段时，才会进入 major 版本
- 第三方数据源的原始 payload 不会放进 `Stock`
- 如果未来需要暴露原始数据，会使用单独的能力或单独字段，不会让默认返回结构失控

这样做的目标是：用户可以放心依赖 `code`、`name`、`percent`、`now`、`low`、`high`、`yesterday` 这些核心字段，不需要因为某个数据源变化就修改业务代码。

## 缓存和限流

`stock-api` 不内置缓存、队列或限流，原因是这些能力通常和业务部署环境相关，而且内置后会破坏零运行时依赖的定位。

生产环境建议在你的服务层处理：

- 按 `source + code` 做短 TTL 缓存
- 对搜索接口单独设置更短或更严格的限流
- 对同一股票的并发请求做合并，避免同时打到第三方接口
- 失败时可以短暂缓存错误结果，避免第三方接口异常时被重复打爆

示例：

```text
client -> your API/cache/rate limit -> stock-api -> market data source
```

可以使用内存缓存、Redis、CDN 后端缓存或你现有框架的缓存层。库本身不会绑定某个缓存实现。

## 浏览器使用边界

`stock-api` 可以在 Node.js 和现代浏览器构建环境中自适应运行。普通接口会走 `fetch`；支持 JSONP/脚本接口的数据源会在浏览器中自动切到底层适配。

浏览器构建产物位于：

```text
dist/browser/stock-api.iife.js
dist/browser/stock-api.iife.min.js
dist/browser/stock-api.iife.min.js.map
dist/browser/stock-api.esm.mjs
dist/browser/stock-api.esm.min.mjs
```

IIFE 产物暴露 `StockApi` 全局变量：

```html
<script src="https://cdn.jsdelivr.net/npm/stock-api/dist/browser/stock-api.iife.min.js"></script>
<script>
  StockApi.stocks.auto.getStock("SH510500").then(console.log);
  StockApi.stocks.auto.getStocks(["SH510500", "SZ000651"]).then(console.log);
  StockApi.stocks.auto.getKlines("SH600519", { period: "day" }).then(console.log);
  StockApi.stocks.auto.searchStocks("格力电器").then(console.log);
</script>
```

ESM 产物可以直接 import：

```html
<script type="module">
  import { stocks } from "https://cdn.jsdelivr.net/npm/stock-api/dist/browser/stock-api.esm.mjs";

  const stock = await stocks.auto.getStock("SH510500");
  const list = await stocks.auto.getStocks(["SH510500", "SZ000651"]);
  const klines = await stocks.auto.getKlines("SH600519", { period: "day" });
  const results = await stocks.auto.searchStocks("格力电器");
</script>
```

当前浏览器直连状态：

| API | 状态 |
| --- | --- |
| `stocks.auto.getStock` / `stocks.auto.getStocks` / `stocks.auto.searchStocks` / `stocks.auto.getKlines` | 支持，默认优先腾讯 |
| `stocks.tencent.getStock` / `stocks.tencent.getStocks` / `stocks.tencent.searchStocks` / `stocks.tencent.getKlines` | 支持 |
| `stocks.eastmoney.getStock` / `stocks.eastmoney.getStocks` / `stocks.eastmoney.searchStocks` / `stocks.eastmoney.getKlines` | 支持 |
| `stocks.sina.getKlines` | 支持 |
| `stocks.sina.getStock` / `stocks.sina.getStocks` / `stocks.sina.searchStocks` | 浏览器直连不支持，Sina 服务端要求有效 Referer，浏览器无法伪造，建议走 Node.js 或后端代理 |

生产环境仍建议通过自己的服务端、Serverless function 或 API route 调用 `stock-api`，前端只调用你自己的接口。

原因：

- 方便统一缓存、限流和降级
- 高频前端请求更容易触发第三方限制
- 第三方接口可能随时改变浏览器访问策略
- 前端直接暴露请求逻辑后，不方便控制调用频率

如果只是低频工具、内部页面或实验项目，也可以直接在浏览器构建环境中使用同一套 API。

## 诊断数据源

检查自动兜底过程：

```typescript
const inspection = await stocks.auto.inspectStock("SH510500");
```

返回结构：

```typescript
type AutoStockInspection = {
  code: string;
  source: "base" | "tencent" | "sina" | "eastmoney";
  stock: Stock;
  sources: StockProviderInspection[];
};
```

`sources` 会包含全部数据源的状态：

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

检查单个数据源：

```typescript
const inspection = await stocks.sina.inspectStock("SH510500");
```

单源诊断返回：

```typescript
type StockProviderInspection = {
  code: string;
  source: "tencent" | "sina" | "eastmoney";
  status: "success" | "empty" | "error";
  stock?: Stock;
  error?: string;
};
```

## 股票代码

统一使用 `交易所 + 股票代码`：

| 市场 | 前缀 | 示例 |
| --- | --- | --- |
| 上海交易所 | `SH` | `SH510500` |
| 深圳交易所 | `SZ` | `SZ000651` |
| 香港市场 | `HK` | `HK02020` |
| 美国市场 | `US` | `USDJI` |

不同数据源的覆盖范围不同。东方财富当前主要用于 A 股。
