import { readdirSync, readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import type { HighlighterCore } from "shiki/core"
import { createHighlighterCore } from "shiki/core"
import { createOnigurumaEngine } from "shiki/engine/oniguruma"
import yaml from "shiki/langs/yaml.mjs"
import dark from "shiki/themes/github-dark.mjs"
import light from "shiki/themes/github-light.mjs"
import type { DiagramType } from "@mmd-toolkit/tests"
import { loadFixture } from "@mmd-toolkit/tests"
import { beforeAll, describe, expect, it } from "vitest"
import { createGrammar } from "../src/grammar.ts"
import mermaid from "../src/index.ts"

const grammar = createGrammar()

it("builds a TextMate grammar with resolved patterns", () => {
  expect(grammar.name).toBe("Mermaid")
  expect(grammar.scopeName).toBe("source.mermaid")
  expect(grammar.patterns).toEqual(expect.any(Array))
  expect(grammar.repository).toEqual(expect.any(Object))

  /** Checks every expression, including those inside captures and nested rules. */
  function checkPatterns(value: unknown): void {
    if (Array.isArray(value)) {
      for (const item of value) checkPatterns(item)
    } else if (value !== null && typeof value === "object") {
      for (const [key, item] of Object.entries(value)) {
        if (["match", "begin", "end", "while"].includes(key)) {
          expect(item).toBeTypeOf("string")
          if (typeof item === "string") {
            expect(item).not.toContain("{{")
          }
        } else {
          checkPatterns(item)
        }
      }
    }
  }

  checkPatterns(grammar)
})

/** The root scope of the grammar, which every token has and the tests omit. */
const rootScope = "source.mermaid"

/** Resolves a path under `tests/fixtures/`. */
function fixture(name: string): string {
  return fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url))
}

let highlighter: HighlighterCore

beforeAll(async () => {
  highlighter = await createHighlighterCore({
    themes: [light, dark],
    langs: [mermaid, yaml],
    engine: createOnigurumaEngine(import("shiki/wasm")),
  })
})

/** The tokens of `code`, one array per line, with their scopes. */
function tokenLines(code: string): { content: string; scopes: string[] }[][] {
  return highlighter
    .codeToTokensBase(code, {
      lang: "mermaid",
      theme: "github-light",
      includeExplanation: "scopeName",
    })
    .map((line) =>
      line.flatMap((token) =>
        (token.explanation ?? []).map((part) => ({
          content: part.content,
          scopes: part.scopes
            .map((scope) => scope.scopeName)
            .filter((scope) => scope !== rootScope),
        })),
      ),
    )
}

/**
 * The tokens of `code` as text, for the `.tokens` records: each source line,
 * then one line per token that has a scope besides the root scope, with its
 * text as a JSON string and its scopes.
 */
function tokens(code: string): string {
  const sourceLines = code.split("\n")
  return tokenLines(code)
    .map((line, index) =>
      [
        `> ${sourceLines[index] ?? ""}`,
        ...line
          .filter((token) => token.scopes.length > 0)
          .map(
            (token) =>
              `  ${JSON.stringify(token.content)} ${token.scopes.join(" ")}`,
          ),
      ].join("\n"),
    )
    .join("\n")
}

/**
 * The scopes of the first token whose text is `text`, on the zero-based line
 * `lineIndex` when it is given.
 */
function scopesOf(code: string, text: string, lineIndex?: number): string[] {
  for (const [index, line] of tokenLines(code).entries()) {
    if (lineIndex !== undefined && index !== lineIndex) continue
    const token = line.find((candidate) => candidate.content === text)
    if (token) return token.scopes
  }
  throw new Error(`no token with the text ${JSON.stringify(text)}`)
}

/** The scopes of every token on the zero-based line `lineIndex`. */
function scopesOnLine(code: string, lineIndex: number): string[] {
  return [
    ...new Set(
      (tokenLines(code)[lineIndex] ?? []).flatMap((token) => token.scopes),
    ),
  ]
}

/**
 * What a fixture under `tests/fixtures/` expects, from its `.expected.json`:
 * the header, the tokens that carry a scope, the tokens that do not carry a
 * scope, the lines on which no token carries a scope, and the tokens without
 * any scope. A line is zero-based and picks the occurrence of a text that
 * occurs more than once.
 */
interface ScopeExpectations {
  scopes: [text: string, scope: string, line?: number][]
  absent?: [text: string, scope: string, line?: number][]
  absentOnLine?: [line: number, scope: string][]
  unscoped?: [text: string, line?: number][]
}

interface Expected extends ScopeExpectations {
  header: string
  escapedInputs?: (ScopeExpectations & { code: string })[]
}

/** Checks the same scopes for a fixture and its escaped inputs. */
function checkScopes(code: string, expected: ScopeExpectations): void {
  for (const [text, scope, line] of expected.scopes) {
    expect(scopesOf(code, text, line), text).toContain(scope)
  }
  for (const [text, scope, line] of expected.absent ?? []) {
    expect(scopesOf(code, text, line), text).not.toContain(scope)
  }
  for (const [line, scope] of expected.absentOnLine ?? []) {
    expect(scopesOnLine(code, line), `line ${line}`).not.toContain(scope)
  }
  for (const [text, line] of expected.unscoped ?? []) {
    expect(scopesOf(code, text, line), text).toEqual([])
  }
}

/**
 * The fixtures of the grammar: one input per header of a diagram type, written
 * from the sentences of the specification that name the keywords of the type,
 * each with its `.expected.json` and its `.tokens` record.
 */
const fixtureNames = readdirSync(
  fileURLToPath(new URL("./fixtures/", import.meta.url)),
)
  .filter((name) => name.endsWith(".mmd"))
  .map((name) => name.slice(0, -".mmd".length))
  .sort()

/** Embedded YAML follows its own grammar, including its default text colors. */
const foregroundExceptions = [
  {
    scope: "meta.embedded.block.yaml",
    reason: "README Scopes: the frontmatter body is colored as YAML.",
  },
]

const themes = ["github-light", "github-dark"] as const

/** Every non-whitespace character outside the stated exceptions has a color. */
function checkForeground(code: string): void {
  for (const theme of themes) {
    const foreground = highlighter.getTheme(theme).fg.toLowerCase()
    for (const [lineIndex, line] of highlighter
      .codeToTokensBase(code, {
        lang: "mermaid",
        theme,
        includeExplanation: "scopeName",
      })
      .entries()) {
      for (const token of line) {
        if (!token.content.trim()) continue
        if ((token.color ?? foreground).toLowerCase() !== foreground) continue
        for (const part of token.explanation ?? [
          { content: token.content, scopes: [] },
        ]) {
          if (!part.content.trim()) continue
          const exception = foregroundExceptions.find(({ scope }) =>
            part.scopes.some((item) => item.scopeName === scope),
          )
          expect(
            exception?.reason,
            `${theme}, line ${lineIndex + 1}: ${JSON.stringify(part.content)}`,
          ).toBeDefined()
        }
      }
    }
  }
}

describe("the fixtures of the diagram types", () => {
  it.each(fixtureNames)(
    "colors %s as its expectations say",
    async (name) => {
      const code = readFileSync(fixture(`${name}.mmd`), "utf8")
      const expected = JSON.parse(
        readFileSync(fixture(`${name}.expected.json`), "utf8"),
      ) as Expected
      expect(scopesOf(code, expected.header)).toContain(
        "keyword.control.mermaid",
      )
      checkScopes(code, expected)
      checkForeground(code)
      for (const input of expected.escapedInputs ?? []) {
        checkScopes(input.code, input)
        checkForeground(input.code)
      }
      await expect(tokens(code)).toMatchFileSnapshot(fixture(`${name}.tokens`))
    },
    60_000,
  )
})

it.each(themes)(
  "colors composite-state braces at every depth in %s",
  (theme) => {
    const code = readFileSync(fixture("state.mmd"), "utf8")
    const expected = JSON.parse(
      readFileSync(fixture("state.expected.json"), "utf8"),
    ) as Expected
    const lines = highlighter.codeToTokensBase(code, {
      lang: "mermaid",
      theme,
      includeExplanation: "scopeName",
    })
    const foreground = highlighter.getTheme(theme).fg.toLowerCase()

    for (const [text, scope, line] of expected.scopes) {
      if (
        line === undefined ||
        ![
          "keyword.operator.block.begin.mermaid",
          "keyword.operator.block.end.mermaid",
        ].includes(scope)
      ) {
        continue
      }
      const token = lines[line]?.find((candidate) =>
        candidate.explanation?.some(
          (part) =>
            part.content === text &&
            part.scopes.some((item) => item.scopeName === scope),
        ),
      )
      expect(token, `${text} on line ${line + 1}`).toBeDefined()
      expect(
        (token?.color ?? foreground).toLowerCase(),
        `${text} on line ${line + 1}`,
      ).not.toBe(foreground)
    }
  },
)

it.each([
  {
    name: "class",
    code: "classDiagram\nstyle A fill:rgb(255, 0, 0),stroke:#333",
    separator: ",stroke",
  },
  {
    name: "treemap",
    code: "treemap\nclassDef warn fill:rgb(255, 0, 0),stroke:#333",
    separator: ",stroke",
  },
  {
    name: "state",
    code: "stateDiagram-v2\nstyle A fill:rgb(255, 0, 0),stroke:#333",
    separator: ",stroke",
  },
  {
    name: "block",
    code: "block-beta\nA\nstyle A fill:rgb(255, 0, 0),stroke:#333",
    separator: ",stroke",
  },
  {
    name: "gantt",
    code: "gantt\ntodayMarker stroke:rgb(255, 0, 0),opacity:0.5",
    separator: ",opacity",
  },
])(
  "keeps parenthesized style commas in the value in $name",
  ({ code, separator }) => {
    checkForeground(code)
    for (const theme of themes) {
      const value = foregroundOf(code, "rgb(", theme)
      expect(foregroundOf(code, ", 0", theme)).toBe(value)
      expect(foregroundOf(code, separator, theme)).not.toBe(value)
      expect(foregroundOf(code, separator, theme)).toBe(
        foregroundOf(code, ":", theme),
      )
    }
  },
)

it.each(themes)(
  "colors generic delimiters alike in class names and member types in %s",
  (theme) => {
    const code =
      "classDiagram\nclass Square~Shape~ {\n  +List~int~ position\n  +run(List~T~)\n  +get()$ List~int~\n  +get() List~int~\n}"
    const delimiters = tokenLines(code)
      .flat()
      .filter((token) => token.content === "~")
    expect(delimiters.map((token) => token.scopes.at(-1))).toEqual([
      "keyword.operator.delimiter.generic.begin.mermaid",
      "keyword.operator.delimiter.generic.end.mermaid",
      "keyword.operator.delimiter.generic.begin.mermaid",
      "keyword.operator.delimiter.generic.end.mermaid",
      "keyword.operator.delimiter.generic.begin.mermaid",
      "keyword.operator.delimiter.generic.end.mermaid",
      "keyword.operator.delimiter.generic.begin.mermaid",
      "keyword.operator.delimiter.generic.end.mermaid",
      "keyword.operator.delimiter.generic.begin.mermaid",
      "keyword.operator.delimiter.generic.end.mermaid",
    ])
    const marker = foregroundOf(code, "~Shape", theme)
    for (const line of highlighter.codeToTokensBase(code, {
      lang: "mermaid",
      theme,
      includeExplanation: "scopeName",
    })) {
      for (const token of line) {
        if (token.explanation?.some((part) => part.content === "~")) {
          expect(token.color?.toLowerCase()).toBe(marker)
        }
      }
    }
    expect(foregroundOf(code, "Shape", theme)).not.toBe(marker)
  },
)

/** Fixed units whose foreground colors must remain distinguishable. */
const colorContrasts = [
  {
    name: "data keys, separators and values",
    code: 'flowchart\nA@{ shape: rect, label: "Text" }',
    pairs: [
      ["shape", ":"],
      ["shape", "rect"],
      ["shape", ","],
      [":", "rect"],
      [",", "rect"],
      ["label", "Text"],
    ],
  },
  {
    name: "class member types and names",
    code: "classDiagram\nclass A {\n  +String name\n  +pay(float amount)\n}",
    pairs: [
      ["String", "name"],
      ["float", "pay("],
      ["float", "amount"],
    ],
  },
  {
    name: "gantt dependencies, ids and durations",
    code: "gantt\nT :a1, after b1, 3d",
    pairs: [
      ["after", "a1"],
      ["after", "b1"],
      ["a1", "3d"],
      ["b1", "3d"],
    ],
  },
  {
    name: "sankey values and names",
    code: "sankey-beta\nA,B,3000",
    pairs: [
      ["3000", "A"],
      ["3000", "B"],
    ],
  },
  {
    name: "gantt marker properties and separators",
    code: "gantt\ntodayMarker stroke-width:5px,stroke:#00f,opacity:0.5",
    pairs: [
      [":", "stroke-width"],
      [",", "5px"],
      [",", "#00f"],
      [",", "0.5"],
    ],
  },
  {
    name: "treemap style names, values and separators",
    code: "treemap\nclassDef warning fill:#f96,stroke:#333;",
    pairs: [
      [":", "fill"],
      [":", "#f96"],
      [":#333", "stroke"],
      [":#333", "#333"],
      [",", "#f96"],
      [",", "stroke"],
      [";", "stroke"],
      [";", "#333"],
    ],
  },
  {
    name: "class style names, values and separators",
    code: "classDiagram\nclassDef warning fill:#f96,stroke:#333;",
    pairs: [
      [":", "fill"],
      [":", "#f96"],
      [":#333", "stroke"],
      [":#333", "#333"],
      [",", "#f96"],
      [",", "stroke"],
      [";", "stroke"],
      [";", "#333"],
    ],
  },
  {
    name: "gantt task tags and separators",
    code: "gantt\nTask: done, active, crit, milestone, vert, taskId, 2026-11-01, 1d",
    pairs: [
      ["done", ":"],
      ["active", ":"],
      ["crit", ":"],
      ["milestone", ":"],
      ["vert", ":"],
      ["done", ","],
      ["active", ","],
      ["crit", ","],
      ["milestone", ","],
      ["vert", ","],
    ],
  },
  {
    name: "class annotation name and delimiters",
    code: "classDiagram\nclass A {\n  <<interface>>\n}",
    pairs: [
      ["interface", "<<"],
      ["interface", ">>"],
    ],
  },
  {
    name: "usecase stereotype name and delimiters",
    code: "usecase-beta\nactor A <<Person>>",
    pairs: [
      ["Person", "<<"],
      ["Person", ">>"],
    ],
  },
  {
    name: "state terminal and id",
    code: "stateDiagram-v2\n[*] --> Rest",
    pairs: [["[*]", "Rest"]],
  },
  {
    name: "journey positional score, people and ignored data",
    code: "journey\nTask: abc: Pat, Sam: ignored\nOther: 5, 6: Lee",
    pairs: [
      ["abc", "Pat"],
      ["5, 6", "Lee"],
      [",", "Pat"],
      ["ignored", "Pat"],
    ],
  },
  {
    name: "mindmap icon marker and brackets",
    code: "mindmap\n  Root\n  ::icon(book)",
    pairs: [
      ["::icon", "book"],
      ["(", "book"],
      [")", "book"],
    ],
  },
  {
    name: "kanban icon marker and brackets",
    code: "kanban\n  Column\n  ::icon(book)",
    pairs: [
      ["::icon", "book"],
      ["(", "book"],
      [")", "book"],
    ],
  },
  {
    name: "description delimiters",
    code: "info\naccDescr {Detail}",
    pairs: [
      ["{", "Detail"],
      ["}", "Detail"],
    ],
  },
  {
    name: "style separators",
    code: "flowchart\nstyle A fill:red,stroke:blue",
    pairs: [
      [":", "fill"],
      [",", "red"],
    ],
  },
  {
    name: "callback brackets",
    code: "flowchart\nclick A call handler(x)",
    pairs: [
      ["(", "handler"],
      [")", "handler"],
    ],
  },
  {
    name: "data brackets",
    code: 'flowchart\nA@{label: "kept"}',
    pairs: [
      ["@{", "label"],
      ["}", "kept"],
    ],
  },
  {
    name: "directive marks inside a string",
    code: 'flowchart\nA["left%%{init: dark}%%right"]',
    pairs: [
      ["%%{", "left"],
      [":", "left"],
      ["}%%", "right"],
    ],
  },
  {
    name: "directive marks inside a plain label",
    code: "flowchart\nA[left%%{init: dark}%%right]",
    pairs: [
      ["%%{", "left"],
      [":", "left"],
      ["}%%", "right"],
    ],
  },
  {
    name: "directive marks inside ignored text",
    code: "info\n%%{%%{wrap}%%wrap}%%",
    pairs: [["%%{wrap", "%%{%%"]],
  },
] as const

/** The foreground at the first character of a fixed unit's written text. */
function foregroundOf(
  code: string,
  text: string,
  theme: (typeof themes)[number],
): string {
  const offset = code.indexOf(text)
  if (offset < 0) throw new Error(`no text ${JSON.stringify(text)}`)
  for (const line of highlighter.codeToTokensBase(code, {
    lang: "mermaid",
    theme,
  })) {
    for (const token of line) {
      if (
        token.offset <= offset &&
        offset < token.offset + token.content.length
      ) {
        return (token.color ?? highlighter.getTheme(theme).fg).toLowerCase()
      }
    }
  }
  throw new Error(`no foreground for ${JSON.stringify(text)}`)
}

describe("foreground colors", () => {
  it.each(colorContrasts)(
    "distinguishes $name in both themes",
    ({ code, pairs }) => {
      checkForeground(code)
      for (const theme of themes) {
        for (const [left, right] of pairs) {
          expect(
            foregroundOf(code, left, theme),
            `${theme}: ${left} / ${right}`,
          ).not.toBe(foregroundOf(code, right, theme))
        }
      }
    },
  )
})

/**
 * The header inputs: the fixtures of the minimal input of each entry of
 * detection.md#the-detectors (every entry but entry 2 has one), and for each
 * further header spelling that the document of a diagram type accepts, the
 * fixture that its sentence cites (or, for `graph`, an accepted fixture that
 * starts with it).
 */
const headerFixtures: readonly (readonly [DiagramType, string])[] = [
  ["common", "detect-minimal-agentflow"],
  ["common", "detect-minimal-architecture"],
  ["common", "detect-minimal-block"],
  ["common", "detect-minimal-c4"],
  ["common", "detect-minimal-c4-component"],
  ["common", "detect-minimal-c4-container"],
  ["common", "detect-minimal-c4-deployment"],
  ["common", "detect-minimal-c4-dynamic"],
  ["common", "detect-minimal-class-diagram"],
  ["common", "detect-minimal-cynefin"],
  ["common", "detect-minimal-er"],
  ["common", "detect-minimal-eventmodeling"],
  ["common", "detect-minimal-flowchart-elk"],
  ["common", "detect-minimal-flowchart-v2"],
  ["common", "detect-minimal-gantt"],
  ["common", "detect-minimal-git-graph"],
  ["common", "detect-minimal-info"],
  ["common", "detect-minimal-ishikawa"],
  ["common", "detect-minimal-journey"],
  ["common", "detect-minimal-kanban"],
  ["common", "detect-minimal-mindmap"],
  ["common", "detect-minimal-packet"],
  ["common", "detect-minimal-pie"],
  ["common", "detect-minimal-quadrant-chart"],
  ["common", "detect-minimal-radar"],
  ["common", "detect-minimal-railroad"],
  ["common", "detect-minimal-railroad-abnf"],
  ["common", "detect-minimal-railroad-ebnf"],
  ["common", "detect-minimal-railroad-peg"],
  ["common", "detect-minimal-requirement"],
  ["common", "detect-minimal-sankey"],
  ["common", "detect-minimal-sequence"],
  ["common", "detect-minimal-state-diagram"],
  ["common", "detect-minimal-swimlane"],
  ["common", "detect-minimal-timeline"],
  ["common", "detect-minimal-tree-view"],
  ["common", "detect-minimal-treemap"],
  ["common", "detect-minimal-usecase"],
  ["common", "detect-minimal-venn"],
  ["common", "detect-minimal-wardley"],
  ["common", "detect-minimal-xychart"],
  ["common", "detect-cynefin-colon"],
  ["sankey", "db-header-beta"],
  ["packet", "spec-packet-c4580507"],
  ["treemap", "header-beta"],
  ["ishikawa", "header-beta-mixed-case"],
  ["block", "header-block-beta"],
  ["xychart", "db-header-beta-only"],
  ["state", "header-v2"],
  ["class", "header-v2"],
  ["radar", "header-colon-inline"],
  ["flowchart", "demo-flowchart-06b5149f"],
]

describe("the headers of every diagram type", () => {
  it.each(headerFixtures)(
    "colors the header of %s/%s",
    async (diagram, name) => {
      const { input } = await loadFixture(diagram, name)
      const [first] = tokenLines(input)
      const header = first?.find((token) => token.content.trim() !== "")
      expect(header?.scopes).toContain("keyword.control.mermaid")
    },
  )
})

describe("the leading trivia", () => {
  it("colors a comment line, a directive and the frontmatter before any header", async () => {
    const code =
      '---\ntitle: Hello\n---\n%% a comment line\n%%{init: {"theme": "dark"}}%%\ntimeline\n  title T\n'
    expect(scopesOf(code, "---")).toContain(
      "keyword.operator.delimiter.frontmatter.begin.mermaid",
    )
    expect(scopesOnLine(code, 1)).toContain("meta.embedded.block.yaml")
    expect(scopesOf(code, "%% a comment line")).toContain(
      "comment.line.percentage.mermaid",
    )
    expect(scopesOf(code, "init")).toContain(
      "entity.name.function.directive.mermaid",
    )
    expect(scopesOf(code, "timeline")).toContain("keyword.control.mermaid")
    await expect(tokens(code)).toMatchFileSnapshot(
      fixture("leading-trivia.tokens"),
    )
  })

  it("does not read a header in the body of a diagram", () => {
    // kanban.md#the-statement-context: `kanbanX`, `kanban2`, `kanban_`, and
    // `a.kanban` are node text; a header spelling of another type is node text
    // as well.
    const code = "kanban\n  timeline\n  info\n"
    expect(scopesOnLine(code, 1)).not.toContain("keyword.control.mermaid")
    expect(scopesOnLine(code, 2)).not.toContain("keyword.control.mermaid")
  })
})

/** Fixed inputs distinguish the boundary cases of the cited lexical sentences. */
const boundaries: (ScopeExpectations & { name: string; code: string })[] = [
  {
    name: "an unclosed class style parenthesis stops at its line",
    code: "classDiagram\nstyle A fill:(a\nclass B\n",
    scopes: [
      ["class", "keyword.control.mermaid", 2],
      ["B", "variable.mermaid", 2],
    ],
    absentOnLine: [[2, "support.constant.property-value.mermaid"]],
  },
  {
    name: "an unclosed state style parenthesis stops at its line",
    code: "stateDiagram-v2\nclassDef x fill:(a\nA --> B\n",
    scopes: [
      ["A", "variable.mermaid", 2],
      ["-->", "keyword.operator.arrow.mermaid", 2],
      ["B", "variable.mermaid", 2],
    ],
    absentOnLine: [[2, "support.constant.property-value.mermaid"]],
  },
  {
    name: "an unclosed block style parenthesis stops at its line",
    code: "block\nclassDef x fill:(a\nA\n",
    scopes: [["A", "variable.mermaid", 2]],
    absentOnLine: [[2, "support.constant.property-value.mermaid"]],
  },
  {
    name: "an unclosed gantt style parenthesis stops at its line",
    code: "gantt\ntodayMarker stroke:(a\nsection S\n",
    scopes: [
      ["section", "keyword.control.mermaid", 2],
      ["S", "string.unquoted.mermaid", 2],
    ],
    absentOnLine: [[2, "support.constant.property-value.mermaid"]],
  },
  {
    name: "flowchart styles keep a final semicolon separate from properties",
    code: "flowchart TD\nstyle A fill:#f96,stroke:#333;\nclassDef warning fill:#f96,stroke:#333;",
    scopes: [
      ["fill", "support.type.property-name.mermaid", 1],
      [":", "keyword.operator.separator.key-value.mermaid", 1],
      ["#f96", "support.constant.property-value.mermaid", 1],
      [",", "keyword.operator.separator.comma.mermaid", 1],
      ["stroke", "support.type.property-name.mermaid", 1],
      ["#333", "support.constant.property-value.mermaid", 1],
      [";", "keyword.operator.separator.statement.mermaid", 1],
      ["fill", "support.type.property-name.mermaid", 2],
      [":", "keyword.operator.separator.key-value.mermaid", 2],
      ["#f96", "support.constant.property-value.mermaid", 2],
      [",", "keyword.operator.separator.comma.mermaid", 2],
      ["stroke", "support.type.property-name.mermaid", 2],
      ["#333", "support.constant.property-value.mermaid", 2],
      [";", "keyword.operator.separator.statement.mermaid", 2],
    ],
    absent: [
      [";", "support.constant.property-value.mermaid", 1],
      [";", "support.constant.property-value.mermaid", 2],
    ],
  },
  {
    name: "agentflow styles keep a final semicolon separate from properties",
    code: "agentflow-beta\nstyle A fill:#f96,stroke:#333;\nclassDef warning fill:#f96,stroke:#333;",
    scopes: [
      ["fill", "support.type.property-name.mermaid", 1],
      [":", "keyword.operator.separator.key-value.mermaid", 1],
      ["#f96", "support.constant.property-value.mermaid", 1],
      [",", "keyword.operator.separator.comma.mermaid", 1],
      ["stroke", "support.type.property-name.mermaid", 1],
      ["#333", "support.constant.property-value.mermaid", 1],
      [";", "keyword.operator.separator.statement.mermaid", 1],
      ["fill", "support.type.property-name.mermaid", 2],
      [":", "keyword.operator.separator.key-value.mermaid", 2],
      ["#f96", "support.constant.property-value.mermaid", 2],
      [",", "keyword.operator.separator.comma.mermaid", 2],
      ["stroke", "support.type.property-name.mermaid", 2],
      ["#333", "support.constant.property-value.mermaid", 2],
      [";", "keyword.operator.separator.statement.mermaid", 2],
    ],
    absent: [
      [";", "support.constant.property-value.mermaid", 1],
      [";", "support.constant.property-value.mermaid", 2],
    ],
  },
  {
    name: "state styles keep a final semicolon separate from properties",
    code: "stateDiagram-v2\nclassDef warning fill:#f96,stroke:#333;\nstyle A fill:#f96,stroke:#333;",
    scopes: [
      ["fill", "support.type.property-name.mermaid", 1],
      [":", "keyword.operator.separator.key-value.mermaid", 1],
      ["#f96", "support.constant.property-value.mermaid", 1],
      [",", "keyword.operator.separator.comma.mermaid", 1],
      ["stroke", "support.type.property-name.mermaid", 1],
      ["#333", "support.constant.property-value.mermaid", 1],
      [";", "keyword.operator.separator.semicolon.mermaid", 1],
      ["fill", "support.type.property-name.mermaid", 2],
      [":", "keyword.operator.separator.key-value.mermaid", 2],
      ["#f96", "support.constant.property-value.mermaid", 2],
      [",", "keyword.operator.separator.comma.mermaid", 2],
      ["stroke", "support.type.property-name.mermaid", 2],
      ["#333", "support.constant.property-value.mermaid", 2],
      [";", "keyword.operator.separator.semicolon.mermaid", 2],
    ],
    absent: [
      [";", "support.constant.property-value.mermaid", 1],
      [";", "support.constant.property-value.mermaid", 2],
    ],
  },
  {
    name: "block styles keep a final semicolon separate from properties",
    code: "block-beta\nA\nclassDef warning fill:#f96,stroke:#333;\nstyle A fill:#f96,stroke:#333;",
    scopes: [
      ["fill", "support.type.property-name.mermaid", 2],
      [":", "keyword.operator.separator.key-value.mermaid", 2],
      ["#f96", "support.constant.property-value.mermaid", 2],
      [",", "keyword.operator.separator.comma.mermaid", 2],
      ["stroke", "support.type.property-name.mermaid", 2],
      ["#333", "support.constant.property-value.mermaid", 2],
      [";", "keyword.operator.separator.semicolon.mermaid", 2],
      ["fill", "support.type.property-name.mermaid", 3],
      [":", "keyword.operator.separator.key-value.mermaid", 3],
      ["#f96", "support.constant.property-value.mermaid", 3],
      [",", "keyword.operator.separator.comma.mermaid", 3],
      ["stroke", "support.type.property-name.mermaid", 3],
      ["#333", "support.constant.property-value.mermaid", 3],
      [";", "keyword.operator.separator.semicolon.mermaid", 3],
    ],
    absent: [
      [";", "support.constant.property-value.mermaid", 2],
      [";", "support.constant.property-value.mermaid", 3],
    ],
  },
  {
    name: "requirement styles keep a final semicolon separate from properties",
    code: "requirementDiagram\nclassDef warning fill:#f96,stroke:#333;\nstyle A fill:#f96,stroke:#333;",
    scopes: [
      ["fill", "support.type.property-name.mermaid", 1],
      [":", "keyword.operator.separator.key-value.mermaid", 1],
      ["#f96", "support.constant.property-value.mermaid", 1],
      [",", "keyword.operator.separator.comma.mermaid", 1],
      ["stroke", "support.type.property-name.mermaid", 1],
      ["#333", "support.constant.property-value.mermaid", 1],
      [";", "keyword.operator.separator.semicolon.mermaid", 1],
      ["fill", "support.type.property-name.mermaid", 2],
      [":", "keyword.operator.separator.key-value.mermaid", 2],
      ["#f96", "support.constant.property-value.mermaid", 2],
      [",", "keyword.operator.separator.comma.mermaid", 2],
      ["stroke", "support.type.property-name.mermaid", 2],
      ["#333", "support.constant.property-value.mermaid", 2],
      [";", "keyword.operator.separator.semicolon.mermaid", 2],
    ],
    absent: [
      [";", "support.constant.property-value.mermaid", 1],
      [";", "support.constant.property-value.mermaid", 2],
    ],
  },
  {
    name: "usecase styles keep a final semicolon separate from properties",
    code: "usecase-beta\nactor A\nclassDef warning fill:#f96,stroke:#333;\nstyle A fill:#f96,stroke:#333;",
    scopes: [
      ["fill", "support.type.property-name.mermaid", 2],
      [":", "keyword.operator.separator.key-value.mermaid", 2],
      ["#f96", "support.constant.property-value.mermaid", 2],
      [",", "keyword.operator.separator.comma.mermaid", 2],
      ["stroke", "support.type.property-name.mermaid", 2],
      ["#333", "support.constant.property-value.mermaid", 2],
      [";", "keyword.operator.separator.semicolon.mermaid", 2],
      ["fill", "support.type.property-name.mermaid", 3],
      [":", "keyword.operator.separator.key-value.mermaid", 3],
      ["#f96", "support.constant.property-value.mermaid", 3],
      [",", "keyword.operator.separator.comma.mermaid", 3],
      ["stroke", "support.type.property-name.mermaid", 3],
      ["#333", "support.constant.property-value.mermaid", 3],
      [";", "keyword.operator.separator.semicolon.mermaid", 3],
    ],
    absent: [
      [";", "support.constant.property-value.mermaid", 2],
      [";", "support.constant.property-value.mermaid", 3],
    ],
  },
  {
    name: "venn styles keep a final semicolon separate from properties",
    code: "venn-beta\nset A\nstyle A fill:#f96,stroke:#333;",
    scopes: [
      ["fill", "support.type.property-name.mermaid", 2],
      [":", "keyword.operator.separator.key-value.mermaid", 2],
      ["#f96", "support.constant.property-value.mermaid", 2],
      [",", "keyword.operator.separator.comma.mermaid", 2],
      ["stroke", "support.type.property-name.mermaid", 2],
      ["#333", "support.constant.property-value.mermaid", 2],
      [";", "keyword.operator.separator.semicolon.mermaid", 2],
    ],
    absent: [[";", "support.constant.property-value.mermaid", 2]],
  },
  {
    name: "a method classifier precedes or follows its return type only once",
    code: "classDiagram\nclass Classifiers {\n  +prefix()* int$\n  +suffix() int$\n}",
    scopes: [
      ["*", "storage.modifier.mermaid", 2],
      ["int$", "entity.name.type.mermaid", 2],
      ["int", "entity.name.type.mermaid", 3],
      ["$", "storage.modifier.mermaid", 3],
    ],
    absent: [["int$", "storage.modifier.mermaid", 2]],
  },
  {
    name: "info flag title",
    code: "info showInfo title x",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["x", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "info flag directive",
    code: "info showInfo%%{wrap}%% title x",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["x", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "info flag comment",
    code: "info showInfo title %% c",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["%% c", "comment.line.percentage.mermaid"],
    ],
  },
  {
    name: "info flag empty title",
    code: "info showInfo title",
    scopes: [["title", "keyword.control.mermaid"]],
  },
  {
    name: "info flag semicolon text",
    code: "info showInfo title x;",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["x;", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "info flag blank line",
    code: "info showInfo title\n\naccDescr {}",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["accDescr", "keyword.control.mermaid"],
    ],
  },
  {
    name: "info flag LS comment",
    code: "info showInfo title x\u2028%% c\n",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["%% c", "comment.line.percentage.mermaid"],
    ],
  },
  {
    name: "info flag accessibility title",
    code: "info showInfo accTitle: A",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      [" A", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "info flag accessibility description",
    code: "info showInfo accDescr { D }",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      [" D ", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "cynefin domain title",
    code: "cynefin-beta\ncomplextitle x",
    scopes: [
      ["complex", "constant.language.mermaid"],
      ["title", "keyword.control.mermaid"],
      ["x", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "cynefin domain directive title",
    code: "cynefin-beta\ncomplex%%{wrap}%%title x",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["x", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "cynefin domain comment title",
    code: "cynefin-beta\ncomplextitle %% c",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["%% c", "comment.line.percentage.mermaid"],
    ],
  },
  {
    name: "cynefin domain empty title",
    code: "cynefin-beta\ncomplextitle",
    scopes: [["title", "keyword.control.mermaid"]],
  },
  {
    name: "cynefin domain semicolon text",
    code: "cynefin-beta\ncomplextitle x;",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["x;", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "cynefin domain blank line",
    code: "cynefin-beta\ncomplextitle\n\nclear",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["clear", "constant.language.mermaid"],
    ],
  },
  {
    name: "cynefin domain LS comment",
    code: "cynefin-beta\ncomplextitle x\u2028%% c\n",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["%% c", "comment.line.percentage.mermaid"],
    ],
  },
  {
    name: "cynefin string title",
    code: 'cynefin-beta\ncomplex "a"title x',
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["x", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "cynefin string accessibility title",
    code: 'cynefin-beta\ncomplex "a"accTitle: A',
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      [" A", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "cynefin string accessibility description",
    code: 'cynefin-beta\ncomplex "a"accDescr { D }',
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      [" D ", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "gantt weekday title",
    code: "gantt\nweekday monday title x",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["x", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "gantt weekday directive",
    code: "gantt\nweekday monday %%{wrap}%%title x",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["x", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "gantt weekday comment text",
    code: "gantt\nweekday monday title %% c",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["%% c", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "gantt weekday semicolon text",
    code: "gantt\nweekday monday title x;",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["x;", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "gantt weekday blank line",
    code: "gantt\nweekday monday title x\n\n",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["x", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "gantt weekday LS comment",
    code: "gantt\nweekday monday title x\u2028%% c\n",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["%% c", "comment.line.percentage.mermaid"],
    ],
  },
  {
    name: "gantt weekend title",
    code: "gantt\nweekend friday title x",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["x", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "gantt flag title",
    code: "gantt\ninclusiveEndDates title x",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["x", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "gantt flag directive",
    code: "gantt\ninclusiveEndDates%%{wrap}%% title x",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["x", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "gantt flag comment text",
    code: "gantt\ninclusiveEndDates title %% c",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["%% c", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "gantt flag semicolon text",
    code: "gantt\ninclusiveEndDates title x;",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["x;", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "gantt flag blank line",
    code: "gantt\ninclusiveEndDates title x\n\n",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["x", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "gantt flag LS comment",
    code: "gantt\ninclusiveEndDates title x\u2028%% c\n",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["%% c", "comment.line.percentage.mermaid"],
    ],
  },
  {
    name: "gantt callback title",
    code: "gantt\nTask: id,2026-11-01,1d\nclick id call f() title x",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["x", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "gantt callback directive",
    code: "gantt\nTask: id,2026-11-01,1d\nclick id call f()%%{wrap}%% title x",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["x", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "gantt callback comment text",
    code: "gantt\nTask: id,2026-11-01,1d\nclick id call f() title %% c",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["%% c", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "gantt callback semicolon text",
    code: "gantt\nTask: id,2026-11-01,1d\nclick id call f() title x;",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["x;", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "gantt callback blank line",
    code: "gantt\nTask: id,2026-11-01,1d\nclick id call f() title x\n\n",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["x", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "gantt callback LS comment",
    code: "gantt\nTask: id,2026-11-01,1d\nclick id call f() title x\u2028%% c\n",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["%% c", "comment.line.percentage.mermaid"],
    ],
  },
  {
    name: "gantt href accessibility block",
    code: 'gantt\nTask: id,2026-11-01,1d\nclick id href "u" accDescr {}',
    scopes: [
      ["accDescr", "keyword.control.mermaid", 2],
      ["{", "keyword.operator.delimiter.description.begin.mermaid", 2],
    ],
  },
  {
    name: "gantt literal semicolon stays in task text",
    code: "gantt\ntitle; T: 1d",
    scopes: [["title; T", "string.unquoted.mermaid"]],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "gantt directive text supplies no style trigger",
    code: "gantt\n%%{init: {style:#x}}%%title; T: 1d",
    scopes: [["title; T", "string.unquoted.mermaid"]],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "journey block title",
    code: "journey\naccDescr {}title x",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["x", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "journey block comment title",
    code: "journey\naccDescr {}title %% c",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["%% c", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "journey block blank line",
    code: "journey\naccDescr {}title x\n\n",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["x", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "journey block LS comment",
    code: "journey\naccDescr {}title x\u2028%% c\n",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["%% c", "comment.line.percentage.mermaid"],
    ],
  },
  {
    name: "eventmodeling padded title after entity",
    code: "eventmodeling\ntf 00 evt A title x",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["x", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "eventmodeling padded title directive",
    code: "eventmodeling\ntf 00 evt A %%{wrap}%%title x",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["x", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "eventmodeling padded comment title",
    code: "eventmodeling\ntf 00 evt A title %% c",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["%% c", "comment.line.percentage.mermaid"],
    ],
  },
  {
    name: "eventmodeling padded empty title",
    code: "eventmodeling\ntf 00 evt A title",
    scopes: [["title", "keyword.control.mermaid"]],
  },
  {
    name: "eventmodeling padded semicolon text",
    code: "eventmodeling\ntf 00 evt A title x;",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["x;", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "eventmodeling padded blank line",
    code: "eventmodeling\ntf 00 evt A title x\n\n",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["x", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "eventmodeling padded LS comment",
    code: "eventmodeling\ntf 00 evt A title x\u2028%% c\n",
    scopes: [["title", "keyword.control.mermaid"]],
  },
  {
    name: "eventmodeling padded accessibility title",
    code: "eventmodeling\ntf 00 evt A accTitle: A",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      [" A", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "eventmodeling padded accessibility description",
    code: "eventmodeling\ntf 00 evt A accDescr { D }",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      [" D ", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "radar metadata after an axis",
    code: "radar-beta\naxis A title x",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["x", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "treemap metadata after a row",
    code: 'treemap\n"A":1 title x',
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["x", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "radar axis directive title",
    code: "radar-beta\naxis A %%{wrap}%%title x",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["x", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "radar axis comment title",
    code: "radar-beta\naxis A title %% c",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["%% c", "comment.line.percentage.mermaid"],
    ],
  },
  {
    name: "radar axis empty title",
    code: "radar-beta\naxis A title",
    scopes: [["title", "keyword.control.mermaid"]],
  },
  {
    name: "radar axis semicolon title",
    code: "radar-beta\naxis A title x;",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["x;", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "radar axis blank line title",
    code: "radar-beta\naxis A title\n\n",
    scopes: [["title", "keyword.control.mermaid"]],
  },
  {
    name: "radar axis LS title",
    code: "radar-beta\naxis A title x\u2028%% c\n",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["%% c", "comment.line.percentage.mermaid"],
    ],
  },
  {
    name: "treemap row directive title",
    code: 'treemap\n"A":1%%{wrap}%% title x',
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["x", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "treemap row comment title",
    code: 'treemap\n"A":1 title %% c',
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["%% c", "comment.line.percentage.mermaid"],
    ],
  },
  {
    name: "treemap row empty title",
    code: 'treemap\n"A":1 title',
    scopes: [["title", "keyword.control.mermaid"]],
  },
  {
    name: "treemap row semicolon title",
    code: 'treemap\n"A":1 title x;',
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["x;", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "treemap row blank line title",
    code: 'treemap\n"A":1 title\n\n',
    scopes: [["title", "keyword.control.mermaid"]],
  },
  {
    name: "treemap row LS title",
    code: 'treemap\n"A":1 title x\u2028%% c\n',
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["%% c", "comment.line.percentage.mermaid"],
    ],
  },
  {
    name: "timeline next-line section can be a title value",
    code: "timeline\n  Title\n  Section\n  a\n",
    scopes: [["Title", "string.unquoted.mermaid", 1]],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "timeline next-line text decides a title",
    code: "timeline\n  title\nT\n",
    scopes: [["title", "string.unquoted.mermaid", 1]],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "timeline next-line bare percent can be title text",
    code: "timeline\n  title\n%%\n",
    scopes: [["title", "string.unquoted.mermaid", 1]],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "timeline title decision crosses a comment",
    code: "timeline\n  title\n  %% c\n  T\n",
    scopes: [["title", "string.unquoted.mermaid", 1]],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "timeline title decision crosses two comments",
    code: "timeline\n  title\n  %% c\n  %% d\n  T\n",
    scopes: [["title", "string.unquoted.mermaid", 1]],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "timeline next-line indented directive supplies title text",
    code: "timeline\n  title\n  %%{init: {}}%%\n  T\n",
    scopes: [["title", "string.unquoted.mermaid", 1]],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "timeline next-line hash can be title text",
    code: "timeline\n  title\n  # c\n  T\n",
    scopes: [["title", "string.unquoted.mermaid", 1]],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "timeline blank next line leaves title as a period",
    code: "timeline\n  title\n\nT\n",
    scopes: [["title", "string.unquoted.mermaid", 1]],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "timeline unindented directive leaves title as a period",
    code: "timeline\n  title\n%%{init: {}}%%\nT\n",
    scopes: [["title", "string.unquoted.mermaid", 1]],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "journey scores and people use position rather than spelling",
    code: "journey\nTask: abc: Pat, Sam: ignored\nOther: 5, 6: Lee\nTask: #score;: Person#person;Name: ignored",
    scopes: [
      [" abc", "constant.numeric.mermaid", 1],
      [" Pat", "variable.mermaid", 1],
      [" Sam", "variable.mermaid", 1],
      [",", "keyword.operator.separator.comma.mermaid", 1],
      [" ignored", "comment.block.ignored.mermaid", 1],
      [" 5, 6", "constant.numeric.mermaid", 2],
      [" Lee", "variable.mermaid", 2],
      ["#score;", "constant.numeric.mermaid", 3],
      [" Person", "variable.mermaid", 3],
      ["#person;", "variable.mermaid", 3],
      ["Name", "variable.mermaid", 3],
    ],
  },
  {
    name: "journey data after a removed comment line",
    code: "journey\nTask text\u2029%% comment\n: 5: Person",
    scopes: [
      [":", "keyword.operator.separator.colon.mermaid", 2],
      [" 5", "constant.numeric.mermaid", 2],
      [" Person", "variable.mermaid", 2],
    ],
  },
  {
    name: "ER block closes after a multiline backquoted attribute type",
    code: "erDiagram\nA { `x\n y` field }\naccDescr { z }",
    scopes: [
      ["}", "keyword.operator.block.end.mermaid", 2],
      ["accDescr", "keyword.control.mermaid", 3],
      ["{", "keyword.operator.delimiter.description.begin.mermaid", 3],
      ["z ", "string.unquoted.mermaid", 3],
    ],
  },
  {
    name: "a line-final gantt setting after a directive",
    code: "gantt\n%%{x}%%dateFormat\nYYYY-MM-DD",
    scopes: [
      ["dateFormat", "keyword.control.mermaid", 1],
      ["x", "meta.directive.mermaid", 1],
    ],
  },
  {
    name: "a gantt setting with trailing padding",
    code: "gantt\ndateFormat \t\nTask :2026-11-01, 1d",
    scopes: [["dateFormat", "keyword.control.mermaid", 1]],
  },
  {
    name: "a venn title with trailing padding",
    code: "venn-beta\ntitle \t\nset A",
    scopes: [["title", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final venn title after a directive",
    code: "venn-beta\n%%{x}%%title\nT",
    scopes: [
      ["title", "keyword.control.mermaid", 1],
      ["x", "meta.directive.mermaid", 1],
    ],
  },
  {
    name: "a c4 title with trailing padding",
    code: 'C4Context\ntitle \t\nPerson(A,"A")',
    scopes: [["title", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final c4 title after a directive",
    code: "C4Context\n%%{x}%%title\nT",
    scopes: [
      ["title", "keyword.control.mermaid", 1],
      ["x", "meta.directive.mermaid", 1],
    ],
  },
  {
    name: "a shared bare title prefixes railroad",
    code: 'railroad-beta\ntitlex = terminal("a");',
    scopes: [
      ["title", "keyword.control.mermaid", 1],
      ["x", "variable.mermaid", 1],
    ],
  },
  {
    name: "a shared bare title prefixes treemap",
    code: 'treemap\ntitle"A":1',
    scopes: [
      ["title", "keyword.control.mermaid", 1],
      ["A", "string.quoted.double.mermaid", 1],
      ["1", "constant.numeric.mermaid", 1],
    ],
  },
  {
    name: "a shared bare title prefixes treeview",
    code: 'treeView-beta\ntitle"node"',
    scopes: [
      ["title", "keyword.control.mermaid", 1],
      ["node", "string.quoted.double.mermaid", 1],
    ],
  },
  {
    name: "an empty style property name in flowchart",
    code: "flowchart TD\nstyle A :red\nclassDef c :blue\nlinkStyle default :green",
    scopes: [
      [":", "keyword.operator.separator.key-value.mermaid", 1],
      ["red", "support.constant.property-value.mermaid", 1],
      [":", "keyword.operator.separator.key-value.mermaid", 2],
      ["blue", "support.constant.property-value.mermaid", 2],
      [":", "keyword.operator.separator.key-value.mermaid", 3],
      ["green", "support.constant.property-value.mermaid", 3],
    ],
  },
  {
    name: "an empty style property name in agentflow",
    code: "agentflow-beta\nstyle A :red\nclassDef c :blue\nlinkStyle default :green",
    scopes: [
      [":", "keyword.operator.separator.key-value.mermaid", 1],
      ["red", "support.constant.property-value.mermaid", 1],
      [":", "keyword.operator.separator.key-value.mermaid", 2],
      ["blue", "support.constant.property-value.mermaid", 2],
      [":", "keyword.operator.separator.key-value.mermaid", 3],
      ["green", "support.constant.property-value.mermaid", 3],
    ],
  },
  {
    name: "an empty style property name in block",
    code: "block-beta\nA\nstyle A :red\nclassDef c :blue",
    scopes: [
      [":", "keyword.operator.separator.key-value.mermaid", 2],
      ["red", "support.constant.property-value.mermaid", 2],
      [":", "keyword.operator.separator.key-value.mermaid", 3],
      ["blue", "support.constant.property-value.mermaid", 3],
    ],
  },
  {
    name: "an empty style property name in treemap",
    code: "treemap\nclassDef aa :red",
    scopes: [[":red", "string.unquoted.mermaid", 1]],
  },
  {
    name: "an empty style property name in class",
    code: "classDiagram\nstyle A :red,fill:blue",
    scopes: [
      [":", "keyword.operator.separator.key-value.mermaid", 1],
      ["red", "support.constant.property-value.mermaid", 1],
      [",", "keyword.operator.separator.comma.mermaid", 1],
      ["fill", "support.type.property-name.mermaid", 1],
      ["blue", "support.constant.property-value.mermaid", 1],
    ],
  },
  {
    name: "an empty style property name in state",
    code: "stateDiagram-v2\nstyle A :red",
    scopes: [
      [":", "keyword.operator.separator.key-value.mermaid", 1],
      ["red", "support.constant.property-value.mermaid", 1],
    ],
  },
  {
    name: "an empty style property name in er",
    code: "erDiagram\nstyle A :red",
    scopes: [
      [":", "keyword.operator.separator.key-value.mermaid", 1],
      ["red", "support.constant.property-value.mermaid", 1],
    ],
  },
  {
    name: "an empty style property name in requirement",
    code: "requirementDiagram\nstyle A :red",
    scopes: [
      [":", "keyword.operator.separator.key-value.mermaid", 1],
      ["red", "support.constant.property-value.mermaid", 1],
    ],
  },
  {
    name: "a line-final sequence title retains its keyword",
    code: "sequenceDiagram\ntitle\nA->>B: x",
    scopes: [["title", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final sequence accTitle retains its keyword",
    code: "sequenceDiagram\naccTitle\n: T",
    scopes: [["accTitle", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final sequence accDescr retains its keyword",
    code: "sequenceDiagram\naccDescr\n{ D }",
    scopes: [["accDescr", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final venn title retains its keyword",
    code: "venn-beta\ntitle\nT",
    scopes: [["title", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final gantt title retains its keyword",
    code: "gantt\ntitle\nT",
    scopes: [["title", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final gantt section retains its keyword",
    code: "gantt\nsection\nS",
    scopes: [["section", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final gantt dateFormat retains its keyword",
    code: "gantt\ndateFormat\nYYYY-MM-DD",
    scopes: [["dateFormat", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final gantt axisFormat retains its keyword",
    code: "gantt\naxisFormat\n%Y",
    scopes: [["axisFormat", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final gantt excludes retains its keyword",
    code: "gantt\nexcludes\nweekends",
    scopes: [["excludes", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final gantt includes retains its keyword",
    code: "gantt\nincludes\n2026-11-01",
    scopes: [["includes", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final gantt tickInterval retains its keyword",
    code: "gantt\ntickInterval\n1day",
    scopes: [["tickInterval", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final gantt todayMarker retains its keyword",
    code: "gantt\ntodayMarker\nstroke:red",
    scopes: [["todayMarker", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final gantt accTitle retains its keyword",
    code: "gantt\naccTitle\n: T",
    scopes: [["accTitle", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final gantt accDescr retains its keyword",
    code: "gantt\naccDescr\n{ D }",
    scopes: [["accDescr", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final journey title retains its keyword",
    code: "journey\ntitle\nT",
    scopes: [["title", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final journey section retains its keyword",
    code: "journey\nsection\nS\nTask: 5",
    scopes: [["section", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final journey accTitle retains its keyword",
    code: "journey\naccTitle\n: T",
    scopes: [["accTitle", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final journey accDescr retains its keyword",
    code: "journey\naccDescr\n{ D }",
    scopes: [["accDescr", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final c4 title retains its keyword",
    code: "C4Context\ntitle\nT",
    scopes: [["title", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final c4 accDescription retains its keyword",
    code: "C4Context\naccDescription\nD",
    scopes: [["accDescription", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final c4 accTitle retains its keyword",
    code: "C4Context\naccTitle\n: T",
    scopes: [["accTitle", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final c4 accDescr retains its keyword",
    code: "C4Context\naccDescr\n{ D }",
    scopes: [["accDescr", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final state class retains its keyword",
    code: "stateDiagram-v2\nclass\nA c",
    scopes: [["class", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final state classDef retains its keyword",
    code: "stateDiagram-v2\nclassDef\nc fill:red",
    scopes: [["classDef", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final state style retains its keyword",
    code: "stateDiagram-v2\nstyle\nA fill:red",
    scopes: [["style", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final state state retains its keyword",
    code: "stateDiagram-v2\nstate\nA",
    scopes: [["state", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final block class retains its keyword",
    code: "block-beta\nclass\nA c",
    scopes: [["class", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final block classDef retains its keyword",
    code: "block-beta\nclassDef\nc fill:red",
    scopes: [["classDef", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final block space retains its keyword",
    code: "block-beta\nspace\nA",
    scopes: [["space", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final flowchart click retains its keyword",
    code: "flowchart TD\nclick\nA cb",
    scopes: [["click", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final agentflow click retains its keyword",
    code: "agentflow-beta\nclick\nA cb",
    scopes: [["click", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final requirement accTitle retains its keyword",
    code: "requirementDiagram\naccTitle\n: T",
    scopes: [["accTitle", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final requirement accDescr retains its keyword",
    code: "requirementDiagram\naccDescr\n{ D }",
    scopes: [["accDescr", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final quadrant accTitle retains its keyword",
    code: "quadrantChart\naccTitle\n: T",
    scopes: [["accTitle", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final quadrant accDescr retains its keyword",
    code: "quadrantChart\naccDescr\n{ D }",
    scopes: [["accDescr", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final xychart title retains its keyword",
    code: "xychart-beta\ntitle \nT",
    scopes: [["title", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final xychart x-axis retains its keyword",
    code: "xychart-beta\nx-axis \n[A,B]",
    scopes: [["x-axis", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final xychart y-axis retains its keyword",
    code: "xychart-beta\ny-axis \n0 --> 10",
    scopes: [["y-axis", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final xychart line retains its keyword",
    code: "xychart-beta\nline \n[1,2]",
    scopes: [["line", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final xychart bar retains its keyword",
    code: "xychart-beta\nbar \n[1,2]",
    scopes: [["bar", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final info accDescr retains its keyword",
    code: "info\naccDescr\n{ A }",
    scopes: [["accDescr", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final pie accDescr retains its keyword",
    code: "pie\naccDescr\n{ A }",
    scopes: [["accDescr", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final packet accDescr retains its keyword",
    code: "packet-beta\naccDescr\n{ A }",
    scopes: [["accDescr", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final architecture accDescr retains its keyword",
    code: "architecture-beta\naccDescr\n{ A }",
    scopes: [["accDescr", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final radar accDescr retains its keyword",
    code: "radar-beta\naccDescr\n{ A }",
    scopes: [["accDescr", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final wardley accDescr retains its keyword",
    code: "wardley-beta\naccDescr\n{ A }",
    scopes: [["accDescr", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final cynefin accDescr retains its keyword",
    code: "cynefin-beta\naccDescr\n{ A }",
    scopes: [["accDescr", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final gitgraph accDescr retains its keyword",
    code: "gitGraph\naccDescr\n{ A }",
    scopes: [["accDescr", "keyword.control.mermaid", 1]],
  },
  {
    name: "a line-final keyword with sequence padded directives",
    code: "sequenceDiagram\n  %%{x}%%title%%{x}%% \t\nA->>B: x",
    scopes: [
      ["title", "keyword.control.mermaid", 1],
      ["x", "meta.directive.mermaid", 1],
    ],
  },
  {
    name: "a line-final keyword with journey padded directives",
    code: "journey\n%%{x}%%accTitle%%{x}%% \t\n: T",
    scopes: [
      ["accTitle", "keyword.control.mermaid", 1],
      ["x", "meta.directive.mermaid", 1],
    ],
  },
  {
    name: "a line-final keyword with block padded directives",
    code: "block-beta\n%%{x}%%classDef%%{x}%% \t\nc fill:red",
    scopes: [
      ["classDef", "keyword.control.mermaid", 1],
      ["x", "meta.directive.mermaid", 1],
    ],
  },
  {
    name: "a line-final keyword with state padded directives",
    code: "stateDiagram-v2\n%%{x}%%classDef%%{x}%% \t\nc fill:red",
    scopes: [
      ["classDef", "keyword.control.mermaid", 1],
      ["x", "meta.directive.mermaid", 1],
    ],
  },
  {
    name: "a line-final keyword with flowchart padded directives",
    code: "flowchart TD\n%%{x}%%click%%{x}%% \t\nA cb",
    scopes: [
      ["click", "keyword.control.mermaid", 1],
      ["x", "meta.directive.mermaid", 1],
    ],
  },
  {
    name: "a line-final keyword with agentflow padded directives",
    code: "agentflow-beta\n%%{x}%%click%%{x}%% \t\nA cb",
    scopes: [
      ["click", "keyword.control.mermaid", 1],
      ["x", "meta.directive.mermaid", 1],
    ],
  },
  {
    name: "a line-final keyword with requirement padded directives",
    code: "requirementDiagram\n%%{x}%%accTitle%%{x}%% \t\n: T",
    scopes: [
      ["accTitle", "keyword.control.mermaid", 1],
      ["x", "meta.directive.mermaid", 1],
    ],
  },
  {
    name: "a line-final keyword with quadrant padded directives",
    code: "quadrantChart\n%%{x}%%accDescr%%{x}%% \t\n{ D }",
    scopes: [
      ["accDescr", "keyword.control.mermaid", 1],
      ["x", "meta.directive.mermaid", 1],
    ],
  },
  {
    name: "a line-final keyword with info padded directives",
    code: "info\n%%{x}%%accDescr%%{x}%% \t\n{ D }",
    scopes: [
      ["accDescr", "keyword.control.mermaid", 1],
      ["x", "meta.directive.mermaid", 1],
    ],
  },
  {
    name: "a line-final keyword with xychart padded directives",
    code: "xychart-beta\n%%{x}%%title%%{x}%% \t\nT",
    scopes: [
      ["title", "keyword.control.mermaid", 1],
      ["x", "meta.directive.mermaid", 1],
    ],
  },
  {
    name: "a line-final word remains contextual: er direction name",
    code: "erDiagram\ndirection\nA",
    scopes: [],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word remains contextual: class direction name",
    code: "classDiagram\ndirection\nA",
    scopes: [],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word remains contextual: state direction name",
    code: "stateDiagram-v2\ndirection\nA",
    scopes: [],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word remains contextual: flowchart direction name",
    code: "flowchart TD\ndirection\nA",
    scopes: [],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word remains contextual: agentflow direction name",
    code: "agentflow-beta\ndirection\nA",
    scopes: [],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word remains contextual: block columns name",
    code: "block-beta\ncolumns\nA",
    scopes: [],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word remains contextual: treeview accTitle name",
    code: "treeView-beta\naccTitle\nA",
    scopes: [],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word remains contextual: treeview accDescr name",
    code: "treeView-beta\naccDescr\nA",
    scopes: [],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word remains contextual: flowchart title name",
    code: "flowchart TD\ntitle\nA",
    scopes: [],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word remains contextual: flowchart accTitle name",
    code: "flowchart TD\naccTitle\nA",
    scopes: [],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word remains contextual: flowchart accDescr name",
    code: "flowchart TD\naccDescr\nA",
    scopes: [],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word remains contextual: er title name",
    code: "erDiagram\ntitle\nA",
    scopes: [],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word remains contextual: er accTitle name",
    code: "erDiagram\naccTitle\nA",
    scopes: [],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word remains contextual: er accDescr name",
    code: "erDiagram\naccDescr\nA",
    scopes: [],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word remains contextual: class title name",
    code: "classDiagram\ntitle\nA",
    scopes: [],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word remains contextual: class accTitle name",
    code: "classDiagram\naccTitle\nA",
    scopes: [],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word remains contextual: class accDescr name",
    code: "classDiagram\naccDescr\nA",
    scopes: [],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word remains contextual: state title name",
    code: "stateDiagram-v2\ntitle\nA",
    scopes: [],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word remains contextual: state accTitle name",
    code: "stateDiagram-v2\naccTitle\nA",
    scopes: [],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word remains contextual: state accDescr name",
    code: "stateDiagram-v2\naccDescr\nA",
    scopes: [],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word remains contextual: kanban title text",
    code: "kanban\ntitle\nA",
    scopes: [],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word remains contextual: kanban accTitle text",
    code: "kanban\naccTitle\nA",
    scopes: [],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word remains contextual: kanban accDescr text",
    code: "kanban\naccDescr\nA",
    scopes: [],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word remains contextual: ishikawa title text",
    code: "ishikawa-beta\ntitle\nA",
    scopes: [],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word remains contextual: ishikawa accTitle text",
    code: "ishikawa-beta\naccTitle\nA",
    scopes: [],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word remains contextual: ishikawa accDescr text",
    code: "ishikawa-beta\naccDescr\nA",
    scopes: [],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word remains contextual: usecase title name",
    code: "usecase-beta\ntitle\nA",
    scopes: [],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word remains contextual: usecase accTitle name",
    code: "usecase-beta\naccTitle\nA",
    scopes: [],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word remains contextual: usecase accDescr name",
    code: "usecase-beta\naccDescr\nA",
    scopes: [],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word remains contextual: block title name",
    code: "block-beta\ntitle\nA",
    scopes: [],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word remains contextual: block accTitle name",
    code: "block-beta\naccTitle\nA",
    scopes: [],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word remains contextual: block accDescr name",
    code: "block-beta\naccDescr\nA",
    scopes: [],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word remains contextual: mindmap title text",
    code: "mindmap\ntitle\n  A",
    scopes: [],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word remains contextual: mindmap accTitle text",
    code: "mindmap\naccTitle\n  A",
    scopes: [],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word remains contextual: mindmap accDescr text",
    code: "mindmap\naccDescr\n  A",
    scopes: [],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word remains contextual: railroad accDescr name",
    code: 'railroad-beta\naccDescr\n=terminal("a");',
    scopes: [],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word remains contextual: eventmodeling accDescr name",
    code: "eventmodeling\nentity\n accDescr",
    scopes: [],
    absentOnLine: [[2, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word remains contextual: timeline title blank",
    code: "timeline\ntitle\n\nT",
    scopes: [],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word remains contextual: timeline section blank",
    code: "timeline\nsection\n\nS",
    scopes: [],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word remains contextual: treemap accDescr class",
    code: 'treemap\nclassDef\naccDescr\nfill:red\n"A":1',
    scopes: [],
    absentOnLine: [[2, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word remains contextual: timeline accDescr text",
    code: "timeline\naccDescr\nA",
    scopes: [],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word remains contextual: eventmodeling title longer",
    code: "eventmodeling entity\n titlex",
    scopes: [],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word stays in sequence nested text",
    code: "sequenceDiagram\naccDescr {\ntitle\n}",
    scopes: [["title", "string.unquoted.mermaid", 2]],
    absentOnLine: [[2, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word stays in gantt nested text",
    code: "gantt\naccDescr {\ndateFormat\n}",
    scopes: [["dateFormat", "string.unquoted.mermaid", 2]],
    absentOnLine: [[2, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word stays in state nested note",
    code: "stateDiagram-v2\nnote left of A\nclassDef\nend note",
    scopes: [["classDef", "string.unquoted.mermaid", 2]],
    absentOnLine: [[2, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word stays in requirement nested text",
    code: "requirementDiagram\naccDescr {\naccTitle\n}",
    scopes: [["accTitle", "string.unquoted.mermaid", 2]],
    absentOnLine: [[2, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word stays in flowchart nested text",
    code: 'flowchart TD\nA["click\nclick"]',
    scopes: [["click", "string.quoted.double.mermaid", 2]],
    absentOnLine: [[2, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final word stays in agentflow nested text",
    code: 'agentflow-beta\nA["click\nclick"]',
    scopes: [["click", "string.quoted.double.mermaid", 2]],
    absentOnLine: [[2, "keyword.control.mermaid"]],
  },
  {
    name: "a line-final classDef in a composite state",
    code: "stateDiagram-v2\nstate Outer {\n  classDef\nc fill:red\n}",
    scopes: [["classDef", "keyword.control.mermaid", 2]],
  },
  {
    name: "common metadata after tree prefix title",
    code: "treeView-beta\n├── title T",
    scopes: [
      ["title", "keyword.control.mermaid", 1],
      ["T", "string.unquoted.mermaid", 1],
    ],
  },
  {
    name: "common metadata after tree prefix accTitle",
    code: "treeView-beta\n├── accTitle: A",
    scopes: [
      ["accTitle", "keyword.control.mermaid", 1],
      [" A", "string.unquoted.mermaid", 1],
    ],
  },
  {
    name: "common metadata after tree prefix short",
    code: "treeView-beta\n└─ title T",
    scopes: [
      ["title", "keyword.control.mermaid", 1],
      ["T", "string.unquoted.mermaid", 1],
    ],
  },
  {
    name: "common metadata after tree prefix nested",
    code: "treeView-beta\n│   ├── title T",
    scopes: [
      ["title", "keyword.control.mermaid", 1],
      ["T", "string.unquoted.mermaid", 1],
    ],
  },
  {
    name: "common metadata after tree prefix glued",
    code: "treeView-beta\n├──title",
    scopes: [["title", "keyword.control.mermaid", 1]],
  },
  {
    name: "common metadata after tree prefix accDescr line",
    code: "treeView-beta\n├── accDescr: D",
    scopes: [
      ["accDescr", "keyword.control.mermaid", 1],
      [" D", "string.unquoted.mermaid", 1],
    ],
  },
  {
    name: "common metadata after tree prefix accDescr block",
    code: "treeView-beta\n├── accDescr { D }",
    scopes: [
      ["accDescr", "keyword.control.mermaid", 1],
      [" D ", "string.unquoted.mermaid", 1],
      ["{", "keyword.operator.delimiter.description.begin.mermaid", 1],
      ["}", "keyword.operator.delimiter.description.end.mermaid", 1],
    ],
  },
  {
    name: "common metadata after tree prefix quoted node",
    code: 'treeView-beta\n├── title"node"',
    scopes: [
      ["title", "keyword.control.mermaid", 1],
      ["node", "string.quoted.double.mermaid", 1],
    ],
  },
  {
    name: "common metadata after tree prefix directives",
    code: "treeView-beta\n├%%{x}%%── title T",
    scopes: [
      ["title", "keyword.control.mermaid", 1],
      ["x", "meta.directive.mermaid", 1],
      ["T", "string.unquoted.mermaid", 1],
    ],
  },
  {
    name: "common metadata is text after tree bars text",
    code: "treeView-beta\n│ title T",
    scopes: [],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "common metadata is text after tree misplaced branch text",
    code: "treeView-beta\n├│ title T",
    scopes: [],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "common metadata is text after tree two branch text",
    code: "treeView-beta\n├── ├── title T",
    scopes: [],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "flowchart entities enter their callback, edge-name and label contexts",
    code: 'flowchart\nclick A call #amp;(x)\nclick A call #amp;x(x)\nclick A call x#amp;(x)\nclick A call cb(#amp;)\nclick #amp; cb\nA #amp;@-->B\nA #amp;x@-->B\nA x#amp;@-->B\nA(-#amp;-)\nA["#amp;"]\nA[#amp;]\nA[/#amp;"x/]\nA--#amp;-->B\nA-->|#amp;|B\nA@{label:"#amp;"}\nstyle A fill:#amp;\nclassDef c fill:#amp;\n',
    scopes: [
      ["#amp;", "entity.name.function.mermaid", 1],
      ["#amp;", "entity.name.function.mermaid", 2],
      ["#amp;", "entity.name.function.mermaid", 3],
      ["#amp;", "string.unquoted.mermaid", 4],
      ["#amp;", "variable.mermaid", 5],
      ["cb", "entity.name.function.mermaid", 5],
      ["#amp;", "variable.mermaid", 6],
      ["@", "keyword.operator.separator.edge.mermaid", 6],
      ["#amp;x", "variable.mermaid", 7],
      ["@", "keyword.operator.separator.edge.mermaid", 7],
      ["x#amp;", "variable.mermaid", 8],
      ["@", "keyword.operator.separator.edge.mermaid", 8],
      ["#amp;", "string.unquoted.mermaid", 9],
      ["#amp;", "string.quoted.double.mermaid", 10],
      ["#amp;", "string.unquoted.mermaid", 11],
      ["#amp;", "string.unquoted.mermaid", 12],
      ['"x', "string.unquoted.mermaid", 12],
      ["#amp;", "string.unquoted.mermaid", 13],
      ["#amp;", "string.unquoted.mermaid", 14],
      ["#amp;", "string.quoted.double.mermaid", 15],
      ["#amp;", "support.constant.property-value.mermaid", 16],
      ["#amp;", "support.constant.property-value.mermaid", 17],
    ],
    absent: [
      ["#amp;", "string.unquoted.mermaid", 1],
      ["#amp;", "entity.name.function.mermaid", 4],
      ['"x', "string.quoted.double.mermaid", 12],
    ],
  },
  {
    name: "agentflow entities enter their callback, edge-name and label contexts",
    code: 'agentflow-beta\nclick A call #amp;(x)\nclick A call #amp;x(x)\nclick A call x#amp;(x)\nclick A call cb(#amp;)\nclick #amp; cb\nA #amp;@-->B\nA #amp;x@-->B\nA x#amp;@-->B\nA(-#amp;-)\nA["#amp;"]\nA[#amp;]\nA[/#amp;"x/]\nA--#amp;-->B\nA-->|#amp;|B\nA@{label:"#amp;"}\nstyle A fill:#amp;\nclassDef c fill:#amp;\nflow click #amp;\nA\nend\nconnector click #amp;\n',
    scopes: [
      ["#amp;", "entity.name.function.mermaid", 1],
      ["#amp;", "entity.name.function.mermaid", 2],
      ["#amp;", "entity.name.function.mermaid", 3],
      ["#amp;", "string.unquoted.mermaid", 4],
      ["#amp;", "variable.mermaid", 5],
      ["cb", "entity.name.function.mermaid", 5],
      ["#amp;", "variable.mermaid", 6],
      ["@", "keyword.operator.separator.edge.mermaid", 6],
      ["#amp;x", "variable.mermaid", 7],
      ["@", "keyword.operator.separator.edge.mermaid", 7],
      ["x#amp;", "variable.mermaid", 8],
      ["@", "keyword.operator.separator.edge.mermaid", 8],
      ["#amp;", "string.unquoted.mermaid", 9],
      ["#amp;", "string.quoted.double.mermaid", 10],
      ["#amp;", "string.unquoted.mermaid", 11],
      ["#amp;", "string.unquoted.mermaid", 12],
      ['"x', "string.unquoted.mermaid", 12],
      ["#amp;", "string.unquoted.mermaid", 13],
      ["#amp;", "string.unquoted.mermaid", 14],
      ["#amp;", "string.quoted.double.mermaid", 15],
      ["#amp;", "support.constant.property-value.mermaid", 16],
      ["#amp;", "support.constant.property-value.mermaid", 17],
      ["#amp;", "string.unquoted.mermaid", 18],
      ["#amp;", "string.unquoted.mermaid", 21],
    ],
    absent: [
      ["#amp;", "string.unquoted.mermaid", 1],
      ["#amp;", "entity.name.function.mermaid", 4],
      ['"x', "string.quoted.double.mermaid", 12],
    ],
  },
  {
    name: "a packet HTML tag keeps an escaped non-attribute quote",
    code: 'packet 0:"<b \\"text>"',
    scopes: [['<b \\"text>', "string.quoted.double.mermaid"]],
    absent: [['<b \\"text>', "punctuation.definition.string.end.mermaid"]],
  },
  {
    name: "a packet HTML tag reads a directive inside a quote escape",
    code: 'packet 0:"<b \\%%{wrap}%%"text>"',
    scopes: [
      ["wrap", "entity.name.function.directive.mermaid"],
      ['"text>', "string.quoted.double.mermaid"],
    ],
    absent: [['"text>', "punctuation.definition.string.end.mermaid"]],
  },
  {
    name: "a railroad HTML tag keeps an escaped non-attribute quote",
    code: 'railroad-beta\nr=terminal("<b \\"text>");',
    scopes: [
      ['<b \\"text>', "string.quoted.double.mermaid"],
      [")", "keyword.operator.bracket.arguments.end.mermaid"],
      [";", "keyword.operator.separator.rule.mermaid"],
    ],
    absent: [[")", "string.quoted.double.mermaid"]],
  },
  {
    name: "a railroad HTML tag reads a directive inside a quote escape",
    code: 'railroad-beta\nr=terminal("<b \\%%{wrap}%%"text>");',
    scopes: [
      ["wrap", "entity.name.function.directive.mermaid"],
      ['"text>', "string.quoted.double.mermaid"],
      [";", "keyword.operator.separator.rule.mermaid"],
    ],
    absent: [[";", "string.quoted.double.mermaid"]],
  },
  {
    name: "a usecase JSON HTML tag keeps an escaped non-attribute quote",
    code: 'usecase-beta\njson J @ {"x":"<b \\"text>"}',
    scopes: [['<b \\"text>', "string.quoted.double.mermaid"]],
    absent: [["}", "string.quoted.double.mermaid"]],
  },
  {
    name: "a usecase JSON HTML tag reads a directive inside a quote escape",
    code: 'usecase-beta\njson J @ {"x":"<b \\%%{wrap}%%"text>"}',
    scopes: [
      ["wrap", "entity.name.function.directive.mermaid"],
      ['"text>', "string.quoted.double.mermaid"],
    ],
    absent: [["}", "string.quoted.double.mermaid"]],
  },
  {
    name: "a markdown HTML tag keeps a lone backquote before a quoted value",
    code: 'usecase-beta\nA("`<b` x="`">z`")',
    scopes: [
      ['<b` x="`">', "string.quoted.other.markdown.mermaid"],
      ["z", "string.quoted.other.markdown.mermaid"],
      ['`"', "punctuation.definition.string.end.mermaid"],
      [")", "keyword.operator.shape.end.mermaid"],
    ],
    absent: [[")", "string.quoted.other.markdown.mermaid"]],
  },
  {
    name: "a markdown HTML tag keeps a lone double quote before a quoted value",
    code: 'usecase-beta\nA("`<b " x="`">z`")',
    scopes: [
      ['<b " x="`">', "string.quoted.other.markdown.mermaid"],
      ["z", "string.quoted.other.markdown.mermaid"],
      ['`"', "punctuation.definition.string.end.mermaid"],
      [")", "keyword.operator.shape.end.mermaid"],
    ],
    absent: [[")", "string.quoted.other.markdown.mermaid"]],
  },
  {
    name: "a sankey HTML tag reads a doubled quote before a quoted value",
    code: 'sankey-beta\n"<b "" x="v">",B,1',
    scopes: [
      ['<b "" x="v">', "string.quoted.double.mermaid"],
      [",", "keyword.operator.separator.comma.mermaid"],
    ],
    absent: [[",", "string.quoted.double.mermaid"]],
  },
  {
    name: "a sankey HTML tag reads a directive between doubled quotes",
    code: 'sankey-beta\n"<b "%%{wrap}%%" x="v">",B,1',
    scopes: [
      ["wrap", "entity.name.function.directive.mermaid"],
      ['" x="v">', "string.quoted.double.mermaid"],
      [",", "keyword.operator.separator.comma.mermaid"],
    ],
    absent: [[",", "string.quoted.double.mermaid"]],
  },
  {
    name: "a packet HTML quoted value ends at a quote after a backslash",
    code: 'packet 0:"<b x="v\\"tail>"',
    scopes: [['<b x="v\\"tail>', "string.quoted.double.mermaid"]],
    absent: [['<b x="v\\"tail>', "punctuation.definition.string.end.mermaid"]],
  },
  {
    name: "a usecase JSON HTML quoted value ends at a quote after a backslash",
    code: 'usecase-beta\njson J @ {"x":"<b x="v\\"tail>"}',
    scopes: [['<b x="v\\"tail>', "string.quoted.double.mermaid"]],
    absent: [["}", "string.quoted.double.mermaid"]],
  },
  {
    name: "a packet HTML tag finds a quoted value after a backslash",
    code: 'packet 0:"<b \\="v">"',
    scopes: [['<b \\="v">', "string.quoted.double.mermaid"]],
    absent: [['<b \\="v">', "punctuation.definition.string.end.mermaid"]],
  },
  {
    name: "a usecase JSON HTML tag finds a quoted value after a backslash",
    code: 'usecase-beta\njson J @ {"x":"<b \\="v">"}',
    scopes: [['<b \\="v">', "string.quoted.double.mermaid"]],
    absent: [["}", "string.quoted.double.mermaid"]],
  },
  {
    name: "a usecase JSON HTML tag keeps an escaped line separator",
    code: 'usecase-beta\njson J @ {"x":"<b \\\u2028text>"}',
    scopes: [["<b \\\u2028text>", "string.quoted.double.mermaid"]],
    absent: [["}", "string.quoted.double.mermaid"]],
  },
  {
    name: "a usecase JSON HTML tag keeps an escaped paragraph separator",
    code: 'usecase-beta\njson J @ {"x":"<b \\\u2029text>"}',
    scopes: [["<b \\\u2029text>", "string.quoted.double.mermaid"]],
    absent: [["}", "string.quoted.double.mermaid"]],
  },
  {
    name: "a packet HTML tag leaves an escaped tag closer to the string",
    code: 'packet 0:"<b \\>"\n1:"x"',
    scopes: [
      ["\\>", "constant.character.escape.mermaid"],
      ["1", "constant.numeric.mermaid"],
      ["x", "string.quoted.double.mermaid"],
    ],
    absent: [["1", "string.quoted.double.mermaid"]],
  },
  {
    name: "a packet HTML tag leaves an escape across a directive tag end whole",
    code: 'packet 0:"<b \\%%{x: >}%%"text"\n1:"x"',
    scopes: [
      [">", "string.unquoted.directive.mermaid"],
      ["text", "string.quoted.double.mermaid"],
      ["1", "constant.numeric.mermaid"],
      ["x", "string.quoted.double.mermaid", 1],
    ],
    absent: [["1", "string.quoted.double.mermaid"]],
  },
  {
    // architecture.md#icons-strings-and-bracketed-labels: The complete-string
    // lookahead and the shared escaped string must agree about HTML content.
    name: "an architecture quoted-label lookahead keeps an escaped quote in HTML",
    code: 'architecture-beta\nservice a["<b \\"text>"]',
    scopes: [
      ["[", "keyword.operator.delimiter.label.begin.mermaid"],
      ['<b \\"text>', "string.quoted.double.mermaid"],
      ["]", "keyword.operator.delimiter.label.end.mermaid"],
    ],
    absent: [["]", "string.quoted.double.mermaid"]],
  },
  {
    // The markdown closer reads through directives even inside an HTML tag.
    name: "a markdown HTML tag leaves a closer containing a directive whole",
    code: 'usecase-beta\nA("`<b`%%{wrap}%%")\nB(>)',
    scopes: [
      ["`", "punctuation.definition.string.end.mermaid"],
      ["wrap", "entity.name.function.directive.mermaid"],
      [")", "keyword.operator.shape.end.mermaid", 1],
      [">", "string.unquoted.mermaid"],
    ],
    absent: [[")", "string.quoted.other.markdown.mermaid", 1]],
  },
  {
    // The doubled quote remains whole when a directive contains the tag end.
    name: "a sankey HTML tag leaves a doubled quote across its tag end whole",
    code: 'sankey-beta\n"<b "%%{x: >}%%" text",B,1',
    scopes: [
      [">", "string.unquoted.directive.mermaid"],
      [" text", "string.quoted.double.mermaid"],
      [",", "keyword.operator.separator.comma.mermaid"],
    ],
    absent: [[",", "string.quoted.double.mermaid"]],
  },
  {
    // The top-level grammar comment states this limit: a directive owns the
    // written closing quote of the attribute, so the later quote closes the
    // grammar's attribute value and the packet string remains open.
    name: "an HTML attribute quote inside a directive retains the stated limit",
    code: 'packet 0:"<b x="%%{x: "}%%foo" %% >',
    scopes: [
      ["x", "entity.name.function.directive.mermaid"],
      ['foo" %% >', "string.quoted.double.mermaid"],
    ],
    absentOnLine: [
      [0, "punctuation.definition.string.end.mermaid"],
      [0, "comment.line.percentage.mermaid"],
    ],
  },
  {
    // flowchart.md#strings: A backtick followed by a quote leaves markdown.
    name: "flowchart markdown closes before its shape and arrow after an HTML opener",
    code: 'flowchart LR;A["`<b`"] --> B[>]',
    scopes: [
      ["<b", "string.quoted.other.markdown.mermaid"],
      ['`"', "punctuation.definition.string.end.mermaid"],
      ["]", "keyword.operator.shape.end.mermaid"],
      ["-->", "keyword.operator.arrow.mermaid"],
      ["B", "variable.mermaid"],
    ],
    absent: [
      ["-->", "string.quoted.other.markdown.mermaid"],
      ["-->", "string.quoted.double.mermaid"],
    ],
  },
  {
    // agentflow.md#names-strings-and-click-text retains flowchart's rules.
    name: "agentflow markdown closes before its shape and comment after an HTML opener",
    code: 'agentflow-beta LR;A["`<b`"]%% >',
    scopes: [
      ["<b", "string.quoted.other.markdown.mermaid"],
      ['`"', "punctuation.definition.string.end.mermaid"],
      ["]", "keyword.operator.shape.end.mermaid"],
      ["%% >", "comment.line.percentage.mermaid"],
    ],
    absent: [
      ["%% >", "string.quoted.other.markdown.mermaid"],
      ["%% >", "string.quoted.double.mermaid"],
    ],
  },
  {
    name: "a flowchart HTML tag keeps a closing quote inside its directive",
    code: 'flowchart LR;A["<b %%{init: >"}%%text"]',
    scopes: [
      ['>"', "string.unquoted.directive.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
      ["text", "string.quoted.double.mermaid"],
      ["]", "keyword.operator.shape.end.mermaid"],
    ],
    absentOnLine: [[0, "comment.line.percentage.mermaid"]],
  },
  {
    name: "an agentflow HTML tag keeps a closing quote inside its directive",
    code: 'agentflow-beta LR;A["<b %%{init: >"}%%text"]',
    scopes: [
      ['>"', "string.unquoted.directive.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
      ["text", "string.quoted.double.mermaid"],
      ["]", "keyword.operator.shape.end.mermaid"],
    ],
    absentOnLine: [[0, "comment.line.percentage.mermaid"]],
  },
  {
    name: "a radar HTML tag keeps keyword-like text inside its directive",
    code: 'radar-beta axis a["<b %%{x: > "axis"}%%foo"]',
    scopes: [
      ['> "axis"', "string.unquoted.directive.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
      ["foo", "string.quoted.double.mermaid"],
      ["]", "keyword.operator.delimiter.label.end.mermaid"],
    ],
  },
  {
    name: "a packet HTML tag keeps a closing quote inside its directive",
    code: 'packet\n0:"<b %%{x: >"}%%done"',
    scopes: [
      ['>"', "string.unquoted.directive.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
      ["done", "string.quoted.double.mermaid"],
    ],
    absentOnLine: [[1, "comment.line.percentage.mermaid"]],
  },
  {
    name: "a railroad HTML tag keeps a closing quote inside its directive",
    code: 'railroad-beta r=terminal("<b %%{x: >"}%%x");',
    scopes: [
      ['>"', "string.unquoted.directive.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
      ["x", "string.quoted.double.mermaid"],
      [";", "keyword.operator.separator.rule.mermaid"],
    ],
    absentOnLine: [[0, "comment.line.percentage.mermaid"]],
  },
  {
    name: "a class HTML tag keeps a closing quote inside its directive",
    code: 'classDiagram\nnote "<b %%{x: >"}%%foo"',
    scopes: [
      ['>"', "string.unquoted.directive.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
      ["foo", "string.quoted.double.mermaid"],
    ],
    absentOnLine: [[1, "comment.line.percentage.mermaid"]],
  },
  {
    name: "a markdown HTML tag keeps its directive whole at the tag end",
    code: 'usecase-beta\nA("`<b %%{x: >"}%%foo`")',
    scopes: [
      ['>"', "string.unquoted.directive.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
      ["foo", "string.quoted.other.markdown.mermaid"],
      ['`"', "punctuation.definition.string.end.mermaid"],
      [")", "keyword.operator.shape.end.mermaid"],
    ],
    absentOnLine: [[1, "comment.line.percentage.mermaid"]],
  },
  {
    name: "a markdown HTML quoted value keeps an interior backquote",
    code: 'usecase-beta\nA("`<b x="`">z`")',
    scopes: [
      ['<b x="`">', "string.quoted.other.markdown.mermaid"],
      ["z", "string.quoted.other.markdown.mermaid"],
      ['`"', "punctuation.definition.string.end.mermaid"],
      [")", "keyword.operator.shape.end.mermaid"],
    ],
    absent: [['<b x="`">', "punctuation.definition.string.end.mermaid"]],
  },
  {
    name: "hidden info YAML closes after a leading directive",
    code: "info\n---\nx\n%%{wrap}%%---\n\ntitle T",
    scopes: [
      ["wrap", "entity.name.function.directive.mermaid"],
      ["---", "comment.block.ignored.mermaid", 3],
      ["title", "keyword.control.mermaid"],
      ["T", "string.unquoted.mermaid"],
    ],
    absent: [["title", "comment.block.ignored.mermaid"]],
  },
  {
    name: "hidden architecture YAML closes after a leading directive",
    code: "architecture-beta ---\nx\n%%{wrap}%%---\nservice a",
    scopes: [
      ["wrap", "entity.name.function.directive.mermaid"],
      ["service", "keyword.control.mermaid"],
    ],
    absent: [["service", "comment.block.ignored.mermaid"]],
  },
  {
    name: "hidden radar YAML closes after a leading directive",
    code: "radar-beta\n---\nx\n%%{wrap}%%---\naxis a",
    scopes: [
      ["wrap", "entity.name.function.directive.mermaid"],
      ["axis", "keyword.control.mermaid"],
    ],
    absent: [["axis", "comment.block.ignored.mermaid"]],
  },
  {
    name: "hidden eventmodeling YAML closes after a leading directive",
    code: "eventmodeling\n---\nx\n%%{wrap}%%---\ntf 01 evt Kept",
    scopes: [
      ["wrap", "entity.name.function.directive.mermaid"],
      ["tf", "keyword.control.mermaid"],
      ["Kept", "variable.mermaid"],
    ],
    absent: [["tf", "comment.block.ignored.mermaid"]],
  },
  {
    name: "hidden railroad YAML closes after a leading directive",
    code: 'railroad-beta\n---\nx\n%%{wrap}%%---\nr=terminal("x");',
    scopes: [
      ["wrap", "entity.name.function.directive.mermaid"],
      ["terminal", "keyword.control.mermaid"],
      [";", "keyword.operator.separator.rule.mermaid"],
    ],
    absent: [["terminal", "comment.block.ignored.mermaid"]],
  },
  {
    name: "hidden wardley YAML closes after a leading directive",
    code: "wardley-beta\n---\nx\n%%{wrap}%%---\ncomponent A [0.2, 0.3]",
    scopes: [
      ["wrap", "entity.name.function.directive.mermaid"],
      ["component", "keyword.control.mermaid"],
    ],
    absent: [["component", "comment.block.ignored.mermaid"]],
  },
  {
    name: "hidden cynefin YAML closes after a leading directive",
    code: 'cynefin-beta\n---\nx\n%%{wrap}%%---\ncomplex "x"',
    scopes: [
      ["wrap", "entity.name.function.directive.mermaid"],
      ["complex", "constant.language.mermaid"],
    ],
    absent: [["complex", "comment.block.ignored.mermaid"]],
  },
  {
    name: "kanban shape text owns a quote after its first character",
    code: 'kanban A[<b x="y] %% >',
    scopes: [
      ['<b x="y', "string.unquoted.mermaid"],
      ["]", "keyword.operator.shape.end.mermaid"],
      ["%% >", "comment.line.percentage.mermaid"],
    ],
    absentOnLine: [[0, "string.quoted.double.mermaid"]],
  },
  {
    name: "mindmap shape text owns a quote after its first character",
    code: 'mindmap A[<b x="y] %% >',
    scopes: [
      ['<b x="y', "string.unquoted.mermaid"],
      ["]", "keyword.operator.shape.end.mermaid"],
      ["%% >", "comment.line.percentage.mermaid"],
    ],
    absentOnLine: [[0, "string.quoted.double.mermaid"]],
  },
  {
    name: "kanban shared markdown closes after an incomplete HTML tag",
    code: 'kanban A["%%{wrap}%%`<b`"] %% >',
    scopes: [
      ["wrap", "entity.name.function.directive.mermaid"],
      ["<b", "string.quoted.other.markdown.mermaid"],
      ['`"', "punctuation.definition.string.end.mermaid"],
      ["]", "keyword.operator.shape.end.mermaid"],
      ["%% >", "comment.line.percentage.mermaid"],
    ],
    absent: [["%% >", "string.quoted.other.markdown.mermaid"]],
  },
  {
    name: "mindmap shared markdown closes after an incomplete HTML tag",
    code: 'mindmap A["%%{wrap}%%`<b`"] %% >',
    scopes: [
      ["wrap", "entity.name.function.directive.mermaid"],
      ["<b", "string.quoted.other.markdown.mermaid"],
      ['`"', "punctuation.definition.string.end.mermaid"],
      ["]", "keyword.operator.shape.end.mermaid"],
      ["%% >", "comment.line.percentage.mermaid"],
    ],
    absent: [["%% >", "string.quoted.other.markdown.mermaid"]],
  },
  {
    name: "a flowchart data tag ends inside a directive before a quoted value",
    code: 'flowchart LR\nA@{<b %%{init: >}%% t="q"}',
    scopes: [
      ["q", "string.quoted.double.mermaid"],
      ["init", "entity.name.function.directive.mermaid"],
      ["}", "keyword.operator.bracket.data.end.mermaid"],
    ],
    absentOnLine: [[1, "comment.line.percentage.mermaid"]],
  },
  {
    name: "an agentflow data tag ends inside a directive before a quoted value",
    code: 'agentflow-beta LR\nA@{<b %%{init: >}%% t="q"}',
    scopes: [
      ["q", "string.quoted.double.mermaid"],
      ["init", "entity.name.function.directive.mermaid"],
      ["}", "keyword.operator.bracket.data.end.mermaid"],
    ],
    absentOnLine: [[1, "comment.line.percentage.mermaid"]],
  },
  {
    name: "an agentflow data tag preserves attribute quotes after a directive",
    code: 'agentflow-beta LR\nA@{<b %%{wrap}%% t="q">}',
    scopes: [
      ["wrap", "entity.name.function.directive.mermaid"],
      ["}", "keyword.operator.bracket.data.end.mermaid"],
    ],
    absentOnLine: [[1, "string.quoted.double.mermaid"]],
  },
  {
    name: "a markdown HTML tag reads a directive containing a backquote whole",
    code: 'quadrantChart\nquadrant-1 "`<b %%{wrap: `"}%% t="v">x`";title AfterHtml',
    scopes: [
      ['`"', "string.unquoted.directive.mermaid"],
      ["x", "string.quoted.other.markdown.mermaid"],
      ["title", "keyword.control.mermaid"],
    ],
    absent: [["title", "string.quoted.other.markdown.mermaid"]],
  },
  {
    name: "a railroad HTML tag ends before the next terminal call",
    code: 'railroad-beta r=sequence(terminal("<b %%{x: >}%%x="),terminal("y"));',
    scopes: [
      [",", "keyword.operator.separator.comma.mermaid"],
      ["y", "string.quoted.double.mermaid"],
      [";", "keyword.operator.separator.rule.mermaid"],
    ],
    absent: [[",", "string.quoted.double.mermaid"]],
  },
  {
    name: "an agentflow HTML tag ends before a shape closer and native comment",
    code: 'agentflow-beta LR;A["<b %%{init: >}%% t="]%% c ">',
    scopes: [
      ["]", "keyword.operator.shape.end.mermaid"],
      ['%% c ">', "comment.line.percentage.mermaid"],
    ],
    absent: [["]", "string.quoted.double.mermaid"]],
  },
  {
    name: "an HTML tag reads a directive without a closing angle bracket whole",
    code: 'treemap "<b %%{x: \\"v\\"}%% t="value">":1',
    scopes: [
      ['\\"v\\"', "string.unquoted.directive.mermaid"],
      [' t="value">', "string.quoted.double.mermaid"],
      ["1", "constant.numeric.mermaid"],
    ],
    absent: [[' t="value">', "punctuation.definition.string.end.mermaid"]],
  },
  {
    name: "an HTML tag leaves the markdown string closer for its enclosing rule",
    code: 'quadrantChart quadrant-1 "`<b`";title >',
    scopes: [
      ['`"', "punctuation.definition.string.end.mermaid"],
      [";", "keyword.operator.separator.semicolon.mermaid"],
      ["title", "keyword.control.mermaid"],
    ],
    absent: [["title", "string.quoted.other.markdown.mermaid"]],
  },
  {
    name: "a shared native comment stops before a line-separator common comment",
    code: "radar-beta %% native\u2028%% common %%{wrap}%%",
    scopes: [
      ["%% native", "comment.line.percentage.mermaid"],
      ["%% common %%{wrap}%%", "comment.line.percentage.mermaid"],
    ],
    absentOnLine: [[0, "meta.directive.mermaid"]],
  },
  {
    name: "a shared native comment stops before a paragraph-separator common comment",
    code: "radar-beta %% native\u2029%% common %%{wrap}%%",
    scopes: [
      ["%% native", "comment.line.percentage.mermaid"],
      ["%% common %%{wrap}%%", "comment.line.percentage.mermaid"],
    ],
    absentOnLine: [[0, "meta.directive.mermaid"]],
  },
  {
    name: "a hidden YAML opener reads directives between its dashes",
    code: "packet\n-%%{wrap}%%--\nx\n---",
    scopes: [
      ["-", "comment.block.ignored.mermaid"],
      ["wrap", "entity.name.function.directive.mermaid"],
      ["--", "comment.block.ignored.mermaid"],
      ["x", "comment.block.ignored.mermaid"],
    ],
    absentOnLine: [[1, "keyword.operator.mermaid"]],
  },
  {
    name: "a hidden YAML closer reads directives between its dashes",
    code: "info\n---\nx\n-%%{wrap}%%--\n\ntitle T",
    scopes: [
      ["wrap", "entity.name.function.directive.mermaid"],
      ["--", "comment.block.ignored.mermaid", 3],
      ["title", "keyword.control.mermaid"],
      ["T", "string.unquoted.mermaid"],
    ],
    absent: [["title", "comment.block.ignored.mermaid"]],
  },
  {
    name: "hidden YAML reads directives in both fence gaps",
    code: "packet\n-%%{wrap}%%-%%{wrap}%%-\nx\n-%%{wrap}%%-%%{wrap}%%-",
    scopes: [
      ["wrap", "entity.name.function.directive.mermaid", 1],
      ["wrap", "entity.name.function.directive.mermaid", 3],
      ["x", "comment.block.ignored.mermaid"],
      ["-", "comment.block.ignored.mermaid", 3],
    ],
  },
  {
    name: "hidden YAML opening padding admits directives",
    code: "architecture-beta ---%%{wrap}%%\nx\n---\nservice a",
    scopes: [
      ["wrap", "entity.name.function.directive.mermaid"],
      ["x", "comment.block.ignored.mermaid"],
      ["service", "keyword.control.mermaid"],
    ],
    absent: [["service", "comment.block.ignored.mermaid"]],
  },
  {
    name: "a hidden directive opener reads directives between its percent signs",
    code: "pie\n%%%{wrap}%%%{!}%%",
    scopes: [
      ["%", "comment.block.ignored.mermaid"],
      ["wrap", "entity.name.function.directive.mermaid"],
      ["%{!}%%", "comment.block.ignored.mermaid"],
    ],
    absentOnLine: [[1, "comment.line.percentage.mermaid"]],
  },
  {
    name: "a hidden directive closer reads directives between its percent signs",
    code: "pie\n%%{!}%%%{wrap}%%%",
    scopes: [
      ["%%{!}%", "comment.block.ignored.mermaid"],
      ["wrap", "entity.name.function.directive.mermaid"],
      ["%", "comment.block.ignored.mermaid"],
    ],
    absentOnLine: [[1, "comment.line.percentage.mermaid"]],
  },
  {
    name: "a hidden directive reads directives next to both braces",
    code: "pie\n%%%%{wrap}%%{!}%%{wrap}%%%%",
    scopes: [
      ["%%", "comment.block.ignored.mermaid"],
      ["wrap", "entity.name.function.directive.mermaid"],
      ["{!}", "comment.block.ignored.mermaid"],
    ],
    absentOnLine: [[1, "comment.line.percentage.mermaid"]],
  },
  {
    name: "a common comment keeps an apparent hidden directive closer as text",
    code: "radar-beta %%{! x\u2028%% }%% axis wrong",
    scopes: [
      ["%%{! x", "comment.line.percentage.mermaid"],
      ["%% }%% axis wrong", "comment.line.percentage.mermaid"],
    ],
    absent: [["%% }%% axis wrong", "keyword.control.mermaid"]],
  },
  {
    // common.md#comment-lines: A directive's trailing whitespace cannot take
    // a separator-led common comment into a native comment's body.
    name: "a native comment stops at a common comment in directive whitespace",
    code: "radar-beta %% native %%{wrap \u2028%% common %%{wrap}%%\naxis a",
    scopes: [
      ["wrap", "entity.name.function.directive.mermaid"],
      ["%% common %%{wrap}%%", "comment.line.percentage.mermaid"],
      ["axis", "keyword.control.mermaid"],
    ],
    absent: [["%% common %%{wrap}%%", "meta.directive.mermaid"]],
    unscoped: [["\u2028"]],
  },
  {
    // The hidden form cannot reach a closer inside that common comment.
    name: "a hidden directive cannot cross a common comment in directive whitespace",
    code: "radar-beta %%{! %%{wrap \u2028%% }%% axis wrong\naxis a",
    scopes: [
      ["%%{! ", "comment.line.percentage.mermaid"],
      ["wrap", "entity.name.function.directive.mermaid"],
      ["%% }%% axis wrong", "comment.line.percentage.mermaid"],
      ["axis", "keyword.control.mermaid"],
    ],
    absent: [["%% }%% axis wrong", "meta.directive.mermaid"]],
    absentOnLine: [[0, "comment.block.ignored.mermaid"]],
    unscoped: [["\u2028"]],
  },
  {
    name: "hidden YAML reads a line-separator common comment",
    code: "info\n---\nX\u2028%% c --- %%{wrap}%%\n\n---",
    scopes: [
      ["X\u2028", "comment.block.ignored.mermaid"],
      ["%% c --- %%{wrap}%%", "comment.line.percentage.mermaid"],
      ["---", "comment.block.ignored.mermaid", 4],
    ],
    absentOnLine: [[2, "meta.directive.mermaid"]],
  },
  {
    name: "hidden YAML reads a paragraph-separator common comment",
    code: "info\n---\nX\u2029%% c --- %%{wrap}%%\n\n---",
    scopes: [
      ["X\u2029", "comment.block.ignored.mermaid"],
      ["%% c --- %%{wrap}%%", "comment.line.percentage.mermaid"],
      ["---", "comment.block.ignored.mermaid", 4],
    ],
    absentOnLine: [[2, "meta.directive.mermaid"]],
  },
  {
    name: "a split hidden directive opener leaves the following axis outside",
    code: "radar-beta %%%{wrap}%%%{! }%% axis a",
    scopes: [
      ["wrap", "entity.name.function.directive.mermaid"],
      ["axis", "keyword.control.mermaid"],
      ["a", "variable.mermaid"],
    ],
    absent: [["axis", "comment.block.ignored.mermaid"]],
    absentOnLine: [[0, "comment.line.percentage.mermaid"]],
  },
  {
    name: "a split hidden directive closer leaves the following axis outside",
    code: "radar-beta %%{! }%%%{wrap}%%% axis a",
    scopes: [
      ["wrap", "entity.name.function.directive.mermaid"],
      ["axis", "keyword.control.mermaid"],
      ["a", "variable.mermaid"],
    ],
    absent: [["axis", "comment.block.ignored.mermaid"]],
    absentOnLine: [[0, "comment.line.percentage.mermaid"]],
  },
  {
    name: "timeline keywords with only separator directives remain periods",
    code: "timeline\ntitle %%{wrap}%%\n\nsection %%{wrap}%%\n",
    scopes: [["wrap", "entity.name.function.directive.mermaid"]],
    absentOnLine: [
      [1, "keyword.control.mermaid"],
      [3, "keyword.control.mermaid"],
    ],
  },
  {
    name: "the character after common comment marks is judged beyond directives",
    code: 'packet\n0: "start\n%%%{wrap}%%%%%{wrap}%%{ content\nend"\n',
    scopes: [["end", "string.quoted.double.mermaid"]],
    absentOnLine: [[2, "comment.line.percentage.mermaid"]],
  },
  {
    name: "a single-quoted escape still takes an HTML opener",
    code: "railroad-beta\na = terminal('\\<b>');\n",
    scopes: [
      ["\\<", "constant.character.escape.mermaid"],
      ["b>", "string.quoted.single.mermaid"],
    ],
  },
  {
    name: "an escaped double string resumes after a common comment containing its closer",
    code: 'packet\n0: "before\u2028%% escaped comment "\nafter"\n',
    scopes: [
      ["after", "string.quoted.double.mermaid"],
      ['%% escaped comment "', "comment.line.percentage.mermaid"],
    ],
  },
  {
    name: "an escaped single string resumes after a common comment containing its closer",
    code: "railroad-beta\na = terminal('before\u2029%% escaped single comment '\nafter');\n",
    scopes: [
      ["after", "string.quoted.single.mermaid"],
      ["%% escaped single comment '", "comment.line.percentage.mermaid"],
    ],
  },
  {
    name: "a plain double string resumes after a common comment containing its closer",
    code: 'kanban\nA["before\u2028%% plain comment "\nafter"]\n',
    scopes: [
      ["after", "string.quoted.double.mermaid"],
      ['%% plain comment "', "comment.line.percentage.mermaid"],
    ],
  },
  {
    name: "a plain single string resumes after a common comment containing its closer",
    code: "treeView-beta\n'before\u2029%% single comment '\nafter'\n",
    scopes: [
      ["after", "string.quoted.single.mermaid"],
      ["%% single comment '", "comment.line.percentage.mermaid"],
    ],
  },
  {
    name: "a markdown string resumes after a common comment containing its closer",
    code: 'kanban\nA["`before\u2029%% markdown comment `"\nafter`"]\n',
    scopes: [
      ["after", "string.quoted.other.markdown.mermaid"],
      ['%% markdown comment `"', "comment.line.percentage.mermaid"],
    ],
  },
  {
    name: "a shared description block resumes after a comment containing its closer",
    code: "packet\naccDescr { before\u2028%% block comment }\nafter }\n",
    scopes: [
      ["after ", "string.unquoted.mermaid"],
      ["%% block comment }", "comment.line.percentage.mermaid"],
      ["}", "keyword.operator.delimiter.description.end.mermaid", 2],
    ],
  },
  {
    name: "an HTML attribute stops before a separator-led common comment",
    code: 'flowchart\nA["<b title="x\u2028%% tag comment "y>\n"]\n',
    scopes: [
      ['%% tag comment "y>', "comment.line.percentage.mermaid"],
      ['"', "punctuation.definition.string.end.mermaid", 2],
    ],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "agentflow keeps comment-looking HTML attribute text inside a string",
    code: 'agentflow-beta\nA["<b title="x\u2028%% kept "y>"]\n',
    scopes: [
      ['<b title="x\u2028%% kept "y>', "string.quoted.double.mermaid"],
      ["]", "keyword.operator.shape.end.mermaid"],
    ],
    absentOnLine: [[1, "comment.line.percentage.mermaid"]],
  },
  {
    name: "eventmodeling keeps comment-looking HTML attribute text inside inline data",
    code: 'eventmodeling\ntf 01 evt Html "<b title="x %% kept "y>"\n',
    scopes: [['<b title="x %% kept "y>', "string.quoted.double.mermaid"]],
    absentOnLine: [[1, "comment.line.percentage.mermaid"]],
  },
  {
    name: "eventmodeling preserves comment-looking lines in its block values",
    code: "eventmodeling\ntf 01 evt E {} accDescr { before\u2028%% description content\n after }\ndata Block {\nbefore\u2029%% data content\nafter\n}\n",
    scopes: [
      [" before\u2028%% description content", "string.unquoted.mermaid"],
      ["before\u2029%% data content", "string.unquoted.mermaid"],
      ["after", "string.unquoted.mermaid"],
    ],
    absentOnLine: [
      [1, "comment.line.percentage.mermaid"],
      [4, "comment.line.percentage.mermaid"],
    ],
  },
  {
    name: "a sequence message after directives do not leave a common comment mark",
    code: "sequenceDiagram\n%%%{wrap}%%{->>B: x\n",
    scopes: [
      ["->>", "keyword.operator.arrow.mermaid"],
      ["x", "string.unquoted.mermaid"],
      ["wrap", "entity.name.function.directive.mermaid"],
    ],
    absentOnLine: [[1, "comment.line.percentage.mermaid"]],
  },
  {
    name: "a journey task after directives leave an opening brace after the percent",
    code: "journey\nsection S\n%%%{wrap}%%{left}: 3\n",
    scopes: [
      ["{left}", "string.unquoted.mermaid"],
      [":", "keyword.operator.separator.colon.mermaid"],
    ],
    absentOnLine: [[2, "comment.line.percentage.mermaid"]],
  },
  {
    name: "a leading common comment with directives between and after its marks",
    code: "%%%{wrap}%%%%%{wrap}%% leading\nsequenceDiagram\nA->>B: x\n",
    scopes: [
      ["%%%{wrap}%%%%%{wrap}%% leading", "comment.line.percentage.mermaid"],
      ["sequenceDiagram", "keyword.control.mermaid"],
    ],
  },
  {
    name: "a body common comment with directives between and after its marks",
    code: "sequenceDiagram\n%%%{wrap}%%%%%{wrap}%% body\nA->>B: x\n",
    scopes: [
      ["%%%{wrap}%%%%%{wrap}%% body", "comment.line.percentage.mermaid"],
      ["->>", "keyword.operator.arrow.mermaid"],
    ],
  },
  {
    name: "a shared native comment with directives in its marks and body",
    code: "pie\naccDescr {}%%%{wrap}%%% native %%{wrap}%% tail\n",
    scopes: [
      ["%", "comment.line.percentage.mermaid"],
      ["% native ", "comment.line.percentage.mermaid"],
      [" tail", "comment.line.percentage.mermaid"],
      ["wrap", "entity.name.function.directive.mermaid"],
    ],
  },
  {
    name: "a hidden directive reads its inner directive whole",
    code: "pie\n%%{! %%{wrap}%% showData }%%\n",
    scopes: [
      ["wrap", "entity.name.function.directive.mermaid"],
      [" showData }%%", "comment.block.ignored.mermaid"],
    ],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "hidden YAML reads its inner directive over a fence line",
    code: 'pie\n---\n%%{x: "\n---\n"}%%\nshowData\n---\n',
    scopes: [
      ["---", "string.unquoted.directive.mermaid", 3],
      ["showData", "comment.block.ignored.mermaid"],
    ],
    absent: [["showData", "keyword.control.mermaid"]],
  },
  {
    name: "an architecture quoted label keeps a backslash before an HTML opener",
    code: 'architecture-beta\nservice a["\\<b title="group">"]\n',
    scopes: [
      ['<b title="group">', "string.quoted.double.mermaid"],
      ["]", "keyword.operator.delimiter.label.end.mermaid"],
    ],
    absent: [['<b title="group">', "constant.character.escape.mermaid"]],
  },
  {
    name: "an architecture quoted label uses the shared quote escape",
    code: 'architecture-beta\nservice a["a\\"b"]\n',
    scopes: [
      ['\\"', "constant.character.escape.mermaid"],
      ["b", "string.quoted.double.mermaid"],
      ["]", "keyword.operator.delimiter.label.end.mermaid"],
    ],
  },
  {
    name: "timeline separators and their directives are outside the value scope",
    code: "timeline\ntitle%%{wrap}%% %%{wrap}%%T\nsection%%{wrap}%% %%{wrap}%%S\nPeriod:%%{wrap}%% %%{wrap}%%Event\naccTitle:%%{wrap}%% %%{wrap}%%Accessible\naccDescr {%%{wrap}%% Block }\n",
    scopes: [
      ["T", "string.unquoted.mermaid"],
      ["S", "string.unquoted.mermaid"],
      ["Event", "string.unquoted.mermaid"],
      ["Accessible", "string.unquoted.mermaid"],
      ["Block ", "string.unquoted.mermaid"],
    ],
    unscoped: [
      [" ", 1],
      [" ", 2],
      [" ", 3],
      [" ", 4],
      [" ", 5],
    ],
    absent: [
      ["wrap", "string.unquoted.mermaid", 1],
      ["wrap", "string.unquoted.mermaid", 2],
      ["wrap", "string.unquoted.mermaid", 3],
      ["wrap", "string.unquoted.mermaid", 4],
      ["wrap", "string.unquoted.mermaid", 5],
    ],
  },
  {
    name: "common notation whitespace before a header",
    code: "\uFEFFtimeline\nPeriod : Event\n",
    scopes: [["timeline", "keyword.control.mermaid"]],
  },
  {
    name: "an indented directive followed by a header",
    code: "  %%{init: {}}%% timeline\nPeriod : Event\n",
    scopes: [
      ["init", "entity.name.function.directive.mermaid"],
      ["timeline", "keyword.control.mermaid"],
    ],
  },
  {
    name: "a word argument leaves its following text outside the directive",
    code: "timeline\ntitle X%%{init: dark foo}%%Y\n",
    scopes: [
      ["dark", "string.unquoted.directive.mermaid"],
      ["foo}%%Y", "string.unquoted.mermaid"],
    ],
    absent: [["foo}%%Y", "meta.directive.mermaid"]],
  },
  {
    name: "a line separator before the directive closer",
    code: "timeline\ntitle X%%{init: {}\u2028}%%Y\n",
    scopes: [["Y", "string.unquoted.mermaid"]],
    absent: [["Y", "meta.directive.mermaid"]],
  },
  {
    name: "a paragraph separator ends free text without a closer",
    code: "timeline\ntitle X%%{init: {}\u2029Y\n",
    scopes: [["\u2029Y", "string.unquoted.mermaid"]],
    absent: [["\u2029Y", "meta.directive.mermaid"]],
  },
  {
    name: "a common comment after a closed directive",
    code: "%%{init: {}}%% %% leading comment\ntimeline\nPeriod : Event\n",
    scopes: [
      ["init", "entity.name.function.directive.mermaid"],
      ["%% leading comment", "comment.line.percentage.mermaid"],
    ],
  },
  {
    name: "a common body comment after a closed directive",
    code: "timeline\n%%{init: {}}%% %% body comment\nPeriod : Event\n",
    scopes: [
      ["init", "entity.name.function.directive.mermaid"],
      ["%% body comment", "comment.line.percentage.mermaid"],
    ],
  },
  {
    name: "directives before a comment after a line separator",
    code: "timeline\nPeriod\u2028%%{wrap}%% %%{init: dark}%% %% common\nNext : Event\n",
    scopes: [
      ["wrap", "entity.name.function.directive.mermaid"],
      ["dark", "string.unquoted.directive.mermaid"],
      ["%% common", "comment.line.percentage.mermaid"],
    ],
  },
  {
    name: "a word argument without a closer before a comment",
    code: "timeline\n%%{init: dark %% common\nPeriod : Event\n",
    scopes: [
      ["dark", "string.unquoted.directive.mermaid"],
      ["%% common", "comment.line.percentage.mermaid"],
    ],
  },
  {
    name: "free text stops at a separator before a comment",
    code: "timeline\n%%{init: {}\u2028 %% common\nPeriod : Event\n",
    scopes: [
      ["{}", "string.unquoted.directive.mermaid"],
      ["%% common", "comment.line.percentage.mermaid"],
    ],
  },
  {
    name: "ordinary text follows a word argument outside its directive",
    code: "timeline\n%%{init: dark foo}%% %% common\nPeriod : Event\n",
    scopes: [
      ["dark", "string.unquoted.directive.mermaid"],
      ["foo}%% %% common", "string.unquoted.mermaid"],
    ],
    absent: [
      ["foo}%% %% common", "meta.directive.mermaid"],
      ["foo}%% %% common", "comment.line.percentage.mermaid"],
    ],
  },
  {
    name: "a class note with text before a directive and a percent pair",
    code: 'classDiagram\nnote "x%%{init: {}}%% %%y"\n',
    scopes: [[" %%y", "string.quoted.double.mermaid"]],
    absent: [[" %%y", "comment.line.percentage.mermaid"]],
  },
  {
    name: "a state label with text before a directive and a percent pair",
    code: 'stateDiagram\nstate "x%%{init: {}}%% %%y" as A\n',
    scopes: [[" %%y", "string.quoted.double.mermaid"]],
    absent: [[" %%y", "comment.line.percentage.mermaid"]],
  },
  {
    // common.md#a-directive-is-a-token-boundary; gantt.md#the-statement-context.
    name: "a task name continues a keyword through a directive",
    code: "gantt\ninclusiveEndDates%%{wrap}%%Long : 1d\n",
    scopes: [
      ["inclusiveEndDates", "string.unquoted.mermaid"],
      ["wrap", "entity.name.function.directive.mermaid"],
    ],
    absent: [["inclusiveEndDates", "keyword.control.mermaid"]],
  },
  {
    name: "HTML attribute quotes inside a kanban string",
    code: 'kanban\n A["<b title="x">y</b>"]\n',
    scopes: [
      ['<b title="x">', "string.quoted.double.mermaid"],
      ["y</b>", "string.quoted.double.mermaid"],
    ],
    absent: [['<b title="x">', "punctuation.definition.string.end.mermaid"]],
  },
  {
    name: "a non-attribute quote inside a tag still ends a kanban string",
    code: 'kanban\n  A["a<b"]@{ ticket: "c>" }\n',
    scopes: [
      ["a", "string.quoted.double.mermaid"],
      ["<b", "string.quoted.double.mermaid"],
      ["ticket", "support.type.property-name.mermaid"],
      [":", "keyword.operator.separator.key-value.mermaid"],
      ["c>", "string.quoted.double.mermaid"],
      ["}", "keyword.operator.bracket.data.end.mermaid"],
    ],
    absent: [["ticket", "string.quoted.double.mermaid"]],
  },
  {
    // common.md#html-attribute-quotes: Tags are found in the text as written.
    name: "a backslash leaves an HTML tag inside an escaped string",
    code: 'architecture-beta\nservice a "\\<b title="group">"\n',
    scopes: [['<b title="group">', "string.quoted.double.mermaid"]],
    absent: [
      ['<b title="group">', "keyword.control.mermaid"],
      ['<b title="group">', "constant.character.escape.mermaid"],
    ],
  },
  {
    // common.md#html-attribute-quotes; common.md#a-directive-is-a-token-boundary.
    name: "a backslash leaves directives before an HTML tag inside a string",
    code: 'architecture-beta\nservice a "\\%%{wrap}%%<b title="group">"\n',
    scopes: [
      ["wrap", "entity.name.function.directive.mermaid"],
      ['<b title="group">', "string.quoted.double.mermaid"],
    ],
    absent: [['<b title="group">', "constant.character.escape.mermaid"]],
  },
  {
    // kanban.md#the-data-context: Single quotes do not protect a closing brace.
    name: "a kanban data block closes after an ordinary single quote",
    code: "kanban\nA@{x: 'a}%% c\n",
    scopes: [
      ["x", "support.type.property-name.mermaid"],
      [":", "keyword.operator.separator.key-value.mermaid"],
      ["'a", "string.unquoted.mermaid"],
      ["}", "keyword.operator.bracket.data.end.mermaid"],
      ["%% c", "comment.line.percentage.mermaid"],
    ],
    absent: [["'a", "string.quoted.single.mermaid"]],
  },
  {
    // kanban.md#data-blocks: Display property pairs within the opaque data unit.
    name: "a kanban data block displays property names and boolean values",
    code: "kanban\nA@{key: true, other: false}\n",
    scopes: [
      ["key", "support.type.property-name.mermaid"],
      [":", "keyword.operator.separator.key-value.mermaid"],
      ["true", "constant.language.mermaid"],
      [",", "keyword.operator.separator.comma.mermaid"],
      ["other", "support.type.property-name.mermaid"],
      ["false", "constant.language.mermaid"],
    ],
    absent: [
      ["key", "string.unquoted.mermaid"],
      ["true", "string.unquoted.mermaid"],
      ["false", "string.unquoted.mermaid"],
    ],
  },
  {
    // kanban.md#the-data-context: Quoted data holds braces, carets and line feeds;
    // a backslash does not escape its closing quote.
    name: "kanban quoted data protects a brace and caret across a line feed",
    code: 'kanban\nA@{x: "}^\n\\%%{wrap}%%"}%% c\n',
    scopes: [
      ["}^", "string.quoted.double.mermaid"],
      ["\\", "string.quoted.double.mermaid"],
      ["wrap", "entity.name.function.directive.mermaid"],
      ["}", "keyword.operator.bracket.data.end.mermaid"],
      ["%% c", "comment.line.percentage.mermaid"],
    ],
    absent: [["\\", "constant.character.escape.mermaid"]],
  },
  {
    name: "a backslash before a directive escapes the quote after it",
    code: 'gitGraph\ncommit msg: "A\\%%{init: {}}%%"B"\n',
    scopes: [
      ["\\", "constant.character.escape.mermaid"],
      ["init", "entity.name.function.directive.mermaid"],
      ["B", "string.quoted.double.mermaid"],
    ],
  },
  {
    name: "a packet accessibility title ends before a line-separator comment",
    code: "packet\naccTitle: t\u2028%% c\n",
    scopes: [
      [" t", "string.unquoted.mermaid"],
      ["%% c", "comment.line.percentage.mermaid"],
    ],
    absent: [
      ["\u2028", "string.unquoted.mermaid"],
      ["%% c", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "packet title and description values end before separator comment prefixes",
    code: "packet\ntitle t\u2029 %%{init: {}}%% %% title comment\naccDescr: d\u2028 %% description comment\n",
    scopes: [
      ["t", "string.unquoted.mermaid"],
      ["init", "entity.name.function.directive.mermaid"],
      ["%% title comment", "comment.line.percentage.mermaid"],
      [" d", "string.unquoted.mermaid"],
      ["%% description comment", "comment.line.percentage.mermaid"],
    ],
    absent: [
      ["init", "string.unquoted.mermaid"],
      ["%% title comment", "string.unquoted.mermaid"],
      ["%% description comment", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "a separator without a comment stays in a packet line value",
    code: "packet\naccTitle: t\u2028 words\n",
    scopes: [[" t\u2028 words", "string.unquoted.mermaid"]],
    absent: [[" t\u2028 words", "comment.line.percentage.mermaid"]],
  },
  {
    name: "a timeline entity before its hash can start a comment",
    code: "timeline\n#amp; : Event\n",
    scopes: [["Event", "string.unquoted.mermaid"]],
    absent: [["#amp;", "comment.line.number-sign.mermaid"]],
  },
  {
    name: "directives after a hash, within a word and before an entity semicolon",
    code: "timeline\n#%%{wrap}%%a%%{init: dark}%%mp%%{wrap}%%%%{wrap}%%; : Event\n",
    scopes: [
      ["wrap", "entity.name.function.directive.mermaid"],
      ["dark", "string.unquoted.directive.mermaid"],
      ["Event", "string.unquoted.mermaid"],
    ],
    absent: [["#", "comment.line.number-sign.mermaid"]],
  },
  {
    name: "a native kanban comment after a shape",
    code: "kanban\n A[Value]%%\n",
    scopes: [["%%", "comment.line.percentage.mermaid"]],
  },
  {
    name: "a native ishikawa comment right after the header",
    code: "ishikawa%% comment\u2028Root\n",
    scopes: [["%% comment", "comment.line.percentage.mermaid"]],
  },
  {
    name: "a longer eventmodeling identifier",
    code: "eventmodeling\ntf 01 evt evtLong\n",
    scopes: [["evtLong", "variable.mermaid"]],
    absent: [["evtLong", "keyword.control.mermaid"]],
  },
  {
    name: "a longer radar identifier",
    code: "radar-beta\naxis axisLong\ncurve curveLong{1}\n",
    scopes: [["axisLong", "variable.mermaid"]],
    absent: [["axisLong", "keyword.control.mermaid"]],
  },
  {
    name: "a longer venn identifier",
    code: "venn-beta\nset setter:2\nset unionized:3\n",
    scopes: [["setter", "variable.mermaid"]],
    absent: [["setter", "keyword.control.mermaid"]],
  },
  {
    name: "a longer usecase identifier",
    code: "usecase-beta\nactor actorLong\nactorLong --> node(noteLong)\n",
    scopes: [["actorLong", "variable.mermaid"]],
    absent: [["actorLong", "keyword.control.mermaid"]],
  },
  {
    name: "a longer agentflow identifier",
    code: "agentflow-beta\nclassLong --> styleLong\n",
    scopes: [["classLong", "variable.mermaid"]],
    absent: [["classLong", "keyword.control.mermaid"]],
  },
  {
    name: "bare comment forms before a header",
    code: "%%\n%%{ }%%\ntimeline\nPeriod : Event\n",
    scopes: [
      ["%%", "comment.line.percentage.mermaid"],
      ["%%{ }%%", "comment.line.percentage.mermaid"],
    ],
  },
  {
    name: "a directive after a comment mark remains comment text",
    code: "timeline\n%% comment %%{init: {}}%%\nPeriod : Event\n",
    scopes: [["%% comment %%{init: {}}%%", "comment.line.percentage.mermaid"]],
  },
  {
    name: "a common comment starts after a line separator and crosses a paragraph separator",
    code: "timeline\nPeriod\u2028%% common\u2029still comment\nNext : Event\n",
    scopes: [
      ["%% common\u2029still comment", "comment.line.percentage.mermaid"],
    ],
  },
  {
    name: "directive-looking free text does not start a nested directive",
    code: "timeline\ntitle X%%{init: %%{wrap}%%Y\n",
    scopes: [
      ["%%{wrap", "string.unquoted.directive.mermaid"],
      ["Y", "string.unquoted.mermaid"],
    ],
    absent: [["Y", "meta.directive.mermaid"]],
  },
  {
    name: "a kanban class after byte order mark indentation",
    code: "kanban\n A\n\uFEFF:::tag\n",
    scopes: [
      [":::", "keyword.operator.separator.class.mermaid"],
      ["tag", "variable.mermaid"],
    ],
  },
  {
    name: "a kanban icon after nonbreaking space indentation",
    code: "kanban\n A\n\u00A0::icon(x)\n",
    scopes: [["::icon", "keyword.control.mermaid"]],
  },
  {
    // common.md#a-directive-is-a-token-boundary; railroad.md#metadata-units.
    name: "directives before the one separator of a common title",
    code: 'railroad-beta\ntitle%%{wrap}%%\t Heading\na = terminal("x");\n',
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["wrap", "entity.name.function.directive.mermaid"],
      [" Heading", "string.unquoted.mermaid"],
    ],
  },
  {
    // common.md#a-directive-is-a-token-boundary; railroad.md#metadata-units.
    name: "a common accessibility title with directives and ASCII colon padding",
    code: 'railroad-beta\naccTitle \t%%{init}%% %%{wrap}%%\t: Title\na = terminal("x");\n',
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      ["init", "entity.name.function.directive.mermaid"],
      ["wrap", "entity.name.function.directive.mermaid"],
      [":", "keyword.operator.separator.colon.mermaid"],
      [" Title", "string.unquoted.mermaid"],
    ],
    absent: [["accTitle", "variable.mermaid"]],
  },
  {
    // common.md#a-directive-is-a-token-boundary; railroad.md#metadata-units.
    name: "a common description line with a directive before its colon",
    code: 'railroad-beta\naccDescr%%{wrap}%%: Description\na = terminal("x");\n',
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["wrap", "entity.name.function.directive.mermaid"],
      [" Description", "string.unquoted.mermaid"],
    ],
  },
  {
    // common.md#a-directive-is-a-token-boundary; railroad.md#metadata-units.
    name: "a common description block with a directive and Unicode whitespace in its gap",
    code: 'railroad-beta\naccDescr\u00A0%%{wrap}%%\u2028{ Block }\na = terminal("x");\n',
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["wrap", "entity.name.function.directive.mermaid"],
      ["{", "keyword.operator.delimiter.description.begin.mermaid"],
      [" Block ", "string.unquoted.mermaid"],
      ["}", "keyword.operator.delimiter.description.end.mermaid"],
    ],
  },
  {
    // railroad.md#metadata-units: Bare title is a complete unit.
    name: "a bare common title followed only by a directive",
    code: 'railroad-beta\ntitle%%{wrap}%%\na = terminal("x");\n',
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["wrap", "entity.name.function.directive.mermaid"],
    ],
    absent: [["wrap", "string.unquoted.mermaid"]],
  },
  {
    // treemap.md#common-forms: No EOL is required after a common form.
    name: "a common directive gap immediately after a description block",
    code: 'treemap\naccDescr {}accTitle%%{wrap}%%: Title\n"Leaf": 1\n',
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      ["wrap", "entity.name.function.directive.mermaid"],
      [" Title", "string.unquoted.mermaid"],
    ],
  },
  {
    // common.md#entities; railroad.md#ebnf-units.
    name: "an entity semicolon inside an EBNF special sequence",
    code: "railroad-ebnf-beta\nentity = ? #amp; ? ;\n",
    scopes: [
      ["?", "keyword.operator.delimiter.special-sequence.begin.mermaid"],
      [" #amp; ", "string.unquoted.mermaid"],
    ],
    absent: [
      ["?", "keyword.operator.separator.rule.mermaid"],
      [" #amp; ", "keyword.operator.separator.rule.mermaid"],
    ],
  },
  {
    // common.md#entities: A directive may lie right before the semicolon.
    name: "an entity with a directive before its semicolon inside a special sequence",
    code: "railroad-ebnf-beta\nentity = ? #amp%%{wrap}%%; ? ;\n",
    scopes: [
      ["wrap", "entity.name.function.directive.mermaid"],
      ["; ", "string.unquoted.mermaid"],
    ],
    absent: [
      ["; ", "keyword.operator.separator.rule.mermaid"],
      ["?", "keyword.operator.separator.rule.mermaid"],
    ],
  },
  {
    // treeview.md#names: Backslashes neither protect quotes nor decode escapes.
    name: "a treeview single-quoted name uses the shared plain string",
    code: "treeView-beta\n'single\\name'\n",
    scopes: [
      ["'", "string.quoted.single.mermaid"],
      ["'", "punctuation.definition.string.begin.mermaid"],
      ["single\\name", "string.quoted.single.mermaid"],
    ],
    absent: [["single\\name", "constant.character.escape.mermaid"]],
  },
  {
    // wardley.md#strings-and-link-labels: Flow backslash is ordinary content.
    name: "a wardley flow label uses the shared plain single-quoted string",
    code: "wardley-beta\nA +'a\\b'> B\n",
    scopes: [
      ["'", "punctuation.definition.string.begin.mermaid"],
      ["a\\b", "string.quoted.single.mermaid"],
      [">", "keyword.operator.arrow.mermaid"],
    ],
    absent: [["a\\b", "constant.character.escape.mermaid"]],
  },
  {
    // wardley.md#strings-and-link-labels: Flow content includes line breaks.
    name: "a wardley flow label continues over a physical line break",
    code: "wardley-beta\nA +'one\n two'> B\n",
    scopes: [
      ["one", "string.quoted.single.mermaid"],
      [" two", "string.quoted.single.mermaid"],
      [">", "keyword.operator.arrow.mermaid"],
    ],
    absent: [[">", "string.quoted.single.mermaid"]],
  },
  {
    name: "gitgraph metadata after directives",
    code: "gitGraph\n  %%{x}%%title t\n%%{x}%%accTitle: t\n%%{x}%% title t",
    scopes: [
      ["title", "keyword.control.mermaid", 1],
      ["accTitle", "keyword.control.mermaid", 2],
      ["title", "keyword.control.mermaid", 3],
    ],
  },
  {
    name: "architecture metadata after directives",
    code: "architecture-beta\n  %%{x}%%title t\n%%{x}%%accTitle: t\n%%{x}%%accDescr {d}\n%%{x}%% title t",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["title", "keyword.control.mermaid", 1],
      ["accTitle", "keyword.control.mermaid", 2],
      ["title", "keyword.control.mermaid", 4],
    ],
  },
  {
    name: "radar metadata after directives",
    code: "radar-beta\n  %%{x}%%title t\n%%{x}%%accTitle: t\n%%{x}%% title t",
    scopes: [
      ["title", "keyword.control.mermaid", 1],
      ["accTitle", "keyword.control.mermaid", 2],
      ["title", "keyword.control.mermaid", 3],
    ],
  },
  {
    name: "railroad metadata after directives",
    code: 'railroad-beta\n  %%{x}%%title t\n%%{x}%%accTitle: t\n%%{x}%% title t\na = terminal("x");',
    scopes: [
      ["title", "keyword.control.mermaid", 1],
      ["accTitle", "keyword.control.mermaid", 2],
      ["title", "keyword.control.mermaid", 3],
    ],
  },
  {
    name: "wardley metadata and anchor after directives",
    code: "wardley-beta\n  %%{x}%%title t\n%%{x}%%accTitle: t\n%%{x}%% title t\n%%{init: {}}%% anchor A [0.1,0.2]",
    scopes: [
      ["anchor", "keyword.control.mermaid"],
      ["title", "keyword.control.mermaid", 1],
      ["accTitle", "keyword.control.mermaid", 2],
      ["title", "keyword.control.mermaid", 3],
    ],
  },
  {
    name: "journey metadata after directives",
    code: "journey\n  %%{x}%%title t\n%%{x}%%accTitle: t\n%%{x}%% title t",
    scopes: [
      ["title", "keyword.control.mermaid", 1],
      ["accTitle", "keyword.control.mermaid", 2],
      ["title", "keyword.control.mermaid", 3],
    ],
  },
  {
    name: "pie metadata after directives",
    code: "pie\n  %%{x}%%title t\n%%{x}%%accTitle: t\n%%{x}%% title t",
    scopes: [
      ["title", "keyword.control.mermaid", 1],
      ["accTitle", "keyword.control.mermaid", 2],
      ["title", "keyword.control.mermaid", 3],
    ],
  },
  {
    name: "packet metadata after directives",
    code: "packet\n  %%{x}%%title t\n%%{x}%%accTitle: t\n%%{x}%% title t",
    scopes: [
      ["title", "keyword.control.mermaid", 1],
      ["accTitle", "keyword.control.mermaid", 2],
      ["title", "keyword.control.mermaid", 3],
    ],
  },
  {
    name: "treemap metadata and class definition after directives",
    code: 'treemap\n  %%{x}%%title t\n%%{x}%%accTitle: t\n%%{x}%% title t\n%%{init: {}}%% classDef ab fill:red\n"Leaf": 1',
    scopes: [
      ["classDef", "keyword.control.mermaid"],
      ["fill", "support.type.property-name.mermaid"],
      ["title", "keyword.control.mermaid", 1],
      ["accTitle", "keyword.control.mermaid", 2],
      ["title", "keyword.control.mermaid", 3],
    ],
  },
  {
    name: "cynefin metadata after directives",
    code: "cynefin-beta\n  %%{x}%%title t\n%%{x}%%accTitle: t\n%%{x}%% title t",
    scopes: [
      ["title", "keyword.control.mermaid", 1],
      ["accTitle", "keyword.control.mermaid", 2],
      ["title", "keyword.control.mermaid", 3],
    ],
  },
  {
    name: "treeview metadata after directives",
    code: "treeView-beta\n  %%{x}%%title t\n%%{x}%%accTitle: t\n%%{x}%% title t\nroot",
    scopes: [
      ["title", "keyword.control.mermaid", 1],
      ["accTitle", "keyword.control.mermaid", 2],
      ["title", "keyword.control.mermaid", 3],
    ],
  },
  {
    name: "info metadata after directives",
    code: "info\n  %%{x}%%title t\n%%{x}%%accTitle: t\n%%{x}%% title t",
    scopes: [
      ["title", "keyword.control.mermaid", 1],
      ["accTitle", "keyword.control.mermaid", 2],
      ["title", "keyword.control.mermaid", 3],
    ],
  },
  {
    name: "mindmap icon and class after directives",
    code: "mindmap\n  r\n    %%{init: {}}%%::icon(x)\n    %%{init: {}}%%:::c",
    scopes: [
      ["::icon", "keyword.control.mermaid"],
      ["x", "string.unquoted.mermaid"],
      [":::", "keyword.operator.separator.class.mermaid"],
      ["c", "variable.mermaid"],
    ],
  },
  {
    name: "requirement direction after a directive",
    code: "requirementDiagram\n%%{wrap}%%direction LR",
    scopes: [
      ["direction", "keyword.control.mermaid"],
      ["LR", "constant.language.mermaid"],
    ],
  },
  {
    name: "eventmodeling padded metadata after a directive",
    code: "eventmodeling%%{wrap}%% title t",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["t", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "timeline metadata after a directive",
    code: "timeline\n%%{wrap}%%title t\nPeriod : Event",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["t", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "kanban icon after a directive",
    code: "kanban\n A\n %%{wrap}%%::icon(x)",
    scopes: [
      ["::icon", "keyword.control.mermaid"],
      ["x", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "usecase metadata after a directive",
    code: "usecase-beta\n%%{wrap}%%accTitle: t",
    scopes: [["accTitle", "keyword.control.mermaid"]],
  },
  {
    name: "ishikawa comment after a directive",
    code: "ishikawa\nRoot\n%%{wrap}%%%% c",
    scopes: [["%% c", "comment.line.percentage.mermaid"]],
  },
  {
    name: "a directive within a wardley spaced name does not start metadata",
    code: "wardley-beta\nA%%{wrap}%% title B -> C",
    scopes: [[" title B", "variable.mermaid"]],
    absent: [[" title B", "keyword.control.mermaid"]],
  },
  {
    name: "a directive within a journey task does not start metadata",
    code: "journey\nA%%{wrap}%% title B: 5: C",
    scopes: [[" title B", "string.unquoted.mermaid"]],
    absent: [[" title B", "keyword.control.mermaid"]],
  },
  {
    name: "a directive between gitgraph id units does not start metadata",
    code: 'gitGraph\ncommit id: %%{wrap}%%"title"',
    scopes: [["title", "string.quoted.double.mermaid"]],
    absent: [["title", "keyword.control.mermaid"]],
  },
  {
    name: "a radar joined header and title",
    code: "radar-beta: title x",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["x", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "a radar joined header and accessibility title",
    code: "radar-beta:accTitle: x",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      [" x", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "a radar joined header and description block",
    code: "radar-beta:accDescr {x}",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["x", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "a radar padded header colon and title",
    code: "radar-beta :title x",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["x", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "a radar directive before its header colon",
    code: "radar-beta%%{x}%%:title x",
    scopes: [["title", "keyword.control.mermaid"]],
  },
  {
    name: "wardley title prefixes remain names",
    code: "wardley-beta\ntitlex -> b\ntitle_x -> b\ntitle-->b\ntitles +<> b",
    scopes: [
      ["titlex", "variable.mermaid"],
      ["title_x", "variable.mermaid"],
      ["title-", "variable.mermaid"],
      ["titles", "variable.mermaid"],
    ],
    absentOnLine: [
      [1, "keyword.control.mermaid"],
      [2, "keyword.control.mermaid"],
      [3, "keyword.control.mermaid"],
      [4, "keyword.control.mermaid"],
    ],
  },
  {
    name: "state percent text before a next-line body",
    code: "stateDiagram-v2\nstate X\n%%{}",
    scopes: [
      ["%%", "comment.block.ignored.mermaid"],
      ["{", "keyword.operator.block.begin.mermaid"],
      ["}", "keyword.operator.block.end.mermaid"],
    ],
  },
  {
    name: "state percent text before an alias body",
    code: 'stateDiagram-v2\nstate "d" as %% c {\n}',
    scopes: [
      ["%% c ", "comment.block.ignored.mermaid"],
      ["{", "keyword.operator.block.begin.mermaid"],
      ["}", "keyword.operator.block.end.mermaid"],
    ],
    absentOnLine: [[1, "comment.line.percentage.mermaid"]],
  },
  {
    name: "flowchart listed Unicode letters remain inside ids",
    code: "flowchart TD\nA\u1885B-->C\nA\u1886B-->C\nA\u0527B-->C\nA\u0531B-->C\nL[\u0528]",
    scopes: [
      ["A\u1885B", "variable.mermaid"],
      ["A\u1886B", "variable.mermaid"],
      ["A\u0527B", "variable.mermaid"],
      ["A\u0531B", "variable.mermaid"],
      ["\u0528", "string.unquoted.mermaid"],
    ],
    absent: [["\u0528", "variable.mermaid"]],
  },
  {
    name: "agentflow uses the listed flowchart Unicode letters",
    code: "agentflow-beta\nA\u1885B-->C\nA\u1886B-->C\nL[\u0528]",
    scopes: [
      ["A\u1885B", "variable.mermaid"],
      ["A\u1886B", "variable.mermaid"],
      ["\u0528", "string.unquoted.mermaid"],
    ],
    absent: [["\u0528", "variable.mermaid"]],
  },
  {
    name: "a mindmap directive-only line has no node text",
    code: "mindmap\n  r\n    %%{init: {}}%%\n    b",
    scopes: [
      ["init", "meta.directive.mermaid"],
      ["b", "string.unquoted.mermaid"],
    ],
    absentOnLine: [[2, "string.unquoted.mermaid"]],
  },
  {
    name: "a flowchart directive preserves the ampersand gap",
    code: "flowchart TD\nA %%{x}%%& B",
    scopes: [["&", "keyword.operator.mermaid"]],
    absent: [["&", "variable.mermaid"]],
  },
  {
    name: "an agentflow directive preserves the ampersand gap",
    code: "agentflow-beta\nA %%{x}%%& B",
    scopes: [["&", "keyword.operator.mermaid"]],
    absent: [["&", "variable.mermaid"]],
  },
  {
    name: "flowchart style lists keep commas and bare values",
    code: "flowchart TD\nclassDef a bold,fill:red\nstyle A fill:red,bold,stroke:blue\nstyle A #fff\nlinkStyle default bold,stroke:red",
    scopes: [
      ["bold", "support.constant.property-value.mermaid"],
      [",", "keyword.operator.separator.comma.mermaid"],
      ["fill", "support.type.property-name.mermaid"],
      [":", "keyword.operator.separator.key-value.mermaid"],
      ["#fff", "support.constant.property-value.mermaid"],
      ["stroke", "support.type.property-name.mermaid"],
    ],
  },
  {
    name: "agentflow style lists keep commas and bare values",
    code: "agentflow-beta\nclassDef a bold,fill:red\nstyle A fill:red,bold,stroke:blue\nstyle A #fff\nlinkStyle default bold,stroke:red",
    scopes: [
      ["bold", "support.constant.property-value.mermaid"],
      [",", "keyword.operator.separator.comma.mermaid"],
      ["fill", "support.type.property-name.mermaid"],
      [":", "keyword.operator.separator.key-value.mermaid"],
      ["#fff", "support.constant.property-value.mermaid"],
      ["stroke", "support.type.property-name.mermaid"],
    ],
  },
  {
    name: "classDef keeps an escaped comma in a bare flowchart style",
    code: "flowchart TD\nclassDef a bold\\,wide,fill:x\\%%{wrap}%%,y\nstyle A bold\\,wide\nlinkStyle default bold\\,wide\nclassDef b bold\\%%{wrap}%%,wide",
    scopes: [
      ["\\,", "support.constant.property-value.mermaid"],
      ["wide", "support.constant.property-value.mermaid"],
      ["wrap", "meta.directive.mermaid"],
      [",", "keyword.operator.separator.comma.mermaid", 2],
      [",", "keyword.operator.separator.comma.mermaid", 3],
      [",", "support.constant.property-value.mermaid", 4],
    ],
    absent: [["\\,", "keyword.operator.separator.comma.mermaid"]],
  },
  {
    name: "classDef keeps an escaped comma in a bare agentflow style",
    code: "agentflow-beta\nclassDef a bold\\,wide,fill:x\\%%{wrap}%%,y\nstyle A bold\\,wide\nlinkStyle default bold\\,wide\nclassDef b bold\\%%{wrap}%%,wide",
    scopes: [
      ["\\,", "support.constant.property-value.mermaid"],
      ["wide", "support.constant.property-value.mermaid"],
      ["wrap", "meta.directive.mermaid"],
      [",", "keyword.operator.separator.comma.mermaid", 2],
      [",", "keyword.operator.separator.comma.mermaid", 3],
      [",", "support.constant.property-value.mermaid", 4],
    ],
    absent: [["\\,", "keyword.operator.separator.comma.mermaid"]],
  },
  {
    name: "flowchart style values leave trailing whitespace",
    code: "flowchart TD\nstyle A fill:red  ,  bold  \nclassDef a fill:red  ,  bold  \nlinkStyle default fill:red  ,  bold  ",
    scopes: [
      ["red", "support.constant.property-value.mermaid"],
      ["bold", "support.constant.property-value.mermaid"],
    ],
    absent: [
      ["  ", "support.constant.property-value.mermaid", 1],
      ["  ", "support.constant.property-value.mermaid", 2],
      ["  ", "support.constant.property-value.mermaid", 3],
    ],
  },
  {
    name: "agentflow style values leave trailing whitespace",
    code: "agentflow-beta\nstyle A fill:red  ,  bold  \nclassDef a fill:red  ,  bold  \nlinkStyle default fill:red  ,  bold  ",
    scopes: [
      ["red", "support.constant.property-value.mermaid"],
      ["bold", "support.constant.property-value.mermaid"],
    ],
    absent: [
      ["  ", "support.constant.property-value.mermaid", 1],
      ["  ", "support.constant.property-value.mermaid", 2],
      ["  ", "support.constant.property-value.mermaid", 3],
    ],
  },
  {
    name: "block styles use whole bare values",
    code: "block-beta\nA\nstyle A bold,fill:red,#fff\nclassDef a bold,fill:red",
    scopes: [
      ["bold", "support.constant.property-value.mermaid"],
      ["fill", "support.type.property-name.mermaid"],
      ["#fff", "support.constant.property-value.mermaid"],
      [",", "keyword.operator.separator.comma.mermaid"],
      [":", "keyword.operator.separator.key-value.mermaid"],
    ],
  },
  {
    name: "class styles use whole bare values",
    code: "classDiagram\nclass A\nstyle A bold,fill:red\nclassDef a bold,fill:red\nclassDef c style",
    scopes: [
      ["bold", "support.constant.property-value.mermaid"],
      ["fill", "support.type.property-name.mermaid"],
      [",", "keyword.operator.separator.comma.mermaid"],
      [":", "keyword.operator.separator.key-value.mermaid"],
      ["style", "support.constant.property-value.mermaid", 4],
    ],
  },
  {
    name: "er styles use whole bare values",
    code: "erDiagram\nA\nstyle A bold,fill:red\nclassDef a bold,fill:red",
    scopes: [
      ["bold", "support.constant.property-value.mermaid"],
      ["fill", "support.type.property-name.mermaid"],
      [",", "keyword.operator.separator.comma.mermaid"],
      [":", "keyword.operator.separator.key-value.mermaid"],
    ],
  },
  {
    name: "state styles use whole bare values",
    code: "stateDiagram-v2\nA\nstyle A bold,fill:red\nclassDef a bold,fill:red",
    scopes: [
      ["bold", "support.constant.property-value.mermaid"],
      ["fill", "support.type.property-name.mermaid"],
      [",", "keyword.operator.separator.comma.mermaid"],
      [":", "keyword.operator.separator.key-value.mermaid"],
    ],
  },
  {
    name: "requirement styles use whole bare values",
    code: "requirementDiagram\nstyle A bold,fill:red\nclassDef a bold,fill:red",
    scopes: [
      ["bold", "support.constant.property-value.mermaid"],
      ["fill", "support.type.property-name.mermaid"],
      [",", "keyword.operator.separator.comma.mermaid"],
      [":", "keyword.operator.separator.key-value.mermaid"],
    ],
  },
  {
    name: "venn style properties preserve their value boundaries",
    code: "venn-beta\nset A\nstyle A fill:red,stroke:blue",
    scopes: [
      ["fill", "support.type.property-name.mermaid"],
      ["red", "support.constant.property-value.mermaid"],
      ["stroke", "support.type.property-name.mermaid"],
      [",", "keyword.operator.separator.comma.mermaid"],
      [":", "keyword.operator.separator.key-value.mermaid"],
    ],
  },
  {
    name: "usecase styles require property colons",
    code: "usecase-beta\nactor A\nstyle A fill:red,stroke:blue\nclassDef a fill:red,stroke:blue",
    scopes: [
      ["fill", "support.type.property-name.mermaid"],
      ["red", "support.constant.property-value.mermaid"],
      ["stroke", "support.type.property-name.mermaid"],
      [",", "keyword.operator.separator.comma.mermaid"],
      [":", "keyword.operator.separator.key-value.mermaid"],
    ],
  },
  {
    name: "quadrant style properties use key-value colons",
    code: "quadrantChart\nA: [0.1,0.2] color: #f00, radius: 4\nclassDef a color:#f00,radius:4",
    scopes: [
      ["color", "support.type.property-name.mermaid"],
      ["#f00", "support.constant.property-value.mermaid"],
      ["radius", "support.type.property-name.mermaid"],
      [":", "keyword.operator.separator.key-value.mermaid", 2],
      [",", "keyword.operator.separator.comma.mermaid"],
    ],
  },
  {
    name: "treemap displays property pairs inside opaque style text",
    code: 'treemap\nclassDef ab fill:red,stroke:blue\n"Leaf":1',
    scopes: [
      ["fill", "support.type.property-name.mermaid"],
      ["red", "support.constant.property-value.mermaid"],
      [",", "keyword.operator.separator.comma.mermaid"],
      ["stroke", "support.type.property-name.mermaid"],
      ["blue", "support.constant.property-value.mermaid"],
      [":", "keyword.operator.separator.key-value.mermaid"],
    ],
  },
  {
    name: "pie retained second-scan directive before its header",
    code: "%%{%%{wrap}%%wrap}%%\npie",
    scopes: [
      ["%%{", "comment.block.ignored.mermaid"],
      ["wrap", "meta.directive.mermaid"],
      ["pie", "keyword.control.mermaid"],
    ],
    absentOnLine: [[0, "comment.line.percentage.mermaid"]],
  },
  {
    name: "gitgraph retained second-scan directive before its header",
    code: "%%{%%{wrap}%%wrap}%%\ngitGraph",
    scopes: [
      ["%%{", "comment.block.ignored.mermaid"],
      ["wrap", "meta.directive.mermaid"],
      ["gitGraph", "keyword.control.mermaid"],
    ],
    absentOnLine: [[0, "comment.line.percentage.mermaid"]],
  },
  {
    name: "info retained second-scan directive before its header",
    code: "%%{%%{wrap}%%wrap}%%\ninfo",
    scopes: [
      ["%%{", "comment.block.ignored.mermaid"],
      ["wrap", "meta.directive.mermaid"],
      ["info", "keyword.control.mermaid"],
    ],
    absentOnLine: [[0, "comment.line.percentage.mermaid"]],
  },
  {
    name: "packet retained second-scan directive before its header",
    code: "%%{%%{wrap}%%wrap}%%\npacket",
    scopes: [
      ["%%{", "comment.block.ignored.mermaid"],
      ["wrap", "meta.directive.mermaid"],
      ["packet", "keyword.control.mermaid"],
    ],
    absentOnLine: [[0, "comment.line.percentage.mermaid"]],
  },
  {
    name: "architecture retained second-scan directive before its header",
    code: "%%{%%{wrap}%%wrap}%%\narchitecture-beta",
    scopes: [
      ["%%{", "comment.block.ignored.mermaid"],
      ["wrap", "meta.directive.mermaid"],
      ["architecture-beta", "keyword.control.mermaid"],
    ],
    absentOnLine: [[0, "comment.line.percentage.mermaid"]],
  },
  {
    name: "radar retained second-scan directive before its header",
    code: "%%{%%{wrap}%%wrap}%%\nradar-beta",
    scopes: [
      ["%%{", "comment.block.ignored.mermaid"],
      ["wrap", "meta.directive.mermaid"],
      ["radar-beta", "keyword.control.mermaid"],
    ],
    absentOnLine: [[0, "comment.line.percentage.mermaid"]],
  },
  {
    name: "railroad retained second-scan directive before its header",
    code: '%%{%%{wrap}%%wrap}%%\nrailroad-beta\na = terminal("x");',
    scopes: [
      ["%%{", "comment.block.ignored.mermaid"],
      ["wrap", "meta.directive.mermaid"],
      ["railroad-beta", "keyword.control.mermaid"],
    ],
    absentOnLine: [[0, "comment.line.percentage.mermaid"]],
  },
  {
    name: "wardley retained second-scan directive before its header",
    code: "%%{%%{wrap}%%wrap}%%\nwardley-beta",
    scopes: [
      ["%%{", "comment.block.ignored.mermaid"],
      ["wrap", "meta.directive.mermaid"],
      ["wardley-beta", "keyword.control.mermaid"],
    ],
    absentOnLine: [[0, "comment.line.percentage.mermaid"]],
  },
  {
    name: "cynefin retained second-scan directive before its header",
    code: "%%{%%{wrap}%%wrap}%%\ncynefin-beta",
    scopes: [
      ["%%{", "comment.block.ignored.mermaid"],
      ["wrap", "meta.directive.mermaid"],
      ["cynefin-beta", "keyword.control.mermaid"],
    ],
    absentOnLine: [[0, "comment.line.percentage.mermaid"]],
  },
  {
    name: "eventmodeling retained second-scan directive before its header",
    code: "%%{%%{wrap}%%wrap}%%\neventmodeling",
    scopes: [
      ["%%{", "comment.block.ignored.mermaid"],
      ["wrap", "meta.directive.mermaid"],
      ["eventmodeling", "keyword.control.mermaid"],
    ],
    absentOnLine: [[0, "comment.line.percentage.mermaid"]],
  },
  {
    name: "a class relation can end with an empty description block",
    code: "classDiagram\nclass A\nA <|-- B accDescr {}",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["{", "keyword.operator.delimiter.description.begin.mermaid"],
      ["}", "keyword.operator.delimiter.description.end.mermaid"],
    ],
  },
  {
    name: "a directive word argument begins on the next line",
    code: 'cynefin-beta\ncomplex\n%%{wrap\nclear "a"\n"b"',
    scopes: [
      ["clear", "string.unquoted.directive.mermaid"],
      ["a", "string.quoted.double.mermaid"],
      ["b", "string.quoted.double.mermaid"],
    ],
    absent: [
      ["a", "meta.directive.mermaid"],
      ["b", "meta.directive.mermaid"],
    ],
  },
  {
    name: "a directive takes only the next-line vertex word",
    code: "flowchart LR\nStart\n%%{wrap\nA-->B",
    scopes: [
      ["A", "string.unquoted.directive.mermaid"],
      ["-->", "keyword.operator.arrow.mermaid", 3],
      ["B", "variable.mermaid"],
    ],
    absent: [["B", "meta.directive.mermaid"]],
  },
  {
    name: "a directive takes an indented next-line word and closer",
    code: 'cynefin-beta\ncomplex\n%%{wrap:\n   clear }%%"a"\n"b"',
    scopes: [
      ["clear", "string.unquoted.directive.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
      ["a", "string.quoted.double.mermaid"],
      ["b", "string.quoted.double.mermaid"],
    ],
    absent: [
      ["a", "meta.directive.mermaid"],
      ["b", "meta.directive.mermaid"],
    ],
  },
  {
    name: "a three-line init keeps its free-text argument",
    code: 'flowchart LR\n%%{init: {\n"theme": "dark"\n}}%%\nA-->B',
    scopes: [
      ['"theme": "dark"', "string.unquoted.directive.mermaid"],
      ["A", "variable.mermaid"],
      ["B", "variable.mermaid"],
    ],
    absent: [["A", "meta.directive.mermaid"]],
  },
  {
    name: "an unclosed free-text directive keeps the remaining lines",
    code: 'flowchart LR\n%%{init: {"theme": "dark"}}\nA-->B',
    scopes: [["A-->B", "string.unquoted.directive.mermaid"]],
    absentOnLine: [[2, "variable.mermaid"]],
  },
  {
    name: "a delayed free-text directive keeps later word-looking lines",
    code: 'flowchart LR\n%%{init:\n{\n"theme": "dark"\n}}%%\nA-->B',
    scopes: [
      ['"theme": "dark"', "string.unquoted.directive.mermaid"],
      ["A", "variable.mermaid"],
    ],
  },
  {
    name: "a flowchart rectangle property uses the table scopes",
    code: "flowchart TD\nA[|borders:lt|text]",
    scopes: [
      ["borders", "support.type.property-name.mermaid"],
      [":", "keyword.operator.separator.key-value.mermaid"],
      ["lt", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "an agentflow rectangle property uses the table scopes",
    code: "agentflow-beta\nA[|borders:lt|text]",
    scopes: [
      ["borders", "support.type.property-name.mermaid"],
      [":", "keyword.operator.separator.key-value.mermaid"],
      ["lt", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "an architecture icon name is retained text",
    code: "architecture-beta\nservice s(server)",
    scopes: [
      ["server", "string.unquoted.mermaid"],
      ["(", "keyword.operator.bracket.icon.begin.mermaid"],
      [")", "keyword.operator.bracket.icon.end.mermaid"],
    ],
    absent: [["server", "variable.mermaid"]],
  },
  {
    name: "a treeview icon has icon brackets and retained reference",
    code: "treeView-beta\nroot icon(fa:x)",
    scopes: [
      ["fa:x", "string.unquoted.mermaid"],
      ["(", "keyword.operator.bracket.icon.begin.mermaid"],
      [")", "keyword.operator.bracket.icon.end.mermaid"],
    ],
  },
  {
    name: "a state terminal has the keyword scope",
    code: "stateDiagram-v2\n[*] --> A",
    scopes: [["[*]", "keyword.control.mermaid"]],
    absent: [["[*]", "variable.mermaid"]],
  },
  {
    name: "a usecase JSON value displays entries while balancing braces",
    code: 'usecase-beta\njson J @ {"a": {"nested": "v}"}, "b": 1}\nactor A',
    scopes: [
      ["@", "meta.data.mermaid"],
      ["{", "keyword.operator.bracket.data.begin.mermaid"],
      ["}", "string.unquoted.mermaid"],
      ['"a"', "support.type.property-name.mermaid"],
      ['"nested"', "support.type.property-name.mermaid"],
      ['"b"', "support.type.property-name.mermaid"],
      [":", "keyword.operator.separator.key-value.mermaid"],
      [",", "keyword.operator.separator.comma.mermaid"],
      ["v}", "string.quoted.double.mermaid"],
      ["1", "constant.numeric.mermaid"],
      ["A", "variable.mermaid"],
    ],
    absentOnLine: [[1, "meta.structure.dictionary.mermaid"]],
  },
  {
    name: "usecase native metadata keeps property keys",
    code: "usecase-beta\nactor A@{ type: normal }",
    scopes: [
      ["type", "support.type.property-name.mermaid"],
      [":", "keyword.operator.separator.key-value.mermaid"],
      ["normal", "constant.language.mermaid", 1],
    ],
  },
  {
    name: "requirement element type is a text field",
    code: "requirementDiagram\nelement A {\ntype: software\n}",
    scopes: [["software", "string.unquoted.mermaid"]],
    absent: [["software", "entity.name.type.mermaid"]],
  },
  {
    name: "eventmodeling type and data-tag words are keywords",
    code: 'eventmodeling\ntf 01 cmd A\ntf 02 evt B\ntf 03 evt C `json` {"a":1}',
    scopes: [
      ["cmd", "keyword.control.mermaid"],
      ["evt", "keyword.control.mermaid"],
      ["json", "keyword.control.mermaid"],
      ["{", "meta.data.mermaid"],
    ],
  },
  {
    name: "eventmodeling block data has a data wrapper",
    code: "eventmodeling\ndata D {\ntext\n}\n",
    scopes: [
      ["{", "meta.data.mermaid"],
      ["text", "string.unquoted.mermaid"],
      ["}", "meta.data.mermaid"],
    ],
  },
  {
    name: "kanban data strings protect a closing brace",
    code: 'kanban\nA\n b[y]@{"k": "v}"}',
    scopes: [
      ["@{", "meta.data.mermaid"],
      ['"k"', "support.type.property-name.mermaid"],
      [":", "keyword.operator.separator.key-value.mermaid"],
      ["v}", "string.quoted.double.mermaid"],
      ["}", "keyword.operator.bracket.data.end.mermaid"],
    ],
  },
  {
    name: "flowchart data displays keys and quoted values",
    code: 'flowchart TD\nC@{ shape: rect, label: "x" }',
    scopes: [
      ["@{", "meta.data.mermaid"],
      ["shape", "support.type.property-name.mermaid"],
      [":", "keyword.operator.separator.key-value.mermaid"],
      ["rect", "string.unquoted.mermaid"],
      [",", "keyword.operator.separator.comma.mermaid"],
      ["label", "support.type.property-name.mermaid"],
      ["x", "string.quoted.double.mermaid"],
      ["}", "keyword.operator.bracket.data.end.mermaid"],
    ],
  },
  {
    name: "agentflow data displays keys and quoted values",
    code: 'agentflow-beta\nC@{ shape: rect, label: "x" }',
    scopes: [
      ["@{", "meta.data.mermaid"],
      ["shape", "support.type.property-name.mermaid"],
      [":", "keyword.operator.separator.key-value.mermaid"],
      ["rect", "string.unquoted.mermaid"],
      [",", "keyword.operator.separator.comma.mermaid"],
      ["label", "support.type.property-name.mermaid"],
      ["x", "string.quoted.double.mermaid"],
      ["}", "keyword.operator.bracket.data.end.mermaid"],
    ],
  },
  {
    name: "flowchart link targets remain fixed values",
    code: 'flowchart TD\nclick A href "url" _self\nclick B href "url" _blank\nclick C href "url" _parent\nclick D href "url" _top',
    scopes: [
      ["_self", "constant.language.mermaid"],
      ["_blank", "constant.language.mermaid"],
      ["_parent", "constant.language.mermaid"],
      ["_top", "constant.language.mermaid"],
    ],
  },
  {
    name: "agentflow link targets remain fixed values",
    code: 'agentflow-beta\nclick A href "url" _self\nclick B href "url" _blank\nclick C href "url" _parent\nclick D href "url" _top',
    scopes: [
      ["_self", "constant.language.mermaid"],
      ["_blank", "constant.language.mermaid"],
      ["_parent", "constant.language.mermaid"],
      ["_top", "constant.language.mermaid"],
    ],
  },
  {
    name: "gantt callback brackets are argument brackets",
    code: "gantt\nTask : a, 1d\nclick a call cb(x)",
    scopes: [
      ["(", "keyword.operator.bracket.arguments.begin.mermaid"],
      [")", "keyword.operator.bracket.arguments.end.mermaid"],
    ],
  },
  {
    name: "eventmodeling body metadata after a directive",
    code: "eventmodeling\ndata D {\nx\n}\n%%{wrap}%% title t",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["t", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "a wardley title immediately before coordinates is a name",
    code: "wardley-beta\ncomponent %%{wrap}%%title[0.1,0.2]",
    scopes: [["title", "variable.mermaid"]],
    absent: [["title", "keyword.control.mermaid"]],
  },
  {
    name: "a kanban native comment after a midline directive",
    code: "kanban\n A[y]%%{wrap}%%%% native",
    scopes: [["%% native", "comment.line.percentage.mermaid"]],
  },
  {
    name: "a treeview native comment after a midline directive",
    code: "treeView-beta\nroot icon(fa:x)%%{wrap}%%%% native",
    scopes: [["%% native", "comment.line.percentage.mermaid"]],
  },
  {
    name: "a delayed word directive keeps its next-line closer",
    code: 'cynefin-beta\ncomplex\n%%{wrap\nclear\n}%%"a"\n"b"',
    scopes: [
      ["clear", "string.unquoted.directive.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
      ["a", "string.quoted.double.mermaid"],
      ["b", "string.quoted.double.mermaid"],
    ],
    absent: [
      ["a", "meta.directive.mermaid"],
      ["b", "meta.directive.mermaid"],
    ],
  },
  {
    name: "a delayed word directive leaves the next body line outside",
    code: 'cynefin-beta\ncomplex\n%%{wrap\nclear\n"a"\n"b"',
    scopes: [
      ["clear", "string.unquoted.directive.mermaid"],
      ["a", "string.quoted.double.mermaid"],
      ["b", "string.quoted.double.mermaid"],
    ],
    absent: [
      ["a", "meta.directive.mermaid"],
      ["b", "meta.directive.mermaid"],
    ],
  },
  {
    name: "follow-up: agentflow accTitle retains a midline directive and title-looking value",
    code: "agentflow-beta\naccTitle: a %%{x}%%title b",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: agentflow accDescr retains a midline directive and title-looking value",
    code: "agentflow-beta\naccDescr: a %%{x}%%title b",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: architecture title retains a midline directive and title-looking value",
    code: "architecture-beta\ntitle a %%{x}%%title b",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: architecture accTitle retains a midline directive and title-looking value",
    code: "architecture-beta\naccTitle: a %%{x}%%title b",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: architecture accDescr retains a midline directive and title-looking value",
    code: "architecture-beta\naccDescr: a %%{x}%%title b",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: c4 title retains a midline directive and title-looking value",
    code: "C4Context\ntitle a %%{x}%%title b",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: c4 accTitle retains a midline directive and title-looking value",
    code: "C4Context\naccTitle: a %%{x}%%title b",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: c4 accDescr retains a midline directive and title-looking value",
    code: "C4Context\naccDescr: a %%{x}%%title b",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: c4 accDescription retains a midline directive and title-looking value",
    code: "C4Context\naccDescription a %%{x}%%title b",
    scopes: [
      ["accDescription", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: class accTitle retains a midline directive and title-looking value",
    code: "classDiagram\naccTitle: a %%{x}%%title b",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: class accDescr retains a midline directive and title-looking value",
    code: "classDiagram\naccDescr: a %%{x}%%title b",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: cynefin title retains a midline directive and title-looking value",
    code: "cynefin-beta\ntitle a %%{x}%%title b",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: cynefin accTitle retains a midline directive and title-looking value",
    code: "cynefin-beta\naccTitle: a %%{x}%%title b",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: cynefin accDescr retains a midline directive and title-looking value",
    code: "cynefin-beta\naccDescr: a %%{x}%%title b",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: er accTitle retains a midline directive and title-looking value",
    code: "erDiagram\naccTitle: a %%{x}%%title b",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: er accDescr retains a midline directive and title-looking value",
    code: "erDiagram\naccDescr: a %%{x}%%title b",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: eventmodeling title retains a midline directive and title-looking value",
    code: "eventmodeling title a %%{x}%%title b",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: eventmodeling accTitle retains a midline directive and title-looking value",
    code: "eventmodeling accTitle: a %%{x}%%title b",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: eventmodeling accDescr retains a midline directive and title-looking value",
    code: "eventmodeling accDescr: a %%{x}%%title b",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: flowchart accTitle retains a midline directive and title-looking value",
    code: "flowchart TD\naccTitle: a %%{x}%%title b",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: flowchart accDescr retains a midline directive and title-looking value",
    code: "flowchart TD\naccDescr: a %%{x}%%title b",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: gantt title retains a midline directive and title-looking value",
    code: "gantt\ntitle a %%{x}%%title b",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: gantt accTitle retains a midline directive and title-looking value",
    code: "gantt\naccTitle: a %%{x}%%title b",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: gantt accDescr retains a midline directive and title-looking value",
    code: "gantt\naccDescr: a %%{x}%%title b",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: gitgraph title retains a midline directive and title-looking value",
    code: "gitGraph\ntitle a %%{x}%%title b",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: gitgraph accTitle retains a midline directive and title-looking value",
    code: "gitGraph\naccTitle: a %%{x}%%title b",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: gitgraph accDescr retains a midline directive and title-looking value",
    code: "gitGraph\naccDescr: a %%{x}%%title b",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: info title retains a midline directive and title-looking value",
    code: "info\ntitle a %%{x}%%title b",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: info accTitle retains a midline directive and title-looking value",
    code: "info\naccTitle: a %%{x}%%title b",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: info accDescr retains a midline directive and title-looking value",
    code: "info\naccDescr: a %%{x}%%title b",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: journey title retains a midline directive and title-looking value",
    code: "journey\ntitle a %%{x}%%title b",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: journey accTitle retains a midline directive and title-looking value",
    code: "journey\naccTitle: a %%{x}%%title b",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: journey accDescr retains a midline directive and title-looking value",
    code: "journey\naccDescr: a %%{x}%%title b",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: packet title retains a midline directive and title-looking value",
    code: "packet\ntitle a %%{x}%%title b",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: packet accTitle retains a midline directive and title-looking value",
    code: "packet\naccTitle: a %%{x}%%title b",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: packet accDescr retains a midline directive and title-looking value",
    code: "packet\naccDescr: a %%{x}%%title b",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: pie title retains a midline directive and title-looking value",
    code: "pie\ntitle a %%{x}%%title b",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: pie accTitle retains a midline directive and title-looking value",
    code: "pie\naccTitle: a %%{x}%%title b",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: pie accDescr retains a midline directive and title-looking value",
    code: "pie\naccDescr: a %%{x}%%title b",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: quadrant title retains a midline directive and title-looking value",
    code: "quadrantChart\ntitle a %%{x}%%title b",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: quadrant accTitle retains a midline directive and title-looking value",
    code: "quadrantChart\naccTitle: a %%{x}%%title b",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: quadrant accDescr retains a midline directive and title-looking value",
    code: "quadrantChart\naccDescr: a %%{x}%%title b",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: radar title retains a midline directive and title-looking value",
    code: "radar-beta\ntitle a %%{x}%%title b",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: radar accTitle retains a midline directive and title-looking value",
    code: "radar-beta\naccTitle: a %%{x}%%title b",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: radar accDescr retains a midline directive and title-looking value",
    code: "radar-beta\naccDescr: a %%{x}%%title b",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: railroad title retains a midline directive and title-looking value",
    code: 'railroad-beta\ntitle a %%{x}%%title b\na = terminal("x");',
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: railroad accTitle retains a midline directive and title-looking value",
    code: 'railroad-beta\naccTitle: a %%{x}%%title b\na = terminal("x");',
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: railroad accDescr retains a midline directive and title-looking value",
    code: 'railroad-beta\naccDescr: a %%{x}%%title b\na = terminal("x");',
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: requirement accTitle retains a midline directive and title-looking value",
    code: "requirementDiagram\naccTitle: a %%{x}%%title b",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: requirement accDescr retains a midline directive and title-looking value",
    code: "requirementDiagram\naccDescr: a %%{x}%%title b",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: sequence title retains a midline directive and title-looking value",
    code: "sequenceDiagram\ntitle a %%{x}%%title b",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: sequence accTitle retains a midline directive and title-looking value",
    code: "sequenceDiagram\naccTitle: a %%{x}%%title b",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: sequence accDescr retains a midline directive and title-looking value",
    code: "sequenceDiagram\naccDescr: a %%{x}%%title b",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: state accTitle retains a midline directive and title-looking value",
    code: "stateDiagram-v2\naccTitle: a %%{x}%%title b",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: state accDescr retains a midline directive and title-looking value",
    code: "stateDiagram-v2\naccDescr: a %%{x}%%title b",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: timeline title retains a midline directive and title-looking value",
    code: "timeline\ntitle a %%{x}%%title b",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: timeline accTitle retains a midline directive and title-looking value",
    code: "timeline\naccTitle: a %%{x}%%title b",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: timeline accDescr retains a midline directive and title-looking value",
    code: "timeline\naccDescr: a %%{x}%%title b",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: treemap title retains a midline directive and title-looking value",
    code: "treemap\ntitle a %%{x}%%title b",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: treemap accTitle retains a midline directive and title-looking value",
    code: "treemap\naccTitle: a %%{x}%%title b",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: treemap accDescr retains a midline directive and title-looking value",
    code: "treemap\naccDescr: a %%{x}%%title b",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: treeview title retains a midline directive and title-looking value",
    code: "treeView-beta\ntitle a %%{x}%%title b",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: treeview accTitle retains a midline directive and title-looking value",
    code: "treeView-beta\naccTitle: a %%{x}%%title b",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: treeview accDescr retains a midline directive and title-looking value",
    code: "treeView-beta\naccDescr: a %%{x}%%title b",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: usecase accTitle retains a midline directive and title-looking value",
    code: "usecase-beta\naccTitle: a %%{x}%%title b",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: usecase accDescr retains a midline directive and title-looking value",
    code: "usecase-beta\naccDescr: a %%{x}%%title b",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: venn title retains a midline directive and title-looking value",
    code: "venn-beta\ntitle a %%{x}%%title b",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: wardley title retains a midline directive and title-looking value",
    code: "wardley-beta\ntitle a %%{x}%%title b",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: wardley accTitle retains a midline directive and title-looking value",
    code: "wardley-beta\naccTitle: a %%{x}%%title b",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: wardley accDescr retains a midline directive and title-looking value",
    code: "wardley-beta\naccDescr: a %%{x}%%title b",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: xychart title starts a second statement after a directive",
    code: "xychart-beta\ntitle a %%{x}%%title b",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["a", "string.unquoted.mermaid"],
      ["b", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "follow-up: xychart accTitle retains a midline directive and title-looking value",
    code: "xychart-beta\naccTitle: a %%{x}%%title b",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: xychart accDescr retains a midline directive and title-looking value",
    code: "xychart-beta\naccDescr: a %%{x}%%title b",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["title b", "string.unquoted.mermaid"],
    ],
    absent: [["title b", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: gantt starts a title after a weekday and directive",
    code: "gantt\nweekday monday %%{x}%%title t",
    scopes: [
      ["monday", "constant.language.mermaid"],
      ["title", "keyword.control.mermaid"],
      ["t", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "follow-up: treeview reads a quoted branch name after a directive",
    code: "treeView-beta\nroot\n├── %%{x}%%\"a\"\n└── %%{x}%%'b'",
    scopes: [
      ["a", "string.quoted.double.mermaid"],
      ["b", "string.quoted.single.mermaid"],
    ],
    absent: [
      ["a", "string.unquoted.mermaid"],
      ["b", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "follow-up: class retains a directive after an attribute classifier",
    code: "classDiagram\nclass A { +f$ %%{x}%%}",
    scopes: [
      ["x", "meta.directive.mermaid"],
      ["$", "storage.modifier.mermaid"],
      ["}", "keyword.operator.block.end.mermaid"],
    ],
  },
  {
    name: "follow-up: class retains a directive after a method classifier",
    code: "classDiagram\nclass A { +f() T$ %%{x}%%}",
    scopes: [
      ["x", "meta.directive.mermaid"],
      ["T", "entity.name.type.mermaid"],
      ["$", "storage.modifier.mermaid"],
    ],
  },
  {
    name: "follow-up: class retains directives around a member annotation",
    code: "classDiagram\nclass A { %%{a}%%<<anno>> %%{b}%%}",
    scopes: [
      ["a", "meta.directive.mermaid"],
      ["b", "meta.directive.mermaid"],
      ["anno", "entity.name.type.mermaid"],
    ],
  },
  {
    name: "follow-up: eventmodeling closes block data after a directive",
    code: "eventmodeling\ndata D {\nx\n%%{x}%%}\n title t",
    scopes: [
      ["}", "keyword.operator.bracket.data.end.mermaid"],
      ["title", "keyword.control.mermaid"],
      ["t", "string.unquoted.mermaid"],
    ],
    absent: [["title", "meta.data.mermaid"]],
  },
  {
    name: "a common form follows an unclosed word directive",
    code: "pie\n%%{init: dark title t",
    scopes: [
      ["dark", "string.unquoted.directive.mermaid"],
      ["title", "keyword.control.mermaid"],
      ["t", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "a common form follows a free-text directive stopped by LS",
    code: "pie\n%%{init: {}\u2028title t",
    scopes: [
      ["{}", "string.unquoted.directive.mermaid"],
      ["title", "keyword.control.mermaid"],
    ],
  },
  {
    name: "a common form follows a free-text directive stopped by PS",
    code: "pie\n%%{init: {}\u2029title t",
    scopes: [
      ["{}", "string.unquoted.directive.mermaid"],
      ["title", "keyword.control.mermaid"],
    ],
  },
  {
    name: "follow-up: treeview decoration permits directives before after and between bars",
    code: "treeView-beta\nroot\n├── a\n│ %%{x}%%\n %%{x}%%│\n┃%%{x}%%┃\n─%%{x}%%━\n└── b",
    scopes: [
      ["│ ", "comment.block.ignored.mermaid", 3],
      ["│", "comment.block.ignored.mermaid", 4],
      ["┃", "comment.block.ignored.mermaid", 5],
      ["─", "comment.block.ignored.mermaid", 6],
      ["x", "meta.directive.mermaid", 3],
      ["x", "meta.directive.mermaid", 4],
      ["x", "meta.directive.mermaid", 5],
      ["x", "meta.directive.mermaid", 6],
    ],
    absentOnLine: [
      [3, "string.unquoted.mermaid"],
      [4, "string.unquoted.mermaid"],
      [5, "string.unquoted.mermaid"],
      [6, "string.unquoted.mermaid"],
    ],
  },
  {
    name: "class displays properties separated by commas",
    code: "classDiagram\nclass A\nstyle A bold,fill:red,stroke:blue:wide",
    scopes: [
      ["bold", "support.constant.property-value.mermaid"],
      [",", "keyword.operator.separator.comma.mermaid"],
      ["fill", "support.type.property-name.mermaid"],
      [":", "keyword.operator.separator.key-value.mermaid"],
      ["red", "support.constant.property-value.mermaid"],
      ["stroke", "support.type.property-name.mermaid"],
      ["blue:wide", "support.constant.property-value.mermaid"],
    ],
  },
  {
    name: "follow-up: class style values retain entity and ignored semicolons",
    code: "classDiagram\nclass A\nstyle A a:#b; class X\nstyle A a:#b;c;d",
    scopes: [
      ["#b; class X", "support.constant.property-value.mermaid"],
      ["#b;c;d", "support.constant.property-value.mermaid"],
    ],
    absent: [["#b; class X", "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: class style values retain description-looking text",
    code: "classDiagram\nclass A\nstyle A fill:red accDescr {}",
    scopes: [["red accDescr {}", "support.constant.property-value.mermaid"]],
    absentOnLine: [[2, "keyword.operator.delimiter.description.begin.mermaid"]],
  },
  {
    name: "follow-up: class bare styles still leave a description block",
    code: "classDiagram\nclass A\nstyle A bold accDescr {}",
    scopes: [
      ["bold", "support.constant.property-value.mermaid"],
      ["accDescr", "keyword.control.mermaid"],
      ["{", "keyword.operator.delimiter.description.begin.mermaid"],
    ],
  },
  {
    name: "class classDef displays properties separated by commas",
    code: "classDiagram\nclass A\nclassDef aa bold,fill:red,stroke:blue",
    scopes: [
      ["bold", "support.constant.property-value.mermaid"],
      [",", "keyword.operator.separator.comma.mermaid"],
      ["fill", "support.type.property-name.mermaid"],
      ["red", "support.constant.property-value.mermaid"],
      ["stroke", "support.type.property-name.mermaid"],
      ["blue", "support.constant.property-value.mermaid"],
    ],
  },
  {
    name: "treemap displays each comma-separated property",
    code: "treemap\nclassDef aa fill:red,stroke:x",
    scopes: [
      ["fill", "support.type.property-name.mermaid"],
      [":", "keyword.operator.separator.key-value.mermaid"],
      ["red", "support.constant.property-value.mermaid"],
      [",", "keyword.operator.separator.comma.mermaid"],
      ["stroke", "support.type.property-name.mermaid"],
      ["x", "support.constant.property-value.mermaid"],
    ],
  },
  {
    name: "follow-up: venn keeps a multiline RGB atom inside one style value",
    code: "venn-beta\nset A\nstyle A fill:rgb(1, 2,\n 3) red",
    scopes: [
      ["rgb(", "support.constant.property-value.mermaid"],
      ["1, 2,", "support.constant.property-value.mermaid"],
      [" 3", "support.constant.property-value.mermaid"],
      ["red", "support.constant.property-value.mermaid"],
    ],
    absentOnLine: [
      [2, "keyword.operator.separator.comma.mermaid"],
      [3, "keyword.operator.separator.comma.mermaid"],
      [3, "keyword.control.mermaid"],
    ],
  },
  {
    name: "follow-up: venn keeps a multiline RGBA atom before the next property",
    code: "venn-beta\nset A\nstyle A fill:rgba(1,2,\n3,0.5),stroke:blue",
    scopes: [
      ["rgba(", "support.constant.property-value.mermaid"],
      ["3,0.5", "support.constant.property-value.mermaid"],
      ["stroke", "support.type.property-name.mermaid"],
      ["blue", "support.constant.property-value.mermaid"],
      [",", "keyword.operator.separator.comma.mermaid", 3],
    ],
  },
  {
    name: "follow-up: usecase keeps escaped commas in style and classDef",
    code: "usecase-beta\nactor A\nstyle A font:x\\,y,fill:red\nclassDef aa font:x\\,y,fill:red",
    scopes: [
      ["x", "support.constant.property-value.mermaid"],
      ["\\,", "support.constant.property-value.mermaid"],
      ["y", "support.constant.property-value.mermaid"],
      [",", "keyword.operator.separator.comma.mermaid"],
    ],
    absent: [["\\,", "keyword.operator.separator.comma.mermaid"]],
  },
  {
    name: "follow-up: flowchart keeps the classDef-only escaped comma distinction",
    code: "flowchart TD\nA-->B\nclassDef aa bold\\,wide,fill:red\nstyle A bold\\,wide\nlinkStyle 0 bold\\,wide",
    scopes: [
      ["\\,", "support.constant.property-value.mermaid", 2],
      [",", "keyword.operator.separator.comma.mermaid", 3],
      [",", "keyword.operator.separator.comma.mermaid", 4],
    ],
    absent: [["\\,", "keyword.operator.separator.comma.mermaid", 2]],
  },
  {
    name: "follow-up: agentflow keeps the classDef-only escaped comma distinction",
    code: "agentflow-beta\nA-->B\nclassDef aa bold\\,wide,fill:red\nstyle A bold\\,wide\nlinkStyle 0 bold\\,wide",
    scopes: [
      ["\\,", "support.constant.property-value.mermaid", 2],
      [",", "keyword.operator.separator.comma.mermaid", 3],
      [",", "keyword.operator.separator.comma.mermaid", 4],
    ],
    absent: [["\\,", "keyword.operator.separator.comma.mermaid", 2]],
  },
  {
    name: "follow-up: a word argument after a blank line",
    code: "pie\n%%{wrap\n\nclear\ntitle t",
    scopes: [
      ["clear", "string.unquoted.directive.mermaid"],
      ["title", "keyword.control.mermaid"],
    ],
    absent: [["title", "meta.directive.mermaid"]],
  },
  {
    name: "follow-up: a colon on a later line",
    code: "pie\n%%{init\n: dark\n}%%\ntitle t",
    scopes: [
      ["dark", "string.unquoted.directive.mermaid"],
      ["title", "keyword.control.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
    ],
    absent: [["title", "meta.directive.mermaid"]],
  },
  {
    name: "follow-up: a second colon starts free text",
    code: "pie\n%%{init:\n:x}%%\ntitle t",
    scopes: [
      [":x", "string.unquoted.directive.mermaid"],
      ["title", "keyword.control.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
    ],
    absent: [["title", "meta.directive.mermaid"]],
  },
  {
    name: "follow-up: an indented word closes before the next statement",
    code: "pie\n%%{init:\n  dark\n}%%\ntitle t",
    scopes: [
      ["dark", "string.unquoted.directive.mermaid"],
      ["title", "keyword.control.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
    ],
    absent: [["title", "meta.directive.mermaid"]],
  },
  {
    name: "follow-up: a same-line word keeps its later closer",
    code: "pie\n%%{init: dark\n}%%\ntitle t",
    scopes: [
      ["dark", "string.unquoted.directive.mermaid"],
      ["title", "keyword.control.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
    ],
    absent: [["title", "meta.directive.mermaid"]],
  },
  {
    name: "follow-up: a next-line vertex word is the argument",
    code: "flowchart LR\nStart\n%%{wrap\nA-->B",
    scopes: [
      ["A", "string.unquoted.directive.mermaid"],
      ["B", "variable.mermaid"],
    ],
    absent: [["B", "meta.directive.mermaid"]],
  },
  {
    name: "follow-up: a provisional opener reads its next-line name",
    code: 'pie\n%%{\n  init: {"theme": "dark"}\n}%%\ntitle t',
    scopes: [
      ["init", "entity.name.function.directive.mermaid"],
      ['{"theme": "dark"}', "string.unquoted.directive.mermaid"],
      ["title", "keyword.control.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
    ],
    absent: [["title", "meta.directive.mermaid"]],
  },
  {
    name: "follow-up: a three-line init keeps free text",
    code: 'flowchart LR\n%%{init: {\n"theme": "dark"\n}}%%\nA-->B',
    scopes: [
      ['"theme": "dark"', "string.unquoted.directive.mermaid"],
      ["A", "variable.mermaid"],
    ],
    absent: [["B", "meta.directive.mermaid"]],
  },
  {
    name: "follow-up: a same-line word leaves the next line as body",
    code: "flowchart TD\n%%{init: dark\nx",
    scopes: [
      ["dark", "string.unquoted.directive.mermaid"],
      ["x", "variable.mermaid"],
    ],
    absent: [["x", "meta.directive.mermaid"]],
  },
  {
    name: "follow-up: a provisional opener works before the header",
    code: '%%{\n  init: {"theme": "dark"}\n}%%\npie\ntitle t',
    scopes: [
      ["init", "entity.name.function.directive.mermaid"],
      ["pie", "keyword.control.mermaid"],
      ["title", "keyword.control.mermaid"],
    ],
  },
  {
    name: "follow-up: a provisional opener ends before a non-word body line",
    code: 'pie\n%%{\n"x":1',
    scopes: [
      ["%%{", "keyword.operator.delimiter.directive.begin.mermaid"],
      ["x", "string.quoted.double.mermaid"],
    ],
    absent: [["x", "meta.directive.mermaid"]],
  },
  {
    name: "follow-up: a free-text LS stop leaves a next-line closer outside its scope",
    code: "pie\n%%{init: {}\u2028\n}%%\ntitle t",
    scopes: [
      ["{}", "string.unquoted.directive.mermaid"],
      ["title", "keyword.control.mermaid"],
    ],
    absentOnLine: [[2, "keyword.operator.delimiter.directive.end.mermaid"]],
  },
  {
    name: "follow-up: a free-text PS stop leaves a next-line closer outside its scope",
    code: "pie\n%%{init: {}\u2029\n}%%\ntitle t",
    scopes: [
      ["{}", "string.unquoted.directive.mermaid"],
      ["title", "keyword.control.mermaid"],
    ],
    absentOnLine: [[2, "keyword.operator.delimiter.directive.end.mermaid"]],
  },
  {
    name: "kanban data entries keep distinct scopes",
    code: 'kanban\nA\n b[y]@{ assigned: "k" }',
    scopes: [
      ["@{", "meta.data.mermaid"],
      ["assigned", "support.type.property-name.mermaid"],
      [":", "keyword.operator.separator.key-value.mermaid"],
      ["k", "string.quoted.double.mermaid"],
      ["}", "keyword.operator.bracket.data.end.mermaid"],
    ],
  },
  {
    name: "flowchart data entries keep distinct scopes",
    code: 'flowchart TD\nA@{ assigned: "k" }',
    scopes: [
      ["@{", "meta.data.mermaid"],
      ["assigned", "support.type.property-name.mermaid"],
      [":", "keyword.operator.separator.key-value.mermaid"],
      ["k", "string.quoted.double.mermaid"],
      ["}", "keyword.operator.bracket.data.end.mermaid"],
    ],
  },
  {
    name: "agentflow data entries keep distinct scopes",
    code: 'agentflow-beta\nA@{ assigned: "k" }',
    scopes: [
      ["@{", "meta.data.mermaid"],
      ["assigned", "support.type.property-name.mermaid"],
      [":", "keyword.operator.separator.key-value.mermaid"],
      ["k", "string.quoted.double.mermaid"],
      ["}", "keyword.operator.bracket.data.end.mermaid"],
    ],
  },
  {
    name: "sequence data entries keep distinct scopes",
    code: 'sequenceDiagram\nparticipant A@{ assigned: "k" }',
    scopes: [
      ["@{", "meta.data.mermaid"],
      ["assigned", "support.type.property-name.mermaid"],
      [":", "keyword.operator.separator.key-value.mermaid"],
      ["k", "string.quoted.double.mermaid"],
      ["}", "keyword.operator.bracket.data.end.mermaid"],
    ],
  },
  {
    name: "usecase data entries keep distinct scopes",
    code: 'usecase-beta\njson J @ {"assigned": {"name": "k}"}}',
    scopes: [
      ["{", "meta.data.mermaid"],
      ['"assigned"', "support.type.property-name.mermaid"],
      ['"name"', "support.type.property-name.mermaid"],
      [":", "keyword.operator.separator.key-value.mermaid"],
      ["k}", "string.quoted.double.mermaid"],
      ["}", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "eventmodeling data entries keep distinct scopes",
    code: 'eventmodeling\ntf 01 evt A {"assigned": {"name": "k}"}}',
    scopes: [
      ["{", "meta.data.mermaid"],
      ['"assigned"', "support.type.property-name.mermaid"],
      ['"name"', "support.type.property-name.mermaid"],
      [":", "keyword.operator.separator.key-value.mermaid"],
      ["k}", "string.quoted.double.mermaid"],
      ["}", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "follow-up: usecase JSON at remains its own unit",
    code: 'usecase-beta\njson J @ {"a": 1}',
    scopes: [
      ["@", "keyword.operator.separator.at.mermaid"],
      ["@", "meta.data.mermaid"],
    ],
  },
  {
    name: "follow-up: eventmodeling quoted inline values remain strings",
    code: 'eventmodeling\ntf 01 evt A "double"\ntf 02 evt B \'single\'\ntf 03 evt C {"k":"v"}',
    scopes: [
      ["double", "string.quoted.double.mermaid"],
      ["single", "string.quoted.single.mermaid"],
      ['"k"', "support.type.property-name.mermaid"],
      [":", "keyword.operator.separator.key-value.mermaid"],
      ["v", "string.quoted.double.mermaid"],
      ["{", "meta.data.mermaid"],
    ],
    absent: [
      ["double", "meta.data.mermaid"],
      ["single", "meta.data.mermaid"],
    ],
  },
  {
    name: "follow-up: a directive separator is a colon after its name",
    code: "pie\n%%{init: dark}%%\ntitle t",
    scopes: [
      [":", "keyword.operator.separator.colon.mermaid"],
      ["dark", "string.unquoted.directive.mermaid"],
    ],
    absent: [[":", "keyword.operator.separator.key-value.mermaid"]],
  },
  {
    name: "follow-up: venn recognizes multiline RGB after other value atoms",
    code: "venn-beta\nset A\nstyle A fill:red rgb(1,2,\n3),stroke:blue\nstyle A fill:1 rgba(1,2,\n3,0.5)",
    scopes: [
      ["red", "support.constant.property-value.mermaid"],
      ["rgb(", "support.constant.property-value.mermaid"],
      ["3", "support.constant.property-value.mermaid", 3],
      ["stroke", "support.type.property-name.mermaid"],
      ["rgba(", "support.constant.property-value.mermaid"],
      ["3,0.5", "support.constant.property-value.mermaid", 5],
    ],
    absentOnLine: [
      [2, "keyword.operator.separator.comma.mermaid"],
      [5, "constant.numeric.mermaid"],
    ],
  },
  {
    name: "follow-up: pending colon and closer cross blank lines",
    code: "pie\n%%{init\n\n: dark\n\n}%%\ntitle t",
    scopes: [
      [":", "keyword.operator.separator.colon.mermaid"],
      ["dark", "string.unquoted.directive.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
      ["title", "keyword.control.mermaid"],
    ],
    absent: [["title", "meta.directive.mermaid"]],
  },
  {
    name: "follow-up: word argument whitespace retains a closer after blank lines",
    code: "pie\n%%{init: dark\n\n\n}%%\ntitle t",
    scopes: [
      ["dark", "string.unquoted.directive.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
      ["title", "keyword.control.mermaid"],
    ],
    absent: [["title", "meta.directive.mermaid"]],
  },
  {
    name: "treeview unselected semicolon leaves a title-shaped node",
    code: "treeView-beta\n├── accTitle;: style:#x\n└── next",
    scopes: [[" accTitle;: style:#x", "string.unquoted.mermaid"]],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "treeview unselected semicolon leaves a description-shaped node",
    code: "treeView-beta\n├── accDescr;{style:#x}\n└── next",
    scopes: [[" accDescr;{style:#x}", "string.unquoted.mermaid"]],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "redo: agentflow terminal class block keeps a directive gap",
    code: "agentflow-beta\nclass A c:%%{wrap}%%accDescr {}",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["c:", "variable.mermaid"],
      ["%%{", "meta.directive.mermaid"],
    ],
  },
  {
    name: "redo: agentflow terminal vertex block before a separator",
    code: "agentflow-beta\nA accDescr {};B",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      [";", "keyword.operator.separator.statement.mermaid"],
      ["B", "variable.mermaid"],
    ],
  },
  {
    name: "redo: agentflow terminal data block before an empty description",
    code: "agentflow-beta\nA@{label:x}accDescr {}",
    scopes: [["accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "redo: agentflow terminal description after a blank line",
    code: "agentflow-beta\nA\n\naccDescr {}",
    scopes: [["accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "redo: agentflow terminal empty description contains a line separator",
    code: "agentflow-beta\nA accDescr {\u2028}",
    scopes: [["accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "redo: quadrant terminal class style block after a directive",
    code: "quadrantChart\nclassDef c color:#fff %%{wrap}%%accDescr {}",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["#fff", "support.constant.property-value.mermaid"],
    ],
  },
  {
    name: "redo: quadrant terminal point block before a separator",
    code: "quadrantChart\nA: [0.1,0.2] accDescr {};quadrant-1 Q",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      [";", "keyword.operator.separator.semicolon.mermaid"],
    ],
  },
  {
    name: "redo: quadrant terminal empty block contains a comment",
    code: "quadrantChart\nquadrant-1 Q accDescr {\n%% c\n}",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["%% c", "comment.line.percentage.mermaid"],
    ],
  },
  {
    name: "redo: quadrant terminal empty block follows a blank line",
    code: "quadrantChart\nx-axis L --> R\n\naccDescr {}",
    scopes: [["accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "redo: quadrant terminal empty block contains a line separator",
    code: "quadrantChart\nA: [0.1,0.2] accDescr {\u2028}",
    scopes: [["accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "redo: quadrant accessibility text owns a block-shaped suffix",
    code: "quadrantChart\naccTitle: T accDescr {}",
    scopes: [["T accDescr {}", "string.unquoted.mermaid"]],
    absentOnLine: [[1, "keyword.operator.delimiter.description.begin.mermaid"]],
  },
  {
    name: "redo: requirement terminal quoted target block after a directive",
    code: 'requirementDiagram\na - satisfies -> "b"%%{wrap}%%accDescr {}',
    scopes: [["accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "redo: requirement terminal block contains a comment",
    code: 'requirementDiagram\nr:::"c" accDescr {\n%% c\n}',
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["%% c", "comment.line.percentage.mermaid"],
    ],
  },
  {
    name: "redo: requirement terminal block follows a blank line",
    code: 'requirementDiagram\na - satisfies -> "b"\n\naccDescr {}',
    scopes: [["accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "redo: requirement terminal block contains a line separator",
    code: 'requirementDiagram\nr:::"c" accDescr {\u2028}',
    scopes: [["accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "redo: requirement accessibility value owns a block-shaped suffix",
    code: "requirementDiagram\naccTitle: T accDescr {}",
    scopes: [["T accDescr {}", "string.unquoted.mermaid"]],
    absentOnLine: [[1, "keyword.operator.delimiter.description.begin.mermaid"]],
  },
  {
    name: "redo: requirement direction value owns a block-shaped suffix",
    code: "requirementDiagram\ndirection LR accDescr {}",
    scopes: [[" accDescr {}", "comment.block.ignored.mermaid"]],
    absentOnLine: [[1, "keyword.operator.delimiter.description.begin.mermaid"]],
  },
  {
    name: "redo: requirement unquoted definition name owns a description-shaped suffix",
    code: "requirementDiagram\nrequirement r accDescr {\nid: 1\n}",
    scopes: [["r accDescr ", "variable.mermaid"]],
    absentOnLine: [[1, "keyword.operator.delimiter.description.begin.mermaid"]],
  },
  {
    name: "redo: requirement unquoted field value owns the description word",
    code: "requirementDiagram\nrequirement r {\nid: 1 accDescr\n}",
    scopes: [["1 accDescr", "string.unquoted.mermaid"]],
    absent: [["1 accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "redo: requirement body empty block remains ignored",
    code: "requirementDiagram\nrequirement r {\naccDescr {}\nid: 1\n}",
    scopes: [["accDescr {", "comment.block.ignored.mermaid"]],
    absentOnLine: [[2, "keyword.control.mermaid"]],
  },
  {
    name: "redo: agentflow terminal block before a preserved native comment",
    code: "agentflow-beta\nA accDescr {} %% c\nB",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["%% c", "comment.line.percentage.mermaid"],
    ],
  },
  {
    name: "line-final: treemap header description before a next-line brace",
    code: "treemap accDescr\n{ D }",
    scopes: [["accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: treemap padded header description before a next-line brace",
    code: "treemap   accDescr  \n{ D }",
    scopes: [["accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: treemap indented description before a next-line brace",
    code: "treemap\n  accDescr\n{ D }",
    scopes: [["accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: treemap line-final description before a trailing directive",
    code: "treemap accDescr%%{wrap}%%\n{ D }",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["wrap", "entity.name.function.directive.mermaid"],
    ],
  },
  {
    name: "line-final: treemap header description before a comment gap",
    code: "treemap accDescr\n%% c\n{ D }",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["%% c", "comment.line.percentage.mermaid"],
    ],
  },
  {
    name: "line-final: treemap header description before a blank gap",
    code: "treemap accDescr\n\n{ D }",
    scopes: [["accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: treemap header description before a line separator gap",
    code: "treemap accDescr\u2028\n{ D }",
    scopes: [["accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: eventmodeling header description before a next-line brace",
    code: "eventmodeling accDescr\n{ D }",
    scopes: [["accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: eventmodeling padded header description before a next-line brace",
    code: "eventmodeling   accDescr  \n{ D }",
    scopes: [["accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: eventmodeling line-final description before a trailing directive",
    code: "eventmodeling accDescr%%{wrap}%%\n{ D }",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["wrap", "entity.name.function.directive.mermaid"],
    ],
  },
  {
    name: "line-final: eventmodeling header description after a leading comment",
    code: "%% c\neventmodeling accDescr\n{ D }",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["%% c", "comment.line.percentage.mermaid"],
    ],
  },
  {
    name: "line-final: eventmodeling header description before a line separator gap",
    code: "eventmodeling accDescr\u2028\n{ D }",
    scopes: [["accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: sequence header description before a next-line brace",
    code: "sequenceDiagram accDescr\n{ D }",
    scopes: [["accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: sequence header description before a directive and brace",
    code: "sequenceDiagram accDescr%%{wrap}%%\n{ D }",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["wrap", "entity.name.function.directive.mermaid"],
    ],
  },
  {
    name: "line-final: sequence header description before a comment and brace",
    code: "sequenceDiagram accDescr\n%% c\n{ D }",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["%% c", "comment.line.percentage.mermaid"],
    ],
  },
  {
    name: "line-final: sequence header description before a blank line and brace",
    code: "sequenceDiagram accDescr\n\n{ D }",
    scopes: [["accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: sequence header description before a line separator and brace",
    code: "sequenceDiagram accDescr\u2028\n{ D }",
    scopes: [["accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: sequence header accessibility title before a next-line colon",
    code: "sequenceDiagram accTitle\n: D",
    scopes: [["accTitle", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: sequence header accessibility title before a directive and colon",
    code: "sequenceDiagram accTitle%%{wrap}%%\n: D",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      ["wrap", "entity.name.function.directive.mermaid"],
    ],
  },
  {
    name: "line-final: sequence header accessibility title before a comment and colon",
    code: "sequenceDiagram accTitle\n%% c\n: D",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      ["%% c", "comment.line.percentage.mermaid"],
    ],
  },
  {
    name: "line-final: sequence header accessibility title before a blank line and colon",
    code: "sequenceDiagram accTitle\n\n: D",
    scopes: [["accTitle", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: sequence header accessibility title before a line separator and colon",
    code: "sequenceDiagram accTitle\u2028\n: D",
    scopes: [["accTitle", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: sequence header accessibility description before a next-line colon",
    code: "sequenceDiagram accDescr\n: D",
    scopes: [["accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: sequence header accessibility description before a directive and colon",
    code: "sequenceDiagram accDescr%%{wrap}%%\n: D",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["wrap", "entity.name.function.directive.mermaid"],
    ],
  },
  {
    name: "line-final: sequence header accessibility description before a comment and colon",
    code: "sequenceDiagram accDescr\n%% c\n: D",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["%% c", "comment.line.percentage.mermaid"],
    ],
  },
  {
    name: "line-final: sequence header accessibility description before a blank line and colon",
    code: "sequenceDiagram accDescr\n\n: D",
    scopes: [["accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: sequence header accessibility description before a line separator and colon",
    code: "sequenceDiagram accDescr\u2028\n: D",
    scopes: [["accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: sequence padded header accessibility title keeps case folding",
    code: "sequenceDiagram   AcCtItLe  \n: D",
    scopes: [["AcCtItLe", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: sequence header title before a next-line value",
    code: "sequenceDiagram title\nD",
    scopes: [["title", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: class description word can be a name",
    code: "classDiagram\naccDescr\nA",
    scopes: [["accDescr", "variable.mermaid"]],
    absent: [["accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: class accessibility title word can be a name",
    code: "classDiagram\naccTitle\nA",
    scopes: [["accTitle", "variable.mermaid"]],
    absent: [["accTitle", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: er description word can be a name",
    code: "erDiagram\naccDescr\nA",
    scopes: [["accDescr", "variable.mermaid"]],
    absent: [["accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: er accessibility title word can be a name",
    code: "erDiagram\naccTitle\nA",
    scopes: [["accTitle", "variable.mermaid"]],
    absent: [["accTitle", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: flowchart description word can be an id",
    code: "flowchart LR\naccDescr\nA",
    scopes: [["accDescr", "variable.mermaid"]],
    absent: [["accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: flowchart accessibility title word can be an id",
    code: "flowchart LR\naccTitle\nA",
    scopes: [["accTitle", "variable.mermaid"]],
    absent: [["accTitle", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: agentflow description word can be an id",
    code: "agentflow-beta TB\naccDescr\nA",
    scopes: [["accDescr", "variable.mermaid"]],
    absent: [["accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: agentflow accessibility title word can be an id",
    code: "agentflow-beta TB\naccTitle\nA",
    scopes: [["accTitle", "variable.mermaid"]],
    absent: [["accTitle", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: state description word can be a state reference",
    code: "stateDiagram-v2\naccDescr\nA",
    scopes: [["accDescr", "variable.mermaid"]],
    absent: [["accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: state accessibility title word can be a state reference",
    code: "stateDiagram-v2\naccTitle\nA",
    scopes: [["accTitle", "variable.mermaid"]],
    absent: [["accTitle", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: railroad description word can name a rule",
    code: 'railroad-beta\naccDescr\n= terminal("a");',
    scopes: [["accDescr", "variable.mermaid"]],
    absent: [["accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: timeline title word can be a period before a blank line",
    code: "timeline\n  title\n\nT",
    scopes: [["title", "string.unquoted.mermaid"]],
    absent: [["title", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: timeline accessibility title word can be a period",
    code: "timeline\naccTitle\nT",
    scopes: [["accTitle", "string.unquoted.mermaid"]],
    absent: [["accTitle", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: treeview description word can name a node",
    code: "treeView-beta\naccDescr\nnode",
    scopes: [["accDescr", "string.unquoted.mermaid"]],
    absent: [["accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: treeview prefixed description word can name a node",
    code: "treeView-beta\n├── accDescr\n└── node",
    scopes: [[" accDescr", "string.unquoted.mermaid"]],
    absent: [[" accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: eventmodeling header entity name stays an identifier",
    code: "eventmodeling entity accDescr",
    scopes: [["accDescr", "variable.mermaid"]],
    absent: [["accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: eventmodeling next-line entity name stays an identifier",
    code: "eventmodeling entity\n  accDescr",
    scopes: [["accDescr", "variable.mermaid"]],
    absent: [["accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: treemap class name stays an identifier",
    code: "treemap\nclassDef accDescr fill:red",
    scopes: [["accDescr", "variable.mermaid"]],
    absent: [["accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: sequence description interior keeps the accessibility word as text",
    code: "sequenceDiagram\naccDescr {D\naccTitle\n}",
    scopes: [["accTitle", "string.unquoted.mermaid"]],
    absent: [["accTitle", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: corpus treemap/common-block-newline-gap",
    code: "treemap\naccDescr\n{ D }",
    scopes: [["accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: corpus treemap/common-block-comment-gap",
    code: "treemap\naccDescr\n%% comment\n{ D }",
    scopes: [["accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: corpus treemap/common-block-directive-gap",
    code: "treemap\naccDescr\n%%{init: {}}%%\n{ D }",
    scopes: [["accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: corpus eventmodeling/common-description-directive-gap",
    code: "eventmodeling accDescr\n%%{x}%%\n{ D }\n",
    scopes: [["accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: corpus eventmodeling/common-description-empty-gap",
    code: "eventmodeling accDescr\n\n{ D }\n",
    scopes: [["accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: treemap class name on a later line stays an identifier",
    code: 'treemap\nclassDef\naccDescr\nfill:red\n"A":1',
    scopes: [
      ["accDescr", "variable.mermaid"],
      ["fill", "support.type.property-name.mermaid"],
    ],
    absent: [["accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: treemap style on a later line stays text",
    code: 'treemap\nclassDef aa\naccDescr\n"A":1',
    scopes: [["accDescr", "string.unquoted.mermaid"]],
    absent: [["accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: treemap class style after blank and comment lines stays contextual",
    code: 'treemap\nclassDef aa\n\n%% comment\nfill:red\n"A":1',
    scopes: [
      ["%% comment", "comment.line.percentage.mermaid"],
      ["fill", "support.type.property-name.mermaid"],
      ["red", "support.constant.property-value.mermaid"],
    ],
  },
  {
    name: "line-final: treemap class style after a directive stays text",
    code: 'treemap\nclassDef aa\n%%{x}%%\naccDescr\n"A":1',
    scopes: [
      ["x", "entity.name.function.directive.mermaid"],
      ["accDescr", "string.unquoted.mermaid"],
    ],
    absent: [["accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: treemap class name after a directive stays an identifier",
    code: 'treemap\nclassDef\n%%{x}%%accDescr\nfill:red\n"A":1',
    scopes: [
      ["accDescr", "variable.mermaid"],
      ["x", "entity.name.function.directive.mermaid"],
    ],
    absent: [["accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: treemap description follows a completed class definition",
    code: "treemap\nclassDef aa;accDescr\n{D}",
    scopes: [["accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: treemap indented class name stays an identifier",
    code: 'treemap\nclassDef\n  accDescr\nfill:red\n"A":1',
    scopes: [["accDescr", "variable.mermaid"]],
    absent: [["accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: treemap next-line selector name stays an identifier",
    code: 'treemap\n"A":::\naccDescr\n"B":1',
    scopes: [
      [":::", "keyword.operator.separator.class.mermaid"],
      ["accDescr", "variable.mermaid"],
    ],
    absent: [["accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "line-final: treemap next-line selector name after a directive stays an identifier",
    code: 'treemap\n"A":::\n%%{x}%%accDescr\n"B":1',
    scopes: [
      [":::", "keyword.operator.separator.class.mermaid"],
      ["x", "entity.name.function.directive.mermaid"],
      ["accDescr", "variable.mermaid"],
    ],
    absent: [["accDescr", "keyword.control.mermaid"]],
  },
  {
    name: "directive end: quadrant accessibility title after written closer",
    code: "quadrantChart\n%%{init: dark}%% accTitle: t",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      ["dark", "string.unquoted.directive.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
    ],
  },
  {
    name: "directive end: quadrant description after written closer",
    code: "quadrantChart\n%%{init: dark}%% accDescr: t",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["dark", "string.unquoted.directive.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
    ],
  },
  {
    name: "directive end: requirement accessibility title after written closer",
    code: "requirementDiagram\n%%{init: dark}%% accTitle: t",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      ["dark", "string.unquoted.directive.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
    ],
  },
  {
    name: "directive end: requirement description after written closer",
    code: "requirementDiagram\n%%{init: dark}%% accDescr: t",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["dark", "string.unquoted.directive.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
    ],
  },
  {
    name: "directive end: wardley title after written closer",
    code: "wardley-beta\n%%{init: dark}%% title t",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["dark", "string.unquoted.directive.mermaid"],
      ["t", "string.unquoted.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
    ],
  },
  {
    name: "directive end: wardley accessibility title after written closer",
    code: "wardley-beta\n%%{init: dark}%% accTitle: t",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      ["dark", "string.unquoted.directive.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
    ],
  },
  {
    name: "directive end: wardley description after written closer",
    code: "wardley-beta\n%%{init: dark}%% accDescr: t",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["dark", "string.unquoted.directive.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
    ],
  },
  {
    name: "directive end: wardley description block after written closer",
    code: "wardley-beta\n%%{init: dark}%% accDescr {t}",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["dark", "string.unquoted.directive.mermaid"],
      ["t", "string.unquoted.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
    ],
  },
  {
    name: "directive end: treeview title after written closer",
    code: "treeView-beta\n%%{init: dark}%% title t",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["dark", "string.unquoted.directive.mermaid"],
      ["t", "string.unquoted.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
    ],
  },
  {
    name: "directive end: treeview accessibility title after written closer",
    code: "treeView-beta\n%%{init: dark}%% accTitle: t",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      ["dark", "string.unquoted.directive.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
    ],
  },
  {
    name: "directive end: treeview description after written closer",
    code: "treeView-beta\n%%{init: dark}%% accDescr: t",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["dark", "string.unquoted.directive.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
    ],
  },
  {
    name: "directive end: treeview description block after written closer",
    code: "treeView-beta\n%%{init: dark}%% accDescr {t}",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      ["dark", "string.unquoted.directive.mermaid"],
      ["t", "string.unquoted.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
    ],
  },
  {
    name: "directive end: quadrant continuing value after written closer",
    code: "quadrantChart\naccTitle: a %%{init: dark}%% accDescr: b",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      ["dark", "string.unquoted.directive.mermaid"],
      [" accDescr: b", "string.unquoted.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
    ],
    absent: [[" accDescr: b", "keyword.control.mermaid"]],
  },
  {
    name: "directive end: requirement continuing value after written closer",
    code: "requirementDiagram\naccTitle: a %%{init: dark}%% accDescr: b",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      ["dark", "string.unquoted.directive.mermaid"],
      [" accDescr: b", "string.unquoted.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
    ],
    absent: [[" accDescr: b", "keyword.control.mermaid"]],
  },
  {
    name: "directive end: wardley continuing value after written closer",
    code: "wardley-beta\ntitle a %%{init: dark}%% title b",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["dark", "string.unquoted.directive.mermaid"],
      [" title b", "string.unquoted.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
    ],
    absent: [[" title b", "keyword.control.mermaid"]],
  },
  {
    name: "directive end: treeview continuing value after written closer",
    code: "treeView-beta\ntitle a %%{init: dark}%% title b",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["dark", "string.unquoted.directive.mermaid"],
      [" title b", "string.unquoted.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
    ],
    absent: [[" title b", "keyword.control.mermaid"]],
  },
  {
    name: "directive end: quadrant comment after written closer",
    code: "quadrantChart\n%%{init: dark}%% accTitle: t\n%% c",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      ["dark", "string.unquoted.directive.mermaid"],
      ["t", "string.unquoted.mermaid"],
      ["%% c", "comment.line.percentage.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
    ],
  },
  {
    name: "directive end: requirement comment after written closer",
    code: "requirementDiagram\n%%{init: dark}%% accTitle: t\n%% c",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      ["dark", "string.unquoted.directive.mermaid"],
      ["t", "string.unquoted.mermaid"],
      ["%% c", "comment.line.percentage.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
    ],
  },
  {
    name: "directive end: wardley comment after written closer",
    code: "wardley-beta\n%%{init: dark}%% title t\n%% c",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["dark", "string.unquoted.directive.mermaid"],
      ["t", "string.unquoted.mermaid"],
      ["%% c", "comment.line.percentage.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
    ],
  },
  {
    name: "directive end: treeview comment after written closer",
    code: "treeView-beta\n%%{init: dark}%% title t\n%% c",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["dark", "string.unquoted.directive.mermaid"],
      ["t", "string.unquoted.mermaid"],
      ["%% c", "comment.line.percentage.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
    ],
  },
  {
    name: "directive end: quadrant semicolon after written closer",
    code: "quadrantChart\n%%{init: dark}%% accTitle: t;u",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      ["dark", "string.unquoted.directive.mermaid"],
      ["t;u", "string.unquoted.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
    ],
  },
  {
    name: "directive end: requirement semicolon after written closer",
    code: "requirementDiagram\n%%{init: dark}%% accTitle: t;u",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      ["dark", "string.unquoted.directive.mermaid"],
      ["t;u", "string.unquoted.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
    ],
  },
  {
    name: "directive end: wardley semicolon after written closer",
    code: "wardley-beta\n%%{init: dark}%% title t;u",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["dark", "string.unquoted.directive.mermaid"],
      ["t;u", "string.unquoted.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
    ],
  },
  {
    name: "directive end: treeview semicolon after written closer",
    code: "treeView-beta\n%%{init: dark}%% title t;u",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["dark", "string.unquoted.directive.mermaid"],
      ["t;u", "string.unquoted.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
    ],
  },
  {
    name: "directive end: quadrant line separator after written closer",
    code: "quadrantChart\n%%{init: dark\u2028}%%accTitle: t",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      ["dark", "string.unquoted.directive.mermaid"],
      ["t", "string.unquoted.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
    ],
  },
  {
    name: "directive end: requirement line separator after written closer",
    code: "requirementDiagram\n%%{init: dark\u2028}%%accTitle: t",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      ["dark", "string.unquoted.directive.mermaid"],
      ["t", "string.unquoted.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
    ],
  },
  {
    name: "directive end: wardley line separator after written closer",
    code: "wardley-beta\n%%{init: dark\u2028}%%title t",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["dark", "string.unquoted.directive.mermaid"],
      ["t", "string.unquoted.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
    ],
  },
  {
    name: "directive end: treeview line separator after written closer",
    code: "treeView-beta\n%%{init: dark\u2028}%%title t",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["dark", "string.unquoted.directive.mermaid"],
      ["t", "string.unquoted.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
    ],
  },
  {
    name: "directive end: quadrant colonless directive after written closer",
    code: "quadrantChart\n%%{init dark}%% accTitle: t",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      ["dark", "string.unquoted.directive.mermaid"],
      ["t", "string.unquoted.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
    ],
  },
  {
    name: "directive end: requirement colonless directive after written closer",
    code: "requirementDiagram\n%%{init dark}%% accTitle: t",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      ["dark", "string.unquoted.directive.mermaid"],
      ["t", "string.unquoted.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
    ],
  },
  {
    name: "directive end: wardley colonless directive after written closer",
    code: "wardley-beta\n%%{init dark}%% title t",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["dark", "string.unquoted.directive.mermaid"],
      ["t", "string.unquoted.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
    ],
  },
  {
    name: "directive end: treeview colonless directive after written closer",
    code: "treeView-beta\n%%{init dark}%% title t",
    scopes: [
      ["title", "keyword.control.mermaid"],
      ["dark", "string.unquoted.directive.mermaid"],
      ["t", "string.unquoted.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
    ],
  },
  {
    name: "directive end: a treeview string retains its suffix with written closer",
    code: 'treeView-beta\n"a %%{init: dark}%% title b"',
    scopes: [
      [" title b", "string.quoted.double.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
    ],
    absent: [[" title b", "keyword.control.mermaid"]],
  },
  {
    name: "directive end: a flowchart label retains its suffix with written closer",
    code: "flowchart TD\nA[a %%{init: dark}%% title b]",
    scopes: [
      [" title b", "string.unquoted.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
    ],
    absent: [[" title b", "keyword.control.mermaid"]],
  },
  {
    name: "directive end: a flowchart quoted label retains its suffix with written closer",
    code: 'flowchart TD\nA["a %%{init: dark}%% title b"]',
    scopes: [
      [" title b", "string.quoted.double.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
    ],
    absent: [[" title b", "keyword.control.mermaid"]],
  },
  {
    name: "directive end: a comment retains its suffix with written closer",
    code: "treeView-beta\n%% c %%{init: dark}%% title b\nroot",
    scopes: [
      ["%% c %%{init: dark}%% title b", "comment.line.percentage.mermaid"],
    ],
    absent: [
      ["%% c %%{init: dark}%% title b", "keyword.control.mermaid"],
      ["%% c %%{init: dark}%% title b", "meta.directive.mermaid"],
    ],
  },
  {
    name: "directive end: a description block retains its suffix with written closer",
    code: "requirementDiagram\naccDescr {a %%{init: dark}%% accTitle: b}",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      [" accTitle: b", "string.unquoted.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
    ],
    absent: [[" accTitle: b", "keyword.control.mermaid"]],
  },
  {
    name: "directive end: a directive argument can be title with written closer",
    code: "treeView-beta\n%%{wrap title}%% t",
    scopes: [
      ["title", "string.unquoted.directive.mermaid"],
      [" t", "string.unquoted.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
    ],
    absent: [["title", "keyword.control.mermaid"]],
  },
  {
    name: "directive end: a word argument is not split before title with written closer",
    code: "treeView-beta\n%%{init: darktitle}%%\nroot",
    scopes: [
      ["darktitle", "string.unquoted.directive.mermaid"],
      ["root", "string.unquoted.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
    ],
    absent: [["darktitle", "keyword.control.mermaid"]],
  },
  {
    name: "directive end: a directive name is not split before title with written closer",
    code: "treeView-beta\n%%{wraptitle t}%%\nroot",
    scopes: [
      ["wraptitle", "entity.name.function.directive.mermaid"],
      ["t", "string.unquoted.directive.mermaid"],
      ["root", "string.unquoted.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
    ],
    absent: [["wraptitle", "keyword.control.mermaid"]],
  },
  {
    name: "directive end: a quote can follow a word argument directly with written closer",
    code: 'treeView-beta\n%%{init: dark}%%"node"',
    scopes: [
      ["dark", "string.unquoted.directive.mermaid"],
      ["node", "string.quoted.double.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
    ],
  },
  {
    name: "directive end: a directive can follow a word argument directly with written closer",
    code: "treeView-beta\n%%{init: dark}%%%%{wrap: light}%% title t",
    scopes: [
      ["dark", "string.unquoted.directive.mermaid"],
      ["light", "string.unquoted.directive.mermaid"],
      ["title", "keyword.control.mermaid"],
      ["t", "string.unquoted.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
    ],
  },
  {
    name: "directive end: a word argument retains its later-line closer",
    code: "treeView-beta\n%%{init: dark\n}%%title t",
    scopes: [
      ["dark", "string.unquoted.directive.mermaid"],
      ["}%%", "keyword.operator.delimiter.directive.end.mermaid"],
      ["title", "keyword.control.mermaid"],
      ["t", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "quadrant semicolon: adjacent accessibility title",
    code: "quadrantChart\nquadrant-1 a;accTitle: t",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      [";", "keyword.operator.separator.semicolon.mermaid"],
      [":", "keyword.operator.separator.colon.mermaid"],
      ["t", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "quadrant semicolon: adjacent description",
    code: "quadrantChart\nquadrant-1 a;accDescr: t",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      [";", "keyword.operator.separator.semicolon.mermaid"],
      [":", "keyword.operator.separator.colon.mermaid"],
      ["t", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "quadrant semicolon: padding after semicolon before accessibility title",
    code: "quadrantChart\nquadrant-1 a; accTitle: t",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      [";", "keyword.operator.separator.semicolon.mermaid"],
      [":", "keyword.operator.separator.colon.mermaid"],
      ["t", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "quadrant semicolon: padding after semicolon before description",
    code: "quadrantChart\nquadrant-1 a; accDescr: t",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      [";", "keyword.operator.separator.semicolon.mermaid"],
      [":", "keyword.operator.separator.colon.mermaid"],
      ["t", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "quadrant semicolon: padding before semicolon before accessibility title",
    code: "quadrantChart\nquadrant-1 a ;accTitle: t",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      [";", "keyword.operator.separator.semicolon.mermaid"],
      [":", "keyword.operator.separator.colon.mermaid"],
      ["t", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "quadrant semicolon: padding before semicolon before description",
    code: "quadrantChart\nquadrant-1 a ;accDescr: t",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      [";", "keyword.operator.separator.semicolon.mermaid"],
      [":", "keyword.operator.separator.colon.mermaid"],
      ["t", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "quadrant semicolon: word directive before accessibility title separator",
    code: "quadrantChart\nquadrant-1 a%%{init: dark;accTitle: t",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      [";", "keyword.operator.separator.semicolon.mermaid"],
      [":", "keyword.operator.separator.colon.mermaid"],
      ["t", "string.unquoted.mermaid"],
      ["init", "entity.name.function.directive.mermaid"],
      ["dark", "string.unquoted.directive.mermaid"],
    ],
  },
  {
    name: "quadrant semicolon: word directive before description separator",
    code: "quadrantChart\nquadrant-1 a%%{init: dark;accDescr: t",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      [";", "keyword.operator.separator.semicolon.mermaid"],
      [":", "keyword.operator.separator.colon.mermaid"],
      ["t", "string.unquoted.mermaid"],
      ["init", "entity.name.function.directive.mermaid"],
      ["dark", "string.unquoted.directive.mermaid"],
    ],
  },
  {
    name: "quadrant semicolon: closed directive before accessibility title separator",
    code: "quadrantChart\nquadrant-1 a%%{init: dark}%%;accTitle: t",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      [";", "keyword.operator.separator.semicolon.mermaid"],
      [":", "keyword.operator.separator.colon.mermaid"],
      ["t", "string.unquoted.mermaid"],
      ["init", "entity.name.function.directive.mermaid"],
      ["dark", "string.unquoted.directive.mermaid"],
    ],
  },
  {
    name: "quadrant semicolon: closed directive before description separator",
    code: "quadrantChart\nquadrant-1 a%%{init: dark}%%;accDescr: t",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      [";", "keyword.operator.separator.semicolon.mermaid"],
      [":", "keyword.operator.separator.colon.mermaid"],
      ["t", "string.unquoted.mermaid"],
      ["init", "entity.name.function.directive.mermaid"],
      ["dark", "string.unquoted.directive.mermaid"],
    ],
  },
  {
    name: "quadrant semicolon: directive after accessibility title separator",
    code: "quadrantChart\nquadrant-1 a;%%{wrap}%%accTitle: t",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      [";", "keyword.operator.separator.semicolon.mermaid"],
      [":", "keyword.operator.separator.colon.mermaid"],
      ["t", "string.unquoted.mermaid"],
      ["wrap", "entity.name.function.directive.mermaid"],
    ],
  },
  {
    name: "quadrant semicolon: directive after description separator",
    code: "quadrantChart\nquadrant-1 a; %%{wrap}%% accDescr: t",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      [";", "keyword.operator.separator.semicolon.mermaid"],
      [":", "keyword.operator.separator.colon.mermaid"],
      ["t", "string.unquoted.mermaid"],
      ["wrap", "entity.name.function.directive.mermaid"],
    ],
  },
  {
    name: "quadrant semicolon: directive before accessibility title colon",
    code: "quadrantChart\nquadrant-1 a;accTitle%%{wrap}%%: t",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      [";", "keyword.operator.separator.semicolon.mermaid"],
      [":", "keyword.operator.separator.colon.mermaid"],
      ["t", "string.unquoted.mermaid"],
      ["wrap", "entity.name.function.directive.mermaid"],
    ],
  },
  {
    name: "quadrant semicolon: directive before description colon",
    code: "quadrantChart\nquadrant-1 a;accDescr%%{wrap}%%: t",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      [";", "keyword.operator.separator.semicolon.mermaid"],
      [":", "keyword.operator.separator.colon.mermaid"],
      ["t", "string.unquoted.mermaid"],
      ["wrap", "entity.name.function.directive.mermaid"],
    ],
  },
  {
    name: "quadrant semicolon: comment before following accessibility title",
    code: "quadrantChart\nquadrant-1 a;%% c\naccTitle: t",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      [";", "keyword.operator.separator.semicolon.mermaid"],
      [":", "keyword.operator.separator.colon.mermaid"],
      ["t", "string.unquoted.mermaid"],
      ["%% c", "comment.line.percentage.mermaid"],
    ],
  },
  {
    name: "quadrant semicolon: comment after following description",
    code: "quadrantChart\nquadrant-1 a;accDescr: t\n%% c",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      [";", "keyword.operator.separator.semicolon.mermaid"],
      [":", "keyword.operator.separator.colon.mermaid"],
      ["t", "string.unquoted.mermaid"],
      ["%% c", "comment.line.percentage.mermaid"],
    ],
  },
  {
    name: "quadrant semicolon: accessibility title value on next line",
    code: "quadrantChart\nquadrant-1 a;accTitle:\nt",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      [";", "keyword.operator.separator.semicolon.mermaid"],
      [":", "keyword.operator.separator.colon.mermaid"],
      ["t", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "quadrant semicolon: description value on next line",
    code: "quadrantChart\nquadrant-1 a;accDescr:\nt",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      [";", "keyword.operator.separator.semicolon.mermaid"],
      [":", "keyword.operator.separator.colon.mermaid"],
      ["t", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "quadrant semicolon: description value after blank line",
    code: "quadrantChart\nquadrant-1 a;accDescr:\n\nt",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      [";", "keyword.operator.separator.semicolon.mermaid"],
      [":", "keyword.operator.separator.colon.mermaid"],
      ["t", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "quadrant semicolon: line separator before accessibility title colon",
    code: "quadrantChart\nquadrant-1 a;accTitle\u2028: t",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      [";", "keyword.operator.separator.semicolon.mermaid"],
      [":", "keyword.operator.separator.colon.mermaid"],
      ["t", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "quadrant semicolon: paragraph separator after description colon",
    code: "quadrantChart\nquadrant-1 a;accDescr:\u2029t",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      [";", "keyword.operator.separator.semicolon.mermaid"],
      [":", "keyword.operator.separator.colon.mermaid"],
      ["t", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "quadrant semicolon: line separator before accessibility title comment",
    code: "quadrantChart\nquadrant-1 a;accTitle: t\u2028%% c\n",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      [";", "keyword.operator.separator.semicolon.mermaid"],
      [":", "keyword.operator.separator.colon.mermaid"],
      ["t", "string.unquoted.mermaid"],
      ["%% c", "comment.line.percentage.mermaid"],
    ],
  },
  {
    name: "quadrant semicolon: paragraph separator before description comment",
    code: "quadrantChart\nquadrant-1 a;accDescr: t\u2029%% c\n",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      [";", "keyword.operator.separator.semicolon.mermaid"],
      [":", "keyword.operator.separator.colon.mermaid"],
      ["t", "string.unquoted.mermaid"],
      ["%% c", "comment.line.percentage.mermaid"],
    ],
  },
  {
    name: "quadrant semicolon: word directive before style-looking accessibility value",
    code: "quadrantChart\n%%{init: dark;accTitle: style:#x",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      [";", "keyword.operator.separator.semicolon.mermaid"],
      [":", "keyword.operator.separator.colon.mermaid"],
      ["style:#x", "string.unquoted.mermaid"],
      ["init", "entity.name.function.directive.mermaid"],
      ["dark", "string.unquoted.directive.mermaid"],
    ],
  },
  {
    name: "quadrant semicolon: semicolon inside accessibility value stays text",
    code: "quadrantChart\nquadrant-1 a;accTitle: first;accDescr: second",
    scopes: [
      ["accTitle", "keyword.control.mermaid"],
      [";", "keyword.operator.separator.semicolon.mermaid"],
      ["first;accDescr: second", "string.unquoted.mermaid"],
    ],
    absent: [["first;accDescr: second", "keyword.control.mermaid"]],
  },
  {
    name: "quadrant semicolon: semicolon inside description block stays text",
    code: "quadrantChart\nquadrant-1 a;accDescr {first;accTitle: second}",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      [";", "keyword.operator.separator.semicolon.mermaid"],
      ["{", "keyword.operator.delimiter.description.begin.mermaid"],
      ["}", "keyword.operator.delimiter.description.end.mermaid"],
      ["first;accTitle: second", "string.unquoted.mermaid"],
    ],
    absent: [["first;accTitle: second", "keyword.control.mermaid"]],
  },
  {
    name: "quadrant semicolon: accessibility words inside a string stay text",
    code: 'quadrantChart\n"accTitle: x; accDescr: y": [0.1,0.2]',
    scopes: [["accTitle: x; accDescr: y", "string.quoted.double.mermaid"]],
    absent: [["accTitle: x; accDescr: y", "keyword.control.mermaid"]],
  },
  {
    name: "quadrant semicolon: accessibility suffix inside a word stays text",
    code: "quadrantChart\nNamesaccTitle: [0.1,0.2]",
    scopes: [["NamesaccTitle", "string.unquoted.mermaid"]],
    absent: [["NamesaccTitle", "keyword.control.mermaid"]],
  },
  {
    name: "quadrant semicolon: empty title after semicolon",
    code: "quadrantChart\nquadrant-1 a;title",
    scopes: [
      ["title", "keyword.control.mermaid"],
      [";", "keyword.operator.separator.semicolon.mermaid"],
    ],
  },
  {
    name: "quadrant semicolon: empty description block after semicolon",
    code: "quadrantChart\nquadrant-1 a;accDescr {}",
    scopes: [
      ["accDescr", "keyword.control.mermaid"],
      [";", "keyword.operator.separator.semicolon.mermaid"],
      ["{", "keyword.operator.delimiter.description.begin.mermaid"],
      ["}", "keyword.operator.delimiter.description.end.mermaid"],
    ],
  },
  {
    name: "a directive inside a data key leaves its fragments as text",
    code: "flowchart\nA@{ sh%%{wrap}%%ape: rect }",
    scopes: [
      [" sh", "string.unquoted.mermaid"],
      ["ape: rect ", "string.unquoted.mermaid"],
      ["wrap", "entity.name.function.directive.mermaid"],
      ["}", "keyword.operator.bracket.data.end.mermaid"],
    ],
    absentOnLine: [
      [1, "support.type.property-name.mermaid"],
      [1, "keyword.operator.separator.key-value.mermaid"],
    ],
  },
  {
    name: "a bare data key requires whitespace after its colon",
    code: "flowchart\nA@{ time:12:30 }",
    scopes: [
      [" time:12:30 ", "string.unquoted.mermaid"],
      ["}", "keyword.operator.bracket.data.end.mermaid"],
    ],
    absentOnLine: [
      [1, "support.type.property-name.mermaid"],
      [1, "keyword.operator.separator.key-value.mermaid"],
    ],
  },
  {
    name: "data scalars require a whole value and value colons stay text",
    code: "flowchart\nA@{ count: 2px, enabled: trueish, label: Very High extra: text }",
    scopes: [
      ["count", "support.type.property-name.mermaid"],
      ["enabled", "support.type.property-name.mermaid"],
      ["label", "support.type.property-name.mermaid"],
      ["2px", "string.unquoted.mermaid"],
      ["trueish", "string.unquoted.mermaid"],
      ["Very High extra: text ", "string.unquoted.mermaid"],
    ],
    absentOnLine: [
      [1, "constant.numeric.mermaid"],
      [1, "constant.language.mermaid"],
    ],
  },
  {
    name: "the first brace closes sequence data inside a double quote",
    code: 'sequenceDiagram\nparticipant A@{ "type": "queue} as Alias',
    scopes: [
      ['"type"', "support.type.property-name.mermaid"],
      [":", "keyword.operator.separator.key-value.mermaid"],
      ["queue", "string.quoted.double.mermaid"],
      ["}", "keyword.operator.bracket.data.end.mermaid"],
      ["as", "keyword.control.mermaid"],
      ["Alias", "string.unquoted.mermaid"],
    ],
    absent: [
      ["}", "string.quoted.double.mermaid"],
      ["Alias", "meta.data.mermaid"],
    ],
  },
  {
    name: "inline eventmodeling data ends at the last brace of its line",
    code: "eventmodeling\ntf 01 evt E { first: 1 } tf 02 evt Later { second: 2 }",
    scopes: [
      ["{", "keyword.operator.bracket.data.begin.mermaid"],
      ["first", "support.type.property-name.mermaid"],
      ["1", "constant.numeric.mermaid"],
      ["}", "string.unquoted.mermaid"],
      [" tf 02 evt Later ", "string.unquoted.mermaid"],
      ["second", "support.type.property-name.mermaid"],
      ["2", "constant.numeric.mermaid"],
    ],
    absent: [[" tf 02 evt Later ", "keyword.control.mermaid"]],
  },
  {
    name: "a block data closer ends eventmodeling data after an unclosed quote",
    code: 'eventmodeling\ndata D {\n  value: "open\n}\ntf 01 evt Next',
    scopes: [
      ["value", "support.type.property-name.mermaid"],
      ["open", "string.quoted.double.mermaid"],
      ["}", "keyword.operator.bracket.data.end.mermaid"],
      ["tf", "keyword.control.mermaid"],
      ["Next", "variable.mermaid"],
    ],
    absent: [
      ["}", "string.quoted.double.mermaid"],
      ["Next", "meta.data.mermaid"],
    ],
  },
]

describe("the lexical boundaries", () => {
  it("keeps only the outer JSON braces as data delimiters", () => {
    const input = boundaries.find(
      (boundary) =>
        boundary.name ===
        "a usecase JSON value displays entries while balancing braces",
    )
    if (!input) throw new Error("missing fixed JSON input")
    const line = tokenLines(input.code)[1] ?? []
    const begin = line.findIndex((token) =>
      token.scopes.includes("keyword.operator.bracket.data.begin.mermaid"),
    )
    const end = line.findIndex((token) =>
      token.scopes.includes("keyword.operator.bracket.data.end.mermaid"),
    )
    expect(begin).toBeGreaterThan(0)
    expect(end).toBe(line.length - 1)
    expect(
      line
        .filter((token) => token.content === "{" || token.content === "}")
        .map((token) => token.scopes),
    ).toEqual([
      ["meta.data.mermaid", "keyword.operator.bracket.data.begin.mermaid"],
      ["meta.data.mermaid", "string.unquoted.mermaid"],
      ["meta.data.mermaid", "string.unquoted.mermaid"],
      ["meta.data.mermaid", "keyword.operator.bracket.data.end.mermaid"],
    ])
  })

  it("keeps both EBNF special-sequence delimiters separate from rule terminators", () => {
    for (const name of [
      "an entity semicolon inside an EBNF special sequence",
      "an entity with a directive before its semicolon inside a special sequence",
    ]) {
      const input = boundaries.find((boundary) => boundary.name === name)
      if (!input) throw new Error(`missing fixed input: ${name}`)
      expect(
        tokenLines(input.code)
          .flat()
          .filter((token) => token.content === "?")
          .map((token) => token.scopes),
      ).toEqual([
        ["keyword.operator.delimiter.special-sequence.begin.mermaid"],
        ["keyword.operator.delimiter.special-sequence.end.mermaid"],
      ])
    }
  })

  it("ends a treemap HTML tag at a directive's first closing angle bracket", () => {
    // common.md#html-attribute-quotes: The attribute part ends at the first >.
    const code = 'treemap "<b %%{x: >}%%x=":1 "title":2'
    checkScopes(code, {
      scopes: [
        ["1", "constant.numeric.mermaid"],
        ["2", "constant.numeric.mermaid"],
        ["title", "string.quoted.double.mermaid"],
      ],
      absent: [
        ["1", "string.quoted.double.mermaid"],
        ["2", "string.quoted.double.mermaid"],
      ],
    })
    // The directive also has a colon; check both leaf separators explicitly.
    expect(
      tokenLines(code)
        .flat()
        .filter(
          (token) =>
            token.content === ":" &&
            token.scopes.includes("keyword.operator.separator.colon.mermaid") &&
            !token.scopes.includes("meta.directive.mermaid"),
        ),
    ).toHaveLength(2)
  })

  it("reads both xychart titles separated by a directive", () => {
    const input = boundaries.find(
      (boundary) =>
        boundary.name ===
        "follow-up: xychart title starts a second statement after a directive",
    )
    if (!input) throw new Error("missing fixed xychart input")
    expect(
      tokenLines(input.code)
        .flat()
        .filter(
          (token) =>
            token.content === "title" &&
            token.scopes.includes("keyword.control.mermaid"),
        ),
    ).toHaveLength(2)
  })

  it("gives each data unit one content scope within its delimiters", () => {
    for (const name of [
      "kanban data entries keep distinct scopes",
      "flowchart data entries keep distinct scopes",
      "agentflow data entries keep distinct scopes",
      "sequence data entries keep distinct scopes",
      "usecase data entries keep distinct scopes",
      "eventmodeling data entries keep distinct scopes",
      "inline eventmodeling data ends at the last brace of its line",
    ]) {
      const input = boundaries.find((boundary) => boundary.name === name)
      if (!input) throw new Error(`missing fixed data input: ${name}`)
      const line = tokenLines(input.code).find((lineTokens) =>
        lineTokens.some((token) =>
          token.scopes.includes("keyword.operator.bracket.data.begin.mermaid"),
        ),
      )
      if (!line) throw new Error(`missing data delimiters: ${name}`)
      const begin = line.findIndex((token) =>
        token.scopes.includes("keyword.operator.bracket.data.begin.mermaid"),
      )
      const end = line.findIndex((token) =>
        token.scopes.includes("keyword.operator.bracket.data.end.mermaid"),
      )
      expect(end, name).toBeGreaterThan(begin + 1)
      expect(end, name).toBe(line.length - 1)
      for (const token of line.slice(begin + 1, end)) {
        expect(token.scopes, token.content).toContain("meta.data.mermaid")
        const contentScopes = token.scopes.filter(
          (scope) =>
            scope !== "meta.data.mermaid" &&
            scope !== "punctuation.definition.string.begin.mermaid" &&
            scope !== "punctuation.definition.string.end.mermaid",
        )
        if (token.content.trim()) {
          expect(contentScopes, token.content).toHaveLength(1)
        } else {
          expect(contentScopes.length, token.content).toBeLessThanOrEqual(1)
        }
      }
    }
  })

  it.each(boundaries)("colors $name", ({ code, ...expected }) => {
    checkScopes(code, expected)
  })
})
