# CLI 使用

`stock-api` 提供命令行入口，适合临时查询、shell 脚本、CI 检查或快速验证数据源。

## 基本用法

```shell
npx stock-api <command> [...args] [--source tencent|sina]
```

默认数据源是 `tencent`。

也可以先全局或本地安装：

```shell
npm install stock-api
npx stock-api --help
```

## 命令列表

| 命令 | 说明 |
| --- | --- |
| `get-stock <code>` | 获取单只股票行情 |
| `get-stocks <code...>` | 批量获取股票行情 |
| `search <keyword>` | 搜索股票并返回行情数据 |
| `help` / `--help` | 查看帮助 |

## 参数

| 参数 | 简写 | 说明 | 默认值 |
| --- | --- | --- | --- |
| `--source` | `-s` | 指定数据源，可选 `tencent` / `sina` | `tencent` |

## get-stock

获取单只股票行情。

```shell
npx stock-api get-stock SH510500
```

指定新浪：

```shell
npx stock-api get-stock SH510500 --source sina
```

输出：

```json
{
  "code": "SH510500",
  "name": "中证500ETF南方",
  "percent": -0.009791044776119473,
  "now": 8.293,
  "low": 8.242,
  "high": 8.365,
  "yesterday": 8.375
}
```

## get-stocks

批量获取股票行情。

```shell
npx stock-api get-stocks SH510500 SZ000651
```

输出：

```json
[
  {
    "code": "SH510500",
    "name": "中证500ETF南方",
    "percent": -0.009791044776119473,
    "now": 8.293,
    "low": 8.242,
    "high": 8.365,
    "yesterday": 8.375
  },
  {
    "code": "SZ000651",
    "name": "格力电器",
    "percent": 0.0010822510822510178,
    "now": 37,
    "low": 36.71,
    "high": 37.11,
    "yesterday": 36.96
  }
]
```

## search

搜索股票，并返回匹配股票的行情数据。

```shell
npx stock-api search 格力电器
```

多个词会自动合并为一个关键词：

```shell
npx stock-api search 中证 500
```

指定数据源：

```shell
npx stock-api search 格力电器 -s sina
```

## 输出格式

CLI 输出始终是 JSON。

这意味着你可以继续交给其他工具处理：

```shell
npx stock-api get-stock SH510500 | jq .now
npx stock-api get-stocks SH510500 SZ000651 > stocks.json
```

## 退出码

| 场景 | 退出码 |
| --- | --- |
| 命令成功 | `0` |
| 参数错误、未知命令、请求失败 | `1` |

错误信息会输出到 `stderr`。

## 本地测试 CLI

开发时不需要发布到 npm，可以直接运行编译结果：

```shell
npm run build
node dist/cli.js --help
node dist/cli.js get-stock SH510500
node dist/cli.js get-stocks SH510500 SZ000651
node dist/cli.js search 格力电器
```

模拟发布后的 `npx`：

```shell
tmpdir=$(mktemp -d)
npm pack --pack-destination "$tmpdir"
mkdir "$tmpdir/app"
cd "$tmpdir/app"
npm init -y
npm install "$tmpdir/stock-api-2.0.8.tgz"
npx stock-api --help
```
