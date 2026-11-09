import type { Options } from "prettier"
import type { ConfigOptions } from "./format-file.ts"
import { endingsInWords, formatDiagramSource, kindOf } from "./format-file.ts"
import { formatMarkdown } from "./markdown.ts"

export { clearConfigCache, resolveConfig } from "./format-file.ts"

/**
 * The options that `resolveConfig` returns, and `filepath`, required, whose
 * ending says whether the text is a diagram or Markdown. Another option of
 * Prettier is a type error rather than ignored.
 */
type FormatOptions = ConfigOptions & Required<Pick<Options, "filepath">>

/**
 * Formats a text as Prettier's `format` does, except that in Markdown only the
 * Mermaid code blocks are formatted and the rest stays as written. Like
 * Prettier's `format`, it reads no file and no configuration: the caller
 * passes what `resolveConfig` returns for `filepath`, given to Prettier as the
 * command gives it, with `printWidth` in Markdown the width of the lines of
 * the file (README, Code blocks in detail). The line endings and a byte
 * order mark stay as they are in the text. A `.mmd` or `.mermaid` diagram that
 * mermaid.js rejects throws the `SyntaxError` that Prettier throws for it with
 * prettier-plugin-mmd; in Markdown, a rejected diagram stays as written, as
 * Prettier leaves an embedded code block that it cannot format. No path is
 * skipped (README, From a script).
 */
export async function format(
  source: string,
  options: FormatOptions,
): Promise<string> {
  // The path is not given to Prettier, as the command does not give it.
  const { filepath, ...config } = options
  const kind = kindOf(filepath)
  if (kind === undefined) {
    throw new Error(
      `the path does not end in ${endingsInWords}: ${JSON.stringify(filepath)}`,
    )
  }
  return kind === "diagram"
    ? formatDiagramSource(source, config)
    : (await formatMarkdown(source, config, "output")).text
}
