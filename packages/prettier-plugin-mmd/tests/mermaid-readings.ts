/**
 * What mermaid.js reads from a text, in the two forms that formatting must
 * keep (docs/development.md, The tests), and how a reading changed.
 */
import { isDeepStrictEqual } from "node:util"
import type { MermaidRun, RunMermaidOptions } from "@mmd-toolkit/tests/mermaid"
import { runMermaidWithEmbeddedData } from "@mmd-toolkit/tests/mermaid"

/**
 * What mermaid.js did with a text. A rejection is kept as its error name
 * only, since its message quotes the input.
 */
export type MermaidReading = MermaidRun | { readonly rejectedWith: string }

/** The two readings of a text. */
export interface Readings {
  /**
   * mermaid.js run without the known divergence `comment-takes-character`,
   * so that it reads the text as the specification does: the Db that
   * formatting must keep is the one of the specification (AGENTS.md,
   * criterion 2).
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
      withoutDivergence: "comment-takes-character",
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
 * the reading of mermaid.js as it is wherever it accepts both texts, since
 * formatting must not change what mermaid.js draws.
 */
export function describeReadingChange(
  before: Readings,
  after: Readings,
): string | null {
  if (!isDeepStrictEqual(after.specified, before.specified)) {
    return "rejectedWith" in after.specified ? "is rejected" : "changes the Db"
  }
  if (
    !("rejectedWith" in before.asIs) &&
    !("rejectedWith" in after.asIs) &&
    !isDeepStrictEqual(after.asIs, before.asIs)
  ) {
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
