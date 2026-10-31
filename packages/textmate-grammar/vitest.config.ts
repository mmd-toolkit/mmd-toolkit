import { fileURLToPath } from "node:url"
import type { ViteUserConfig } from "vitest/config"
import { defineConfig } from "vitest/config"

const config: ViteUserConfig = defineConfig({
  resolve: {
    // Read the corpus with the sources of @mmd-toolkit/tests, as the root
    // tsconfig `paths` do, so that the tests do not depend on its build.
    alias: [
      {
        find: "@mmd-toolkit/tests",
        replacement: fileURLToPath(
          new URL("../tests/src/index.ts", import.meta.url),
        ),
      },
    ],
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
