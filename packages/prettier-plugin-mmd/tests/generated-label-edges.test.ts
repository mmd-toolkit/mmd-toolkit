/**
 * Formats labels whose first or last characters are ASCII punctuation, next
 * to whitespace, in every kind of bracket that holds a label. Removing the
 * whitespace at the ends of a label joins its first characters to the
 * bracket, which can change how the bracket is read (docs/flowchart.md,
 * Label inner whitespace).
 */
import { describe, expect, it } from "vitest"
import type { GeneratedInput } from "./generated.ts"
import { checkGeneratedInputs, describeReport } from "./generated.ts"

/** The text before and after a label, for each place that holds one. */
const brackets: readonly (readonly [before: string, after: string])[] = [
  ["A[", "]"],
  ["A(", ")"],
  ["A((", "))"],
  ["A(((", ")))"],
  ["A([", "])"],
  ["A[[", "]]"],
  ["A[(", ")]"],
  ["A>", "]"],
  ["A{", "}"],
  ["A{{", "}}"],
  ["A[/", "/]"],
  ["A[\\", "\\]"],
  ["A[/", "\\]"],
  ["A[\\", "/]"],
  ["A(-", "-)"],
  ["A[/", "/?]"],
  ["A[/", "/=]"],
  ["A-->|", "|B"],
  ["A-- ", " -->B"],
  ["A== ", " ==>B"],
  ["A-. ", " .->B"],
  ["subgraph S[", "]\n  end"],
]

/** The printable ASCII characters that are neither letters nor digits. */
function punctuation(): string[] {
  const characters: string[] = []
  for (let codePoint = 0x21; codePoint <= 0x7e; codePoint++) {
    const character = String.fromCodePoint(codePoint)
    const isLetterOrDigit =
      ("0" <= character && character <= "9") ||
      ("A" <= character && character <= "Z") ||
      ("a" <= character && character <= "z")
    if (!isLetterOrDigit) characters.push(character)
  }
  return characters
}

/** The labels made with a punctuation character, at the start, the end, or both. */
function labelsWith(character: string): string[] {
  return [
    `${character}x`,
    `x${character}`,
    character,
    `${character}${character}x${character}${character}`,
    `a${character}b c`,
    `a ${character}b`,
  ]
}

/** Every label in every bracket, with whitespace at both ends. */
function* makeInputs(): Generator<GeneratedInput> {
  for (const [before, after] of brackets) {
    for (const character of punctuation()) {
      for (const label of labelsWith(character)) {
        yield {
          text: `flowchart TD\n  ${before} ${label} ${after}\n`,
          options: {},
        }
      }
    }
  }
}

describe("labels with punctuation at their ends", () => {
  it("are formatted without changing the diagram", async ({ annotate }) => {
    const report = await checkGeneratedInputs(makeInputs())
    await annotate(describeReport(report))
    expect(report.checked).toBeGreaterThan(0)
    expect(report.problems).toEqual([])
  }, 600_000)
})
