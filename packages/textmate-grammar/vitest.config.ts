import type { ViteUserConfig } from "vitest/config"
import { defineConfig } from "vitest/config"

const config: ViteUserConfig = defineConfig({
  resolve: {
    // Read the corpus with the sources of @mmd-toolkit/tests through the root
    // tsconfig `paths`, so that the tests do not depend on its build.
    tsconfigPaths: true,
  },
  test: {
    name: "textmate-grammar",
    include: ["tests/**/*.test.ts"],
    // A missing or different `.tokens` record fails the test instead of being
    // written: the records are written only when asked for, by
    // `pnpm run test:update`.
    update: "none",
  },
})

export default config
