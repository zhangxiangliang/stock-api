import { createReadStream, existsSync } from "node:fs";
import { extname, normalize, relative, resolve } from "node:path";
import { createServer } from "node:http";

const port = Number(process.env.PORT || 4173);
const root = resolve("examples");
const defaultExample = "web-demo";

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
