import path from "node:path"
import type { Options } from "prettier"
import {
  clearConfigCache as clearPrettierConfigCache,
  resolveConfig as resolvePrettierConfig,
} from "prettier"
import { formatDiagramText, rejectionOf } from "./diagram.ts"
import type { FormatResult, PositionsIn } from "./diagnostic.ts"
import { lineEndingOf, positionIn, readText } from "./lines.ts"
import { formatMarkdown } from "./markdown.ts"

/**
 * The options of a Prettier configuration that the command does not read: those
 * that it sets itself for each diagram (the parser, the plugins, and the line
 * endings), the path, which `format` takes as an option of its own, and the
 * range of a file to format, since the command formats whole diagrams (README,
 * Configuration).
 */
type UnreadOption =
  "parser" | "plugins" | "endOfLine" | "filepath" | "rangeStart" | "rangeEnd"

/**
 * The options that Prettier names. Its `Options` also takes any other name, for
 * the options of plugins, through an index signature, which `Omit` would turn
 * into the whole type; the only plugin is prettier-plugin-mmd, which has no
 * options, so a value under another name changes nothing.
 */
type NamedOptions = {
  [
    Name in keyof Options as string extends Name
      ? never
      : number extends Name
        ? never
        : Name
  ]: Options[Name]
}

/** The options that the command reads from a Prettier configuration. */
export type ConfigOptions = Omit<NamedOptions, UnreadOption>

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
 * from it, or `null` when no configuration applies (README, From a script). It
 * takes no options: the command has none for how it finds a configuration.
 */
export async function resolveConfig(
  fileUrlOrPath: string | URL,
): Promise<ConfigOptions | null> {
  const config = await resolvePrettierConfig(fileUrlOrPath, {
    editorconfig: true,
  })
  if (config === null) return null
  // The options that the command does not read are left out by name; the
  // names start with `_`, as unused names do.
  const {
    parser: _parser,
    plugins: _plugins,
    endOfLine: _endOfLine,
    filepath: _filepath,
    rangeStart: _rangeStart,
    rangeEnd: _rangeEnd,
    ...read
  } = config
  return read
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
 * Formats a file of the given kind. The Prettier configuration of the file,
 * found as `resolveConfig` finds it, is given to Prettier as it is (README,
 * Configuration). The diagnostics give their positions in the text that
 * `positionsIn` names.
 */
export async function formatFile(
  text: string,
  file: string,
  kind: FileKind,
  positionsIn: PositionsIn,
): Promise<FormatResult> {
  const config = (await resolveConfig(file)) ?? {}
  return kind === "diagram"
    ? formatDiagramFile(text, config)
    : formatMarkdown(text, config, positionsIn)
}

/**
 * Formats a `.mmd` or `.mermaid` file as a whole. Prettier keeps a byte order
 * mark apart from the text it formats and puts it back; so does this. The lines
 * end as the first line of the source does. A failure throws Prettier's error.
 */
export async function formatDiagramSource(
  text: string,
  config: Options,
): Promise<string> {
  const { byteOrderMark, normalized } = readText(text)
  const formatted = await formatDiagramText(
    normalized,
    config,
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
  config: Options,
): Promise<FormatResult> {
  try {
    return {
      text: await formatDiagramSource(text, config),
      diagnostics: [],
    }
  } catch (error) {
    const { normalized } = readText(text)
    const rejection = rejectionOf(normalized, error)
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
