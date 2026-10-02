import { describe, expect, expectTypeOf, it } from "vitest"
import type {
  FlowchartAccDescrBlockStatement,
  FlowchartAccDescrStatement,
  FlowchartAccTitleStatement,
  FlowchartArrow,
  FlowchartArrowMarker,
  FlowchartClassDefStatement,
  FlowchartClassStatement,
  FlowchartClickCallbackStatement,
  FlowchartClickUrlStatement,
  FlowchartDataBlock,
  FlowchartDefaultLinkStyleStatement,
  FlowchartDiagram,
  FlowchartDirectionStatement,
  FlowchartEmptyStatement,
  FlowchartLabel,
  FlowchartLabelKind,
  FlowchartLink,
  FlowchartLinkStyleStatement,
  FlowchartOpeningArrow,
  FlowchartShape,
  FlowchartShapeProperty,
  FlowchartStatement,
  FlowchartStyleStatement,
  FlowchartSubgraphStatement,
  FlowchartVertex,
  FlowchartVertexGroup,
  FlowchartVertexStatement,
  FlowchartIgnoredText,
  FlowchartLiteral,
  Identifier,
  Node,
  NodeBase,
  NumericLiteral,
  StringLiteral,
} from "../src/index.ts"
import { traverseNodes, visitorKeys } from "../src/index.ts"
import {
  allFlowchartNodeTypes,
  holdsNode,
  sharedLeafNodeTypes,
} from "./helpers/node-types.ts"

// Expectations come from ast/flowchart.md: the fields and the child fields
// of each node type. The checks on types run in the type checker.

/** The fields every node has. */
type NodeFields = "type" | "range" | "loc"

/** A place for a node of a tree made by hand; these tests do not look at it. */
const place: Pick<NodeBase, "range" | "loc"> = {
  range: [0, 0],
  loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 0 } },
}

/** A label of the tree made by hand. */
function label(kind: FlowchartLabelKind, value: string): FlowchartLabel {
  return { type: "FlowchartLabel", kind, value, ...place }
}

/** An Identifier of the tree made by hand. */
function identifier(name: string): Identifier {
  return { type: "Identifier", name, ...place }
}

/** A FlowchartLiteral of the tree made by hand. */
function literal(value: string): FlowchartLiteral {
  return { type: "FlowchartLiteral", value, ...place }
}

/** A FlowchartIgnoredText of the tree made by hand. */
function ignoredText(value: string): FlowchartIgnoredText {
  return { type: "FlowchartIgnoredText", value, ...place }
}

/** A StringLiteral of the tree made by hand. */
function stringLiteral(value: string): StringLiteral {
  return {
    type: "StringLiteral",
    value,
    raw: `"${value}"`,
    closed: true,
    ...place,
  }
}

/** A NumericLiteral of the tree made by hand. */
function numericLiteral(value: number): NumericLiteral {
  return { type: "NumericLiteral", value, raw: String(value), ...place }
}

/** A vertex of the tree made by hand. */
function vertex(
  id: string,
  shape: FlowchartShape | null,
  cssClass: string | null,
  data: readonly FlowchartDataBlock[],
): FlowchartVertex {
  return {
    type: "FlowchartVertex",
    id: identifier(id),
    shape,
    cssClass: cssClass === null ? null : identifier(cssClass),
    data,
    ...place,
  }
}

/** A vertex group of the tree made by hand. */
function group(...vertices: FlowchartVertex[]): FlowchartVertexGroup {
  return { type: "FlowchartVertexGroup", vertices, ...place }
}

/**
 * A tree with every flowchart node type, and with every child field both
 * set and, where it can be, null, and a list with a null element. It
 * stands for this text:
 *
 *     flowchart LR
 *     A[|borders:lt|x] & B:::c@{ shape: rect } e1@--> C -- u --> D[y]
 *     subgraph S [T]
 *     direction TB
 *     ;
 *     end
 *     subgraph U
 *     end
 *     style A fill:#f00,
 *     classDef c,,d fill:#f00
 *     class A c
 *     click A cb
 *     click A call cb(1) "tip"
 *     click A "u" "tip" _blank
 *     click A "u"
 *     linkStyle 0 interpolate basis stroke:red
 *     linkStyle default interpolate basis stroke:blue
 *     accTitle: t
 *     accDescr: d
 *     accDescr { e }
 */
const diagram: FlowchartDiagram = {
  type: "FlowchartDiagram",
  direction: "LR",
  body: [
    {
      type: "FlowchartVertexStatement",
      first: group(
        vertex(
          "A",
          {
            type: "FlowchartShape",
            name: "rectangle",
            property: {
              type: "FlowchartShapeProperty",
              name: identifier("borders"),
              value: identifier("lt"),
              ...place,
            },
            label: label("text", "x"),
            ...place,
          },
          null,
          [],
        ),
        vertex("B", null, "c", [
          {
            type: "FlowchartDataBlock",
            value: " shape: rect ",
            ...place,
          },
        ]),
      ),
      links: [
        {
          type: "FlowchartLink",
          id: identifier("e1"),
          opening: null,
          arrow: {
            type: "FlowchartArrow",
            value: "-->",
            startMarker: "none",
            line: "solid",
            length: 2,
            endMarker: "arrow",
            ...place,
          },
          label: null,
          target: group(vertex("C", null, null, [])),
          ...place,
        },
        {
          type: "FlowchartLink",
          id: null,
          opening: {
            type: "FlowchartOpeningArrow",
            value: "--",
            startMarker: "none",
            line: "solid",
            ...place,
          },
          arrow: {
            type: "FlowchartArrow",
            value: "-->",
            startMarker: "none",
            line: "solid",
            length: 2,
            endMarker: "arrow",
            ...place,
          },
          label: label("text", "u"),
          target: group(
            vertex(
              "D",
              {
                type: "FlowchartShape",
                name: "rectangle",
                property: null,
                label: label("text", "y"),
                ...place,
              },
              null,
              [],
            ),
          ),
          ...place,
        },
      ],
      ...place,
    },
    {
      type: "FlowchartSubgraphStatement",
      name: label("text", "S "),
      title: label("text", "T"),
      body: [
        {
          type: "FlowchartDirectionStatement",
          textBefore: ignoredText("A-->B"),
          direction: "TB",
          textAfter: ignoredText("x"),
          ...place,
        },
        { type: "FlowchartEmptyStatement", ...place },
      ],
      ...place,
    },
    {
      type: "FlowchartSubgraphStatement",
      name: label("text", "U"),
      title: null,
      body: [],
      ...place,
    },
    {
      type: "FlowchartStyleStatement",
      id: identifier("A"),
      styles: [literal("fill:#f00"), null],
      ...place,
    },
    {
      type: "FlowchartClassDefStatement",
      cssClasses: [identifier("c"), null, identifier("d")],
      styles: [literal("fill:#f00")],
      ...place,
    },
    {
      type: "FlowchartClassStatement",
      ids: [identifier("A")],
      cssClass: identifier("c"),
      ...place,
    },
    {
      type: "FlowchartClickCallbackStatement",
      ids: [identifier("A")],
      callback: identifier("cb"),
      arguments: null,
      tooltip: null,
      ...place,
    },
    {
      type: "FlowchartClickCallbackStatement",
      ids: [identifier("A")],
      callback: identifier("cb"),
      arguments: literal("1"),
      tooltip: stringLiteral("tip"),
      ...place,
    },
    {
      type: "FlowchartClickUrlStatement",
      ids: [identifier("A")],
      url: stringLiteral("u"),
      tooltip: stringLiteral("tip"),
      target: "_blank",
      ...place,
    },
    {
      type: "FlowchartClickUrlStatement",
      ids: [identifier("A")],
      url: stringLiteral("u"),
      tooltip: null,
      target: null,
      ...place,
    },
    {
      type: "FlowchartLinkStyleStatement",
      indices: [numericLiteral(0)],
      interpolate: identifier("basis"),
      styles: [literal("stroke:red")],
      ...place,
    },
    {
      type: "FlowchartDefaultLinkStyleStatement",
      interpolate: identifier("basis"),
      styles: [literal("stroke:blue")],
      ...place,
    },
    { type: "FlowchartAccTitleStatement", value: literal("t"), ...place },
    { type: "FlowchartAccDescrStatement", value: literal("d"), ...place },
    {
      type: "FlowchartAccDescrBlockStatement",
      value: literal("e"),
      closed: true,
      ...place,
    },
  ],
  ...place,
}

/** Every node of the tree under `node`, itself included, in the order of a walk. */
function nodesOf(node: Node): Node[] {
  const nodes: Node[] = []
  traverseNodes(node, {
    enterNode(entered) {
      nodes.push(entered)
    },
    leaveNode() {
      // Nothing to do on the way back.
    },
  })
  return nodes
}

describe("the flowchart node types", () => {
  it("have the fields of ast/flowchart.md", () => {
    expectTypeOf<keyof FlowchartDiagram>().toEqualTypeOf<
      NodeFields | "direction" | "body"
    >()
    expectTypeOf<keyof FlowchartEmptyStatement>().toEqualTypeOf<NodeFields>()
    expectTypeOf<keyof FlowchartVertexStatement>().toEqualTypeOf<
      NodeFields | "first" | "links"
    >()
    expectTypeOf<keyof FlowchartVertexGroup>().toEqualTypeOf<
      NodeFields | "vertices"
    >()
    expectTypeOf<keyof FlowchartVertex>().toEqualTypeOf<
      NodeFields | "id" | "shape" | "cssClass" | "data"
    >()
    expectTypeOf<keyof FlowchartShape>().toEqualTypeOf<
      NodeFields | "name" | "property" | "label"
    >()
    expectTypeOf<keyof FlowchartShapeProperty>().toEqualTypeOf<
      NodeFields | "name" | "value"
    >()
    expectTypeOf<keyof FlowchartLink>().toEqualTypeOf<
      NodeFields | "id" | "opening" | "arrow" | "label" | "target"
    >()
    expectTypeOf<keyof FlowchartArrow>().toEqualTypeOf<
      NodeFields | "value" | "startMarker" | "line" | "length" | "endMarker"
    >()
    expectTypeOf<keyof FlowchartOpeningArrow>().toEqualTypeOf<
      NodeFields | "value" | "startMarker" | "line"
    >()
    expectTypeOf<FlowchartArrowMarker>().toEqualTypeOf<
      "none" | "arrow" | "cross" | "circle"
    >()
    expectTypeOf<FlowchartArrow["line"]>().toEqualTypeOf<
      "solid" | "thick" | "dotted" | "invisible"
    >()
    expectTypeOf<FlowchartOpeningArrow["line"]>().toEqualTypeOf<
      "solid" | "thick" | "dotted"
    >()
    expectTypeOf<keyof FlowchartLabel>().toEqualTypeOf<
      NodeFields | "kind" | "value"
    >()
    expectTypeOf<keyof FlowchartDataBlock>().toEqualTypeOf<
      NodeFields | "value"
    >()
    expectTypeOf<keyof FlowchartSubgraphStatement>().toEqualTypeOf<
      NodeFields | "name" | "title" | "body"
    >()
    expectTypeOf<keyof FlowchartStyleStatement>().toEqualTypeOf<
      NodeFields | "id" | "styles"
    >()
    expectTypeOf<keyof FlowchartClassDefStatement>().toEqualTypeOf<
      NodeFields | "cssClasses" | "styles"
    >()
    expectTypeOf<keyof FlowchartClassStatement>().toEqualTypeOf<
      NodeFields | "ids" | "cssClass"
    >()
    expectTypeOf<keyof FlowchartClickCallbackStatement>().toEqualTypeOf<
      NodeFields | "ids" | "callback" | "arguments" | "tooltip"
    >()
    expectTypeOf<keyof FlowchartClickUrlStatement>().toEqualTypeOf<
      NodeFields | "ids" | "url" | "tooltip" | "target"
    >()
    expectTypeOf<keyof FlowchartLinkStyleStatement>().toEqualTypeOf<
      NodeFields | "indices" | "interpolate" | "styles"
    >()
    expectTypeOf<keyof FlowchartDefaultLinkStyleStatement>().toEqualTypeOf<
      NodeFields | "interpolate" | "styles"
    >()
    expectTypeOf<keyof FlowchartDirectionStatement>().toEqualTypeOf<
      NodeFields | "textBefore" | "direction" | "textAfter"
    >()
    expectTypeOf<keyof FlowchartAccTitleStatement>().toEqualTypeOf<
      NodeFields | "value"
    >()
    expectTypeOf<keyof FlowchartAccDescrStatement>().toEqualTypeOf<
      NodeFields | "value"
    >()
    expectTypeOf<keyof FlowchartAccDescrBlockStatement>().toEqualTypeOf<
      NodeFields | "value" | "closed"
    >()
    expectTypeOf<keyof FlowchartLiteral>().toEqualTypeOf<NodeFields | "value">()
    expectTypeOf<keyof FlowchartIgnoredText>().toEqualTypeOf<
      NodeFields | "value"
    >()
    expect(Object.keys(allFlowchartNodeTypes)).toHaveLength(26)
  })

  it("hold the values that the author writes as shared leaf nodes", () => {
    expectTypeOf<FlowchartVertex["id"]>().toEqualTypeOf<Identifier>()
    expectTypeOf<
      FlowchartVertex["cssClass"]
    >().toEqualTypeOf<Identifier | null>()
    expectTypeOf<FlowchartShapeProperty["name"]>().toEqualTypeOf<Identifier>()
    expectTypeOf<FlowchartShapeProperty["value"]>().toEqualTypeOf<Identifier>()
    expectTypeOf<FlowchartLink["id"]>().toEqualTypeOf<Identifier | null>()
    expectTypeOf<FlowchartStyleStatement["id"]>().toEqualTypeOf<Identifier>()
    expectTypeOf<FlowchartStyleStatement["styles"]>().toEqualTypeOf<
      readonly (FlowchartLiteral | null)[]
    >()
    expectTypeOf<FlowchartClassDefStatement["cssClasses"]>().toEqualTypeOf<
      readonly (Identifier | null)[]
    >()
    expectTypeOf<FlowchartClassStatement["ids"]>().toEqualTypeOf<
      readonly (Identifier | null)[]
    >()
    expectTypeOf<
      FlowchartClassStatement["cssClass"]
    >().toEqualTypeOf<Identifier>()
    expectTypeOf<FlowchartClickCallbackStatement["ids"]>().toEqualTypeOf<
      readonly (Identifier | null)[]
    >()
    expectTypeOf<
      FlowchartClickCallbackStatement["callback"]
    >().toEqualTypeOf<Identifier>()
    expectTypeOf<
      FlowchartClickCallbackStatement["arguments"]
    >().toEqualTypeOf<FlowchartLiteral | null>()
    expectTypeOf<
      FlowchartClickCallbackStatement["tooltip"]
    >().toEqualTypeOf<StringLiteral | null>()
    expectTypeOf<
      FlowchartClickUrlStatement["url"]
    >().toEqualTypeOf<StringLiteral>()
    expectTypeOf<
      FlowchartClickUrlStatement["tooltip"]
    >().toEqualTypeOf<StringLiteral | null>()
    expectTypeOf<FlowchartLinkStyleStatement["indices"]>().toEqualTypeOf<
      readonly NumericLiteral[]
    >()
    expectTypeOf<
      FlowchartLinkStyleStatement["interpolate"]
    >().toEqualTypeOf<Identifier | null>()
    expectTypeOf<FlowchartDefaultLinkStyleStatement["styles"]>().toEqualTypeOf<
      readonly (FlowchartLiteral | null)[]
    >()
    expectTypeOf<
      FlowchartAccTitleStatement["value"]
    >().toEqualTypeOf<FlowchartLiteral | null>()
    expectTypeOf<
      FlowchartAccDescrStatement["value"]
    >().toEqualTypeOf<FlowchartLiteral | null>()
    expectTypeOf<
      FlowchartAccDescrBlockStatement["value"]
    >().toEqualTypeOf<FlowchartLiteral | null>()
  })

  it("make FlowchartStatement the fourteen statement types", () => {
    expectTypeOf<FlowchartStatement["type"]>().toEqualTypeOf<
      | "FlowchartEmptyStatement"
      | "FlowchartVertexStatement"
      | "FlowchartSubgraphStatement"
      | "FlowchartStyleStatement"
      | "FlowchartClassDefStatement"
      | "FlowchartClassStatement"
      | "FlowchartClickCallbackStatement"
      | "FlowchartClickUrlStatement"
      | "FlowchartLinkStyleStatement"
      | "FlowchartDefaultLinkStyleStatement"
      | "FlowchartDirectionStatement"
      | "FlowchartAccTitleStatement"
      | "FlowchartAccDescrStatement"
      | "FlowchartAccDescrBlockStatement"
    >()
  })

  it("all start with the name of the diagram type", () => {
    for (const type of Object.keys(allFlowchartNodeTypes)) {
      expect(type.startsWith("Flowchart"), type).toBe(true)
    }
  })
})

describe("the visitor keys of the flowchart nodes", () => {
  it("are the child fields of ast/flowchart.md, in its order", () => {
    const flowchartKeys = Object.fromEntries(
      Object.entries(visitorKeys).filter(([type]) =>
        Object.hasOwn(allFlowchartNodeTypes, type),
      ),
    )
    expect(flowchartKeys).toEqual({
      FlowchartDiagram: ["body"],
      FlowchartEmptyStatement: [],
      FlowchartVertexStatement: ["first", "links"],
      FlowchartVertexGroup: ["vertices"],
      FlowchartVertex: ["id", "shape", "cssClass", "data"],
      FlowchartShape: ["property", "label"],
      FlowchartShapeProperty: ["name", "value"],
      FlowchartLink: ["id", "opening", "arrow", "label", "target"],
      FlowchartArrow: [],
      FlowchartOpeningArrow: [],
      FlowchartLabel: [],
      FlowchartDataBlock: [],
      FlowchartSubgraphStatement: ["name", "title", "body"],
      FlowchartStyleStatement: ["id", "styles"],
      FlowchartClassDefStatement: ["cssClasses", "styles"],
      FlowchartClassStatement: ["ids", "cssClass"],
      FlowchartClickCallbackStatement: [
        "ids",
        "callback",
        "arguments",
        "tooltip",
      ],
      FlowchartClickUrlStatement: ["ids", "url", "tooltip"],
      FlowchartLinkStyleStatement: ["indices", "interpolate", "styles"],
      FlowchartDefaultLinkStyleStatement: ["interpolate", "styles"],
      FlowchartDirectionStatement: ["textBefore", "textAfter"],
      FlowchartAccTitleStatement: ["value"],
      FlowchartAccDescrStatement: ["value"],
      FlowchartAccDescrBlockStatement: ["value"],
      FlowchartLiteral: [],
      FlowchartIgnoredText: [],
    })
  })

  it("list exactly the fields that hold nodes", () => {
    const nodes = nodesOf(diagram)
    // The tree has every flowchart node type and every shared leaf node
    // type.
    expect([...new Set(nodes.map((node) => node.type))].sort()).toEqual(
      [...Object.keys(allFlowchartNodeTypes), ...sharedLeafNodeTypes].sort(),
    )
    // Over all nodes of a type, the fields that hold a node are its child
    // fields: a child field may be null in one node, but not in all of them.
    const fieldsWithNodes = new Map<Node["type"], Set<string>>()
    for (const node of nodes) {
      const fields = fieldsWithNodes.get(node.type) ?? new Set<string>()
      for (const [field, value] of Object.entries(node)) {
        if (holdsNode(value)) fields.add(field)
      }
      fieldsWithNodes.set(node.type, fields)
    }
    for (const [type, fields] of fieldsWithNodes) {
      expect([...fields].sort(), `child fields of ${type}`).toEqual(
        [...visitorKeys[type]].sort(),
      )
    }
  })
})

describe("traverseNodes on a flowchart tree", () => {
  it("visits the nodes of the child fields in their order, the nodes of a list in its order, and nothing for a child or an element of a list that is null", () => {
    const lines: string[] = []
    let depth = 0
    traverseNodes(diagram, {
      enterNode(node, parent) {
        lines.push(`${"  ".repeat(depth)}${node.type}`)
        if (depth === 0) expect(parent).toBeNull()
        depth += 1
      },
      leaveNode() {
        depth -= 1
      },
    })
    expect(depth).toBe(0)
    expect(lines).toEqual([
      "FlowchartDiagram",
      "  FlowchartVertexStatement",
      "    FlowchartVertexGroup",
      "      FlowchartVertex",
      "        Identifier",
      "        FlowchartShape",
      "          FlowchartShapeProperty",
      "            Identifier",
      "            Identifier",
      "          FlowchartLabel",
      "      FlowchartVertex",
      "        Identifier",
      "        Identifier",
      "        FlowchartDataBlock",
      "    FlowchartLink",
      "      Identifier",
      "      FlowchartArrow",
      "      FlowchartVertexGroup",
      "        FlowchartVertex",
      "          Identifier",
      "    FlowchartLink",
      "      FlowchartOpeningArrow",
      "      FlowchartArrow",
      "      FlowchartLabel",
      "      FlowchartVertexGroup",
      "        FlowchartVertex",
      "          Identifier",
      "          FlowchartShape",
      "            FlowchartLabel",
      "  FlowchartSubgraphStatement",
      "    FlowchartLabel",
      "    FlowchartLabel",
      "    FlowchartDirectionStatement",
      "      FlowchartIgnoredText",
      "      FlowchartIgnoredText",
      "    FlowchartEmptyStatement",
      "  FlowchartSubgraphStatement",
      "    FlowchartLabel",
      "  FlowchartStyleStatement",
      "    Identifier",
      "    FlowchartLiteral",
      "  FlowchartClassDefStatement",
      "    Identifier",
      "    Identifier",
      "    FlowchartLiteral",
      "  FlowchartClassStatement",
      "    Identifier",
      "    Identifier",
      "  FlowchartClickCallbackStatement",
      "    Identifier",
      "    Identifier",
      "  FlowchartClickCallbackStatement",
      "    Identifier",
      "    Identifier",
      "    FlowchartLiteral",
      "    StringLiteral",
      "  FlowchartClickUrlStatement",
      "    Identifier",
      "    StringLiteral",
      "    StringLiteral",
      "  FlowchartClickUrlStatement",
      "    Identifier",
      "    StringLiteral",
      "  FlowchartLinkStyleStatement",
      "    NumericLiteral",
      "    Identifier",
      "    FlowchartLiteral",
      "  FlowchartDefaultLinkStyleStatement",
      "    Identifier",
      "    FlowchartLiteral",
      "  FlowchartAccTitleStatement",
      "    FlowchartLiteral",
      "  FlowchartAccDescrStatement",
      "    FlowchartLiteral",
      "  FlowchartAccDescrBlockStatement",
      "    FlowchartLiteral",
    ])
  })
})
