import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import { PUNCTUATOR_TEXTS } from "../src/check-tree/punctuators.ts"
import type {
  CheckedDirective,
  CheckedRoot,
  CheckedToken,
} from "../src/check-tree/types.ts"
import type { DiagramType } from "../src/index.ts"
import { getFixturesRoot, loadFixtures } from "../src/index.ts"
import { directiveOf, handMadeRoot } from "./check-tree-trees.ts"
import { cutToken } from "./check-tree-cuts.ts"
import type { Cut } from "./check-tree-cuts.ts"

// parser/docs/tokens.md, A token that a directive cuts: a directive, or a `;`
// that the line rule ignores, may lie inside a `String` token (the string is
// then `StringFragment` tokens) and inside a `RawText` token (then `RawText`
// tokens), and inside no other token. For each kind of token of each diagram
// the test writes a cut inside a recorded token, as a parser that cuts it
// would record the new text, and requires the check to report the tree; and
// for the tokens that may be cut it requires the tree of the cut token not to
// be reported, which shows that the trees made are those of a parser. For the
// texts of the table of `Punctuator` tokens, the cuts are made in trees made
// by hand, with other `Punctuator` tokens that the cuts attach.

/** The diagrams, with the type of their body. */
const DIAGRAM_BODIES: readonly [DiagramType, string][] = [
  ["flowchart", "FlowchartDiagram"],
  ["sequence", "SequenceDiagram"],
  ["class", "ClassDiagram"],
  ["state", "StateDiagram"],
]

const DIAGRAMS: readonly DiagramType[] = DIAGRAM_BODIES.map(
  ([diagram]) => diagram,
)

const CUTS: readonly Cut[] = ["directive", "ignored-semicolon"]

/** The kinds of token that no cut may lie inside. */
const KINDS_NEVER_CUT: ReadonlySet<string> = new Set([
  "Identifier",
  "Numeric",
  "Keyword",
  "Punctuator",
])

/** How many tokens of a kind are cut in each place, when the kind has many texts. */
const INSTANCES_OF_OPEN_KINDS = 4

/** A recorded tree with the tokens of one kind that the test cuts. */
interface Candidate {
  readonly name: string
  readonly input: string
  readonly json: string
  readonly index: number
  readonly token: CheckedToken
}

/**
 * The tokens to cut: for each diagram and kind of token, one for each text
 * when the kind has a small set of texts (`Keyword`, `Punctuator`), and the
 * first few when it has many (`Identifier`, `Numeric`, `String`, `RawText`),
 * outside the frontmatter and of two characters or more.
 */
async function candidates(kinds: ReadonlySet<string>): Promise<Candidate[]> {
  const found: Candidate[] = []
  const counts = new Map<string, number>()
  for (const diagram of DIAGRAMS) {
    for (const fixture of await loadFixtures(diagram)) {
      const file = path.join(
        getFixturesRoot(),
        diagram,
        fixture.name,
        "ast.json",
      )
      if (!existsSync(file)) continue
      const json = readFileSync(file, "utf8")
      const tree = JSON.parse(json) as CheckedRoot
      const frontmatterEnd = tree.frontmatter?.range[1] ?? 0
      for (const [index, token] of tree.tokens.entries()) {
        if (
          !kinds.has(token.type) ||
          token.range[0] < frontmatterEnd ||
          token.value.length < 2 ||
          token.value.includes("%%")
        ) {
          continue
        }
        const closedSet =
          token.type === "Keyword" || token.type === "Punctuator"
        const key = closedSet
          ? `${diagram} ${token.type} ${token.value}`
          : `${diagram} ${token.type}`
        const count = counts.get(key) ?? 0
        if (count >= (closedSet ? 1 : INSTANCES_OF_OPEN_KINDS)) continue
        counts.set(key, count + 1)
        found.push({
          name: `${diagram}/${fixture.name}`,
          input: fixture.input,
          json,
          index,
          token,
        })
      }
    }
  }
  return found
}

/** Which neighbours of a token a cut attaches to it. */
type Sides = "before" | "after" | "both"

const SIDES: readonly Sides[] = ["before", "after", "both"]

/** The texts of the tokens that a cut attaches to the token, before it and after it: a closing and an opening, and a separator. */
const NEIGHBOURS: readonly (readonly [before: string, after: string])[] = [
  [")", "("],
  [",", ","],
]

/**
 * The tree of a source made of `Punctuator` tokens only: the `pieces`, which
 * `cut` separates, with the neighbours of `sides` that `cut` attaches. The
 * body is an empty one of the type `body`.
 */
function punctuatorTree(
  body: string,
  neighbours: readonly [before: string, after: string],
  sides: Sides,
  cut: Cut,
  pieces: readonly string[],
): { text: string; tree: CheckedRoot } {
  const cutText = cut === "directive" ? "%%{init: {}}%%" : ";"
  const cutType = cut === "directive" ? "Directive" : "IgnoredSemicolon"
  const parts: [type: string, text: string][] = []
  if (sides !== "after") {
    parts.push(["Punctuator", neighbours[0]], [cutType, cutText])
  }
  for (const [at, piece] of pieces.entries()) {
    if (at > 0) parts.push([cutType, cutText])
    parts.push(["Punctuator", piece])
  }
  if (sides !== "before") {
    parts.push([cutType, cutText], ["Punctuator", neighbours[1]])
  }
  let text = ""
  const tokens: [string, { text: string; from: number }][] = []
  const directives: CheckedDirective[] = []
  for (const [type, part] of parts) {
    tokens.push([type, { text: part, from: text.length }])
    if (type === "Directive") {
      directives.push(
        directiveOf(text + part, { text: part, from: text.length }),
      )
    }
    text += part
  }
  return {
    text,
    tree: handMadeRoot(text, { bodyType: body, tokens, directives }),
  }
}

describe("a token that a directive or an ignored ; cuts", () => {
  it("is reported when the token is an Identifier, a Numeric, a Keyword, a Punctuator, or a String cut into String tokens", async () => {
    const never = await candidates(new Set([...KINDS_NEVER_CUT, "String"]))
    const unreported: string[] = []
    let made = 0
    for (const candidate of never) {
      const { token } = candidate
      const type = token.type
      for (const cut of CUTS) {
        for (
          let offset = token.range[0] + 1;
          offset < token.range[1];
          offset++
        ) {
          made++
          const { text, tree } = cutToken(
            candidate.input,
            candidate.json,
            candidate.index,
            offset,
            cut,
            { before: type, after: type },
          )
          if (checkTree(text, tree).length === 0) {
            unreported.push(
              `${candidate.name}: ${type} ${JSON.stringify(token.value)} cut by ${cut} at ${offset - token.range[0]}`,
            )
          }
        }
      }
    }
    expect(made).toBeGreaterThan(500)
    expect(unreported).toEqual([])
  }, 300_000)

  it("is not reported when a String is cut into StringFragment tokens, or a RawText into RawText tokens", async () => {
    const mayBeCut = await candidates(new Set(["String", "RawText"]))
    const reported: string[] = []
    let made = 0
    for (const candidate of mayBeCut) {
      const { token } = candidate
      const type = token.type === "String" ? "StringFragment" : "RawText"
      for (const cut of CUTS) {
        // One place inside the token that is not next to whitespace.
        const offset = [...token.value].findIndex(
          (character, position) =>
            position > 0 &&
            !/\s/u.test(character) &&
            !/\s/u.test(token.value.charAt(position - 1)),
        )
        if (offset === -1) continue
        made++
        const { text, tree } = cutToken(
          candidate.input,
          candidate.json,
          candidate.index,
          token.range[0] + offset,
          cut,
          { before: type, after: type },
        )
        const problems = checkTree(text, tree)
        if (problems.length > 0) {
          reported.push(
            `${candidate.name}: ${type} ${JSON.stringify(token.value)} cut by ${cut}: ${problems[0]?.where}: ${problems[0]?.message}`,
          )
        }
      }
    }
    expect(made).toBeGreaterThan(20)
    expect(reported).toEqual([])
  }, 300_000)

  it("is reported for each text of the table of Punctuator tokens, cut at every place, with neighbours that the cuts attach before it, after it, or both", () => {
    const unreported: string[] = []
    let made = 0
    for (const [diagram, body] of DIAGRAM_BODIES) {
      const texts = (PUNCTUATOR_TEXTS[body] ?? []).filter(
        (text) => text.length > 1,
      )
      for (const text of texts) {
        for (const neighbours of NEIGHBOURS) {
          for (const sides of SIDES) {
            for (const cut of CUTS) {
              const whole = punctuatorTree(body, neighbours, sides, cut, [text])
              const baseline = checkTree(whole.text, whole.tree).length
              for (let at = 1; at < text.length; at++) {
                made++
                const cutted = punctuatorTree(body, neighbours, sides, cut, [
                  text.slice(0, at),
                  text.slice(at),
                ])
                if (checkTree(cutted.text, cutted.tree).length <= baseline) {
                  unreported.push(
                    `${diagram}: ${JSON.stringify(text)} cut at ${at} by ${cut}, neighbours ${neighbours.join(" ")} ${sides}`,
                  )
                }
              }
            }
          }
        }
      }
    }
    expect(made).toBeGreaterThan(500)
    expect(unreported).toEqual([])
  })
})
