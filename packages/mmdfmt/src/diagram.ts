import type { Options } from "prettier"
import { format, getSupportInfo, util } from "prettier"
import plugin from "prettier-plugin-mmd"
import type { LineEnding } from "./lines.ts"
import type { ReadOptions } from "./options.ts"

/** The default of a Prettier option that is a number, as Prettier states it. */
async function defaultNumberOption(name: string): Promise<number> {
  const { options } = await getSupportInfo()
  const option = options.find((candidate) => candidate.name === name)
  if (typeof option?.default !== "number") {
    throw new Error(`Prettier states no numeric default for ${name}`)
  }
  return option.default
}

/**
 * The line width left for the lines of a diagram that the tool writes after
 * `prefix`, which stands before each of them in a Markdown code block (README,
 * Code blocks in detail). Prettier formats a diagram in a list or a block quote
 * inside the container, so the width of what stands before the diagram is no
 * longer left; here the diagram is formatted alone and the prefix is put in
 * front of its lines. The width of the prefix is counted as Prettier counts the
 * indentation that stands before a range it formats (`util.getAlignmentSize`),
 * a tab reaching the next multiple of `tabWidth`; where `tabWidth` is 0, which
 * `util.getAlignmentSize` turns into NaN for a tab, a tab has no width. The
 * width is at least 1.
 */
export async function printWidthAfter(
  prefix: string,
  options: ReadOptions,
): Promise<number | undefined> {
  if (prefix === "") return options.printWidth
  const tabWidth = options.tabWidth ?? (await defaultNumberOption("tabWidth"))
  const printWidth =
    options.printWidth ?? (await defaultNumberOption("printWidth"))
  const used =
    tabWidth === 0
      ? prefix.replaceAll("\t", "").length
      : util.getAlignmentSize(prefix, tabWidth)
  return Math.max(1, printWidth - used)
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
 * Prettier formats a `.mmd` file with the plugin. `options` are the options
 * that the tool reads of the Prettier configuration of the file (README,
 * Configuration), given to Prettier together with the three that the tool sets
 * itself: the parser, the plugins, and the line endings. The text has no byte
 * order mark and its lines end with `\n`, as Prettier leaves a text before
 * parsing it; the lines of the result end with `lineEnding`.
 *
 * For a text that the plugin rejects, its syntax error keeps the parser's
 * error as its `cause`. The cause gives the message without Prettier's code
 * frame and the offset in the text.
 */
export async function formatDiagram(
  text: string,
  options: ReadOptions,
  lineEnding: LineEnding,
): Promise<DiagramResult> {
  try {
    const formatted = await format(text, {
      ...options,
      parser: "mermaid",
      plugins: [plugin],
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
