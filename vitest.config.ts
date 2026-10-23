import type { ViteUserConfig } from "vitest/config"
import { defineConfig } from "vitest/config"

const config: ViteUserConfig = defineConfig({
  test: {
    projects: ["packages/*"],
  },
})

export default config
