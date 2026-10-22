import type { Fixture } from "@mmd-toolkit/tests"

/** The six declared agentflow divergence scopes, with specified readings taking precedence. */
export function agentflowAccepts(fixture: Fixture): boolean {
  if (fixture.specified !== undefined) return fixture.specified.accepted
  switch (fixture.knownDivergence) {
    case "directive-as-token-boundary":
    case "ignored-semicolon-as-token-boundary":
    case "tokenless-empty-forms":
      return false
    case "embedded-data-opaque":
    case "bare-percent-line-before-header":
      return true
    default:
      return fixture.expected.accepted
  }
}
