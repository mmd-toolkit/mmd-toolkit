import { stat } from "node:fs/promises"
import path from "node:path"
import { getFileInfo } from "prettier"
import { glob } from "tinyglobby"
import type { FileKind } from "./format-file.ts"
import { kindOf } from "./format-file.ts"

/**
 * The directories whose files are skipped, those that Prettier's CLI skips
 * (README, Patterns).
 */
const skippedDirectories: readonly string[] = [
  "node_modules",
  ".git",
  ".hg",
  ".jj",
  ".sl",
  ".svn",
]

/** A file that the tool formats. */
export interface SelectedFile {
  /** An absolute path. */
  readonly path: string
  readonly kind: FileKind
}

/** The files that the patterns select, and the patterns that select none. */
export interface Selection {
  /** In the order of the patterns, each file once. */
  readonly files: readonly SelectedFile[]
  readonly unmatched: readonly string[]
}

/**
 * Selects the files that the patterns name: a file, the files under a
 * directory, or the files that a glob matches, of those the tool formats
 * (README, Patterns).
 */
export async function selectFiles(
  patterns: readonly string[],
  cwd: string,
): Promise<Selection> {
  const files = new Map<string, SelectedFile>()
  const unmatched: string[] = []
  for (const pattern of patterns) {
    const selected: SelectedFile[] = []
    for (const file of (await filesOfPattern(pattern, cwd)).sort()) {
      const kind = kindOf(file)
      if (kind !== undefined) selected.push({ path: file, kind })
    }
    if (selected.length === 0) unmatched.push(pattern)
    for (const file of selected) {
      if (!files.has(file.path)) files.set(file.path, file)
    }
  }
  return { files: [...files.values()], unmatched }
}

/**
 * The files that one pattern names, as absolute paths. A directory or a glob
 * selects no file under a skipped directory, as Prettier's CLI does not look
 * into one; the path of a file selects the file wherever it is.
 */
async function filesOfPattern(pattern: string, cwd: string): Promise<string[]> {
  const target = path.resolve(cwd, pattern)
  const stats = await stat(target).catch(() => undefined)
  if (stats?.isFile()) return [target]
  const found = stats?.isDirectory()
    ? await globFiles("**/*", target)
    : await globFiles(pattern, cwd)
  return found.filter((file) => !isUnderSkippedDirectory(file, cwd))
}

/**
 * The files that a glob matches under `root`, as absolute paths. Like
 * Prettier's CLI, it matches names that start with a dot and follows no
 * symbolic link. Its walk does not enter the skipped directories below `root`,
 * which would only take time; `filesOfPattern` decides what is selected.
 */
async function globFiles(pattern: string, root: string): Promise<string[]> {
  const found = await glob(pattern, {
    cwd: root,
    absolute: true,
    dot: true,
    expandDirectories: false,
    followSymbolicLinks: false,
    ignore: skippedDirectories.map((directory) => `**/${directory}/**`),
  })
  return found.map((file) => path.resolve(file))
}

/** Whether a file is under one of the skipped directories of `cwd`. */
function isUnderSkippedDirectory(file: string, cwd: string): boolean {
  const directories = path.relative(cwd, path.dirname(file)).split(path.sep)
  return directories.some((name) => skippedDirectories.includes(name))
}

/**
 * Whether a file is skipped: it is under one of the skipped directories, or
 * the `.gitignore` or the `.prettierignore` of the current directory lists it,
 * as Prettier's CLI decides (README, Patterns).
 */
export async function isSkipped(file: string, cwd: string): Promise<boolean> {
  if (isUnderSkippedDirectory(file, cwd)) return true
  const { ignored } = await getFileInfo(file, {
    ignorePath: [
      path.join(cwd, ".gitignore"),
      path.join(cwd, ".prettierignore"),
    ],
    // Only whether the file is ignored is needed; resolving the configuration
    // would load the plugins that it lists.
    resolveConfig: false,
  })
  return ignored
}
