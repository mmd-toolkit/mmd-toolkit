import { describe, expect, it } from "vitest"
import type { Fixture } from "@mmd-toolkit/tests"
import { loadFixtures } from "@mmd-toolkit/tests"
import type { C4Diagram, Root } from "../src/index.ts"
import { ParseError, parse, traverseNodes } from "../src/index.ts"
import { isWhitespace } from "../src/character-classes.ts"
import { detectDiagram } from "../src/detection.ts"
import { lexC4 } from "../src/diagrams/c4/index.ts"
import { diagramInputOf, openSource } from "../src/parse.ts"
import { declaredDivergence, outcomeOf } from "./helpers/known-divergences.ts"

/** Acceptance specified by the corpus, including its declared C4 divergences. */
function accepts(fixture: Fixture): boolean {
  if (fixture.specified !== undefined) return fixture.specified.accepted
  switch (fixture.knownDivergence) {
    case "directive-as-token-boundary":
    case "ignored-semicolon-as-token-boundary":
      return false
    case "comment-takes-line-break":
    case "bare-percent-line-before-header":
    case "embedded-data-opaque":
      return true
    default:
      return fixture.expected.accepted
  }
}

/** Project invariant 3, together with containment and source order of child nodes. */
function expectCoverage(text: string, root: Root): void {
  const entries = [...root.tokens, ...root.comments].toSorted(
    (a, b) => a.range[0] - b.range[0],
  )
  let end = 0
  for (const entry of entries) {
    expect(entry.range[0]).toBeGreaterThanOrEqual(end)
    expect(entry.range[1]).toBeGreaterThan(entry.range[0])
    if (entry.type === "Comment")
      expect(text.slice(...entry.range).endsWith(entry.value)).toBe(true)
    else expect(entry.value).toBe(text.slice(...entry.range))
    for (const character of text.slice(end, entry.range[0])) {
      expect(isWhitespace(character.codePointAt(0)!)).toBe(true)
    }
    end = entry.range[1]
  }
  for (const character of text.slice(end))
    expect(isWhitespace(character.codePointAt(0)!)).toBe(true)
  const lastChildEnd = new Map<object, number>()
  traverseNodes(root, {
    enterNode(node, parent) {
      expect(node.loc.start.line).toBeGreaterThanOrEqual(1)
      if (parent === null) return
      expect(node.range[0]).toBeGreaterThanOrEqual(
        lastChildEnd.get(parent) ?? parent.range[0],
      )
      expect(node.range[1]).toBeLessThanOrEqual(parent.range[1])
      lastChildEnd.set(parent, node.range[1])
    },
    leaveNode() {
      // All assertions are made on entry.
    },
  })
}

// This suite never writes records and does not call mermaid.js or dbFromTree.
describe("c4 acceptance fixtures", async () => {
  const fixtures = await loadFixtures("c4")

  /** One fixed corpus input parsed as C4. */
  function rootOf(name: string): Root {
    const fixture = fixtures.find((candidate) => candidate.name === name)
    if (fixture === undefined) throw new Error(`no fixture ${name}`)
    return parse(fixture.input)
  }

  /** The C4 body of a fixed corpus input. */
  function diagramOf(name: string): C4Diagram {
    const root = rootOf(name)
    if (root.body.type !== "C4Diagram") throw new Error("no C4 body")
    return root.body
  }

  it("keeps empty blocks in the header gap and the boundary gap", () => {
    expect(diagramOf("gram-empty-block-header-gap").beforeBody).toMatchObject([
      { type: "C4AccDescrBlockStatement", value: null },
    ])
    const boundary = diagramOf("gram-empty-block-after-args-before-body")
      .body[0]
    expect(boundary).toMatchObject({
      type: "C4BoundaryStatement",
      beforeBody: [{ value: null }],
    })
  })

  it("keeps a bare argument across a closing parenthesis and line feed", () => {
    expect(diagramOf("lex-bare-across-close-and-line").body[0]).toMatchObject({
      arguments: [
        { type: "C4Literal", value: "a)\ncontinued" },
        { type: "StringLiteral", value: "A" },
      ],
    })
  })

  it("keeps a null named key and a closed quoted value", () => {
    expect(diagramOf("lex-named-empty-key").body[0]).toMatchObject({
      arguments: [
        { value: "a" },
        { value: "A" },
        { type: "C4NamedAttribute", key: null, value: { closed: true } },
      ],
    })
  })

  it("keeps written CRLF and removes directives from bare and quoted values", () => {
    const bare = diagramOf("lex-bare-crlf-directive").body[0]
    const quoted = diagramOf("lex-quote-crlf-directive").body[0]
    expect(bare).toMatchObject({
      arguments: [{ value: "a\r\nb" }, { value: "A" }],
    })
    expect(quoted).toMatchObject({
      arguments: [{ value: "a" }, { value: "x\r\ny" }],
    })
  })

  it("keeps null entries distinct from empty strings and trailing commas", () => {
    expect(diagramOf("lex-double-comma").body[0]).toMatchObject({
      arguments: [{ value: "a" }, null, { value: "D" }],
    })
    expect(diagramOf("lex-trailing-comma").body[0]).toMatchObject({
      arguments: [{ value: "a" }, { value: "A" }],
    })
    expect(diagramOf("lex-empty-strings").body[0]).toMatchObject({
      arguments: [
        { type: "StringLiteral", value: "" },
        { type: "StringLiteral", value: "" },
      ],
    })
  })

  it("splits the named equals sign from the quoted value across a directive", () => {
    const root = rootOf("lex-directive-named-equals-quote")
    expect(root.tokens.map((token) => [token.type, token.value])).toEqual([
      ["Keyword", "C4Context"],
      ["Keyword", "Person"],
      ["Punctuator", "("],
      ["RawText", "a"],
      ["Punctuator", ","],
      ["String", '"A"'],
      ["Punctuator", ","],
      ["Punctuator", "$"],
      ["RawText", "descr"],
      ["Punctuator", "="],
      ["Directive", "%%{init: {}}%%"],
      ["String", '"V"'],
      ["Punctuator", ")"],
    ])
  })

  it("keeps title whitespace and fragments a string around common trivia", () => {
    expect(diagramOf("db-title-whitespace").body[0]).toMatchObject({
      type: "C4TitleStatement",
      value: { value: "   T   ", range: [16, 23] },
    })
    const root = rootOf("lex-quote-crlf-directive")
    expect(
      root.tokens
        .filter((token) => token.type === "StringFragment")
        .map((token) => token.value),
    ).toEqual(['"x\r', '\ny"'])
  })

  it.each([
    [
      "lex-keyword-eof",
      "The call keyword has no ( before the end of the text",
      [10, 16],
    ],
    [
      "lex-unclosed-parenthesis",
      "The arguments have no ) before the end of the text",
      [16, 17],
    ],
    [
      "lex-unclosed-quote",
      'The string has no closing " before the end of the text',
      [20, 21],
    ],
    [
      "lex-unclosed-named",
      'The string has no closing " before the end of the text',
      [31, 32],
    ],
    [
      "lex-named-open-eof",
      "The named attribute has no = before the end of the text",
      [24, 25],
    ],
    [
      "gram-unclosed-acctitle",
      "accTitle has no text before the end of the text",
      [10, 18],
    ],
    [
      "gram-unclosed-accdescr",
      "accDescr has no text before the end of the text",
      [10, 18],
    ],
    [
      "gram-acc-descr-block-unclosed",
      "The description block has no } before the end of the text",
      [10, 18],
    ],
    ["gram-named-empty-value", "Unexpected token", [32, 33]],
    ["gram-boundary-unclosed", "Unexpected end of text", [44, 44]],
    ["gram-direction-tb", "A direction line is not allowed in C4", [10, 22]],
    [
      "gram-named-proto",
      "A consumed named attribute cannot have the key __proto__",
      [48, 57],
    ],
  ] as const)("reports %s at its cause", (name, message, range) => {
    try {
      rootOf(name)
    } catch (error) {
      expect(error).toBeInstanceOf(ParseError)
      expect((error as ParseError).message).toBe(message)
      expect((error as ParseError).range).toEqual(range)
      return
    }
    throw new Error("expected a rejection")
  })

  for (const fixture of fixtures) {
    it(fixture.name, () => {
      let root: Root | null = null
      try {
        root = parse(fixture.input)
      } catch (error) {
        if (!(error instanceof ParseError)) throw error
      }
      expect(root !== null).toBe(accepts(fixture))
      if (
        fixture.knownDivergence === "directive-as-token-boundary" ||
        fixture.knownDivergence === "ignored-semicolon-as-token-boundary"
      ) {
        const outcome = outcomeOf(fixture.input)
        if (outcome.kind === "unsupported")
          throw new Error("C4 must be supported")
        expect(declaredDivergence(fixture.input, fixture.config, outcome)).toBe(
          fixture.knownDivergence,
        )
      }
      if (fixture.knownDivergence === "comment-takes-line-break") {
        const opened = openSource(fixture.input)
        const detection = detectDiagram(opened.lexer)
        const lexing = lexC4(diagramInputOf(opened, detection, "c4"))
        expect(lexing.comments.length).toBeGreaterThan(0)
      }
      if (root !== null) {
        expect(root.diagramType).toBe("c4")
        expectCoverage(fixture.input, root)
      }
    })
  }
})
