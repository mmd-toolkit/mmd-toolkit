/**
 * Formats statements of every diagram type with a directive written at every
 * place inside them, also in the middle of a word, and with whitespace or a
 * `;` after the statement. A directive cuts a value into fragments, and what
 * formatting keeps as written, or reads at the end of a value, must not cut
 * a node in the middle (ast.md, Directive).
 */
import type { GeneratedInput } from "../generated.ts"
import { diagrams } from "../generated-statements.ts"

/** A directive that changes nothing. */
const DIRECTIVE = "%%{init: {}}%%"

/** What follows the statement. */
const endings: readonly string[] = ["", " ", ";", " ;", "\t"]

/** Whether a character is an ASCII letter or digit. */
function isWordCharacter(character: string | undefined): boolean {
  return (
    character !== undefined &&
    ((character >= "0" && character <= "9") ||
      (character >= "A" && character <= "Z") ||
      (character >= "a" && character <= "z"))
  )
}

/** Whether a word starts or ends at the offset: inside a word every offset reads the same, but for the one after its first character. */
function isWordEdge(text: string, offset: number): boolean {
  return isWordCharacter(text[offset - 1]) !== isWordCharacter(text[offset])
}

/** Whether the offset is right after the first character of a word, where a directive cuts the word. */
function startsWord(text: string, offset: number): boolean {
  return (
    isWordCharacter(text[offset - 1]) &&
    isWordCharacter(text[offset]) &&
    !isWordCharacter(text[offset - 2])
  )
}

/** Every statement with the directive at each of its word edges, and inside each word. */
export function* makeInputs(): Generator<GeneratedInput> {
  for (const { header, statements, blockOpenings, blockClosing } of diagrams) {
    for (const statement of [...statements, ...blockOpenings]) {
      const closing = blockOpenings.includes(statement) ? blockClosing : ""
      for (let offset = 1; offset <= statement.length; offset++) {
        if (!isWordEdge(statement, offset) && !startsWord(statement, offset)) {
          continue
        }
        // The ending takes turns from one offset to the next.
        const ending = endings[offset % endings.length]
        const cut = `${statement.slice(0, offset)}${DIRECTIVE}${statement.slice(offset)}`
        yield { text: `${header}\n${cut}${ending}${closing}\n`, options: {} }
      }
    }
  }
}
