import { handleMcpRequest } from "mcp/server";
import { stocks } from "index";

type McpTextContent = {
  type: "text";
  text: string;
};

type McpToolResult = {
  content: McpTextContent[];
  structuredContent: Record<string, unknown>;
  isError?: boolean;
};

describe("MCP server", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns server capabilities on initialize", async () => {
    await expect(
      handleMcpRequest({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
      })
    ).resolves.toMatchObject({
      id: 1,
      result: {
        capabilities: {
          tools: {},
        },
        serverInfo: {
          name: "stock-api",
        },
      },
    });
  });

  it("lists stock tools", async () => {
    const response = await handleMcpRequest({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list",
    });

    expect(response).toMatchObject({
      id: 2,
      result: {
        tools: expect.arrayContaining([
          expect.objectContaining({ name: "get_stock" }),
          expect.objectContaining({ name: "get_stocks" }),
          expect.objectContaining({ name: "get_klines" }),
          expect.objectContaining({ name: "search_stocks" }),
          expect.objectContaining({ name: "inspect_stock" }),
        ]),
      },
    });
  });

  it("returns tool errors as MCP tool results", async () => {
    const response = await handleMcpRequest({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "get_stock",
        arguments: {},
      },
    });

    const result = expectMcpToolResult(response);

    expect(response).toMatchObject({ id: 3 });
    expect(result).toMatchObject({
      isError: true,
      structuredContent: {
        input: {
          arguments: {},
          tool: "get_stock",
        },
        response: {
          code: "STOCK_API_TOOL_ERROR",
          message: "Missing or invalid code",
        },
      },
    });
  });

  it.each([
    {
      name: "get_stock",
      args: { code: "SH510500" },
      setup: () => {
        jest.spyOn(stocks.auto, "getStock").mockResolvedValueOnce(stockFixture);
      },
      expected: {
        input: {
          code: "SH510500",
          source: "auto",
        },
        response: {
          stock: expect.objectContaining({
            code: "SH510500",
            name: "中证500ETF南方",
          }),
        },
      },
    },
    {
      name: "get_stocks",
      args: { codes: ["SH510500", "SZ000651"] },
      setup: () => {
        jest
          .spyOn(stocks.auto, "getStocks")
          .mockResolvedValueOnce([stockFixture, stockFixture2]);
      },
      expected: {
        input: {
          codes: ["SH510500", "SZ000651"],
          source: "auto",
        },
        response: {
          count: 2,
          stocks: [
            expect.objectContaining({ code: "SH510500" }),
            expect.objectContaining({ code: "SZ000651" }),
          ],
        },
      },
    },
    {
      name: "get_klines",
      args: { code: "SH510500", count: 1, period: "day" },
      setup: () => {
        jest.spyOn(stocks.auto, "getKlines").mockResolvedValueOnce([klineFixture]);
      },
      expected: {
        input: {
          code: "SH510500",
          count: 1,
          period: "day",
          source: "auto",
        },
        response: {
          count: 1,
          klines: [
            expect.objectContaining({
              close: 10,
              date: "2026-05-26",
            }),
          ],
        },
      },
    },
    {
      name: "search_stocks",
      args: { query: "格力电器" },
      setup: () => {
        jest.spyOn(stocks.auto, "searchStocks").mockResolvedValueOnce([stockFixture2]);
      },
      expected: {
        input: {
          query: "格力电器",
          source: "auto",
        },
        response: {
          count: 1,
          stocks: [expect.objectContaining({ code: "SZ000651" })],
        },
      },
    },
    {
      name: "inspect_stock",
      args: { code: "SH510500" },
      setup: () => {
        jest.spyOn(stocks.auto, "inspectStock").mockResolvedValueOnce({
          code: "SH510500",
          source: "tencent",
          stock: stockFixture,
          sources: [
            {
              code: "SH510500",
              source: "tencent",
              status: "success",
              stock: stockFixture,
            },
          ],
        });
      },
      expected: {
        input: {
          code: "SH510500",
          source: "auto",
        },
        response: {
          inspection: expect.objectContaining({
            code: "SH510500",
            source: "tencent",
          }),
        },
      },
    },
  ])("returns MCP-compatible content for $name", async ({ name, args, setup, expected }) => {
    setup();

    const response = await handleMcpRequest({
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: {
        name,
        arguments: args,
      },
    });

    expect(response).toMatchObject({ id: 4 });
    const result = expectMcpToolResult(response);
    expect(result.structuredContent).toMatchObject(expected);
  });

  it("ignores initialized notifications", async () => {
    await expect(
      handleMcpRequest({
        jsonrpc: "2.0",
        method: "notifications/initialized",
      })
    ).resolves.toBeUndefined();
  });
});

const stockFixture = {
  code: "SH510500",
  high: 8.8,
  low: 8.6,
  name: "中证500ETF南方",
  now: 8.7,
  percent: 0.01,
  source: "tencent" as const,
  yesterday: 8.61,
};

const stockFixture2 = {
  code: "SZ000651",
  high: 39.12,
  low: 38.4,
  name: "格力电器",
  now: 38.98,
  percent: 0.006,
  source: "tencent" as const,
  yesterday: 38.74,
};

const klineFixture = {
  close: 10,
  date: "2026-05-26",
  high: 11,
  low: 9,
  open: 9.5,
  source: "tencent" as const,
};

function expectMcpToolResult(
  response: Awaited<ReturnType<typeof handleMcpRequest>>
): McpToolResult {
  expect(response).toBeDefined();
  expect(response?.error).toBeUndefined();
  expect(response?.result).toEqual(
    expect.objectContaining({
      content: [
        expect.objectContaining({
          text: expect.any(String),
          type: "text",
        }),
      ],
      structuredContent: expect.any(Object),
    })
  );

  const result = response?.result as McpToolResult;
  expect(Array.isArray(result.structuredContent)).toBe(false);
  expect(JSON.parse(result.content[0]?.text || "")).toEqual(result.structuredContent);

  return result;
}
