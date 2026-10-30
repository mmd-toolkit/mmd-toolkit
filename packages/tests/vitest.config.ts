import type { ViteUserConfig } from "vitest/config"
import { defineConfig } from "vitest/config"

const config: ViteUserConfig = defineConfig({
  test: {
    name: "tests",
    include: ["tests/**/*.test.ts"],
    // These tests check how `runMermaid()` runs mermaid.js, so they do not
    // take results from the store of earlier results; the tests of the store
    // turn it on where they need it.
    env: { MMD_TOOLKIT_MERMAID_CACHE: "disabled" },
  },
})

export default config
