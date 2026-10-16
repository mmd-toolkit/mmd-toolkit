import { describe, expect, it } from "vitest"
import type { DbTreeRoot } from "../src/db-from-tree/index.ts"
import { dbFromTree } from "../src/db-from-tree/index.ts"
import type {
  TreeNode,
  TreeRange,
  TreeToken,
} from "../src/db-from-tree/tree.ts"
import { embeddedValuesOf, loadFixtures } from "../src/index.ts"
import { cssSupportsColor } from "../src/normalizers/browser-stand-ins.ts"
import { scanSource } from "../src/source-scan.ts"
import type { CheckedRoot } from "../src/check-tree/types.ts"
import { WrittenText } from "../src/check-tree/written-text.ts"
import { nodesOf } from "../src/check-tree/walk.ts"
import { checkShape } from "../src/check-tree/shape.ts"
import { Problems } from "../src/check-tree/problems.ts"
import { commentOf, directiveOf, locationOf } from "./check-tree-trees.ts"
import { setField } from "./check-tree-recorded.ts"

// Fixed fixture inputs, with their statements spelled out by hand. This is
// not a parser: each case gives every node, shape, link, and list explicitly.
// Ordinary tokens are not needed by dbFromTree; only ignored semicolons are.

interface NodeSpec {
  readonly id: string
  readonly shape?: readonly [open: string, label: string, close: string]
  readonly directions?: string
}
interface LinkSpec {
  readonly arrow: string
  readonly target: NodeSpec
  readonly opening?: string
  readonly label?: string
}
type StatementSpec =
  | {
      readonly kind: "node"
      readonly node: NodeSpec
      readonly width?: string
      readonly links: readonly LinkSpec[]
    }
  | { readonly kind: "columns"; readonly count: string }
  | { readonly kind: "space"; readonly width?: string }
  | {
      readonly kind: "composite"
      readonly head: StatementSpec | null
      readonly body: readonly StatementSpec[]
      readonly keyword?: string
    }
  | {
      readonly kind: "classDef"
      readonly name: string
      readonly styles: readonly (string | null)[]
    }
  | {
      readonly kind: "class"
      readonly ids: readonly string[]
      readonly name?: string
    }
  | {
      readonly kind: "style"
      readonly id: string
      readonly styles: readonly (string | null)[]
    }
  | { readonly kind: "empty" }
interface Case {
  readonly fixture: string
  readonly statements: readonly StatementSpec[]
  readonly ignoredAfter?: string
}

/** A node with an optional written shape and direction list. */
function n(
  id: string,
  open?: string,
  label = "x",
  close = "]",
  directions?: string,
): NodeSpec {
  return {
    id,
    ...(open === undefined ? {} : { shape: [open, label, close] as const }),
    ...(directions === undefined ? {} : { directions }),
  }
}

/** A node statement; widths are written digits, not the number they denote. */
function nodeStatement(
  node: NodeSpec | string,
  width?: string,
  ...links: LinkSpec[]
): StatementSpec {
  return {
    kind: "node",
    node: typeof node === "string" ? n(node) : node,
    links,
    ...(width === undefined ? {} : { width }),
  }
}

/** A link, optionally with an opening arrow and a quoted label. */
function link(
  target: NodeSpec | string,
  arrow = "-->",
  label?: string,
  opening = "--",
): LinkSpec {
  return {
    target: typeof target === "string" ? n(target) : target,
    arrow,
    ...(label === undefined ? {} : { label, opening }),
  }
}

/** A composite with a named, anonymous, or edge head. */
function composite(
  head: string | NodeSpec | StatementSpec | null,
  ...body: StatementSpec[]
): StatementSpec {
  return {
    kind: "composite",
    head:
      head === null
        ? null
        : typeof head === "string"
          ? nodeStatement(head)
          : "kind" in head
            ? head
            : nodeStatement(head),
    body,
  }
}

/** A columns statement; auto is represented by a null count in the tree. */
function columns(count: string): StatementSpec {
  return { kind: "columns", count }
}

/** A space statement. */
function space(width?: string): StatementSpec {
  return { kind: "space", ...(width === undefined ? {} : { width }) }
}

/** A class definition with explicit slots, null for a whitespace-only slot. */
function classDef(name: string, ...styles: (string | null)[]): StatementSpec {
  return { kind: "classDef", name, styles }
}

/** A class application; the ids are the parts between the commas, with the whitespace after a comma. */
function css(ids: string, name?: string): StatementSpec {
  return {
    kind: "class",
    ids: ids.split(","),
    ...(name === undefined ? {} : { name }),
  }
}

/** A style statement with explicit slots. */
function style(id: string, ...styles: (string | null)[]): StatementSpec {
  return { kind: "style", id, styles }
}

const CASES: readonly Case[] = [
  {
    fixture: "db-grid-semicolon-class-def-style",
    statements: [classDef("c", "fill:a;b")],
  },
  {
    fixture: "db-grid-semicolon-style-text",
    statements: [nodeStatement("A"), style("A", "fill:a;b")],
  },
  {
    fixture: "db-columns-twice-auto-last",
    statements: [columns("2"), columns("auto"), nodeStatement("A")],
  },
  {
    fixture: "db-class-apply-proto-id",
    statements: [nodeStatement("__proto__"), css("__proto__", "c")],
  },
  {
    fixture: "db-composite-edge-header-width",
    statements: [
      composite(nodeStatement("A", "2", link("B")), nodeStatement("C")),
    ],
  },
  {
    fixture: "db-columns-with-width",
    statements: [columns("2"), nodeStatement("A", "3")],
  },
  {
    fixture: "db-edge-keeps-width",
    statements: [
      nodeStatement("A", "2"),
      nodeStatement("B", "3"),
      nodeStatement("A", undefined, link("B")),
    ],
  },
  {
    fixture: "db-edge-long",
    statements: [nodeStatement("A", undefined, link("B", "---->"))],
  },
  {
    fixture: "db-edge-thick-open",
    statements: [nodeStatement("A", undefined, link("B", "==="))],
  },
  {
    fixture: "db-edge-thick-long",
    statements: [nodeStatement("A", undefined, link("B", "====>"))],
  },
  {
    fixture: "db-edge-dotted-open",
    statements: [nodeStatement("A", undefined, link("B", "-.-"))],
  },
  {
    fixture: "db-edge-dotted-long",
    statements: [nodeStatement("A", undefined, link("B", "-..->"))],
  },
  {
    fixture: "db-arrow-line-feed",
    statements: [nodeStatement(n("A", "<[", "x", "]>", "right,\ndown"))],
  },
  {
    fixture: "db-class-def-in-block",
    statements: [
      composite("G", classDef("c", "fill:#f00"), nodeStatement("A")),
    ],
  },
  {
    fixture: "db-class-apply-names-list",
    statements: [nodeStatement("A"), css("A", "c,d")],
  },
  { fixture: "header-after-frontmatter", statements: [nodeStatement("A")] },

  { fixture: "db-name-no-final-line-feed", statements: [nodeStatement("A")] },
  {
    fixture: "db-name-case",
    statements: [nodeStatement("a"), nodeStatement("A")],
  },
  {
    fixture: "db-label-crlf",
    statements: [nodeStatement(n("A", "[", "a\r\nb"))],
  },
  { fixture: "db-label-cr", statements: [nodeStatement(n("A", "[", "a\rb"))] },
  {
    fixture: "db-label-html-attribute-double",
    statements: [nodeStatement(n("A", "[", '<a href="x">y</a>'))],
  },
  {
    fixture: "db-label-entity-numeric",
    statements: [nodeStatement(n("A", "[", "a#35;b"))],
  },
  {
    fixture: "db-label-entity-named",
    statements: [nodeStatement(n("A", "[", "a#amp;b"))],
  },
  {
    fixture: "db-label-directive",
    statements: [nodeStatement(n("A", "[", "a%%{init: {}}%%b"))],
  },
  {
    fixture: "db-label-directive-line",
    statements: [nodeStatement(n("A", "[", "a\n%%{init: {}}%%\nb"))],
  },
  {
    fixture: "db-label-comment-line",
    statements: [nodeStatement(n("A", "[", "a\n%% b\nc"))],
  },
  {
    fixture: "db-grid-style-rule-label",
    statements: [nodeStatement(n("A", "[", "astyle:#x;yb"))],
    ignoredAfter: "astyle:#x",
  },
  {
    fixture: "db-label-padded",
    statements: [nodeStatement(n("A", "[", " x "))],
  },
  {
    fixture: "db-label-spaces",
    statements: [nodeStatement(n("A", "[", "  "))],
  },
  { fixture: "db-shape-square", statements: [nodeStatement(n("A", "["))] },
  {
    fixture: "db-shape-round",
    statements: [nodeStatement(n("A", "(", "x", ")"))],
  },
  {
    fixture: "db-shape-circle",
    statements: [nodeStatement(n("A", "((", "x", "))"))],
  },
  {
    fixture: "db-shape-doublecircle",
    statements: [nodeStatement(n("A", "(((", "x", ")))"))],
  },
  {
    fixture: "db-shape-stadium",
    statements: [nodeStatement(n("A", "([", "x", "])"))],
  },
  {
    fixture: "db-shape-subroutine",
    statements: [nodeStatement(n("A", "[[", "x", "]]"))],
  },
  {
    fixture: "db-shape-cylinder",
    statements: [nodeStatement(n("A", "[(", "x", ")]"))],
  },
  {
    fixture: "db-shape-diamond",
    statements: [nodeStatement(n("A", "{", "x", "}"))],
  },
  {
    fixture: "db-shape-hexagon",
    statements: [nodeStatement(n("A", "{{", "x", "}}"))],
  },
  {
    fixture: "db-shape-rect-left-inv-arrow",
    statements: [nodeStatement(n("A", ">"))],
  },
  {
    fixture: "db-shape-lean-right",
    statements: [nodeStatement(n("A", "[/", "x", "/]"))],
  },
  {
    fixture: "db-shape-lean-left",
    statements: [nodeStatement(n("A", "[\\", "x", "\\]"))],
  },
  {
    fixture: "db-shape-trapezoid",
    statements: [nodeStatement(n("A", "[/", "x", "\\]"))],
  },
  {
    fixture: "db-shape-inv-trapezoid",
    statements: [nodeStatement(n("A", "[\\", "x", "/]"))],
  },
  {
    fixture: "db-shape-mixed-square-round",
    statements: [nodeStatement(n("A", "[", "x", ")"))],
  },
  {
    fixture: "db-collecting-depth-first",
    statements: [
      nodeStatement("A"),
      composite(
        "G",
        nodeStatement("B"),
        composite("H", nodeStatement("C")),
        nodeStatement("D"),
      ),
      nodeStatement("E"),
    ],
  },
  {
    fixture: "db-collecting-columns-per-composite",
    statements: [
      columns("2"),
      composite("G", columns("3"), nodeStatement("A")),
      composite("H", nodeStatement("B")),
    ],
  },
  {
    fixture: "db-collecting-two-composites-share-child",
    statements: [
      composite("G", nodeStatement("A")),
      composite("H", nodeStatement("A"), nodeStatement("B")),
    ],
  },
  {
    fixture: "db-collecting-redefine-label-equal-id",
    statements: [
      nodeStatement(n("A", "((", "x", "))")),
      nodeStatement(n("A", "[", "A")),
    ],
  },
  {
    fixture: "db-collecting-redefine-label-only-odd",
    statements: [
      nodeStatement(n("A", "((", "x", "))")),
      nodeStatement(n("A", ")", "y", "(")),
    ],
  },
  {
    fixture: "db-collecting-redefine-type-na-keeps",
    statements: [
      nodeStatement(n("A", "[")),
      nodeStatement(n("A", "(", "y", ")")),
      nodeStatement("A"),
    ],
  },
  {
    fixture: "db-definitions-three-widths",
    statements: [
      nodeStatement("A", "1"),
      nodeStatement("A", "2"),
      nodeStatement("A", "3"),
    ],
  },
  {
    fixture: "db-collecting-composite-then-node-shape-width",
    statements: [
      composite(nodeStatement("G", "3"), nodeStatement("A")),
      nodeStatement(n("G", "(", "x", ")"), "5"),
    ],
  },
  {
    fixture: "db-composite-id-same-as-node-before",
    statements: [nodeStatement("A"), composite("A", nodeStatement("B"))],
  },
  {
    fixture: "db-composite-id-same-composite",
    statements: [
      composite("G", nodeStatement("A")),
      composite("G", nodeStatement("B")),
    ],
  },
  {
    fixture: "db-composite-id-same-nested",
    statements: [composite("G", composite("G", nodeStatement("A")))],
  },
  {
    fixture: "db-composite-id-same-as-child",
    statements: [composite("G", nodeStatement("G"))],
  },
  {
    fixture: "db-unplaced-nested-composite",
    statements: [
      nodeStatement("A"),
      composite("A", composite("C", nodeStatement("D"))),
    ],
  },
  {
    fixture: "db-unplaced-order",
    statements: [
      css("X", "c"),
      nodeStatement("A"),
      composite("A", nodeStatement("B")),
      css("Y", "d"),
    ],
  },
  {
    fixture: "db-unplaced-order-defined-later",
    statements: [
      css("X", "c"),
      nodeStatement("A"),
      nodeStatement("X"),
      composite("A", nodeStatement("B")),
    ],
  },
  {
    fixture: "db-unplaced-columns-in-dropped",
    statements: [
      nodeStatement("A"),
      composite("A", columns("3"), nodeStatement("B")),
    ],
  },
  {
    fixture: "db-unplaced-dropped-with-width",
    statements: [
      nodeStatement("A"),
      composite(nodeStatement("A", "3"), nodeStatement("B")),
    ],
  },
  {
    fixture: "db-unplaced-space",
    statements: [nodeStatement("A"), composite("A", space("2"))],
  },
  {
    fixture: "db-unplaced-class-on-unplaced-child",
    statements: [
      nodeStatement("A"),
      composite("A", nodeStatement("B")),
      css("B", "c"),
    ],
  },
  {
    fixture: "db-unplaced-style-on-unplaced",
    statements: [css("A", "c"), style("A", "fill:red")],
  },
  {
    fixture: "db-unplaced-edge-into-dropped",
    statements: [
      nodeStatement("A"),
      composite("A", nodeStatement("B")),
      nodeStatement("A", undefined, link("B")),
    ],
  },
  { fixture: "db-columns-only-auto", statements: [columns("auto")] },
  {
    fixture: "db-columns-zero",
    statements: [columns("0"), nodeStatement("A")],
  },
  {
    fixture: "db-columns-leading-zeros",
    statements: [columns("007"), nodeStatement("A")],
  },
  {
    fixture: "db-columns-overflow",
    statements: [columns("9".repeat(400)), nodeStatement("A")],
  },
  {
    fixture: "db-definitions-columns-three",
    statements: [columns("1"), columns("2"), columns("3"), nodeStatement("A")],
  },
  { fixture: "db-width-zero", statements: [nodeStatement("A", "0")] },
  {
    fixture: "db-width-leading-zeros",
    statements: [nodeStatement("A", "007")],
  },
  {
    fixture: "db-width-overflow",
    statements: [nodeStatement("A", "9".repeat(400))],
  },
  {
    fixture: "db-width-on-edge-source",
    statements: [nodeStatement("A", "2", link("B"))],
  },
  { fixture: "db-space-plain", statements: [space()] },
  { fixture: "db-space-width", statements: [space("3")] },
  { fixture: "db-space-width-zero", statements: [space("0")] },
  { fixture: "db-space-leading-zeros", statements: [space("02")] },
  {
    fixture: "db-composite-no-id",
    statements: [composite(null, nodeStatement("A"))],
  },
  {
    fixture: "db-composite-label",
    statements: [composite(n("G", "[", "label"), nodeStatement("A"))],
  },
  {
    fixture: "db-composite-width",
    statements: [composite(nodeStatement("G", "2"), nodeStatement("A"))],
  },
  {
    fixture: "db-composite-block-arrow",
    statements: [
      composite(n("G", "<[", "x", "]>", "right"), nodeStatement("A")),
    ],
  },
  {
    fixture: "db-composite-edge-header",
    statements: [
      composite(nodeStatement("A", undefined, link("B")), nodeStatement("C")),
    ],
  },
  {
    fixture: "db-arrow-all",
    statements: [
      nodeStatement(n("A", "<[", "x", "]>", "up,left,x,y,down,right")),
    ],
  },
  {
    fixture: "db-arrow-spaces",
    statements: [nodeStatement(n("A", "<[", "x", "]>", "right  ,  down"))],
  },
  {
    fixture: "db-arrow-leading-space",
    statements: [nodeStatement(n("A", "<[", "x", "]>", " right"))],
  },
  {
    fixture: "db-arrow-leading-comma",
    statements: [nodeStatement(n("A", "<[", "x", "]>", ",right"))],
  },
  {
    fixture: "db-arrow-trailing-space",
    statements: [nodeStatement(n("A", "<[", "x", "]>", "right "))],
  },
  {
    fixture: "db-arrow-glued-words",
    statements: [nodeStatement(n("A", "<[", "x", "]>", "right down"))],
  },
  {
    fixture: "db-arrow-up-down",
    statements: [nodeStatement(n("A", "<[", "x", "]>", "updown"))],
  },
  {
    fixture: "db-arrow-twice",
    statements: [nodeStatement(n("A", "<[", "x", "]>", "right, right"))],
  },
  {
    fixture: "db-collecting-redefine-keeps-directions",
    statements: [
      nodeStatement(n("A", "<[", "x", "]>", "right")),
      nodeStatement(n("A", "<[", "y", "]>", "left, up")),
    ],
  },
  {
    fixture: "db-arrow-redefine-from-square",
    statements: [
      nodeStatement(n("A", "[")),
      nodeStatement(n("A", "<[", "y", "]>", "left")),
    ],
  },
  {
    fixture: "db-arrow-redefine-to-square",
    statements: [
      nodeStatement(n("A", "<[", "x", "]>", "left")),
      nodeStatement(n("A", "[", "y")),
    ],
  },
  {
    fixture: "db-edge-arrow",
    statements: [nodeStatement("A", undefined, link("B"))],
  },
  {
    fixture: "db-edge-open",
    statements: [nodeStatement("A", undefined, link("B", "---"))],
  },
  {
    fixture: "db-edge-thick",
    statements: [nodeStatement("A", undefined, link("B", "==>"))],
  },
  {
    fixture: "db-edge-dotted",
    statements: [nodeStatement("A", undefined, link("B", "-.->"))],
  },
  {
    fixture: "db-edge-cross",
    statements: [nodeStatement("A", undefined, link("B", "--x"))],
  },
  {
    fixture: "db-edge-circle",
    statements: [nodeStatement("A", undefined, link("B", "--o"))],
  },
  {
    fixture: "db-edge-bidirectional",
    statements: [nodeStatement("A", undefined, link("B", "<-->"))],
  },
  {
    fixture: "db-edge-label-mismatched",
    statements: [nodeStatement("A", undefined, link("B", "==>", "text"))],
  },
  {
    fixture: "db-edge-label-bidirectional",
    statements: [
      nodeStatement("A", undefined, link("B", "-->", "text", "<--")),
    ],
  },
  {
    fixture: "db-collecting-edge-order-in-composite",
    statements: [
      nodeStatement("A", undefined, link("B")),
      composite(
        "G",
        nodeStatement("C", undefined, link("D")),
        nodeStatement("E", undefined, link("F")),
      ),
      nodeStatement("H", undefined, link("I")),
    ],
  },
  {
    fixture: "db-definitions-edges-three",
    statements: [
      nodeStatement("A", undefined, link("B")),
      nodeStatement("A", undefined, link("B")),
      nodeStatement("A", undefined, link("B")),
    ],
  },
  {
    fixture: "db-edge-to-block-arrow",
    statements: [
      nodeStatement("A", undefined, link(n("B", "<[", "x", "]>", "right"))),
    ],
  },
  {
    fixture: "db-edge-from-block-arrow",
    statements: [
      nodeStatement(n("A", "<[", "x", "]>", "right"), undefined, link("B")),
    ],
  },
  {
    fixture: "db-edge-chain",
    statements: [nodeStatement("A", undefined, link("B"), link("C"))],
  },
  {
    fixture: "db-edge-chain-four",
    statements: [
      nodeStatement("A", undefined, link("B"), link("C"), link("D")),
    ],
  },
  {
    fixture: "db-edge-chain-labels",
    statements: [
      nodeStatement(
        "A",
        undefined,
        link("B", "-->", "x"),
        link("C", "-->", "y"),
      ),
    ],
  },
  {
    fixture: "db-edge-chain-twice",
    statements: [
      nodeStatement("A", undefined, link("B"), link("C")),
      nodeStatement("D", undefined, link("E"), link("F")),
    ],
  },
  {
    fixture: "db-edge-chain-then-node",
    statements: [
      nodeStatement("A", undefined, link("B"), link("C")),
      nodeStatement("A"),
    ],
  },
  {
    fixture: "db-class-def-color-fill",
    statements: [classDef("c", "color:#fff", "fill:#000")],
  },
  {
    fixture: "db-class-def-three",
    statements: [
      classDef("c", "fill:#f00"),
      classDef("d", "stroke:#000"),
      classDef("c", "color:#fff"),
    ],
  },
  {
    fixture: "db-class-def-twice-same",
    statements: [classDef("c", "fill:#f00"), classDef("c", "fill:#f00")],
  },
  {
    fixture: "db-class-def-empty-style",
    statements: [classDef("c", "fill:#f00", null)],
  },
  {
    fixture: "db-class-def-leading-comma",
    statements: [classDef("c", null, "fill:#f00")],
  },
  {
    fixture: "db-class-def-spaces-around-styles",
    statements: [classDef("c", "fill:#f00 ", " color:#fff")],
  },
  {
    fixture: "db-class-def-semicolon-end",
    statements: [classDef("c", "fill:#f00")],
    ignoredAfter: "fill:#f00",
  },
  {
    fixture: "db-class-def-semicolon-middle",
    statements: [classDef("c", "fill:#f00;stroke:#000")],
    ignoredAfter: "fill:#f00",
  },
  {
    fixture: "db-grid-style-rule-class-def-style",
    statements: [classDef("c", "fill:astyle:#x;yb")],
    ignoredAfter: "fill:astyle:#x",
  },
  {
    fixture: "db-class-apply-list",
    statements: [nodeStatement("A"), nodeStatement("B"), css("A,B", "c")],
  },
  {
    fixture: "db-class-apply-list-spaces",
    statements: [nodeStatement("A"), nodeStatement("B"), css("A, B", "c")],
  },
  {
    fixture: "db-class-apply-names-spaces",
    statements: [nodeStatement("A"), css("A", "c d")],
  },
  {
    fixture: "db-class-apply-no-name",
    statements: [nodeStatement("A"), css("A")],
  },
  {
    fixture: "db-class-apply-same-twice",
    statements: [nodeStatement("A"), css("A", "c"), css("A", "c")],
  },
  {
    fixture: "db-class-apply-before-node-width",
    statements: [css("A", "c"), nodeStatement("A", "2")],
  },
  {
    fixture: "db-class-apply-before-block",
    statements: [css("A", "c"), composite("A", nodeStatement("B"))],
  },
  { fixture: "db-class-apply-undefined-list", statements: [css("X,Y", "c")] },
  {
    fixture: "db-style-spaces",
    statements: [nodeStatement("A"), style("A", "fill:#f00 ", " stroke:#333")],
  },
  {
    fixture: "db-style-only-comma",
    statements: [nodeStatement("A"), style("A", null, null)],
  },
  {
    fixture: "db-definitions-style-three-empty-middle",
    statements: [
      nodeStatement("A"),
      style("A", "fill:red"),
      style("A", null),
      style("A", "fill:blue"),
    ],
  },
  {
    fixture: "db-style-then-none",
    statements: [nodeStatement("A"), style("A", "fill:#f00"), style("A", null)],
  },
  {
    fixture: "db-grid-style-rule-style-text",
    statements: [nodeStatement("A"), style("A", "fill:astyle:#x;yb")],
    ignoredAfter: "fill:astyle:#x",
  },
  {
    fixture: "db-grid-comma-style-id",
    statements: [nodeStatement("a,b"), style("a,b", "fill:red")],
  },
  {
    fixture: "db-composite-root-id",
    statements: [composite("root", nodeStatement("A"))],
  },
  {
    fixture: "db-proto-root-columns",
    statements: [columns("3"), nodeStatement(n("root", "["))],
  },
  { fixture: "db-proto-root-style", statements: [style("root", "fill:red")] },
  {
    fixture: "db-class-def-proto",
    statements: [classDef("__proto__", "fill:#f00")],
  },
  {
    fixture: "db-composite-constructor-id",
    statements: [composite("constructor", nodeStatement("A"))],
  },
  {
    fixture: "db-empty-block-between",
    statements: [nodeStatement("A"), { kind: "empty" }, nodeStatement("B")],
  },
  { fixture: "db-frontmatter-config-block", statements: [nodeStatement("A")] },
  {
    fixture: "config-security-level-other-all",
    statements: [
      nodeStatement(n("A", "[", "<b>x</b> & <i>y</i>")),
      nodeStatement(n("B", "<[", "<u>z</u>", "]>", "right")),
      composite(n("G", "[", "<s>g</s>"), nodeStatement("C")),
      nodeStatement(n("D", "[", "a<br>b")),
      nodeStatement("A", undefined, link("B", "-->", "<b>e</b>")),
      classDef("c", "fill:<b>"),
      style("A", "fill:<i>"),
    ],
  },
]

/** The hand-specified tree, with each node placed at its next occurrence in the fixed source. */
function treeOf(input: string, testCase: Case): DbTreeRoot {
  const frontmatterEnd = input.startsWith("---\n")
    ? input.indexOf("\n---\n") + 5
    : 0
  let cursor = frontmatterEnd
  const tokens: TreeToken[] = []
  const scan = scanSource(input, frontmatterEnd)

  /** Find the next explicitly supplied piece. */
  function take(written: string): TreeRange {
    const start = input.indexOf(written, cursor)
    if (start < 0)
      throw new Error(`no ${JSON.stringify(written)} after ${cursor}`)
    cursor = start + written.length
    return [start, cursor]
  }

  /** A node with all common placement fields. */
  function placed(
    type: string,
    range: TreeRange,
    fields: Record<string, unknown> = {},
  ): TreeNode & Record<string, unknown> {
    return { type, range, loc: locationOf(input, range), ...fields }
  }

  if (testCase.ignoredAfter !== undefined) {
    const start =
      input.indexOf(testCase.ignoredAfter) + testCase.ignoredAfter.length
    expect(input[start]).toBe(";")
    tokens.push({
      ...placed("IgnoredSemicolon", [start, start + 1]),
      value: ";",
    })
  }

  /** A leaf with its full shared fields. */
  function identifier(text: string): TreeNode {
    return placed("Identifier", take(text), { name: text })
  }

  /** A NumericLiteral with the number and its unchanged source digits. */
  function number(text: string): TreeNode {
    return placed("NumericLiteral", take(text), {
      value: Number(text),
      raw: text,
    })
  }

  /** A StringLiteral whose raw text retains the cuts inside its range. */
  function string(text: string): TreeNode {
    const range = take(`"${text}"`)
    const raw = input.slice(...range)
    return placed("StringLiteral", range, {
      raw,
      value: raw.slice(1, -1),
      closed: true,
    })
  }

  /** The directions of the written list: a BlockLiteral of a word and the whitespace written with it, which is the whitespace before the first word and after each word, and not the whitespace after a comma. */
  function directionNodes(range: TreeRange, written: string): TreeNode[] {
    const directions: { start: number; end: number; value: string }[] = []
    let pending: { start: number; value: string } | null = null
    let afterComma = false
    for (const match of written.matchAll(/right|left|up|down|[,xy]|\s+/gu)) {
      const start = range[0] + match.index
      const text = match[0]
      const whitespace = /^\s/u.test(text)
      // The whitespace after a comma is in no direction.
      if (whitespace && afterComma) {
        afterComma = false
        continue
      }
      afterComma = text === ","
      if (text === ",") continue
      const last = directions.at(-1)
      if (!whitespace) {
        directions.push({
          start: pending?.start ?? start,
          end: start + text.length,
          value: (pending?.value ?? "") + text,
        })
        pending = null
      } else if (last === undefined) {
        pending = { start, value: text }
      } else {
        last.end = start + text.length
        last.value += text
      }
    }
    return directions.map(({ start, end, value }) =>
      placed("BlockLiteral", [start, end], { value }),
    )
  }

  /** The explicitly supplied node, shape, and optional direction list. */
  function blockNode(spec: NodeSpec): TreeNode {
    const id = identifier(spec.id)
    let shape: TreeNode | null = null
    if (spec.shape !== undefined) {
      const [open, label, close] = spec.shape
      const start = take(open)[0]
      const value = string(label)
      take(close)
      if (spec.directions === undefined)
        shape = placed("BlockShape", [start, cursor], {
          open,
          close,
          label: value,
        })
      else {
        take("(")
        const directions = directionNodes(
          take(spec.directions),
          spec.directions,
        )
        take(")")
        shape = placed("BlockArrowShape", [start, cursor], {
          label: value,
          directions,
        })
      }
    }
    return placed("BlockNode", [id.range[0], cursor], { id, shape })
  }

  /** An arrow with the fields written by its fixed text. */
  function arrow(text: string, opening: boolean): TreeNode {
    const range = take(text)
    const line = text.includes(".")
      ? "dotted"
      : text.includes("=")
        ? "thick"
        : "solid"
    const fields: Record<string, unknown> = {
      value: text,
      line,
      startMarker: text.startsWith("<") ? "arrow" : "none",
    }
    if (!opening) {
      fields.endMarker = text.endsWith(">")
        ? "arrow"
        : text.endsWith("x")
          ? "cross"
          : text.endsWith("o")
            ? "circle"
            : "none"
      fields.length = [...text].filter(
        (c) => c === (line === "dotted" ? "." : line === "thick" ? "=" : "-"),
      ).length
    }
    return placed(opening ? "BlockOpeningArrow" : "BlockArrow", range, fields)
  }

  /** One explicitly supplied statement, with its child nodes in visit order. */
  function statement(spec: StatementSpec): TreeNode {
    switch (spec.kind) {
      case "node": {
        const node = blockNode(spec.node)
        if (spec.width !== undefined) take(":")
        const width = spec.width === undefined ? null : number(spec.width)
        const links = spec.links.map((linkSpec) => {
          const start = cursor
          const opening =
            linkSpec.opening === undefined
              ? null
              : arrow(linkSpec.opening, true)
          const label =
            linkSpec.label === undefined ? null : string(linkSpec.label)
          const endArrow = arrow(linkSpec.arrow, false)
          const target = blockNode(linkSpec.target)
          return placed(
            "BlockLink",
            [opening?.range[0] ?? endArrow.range[0] ?? start, cursor],
            { opening, label, arrow: endArrow, target },
          )
        })
        return placed("BlockNodeStatement", [node.range[0], cursor], {
          node,
          width,
          links,
        })
      }
      case "columns": {
        const start = take("columns")[0]
        const count =
          spec.count === "auto" ? (take("auto"), null) : number(spec.count)
        return placed("BlockColumnsStatement", [start, cursor], { count })
      }
      case "space": {
        const start = take(spec.width === undefined ? "space" : "space:")[0]
        const width = spec.width === undefined ? null : number(spec.width)
        return placed("BlockSpaceStatement", [start, cursor], { width })
      }
      case "composite": {
        const start = take(
          spec.keyword ?? (spec.head === null ? "block" : "block:"),
        )[0]
        const head = spec.head === null ? null : statement(spec.head)
        const body = spec.body.map(statement)
        take("end")
        return placed("BlockCompositeStatement", [start, cursor], {
          head,
          body,
        })
      }
      case "classDef":
      case "style": {
        const start = take(spec.kind)[0]
        const id = identifier(spec.kind === "classDef" ? spec.name : spec.id)
        const styles = spec.styles.map((text, index) => {
          if (index > 0) take(",")
          if (text === null) return null
          const range = take(text)
          return placed("BlockLiteral", range, { value: text })
        })
        return placed(
          spec.kind === "classDef"
            ? "BlockClassDefStatement"
            : "BlockStyleStatement",
          [start, cursor],
          { [spec.kind === "classDef" ? "name" : "id"]: id, styles },
        )
      }
      case "class": {
        const start = take("class")[0]
        const ids = spec.ids.map((id, index) => {
          if (index > 0) take(",")
          return placed("BlockLiteral", take(id), { value: id })
        })
        let cssClass: TreeNode | null = null
        if (spec.name !== undefined) {
          const range = take(spec.name)
          cssClass = placed("BlockLiteral", range, { value: spec.name })
        }
        return placed("BlockClassStatement", [start, cursor], { ids, cssClass })
      }
      case "empty": {
        const start = take("accDescr")[0]
        take("{")
        take("}")
        return placed("BlockAccDescrBlockStatement", [start, cursor])
      }
      default:
        throw new Error(
          `unknown block statement ${JSON.stringify(spec satisfies never)}`,
        )
    }
  }

  const header = take("block-beta")
  const body = testCase.statements.map(statement)
  const tree: DbTreeRoot = {
    ...placed("Root", [0, input.length]),
    type: "Root",
    diagramType: "block",
    body: placed("BlockDiagram", [header[0], cursor], {
      body,
    }) as DbTreeRoot["body"],
    frontmatter:
      frontmatterEnd === 0
        ? null
        : placed("Frontmatter", [0, frontmatterEnd], {
            value: input.slice(4, frontmatterEnd - 5),
            valueRange: [4, frontmatterEnd - 5],
          }),
    directives: scan.directives.map((entry) =>
      directiveOf(input, {
        text: input.slice(...entry.range),
        from: entry.range[0],
      }),
    ),
    comments: scan.commentLines.map((entry) =>
      commentOf(input, "%%", {
        text: input.slice(entry.commentStart, entry.commentEnd),
        from: entry.commentStart,
      }),
    ),
    tokens,
  }
  // WrittenText is shared with checkTree; do not duplicate its cut handling.
  const checked = tree as CheckedRoot
  const written = new WrittenText(input, checked)
  for (const leaf of nodesOf(checked)) {
    if (leaf.type === "BlockLiteral")
      setField(leaf, "value", written.of(leaf.range))
    if (leaf.type === "StringLiteral")
      setField(leaf, "value", written.of(leaf.range).slice(1, -1))
  }
  const problems = new Problems()
  expect(checkShape(checked, problems), JSON.stringify(problems.list)).toBe(
    true,
  )
  return tree
}

describe("dbFromTree of a block tree made by hand", async () => {
  const fixtures = await loadFixtures("block")
  for (const testCase of CASES) {
    const fixture = fixtures.find((entry) => entry.name === testCase.fixture)
    if (fixture === undefined || !fixture.expected.accepted)
      throw new Error(`no accepted fixture ${testCase.fixture}`)
    const expected = fixture.expected
    it(`builds the recorded Db of ${testCase.fixture}`, () => {
      const tree = treeOf(fixture.input, testCase)
      const embedded = embeddedValuesOf(fixture, expected)
      if (embedded === undefined) throw new Error("no embedded values")
      expect(
        dbFromTree(fixture.input, tree, embedded, cssSupportsColor),
      ).toEqual(expected.db)
      expect(
        dbFromTree(
          fixture.input,
          JSON.parse(JSON.stringify(tree)) as DbTreeRoot,
          embedded,
          cssSupportsColor,
        ),
      ).toEqual(expected.db)
    })
  }
})
