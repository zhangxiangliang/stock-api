<h1 align="center">股票数据小助手</h1>

<p align="center">
  <a href="https://codecov.io/github/jiucaixiaozhu/stock-api?branch=master"><img src="https://img.shields.io/codecov/c/github/jiucaixiaozhu/stock-api/master.svg?sanitize=true" alt="Coverage Status"></a>
  <a href="https://npmcharts.com/compare/stock-api?minimal=true"><img src="https://img.shields.io/npm/dm/stock-api.svg?sanitize=true" alt="Downloads"></a>
  <a href="https://www.npmjs.com/package/stock-api"><img src="https://img.shields.io/npm/v/stock-api.svg?sanitize=true" alt="Version"></a>
  <a href="https://www.npmjs.com/package/stock-api"><img src="https://img.shields.io/npm/l/stock-api.svg?sanitize=true" alt="License"></a>
  <a href="https://www.npmjs.com/package/stock-api"><img src="https://img.shields.io/badge/language-typescript-blue" alt="License"></a>
</p>



## 简介

一款聚焦在 `股票实时数据` 和 `周边相关服务` 的接口小助手。

## 股票数据

| 名称 | 接口名 | 官网 |
| --- | --- | --- |
| 基础示例 | base | 无 |
| 网易财经 | netease | [传送门](https://money.163.com/) |
| 新浪股票 | sina | [传送门](https://finance.sina.com.cn/) |
| 腾讯股票 | tencent | [传送门](http://gu.qq.com/) |
| 雪球 | xueqiu | [传送门](https://xueqiu.com/) |

## 安装

```shell
npm install stock-api
yarn install stock-api
```

## 使用

### 股票代码

由于每个交易所数据规则不一样，为了能统一规范对代码定义了规则 `交易所+股票代码`。

| 交易所 | 代号 | 实例 |
| --- | --- | --- |
| 上海交易所 | SH | SH000001 |
| 深圳交易所  | SZ | SZ399001 |
| 香港交易所 | HK | HKHSI |
| 美国交易所  | US | USDJI |


### 选择数据源

##### 可选导入

```typescript
import { stocks } from "stock-api";

// 省略 async 相关内容
const sina = stocks["sina"];
const netease = stocks["netease"];
const tencent = stocks["tencent"];
const xueqiu = stocks["xueqiu"];
```

##### 直接导入

```typescript
import Sina from "stock-api/stocks/sina";
import Netease from "stock-api/stocks/netease";
import Tencent from "stock-api/stocks/tencent";
import Xueqiu from "stock-api/stocks/xuiqiu";
```

### 获取股票实时数据

##### 示例

```typescript
import { stocks } from "stock-api";

// 选择数据源
const api = new stocks["sina"];

// 获取数据
api.getStock("SH510500").then(console.log);
```

##### 输出

```typescript
{
  code: 'SH510500',
  name: '500ETF',
  percent: 0.028383,
  now: 7.174,
  low: 6.93,
  high: 7.184,
  yesterday: 6.976
}
```

### 获取股票组实时数据

##### 示例

```typescript
import { stocks } from "stock-api";

// 选择数据源
const api = new stocks["sina"];

// 获取数据
api.getStocks(["SH510500"]).then(console.log);
```

##### 输出

```typescript
 [{
    code: 'SH510500',
    name: '500ETF',
    percent: 0.028383,
    now: 7.174,
    low: 6.93,
    high: 7.184,
    yesterday: 6.976
  }]
```



## 一起成长

> 韭菜小猪也有暴富梦~

- 在困惑的城市里总少不了并肩同行的 伙伴 让我们一起成长。
- 如果您想让更多人看到文章可以点个 点赞。
- 如果您想激励小二可以到 Github 给个 小星星。
