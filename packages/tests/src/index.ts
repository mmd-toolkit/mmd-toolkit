import { readdirSync, readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import path from "node:path"
import type {
  DbSummary,
  JsonObject,
  MermaidConfig,
  MermaidError,
} from "./types.ts"

export type {
  DbSummary,
  JsonObject,
  JsonValue,
  MermaidConfig,
  MermaidError,
} from "./types.ts"

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
  return {
    diagram,
    name,
    input,
    source,
    ...(config ? { config } : {}),
    ...(knownDivergence === undefined ? {} : { knownDivergence }),
    expected,
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
  if (value.accepted === true) {
    if (typeof value.diagramType !== "string") fail("missing `diagramType`")
    if (value.db !== null && !isObject(value.db)) {
      fail("`db` must be an object or null")
    }
  } else if (value.accepted === false) {
    const error = value.error
    if (
      !isObject(error) ||
      typeof error.name !== "string" ||
      typeof error.message !== "string"
    ) {
      fail("`error` must have `name` and `message`")
    }
  } else {
    fail("`accepted` must be a boolean")
  }
  return value as unknown as ExpectedFile
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
  const ordered: JsonObject = file.accepted
    ? {
        ...head,
        accepted: true,
        diagramType: file.diagramType,
        db: file.db,
      }
    : {
        ...head,
        accepted: false,
        error: { name: file.error.name, message: file.error.message },
      }
  return `${JSON.stringify(ordered, null, 2)}\n`
}

/**
 * Returns whether `value` is a non-array object.
 */
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}
