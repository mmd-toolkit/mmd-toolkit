import type { Node, Token } from "@mmd-toolkit/ast"
import { walk } from "./layout.ts"
import type { Source } from "./source.ts"
import { isSpaceOrTab, skipSpacesAndTabs } from "./source.ts"
import { collapseRuns, staysAsWritten } from "./text-runs.ts"

/**
 * The diagram types whose accessibility description stays in the form it is
 * written in: the columns of the lines of an event modeling diagram are part
 * of its grammar, and the colon form was not compared there.
 */
const diagramTypesKept: ReadonlySet<string> = new Set(["eventmodeling"])

/**
 * Records, for each accessibility description that is written between `{` and
 * `}` on one line, the description in the form `accDescr: text`, which
 * mermaid.js reads the same (docs/compatibility.md, Spellings that are drawn
 * the same): the stretch from the keyword to the `}` becomes the keyword, the
 * `:`, and the text. The description stays as written where it holds a `%%`
 * (a diagram of some types reads the rest of the line after it differently in
 * the form with the `:`), a `{` at its start, or a line break, where anything
 * but whitespace stands before the keyword on its line or after the `}`, where
 * the block has no text, is not closed, or has trivia in it, and in the diagram
 * types of `diagramTypesKept`.
 */
export function findAccessibilityRespellings(
  source: Source,
  found: Map<number, { readonly end: number; readonly text: string }>,
): void {
  if (diagramTypesKept.has(source.root.diagramType)) return
  const blocks: Node[] = []
  walk(source.root, (node) => {
    if (node.type.endsWith("AccDescrBlockStatement")) blocks.push(node)
  })
  const tokens = source.root.tokens
  for (const block of blocks) {
    const { value, closed } = block as Node & {
      readonly value?: Node | null
      readonly closed?: boolean
    }
    if (value === undefined || value === null || closed === false) continue
    const index = tokens.findIndex((token) => token.range[0] === block.range[0])
    const parts = tokens.slice(index, index + 4)
    if (
      index === -1 ||
      parts.length !== 4 ||
      textOf(source, parts[1]) !== "{" ||
      parts[2].type !== "RawText" ||
      parts[2].range[0] !== value.range[0] ||
      parts[2].range[1] !== value.range[1] ||
      textOf(source, parts[3]) !== "}" ||
      parts[3].range[1] !== block.range[1] ||
      !isOnlyBlanksBetween(source, parts) ||
      !startsItsLine(source, block.range[0]) ||
      !endsItsLine(source, block.range[1])
    ) {
      continue
    }
    const text = source.text.slice(...value.range)
    if (
      text.trim() === "" ||
      text.startsWith("{") ||
      text.includes("%%") ||
      [...text].some(
        (character) => character.trim() === "" && !isSpaceOrTab(character),
      )
    ) {
      continue
    }
    const keyword = found.get(block.range[0])?.text ?? textOf(source, parts[0])
    found.set(block.range[0], {
      end: block.range[1],
      text: `${keyword}: ${staysAsWritten(source, ...value.range) ? text : collapseRuns(text)}`,
    })
  }
}

/** The text of a token. */
function textOf(source: Source, token: Token): string {
  return source.text.slice(...token.range)
}

/** Whether nothing but spaces and tabs lies between consecutive tokens. */
function isOnlyBlanksBetween(
  source: Source,
  tokens: readonly Token[],
): boolean {
  return tokens.every(
    (token, index) =>
      index === 0 ||
      [...source.text.slice(tokens[index - 1].range[1], token.range[0])].every(
        isSpaceOrTab,
      ),
  )
}

/** Whether only spaces and tabs stand before the offset on its line. */
function startsItsLine(source: Source, offset: number): boolean {
  let at = offset
  while (at > 0 && isSpaceOrTab(source.text[at - 1])) at--
  return (
    at === 0 || source.text[at - 1] === "\n" || source.text[at - 1] === "\r"
  )
}

/** Whether only spaces and tabs stand after the offset on its line. */
function endsItsLine(source: Source, offset: number): boolean {
  const next = skipSpacesAndTabs(source, offset, source.text.length)
  return (
    next === source.text.length ||
    source.text[next] === "\n" ||
    source.text[next] === "\r"
  )
}
