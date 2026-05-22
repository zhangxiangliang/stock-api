import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { build } from "esbuild";

const root = resolve(import.meta.dirname, "..");
const entryPoint = resolve(root, "src/index.ts");
const outdir = resolve(root, "dist/browser");
const commonOptions = {
  bundle: true,
  entryPoints: [entryPoint],
  platform: "browser",
  sourcemap: true,
  target: "es2020",
};

await mkdir(outdir, { recursive: true });

await Promise.all([
  build({
    ...commonOptions,
    format: "iife",
    globalName: "StockApi",
    outfile: resolve(outdir, "stock-api.iife.js"),
  }),
  build({
    ...commonOptions,
    format: "iife",
    globalName: "StockApi",
    minify: true,
    outfile: resolve(outdir, "stock-api.iife.min.js"),
  }),
  build({
    ...commonOptions,
    format: "esm",
    outfile: resolve(outdir, "stock-api.esm.mjs"),
  }),
  build({
    ...commonOptions,
    format: "esm",
    minify: true,
    outfile: resolve(outdir, "stock-api.esm.min.mjs"),
  }),
]);
