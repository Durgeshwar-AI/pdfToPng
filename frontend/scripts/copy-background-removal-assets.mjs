import { cp, mkdir, readFile, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const frontendRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = join(
  frontendRoot,
  "node_modules",
  "@imgly",
  "background-removal-data",
  "dist",
);
const targetRoot = join(frontendRoot, "public", "background-removal");
const manifest = JSON.parse(
  await readFile(join(sourceRoot, "resources.json"), "utf8"),
);
const resourceNames = [
  "/models/medium",
  "/onnxruntime-web/ort-wasm.wasm",
  "/onnxruntime-web/ort-wasm-simd.wasm",
  "/onnxruntime-web/ort-wasm-threaded.wasm",
  "/onnxruntime-web/ort-wasm-simd-threaded.wasm",
];
const hashes = new Set();
const outputManifest = {};

for (const resourceName of resourceNames) {
  const resource = manifest[resourceName];
  if (!resource) {
    throw new Error(`Missing background-removal resource: ${resourceName}`);
  }

  outputManifest[resourceName] = resource;
  for (const chunk of resource.chunks) {
    hashes.add(chunk.hash);
  }
}

await rm(targetRoot, { recursive: true, force: true });
await mkdir(targetRoot, { recursive: true });
await Promise.all(
  [...hashes].map((hash) =>
    cp(join(sourceRoot, hash), join(targetRoot, hash)),
  ),
);
await import("node:fs/promises").then(({ writeFile }) =>
  writeFile(
    join(targetRoot, "resources.json"),
    `${JSON.stringify(outputManifest, null, 2)}\n`,
    "utf8",
  ),
);
