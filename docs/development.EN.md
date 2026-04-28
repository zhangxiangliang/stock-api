# Development Guide

[English](development.EN.md) | [简体中文](development.md)

This document is for maintainers who develop, test, extend, and release `stock-api`.

## Requirements

- Node.js `>=18`
- npm

Install dependencies:

```shell
npm install
```

## Commands

| Command | Description |
| --- | --- |
| `npm run build` | Compile TypeScript to `dist` |
| `npm run typecheck` | Type-check source and tests |
| `npm run test:unit` | Run unit tests without network access |
| `npm run test:integration` | Test real Tencent, Sina, and Eastmoney endpoints |
| `npm run validate` | CI check: build + typecheck + unit tests |
| `npm pack --dry-run` | Inspect npm package contents |
| `node scripts/check-api-status.mjs` | Check real providers and generate local status files |

Recommended local loop:

```shell
npm run typecheck
npm run test:unit
```

Before release:

```shell
npm run validate
npm run test:integration
npm pack --dry-run
```

## Tests

Tests are split into:

```text
test/unit
test/integration
```

Unit tests do not access the network. They cover code transforms, parsing, fixtures, default errors, and custom errors.

Integration tests access real provider endpoints and should be run before publishing or when fixing provider behavior. They are intentionally not part of default CI because public endpoints can be slow, rate-limited, or temporarily unavailable.

## CI

GitHub Actions configuration:

```text
.github/workflows/ci.yml
```

CI runs on pushes to `main` and on pull requests:

```shell
npm ci
npm run validate
```

## API Monitor

The `API Monitor` workflow runs hourly and can be triggered manually. It checks real Tencent, Sina, and Eastmoney endpoints and publishes status files to the `api-status` branch.

README badges read from `api-status`. The monitor workflow does not modify `main`; `api-status` only keeps the latest status snapshot instead of accumulating historical commits; shields.io refreshes badges according to `cacheSeconds=300`.

Run locally:

```shell
npm run build
node scripts/check-api-status.mjs
```

## Adding a Provider

Assume the new provider is `example`.

### 1. Create Files

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

### 2. Configure Code Mapping

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
  unknownError: "Please check the stock code",
});
```

### 3. Parse Quotes

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

### 4. Create Provider

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

### 5. Export Provider

Update:

```text
src/stocks/index.ts
```

Also update:

- `StockProviderName`
- `StockSource`
- `sourceNames`
- `stocks.auto` provider order

### 6. Add Tests

Add at least:

- `test/unit/example/transforms/*`
- `test/unit/example/fixture.test.ts`
- `test/integration/stocks/example/index.test.ts`

## Package Check

`package.json` uses a `files` allowlist:

```json
{
  "files": ["dist/**/*", "docs/**/*"]
}
```

Before publishing:

```shell
npm run validate
npm run test:integration
npm pack --dry-run
```

The package should include:

- `dist/cli.js`
- `dist/index.js`
- `dist/**/*.d.ts`
- `docs/**/*`
- `README.md`
- `LICENSE`

It should not include:

- `src`
- `test`
- `coverage`
- `node_modules`

## Commits

Commit messages must be short English Conventional Commits, for example:

```text
fix: handle missing stock quotes
feat: add auto stock fallback
chore: update documentation
```
