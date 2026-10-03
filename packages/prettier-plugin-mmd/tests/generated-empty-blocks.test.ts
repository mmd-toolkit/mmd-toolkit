/**
 * Formats statements that end with empty description blocks before their
 * separator, with whitespace and directives in every gap around the blocks:
 * mermaid.js reads no token for a block, so the whitespace before, between,
 * and after the blocks is read as the end of the statement, as part of the
 * name text of a subgraph, or as a last style that is all whitespace, and
 * moving the blocks to lines of their own can change what it reads or make
 * it reject the text (diagrams/flowchart.md, Empty description blocks before
 * a separator).
 */
import { describe, expect, it } from "vitest"
import type { GeneratedInput } from "./generated.ts"
import { checkGeneratedInputs, describeReport } from "./generated.ts"

/** Statements that take blocks before their separator, or do not. */
const statements: readonly string[] = [
  "A",
  "A --> B",
  "A[x]",
  "style A",
  "style A fill:red",
  "classDef c",
  "classDef c fill:red",
  "linkStyle 0 interpolate basis",
  "linkStyle 0 stroke:red",
  "linkStyle default interpolate basis",
  "class A c",
  'click A href "u"',
  "A@{ shape: rect }",
  'subgraph "S"',
  "subgraph S",
  "subgraph S[T]",
]

/** What can lie between the statement and a block, or between two blocks. */
const gaps: readonly string[] = ["", " ", " %%{init: {}}%%", "%%{init: {}}%% "]

/** What follows the last block: the separator, with a statement or not. */
const ends: readonly string[] = [";A", ";", ""]

/** Every chain of one or two blocks, with the gaps around them. */
function* makeChains(): Generator<string> {
  for (const first of gaps) {
    for (const last of gaps) {
      yield `${first}accDescr {}${last}`
      yield `${first}accDescr {\n}${last}`
    }
  }
  for (const first of gaps) {
    for (const between of gaps) {
      for (const last of gaps) {
        yield `${first}accDescr {}${between}accDescr {}${last}`
      }
    }
  }
}

/** Every combination. */
function* makeInputs(): Generator<GeneratedInput> {
  for (const statement of statements) {
    const closing = statement.startsWith("subgraph") ? "end\n" : ""
    for (const chain of makeChains()) {
      for (const end of ends) {
        yield {
          text: `flowchart LR\n${statement}${chain}${end}\n${closing}`,
          options: {},
        }
      }
    }
  }
}

describe("a statement that ends with empty description blocks", () => {
  it("is formatted without changing the diagram", async ({ annotate }) => {
    const report = await checkGeneratedInputs(makeInputs())
    await annotate(describeReport(report))
    expect(report.checked).toBeGreaterThan(0)
    expect(report.problems).toEqual([])
  }, 1_800_000)
})
