import type { TreeRange } from "../db-from-tree/tree.ts"
import { scanSource } from "../source-scan.ts"
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
    this.leftOut = new Uint8Array(text.length)
    const scan = scanSource(text, root.frontmatter?.range[1] ?? 0)
    for (const directive of scan.directives) {
      this.leftOut.fill(1, directive.range[0], directive.scanEnd)
    }
    for (const line of scan.commentLines) {
      this.leftOut.fill(1, line.region[0], line.region[1])
    }
    for (const token of root.tokens) {
      if (token.type === "IgnoredSemicolon") {
        this.leftOut.fill(1, token.range[0], token.range[1])
      }
    }
  }

  /** Whether the character at `offset` is left out of the written text: it is in a directive, a comment region, or an ignored `;`. */
  public isLeftOut(offset: number): boolean {
    return this.leftOut[offset] === 1
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
