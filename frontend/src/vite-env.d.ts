/// <reference types="vite/client" />

// pdfjs-dist ships its types from the package root ("pdfjs-dist"), but the
// deep "legacy/build/pdf" entry used by some pages has no bundled declaration.
// It is the same runtime API, so re-point it at the package's own types.
declare module "pdfjs-dist/legacy/build/pdf" {
  export * from "pdfjs-dist";
}
