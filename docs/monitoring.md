# API Monitoring

`stock-api` uses a scheduled GitHub Actions workflow to check whether third-party
market data sources are still reachable.

The workflow runs hourly and can also be started manually from GitHub Actions:

```text
API Monitor
```

It checks:

- Tencent quote and search
- Sina quote and search
- Eastmoney quote and search

The generated status files are published to the `api-status` branch instead of
`main`, so scheduled monitoring does not trigger npm releases.

README badges read generated SVG files directly from the `api-status` branch:

```text
https://raw.githubusercontent.com/zhangxiangliang/stock-api/api-status/{source}.svg
```

After every monitor run, the workflow also updates the README badge URLs with a
new `?v=YYYYMMDDHHMM` query string. This gives GitHub a fresh image URL and
reduces stale badge caching.

The workflow also keeps shields.io-compatible JSON files for debugging or reuse:

```text
https://raw.githubusercontent.com/zhangxiangliang/stock-api/api-status/{source}.json
https://raw.githubusercontent.com/zhangxiangliang/stock-api/api-status/{source}.zh-CN.json
```

Run locally:

```shell
npm run build
node scripts/check-api-status.mjs
```

Generated local files are written to:

```text
status/
```
