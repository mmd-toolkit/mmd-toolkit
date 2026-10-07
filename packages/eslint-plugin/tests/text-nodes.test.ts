/**
 * Ties `TEXT_NODE_TYPES` of `src/utils/text-nodes.ts`, the node types whose
 * text can hold a line of only `%%`, to the tree: every leaf node type of the
 * flowchart (a node type without child fields, of the flowchart or shared by
 * the diagram types) is placed on purpose, so that a node type that the
 * parser adds is decided here; and the specification gives a text field of
 * type string to the node types in the list and to the arrows that are left
 * out, and none to the others.
 */
import { readFileSync } from "node:fs"
import { visitorKeys } from "@mmd-toolkit/parser"
import { describe, expect, it } from "vitest"
import { TEXT_NODE_TYPES } from "../src/utils/text-nodes.ts"

/** The leaf node types that every diagram type shares (ast.md, Shared leaf nodes). */
const SHARED_LEAF_TYPES: readonly string[] = [
  "Identifier",
  "StringLiteral",
  "NumericLiteral",
]

/** The leaf node types with a text that holds no line break: arrows. */
const NO_LINE_BREAK_TYPES: ReadonlySet<string> = new Set([
  "FlowchartArrow",
  "FlowchartOpeningArrow",
])

/** The leaf node types without a text: a number, and a `;` of its own. */
const NO_TEXT_TYPES: ReadonlySet<string> = new Set([
  "NumericLiteral",
  "FlowchartEmptyStatement",
])

/** The leaf node types of the flowchart: its own, and the shared ones. */
const leafTypes = Object.entries(visitorKeys)
  .filter(([, keys]) => keys.length === 0)
  .map(([type]) => type)
  .filter(
    (type) => type.startsWith("Flowchart") || SHARED_LEAF_TYPES.includes(type),
  )

/** The text of a section of a document of the specification, by the type that it describes. */
function sectionOf(type: string): string {
  const path = SHARED_LEAF_TYPES.includes(type) ? "ast.md" : "ast/flowchart.md"
  const text = readFileSync(
    new URL(`../../spec/docs/${path}`, import.meta.url),
    "utf8",
  )
  const section = text
    .split("\n### ")
    .find((candidate) => candidate.split("\n")[0] === type)
  if (section === undefined) throw new Error(`No section ${type} in ${path}`)
  return section
}

/** Whether the section of `type` has a field `name` or `value` of type string. */
function givesText(type: string): boolean {
  return /^\| `(?:name|value)`\s*\| string\s*\|/mu.test(sectionOf(type))
}

describe("the leaf node types of the flowchart", () => {
  it("are each in the list of text nodes, an arrow, or without a text", () => {
    for (const type of leafTypes) {
      const places = [
        TEXT_NODE_TYPES.has(type as never),
        NO_LINE_BREAK_TYPES.has(type),
        NO_TEXT_TYPES.has(type),
      ].filter(Boolean)
      expect(places, type).toHaveLength(1)
    }
  })

  it("include every node type that the lists name", () => {
    for (const type of [
      ...TEXT_NODE_TYPES,
      ...NO_LINE_BREAK_TYPES,
      ...NO_TEXT_TYPES,
    ]) {
      expect(leafTypes).toContain(type)
    }
  })

  it.each([...TEXT_NODE_TYPES, ...NO_LINE_BREAK_TYPES])(
    "%s has a text in the specification",
    (type) => {
      expect(givesText(type)).toBe(true)
    },
  )

  it.each([...NO_TEXT_TYPES])("%s has no text in the specification", (type) => {
    expect(givesText(type)).toBe(false)
  })
})
