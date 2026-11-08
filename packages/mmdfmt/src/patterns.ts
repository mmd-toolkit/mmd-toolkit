import { stat } from "node:fs/promises"
import path from "node:path"
import { getFileInfo } from "prettier"
import { convertPathToPattern, glob } from "tinyglobby"
import type { FileKind } from "./format-file.ts"
import { kindOf } from "./format-file.ts"

/**
 * The directories whose files are skipped, those that Prettier's CLI skips
 * (README, Excluding files).
 */
const skippedDirectories: readonly string[] = [
  "node_modules",
  ".git",
  ".hg",
  ".jj",
  ".sl",
  ".svn",
]

/** The globs of the files under the skipped directories. */
const skippedDirectoryGlobs: readonly string[] = skippedDirectories.map(
  (directory) => `**/${directory}/**`,
)

/** A file that the tool formats. */
export interface SelectedFile {
  /** An absolute path. */
  readonly path: string
  readonly kind: FileKind
}

/** The files that the patterns select, and the patterns that went wrong. */
export interface Selection {
  /** In the order of the patterns, each file once. */
  readonly files: readonly SelectedFile[]
  /**
   * Whether no pattern is left to select files: each one starts with `!`, or
   * names a path in a skipped directory.
   */
  readonly noSelectingPattern: boolean
  /** The patterns that name a path in a skipped directory, which are skipped. */
  readonly skipped: readonly string[]
  /** The patterns that select no file that the tool formats. */
  readonly unmatched: readonly string[]
  /** The paths of files, given as patterns, that an excluding pattern matches. */
  readonly excluded: readonly string[]
}

/**
 * A pattern that selects files, as given, with what it names: a file or a
 * directory by its absolute path, or a glob.
 */
type SelectingPattern =
  | { readonly kind: "file"; readonly text: string; readonly path: string }
  | { readonly kind: "directory"; readonly text: string; readonly path: string }
  | { readonly kind: "glob"; readonly text: string }

/**
 * Selects the files that the patterns name, of those the tool formats, as
 * Prettier's CLI reads the patterns (README, Patterns). A pattern that names a
 * path in a skipped directory, a file, a directory, or a glob, is skipped. A
 * pattern is then first the path of a file or of a directory. Otherwise, a
 * pattern that starts with `!` excludes the files that the glob after it
 * matches from what every other pattern selects, and any other pattern is a
 * glob.
 */
export async function selectFiles(
  patterns: readonly string[],
  cwd: string,
): Promise<Selection> {
  const selecting: SelectingPattern[] = []
  const excluding: string[] = []
  const skipped: string[] = []
  for (const pattern of patterns) {
    const target = path.resolve(cwd, pattern)
    if (passesSkippedDirectory(target, cwd)) {
      skipped.push(pattern)
      continue
    }
    const stats = await stat(target).catch(() => undefined)
    if (stats?.isFile()) {
      selecting.push({ kind: "file", text: pattern, path: target })
    } else if (stats?.isDirectory()) {
      selecting.push({ kind: "directory", text: pattern, path: target })
    } else if (pattern.startsWith("!")) {
      excluding.push(globOf(pattern.slice(1)))
    } else {
      selecting.push({ kind: "glob", text: pattern })
    }
  }
  const files = new Map<string, SelectedFile>()
  const unmatched: string[] = []
  const excluded: string[] = []
  for (const pattern of selecting) {
    if (
      pattern.kind === "file" &&
      (await isExcluded(pattern.path, cwd, excluding))
    ) {
      excluded.push(pattern.text)
      continue
    }
    const selected: SelectedFile[] = []
    for (const file of (await filesOf(pattern, cwd, excluding)).sort()) {
      const kind = kindOf(file)
      if (kind !== undefined) selected.push({ path: file, kind })
    }
    if (selected.length === 0) unmatched.push(pattern.text)
    for (const file of selected) {
      if (!files.has(file.path)) files.set(file.path, file)
    }
  }
  return {
    files: [...files.values()],
    noSelectingPattern: selecting.length === 0,
    skipped,
    unmatched,
    excluded,
  }
}

/**
 * A pattern as a glob. On Windows, Prettier's CLI reads a `\` of a glob as
 * `/`, the separator of globs; so does this (README, Patterns).
 */
function globOf(pattern: string): string {
  return process.platform === "win32" ? pattern.replaceAll("\\", "/") : pattern
}

/**
 * Whether the globs of the excluding patterns match a file, given by its
 * absolute path. As in Prettier's CLI, they are matched against its path from
 * `cwd`.
 */
async function isExcluded(
  file: string,
  cwd: string,
  excluding: readonly string[],
): Promise<boolean> {
  const own = convertPathToPattern(path.relative(cwd, file))
  return (await globFiles(own, cwd, excluding)).length === 0
}

/**
 * The files that a pattern names, as absolute paths, apart from those that the
 * globs of the excluding patterns match. The path of a file names the file
 * wherever it is; a directory or a glob names no file under a skipped
 * directory, as Prettier's CLI does not look into one.
 */
async function filesOf(
  pattern: SelectingPattern,
  cwd: string,
  excluding: readonly string[],
): Promise<string[]> {
  if (pattern.kind === "file") return [pattern.path]
  const ignore = [...skippedDirectoryGlobs, ...excluding]
  const found =
    pattern.kind === "directory"
      ? await globFiles(
          `${convertPathToPattern(path.relative(cwd, pattern.path) || ".")}/**/*`,
          cwd,
          ignore,
        )
      : await globFiles(globOf(pattern.text), cwd, ignore)
  return found.filter((file) => !isUnderSkippedDirectory(file, cwd))
}

/**
 * The files that a glob matches from `cwd`, as absolute paths, apart from
 * those that the globs of `ignore` match. Like Prettier's CLI, it matches names
 * that start with a dot and follows no symbolic link.
 */
async function globFiles(
  pattern: string,
  cwd: string,
  ignore: readonly string[],
): Promise<string[]> {
  const found = await glob(pattern, {
    cwd,
    absolute: true,
    dot: true,
    expandDirectories: false,
    followSymbolicLinks: false,
    ignore: [...ignore],
  })
  return found.map((file) => path.resolve(file))
}

/**
 * Whether a path, taken from `cwd`, is one of the skipped directories or passes
 * through one, as Prettier's CLI decides it for a pattern.
 */
function passesSkippedDirectory(target: string, cwd: string): boolean {
  const names = path.relative(cwd, target).split(path.sep)
  return names.some((name) => skippedDirectories.includes(name))
}

/** Whether a file is under one of the skipped directories of `cwd`. */
function isUnderSkippedDirectory(file: string, cwd: string): boolean {
  return passesSkippedDirectory(path.dirname(file), cwd)
}

/**
 * Whether a file is skipped: it is under one of the skipped directories, or
 * the `.gitignore` of the current directory lists it (README, Excluding files).
 *
 * Unlike Prettier's CLI, the tool does not read `.prettierignore`. It is used
 * where Prettier does not format the Markdown, and the `.prettierignore` there
 * often lists the Markdown files: reading it would leave their diagrams
 * unformatted without a word. If users ask for a way to keep files from this
 * tool alone, other than a pattern that starts with `!`, read a file of its
 * own, such as `.mmdfmtignore`, not `.prettierignore`.
 */
export async function isSkipped(file: string, cwd: string): Promise<boolean> {
  if (isUnderSkippedDirectory(file, cwd)) return true
  const { ignored } = await getFileInfo(file, {
    ignorePath: path.join(cwd, ".gitignore"),
    // Only whether the file is ignored is needed; resolving the configuration
    // would load the plugins that it lists.
    resolveConfig: false,
  })
  return ignored
}
