# CLI Usage

[English](cli.EN.md) | [简体中文](cli.md)

`stock-api` includes a CLI for quick quote lookup, shell scripts, CI checks, and provider verification.

## Usage

```shell
npx stock-api <command> [...args] [--source auto|tencent|sina|eastmoney]
```

The default source is `auto`, which falls back in this order:

```text
tencent -> sina -> eastmoney
```

Install first if you prefer:

```shell
npm install stock-api
npx stock-api --help
```

## Commands

| Command | Description |
| --- | --- |
| `get-stock <code>` | Get one quote |
| `get-stocks <code...>` | Get multiple quotes |
| `get-klines <code>` | Get daily / weekly / monthly K-lines |
| `search-stocks <keyword>` | Search symbols and return quotes |
| `help` / `--help` | Show help |

## Options

| Option | Alias | Description | Default |
| --- | --- | --- | --- |
| `--source` | `-s` | `auto` / `tencent` / `sina` / `eastmoney` | `auto` |
| `--period` | `-p` | `day` / `week` / `month` | `day` |
| `--count` | `-c` | Number of K-line rows | `120` |
| `--adjust` | - | `none` / `qfq` / `hfq` | `none` |

## get-stock

```shell
npx stock-api get-stock SH510500
```

Use Sina only:

```shell
npx stock-api get-stock SH510500 --source sina
```

Use Eastmoney only:

```shell
npx stock-api get-stock SH600519 --source eastmoney
```

Output:

```json
{
  "code": "SH510500",
  "name": "中证500ETF南方",
  "percent": -0.009791044776119473,
  "now": 8.293,
  "low": 8.242,
  "high": 8.365,
  "yesterday": 8.375,
  "source": "tencent"
}
```

`source` is the provider that returned the quote.

## get-stocks

```shell
npx stock-api get-stocks SH510500 SZ000651
```

## search-stocks

```shell
npx stock-api search-stocks 格力电器
```

Multiple words are joined into one keyword:

```shell
npx stock-api search-stocks 中证 500
```

Use one provider:

```shell
npx stock-api search-stocks 格力电器 -s sina
npx stock-api search-stocks 贵州茅台 -s eastmoney
```

`search` is kept as a backward-compatible alias. New code should use `search-stocks`.

## get-klines

```shell
npx stock-api get-klines SH600519
```

Set period and count:

```shell
npx stock-api get-klines SH600519 --period week --count 20
npx stock-api get-klines SH600519 --period month --source sina
```

Output:

```json
[
  {
    "date": "2026-05-22",
    "open": 1310.95,
    "close": 1290.2,
    "high": 1311.91,
    "low": 1290.12,
    "source": "tencent",
    "volume": 49157
  }
]
```

## Source Selection

| Usage | Behavior |
| --- | --- |
| no `--source` | Use `auto`, fallback through `tencent -> sina -> eastmoney` |
| `--source tencent` | Tencent only |
| `--source sina` | Sina only |
| `--source eastmoney` | Eastmoney only |

## Output

The CLI always prints JSON.

```shell
npx stock-api get-stock SH510500 | jq .now
npx stock-api get-stocks SH510500 SZ000651 > stocks.json
```

## Exit Codes

| Case | Exit code |
| --- | --- |
| Success | `0` |
| Invalid arguments, unknown command, request failure | `1` |

Errors are printed to `stderr`.

## Local CLI Testing

```shell
npm run build
node dist/cli.js --help
node dist/cli.js get-stock SH510500
node dist/cli.js get-stocks SH510500 SZ000651
node dist/cli.js get-klines SH600519 --period week --count 20
node dist/cli.js search-stocks 格力电器
```

Simulate published `npx` usage:

```shell
tmpdir=$(mktemp -d)
npm pack --pack-destination "$tmpdir"
mkdir "$tmpdir/app"
cd "$tmpdir/app"
npm init -y
npm install "$tmpdir"/stock-api-*.tgz
npx stock-api --help
```
