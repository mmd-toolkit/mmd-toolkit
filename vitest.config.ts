import type { ViteUserConfig } from "vitest/config"
import { defineConfig } from "vitest/config"

const config: ViteUserConfig = defineConfig({
  test: {
    projects: [
      "packages/*",
      {
        test: {
          name: "scripts",
          include: ["scripts/**/*.test.mjs"],
        },
      },
    ],
  },
})

export default config
