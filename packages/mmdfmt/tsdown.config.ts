import type { UserConfig } from "tsdown"
import { defineConfig } from "tsdown"

const config: UserConfig = defineConfig({
  entry: ["src/index.ts", "src/cli.ts"],
  outDir: "lib",
  // The entry of the package, which exports `format`, and the command. Both get
  // a declaration file; the command's is empty, since it exports nothing.
  dts: true,
  fixedExtension: true,
  platform: "node",
})

export default config
