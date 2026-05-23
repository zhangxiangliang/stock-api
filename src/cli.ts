#!/usr/bin/env node

import { stocks } from "./index";
import StockApi from "./types/stocks";
import { KlineAdjust, KlinePeriod } from "./types/utils/kline";

type SourceName = "eastmoney" | "sina" | "tencent";
type CliSourceName = "auto" | SourceName;

type ParsedArgs = {
  command?: string;
  adjust?: KlineAdjust;
  count?: number;
  period?: KlinePeriod;
  values: string[];
  source: CliSourceName;
};

const sourceNames: SourceName[] = ["tencent", "sina", "eastmoney"];
const cliSourceNames: CliSourceName[] = ["auto", ...sourceNames];

run(process.argv.slice(2)).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});

async function run(args: string[]): Promise<void> {
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

    case "get-klines":
      requireValues(parsed.values, "get-klines <code>");
      printJson(
        await source.getKlines(parsed.values[0], {
          adjust: parsed.adjust,
          count: parsed.count,
          period: parsed.period,
        })
      );
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

function parseArgs(args: string[]): ParsedArgs {
  const values: string[] = [];
  let command: string | undefined;
  let adjust: KlineAdjust | undefined;
  let count: number | undefined;
  let period: KlinePeriod | undefined;
  let source: CliSourceName = "auto";

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

function getSource(source: CliSourceName): StockApi {
  return stocks[source];
}

function isCliSourceName(value: string | undefined): value is CliSourceName {
  return cliSourceNames.includes(value as CliSourceName);
}

function isKlinePeriod(value: string | undefined): value is KlinePeriod {
  return value === "day" || value === "week" || value === "month";
}

function isKlineAdjust(value: string | undefined): value is KlineAdjust {
  return value === "none" || value === "qfq" || value === "hfq";
}

function requireValues(values: string[], usage: string): void {
  if (values.length === 0) {
    throw new Error(`Usage: stock-api ${usage}`);
  }
}

function printJson(value: unknown): void {
  console.log(JSON.stringify(value, null, 2));
}

function printHelp(): void {
  console.log(`Usage:
  stock-api get-stock <code> [--source auto|tencent|sina|eastmoney]
  stock-api get-stocks <code...> [--source auto|tencent|sina|eastmoney]
  stock-api get-klines <code> [--period day|week|month] [--count n] [--adjust none|qfq|hfq] [--source auto|tencent|sina|eastmoney]
  stock-api search-stocks <keyword> [--source auto|tencent|sina|eastmoney]

Examples:
  stock-api get-stock SH510500
  stock-api get-stocks SH510500 SZ000651
  stock-api get-klines SH600519 --period week --count 20
  stock-api search-stocks 格力电器 --source eastmoney`);
}
