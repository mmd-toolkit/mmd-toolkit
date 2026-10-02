/**
 * What mermaid.js reads from a text, in the two forms that formatting must
 * keep (docs/development.md, The tests), and how a reading changed.
 */
import { isDeepStrictEqual } from "node:util"
import type {
  DivergenceRemoval,
  MermaidRun,
  RunMermaidOptions,
} from "@mmd-toolkit/tests/mermaid"
import { runMermaidWithEmbeddedData } from "@mmd-toolkit/tests/mermaid"

/**
 * What mermaid.js did with a text. A rejection is kept as its error name
 * only, since its message quotes the input.
 */
export type MermaidReading = MermaidRun | { readonly rejectedWith: string }

/**
 * The known divergences that make mermaid.js read an accepted text
 * otherwise than the specification (packages/spec/docs/known-divergences.md):
 * a comment that takes the character before it in a sequence diagram, a
 * comment that takes the line breaks after it in a class diagram, and a
 * backquoted name or generic type of a class diagram whose start mermaid.js
 * reads as another unit. Each changes the lexer of its diagram type only.
 */
const readingDivergences: readonly DivergenceRemoval[] = [
  "comment-takes-character",
  "comment-takes-line-break",
  "name-start-reads-unit",
]

/** The two readings of a text. */
export interface Readings {
  /**
   * mermaid.js run without the known divergences that change the reading
   * (see `readingDivergences`), so that it reads the text as the
   * specification does: the Db that formatting must keep is the one of the
   * specification (AGENTS.md, criterion 2).
   */
  readonly specified: MermaidReading
  /** mermaid.js as it is, which draws the diagram. */
  readonly asIs: MermaidReading
}

/** Reads a text with mermaid.js in both ways (see `Readings`). */
export async function readWithMermaid(
  text: string,
  options: RunMermaidOptions = {},
): Promise<Readings> {
  return {
    specified: await read(text, {
      ...options,
      withoutDivergences: readingDivergences,
    }),
    asIs: await read(text, options),
  }
}

/** Whether mermaid.js accepts the text as the specification reads it. */
export function isAcceptedAsSpecified(readings: Readings): boolean {
  return !("rejectedWith" in readings.specified)
}

/**
 * How the readings changed from `before` to `after`, or null when
 * formatting kept them: the specified reading must be the same, and so must
 * the reading of mermaid.js as it is wherever it accepts the text before
 * formatting, since formatting must not change what mermaid.js draws.
 */
export function describeReadingChange(
  before: Readings,
  after: Readings,
): string | null {
  if (!isDeepStrictEqual(after.specified, before.specified)) {
    return "rejectedWith" in after.specified ? "is rejected" : "changes the Db"
  }
  if ("rejectedWith" in before.asIs) return null
  if ("rejectedWith" in after.asIs) return "is rejected by mermaid.js as it is"
  if (!isDeepStrictEqual(after.asIs, before.asIs)) {
    return "changes the Db of mermaid.js as it is"
  }
  return null
}

/** Runs mermaid.js once. */
async function read(
  text: string,
  options: RunMermaidOptions,
): Promise<MermaidReading> {
  const run = await runMermaidWithEmbeddedData(text, options)
  return run.outcome.accepted ? run : { rejectedWith: run.outcome.error.name }
}
