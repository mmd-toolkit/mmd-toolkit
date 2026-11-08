import type { UserConfig } from "tsdown"
import { defineConfig } from "tsdown"

const config: UserConfig = defineConfig({
  entry: "src/cli.ts",
  outDir: "lib",
  // A command-line tool: it exports nothing, so it has no declarations.
  dts: false,
  fixedExtension: true,
  platform: "node",
})

export default config
