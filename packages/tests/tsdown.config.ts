import type { UserConfig } from "tsdown"
import { defineConfig } from "tsdown"

const config: UserConfig = defineConfig({
  entry: ["src/index.ts", "src/mermaid.ts", "src/mutation.ts"],
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
