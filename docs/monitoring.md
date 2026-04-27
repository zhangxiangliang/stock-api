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

README badges use shields.io endpoint badges backed by JSON files on the
`api-status` branch:

```text
https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fzhangxiangliang%2Fstock-api%2Fapi-status%2F{source}.json
```

After every monitor run, the workflow also updates the README badge URLs with a
new `?v=YYYYMMDDHHMM` query string. This gives GitHub a fresh image URL and
reduces stale badge caching.

The workflow also keeps generated SVG files for debugging or fallback use:

```text
https://raw.githubusercontent.com/zhangxiangliang/stock-api/api-status/{source}.svg
https://raw.githubusercontent.com/zhangxiangliang/stock-api/api-status/{source}.zh-CN.svg
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
