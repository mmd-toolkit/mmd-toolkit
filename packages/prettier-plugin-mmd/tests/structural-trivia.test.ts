/**
 * Joining comment regions keep their raw columns inside structural statements,
 * also in a mindmap; an eventmodeling diagram prints the separator before the
 * comment line as a space and the line after it one level deeper
 * (docs/compatibility.md, A comment line after U+2028 or U+2029).
 */
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
      name: "er/attribute-spacing/comment-region-keeps-the-whole-attribute",
      input: "erDiagram\nA {\nint\n%% ordinary\n a\u2028%% joined\n PK\n}\n",
      output:
        "erDiagram\n  A {\n    int\n%% ordinary\n a\u2028%% joined\n PK\n  }\n",
    },
    {
      name: "block/shapes/comment-region-keeps-the-directions-of-a-block-arrow",
      input: 'block-beta\na<["x"]>(right,\u2028%% c\n   down)\n',
      output: 'block-beta\n  a<["x"]>(right,\u2028%% c\n   down)\n',
    },
    {
      name: "er/accessibility-statements/comment-region-keeps-the-text-line",
      input: "erDiagram\naccTitle:\u2028%% c\n   T\n",
      output: "erDiagram\n  accTitle:\u2028%% c\n   T\n",
    },
    {
      name: "block/indentation/comment-region-keeps-a-joined-statement-line",
      input: "block-beta\nA\u2028%% c\n   B\n",
      output: "block-beta\n  A\u2028%% c\n   B\n",
    },
    {
      name: "block/indentation/comment-region-keeps-a-joined-line-in-a-composite",
      input: "block-beta\nblock:G\nA\u2028%% c\n   B\nend\n",
      output: "block-beta\n  block: G\n    A\u2028%% c\n   B\n  end\n",
    },
    {
      name: "er/indentation/comment-region-keeps-a-joined-statement-line",
      input: "erDiagram\nA ||--o{ B : x\u2028%% c\n   C ||--o{ D : y\n",
      output: "erDiagram\n  A ||--o{ B : x\u2028%% c\n   C ||--o{ D : y\n",
    },
    {
      name: "er/indentation/comment-region-keeps-a-joined-line-in-a-subgraph",
      input: "erDiagram\nsubgraph S\nA\u2028%% c\n   B\nend\n",
      output: "erDiagram\n  subgraph S\n    A\u2028%% c\n   B\n  end\n",
    },
    {
      name: "er/attribute-blocks/comment-region-keeps-the-joined-attributes",
      input: "erDiagram\nA {\nint a\u2028%% c\n   string b\n}\n",
      output: "erDiagram\n  A {\n    int a\u2028%% c\n   string b\n  }\n",
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
    {
      name: "mindmap/line-separators/comment-region-continuation-kept",
      input: "mindmap\nroot\n  a\u2028%% c\n     b\n",
      output: "mindmap\n  root\n    a\u2028%% c\n     b\n",
    },
    {
      name: "eventmodeling/long-lines/comment-region-continuation-one-level-deeper",
      input: "eventmodeling\ntf 01 evt\u2028%% c\n   Alpha\n",
      output: "eventmodeling\ntf 01 evt %% c\n  Alpha\n",
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
