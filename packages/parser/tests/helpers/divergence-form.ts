import { expect } from "vitest"
import type { Fixture } from "@mmd-toolkit/tests"
import { DIVERGENCE_PROPERTIES, embeddedValuesOf } from "@mmd-toolkit/tests"
import { EMPTY_FORM_KINDS, emptyFormsOf } from "../../src/empty-forms.ts"
import { dbOfTree } from "./db-of-tree.ts"
import type { Outcome } from "./known-divergences.ts"
import {
  declaredDivergence,
  oneWayDivergencesIn,
  outcomeOf,
} from "./known-divergences.ts"
import {
  agentflowLexingOf,
  frontmatterChangesAttributeQuotes,
  holdsBarePercentLineBeforeHeader,
  holdsC4KeywordAfterHeader,
  withoutTokenCuts,
} from "./reference-inputs.ts"

/** Check a declared divergence's form independently of acceptance, and its token-cut reference reading. */
export function expectDivergenceForm(fixture: Fixture, outcome: Outcome): void {
  const { knownDivergence, expected } = fixture
  if (knownDivergence === undefined) return
  if (knownDivergence === "tokenless-empty-forms") {
    const lexing = agentflowLexingOf(fixture.input)
    if (lexing !== null) {
      expect(expected.accepted).toBe(true)
      expect(outcome.kind).toBe("reject")
      expect(
        emptyFormsOf(lexing.units, EMPTY_FORM_KINDS.agentflow).map(
          (form) => form.range,
        ),
      ).toContainEqual(outcome.kind === "reject" ? outcome.at : undefined)
      return
    }
  }
  if (
    fixture.specified === undefined &&
    DIVERGENCE_PROPERTIES.get(knownDivergence)?.direction === "reject"
  ) {
    expect(expected.accepted).toBe(true)
    expect(oneWayDivergencesIn(fixture.input, fixture.config)).toContain(
      knownDivergence,
    )
    // With two rejecting forms, the first rejection can declare either mark.
    const declared = declaredDivergence(fixture.input, fixture.config, outcome)
    expect(
      declared === undefined
        ? undefined
        : DIVERGENCE_PROPERTIES.get(declared)?.direction,
    ).toBe("reject")
  }
  switch (knownDivergence) {
    case "directive-as-token-boundary":
    case "ignored-semicolon-as-token-boundary": {
      const reference = withoutTokenCuts(fixture.input)
      const reading = outcomeOf(reference, fixture.config)
      expect(expected.accepted).toBe(true)
      expect(reading.kind).toBe("tree")
      if (!expected.accepted || reading.kind !== "tree") return
      expect(reading.root.diagramType).toBe(expected.diagramType)
      if (expected.db === null) return
      const embedded = embeddedValuesOf(fixture, expected)
      if (embedded === undefined)
        throw new Error("Accepted token-cut reference lacks embedded values")
      expect(dbOfTree(reference, reading.root, embedded)).toEqual(expected.db)
      break
    }
    case "html-tag-in-frontmatter":
      expect(frontmatterChangesAttributeQuotes(fixture.input)).toBe(true)
      break
    case "bare-percent-line-before-header":
      expect(holdsBarePercentLineBeforeHeader(fixture.input)).toBe(true)
      break
    case "c4-keyword-anywhere":
      expect(holdsC4KeywordAfterHeader(fixture.input)).toBe(true)
      break
    default:
      break
  }
}
