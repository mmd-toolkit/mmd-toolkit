import type { ViteUserConfig } from "vitest/config"
import { defineConfig } from "vitest/config"

const config: ViteUserConfig = defineConfig({
  resolve: {
    // Test against the sources of the workspace packages through the root
    // tsconfig `paths`, so that the tests do not depend on stale builds.
    tsconfigPaths: true,
  },
  test: {
    name: "prettier-plugin-mmd",
    include: ["tests/**/*.test.ts"],
    // The limit of a test, in milliseconds, is a limit on a hang. The fixtures
    // of `default-size-branches` and the corpus inputs of the same size hold
    // 50,000 characters, and a test of them takes one to three seconds here
    // and up to 4.6 times that on a slow runner of the CI (5.1 seconds on
    // Windows with Node.js 24, against the five seconds of vitest's default),
    // so the default fails a slow runner and not the printer.
    testTimeout: 30_000,
  },
})

export default config
