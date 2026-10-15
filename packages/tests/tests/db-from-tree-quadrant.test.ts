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

// The Db built from quadrant chart trees made by hand, for the fixtures that
// name the steps of docs/db-from-tree/quadrant.md. A hand-made tree has no
// tokens but the ignored `;` that a case names; the kinds and the ranges of the
// other tokens are not held to a document of the parser here. Each case lists
// the statements as the source writes them, in order, and the tree gets the
// range of each piece from the source: the trees that the parser records are
// compared in `db-from-tree.test.ts`.

/** A label (a text of an axis or of a quadrant, a name), as the source writes it. */
interface LabelSpec {
  readonly kind: "text" | "string" | "markdown"
  /** All of it: the string with its quotes, and the words that follow it. */
  readonly written: string
}

/** A label of words without quotes. */
function words(written: string): LabelSpec {
  return { kind: "text", written }
}

/** A label that starts with a string, written with its quotes. */
function string(written: string): LabelSpec {
  return { kind: "string", written }
}

/** A label that starts with a markdown string, written with its quotes and backquotes. */
function markdown(written: string): LabelSpec {
  return { kind: "markdown", written }
}

/** A statement as the source writes it. */
type StatementSpec =
  | { readonly kind: "title"; readonly text?: string }
  | { readonly kind: "acc-title" | "acc-descr"; readonly text: string }
  | { readonly kind: "acc-block"; readonly text?: string }
  | {
      readonly kind: "axis"
      readonly axis: "x" | "y"
      readonly start: LabelSpec
      readonly arrow?: true
      readonly end?: LabelSpec
    }
  | {
      readonly kind: "quadrant"
      readonly number: 1 | 2 | 3 | 4
      readonly text: LabelSpec
    }
  | {
      readonly kind: "point"
      readonly name: LabelSpec
      readonly className?: string
      readonly x: string
      readonly y: string
      readonly styles?: readonly string[]
    }
  | {
      readonly kind: "class-def"
      readonly name: string
      readonly styles: readonly string[]
    }

/** A case: a fixture and the statements; the `;` of the text that follows `ignoredSemicolonAfter` is the one the style line rule ignores. */
interface Case {
  readonly fixture: string
  readonly statements: readonly StatementSpec[]
  readonly ignoredSemicolonAfter?: string
}

/** A `title` statement. */
function title(text?: string): StatementSpec {
  return text === undefined ? { kind: "title" } : { kind: "title", text }
}

/** An `accDescr {` block. */
function block(text?: string): StatementSpec {
  return text === undefined
    ? { kind: "acc-block" }
    : { kind: "acc-block", text }
}

/** An axis statement with its texts, the arrow, and the second text. */
function axis(
  letter: "x" | "y",
  start: LabelSpec,
  arrow?: true,
  end?: LabelSpec,
): StatementSpec {
  return {
    kind: "axis",
    axis: letter,
    start,
    ...(arrow === undefined ? {} : { arrow }),
    ...(end === undefined ? {} : { end }),
  }
}

/** A quadrant statement. */
function quadrant(number: 1 | 2 | 3 | 4, text: LabelSpec): StatementSpec {
  return { kind: "quadrant", number, text }
}

/** A point with these coordinates and styles, and the class that follows `:::`. */
function point(
  name: LabelSpec,
  x: string,
  y: string,
  styles: readonly string[] = [],
  className?: string,
): StatementSpec {
  return {
    kind: "point",
    name,
    x,
    y,
    styles,
    ...(className === undefined ? {} : { className }),
  }
}

/** A `classDef` statement. */
function classDef(name: string, ...styles: string[]): StatementSpec {
  return { kind: "class-def", name, styles }
}

const A = words("A")
const NO_BREAK_SPACE = String.fromCharCode(0xa0)

const CASES: readonly Case[] = [
  // Converted form.
  {
    fixture: "db-grid-crlf-x-axis-quoted",
    statements: [axis("x", string('"a\r\nb"'))],
  },
  {
    fixture: "db-grid-html-x-axis-quoted",
    statements: [axis("x", string('"<a b="c">d"'))],
  },
  {
    fixture: "db-quadrant-entity",
    statements: [quadrant(1, words("a#35;b"))],
  },
  {
    fixture: "db-directive-in-quotes",
    statements: [quadrant(1, string('"a%%{init: {}}%%b"'))],
  },
  {
    fixture: "db-comment-line-inside-quoted-text",
    statements: [quadrant(1, string('"a\n%% c\nb"'))],
  },
  {
    fixture: "db-directive-inside-quoted-multiline",
    statements: [quadrant(1, string('"a\n%%{init: {}}%%\nb"'))],
  },
  {
    fixture: "db-grid-style-quadrant-quoted",
    statements: [quadrant(2, string('"style:#x;y"'))],
    ignoredSemicolonAfter: "style:#x",
  },
  // Texts.
  {
    fixture: "db-quadrant-spaces-trimmed",
    statements: [quadrant(1, words("A  b"))],
  },
  {
    fixture: "db-quadrant-tab-inside",
    statements: [quadrant(1, words("a\tb"))],
  },
  {
    fixture: "db-quadrant-quoted",
    statements: [quadrant(1, string('"a b"'))],
  },
  {
    fixture: "db-quadrant-quoted-newline",
    statements: [quadrant(1, string('"a\nb"'))],
  },
  {
    fixture: "db-quadrant-quoted-then-bare",
    statements: [quadrant(1, string('"a" b'))],
  },
  {
    fixture: "db-quadrant-markdown",
    statements: [quadrant(1, markdown('"`a`"'))],
  },
  {
    fixture: "db-quadrant-markdown-then-bare",
    statements: [quadrant(1, markdown('"`a`" b'))],
  },
  {
    fixture: "db-x-axis-markdown-multiline",
    statements: [axis("x", markdown('"`L\nM`"'))],
  },
  {
    fixture: "db-name-markdown",
    statements: [point(markdown('"`A`"'), "0.3", "0.6")],
  },
  // Title.
  {
    fixture: "db-title-frontmatter",
    statements: [],
  },
  {
    fixture: "db-title-frontmatter-and-statement",
    statements: [title("T")],
  },
  {
    fixture: "db-title-frontmatter-after-statement",
    statements: [title()],
  },
  {
    fixture: "db-title-twice",
    statements: [title("T"), title("U")],
  },
  {
    fixture: "db-title-keyword-alone",
    statements: [title()],
  },
  // Accessibility.
  {
    fixture: "db-acc-title-plain",
    statements: [{ kind: "acc-title", text: "A" }],
  },
  {
    fixture: "db-acc-title-trimmed",
    statements: [{ kind: "acc-title", text: "A  b" }],
  },
  {
    fixture: "db-acc-title-twice",
    statements: [
      { kind: "acc-title", text: "A" },
      { kind: "acc-title", text: "B" },
    ],
  },
  {
    fixture: "db-acc-title-next-line",
    statements: [{ kind: "acc-title", text: "A" }],
  },
  {
    fixture: "db-acc-descr-plain",
    statements: [{ kind: "acc-descr", text: "D" }],
  },
  {
    fixture: "db-acc-descr-trimmed",
    statements: [{ kind: "acc-descr", text: "D  e" }],
  },
  { fixture: "db-acc-descr-block", statements: [block("D")] },
  { fixture: "db-acc-descr-block-lines", statements: [block("D\nE")] },
  {
    fixture: "db-acc-descr-block-indented-lines",
    statements: [block("D\n    E")],
  },
  {
    fixture: "db-acc-descr-block-blank-lines",
    statements: [block("D\n\nE")],
  },
  { fixture: "db-acc-descr-block-empty", statements: [block()] },
  {
    fixture: "db-acc-descr-empty-block-keeps-line-braces",
    statements: [{ kind: "acc-descr", text: "D" }, block()],
  },
  {
    fixture: "db-acc-descr-empty-block-keeps-block",
    statements: [block("D"), block()],
  },
  {
    fixture: "db-acc-both",
    statements: [
      { kind: "acc-title", text: "A" },
      { kind: "acc-descr", text: "D" },
    ],
  },
  // Quadrants.
  {
    fixture: "db-quadrant-all-four",
    statements: [
      quadrant(1, words("A")),
      quadrant(2, words("B")),
      quadrant(3, words("C")),
      quadrant(4, words("D")),
    ],
  },
  {
    fixture: "db-quadrant-reverse-order",
    statements: [
      quadrant(4, words("D")),
      quadrant(3, words("C")),
      quadrant(2, words("B")),
      quadrant(1, words("A")),
    ],
  },
  {
    fixture: "db-quadrant-3-alone",
    statements: [quadrant(3, words("T"))],
  },
  {
    fixture: "db-quadrant-twice",
    statements: [quadrant(1, words("A")), quadrant(1, words("B"))],
  },
  {
    fixture: "db-quadrant-twice-empty-spaces",
    statements: [quadrant(1, words("A")), quadrant(1, string('"  "'))],
  },
  {
    fixture: "db-quadrant-ten",
    statements: [quadrant(1, words("0 A"))],
  },
  // Axes.
  {
    fixture: "db-x-axis-both",
    statements: [axis("x", words("L"), true, words("R"))],
  },
  { fixture: "db-x-axis-left-only", statements: [axis("x", words("L"))] },
  {
    fixture: "db-x-axis-left-with-arrow",
    statements: [axis("x", words("L"), true)],
  },
  {
    fixture: "db-x-axis-twice",
    statements: [
      axis("x", words("L"), true, words("R")),
      axis("x", words("M")),
    ],
  },
  {
    fixture: "db-x-axis-twice-arrow-then-both",
    statements: [
      axis("x", words("L"), true),
      axis("x", words("M"), true, words("S")),
    ],
  },
  {
    fixture: "db-x-axis-twice-arrow-without-right",
    statements: [
      axis("x", words("L"), true, words("R")),
      axis("x", words("M"), true),
    ],
  },
  {
    fixture: "db-x-axis-right-only-after-left",
    statements: [axis("x", words("L")), axis("x", words("M"), true)],
  },
  {
    fixture: "db-x-axis-spaces-only-string",
    statements: [axis("x", string('"  "'), true, words("R"))],
  },
  {
    fixture: "db-x-axis-quoted-both",
    statements: [axis("x", string('"L"'), true, string('"R"'))],
  },
  {
    fixture: "db-x-axis-quoted-glued-text",
    statements: [axis("x", string('"L" M'))],
  },
  {
    fixture: "db-y-axis-both",
    statements: [axis("y", words("B"), true, words("T"))],
  },
  { fixture: "db-y-axis-bottom-only", statements: [axis("y", words("B"))] },
  // Points.
  {
    fixture: "db-point-plain",
    statements: [point(A, "0.3", "0.6")],
  },
  {
    fixture: "db-points-three",
    statements: [
      point(A, "0.3", "0.6"),
      point(words("B"), "0.1", "0.2"),
      point(words("C"), "1", "0"),
    ],
  },
  {
    fixture: "db-points-same-name",
    statements: [point(A, "0.3", "0.6"), point(A, "0.1", "0.2")],
  },
  {
    fixture: "db-point-long-fraction",
    statements: [point(A, "0.123456789", "0.5")],
  },
  {
    fixture: "db-point-coordinate-any-char-x",
    statements: [point(A, "0x5", "0.6")],
  },
  {
    fixture: "db-point-coordinate-space-in-x",
    statements: [point(A, "0 3", "0.6")],
  },
  {
    fixture: "db-class-plain",
    statements: [point(A, "0.3", "0.6", [], "c1")],
  },
  {
    fixture: "db-class-undefined",
    statements: [
      classDef("c1", "color: #f00"),
      point(A, "0.3", "0.6", [], "c2"),
    ],
  },
  // Styles.
  {
    fixture: "db-style-radius",
    statements: [point(A, "0.3", "0.6", ["radius: 10"])],
  },
  {
    fixture: "db-style-radius-leading-zeros",
    statements: [point(A, "0.3", "0.6", ["radius: 007"])],
  },
  {
    fixture: "db-style-radius-overflow",
    statements: [point(A, "0.3", "0.6", [`radius: ${"9".repeat(400)}`])],
  },
  {
    fixture: "db-radius-above-safe-integer",
    statements: [point(A, "0.3", "0.6", ["radius: 9007199254740993"])],
  },
  {
    fixture: "db-style-color",
    statements: [point(A, "0.3", "0.6", ["color: #ff0000"])],
  },
  {
    fixture: "db-style-stroke-width-leading-zero",
    statements: [point(A, "0.3", "0.6", ["stroke-width: 03px"])],
  },
  {
    fixture: "db-style-two",
    statements: [point(A, "0.3", "0.6", ["radius: 10", "color: #f00"])],
  },
  {
    fixture: "db-style-two-reversed",
    statements: [point(A, "0.3", "0.6", ["color: #f00", "radius: 10"])],
  },
  {
    fixture: "db-style-same-twice",
    statements: [point(A, "0.3", "0.6", ["radius: 10", "radius: 20"])],
  },
  {
    fixture: "db-style-radius-colon-after",
    statements: [point(A, "0.3", "0.6", ["radius: 10:"])],
  },
  {
    fixture: "db-style-color-colon-space-after",
    statements: [point(A, "0.3", "0.6", ["color: #f00 : x"])],
  },
  {
    fixture: "db-style-space-around",
    statements: [point(A, "0.3", "0.6", ["radius:  10", "color:  #f00"])],
  },
  {
    fixture: "db-style-four",
    statements: [
      point(A, "0.3", "0.6", [
        "radius: 10",
        "color: #f00",
        "stroke-color: #0f0",
        "stroke-width: 2px",
      ]),
    ],
  },
  // Classes.
  {
    fixture: "db-classdef-color",
    statements: [classDef("c1", "color: #f00")],
  },
  {
    fixture: "db-classdef-twice-replaces",
    statements: [classDef("c1", "color: #f00"), classDef("c1", "radius: 7")],
  },
  {
    fixture: "db-classdef-two-classes",
    statements: [classDef("c1", "color: #f00"), classDef("c2", "radius: 3")],
  },
  {
    fixture: "db-classdef-redefine-order",
    statements: [
      classDef("c1", "color: #f00"),
      classDef("c2", "radius: 3"),
      classDef("c1", "radius: 7"),
    ],
  },
  {
    fixture: "db-classdef-three-times-partner",
    statements: [
      classDef("c1", "color: #f00"),
      classDef("c2", "radius: 3"),
      classDef("c1", "radius: 7"),
      classDef("c2", "color: #00f"),
    ],
  },
  {
    fixture: "db-classdef-point-style-and-class",
    statements: [
      classDef("c1", "color: #f00"),
      point(A, "0.3", "0.6", ["color: #00f"], "c1"),
    ],
  },
  {
    fixture: "db-classdef-unused",
    statements: [
      classDef("c1", "color: #f00"),
      classDef("c2", "radius: 3"),
      point(A, "0.3", "0.6"),
    ],
  },
  {
    fixture: "db-classdef-dash-name",
    statements: [classDef("c-1", "color: #f00")],
  },
  {
    fixture: "db-grid-nbsp-classdef-name",
    statements: [classDef(`a${NO_BREAK_SPACE}b`, "color: #f00")],
  },
  {
    fixture: "db-classdef-prototype-used",
    statements: [
      classDef("constructor", "color: #f00"),
      point(A, "0.3", "0.6", [], "constructor"),
    ],
  },
  // The summary.
  {
    fixture: "config-settings-chart",
    statements: [
      title("T"),
      axis("x", words("L"), true, words("R")),
      axis("y", words("B"), true, words("T")),
      quadrant(1, words("A")),
      quadrant(2, words("B")),
      quadrant(3, words("C")),
      quadrant(4, words("D")),
      point(A, "0.3", "0.6", ["radius: 5", "color: #f00"]),
    ],
  },
  // The replacement of characters.
  {
    fixture: "config-security-level-other-all",
    statements: [
      title('"T<b>x</b>"'),
      { kind: "acc-title", text: "A<i>" },
      axis("x", string('"X<i>"'), true, string('"Y<u>"')),
      axis("y", string('"P<i>"'), true, string('"Q<u>"')),
      quadrant(1, string('"q<b>"')),
      quadrant(2, string('"q<i>"')),
      quadrant(3, string('"q<u>"')),
      quadrant(4, string('"q<s>"')),
      point(string('"p<b>"'), "0.3", "0.6"),
    ],
  },
]

/**
 * The tree of `input` for `testCase`: each piece gets the range of its text,
 * found after the one before it.
 */
function treeOf(input: string, testCase: Case): DbTreeRoot {
  const frontmatterEnd = input.startsWith("---\n")
    ? input.indexOf("\n---\n") + 5
    : 0
  let cursor = frontmatterEnd
  const lowerCase = input.toLowerCase()

  /** The range of `written`, found after the cursor, which moves to its end. */
  function take(written: string, ignoreCase = false): TreeRange {
    const start = (ignoreCase ? lowerCase : input).indexOf(
      ignoreCase ? written.toLowerCase() : written,
      cursor,
    )
    if (start === -1) throw new Error(`no ${JSON.stringify(written)}`)
    cursor = start + written.length
    return [start, cursor]
  }

  /** A node of the type `type` over `range`, with `fields`. */
  function node(
    type: string,
    range: TreeRange,
    fields: Record<string, unknown> = {},
  ): TreeNode & Record<string, unknown> {
    return { type, range, ...fields }
  }

  /** The range from the start of the first to the end of the last. */
  function spanning(first: TreeRange, last: TreeRange): TreeRange {
    return [first[0], last[1]]
  }

  /** A QuadrantLabel. */
  function label(spec: LabelSpec): TreeNode {
    return node("QuadrantLabel", take(spec.written), {
      kind: spec.kind,
      value: "",
    })
  }

  /** A QuadrantLiteral over the written text `written`. */
  function literal(written: string): TreeNode {
    return node("QuadrantLiteral", take(written), { value: written })
  }

  /** The literal that follows a keyword (null when none is written). */
  function optionalLiteral(written: string | undefined): TreeNode | null {
    return written === undefined ? null : literal(written)
  }

  /** The node of a statement. */
  function statement(spec: StatementSpec): TreeNode {
    switch (spec.kind) {
      case "title": {
        const keyword = take("title", true)
        const value = optionalLiteral(spec.text)
        return node(
          "QuadrantTitleStatement",
          spanning(keyword, value?.range ?? keyword),
          { value },
        )
      }
      case "acc-title":
      case "acc-descr": {
        const keyword = take(
          spec.kind === "acc-title" ? "accTitle" : "accDescr",
          true,
        )
        take(":")
        const value = literal(spec.text)
        return node(
          spec.kind === "acc-title"
            ? "QuadrantAccTitleStatement"
            : "QuadrantAccDescrStatement",
          spanning(keyword, value.range),
          { value },
        )
      }
      case "acc-block": {
        const keyword = take("accDescr", true)
        take("{")
        const value = optionalLiteral(spec.text)
        const close = take("}")
        return node(
          "QuadrantAccDescrBlockStatement",
          spanning(keyword, close),
          { value },
        )
      }
      case "axis": {
        const keyword = take(`${spec.axis}-axis`, true)
        const start = label(spec.start)
        const arrow = spec.arrow === true ? take("-->") : null
        const end = spec.end === undefined ? null : label(spec.end)
        return node(
          "QuadrantAxisStatement",
          spanning(keyword, end?.range ?? arrow ?? start.range),
          { axis: spec.axis, start, arrow: arrow !== null, end },
        )
      }
      case "quadrant": {
        const keyword = take(`quadrant-${spec.number}`, true)
        const text = label(spec.text)
        return node(
          "QuadrantQuadrantStatement",
          spanning(keyword, text.range),
          { quadrant: spec.number, text },
        )
      }
      case "point": {
        const name = label(spec.name)
        let className: TreeNode | null = null
        if (spec.className !== undefined) {
          take(":::")
          className = node("Identifier", take(spec.className), {
            name: spec.className,
          })
        }
        take(":")
        take("[")
        const x = literal(spec.x)
        take(",")
        const y = literal(spec.y)
        const close = take("]")
        const styles = (spec.styles ?? []).map((style) => literal(style))
        return node(
          "QuadrantPointStatement",
          spanning(name.range, styles.at(-1)?.range ?? close),
          { name, className, x, y, styles },
        )
      }
      case "class-def": {
        const keyword = take("classDef")
        const name = node("QuadrantIdentifier", take(spec.name), {
          name: spec.name,
        })
        const styles = spec.styles.map((style) => literal(style))
        return node(
          "QuadrantClassDefStatement",
          spanning(keyword, styles.at(-1)?.range ?? name.range),
          { name, styles },
        )
      }
      default:
        throw new Error("unknown statement")
    }
  }

  take("quadrantChart")
  const body = testCase.statements.map((spec) => statement(spec))
  const tokens: TreeToken[] = []
  if (testCase.ignoredSemicolonAfter !== undefined) {
    const offset =
      input.indexOf(testCase.ignoredSemicolonAfter) +
      testCase.ignoredSemicolonAfter.length
    tokens.push({
      type: "IgnoredSemicolon",
      range: [offset, offset + 1],
      value: ";",
    })
  }
  const frontmatter: TreeNode | null =
    frontmatterEnd === 0 ? null : node("Frontmatter", [0, frontmatterEnd])
  return {
    type: "Root",
    diagramType: "quadrantChart",
    range: [0, input.length],
    body: node("QuadrantDiagram", [frontmatterEnd, input.length], {
      body,
    }) as DbTreeRoot["body"],
    frontmatter,
    comments: [],
    directives: [],
    tokens,
  }
}

describe("dbFromTree of a quadrant chart tree made by hand", async () => {
  const fixtures = await loadFixtures("quadrant")
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
