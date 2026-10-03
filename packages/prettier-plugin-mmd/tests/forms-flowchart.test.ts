/**
 * Formats labels whose first or last characters are ASCII punctuation, next
 * to whitespace, in every kind of bracket that holds a label. Removing the
 * whitespace at the ends of a label joins its first characters to the
 * bracket, which can change how the bracket is read (docs/flowchart.md,
 * Label inner whitespace).
 *
 * Every bracket is tried with every character, and every shape of label
 * with every bracket and every character, together in pairs (see
 * `pairwise.ts`).
 */
import type { GeneratedInput } from "./generated.ts"
import { defineCheckedGroups } from "./checked-groups.ts"
import { pairwiseIndexes } from "./pairwise.ts"

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

/** The shapes of a label made with a character: the label of each, for a character. */
const SHAPES = 6

/** Every label in every bracket, with whitespace at both ends. */
function makeLabels(): GeneratedInput[] {
  const characters = punctuation()
  return pairwiseIndexes([brackets.length, characters.length, SHAPES]).map(
    ([bracket, character, shape]) => {
      const [before, after] = brackets[bracket]
      const label = labelsWith(characters[character])[shape]
      return {
        text: `flowchart TD\n  ${before} ${label} ${after}\n`,
        options: {},
      }
    },
  )
}

defineCheckedGroups("flowchart labels with punctuation at their ends", [
  ["labels in every kind of bracket", makeLabels()],
])
