import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { hasPriorityValidationError } from "gunshi"
import type { Args, CommandContext } from "gunshi/bone"
import { cli } from "gunshi/bone"
import packageJson from "../package.json" with { type: "json" }
import type { Diagnostic } from "./diagnostic.ts"
import { fileEndings, formatFile, kindOf } from "./format-file.ts"
import { isSkipped, selectFiles } from "./patterns.ts"

/** What the tool reads from and writes to, apart from the files. */
export interface Io {
  /** The current directory, against which patterns and paths are resolved. */
  readonly cwd: string
  readonly readStdin: () => Promise<string>
  readonly stdout: (text: string) => void
  readonly stderr: (text: string) => void
}

/** The exit codes (README, Exit codes). */
const exitCodes = { ok: 0, changed: 1, error: 2 } as const

/** The options that the tool accepts (README, Usage). */
const commandArgs = {
  write: { type: "boolean" },
  check: { type: "boolean" },
  "stdin-filepath": { type: "string" },
  help: { type: "boolean" },
  version: { type: "boolean" },
} satisfies Args

/** The gunshi context for the tool's declared options. */
type MmdfmtContext = CommandContext<{ args: typeof commandArgs }>

const usage = `Usage: mmdfmt --write <pattern>...
       mmdfmt --check <pattern>...
       mmdfmt --stdin-filepath <path>

Formats Mermaid diagrams, and nothing else: .mmd and .mermaid files, and the
mermaid and mmd code blocks of .md and .markdown files.

Options:
  --write                  Rewrite the files that change, and list them.
  --check                  List the files that --write would change.
  --stdin-filepath <path>  Format standard input as the file at <path>, and
                           write the result to standard output.
  --help                   Print this usage.
  --version                Print the version.
`

/** The endings of the files that the tool formats, as a message names them. */
const endingsInWords = `${fileEndings.slice(0, -1).join(", ")}, or ${fileEndings.at(-1)}`

/** Runs the tool with its arguments, and returns the exit code (README, Usage). */
export async function main(args: readonly string[], io: Io): Promise<number> {
  let code: number = exitCodes.ok
  try {
    await cli<typeof commandArgs>(
      [...args],
      {
        args: commandArgs,
        /** Carries the exit code out of gunshi's command runner. */
        async run(ctx) {
          code = await runCommand(ctx, io)
        },
      },
      { strict: true },
    )
  } catch (error) {
    // gunshi throws unknown-option errors (its priority validation errors)
    // before running the command.
    if (error instanceof AggregateError && hasPriorityValidationError(error)) {
      return usageError(io, error.errors.map(messageOf))
    }
    throw error
  }
  return code
}

/** Checks the options and selects the mode (README, Usage). */
async function runCommand(
  ctx: Readonly<MmdfmtContext>,
  io: Io,
): Promise<number> {
  // gunshi passes validation errors other than unknown options to the command,
  // for example --stdin-filepath without a value.
  if (ctx.validationError) {
    return usageError(io, ctx.validationError.errors.map(messageOf))
  }
  const { values } = ctx
  if (values.help) {
    io.stdout(usage)
    return exitCodes.ok
  }
  if (values.version) {
    io.stdout(`${packageJson.version}\n`)
    return exitCodes.ok
  }
  // gunshi puts arguments after `--` in rest rather than positionals.
  const positionals = [...ctx.positionals, ...ctx.rest]
  const stdinFilepath = values["stdin-filepath"]
  if (stdinFilepath !== undefined) {
    if (positionals.length > 0 || values.write || values.check) {
      return usageError(io, [
        "--stdin-filepath takes no patterns, and neither --write nor --check",
      ])
    }
    return formatStandardInput(stdinFilepath, io)
  }
  if (positionals.length === 0) {
    return usageError(io, ["no patterns of the files to format"])
  }
  if (values.write && values.check) {
    return usageError(io, ["--write and --check cannot be given together"])
  }
  if (!values.write && !values.check) {
    return usageError(io, ["give --write or --check with the patterns"])
  }
  return formatFiles(positionals, values.write ? "write" : "check", io)
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
  const { files, unmatched } = await selectFiles(patterns, io.cwd)
  let failed = unmatched.length > 0
  let changed = false
  for (const pattern of unmatched) {
    io.stderr(
      `mmdfmt: error: no file ending in ${endingsInWords} matches ${JSON.stringify(pattern)}\n`,
    )
  }
  for (const file of files) {
    const name = path.relative(io.cwd, file.path)
    try {
      if (await isSkipped(file.path, io.cwd)) continue
      const text = await readFile(file.path, "utf8")
      const result = await formatFile(text, file.path, file.kind)
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
    const result = await formatFile(text, file, kind)
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

/** Reports wrong uses with the usage once, and returns 2 (README, Usage). */
function usageError(io: Io, messages: readonly string[]): number {
  for (const message of messages) {
    io.stderr(`mmdfmt: error: ${message}\n`)
  }
  io.stderr(`\n${usage}`)
  return exitCodes.error
}

/** The message of a thrown value. */
function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
