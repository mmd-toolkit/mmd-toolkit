/** Escaped accessibility blocks cover Unicode gaps and CR closing lines. */
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
    name: "accessibility blocks: flowchart empty-block-unicode",
    input: "flowchart LR\naccDescr {\u00a0\u2028\u2029}\nA[Unicode empty]",
    output: "flowchart LR\n  accDescr {}\n  A[Unicode empty]\n",
  },
  {
    name: "accessibility blocks: agentflow empty-block-unicode",
    input: "agentflow-beta TB\naccDescr {\u00a0\u2028\u2029}\nA[Unicode empty]",
    output: "agentflow-beta TB\n  accDescr {}\n  A[Unicode empty]\n",
  },
  {
    name: "accessibility blocks: c4 block-cr-close",
    input:
      'C4Context\raccDescr {\r first block line\r   %% block note\r second block line\r      }\rPerson(p,"CR closer")',
    output:
      'C4Context\n  accDescr {\n first block line\n   %% block note\n second block line\n  }\n  Person(p, "CR closer")\n',
  },
]

describe("accessibility blocks", () => {
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
