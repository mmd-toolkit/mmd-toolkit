import * as prettier from "prettier"
import { describe, expect, it } from "vitest"
import plugin, { languages } from "../src/index.ts"

describe("prettier-plugin-mmd", () => {
  it("declares the Mermaid language for .mmd files and markdown code blocks", () => {
    const [language] = languages
    expect(language.parsers).toEqual(["mermaid"])
    expect(language.extensions).toEqual([".mmd", ".mermaid"])
    expect(language.aliases).toEqual(["mermaid", "mmd"])
  })

  it("exposes a parser and a printer with the same astFormat", () => {
    const parser = plugin.parsers?.mermaid
    expect(parser?.astFormat).toBe("mermaid")
    expect(plugin.printers?.[parser?.astFormat ?? ""]).toBeDefined()
  })

  it.each(["diagram.mmd", "diagram.mermaid", "DIAGRAM.MMD"])(
    "infers the mermaid parser from the file name %s",
    async (file) => {
      const info = await prettier.getFileInfo(file, { plugins: [plugin] })
      expect(info.inferredParser).toBe("mermaid")
    },
  )
})
