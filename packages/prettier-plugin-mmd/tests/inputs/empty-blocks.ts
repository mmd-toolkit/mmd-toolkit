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
import type { GeneratedInput } from "../generated.ts"
import { pairwiseIndexes } from "../pairwise.ts"

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

/** The blocks of a chain: one, one written over two lines, and two. */
const chainShapes: readonly ((
  first: string,
  between: string,
  last: string,
) => string)[] = [
  (first, _between, last) => `${first}accDescr {}${last}`,
  (first, _between, last) => `${first}accDescr {\n}${last}`,
  (first, between, last) => `${first}accDescr {}${between}accDescr {}${last}`,
]

/**
 * Every statement with a chain of one or two blocks, the gaps around them,
 * and an end, the axes together in pairs, in three passes (see
 * `pairwise.ts`).
 */
export function makeInputs(): GeneratedInput[] {
  return pairwiseIndexes(
    [
      statements.length,
      chainShapes.length,
      gaps.length,
      gaps.length,
      gaps.length,
      ends.length,
    ],
    3,
  ).map(([statement, shape, first, between, last, end]) => {
    const text = statements[statement]
    const closing = text.startsWith("subgraph") ? "end\n" : ""
    const chain = chainShapes[shape](gaps[first], gaps[between], gaps[last])
    return {
      text: `flowchart LR\n${text}${chain}${ends[end]}\n${closing}`,
      options: {},
    }
  })
}
