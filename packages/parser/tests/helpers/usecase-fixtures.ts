import type { Fixture } from "@mmd-toolkit/tests"

/** Specified readings win; unqualified divergence fixtures reject except opaque embedded data. */
export function usecaseAccepts(fixture: Fixture): boolean {
  if (fixture.specified !== undefined) return fixture.specified.accepted
  if (fixture.knownDivergence === "embedded-data-opaque") return true
  return fixture.knownDivergence === undefined && fixture.expected.accepted
}
