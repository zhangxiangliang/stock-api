# 开发指南

[English](development.EN.md) | [简体中文](development.md)

这份文档面向维护者，说明如何开发、测试、扩展和发布前检查。

## 环境要求

- Node.js `>=18`
- npm

安装依赖：

```shell
npm install
```

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm run build` | 编译 TypeScript 到 `dist` |
| `npm run lint` | 运行 ESLint 代码检查 |
| `npm run lint:fix` | 自动修复可安全修复的 lint 问题 |
| `npm run typecheck` | 检查源码和测试类型 |
| `npm run test:unit` | 运行单元测试，不访问外网 |
| `npm run test:integration` | 访问真实腾讯/新浪/东方财富接口 |
| `npm run validate` | CI 验证命令：build + lint + typecheck + unit |
| `npm pack --dry-run` | 检查 npm 发布产物 |
| `node scripts/check-api-status.mjs` | 检查真实数据源并生成本地状态文件 |

推荐开发循环：

```shell
npm run typecheck
npm run lint
npm run test:unit
```

发布前检查：

```shell
npm run validate
npm run test:integration
npm pack --dry-run
npm audit --omit=dev
```

## 测试策略

测试分两类：

```text
test/unit
test/integration
```

`test/tsconfig.json` 专门用于编辑器识别测试文件里的 Jest 全局类型，例如 `describe`、`it`、`expect`。项目命令行类型检查仍然使用根目录的 `tsconfig.test.json`。

### Unit

`test/unit` 不访问外网，主要覆盖：

- 代码转换
- 股票字段解析
- 默认错误行为
- fixture 原始返回解析
- 自定义错误类型

fixture 放在：

```text
test/fixtures
```

fixture 的目标是把真实数据源返回固化下来，避免解析逻辑改动时悄悄改变金融数据语义。

### Integration

`test/integration` 会访问真实腾讯、新浪和东方财富接口。

这些测试适合：

- 发布前手动跑
- 修复数据源时确认真实接口仍可用

不建议把 integration 放进默认 CI，因为公网接口可能超时、限流或临时波动。

## CI

GitHub Actions 配置在：

```text
.github/workflows/ci.yml
```

CI 当前只监听 `main` 分支 push 和所有 pull request：

```yaml
on:
  push:
    branches: [main]
  pull_request:
```

CI 执行：

```shell
npm ci
npm run validate
```

## API Monitor

GitHub Actions 里的 `API Monitor` 工作流每小时定时运行一次，也支持手动触发。它会访问真实腾讯、新浪、东方财富接口，并把状态文件发布到 `api-status` 分支。

README 里的状态徽章读取 `api-status` 分支。监控工作流不会修改 `main`；`api-status` 只保留最新状态快照，不堆积历史提交；徽章由 shields.io 根据 `cacheSeconds=300` 自动刷新。

本地调试：

```shell
npm run build
node scripts/check-api-status.mjs
```

## 新增数据源流程

假设要新增 `example` 数据源。

### 1. 建目录

```text
src/stocks/example/
  index.ts
  transforms/
    api-code.ts
    common-code.ts
    stock.ts
  utils/
    constant.ts
```

### 2. 配置代码转换

如果数据源代码前缀是 `ex_sh` / `ex_sz`，可以用 `createCodeMapper`：

```typescript
import { createCodeMapper } from "../../shared/code-mapper";

const ExampleCommonCodeTransform = createCodeMapper({
  inputPrefixes: {
    SZ: "SZ",
    SH: "SH",
    HK: "HK",
    US: "US",
  },
  outputPrefixes: {
    SZ: "ex_sz",
    SH: "ex_sh",
    HK: "ex_hk",
    US: "ex_us",
  },
  unknownError: "请检查统一代码是否正确",
});
```

### 3. 写股票解析函数

```typescript
import Stock from "../../../types/utils/stock";

export function parseExampleStock(code: string, params: string[]): Stock {
  return {
    code,
    name: params[0] || "---",
    percent: 0,
    now: Number(params[1] || 0),
    low: Number(params[2] || 0),
    high: Number(params[3] || 0),
    yesterday: Number(params[4] || 0),
  };
}
```

### 4. 用 provider 工厂生成数据源

```typescript
import { createStockProvider } from "../shared/provider";
import ExampleCommonCodeTransform from "./transforms/common-code";
import { parseExampleStock } from "./transforms/stock";

const Example = createStockProvider({
  source: "example",
  quote: {
    codeTransform: ExampleCommonCodeTransform,
    delimiter: ",",
    encoding: "utf8",
    getUrl(apiCodes) {
      return `https://example.com/q=${apiCodes.join(",")}`;
    },
    isMissing(row) {
      return row === "";
    },
    parseStock(code, params) {
      return parseExampleStock(code, params);
    },
  },
  search: {
    encoding: "utf8",
    getUrl(key) {
      return `https://example.com/search?q=${encodeURIComponent(key)}`;
    },
    parseCodes(body) {
      return [];
    },
  },
});

export default Example;
```

### 5. 导出数据源

更新：

```text
src/stocks/index.ts
```

同时把新数据源加入：

- `StockProviderName`
- `StockSource`
- `sourceNames`
- `stocks.auto` 的 provider 顺序

### 6. 补测试

至少补：

- `test/unit/example/transforms/*`
- `test/unit/example/fixture.test.ts`
- `test/integration/stocks/example/index.test.ts`

## 发布产物检查

`package.json` 使用 `files` 白名单：

```json
{
  "files": ["dist/**/*", "docs/**/*"]
}
```

发布前建议确认：

```shell
npm run validate
npm run test:integration
npm pack --dry-run
```

需要看到：

- `dist/cli.js`
- `dist/index.js`
- `dist/**/*.d.ts`
- `docs/**/*`
- `README.md`
- `LICENSE`

不应该看到：

- `src`
- `test`
- `coverage`
- `node_modules`

## Commit

提交信息使用英文且简短，例如：

```text
Modernize stock provider architecture
Add stock-api CLI
Improve project documentation
```
