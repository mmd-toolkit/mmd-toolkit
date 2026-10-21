import { describe, expect, it } from "vitest"
import { dbFromTree } from "../src/db-from-tree/index.ts"
import type { DbTreeRoot } from "../src/db-from-tree/index.ts"
import type { TreeRange } from "../src/db-from-tree/tree.ts"
import { embeddedValuesOf, loadFixtures } from "../src/index.ts"

interface Statement {
  readonly type: "subset" | "text" | "style" | "title" | "ignored"
  readonly names?: readonly string[] | null
  readonly kind?: "set" | "union"
  readonly id?: string
  readonly numeric?: boolean
  readonly label?: string | null
  readonly size?: string | null
  readonly properties?: readonly (readonly [string, string])[]
  readonly value?: string
}
interface Case {
  readonly fixture: string
  readonly body: readonly Statement[]
  readonly values?: Readonly<Record<string, string>>
  readonly quotedLabels?: readonly string[]
}

/** Explicit written set or union; arrays deliberately preserve repeated names. */
function s(
  names: string | readonly string[],
  label: string | null = null,
  size: string | null = null,
): Statement {
  return {
    type: "subset",
    kind: typeof names === "string" ? "set" : "union",
    names: typeof names === "string" ? [names] : names,
    label,
    size,
  }
}

/** Explicit targets, or the specification's null marker, and a written id. */
function t(
  names: readonly string[] | null,
  id: string,
  label: string | null = null,
  numeric = false,
): Statement {
  return { type: "text", names, id, label, numeric }
}

/** All property occurrences are supplied by hand, including duplicates. */
function style(
  names: readonly string[],
  ...properties: (readonly [string, string])[]
): Statement {
  return { type: "style", names, properties }
}

/** An explicitly supplied title value. */
function title(value: string): Statement {
  return { type: "title", value }
}

/** An explicitly supplied swallowed fragment. */
function ignored(value: string): Statement {
  return { type: "ignored", value }
}

const A = s("A")
const B = s("B")
const C = s("C")
const OVERFLOW =
  "9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999"
const MARKUP = [
  title("<b>T</b> = value"),
  s('"<b>A</b>"', '["<b>L</b>"]'),
  t(['"<b>A</b>"'], '"<b>I</b>"'),
  style(['"<b>A</b>"'], ["color", '"<b>red</b>"']),
]

const CASES: readonly Case[] = [
  ...[
    "gram-comment-prefix-line-separator-bare-percent",
    "gram-comment-prefix-line-separator-u2029-bare-percent",
    "gram-comment-prefix-line-separator-brace-comment",
    "gram-comment-prefix-line-separator-u2029-brace-comment",
    "gram-comment-prefix-line-separator-between-statements-bare-percent",
    "gram-comment-prefix-line-separator-between-statements-u2029-bare-percent",
    "gram-comment-prefix-line-separator-between-statements-brace-comment",
    "gram-comment-prefix-line-separator-between-statements-u2029-brace-comment",
  ].map((fixture) => ({ fixture, body: [A] })),
  ...[
    "gram-comment-prefix-line-separator-between-statements-implicit-text",
    "gram-comment-prefix-line-separator-between-statements-u2029-implicit-text",
  ].map((fixture) => ({ fixture, body: [A, t(null, "x")] })),
  ...[
    "lex-swallowed-nbsp-gap",
    "lex-swallowed-vt-gap",
    "lex-swallowed-ff-gap",
    "lex-swallowed-bom-gap",
    "lex-swallowed-ideographic-gap",
  ].map((fixture) => ({
    fixture,
    body: [A, t(null, "item"), t(null, "other")],
  })),
  {
    fixture: "lex-swallowed-nel-gap",
    body: [A, t(null, "item"), ignored("\u0085"), t(null, "other")],
  },
  { fixture: "lex-swallowed-nbsp-header", body: [A] },
  { fixture: "lex-swallowed-nbsp-eof", body: [A] },
  { fixture: "lex-swallowed-nbsp-between-subsets", body: [A, B] },
  ...[
    "lex-diagram-comment-cut-ls-tree-gap",
    "lex-diagram-comment-cut-ps-tree-gap",
    "lex-diagram-comment-cut-ls-spaces-tree-gap",
    "lex-diagram-comment-cut-ps-spaces-tree-gap",
    "lex-diagram-comment-cut-ls-tab-tree-gap",
    "lex-diagram-comment-cut-ps-tab-tree-gap",
    "lex-diagram-comment-cut-ls-eof-tree-gap",
    "lex-diagram-comment-cut-ps-eof-tree-gap",
  ].map((fixture) => ({ fixture, body: [s("A", "[style:#x;y]")] })),
  ...[
    "lex-diagram-comment-cut-ls-following-real-statement",
    "lex-diagram-comment-cut-ps-following-real-statement",
  ].map((fixture) => ({ fixture, body: [s("A", "[style:#x;y]"), C] })),
  { fixture: "lex-diagram-comment-cut-ls-joined-unit", body: [A, C] },
  {
    fixture: "db-html-tag-from-title-name",
    body: [title("<a"), s('"b="c">d"')],
  },
  {
    fixture: "db-html-tag-from-title-label",
    body: [title("<a"), s("A", '["b="c">d"]')],
  },
  {
    fixture: "db-html-tag-from-title-style",
    body: [title("<a"), style(["A"], ["x", '"b="c">d"'])],
  },
  { fixture: "db-html-tag-from-comment-name", body: [s('"b="c">d"')] },
  { fixture: "db-html-tag-across-names", body: [s('"<a"'), s('"b="c">d"')] },
  { fixture: "lex-comment-swallowed-nbsp", body: [] },
  { fixture: "lex-comment-swallowed-nbsp-between-statements", body: [A, B] },
  {
    fixture: "lex-indent-ignored-prefix-empty-braces-after-blank",
    body: [A, ignored("Q"), t(null, "item")],
  },
  ...[
    "gram-indent-two-spaces-empty-braces-explicit",
    "gram-indent-two-spaces-empty-braces-after-blank-explicit",
    "gram-indent-space-tab-empty-braces-explicit",
    "gram-indent-space-tab-empty-braces-after-blank-explicit",
  ].map((fixture) => ({ fixture, body: [A, t(["A"], "x")] })),
  {
    fixture: "lex-indent-spaces-before-empty-braces",
    body: [A, t(null, "item")],
  },
  {
    fixture: "lex-indent-tab-line-before-empty-braces",
    body: [A, t(null, "item")],
  },
  {
    fixture: "lex-indent-empty-braces-without-empty-line-crlf",
    body: [A, t(null, "item")],
  },
  {
    fixture: "lex-indent-tab-prefixed-empty-braces-after-blank",
    body: [A, t(null, "item")],
  },
  { fixture: "lex-label-entity-numeric", body: [s("A", '["a#35;b"]')] },
  { fixture: "lex-text-entity-numeric", body: [t(["A"], '"a#35;b"')] },
  { fixture: "lex-identifier-entity-named", body: [s('"a#amp;b"')] },
  { fixture: "lex-label-entity-named", body: [s("A", '["a#amp;b"]')] },
  { fixture: "lex-text-entity-named", body: [t(["A"], '"a#amp;b"')] },
  {
    fixture: "lex-style-entity-named",
    body: [style(["A"], ["color", '"a#amp;b"'])],
    values: { '"a#amp;b"': "a#ampb" },
  },
  {
    fixture: "lex-identifier-style-rule-two-semicolons",
    body: [s('"astyle:#35;;b"')],
    values: { '"astyle:#35;;b"': "astyle:#35;b" },
  },
  {
    fixture: "lex-label-style-rule-two-semicolons",
    body: [s("A", '["astyle:#35;;b"]')],
    values: { '["astyle:#35;;b"]': "astyle:#35;b" },
  },
  {
    fixture: "lex-text-style-rule-two-semicolons",
    body: [t(["A"], '"astyle:#35;;b"')],
    values: { '"astyle:#35;;b"': "astyle:#35;b" },
  },
  {
    fixture: "lex-style-style-rule-two-semicolons",
    body: [style(["A"], ["color", '"astyle:#35;;b"'])],
    values: { '"astyle:#35;;b"': "astyle:#35;b" },
  },
  {
    fixture: "lex-title-style-rule-two-semicolons",
    body: [title("astyle:#35;;b")],
    values: { "astyle:#35;;b": "astyle:#35;b" },
  },
  {
    fixture: "lex-style-hex-ignored-semicolon",
    body: [style(["A"], ["x", "#ab;c"])],
    values: { "#ab;c": "#abc" },
  },
  {
    fixture: "lex-style-rgb-ignored-semicolon",
    body: [style(["A"], ["x", "#abc rgb(1;2,3,4)"])],
    values: { "#abc rgb(1;2,3,4)": "#abc rgb(12,3,4)" },
  },
  {
    fixture: "lex-label-quoted-directive-only",
    body: [s("A", '["%%{init: {}}%%"]')],
    values: { '["%%{init: {}}%%"]': "" },
  },
  {
    fixture: "lex-label-quoted-ignored-semicolon-only",
    body: [s("X", "[style:#abc]"), s("A", '[";"]')],
    values: { '[";"]': "" },
  },
  {
    fixture: "lex-label-bare-comment-only",
    body: [s("A", "[\n%% c\n]")],
    values: { "[\n%% c\n]": "\n" },
  },
  {
    fixture: "lex-label-quoted-comment-only",
    body: [s("A", '["\n%% c\n"]')],
    values: { '["\n%% c\n"]': "\n" },
  },
  {
    fixture: "lex-empty-braces-percent-between-set-and-text",
    body: [A, t(null, "item")],
  },
  {
    fixture: "lex-indent-union-empty-braces",
    body: [A, B, s(["A", "B"]), t(null, "item")],
  },
  { fixture: "lex-indent-set-empty-braces-blank", body: [A, t(null, "item")] },
  { fixture: "lex-indent-set-two-empty-braces", body: [A, t(null, "item")] },
  {
    fixture: "lex-indent-indented-empty-braces-after-blank",
    body: [A, t(null, "item")],
  },
  {
    fixture: "lex-indent-bare-percent-after-blank",
    body: [A, t(null, "item")],
  },
  {
    fixture: "gram-indent-after-empty-braces-explicit-id",
    body: [A, t(["A"], "x")],
  },
  {
    fixture: "gram-indent-after-empty-braces-explicit-string",
    body: [A, t(['"A"'], '"x"')],
  },
  {
    fixture: "gram-indent-after-empty-braces-explicit-target-list",
    body: [A, t(["A", "B"], "x")],
  },
  {
    fixture: "div-c4-bare-style-value",
    body: [style(["A"], ["x", "C4Container"])],
  },
  {
    fixture: "lex-directive-label-delimiter-gap",
    body: [s("A", '[%%{init: {}}%%"x"]')],
    values: { '[%%{init: {}}%%"x"]': "x" },
    quotedLabels: ['[%%{init: {}}%%"x"]'],
  },

  { fixture: "db-case-distinct-ids", body: [A, s("a"), s(["a", "A"])] },
  { fixture: "db-title-quotes", body: [title('"  Quoted title  "')] },
  {
    fixture: "lex-style-entity-numeric",
    body: [style(["A"], ["color", '"a#35;b"'])],
    values: { '"a#35;b"': "a#35b" },
  },
  { fixture: "lex-identifier-entity-numeric", body: [s('"a#35;b"')] },
  {
    fixture: "lex-style-directive-middle",
    body: [style(["A"], ["color", '"a%%{init: {}}%%b"'])],
    values: { '"a%%{init: {}}%%b"': "ab" },
  },
  {
    fixture: "lex-style-comment-line",
    body: [style(["A"], ["color", '"a\n%% c\nb"'])],
    values: { '"a\n%% c\nb"': "a\nb" },
  },
  {
    fixture: "lex-title-directive-middle",
    body: [title("a%%{init: {}}%%b")],
    values: { "a%%{init: {}}%%b": "ab" },
  },
  { fixture: "lex-title-separator-crlf", body: [title("T")] },
  {
    fixture: "db-style-rgb-nbsp",
    body: [style(["A"], ["fill", "rgb(1,\u00a02,3)"])],
  },

  { fixture: "db-size-fraction", body: [s("A", null, ".5")] },
  { fixture: "db-size-signed-fraction", body: [s("A", null, "-.5")] },
  { fixture: "db-size-plus", body: [s("A", null, "+2")] },
  { fixture: "db-size-zero", body: [s("A", null, "0")] },
  { fixture: "db-size-negative", body: [s("A", null, "-2")] },
  { fixture: "db-form-text-id", body: [t(["A"], "item")] },
  { fixture: "db-form-text-string", body: [t(["A"], '"item words"')] },
  { fixture: "db-form-text-number", body: [t(["A"], "-0", null, true)] },
  { fixture: "db-form-indent-id", body: [A, t(null, "item")] },
  { fixture: "db-form-indent-number", body: [A, t(null, "-0", null, true)] },
  { fixture: "db-form-indent-string", body: [A, t(null, '"item words"')] },
  {
    fixture: "db-indent-width",
    body: [A, t(null, "a"), t(null, "b"), t(null, "c")],
  },
  { fixture: "db-indent-after-blank", body: [A, t(null, "item")] },
  { fixture: "db-indent-after-comment", body: [A, t(null, "item")] },
  { fixture: "db-indent-after-directive", body: [A, t(null, "item")] },
  { fixture: "db-indent-blank-line", body: [A, t(null, "item")] },
  {
    fixture: "db-indent-after-union",
    body: [A, B, s(["A", "B"]), t(null, "item")],
  },
  {
    fixture: "lex-indented-text-after-style-explicit",
    body: [A, style(["A"], ["x", "red"]), t(["A"], "item")],
  },
  {
    fixture: "lex-indented-text-at-bol-without-current-set-explicit",
    body: [t(["A"], "item")],
  },
  {
    fixture: "lex-identifier-comment-line",
    body: [s('"a\n%% c\nb"')],
    values: { '"a\n%% c\nb"': "a\nb" },
  },
  {
    fixture: "lex-label-comment-line",
    body: [s("A", '["a\n%% c\nb"]')],
    values: { '["a\n%% c\nb"]': "a\nb" },
  },
  {
    fixture: "lex-identifier-directive-middle",
    body: [s('"a%%{init: {}}%%b"')],
    values: { '"a%%{init: {}}%%b"': "ab" },
  },
  {
    fixture: "lex-label-directive-middle",
    body: [s("A", '["a%%{init: {}}%%b"]')],
    values: { '["a%%{init: {}}%%b"]': "ab" },
  },
  { fixture: "lex-cr-quoted-value", body: [s('"a\rb"')] },
  { fixture: "lex-crlf-quoted-value", body: [s('"a\r\nb"')] },
  {
    fixture: "lex-identifier-style-rule",
    body: [s('"astyle:#f00;b"')],
    values: { '"astyle:#f00;b"': "astyle:#f00b" },
  },
  { fixture: "db-grid-entity-label-bare", body: [s("A", "[a#35;b]")] },
  { fixture: "lex-title-html-attribute", body: [title('a<a href="x">b')] },
  {
    fixture: "db-title-last",
    body: [title("First"), title("Second"), title("Third")],
  },
  {
    fixture: "db-style-rgb-directive",
    body: [style(["A"], ["fill", "rgb(1,%%{init: {}}%%2,3)"])],
    values: { "rgb(1,%%{init: {}}%%2,3)": "rgb(1,2,3)" },
  },
  {
    fixture: "db-style-rgb-comment-line",
    body: [style(["A"], ["fill", "rgb(1,\n%% c\n2,3)"])],
    values: { "rgb(1,\n%% c\n2,3)": "rgb(1,\n2,3)" },
  },
  {
    fixture: "db-style-rgb-line-separator",
    body: [style(["A"], ["fill", "rgb(1,\u20282,3)"])],
  },
  {
    fixture: "db-style-rgba-paragraph-separator",
    body: [style(["A"], ["fill", "rgba(1,\u20292,3,.5)"])],
  },
  { fixture: "lex-label-bare-padding", body: [s("A", "[  Alpha  ]")] },
  {
    fixture: "db-style-adjacent-numeric-tokens",
    body: [style(["A"], ["custom", "1.2.3"])],
  },
  { fixture: "db-text-comma-list", body: [t(["B", "A"], "item")] },
  {
    fixture: "gram-repeated-target-lists",
    body: [
      t(["B", "A", "A"], "item"),
      style(["B", "A", "A"], ["color", "red"], ["fill", "blue"]),
    ],
  },
  { fixture: "db-label-backticks", body: [s("A", '["`markdown`"]')] },
  {
    fixture: "db-label-inner-quotes",
    body: [s("A", "[\" 'x' \"]"), s("B", "['x']")],
  },

  { fixture: "header-only", body: [] },
  {
    fixture: "db-all-fields",
    body: [
      title("All fields"),
      s("B", '["Beta"]', "12"),
      s("A", "[Alpha]", "20"),
      s(["B", "A"], '["Overlap"]', "3"),
      t(null, "item", '["Shared note"]'),
      t(["B", "A"], '"explicit item"', "[Explicit]"),
      style(["B", "A"], ["fill", "rgb(1, 2, 3)"], ["color", '" dark blue "']),
    ],
  },
  {
    fixture: "db-three-definitions",
    body: [
      s("A", "[First]", "1"),
      s("B", null, "8"),
      s("A", "[Second]", "2"),
      s(["B", "A"], null, "3"),
      s("A", "[Third]", "4"),
      s(["A", "B"], null, "5"),
    ],
  },
  {
    fixture: "db-union-three-definitions",
    body: [
      A,
      B,
      C,
      s(["A", "B"], null, "1"),
      s(["B", "C"], null, "2"),
      s(["B", "A"], null, "3"),
      s(["A", "B"], null, "4"),
    ],
  },
  {
    fixture: "db-text-three-definitions",
    body: [
      t(["A"], "item", "[First]"),
      t(["B"], "other", "[Partner]"),
      t(["B"], "item", "[Second]"),
      t(["C"], "item", "[Third]"),
    ],
  },
  {
    fixture: "db-style-three-definitions-same-target",
    body: [
      style(["A"], ["fill", "red"]),
      style(["B"], ["color", "black"]),
      style(["A"], ["fill", "blue"]),
      style(["B"], ["fill", "green"]),
      style(["A"], ["color", "white"]),
    ],
  },
  {
    fixture: "db-union-repeated-member",
    body: [A, s(["A", "A"]), s(["A", "A", "A"])],
  },
  {
    fixture: "db-empty-identifiers",
    body: [
      s('""'),
      A,
      s(['""', "A"]),
      t(['""'], '""'),
      style(['""'], ["color", '""']),
    ],
  },
  {
    fixture: "db-quoted-padding",
    body: [
      s('"  A  "'),
      t(['"  A  "'], '" item "'),
      style(['"  A  "'], ["color", '" red "']),
    ],
  },
  {
    fixture: "db-label-empty",
    body: [s("A", '[""]'), t(["A"], "item", '[""]')],
  },
  {
    fixture: "db-label-spaces",
    body: [s("A", '["   "]'), t(["A"], "item", "[   ]")],
  },
  {
    fixture: "db-label-double-normalization",
    body: [s("A", '["  label  "]'), t(["A"], "item", '["  label  "]')],
  },
  { fixture: "db-size-negative-zero", body: [s("A", null, "-0")] },
  { fixture: "db-size-overflow", body: [s("A", null, OVERFLOW)] },
  {
    fixture: "db-size-negative-overflow",
    body: [s("A", null, `-${OVERFLOW}`)],
  },
  { fixture: "db-size-leading-zeros", body: [s("A", null, "007")] },
  { fixture: "db-text-leading-zeros", body: [t(["A"], "007", null, true)] },
  {
    fixture: "db-style-case-and-order",
    body: [
      style(["B", "A"], ["color", "red"], ["Color", "blue"]),
      style(["A", "B"], ["color", "green"]),
    ],
  },
  {
    fixture: "db-style-duplicate-key",
    body: [style(["A"], ["fill", "red"], ["fill", "blue"], ["color", "white"])],
  },
  {
    fixture: "db-style-prototype-keys",
    body: [
      style(
        ["A"],
        ["__proto__", "red"],
        ["constructor", "blue"],
        ["hasOwnProperty", "green"],
        ["toString", "yellow"],
      ),
    ],
  },
  {
    fixture: "db-form-style-tokens",
    body: [style(["A"], ["custom", "one  2 #abc"])],
  },
  {
    fixture: "lex-style-adjacent-units",
    body: [style(["A"], ["x", "1red#abc"])],
  },
  {
    fixture: "lex-style-single-number-whole-spelling",
    body: [style(["A"], ["x", "007"])],
  },
  {
    fixture: "db-form-style-rgba",
    body: [style(["A"], ["fill", "rgba(1, 2, 3, .5)"])],
  },
  {
    fixture: "db-style-rgb-uppercase",
    body: [style(["A"], ["fill", "RGB(1,2,3)"])],
  },
  {
    fixture: "db-style-rgb-dot-components",
    body: [style(["A"], ["fill", "rgb(.,..,999)"])],
  },
  {
    fixture: "db-style-hex-trailing-numeric-token",
    body: [style(["A"], ["fill", "#123456789"])],
  },
  {
    fixture: "db-style-hex-trailing-identifier",
    body: [style(["A"], ["fill", "#abcdefghi"])],
  },
  {
    fixture: "db-style-rgb-crlf",
    body: [style(["A"], ["fill", "rgb(1,\r\n2,3)"])],
  },
  {
    fixture: "db-indent-after-same-line-style",
    body: [A, style(["A"], ["fill", "red"]), t(null, "item")],
  },
  {
    fixture: "db-indent-after-same-line-explicit-text",
    body: [A, t(["A"], "explicit"), t(null, "implicit")],
  },
  {
    fixture: "db-indent-after-same-line-title",
    body: [A, title("T"), t(null, "item")],
  },
  {
    fixture: "lex-style-extra-id-eaten",
    body: [style(["A"], ["x", "one"]), ignored("q")],
  },
  { fixture: "lex-set-colon-eaten", body: [A, ignored(":")] },
  { fixture: "db-frontmatter-title", body: [A] },
  { fixture: "db-frontmatter-title-overridden", body: [title("From text")] },
  { fixture: "db-frontmatter-accessibility", body: [] },
  { fixture: "db-title-padding", body: [title("  padded  ")] },
  { fixture: "db-title-only-whitespace", body: [title("  "), A] },
  { fixture: "db-title-value-next-line", body: [title("T")] },
  { fixture: "db-markup", body: MARKUP },
  { fixture: "config-security-other", body: MARKUP },
  { fixture: "config-security-other-flowchart-false", body: MARKUP },
  { fixture: "config-security-other-html-false", body: MARKUP },
  { fixture: "config-security-other-root-false-flowchart-true", body: MARKUP },
  { fixture: "config-security-other-root-true-flowchart-false", body: MARKUP },
  {
    fixture: "db-grid-entity-style-value",
    body: [style(["A"], ["custom", "a#35;b"])],
    values: { "a#35;b": "a#35b" },
  },
  { fixture: "lex-title-entity-numeric", body: [title("a#35;b")] },
  { fixture: "lex-title-entity-named", body: [title("a#amp;b")] },
]

/** Locate only the explicitly supplied pieces; no Venn grammar or expected Db is read. */
function treeOf(
  source: string,
  testCase: Case,
): { root: DbTreeRoot; ranges: TreeRange[] } {
  let cursor = source.indexOf("venn-beta") + "venn-beta".length
  const ranges: TreeRange[] = []

  /** Locate the next supplied piece, without interpreting its neighbors. */
  function take(raw: string): TreeRange {
    const start = source.indexOf(raw, cursor)
    if (start < 0)
      throw new Error(`${testCase.fixture}: missing ${JSON.stringify(raw)}`)
    cursor = start + raw.length
    return [start, cursor]
  }

  /** Supply a leaf from its exact written piece and optional trivia-free value. */
  function leaf(raw: string, type?: string): Record<string, unknown> {
    const range = take(raw)
    ranges.push(range)
    const string = type === undefined && raw.startsWith('"')
    const label = type === undefined && raw.startsWith("[")
    const quotedLabel =
      raw.startsWith('["') || testCase.quotedLabels?.includes(raw) === true
    const value =
      testCase.values?.[raw] ??
      (string
        ? raw.slice(1, -1)
        : label
          ? raw.slice(quotedLabel ? 2 : 1, quotedLabel ? -2 : -1)
          : raw)
    return {
      type:
        type ?? (string ? "StringLiteral" : label ? "VennLabel" : "Identifier"),
      range,
      ...(type === "NumericLiteral"
        ? { raw: value, value: Number(value) }
        : string
          ? { raw, value, closed: true }
          : label
            ? { kind: quotedLabel ? "string" : "text", value }
            : type === "VennLiteral" || type === "VennIgnoredText"
              ? { value }
              : { name: value }),
    }
  }

  const body = testCase.body.map((statement) => {
    if (statement.type === "ignored")
      return leaf(statement.value ?? "", "VennIgnoredText")
    const start = take(statement.kind ?? statement.type)[0]
    const names = statement.names?.map((name) => leaf(name)) ?? null
    let fields: Record<string, unknown>, type: string
    if (statement.type === "subset") {
      type = "VennSubsetStatement"
      const label = statement.label == null ? null : leaf(statement.label)
      const size =
        statement.size == null ? null : leaf(statement.size, "NumericLiteral")
      fields = { kind: statement.kind, sets: names, label, size }
    } else if (statement.type === "text") {
      type = "VennTextStatement"
      const id = leaf(
        statement.id ?? "",
        statement.numeric === true ? "NumericLiteral" : undefined,
      )
      fields = {
        targets: names,
        id,
        label: statement.label == null ? null : leaf(statement.label),
      }
    } else if (statement.type === "style") {
      type = "VennStyleStatement"
      const properties = statement.properties?.map(([key, value]) => {
        const keyNode = leaf(key)
        const valueNode = leaf(
          value,
          value.startsWith('"') ? undefined : "VennLiteral",
        )
        return {
          type: "VennStyleProperty",
          range: [(keyNode.range as TreeRange)[0], cursor],
          key: keyNode,
          value: valueNode,
        }
      })
      fields = { targets: names, properties }
    } else {
      type = "VennTitleStatement"
      fields = { value: leaf(statement.value ?? "", "VennLiteral") }
    }
    return { type, range: [start, cursor], ...fields }
  })
  const root = {
    type: "Root",
    range: [0, source.length],
    diagramType: "venn",
    body: {
      type: "VennDiagram",
      range: [source.indexOf("venn-beta"), cursor],
      body,
    },
    frontmatter: null,
    comments: [],
    directives: [],
    tokens: [],
  } as unknown as DbTreeRoot
  return { root, ranges }
}

/** Only HTML tag-context searches may span the source; every value slice stays in its node range. */
function confinedSource(source: string, ranges: readonly TreeRange[]): string {
  return new Proxy(
    {},
    {
      get(_target, key) {
        if (key === "indexOf") return source.indexOf.bind(source)
        if (key === "charCodeAt") return source.charCodeAt.bind(source)
        if (key !== "slice")
          throw new Error(`unexpected source access: ${String(key)}`)
        return (start: number, end: number) => {
          if (!ranges.some(([from, to]) => from <= start && end <= to))
            throw new Error(`source read outside a value node: ${start}-${end}`)
          return source.slice(start, end)
        }
      },
    },
  ) as string
}

describe("the Venn Db from hand-made trees", async () => {
  const fixtures = new Map(
    (await loadFixtures("venn")).map((fixture) => [fixture.name, fixture]),
  )
  const characters: Case[] = Array.from(fixtures.values())
    .filter(
      (fixture) =>
        fixture.name.startsWith("lex-comment-swallowed-") &&
        !CASES.some((testCase) => testCase.fixture === fixture.name),
    )
    .map((fixture) => ({ fixture: fixture.name, body: [] }))
  for (const testCase of [...CASES, ...characters])
    it(`builds the recorded Db of ${testCase.fixture}`, () => {
      const fixture = fixtures.get(testCase.fixture)
      if (fixture === undefined) throw new Error(testCase.fixture)
      const expected = fixture.specified ?? fixture.expected
      if (!expected.accepted) throw new Error(testCase.fixture)
      const { root, ranges } = treeOf(fixture.input, testCase)
      const embedded = embeddedValuesOf(fixture, expected)
      if (embedded === undefined) throw new Error("no embedded values")
      for (const tree of [
        root,
        JSON.parse(JSON.stringify(root)) as DbTreeRoot,
      ]) {
        Object.defineProperty(tree, "tokens", {
          get() {
            throw new Error("tokens are not a Db input")
          },
        })
        expect(
          dbFromTree(
            confinedSource(fixture.input, ranges),
            tree,
            embedded,
            () => false,
          ),
          testCase.fixture,
        ).toEqual(expected.db)
      }
    })
})
