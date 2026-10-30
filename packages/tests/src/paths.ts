import path from "node:path"

/**
 * The path of `file` from `directory`, with `/` between its parts on every
 * operating system, as the paths of the mermaid repository are written in the
 * fixtures and in the tables of the tools.
 */
export function relativeWithSlashes(directory: string, file: string): string {
  return path.relative(directory, file).split(path.sep).join("/")
}
