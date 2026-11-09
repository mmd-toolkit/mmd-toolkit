import path from "node:path"
import {
  clearConfigCache as clearPrettierConfigCache,
  resolveConfig as resolvePrettierConfig,
} from "prettier"
import { formatDiagramText, rejectionOf } from "./diagram.ts"
import type { FormatResult, PositionsIn } from "./diagnostic.ts"
import { lineEndingOf, positionIn, readText } from "./lines.ts"
import { formatMarkdown } from "./markdown.ts"
import type { ReadOptions } from "./options.ts"
import { readOptions } from "./options.ts"

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
 * Resolves the configuration of a path or a file URL as the command does,
 * `.editorconfig` included, and returns the options that the command reads
 * from it (README, Configuration), or `null` when no configuration applies
 * (README, From a script).
 */
export async function resolveConfig(
  fileUrlOrPath: string | URL,
): Promise<ReadOptions | null> {
  const config = await resolvePrettierConfig(fileUrlOrPath, {
    editorconfig: true,
  })
  return config === null ? null : readOptions(config)
}

/**
 * Forgets the configuration files that `resolveConfig` has read, so that the
 * next call reads them again: Prettier keeps them for the life of the process
 * (README, From a script).
 */
export async function clearConfigCache(): Promise<void> {
  await clearPrettierConfigCache()
}

/**
 * Formats a file of the given kind, with the options that `resolveConfig`
 * returns for it. The diagnostics give their positions in the text that
 * `positionsIn` names.
 */
export async function formatFile(
  text: string,
  file: string,
  kind: FileKind,
  positionsIn: PositionsIn,
): Promise<FormatResult> {
  const options = (await resolveConfig(file)) ?? {}
  return kind === "diagram"
    ? formatDiagramFile(text, options)
    : formatMarkdown(text, options, positionsIn)
}

/**
 * Formats a `.mmd` or `.mermaid` file as a whole. Prettier keeps a byte order
 * mark apart from the text it formats and puts it back; so does this. The lines
 * end as the first line of the source does. A failure throws Prettier's error.
 */
export async function formatDiagramSource(
  text: string,
  options: ReadOptions,
): Promise<string> {
  const { byteOrderMark, normalized } = readText(text)
  const formatted = await formatDiagramText(
    normalized,
    options,
    lineEndingOf(text),
  )
  return byteOrderMark + formatted
}

/**
 * Formats a diagram file for the command. A rejected diagram leaves the text
 * as it was read, so its position is the same before and after formatting.
 */
async function formatDiagramFile(
  text: string,
  options: ReadOptions,
): Promise<FormatResult> {
  try {
    return {
      text: await formatDiagramSource(text, options),
      diagnostics: [],
    }
  } catch (error) {
    const { normalized } = readText(text)
    const rejection = rejectionOf(error)
    return {
      text,
      diagnostics: [
        {
          severity: "error",
          message: rejection.message,
          position: positionIn(normalized, rejection.offset),
        },
      ],
    }
  }
}
