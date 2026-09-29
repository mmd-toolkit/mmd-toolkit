import type { Range, Root } from "../ast.ts"
import { isWhitespace } from "../character-classes.ts"
import type { DiagramInput } from "../diagram-parsing.ts"
import { finishDiagram, openDiagramText } from "../diagram-parsing.ts"
import type { DiagramPosition } from "../diagram-text.ts"
import type { PendingToken } from "../source-lexer.ts"

/**
 * ast.md, ErrorDiagram: the parser of the `error` pseudo-diagram. Its parser
 * in mermaid.js ignores the text, so whitespace and line terminators mean
 * nothing anywhere. The tokens are the maximal runs of characters that are
 * not whitespace in the diagram text, which has no directives and no
 * comment regions; each is a `RawText` token, and each is read at once, a
 * unit of kind `RawText`, so no directive is rejected. The common part cuts
 * a run at a directive between two of its characters, and makes a `;` that
 * the line rule ignores at the end of a run a `RawText` token of its own
 * (see `finishDiagram`). The body runs from the first token to the last;
 * there is always the token that holds `error`, because detection selected
 * the pseudo-diagram.
 */
export function parseErrorDiagram(input: DiagramInput): Root {
  const text = openDiagramText(input)
  const runs: PendingToken[] = []
  let position: DiagramPosition = text.first()
  while (position !== null) {
    if (isWhitespace(position.codePoint)) {
      position = text.after(position)
      continue
    }
    const start = position.start
    let end = position.end
    for (
      position = text.after(position);
      position !== null && !isWhitespace(position.codePoint);
      position = text.after(position)
    ) {
      end = position.end
    }
    const range: Range = [start, end]
    runs.push({ kind: "RawText", range })
  }
  return finishDiagram(
    input,
    text,
    {
      units: runs,
      tokens: runs,
      comments: [],
      // ast.md, ErrorDiagram: every character that is not whitespace is
      // `RawText`, so is a `;` that stands alone.
      ignoredSemicolonKindAt: () => "RawText",
    },
    (place) => ({ type: "ErrorDiagram", ...place }),
  )
}
