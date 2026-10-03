/**
 * The Db summary of a class diagram (`dbOfTree`) reads some text outside the
 * range of every node, or reads a node's text up to a boundary that the
 * units give: the character after the visibility mark of a member, the
 * whitespace between the units of a style and of a name, the whitespace of
 * a generic type, a label, or an annotation line that has no node of its
 * own, and a backquoted name that is not closed. Each input here puts a
 * space, a tab, a directive, or a comment line at every place of one such
 * statement, or one or two spaces or a tab at every place of a member line,
 * where the Db reads the start of the member name text and the whitespace
 * before a classifier mark that ends a return type. The parser must agree
 * with the pinned mermaid.js on each input:
 * the same acceptance and, for an accepted input, the Db built from the
 * tree. A difference is allowed only as a declared known divergence that
 * its own check explains (`mermaid-comparison.ts`).
 */
import { describe, expect, it } from "vitest"
import type { MutationInput } from "@mmd-toolkit/tests/mutation"
import {
  checkDirectiveDivergences,
  checkLineBreakCommentDivergences,
  compareDecided,
  inputsByOutcome,
} from "./mermaid-comparison.ts"
import { timeoutFor } from "./run-size.ts"

/** The header line that the statements stand after. */
const HEADER = "classDiagram\n"

/** The statements whose Db reads text at the boundaries of its units. */
const STATEMENTS: readonly string[] = [
  // The space after a visibility mark, inside and at the end of the
  // member text.
  "class A {\n+ x\n}",
  "class A {\n+ foo() int\n}",
  "A : + x$",
  "A : +  ",
  // The units of a style, joined without the whitespace between them.
  "class A\nstyle A fill : red , color : blue",
  "class A:::c\nclassDef c fill : red",
  // A label, a generic type, and an annotation line that may be all
  // whitespace.
  "A --> B : x",
  "A --> B : ",
  "class A~T~",
  "class A~ ~",
  "class A {\n<< y >>\n}",
  "class A {\n<<  >>\n}",
  // A note, a link, and a tooltip, as written or without the whitespace
  // at their ends.
  'note for A " x "',
  'class A\nclick A href " u " " t "',
  // A backquoted name that is not closed, which runs to the end.
  "class `x",
]

/**
 * Member lines with a part at each place where the Db reads whitespace:
 * after a visibility mark, after `)`, after a return type before a
 * classifier mark, and after U+2028 and U+2029, which start a segment.
 */
const MEMBER_LINES: readonly string[] = [
  "+foo(a) int$",
  "+foo(a)$ int",
  "-x int*",
  "x\u2028+b(c) int$",
  "+b(c)\u2029t",
  "x\u2028(c) int",
]

/** What is put at each place of a member line. */
const MEMBER_LINE_INSERTIONS: readonly string[] = [" ", "  ", "\t"]

/** What is put at each place of a statement. */
const INSERTIONS: readonly string[] = [" ", "\t", "%%{init: {}}%%", "\n%%\n"]

/** Every statement with each insertion at each of its places, with the header line before it. */
function insertedInputs(): MutationInput[] {
  const inputs: MutationInput[] = []
  const texts = new Set<string>()
  for (const statement of STATEMENTS) {
    const characters = [...statement]
    for (let index = 0; index <= characters.length; index += 1) {
      for (const insertion of INSERTIONS) {
        const text =
          HEADER +
          [
            ...characters.slice(0, index),
            insertion,
            ...characters.slice(index),
          ].join("")
        if (texts.has(text)) continue
        texts.add(text)
        inputs.push({
          name: `${JSON.stringify(insertion)} at ${index} of ${JSON.stringify(statement)}`,
          text,
        })
      }
    }
  }
  return inputs
}

/**
 * Every member line, in a class body and in the label of a member
 * statement, with each of `MEMBER_LINE_INSERTIONS` at each of its places,
 * with the header line before it.
 */
function memberLineInputs(): MutationInput[] {
  const inputs: MutationInput[] = []
  const texts = new Set<string>()
  for (const line of MEMBER_LINES) {
    const characters = [...line]
    for (let index = 0; index <= characters.length; index += 1) {
      for (const insertion of MEMBER_LINE_INSERTIONS) {
        const changed = [
          ...characters.slice(0, index),
          insertion,
          ...characters.slice(index),
        ].join("")
        for (const statement of [
          `class A {\n${changed}\n}`,
          `A : ${changed}`,
        ]) {
          const text = HEADER + statement
          if (texts.has(text)) continue
          texts.add(text)
          inputs.push({
            name: `${JSON.stringify(insertion)} at ${index} of ${JSON.stringify(line)}`,
            text,
          })
        }
      }
    }
  }
  return inputs
}

describe("the Db of a class diagram reads the source at the boundaries of the units", () => {
  const { decided, unsupported } = inputsByOutcome([
    ...insertedInputs(),
    ...memberLineInputs(),
  ])
  const timeout = timeoutFor(decided.length)

  it("has only class diagrams among the inputs", () => {
    expect(unsupported).toEqual([])
  })

  it(
    "accepts and rejects what mermaid.js does, with the same Db",
    async () => {
      const comparison = await compareDecided(decided)
      expect(comparison.skipped).toEqual([])
      expect(
        comparison.mismatches.map((mismatch) => ({
          from: mismatch.from,
          text: mismatch.text,
          kind: mismatch.kind,
        })),
      ).toEqual([])
      expect(comparison.compared).toBe(decided.length)
      // Guards against the check passing vacuously.
      expect(comparison.comparedParts.db).toBeGreaterThan(0)
      expect(
        comparison.unexplainedEmbeddedData.map((divergence) => ({
          text: divergence.text,
          kind: divergence.kind,
        })),
      ).toEqual([])
    },
    timeout,
  )

  it(
    "differs from mermaid.js on `directive-as-token-boundary` only because of a directive",
    async () => {
      const check = await checkDirectiveDivergences(decided)
      expect(check.mismatches).toEqual([])
      expect(
        check.unexplained.map((divergence) => ({
          from: divergence.from,
          text: divergence.text,
          kind: divergence.kind,
        })),
      ).toEqual([])
    },
    timeout,
  )

  it(
    "differs from mermaid.js on `comment-takes-line-break` only because of a comment after a unit",
    async () => {
      const check = await checkLineBreakCommentDivergences(decided)
      expect(check.mismatches).toEqual([])
    },
    timeout,
  )
})
