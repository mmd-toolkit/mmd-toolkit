import type { ViteUserConfig } from "vitest/config"
import { defineConfig } from "vitest/config"

const config: ViteUserConfig = defineConfig({
  test: {
    name: "tests",
    include: ["tests/**/*.test.ts"],
  },
})

export default config
