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
  },
})

export default config
