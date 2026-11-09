import path from "node:path"
import type { FormatResult } from "./diagnostic.ts"
import { endingsInWords, formatFile, kindOf } from "./format-file.ts"

/**
 * Formats a text as the file at `filepath`, as `--stdin-filepath` does: the
 * ending of the path says whether the text is a diagram or Markdown, and its
 * directory which `.editorconfig` and Prettier configuration apply; a relative
 * path is resolved against the current directory. The file is neither read nor
 * written, and no path is skipped, since the caller chooses the files. The
 * diagnostics give their positions in the text returned (README, From a
 * script).
 */
export async function format(
  text: string,
  options: { readonly filepath: string },
): Promise<FormatResult> {
  const file = path.resolve(options.filepath)
  const kind = kindOf(file)
  if (kind === undefined) {
    throw new Error(
      `the path does not end in ${endingsInWords}: ${JSON.stringify(options.filepath)}`,
    )
  }
  return formatFile(text, file, kind, "output")
}
