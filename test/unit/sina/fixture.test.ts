import fs from "node:fs";
import path from "node:path";

import { parseSinaStock } from "stocks/sina/transforms/stock";

describe("【新浪】原始返回解析", () => {
  it("保留集合竞价阶段的真实 0 值", () => {
    const row = readFixture("sh510500-auction.txt");
    const stock = parseSinaStock("SH510500", getDelimitedParams(row, ","));

    expect(stock).toStrictEqual({
      code: "SH510500",
      name: "中证500ETF南方",
      percent: 0,
      now: 0,
      low: 0,
      high: 0,
      yesterday: 8.375,
    });
  });
});

function readFixture(name: string): string {
  return fs.readFileSync(
    path.join(__dirname, "../../fixtures/sina", name),
    "utf8"
  );
}

function getDelimitedParams(row: string, delimiter: string): string[] {
  const [, value = ""] = row.split("=");
  return value.replace('"', "").split(delimiter);
}
