import type { ViteUserConfig } from "vitest/config"
import { defineConfig } from "vitest/config"

const config: ViteUserConfig = defineConfig({
  resolve: {
    // Test against the sources of the workspace packages through the root
    // tsconfig `paths`, so that the tests do not depend on stale builds.
    tsconfigPaths: true,
  },
  test: {
    name: "parser",
    include: ["tests/**/*.test.ts"],
    // A missing `ast.json` or `parse-error.json` fails the fixture test
    // instead of being written: the records are written only when asked for,
    // by `pnpm run test:record` or `pnpm run test:update`.
    update: "none",
  },
})

export default config
