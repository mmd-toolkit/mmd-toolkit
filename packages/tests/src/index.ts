import { existsSync, readdirSync, readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import path from "node:path"
import type {
  DataBlockEffect,
  DbSummary,
  JsonObject,
  JsonValue,
  MermaidConfig,
  MermaidError,
} from "./types.ts"
import type { EmbeddedValues } from "./mermaid.ts"

export type {
  DataBlockEffect,
  DbSummary,
  JsonObject,
  JsonValue,
  MermaidConfig,
  MermaidError,
} from "./types.ts"

export type { EmbeddedValues } from "./mermaid.ts"
export { checkTree } from "./check-tree/index.ts"
export type { CheckedRoot, TreeProblem } from "./check-tree/index.ts"
export { dbFromTree } from "./db-from-tree/index.ts"
export {
  exceedsMaxEdges,
  flowchartEdgeCount,
} from "./db-from-tree/flowchart.ts"
export type {
  ColorAnswer,
  DbTreeRoot,
  DiagramBody,
} from "./db-from-tree/index.ts"
export {
  findBoundaries,
  findInnerPlaces,
  selectByKey,
} from "./boundary-kinds.ts"
export type {
  InnerPlace,
  InnerPosition,
  KindComment,
  KindDirective,
  KindRange,
  KindSource,
  KindToken,
  LinePosition,
  TextBoundary,
} from "./boundary-kinds.ts"

/**
 * Fixture directories: one per diagram type, and `common` for syntax shared
 * by all diagram types (frontmatter, directives, comments, detection).
 */
export type DiagramType =
  "common" | "flowchart" | "sequence" | "class" | "state"

/**
 * Where a fixture input came from.
 */
export type FixtureSource =
  | {
      /** Taken from the mermaid repository. */
      readonly kind: "mermaid"
      /** Git tag the input was taken at, e.g. `mermaid@12.0.0`. */
      readonly ref: string
      /** Path of the file in the mermaid repository. */
      readonly path: string
      /** 1-based line in that file where the input starts, if known. */
      readonly line?: number
      /** Test title path (`describe > it`) for inputs taken from test files. */
      readonly test?: string
    }
  | {
      /** Written for this project, e.g. to back a claim in the spec. */
      readonly kind: "authored"
      /** Why the fixture exists. */
      readonly note: string
    }

/**
 * The values mermaid.js derives from the embedded data of an input (the
 * frontmatter, the directives, the `@{ ... }` data blocks) that an
 * implementation needs to build the Db and does not read from the text. Each
 * field is left out where the input gives no such value. See
 * `docs/embedded-data.md`.
 */
export interface RecordedEmbedded {
  /**
   * What the input changes in mermaid.js's configuration: the values that
   * differ from the defaults (`getDefaultConfig()`) overlaid with the
   * fixture's own `config`. An implementation reads a key from here, then
   * from the fixture's `config`, then from the defaults.
   */
  readonly config?: MermaidConfig
  /** The frontmatter title, as `render()` passes it to the Db. */
  readonly title?: string
  /** What each `@{ ... }` data block did to the Db, in the order applied. */
  readonly dataBlockEffects?: readonly DataBlockEffect[]
}

/**
 * What mermaid.js did with the fixture input.
 */
export type Expectation =
  | {
      /** mermaid.js accepted the input. */
      readonly accepted: true
      /** Diagram id mermaid.js detected, e.g. `flowchart-v2`. */
      readonly diagramType: string
      /**
       * Normalized summary of the diagram Db after parsing, or `null` when the
       * diagram type has no normalizer yet (allowed only where
       * {@link allowsUnsummarizedDb} says so). Adding the normalizer later
       * turns `null` into a summary on regeneration.
       */
      readonly db: DbSummary | null
      /** The values derived from the embedded data; see {@link RecordedEmbedded}. */
      readonly embedded?: RecordedEmbedded
    }
  | {
      /** mermaid.js rejected the input. */
      readonly accepted: false
      readonly error: MermaidError
    }

/**
 * Identifiers of the known divergences: places where the spec deliberately
 * departs from mermaid.js. Each matches a heading of `docs/known-divergences.md`
 * in `@mmd-toolkit/spec`. Add one here when the spec adds it.
 */
export const KNOWN_DIVERGENCES: readonly string[] = [
  // A `%%{ ... }%%` directive is a token boundary. mermaid removes it and joins
  // the text on both sides; the spec does not join them. The results differ
  // both ways: the spec rejects some inputs mermaid accepts, and accepts some
  // mermaid rejects.
  "directive-as-token-boundary",
  // A `;` that the line rule ignores is a token boundary in the same way,
  // inside a name, a number, a keyword, an arrow, or a delimiter. mermaid.js
  // removes the `;` before it reads the line and joins the text on both
  // sides; the spec does not join them and rejects the input.
  "ignored-semicolon-as-token-boundary",
  // Embedded data is opaque to the parser: the frontmatter YAML, the contents
  // of directives, and `@{ ... }` data blocks. It neither parses nor validates
  // them. The spec accepts inputs that mermaid rejects because of that data
  // (invalid YAML, a non-object init, an unknown shape, ...).
  "embedded-data-opaque",
  // HTML tags are found in the text after the frontmatter, not in the
  // frontmatter. mermaid rewrites `="..."` inside tags to `='...'` over the
  // whole source before it removes the frontmatter, so inputs where a tag that
  // starts in the frontmatter changes how a `"` of the diagram is read differ.
  "html-tag-in-frontmatter",
  // In flowchart, `click` is a reserved word: `click` followed by whitespace,
  // where a unit starts, may only begin a click statement. mermaid enters its
  // click context at every such `click` and accepts some inputs that have it
  // elsewhere; the spec rejects them. The difference goes one way only.
  "click-reserved-word",
  // The spec rejects forms that are written but hold nothing, where the tree
  // has no place for them: in flowchart, an empty string, an empty call
  // (`call` with parentheses that hold only whitespace) and an empty
  // description block that does not start a statement; in sequence, such an
  // empty description block; in class, these three and an empty backquoted
  // name and an empty generic type, accepted as a node where the class grammar
  // has a field that may be empty. mermaid's lexer reads no token for them and
  // accepts an input as if they were not there. The difference goes one way
  // only.
  "tokenless-empty-forms",
  // In sequence, a comment starts at its `%%`. mermaid's lexer reads the
  // character right before `%%` together with the comment, so the character
  // is lost, and reads a number only before a space or a line feed, so a
  // number right before `%%` is no number. Acceptance differs both ways, and
  // inputs both accept can differ in the Db.
  "comment-takes-character",
  // In class, mermaid reads a comment that follows a unit on its line together
  // with the line break after it, so the next line joins the line before; in
  // the spec the comment ends at the end of the line. A comment with only
  // whitespace before it on its line takes no line, as in mermaid. Acceptance
  // differs both ways, and inputs both accept can differ in the Db.
  "comment-takes-line-break",
  // In class, the spec rejects a text without the header. mermaid's grammar
  // has a start without one, which it takes only for a text whose header word
  // runs on into other word characters (`classDiagramX`) and that ends, at the
  // end of the text, in a statement with an empty value (`accTitle:`). The
  // difference goes one way only.
  "headerless-empty-ending",
  // In class, the text of a backquoted name or of a generic type may start
  // with any character. mermaid's lexer tries other rules first, so a `"`, a
  // `~` (in a backquoted name), `<<`, `>>` or one of six keywords at the start
  // is read as a unit of its own. Acceptance differs both ways, and inputs
  // both accept can differ in the Db.
  "name-start-reads-unit",
]

/**
 * The part of `expected.json` written by hand when the fixture is added (or
 * later, for `knownDivergence`). The generator keeps it as it is.
 */
export interface FixtureHead {
  readonly source: FixtureSource
  /** Site configuration passed to `mermaid.initialize()`. Omitted if none. */
  readonly config?: MermaidConfig
  /**
   * Set when an implementation of the spec gives a different result than the
   * mermaid.js result recorded here: one of {@link KNOWN_DIVERGENCES}.
   */
  readonly knownDivergence?: string
}

/**
 * Content of `expected.json`: the hand-written head and the generated
 * expectation.
 */
export type ExpectedFile = FixtureHead & Expectation

export interface Fixture {
  /** Diagram type of the fixture (its parent directory). */
  readonly diagram: DiagramType
  /** Directory name of the fixture (unique within a diagram type). */
  readonly name: string
  /** Content of `input.mmd`. */
  readonly input: string
  /** Where the input came from. */
  readonly source: FixtureSource
  /** Site configuration to pass to `mermaid.initialize()`, if any. */
  readonly config?: MermaidConfig
  /**
   * Set when the spec departs from mermaid.js for this input: one of
   * {@link KNOWN_DIVERGENCES}. `expected` still records what mermaid.js does;
   * an implementation of the spec is expected to differ.
   */
  readonly knownDivergence?: string
  /** What mermaid.js did with the input. */
  readonly expected: Expectation
  /**
   * What an implementation of the specification gives for the input, where
   * that is not what mermaid.js did: the result of mermaid.js read without
   * the known divergence that changes how it reads the input (see
   * `docs/expected-results.md`). Only fixtures that carry such a mark have
   * it. Without it, the result to match is `expected`.
   */
  readonly specified?: Expectation
}

const fixturesRoot: string = fileURLToPath(
  new URL("../fixtures/", import.meta.url),
)

/**
 * Returns the absolute path of the fixtures directory.
 */
export function getFixturesRoot(): string {
  return fixturesRoot
}

/** The name of the file that holds the specified reading of a fixture. */
const SPECIFIED_FILE = "specified.json"

/** The name of the file of the default configuration, in the fixtures directory. */
const DEFAULT_CONFIG_FILE = "default-config.json"

/**
 * Returns the configuration mermaid.js has for a text that changes nothing in
 * it and a fixture without a `config`: the defaults that
 * {@link RecordedEmbedded.config} is a difference from.
 */
export function getDefaultConfig(): MermaidConfig {
  return JSON.parse(
    readFileSync(path.join(fixturesRoot, DEFAULT_CONFIG_FILE), "utf8"),
  ) as MermaidConfig
}

/**
 * The values mermaid.js derived from the embedded data of the input of
 * `fixture`, as `resolveEmbeddedData()` gives them, built from what the fixture
 * records: the configuration is the defaults, overlaid with the fixture's own
 * `config` and then with the `embedded.config` of `result` (key by key for an
 * object, an array and any other value replace). `result` is the reading to
 * match, by default `specified`, else `expected`. `undefined` for a rejection.
 *
 * mermaid.js recomputes some keys of the configuration when an input changes
 * `theme` and may drop some of `themeVariables`; the drops are not recorded, so
 * the result can hold a key that mermaid.js's own value lacks. No Db value
 * depends on those keys.
 */
export function embeddedValuesOf(
  fixture: Fixture,
  result: Expectation = fixture.specified ?? fixture.expected,
): EmbeddedValues | undefined {
  if (!result.accepted) return undefined
  const { embedded } = result
  return {
    config: overlay(
      overlay(getDefaultConfig(), fixture.config),
      embedded?.config,
    ) as MermaidConfig,
    title: embedded?.title,
    dataBlockEffects: embedded?.dataBlockEffects ?? [],
  }
}

/** `base` with the values of `over` laid over it; objects are merged. */
function overlay(base: JsonValue, over: JsonValue | undefined): JsonValue {
  if (over === undefined) return base
  if (isObject(base) && isObject(over)) {
    const merged: Record<string, JsonValue> = { ...base }
    for (const [key, value] of Object.entries(over)) {
      const inner = base[key]
      merged[key] = inner === undefined ? value : overlay(inner, value)
    }
    return merged
  }
  return over
}

/**
 * Loads every fixture of the given diagram type, sorted by name.
 *
 * The files are read one at a time, so that loading opens one file at once
 * however many fixtures there are: test files that load the fixtures run in
 * parallel workers, and opening every file of every fixture at once in each of
 * them goes past the system's limit of open files.
 *
 * A diagram type whose directory does not exist yet (one added to
 * `DiagramType` before its first fixture) has no fixtures. No test covers this,
 * because every current `DiagramType` has a directory.
 */
// eslint-disable-next-line @typescript-eslint/require-await -- the signature stays asynchronous for the packages that call it
export async function loadFixtures(diagram: DiagramType): Promise<Fixture[]> {
  const dir = path.join(fixturesRoot, diagram)
  const fixtures = fixtureDirectories(dir).map((name) =>
    readFixture(diagram, name, path.join(dir, name)),
  )
  return fixtures.sort((a, b) =>
    a.name < b.name ? -1 : a.name > b.name ? 1 : 0,
  )
}

/**
 * The names of the fixture directories in `dir`, or none when `dir` does not
 * exist.
 */
function fixtureDirectories(dir: string): string[] {
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
  } catch (error) {
    if ((error as { code?: unknown }).code === "ENOENT") return []
    throw error
  }
}

/**
 * Returns whether accepted fixtures in `diagram` may record `db: null`, i.e.
 * be accepted as a diagram type that has no normalizer yet. Only `common` may:
 * its fixtures are about syntax shared by all diagram types (for example,
 * detection) and may use any diagram type as a carrier. A diagram type's own
 * directory always needs its normalizer.
 */
export function allowsUnsummarizedDb(diagram: DiagramType): boolean {
  return diagram === "common"
}

/**
 * Reads one fixture directory.
 */
function readFixture(diagram: DiagramType, name: string, dir: string): Fixture {
  const input = readFileSync(path.join(dir, "input.mmd"), "utf8")
  const expectedJson = readFileSync(path.join(dir, "expected.json"), "utf8")
  const file = parseExpectedFile(expectedJson, `${diagram}/${name}`)
  if (file.accepted && file.db === null && !allowsUnsummarizedDb(diagram)) {
    throw new Error(
      `${diagram}/${name}/expected.json: \`db\` is null, which only common/ allows`,
    )
  }
  const { source, config, knownDivergence, ...expected } = file
  const specifiedFile = path.join(dir, SPECIFIED_FILE)
  const specified = existsSync(specifiedFile)
    ? parseSpecifiedFile(
        readFileSync(specifiedFile, "utf8"),
        `${diagram}/${name}`,
      )
    : undefined
  return {
    diagram,
    name,
    input,
    source,
    ...(config ? { config } : {}),
    ...(knownDivergence === undefined ? {} : { knownDivergence }),
    expected,
    ...(specified === undefined ? {} : { specified }),
  }
}

/**
 * Parses and checks the shape of an `expected.json` file.
 */
export function parseExpectedFile(json: string, label: string): ExpectedFile {
  const value = JSON.parse(json) as unknown

  /** Throws with the file named in the message. */
  function fail(reason: string): never {
    throw new Error(`${label}/expected.json: ${reason}`)
  }

  if (!isObject(value)) return fail("not an object")
  const problem = fixtureSourceProblem(value.source)
  if (problem) fail(problem)
  if (value.config !== undefined && !isObject(value.config)) {
    fail("`config` must be an object")
  }
  if (
    value.knownDivergence !== undefined &&
    !KNOWN_DIVERGENCES.includes(value.knownDivergence as string)
  ) {
    fail(`\`knownDivergence\` must be one of ${KNOWN_DIVERGENCES.join(", ")}`)
  }
  const problemWithResult = expectationProblem(value)
  if (problemWithResult) fail(problemWithResult)
  return value as unknown as ExpectedFile
}

/**
 * Parses and checks the shape of a `specified.json` file: the result part of
 * an `expected.json`, without the hand-written head.
 */
export function parseSpecifiedFile(json: string, label: string): Expectation {
  const value = JSON.parse(json) as unknown
  const problem = isObject(value) ? expectationProblem(value) : "not an object"
  if (problem) throw new Error(`${label}/${SPECIFIED_FILE}: ${problem}`)
  return value as Expectation
}

/**
 * Returns what is wrong with the result part of an `expected.json` or a
 * `specified.json`, if anything.
 */
function expectationProblem(
  value: Record<string, unknown>,
): string | undefined {
  if (value.accepted === true) {
    if (typeof value.diagramType !== "string") return "missing `diagramType`"
    if (value.db !== null && !isObject(value.db)) {
      return "`db` must be an object or null"
    }
    return value.embedded === undefined
      ? undefined
      : recordedEmbeddedProblem(value.embedded)
  }
  if (value.accepted === false) {
    const error = value.error
    if (
      !isObject(error) ||
      typeof error.name !== "string" ||
      typeof error.message !== "string"
    ) {
      return "`error` must have `name` and `message`"
    }
    return undefined
  }
  return "`accepted` must be a boolean"
}

/** Returns what is wrong with an `embedded` field, if anything. */
function recordedEmbeddedProblem(embedded: unknown): string | undefined {
  if (!isObject(embedded)) return "`embedded` must be an object"
  if (embedded.config !== undefined && !isObject(embedded.config)) {
    return "`embedded.config` must be an object"
  }
  if (embedded.title !== undefined && typeof embedded.title !== "string") {
    return "`embedded.title` must be a string"
  }
  const effects = embedded.dataBlockEffects
  if (
    effects !== undefined &&
    !(
      Array.isArray(effects) &&
      effects.every(
        (effect) =>
          isObject(effect) &&
          typeof effect.id === "string" &&
          isObject(effect.set),
      )
    )
  ) {
    return "`embedded.dataBlockEffects` must be a list of { id, set }"
  }
  if (Object.keys(embedded).length === 0) {
    return "`embedded` is left out when it holds nothing"
  }
  return undefined
}

/**
 * Returns what is wrong with a fixture's `source`, if anything.
 */
export function fixtureSourceProblem(source: unknown): string | undefined {
  if (!isObject(source)) return "`source` must be an object"
  if (source.kind === "mermaid") {
    if (typeof source.ref !== "string" || typeof source.path !== "string") {
      return "`source` of kind mermaid needs `ref` and `path`"
    }
    if (
      source.line !== undefined &&
      !(Number.isInteger(source.line) && (source.line as number) >= 1)
    ) {
      return "`source.line` must be a positive integer"
    }
    if (source.test !== undefined && typeof source.test !== "string") {
      return "`source.test` must be a string"
    }
    return undefined
  }
  if (source.kind === "authored") {
    return typeof source.note === "string"
      ? undefined
      : "`source` of kind authored needs `note`"
  }
  return "`source.kind` must be `mermaid` or `authored`"
}

/**
 * Serializes `expected.json` in its canonical form: fields in a fixed order,
 * two-space indentation, trailing newline.
 */
export function serializeExpectedFile(file: ExpectedFile): string {
  const source: JsonObject =
    file.source.kind === "mermaid"
      ? {
          kind: "mermaid",
          ref: file.source.ref,
          path: file.source.path,
          ...(file.source.line === undefined ? {} : { line: file.source.line }),
          ...(file.source.test === undefined ? {} : { test: file.source.test }),
        }
      : { kind: "authored", note: file.source.note }
  const head: JsonObject = {
    source,
    ...(file.config ? { config: file.config } : {}),
    ...(file.knownDivergence === undefined
      ? {}
      : { knownDivergence: file.knownDivergence }),
  }
  const ordered: JsonObject = { ...head, ...resultFields(file) }
  return `${JSON.stringify(ordered, null, 2)}\n`
}

/**
 * Serializes `specified.json` in its canonical form, as
 * {@link serializeExpectedFile} does for `expected.json`.
 */
export function serializeSpecifiedFile(result: Expectation): string {
  return `${JSON.stringify(resultFields(result), null, 2)}\n`
}

/** The fields of the result part, in their canonical order. */
function resultFields(result: Expectation): JsonObject {
  if (!result.accepted) {
    return {
      accepted: false,
      error: { name: result.error.name, message: result.error.message },
    }
  }
  const embedded = result.embedded
  return {
    accepted: true,
    diagramType: result.diagramType,
    db: result.db,
    ...(embedded === undefined
      ? {}
      : {
          embedded: {
            ...(embedded.config === undefined
              ? {}
              : { config: embedded.config }),
            ...(embedded.title === undefined ? {} : { title: embedded.title }),
            ...(embedded.dataBlockEffects === undefined
              ? {}
              : {
                  dataBlockEffects: embedded.dataBlockEffects.map(
                    ({ id, set }) => ({ id, set }),
                  ),
                }),
          },
        }),
  }
}

/**
 * Returns whether `value` is a non-array object.
 */
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}
