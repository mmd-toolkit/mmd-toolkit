import type { UserConfig } from "tsdown"
import { defineConfig } from "tsdown"

const config: UserConfig = defineConfig({
  // `src/mermaid-run-store.ts` is an entry of its own so that the process that
  // prunes the store loads it from the build (see `STORE_MODULE_URL`).
  entry: ["src/index.ts", "src/mermaid.ts", "src/mermaid-run-store.ts"],
  outDir: "lib",
  dts: true,
  fixedExtension: true,
  platform: "node",
  deps: {
    // Resolved at run time from this package's node_modules: mermaid has to
    // be the pinned copy, and its DOMPurify is patched by module identity.
    neverBundle: ["mermaid", "js-yaml"],
  },
})

export default config
