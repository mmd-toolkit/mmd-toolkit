/**
 * What mermaid.js reads from a text, in the two forms that formatting must
 * keep (docs/development.md, The tests), and how a reading changed.
 */
import { isDeepStrictEqual } from "node:util"
import type { Expectation, Fixture } from "@mmd-toolkit/tests"
import { embeddedValuesOf } from "@mmd-toolkit/tests"
import type {
  DivergenceRemoval,
  MermaidRun,
  RunMermaidOptions,
} from "@mmd-toolkit/tests/mermaid"
import { parse } from "@mmd-toolkit/parser"
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

/**
 * Whether the known divergences of `readingDivergences` can change what
 * mermaid.js reads from the text: they change the lexer of sequence and
 * class diagrams only, so the other diagram types are read once. A text
 * that the parser rejects is read both ways.
 */
function isReadDifferentlyWithoutDivergences(text: string): boolean {
  try {
    const { diagramType } = parse(text)
    return diagramType === "sequence" || diagramType === "classDiagram"
  } catch {
    return true
  }
}

/** Reads a text with mermaid.js in both ways (see `Readings`). */
export async function readWithMermaid(
  text: string,
  options: RunMermaidOptions = {},
): Promise<Readings> {
  const specified = await read(text, {
    ...options,
    withoutDivergences: readingDivergences,
  })
  return {
    specified,
    asIs: isReadDifferentlyWithoutDivergences(text)
      ? await read(text, options)
      : specified,
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

/**
 * The readings of the input of a fixture, taken from the corpus instead of
 * mermaid.js: as mermaid.js is, what `expected` records, and as the
 * specification reads it, what `specified` records, which only the fixtures
 * that carry a mark that changes the reading have (the other fixtures are read
 * the same both ways). `undefined` where the text has to be read with
 * mermaid.js: where the corpus has no summary of the Db yet, where the
 * reading of the specification comes from a known divergence that the run of
 * mermaid.js cannot remove, and where the input has embedded data that changes
 * the configuration. The recorded
 * configuration is a difference from the defaults, laid over them again, and
 * mermaid.js drops some keys of its own configuration when an input changes
 * the theme, so the two do not compare equal (`embeddedValuesOf`).
 */
export function readingsOfFixture(fixture: Fixture): Readings | undefined {
  if (
    fixture.specified !== undefined &&
    !(readingDivergences as readonly string[]).includes(
      fixture.knownDivergence ?? "",
    )
  ) {
    // The divergence cannot be removed from the run of mermaid.js, so the
    // output cannot be read as the specification reads it: both texts are
    // read with mermaid.js as it is.
    return undefined
  }
  const asIs = readingOf(fixture, fixture.expected)
  const specified =
    fixture.specified === undefined
      ? asIs
      : readingOf(fixture, fixture.specified)
  return asIs === undefined || specified === undefined
    ? undefined
    : { specified, asIs }
}

/** What mermaid.js read, as the corpus records it. */
function readingOf(
  fixture: Fixture,
  result: Expectation,
): MermaidReading | undefined {
  if (!result.accepted) return { rejectedWith: result.error.name }
  if (result.db === null || result.embedded?.config !== undefined) {
    return undefined
  }
  return {
    outcome: {
      accepted: true,
      diagramType: result.diagramType,
      db: result.db,
    },
    embedded: embeddedValuesOf(fixture, result),
  }
}

/** Runs mermaid.js once. */
async function read(
  text: string,
  options: RunMermaidOptions,
): Promise<MermaidReading> {
  const run = await runMermaidWithEmbeddedData(text, options)
  return run.outcome.accepted ? run : { rejectedWith: run.outcome.error.name }
}
