/**
 * Formats diagrams whose lines end with `\r\n` or with a lone `\r`, which
 * mermaid.js reads as line breaks (common.md, Line terminators), and checks
 * that the output has the line feeds of the plugin's options, with the same
 * lines as for the text with line feeds. The characters are written as
 * escapes, and no fixture holds them: an editor offers to convert the line
 * endings of such a file each time it opens it.
 */
import { describe, expect, it } from "vitest"
import { formatMermaid } from "./helpers.ts"

/** A diagram with a statement, a block, and a comment, as lines. */
const diagrams: readonly (readonly [string, readonly string[], string])[] = [
  [
    "flowchart",
    ["flowchart LR", "A   -->   B", "subgraph S", "C", "end", "%%{init: {}}%%"],
    "flowchart LR\n  A --> B\n  subgraph S\n    C\n  end\n  %%{init: {}}%%\n",
  ],
  [
    "sequence",
    ["sequenceDiagram", "A->>B: x", "loop y", "B->>A: z # c", "end"],
    "sequenceDiagram\n  A ->> B: x\n  loop y\n    B ->> A: z # c\n  end\n",
  ],
  [
    "class",
    ["classDiagram", "class A {", "+x", "}", "A <|-- B %% c"],
    "classDiagram\n  class A {\n    +x\n  }\n  A <|-- B %% c\n",
  ],
  [
    "state",
    [
      "stateDiagram-v2",
      "state S {",
      "A --> B",
      "}",
      "note right of A",
      "text",
      "end note",
    ],
    "stateDiagram-v2\n  state S {\n    A --> B\n  }\n  note right of A\ntext\n  end note\n",
  ],
]

describe.each(diagrams)(
  "a %s diagram with other line endings",
  (_name, lines, formatted) => {
    it("is formatted as with line feeds, whatever ends its lines", async () => {
      expect(await formatMermaid(`${lines.join("\n")}\n`)).toBe(formatted)
      expect(await formatMermaid(`${lines.join("\r\n")}\r\n`)).toBe(formatted)
      expect(await formatMermaid(`${lines.join("\r")}\r`)).toBe(formatted)
    })

    it("is printed with the line endings that the options ask for", async () => {
      const crlf = await formatMermaid(
        `${lines.join("\r\n")}\r\n`,
        "diagram.mmd",
        { endOfLine: "crlf" },
      )
      expect(crlf).toBe(formatted.replaceAll("\n", "\r\n"))
    })
  },
)
