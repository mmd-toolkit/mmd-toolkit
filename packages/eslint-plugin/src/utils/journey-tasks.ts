import type { JourneyTaskStatement, Token } from "@mmd-toolkit/parser"
import type { MermaidSourceCode } from "../source-code.ts"

/** The separators of the data of a task, as `Punctuator` tokens. */
export interface TaskSeparators {
  /** The colon after the description, which is also the colon before the score. */
  readonly firstColon: Token | undefined
  /**
   * The separator before each person of `people`, in order: the colon before
   * the people for the first, and the comma before the person for the others.
   */
  readonly beforePerson: readonly Token[]
}

/**
 * The separators of `task`. The tokens of a task are the `Punctuator` tokens
 * `:` after the description, `:` before the people, and the `,` between the
 * people, in order; the text of the data from its third colon is one `RawText`
 * token, whose colons are characters of it
 * (`packages/parser/docs/tokens/journey.md`).
 */
export function separatorsOf(
  sourceCode: MermaidSourceCode,
  task: JourneyTaskStatement,
): TaskSeparators {
  const [firstColon, ...beforePerson] = sourceCode
    .getTokens(task)
    .filter((token) => token.type === "Punctuator")
  return { firstColon, beforePerson }
}
