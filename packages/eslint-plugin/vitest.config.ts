import type { ViteUserConfig } from "vitest/config"
import { defineConfig } from "vitest/config"

const config: ViteUserConfig = defineConfig({
  resolve: {
    // Test against the sources of the workspace packages through the root
    // tsconfig `paths`, so that the tests do not depend on stale builds.
    // The tests that render rule documents are the exception: Prettier loads
    // the plugin for Mermaid natively, through `docs/prettier.config.js`,
    // outside Vite's resolution, so they read the built parser
    // (`pnpm run build:parser`).
    tsconfigPaths: true,
  },
  test: {
    name: "@mmd-toolkit/eslint-plugin",
    include: ["tests/**/*.test.ts"],
    // eslint-snapshot-rule-tester registers `describe`, `it`, and `afterAll`
    // through the globals of the test framework.
    globals: true,
    setupFiles: ["tests/setup.ts"],
  },
})

export default config
