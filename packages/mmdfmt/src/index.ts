import type { Options } from "prettier"
import type { LayoutOptions } from "./diagram.ts"
import type { ConfigOptions } from "./format-file.ts"
import { endingsInWords, formatDiagramSource, kindOf } from "./format-file.ts"
import { formatMarkdown } from "./markdown.ts"

export { resolveConfig } from "./format-file.ts"

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
 * resolves the configuration of `filepath` and passes its indentation and its
 * line width, which in Markdown is the width of the lines of the file, as for
 * the command (README, Code blocks in detail). The line endings and a byte
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
  const kind = kindOf(options.filepath)
  if (kind === undefined) {
    throw new Error(
      `the path does not end in ${endingsInWords}: ${JSON.stringify(options.filepath)}`,
    )
  }
  const layout: LayoutOptions = {
    tabWidth: options.tabWidth,
    useTabs: options.useTabs,
    printWidth: options.printWidth,
  }
  return kind === "diagram"
    ? formatDiagramSource(source, layout)
    : (await formatMarkdown(source, layout, "output")).text
}
