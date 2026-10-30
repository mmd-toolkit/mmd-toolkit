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

// The Db built from sankey trees made by hand, for the fixtures that name the
// steps of docs/db-from-tree/sankey.md. The tokens of a hand-made tree are
// only the `;` that the line rule ignores, which the converted form reads; the
// kinds and the ranges of the other tokens are not held to a document of the
// parser here. Each case lists the fields of the links as the source writes
// them, in order, and the tree gets the range of each field from the source:
// the trees that the parser records are compared in `db-from-tree.test.ts`.

/** A field of a link as the source writes it: a name, a value, or a string with its quotes. */
interface FieldSpec {
  readonly kind: "name" | "literal" | "string"
  readonly text: string
}

/** A source or a target without quotes, written as `text`. */
function name(text: string): FieldSpec {
  return { kind: "name", text }
}

/** A value without quotes, written as `text`. */
function literal(text: string): FieldSpec {
  return { kind: "literal", text }
}

/** A string with its quotes, written as `text`. */
function string(text: string): FieldSpec {
  return { kind: "string", text }
}

/** A case: a fixture, and the three fields of each of its links. */
interface Case {
  readonly fixture: string
  readonly links: readonly (readonly [FieldSpec, FieldSpec, FieldSpec])[]
}

const CASES: readonly Case[] = [
  {
    fixture: "db-link-basic",
    links: [[name("a"), name("b"), literal("1")]],
  },
  {
    fixture: "db-fields-trimmed",
    links: [[name("a"), name("b"), literal("1")]],
  },
  {
    fixture: "db-fields-trimmed",
    links: [[name("a "), name(" b "), literal(" 1  ")]],
  },
  {
    fixture: "db-two-links",
    links: [
      [name("a"), name("b"), literal("1")],
      [name("c"), name("d"), literal("2")],
    ],
  },
  {
    fixture: "db-node-order",
    links: [
      [name("a"), name("b"), literal("1")],
      [name("c"), name("a"), literal("2")],
    ],
  },
  {
    fixture: "db-self-link",
    links: [[name("a"), name("a"), literal("1")]],
  },
  {
    fixture: "db-quoted-and-unquoted-same-id",
    links: [
      [string('"a"'), name("b"), literal("1")],
      [name("a"), name("c"), literal("2")],
    ],
  },
  {
    fixture: "db-quoted-doubled-quote",
    links: [[string('"a""b"'), name("c"), literal("1")]],
  },
  {
    fixture: "db-quoted-four-quotes",
    links: [[string('"a""""b"'), name("c"), literal("1")]],
  },
  {
    fixture: "db-quoted-only-quote",
    links: [[string('""""'), name("c"), literal("1")]],
  },
  {
    fixture: "db-quoted-comma",
    links: [[string('"a,b"'), name("c"), literal("1")]],
  },
  {
    fixture: "db-quoted-blank-line-collapses",
    links: [[string('"a\n\nb"'), name("c"), literal("1")]],
  },
  {
    fixture: "db-quoted-crlf-blank-line-collapses",
    links: [[string('"a\r\n\r\nb"'), name("c"), literal("1")]],
  },
  {
    fixture: "db-quoted-cr",
    links: [[string('"a\rb"'), name("c"), literal("1")]],
  },
  {
    fixture: "db-quoted-space-line-kept",
    links: [[string('"a\n \nb"'), name("c"), literal("1")]],
  },
  {
    fixture: "db-quoted-leading-line-feed",
    links: [[string('"\na"'), name("c"), literal("1")]],
  },
  {
    fixture: "db-quoted-both-line-feed-ids",
    links: [[string('"a\n"'), string('"b\n"'), literal("1")]],
  },
  {
    fixture: "db-quoted-line-feeds-only",
    links: [[string('"\n"'), name("c"), literal("1")]],
  },
  {
    fixture: "db-quoted-spaces-trimmed",
    links: [[string('"  a  "'), name("c"), literal("1")]],
  },
  {
    fixture: "db-spaces-only-target-id",
    links: [[name("a"), name(" "), literal("1")]],
  },
  {
    fixture: "db-spaces-only-source-id",
    links: [
      [name("a"), name("b"), literal("1")],
      [name("  "), name("c"), literal("2")],
    ],
  },
  {
    fixture: "db-spaces-only-value",
    links: [
      [name("a"), name("b"), literal(" ")],
      [name("c"), name("d"), literal("1")],
    ],
  },
  {
    fixture: "db-value-not-a-number",
    links: [[name("a"), name("b"), literal("abc")]],
  },
  {
    fixture: "db-value-hexadecimal",
    links: [[name("a"), name("b"), literal("0x10")]],
  },
  {
    fixture: "db-value-exponent-negative",
    links: [[name("a"), name("b"), literal("1E-2")]],
  },
  {
    fixture: "db-value-negative-zero",
    links: [[name("a"), name("b"), literal("-0")]],
  },
  {
    fixture: "db-value-infinity",
    links: [[name("a"), name("b"), literal("Infinity")]],
  },
  {
    fixture: "db-value-negative-infinity",
    links: [[name("a"), name("b"), literal("-Infinity")]],
  },
  {
    fixture: "db-value-overflow",
    links: [[name("a"), name("b"), literal("1e999")]],
  },
  {
    fixture: "db-value-hash-after-number",
    links: [[name("a"), name("b"), literal("1 #c")]],
  },
  {
    fixture: "db-quoted-value-with-comma",
    links: [[name("a"), name("b"), string('"1,5"')]],
  },
  {
    fixture: "db-quoted-value-not-a-number",
    links: [[name("a"), name("b"), string('"abc"')]],
  },
  {
    fixture: "db-quoted-value-with-quotes",
    links: [[name("a"), name("b"), string('"1"""')]],
  },
  {
    fixture: "db-duplicate-link",
    links: [
      [name("a"), name("b"), literal("1")],
      [name("a"), name("b"), literal("2")],
    ],
  },
  {
    fixture: "db-ids-of-object-prototype",
    links: [
      [name("__proto__"), name("constructor"), literal("1")],
      [name("toString"), name("hasOwnProperty"), literal("2")],
    ],
  },
  {
    fixture: "db-ids-case-sensitive",
    links: [[name("A"), name("a"), literal("1")]],
  },
  {
    fixture: "db-directive-in-field",
    links: [[name("a"), name("%%{init: {}}%%b"), literal("1")]],
  },
  {
    fixture: "db-directive-at-start-of-record",
    links: [[name("%%{init: {}}%%a"), name("b"), literal("1")]],
  },
  {
    fixture: "db-directive-after-value",
    links: [[name("a"), name("b"), literal("1%%{init: {}}%%")]],
  },
  {
    fixture: "db-title-frontmatter-spaces",
    links: [[name("a"), name("b"), literal("1")]],
  },
  {
    fixture: "db-directive-in-quotes",
    links: [[name("a"), string('"b%%{init: {}}%%c"'), literal("1")]],
  },
  {
    fixture: "db-quoted-comment-line",
    links: [[string('"a\n%% c\nb"'), name("x"), literal("1")]],
  },
  {
    fixture: "db-quoted-directive-line",
    links: [[string('"a\n%%{init: {}}%%\nb"'), name("x"), literal("1")]],
  },
  {
    fixture: "lex-style-line-semicolon-source",
    links: [[name("style:#x;y"), name("b"), literal("1")]],
  },
  {
    fixture: "lex-style-line-semicolon-in-second-line-of-quotes",
    links: [[string('"a\nstyle:#x;y"'), name("b"), literal("1")]],
  },
  {
    fixture: "lex-style-line-does-not-cross-lines-in-quotes",
    links: [[string('"style:#x\n;y"'), name("b"), literal("1")]],
  },
  {
    fixture: "lex-style-line-semicolon-at-end-of-field",
    links: [[name("style:#x;"), name("b"), literal("1")]],
  },
  {
    fixture: "db-text-semicolon-at-end-of-field",
    links: [[name("a"), name("b;"), literal("1")]],
  },
  {
    fixture: "db-title-frontmatter",
    links: [[name("a"), name("b"), literal("1")]],
  },
  {
    fixture: "db-everything",
    links: [
      [name("A"), string('"B, ""C"""'), literal("12.5")],
      [name(" B "), name(" A "), literal(" 3 ")],
      [name("A"), string('"B, ""C"""'), literal("abc")],
    ],
  },
  {
    fixture: "config-security-level-other-title-and-ids",
    links: [
      [
        name("A<b>x</b> & <script>y</script>"),
        string('"B<i>z</i> &amp; <u>"'),
        literal("1"),
      ],
    ],
  },
  {
    fixture: "config-security-level-loose-ids",
    links: [[name("A<b>x</b> & <i>"), name("B"), literal("1")]],
  },
]

/**
 * The tree of `input` with the links `links`: each field gets the range of its
 * text, found after the one before it; the `;` that the line rule ignores
 * (`style:#x;y`) are `IgnoredSemicolon` tokens, since the converted form leaves
 * them out.
 */
function treeOf(input: string, testCase: Case): DbTreeRoot {
  let cursor = input.startsWith("---\n") ? input.indexOf("\n---\n") + 5 : 0
  cursor = input.indexOf("sankey", cursor) + "sankey".length
  const tokens: TreeToken[] = []

  /** The node of a field, whose range is its text found after the one before it. */
  function field(spec: FieldSpec): TreeNode & Record<string, unknown> {
    const start = input.indexOf(spec.text, cursor)
    if (start === -1) throw new Error(`no ${JSON.stringify(spec.text)}`)
    const range: TreeRange = [start, start + spec.text.length]
    cursor = range[1]
    if (spec.kind === "string") {
      return { type: "StringLiteral", range, value: "", closed: true }
    }
    return {
      type: spec.kind === "name" ? "SankeyIdentifier" : "SankeyLiteral",
      range,
    }
  }

  const body = testCase.links.map(([source, target, value]) => {
    const fields = [field(source), field(target), field(value)] as const
    return {
      type: "SankeyLinkStatement",
      range: [fields[0].range[0], fields[2].range[1]] as TreeRange,
      source: fields[0],
      target: fields[1],
      value: fields[2],
    }
  })
  for (const spec of testCase.links.flat()) {
    if (!/style:#.*;/u.test(spec.text)) continue
    const semicolon = input.lastIndexOf(
      ";",
      input.indexOf(spec.text) + spec.text.length,
    )
    tokens.push({
      type: "IgnoredSemicolon",
      range: [semicolon, semicolon + 1],
      value: ";",
    })
  }
  const whole: TreeRange = [0, input.length]
  const frontmatter: TreeNode | null = input.startsWith("---\n")
    ? { type: "Frontmatter", range: [0, input.indexOf("\n---\n") + 5] }
    : null
  return {
    type: "Root",
    diagramType: "sankey",
    range: whole,
    body: {
      type: "SankeyDiagram",
      range: [0, input.length],
      body,
    } as DbTreeRoot["body"],
    frontmatter,
    comments: [],
    directives: [],
    tokens,
  }
}

describe("dbFromTree of a sankey tree made by hand", async () => {
  const fixtures = await loadFixtures("sankey")
  for (const testCase of CASES) {
    const fixture = fixtures.find((found) => found.name === testCase.fixture)
    if (fixture === undefined) throw new Error(`no fixture ${testCase.fixture}`)
    const result = fixture.specified ?? fixture.expected
    if (!result.accepted) throw new Error(`${testCase.fixture} is rejected`)
    const expected = result.db
    it(`builds the recorded Db of ${testCase.fixture}`, () => {
      const tree = treeOf(fixture.input, testCase)
      const embedded = embeddedValuesOf(fixture, result)
      if (embedded === undefined) throw new Error("no embedded values")
      const db = dbFromTree(fixture.input, tree, embedded, cssSupportsColor)
      expect(JSON.parse(JSON.stringify(db))).toEqual(expected)
    })
  }
})
