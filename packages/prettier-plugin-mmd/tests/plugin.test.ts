import * as prettier from "prettier"
import { describe, expect, it } from "vitest"
import plugin, { languages } from "../src/index.ts"
import { parseDocument } from "../src/parser.ts"

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

  it("provides node ranges for Prettier's partial formatting", async () => {
    const input = "flowchart TD\nA-->B\n"
    const options = {
      filepath: "diagram.mmd",
      plugins: [plugin],
      rangeStart: 14,
      rangeEnd: 17,
    }
    const output = await prettier.format(input, options)
    expect(output).toBe(input)
    expect(await prettier.format(output, options)).toBe(output)
  })

  it.each([
    ["pie\r\nfoo", { line: 2, column: 1 }],
    ['pie\r\n"a" : x\r\n', { line: 2, column: 7 }],
    ["flowchart TD\r\nA-->\r\n", { line: 3, column: 1 }],
    ["pie\rfoo", { line: 2, column: 1 }],
  ])(
    "counts a CRLF or a CR as one line end in the position of an error in %j",
    (text, start) => {
      let loc: unknown
      try {
        parseDocument(text)
      } catch (error) {
        loc = (error as { loc?: { start?: unknown } }).loc?.start
      }
      expect(loc).toEqual(start)
    },
  )

  it.each(["diagram.mmd", "diagram.mermaid", "DIAGRAM.MMD"])(
    "infers the mermaid parser from the file name %s",
    async (file) => {
      const info = await prettier.getFileInfo(file, { plugins: [plugin] })
      expect(info.inferredParser).toBe("mermaid")
    },
  )
})
