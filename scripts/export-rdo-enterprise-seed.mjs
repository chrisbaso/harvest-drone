import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import {
  buildRdoEnterpriseSeed,
  validateEnterpriseSeed,
} from "../shared/enterpriseSeed.js";

const outputPath = resolve("output/rdo-enterprise-demo-seed.json");
const seed = buildRdoEnterpriseSeed();
const validation = validateEnterpriseSeed(seed);

if (!validation.valid) {
  console.error("RDO enterprise seed validation failed:");
  validation.errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(seed, null, 2)}\n`);

console.log(`Wrote ${outputPath}`);
