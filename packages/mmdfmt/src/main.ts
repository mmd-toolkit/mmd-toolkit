import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { cli, define, isArgsValidationError } from "gunshi"
import packageJson from "../package.json" with { type: "json" }
import type { Diagnostic } from "./diagnostic.ts"
import { endingsInWords, formatFile, kindOf } from "./format-file.ts"
import { isSkipped, selectFiles } from "./patterns.ts"

/** What the tool reads from and writes to, apart from the files. */
export interface Io {
  /** The current directory, against which patterns and paths are resolved. */
  readonly cwd: string
  readonly readStdin: () => Promise<string>
  readonly stdout: (text: string) => void
  readonly stderr: (text: string) => void
}

/** The exit codes (README, Errors and exit codes). */
const exitCodes = { ok: 0, changed: 1, error: 2 } as const

/** The examples in the usage, one on a line (README, Usage). */
const examples = `mmdfmt --write "**/*.{md,mmd,mermaid}"
mmdfmt --check "**/*.{md,mmd,mermaid}"
mmdfmt --stdin-filepath diagram.mmd < diagram.mmd`

/** Runs the tool with its arguments, and returns the exit code (README, Usage). */
export async function main(args: readonly string[], io: Io): Promise<number> {
  let code: number = exitCodes.ok
  const command = define({
    toKebab: true,
    // gunshi adds --help and --version, draws the usage from the descriptions,
    // and rejects the options that conflict.
    args: {
      write: {
        type: "boolean",
        description: "Rewrite the files that change, and list them",
        conflicts: ["check", "stdinFilepath"],
      },
      check: {
        type: "boolean",
        description: "List the files that --write would change",
        conflicts: ["write", "stdinFilepath"],
      },
      stdinFilepath: {
        type: "string",
        description:
          "Format standard input as the file at this path, and write the result to standard output",
        conflicts: ["write", "check"],
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
      const { write, check, stdinFilepath } = ctx.values
      // gunshi puts the arguments after `--` in rest rather than in patterns.
      const patterns = [...(ctx.values.patterns ?? []), ...ctx.rest]
      if (stdinFilepath !== undefined) {
        code =
          patterns.length > 0
            ? argumentError(io, ["--stdin-filepath takes no patterns"])
            : await formatStandardInput(stdinFilepath, io)
      } else if (ctx.explicit.stdinFilepath) {
        // gunshi gives no value for an empty path, as in --stdin-filepath=,
        // though the option is given (README, Usage).
        code = argumentError(io, ["--stdin-filepath needs a path"])
      } else if (patterns.length === 0) {
        code = argumentError(io, ["no patterns of the files to format"])
      } else if (!write && !check) {
        code = argumentError(io, ["give --write or --check with the patterns"])
      } else {
        code = await formatFiles(patterns, write ? "write" : "check", io)
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
 * Formats the files that the patterns select. With `write`, a file that
 * changes is rewritten; with `check`, it is only listed.
 */
async function formatFiles(
  patterns: readonly string[],
  mode: "write" | "check",
  io: Io,
): Promise<number> {
  const { files, noSelectingPattern, skipped, unmatched, excluded } =
    await selectFiles(patterns, io.cwd)
  // As in Prettier's CLI, patterns that leave nothing to select are an error.
  if (noSelectingPattern) {
    return argumentError(io, [
      skipped.length > 0
        ? "no patterns of the files to format; a pattern in node_modules or a directory of version control is skipped"
        : "no patterns of the files to format; a pattern that starts with ! only excludes files",
    ])
  }
  let failed = unmatched.length > 0 || excluded.length > 0
  let changed = false
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
    const name = path.relative(io.cwd, file.path)
    try {
      if (await isSkipped(file.path, io.cwd)) continue
      const text = await readFile(file.path, "utf8")
      const result = await formatFile(
        text,
        file.path,
        file.kind,
        mode === "write" ? "output" : "input",
      )
      report(io, name, result.diagnostics)
      if (result.diagnostics.some(isError)) {
        failed = true
        continue
      }
      if (result.text === text) continue
      if (mode === "write") await writeFile(file.path, result.text)
      changed = true
      io.stdout(`${name}\n`)
    } catch (error) {
      io.stderr(`${name}: error: ${messageOf(error)}\n`)
      failed = true
    }
  }
  if (failed) return exitCodes.error
  return mode === "check" && changed ? exitCodes.changed : exitCodes.ok
}

/**
 * Formats standard input as the file at `filepath`, and writes the result to
 * standard output. A skipped path gets its input back unchanged, and a
 * rejected diagram file gets nothing.
 */
async function formatStandardInput(filepath: string, io: Io): Promise<number> {
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
    const result = await formatFile(text, file, kind, "output")
    report(io, filepath, result.diagnostics)
    if (result.diagnostics.some(isError)) return exitCodes.error
    io.stdout(result.text)
    return exitCodes.ok
  } catch (error) {
    io.stderr(`${filepath}: error: ${messageOf(error)}\n`)
    return exitCodes.error
  }
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
