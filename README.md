# 股票接口

## 简介

一款聚焦在 `股票实时数据` 和 `周边相关服务` 的接口小助手。

## 股票数据

| 名称 | 接口名 | 官网 |
| --- | --- | --- |
| 基础示例 | base | 无 |
| 网易财经 | netease | [传送门](https://money.163.com/) |
| 新浪股票 | sina | [传送门](https://finance.sina.com.cn/) |
| 腾讯股票 | tencent | [传送门](http://gu.qq.com/) |

## 安装

```shell
npm install stock-api
yarn install stock-api
```

## 使用

### 选择数据源

##### 可选导入

```typescript
import { stocks } from "stock-api";

// 省略 async 相关内容
const sina = stocks["sina"];
const netease = stocks["netease"];
const tencent = stocks["tencent"];
```

##### 直接导入

```typescript
import Sina from "stock-api/stocks/sina";
import Netease from "stock-api/stocks/netease";
import Tencent from "stock-api/stocks/tencent";
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
