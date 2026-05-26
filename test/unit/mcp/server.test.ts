import { handleMcpRequest } from "mcp/server";

describe("MCP server", () => {
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

    expect(response).toMatchObject({
      id: 3,
      result: {
        isError: true,
        structuredContent: {
          code: "STOCK_API_TOOL_ERROR",
          message: "Missing or invalid code",
        },
      },
    });
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
