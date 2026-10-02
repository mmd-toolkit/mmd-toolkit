import type { DivergenceRemoval } from "./divergence-removals.ts"
import type { MermaidConfig } from "./types.ts"

/**
 * The options of `runMermaid()` and the functions beside it.
 */
export interface RunMermaidOptions {
  /**
   * Site configuration passed to `mermaid.initialize()`, as a host page would.
   * Secure keys such as `securityLevel` and `maxEdges` can only be set here.
   */
  readonly config?: MermaidConfig
  /**
   * Runs mermaid.js with its lexers changed so that these known divergences do
   * not arise, for this call only (see docs/expected-results.md). Each
   * identifier counts once, and an empty list runs mermaid.js as it is. The
   * input may be of any diagram type; only the lexer of the diagram type a
   * divergence belongs to changes. Divergences whose changes touch the same
   * part of one lexer cannot be removed together, and the call throws.
   */
  readonly withoutDivergences?: readonly DivergenceRemoval[]
}

/**
 * The keys of {@link RunMermaidOptions}. A test checks that the two agree.
 */
export const RUN_MERMAID_OPTION_KEYS = ["config", "withoutDivergences"] as const

/**
 * Throws when `options` has a key that {@link RunMermaidOptions} does not
 * have. An option that was renamed or misspelled would otherwise be ignored,
 * and mermaid.js would run without it, which a type check misses when the
 * options are built by spreading another object.
 */
export function checkRunMermaidOptions(options: RunMermaidOptions): void {
  const known: readonly string[] = RUN_MERMAID_OPTION_KEYS
  const unknown = Object.keys(options).filter((key) => !known.includes(key))
  if (unknown.length > 0) {
    throw new TypeError(
      `unknown options ${unknown.join(", ")}; the options are ${known.join(", ")}`,
    )
  }
}
