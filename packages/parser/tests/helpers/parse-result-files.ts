import { existsSync, readdirSync } from "node:fs"
import path from "node:path"

/** The name of the file that holds the tree of an accepted input. */
export const AST_FILE = "ast.json"

/** The name of the file that holds the error of a rejected input. */
export const ERROR_FILE = "parse-error.json"

/**
 * The fixtures under `directory`, a directory of fixtures of one diagram,
 * that have both an `ast.json` and a `parse-error.json`. A fixture records
 * one parse result, so there should be none. Only the files are looked at.
 */
export function fixturesWithBothResultFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter(
      (name) =>
        existsSync(path.join(directory, name, AST_FILE)) &&
        existsSync(path.join(directory, name, ERROR_FILE)),
    )
}
