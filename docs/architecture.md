# 项目架构

这份文档说明 `stock-api` 的代码结构、核心数据流和后续扩展方式。

## 目标

`stock-api` 现在同时支持两种使用方式：

- 作为 npm library，在 Node.js 中通过 `import` / `require` 调用
- 作为 CLI，通过 `npx stock-api ...` 直接查询

项目的核心原则：

- 保持运行时零外部依赖
- 公共流程集中，数据源只描述差异
- 单元测试不依赖外网，integration 测试才访问真实数据源
- 指定具体数据源时保留真实返回，默认 `auto` 模式提供跨源兜底

## 目录结构

```text
src/
  cli.ts                       # CLI 入口，编译到 dist/cli.js
  errors.ts                    # 自定义错误类型
  index.ts                     # npm 包根入口
  stocks/
    index.ts                   # 汇总并导出所有数据源
    auto/                      # 自动数据源兜底
    base/                      # 基础 provider 和默认错误行为
    shared/
      code-mapper.ts           # 统一代码映射工厂
      normalize.ts             # 自动模式的标准字段补充
      provider.ts              # 股票数据源 provider 工厂
    eastmoney/                 # 东方财富数据源配置和解析
    sina/                      # 新浪数据源配置和解析
    tencent/                   # 腾讯数据源配置和解析
  types/                       # 公共类型
  utils/                       # 原生请求、编码、常量等工具

test/
  fixtures/                    # 原始行情返回样本
  integration/                 # 真实数据源测试
  unit/                        # 不依赖外网的单元测试
```

## 公共 API

根入口导出：

```typescript
import { stocks } from "stock-api";
```

`stocks` 下目前有：

```typescript
stocks.tencent
stocks.sina
stocks.eastmoney
stocks.auto
```

每个数据源都实现同一个接口：

```typescript
type StockApi = {
  getStock(code: string): Promise<Stock>;
  getStocks(codes: string[]): Promise<Stock[]>;
  searchStocks(key: string): Promise<Stock[]>;
};
```

`stocks.auto` 同样实现 `StockApi`，但会按 `tencent -> sina -> eastmoney` 顺序尝试。返回结果会补充 `source`，用于标记实际返回数据的数据源。

## 数据流

以 `stocks.tencent.getStocks(["SH510500", "SZ000651"])` 为例：

1. 用户传入统一股票代码
2. `createStockProvider` 去重并过滤空字符串
3. 数据源的 `codeTransform` 把统一代码转成接口代码
4. `getUrl` 拼出真实请求地址
5. `utils/fetch.ts` 使用 Node 原生 `http/https` 请求
6. `utils/iconv.ts` 使用 Node 原生 `TextDecoder` 解码
7. `splitRows` 拆分数据源返回行
8. `parseTencentStock` / `parseSinaStock` 转成统一 `Stock`
9. 返回统一结构

## Provider 工厂

`src/stocks/shared/provider.ts` 负责统一实现：

- `getStock`
- `getStocks`
- `searchStocks`
- 请求和解码
- 缺失股票默认数据
- 原始行切分和参数切分

数据源只需要提供配置：

```typescript
const Tencent = createStockProvider({
  quote: {
    codeTransform,
    delimiter: "~",
    encoding: "gbk",
    getUrl(apiCodes) {
      return `https://qt.gtimg.cn/q=${apiCodes.join(",")}`;
    },
    isMissing(row, apiCode) {
      return !row.includes(apiCode);
    },
    parseStock(code, params) {
      return parseTencentStock(code, params);
    },
  },
  search: {
    encoding: "gbk",
    getUrl(key) {
      return `https://smartbox.gtimg.cn/s3/?v=2&t=all&c=1&q=${encodeURIComponent(key)}`;
    },
    parseCodes(body) {
      return [];
    },
  },
});
```

## 代码映射

项目对外统一使用：

```text
SH510500
SZ000651
HK02020
USDJI
```

不同数据源有自己的代码格式：

| 数据源 | SH | SZ | HK | US |
| --- | --- | --- | --- | --- |
| 统一代码 | `SH510500` | `SZ000651` | `HK02020` | `USDJI` |
| 腾讯 | `sh510500` | `sz000651` | `hk02020` | `usDji` 类似格式 |
| 新浪 | `sh510500` | `sz000651` | `hk02020` | `gb_dji` 类似格式 |
| 东方财富 | `1.510500` | `0.000651` | 暂不支持 | 暂不支持 |

`src/stocks/shared/code-mapper.ts` 用配置生成转换器，避免每个数据源重复写一套 `SZTransform` / `SHTransform`。

## 解析策略

股票解析已经从旧的 class 方式改成纯函数：

```typescript
parseTencentStock(code, params)
parseSinaStock(code, params)
parseEastmoneyStock(code, quote)
```

这样做的好处：

- 解析函数没有状态，更容易测试
- fixture 可以直接覆盖原始返回到统一结构的转换
- 新增数据源只需要补一个 `parseXxxStock`

## 错误模型

根入口导出这些错误：

```typescript
StockApiError
StockCodeError
StockRequestError
StockParseError
```

当前使用方式：

- 代码格式错误抛 `StockCodeError`
- 请求失败和超时抛 `StockRequestError`
- `StockParseError` 预留给后续更严格的解析错误

注意：如果数据源明确表示股票不存在，当前会返回默认股票数据，而不是抛错。这是为了兼容历史 API。

## 发布产物

`npm pack` 只会带这些内容：

- `dist/**/*`
- `docs/**/*`
- `README.md`
- `LICENSE`
- `package.json`

源码、测试、coverage、node_modules 不会进入发布包。
