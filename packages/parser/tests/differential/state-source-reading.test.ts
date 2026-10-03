/**
 * The Db summary of a state diagram (`dbOf`) reads some text outside the
 * range of every node, or reads a node's text up to a boundary that the
 * units give: the second description of an alias, which may be empty or
 * all whitespace, the description of an alias as written or trimmed, the
 * text of a note on one line from right after its id, the position of a
 * note as written, and the parts of the styles of `style` and `classDef`,
 * empty ones included. Each input here puts one or two spaces, a tab,
 * U+2028, or U+2029 at every place of one such statement, or of a
 * statement whose values are trimmed. The parser must agree with the
 * pinned mermaid.js on each input: the same acceptance and, for an
 * accepted input, the Db built from the tree. A difference is allowed only
 * as a declared known divergence that its own check explains
 * (`mermaid-comparison.ts`).
 */
import { describe, expect, it } from "vitest"
import type { MutationInput } from "@mmd-toolkit/tests/mutation"
import {
  checkDirectiveDivergences,
  compareDecided,
  inputsByOutcome,
} from "./mermaid-comparison.ts"
import { timeoutFor } from "./run-size.ts"

/** The header line that the statements stand after. */
const HEADER = "stateDiagram-v2\n"

/** The statements whose Db reads text at the boundaries of its units. */
const STATEMENTS: readonly string[] = [
  // A description and a label, trimmed.
  "A : x y",
  "A --> B : x y",
  // The descriptions of an alias: the string trimmed without a body and
  // as written with one, and the second description as written.
  'state "d" as A : m',
  'state " d " as A',
  'state " d " as A {\n  B\n}',
  // An id that may hold whitespace.
  "state f 1 <<fork>>",
  // The text of a note on one line from right after its id, and the text
  // of a note over lines; the position as written.
  "note left of A : x y",
  "note right of A\n  x\nend note",
  // The parts of styles, empty ones included, and the class of `class`.
  "A\nstyle A x,,y",
  "classDef c x,,y",
  "A\nclass A c d",
  // Accessibility values.
  "accTitle: x y",
  "accDescr: x y",
  "accDescr {\n  x\n  y\n}",
  // The strings of a click statement, with their quotes.
  'A\nclick A "u" "t"',
]

/** What is put at each place of a statement. */
const INSERTIONS: readonly string[] = [" ", "  ", "\t", "\u2028", "\u2029"]

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

describe("the Db of a state diagram reads the source at the boundaries of the units", () => {
  const { decided, unsupported } = inputsByOutcome(insertedInputs())
  const timeout = timeoutFor(decided.length)

  it("has only state diagrams among the inputs", () => {
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
})
