import path from "node:path"
import { resolveConfig } from "prettier"
import type { Indentation } from "./diagram.ts"
import { formatDiagram } from "./diagram.ts"
import type { FormatResult } from "./diagnostic.ts"
import { lineEndingOf, positionIn, readText } from "./lines.ts"
import { formatMarkdown } from "./markdown.ts"

/** How the tool reads a file: as one diagram, or as Markdown with code blocks. */
export type FileKind = "diagram" | "markdown"

/**
 * The files that the tool formats, by the ending of their names (README, What
 * is formatted).
 */
const fileKinds: ReadonlyMap<string, FileKind> = new Map([
  [".md", "markdown"],
  [".markdown", "markdown"],
  [".mmd", "diagram"],
  [".mermaid", "diagram"],
])

/** The endings of the names of the files that the tool formats, for messages. */
export const fileEndings: readonly string[] = [...fileKinds.keys()]

/** How the tool reads a file, or `undefined` for a file it does not format. */
export function kindOf(file: string): FileKind | undefined {
  return fileKinds.get(path.extname(file))
}

/**
 * Formats a file of the given kind. The indentation comes from the Prettier
 * configuration of the file, found as Prettier's CLI finds it,
 * `.editorconfig` included (README, Formatting options).
 */
export async function formatFile(
  text: string,
  file: string,
  kind: FileKind,
): Promise<FormatResult> {
  const config = await resolveConfig(file, { editorconfig: true })
  const indentation: Indentation = {
    tabWidth: config?.tabWidth,
    useTabs: config?.useTabs,
  }
  return kind === "diagram"
    ? formatDiagramFile(text, indentation)
    : formatMarkdown(text, indentation)
}

/**
 * Formats a `.mmd` or `.mermaid` file as a whole. Prettier keeps a byte order
 * mark apart from the text it formats and puts it back; so does this.
 */
async function formatDiagramFile(
  text: string,
  indentation: Indentation,
): Promise<FormatResult> {
  const { byteOrderMark, normalized } = readText(text)
  const result = await formatDiagram(
    normalized,
    indentation,
    lineEndingOf(text),
  )
  if (result.kind === "rejected") {
    return {
      text,
      diagnostics: [
        {
          severity: "error",
          message: result.message,
          position: positionIn(normalized, result.offset),
        },
      ],
    }
  }
  return { text: byteOrderMark + result.text, diagnostics: [] }
}
