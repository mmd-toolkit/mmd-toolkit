import type { Options } from "prettier"
import type { LayoutOptions } from "./diagram.ts"
import { endingsInWords, formatDiagramSource, kindOf } from "./format-file.ts"
import { formatMarkdown } from "./markdown.ts"

/**
 * The options of Prettier that `format` takes: `filepath`, required, whose
 * ending says whether the text is a diagram or Markdown, and the indentation.
 * Another option of Prettier is a type error rather than ignored.
 */
type FormatOptions = Required<Pick<Options, "filepath">> &
  Pick<Options, "tabWidth" | "useTabs">

/**
 * Formats a text as Prettier's `format` does, except that in Markdown only the
 * Mermaid code blocks are formatted and the rest stays as written. Like
 * Prettier's `format`, it reads no file and no configuration: the caller
 * resolves the configuration of `filepath` and passes its indentation. The line
 * endings and a byte order mark stay as they are in the text. A `.mmd` or
 * `.mermaid` diagram that mermaid.js rejects throws the `SyntaxError` that
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
  const layout: LayoutOptions = {
    tabWidth: options.tabWidth,
    useTabs: options.useTabs,
    printWidth: undefined,
  }
  return kind === "diagram"
    ? formatDiagramSource(source, layout)
    : (await formatMarkdown(source, layout, "output")).text
}
