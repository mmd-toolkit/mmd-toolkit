import type { TreeRange } from "../db-from-tree/tree.ts"
import { sourceCutsOf } from "../db-from-tree/converted-text.ts"
import type { CheckedRoot } from "./types.ts"

/**
 * ast.md, Nodes: the written text of a range of the source: its text without
 * the directives, the comment regions, and the `;` that the line rule ignores
 * (nothing else is left out, added, or rewritten). The directives and the
 * comment lines are found in the text (`scanSource()`); the `;` that the line
 * rule ignores are the `IgnoredSemicolon` tokens of the tree.
 */
export class WrittenText {
  private readonly text: string

  private readonly leftOut: Uint8Array

  public constructor(text: string, root: CheckedRoot) {
    this.text = text
    this.leftOut = sourceCutsOf(text, root)
  }

  /** Whether the character at `offset` is left out of the written text: it is in a directive, a comment region, or an ignored `;`. */
  public isLeftOut(offset: number): boolean {
    return this.leftOut[offset] === 1
  }

  /**
   * The number of cuts inside `range`: the runs of characters left out (a
   * directive, a comment region, an ignored `;`) that lie between two
   * characters of the written text of the range.
   */
  public cutsIn(range: TreeRange): number {
    let cuts = 0
    let seenWritten = false
    let inCut = false
    for (let offset = range[0]; offset < range[1]; offset++) {
      if (this.leftOut[offset] === 1) {
        inCut = seenWritten
        continue
      }
      if (inCut) cuts++
      inCut = false
      seenWritten = true
    }
    return cuts
  }

  /**
   * The kinds of the tokens of a string over `range`: one `String` token where
   * nothing cuts it, and `StringFragment` tokens, one more than there are
   * cuts, where something does (parser/docs/tokens.md, String tokens).
   */
  public stringTokenKinds(range: TreeRange): string[] {
    const cuts = this.cutsIn(range)
    return cuts === 0
      ? ["String"]
      : Array.from({ length: cuts + 1 }, () => "StringFragment")
  }

  /** The written text of `range`, without the characters in `leftOut`, such as the delimiters of a string. */
  public of(range: TreeRange, leftOut: readonly TreeRange[] = []): string {
    let written = ""
    for (let offset = range[0]; offset < range[1]; offset++) {
      if (this.leftOut[offset] === 1) continue
      if (leftOut.some(([from, to]) => from <= offset && offset < to)) continue
      written += this.text[offset]
    }
    return written
  }
}
