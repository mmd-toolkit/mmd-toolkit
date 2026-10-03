/**
 * Checks formatting on inputs that the tests make mechanically, where
 * hand-written examples miss whole families of inputs. For each input that
 * the parser accepts, formatting must not throw, and formatting the output
 * must change nothing. When mermaid.js accepts the input too, it must read
 * the same diagram from the output (see `describeReadingChange`).
 */
import type { RunMermaidOptions } from "@mmd-toolkit/tests/mermaid"
import { formatMermaid } from "./helpers.ts"
import {
  describeReadingChange,
  isAcceptedAsSpecified,
  readWithMermaid,
} from "./mermaid-readings.ts"

/** A generated input, with the site configuration to run it with. */
export interface GeneratedInput {
  readonly text: string
  readonly options: RunMermaidOptions
}

/** The outcome of checking generated inputs. */
export interface GeneratedReport {
  /** How many inputs were made. */
  readonly made: number
  /** How many of them mermaid.js and the parser accept, checked in full. */
  readonly checked: number
  /**
   * How many of them the parser accepts and mermaid.js rejects, checked for
   * errors and idempotence only.
   */
  readonly checkedRejected: number
  /** One line for each input where formatting went wrong. */
  readonly problems: readonly string[]
}

/** What checking one input found. */
interface InputResult {
  readonly kind: "skipped" | "checked" | "checkedRejected"
  readonly problem: string | null
}

/**
 * The counts of a report in one line, for the test's annotation, which
 * `vitest run --reporter=verbose` shows.
 */
export function describeReport(report: GeneratedReport): string {
  return `made ${report.made}, checked ${report.checked}, checked only for errors and idempotence ${report.checkedRejected}, problems ${report.problems.length}`
}

/**
 * Checks each input in turn. An input that the parser rejects is not
 * checked: formatting reports it (see `failure.test.ts`).
 */
export async function checkGeneratedInputs(
  inputs: Iterable<GeneratedInput>,
): Promise<GeneratedReport> {
  let made = 0
  let checked = 0
  let checkedRejected = 0
  const problems: string[] = []
  for (const input of inputs) {
    made++
    const result = await checkInput(input)
    if (result.kind === "checked") checked++
    if (result.kind === "checkedRejected") checkedRejected++
    if (result.problem !== null) problems.push(result.problem)
  }
  return { made, checked, checkedRejected, problems }
}

/** Checks one input. */
async function checkInput(input: GeneratedInput): Promise<InputResult> {
  const { text, options } = input
  let output: string
  try {
    output = await formatMermaid(text)
  } catch (error) {
    if (isRejectedByParser(error)) {
      return { kind: "skipped", problem: null }
    }
    return {
      kind: "checked",
      problem: `throws ${JSON.stringify(text)}: ${String(error)}`,
    }
  }
  const before = await readWithMermaid(text, options)
  const kind = isAcceptedAsSpecified(before) ? "checked" : "checkedRejected"
  if (kind === "checked") {
    const change = describeReadingChange(
      before,
      await readWithMermaid(output, options),
    )
    if (change !== null) {
      return {
        kind,
        problem: `${change}: ${JSON.stringify(text)} => ${JSON.stringify(output)}`,
      }
    }
  }
  return {
    kind,
    problem: await findIdempotenceProblem(text, output),
  }
}

/** What goes wrong when the output is formatted again, or null. */
async function findIdempotenceProblem(
  text: string,
  output: string,
): Promise<string | null> {
  let again: string
  try {
    again = await formatMermaid(output)
  } catch (error) {
    return `throws on its output ${JSON.stringify(output)}: ${String(error)}`
  }
  if (again === output) return null
  return `not idempotent: ${JSON.stringify(text)} => ${JSON.stringify(output)} => ${JSON.stringify(again)}`
}

/**
 * Whether formatting failed because the parser rejects the text: the plugin
 * reports a `SyntaxError` whose cause is the parser's `ParseError`.
 */
function isRejectedByParser(error: unknown): boolean {
  return (
    error instanceof SyntaxError &&
    error.cause instanceof Error &&
    error.cause.name === "ParseError"
  )
}
