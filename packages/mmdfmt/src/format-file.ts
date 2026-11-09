import path from "node:path"
import { resolveConfig } from "prettier"
import type { Indentation } from "./diagram.ts"
import { formatDiagram } from "./diagram.ts"
import type { FormatResult, PositionsIn } from "./diagnostic.ts"
import { lineEndingOf, positionIn, readText } from "./lines.ts"
import { formatMarkdown } from "./markdown.ts"

/** How the tool reads a file: as one diagram, or as Markdown with code blocks. */
export type FileKind = "diagram" | "markdown"

/**
 * The files that the tool formats, by the ending of their names (README,
 * Patterns).
 */
const fileKinds: ReadonlyMap<string, FileKind> = new Map([
  [".md", "markdown"],
  [".markdown", "markdown"],
  [".mmd", "diagram"],
  [".mermaid", "diagram"],
])

/** The endings of the names of the files that the tool formats. */
const fileEndings: readonly string[] = [...fileKinds.keys()]

/** The endings of the files that the tool formats, as a message names them. */
export const endingsInWords: string = [
  ...fileEndings.slice(0, -1),
  `or ${fileEndings.at(-1)}`,
].join(", ")

/** How the tool reads a file, or `undefined` for a file it does not format. */
export function kindOf(file: string): FileKind | undefined {
  return fileKinds.get(path.extname(file))
}

/**
 * Formats a file of the given kind. The indentation comes from the Prettier
 * configuration of the file, found as Prettier's CLI finds it,
 * `.editorconfig` included (README, Indentation). The diagnostics give their
 * positions in the text that `positionsIn` names.
 */
export async function formatFile(
  text: string,
  file: string,
  kind: FileKind,
  positionsIn: PositionsIn,
): Promise<FormatResult> {
  const config = await resolveConfig(file, { editorconfig: true })
  const indentation: Indentation = {
    tabWidth: config?.tabWidth,
    useTabs: config?.useTabs,
  }
  return kind === "diagram"
    ? formatDiagramFile(text, indentation)
    : formatMarkdown(text, indentation, positionsIn)
}

/**
 * Formats a `.mmd` or `.mermaid` file as a whole. Prettier keeps a byte order
 * mark apart from the text it formats and puts it back; so does this. A
 * rejected diagram leaves the text as it was read, so its position is the same
 * in the text as read and after formatting.
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
