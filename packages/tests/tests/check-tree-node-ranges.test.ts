import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import type { CheckedNode, CheckedRoot } from "../src/check-tree/types.ts"
import { CHILD_FIELDS_NOT_IN_SOURCE_ORDER } from "../src/check-tree/invariants.ts"
import { NODE_FIELDS } from "../src/check-tree/node-fields.ts"
import { nodesOf } from "../src/check-tree/walk.ts"
import { copyOf, recordedTree, says, setField } from "./check-tree-recorded.ts"
import type { TreeRange } from "../src/db-from-tree/tree.ts"
import { handMadeRoot, locationOf, tokenOf } from "./check-tree-trees.ts"
import { readTreeDocuments } from "./spec-field-tables.ts"

// positions.md, Invariants: the range of a node runs from the start of a token
// to the end of one, inside its parent, and the child nodes of a node do not
// overlap and are in source order, in a list and in the order of the child
// fields; the body covers the tokens of the diagram.

const FIXTURE = "db-message-activate-target"

/** The first node of `type` of `tree`. */
function nodeOf(type: string, tree: CheckedRoot): CheckedNode {
  const node = nodesOf(tree).find((candidate) => candidate.type === type)
  if (node === undefined) throw new Error(`no ${type}`)
  return node
}

describe("checkTree: the ranges of the nodes", () => {
  const { input, tree } = recordedTree("sequence", FIXTURE)

  it("passes the recorded tree", () => {
    expect(checkTree(input, tree)).toEqual([])
  })

  it("fails a node that starts before its parent", () => {
    // `A` of `A->>+B: x` starts one character early, at the line feed.
    const broken = copyOf(tree)
    setField(nodeOf("SequenceIdentifier", broken), "range", [15, 17])
    expect(
      says(
        checkTree(input, broken),
        "SequenceIdentifier at 15-17: lies outside SequenceMessageStatement at 16-25",
      ),
    ).toBe(true)
  })

  it("fails a node that ends where no token ends", () => {
    const broken = copyOf(tree)
    setField(nodeOf("SequenceIdentifier", broken), "range", [16, 18])
    expect(
      says(
        checkTree(input, broken),
        "SequenceIdentifier at 16-18: does not run from the start of a token to the end of a token",
      ),
    ).toBe(true)
  })

  it("fails child nodes that overlap", () => {
    // `A` ends one character into the arrow after it.
    const broken = copyOf(tree)
    setField(nodeOf("SequenceIdentifier", broken), "range", [16, 18])
    expect(
      says(
        checkTree(input, broken),
        "SequenceArrow at 17-20: overlaps the child node SequenceIdentifier at 16-18 of SequenceMessageStatement at 16-25",
      ),
    ).toBe(true)
  })

  it("fails a list that is not in source order", () => {
    // The two message statements of the body change places.
    const broken = copyOf(tree)
    const body = broken.body.body as CheckedNode[]
    body.reverse()
    expect(
      says(
        checkTree(input, broken),
        "SequenceMessageStatement at 16-25: comes before the child node SequenceMessageStatement at 26-36 of SequenceDiagram at 0-36, which the child fields list before it",
      ),
    ).toBe(true)
  })

  it("fails child fields that are not in source order", () => {
    // The two names of the first message change places: `from` is `B`.
    const broken = copyOf(tree)
    const message = nodeOf("SequenceMessageStatement", broken)
    const { from, to } = message
    setField(message, "from", to)
    setField(message, "to", from)
    expect(
      says(
        checkTree(input, broken),
        "SequenceArrow at 17-20: comes before the child node SequenceIdentifier at 21-22 of SequenceMessageStatement at 16-25, which the child fields list before it",
      ),
    ).toBe(true)
  })

  it("excepts from the order of the child fields the node types that the tree documents except", () => {
    // Each tree document says that the child fields of its nodes are in source
    // order, and names the node types it excepts from that.
    const excepted = new Set<string>()
    let sentences = 0
    for (const text of readTreeDocuments()) {
      const flat = text.replaceAll(/\s+/gu, " ")
      const found =
        /The child fields of every node below are in source order(?:, except ([^(]*))?/u.exec(
          flat,
        )
      if (found === null) continue
      sentences++
      for (const word of found[1]?.match(/[A-Z][A-Za-z]+/gu) ?? []) {
        if (Object.hasOwn(NODE_FIELDS, word)) excepted.add(word)
      }
    }
    expect(sentences).toBeGreaterThan(0)
    expect([...excepted].sort()).toEqual(
      [...CHILD_FIELDS_NOT_IN_SOURCE_ORDER.keys()].sort(),
    )
  })

  it("fails a tree whose text has no token", () => {
    const source = "  \n"
    expect(checkTree(source, handMadeRoot(source, { tokens: [] }))).toEqual([
      {
        where: "ErrorDiagram at 0-0",
        message: "does not run from the start of a token to the end of a token",
      },
      { where: "Root.body", message: "has no token" },
    ])
  })

  it("fails a body of a type that is no diagram", () => {
    const source = "error"
    const root = handMadeRoot(source, {
      bodyType: "StringLiteral",
      tokens: [["RawText", "error"]],
    })
    expect(
      says(
        checkTree(source, root),
        "Root.body: the body type StringLiteral is no diagram of the specification",
      ),
    ).toBe(true)
  })
})

// ast.md, Nodes: the child fields of a node are in source order, except for the
// nodes of `CHILD_FIELDS_NOT_IN_SOURCE_ORDER` (`src/check-tree/invariants.ts`),
// whose document says otherwise.

describe("checkTree: the nodes whose child fields are not in source order", () => {
  it("accepts the label of a FlowchartLink written before its arrow (ast/flowchart.md, FlowchartLink)", () => {
    // `A<-- t -->B`: the label `t` lies between the opening arrow and the
    // closing one, and `label` comes after `arrow` among the child fields.
    const { input, tree } = recordedTree("flowchart", "db-arrow-double")
    const link = nodeOf("FlowchartLink", tree)
    const label = link.label as CheckedNode
    const arrow = link.arrow as CheckedNode
    expect(label.range[0]).toBeLessThan(arrow.range[0])
    expect(checkTree(input, tree)).toEqual([])
  })

  /** A part of a click statement: the ids `a`, the call `call f()`, or the link `href "u"`. */
  type ClickPart = "ids" | "call" | "href"

  /**
   * A tree made by hand for the source `gantt`, a line feed, `click`, and the
   * parts in the order `order`. The child fields of the statement are `ids`,
   * `call`, and `href` whatever the order.
   */
  function clickTree(order: readonly ClickPart[]): {
    source: string
    tree: CheckedRoot
  } {
    const source = `gantt\nclick ${order
      .map((part) =>
        part === "ids" ? "a" : part === "call" ? "call f()" : 'href "u"',
      )
      .join(" ")}`
    let cursor = 0
    const tokens: ReturnType<typeof tokenOf>[] = []

    /** The token of the next `text`, in the order of the source. */
    function token(type: string, text: string): ReturnType<typeof tokenOf> {
      const found = tokenOf(source, type, { text, from: cursor })
      tokens.push(found)
      cursor = found.range[1]
      return found
    }

    /** A node of `type` over `range`, with the fields `fields`. */
    function node(
      type: string,
      range: TreeRange,
      fields: Record<string, unknown>,
    ): CheckedNode {
      return { type, range, loc: locationOf(source, range), ...fields }
    }

    const header = token("Keyword", "gantt")
    const click = token("Keyword", "click")
    const parts: Record<ClickPart, CheckedNode | null> = {
      ids: null,
      call: null,
      href: null,
    }
    for (const part of order) {
      if (part === "ids") {
        const id = token("Identifier", "a")
        parts.ids = node("Identifier", id.range, { name: "a" })
      } else if (part === "call") {
        const keyword = token("Keyword", "call")
        const name = token("RawText", "f")
        token("Punctuator", "(")
        const close = token("Punctuator", ")")
        parts.call = node("GanttCallback", [keyword.range[0], close.range[1]], {
          name: node("GanttLiteral", name.range, { value: "f" }),
          args: null,
        })
      } else {
        token("Keyword", "href")
        const string = token("String", '"u"')
        parts.href = node("StringLiteral", string.range, {
          value: "u",
          raw: '"u"',
          closed: true,
        })
      }
    }
    const last = tokens.at(-1)
    if (last === undefined) throw new Error("no token")
    const statement = node(
      "GanttClickStatement",
      [click.range[0], last.range[1]],
      { ids: [parts.ids], call: parts.call, href: parts.href },
    )
    const whole: TreeRange = [0, source.length]
    return {
      source,
      tree: {
        type: "Root",
        diagramType: "gantt",
        range: whole,
        loc: locationOf(source, whole),
        body: node("GanttDiagram", [header.range[0], last.range[1]], {
          body: [statement],
        }),
        frontmatter: null,
        comments: [],
        directives: [],
        tokens,
      },
    }
  }

  it("accepts the link of a GanttClickStatement written before its call (ast/gantt.md, GanttClickStatement)", () => {
    const { source, tree } = clickTree(["ids", "href", "call"])
    expect(checkTree(source, tree)).toEqual([])
  })

  it("accepts the link of a GanttClickStatement written after its call", () => {
    const { source, tree } = clickTree(["ids", "call", "href"])
    expect(checkTree(source, tree)).toEqual([])
  })

  it("fails the ids of a GanttClickStatement written after a part, which stay first among the child fields", () => {
    // The document fixes `ids`, `call`, `href` as the child fields; it allows
    // the link before the call, and no other order of the source.
    for (const order of [
      ["call", "ids", "href"],
      ["href", "ids", "call"],
      ["call", "href", "ids"],
    ] as const) {
      const { source, tree } = clickTree(order)
      expect(
        says(checkTree(source, tree), "which the child fields list before it"),
        order.join(" "),
      ).toBe(true)
    }
  })
})
