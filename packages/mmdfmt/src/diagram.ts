import { parse, ParseError } from "@mmd-toolkit/parser"
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
 * Formats the text of a diagram as {@link formatDiagramText} does, and gives
 * a text that the plugin rejects as the message and the offset of its syntax
 * error.
 */
export async function formatDiagram(
  text: string,
  options: ReadOptions,
  lineEnding: LineEnding,
): Promise<DiagramResult> {
  try {
    return {
      kind: "formatted",
      text: await formatDiagramText(text, options, lineEnding),
    }
  } catch (error) {
    return { kind: "rejected", ...rejectionOf(text, error) }
  }
}

/**
 * Formats the text of a diagram with Prettier and prettier-plugin-mmd, as
 * Prettier formats a `.mmd` file with the plugin, and throws what Prettier
 * throws for a text that the plugin rejects. `options` are the options that
 * the tool reads of the Prettier configuration of the file (README,
 * Configuration), given to Prettier together with the three that the tool sets
 * itself: the parser, the plugins, and the line endings. The text has no byte
 * order mark and its lines end with `\n`, as Prettier leaves a text before
 * parsing it; the lines of the result end with `lineEnding`.
 */
export async function formatDiagramText(
  text: string,
  options: ReadOptions,
  lineEnding: LineEnding,
): Promise<string> {
  return format(text, {
    ...options,
    parser: "mermaid",
    plugins: [plugin],
    endOfLine: endOfLineOptions[lineEnding],
  })
}

/**
 * A text that the plugin rejects is parsed again with the parser that the
 * plugin uses, for the message and the offset of the syntax error: the error
 * that Prettier throws has a line and a column counted for Prettier's code
 * frame, which also ends lines at U+2028 and U+2029, and no offset. If the
 * parser accepts the text, the original error is thrown again.
 */
export function rejectionOf(
  text: string,
  error: unknown,
): { message: string; offset: number } {
  const syntaxError = syntaxErrorOf(text)
  if (syntaxError === undefined) throw error
  return { message: syntaxError.message, offset: syntaxError.range[0] }
}

/** The syntax error of a text, or `undefined` when the parser accepts it. */
function syntaxErrorOf(text: string): ParseError | undefined {
  try {
    parse(text)
  } catch (error) {
    if (error instanceof ParseError) return error
    throw error
  }
  return undefined
}
