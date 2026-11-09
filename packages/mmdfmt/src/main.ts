import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { styleText } from "node:util"
import { cli, define, isArgsValidationError } from "gunshi"
import packageJson from "../package.json" with { type: "json" }
import type { Diagnostic, FormatResult } from "./diagnostic.ts"
import { fileEndings, formatFile, kindOf } from "./format-file.ts"
import { isSkipped, selectFiles } from "./patterns.ts"

/** What the tool reads from and writes to, apart from the files. */
export interface Io {
  /** The current directory, against which patterns and paths are resolved. */
  readonly cwd: string
  readonly readStdin: () => Promise<string>
  readonly stdout: (text: string) => void
  readonly stderr: (text: string) => void
  /**
   * The streams behind `stdout` and `stderr`, if there are any. Prettier's
   * logger colors some words (the name of an unchanged file in gray, the word
   * `warn` in yellow); the tool colors them where Node's `util.styleText`
   * colors text for the stream: a terminal, or `FORCE_COLOR` (README, If you
   * know Prettier).
   */
  readonly stdoutStream?: NodeJS.WritableStream
  readonly stderrStream?: NodeJS.WritableStream
}

/** The exit codes (README, Errors and exit codes). */
const exitCodes = { ok: 0, changed: 1, error: 2 } as const

/** The examples in the usage, one on a line (README, Usage). */
const examples = `mmdfmt --write "**/*.{md,mmd,mermaid}"
mmdfmt --check "**/*.{md,mmd,mermaid}"
mmdfmt --stdin-filepath diagram.mmd < diagram.mmd`

/** The endings of the files that the tool formats, as a message names them. */
const endingsInWords = `${fileEndings.slice(0, -1).join(", ")}, or ${fileEndings.at(-1)}`

/** Runs the tool with its arguments, and returns the exit code (README, Usage). */
export async function main(args: readonly string[], io: Io): Promise<number> {
  let code: number = exitCodes.ok
  const command = define({
    toKebab: true,
    // gunshi adds --help and --version, draws the usage from the descriptions,
    // and rejects the options that conflict.
    //
    // The options follow Prettier's as far as gunshi reads them so (README, If
    // you know Prettier). gunshi 0.37 reads an option that takes no value
    // without a value written after `=` (`--write=false` is `--write`), takes
    // a word after it as a pattern (`--write false`), and counts a `--no-`
    // form as giving the option, also for `conflicts`; Prettier reads these
    // otherwise. gunshi 0.37 also needs Node.js 22 or later (its `engines`),
    // so the `engines` of this package leave out Node.js 20.
    args: {
      write: {
        type: "boolean",
        short: "w",
        negatable: true,
        description:
          "Rewrite the files that change, and list each file with its time",
      },
      check: {
        type: "boolean",
        short: "c",
        negatable: true,
        description:
          "Check whether the files are formatted, and print a summary and the files that are not",
        conflicts: ["listDifferent"],
      },
      listDifferent: {
        type: "boolean",
        short: "l",
        negatable: true,
        description: "List the files that --write would change",
        conflicts: ["check"],
      },
      stdinFilepath: {
        type: "string",
        description:
          "Format standard input as the file at this path, and write the result to standard output",
      },
      patterns: {
        type: "positional",
        multiple: true,
        required: false,
        description: "The files, directories, or globs of the files to format",
      },
    },
    examples,
    /** Runs the mode that the arguments select, and keeps its exit code. */
    async run(ctx) {
      // No argument at all prints the usage (README, Usage), drawn by the
      // renderer that gunshi also draws it with for --help.
      if (args.length === 0) {
        const usage = await ctx.env.renderUsage?.(ctx)
        io.stderr(usage ?? "")
        code = exitCodes.error
        return
      }
      const { write, check, listDifferent, stdinFilepath } = ctx.values
      // gunshi puts the arguments after `--` in rest rather than in patterns.
      const patterns = [...(ctx.values.patterns ?? []), ...ctx.rest]
      if (stdinFilepath !== undefined) {
        code =
          patterns.length > 0
            ? argumentError(io, ["--stdin-filepath takes no patterns"])
            : await formatStandardInput(
                stdinFilepath,
                {
                  write: Boolean(write),
                  listsDifference: Boolean(check) || Boolean(listDifferent),
                },
                io,
              )
      } else if (ctx.explicit.stdinFilepath) {
        // gunshi gives no value for an empty path, as in --stdin-filepath=,
        // though the option is given (README, Usage).
        code = argumentError(io, ["--stdin-filepath needs a path"])
      } else if (patterns.length === 0) {
        code = argumentError(io, ["no patterns of the files to format"])
      } else if (!write && !check && !listDifferent) {
        code = argumentError(io, [
          "give --write, --check, or --list-different with the patterns",
        ])
      } else {
        code = await formatFiles(
          patterns,
          {
            write: Boolean(write),
            check: Boolean(check),
            listDifferent: Boolean(listDifferent),
          },
          io,
        )
      }
    },
  })
  try {
    // gunshi 0.37 writes to standard output with console.log, and has no
    // option for where it writes: a header before every command, the usage,
    // the version, and its errors. The tool writes the result of
    // --stdin-filepath to standard output, where none of them may mix in. With
    // usageSilent, gunshi writes nothing: it returns the usage and the
    // version, and throws its errors, and the tool writes them.
    //
    // When gunshi is updated to 1.0, check what it writes without
    // usageSilent. Two changes of 1.0 write the header only with the usage
    // (https://github.com/kazupon/gunshi/pull/843) and write the errors to
    // standard error with console.error
    // (https://github.com/kazupon/gunshi/pull/844). If nothing of gunshi then
    // reaches standard output but the usage of --help and the version, see
    // whether usageSilent and the writing here and in run can go. 1.0 also
    // sets the exit code to 1 when it writes an error, where the tool exits
    // with 2 for a wrong use (README, Errors and exit codes): decide again which code a
    // wrong use exits with. With usageSilent, 1.0 still writes no error and
    // throws it, as 0.37 does.
    const printed = await cli([...args], command, {
      name: "mmdfmt",
      version: packageJson.version,
      // gunshi shows it with the version above the usage.
      description: packageJson.description,
      strict: true,
      usageSilent: true,
    })
    // gunshi returns the usage for --help, which ends with a line ending, and
    // the version for --version, which does not.
    if (printed !== undefined) {
      io.stdout(printed.endsWith("\n") ? printed : `${printed}\n`)
    }
  } catch (error) {
    // gunshi throws the errors that it finds in the arguments, without running
    // the command.
    if (
      error instanceof AggregateError &&
      error.errors.every(isArgsValidationError)
    ) {
      return argumentError(io, error.errors.map(messageOf))
    }
    throw error
  }
  return code
}

/**
 * Formats the files that the patterns select, following Prettier's counts
 * and reports for `write`, `check`, and `listDifferent`.
 */
async function formatFiles(
  patterns: readonly string[],
  mode: {
    readonly write: boolean
    readonly check: boolean
    readonly listDifferent: boolean
  },
  io: Io,
): Promise<number> {
  if (mode.check) io.stdout("Checking formatting...\n")
  const { files, noSelectingPattern, skipped, unmatched, excluded } =
    await selectFiles(patterns, io.cwd)
  let failed = noSelectingPattern || unmatched.length > 0 || excluded.length > 0
  let numberOfUnformattedFilesFound = 0
  let numberOfFilesWithError = 0
  // As in Prettier's CLI, patterns that leave nothing to select are an error.
  if (noSelectingPattern) {
    argumentError(io, [
      skipped.length > 0
        ? "no patterns of the files to format; a pattern in node_modules or a directory of version control is skipped"
        : "no patterns of the files to format; a pattern that starts with ! only excludes files",
    ])
  }
  for (const pattern of unmatched) {
    io.stderr(
      `mmdfmt: error: no file ending in ${endingsInWords} matches ${JSON.stringify(pattern)}\n`,
    )
  }
  for (const pattern of excluded) {
    io.stderr(
      `mmdfmt: error: a pattern that starts with ! excludes the file ${JSON.stringify(pattern)}\n`,
    )
  }
  for (const file of files) {
    const name = displayName(file.path, io.cwd)
    let text: string, result: FormatResult
    try {
      if (await isSkipped(file.path, io.cwd)) continue
      text = await readFile(file.path, "utf8")
    } catch (error) {
      io.stderr(`${name}: error: ${messageOf(error)}\n`)
      failed = true
      continue
    }
    // Prettier times the formatting of a file from here.
    const start = performance.now()
    try {
      result = await formatFile(
        text,
        file.path,
        file.kind,
        mode.write ? "output" : "input",
      )
      report(io, name, result.diagnostics)
      if (result.diagnostics.some(isError)) {
        failed = true
        numberOfFilesWithError += 1
        continue
      }
    } catch (error) {
      io.stderr(`${name}: error: ${messageOf(error)}\n`)
      failed = true
      numberOfFilesWithError += 1
      continue
    }
    // `--write` alone lists every file with the time it took, as Prettier
    // does; with `--check` or `--list-different`, their own lists replace it.
    const listsTimes = mode.write && !mode.check && !mode.listDifferent
    const time = `${Math.round(performance.now() - start)}ms`
    if (result.text === text) {
      if (listsTimes) {
        io.stdout(
          `${style(io.stdoutStream, "gray", name)} ${time} (unchanged)\n`,
        )
      }
      continue
    }
    if (mode.write) {
      if (listsTimes) io.stdout(`${name} ${time}\n`)
      try {
        await writeFile(file.path, result.text)
      } catch (error) {
        io.stderr(`${name}: error: ${messageOf(error)}\n`)
        failed = true
      }
    }
    if (mode.check) {
      warn(io, name)
    } else if (mode.listDifferent) {
      io.stdout(`${name}\n`)
    }
    numberOfUnformattedFilesFound += 1
  }
  if (mode.check) {
    if (numberOfFilesWithError > 0) {
      const filesDescription =
        numberOfFilesWithError === 1
          ? "the above file"
          : `${numberOfFilesWithError} files`
      io.stdout(
        `Error occurred when checking code style in ${filesDescription}.\n`,
      )
    } else if (numberOfUnformattedFilesFound === 0) {
      // Only the diagrams of a Markdown file are checked, not its other text.
      io.stdout("All diagrams in the matched files use Prettier code style!\n")
    } else {
      const filesDescription =
        numberOfUnformattedFilesFound === 1
          ? "the above file"
          : `${numberOfUnformattedFilesFound} files`
      // Prettier would format the whole Markdown file and needs the plugin
      // configured to format its diagrams, so the repair command names mmdfmt.
      warn(
        io,
        mode.write
          ? `Code style issues fixed in ${filesDescription}.`
          : `Code style issues found in ${filesDescription}. Run mmdfmt with --write to fix.`,
      )
    }
  }
  if (failed) return exitCodes.error
  return numberOfUnformattedFilesFound > 0 && !mode.write
    ? exitCodes.changed
    : exitCodes.ok
}

/**
 * Formats standard input as the file at `filepath`, and writes the result to
 * standard output. A skipped path gets its input back unchanged, and a
 * rejected diagram file gets nothing. With `listsDifference` (`--check` or
 * `--list-different`), the result is not written: `(stdin)` is listed when it
 * differs from the input, unless `write` is given too, as Prettier lists it.
 * `write` alone changes nothing: no file is written.
 */
async function formatStandardInput(
  filepath: string,
  mode: { readonly write: boolean; readonly listsDifference: boolean },
  io: Io,
): Promise<number> {
  const file = path.resolve(io.cwd, filepath)
  const kind = kindOf(file)
  if (kind === undefined) {
    io.stderr(
      `mmdfmt: error: the path of --stdin-filepath does not end in ${endingsInWords}: ${JSON.stringify(filepath)}\n`,
    )
    return exitCodes.error
  }
  const text = await io.readStdin()
  try {
    if (await isSkipped(file, io.cwd)) {
      io.stdout(text)
      return exitCodes.ok
    }
    const result = await formatFile(
      text,
      file,
      kind,
      mode.listsDifference ? "input" : "output",
    )
    report(io, filepath, result.diagnostics)
    if (result.diagnostics.some(isError)) return exitCodes.error
    if (!mode.listsDifference) {
      io.stdout(result.text)
      return exitCodes.ok
    }
    if (result.text === text || mode.write) return exitCodes.ok
    io.stdout("(stdin)\n")
    return exitCodes.changed
  } catch (error) {
    io.stderr(`${filepath}: error: ${messageOf(error)}\n`)
    return exitCodes.error
  }
}

/**
 * Writes a warning of `--check` to standard error, as Prettier's logger
 * writes one: `[warn] ` before the text, with the word `warn` in yellow where
 * the stream shows colors.
 */
function warn(io: Io, text: string): void {
  io.stderr(`[${style(io.stderrStream, "yellow", "warn")}] ${text}\n`)
}

/**
 * `text` in `color` where Node's `util.styleText` colors text for `stream`,
 * and as it is without a stream.
 */
function style(
  stream: NodeJS.WritableStream | undefined,
  color: "gray" | "yellow",
  text: string,
): string {
  return stream === undefined ? text : styleText(color, text, { stream })
}

/**
 * The name of a file in what the tool prints: its path relative to `cwd`, with
 * `/` between its parts on every system, as Prettier's CLI writes the name of a
 * file (README, Usage). `pathOf` is `node:path` of the system the tool runs on;
 * a test gives `path.win32` or `path.posix`.
 */
export function displayName(
  file: string,
  cwd: string,
  pathOf: typeof path = path,
): string {
  return pathOf.relative(cwd, file).replaceAll(pathOf.sep, "/")
}

/** Writes the diagnostics of a file to standard error. */
function report(
  io: Io,
  name: string,
  diagnostics: readonly Diagnostic[],
): void {
  for (const { severity, message, position } of diagnostics) {
    io.stderr(
      `${name}:${position.line}:${position.column}: ${severity}: ${message}\n`,
    )
  }
}

/** Whether a diagnostic makes the run fail. */
function isError(diagnostic: Diagnostic): boolean {
  return diagnostic.severity === "error"
}

/** Reports wrong uses of the arguments, and returns 2 (README, Usage). */
function argumentError(io: Io, messages: readonly string[]): number {
  for (const message of messages) {
    io.stderr(`mmdfmt: error: ${message}\n`)
  }
  return exitCodes.error
}

/** The message of a thrown value. */
function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
