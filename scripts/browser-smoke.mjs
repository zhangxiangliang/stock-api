import { createServer } from "node:http";
import { access, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tempDir = await mkdtemp(join(tmpdir(), "stock-api-browser-"));

try {
  await createBrowserPage();
  const server = await startServer(tempDir);
  const port = server.address().port;

  try {
    const results = await runBrowser(`http://127.0.0.1:${port}/`);
    assertBrowserResults(results);
    console.log(formatResults(results));
  } finally {
    await new Promise((resolveClose) => server.close(resolveClose));
  }
} finally {
  await rm(tempDir, { force: true, recursive: true });
}

async function createBrowserPage() {
  const html = join(tempDir, "index.html");
  const browserBundle = await readFile(
    resolve(root, "dist/browser/stock-api.iife.min.js"),
    "utf8"
  );
  const esmBundle = await readFile(
    resolve(root, "dist/browser/stock-api.esm.mjs"),
    "utf8"
  );

  await writeFile(
    join(tempDir, "stock-api.iife.min.js"),
    browserBundle
  );
  await writeFile(join(tempDir, "stock-api.esm.mjs"), esmBundle);

  await writeFile(
    html,
    `
      <!doctype html>
      <html>
        <head><meta charset="utf-8"><title>stock-api browser smoke</title></head>
        <body>
          <pre id="output">pending</pre>
          <script src="./stock-api.iife.min.js"></script>
          <script type="module">
            const { stocks: iifeStocks } = globalThis.StockApi;
            const { stocks: esmStocks } = await import("./stock-api.esm.mjs");

            async function runCase(name, fn) {
              try {
                return { name, ok: true, value: await fn() };
              } catch (error) {
                return {
                  name,
                  ok: false,
                  error: error instanceof Error ? error.message : String(error),
                };
              }
            }

            Promise.all([
              runCase("iife.auto.getStock", () => iifeStocks.auto.getStock("SH510500")),
              runCase("iife.tencent.getStock", () => iifeStocks.tencent.getStock("SH510500")),
              runCase("iife.sina.getStock", () => iifeStocks.sina.getStock("SH510500")),
              runCase("iife.eastmoney.getStock", () => iifeStocks.eastmoney.getStock("SH600519")),
              runCase("iife.auto.searchStocks", () => iifeStocks.auto.searchStocks("格力电器")),
              runCase("iife.auto.getKlines", () => iifeStocks.auto.getKlines("SH600519", { count: 3 })),
              runCase("iife.tencent.searchStocks", () => iifeStocks.tencent.searchStocks("格力电器")),
              runCase("iife.sina.searchStocks", () => iifeStocks.sina.searchStocks("格力电器")),
              runCase("iife.eastmoney.searchStocks", () => iifeStocks.eastmoney.searchStocks("贵州茅台")),
              runCase("esm.auto.getStock", () => esmStocks.auto.getStock("SH510500")),
              runCase("esm.getProviderCapabilities", async () => esmStocks.getProviderCapabilities()),
            ])
              .then((results) => {
                document.getElementById("output").textContent = JSON.stringify(results, null, 2);
              })
              .catch((error) => {
                document.getElementById("output").textContent = JSON.stringify([{
                  name: "browser-smoke",
                  ok: false,
                  error: String(error && error.stack || error)
                }], null, 2);
              });
          </script>
        </body>
      </html>
    `
  );
}

async function startServer(directory) {
  const contentTypes = new Map([
    [".html", "text/html; charset=utf-8"],
    [".js", "text/javascript; charset=utf-8"],
    [".mjs", "text/javascript; charset=utf-8"],
  ]);

  const server = createServer(async (req, res) => {
    const pathname = new URL(req.url || "/", "http://127.0.0.1").pathname;
    const file = pathname === "/" ? "index.html" : pathname.slice(1);

    try {
      const body = await readFile(join(directory, file));
      res.writeHead(200, {
        "content-type": contentTypes.get(extname(file)) || "text/plain",
      });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end("not found");
    }
  });

  await new Promise((resolveListen) => server.listen(0, "127.0.0.1", resolveListen));
  return server;
}

async function runBrowser(url) {
  const browser = await launchBrowser();
  const page = await browser.newPage();

  try {
    await page.goto(url);
    await page.waitForFunction(
      'document.getElementById("output")?.textContent !== "pending"',
      { timeout: 45000 }
    );

    const text = await page.locator("#output").textContent();
    return JSON.parse(text || "[]");
  } finally {
    await browser.close();
  }
}

async function launchBrowser() {
  try {
    return await chromium.launch({ headless: true });
  } catch (error) {
    const executablePath = await findSystemChrome();

    if (!executablePath) {
      throw error;
    }

    return chromium.launch({
      executablePath,
      headless: true,
    });
  }
}

async function findSystemChrome() {
  const candidates = [
    process.env.STOCK_API_BROWSER_EXECUTABLE,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Try the next browser path.
    }
  }

  return "";
}

function assertBrowserResults(results) {
  const resultMap = new Map(results.map((result) => [result.name, result]));
  const supportedCases = [
    "iife.auto.getStock",
    "iife.tencent.getStock",
    "iife.eastmoney.getStock",
    "iife.auto.searchStocks",
    "iife.auto.getKlines",
    "iife.tencent.searchStocks",
    "iife.eastmoney.searchStocks",
    "esm.auto.getStock",
    "esm.getProviderCapabilities",
  ];
  const unsupportedCases = ["iife.sina.getStock", "iife.sina.searchStocks"];
  const failures = [];

  for (const name of supportedCases) {
    const result = resultMap.get(name);

    if (!result?.ok) {
      failures.push(`${name} expected ok, got ${result?.error || "missing result"}`);
    }
  }

  for (const name of unsupportedCases) {
    const result = resultMap.get(name);

    if (result?.ok || !result?.error?.includes("sina")) {
      failures.push(`${name} expected documented Sina browser failure`);
    }
  }

  if (failures.length > 0) {
    throw new Error(`Browser smoke failed:\n${failures.join("\n")}`);
  }
}

function formatResults(results) {
  return results
    .map((result) => {
      if (!result.ok) {
        return `browser ${result.name}: expected failure (${result.error})`;
      }

      const value = Array.isArray(result.value) ? result.value[0] : result.value;
      return `browser ${result.name}: ok (${value?.code || "n/a"} ${value?.name || ""})`;
    })
    .join("\n");
}
