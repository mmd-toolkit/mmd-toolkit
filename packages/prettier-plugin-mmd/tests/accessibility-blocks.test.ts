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
    output: 'agentflow-beta TB\n  accDescr {}\n  A["Unicode empty"]\n',
  },
  {
    name: "accessibility blocks: class brace-after-ls-direction-kept",
    input: "classDiagram\naccDescr\u2028{direction RL}\nclass A",
    output: "classDiagram\n  accDescr\u2028{ direction RL }\n  class A\n",
  },
  {
    name: "accessibility blocks: class text-between-ls-direction-kept",
    input: "classDiagram\naccDescr {\u2028direction RL\u2028}\nclass A",
    output: "classDiagram\n  accDescr {\u2028direction RL\u2028}\n  class A\n",
  },
  {
    name: "accessibility blocks: er text-between-ps-direction-kept",
    input: "erDiagram\naccDescr {\u2029direction RL\u2029}\nA ||--o{ B : has",
    output:
      "erDiagram\n  accDescr {\u2029direction RL\u2029}\n  A ||--o{ B : has\n",
  },
  {
    name: "accessibility blocks: requirement brace-after-ps-direction-kept",
    input: "requirementDiagram\naccDescr\u2029{direction RL}",
    output: "requirementDiagram\n  accDescr\u2029{ direction RL }\n",
  },
  {
    name: "accessibility blocks: pie brace-after-ls-direction-converted",
    input: 'pie\naccDescr\u2028{direction RL}\n"A": 1',
    output: 'pie\n  accDescr: direction RL\n  "A" : 1\n',
  },
  {
    name: "accessibility blocks: state text-with-ls-kept",
    input: "stateDiagram-v2\naccDescr {a\u2028b}\nA --> B",
    output: "stateDiagram-v2\n  accDescr {a\u2028b}\n  A --> B\n",
  },
  {
    name: "accessibility blocks: c4 block-cr-close",
    input:
      'C4Context\raccDescr {\r first block line\r   %% block note\r second block line\r      }\rPerson(p,"CR closer")',
    output:
      'C4Context\n  accDescr {\n    first block line\n    %% block note\n    second block line\n  }\n  Person(p, "CR closer")\n',
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
