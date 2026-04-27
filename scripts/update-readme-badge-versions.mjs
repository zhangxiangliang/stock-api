import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const version = process.argv[2] || new Date().toISOString().replace(/\D/g, "").slice(0, 12);
const readmeFiles = ["README.md", "README.EN.md"];

for (const file of readmeFiles) {
  const filePath = path.join(rootDir, file);
  const content = await fs.readFile(filePath, "utf8");
  const nextContent = content.replace(
    /(https:\/\/raw\.githubusercontent\.com\/zhangxiangliang\/stock-api\/api-status\/(?:index|tencent|sina|eastmoney)(?:\.zh-CN)?\.svg)(?:\?v=[0-9A-Za-z._-]+)?/g,
    `$1?v=${version}`,
  );

  if (nextContent !== content) {
    await fs.writeFile(filePath, nextContent);
  }
}
