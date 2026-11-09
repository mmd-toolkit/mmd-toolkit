import { endingsInWords, formatDiagramSource, kindOf } from "./format-file.ts"
import { formatMarkdown } from "./markdown.ts"
import type { ReadOptions } from "./options.ts"
import { readOptions } from "./options.ts"

export { clearConfigCache, resolveConfig } from "./format-file.ts"
export type { ReadOptions } from "./options.ts"

/**
 * The options of `format`: the options that `resolveConfig` returns, and the
 * path of the file, whose ending says whether the text is a diagram or
 * Markdown.
 */
export interface FormatOptions extends ReadOptions {
  readonly filepath: string
}

/**
 * Formats a text as Prettier's `format` does, except that in Markdown only the
 * Mermaid code blocks are formatted and the rest stays as written. Like
 * Prettier's `format`, it reads no file and no configuration: the caller
 * passes what `resolveConfig` returns for `filepath`, with `printWidth` in
 * Markdown the width of the lines of the file (README, Code blocks in detail).
 * The line endings and a byte order mark stay as they are in the text. A `.mmd`
 * or `.mermaid` diagram that mermaid.js rejects throws the `SyntaxError` that
 * Prettier throws for it with prettier-plugin-mmd; in Markdown, a rejected
 * diagram stays as written, as Prettier leaves an embedded code block that it
 * cannot format. No path is skipped (README, From a script).
 */
export async function format(
  source: string,
  options: FormatOptions,
): Promise<string> {
  const kind = kindOf(options.filepath)
  if (kind === undefined) {
    throw new Error(
      `the path does not end in ${endingsInWords}: ${JSON.stringify(options.filepath)}`,
    )
  }
  // Prettier gets the options that the command reads, and no other, also when
  // a caller in JavaScript passes others. `readOptions` takes Prettier's
  // `Options`, whose index signature an interface does not match; a copy of
  // the options, as an object literal, does.
  const read = readOptions({ ...options })
  return kind === "diagram"
    ? formatDiagramSource(source, read)
    : (await formatMarkdown(source, read, "output")).text
}
