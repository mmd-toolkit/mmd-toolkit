/**
 * Runs text through the pinned mermaid.js in Node (no DOM) and reports what it
 * did: accepted or rejected, and for accepted input a normalized summary of the
 * diagram Db.
 *
 * How the result is obtained, and why:
 *
 * - Acceptance comes from `mermaid.parse()`, the public validation entry point.
 *   It also applies the configuration from frontmatter and `%%{init}%%`
 *   directives, which stays in effect for the next step.
 * - The Db comes from `mermaidAPI.getDiagramFromText(text, { title })`, which
 *   parses again and hands back the diagram with its Db. `render()` passes the
 *   frontmatter title the same way; `getDiagramFromText()` alone does not, so
 *   the title is extracted here exactly as mermaid does it.
 * - Without a DOM, DOMPurify has no `sanitize` or `addHook`, and mermaid calls
 *   them while parsing: Db classes pass label text through
 *   `common.sanitizeText()` and store the result (FlowDB also checks the
 *   sanitized text for surrounding quotes). The DOMPurify instance mermaid
 *   imports is patched so that sanitizing is the identity. The Db is therefore
 *   the Db mermaid would build if DOMPurify changed nothing. It differs from a
 *   browser's only for text DOMPurify would alter (HTML markup, `&`, `<`,
 *   `>`); see docs/expected-results.md.
 * - mermaid keeps global state, so calls are serialized.
 */
import { existsSync, readFileSync } from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"
import { pathToFileURL } from "node:url"
import yaml from "js-yaml"
import mermaid from "mermaid"
import type {
  DetectorProbe,
  DetectorRemoval,
  DivergenceRemoval,
  JisonLexer,
  Rewrite,
} from "./divergence-removals.ts"
import {
  allRemovals,
  findDetectorRewrite,
  findRewrites,
  isDetectorRemoval,
  overlapOf,
  withRewrites,
} from "./divergence-removals.ts"
import { dataBlockEffectsOf } from "./normalizers/data-blocks.ts"
import { getDbPatches, normalizeDb } from "./normalizers/index.ts"
import { toJsonObject } from "./normalizers/json.ts"
import { errorName, isEnvironmentFailure } from "./rejections.ts"
import type { RunMermaidOptions } from "./run-mermaid-options.ts"
import { checkRunMermaidOptions } from "./run-mermaid-options.ts"
import {
  defaultMermaidRunStore,
  isMermaidRunStoreOn,
} from "./mermaid-run-store.ts"
import type {
  DataBlockEffect,
  DbSummary,
  MermaidConfig,
  MermaidError,
} from "./types.ts"

export type {
  DataBlockEffect,
  DbSummary,
  MermaidConfig,
  MermaidError,
} from "./types.ts"

export type { DivergenceRemoval } from "./divergence-removals.ts"

export type { RunMermaidOptions } from "./run-mermaid-options.ts"

export type MermaidOutcome =
  | {
      readonly accepted: true
      /** Diagram id mermaid detected, e.g. `flowchart-v2`. */
      readonly diagramType: string
      /**
       * Normalized Db summary, or `null` when no normalizer is registered for
       * `diagramType` yet.
       */
      readonly db: DbSummary | null
    }
  | {
      readonly accepted: false
      readonly error: MermaidError
    }

/**
 * Thrown when mermaid fails because Node lacks something a browser has, as
 * opposed to rejecting the input. Such a failure says nothing about the input,
 * so it must never be recorded as a rejection.
 */
export class MermaidEnvironmentError extends Error {
  public constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = "MermaidEnvironmentError"
  }
}

const require = createRequire(import.meta.url)
const mermaidPackageJsonPath: string = require.resolve("mermaid/package.json")

/** Version of the pinned mermaid.js. */
export const mermaidVersion: string = (
  JSON.parse(readFileSync(mermaidPackageJsonPath, "utf8")) as {
    version: string
  }
).version

let ready: Promise<void> | undefined

/** What to replace for each divergence removal, found at setup. */
const removalRewrites: Map<DivergenceRemoval, Rewrite> = new Map()
let queue: Promise<unknown> = Promise.resolve()

/**
 * Values mermaid derives from the embedded data of a text: the frontmatter
 * YAML, the contents of directives, and `@{ ... }` data blocks. The
 * specification treats embedded data as opaque, so an implementation does not
 * read it, but some Db values depend on it; the implementation's tests take
 * these values from mermaid.
 */
export interface EmbeddedValues {
  /**
   * mermaid's whole configuration for the text: its defaults, the site
   * configuration, the frontmatter `config` and the directives, merged by
   * mermaid itself. Per-diagram appearance defaults (such as `look`) are not
   * included; they do not affect Db summaries.
   */
  readonly config: MermaidConfig
  /** The frontmatter title, as `render()` passes it to the Db. */
  readonly title: string | undefined
  /**
   * The effect of each `@{ ... }` data block on the Db, in the order mermaid
   * applied the blocks, including blocks that changed nothing. That order is
   * expected to be source order; an implementation's tests check it against
   * the blocks they find. Empty when the text has none, and for diagram types
   * whose Db patch does not record them yet.
   */
  readonly dataBlockEffects: readonly DataBlockEffect[]
}

/**
 * What mermaid did with a text, and the values it derived from the text's
 * embedded data (`undefined` when it rejected the text).
 */
export interface MermaidRun {
  readonly outcome: MermaidOutcome
  readonly embedded: EmbeddedValues | undefined
}

/**
 * Runs `task` once mermaid is set up and every earlier call has finished.
 */
function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const result = queue.then(async () => {
    ready ??= setup()
    await ready
    return task()
  })
  queue = result.catch(() => undefined)
  return result
}

/**
 * Runs `text` through mermaid.js and returns what it did.
 *
 * Throws {@link MermaidEnvironmentError} when mermaid needs a browser feature
 * Node does not have.
 */
export async function runMermaid(
  text: string,
  options: RunMermaidOptions = {},
): Promise<MermaidOutcome> {
  return (await runMermaidWithEmbeddedData(text, options)).outcome
}

/**
 * {@link runMermaid}, also returning the values mermaid derived from the
 * text's embedded data, from the same run.
 *
 * A result is taken from the store of earlier results when it holds one for
 * the same text, options and code, and is stored after a run otherwise (see
 * `mermaid-run-store.ts`). Errors are not stored.
 */
export async function runMermaidWithEmbeddedData(
  text: string,
  options: RunMermaidOptions = {},
): Promise<MermaidRun> {
  checkRunMermaidOptions(options)
  const store = isMermaidRunStoreOn()
    ? defaultMermaidRunStore(mermaidVersion)
    : undefined
  const stored = store?.read(text, options)
  if (stored !== undefined) return stored
  const run = await enqueue(() => runExclusive(text, options))
  store?.write(text, options, run)
  return run
}

/**
 * Returns the values mermaid derives from the embedded data of `text`, or
 * `undefined` when mermaid rejects it (there is then no mermaid Db to compare
 * with).
 */
export async function resolveEmbeddedData(
  text: string,
  options: RunMermaidOptions = {},
): Promise<EmbeddedValues | undefined> {
  return (await runMermaidWithEmbeddedData(text, options)).embedded
}

/**
 * Returns the diagram id mermaid's detectors give `text` (`detectType()`), or
 * `undefined` when none matches. Only detection runs, not the diagram's
 * parser, so this also names the diagram type of text mermaid rejects. With
 * `withoutDivergences`, the detectors are those of mermaid.js read without
 * them.
 */
export function detectDiagramType(
  text: string,
  options: RunMermaidOptions = {},
): Promise<string | undefined> {
  return enqueue(async () => {
    checkRunMermaidOptions(options)
    initialize(options)
    return withRemovals(options, () => detectedId(text))
  })
}

/**
 * The diagram id mermaid's detectors give `text` under the configuration as it
 * is, or `undefined` when none matches.
 */
function detectedId(text: string): string | undefined {
  try {
    return mermaid.detectType(text, mermaid.mermaidAPI.getConfig())
  } catch (error) {
    if (error instanceof Error && errorName(error) === "UnknownDiagramError") {
      return undefined
    }
    throw error
  }
}

/**
 * Replaces mermaid's site configuration. Logging is kept at `fatal` whatever
 * the configuration says: it does not affect parsing, and mermaid logs to the
 * console.
 *
 * mermaid's configuration first goes back to its defaults, which also empties
 * the list of directives the previous text applied. `mermaid.parse()` empties
 * that list only once it starts; `initialize()` before it recomputes the
 * configuration with the list as the previous text left it. If a directive of
 * that text made the computation throw (for example `"theme": "base"` with a
 * color mermaid cannot read), the directive stays in the list, and without
 * this reset every later call would throw the same error.
 */
function initialize(options: RunMermaidOptions): void {
  mermaid.mermaidAPI.globalReset()
  mermaid.initialize({
    ...options.config,
    startOnLoad: false,
    logLevel: "fatal",
  })
}

/**
 * Runs one input; the caller holds the queue.
 */
async function runExclusive(
  text: string,
  options: RunMermaidOptions,
): Promise<MermaidRun> {
  return withRemovals(options, () => runAsIs(text, options))
}

/**
 * Runs `call` with mermaid.js read without the divergences of
 * `options.withoutDivergences`, each counted once, and as it is for none.
 * Throws when two of them cannot be removed together, and when the read
 * position of a lexer could not be told during the call.
 */
async function withRemovals<T>(
  options: RunMermaidOptions,
  call: () => T | Promise<T>,
): Promise<T> {
  const names = [...new Set(options.withoutDivergences ?? [])]
  if (names.length === 0) return call()
  const rewrites = names.map((name) => {
    const rewrite = removalRewrites.get(name)
    if (!rewrite) {
      throw new MermaidEnvironmentError(
        `nothing to replace was found for ${name}`,
      )
    }
    return [name, rewrite] as const
  })
  const overlap = overlapOf(rewrites)
  if (overlap !== undefined) throw new Error(overlap)
  const { result, problem } = await withRewrites(rewrites, async () => call())
  if (problem !== undefined) throw new MermaidEnvironmentError(problem)
  return result
}

/**
 * Runs one input with mermaid.js as it is at the moment.
 */
async function runAsIs(
  text: string,
  options: RunMermaidOptions,
): Promise<MermaidRun> {
  initialize(options)
  try {
    await mermaid.parse(text)
  } catch (error) {
    return { outcome: rejected(error), embedded: undefined }
  }
  // Read now: building the diagram below may change the configuration (the
  // flowchart definition's `init` calls `setConfig`).
  const config = toJsonObject(mermaid.mermaidAPI.getConfig())
  const diagram = await diagramFromText(text)
  return {
    outcome: {
      accepted: true,
      diagramType: diagram.type,
      db: normalizeDb(diagram.type, diagram.db),
    },
    embedded: {
      config,
      title: extractFrontmatterTitle(text),
      dataBlockEffects: dataBlockEffectsOf(diagram.db),
    },
  }
}

/**
 * Returns mermaid's diagram and Db for accepted text, with the frontmatter
 * title passed the way `render()` passes it.
 */
async function diagramFromText(
  text: string,
): Promise<Awaited<ReturnType<typeof mermaid.mermaidAPI.getDiagramFromText>>> {
  try {
    return await mermaid.mermaidAPI.getDiagramFromText(text, {
      title: extractFrontmatterTitle(text),
    })
  } catch (error) {
    throw new MermaidEnvironmentError(
      "mermaid.parse() accepted the input but getDiagramFromText() failed on it",
      { cause: error },
    )
  }
}

/**
 * Parses a sample text, which must be accepted and detected as
 * `diagramType`, to reach that diagram type's parser and Db before any input.
 */
async function diagramOfSample(
  sampleText: string,
  diagramType: string,
): Promise<Awaited<ReturnType<typeof mermaid.mermaidAPI.getDiagramFromText>>> {
  initialize({})
  let diagram: Awaited<ReturnType<typeof mermaid.mermaidAPI.getDiagramFromText>>
  try {
    diagram = await mermaid.mermaidAPI.getDiagramFromText(sampleText)
  } catch (error) {
    throw new MermaidEnvironmentError(
      `mermaid rejects the sample text of ${diagramType}: ${JSON.stringify(sampleText)}`,
      { cause: error },
    )
  }
  if (diagram.type !== diagramType) {
    throw new MermaidEnvironmentError(
      `the sample text of ${diagramType} is detected as ${diagram.type}`,
    )
  }
  return diagram
}

/**
 * Applies every Db patch (see `getDbPatches`) to its Db class, before any
 * input is parsed: a patch can supply a browser function the Db calls while
 * parsing, so an input parsed by an unpatched Db could fail. Ids that share a
 * Db class are patched once.
 */
async function patchDbClasses(): Promise<void> {
  const patched = new Set<object>()
  for (const [diagramType, { sampleText, patch }] of getDbPatches()) {
    const diagram = await diagramOfSample(sampleText, diagramType)
    const prototype: unknown = Object.getPrototypeOf(diagram.db)
    if (typeof prototype !== "object" || prototype === null) {
      throw new MermaidEnvironmentError(
        `the ${diagramType} Db has no prototype`,
      )
    }
    if (patched.has(prototype)) continue
    patch(prototype)
    patched.add(prototype)
  }
}

/**
 * Finds what every divergence removal replaces (see
 * `src/divergence-removals.ts`): the lexer rules, or the detector. It stops
 * when a lexer rule is missing, and when the replacement of a detector does not
 * detect what it is meant to: mermaid.js then changed, and running without the
 * divergence would silently run it as it is.
 */
async function findRemovalRewrites(): Promise<void> {
  for (const [name, removal] of allRemovals()) {
    const diagram = await diagramOfSample(
      removal.sampleText,
      removal.diagramType,
    )
    if (isDetectorRemoval(removal)) {
      const rewrite = findDetectorRewrite(removal)
      await checkDetectorRewrite(name, removal, rewrite)
      removalRewrites.set(name, rewrite)
      continue
    }
    const { lexer } = diagram.parser as {
      lexer?: { rules?: unknown; conditions?: unknown; setInput?: unknown }
    }
    if (
      !Array.isArray(lexer?.rules) ||
      typeof lexer.conditions !== "object" ||
      lexer.conditions === null ||
      typeof lexer.setInput !== "function"
    ) {
      throw new MermaidEnvironmentError(
        `the ${removal.diagramType} parser has no jison lexer`,
      )
    }
    const rewrites = findRewrites(lexer as JisonLexer, removal)
    if (typeof rewrites === "string") {
      throw new MermaidEnvironmentError(`${name}: ${rewrites}`)
    }
    removalRewrites.set(name, rewrites)
  }
}

/**
 * Makes the rewrite of a detector removal once, and undoes it, to check that it
 * does what the removal means: for every probe of the removal, the detectors
 * give the id of `asIs` before the replacement, the id of `removed` during it,
 * and the id of `asIs` again after it, and the sample text still parses.
 */
async function checkDetectorRewrite(
  name: DivergenceRemoval,
  removal: DetectorRemoval,
  rewrite: Rewrite,
): Promise<void> {
  initialize({})
  checkProbes(name, removal, "before the replacement", (probe) => probe.asIs)
  try {
    await withRewrites([[name, rewrite]], () => {
      checkProbes(
        name,
        removal,
        "during the replacement",
        (probe) => probe.removed,
      )
      return Promise.resolve()
    })
  } catch (error) {
    if (error instanceof MermaidEnvironmentError) throw error
    throw new MermaidEnvironmentError(
      `${name}: the detector of ${removal.diagramType} cannot be replaced`,
      { cause: error },
    )
  }
  checkProbes(name, removal, "after the replacement", (probe) => probe.asIs)
  await diagramOfSample(removal.sampleText, removal.diagramType)
}

/**
 * Throws unless the detectors give each probe of `removal` the id that
 * `expected` names for it, at `moment` of the check.
 */
function checkProbes(
  name: DivergenceRemoval,
  removal: DetectorRemoval,
  moment: string,
  expected: (probe: DetectorProbe) => string | undefined,
): void {
  for (const probe of removal.probes) {
    const detected = detectedId(probe.text)
    if (detected !== expected(probe)) {
      throw new MermaidEnvironmentError(
        `${name}: ${moment}, ${JSON.stringify(probe.text)} is detected as ${String(detected)}, not ${String(expected(probe))}`,
      )
    }
  }
}

/**
 * Turns an error from `mermaid.parse()` into a rejection, or throws when it
 * signals a missing browser feature (see `src/rejections.ts`).
 */
function rejected(error: unknown): MermaidOutcome {
  if (isEnvironmentFailure(error)) {
    const { name, message } = error as Error
    throw new MermaidEnvironmentError(
      `mermaid threw ${name}: ${message}, which looks like a browser feature missing from Node. ` +
        "If this is in fact how mermaid rejects the input, narrow ENVIRONMENT_SIGNATURES in src/rejections.ts.",
      { cause: error },
    )
  }
  if (error instanceof Error) {
    return {
      accepted: false,
      error: { name: errorName(error), message: error.message },
    }
  }
  return { accepted: false, error: { name: "", message: String(error) } }
}

/**
 * Patches DOMPurify, then proves the patch works by parsing a labelled flowchart.
 */
async function setup(): Promise<void> {
  await neutralizeDomPurify()
  await patchDbClasses()
  await findRemovalRewrites()
  const { outcome: probe } = await runExclusive(
    "flowchart LR\n  A[probe]\n",
    {},
  )
  if (!probe.accepted) {
    throw new MermaidEnvironmentError(
      `mermaid cannot parse a trivial flowchart in this environment: ${probe.error.message}`,
    )
  }
}

/**
 * Returns the path of the `package.json` of the DOMPurify that mermaid
 * resolves. DOMPurify does not export `./package.json`, so its CommonJS entry
 * is resolved from mermaid's package and the package root found above it.
 */
function findDomPurifyPackageJson(): string {
  const entry = createRequire(mermaidPackageJsonPath).resolve("dompurify")
  for (let dir = path.dirname(entry); ; dir = path.dirname(dir)) {
    const candidate = path.join(dir, "package.json")
    if (existsSync(candidate)) {
      const { name } = JSON.parse(readFileSync(candidate, "utf8")) as {
        name?: string
      }
      if (name === "dompurify") return candidate
    }
    if (path.dirname(dir) === dir) {
      throw new MermaidEnvironmentError("cannot resolve DOMPurify from mermaid")
    }
  }
}

/**
 * Makes the DOMPurify instance that mermaid imports a no-op sanitizer.
 *
 * The instance is loaded from the same file mermaid resolves, so the patch
 * reaches mermaid's copy. {@link setup} verifies that it did.
 */
async function neutralizeDomPurify(): Promise<void> {
  const pkgPath = findDomPurifyPackageJson()
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as {
    exports?: { ".": { import: { default: string } } }
  }
  const entry = pkg.exports?.["."].import.default
  if (!entry) {
    throw new MermaidEnvironmentError(
      `cannot find the ESM entry of DOMPurify in ${pkgPath}`,
    )
  }
  const mod = (await import(
    pathToFileURL(path.join(path.dirname(pkgPath), entry)).href
  )) as { default: Record<string, unknown> }
  const purify = mod.default

  /** Replaces the hook and configuration functions. */
  function noop(): void {
    // Hooks and configuration have nothing to act on.
  }

  purify.sanitize = (dirty: unknown): string => String(dirty)
  for (const name of [
    "addHook",
    "removeHook",
    "removeHooks",
    "removeAllHooks",
    "setConfig",
    "clearConfig",
  ]) {
    purify[name] = noop
  }
}

// The two functions below mirror `cleanupText` in mermaid's `preprocess.ts` and
// `extractFrontMatter` in `diagram-api/frontmatter.ts` (mermaid@12.0.0). mermaid
// does not export them.
//
// Their regular expressions are mermaid's, with the `u` flag added. The flag
// does not change what they match: they use no case-insensitive matching, and
// `.` and the negated classes cover a surrogate pair whole whether they read
// it as one code point or as two code units.

// Copied from mermaid; lint suggestions would change what it matches.
/* eslint-disable regexp/no-super-linear-backtracking, regexp/optimal-quantifier-concatenation -- must stay identical to mermaid's frontMatterRegex */
const frontmatterRegex =
  /^([^\S\n\r]*)-{3}\s*[\n\r](.*?)[\n\r]\1-{3}\s*[\n\r]+/su
/* eslint-enable regexp/no-super-linear-backtracking, regexp/optimal-quantifier-concatenation -- only frontmatterRegex is exempt */

/**
 * Mirrors `cleanupText` in mermaid's `preprocess.ts`.
 */
function cleanupText(code: string): string {
  return code.replace(/\r\n?/gu, "\n").replace(
    // eslint-disable-next-line regexp/no-super-linear-backtracking -- must stay identical to mermaid's cleanupText
    /<(\w+)([^>]*)>/gu,
    (_match, tag: string, attributes: string) =>
      `<${tag}${attributes.replace(/[=]"([^"]*)"/gu, "='$1'")}>`,
  )
}

/**
 * Returns the frontmatter `title`, as mermaid's `render()` passes it to the Db.
 */
export function extractFrontmatterTitle(text: string): string | undefined {
  const matches = frontmatterRegex.exec(cleanupText(text))
  if (!matches) return undefined
  const indent = matches[1]
  const body = indent
    ? matches[2]
        .split("\n")
        .map((line) =>
          line.startsWith(indent) ? line.slice(indent.length) : line,
        )
        .join("\n")
    : matches[2]
  const parsed: unknown = yaml.load(body, { schema: yaml.JSON_SCHEMA }) ?? {}
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return undefined
  }
  const title = (parsed as { title?: unknown }).title
  return title ? String(title) : undefined
}
