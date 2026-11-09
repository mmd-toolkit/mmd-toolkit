import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import os from "node:os"
import path from "node:path"
import { main } from "../src/main.ts"

/** What a run of the tool gave. */
export interface Run {
  readonly code: number
  readonly stdout: string
  readonly stderr: string
}

/**
 * A directory of files for one test, outside the repository, so that no
 * configuration or ignore file of the repository applies.
 */
export class Project {
  /** The real path, so that it matches the paths that a glob gives. */
  public readonly cwd: string = realpathSync(
    mkdtempSync(path.join(os.tmpdir(), "mmdfmt-")),
  )

  /** Writes files, given by their paths relative to the project. */
  public write(files: Readonly<Record<string, string>>): void {
    for (const [name, text] of Object.entries(files)) {
      const file = path.join(this.cwd, name)
      mkdirSync(path.dirname(file), { recursive: true })
      writeFileSync(file, text)
    }
  }

  /** Reads a file, given by its path relative to the project. */
  public read(name: string): string {
    return readFileSync(path.join(this.cwd, name), "utf8")
  }

  /**
   * Runs the tool in the project, with `stdin` as its standard input, and
   * `stderrStream` and `stdoutStream` as the streams behind standard error
   * and standard output, if any.
   */
  public async run(
    args: readonly string[],
    stdin = "",
    stderrStream?: NodeJS.WritableStream,
    stdoutStream?: NodeJS.WritableStream,
  ): Promise<Run> {
    let stdout = ""
    let stderr = ""
    const code = await main(args, {
      cwd: this.cwd,
      readStdin: () => Promise.resolve(stdin),
      stdout: (text) => {
        stdout += text
      },
      stderr: (text) => {
        stderr += text
      },
      stderrStream,
      stdoutStream,
    })
    return { code, stdout, stderr }
  }

  /** Removes the project. */
  public remove(): void {
    rmSync(this.cwd, { recursive: true, force: true })
  }
}

/** A text of lines, each ended by `\n`. */
export function lines(...texts: readonly string[]): string {
  return texts.map((text) => `${text}\n`).join("")
}

/** The lines of a list that the tool prints, from paths written with `/`. */
export function listed(...names: readonly string[]): string {
  return names.map((name) => `${path.join(...name.split("/"))}\n`).join("")
}

/**
 * Replaces the digits followed by `ms` at the time position of each
 * `--write` output line with `<time>`, leaving other output unchanged.
 */
export function fixedWriteTimes(run: Run): Run {
  return {
    ...run,
    stdout: run.stdout.replaceAll(
      /^(.+) \d+ms( \(unchanged\))?$/gmu,
      "$1 <time>$2",
    ),
  }
}

/** The changed-file time lines of `--write`, from paths written with `/`. */
export function written(...names: readonly string[]): string {
  return names
    .map((name) => `${path.join(...name.split("/"))} <time>\n`)
    .join("")
}

/** The unchanged-file time lines of `--write`, from paths written with `/`. */
export function unchanged(...names: readonly string[]): string {
  return names
    .map((name) => `${path.join(...name.split("/"))} <time> (unchanged)\n`)
    .join("")
}
