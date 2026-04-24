#!/usr/bin/env node

import { stocks } from "./index";
import StockApi from "./types/stocks";

type SourceName = "sina" | "tencent";

type ParsedArgs = {
  command?: string;
  values: string[];
  source: SourceName;
};

const sourceNames: SourceName[] = ["tencent", "sina"];

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

    case "search":
      requireValues(parsed.values, "search <keyword>");
      printJson(await source.searchStocks(parsed.values.join(" ")));
      return;

    default:
      throw new Error(`Unknown command: ${parsed.command}`);
  }
}

function parseArgs(args: string[]): ParsedArgs {
  const values: string[] = [];
  let command: string | undefined;
  let source: SourceName = "tencent";

  for (let index = 0; index < args.length; index++) {
    const arg = args[index];

    if (arg === "--source" || arg === "-s") {
      const value = args[index + 1];

      if (!isSourceName(value)) {
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

function getSource(source: SourceName): StockApi {
  return stocks[source];
}

function isSourceName(value: string | undefined): value is SourceName {
  return sourceNames.includes(value as SourceName);
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
  stock-api get-stock <code> [--source tencent|sina]
  stock-api get-stocks <code...> [--source tencent|sina]
  stock-api search <keyword> [--source tencent|sina]

Examples:
  stock-api get-stock SH510500
  stock-api get-stocks SH510500 SZ000651
  stock-api search 格力电器 --source sina`);
}
