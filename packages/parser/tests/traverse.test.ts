import { describe, expect, expectTypeOf, it } from "vitest"
import { loadFixtures } from "@mmd-toolkit/tests"
import type {
  FlowchartLink,
  Node,
  Root,
  Visitor,
  VisitorKeys,
} from "../src/index.ts"
import {
  ParseError,
  UnsupportedDiagramError,
  parse,
  traverseNodes,
  visitorKeys,
} from "../src/index.ts"
import { allNodeTypes, holdsNode } from "./helpers/node-types.ts"
import { RECORDED_DIAGRAMS } from "./helpers/recorded-diagrams.ts"

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

/**
 * ast.md, Nodes: the child nodes of `parent`, `children` in the order of
 * its child fields, put in source order. That is the order of the child
 * fields, except in the one node that a document names: ast/flowchart.md,
 * FlowchartLink, whose `label`, written between `opening` and `arrow`, is
 * visited after `arrow`.
 */
function inSourceOrder(parent: Node, children: readonly Node[]): Node[] {
  if (parent.type !== "FlowchartLink") return [...children]
  const { opening, arrow, label }: FlowchartLink = parent
  if (opening === null || label === null) return [...children]
  return children.map((child) => {
    if (child === arrow) return label
    if (child === label) return arrow
    return child
  })
}

/**
 * The child nodes of `root` that overlap the child node of the same parent
 * before them in source order ({@link inSourceOrder}), or come before it,
 * each as its type and range.
 */
function childrenOutOfOrder(root: Root): string[] {
  const childrenOf = new Map<Node, Node[]>()
  traverseNodes(root, {
    enterNode(node, parent) {
      if (parent === null) return
      childrenOf.set(parent, [...(childrenOf.get(parent) ?? []), node])
    },
    leaveNode() {
      // Nothing to do on the way back.
    },
  })
  const outOfOrder: string[] = []
  for (const [parent, children] of childrenOf) {
    let lastEnd = parent.range[0]
    for (const child of inSourceOrder(parent, children)) {
      if (child.range[0] < lastEnd) {
        outOfOrder.push(`${child.type} at ${child.range.join("-")}`)
      }
      lastEnd = child.range[1]
    }
  }
  return outOfOrder
}

/** The tree of `source`, or null when `parse()` rejects it or does not support its diagram type. */
function treeOf(source: string): Root | null {
  try {
    return parse(source)
  } catch (error) {
    if (
      error instanceof ParseError ||
      error instanceof UnsupportedDiagramError
    ) {
      return null
    }
    throw error
  }
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

  it("lists the child fields in source order, in every tree of the fixtures", async () => {
    // ast.md, Nodes: a tool that walks the child fields in the order of
    // `visitorKeys` meets the child nodes in source order, but in the node
    // that a document names (see `inSourceOrder`).
    let trees = 0
    for (const diagram of RECORDED_DIAGRAMS) {
      for (const fixture of await loadFixtures(diagram)) {
        const root = treeOf(fixture.input)
        if (root === null) continue
        trees += 1
        expect(childrenOutOfOrder(root), `${diagram}/${fixture.name}`).toEqual(
          [],
        )
      }
    }
    // Guards against the check passing vacuously.
    expect(trees).toBeGreaterThan(0)
  })

  it("finds child nodes out of source order", () => {
    const root = parse("flowchart LR\nA-->B-->C")
    if (root.body.type !== "FlowchartDiagram") throw new Error("no flowchart")
    const [statement] = root.body.body
    if (statement.type !== "FlowchartVertexStatement") {
      throw new Error("no vertex statement")
    }
    const reversed = { ...statement, links: [...statement.links].reverse() }
    const broken: Root = {
      ...root,
      body: { ...root.body, body: [reversed] },
    }
    expect(childrenOutOfOrder(broken)).toEqual(["FlowchartLink at 14-18"])
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
