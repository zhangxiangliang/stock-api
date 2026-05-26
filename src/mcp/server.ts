import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Readable, Writable } from "node:stream";

import { stocks } from "../index";
import StockApi from "../types/stocks";
import { KlineAdjust, KlinePeriod } from "../types/utils/kline";
import { StockSource } from "../types/utils/stock";
import { StockProviderApi } from "../stocks/shared/provider";

type SourceName = Exclude<StockSource, "base">;
type McpSourceName = "auto" | SourceName;
type JsonRpcId = number | string | null;

type JsonRpcRequest = {
  jsonrpc: "2.0";
  id?: JsonRpcId;
  method: string;
  params?: unknown;
};

type JsonRpcResponse = {
  jsonrpc: "2.0";
  id: JsonRpcId;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
};

type McpTool = {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
    additionalProperties: false;
  };
};

type ToolResult = {
  content: Array<{
    type: "text";
    text: string;
  }>;
  structuredContent: unknown;
  isError?: boolean;
};

type ToolCallParams = {
  name?: string;
  arguments?: unknown;
};

type GetStockArgs = {
  code?: unknown;
  source?: unknown;
};

type GetStocksArgs = {
  codes?: unknown;
  source?: unknown;
};

type GetKlinesArgs = {
  adjust?: unknown;
  code?: unknown;
  count?: unknown;
  period?: unknown;
  source?: unknown;
};

type SearchStocksArgs = {
  query?: unknown;
  source?: unknown;
};

type InspectStockArgs = {
  code?: unknown;
  source?: unknown;
};

const sourceNames: SourceName[] = ["tencent", "sina", "eastmoney"];
const mcpSourceNames: McpSourceName[] = ["auto", ...sourceNames];
const packageVersion = readPackageVersion();

const tools: McpTool[] = [
  {
    name: "get_stock",
    description: "Get one normalized stock quote by code.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["code"],
      properties: {
        code: stockCodeSchema(),
        source: sourceSchema(),
      },
    },
  },
  {
    name: "get_stocks",
    description: "Get normalized stock quotes for multiple codes.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["codes"],
      properties: {
        codes: {
          type: "array",
          items: stockCodeSchema(),
          minItems: 1,
          description: "Stock codes, such as SH510500 or SZ000651.",
        },
        source: sourceSchema(),
      },
    },
  },
  {
    name: "get_klines",
    description: "Get normalized K-line rows for charting.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["code"],
      properties: {
        code: stockCodeSchema(),
        period: {
          type: "string",
          enum: ["day", "week", "month"],
          description: "K-line period. Defaults to day.",
        },
        count: {
          type: "number",
          minimum: 1,
          maximum: 500,
          description: "Number of rows to return. Defaults to the provider default.",
        },
        adjust: {
          type: "string",
          enum: ["none", "qfq", "hfq"],
          description: "Price adjustment mode. Defaults to none.",
        },
        source: sourceSchema(),
      },
    },
  },
  {
    name: "search_stocks",
    description: "Search stock symbols by keyword.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["query"],
      properties: {
        query: {
          type: "string",
          minLength: 1,
          description: "Search keyword, such as 格力电器.",
        },
        source: sourceSchema(),
      },
    },
  },
  {
    name: "inspect_stock",
    description: "Inspect quote availability and provider fallback details.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["code"],
      properties: {
        code: stockCodeSchema(),
        source: sourceSchema(),
      },
    },
  },
];

export async function runMcpServer(
  input: Readable = process.stdin,
  output: Writable = process.stdout
): Promise<void> {
  input.setEncoding("utf8");

  let buffer = "";

  input.on("data", (chunk: string) => {
    buffer += chunk;

    let newlineIndex = buffer.indexOf("\n");
    while (newlineIndex >= 0) {
      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);

      if (line !== "") {
        void handleLine(line, output);
      }

      newlineIndex = buffer.indexOf("\n");
    }
  });
}

export async function handleMcpRequest(
  request: JsonRpcRequest
): Promise<JsonRpcResponse | undefined> {
  if (!isRequest(request)) {
    return createError(null, -32600, "Invalid Request");
  }

  if (request.id === undefined) {
    await handleNotification(request);
    return undefined;
  }

  try {
    const result = await routeRequest(request);
    return {
      jsonrpc: "2.0",
      id: request.id,
      result,
    };
  } catch (error) {
    return createError(request.id, -32603, getErrorMessage(error));
  }
}

async function handleLine(line: string, output: Writable): Promise<void> {
  let payload: unknown;

  try {
    payload = JSON.parse(line);
  } catch (error) {
    writeMessage(output, createError(null, -32700, getErrorMessage(error)));
    return;
  }

  const messages = Array.isArray(payload) ? payload : [payload];

  for (const message of messages) {
    const response = await handleMcpRequest(message as JsonRpcRequest);

    if (response) {
      writeMessage(output, response);
    }
  }
}

async function routeRequest(request: JsonRpcRequest): Promise<unknown> {
  switch (request.method) {
    case "initialize":
      return {
        protocolVersion: "2025-06-18",
        capabilities: {
          tools: {},
        },
        serverInfo: {
          name: "stock-api",
          version: packageVersion,
        },
      };

    case "tools/list":
      return { tools };

    case "tools/call":
      return callTool(parseToolCallParams(request.params));

    default:
      throw new Error(`Unknown method: ${request.method}`);
  }
}

async function handleNotification(request: JsonRpcRequest): Promise<void> {
  if (request.method === "notifications/initialized") {
    return;
  }
}

async function callTool(params: ToolCallParams): Promise<unknown> {
  const name = requireString(params.name, "name");
  const args = asObject(params.arguments);

  try {
    const data = await executeTool(name, args);
    return createToolResult(data);
  } catch (error) {
    const data = {
      code: "STOCK_API_TOOL_ERROR",
      message: getErrorMessage(error),
    };

    return {
      ...createToolResult(data),
      isError: true,
    };
  }
}

async function executeTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case "get_stock": {
      const values = args as GetStockArgs;
      return getSource(values.source).getStock(requireString(values.code, "code"));
    }

    case "get_stocks": {
      const values = args as GetStocksArgs;
      return getSource(values.source).getStocks(requireStringArray(values.codes, "codes"));
    }

    case "get_klines": {
      const values = args as GetKlinesArgs;
      return getSource(values.source).getKlines(requireString(values.code, "code"), {
        adjust: optionalKlineAdjust(values.adjust),
        count: optionalCount(values.count),
        period: optionalKlinePeriod(values.period),
      });
    }

    case "search_stocks": {
      const values = args as SearchStocksArgs;
      return getSource(values.source).searchStocks(requireString(values.query, "query"));
    }

    case "inspect_stock": {
      const values = args as InspectStockArgs;
      return getInspectionSource(values.source).inspectStock(requireString(values.code, "code"));
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function getSource(value: unknown): StockApi {
  const source = optionalSource(value);
  return stocks[source];
}

function getInspectionSource(value: unknown): StockProviderApi {
  const source = optionalSource(value);
  return stocks[source] as StockProviderApi;
}

function optionalSource(value: unknown): McpSourceName {
  if (value === undefined) {
    return "auto";
  }

  const source = requireString(value, "source");

  if (!mcpSourceNames.includes(source as McpSourceName)) {
    throw new Error(`Invalid source: ${source}`);
  }

  return source as McpSourceName;
}

function optionalKlinePeriod(value: unknown): KlinePeriod | undefined {
  if (value === undefined) {
    return undefined;
  }

  const period = requireString(value, "period");
  if (period !== "day" && period !== "week" && period !== "month") {
    throw new Error(`Invalid period: ${period}`);
  }

  return period;
}

function optionalKlineAdjust(value: unknown): KlineAdjust | undefined {
  if (value === undefined) {
    return undefined;
  }

  const adjust = requireString(value, "adjust");
  if (adjust !== "none" && adjust !== "qfq" && adjust !== "hfq") {
    throw new Error(`Invalid adjust: ${adjust}`);
  }

  return adjust;
}

function optionalCount(value: unknown): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new Error(`Invalid count: ${String(value)}`);
  }

  return Math.floor(value);
}

function parseToolCallParams(value: unknown): ToolCallParams {
  return asObject(value) as ToolCallParams;
}

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function requireString(value: unknown, name: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing or invalid ${name}`);
  }

  return value.trim();
}

function requireStringArray(value: unknown, name: string): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`Missing or invalid ${name}`);
  }

  return value.map((item) => requireString(item, name));
}

function createToolResult(data: unknown): ToolResult {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data, null, 2),
      },
    ],
    structuredContent: data,
  };
}

function stockCodeSchema(): Record<string, unknown> {
  return {
    type: "string",
    minLength: 1,
    description: "Stock code, such as SH510500, SZ000651, HK02020, or USDJI.",
  };
}

function sourceSchema(): Record<string, unknown> {
  return {
    type: "string",
    enum: mcpSourceNames,
    description: "Data source. Defaults to auto.",
  };
}

function isRequest(value: unknown): value is JsonRpcRequest {
  return Boolean(
    value &&
      typeof value === "object" &&
      (value as JsonRpcRequest).jsonrpc === "2.0" &&
      typeof (value as JsonRpcRequest).method === "string"
  );
}

function createError(
  id: JsonRpcId,
  code: number,
  message: string,
  data?: unknown
): JsonRpcResponse {
  return {
    jsonrpc: "2.0",
    id,
    error: {
      code,
      message,
      data,
    },
  };
}

function writeMessage(output: Writable, message: unknown): void {
  output.write(`${JSON.stringify(message)}\n`);
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function readPackageVersion(): string {
  try {
    const packageJsonPath = resolve(__dirname, "../../package.json");
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as {
      version?: unknown;
    };

    return typeof packageJson.version === "string" ? packageJson.version : "0.0.0";
  } catch {
    return "0.0.0";
  }
}
