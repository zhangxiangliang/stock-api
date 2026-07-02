"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMcpServer = runMcpServer;
exports.handleMcpRequest = handleMcpRequest;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const index_1 = require("../index");
const sourceNames = ["tencent", "sina", "eastmoney"];
const mcpSourceNames = ["auto", ...sourceNames];
const packageVersion = readPackageVersion();
const tools = [
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
async function runMcpServer(input = process.stdin, output = process.stdout) {
    input.setEncoding("utf8");
    let buffer = "";
    input.on("data", (chunk) => {
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
async function handleMcpRequest(request) {
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
    }
    catch (error) {
        return createError(request.id, -32603, getErrorMessage(error));
    }
}
async function handleLine(line, output) {
    let payload;
    try {
        payload = JSON.parse(line);
    }
    catch (error) {
        writeMessage(output, createError(null, -32700, getErrorMessage(error)));
        return;
    }
    const messages = Array.isArray(payload) ? payload : [payload];
    for (const message of messages) {
        const response = await handleMcpRequest(message);
        if (response) {
            writeMessage(output, response);
        }
    }
}
async function routeRequest(request) {
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
async function handleNotification(request) {
    if (request.method === "notifications/initialized") {
        return;
    }
}
async function callTool(params) {
    const name = requireString(params.name, "name");
    const args = asObject(params.arguments);
    try {
        const data = await executeTool(name, args);
        return createToolResult(data);
    }
    catch (error) {
        const data = {
            input: {
                arguments: args,
                tool: name,
            },
            response: {
                code: "STOCK_API_TOOL_ERROR",
                message: getErrorMessage(error),
            },
        };
        return {
            ...createToolResult(data),
            isError: true,
        };
    }
}
async function executeTool(name, args) {
    switch (name) {
        case "get_stock": {
            const values = args;
            const input = {
                code: requireString(values.code, "code"),
                source: optionalSource(values.source),
            };
            const stock = await index_1.stocks[input.source].getStock(input.code);
            return {
                input,
                response: { stock },
            };
        }
        case "get_stocks": {
            const values = args;
            const input = {
                codes: requireStringArray(values.codes, "codes"),
                source: optionalSource(values.source),
            };
            const stockList = await index_1.stocks[input.source].getStocks(input.codes);
            return {
                input,
                response: {
                    count: stockList.length,
                    stocks: stockList,
                },
            };
        }
        case "get_klines": {
            const values = args;
            const input = {
                adjust: optionalKlineAdjust(values.adjust),
                code: requireString(values.code, "code"),
                count: optionalCount(values.count),
                period: optionalKlinePeriod(values.period),
                source: optionalSource(values.source),
            };
            const klines = await index_1.stocks[input.source].getKlines(input.code, {
                adjust: input.adjust,
                count: input.count,
                period: input.period,
            });
            return {
                input,
                response: {
                    count: klines.length,
                    klines,
                },
            };
        }
        case "search_stocks": {
            const values = args;
            const input = {
                query: requireString(values.query, "query"),
                source: optionalSource(values.source),
            };
            const stockList = await index_1.stocks[input.source].searchStocks(input.query);
            return {
                input,
                response: {
                    count: stockList.length,
                    stocks: stockList,
                },
            };
        }
        case "inspect_stock": {
            const values = args;
            const input = {
                code: requireString(values.code, "code"),
                source: optionalSource(values.source),
            };
            const inspection = await getInspectionSource(input.source).inspectStock(input.code);
            return {
                input,
                response: { inspection },
            };
        }
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}
function getInspectionSource(source) {
    return index_1.stocks[source];
}
function optionalSource(value) {
    if (value === undefined) {
        return "auto";
    }
    const source = requireString(value, "source");
    if (!mcpSourceNames.includes(source)) {
        throw new Error(`Invalid source: ${source}`);
    }
    return source;
}
function optionalKlinePeriod(value) {
    if (value === undefined) {
        return undefined;
    }
    const period = requireString(value, "period");
    if (period !== "day" && period !== "week" && period !== "month") {
        throw new Error(`Invalid period: ${period}`);
    }
    return period;
}
function optionalKlineAdjust(value) {
    if (value === undefined) {
        return undefined;
    }
    const adjust = requireString(value, "adjust");
    if (adjust !== "none" && adjust !== "qfq" && adjust !== "hfq") {
        throw new Error(`Invalid adjust: ${adjust}`);
    }
    return adjust;
}
function optionalCount(value) {
    if (value === undefined) {
        return undefined;
    }
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
        throw new Error(`Invalid count: ${String(value)}`);
    }
    return Math.floor(value);
}
function parseToolCallParams(value) {
    return asObject(value);
}
function asObject(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return {};
    }
    return value;
}
function requireString(value, name) {
    if (typeof value !== "string" || value.trim() === "") {
        throw new Error(`Missing or invalid ${name}`);
    }
    return value.trim();
}
function requireStringArray(value, name) {
    if (!Array.isArray(value) || value.length === 0) {
        throw new Error(`Missing or invalid ${name}`);
    }
    return value.map((item) => requireString(item, name));
}
function createToolResult(data) {
    const structuredContent = toJsonObject(data);
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(structuredContent, null, 2),
            },
        ],
        structuredContent,
    };
}
function toJsonObject(data) {
    return JSON.parse(JSON.stringify(data));
}
function stockCodeSchema() {
    return {
        type: "string",
        minLength: 1,
        description: "Stock code, such as SH510500, SZ000651, HK02020, or USDJI.",
    };
}
function sourceSchema() {
    return {
        type: "string",
        enum: mcpSourceNames,
        description: "Data source. Defaults to auto.",
    };
}
function isRequest(value) {
    return Boolean(value &&
        typeof value === "object" &&
        value.jsonrpc === "2.0" &&
        typeof value.method === "string");
}
function createError(id, code, message, data) {
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
function writeMessage(output, message) {
    output.write(`${JSON.stringify(message)}\n`);
}
function getErrorMessage(error) {
    return error instanceof Error ? error.message : String(error);
}
function readPackageVersion() {
    try {
        const packageJsonPath = (0, node_path_1.resolve)(__dirname, "../../package.json");
        const packageJson = JSON.parse((0, node_fs_1.readFileSync)(packageJsonPath, "utf8"));
        return typeof packageJson.version === "string" ? packageJson.version : "0.0.0";
    }
    catch {
        return "0.0.0";
    }
}
