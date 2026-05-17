#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
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
        case "search":
            requireValues(parsed.values, "search <keyword>");
            printJson(await source.searchStocks(parsed.values.join(" ")));
            return;
        default:
            throw new Error(`Unknown command: ${parsed.command}`);
    }
}
function parseArgs(args) {
    const values = [];
    let command;
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
        if (!command) {
            command = arg;
            continue;
        }
        values.push(arg);
    }
    return { command, source, values };
}
function getSource(source) {
    return index_1.stocks[source];
}
function isCliSourceName(value) {
    return cliSourceNames.includes(value);
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
  stock-api search <keyword> [--source auto|tencent|sina|eastmoney]

Examples:
  stock-api get-stock SH510500
  stock-api get-stocks SH510500 SZ000651
  stock-api search 格力电器 --source eastmoney`);
}
