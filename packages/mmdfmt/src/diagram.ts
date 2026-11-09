import type { Options } from "prettier"
import { format } from "prettier"
import plugin from "prettier-plugin-mmd"
import type { LineEnding } from "./lines.ts"

/**
 * The options of a Prettier configuration that the tool uses (README,
 * Indentation). An option that the configuration does not set is
 * `undefined`, and Prettier then uses its default.
 */
export interface Indentation {
  readonly tabWidth: number | undefined
  readonly useTabs: boolean | undefined
}

/** The fields of the parser's syntax error that the tool reads. */
interface ParseError {
  readonly name: "ParseError"
  readonly message: string
  readonly range: readonly [number, number]
}

/** What formatting the text of a diagram gives. */
export type DiagramResult =
  | { readonly kind: "formatted"; readonly text: string }
  | {
      readonly kind: "rejected"
      readonly message: string
      /** The offset in the text where the syntax error is. */
      readonly offset: number
    }

/** Prettier's name of each line ending. */
const endOfLineOptions = {
  "\n": "lf",
  "\r\n": "crlf",
  "\r": "cr",
} as const satisfies Record<LineEnding, Options["endOfLine"]>

/**
 * Formats the text of a diagram with Prettier and prettier-plugin-mmd, as
 * Prettier formats a `.mmd` file with the plugin. The text has no byte order
 * mark and its lines end with `\n`, as Prettier leaves a text before parsing
 * it; the lines of the result end with `lineEnding`.
 *
 * For a text that the plugin rejects, its syntax error keeps the parser's
 * error as its `cause`. The cause gives the message without Prettier's code
 * frame and the offset in the text.
 */
export async function formatDiagram(
  text: string,
  indentation: Indentation,
  lineEnding: LineEnding,
): Promise<DiagramResult> {
  try {
    const formatted = await format(text, {
      parser: "mermaid",
      plugins: [plugin],
      tabWidth: indentation.tabWidth,
      useTabs: indentation.useTabs,
      endOfLine: endOfLineOptions[lineEnding],
    })
    return { kind: "formatted", text: formatted }
  } catch (error) {
    const cause = error instanceof Error ? error.cause : undefined
    if (!isParseError(cause)) throw error
    return {
      kind: "rejected",
      message: cause.message,
      offset: cause.range[0],
    }
  }
}

/**
 * Whether a value is the parser's syntax error. It is checked by name, as the
 * plugin checks it, so that the check also holds when two copies of the parser
 * are installed.
 */
function isParseError(error: unknown): error is ParseError {
  return error instanceof Error && error.name === "ParseError"
}
