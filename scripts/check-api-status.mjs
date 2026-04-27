import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(rootDir, "status");
const attemptTimeoutMs = 30_000;
const maxAttempts = 3;

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
    await retryCheck(() => withTimeout(check.run(), attemptTimeoutMs), maxAttempts);
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
  const badge = {
    schemaVersion: 1,
    label: result.label,
    message: result.message,
    color: result.ok ? "brightgreen" : "red",
  };
  const zhBadge = {
    schemaVersion: 1,
    label: getChineseLabel(result.id),
    message: result.ok ? "可用" : "不可用",
    color: result.ok ? "brightgreen" : "red",
  };

  await writeBadge(`${result.id}.json`, badge);
  await writeBadge(`${result.id}.zh-CN.json`, zhBadge);
  await writeSvgBadge(`${result.id}.svg`, badge);
  await writeSvgBadge(`${result.id}.zh-CN.svg`, zhBadge);
}

const upCount = results.filter((result) => result.ok).length;
const statusBadge = {
  schemaVersion: 1,
  label: "api status",
  message: `${upCount}/${results.length} up`,
  color: upCount === results.length ? "brightgreen" : upCount > 0 ? "yellow" : "red",
};
const zhStatusBadge = {
  schemaVersion: 1,
  label: "接口状态",
  message: `${upCount}/${results.length} 可用`,
  color: upCount === results.length ? "brightgreen" : upCount > 0 ? "yellow" : "red",
};

await writeBadge("index.json", statusBadge);
await writeBadge("index.zh-CN.json", zhStatusBadge);
await writeSvgBadge("index.svg", statusBadge);
await writeSvgBadge("index.zh-CN.svg", zhStatusBadge);

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

async function retryCheck(run, attempts) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await run();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await sleep(1_000 * attempt);
      }
    }
  }

  throw lastError;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function writeBadge(name, payload) {
  await fs.writeFile(path.join(outputDir, name), `${JSON.stringify(payload)}\n`);
}

async function writeSvgBadge(name, payload) {
  await fs.writeFile(path.join(outputDir, name), createSvgBadge(payload));
}

function createSvgBadge(payload) {
  const labelWidth = calcTextWidth(payload.label);
  const messageWidth = calcTextWidth(payload.message);
  const width = labelWidth + messageWidth;
  const color = getBadgeColor(payload.color);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="20" role="img" aria-label="${escapeXml(payload.label)}: ${escapeXml(payload.message)}">
  <title>${escapeXml(payload.label)}: ${escapeXml(payload.message)}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r"><rect width="${width}" height="20" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="20" fill="#555"/>
    <rect x="${labelWidth}" width="${messageWidth}" height="20" fill="${color}"/>
    <rect width="${width}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="110">
    <text aria-hidden="true" x="${labelWidth * 5}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)">${escapeXml(payload.label)}</text>
    <text x="${labelWidth * 5}" y="140" transform="scale(.1)" fill="#fff">${escapeXml(payload.label)}</text>
    <text aria-hidden="true" x="${labelWidth * 10 + messageWidth * 5}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)">${escapeXml(payload.message)}</text>
    <text x="${labelWidth * 10 + messageWidth * 5}" y="140" transform="scale(.1)" fill="#fff">${escapeXml(payload.message)}</text>
  </g>
</svg>
`;
}

function calcTextWidth(text) {
  const asciiCount = Array.from(text).filter((char) => char.charCodeAt(0) <= 0x7f).length;
  const wideCount = Array.from(text).length - asciiCount;

  return Math.max(40, asciiCount * 7 + wideCount * 13 + 10);
}

function getBadgeColor(color) {
  const colors = {
    brightgreen: "#4c1",
    green: "#97ca00",
    yellow: "#dfb317",
    orange: "#fe7d37",
    red: "#e05d44",
  };

  return colors[color] || color || "#9f9f9f";
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeMarkdown(value) {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function getChineseLabel(id) {
  const labels = {
    tencent: "腾讯",
    sina: "新浪",
    eastmoney: "东方财富",
  };

  return labels[id] || id;
}
