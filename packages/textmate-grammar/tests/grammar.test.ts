import { readdirSync, readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import type { HighlighterCore } from "shiki/core"
import { createHighlighterCore } from "shiki/core"
import { createOnigurumaEngine } from "shiki/engine/oniguruma"
import yaml from "shiki/langs/yaml.mjs"
import light from "shiki/themes/github-light.mjs"
import { beforeAll, describe, expect, it } from "vitest"
import mermaid from "../index.js"

/** The root scope of the grammar, which every token has and the tests omit. */
const rootScope = "source.mermaid"

/** Resolves a path under `tests/fixtures/`. */
function fixture(name: string): string {
  return fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url))
}

/** Reads the input of a fixture of the conformance corpus, `<diagram>/<name>`. */
function corpusInput(name: string): string {
  return readFileSync(
    new URL(`../../tests/fixtures/${name}/input.mmd`, import.meta.url),
    "utf8",
  )
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
 * detection.md: "Each entry except entry 2 has a minimal input that mermaid.js
 * accepts as that id", with its fixtures, and the further header spellings
 * that the documents of the diagram types accept, with the fixture that the
 * sentence cites (or, for `graph`, an accepted fixture that starts with it).
 */
const headerFixtures = [
  "common/detect-minimal-agentflow",
  "common/detect-minimal-architecture",
  "common/detect-minimal-block",
  "common/detect-minimal-c4",
  "common/detect-minimal-c4-component",
  "common/detect-minimal-c4-container",
  "common/detect-minimal-c4-deployment",
  "common/detect-minimal-c4-dynamic",
  "common/detect-minimal-class-diagram",
  "common/detect-minimal-cynefin",
  "common/detect-minimal-er",
  "common/detect-minimal-eventmodeling",
  "common/detect-minimal-flowchart-elk",
  "common/detect-minimal-flowchart-v2",
  "common/detect-minimal-gantt",
  "common/detect-minimal-git-graph",
  "common/detect-minimal-info",
  "common/detect-minimal-ishikawa",
  "common/detect-minimal-journey",
  "common/detect-minimal-kanban",
  "common/detect-minimal-mindmap",
  "common/detect-minimal-packet",
  "common/detect-minimal-pie",
  "common/detect-minimal-quadrant-chart",
  "common/detect-minimal-radar",
  "common/detect-minimal-railroad",
  "common/detect-minimal-railroad-abnf",
  "common/detect-minimal-railroad-ebnf",
  "common/detect-minimal-railroad-peg",
  "common/detect-minimal-requirement",
  "common/detect-minimal-sankey",
  "common/detect-minimal-sequence",
  "common/detect-minimal-state-diagram",
  "common/detect-minimal-swimlane",
  "common/detect-minimal-timeline",
  "common/detect-minimal-tree-view",
  "common/detect-minimal-treemap",
  "common/detect-minimal-usecase",
  "common/detect-minimal-venn",
  "common/detect-minimal-wardley",
  "common/detect-minimal-xychart",
  "common/detect-cynefin-colon",
  "sankey/db-header-beta",
  "packet/spec-packet-c4580507",
  "treemap/header-beta",
  "ishikawa/header-beta-mixed-case",
  "block/header-block-beta",
  "xychart/db-header-beta-only",
  "state/header-v2",
  "class/header-v2",
  "radar/header-colon-inline",
  "flowchart/demo-flowchart-06b5149f",
]

describe("the headers of every diagram type", () => {
  it.each(headerFixtures)("colors the header of %s", (name) => {
    const [first] = tokenLines(corpusInput(name))
    const header = first?.find((token) => token.content.trim() !== "")
    expect(header?.scopes).toContain("keyword.control.mermaid")
  })
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
      [")", "punctuation.section.parens.end.mermaid"],
      [";", "punctuation.terminator.rule.mermaid"],
    ],
    absent: [[")", "string.quoted.double.mermaid"]],
  },
  {
    name: "a railroad HTML tag reads a directive inside a quote escape",
    code: 'railroad-beta\nr=terminal("<b \\%%{wrap}%%"text>");',
    scopes: [
      ["wrap", "entity.name.function.directive.mermaid"],
      ['"text>', "string.quoted.double.mermaid"],
      [";", "punctuation.terminator.rule.mermaid"],
    ],
    absent: [[";", "string.quoted.double.mermaid"]],
  },
  // usecase.md#json-context: Backslash protects exactly the next character.
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
  // usecase.md#ordered-default-context-rules: Only backquote plus double
  // quote ends markdown; attribute quotes convert before that reading.
  {
    name: "a markdown HTML tag keeps a lone backquote before a quoted value",
    code: 'usecase-beta\nA("`<b` x="`">z`")',
    scopes: [
      ['<b` x="`">', "string.quoted.other.markdown.mermaid"],
      ["z", "string.quoted.other.markdown.mermaid"],
      ['`"', "punctuation.definition.string.end.mermaid"],
      [")", "keyword.control.mermaid"],
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
      [")", "keyword.control.mermaid"],
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
  // usecase.md#json-context permits escapes of both Unicode separators,
  // unlike packet.md#numbers-and-strings.
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
  // common.md#html-attribute-quotes ends the tag at its first greater-than
  // sign; leave an escape crossing it whole for the enclosing string.
  {
    name: "a packet HTML tag leaves an escaped tag closer to the string",
    code: 'packet 0:"<b \\>"\n1:"x"',
    scopes: [
      ["\\>", "constant.character.escape.mermaid"],
      ["1", "constant.numeric.decimal.mermaid"],
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
      ["1", "constant.numeric.decimal.mermaid"],
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
      [")", "keyword.control.mermaid", 1],
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
      ["<b", "string.quoted.double.mermaid"],
      ['`"', "punctuation.definition.string.end.mermaid"],
      ["]", "punctuation.definition.label.end.mermaid"],
      ["-->", "keyword.operator.arrow.mermaid"],
      ["B", "variable.other.id.mermaid"],
    ],
    absent: [["-->", "string.quoted.double.mermaid"]],
  },
  {
    // agentflow.md#names-strings-and-click-text retains flowchart's rules.
    name: "agentflow markdown closes before its shape and comment after an HTML opener",
    code: 'agentflow-beta LR;A["`<b`"]%% >',
    scopes: [
      ["<b", "string.quoted.double.mermaid"],
      ['`"', "punctuation.definition.string.end.mermaid"],
      ["]", "punctuation.definition.label.end.mermaid"],
      ["%% >", "comment.line.percentage.mermaid"],
    ],
    absent: [["%% >", "string.quoted.double.mermaid"]],
  },
  {
    name: "a flowchart HTML tag keeps a closing quote inside its directive",
    code: 'flowchart LR;A["<b %%{init: >"}%%text"]',
    scopes: [
      ['>"', "string.unquoted.directive.mermaid"],
      ["}%%", "punctuation.definition.directive.end.mermaid"],
      ["text", "string.quoted.double.mermaid"],
      ["]", "punctuation.definition.label.end.mermaid"],
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
      ["]", "punctuation.definition.label.end.mermaid"],
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
      ["]", "punctuation.section.brackets.end.mermaid"],
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
      [";", "punctuation.terminator.rule.mermaid"],
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
      [")", "keyword.control.mermaid"],
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
      [")", "keyword.control.mermaid"],
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
      ["Kept", "variable.other.id.mermaid"],
    ],
    absent: [["tf", "comment.block.ignored.mermaid"]],
  },
  {
    name: "hidden railroad YAML closes after a leading directive",
    code: 'railroad-beta\n---\nx\n%%{wrap}%%---\nr=terminal("x");',
    scopes: [
      ["wrap", "entity.name.function.directive.mermaid"],
      ["terminal", "support.function.mermaid"],
      [";", "punctuation.terminator.rule.mermaid"],
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
      ["complex", "keyword.control.mermaid"],
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
      ["]", "keyword.control.mermaid"],
      ["%% >", "comment.line.percentage.mermaid"],
    ],
    absentOnLine: [[0, "string.quoted.double.mermaid"]],
  },
  {
    name: "mindmap shape text owns a quote after its first character",
    code: 'mindmap A[<b x="y] %% >',
    scopes: [
      ['<b x="y', "string.unquoted.mermaid"],
      ["]", "punctuation.definition.shape.end.mermaid"],
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
      ["]", "keyword.control.mermaid"],
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
      ["]", "punctuation.definition.shape.end.mermaid"],
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
      ["q", "string.quoted.double.mermaid"],
      ["init", "entity.name.function.directive.mermaid"],
      ["}", "punctuation.section.braces.end.mermaid"],
    ],
    absentOnLine: [[1, "comment.line.percentage.mermaid"]],
  },
  {
    name: "an agentflow data tag ends inside a directive before a quoted value",
    code: 'agentflow-beta LR\nA@{<b %%{init: >}%% t="q"}',
    scopes: [
      ["q", "string.quoted.double.mermaid"],
      ["init", "entity.name.function.directive.mermaid"],
      ["}", "punctuation.section.braces.end.mermaid"],
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
      ["}", "punctuation.section.braces.end.mermaid"],
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
      [";", "punctuation.terminator.rule.mermaid"],
    ],
    absent: [[",", "string.quoted.double.mermaid"]],
  },
  {
    name: "an agentflow HTML tag ends before a shape closer and native comment",
    code: 'agentflow-beta LR;A["<b %%{init: >}%% t="]%% c ">',
    scopes: [
      ["]", "punctuation.definition.label.end.mermaid"],
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
    absentOnLine: [[1, "keyword.operator.range.mermaid"]],
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
      ["a", "variable.other.id.mermaid"],
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
      ["a", "variable.other.id.mermaid"],
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
      ["]", "punctuation.definition.label.end.mermaid"],
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
      ["before\u2029%% data content", "string.unquoted.data.mermaid"],
      ["after", "string.unquoted.data.mermaid"],
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
    scopes: [["dark", "string.unquoted.directive.mermaid"]],
    absent: [
      ["foo}", "meta.directive.mermaid"],
      ["foo}", "comment.line.percentage.mermaid"],
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
      ["}^", "string.quoted.double.mermaid"],
      ["\\", "string.quoted.double.mermaid"],
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
    scopes: [["evtLong", "variable.other.id.mermaid"]],
    absent: [["evtLong", "keyword.control.mermaid"]],
  },
  {
    name: "a longer radar identifier",
    code: "radar-beta\naxis axisLong\ncurve curveLong{1}\n",
    scopes: [["axisLong", "variable.other.id.mermaid"]],
    absent: [["axisLong", "keyword.control.mermaid"]],
  },
  {
    name: "a longer venn identifier",
    code: "venn-beta\nset setter:2\nset unionized:3\n",
    scopes: [["setter", "variable.other.id.mermaid"]],
    absent: [["setter", "keyword.control.mermaid"]],
  },
  {
    name: "a longer usecase identifier",
    code: "usecase-beta\nactor actorLong\nactorLong --> node(noteLong)\n",
    scopes: [["actorLong", "variable.other.id.mermaid"]],
    absent: [["actorLong", "keyword.control.mermaid"]],
  },
  {
    name: "a longer agentflow identifier",
    code: "agentflow-beta\nclassLong --> styleLong\n",
    scopes: [["classLong", "variable.other.id.mermaid"]],
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
      ["tag", "entity.name.type.class.mermaid"],
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
    absent: [["accTitle", "variable.other.rule.mermaid"]],
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
    scopes: [["? #amp; ?", "string.other.special-sequence.mermaid"]],
    absent: [["? #amp; ?", "punctuation.terminator.rule.mermaid"]],
  },
  {
    // common.md#entities: A directive may lie right before the semicolon.
    name: "an entity with a directive before its semicolon inside a special sequence",
    code: "railroad-ebnf-beta\nentity = ? #amp%%{wrap}%%; ? ;\n",
    scopes: [
      ["wrap", "entity.name.function.directive.mermaid"],
      ["; ?", "string.other.special-sequence.mermaid"],
    ],
    absent: [["; ?", "punctuation.terminator.rule.mermaid"]],
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
]

describe("the lexical boundaries", () => {
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
            token.scopes.includes("punctuation.separator.colon.mermaid"),
        ),
    ).toHaveLength(2)
  })

  it.each(boundaries)("colors $name", ({ code, ...expected }) => {
    checkScopes(code, expected)
  })
})
