/** Escaped accessibility revisions cover whitespace that fixture files cannot hold. */
import { describe, expect, it } from "vitest"
import { formatMermaid } from "./helpers.ts"
import {
  dbOfText,
  defaultEmbedded,
  treeProblemsOfText,
  writtenEmbeddedTexts,
} from "./db-reading.ts"

const cases = [
  {
    name: "accessibility revisions: c4 keyword-brace-tab",
    input: 'C4Context\naccDescr\t{ a }\nPerson(p,"Keyword tab")',
    output: 'C4Context\n  accDescr { a }\n  Person(p, "Keyword tab")\n',
  },
  {
    name: "accessibility revisions: usecase keyword-brace-tab",
    input: "usecase-beta\naccDescr\t{ a }\nA[Keyword tab]",
    output: "usecase-beta\n  accDescr { a }\n  A[Keyword tab]\n",
  },
  {
    name: "accessibility revisions: class direction-value-cr",
    input: "classDiagram\rclass A11y\raccTitle:\r direction LR",
    output: "classDiagram\n  class A11y\n  accTitle:\n    direction LR\n",
  },
  {
    name: "accessibility revisions: state next-line-direction-crlf",
    input: "stateDiagram-v2\r\naccTitle:\r\n direction LR",
    output: "stateDiagram-v2\n  accTitle:\n    direction LR\n",
  },
  {
    name: "accessibility revisions: state next-line-direction-nbsp",
    input: "stateDiagram-v2\naccTitle:\n\u00a0direction LR",
    output: "stateDiagram-v2\n  accTitle:\n    direction LR\n",
  },
  {
    name: "accessibility revisions: state empty-description-nbsp",
    input: "stateDiagram-v2\naccDescr: previous\naccDescr {\u00a0}\nA",
    output: "stateDiagram-v2\n  accDescr: previous\n  accDescr {}\n  A\n",
  },
  {
    name: "accessibility revisions: er empty-description-nbsp",
    input: "erDiagram\naccDescr: previous\naccDescr {\u00a0}\nA",
    output: "erDiagram\n  accDescr: previous\n  accDescr {}\n  A\n",
  },
]

describe("accessibility revisions", () => {
  it.each(cases)("$name", async ({ input, output }) => {
    expect(await formatMermaid(input)).toBe(output)
    expect(await formatMermaid(output)).toBe(output)
    expect(dbOfText(output, defaultEmbedded())).toEqual(
      dbOfText(input, defaultEmbedded()),
    )
    expect(writtenEmbeddedTexts(output)).toEqual(writtenEmbeddedTexts(input))
    expect(treeProblemsOfText(input)).toEqual([])
    expect(treeProblemsOfText(output)).toEqual([])
  })
})
