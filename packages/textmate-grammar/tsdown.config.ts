import { mkdirSync, writeFileSync } from "node:fs"
import type { UserConfig } from "tsdown"
import { defineConfig } from "tsdown"
import { createGrammar } from "./src/grammar.ts"

const config: UserConfig = defineConfig({
  entry: "src/index.ts",
  outDir: "lib",
  dts: true,
  fixedExtension: true,
  platform: "neutral",
  hooks: {
    /**
     * Writes the grammar as a TextMate grammar file, for the hosts other than
     * Shiki, after the build has cleaned lib.
     */
    "build:before"(): void {
      const output = new URL("./lib/", import.meta.url)
      mkdirSync(output, { recursive: true })
      writeFileSync(
        new URL("mermaid.tmLanguage.json", output),
        `${JSON.stringify(createGrammar(), null, 2)}\n`,
      )
    },
  },
})

export default config
