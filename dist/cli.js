#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const server_1 = require("./mcp/server");
const sourceNames = ["tencent", "sina", "eastmoney"];
const cliSourceNames = ["auto", ...sourceNames];
run(process.argv.slice(2)).catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
});
async function run(args) {
    const parsed = parseArgs(args);
    if (!parsed.command || parsed.command === "help" || parsed.command === "--help") {
        printHelp();
        return;
    }
    if (parsed.command === "mcp") {
        await (0, server_1.runMcpServer)();
        return;
    }
    const source = getSource(parsed.source);
    switch (parsed.command) {
        case "get-stock":
            requireValues(parsed.values, "get-stock <code>");
            printJson(await source.getStock(parsed.values[0]));
            return;
        case "get-stocks":
            requireValues(parsed.values, "get-stocks <code...>");
            printJson(await source.getStocks(parsed.values));
            return;
        case "get-klines":
            requireValues(parsed.values, "get-klines <code>");
            printJson(await source.getKlines(parsed.values[0], {
                adjust: parsed.adjust,
                count: parsed.count,
                period: parsed.period,
            }));
            return;
        case "search-stocks":
        case "search":
            requireValues(parsed.values, "search-stocks <keyword>");
            printJson(await source.searchStocks(parsed.values.join(" ")));
            return;
        default:
            throw new Error(`Unknown command: ${parsed.command}`);
    }
}
function parseArgs(args) {
    const values = [];
    let command;
    let adjust;
    let count;
    let period;
    let source = "auto";
    for (let index = 0; index < args.length; index++) {
        const arg = args[index];
        if (arg === "--source" || arg === "-s") {
            const value = args[index + 1];
            if (!isCliSourceName(value)) {
                throw new Error(`Invalid source: ${value || ""}`);
            }
            source = value;
            index += 1;
            continue;
        }
        if (arg === "--period" || arg === "-p") {
            const value = args[index + 1];
            if (!isKlinePeriod(value)) {
                throw new Error(`Invalid period: ${value || ""}`);
            }
            period = value;
            index += 1;
            continue;
        }
        if (arg === "--count" || arg === "-c") {
            const value = Number(args[index + 1]);
            if (!Number.isFinite(value) || value <= 0) {
                throw new Error(`Invalid count: ${args[index + 1] || ""}`);
            }
            count = Math.floor(value);
            index += 1;
            continue;
        }
        if (arg === "--adjust") {
            const value = args[index + 1];
            if (!isKlineAdjust(value)) {
                throw new Error(`Invalid adjust: ${value || ""}`);
            }
            adjust = value;
            index += 1;
            continue;
        }
        if (!command) {
            command = arg;
            continue;
        }
        values.push(arg);
    }
    return { adjust, command, count, period, source, values };
}
function getSource(source) {
    return index_1.stocks[source];
}
function isCliSourceName(value) {
    return cliSourceNames.includes(value);
}
function isKlinePeriod(value) {
    return value === "day" || value === "week" || value === "month";
}
function isKlineAdjust(value) {
    return value === "none" || value === "qfq" || value === "hfq";
}
function requireValues(values, usage) {
    if (values.length === 0) {
        throw new Error(`Usage: stock-api ${usage}`);
    }
}
function printJson(value) {
    console.log(JSON.stringify(value, null, 2));
}
function printHelp() {
    console.log(`Usage:
  stock-api get-stock <code> [--source auto|tencent|sina|eastmoney]
  stock-api get-stocks <code...> [--source auto|tencent|sina|eastmoney]
  stock-api get-klines <code> [--period day|week|month] [--count n] [--adjust none|qfq|hfq] [--source auto|tencent|sina|eastmoney]
  stock-api search-stocks <keyword> [--source auto|tencent|sina|eastmoney]
  stock-api mcp

Examples:
  stock-api get-stock SH510500
  stock-api get-stocks SH510500 SZ000651
  stock-api get-klines SH600519 --period week --count 20
  stock-api search-stocks 格力电器 --source eastmoney
  stock-api mcp`);
}
