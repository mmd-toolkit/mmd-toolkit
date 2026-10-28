import { readFileSync, readdirSync } from "node:fs"
import { describe, expect, expectTypeOf, it } from "vitest"
import type { Node, Visitor, VisitorKeys } from "../src/index.ts"
import { parse, traverseNodes, visitorKeys } from "../src/index.ts"
import { allNodeTypes, holdsNode } from "./helpers/node-types.ts"

// Expectations come from ast.md, Nodes: the child fields of each node type,
// and what a tool that walks the tree visits.

/** A text with frontmatter, a directive, a comment, and three tokens of the diagram. */
const text = "---\na: 1\n---\n%%{init: {}}%%\n%% c\nerror %% x\n"

/** The calls a walk makes, as `enter` or `leave`, the node's type, and the parent's type. */
function walk(node: Node): [string, string, string | null][] {
  const calls: [string, string, string | null][] = []
  const visitor: Visitor = {
    enterNode(entered, parent) {
      calls.push(["enter", entered.type, parent?.type ?? null])
    },
    leaveNode(left, parent) {
      calls.push(["leave", left.type, parent?.type ?? null])
    },
  }
  traverseNodes(node, visitor)
  return calls
}

/** The start of the sentence that names the child fields of a node type. */
const CHILD_FIELDS = "Child fields: "

/** The sentence of a node type without child fields. */
const NO_CHILD_FIELDS = "No child fields."

/** The documents that define the node types: ast.md and those of the diagram types, in English. */
function nodeTypeDocuments(): string[] {
  const directory = new URL("../../spec/docs/ast/", import.meta.url)
  const diagrams = readdirSync(directory)
    .filter((name) => name.endsWith(".md") && !name.endsWith(".ja.md"))
    .map((name) => readFileSync(new URL(name, directory), "utf8"))
  return [
    readFileSync(new URL("../../spec/docs/ast.md", import.meta.url), "utf8"),
    ...diagrams,
  ]
}

/** The node types that a heading names, as `A`, `A and B`, or `A, B, and C`. */
function nodeTypesOfHeading(heading: string): string[] {
  return heading
    .split(", ")
    .flatMap((part) => part.split(" and "))
    .map((part) => (part.startsWith("and ") ? part.slice("and ".length) : part))
    .filter((name) => Object.hasOwn(visitorKeys, name))
}

/**
 * ast.md, Nodes: the child fields that a sentence states, given the text of
 * a section from the start of the sentence on: `Child fields:` and the
 * names in code spans, separated by `, ` and ended by a period, or
 * `No child fields.`; null when the sentence has another form.
 */
function childFieldsOf(statement: string): string[] | null {
  if (statement.startsWith(NO_CHILD_FIELDS)) return []
  let rest = statement.slice(CHILD_FIELDS.length)
  const fields: string[] = []
  for (;;) {
    if (!rest.startsWith("`")) return null
    const end = rest.indexOf("`", 1)
    if (end === -1) return null
    fields.push(rest.slice(1, end))
    rest = rest.slice(end + 1)
    if (rest.startsWith(".")) return fields
    if (!rest.startsWith(", ")) return null
    rest = rest.slice(", ".length)
  }
}

/**
 * ast.md, Nodes: the child fields that the section of each node type
 * states, by node type, and what keeps a section from stating them once:
 * no sentence or two, a sentence of another form, or a node type that two
 * sections name. A section runs from its heading to the next heading, and
 * its lines are read as one text.
 */
function statedChildFields(): {
  readonly fields: Map<string, string[]>
  readonly problems: string[]
} {
  const fields = new Map<string, string[]>()
  const problems: string[] = []
  for (const document of nodeTypeDocuments()) {
    const sections = document.split("\n#")
    for (const section of sections) {
      const headingEnd = section.indexOf("\n")
      const heading = section.slice(0, headingEnd)
      const types = nodeTypesOfHeading(heading.slice(heading.indexOf(" ") + 1))
      if (types.length === 0) continue
      const body = section
        .slice(headingEnd + 1)
        .split("\n")
        .join(" ")
      const starts = [CHILD_FIELDS, NO_CHILD_FIELDS].flatMap((sentence) => {
        const found: number[] = []
        for (let at = body.indexOf(sentence); at !== -1;) {
          found.push(at)
          at = body.indexOf(sentence, at + sentence.length)
        }
        return found
      })
      if (starts.length !== 1) {
        for (const type of types) {
          problems.push(`${type}: ${starts.length} sentences of child fields`)
        }
        continue
      }
      const stated = childFieldsOf(body.slice(starts[0]))
      for (const type of types) {
        if (stated === null) {
          problems.push(`${type}: a sentence of child fields of another form`)
        } else if (fields.has(type)) {
          problems.push(`${type}: named by two sections`)
        } else {
          fields.set(type, stated)
        }
      }
    }
  }
  return { fields, problems }
}

describe("visitorKeys", () => {
  it("has exactly the node types of ast.md and of each diagram type as its keys", () => {
    expectTypeOf<keyof VisitorKeys>().toEqualTypeOf<Node["type"]>()
    expect(Object.keys(visitorKeys).sort()).toEqual([...allNodeTypes].sort())
  })

  it("lists the child fields of the node types of ast.md", () => {
    expect(visitorKeys.Root).toEqual(["body"])
    expect(visitorKeys.ErrorDiagram).toEqual([])
  })

  it("lists exactly the fields that hold nodes", () => {
    const root = parse(text)
    for (const node of [root, root.body]) {
      // `Root.tokens` is a list, not a child field. Its tokens have the
      // type of their kind, and `Identifier` is a node type too (ast.md,
      // Shared leaf nodes), so the list is left out here.
      const fieldsWithNodes = Object.entries(node)
        .filter(([field]) => !(node.type === "Root" && field === "tokens"))
        .filter(([, value]) => holdsNode(value))
        .map(([field]) => field)
      expect(fieldsWithNodes, `child fields of ${node.type}`).toEqual(
        visitorKeys[node.type],
      )
    }
  })

  // ast.md, Nodes: the section of each node type states its child fields in
  // the order of the visit. That the child nodes meet in source order, in
  // that order, is checked on every recorded tree by `@mmd-toolkit/tests`
  // (`check-tree-corpus.test.ts`).
  it("lists the child fields that the section of each node type states, in its order", () => {
    const { fields, problems } = statedChildFields()
    expect(problems).toEqual([])
    expect(Object.fromEntries(fields)).toEqual({ ...visitorKeys })
  })
})

describe("traverseNodes", () => {
  it("enters a node before its child nodes and leaves it after them, with the parent of each", () => {
    expect(walk(parse(text))).toEqual([
      ["enter", "Root", null],
      ["enter", "ErrorDiagram", "Root"],
      ["leave", "ErrorDiagram", "Root"],
      ["leave", "Root", null],
    ])
  })

  it("passes the nodes themselves, and null as the parent of the node it starts at", () => {
    const root = parse(text)
    const entered: [Node, Node | null][] = []
    const left: [Node, Node | null][] = []
    traverseNodes(root, {
      enterNode(node, parent) {
        entered.push([node, parent])
      },
      leaveNode(node, parent) {
        left.push([node, parent])
      },
    })
    expect(entered).toHaveLength(2)
    expect(entered[0][0]).toBe(root)
    expect(entered[0][1]).toBeNull()
    expect(entered[1][0]).toBe(root.body)
    expect(entered[1][1]).toBe(root)
    expect(left[0][0]).toBe(root.body)
    expect(left[0][1]).toBe(root)
    expect(left[1][0]).toBe(root)
    expect(left[1][1]).toBeNull()
    // A walk can start at any node.
    expect(walk(root.body)).toEqual([
      ["enter", "ErrorDiagram", null],
      ["leave", "ErrorDiagram", null],
    ])
  })

  it("visits no token, comment, directive, or frontmatter", () => {
    const root = parse(text)
    expect(root.frontmatter).not.toBeNull()
    // The three tokens of the frontmatter, the directive, and the three
    // tokens of the diagram.
    expect(root.tokens).toHaveLength(7)
    expect(root.comments).toHaveLength(1)
    expect(root.directives).toHaveLength(1)
    expect(walk(root).map(([, type]) => type)).toEqual([
      "Root",
      "ErrorDiagram",
      "ErrorDiagram",
      "Root",
    ])
  })
})
