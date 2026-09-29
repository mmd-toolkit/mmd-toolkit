/**
 * Ways to run mermaid.js with a known divergence removed: the lexer rules of
 * mermaid.js from which the divergence arises are replaced, for the duration
 * of one call, by rules that read as the specification does. An
 * implementation compares itself with mermaid.js read this way to check that
 * the divergence is the only cause of a difference (see
 * docs/expected-results.md).
 */

/**
 * A known divergence (see `KNOWN_DIVERGENCES`) that mermaid.js can be run
 * without.
 */
export type DivergenceRemoval = "comment-takes-character"

/**
 * One lexer rule to replace: the `source` of the compiled rule as mermaid.js
 * builds it, and the `source` it is replaced with. The flags stay those of the
 * rule.
 */
interface RuleReplacement {
  readonly original: string
  readonly replacement: string
}

/**
 * Where the rules are and which ones change. `sampleText` is a text mermaid.js
 * detects as `diagramType`, parsed once to reach the diagram's parser.
 */
interface Removal {
  readonly diagramType: string
  readonly sampleText: string
  readonly rules: readonly RuleReplacement[]
}

/**
 * A pattern that matches nothing. A rule is replaced by it instead of being
 * taken out of the list, since the lexer picks the action of a rule by its
 * index in the list.
 */
const NEVER_MATCHES = "^(?!)"

const REMOVALS: Readonly<Record<DivergenceRemoval, Removal>> = {
  // The sequence lexer reads a character other than `}` before `%%` together
  // with the comment, and reads a number only before a space or a line feed
  // (`sequenceDiagram.jison`, lines 29 and 30 at the pinned commit). Read as
  // the specification does, a comment starts at its `%%`, which the rule for
  // `%` comments then reads, and a number also ends before `%%`.
  "comment-takes-character": {
    diagramType: "sequence",
    sampleText: "sequenceDiagram\n",
    rules: [
      { original: String.raw`^(?:[^\}]%%[^\n]*)`, replacement: NEVER_MATCHES },
      {
        original: String.raw`^(?:([0-9]+(\.[0-9]{1,2})?|\.[0-9]{1,2})(?=[ \n]+))`,
        replacement: String.raw`^(?:([0-9]+(\.[0-9]{1,2})?|\.[0-9]{1,2})(?=[ \n]+|%%))`,
      },
    ],
  },
}

/**
 * Every removal, keyed by the known divergence it removes.
 */
export function allRemovals(): readonly [DivergenceRemoval, Removal][] {
  return Object.entries(REMOVALS) as [DivergenceRemoval, Removal][]
}

/**
 * The rules of a lexer to replace, found by their source, with what they are
 * replaced by.
 */
export interface LexerRewrite {
  readonly rules: RegExp[]
  readonly index: number
  readonly original: RegExp
  readonly replacement: RegExp
}

/**
 * Finds the rules of `removal` in `rules`, the list of a jison lexer, or
 * returns why it cannot: a rule that is missing or found more than once means
 * that mermaid.js changed, and the removal must be checked again.
 */
export function findRewrites(
  rules: RegExp[],
  removal: Removal,
): LexerRewrite[] | string {
  const rewrites: LexerRewrite[] = []
  for (const { original, replacement } of removal.rules) {
    const found = rules.flatMap((rule, index) =>
      rule.source === original ? [{ rule, index }] : [],
    )
    const [match] = found
    if (found.length !== 1 || match === undefined) {
      return `the ${removal.diagramType} lexer has ${found.length} rules ${original}, not one`
    }
    rewrites.push({
      rules,
      index: match.index,
      original: match.rule,
      replacement: new RegExp(replacement, match.rule.flags),
    })
  }
  return rewrites
}

/**
 * Runs `call` with the rules of `rewrites` replaced, and puts them back
 * afterwards.
 */
export async function withRewrites<T>(
  rewrites: readonly LexerRewrite[],
  call: () => Promise<T>,
): Promise<T> {
  for (const rewrite of rewrites) {
    rewrite.rules[rewrite.index] = rewrite.replacement
  }
  try {
    return await call()
  } finally {
    for (const rewrite of rewrites) {
      rewrite.rules[rewrite.index] = rewrite.original
    }
  }
}
