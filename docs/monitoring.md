# API Monitoring

`stock-api` uses a scheduled GitHub Actions workflow to check whether third-party
market data sources are still reachable.

The workflow runs daily and can also be started manually from GitHub Actions:

```text
API Monitor
```

It checks:

- Tencent quote and search
- Sina quote and search
- Eastmoney quote and search

The generated status files are published to the `api-status` branch instead of
`main`, so scheduled monitoring does not trigger npm releases.

README badges read these files through shields.io endpoint badges:

```text
https://raw.githubusercontent.com/zhangxiangliang/stock-api/api-status/{source}.json
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
