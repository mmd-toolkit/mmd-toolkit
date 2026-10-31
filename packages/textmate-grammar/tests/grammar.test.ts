import { readdirSync, readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import type { HighlighterCore } from "shiki/core"
import { createHighlighterCore } from "shiki/core"
import { createOnigurumaEngine } from "shiki/engine/oniguruma"
import yaml from "shiki/langs/yaml.mjs"
import light from "shiki/themes/github-light.mjs"
import type { DiagramType } from "@mmd-toolkit/tests"
import { loadFixture } from "@mmd-toolkit/tests"
import { beforeAll, describe, expect, it } from "vitest"
import { createGrammar } from "../src/grammar.ts"
import mermaid from "../src/index.ts"

const grammar = createGrammar()

it("builds a TextMate grammar with resolved ASCII-folding patterns", () => {
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
            expect(item.startsWith("(?I)")).toBe(true)
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
    themes: [light],
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

describe("the fixtures of the diagram types", () => {
  it.each(fixtureNames)("colors %s as its expectations say", async (name) => {
    const code = readFileSync(fixture(`${name}.mmd`), "utf8")
    const expected = JSON.parse(
      readFileSync(fixture(`${name}.expected.json`), "utf8"),
    ) as Expected
    expect(scopesOf(code, expected.header)).toContain("keyword.control.mermaid")
    checkScopes(code, expected)
    for (const input of expected.escapedInputs ?? []) {
      checkScopes(input.code, input)
    }
    await expect(tokens(code)).toMatchFileSnapshot(fixture(`${name}.tokens`))
  })
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
      "punctuation.definition.frontmatter.begin.mermaid",
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
  // common.md#html-attribute-quotes converts only quoted-value quotes.
  // packet.md#numbers-and-strings and railroad.md#ir-units still read escapes
  // outside those values, including through common directives.
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
      [")", "punctuation.section.arguments.end.mermaid"],
      [";", "punctuation.separator.rule.mermaid"],
    ],
    absent: [[")", "string.quoted.double.mermaid"]],
  },
  {
    name: "a railroad HTML tag reads a directive inside a quote escape",
    code: 'railroad-beta\nr=terminal("<b \\%%{wrap}%%"text>");',
    scopes: [
      ["wrap", "entity.name.function.directive.mermaid"],
      ['"text>', "string.quoted.double.mermaid"],
      [";", "punctuation.separator.rule.mermaid"],
    ],
    absent: [[";", "string.quoted.double.mermaid"]],
  },
  // usecase.md#json-context: Backslash protects exactly the next character.
  {
    name: "a usecase JSON HTML tag keeps an escaped non-attribute quote",
    code: 'usecase-beta\njson J @ {"x":"<b \\"text>"}',
    scopes: [['<b \\"text>', "string.unquoted.mermaid"]],
    absent: [["}", "string.quoted.double.mermaid"]],
  },
  {
    name: "a usecase JSON HTML tag reads a directive inside a quote escape",
    code: 'usecase-beta\njson J @ {"x":"<b \\%%{wrap}%%"text>"}',
    scopes: [
      ["wrap", "entity.name.function.directive.mermaid"],
      ['"text>', "string.unquoted.mermaid"],
    ],
    absent: [["}", "string.quoted.double.mermaid"]],
  },
  // usecase.md#ordered-default-context-rules: Only backquote plus double
  // quote ends markdown; attribute quotes convert before that reading.
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
  // sankey.md#strings: Doubled quotes remain content outside quoted values.
  {
    name: "a sankey HTML tag reads a doubled quote before a quoted value",
    code: 'sankey-beta\n"<b "" x="v">",B,1',
    scopes: [
      ['<b "" x="v">', "string.quoted.double.mermaid"],
      [",", "punctuation.separator.comma.mermaid"],
    ],
    absent: [[",", "string.quoted.double.mermaid"]],
  },
  {
    name: "a sankey HTML tag reads a directive between doubled quotes",
    code: 'sankey-beta\n"<b "%%{wrap}%%" x="v">",B,1',
    scopes: [
      ["wrap", "entity.name.function.directive.mermaid"],
      ['" x="v">', "string.quoted.double.mermaid"],
      [",", "punctuation.separator.comma.mermaid"],
    ],
    absent: [[",", "string.quoted.double.mermaid"]],
  },
  // common.md#html-attribute-quotes: The first written quote ends a quoted
  // value; a backslash before its equals sign cannot consume the opener.
  {
    name: "a packet HTML quoted value ends at a quote after a backslash",
    code: 'packet 0:"<b x="v\\"tail>"',
    scopes: [['<b x="v\\"tail>', "string.quoted.double.mermaid"]],
    absent: [['<b x="v\\"tail>', "punctuation.definition.string.end.mermaid"]],
  },
  {
    name: "a usecase JSON HTML quoted value ends at a quote after a backslash",
    code: 'usecase-beta\njson J @ {"x":"<b x="v\\"tail>"}',
    scopes: [['<b x="v\\"tail>', "string.unquoted.mermaid"]],
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
    scopes: [['<b \\="v">', "string.unquoted.mermaid"]],
    absent: [["}", "string.quoted.double.mermaid"]],
  },
  // usecase.md#json-context permits escapes of both Unicode separators,
  // unlike packet.md#numbers-and-strings.
  {
    name: "a usecase JSON HTML tag keeps an escaped line separator",
    code: 'usecase-beta\njson J @ {"x":"<b \\\u2028text>"}',
    scopes: [["<b \\\u2028text>", "string.unquoted.mermaid"]],
    absent: [["}", "string.quoted.double.mermaid"]],
  },
  {
    name: "a usecase JSON HTML tag keeps an escaped paragraph separator",
    code: 'usecase-beta\njson J @ {"x":"<b \\\u2029text>"}',
    scopes: [["<b \\\u2029text>", "string.unquoted.mermaid"]],
    absent: [["}", "string.quoted.double.mermaid"]],
  },
  // common.md#html-attribute-quotes ends the tag at its first greater-than
  // sign; leave an escape crossing it whole for the enclosing string.
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
      ["[", "punctuation.definition.label.begin.mermaid"],
      ['<b \\"text>', "string.quoted.double.mermaid"],
      ["]", "punctuation.definition.label.end.mermaid"],
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
      [",", "punctuation.separator.comma.mermaid"],
    ],
    absent: [[",", "string.quoted.double.mermaid"]],
  },
  // common.md#a-directive-is-a-token-boundary and #html-attribute-quotes:
  // directives stay whole and quoted HTML values protect backquotes.
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
      ["}%%", "punctuation.definition.directive.end.mermaid"],
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
      ["}%%", "punctuation.definition.directive.end.mermaid"],
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
      ["}%%", "punctuation.definition.directive.end.mermaid"],
      ["foo", "string.quoted.double.mermaid"],
      ["]", "punctuation.definition.label.end.mermaid"],
    ],
  },
  {
    name: "a packet HTML tag keeps a closing quote inside its directive",
    code: 'packet\n0:"<b %%{x: >"}%%done"',
    scopes: [
      ['>"', "string.unquoted.directive.mermaid"],
      ["}%%", "punctuation.definition.directive.end.mermaid"],
      ["done", "string.quoted.double.mermaid"],
    ],
    absentOnLine: [[1, "comment.line.percentage.mermaid"]],
  },
  {
    name: "a railroad HTML tag keeps a closing quote inside its directive",
    code: 'railroad-beta r=terminal("<b %%{x: >"}%%x");',
    scopes: [
      ['>"', "string.unquoted.directive.mermaid"],
      ["}%%", "punctuation.definition.directive.end.mermaid"],
      ["x", "string.quoted.double.mermaid"],
      [";", "punctuation.separator.rule.mermaid"],
    ],
    absentOnLine: [[0, "comment.line.percentage.mermaid"]],
  },
  {
    name: "a class HTML tag keeps a closing quote inside its directive",
    code: 'classDiagram\nnote "<b %%{x: >"}%%foo"',
    scopes: [
      ['>"', "string.unquoted.directive.mermaid"],
      ["}%%", "punctuation.definition.directive.end.mermaid"],
      ["foo", "string.quoted.double.mermaid"],
    ],
    absentOnLine: [[1, "comment.line.percentage.mermaid"]],
  },
  {
    name: "a markdown HTML tag keeps its directive whole at the tag end",
    code: 'usecase-beta\nA("`<b %%{x: >"}%%foo`")',
    scopes: [
      ['>"', "string.unquoted.directive.mermaid"],
      ["}%%", "punctuation.definition.directive.end.mermaid"],
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
  // info.md#hidden-yaml and eventmodeling.md#native-hidden-forms-and-comments:
  // a directive before an unindented closing fence is trivia.
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
      [";", "punctuation.separator.rule.mermaid"],
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
  // kanban.md#the-shape-context and mindmap.md#the-shape-context:
  // quotes inside shape text are text; markdown uses the shared delimiters.
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

  // common.md#html-attribute-quotes: The first written > ends a tag,
  // including inside a directive; the enclosing data context reads it whole.
  {
    name: "a flowchart data tag ends inside a directive before a quoted value",
    code: 'flowchart LR\nA@{<b %%{init: >}%% t="q"}',
    scopes: [
      ["q", "string.unquoted.mermaid"],
      ["init", "entity.name.function.directive.mermaid"],
      ["}", "punctuation.section.data.end.mermaid"],
    ],
    absentOnLine: [[1, "comment.line.percentage.mermaid"]],
  },
  {
    name: "an agentflow data tag ends inside a directive before a quoted value",
    code: 'agentflow-beta LR\nA@{<b %%{init: >}%% t="q"}',
    scopes: [
      ["q", "string.unquoted.mermaid"],
      ["init", "entity.name.function.directive.mermaid"],
      ["}", "punctuation.section.data.end.mermaid"],
    ],
    absentOnLine: [[1, "comment.line.percentage.mermaid"]],
  },
  // common.md#html-attribute-quotes, #comment-lines and
  // #a-directive-is-a-token-boundary; pie.md#global-trivia-inside-values.
  {
    name: "an agentflow data tag preserves attribute quotes after a directive",
    code: 'agentflow-beta LR\nA@{<b %%{wrap}%% t="q">}',
    scopes: [
      ["wrap", "entity.name.function.directive.mermaid"],
      ["}", "punctuation.section.data.end.mermaid"],
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
      [",", "punctuation.separator.comma.mermaid"],
      ["y", "string.quoted.double.mermaid"],
      [";", "punctuation.separator.rule.mermaid"],
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
      [";", "punctuation.separator.semicolon.mermaid"],
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
      ["}", "punctuation.definition.description.end.mermaid", 2],
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
      [":", "punctuation.separator.colon.mermaid"],
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
      ["]", "punctuation.definition.label.end.mermaid"],
    ],
    absent: [['<b title="group">', "constant.character.escape.mermaid"]],
  },
  {
    name: "an architecture quoted label uses the shared quote escape",
    code: 'architecture-beta\nservice a["a\\"b"]\n',
    scopes: [
      ['\\"', "constant.character.escape.mermaid"],
      ["b", "string.quoted.double.mermaid"],
      ["]", "punctuation.definition.label.end.mermaid"],
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
      [" ticket: ", "string.unquoted.mermaid"],
    ],
    absent: [[" ticket: ", "string.quoted.double.mermaid"]],
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
      ["x: 'a", "string.unquoted.mermaid"],
      ["}", "punctuation.section.data.end.mermaid"],
      ["%% c", "comment.line.percentage.mermaid"],
    ],
    absent: [["x: 'a", "string.quoted.single.mermaid"]],
  },
  {
    // kanban.md#data-blocks: The whole interior has no parsed key/value children.
    name: "a kanban data block keeps property and boolean spellings as text",
    code: "kanban\nA@{key: true, other: false}\n",
    scopes: [["key: true, other: false", "string.unquoted.mermaid"]],
    absent: [
      ["key: true, other: false", "support.type.property-name.mermaid"],
      ["key: true, other: false", "constant.language.mermaid"],
      ["key: true, other: false", "punctuation.separator.comma.mermaid"],
      ["key: true, other: false", "punctuation.separator.key-value.mermaid"],
    ],
  },
  {
    // kanban.md#the-data-context: Quoted data holds braces, carets and line feeds;
    // a backslash does not escape its closing quote.
    name: "kanban quoted data protects a brace and caret across a line feed",
    code: 'kanban\nA@{x: "}^\n\\%%{wrap}%%"}%% c\n',
    scopes: [
      ["}^", "string.unquoted.mermaid"],
      ["\\", "string.unquoted.mermaid"],
      ["wrap", "entity.name.function.directive.mermaid"],
      ["}", "punctuation.section.data.end.mermaid"],
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
    name: "long s does not match the ASCII s of scale",
    code: "stateDiagram\n\u017Fcale 3 width\n",
    scopes: [],
    absent: [["\u017Fcale", "keyword.control.mermaid"]],
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
      [":::", "punctuation.separator.class.mermaid"],
      ["tag", "variable.mermaid"],
    ],
  },
  {
    name: "a kanban icon after nonbreaking space indentation",
    code: "kanban\n A\n\u00A0::icon(x)\n",
    scopes: [["::icon(", "keyword.control.mermaid"]],
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
      [":", "punctuation.separator.colon.mermaid"],
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
      ["{", "punctuation.definition.description.begin.mermaid"],
      [" Block ", "string.unquoted.mermaid"],
      ["}", "punctuation.definition.description.end.mermaid"],
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
      ["?", "punctuation.definition.special-sequence.begin.mermaid"],
      [" #amp; ", "string.unquoted.mermaid"],
    ],
    absent: [
      ["?", "punctuation.separator.rule.mermaid"],
      [" #amp; ", "punctuation.separator.rule.mermaid"],
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
      ["; ", "punctuation.separator.rule.mermaid"],
      ["?", "punctuation.separator.rule.mermaid"],
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
  // Review boundaries from the diagram specifications and common.md.

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
      ["::icon(", "keyword.control.mermaid"],
      ["x", "string.unquoted.mermaid"],
      [":::", "punctuation.separator.class.mermaid"],
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
      ["::icon(", "keyword.control.mermaid"],
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
      [",", "punctuation.separator.comma.mermaid"],
      ["fill", "support.type.property-name.mermaid"],
      [":", "punctuation.separator.key-value.mermaid"],
      ["#fff", "support.constant.property-value.mermaid"],
      ["stroke", "support.type.property-name.mermaid"],
    ],
  },
  {
    name: "agentflow style lists keep commas and bare values",
    code: "agentflow-beta\nclassDef a bold,fill:red\nstyle A fill:red,bold,stroke:blue\nstyle A #fff\nlinkStyle default bold,stroke:red",
    scopes: [
      ["bold", "support.constant.property-value.mermaid"],
      [",", "punctuation.separator.comma.mermaid"],
      ["fill", "support.type.property-name.mermaid"],
      [":", "punctuation.separator.key-value.mermaid"],
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
      [",", "punctuation.separator.comma.mermaid", 2],
      [",", "punctuation.separator.comma.mermaid", 3],
      [",", "support.constant.property-value.mermaid", 4],
    ],
    absent: [["\\,", "punctuation.separator.comma.mermaid"]],
  },
  {
    name: "classDef keeps an escaped comma in a bare agentflow style",
    code: "agentflow-beta\nclassDef a bold\\,wide,fill:x\\%%{wrap}%%,y\nstyle A bold\\,wide\nlinkStyle default bold\\,wide\nclassDef b bold\\%%{wrap}%%,wide",
    scopes: [
      ["\\,", "support.constant.property-value.mermaid"],
      ["wide", "support.constant.property-value.mermaid"],
      ["wrap", "meta.directive.mermaid"],
      [",", "punctuation.separator.comma.mermaid", 2],
      [",", "punctuation.separator.comma.mermaid", 3],
      [",", "support.constant.property-value.mermaid", 4],
    ],
    absent: [["\\,", "punctuation.separator.comma.mermaid"]],
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
      [",", "punctuation.separator.comma.mermaid"],
      [":", "punctuation.separator.key-value.mermaid"],
    ],
  },
  {
    name: "class styles use whole bare values",
    code: "classDiagram\nclass A\nstyle A bold,fill:red\nclassDef a bold,fill:red\nclassDef c style",
    scopes: [
      ["bold", "support.constant.property-value.mermaid"],
      ["fill", "support.type.property-name.mermaid"],
      [",", "punctuation.separator.comma.mermaid"],
      [":", "punctuation.separator.key-value.mermaid"],
      ["style", "support.constant.property-value.mermaid", 4],
    ],
  },
  {
    name: "er styles use whole bare values",
    code: "erDiagram\nA\nstyle A bold,fill:red\nclassDef a bold,fill:red",
    scopes: [
      ["bold", "support.constant.property-value.mermaid"],
      ["fill", "support.type.property-name.mermaid"],
      [",", "punctuation.separator.comma.mermaid"],
      [":", "punctuation.separator.key-value.mermaid"],
    ],
  },
  {
    name: "state styles use whole bare values",
    code: "stateDiagram-v2\nA\nstyle A bold,fill:red\nclassDef a bold,fill:red",
    scopes: [
      ["bold", "support.constant.property-value.mermaid"],
      ["fill", "support.type.property-name.mermaid"],
      [",", "punctuation.separator.comma.mermaid"],
      [":", "punctuation.separator.key-value.mermaid"],
    ],
  },
  {
    name: "requirement styles use whole bare values",
    code: "requirementDiagram\nstyle A bold,fill:red\nclassDef a bold,fill:red",
    scopes: [
      ["bold", "support.constant.property-value.mermaid"],
      ["fill", "support.type.property-name.mermaid"],
      [",", "punctuation.separator.comma.mermaid"],
      [":", "punctuation.separator.key-value.mermaid"],
    ],
  },
  {
    name: "venn style properties preserve their value boundaries",
    code: "venn-beta\nset A\nstyle A fill:red,stroke:blue",
    scopes: [
      ["fill", "support.type.property-name.mermaid"],
      ["red", "support.constant.property-value.mermaid"],
      ["stroke", "support.type.property-name.mermaid"],
      [",", "punctuation.separator.comma.mermaid"],
      [":", "punctuation.separator.key-value.mermaid"],
    ],
  },
  {
    name: "usecase styles require property colons",
    code: "usecase-beta\nactor A\nstyle A fill:red,stroke:blue\nclassDef a fill:red,stroke:blue",
    scopes: [
      ["fill", "support.type.property-name.mermaid"],
      ["red", "support.constant.property-value.mermaid"],
      ["stroke", "support.type.property-name.mermaid"],
      [",", "punctuation.separator.comma.mermaid"],
      [":", "punctuation.separator.key-value.mermaid"],
    ],
  },
  {
    name: "quadrant style properties use key-value colons",
    code: "quadrantChart\nA: [0.1,0.2] color: #f00, radius: 4\nclassDef a color:#f00,radius:4",
    scopes: [
      ["color", "support.type.property-name.mermaid"],
      ["#f00", "support.constant.property-value.mermaid"],
      ["radius", "support.type.property-name.mermaid"],
      [":", "punctuation.separator.key-value.mermaid", 2],
      [",", "punctuation.separator.comma.mermaid"],
    ],
  },
  {
    name: "treemap retains its documented style-text reading",
    code: 'treemap\nclassDef ab fill:red,stroke:blue\n"Leaf":1',
    scopes: [
      ["fill", "support.type.property-name.mermaid"],
      ["red,stroke:blue", "support.constant.property-value.mermaid"],
      [":", "punctuation.separator.key-value.mermaid"],
    ],
    absentOnLine: [[1, "punctuation.separator.comma.mermaid"]],
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
      ["{", "punctuation.definition.description.begin.mermaid"],
      ["}", "punctuation.definition.description.end.mermaid"],
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
      ["}%%", "punctuation.definition.directive.end.mermaid"],
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
      [":", "punctuation.separator.key-value.mermaid"],
      ["lt", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "an agentflow rectangle property uses the table scopes",
    code: "agentflow-beta\nA[|borders:lt|text]",
    scopes: [
      ["borders", "support.type.property-name.mermaid"],
      [":", "punctuation.separator.key-value.mermaid"],
      ["lt", "string.unquoted.mermaid"],
    ],
  },
  {
    name: "an architecture icon name is retained text",
    code: "architecture-beta\nservice s(server)",
    scopes: [
      ["server", "string.unquoted.mermaid"],
      ["(", "punctuation.section.icon.begin.mermaid"],
      [")", "punctuation.section.icon.end.mermaid"],
    ],
    absent: [["server", "variable.mermaid"]],
  },
  {
    name: "a treeview icon has icon brackets and retained reference",
    code: "treeView-beta\nroot icon(fa:x)",
    scopes: [
      ["fa:x", "string.unquoted.mermaid"],
      ["(", "punctuation.section.icon.begin.mermaid"],
      [")", "punctuation.section.icon.end.mermaid"],
    ],
  },
  {
    name: "a state terminal is a state reference",
    code: "stateDiagram-v2\n[*] --> A",
    scopes: [["[*]", "variable.mermaid"]],
    absent: [["[*]", "constant.language.mermaid"]],
  },
  {
    name: "a usecase JSON value is opaque data",
    code: 'usecase-beta\njson J @ {"a": {"nested": "v}"}, "b": 1}\nactor A',
    scopes: [
      ["@", "meta.data.mermaid"],
      ["{", "punctuation.section.data.begin.mermaid"],
      ["A", "variable.mermaid"],
    ],
    absentOnLine: [
      [1, "string.quoted.double.mermaid"],
      [1, "support.type.property-name.mermaid"],
      [1, "meta.structure.dictionary.mermaid"],
    ],
  },
  {
    name: "usecase native metadata keeps property keys",
    code: "usecase-beta\nactor A@{ type: normal }",
    scopes: [
      ["type", "support.type.property-name.mermaid"],
      [":", "punctuation.separator.key-value.mermaid"],
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
    name: "kanban data quotes remain opaque text",
    code: 'kanban\nA\n b[y]@{"k": "v}"}',
    scopes: [["@{", "meta.data.mermaid"]],
    absentOnLine: [
      [2, "string.quoted.double.mermaid"],
      [2, "support.type.property-name.mermaid"],
    ],
  },
  {
    name: "flowchart data quotes remain opaque text",
    code: 'flowchart TD\nC@{ shape: rect, label: "x" }',
    scopes: [["@{", "meta.data.mermaid"]],
    absentOnLine: [
      [1, "string.quoted.double.mermaid"],
      [1, "support.type.property-name.mermaid"],
    ],
  },
  {
    name: "agentflow data quotes remain opaque text",
    code: 'agentflow-beta\nC@{ shape: rect, label: "x" }',
    scopes: [["@{", "meta.data.mermaid"]],
    absentOnLine: [
      [1, "string.quoted.double.mermaid"],
      [1, "support.type.property-name.mermaid"],
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
      ["(", "punctuation.section.arguments.begin.mermaid"],
      [")", "punctuation.section.arguments.end.mermaid"],
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
      ["}%%", "punctuation.definition.directive.end.mermaid"],
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
      ["anno", "storage.modifier.mermaid"],
    ],
  },
  {
    name: "follow-up: eventmodeling closes block data after a directive",
    code: "eventmodeling\ndata D {\nx\n%%{x}%%}\n title t",
    scopes: [
      ["}", "punctuation.section.data.end.mermaid"],
      ["title", "keyword.control.mermaid"],
      ["t", "string.unquoted.mermaid"],
    ],
    absent: [["title", "meta.data.mermaid"]],
  },
  {
    name: "follow-up: an unclosed word directive retains the statement-start limit",
    code: "pie\n%%{init: dark title t",
    scopes: [["dark", "string.unquoted.directive.mermaid"]],
    unscoped: [["title t"]],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: an unclosed free-text directive retains the LS statement-start limit",
    code: "pie\n%%{init: {}\u2028title t",
    scopes: [["{}", "string.unquoted.directive.mermaid"]],
    absentOnLine: [[1, "keyword.control.mermaid"]],
  },
  {
    name: "follow-up: an unclosed free-text directive retains the PS statement-start limit",
    code: "pie\n%%{init: {}\u2029title t",
    scopes: [["{}", "string.unquoted.directive.mermaid"]],
    absentOnLine: [[1, "keyword.control.mermaid"]],
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
    name: "follow-up: class separates only commas before the first style colon",
    code: "classDiagram\nclass A\nstyle A bold,fill:red,stroke:blue:wide",
    scopes: [
      ["bold", "support.constant.property-value.mermaid"],
      [",", "punctuation.separator.comma.mermaid"],
      ["fill", "support.type.property-name.mermaid"],
      [":", "punctuation.separator.key-value.mermaid"],
      ["red,stroke:blue:wide", "support.constant.property-value.mermaid"],
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
    absentOnLine: [[2, "punctuation.definition.description.begin.mermaid"]],
  },
  {
    name: "follow-up: class bare styles still leave a description block",
    code: "classDiagram\nclass A\nstyle A bold accDescr {}",
    scopes: [
      ["bold", "support.constant.property-value.mermaid"],
      ["accDescr", "keyword.control.mermaid"],
      ["{", "punctuation.definition.description.begin.mermaid"],
    ],
  },
  {
    name: "follow-up: class classDef values retain commas after the first colon",
    code: "classDiagram\nclass A\nclassDef aa bold,fill:red,stroke:blue",
    scopes: [
      ["bold", "support.constant.property-value.mermaid"],
      [",", "punctuation.separator.comma.mermaid"],
      ["fill", "support.type.property-name.mermaid"],
      ["red,stroke:blue", "support.constant.property-value.mermaid"],
    ],
  },
  {
    name: "follow-up: treemap keeps commas after the first style colon",
    code: "treemap\nclassDef aa fill:red,stroke:x",
    scopes: [
      ["fill", "support.type.property-name.mermaid"],
      [":", "punctuation.separator.key-value.mermaid"],
      ["red,stroke:x", "support.constant.property-value.mermaid"],
    ],
    absentOnLine: [[1, "punctuation.separator.comma.mermaid"]],
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
      [2, "punctuation.separator.comma.mermaid"],
      [3, "punctuation.separator.comma.mermaid"],
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
      [",", "punctuation.separator.comma.mermaid", 3],
    ],
  },
  {
    name: "follow-up: usecase keeps escaped commas in style and classDef",
    code: "usecase-beta\nactor A\nstyle A font:x\\,y,fill:red\nclassDef aa font:x\\,y,fill:red",
    scopes: [
      ["x", "support.constant.property-value.mermaid"],
      ["\\,", "support.constant.property-value.mermaid"],
      ["y", "support.constant.property-value.mermaid"],
      [",", "punctuation.separator.comma.mermaid"],
    ],
    absent: [["\\,", "punctuation.separator.comma.mermaid"]],
  },
  {
    name: "follow-up: flowchart keeps the classDef-only escaped comma distinction",
    code: "flowchart TD\nA-->B\nclassDef aa bold\\,wide,fill:red\nstyle A bold\\,wide\nlinkStyle 0 bold\\,wide",
    scopes: [
      ["\\,", "support.constant.property-value.mermaid", 2],
      [",", "punctuation.separator.comma.mermaid", 3],
      [",", "punctuation.separator.comma.mermaid", 4],
    ],
    absent: [["\\,", "punctuation.separator.comma.mermaid", 2]],
  },
  {
    name: "follow-up: agentflow keeps the classDef-only escaped comma distinction",
    code: "agentflow-beta\nA-->B\nclassDef aa bold\\,wide,fill:red\nstyle A bold\\,wide\nlinkStyle 0 bold\\,wide",
    scopes: [
      ["\\,", "support.constant.property-value.mermaid", 2],
      [",", "punctuation.separator.comma.mermaid", 3],
      [",", "punctuation.separator.comma.mermaid", 4],
    ],
    absent: [["\\,", "punctuation.separator.comma.mermaid", 2]],
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
      ["}%%", "punctuation.definition.directive.end.mermaid"],
    ],
    absent: [["title", "meta.directive.mermaid"]],
  },
  {
    name: "follow-up: a second colon starts free text",
    code: "pie\n%%{init:\n:x}%%\ntitle t",
    scopes: [
      [":x", "string.unquoted.directive.mermaid"],
      ["title", "keyword.control.mermaid"],
      ["}%%", "punctuation.definition.directive.end.mermaid"],
    ],
    absent: [["title", "meta.directive.mermaid"]],
  },
  {
    name: "follow-up: an indented word closes before the next statement",
    code: "pie\n%%{init:\n  dark\n}%%\ntitle t",
    scopes: [
      ["dark", "string.unquoted.directive.mermaid"],
      ["title", "keyword.control.mermaid"],
      ["}%%", "punctuation.definition.directive.end.mermaid"],
    ],
    absent: [["title", "meta.directive.mermaid"]],
  },
  {
    name: "follow-up: a same-line word keeps its later closer",
    code: "pie\n%%{init: dark\n}%%\ntitle t",
    scopes: [
      ["dark", "string.unquoted.directive.mermaid"],
      ["title", "keyword.control.mermaid"],
      ["}%%", "punctuation.definition.directive.end.mermaid"],
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
      ["}%%", "punctuation.definition.directive.end.mermaid"],
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
      ["%%{", "punctuation.definition.directive.begin.mermaid"],
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
    absentOnLine: [[2, "punctuation.definition.directive.end.mermaid"]],
  },
  {
    name: "follow-up: a free-text PS stop leaves a next-line closer outside its scope",
    code: "pie\n%%{init: {}\u2029\n}%%\ntitle t",
    scopes: [
      ["{}", "string.unquoted.directive.mermaid"],
      ["title", "keyword.control.mermaid"],
    ],
    absentOnLine: [[2, "punctuation.definition.directive.end.mermaid"]],
  },
  {
    name: "follow-up: opaque kanban data has one unquoted scope per token",
    code: 'kanban\nA\n b[y]@{ assigned: "k" }',
    scopes: [["@{", "meta.data.mermaid"]],
    absentOnLine: [
      [2, "string.quoted.double.mermaid"],
      [2, "support.type.property-name.mermaid"],
    ],
  },
  {
    name: "follow-up: opaque flowchart data has one unquoted scope per token",
    code: 'flowchart TD\nA@{ assigned: "k" }',
    scopes: [["@{", "meta.data.mermaid"]],
    absentOnLine: [
      [1, "string.quoted.double.mermaid"],
      [1, "support.type.property-name.mermaid"],
    ],
  },
  {
    name: "follow-up: opaque agentflow data has one unquoted scope per token",
    code: 'agentflow-beta\nA@{ assigned: "k" }',
    scopes: [["@{", "meta.data.mermaid"]],
    absentOnLine: [
      [1, "string.quoted.double.mermaid"],
      [1, "support.type.property-name.mermaid"],
    ],
  },
  {
    name: "follow-up: opaque sequence data has one unquoted scope per token",
    code: 'sequenceDiagram\nparticipant A@{ assigned: "k" }',
    scopes: [["@{", "meta.data.mermaid"]],
    absentOnLine: [
      [1, "string.quoted.double.mermaid"],
      [1, "support.type.property-name.mermaid"],
    ],
  },
  {
    name: "follow-up: opaque usecase data has one unquoted scope per token",
    code: 'usecase-beta\njson J @ {"assigned": {"name": "k}"}}',
    scopes: [["{", "meta.data.mermaid"]],
    absentOnLine: [
      [1, "string.quoted.double.mermaid"],
      [1, "support.type.property-name.mermaid"],
    ],
  },
  {
    name: "follow-up: opaque eventmodeling data has one unquoted scope per token",
    code: 'eventmodeling\ntf 01 evt A {"assigned": {"name": "k}"}}',
    scopes: [["{", "meta.data.mermaid"]],
    absentOnLine: [
      [1, "string.quoted.double.mermaid"],
      [1, "support.type.property-name.mermaid"],
    ],
  },
  {
    name: "follow-up: usecase JSON at remains its own unit",
    code: 'usecase-beta\njson J @ {"a": 1}',
    scopes: [
      ["@", "punctuation.separator.at.mermaid"],
      ["@", "meta.data.mermaid"],
    ],
  },
  {
    name: "follow-up: eventmodeling quoted inline values remain strings",
    code: 'eventmodeling\ntf 01 evt A "double"\ntf 02 evt B \'single\'\ntf 03 evt C {"k":"v"}',
    scopes: [
      ["double", "string.quoted.double.mermaid"],
      ["single", "string.quoted.single.mermaid"],
      ['"k":"v"', "string.unquoted.mermaid"],
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
      [":", "punctuation.separator.colon.mermaid"],
      ["dark", "string.unquoted.directive.mermaid"],
    ],
    absent: [[":", "punctuation.separator.key-value.mermaid"]],
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
      [2, "punctuation.separator.comma.mermaid"],
      [5, "constant.numeric.mermaid"],
    ],
  },
  {
    name: "follow-up: pending colon and closer cross blank lines",
    code: "pie\n%%{init\n\n: dark\n\n}%%\ntitle t",
    scopes: [
      [":", "punctuation.separator.colon.mermaid"],
      ["dark", "string.unquoted.directive.mermaid"],
      ["}%%", "punctuation.definition.directive.end.mermaid"],
      ["title", "keyword.control.mermaid"],
    ],
    absent: [["title", "meta.directive.mermaid"]],
  },
  {
    name: "follow-up: word argument whitespace retains a closer after blank lines",
    code: "pie\n%%{init: dark\n\n\n}%%\ntitle t",
    scopes: [
      ["dark", "string.unquoted.directive.mermaid"],
      ["}%%", "punctuation.definition.directive.end.mermaid"],
      ["title", "keyword.control.mermaid"],
    ],
    absent: [["title", "meta.directive.mermaid"]],
  },
]

describe("the lexical boundaries", () => {
  it("keeps only the outer JSON braces as data delimiters", () => {
    const input = boundaries.find(
      (boundary) => boundary.name === "a usecase JSON value is opaque data",
    )
    if (!input) throw new Error("missing fixed JSON input")
    const line = tokenLines(input.code)[1] ?? []
    const begin = line.findIndex((token) =>
      token.scopes.includes("punctuation.section.data.begin.mermaid"),
    )
    const end = line.findIndex((token) =>
      token.scopes.includes("punctuation.section.data.end.mermaid"),
    )
    expect(begin).toBeGreaterThan(0)
    expect(end).toBe(line.length - 1)
    for (const token of line.slice(begin + 1, end)) {
      expect(token.scopes, token.content).toEqual([
        "meta.data.mermaid",
        "string.unquoted.mermaid",
      ])
    }
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
        ["punctuation.definition.special-sequence.begin.mermaid"],
        ["punctuation.definition.special-sequence.end.mermaid"],
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
            token.scopes.includes("punctuation.separator.colon.mermaid") &&
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

  it("keeps each opaque data interior in one unquoted scope per token", () => {
    for (const name of [
      "follow-up: opaque kanban data has one unquoted scope per token",
      "follow-up: opaque flowchart data has one unquoted scope per token",
      "follow-up: opaque agentflow data has one unquoted scope per token",
      "follow-up: opaque sequence data has one unquoted scope per token",
      "follow-up: opaque usecase data has one unquoted scope per token",
      "follow-up: opaque eventmodeling data has one unquoted scope per token",
    ]) {
      const input = boundaries.find((boundary) => boundary.name === name)
      if (!input) throw new Error(`missing fixed data input: ${name}`)
      const line = tokenLines(input.code).find((lineTokens) =>
        lineTokens.some((token) =>
          token.scopes.includes("punctuation.section.data.begin.mermaid"),
        ),
      )
      if (!line) throw new Error(`missing data delimiters: ${name}`)
      const begin = line.findIndex((token) =>
        token.scopes.includes("punctuation.section.data.begin.mermaid"),
      )
      const end = line.findIndex((token) =>
        token.scopes.includes("punctuation.section.data.end.mermaid"),
      )
      expect(end, name).toBeGreaterThan(begin + 1)
      for (const token of line.slice(begin + 1, end)) {
        expect(token.scopes, token.content).toEqual([
          "meta.data.mermaid",
          "string.unquoted.mermaid",
        ])
      }
    }
  })

  it.each(boundaries)("colors $name", ({ code, ...expected }) => {
    checkScopes(code, expected)
  })
})
