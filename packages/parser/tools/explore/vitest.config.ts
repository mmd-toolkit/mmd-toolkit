import { fileURLToPath } from "node:url"
import type { ViteUserConfig } from "vitest/config"
import { defineConfig } from "vitest/config"
import packageConfig from "../../vitest.config.ts"

/**
 * The explorations, which `pnpm run explore` runs apart from the tests: the
 * files of this directory only, resolved as the tests are.
 */
const config: ViteUserConfig = defineConfig({
  root: fileURLToPath(new URL("../..", import.meta.url)),
  resolve: packageConfig.resolve,
  test: {
    name: "parser-explore",
    include: ["tools/explore/**/*.test.ts"],
  },
})

export default config
