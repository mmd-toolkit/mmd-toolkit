/** Joining comment regions keep their raw columns inside structural statements. */
import { describe, expect, it } from "vitest"
import { parse } from "@mmd-toolkit/parser"
import { createSource } from "../src/printers/source.ts"
import { dbOfText, defaultEmbedded } from "./db-reading.ts"
import { formatMermaid } from "./helpers.ts"

describe("structural trivia boundaries", () => {
  it.each([
    {
      name: "er/attribute-spacing/comment-region-continuation-kept",
      input: "erDiagram\nA {\nint\u2028%% c\n a\n}\n",
      output: "erDiagram\n  A {\n    int\u2028%% c\n a\n  }\n",
    },
    {
      name: "requirement/relationship-spacing/comment-region-continuation-kept",
      input: "requirementDiagram\na - satisfies \u2029%% c\n -> b\n",
      output: "requirementDiagram\n  a - satisfies \u2029%% c\n -> b\n",
    },
    {
      name: "xychart/multi-line-statements/bare-title-comment-region-kept",
      input: "xychart\ntitle A \u2028%% c\n B\n",
      output: "xychart\n  title A \u2028%% c\n B\n",
    },
  ])("$name", async ({ input, output }) => {
    const source = createSource(input, parse(input))
    expect(source.joiningRegions).toHaveLength(1)
    expect(source.joiningRegions[0].hasTextAfter).toBe(true)
    expect(await formatMermaid(input)).toBe(output)
    expect(await formatMermaid(output)).toBe(output)
    const embedded = defaultEmbedded()
    expect(dbOfText(output, embedded)).toEqual(dbOfText(input, embedded))
  })
})
