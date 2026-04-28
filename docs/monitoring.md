# API 监控

[English](monitoring.EN.md) | [简体中文](monitoring.md)

`stock-api` 使用 GitHub Actions 定时检查第三方行情接口是否可用。

## 运行时间

`API Monitor` 工作流每小时第 33 分钟运行一次，也可以在 GitHub Actions 页面手动触发。

```text
API Monitor
```

## 检查内容

- 腾讯行情和搜索
- 新浪行情和搜索
- 东方财富行情和搜索

## 状态文件

检查结果会发布到 `api-status` 分支。README 徽章通过 shields.io endpoint 读取这些 JSON 文件：

```text
https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fzhangxiangliang%2Fstock-api%2Fapi-status%2F{source}.json
```

工作流还会把 README 徽章 URL 中的 `v=YYYYMMDDHHMM` 更新到 `main`，减少 GitHub 图片缓存导致的状态滞后。这个提交使用 `chore:`，不会发布新的 npm 版本。

## SVG 备用文件

工作流也会保留生成的 SVG 文件，方便调试或备用：

```text
https://raw.githubusercontent.com/zhangxiangliang/stock-api/api-status/{source}.svg
https://raw.githubusercontent.com/zhangxiangliang/stock-api/api-status/{source}.zh-CN.svg
```

## 本地运行

```shell
npm run build
node scripts/check-api-status.mjs
```

本地生成文件会写入：

```text
status/
```
