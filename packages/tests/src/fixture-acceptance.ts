import type { Fixture } from "./index.ts"

/** Whether a marked input is rejected, accepted, or can differ in either direction. */
export type DivergenceDirection = "reject" | "accept" | "both"

/** The acceptance direction and required comparison record of a divergence identifier. */
export interface DivergenceProperties {
  readonly direction: DivergenceDirection
  readonly requiresSpecifiedReading: boolean
}

/** Explicit properties of every identifier in spec/docs/known-divergences.md, independent of diagram type. */
export const DIVERGENCE_PROPERTIES: ReadonlyMap<string, DivergenceProperties> =
  new Map<string, DivergenceProperties>([
    [
      "directive-as-token-boundary",
      { direction: "reject", requiresSpecifiedReading: false },
    ],
    [
      "ignored-semicolon-as-token-boundary",
      { direction: "reject", requiresSpecifiedReading: false },
    ],
    [
      "html-tag-in-frontmatter",
      { direction: "both", requiresSpecifiedReading: true },
    ],
    [
      "embedded-data-opaque",
      { direction: "both", requiresSpecifiedReading: true },
    ],
    [
      "click-reserved-word",
      { direction: "reject", requiresSpecifiedReading: false },
    ],
    [
      "tokenless-empty-forms",
      { direction: "reject", requiresSpecifiedReading: false },
    ],
    [
      "comment-takes-character",
      { direction: "both", requiresSpecifiedReading: true },
    ],
    [
      "comment-takes-line-break",
      { direction: "both", requiresSpecifiedReading: true },
    ],
    [
      "headerless-empty-ending",
      { direction: "reject", requiresSpecifiedReading: false },
    ],
    [
      "name-start-reads-unit",
      { direction: "both", requiresSpecifiedReading: true },
    ],
    [
      "c4-keyword-anywhere",
      { direction: "accept", requiresSpecifiedReading: true },
    ],
    [
      "bare-percent-line-before-header",
      { direction: "accept", requiresSpecifiedReading: true },
    ],
    [
      "percent-brace-after-unit",
      { direction: "accept", requiresSpecifiedReading: true },
    ],
    [
      "blank-line-after-header-or-comments",
      { direction: "accept", requiresSpecifiedReading: true },
    ],
    [
      "title-digit-after-axis-statement",
      { direction: "accept", requiresSpecifiedReading: true },
    ],
  ])

/**
 * Whether the specification accepts a fixture. Checks the mark's explicit
 * reading requirement before using specified acceptance or its direction.
 * Throws with the fixture name and identifier for a missing required reading
 * or an unknown identifier. Unmarked fixtures use mermaid's acceptance.
 */
export function fixtureAccepts(fixture: Fixture): boolean {
  const mark = fixture.knownDivergence
  if (mark === undefined) return fixture.expected.accepted
  const properties = DIVERGENCE_PROPERTIES.get(mark)
  const name = `${fixture.diagram}/${fixture.name}`
  if (properties === undefined)
    throw new Error(`${name}: unknown divergence ${mark}`)
  if (properties.requiresSpecifiedReading && fixture.specified === undefined)
    throw new Error(`${name}: ${mark} requires specified.json`)
  if (fixture.specified !== undefined) return fixture.specified.accepted
  return properties.direction === "accept"
}
