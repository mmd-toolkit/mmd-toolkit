/**
 * Formats statements and block openings that end in comment lines after a
 * U+2028 or U+2029, with every kind of line after them: mermaid.js removes
 * such a comment line with its line break, so the next line goes on the line
 * of the statement. A `;` on it still separates statements, and what it holds
 * is read with the statement: the name of a subgraph takes it, and an empty
 * line ends the line, so formatting must keep the text of the line, with
 * the line break that the comment lines hid (docs/compatibility.md, A comment
 * line after U+2028 or U+2029).
 */
import type { GeneratedInput } from "../generated.ts"
import { diagrams } from "../generated-statements.ts"
import { pairwiseIndexes } from "../pairwise.ts"

/** What can stand between the statement and the comment lines. */
const separators: readonly string[] = ["\u2028", "\u2029", " \u2028", "\u2028 "]

/**
 * Comment lines: one, and several, in the ways that they can stand together,
 * and the `#` comment of a sequence diagram, which is read by its lexer and
 * joins no lines.
 */
const commentLines: readonly string[] = [
  "%% c",
  "%% c\u2028%% d",
  "%% c\n%% d",
  "%% c\n \u2028%% d",
  "%% c\n  %% d",
  "%% a\n  \n%% b",
  "%% a\n\n%% b",
  "# c",
  "# c\n  \n%% d",
]

/** The text after the line break of the last comment line. */
const continuations: readonly string[] = [
  ";A",
  " ;A",
  ";;A",
  ";\nA",
  "\nA",
  "  \nA",
  "\n;A",
  "A",
  "%%{init: {}}%%;A",
]

/** The headers of a subgraph, the one that reads the whitespace after it as its name and the others. */
const subgraphHeaders: readonly string[] = [
  "subgraph S",
  'subgraph "S"',
  "subgraph S[T]",
]

/** The line terminators of the text. */
const lineTerminators: readonly string[] = ["\n", "\r\n"]

/** Empty description blocks between the statement and the separator. */
const blockChains: readonly string[] = [
  "",
  " accDescr {}",
  " accDescr {}%%{init: {}}%% accDescr {}",
]

/**
 * Every statement and block opening of every diagram type with comment
 * lines after a U+2028 or U+2029, and a line after them, the axes together
 * in pairs, in three passes (see `pairwise.ts`). Empty description blocks
 * are tried after the items of the flowchart only: the other diagram types
 * have none.
 */
export function makeInputs(): GeneratedInput[] {
  const inputs: GeneratedInput[] = []
  for (const { header, statements, blockOpenings, blockClosing } of diagrams) {
    const items = [...statements, ...blockOpenings]
    const chains = header.startsWith("flowchart") ? blockChains : [""]
    for (const [
      item,
      chain,
      separator,
      comments,
      continuation,
      terminator,
    ] of pairwiseIndexes(
      [
        items.length,
        chains.length,
        separators.length,
        commentLines.length,
        continuations.length,
        lineTerminators.length,
      ],
      3,
    )) {
      const closing = item < statements.length ? "" : blockClosing
      const text = `${header}\n${items[item]}${chains[chain]}${separators[separator]}${commentLines[comments]}\n${continuations[continuation]}${closing}\n`
      inputs.push({
        text: text.replaceAll("\n", lineTerminators[terminator]),
        options: {},
      })
    }
  }
  inputs.push(...makeSubgraphInputs())
  return inputs
}

/**
 * The header of a subgraph with every chain of empty description blocks,
 * every separator, and every line after the comment lines, all together: the
 * name of a subgraph reads what stands on that line, and the header is where
 * it matters which of them is there. The comment lines and the line
 * terminator take turns.
 */
function makeSubgraphInputs(): GeneratedInput[] {
  const inputs: GeneratedInput[] = []
  let turn = 0
  for (const header of subgraphHeaders) {
    for (const chain of blockChains) {
      for (const separator of separators) {
        for (const continuation of continuations) {
          const comments = commentLines[turn % commentLines.length]
          const terminator = lineTerminators[turn % lineTerminators.length]
          turn++
          const text = `flowchart LR\n${header}${chain}${separator}${comments}\n${continuation}\nend\n`
          inputs.push({
            text: text.replaceAll("\n", terminator),
            options: {},
          })
        }
      }
    }
  }
  return inputs
}
