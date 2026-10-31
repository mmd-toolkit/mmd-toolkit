import type { ViteUserConfig } from "vitest/config"
import { defineConfig } from "vitest/config"

const config: ViteUserConfig = defineConfig({
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
