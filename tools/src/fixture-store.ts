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
import {
  allowsUnsummarizedDb,
  getFixturesRoot,
  parseExpectedFile,
  serializeExpectedFile,
} from "../../packages/tests/src/index.ts"
import type {
  DiagramType,
  ExpectedFile,
  FixtureHead,
  MermaidConfig,
} from "../../packages/tests/src/index.ts"
import { runMermaid } from "../../packages/tests/src/mermaid.ts"
import { belongsIn } from "./diagrams.ts"

export interface StoredFixture {
  readonly name: string
  readonly dir: string
  readonly input: string
  readonly file: ExpectedFile
}

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
      return {
        name,
        dir,
        input: readFileSync(path.join(dir, "input.mmd"), "utf8"),
        file: parseExpectedFile(
          readFileSync(path.join(dir, "expected.json"), "utf8"),
          `${diagram}/${name}`,
        ),
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

/**
 * Runs `input` through mermaid and builds the content of `expected.json`,
 * keeping `head` as it is.
 *
 * Throws when an accepted input is detected as a diagram type that does not
 * belong in `diagram`, or when that type has no normalizer and `diagram` is
 * not one where `db: null` is allowed (see `allowsUnsummarizedDb`).
 */
export async function generateExpected(
  diagram: DiagramType,
  input: string,
  head: FixtureHead,
): Promise<ExpectedFile> {
  const { config } = head
  const outcome = await runMermaid(input, config ? { config } : {})
  if (!outcome.accepted) {
    return { ...head, accepted: false, error: outcome.error }
  }
  if (!belongsIn(diagram, outcome.diagramType)) {
    throw new Error(
      `mermaid detects this input as ${outcome.diagramType}, which does not belong in ${diagram}/`,
    )
  }
  if (!outcome.db && !allowsUnsummarizedDb(diagram)) {
    throw new Error(`no Db normalizer is registered for ${outcome.diagramType}`)
  }
  return {
    ...head,
    accepted: true,
    diagramType: outcome.diagramType,
    db: outcome.db,
  }
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
