# API Monitoring

[English](monitoring.EN.md) | [简体中文](monitoring.md)

`stock-api` uses a scheduled GitHub Actions workflow to check whether third-party market data sources are still reachable.

## Schedule

The `API Monitor` workflow runs every hour at minute 33. It can also be started manually from GitHub Actions.

```text
API Monitor
```

## Checks

- Tencent quote and search
- Sina quote and search
- Eastmoney quote and search

## Status Files

Generated status files are published to the `api-status` branch. README badges use shields.io endpoint badges backed by those JSON files:

```text
https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fzhangxiangliang%2Fstock-api%2Fapi-status%2F{source}.json
```

The workflow also refreshes README badge URLs on `main` with `v=YYYYMMDDHHMM`, which reduces stale GitHub image caching. That commit uses `chore:` and does not publish a new npm version.

## SVG Fallback

The workflow keeps generated SVG files for debugging or fallback use:

```text
https://raw.githubusercontent.com/zhangxiangliang/stock-api/api-status/{source}.svg
https://raw.githubusercontent.com/zhangxiangliang/stock-api/api-status/{source}.zh-CN.svg
```

## Run Locally

```shell
npm run build
node scripts/check-api-status.mjs
```

Local files are written to:

```text
status/
```
