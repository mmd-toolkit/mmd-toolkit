import { describe, expect, it } from "vitest"
import { dbFromTree } from "../src/db-from-tree/index.ts"
import type { DbTreeRoot } from "../src/db-from-tree/index.ts"
import type { TreeRange } from "../src/db-from-tree/tree.ts"
import { embeddedValuesOf, loadFixtures } from "../src/index.ts"

interface NodeText {
  readonly raw: string
  readonly value: string
  readonly children: readonly NodeText[]
}
interface Case {
  readonly fixture: string
  readonly root: NodeText | null
}

/** Explicit text and nesting, with a different value only for written trivia cuts. */
function n(
  raw: string,
  children: readonly NodeText[] = [],
  value = raw,
): NodeText {
  return { raw, value, children }
}

const CASES: readonly Case[] = [
  { fixture: "header-only-lf", root: null },
  { fixture: "header-beta-only-lf", root: null },
  { fixture: "gram-whitespace-only-document", root: null },
  { fixture: "db-frontmatter-title", root: n("Effect") },
  { fixture: "db-frontmatter-rootless", root: null },
  { fixture: "frontmatter-empty-title-rootless", root: null },
  { fixture: "frontmatter-null-title-rootless", root: null },
  { fixture: "frontmatter-whitespace-title-rootless", root: null },
  { fixture: "frontmatter-numeric-title-rootless", root: null },
  { fixture: "db-frontmatter-accessibility", root: n("Effect") },
  {
    fixture: "db-indent-relative-zero",
    root: n("R", [n("A"), n("B"), n("C")]),
  },
  {
    fixture: "db-indent-nearest-smaller-cause",
    root: n("R", [n("A", [n("B"), n("C", [n("D")])])]),
  },
  {
    fixture: "db-indent-root-deeper",
    root: n("R", [n("A", [n("B")]), n("C")]),
  },
  {
    fixture: "db-three-definitions",
    root: n("R", [
      n("A", [n("First")]),
      n("B"),
      n("A", [n("Second")]),
      n("C"),
      n("A", [n("Third")]),
    ]),
  },
  { fixture: "gram-root-trailing-space", root: n("R   ", [n("A")]) },
  { fixture: "gram-child-trailing-space", root: n("R", [n("A   "), n("B")]) },
  { fixture: "gram-quotes-padding", root: n('"  R  "', [n('"  A  "')]) },
  {
    fixture: "directive-root-middle",
    root: n("Ro%%{init: {}}%%ot", [], "Root"),
  },
  {
    fixture: "directive-multiline-joins-node-text",
    root: n("R%%{init: {\n}}%%A", [n("B")], "RA"),
  },
  {
    fixture: "comment-ls-region-in-text",
    root: n("R\u2028%% c\n A", [], "R\u2028 A"),
  },
  { fixture: "lex-quoted-crlf", root: n('"R', [n('A"')]) },
  { fixture: "lex-quoted-cr", root: n("R", [n('"A', [n('B"')])]) },
  { fixture: "header-root-inline-entity", root: n("R#35;#amp;", [n("A")]) },
  { fixture: "entity-root-numeric", root: n("R#35;X#x41;Y") },
  {
    fixture: "lex-entity-directive-in-node-text",
    root: n("R#am%%{init: {}}%%p;", [], "R#amp;"),
  },
  {
    fixture: "lex-root-style-three-semicolons-padding",
    root: n("style R fill:#abc;;;  ", [], "style R fill:#abc;;  "),
  },
  {
    fixture: "lex-style-and-classdef-semicolons",
    root: n("R", [
      n("style classDef A fill:#abc;;", [], "style classDef A fill:#abc"),
    ]),
  },
  {
    fixture: "header-root-inline-html",
    root: n('<a href="x">R</a>', [n("A")]),
  },
  { fixture: "lex-html-tag-starts-in-comment-line", root: n('b="c">d') },
  {
    fixture: "lex-html-tag-crosses-directive",
    root: n('<a %%{init: {}}%% href="u">R', [], '<a  href="u">R'),
  },
  {
    fixture: "lex-html-tag-ends-in-comment-line",
    root: n('<a x="a', [n('B="c">D')]),
  },
  { fixture: "lex-root-vt-inside", root: n("R\u000bX", [n("A")]) },
  { fixture: "lex-root-ff-inside", root: n("R\fX", [n("A")]) },
  {
    fixture: "db-data-block-multiline-is-nodes",
    root: n("@{", [n("invalid: ["), n("}")]),
  },
  { fixture: "db-acctitle-is-node", root: n("R", [n("accTitle: Accessible")]) },
  {
    fixture: "db-accdescr-is-node",
    root: n("R", [n("accDescr: Description")]),
  },
  {
    fixture: "db-accdescr-block-is-nodes",
    root: n("R", [n("accDescr {", [n("First"), n("Second")]), n("}")]),
  },
  ...[
    "config-security-other",
    "config-security-other-html-false",
    "config-security-other-flowchart-html-false",
    "config-security-other-root-true",
    "config-security-other-root-false",
  ].map((fixture) => ({
    fixture,
    root: n("<b>Root</b> = value", [n("<i>Cause</i><BR>next")]),
  })),
  { fixture: "div-header-inline-comment-ls-node", root: n("R") },
  { fixture: "div-header-comment-directive-value-ps", root: n("R") },
  { fixture: "div-c4-inline-percent-eof", root: n("R %% C4Container") },
  { fixture: "div-frontmatter-open-tag-bare-node", root: n('b="c">d') },
]

/** Locate only the explicitly supplied text pieces; parents are supplied, never inferred. */
function treeOf(
  source: string,
  supplied: NodeText | null,
): { tree: DbTreeRoot; ranges: TreeRange[] } {
  const frontmatterEnd = source.startsWith("---")
    ? source.indexOf("\n---", 3) + 4
    : 0
  let at = source.indexOf("ishikawa", frontmatterEnd) + "ishikawa".length
  const ranges: TreeRange[] = []

  /** A supplied text range and its supplied children, without indentation inference. */
  function node(text: NodeText): object {
    const start = source.indexOf(text.raw, at)
    if (start < 0)
      throw new Error(`missing supplied text ${JSON.stringify(text.raw)}`)
    const range: TreeRange = [start, start + text.raw.length]
    at = range[1]
    ranges.push(range)
    const children = text.children.map(node)
    return {
      type: "IshikawaNode",
      range: [start, at],
      indent: 0,
      text: { type: "IshikawaLiteral", range, value: text.value },
      children,
    }
  }

  const root = supplied === null ? null : node(supplied)
  const tree = {
    type: "Root",
    range: [0, source.length],
    diagramType: "ishikawa",
    body: {
      type: "IshikawaDiagram",
      range: [frontmatterEnd, source.length],
      root,
    },
    frontmatter:
      frontmatterEnd === 0
        ? null
        : { type: "Frontmatter", range: [0, frontmatterEnd] },
    comments: [],
    directives: [],
    tokens: [],
  } as unknown as DbTreeRoot
  return { tree, ranges }
}

/** Whole-source access is limited to HTML context; value slices remain inside literal ranges. */
function confinedSource(source: string, ranges: readonly TreeRange[]): string {
  return new Proxy(
    {},
    {
      get(_target, key) {
        if (key === "indexOf") return source.indexOf.bind(source)
        if (key === "charCodeAt") return source.charCodeAt.bind(source)
        if (key !== "slice")
          throw new Error(`unexpected source access: ${String(key)}`)
        return (from: number, to: number) => {
          if (!ranges.some(([start, end]) => start <= from && to <= end))
            throw new Error(`read outside a literal: ${from}-${to}`)
          return source.slice(from, to)
        }
      },
    },
  ) as string
}

/** The builder must not use the indentation to reconstruct the supplied nesting. */
function forbidIndent(node: object): void {
  const children = (node as { children: object[] }).children
  Object.defineProperty(node, "indent", {
    get() {
      throw new Error("indent is not a Db input")
    },
  })
  for (const child of children) forbidIndent(child)
}

describe("the Ishikawa Db from hand-made trees", async () => {
  const fixtures = new Map(
    (await loadFixtures("ishikawa")).map((fixture) => [fixture.name, fixture]),
  )
  for (const testCase of CASES)
    it(`builds the recorded Db of ${testCase.fixture}`, () => {
      const fixture = fixtures.get(testCase.fixture)
      if (fixture === undefined) throw new Error(testCase.fixture)
      const result = fixture.specified ?? fixture.expected
      if (!result.accepted)
        throw new Error(`no accepted reading: ${testCase.fixture}`)
      const embedded = embeddedValuesOf(fixture, result)
      if (embedded === undefined) throw new Error("no embedded values")
      const { tree, ranges } = treeOf(fixture.input, testCase.root)
      for (const input of [
        tree,
        JSON.parse(JSON.stringify(tree)) as DbTreeRoot,
      ]) {
        Object.defineProperty(input, "tokens", {
          get() {
            throw new Error("tokens are not a Db input")
          },
        })
        if (input.body.type === "IshikawaDiagram" && input.body.root !== null)
          forbidIndent(input.body.root)
        expect(
          dbFromTree(
            confinedSource(fixture.input, ranges),
            input,
            embedded,
            () => false,
          ),
        ).toEqual(result.db)
      }
    })
})
