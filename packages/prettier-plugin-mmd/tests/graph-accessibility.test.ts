/** Escaped graph accessibility cases keep Unicode values and kept lines. */
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
    name: "graph accessibility: flowchart cr-lines",
    input: "flowchart LR\raccTitle :CR title\raccDescr:CR description\r",
    output: "flowchart LR\n  accTitle: CR title\n  accDescr: CR description\n",
  },
  {
    name: "graph accessibility: flowchart unicode-gaps",
    input:
      "flowchart LR\naccTitle\u00a0:\u2028\u00a0Unicode title\u00a0\naccDescr\u2029:\u00a0Unicode description\u2029",
    output:
      "flowchart LR\n  accTitle: Unicode title\n  accDescr: Unicode description\n",
  },
  {
    name: "graph accessibility: flowchart unicode-values",
    input:
      "flowchart LR\naccTitle:\u00a0one\u2028two\u00a0\naccDescr:\u00a0three\u2029four\u00a0",
    output:
      "flowchart LR\n  accTitle: one\u2028two\n  accDescr: three\u2029four\n",
  },
  {
    name: "graph accessibility: flowchart unicode-semicolon-kept",
    input: "flowchart LR\naccTitle : one\u00a0;\u2028two\nA",
    output: "flowchart LR\n  accTitle : one\u00a0;\u2028two\n  A\n",
  },
  {
    name: "graph accessibility: agentflow cr-lines",
    input: "agentflow-beta TB\raccTitle :CR title\raccDescr:CR description\r",
    output:
      "agentflow-beta TB\n  accTitle: CR title\n  accDescr: CR description\n",
  },
  {
    name: "graph accessibility: agentflow unicode-gaps",
    input:
      "agentflow-beta TB\naccTitle\u00a0:\u2028\u00a0Unicode title\u00a0\naccDescr\u2029:\u00a0Unicode description\u2029",
    output:
      "agentflow-beta TB\n  accTitle: Unicode title\n  accDescr: Unicode description\n",
  },
  {
    name: "graph accessibility: agentflow unicode-values",
    input:
      "agentflow-beta TB\naccTitle:\u00a0one\u2028two\u00a0\naccDescr:\u00a0three\u2029four\u00a0",
    output:
      "agentflow-beta TB\n  accTitle: one\u2028two\n  accDescr: three\u2029four\n",
  },
  {
    name: "graph accessibility: agentflow unicode-semicolon-kept",
    input: "agentflow-beta TB\naccTitle : one\u00a0;\u2028two\nA",
    output: "agentflow-beta TB\n  accTitle : one\u00a0;\u2028two\n  A\n",
  },
]

describe("graph accessibility lines", () => {
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
