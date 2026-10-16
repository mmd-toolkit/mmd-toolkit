import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import {
  STRUCTURE_NODE_TYPES,
  VALUE_NODE_TYPES,
} from "../src/check-tree/node-types.ts"

// The tables of node types of the check of a tree (`node-types.ts`) are kept
// consistent with the tree documents of the specification: the node types
// that a document defines are the node types that the tables classify.

const SPEC_DOCS = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../spec/docs",
)

const DIAGRAMS = [
  "flowchart",
  "sequence",
  "class",
  "state",
  "er",
  "gantt",
  "journey",
  "requirement",
  "mindmap",
  "timeline",
  "sankey",
  "xychart",
  "quadrant",
  "block",
] as const

/** The node types that no `ast/<diagram>.md` defines: `ast.md` defines them. */
const NODE_TYPES_OF_AST_MD: ReadonlySet<string> = new Set([
  "Root",
  "ErrorDiagram",
  "Identifier",
  "StringLiteral",
  "NumericLiteral",
])

/** The words of `heading` that are names of node types: a heading may name several, as `A, B, and C`. */
function nodeTypeNamesIn(heading: string): string[] {
  const names: string[] = []
  let word = ""
  for (const character of `${heading} `) {
    const isLetter = /^[A-Za-z]$/u.test(character)
    if (isLetter) {
      word += character
    } else {
      if (word.length > 0) names.push(word)
      word = ""
    }
  }
  return names.filter((name) => /^[A-Z]/u.test(name) && /[a-z]/u.test(name))
}

/** The node types that the tree documents of the diagrams define, by their headings. */
function definedNodeTypes(): Set<string> {
  const defined = new Set<string>()
  for (const diagram of DIAGRAMS) {
    const text = readFileSync(
      path.join(SPEC_DOCS, "ast", `${diagram}.md`),
      "utf8",
    )
    for (const line of text.split("\n")) {
      if (line.startsWith("### ")) {
        for (const name of nodeTypeNamesIn(line.slice(4))) defined.add(name)
      }
    }
  }
  return defined
}

describe("the node types of the check of a tree", () => {
  it("classify every node type that the tree documents define, and no other", () => {
    const defined = definedNodeTypes()
    const classified = new Set([...VALUE_NODE_TYPES, ...STRUCTURE_NODE_TYPES])
    expect(
      [...defined].filter((name) => !classified.has(name)),
      "defined by a tree document and not classified",
    ).toEqual([])
    expect(
      [...classified].filter(
        (name) => !defined.has(name) && !NODE_TYPES_OF_AST_MD.has(name),
      ),
      "classified and defined by no tree document",
    ).toEqual([])
  })

  it("classify no node type twice", () => {
    expect(
      [...VALUE_NODE_TYPES].filter((name) => STRUCTURE_NODE_TYPES.has(name)),
    ).toEqual([])
  })
})
