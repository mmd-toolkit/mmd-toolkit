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
