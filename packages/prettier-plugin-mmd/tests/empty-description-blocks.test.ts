/** Empty description interiors use one layout across diagram grammars. */
import { describe, expect, it } from "vitest"
import { parse } from "@mmd-toolkit/parser"
import { formatMermaid } from "./helpers.ts"
import {
  dbOfText,
  defaultEmbedded,
  treeProblemsOfText,
  writtenEmbeddedTexts,
} from "./db-reading.ts"

const cases = [
  {
    name: "flowchart Unicode and tab interiors",
    input:
      "flowchart LR\naccDescr {\u00a0\u2003\u2028\u2029\ufeff}\naccDescr{\t}\n",
    output: "flowchart LR\n  accDescr {}\n  accDescr{}\n",
  },
  {
    name: "sequence Unicode and tab interiors",
    input:
      "sequenceDiagram\naccDescr {\u00a0\u2003\u2028\u2029\ufeff}\naccDescr{\t}\n",
    output: "sequenceDiagram\n  accDescr {}\n  accDescr{}\n",
  },
  {
    name: "class Unicode and tab interiors",
    input:
      "classDiagram\naccDescr {\u00a0\u2003\u2028\u2029\ufeff} class A\naccDescr{\t} class B\n",
    output: "classDiagram\n  accDescr {} class A\n  accDescr{} class B\n",
  },
  {
    name: "state Unicode and tab interiors",
    input:
      "stateDiagram-v2\naccDescr {\u00a0\u2003\u2028\u2029\ufeff}\naccDescr{\t}\n",
    output: "stateDiagram-v2\n  accDescr {}\n  accDescr{}\n",
  },
  {
    name: "er Unicode and tab interiors",
    input:
      "erDiagram\naccDescr {\u00a0\u2003\u2028\u2029\ufeff}\naccDescr{\t}\n",
    output: "erDiagram\n  accDescr {}\n  accDescr{}\n",
  },
  {
    name: "journey Unicode and tab interiors",
    input: "journey\naccDescr {\u00a0\u2003\u2028\u2029\ufeff}\naccDescr{\t}\n",
    output: "journey\n  accDescr {}\n  accDescr{}\n",
  },
  {
    name: "gantt Unicode and tab interiors",
    input: "gantt\naccDescr {\u00a0\u2003\u2028\u2029\ufeff}\naccDescr{\t}\n",
    output: "gantt\n  accDescr {}\n  accDescr{}\n",
  },
  {
    name: "pie Unicode and tab interiors",
    input: "pie\naccDescr {\u00a0\u2003\u2028\u2029\ufeff}\naccDescr{\t}\n",
    output: "pie\n  accDescr {}\n  accDescr{}\n",
  },
  {
    name: "quadrant Unicode and tab interiors",
    input:
      "quadrantChart\naccDescr {\u00a0\u2003\u2028\u2029\ufeff}\naccDescr{\t}\n",
    output: "quadrantChart\n  accDescr {}\n  accDescr{}\n",
  },
  {
    name: "requirement Unicode and tab interiors",
    input:
      "requirementDiagram\naccDescr {\u00a0\u2003\u2028\u2029\ufeff}\naccDescr{\t}\n",
    output: "requirementDiagram\n  accDescr {}\n  accDescr{}\n",
  },
  {
    name: "timeline Unicode and tab interiors",
    input:
      "timeline\naccDescr {\u00a0\u2003\u2028\u2029\ufeff}\naccDescr{\t}\n",
    output: "timeline\n  accDescr {}\n  accDescr{}\n",
  },
  {
    name: "xychart Unicode and tab interiors",
    input:
      "xychart-beta\naccDescr {\u00a0\u2003\u2028\u2029\ufeff}\naccDescr{\t}\n",
    output: "xychart-beta\n  accDescr {}\n  accDescr{}\n",
  },
  {
    name: "block Unicode and tab interiors",
    input:
      "block-beta\naccDescr {\u00a0\u2003\u2028\u2029\ufeff}\naccDescr{\t} a\n",
    output: "block-beta\n  accDescr {}\n  accDescr{}\n  a\n",
  },
  {
    name: "c4 Unicode and tab interiors",
    input:
      'C4Context\naccDescr {\u00a0\u2003\u2028\u2029\ufeff}Person(a,"A")\naccDescr{\t}Person(b,"B")\n',
    output:
      'C4Context\n  accDescr {}Person(a, "A")\n  accDescr{}Person(b, "B")\n',
  },
  {
    name: "agentflow Unicode and tab interiors",
    input:
      "agentflow-beta TB\naccDescr {\u00a0\u2003\u2028\u2029\ufeff}\naccDescr{\t}\n",
    output: "agentflow-beta TB\n  accDescr {}\n  accDescr{}\n",
  },
  {
    name: "usecase Unicode and tab interiors",
    input:
      "usecase-beta\naccDescr {\u00a0\u2003\u2028\u2029\ufeff}\naccDescr{\t}\n",
    output: "usecase-beta\n  accDescr {}\n  accDescr{}\n",
  },
  {
    name: "gitgraph Unicode and tab interiors",
    input:
      "gitGraph\naccDescr {\u00a0\u2003\u2028\u2029\ufeff}\naccDescr{\t}\n",
    output: "gitGraph\n  accDescr {}\n  accDescr{}\n",
  },
  {
    name: "info Unicode and tab interiors",
    input: "info\naccDescr {\u00a0\u2003\u2028\u2029\ufeff}\naccDescr{\t}\n",
    output: "info\n  accDescr {}\n  accDescr{}\n",
  },
  {
    name: "requirement body Unicode and tab interiors",
    input:
      "requirementDiagram\nrequirement A {\naccDescr {\u00a0\u2003\u2028\u2029\ufeff}\naccDescr{\t}\nid: A\n}\n",
    output:
      "requirementDiagram\n  requirement A {\n    accDescr {}\n    accDescr{}\n    id: A\n  }\n",
  },
  {
    name: "state multiline Unicode interior",
    input: "stateDiagram-v2\naccDescr {\n\u2028\n\u2029\n}\nA\n",
    output: "stateDiagram-v2\n  accDescr {}\n  A\n",
  },
  {
    name: "state exterior separator keeps the line",
    input: "stateDiagram-v2\naccDescr {\u2028}\u2029 A\n",
    output: "stateDiagram-v2\n  accDescr {\u2028}\u2029 A\n",
  },
  {
    name: "state separator with comment stays written",
    input: "stateDiagram-v2\naccDescr {\u2028\n%% note\n}\n",
    output: "stateDiagram-v2\n  accDescr {\u2028\n%% note\n}\n",
  },
  {
    name: "ishikawa description-looking node keeps its text",
    input: "ishikawa-beta\naccDescr {  }\n accDescr{\t}\n",
    output: "ishikawa-beta\n  accDescr {  }\n    accDescr{\t}\n",
  },
  {
    name: "sankey description-looking field keeps its text",
    input: 'sankey-beta\n"accDescr {  }",B,1\n',
    output: 'sankey-beta\n"accDescr {  }",B,1\n',
  },
]

describe("empty description blocks", () => {
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

  it.each([
    { name: "mindmap", input: "mindmap\n root\n  accDescr {}\n" },
    { name: "sankey", input: "sankey-beta\naccDescr {}\n" },
    { name: "kanban", input: "kanban\n column\n  accDescr {}\n" },
    { name: "venn", input: "venn-beta\nset A\naccDescr {}\n" },
  ])("$name has no description block statement", ({ input }) => {
    expect(() => parse(input)).toThrow()
  })
})
