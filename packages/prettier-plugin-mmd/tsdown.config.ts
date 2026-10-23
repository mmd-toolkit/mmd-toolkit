import type { UserConfig } from "tsdown"
import { defineConfig } from "tsdown"

const config: UserConfig = defineConfig({
  entry: "src/index.ts",
  outDir: "lib",
  dts: true,
  fixedExtension: true,
  platform: "neutral",
  deps: {
    neverBundle: ["prettier"],
  },
})

export default config
