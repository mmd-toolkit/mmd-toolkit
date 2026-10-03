/**
 * Mutation differential testing: derive many near-miss inputs from a fixture,
 * run each through mermaid.js and through a candidate implementation, and
 * report where the two disagree.
 *
 * The point is to reach the corners of mermaid's grammar that no fixture
 * covers, above all where the Jison lexer's rule order decides the outcome.
 * Mutants are generated deterministically from a seed, so a failure can be
 * reproduced from the fixture name and the seed alone.
 */
import { isDeepStrictEqual } from "node:util"
import {
  MermaidEnvironmentError,
  runMermaidWithEmbeddedData,
} from "./mermaid.ts"
import type { EmbeddedValues, MermaidOutcome } from "./mermaid.ts"
import { KNOWN_DIVERGENCES } from "./index.ts"
import type { DbSummary, MermaidConfig } from "./types.ts"

// ---------------------------------------------------------------------------
// Mutants

export interface Mutant {
  /** The mutated text. */
  readonly text: string
  /** Which edit produced it, e.g. `insert-char "|" at 12`. */
  readonly description: string
}

export interface MutateOptions {
  /** Seed of the pseudo-random choice of edits. Default 1. */
  readonly seed?: number
  /**
   * Number of distinct mutants to return, at most. Default: one round, that is
   * one mutant for each edit operator that applies to the input.
   */
  readonly count?: number
}

/**
 * Characters inserted or substituted by character-level edits: the
 * punctuation that carries meaning somewhere in mermaid's grammars, the
 * whitespace and line break kinds (including a lone CR, a no-break space and
 * a byte order mark), and one letter and one digit.
 */
const MUTATION_ALPHABET: readonly string[] = [
  ..." \t\n\r\u00a0\ufeff-=.>o<x|[](){}/\\:;,&@\"'`%#*~^!+",
  "a",
  "1",
]

type Operator = {
  readonly name: string
  /** Number of distinct positions the edit can apply to (0 = not applicable). */
  readonly size: (shape: Shape) => number
  readonly apply: (
    text: string,
    shape: Shape,
    index: number,
    pick: () => number,
  ) => Mutant
}

interface Span {
  readonly start: number
  readonly end: number
}

interface Shape {
  readonly tokens: readonly Span[]
  readonly lines: readonly Span[]
}

const OPERATORS: readonly Operator[] = [
  {
    name: "delete-char",
    size: (shape) => lastEnd(shape.lines),
    apply: (text, _shape, i) => ({
      text: text.slice(0, i) + text.slice(i + 1),
      description: `delete-char ${JSON.stringify(text[i])} at ${i}`,
    }),
  },
  {
    name: "insert-char",
    size: (shape) => lastEnd(shape.lines) + 1,
    apply: (text, _shape, i, pick) => {
      const char = MUTATION_ALPHABET[pick() % MUTATION_ALPHABET.length]
      return {
        text: text.slice(0, i) + char + text.slice(i),
        description: `insert-char ${JSON.stringify(char)} at ${i}`,
      }
    },
  },
  {
    name: "replace-char",
    size: (shape) => lastEnd(shape.lines),
    apply: (text, _shape, i, pick) => {
      const char = MUTATION_ALPHABET[pick() % MUTATION_ALPHABET.length]
      return {
        text: text.slice(0, i) + char + text.slice(i + 1),
        description: `replace-char ${JSON.stringify(text[i])} with ${JSON.stringify(char)} at ${i}`,
      }
    },
  },
  {
    name: "delete-token",
    size: (shape) => shape.tokens.length,
    apply: (text, shape, i) => {
      const token = shape.tokens[i]
      return {
        text: text.slice(0, token.start) + text.slice(token.end),
        description: `delete-token ${JSON.stringify(text.slice(token.start, token.end))} at ${token.start}`,
      }
    },
  },
  {
    name: "duplicate-token",
    size: (shape) => shape.tokens.length,
    apply: (text, shape, i) => {
      const token = shape.tokens[i]
      const value = text.slice(token.start, token.end)
      return {
        text: text.slice(0, token.end) + value + text.slice(token.end),
        description: `duplicate-token ${JSON.stringify(value)} at ${token.start}`,
      }
    },
  },
  {
    name: "swap-tokens",
    size: (shape) => Math.max(0, shape.tokens.length - 1),
    apply: (text, shape, i) => {
      const a = shape.tokens[i]
      const b = shape.tokens[i + 1]
      return {
        text:
          text.slice(0, a.start) +
          text.slice(b.start, b.end) +
          text.slice(a.end, b.start) +
          text.slice(a.start, a.end) +
          text.slice(b.end),
        description: `swap-tokens ${JSON.stringify(text.slice(a.start, a.end))} and ${JSON.stringify(text.slice(b.start, b.end))} at ${a.start}`,
      }
    },
  },
  {
    name: "delete-line",
    size: (shape) => shape.lines.length,
    apply: (text, shape, i) => {
      const line = shape.lines[i]
      return {
        text: text.slice(0, line.start) + text.slice(line.end),
        description: `delete-line ${i + 1}`,
      }
    },
  },
  {
    name: "duplicate-line",
    size: (shape) => shape.lines.length,
    apply: (text, shape, i) => {
      const line = shape.lines[i]
      const value = text.slice(line.start, line.end)
      const separator = lineBreakOf(value) ? "" : "\n"
      return {
        text:
          text.slice(0, line.end) + separator + value + text.slice(line.end),
        description: `duplicate-line ${i + 1}`,
      }
    },
  },
  {
    name: "swap-lines",
    size: (shape) => Math.max(0, shape.lines.length - 1),
    apply: (text, shape, i) => {
      const a = shape.lines[i]
      const b = shape.lines[i + 1]
      // Swap the contents; each line break stays where it was.
      const first = text.slice(a.start, a.end)
      const second = text.slice(b.start, b.end)
      const firstBreak = lineBreakOf(first)
      const secondBreak = lineBreakOf(second)
      const firstContent = first.slice(0, first.length - firstBreak.length)
      const secondContent = second.slice(0, second.length - secondBreak.length)
      return {
        text: `${text.slice(0, a.start)}${secondContent}${firstBreak}${firstContent}${secondBreak}${text.slice(b.end)}`,
        description: `swap-lines ${i + 1} and ${i + 2}`,
      }
    },
  },
]

/** The most times a mutant is looked for with one operator, when it equals the input or an earlier mutant. */
const MOST_ATTEMPTS_PER_MUTANT = 20

/**
 * Returns `items` in an order chosen by `pick` (Fisher–Yates).
 */
function shuffled<T>(items: readonly T[], pick: () => number): T[] {
  const order = [...items]
  for (let last = order.length - 1; last > 0; last--) {
    const chosen = pick() % (last + 1)
    const other = order[chosen]
    order[chosen] = order[last]
    order[last] = other
  }
  return order
}

/**
 * Returns up to `count` distinct mutants of `input`, each one edit away from
 * it. The same input and seed always give the same mutants.
 *
 * The operators that apply to the input (an operator applies when it has a
 * place to edit) are put in an order chosen by the seed and the input, and
 * mutant n uses the operator n modulo their number, at a position chosen
 * uniformly among its positions. So the first mutants use different operators,
 * and with `count` at least the number of the operators that apply, every one
 * of them is used at least once, whatever the seed: token and line edits are
 * not drowned out by the far more numerous character edits, and not left to
 * chance. Without `count`, one mutant is made for each operator that applies.
 * With `count` 1, the operator is chosen uniformly among those that apply.
 *
 * A mutant that equals the input or an earlier mutant is looked for again with
 * the same operator, at most 20 times; when none is found, there is no mutant
 * for that n, and no other operator takes its place, since the operator that
 * was due is the one that must be used.
 */
export function mutate(input: string, options: MutateOptions = {}): Mutant[] {
  const random = mulberry32(hashString(`${options.seed ?? 1}\u0000${input}`))

  /** Returns a pseudo-random unsigned 32-bit integer. */
  function pick(): number {
    return Math.floor(random() * 0x100000000)
  }

  const shape = shapeOf(input)
  const order = shuffled(
    OPERATORS.filter((operator) => operator.size(shape) > 0),
    pick,
  )
  if (order.length === 0) return []
  const count = options.count ?? order.length
  const seen = new Set<string>([input])
  const mutants: Mutant[] = []
  for (let n = 0; n < count; n++) {
    const operator = order[n % order.length]
    for (let attempt = 0; attempt < MOST_ATTEMPTS_PER_MUTANT; attempt++) {
      const mutant = operator.apply(
        input,
        shape,
        pick() % operator.size(shape),
        pick,
      )
      if (seen.has(mutant.text)) continue
      seen.add(mutant.text)
      mutants.push(mutant)
      break
    }
  }
  return mutants
}

/** Tokens: runs of word characters, runs of one punctuation character, runs of blanks. */
function shapeOf(text: string): Shape {
  const tokens: Span[] = []
  const tokenPattern =
    /[\p{L}\p{N}_]+|[\t ]+|\r\n|[\n\r]|([^\s\p{L}\p{N}_])\1*/gu
  for (const match of text.matchAll(tokenPattern)) {
    if (/^(?:\r\n|[\n\r])$/u.test(match[0])) continue
    tokens.push({ start: match.index, end: match.index + match[0].length })
  }
  // Lines end at LF, CRLF or a lone CR, as mermaid's lexers see them.
  const lines: Span[] = []
  let start = 0
  for (const match of text.matchAll(/\r\n|[\n\r]/gu)) {
    const end = match.index + match[0].length
    lines.push({ start, end })
    start = end
  }
  if (start < text.length) lines.push({ start, end: text.length })
  return { tokens, lines }
}

/**
 * Returns the end offset of the last span, or 0.
 */
function lastEnd(spans: readonly Span[]): number {
  return spans.at(-1)?.end ?? 0
}

/**
 * Returns the line break a line ends with (CRLF, LF or CR), or "".
 */
function lineBreakOf(line: string): string {
  if (line.endsWith("\r\n")) return "\r\n"
  if (line.endsWith("\n")) return "\n"
  return line.endsWith("\r") ? "\r" : ""
}

/**
 * FNV-1a hash of a string, 32 bits.
 */
function hashString(value: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

/**
 * Small seeded pseudo-random generator returning numbers in [0, 1).
 */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000
  }
}

// ---------------------------------------------------------------------------
// Comparison

/**
 * What the implementation under test did with an input. `diagramType` and
 * `db` are optional so that an implementation can be compared on acceptance
 * alone before it builds a Db summary.
 */
export type CandidateOutcome = (
  | {
      readonly accepted: true
      /** mermaid diagram id, e.g. `flowchart-v2`. Compared when present. */
      readonly diagramType?: string
      /** Db summary in the normalized form. Compared when present. */
      readonly db?: DbSummary | null
    }
  | { readonly accepted: false }
) & {
  /**
   * Set when the candidate recognizes that the spec may depart from mermaid.js
   * for this input: one of `KNOWN_DIVERGENCES`. A difference from mermaid is
   * then reported as a divergence, not a mismatch.
   */
  readonly knownDivergence?: string
}

/** The implementation under test. */
export type Candidate = (
  text: string,
  config: MermaidConfig | undefined,
  /**
   * The values mermaid derived from the embedded data of `text`, for
   * building Db values that depend on it; `undefined` when mermaid rejected
   * the text.
   */
  embedded: EmbeddedValues | undefined,
) => CandidateOutcome | Promise<CandidateOutcome>

/** Parts of an accepted outcome compared beyond acceptance. */
export type ComparedPart = "diagramType" | "db"

/** Where the results of mermaid and the candidate differ. */
export type DifferenceKind = "acceptance" | ComparedPart

/**
 * How mermaid and the candidate disagree:
 *
 * - a {@link DifferenceKind} the candidate did not declare as a known
 *   divergence;
 * - `missing-*`: the candidate did not return a part that `require` lists;
 * - `unknown-divergence`: the candidate declared an identifier that is not in
 *   `KNOWN_DIVERGENCES`.
 */
export type MismatchKind =
  DifferenceKind | "missing-diagramType" | "missing-db" | "unknown-divergence"

export interface CompareOptions {
  /**
   * Parts the candidate must return for accepted input. A candidate that
   * leaves one out is reported as a `missing-*` mismatch instead of passing
   * silently. Default: none (each part is compared when present).
   */
  readonly require?: readonly ComparedPart[]
}

export interface Mismatch {
  readonly text: string
  readonly config?: MermaidConfig
  readonly kind: MismatchKind
  readonly mermaid: MermaidOutcome
  readonly candidate: CandidateOutcome
}

/**
 * A difference from mermaid that the candidate declared as a known divergence.
 */
export interface Divergence {
  readonly text: string
  readonly config?: MermaidConfig
  /** The identifier the candidate declared. */
  readonly id: string
  readonly kind: DifferenceKind
  readonly mermaid: MermaidOutcome
  readonly candidate: CandidateOutcome
}

interface Comparison {
  readonly mismatch?: Mismatch
  readonly divergence?: Divergence
  /**
   * Set when the candidate declared a known divergence but its result agrees
   * with mermaid. Not an error: grammar may make the results coincide.
   */
  readonly declaredWithoutDifference?: string
  /** Parts actually compared (both sides accepted and provided them). */
  readonly compared: readonly ComparedPart[]
}

/**
 * Runs `text` through mermaid and `candidate` and returns how they disagree,
 * or `undefined` when they agree or differ only by a declared known
 * divergence.
 *
 * Throws {@link MermaidEnvironmentError} when mermaid cannot decide in Node.
 */
export async function compareWithMermaid(
  text: string,
  candidate: Candidate,
  config?: MermaidConfig,
  options: CompareOptions = {},
): Promise<Mismatch | undefined> {
  return (await compare(text, candidate, config, options)).mismatch
}

/**
 * {@link compareWithMermaid}, also telling which parts were compared and
 * whether a known divergence was declared.
 */
async function compare(
  text: string,
  candidate: Candidate,
  config: MermaidConfig | undefined,
  options: CompareOptions,
): Promise<Comparison> {
  const { outcome: mermaid, embedded } = await runMermaidWithEmbeddedData(
    text,
    config ? { config } : {},
  )
  const actual = await candidate(text, config, embedded)
  const { kind, compared } = findDifference(
    mermaid,
    actual,
    options.require ?? [],
  )
  const report = {
    text,
    ...(config ? { config } : {}),
    mermaid,
    candidate: actual,
  }
  const id = actual.knownDivergence
  if (id !== undefined && !KNOWN_DIVERGENCES.includes(id)) {
    return { mismatch: { ...report, kind: "unknown-divergence" }, compared }
  }
  if (kind === undefined) {
    return id === undefined
      ? { compared }
      : { declaredWithoutDifference: id, compared }
  }
  // Only a difference in results can be a divergence. A part left out is a
  // defect of the candidate whatever it declares.
  if (id !== undefined && isDifference(kind)) {
    return { divergence: { ...report, id, kind }, compared }
  }
  return { mismatch: { ...report, kind }, compared }
}

/**
 * Returns whether `kind` is a difference in results, as opposed to a part the
 * candidate left out or an unknown divergence identifier.
 */
function isDifference(kind: MismatchKind): kind is DifferenceKind {
  return kind === "acceptance" || kind === "diagramType" || kind === "db"
}

/**
 * Returns the first way the candidate's outcome differs from mermaid's, or
 * falls short of `required`, and the parts compared on the way.
 */
function findDifference(
  mermaid: MermaidOutcome,
  actual: CandidateOutcome,
  required: readonly ComparedPart[],
): { kind?: MismatchKind; compared: ComparedPart[] } {
  const compared: ComparedPart[] = []
  if (mermaid.accepted !== actual.accepted) {
    return { kind: "acceptance", compared }
  }
  if (!mermaid.accepted || !actual.accepted) return { compared }
  if (actual.diagramType === undefined) {
    if (required.includes("diagramType")) {
      return { kind: "missing-diagramType", compared }
    }
  } else {
    compared.push("diagramType")
    if (actual.diagramType !== mermaid.diagramType) {
      return { kind: "diagramType", compared }
    }
  }
  // A null mermaid Db means no normalizer yet: there is nothing to compare
  // with, so the candidate's Db is neither compared nor required.
  if (mermaid.db === null) return { compared }
  if (actual.db === undefined) {
    return required.includes("db")
      ? { kind: "missing-db", compared }
      : { compared }
  }
  compared.push("db")
  return isDeepStrictEqual(actual.db, mermaid.db)
    ? { compared }
    : { kind: "db", compared }
}

export interface MutationInput {
  /** Label used in reports, e.g. the fixture name. */
  readonly name: string
  readonly text: string
  readonly config?: MermaidConfig
}

export interface MutationMismatch extends Mismatch {
  /** Name of the input the compared text came from. */
  readonly from: string
  /** The edit that produced the text, or `input` for the input itself. */
  readonly description: string
}

export interface MutationDivergence extends Divergence {
  /** Name of the input the compared text came from. */
  readonly from: string
  /** The edit that produced the text, or `input` for the input itself. */
  readonly description: string
}

export interface MutationReport {
  /** Number of texts compared. */
  readonly compared: number
  /**
   * Of those, how many had their diagram id and their Db summary compared. A
   * count below the number of accepted texts means the candidate left the part
   * out (or mermaid has no normalizer for the diagram type).
   */
  readonly comparedParts: { readonly diagramType: number; readonly db: number }
  readonly mismatches: MutationMismatch[]
  /** Differences the candidate declared as known divergences. */
  readonly divergences: MutationDivergence[]
  /**
   * Texts for which the candidate declared a known divergence and still
   * agreed with mermaid, by identifier. Information only.
   */
  readonly declaredWithoutDifference: Readonly<Record<string, number>>
  /** Texts mermaid could not decide in Node; not a verdict on the candidate. */
  readonly skipped: {
    readonly from: string
    readonly description: string
    readonly reason: string
  }[]
}

export interface MutationDiffOptions extends MutateOptions, CompareOptions {
  /** Also compare each input itself, before its mutants. Default false. */
  readonly includeInputs?: boolean
}

/**
 * Produces diagram texts from a seed, e.g. by combining grammar fragments.
 * Must return the same texts for the same arguments.
 */
export type InputGenerator = (seed: number, count: number) => Iterable<string>

/**
 * Names the texts of a generator as inputs: `<prefix>-s<seed>-<index>`.
 */
export function generatedInputs(
  generator: InputGenerator,
  seeds: readonly number[],
  count: number,
  prefix = "generated",
): MutationInput[] {
  return seeds.flatMap((seed) =>
    [...generator(seed, count)].map((text, index) => ({
      name: `${prefix}-s${seed}-${String(index).padStart(4, "0")}`,
      text,
    })),
  )
}

/**
 * Compares every input, unchanged, between mermaid and `candidate`.
 */
export function compareAll(
  inputs: Iterable<MutationInput>,
  candidate: Candidate,
  options: CompareOptions = {},
): Promise<MutationReport> {
  return compareTexts(
    (function* texts() {
      for (const input of inputs)
        yield { input, text: input.text, description: "input" }
    })(),
    candidate,
    options,
  )
}

/**
 * Mutates every input and compares each mutant between mermaid and
 * `candidate`. Inputs are processed in order and mutants in generation order,
 * so the report is deterministic for a given seed.
 */
export function runMutationDiff(
  inputs: Iterable<MutationInput>,
  candidate: Candidate,
  options: MutationDiffOptions = {},
): Promise<MutationReport> {
  return compareTexts(
    (function* texts() {
      for (const input of inputs) {
        if (options.includeInputs) {
          yield { input, text: input.text, description: "input" }
        }
        for (const mutant of mutate(input.text, options)) {
          yield { input, text: mutant.text, description: mutant.description }
        }
      }
    })(),
    candidate,
    options,
  )
}

/**
 * Compares texts one by one, collecting mismatches and the texts mermaid
 * cannot decide in Node.
 */
async function compareTexts(
  texts: Iterable<{
    readonly input: MutationInput
    readonly text: string
    readonly description: string
  }>,
  candidate: Candidate,
  options: CompareOptions,
): Promise<MutationReport> {
  let compared = 0
  const comparedParts = { diagramType: 0, db: 0 }
  const mismatches: MutationMismatch[] = []
  const divergences: MutationDivergence[] = []
  const declaredWithoutDifference: Record<string, number> = {}
  const skipped: MutationReport["skipped"] = []
  for (const { input, text, description } of texts) {
    let comparison: Comparison
    try {
      comparison = await compare(text, candidate, input.config, options)
    } catch (error) {
      if (!(error instanceof MermaidEnvironmentError)) throw error
      skipped.push({ from: input.name, description, reason: error.message })
      continue
    }
    compared++
    for (const part of comparison.compared) comparedParts[part]++
    if (comparison.mismatch) {
      mismatches.push({ ...comparison.mismatch, from: input.name, description })
    }
    if (comparison.divergence) {
      divergences.push({
        ...comparison.divergence,
        from: input.name,
        description,
      })
    }
    const declared = comparison.declaredWithoutDifference
    if (declared !== undefined) {
      declaredWithoutDifference[declared] =
        (declaredWithoutDifference[declared] ?? 0) + 1
    }
  }
  return {
    compared,
    comparedParts,
    mismatches,
    divergences,
    declaredWithoutDifference,
    skipped,
  }
}
