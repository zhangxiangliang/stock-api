---
name: stock-api
description: Fetch real-time stock quotes, K-line (candlestick) history, and search symbols for China A-shares, Hong Kong, and US markets. Use when the user asks for a stock price, a quote, market data, candlestick/K-line data, or to look up a stock code by company name.
---

# stock-api

Get normalized stock market data by running the `stock-api` CLI. It covers
China A-shares, Hong Kong, and US markets, with automatic provider fallback
across Tencent, Sina, and Eastmoney.

## When to use

- The user wants a current price or quote for one or more stocks.
- The user wants K-line / candlestick history for charting or analysis.
- The user knows a company name but not its code (search first, then quote).

## How to run

Use `npx stock-api <command>`. Every command prints JSON to stdout.

Stock codes use a market prefix: `SH` / `SZ` (China), `HK` (Hong Kong),
`US` (US). Examples: `SH510500`, `SZ000651`, `HK02020`, `USDJI`.

### Get one quote

```bash
npx stock-api get-stock SH510500
```

### Get several quotes at once

```bash
npx stock-api get-stocks SH510500 SZ000651
```

### Get K-line (candlestick) history

```bash
npx stock-api get-klines SH600519 --period week --count 20
```

- `--period` — `day` (default), `week`, or `month`.
- `--count` — number of rows (defaults to the provider default).
- `--adjust` — `none` (default), `qfq` (forward), or `hfq` (backward).

### Search a code by keyword

```bash
npx stock-api search-stocks 格力电器
```

## Options (all commands)

- `--source` — `auto` (default), `tencent`, `sina`, or `eastmoney`.
  Leave it on `auto` unless the user asks for a specific provider; `auto`
  falls back across providers if one fails.

## Notes

- Output is JSON — parse it, don't reformat by hand, before showing the user.
- If a code returns no data, try `search-stocks` to confirm the correct code.
- For programmatic/persistent use, this same engine is also available as an
  MCP server: `npx stock-api mcp`. Prefer the CLI commands above for one-off
  lookups.
