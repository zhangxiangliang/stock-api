# API 使用

[English](api.EN.md) | [简体中文](api.md)

这份文档说明 `stock-api` 的 Node.js API。大多数用户只需要使用 `stocks.auto`。

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
const results = await stocks.auto.searchStocks("格力电器");
```

`stocks.auto` 返回的股票会包含 `source`，表示最终返回数据的数据源。

## 指定数据源

如果你只想使用某个数据源，可以直接调用对应 provider：

```typescript
const stock = await stocks.tencent.getStock("SH510500");
const list = await stocks.sina.getStocks(["SH510500", "SZ000651"]);
const results = await stocks.eastmoney.searchStocks("贵州茅台");
```

这些调用不会自动切换到其他数据源。

## 可用数据源

```typescript
const sources = stocks.getSources();
// ["tencent", "sina", "eastmoney"]
```

## Provider 接口

`stocks.auto`、`stocks.tencent`、`stocks.sina`、`stocks.eastmoney` 都支持：

```typescript
type StockApi = {
  getStock(code: string): Promise<Stock>;
  getStocks(codes: string[]): Promise<Stock[]>;
  searchStocks(keyword: string): Promise<Stock[]>;
  inspectStock(code: string): Promise<AutoStockInspection | StockProviderInspection>;
};
```

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
