import { createReadStream, existsSync, mkdirSync, copyFileSync } from "node:fs";
import { extname, join, normalize, relative, resolve } from "node:path";
import { createServer } from "node:http";
import { spawnSync } from "node:child_process";

const port = Number(process.env.PORT || 4173);
const root = resolve("examples");
const defaultExample = "stock-api-web-example";
const vendorDir = join(root, defaultExample, "vendor");
const bundle = resolve("dist/browser/stock-api.iife.min.js");
const bundleMap = resolve("dist/browser/stock-api.iife.min.js.map");
const targetBundle = join(vendorDir, "stock-api.iife.min.js");
const targetBundleMap = join(vendorDir, "stock-api.iife.min.js.map");

run("npm", ["run", "build:browser"]);
mkdirSync(vendorDir, { recursive: true });
copyFileSync(bundle, targetBundle);
copyFileSync(bundleMap, targetBundleMap);

const server = createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url || "/", `http://127.0.0.1:${port}`).pathname);
  const filePath = resolve(root, pathname.endsWith("/") ? `.${pathname}index.html` : `.${pathname}`);

  if (!isInsideRoot(filePath) || !existsSync(filePath)) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, { "content-type": getContentType(filePath) });
  createReadStream(filePath).pipe(response);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Examples: http://127.0.0.1:${port}/`);
  console.log(`Web example: http://127.0.0.1:${port}/${defaultExample}/`);
});

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit", shell: process.platform === "win32" });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function isInsideRoot(filePath) {
  const path = relative(root, normalize(filePath));
  return path && !path.startsWith("..") && !path.includes("..");
}

function getContentType(filePath) {
  const types = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".map": "application/json; charset=utf-8",
  };

  return types[extname(filePath)] || "application/octet-stream";
}
