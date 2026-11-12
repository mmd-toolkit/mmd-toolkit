import type { Node } from "@mmd-toolkit/ast"
import { findNodes } from "./collections.ts"
import type { Source } from "./source.ts"
import { findStructuralToken } from "./source.ts"

/**
 * Records the respelling of the arrows whose length is no part of what
 * mermaid.js draws (docs/compatibility.md, Spellings that are drawn the
 * same): the arrow of a block diagram in its shortest form, and the arrow
 * between the two texts of an axis of a quadrant chart. Not the length of the
 * arrow of a flowchart, which asks for a link that spans more ranks.
 */
export function findArrowLengthRespellings(
  source: Source,
  found: Map<number, { readonly end: number; readonly text: string }>,
): void {
  if (source.root.diagramType === "block") {
    for (const node of findNodes(source.root, isBlockArrow)) {
      const arrow = node as Node & {
        readonly value: string
        readonly startMarker: string
        readonly line: string
        readonly endMarker: string
      }
      const text = shortestBlockArrow(arrow)
      if (text !== arrow.value)
        found.set(arrow.range[0], { end: arrow.range[1], text })
    }
  }
  if (source.root.diagramType === "quadrantChart") {
    for (const node of findNodes(source.root, isAxisWithArrow)) {
      const statement = node as Node & { readonly start: Node }
      const arrow = findStructuralToken(source, statement.start.range[1])
      if (
        arrow !== undefined &&
        isDashedArrow(arrow.value) &&
        arrow.value !== "-->"
      )
        found.set(arrow.range[0], { end: arrow.range[1], text: "-->" })
    }
  }
}

/** Whether a node is the arrow of a link of a block diagram. */
function isBlockArrow(node: Node): boolean {
  return node.type === "BlockArrow"
}

/** Whether a node is an axis of a quadrant chart that has an arrow. */
function isAxisWithArrow(node: Node): boolean {
  return (
    node.type === "QuadrantAxisStatement" &&
    (node as Node & { readonly arrow: boolean }).arrow
  )
}

/** Whether a text is two dashes or more and a `>`. */
function isDashedArrow(text: string): boolean {
  return (
    text.length >= 3 &&
    text.endsWith(">") &&
    [...text.slice(0, -1)].every((character) => character === "-")
  )
}

/**
 * The shortest form of an arrow of a block diagram, where mermaid.js draws it
 * the same in every version that counts: a solid line with an end arrow or no
 * end marker (`--->` is `-->`, `----` is `---`), a thick line with an end arrow
 * (`===>` is `==>`), and a dotted line with one dot (`-..->` is `-.->`). A line
 * that starts with `<` is drawn the same in any length, whatever it ends in
 * (`<---x` is `<--x`, `<====` is `<===`). A line without the `<` that ends in
 * `x` or `o` stays as written, since some versions that count draw `---x` and
 * `--x` differently, and so does a thick line that does not end in `>`, which
 * some of them read as ids (docs/compatibility.md, The length of an arrow).
 */
function shortestBlockArrow(arrow: {
  readonly value: string
  readonly startMarker: string
  readonly line: string
  readonly endMarker: string
}): string {
  const start = arrow.startMarker === "arrow" ? "<" : ""
  const mark = arrow.endMarker === "cross" ? "x" : "o"
  if (arrow.line === "solid") {
    if (arrow.endMarker === "arrow") return `${start}-->`
    if (arrow.endMarker === "none") return `${start}---`
    return start === "" ? arrow.value : `<--${mark}`
  }
  if (arrow.line === "thick") {
    if (arrow.endMarker === "arrow") return `${start}==>`
    if (start === "") return arrow.value
    return arrow.endMarker === "none" ? "<===" : `<==${mark}`
  }
  let text = ""
  for (const character of arrow.value) {
    if (character !== "." || !text.endsWith(".")) text += character
  }
  return text
}
