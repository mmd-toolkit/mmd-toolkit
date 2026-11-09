import { parse, ParseError } from "@mmd-toolkit/parser"
import type { Options } from "prettier"
import { format, getSupportInfo } from "prettier"
import plugin from "prettier-plugin-mmd"
import type { LineEnding } from "./lines.ts"

/**
 * The options of a Prettier configuration that the tool uses (README,
 * Indentation and line width). An option that the configuration does not set
 * is `undefined`, and Prettier then uses its default.
 */
export interface LayoutOptions {
  readonly tabWidth: number | undefined
  readonly useTabs: boolean | undefined
  /** The line width; `Infinity` where `.editorconfig` says `off`. */
  readonly printWidth: number | undefined
}

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
 * front of its lines. A tab in the prefix counts as `tabWidth`. The width is at
 * least 1.
 */
export async function printWidthAfter(
  prefix: string,
  options: LayoutOptions,
): Promise<number | undefined> {
  if (prefix === "") return options.printWidth
  const tabWidth = options.tabWidth ?? (await defaultNumberOption("tabWidth"))
  let used = 0
  for (const character of prefix) used += character === "\t" ? tabWidth : 1
  const printWidth =
    options.printWidth ?? (await defaultNumberOption("printWidth"))
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
 * Formats the text of a diagram with Prettier and prettier-plugin-mmd, as
 * Prettier formats a `.mmd` file with the plugin. The text has no byte order
 * mark and its lines end with `\n`, as Prettier leaves a text before parsing
 * it; the lines of the result end with `lineEnding`.
 *
 * A text that the plugin rejects is parsed again with the parser that the
 * plugin uses, for the message and the offset of the syntax error: the error
 * that Prettier throws has a line and a column counted for Prettier's code
 * frame, which also ends lines at U+2028 and U+2029, and no offset.
 */
export async function formatDiagram(
  text: string,
  layout: LayoutOptions,
  lineEnding: LineEnding,
): Promise<DiagramResult> {
  try {
    const formatted = await format(text, {
      parser: "mermaid",
      plugins: [plugin],
      tabWidth: layout.tabWidth,
      useTabs: layout.useTabs,
      printWidth: layout.printWidth,
      endOfLine: endOfLineOptions[lineEnding],
    })
    return { kind: "formatted", text: formatted }
  } catch (error) {
    const syntaxError = syntaxErrorOf(text)
    if (syntaxError === undefined) throw error
    return {
      kind: "rejected",
      message: syntaxError.message,
      offset: syntaxError.range[0],
    }
  }
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
