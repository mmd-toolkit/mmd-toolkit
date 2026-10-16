/**
 * Reads and writes fixture directories, and generates `expected.json`.
 */
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs"
import path from "node:path"
import { isDeepStrictEqual } from "node:util"
import {
  allowsUnsummarizedDb,
  getFixturesRoot,
  parseExpectedFile,
  parseSpecifiedFile,
  serializeExpectedFile,
  serializeSpecifiedFile,
} from "../../packages/tests/src/index.ts"
import type {
  DiagramType,
  Expectation,
  ExpectedFile,
  FixtureHead,
  MermaidConfig,
} from "../../packages/tests/src/index.ts"
import { runMermaidWithEmbeddedData } from "../../packages/tests/src/mermaid.ts"
import type { MermaidRun } from "../../packages/tests/src/mermaid.ts"
import { recordEmbedded } from "../../packages/tests/src/recorded-embedded.ts"
import { belongsIn } from "./diagrams.ts"
import { specifiedRunOf } from "./specified-reading.ts"

export interface StoredFixture {
  readonly name: string
  readonly dir: string
  readonly input: string
  readonly file: ExpectedFile
  /** The content of `specified.json`, if the fixture has the file. */
  readonly specified: Expectation | undefined
}

/** The name of the file of the specified reading of a fixture. */
export const SPECIFIED_FILE = "specified.json"

/**
 * Returns the fixture directory of a diagram type.
 */
export function diagramDir(diagram: DiagramType): string {
  return path.join(getFixturesRoot(), diagram)
}

/**
 * Lists the fixtures of a diagram type, sorted by name.
 */
export function readFixtures(diagram: DiagramType): StoredFixture[] {
  const root = diagramDir(diagram)
  if (!existsSync(root)) return []
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
    .map((name) => {
      const dir = path.join(root, name)
      const specifiedFile = path.join(dir, SPECIFIED_FILE)
      return {
        name,
        dir,
        input: readFileSync(path.join(dir, "input.mmd"), "utf8"),
        file: parseExpectedFile(
          readFileSync(path.join(dir, "expected.json"), "utf8"),
          `${diagram}/${name}`,
        ),
        specified: existsSync(specifiedFile)
          ? parseSpecifiedFile(
              readFileSync(specifiedFile, "utf8"),
              `${diagram}/${name}`,
            )
          : undefined,
      }
    })
}

/**
 * Returns the hand-written part of an `expected.json`.
 */
export function headOf(file: ExpectedFile): FixtureHead {
  return {
    source: file.source,
    ...(file.config ? { config: file.config } : {}),
    ...(file.knownDivergence === undefined
      ? {}
      : { knownDivergence: file.knownDivergence }),
  }
}

/** The text read to find the configuration that an input changes nothing in. */
const BASELINE_TEXT = "flowchart LR\nA\n"

const baselines: Map<string, Promise<MermaidConfig>> = new Map()

/**
 * The configuration mermaid.js has for a text that changes nothing in it,
 * read with the site configuration `config`: what the configuration an input
 * records (`embedded.config`) is a difference from.
 */
export function baselineConfigOf(
  config: MermaidConfig | undefined,
): Promise<MermaidConfig> {
  const key = JSON.stringify(canonicalJson(config ?? {}))
  let baseline = baselines.get(key)
  if (baseline === undefined) {
    baseline = runMermaidWithEmbeddedData(
      BASELINE_TEXT,
      config ? { config } : {},
    ).then(({ embedded }) => {
      if (embedded === undefined) {
        throw new Error("mermaid.js rejected the text of the baseline")
      }
      return embedded.config
    })
    baselines.set(key, baseline)
  }
  return baseline
}

/**
 * Builds the result part of a fixture file from a run of mermaid.js.
 *
 * Throws when an accepted input is detected as a diagram type that does not
 * belong in `diagram`, or when that type has no normalizer and `diagram` is
 * not one where `db: null` is allowed (see `allowsUnsummarizedDb`).
 */
async function expectationOf(
  diagram: DiagramType,
  run: MermaidRun,
  config: MermaidConfig | undefined,
): Promise<Expectation> {
  const { outcome } = run
  if (!outcome.accepted) return { accepted: false, error: outcome.error }
  if (!belongsIn(diagram, outcome.diagramType)) {
    throw new Error(
      `mermaid detects this input as ${outcome.diagramType}, which does not belong in ${diagram}/`,
    )
  }
  if (!outcome.db && !allowsUnsummarizedDb(diagram)) {
    throw new Error(`no Db normalizer is registered for ${outcome.diagramType}`)
  }
  const embedded =
    run.embedded === undefined
      ? undefined
      : recordEmbedded(run.embedded, await baselineConfigOf(config))
  return {
    accepted: true,
    diagramType: outcome.diagramType,
    db: outcome.db,
    ...(embedded === undefined ? {} : { embedded }),
  }
}

/**
 * Runs `input` through mermaid and builds the content of `expected.json`,
 * keeping `head` as it is.
 */
export async function generateExpected(
  diagram: DiagramType,
  input: string,
  head: FixtureHead,
): Promise<ExpectedFile> {
  const { config } = head
  const run = await runMermaidWithEmbeddedData(input, config ? { config } : {})
  return { ...head, ...(await expectationOf(diagram, run, config)) }
}

/**
 * Builds the content of `specified.json` for an input whose `expected.json`
 * holds `expected`: the reading of the specification, where the mark of the
 * fixture makes it differ from what mermaid.js did; `undefined` otherwise.
 */
export async function generateSpecified(
  diagram: DiagramType,
  input: string,
  head: FixtureHead,
  expected: Expectation,
): Promise<Expectation | undefined> {
  const run = await specifiedRunOf(input, head.knownDivergence, head.config)
  if (run === undefined) return undefined
  const specified = await expectationOf(diagram, run, head.config)
  return isDeepStrictEqual(resultOf(specified), resultOf(expected))
    ? undefined
    : specified
}

/**
 * The part of a result that tells its reading apart: acceptance, diagram
 * type and Db, or the error.
 */
function resultOf(result: Expectation): unknown {
  return result.accepted
    ? [result.diagramType, result.db]
    : [result.error.name, result.error.message]
}

/**
 * Returns whether `name` is a valid fixture name: lowercase kebab-case.
 */
export function isFixtureName(name: string): boolean {
  return /^[0-9a-z]+(?:-[0-9a-z]+)*$/u.test(name)
}

/**
 * Writes a new fixture directory. Refuses to overwrite an existing one.
 */
export function writeNewFixture(
  diagram: DiagramType,
  name: string,
  input: string,
  file: ExpectedFile,
  specified?: Expectation,
): string {
  if (!isFixtureName(name)) {
    throw new Error(
      `fixture name must be lowercase kebab-case ([a-z0-9-]): ${name}`,
    )
  }
  const dir = path.join(diagramDir(diagram), name)
  if (existsSync(dir))
    throw new Error(`fixture already exists: ${diagram}/${name}`)
  mkdirSync(dir, { recursive: true })
  writeFileSync(path.join(dir, "input.mmd"), input)
  writeFileSync(path.join(dir, "expected.json"), serializeExpectedFile(file))
  if (specified !== undefined) {
    writeFileSync(
      path.join(dir, SPECIFIED_FILE),
      serializeSpecifiedFile(specified),
    )
  }
  return dir
}

/**
 * Key identifying a fixture by what it runs: the input and the configuration.
 */
export function fixtureKey(
  input: string,
  config: MermaidConfig | undefined,
): string {
  return JSON.stringify([input, canonicalJson(config ?? {})])
}

/**
 * Sorts object keys recursively, for comparing configurations.
 */
function canonicalJson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalJson)
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [
          key,
          canonicalJson((value as Record<string, unknown>)[key]),
        ]),
    )
  }
  return value
}
