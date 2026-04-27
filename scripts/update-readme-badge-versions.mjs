import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const version = process.argv[2] || new Date().toISOString().replace(/\D/g, "").slice(0, 12);
const readmeFiles = ["README.md", "README.EN.md"];
const badgeUrlPattern =
  /(https:\/\/img\.shields\.io\/endpoint\?url=https%3A%2F%2Fraw\.githubusercontent\.com%2Fzhangxiangliang%2Fstock-api%2Fapi-status%2F(?:index|tencent|sina|eastmoney)(?:\.zh-CN)?\.json(?:&cacheSeconds=\d+)?)(?:&v=[0-9A-Za-z._-]+)?/g;

for (const file of readmeFiles) {
  const filePath = path.join(rootDir, file);
  const content = await fs.readFile(filePath, "utf8");
  const nextContent = content.replace(badgeUrlPattern, `$1&v=${version}`);

  if (nextContent !== content) {
    await fs.writeFile(filePath, nextContent);
  }
}
