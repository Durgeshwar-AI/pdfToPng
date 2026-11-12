import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const frontendRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = join(frontendRoot, "node_modules", "@imgly", "background-removal-data", "dist");
const targetRoot = join(frontendRoot, "public", "background-removal");

await rm(targetRoot, { recursive: true, force: true });
await mkdir(targetRoot, { recursive: true });
await cp(sourceRoot, targetRoot, { recursive: true });
