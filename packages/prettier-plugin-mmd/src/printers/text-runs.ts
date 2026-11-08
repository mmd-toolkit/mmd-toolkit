import type { Node, Range } from "@mmd-toolkit/ast"
import type { Doc } from "prettier"
import { visitorKeys } from "@mmd-toolkit/parser"
import type { Atom } from "./atoms.ts"
import type { Source } from "./source.ts"
import { findCoveringRange, findTriviaBetween, isSpaceOrTab } from "./source.ts"
import { textSlots } from "./text-slots.ts"

const holdsProperty = new WeakMap<Source, boolean>()

/** Whether the text of the diagram holds `white-space`, in any case. */
function holdsWhiteSpaceProperty(source: Source): boolean {
  let holds = holdsProperty.get(source)
  if (holds === undefined) {
    holds = source.text.toLowerCase().includes("white-space")
    holdsProperty.set(source, holds)
  }
  return holds
}

/**
 * The text with each run of spaces and tabs replaced by one space. mermaid.js
 * keeps the runs of a text in the Db and draws the text without them
 * (docs/compatibility.md, Runs of whitespace in a text that are drawn the
 * same).
 */
export function collapseRuns(text: string): string {
  let collapsed = ""
  let inRun = false
  for (const character of text) {
    if (isSpaceOrTab(character)) {
      if (!inRun) collapsed += " "
      inRun = true
    } else {
      collapsed += character
      inRun = false
    }
  }
  return collapsed
}

/**
 * The atom of a text with its runs of spaces and tabs printed as one space,
 * or the atom itself where it has none, or where the text is nothing but
 * spaces and tabs, or where the text holds something that must stay as
 * written: a comment or a directive, a line break, or a U+2028 or U+2029,
 * which are characters of the text and mark where a rule of mermaid.js reads
 * the line, or a `<`, which may start an HTML tag that keeps the whitespace
 * (`<pre>`). The same holds for every text of a diagram that holds
 * `white-space`, which a style can use to keep the runs of a label. An atom
 * that has a planned layout keeps it, with the runs of its text printed as
 * one space.
 */
export function collapsedRunsAtom(source: Source, atom: Atom): Atom {
  const text = source.text.slice(atom.start, atom.end)
  if (collapseRuns(text) === " ") return atom
  if (text.includes("<") || holdsWhiteSpaceProperty(source)) return atom
  if (
    [...text].some(
      (character) =>
        character === "\n" ||
        character === "\r" ||
        character === "\u2028" ||
        character === "\u2029",
    ) ||
    findTriviaBetween(source, atom.start, atom.end).length > 0
  )
    return atom
  const doc = collapseDoc(atom.doc ?? text)
  return doc === (atom.doc ?? text) ? atom : { ...atom, doc }
}

/** The doc with the runs of spaces and tabs in its strings printed as one. */
function collapseDoc(doc: Doc): Doc {
  if (typeof doc === "string") {
    const collapsed = collapseRuns(doc)
    return collapsed === doc ? doc : collapsed
  }
  if (Array.isArray(doc)) {
    const parts = doc.map(collapseDoc)
    return parts.every((part, index) => part === doc[index]) ? doc : parts
  }
  return doc
}

/**
 * The fields of the nodes of a diagram that hold a text whose runs of spaces
 * and tabs are printed as one space, by the type of the node that has the
 * field (see `textSlots`).
 */
export type TextSlots = Readonly<Record<string, readonly string[]>>

const textsOfSource = new WeakMap<Source, readonly Range[]>()

/**
 * The ranges of the texts of the tree that `textSlots` lists, in source order
 * and disjoint: of two nested texts, the outer one.
 */
function findTexts(source: Source): readonly Range[] {
  let texts = textsOfSource.get(source)
  if (texts === undefined) {
    const found: Range[] = []
    collectTexts(source.root, found)
    found.sort((a, b) => a[0] - b[0] || b[1] - a[1])
    // The lines of a text over several lines keep their columns.
    const outer: Range[] = []
    for (const range of found) {
      if (
        (outer.length === 0 || range[0] >= outer[outer.length - 1][1]) &&
        !source.text.slice(range[0], range[1]).includes("\n")
      )
        outer.push(range)
    }
    texts = outer
    textsOfSource.set(source, texts)
  }
  return texts
}

/** Records the ranges of the texts below `node` in the fields of the slots. */
function collectTexts(node: Node, found: Range[]): void {
  const fields = textSlots[node.type] ?? []
  for (const key of visitorKeys[node.type]) {
    const value = (node as unknown as Record<string, unknown>)[key]
    for (const child of Array.isArray(value) ? value : [value]) {
      if (child === null || child === undefined) continue
      const item = child as Node
      if (fields.includes(key)) found.push(item.range)
      collectTexts(item, found)
    }
  }
}

/**
 * The atoms with the runs of spaces and tabs of the texts printed as one
 * space, for the atoms that lie in a text of the slots: the atom of a text
 * may be the text without the whitespace that its range takes.
 */
export function collapseTextAtoms(
  source: Source,
  atoms: readonly Atom[],
): readonly Atom[] {
  const texts = findTexts(source)
  if (texts.length === 0) return atoms
  return atoms.map((atom) =>
    findCoveringRange(texts, atom.start, atom.end) !== undefined
      ? collapsedRunsAtom(source, atom)
      : atom,
  )
}
