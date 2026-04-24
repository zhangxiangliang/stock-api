import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(rootDir, "status");
const timeoutMs = 60_000;

const { stocks } = await import(path.join(rootDir, "dist/index.js"));

const checks = [
  {
    id: "tencent",
    label: "tencent",
    async run() {
      const quote = await stocks.tencent.getStock("SH510500");
      assertUsableQuote(quote, "SH510500");
      const results = await stocks.tencent.searchStocks("贵州茅台");
      assertContainsCode(results, "SH600519");
    },
  },
  {
    id: "sina",
    label: "sina",
    async run() {
      const quote = await stocks.sina.getStock("SH510500");
      assertUsableQuote(quote, "SH510500");
      const results = await stocks.sina.searchStocks("格力电器");
      assertContainsCode(results, "SZ000651");
    },
  },
  {
    id: "eastmoney",
    label: "eastmoney",
    async run() {
      const quote = await stocks.eastmoney.getStock("SH600519");
      assertUsableQuote(quote, "SH600519");
      const results = await stocks.eastmoney.searchStocks("贵州茅台");
      assertContainsCode(results, "SH600519");
    },
  },
];

await fs.rm(outputDir, { recursive: true, force: true });
await fs.mkdir(outputDir, { recursive: true });

const checkedAt = new Date().toISOString();
const results = [];

for (const check of checks) {
  const startedAt = Date.now();
  try {
    await withTimeout(check.run(), timeoutMs);
    results.push({
      id: check.id,
      label: check.label,
      ok: true,
      message: "up",
      durationMs: Date.now() - startedAt,
    });
  } catch (error) {
    results.push({
      id: check.id,
      label: check.label,
      ok: false,
      message: "down",
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

for (const result of results) {
  await writeBadge(`${result.id}.json`, {
    schemaVersion: 1,
    label: result.label,
    message: result.message,
    color: result.ok ? "brightgreen" : "red",
  });
}

const upCount = results.filter((result) => result.ok).length;
await writeBadge("index.json", {
  schemaVersion: 1,
  label: "api status",
  message: `${upCount}/${results.length} up`,
  color: upCount === results.length ? "brightgreen" : upCount > 0 ? "yellow" : "red",
});

await fs.writeFile(
  path.join(outputDir, "status.json"),
  `${JSON.stringify({ checkedAt, results }, null, 2)}\n`,
);

await fs.writeFile(
  path.join(outputDir, "summary.md"),
  [
    "# stock-api status",
    "",
    `Checked at: ${checkedAt}`,
    "",
    "| Source | Status | Duration | Error |",
    "| --- | --- | ---: | --- |",
    ...results.map((result) =>
      [
        result.label,
        result.ok ? "up" : "down",
        `${result.durationMs}ms`,
        result.error ? escapeMarkdown(result.error) : "",
      ].join(" | "),
    ),
    "",
  ].join("\n"),
);

console.table(
  results.map((result) => ({
    source: result.label,
    status: result.message,
    duration: `${result.durationMs}ms`,
    error: result.error || "",
  })),
);

function assertUsableQuote(quote, code) {
  if (!quote || quote.code !== code || !quote.name || quote.name === "---") {
    throw new Error(`Invalid quote for ${code}`);
  }
}

function assertContainsCode(results, code) {
  if (!Array.isArray(results) || !results.some((item) => item.code === code)) {
    throw new Error(`Search result missing ${code}`);
  }
}

function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms);
  });

  return Promise.race([promise, timeout]).finally(() => {
    clearTimeout(timer);
  });
}

async function writeBadge(name, payload) {
  await fs.writeFile(path.join(outputDir, name), `${JSON.stringify(payload)}\n`);
}

function escapeMarkdown(value) {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}
