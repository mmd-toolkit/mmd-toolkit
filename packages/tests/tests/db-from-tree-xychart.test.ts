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

// The Db built from xychart trees made by hand, for the fixtures that name the
// steps of docs/db-from-tree/xychart.md. A hand-made tree has no tokens but the
// units of the texts without quotes, which the Db joins; the kinds and the
// ranges of the other tokens are not held to a document of the parser here.
// Each case lists the headers and the statements as the source writes them, in
// order, and the tree gets the range of each text from the source: the trees
// that the parser records are compared in `db-from-tree.test.ts`.

/** A text without quotes, written as these units, or a string, written as `text` with its quotes. */
type TextSpec =
  | { readonly kind: "words"; readonly units: readonly string[] }
  | { readonly kind: "string"; readonly text: string }

/** A text without quotes of these units (`Two`, `words`). */
function words(...units: string[]): TextSpec {
  return { kind: "words", units }
}

/** A string, written as `text` with its quotes. */
function string(text: string): TextSpec {
  return { kind: "string", text }
}

/** A value of a plot: its number, and its label as the source writes it. */
type ValueSpec = readonly [number: string, label?: string]

/** A statement as the source writes it. */
type StatementSpec =
  | { readonly kind: "title"; readonly text: TextSpec }
  | {
      readonly kind: "x-axis"
      readonly title?: TextSpec
      readonly band?: readonly TextSpec[]
      readonly range?: readonly [string, string]
    }
  | {
      readonly kind: "y-axis"
      readonly title?: TextSpec
      readonly range?: readonly [string, string]
    }
  | {
      readonly kind: "plot"
      readonly keyword: string
      readonly title?: TextSpec
      readonly values: readonly ValueSpec[]
    }
  | {
      readonly kind: "acc-title" | "acc-descr" | "acc-block"
      readonly text?: string
      /** For a block: that its `}` is not written. */
      readonly unclosed?: true
    }

/** A case: a fixture, the orientation of each header, and the statements. */
interface Case {
  readonly fixture: string
  readonly headers: readonly (string | null)[]
  readonly statements: readonly StatementSpec[]
}

/** A header without an orientation. */
const PLAIN: readonly (string | null)[] = [null]

/** A plot of the keyword `line` with these numbers. */
function line(...numbers: string[]): StatementSpec {
  return {
    kind: "plot",
    keyword: "line",
    values: numbers.map((number) => [number] as const),
  }
}

/** A plot of the keyword `bar` with these numbers. */
function bar(...numbers: string[]): StatementSpec {
  return {
    kind: "plot",
    keyword: "bar",
    values: numbers.map((number) => [number] as const),
  }
}

const CASES: readonly Case[] = [
  { fixture: "db-header-plain", headers: PLAIN, statements: [] },
  { fixture: "db-header-beta-only", headers: PLAIN, statements: [] },
  {
    fixture: "db-orientation-horizontal",
    headers: ["horizontal"],
    statements: [],
  },
  {
    fixture: "db-orientation-capitalized",
    headers: ["Horizontal"],
    statements: [],
  },
  {
    fixture: "db-orientation-vertical-upper-case",
    headers: ["VERTICAL"],
    statements: [],
  },
  {
    fixture: "db-orientation-with-statement",
    headers: ["horizontal"],
    statements: [{ kind: "title", text: string('"T"') }],
  },
  {
    fixture: "config-orientation-setting-horizontal",
    headers: PLAIN,
    statements: [line("1")],
  },
  {
    fixture: "config-orientation-directive",
    headers: PLAIN,
    statements: [line("1")],
  },
  {
    fixture: "config-orientation-frontmatter-header-wins",
    headers: ["vertical"],
    statements: [line("1")],
  },
  {
    fixture: "db-title-bare-words",
    headers: PLAIN,
    statements: [{ kind: "title", text: words("Two", "words") }],
  },
  {
    fixture: "db-title-quoted",
    headers: PLAIN,
    statements: [{ kind: "title", text: string('"A title"') }],
  },
  {
    fixture: "db-title-quoted-spaces-trimmed",
    headers: PLAIN,
    statements: [{ kind: "title", text: string('"  a  b  "') }],
  },
  {
    fixture: "db-title-twice",
    headers: PLAIN,
    statements: [
      { kind: "title", text: string('"A"') },
      { kind: "title", text: string('"B"') },
    ],
  },
  {
    fixture: "db-title-at-end-of-text",
    headers: PLAIN,
    statements: [{ kind: "title", text: words("T") }],
  },
  {
    fixture: "db-title-frontmatter",
    headers: PLAIN,
    statements: [line("1")],
  },
  {
    fixture: "db-title-frontmatter-spaces",
    headers: PLAIN,
    statements: [line("1")],
  },
  {
    fixture: "db-title-frontmatter-and-statement",
    headers: PLAIN,
    statements: [{ kind: "title", text: words("SM") }, line("1")],
  },
  {
    fixture: "db-x-axis-band-title",
    headers: PLAIN,
    statements: [
      { kind: "x-axis", title: words("T"), band: [words("a"), words("b")] },
    ],
  },
  {
    fixture: "db-x-axis-range",
    headers: PLAIN,
    statements: [{ kind: "x-axis", range: ["1", "10"] }],
  },
  {
    fixture: "db-x-axis-range-title",
    headers: PLAIN,
    statements: [{ kind: "x-axis", title: words("T"), range: ["1", "10"] }],
  },
  {
    fixture: "db-x-axis-title-bare-word",
    headers: PLAIN,
    statements: [{ kind: "x-axis", title: words("Month") }],
  },
  {
    fixture: "db-x-axis-title-then-glued-range",
    headers: PLAIN,
    statements: [{ kind: "x-axis", title: words("T"), range: ["1", "2"] }],
  },
  {
    fixture: "db-x-axis-twice",
    headers: PLAIN,
    statements: [
      { kind: "x-axis", band: [words("a")] },
      { kind: "x-axis", band: [words("b"), words("c")] },
    ],
  },
  {
    fixture: "db-x-axis-twice-title-cleared",
    headers: PLAIN,
    statements: [
      { kind: "x-axis", title: words("T"), band: [words("a")] },
      { kind: "x-axis", band: [words("b")] },
    ],
  },
  {
    fixture: "db-x-axis-range-then-band",
    headers: PLAIN,
    statements: [
      { kind: "x-axis", range: ["1", "3"] },
      { kind: "x-axis", band: [words("a"), words("b")] },
    ],
  },
  {
    fixture: "db-y-axis-range-title",
    headers: PLAIN,
    statements: [{ kind: "y-axis", title: string('"Y"'), range: ["0", "100"] }],
  },
  {
    fixture: "db-y-axis-title-only-then-range",
    headers: PLAIN,
    statements: [
      { kind: "y-axis", title: words("Y") },
      { kind: "y-axis", range: ["1", "2"] },
    ],
  },
  {
    fixture: "db-y-axis-twice",
    headers: PLAIN,
    statements: [
      { kind: "y-axis", title: words("Y"), range: ["1", "2"] },
      { kind: "y-axis", title: words("Z") },
    ],
  },
  {
    fixture: "db-y-axis-no-range-no-plot",
    headers: PLAIN,
    statements: [{ kind: "y-axis", title: words("Y") }],
  },
  {
    fixture: "db-y-axis-before-plot",
    headers: PLAIN,
    statements: [{ kind: "y-axis", range: ["0", "1"] }, line("3", "1")],
  },
  {
    fixture: "db-y-axis-after-plot",
    headers: PLAIN,
    statements: [line("3", "1"), { kind: "y-axis", range: ["0", "1"] }],
  },
  {
    fixture: "db-line-values",
    headers: PLAIN,
    statements: [line("1", "2", "3")],
  },
  {
    fixture: "db-bar-values",
    headers: PLAIN,
    statements: [bar("1", "2", "3")],
  },
  {
    fixture: "db-label-one",
    headers: PLAIN,
    statements: [
      { kind: "plot", keyword: "line", values: [["1", '"a"'], ["2"]] },
    ],
  },
  {
    fixture: "db-label-all",
    headers: PLAIN,
    statements: [
      {
        kind: "plot",
        keyword: "line",
        values: [
          ["1", '"a"'],
          ["2", '"b"'],
        ],
      },
    ],
  },
  {
    fixture: "db-label-on-bar",
    headers: PLAIN,
    statements: [
      { kind: "plot", keyword: "bar", values: [["1", '"a"'], ["2"]] },
    ],
  },
  {
    fixture: "db-label-empty-string",
    headers: PLAIN,
    statements: [{ kind: "plot", keyword: "line", values: [["1", '""']] }],
  },
  {
    fixture: "db-label-spaces-trimmed",
    headers: PLAIN,
    statements: [{ kind: "plot", keyword: "line", values: [["1", '"  a  "']] }],
  },
  {
    fixture: "db-label-beyond-categories",
    headers: PLAIN,
    statements: [
      { kind: "x-axis", band: [words("a")] },
      {
        kind: "plot",
        keyword: "line",
        values: [
          ["1", '"p"'],
          ["2", '"q"'],
        ],
      },
    ],
  },
  {
    fixture: "db-plot-title-trimmed",
    headers: PLAIN,
    statements: [
      {
        kind: "plot",
        keyword: "line",
        title: string('"  T  "'),
        values: [["1"]],
      },
    ],
  },
  {
    fixture: "db-data-band-equal",
    headers: PLAIN,
    statements: [
      { kind: "x-axis", band: [words("a"), words("b"), words("c")] },
      bar("1", "2", "3"),
    ],
  },
  {
    fixture: "db-data-band-fewer-values",
    headers: PLAIN,
    statements: [
      { kind: "x-axis", band: [words("a"), words("b"), words("c")] },
      bar("1"),
    ],
  },
  {
    fixture: "db-data-band-more-values",
    headers: PLAIN,
    statements: [
      { kind: "x-axis", band: [words("a"), words("b")] },
      bar("1", "2", "3", "4"),
    ],
  },
  {
    fixture: "db-data-band-two-plots",
    headers: PLAIN,
    statements: [
      { kind: "x-axis", band: [words("a"), words("b")] },
      line("1", "2"),
      bar("3", "4"),
    ],
  },
  {
    fixture: "db-data-band-after-plot",
    headers: PLAIN,
    statements: [
      line("1", "2"),
      { kind: "x-axis", band: [words("a"), words("b")] },
    ],
  },
  {
    fixture: "db-data-band-after-plot-longer",
    headers: PLAIN,
    statements: [
      bar("1", "2", "3", "4"),
      { kind: "x-axis", band: [words("a"), words("b")] },
    ],
  },
  {
    fixture: "db-data-longer-second-plot",
    headers: PLAIN,
    statements: [bar("1", "2"), bar("10", "20", "30")],
  },
  {
    fixture: "db-data-shorter-second-plot",
    headers: PLAIN,
    statements: [bar("1", "2", "3"), bar("10")],
  },
  {
    fixture: "db-data-no-axis-bar-and-line",
    headers: PLAIN,
    statements: [
      line("1", "2"),
      bar("3", "4"),
      { kind: "plot", keyword: "line", title: words("L2"), values: [["5"]] },
    ],
  },
  {
    fixture: "db-data-range-after-plot",
    headers: PLAIN,
    statements: [bar("0.1", "0.2"), { kind: "x-axis", range: ["0", "1"] }],
  },
  {
    fixture: "db-data-range-one-value",
    headers: PLAIN,
    statements: [{ kind: "x-axis", range: ["0", "10"] }, bar("1")],
  },
  {
    fixture: "db-data-range-three",
    headers: PLAIN,
    statements: [{ kind: "x-axis", range: ["0", "10"] }, bar("1", "2", "3")],
  },
  {
    fixture: "db-data-range-fractions",
    headers: PLAIN,
    statements: [
      { kind: "x-axis", range: ["0", "1"] },
      line("1", "2", "3", "4"),
    ],
  },
  {
    fixture: "db-data-range-reversed",
    headers: PLAIN,
    statements: [{ kind: "x-axis", range: ["5", "1"] }, line("1", "2", "3")],
  },
  {
    fixture: "db-data-xy-title-and-plots",
    headers: PLAIN,
    statements: [
      { kind: "title", text: string('"T"') },
      { kind: "x-axis", title: string('"X"'), band: [words("a"), words("b")] },
      { kind: "y-axis", title: string('"Y"'), range: ["0", "10"] },
      {
        kind: "plot",
        keyword: "line",
        title: string('"L"'),
        values: [["1"], ["2"]],
      },
      {
        kind: "plot",
        keyword: "bar",
        title: string('"B"'),
        values: [["3"], ["4"]],
      },
    ],
  },
  {
    fixture: "db-data-y-range-band-truncation",
    headers: PLAIN,
    statements: [{ kind: "x-axis", band: [words("a")] }, bar("9", "1")],
  },
  {
    fixture: "db-data-y-range-from-plots",
    headers: PLAIN,
    statements: [line("1", "5"), bar("-2", "3")],
  },
  {
    fixture: "db-data-y-range-negative-zero",
    headers: PLAIN,
    statements: [bar("-0", "0")],
  },
  {
    fixture: "db-data-y-range-single-value",
    headers: PLAIN,
    statements: [bar("4")],
  },
  {
    fixture: "db-plot-values-large",
    headers: PLAIN,
    statements: [bar("99999999999999999999")],
  },
  {
    fixture: "db-plot-values-overflow",
    headers: PLAIN,
    statements: [bar("9".repeat(400))],
  },
  {
    fixture: "db-plot-values-negative-zero",
    headers: PLAIN,
    statements: [bar("-0")],
  },
  {
    fixture: "db-plot-values-leading-zeros",
    headers: PLAIN,
    statements: [bar("007", "010")],
  },
  {
    fixture: "db-data-everything",
    headers: ["horizontal"],
    statements: [
      { kind: "title", text: string('"T"') },
      { kind: "acc-title", text: "AT" },
      { kind: "acc-descr", text: "AD" },
      {
        kind: "x-axis",
        title: string('"X"'),
        band: [words("a"), string('"b c"')],
      },
      { kind: "y-axis", title: string('"Y"'), range: ["-1", "10"] },
      {
        kind: "plot",
        keyword: "line",
        title: string('"L"'),
        values: [["1", '"p"'], ["2"]],
      },
      bar("3"),
    ],
  },
  {
    fixture: "config-security-level-other-all",
    headers: PLAIN,
    statements: [
      { kind: "title", text: string('"T<b>x</b>"') },
      { kind: "acc-title", text: "A<i>" },
      {
        kind: "x-axis",
        title: string('"X<i>"'),
        band: [string('"c<b>"'), words("d")],
      },
      { kind: "y-axis", title: string('"Y<u>"'), range: ["0", "5"] },
      {
        kind: "plot",
        keyword: "line",
        title: string('"L<b>"'),
        values: [["1", '"p<i>"'], ["2"]],
      },
      {
        kind: "plot",
        keyword: "bar",
        title: string('"B<u>"'),
        values: [["3"], ["4"]],
      },
    ],
  },
  {
    fixture: "config-security-level-loose-all",
    headers: PLAIN,
    statements: [
      { kind: "title", text: string('"T<b>x</b>"') },
      { kind: "x-axis", title: string('"X<i>"'), band: [string('"c<b>"')] },
      {
        kind: "plot",
        keyword: "line",
        title: string('"L<b>"'),
        values: [["1", '"p<i>"']],
      },
    ],
  },
  {
    fixture: "config-security-level-other-orientation-horizontal",
    headers: PLAIN,
    statements: [{ kind: "title", text: string('"T<b>"') }, line("1")],
  },
  {
    fixture: "db-acc-title",
    headers: PLAIN,
    statements: [{ kind: "acc-title", text: "A title" }, line("1")],
  },
  {
    fixture: "db-acc-title-empty",
    headers: PLAIN,
    statements: [{ kind: "acc-title" }],
  },
  {
    fixture: "db-acc-title-empty-at-end-after-value",
    headers: PLAIN,
    statements: [{ kind: "acc-title", text: "t" }, { kind: "acc-title" }],
  },
  {
    fixture: "db-acc-title-takes-next-line",
    headers: PLAIN,
    statements: [{ kind: "acc-title", text: "line [1]" }],
  },
  {
    fixture: "db-acc-title-spaces-trimmed",
    headers: PLAIN,
    statements: [{ kind: "acc-title", text: "a b" }],
  },
  {
    fixture: "db-acc-descr",
    headers: PLAIN,
    statements: [{ kind: "acc-descr", text: "A description" }, line("1")],
  },
  {
    fixture: "db-acc-descr-block",
    headers: PLAIN,
    statements: [{ kind: "acc-block", text: "line one\n line two" }, line("1")],
  },
  {
    fixture: "db-acc-descr-block-empty",
    headers: PLAIN,
    statements: [{ kind: "acc-block" }, line("1")],
  },
  {
    fixture: "db-acc-descr-line-then-empty-block",
    headers: PLAIN,
    statements: [{ kind: "acc-descr", text: "d" }, { kind: "acc-block" }],
  },
  {
    fixture: "db-acc-descr-empty-at-end-after-value",
    headers: PLAIN,
    statements: [{ kind: "acc-descr", text: "d" }, { kind: "acc-descr" }],
  },
  {
    fixture: "db-acc-descr-unclosed-block",
    headers: PLAIN,
    statements: [{ kind: "acc-block", text: "a", unclosed: true }],
  },
  {
    fixture: "db-acc-descr-unclosed-block-after-value",
    headers: PLAIN,
    statements: [
      { kind: "acc-descr", text: "d" },
      { kind: "acc-block", text: "e", unclosed: true },
    ],
  },
  {
    fixture: "db-acc-descr-unclosed-empty-block-after-line",
    headers: PLAIN,
    statements: [
      { kind: "acc-descr", text: "d" },
      { kind: "acc-block", unclosed: true },
    ],
  },
  {
    fixture: "db-acc-descr-unclosed-empty-block-spaces",
    headers: PLAIN,
    statements: [
      { kind: "acc-descr", text: "d" },
      { kind: "acc-block", unclosed: true },
    ],
  },
  {
    fixture: "db-acc-descr-unclosed-empty-block-line-feeds",
    headers: PLAIN,
    statements: [
      { kind: "acc-descr", text: "d" },
      { kind: "acc-block", unclosed: true },
    ],
  },
  {
    fixture: "db-acc-descr-block-then-empty-block",
    headers: PLAIN,
    statements: [{ kind: "acc-block", text: "x" }, { kind: "acc-block" }],
  },
]

/**
 * The tree of `input` for `testCase`: each text gets the range of its text,
 * found after the one before it, and a text without quotes the tokens of its
 * units.
 */
function treeOf(input: string, testCase: Case): DbTreeRoot {
  const frontmatterEnd = input.startsWith("---\n")
    ? input.indexOf("\n---\n") + 5
    : 0
  let cursor = frontmatterEnd
  const tokens: TreeToken[] = []
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

  /** The node of a text. */
  function text(spec: TextSpec): TreeNode {
    if (spec.kind === "string") {
      return node("StringLiteral", take(spec.text), {
        value: "",
        closed: true,
      })
    }
    const units = spec.units.map((unit) => take(unit))
    for (const [index, range] of units.entries()) {
      tokens.push({
        type: "Word",
        range,
        value: spec.units[index] ?? "",
      })
    }
    return node("XychartLiteral", [units[0]?.[0] ?? 0, units.at(-1)?.[1] ?? 0])
  }

  /** A number written as `written`. */
  function number(written: string): TreeNode {
    return node("NumericLiteral", take(written), { value: 0 })
  }

  /** The range of the first node to the end of the last. */
  function spanning(first: TreeRange, last: TreeRange): TreeRange {
    return [first[0], last[1]]
  }

  /** A range and its two numbers. */
  function rangeOf(pair: readonly [string, string]): TreeNode {
    const start = number(pair[0])
    const end = number(pair[1])
    return node("XychartRange", spanning(start.range, end.range), {
      start,
      end,
    })
  }

  /** The accessibility text that follows a keyword (null when none is written). */
  function accessibilityText(written: string | undefined): TreeNode | null {
    return written === undefined ? null : node("XychartLiteral", take(written))
  }

  /** The node of a statement. */
  function statement(spec: StatementSpec): TreeNode {
    switch (spec.kind) {
      case "title": {
        const keyword = take("title", true)
        const value = text(spec.text)
        return node("XychartTitleStatement", spanning(keyword, value.range), {
          value,
        })
      }
      case "x-axis": {
        const keyword = take("x-axis", true)
        const title = spec.title === undefined ? null : text(spec.title)
        let data: TreeNode | null = null
        if (spec.band !== undefined) {
          const open = take("[")
          const categories = spec.band.map((category) => text(category))
          const close = take("]")
          data = node("XychartBand", spanning(open, close), { categories })
        } else if (spec.range !== undefined) {
          data = rangeOf(spec.range)
        }
        const end = data?.range ?? title?.range ?? keyword
        return node("XychartXAxisStatement", spanning(keyword, end), {
          title,
          data,
        })
      }
      case "y-axis": {
        const keyword = take("y-axis", true)
        const title = spec.title === undefined ? null : text(spec.title)
        const data = spec.range === undefined ? null : rangeOf(spec.range)
        const end = data?.range ?? title?.range ?? keyword
        return node("XychartYAxisStatement", spanning(keyword, end), {
          title,
          data,
        })
      }
      case "plot": {
        const keyword = take(spec.keyword, true)
        const title = spec.title === undefined ? null : text(spec.title)
        take("[")
        const values = spec.values.map(([written, label]) => {
          const value = number(written)
          const labelNode =
            label === undefined
              ? null
              : node("StringLiteral", take(label), { value: "", closed: true })
          return node(
            "XychartValue",
            spanning(value.range, labelNode?.range ?? value.range),
            { value, label: labelNode },
          )
        })
        const close = take("]")
        return node("XychartPlotStatement", spanning(keyword, close), {
          kind: spec.keyword.toLowerCase(),
          title,
          values,
        })
      }
      case "acc-title":
      case "acc-descr": {
        const keyword = take(
          spec.kind === "acc-title" ? "accTitle" : "accDescr",
          true,
        )
        take(":")
        const value = accessibilityText(spec.text)
        return node(
          spec.kind === "acc-title"
            ? "XychartAccTitleStatement"
            : "XychartAccDescrStatement",
          spanning(keyword, value?.range ?? keyword),
          { value },
        )
      }
      case "acc-block": {
        const keyword = take("accDescr", true)
        const open = take("{")
        const value = accessibilityText(spec.text)
        const close = spec.unclosed === true ? null : take("}")
        return node(
          "XychartAccDescrBlockStatement",
          spanning(keyword, close ?? value?.range ?? open),
          { value, closed: close !== null },
        )
      }
      default:
        throw new Error("unknown statement")
    }
  }

  const header = take(
    input.toLowerCase().includes("xychart-beta") ? "xychart-beta" : "xychart",
    true,
  )
  const headers = testCase.headers.map((orientation, index) => {
    const range =
      orientation === null ? header : spanning(header, take(orientation, true))
    if (index > 0) throw new Error("one header only")
    return node("XychartHeader", range, { orientation })
  })
  const body = testCase.statements.map((spec) => statement(spec))
  const frontmatter: TreeNode | null =
    frontmatterEnd === 0 ? null : node("Frontmatter", [0, frontmatterEnd])
  return {
    type: "Root",
    diagramType: "xychart",
    range: [0, input.length],
    body: node("XychartDiagram", [frontmatterEnd, input.length], {
      headers,
      body,
    }) as DbTreeRoot["body"],
    frontmatter,
    comments: [],
    directives: [],
    tokens,
  }
}

describe("dbFromTree of an xychart tree made by hand", async () => {
  const fixtures = await loadFixtures("xychart")
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
