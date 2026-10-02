/**
 * Ways to run mermaid.js with a known divergence removed: the lexer rules of
 * mermaid.js from which the divergence arises are replaced, or tried in
 * another order, for the duration of one call, so that the lexer reads as the
 * specification does. An implementation compares itself with mermaid.js read
 * this way to check that the divergence is the only cause of a difference
 * (see docs/expected-results.md).
 */

/**
 * A known divergence (see `KNOWN_DIVERGENCES`) that mermaid.js can be run
 * without.
 */
export type DivergenceRemoval =
  | "comment-takes-character"
  | "comment-takes-line-break"
  | "name-start-reads-unit"

/**
 * One change to a lexer. A rule is found by the `source` of the compiled rule
 * as mermaid.js builds it.
 *
 * - `pattern`: the rule `original` is replaced by another pattern, with the
 *   flags of the rule.
 * - `by-line-position`: the rule `original` is replaced by one of two patterns,
 *   chosen each time the lexer tries the rule. `lineStart` is used when what
 *   the lexer has read of the current line is only whitespace, and `midLine`
 *   otherwise. A line here is a line of the text after mermaid's
 *   preprocessing, which the lexer reads: line breaks made line feeds, and the
 *   frontmatter, directives and comment lines taken out.
 * - `try-first`: in the start state `state`, the rules with the sources
 *   `sources` are tried first, in this order, and the other rules of the state
 *   after them in their own order. Each is found among the rules that only
 *   that state tries, so that a rule of every state with the same source is
 *   not taken for it. The rules themselves do not change.
 */
type LexerChange =
  | {
      readonly kind: "pattern"
      readonly original: string
      readonly source: string
    }
  | {
      readonly kind: "by-line-position"
      readonly original: string
      readonly lineStart: string
      readonly midLine: string
    }
  | {
      readonly kind: "try-first"
      readonly state: string
      readonly sources: readonly string[]
    }

/**
 * Where the lexer is and what changes in it. `sampleText` is a text mermaid.js
 * accepts and detects as `diagramType`, parsed once to reach the diagram's
 * parser.
 */
interface Removal {
  readonly diagramType: string
  readonly sampleText: string
  readonly changes: readonly LexerChange[]
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
    changes: [
      {
        kind: "pattern",
        original: String.raw`^(?:[^\}]%%[^\n]*)`,
        source: NEVER_MATCHES,
      },
      {
        kind: "pattern",
        original: String.raw`^(?:([0-9]+(\.[0-9]{1,2})?|\.[0-9]{1,2})(?=[ \n]+))`,
        source: String.raw`^(?:([0-9]+(\.[0-9]{1,2})?|\.[0-9]{1,2})(?=[ \n]+|%%))`,
      },
    ],
  },
  // The class lexer reads `%%`, the rest of the line and the line breaks after
  // it as one comment (`classDiagram.jison`, line 28 at the pinned commit), so
  // a comment after a unit joins the next line to its own. Read as the
  // specification does, such a comment ends at the end of its line, and the
  // line break is read as one; a comment with only whitespace before it on its
  // line still takes its line break, as in mermaid.js.
  "comment-takes-line-break": {
    diagramType: "classDiagram",
    sampleText: "classDiagram\n  class A\n",
    changes: [
      {
        kind: "by-line-position",
        original: String.raw`^(?:%%(?!\{)*[^\n]*(\r?\n?)+)`,
        lineStart: String.raw`^(?:%%(?!\{)*[^\n]*(\r?\n?)+)`,
        midLine: String.raw`^(?:%%[^\n]*)`,
      },
    ],
  },
  // Inside a backquoted name and a generic type, the class lexer tries the
  // rules of every state (`"`, keywords, `<<`, `>>`, `~`) before the rules that
  // close the name or the type and read its text (`classDiagram.jison`, lines
  // 106 to 112 at the pinned commit), so such a word at the start of the text
  // is read as a unit of its own. Read as the specification does, the text is
  // any characters up to the closing mark: the closing rule and the text rule
  // are tried first.
  "name-start-reads-unit": {
    diagramType: "classDiagram",
    sampleText: "classDiagram\n  class A\n",
    changes: [
      {
        kind: "try-first",
        state: "bqstring",
        sources: ["^(?:[`])", "^(?:[^`]+)"],
      },
      {
        kind: "try-first",
        state: "generic",
        sources: ["^(?:[~])", "^(?:[^~]*)"],
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
 * The part of a jison lexer that a removal changes: its list of rules; its
 * start states, each with the indexes of the rules it tries, in order; and
 * `setInput`, which the parser calls with the whole text before reading it.
 */
export interface JisonLexer {
  rules: RegExp[]
  conditions: Record<string, { rules: number[] } | undefined>
  setInput: (input: string, ...rest: unknown[]) => unknown
}

/**
 * Remembers the text the lexer was given, to tell how much of it the lexer
 * has read: the lexer tries a rule on what is left of the text, so what was
 * read is the text without that rest. That holds only while what is left is
 * an end of the text; when it is not, the lexer put back other text, and the
 * problem is kept to stop the run instead of answering wrongly.
 */
class ReadPosition {
  private input: string | undefined

  private problem: string | undefined

  /** Starts over for a new call. */
  public reset(): void {
    this.input = undefined
    this.problem = undefined
  }

  /** Remembers the text given to the lexer. */
  public setInput(input: unknown): void {
    this.input = typeof input === "string" ? input : undefined
  }

  /**
   * What the lexer has read of the current line, given what is left of the
   * text, or `undefined` when that cannot be told.
   */
  public readOfLine(rest: string): string | undefined {
    if (this.input === undefined || !this.input.endsWith(rest)) {
      this.problem ??=
        "the lexer was not given its text through setInput, or put back text it had not read"
      return undefined
    }
    const read = this.input.slice(0, this.input.length - rest.length)
    return read.slice(read.lastIndexOf("\n") + 1)
  }

  /**
   * Why the read position could not be told during the call, if it could not.
   */
  public problemOfCall(): string | undefined {
    return this.problem
  }
}

/**
 * A lexer rule that matches with one of two patterns, chosen by where the
 * lexer is in the current line (see `by-line-position` in
 * {@link LexerChange}). The lexer matches a rule with `text.match(rule)`, which
 * calls `Symbol.match` of the rule.
 */
class LinePositionRule extends RegExp {
  private readonly lineStart: RegExp

  private readonly midLine: RegExp

  private readonly position: ReadPosition

  public constructor(
    lineStart: RegExp,
    midLine: RegExp,
    position: ReadPosition,
  ) {
    super(lineStart.source, lineStart.flags)
    this.lineStart = lineStart
    this.midLine = midLine
    this.position = position
  }

  public override [Symbol.match](rest: string): RegExpMatchArray | null {
    const read = this.position.readOfLine(rest)
    if (read === undefined) return null
    // `trim` removes exactly the characters the specification calls whitespace.
    const pattern = read.trim() === "" ? this.lineStart : this.midLine
    return pattern[Symbol.match](rest)
  }
}

/**
 * One property of the lexer replaced for a call.
 */
interface Swap {
  readonly target: Record<string | number, unknown>
  readonly key: string | number
  readonly original: unknown
  readonly replacement: unknown
}

/**
 * What one removal changes in a lexer, found by {@link findRewrites}.
 */
export interface LexerRewrite {
  readonly swaps: readonly Swap[]
  readonly position: ReadPosition
}

/**
 * Finds the rules of `removal` in `lexer`, or returns why it cannot: a rule
 * that is missing or found more than once means that mermaid.js changed, and
 * the removal must be checked again.
 */
export function findRewrites(
  lexer: JisonLexer,
  removal: Removal,
): LexerRewrite | string {
  const position = new ReadPosition()
  const swaps: Swap[] = []
  let readsLinePosition = false
  for (const change of removal.changes) {
    if (change.kind === "try-first") {
      const swap = tryFirstSwap(lexer, removal.diagramType, change)
      if (typeof swap === "string") return swap
      swaps.push(swap)
      continue
    }
    const found = lexer.rules.flatMap((rule, index) =>
      rule.source === change.original ? [{ rule, index }] : [],
    )
    const [match] = found
    if (found.length !== 1 || match === undefined) {
      return `the ${removal.diagramType} lexer has ${found.length} rules ${change.original}, not one`
    }
    const { rule, index } = match
    let replacementRule: RegExp
    if (change.kind === "pattern") {
      replacementRule = new RegExp(change.source, rule.flags)
    } else {
      readsLinePosition = true
      replacementRule = new LinePositionRule(
        new RegExp(change.lineStart, rule.flags),
        new RegExp(change.midLine, rule.flags),
        position,
      )
    }
    swaps.push({
      target: lexer.rules as unknown as Record<number, unknown>,
      key: index,
      original: rule,
      replacement: replacementRule,
    })
  }
  if (readsLinePosition) {
    const originalSetInput = lexer.setInput
    swaps.push({
      target: lexer as unknown as Record<string, unknown>,
      key: "setInput",
      original: originalSetInput,
      replacement: function setInput(
        this: unknown,
        input: string,
        ...rest: unknown[]
      ): unknown {
        position.setInput(input)
        return originalSetInput.call(this, input, ...rest)
      },
    })
  }
  return { swaps, position }
}

/**
 * The swap of the rule order of a start state for a `try-first` change, or
 * why it cannot be made.
 */
function tryFirstSwap(
  lexer: JisonLexer,
  diagramType: string,
  change: Extract<LexerChange, { kind: "try-first" }>,
): Swap | string {
  const condition = lexer.conditions[change.state]
  if (condition === undefined) {
    return `the ${diagramType} lexer has no start state ${change.state}`
  }
  const first: number[] = []
  for (const source of change.sources) {
    const found = condition.rules.filter(
      (index) =>
        lexer.rules[index]?.source === source &&
        isTriedOnlyIn(lexer, index, change.state),
    )
    const [index] = found
    if (found.length !== 1 || index === undefined) {
      return `the ${diagramType} lexer has ${found.length} rules ${source} that only the start state ${change.state} tries, not one`
    }
    first.push(index)
  }
  return {
    target: condition as unknown as Record<string, unknown>,
    key: "rules",
    original: condition.rules,
    replacement: [
      ...first,
      ...condition.rules.filter((index) => !first.includes(index)),
    ],
  }
}

/**
 * Whether the rule at `index` is tried in the start state `state` and in no
 * other.
 */
function isTriedOnlyIn(
  lexer: JisonLexer,
  index: number,
  state: string,
): boolean {
  return Object.entries(lexer.conditions).every(
    ([name, condition]) =>
      (name === state) === (condition?.rules.includes(index) ?? false),
  )
}

/**
 * The rewrite of each removal of one call, by the removal it comes from.
 */
export type NamedRewrites = readonly (readonly [
  DivergenceRemoval,
  LexerRewrite,
])[]

/**
 * Why `rewrites` cannot be made together, if they cannot: two of them change
 * the same property of the same lexer object, such as one rule, the rule
 * order of one start state, or `setInput`, and the one made last would undo
 * the other.
 */
export function overlapOf(rewrites: NamedRewrites): string | undefined {
  const changed: { readonly name: DivergenceRemoval; readonly swap: Swap }[] =
    []
  for (const [name, rewrite] of rewrites) {
    for (const swap of rewrite.swaps) {
      const other = changed.find(
        (entry) =>
          entry.swap.target === swap.target && entry.swap.key === swap.key,
      )
      if (other !== undefined) {
        return `${other.name} and ${name} change the same part of the lexer (${String(swap.key)}), so they cannot be removed together`
      }
      changed.push({ name, swap })
    }
  }
  return undefined
}

/**
 * Runs `call` with the swaps of every rewrite made, and undoes them
 * afterwards. The rewrites must not overlap (see {@link overlapOf}). Returns
 * the result of the call, and why the read position could not be told during
 * it, if it could not, with the removal it concerns (the result is then not to
 * be trusted).
 */
export async function withRewrites<T>(
  rewrites: NamedRewrites,
  call: () => Promise<T>,
): Promise<{ readonly result: T; readonly problem: string | undefined }> {
  const swaps = rewrites.flatMap(([, rewrite]) => rewrite.swaps)
  for (const [, rewrite] of rewrites) rewrite.position.reset()
  for (const swap of swaps) swap.target[swap.key] = swap.replacement
  try {
    const result = await call()
    return { result, problem: problemOfCall(rewrites) }
  } finally {
    for (const swap of swaps) swap.target[swap.key] = swap.original
  }
}

/**
 * The first problem of the read position in `rewrites` during the call, with
 * the removal it concerns.
 */
function problemOfCall(rewrites: NamedRewrites): string | undefined {
  for (const [name, rewrite] of rewrites) {
    const problem = rewrite.position.problemOfCall()
    if (problem !== undefined) return `${name}: ${problem}`
  }
  return undefined
}
