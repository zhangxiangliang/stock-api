import fs from "node:fs";
import path from "node:path";

import { parseTencentStock } from "stocks/tencent/transforms/stock";

describe("【腾讯】原始返回解析", () => {
  it("从真实行情行解析标准股票结构", () => {
    const row = readFixture("sh510500.txt");
    const stock = parseTencentStock("SH510500", getDelimitedParams(row, "~"));

    expect(stock).toStrictEqual({
      code: "SH510500",
      name: "500ETF",
      percent: 7.224 / 7.149 - 1,
      now: 7.224,
      low: 7.085,
      high: 7.28,
      yesterday: 7.149,
    });
  });
});

function readFixture(name: string): string {
  return fs.readFileSync(
    path.join(__dirname, "../../fixtures/tencent", name),
    "utf8"
  );
}

function getDelimitedParams(row: string, delimiter: string): string[] {
  const [, value = ""] = row.split("=");
  return value.replace('"', "").split(delimiter);
}
