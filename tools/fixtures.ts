/**
 * Fixture generator.
 *
 *   node tools/fixtures.ts generate [--check] [<diagram>...]
 *   node tools/fixtures.ts add <diagram> <name> --note <text> [--config <json>] [--input <file>]
 *   node tools/fixtures.ts add-many <diagram> <file.json> [--note <default note>] [--strip-prefix <prefix>] [--dry-run]
 *   node tools/fixtures.ts set-divergence <file.json> [--dry-run]
 *   node tools/fixtures.ts set-note <file.json> [--dry-run]
 *
 * See packages/tests/docs/maintaining-fixtures.md.
 */
/* eslint-disable no-console -- a command-line tool reports on the console */
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import path from "node:path"
import { parseArgs } from "node:util"
import {
  KNOWN_DIVERGENCES,
  fixtureSourceProblem,
  getFixturesRoot,
  serializeExpectedFile,
  serializeSpecifiedFile,
} from "../packages/tests/src/index.ts"
import type {
  DiagramType,
  Expectation,
  ExpectedFile,
  FixtureSource,
  MermaidConfig,
  MermaidError,
} from "../packages/tests/src/index.ts"
import {
  classifyExpectedChange,
  describeExpectedChange,
} from "../packages/tests/src/expected-changes.ts"
import { mermaidVersion } from "../packages/tests/src/mermaid.ts"
import {
  MERMAID_RUN_STORE_DISABLED,
  MERMAID_RUN_STORE_SWITCH,
} from "../packages/tests/src/mermaid-run-store.ts"
import { STANDARD_REJECTIONS } from "../packages/tests/src/rejections.ts"
import { diagramIds, isDiagramType } from "./src/diagrams.ts"
import {
  SPECIFIED_FILE,
  baselineConfigOf,
  fixtureKey,
  generateExpected,
  generateSpecified,
  headOf,
  isFixtureName,
  readFixtures,
  writeNewFixture,
} from "./src/fixture-store.ts"

/**
 * Fails with the usage.
 */
function usage(): never {
  throw new Error(
    [
      "usage:",
      "  node tools/fixtures.ts generate [--check] [<diagram>...]",
      "  node tools/fixtures.ts add <diagram> <name> --note <text> [--config <json>] [--input <file>]",
      "  node tools/fixtures.ts add-many <diagram> <file.json> [--note <default note>] [--strip-prefix <prefix>] [--dry-run]",
      "  node tools/fixtures.ts set-divergence <file.json> [--dry-run]",
      "  node tools/fixtures.ts set-note <file.json> [--dry-run]",
    ].join("\n"),
  )
}

/**
 * Validates diagram type names; none means all.
 */
function diagramsFrom(names: string[]): DiagramType[] {
  const all = Object.keys(diagramIds) as DiagramType[]
  if (!names.length) return all
  return names.map((name) => {
    if (!isDiagramType(name)) {
      throw new Error(
        `unknown diagram type: ${name} (known: ${all.join(", ")})`,
      )
    }
    return name
  })
}

/**
 * Regenerates `expected.json` for every fixture. With `--check`, writes
 * nothing and fails if any file would change.
 *
 * A fixture that cannot be generated (a `MermaidEnvironmentError`, a type
 * detected outside its directory, ...) does not stop the run: it is listed,
 * keeps its file, and makes the run fail at the end. Each fixture whose file
 * changes is printed with how it changed (`src/expected-changes.ts`).
 */
async function generate(args: string[]): Promise<void> {
  const { values, positionals } = parseArgs({
    args,
    options: { check: { type: "boolean", default: false } },
    allowPositionals: true,
  })
  let total = 0
  const changed: string[] = []
  const failed: string[] = []
  const unusual: string[] = []
  for (const diagram of diagramsFrom(positionals)) {
    for (const fixture of readFixtures(diagram)) {
      total++
      const id = `${diagram}/${fixture.name}`
      const head = headOf(fixture.file)
      let file: ExpectedFile, specified: Expectation | undefined
      try {
        file = await generateExpected(diagram, fixture.input, head)
        specified = await generateSpecified(diagram, fixture.input, head, file)
      } catch (error) {
        failed.push(
          `${id}: ${error instanceof Error ? error.message : String(error)}`,
        )
        continue
      }
      if (!file.accepted && !STANDARD_REJECTIONS.includes(file.error.name)) {
        unusual.push(`${id}: ${describeError(file.error)}`)
      }
      const mark =
        fixture.file.knownDivergence === undefined
          ? ""
          : ` [knownDivergence: ${fixture.file.knownDivergence}]`
      const next = serializeExpectedFile(file)
      const expectedPath = path.join(fixture.dir, "expected.json")
      if (readFileSync(expectedPath, "utf8") !== next) {
        changed.push(
          `${id}: ${describeExpectedChange(classifyExpectedChange(fixture.file, file))}${mark}`,
        )
        if (!values.check) writeFileSync(expectedPath, next)
      }
      const specifiedPath = path.join(fixture.dir, SPECIFIED_FILE)
      const nextSpecified =
        specified === undefined ? undefined : serializeSpecifiedFile(specified)
      const previousSpecified = existsSync(specifiedPath)
        ? readFileSync(specifiedPath, "utf8")
        : undefined
      if (previousSpecified !== nextSpecified) {
        changed.push(
          `${id}: ${describeSpecifiedChange(fixture.specified, specified)}${mark}`,
        )
        if (!values.check) {
          if (nextSpecified === undefined) rmSync(specifiedPath)
          else writeFileSync(specifiedPath, nextSpecified)
        }
      }
    }
  }
  await generateDefaultConfig(values.check, changed)
  const verb = values.check ? "would change" : "changed"
  console.log(
    `${total} fixtures, ${changed.length} ${verb} (mermaid@${mermaidVersion})`,
  )
  for (const line of changed) console.log(`  ${line}`)
  reportUnusual(unusual)
  if (failed.length) {
    console.error(
      `${failed.length} fixtures could not be generated; their files are left as they were:`,
    )
    for (const line of failed) console.error(`  ${line}`)
    process.exitCode = 1
  }
  if (values.check && changed.length) {
    console.error(
      "expected.json is out of date; run `pnpm run fixtures:generate` and review the diff",
    )
    process.exitCode = 1
  }
}

/** The file of the default configuration in the fixtures directory. */
const DEFAULT_CONFIG_PATH = path.join(getFixturesRoot(), "default-config.json")

/**
 * Writes `default-config.json`, the configuration mermaid.js has for a text
 * that changes nothing in it and a fixture without a `config`; with `check`,
 * only reports in `changed` that the file would change.
 */
async function generateDefaultConfig(
  check: boolean,
  changed: string[],
): Promise<void> {
  const next = `${JSON.stringify(await baselineConfigOf(undefined), null, 2)}\n`
  const previous = existsSync(DEFAULT_CONFIG_PATH)
    ? readFileSync(DEFAULT_CONFIG_PATH, "utf8")
    : undefined
  if (previous === next) return
  changed.push(
    `default-config.json: ${previous === undefined ? "added" : "changed"}`,
  )
  if (!check) writeFileSync(DEFAULT_CONFIG_PATH, next)
}

/**
 * Describes how `specified.json` of a fixture changes: added, removed, or
 * changed (then as the change of the result).
 */
function describeSpecifiedChange(
  previous: Expectation | undefined,
  next: Expectation | undefined,
): string {
  if (previous === undefined) return "specified.json added"
  if (next === undefined) return "specified.json removed"
  return `specified.json: ${describeExpectedChange(classifyExpectedChange(previous, next))}`
}

/**
 * One entry of an `add-many` file.
 */
interface BatchEntry {
  readonly name: string
  readonly input: string
  /**
   * Why a hand-written fixture exists; `--note` is used when neither this nor
   * `source` is given.
   */
  readonly note?: string
  /** Where in the mermaid repository the input was taken, instead of a note. */
  readonly source?: FixtureSource
  readonly config?: MermaidConfig
  /** What the author observed; reported when mermaid disagrees. */
  readonly accepted?: boolean
  /** One of `KNOWN_DIVERGENCES`, if the spec departs from mermaid here. */
  readonly knownDivergence?: string
}

/**
 * Adds several fixtures from a JSON file: an array of entries, or an object
 * with a `fixtures` array. Each entry is hand-written (with a note) or taken
 * from the mermaid repository (with a `source` of kind `mermaid`). Entries
 * whose name or input and configuration already exist are skipped. Nothing is
 * written if any entry is invalid or belongs to another diagram type.
 */
async function addMany(args: string[]): Promise<void> {
  const { values, positionals } = parseArgs({
    args,
    options: {
      note: { type: "string" },
      "dry-run": { type: "boolean", default: false },
      "strip-prefix": { type: "string" },
    },
    allowPositionals: true,
  })
  const [diagramName, file] = positionals
  if (!diagramName || !file) usage()
  const [diagram] = diagramsFrom([diagramName])
  const json = JSON.parse(readFileSync(file, "utf8")) as unknown
  const entries = (
    Array.isArray(json) ? json : (json as { fixtures?: unknown }).fixtures
  ) as BatchEntry[] | undefined
  if (!Array.isArray(entries)) {
    throw new Error(`${file}: expected an array or { "fixtures": [...] }`)
  }
  const existing = readFixtures(diagram)
  const names = new Set(existing.map((fixture) => fixture.name))
  const keys = new Map(
    existing.map((fixture) => [
      fixtureKey(fixture.input, fixture.file.config),
      fixture.name,
    ]),
  )
  const batch: Batch = {
    diagram,
    defaultNote: values.note,
    names,
    keys,
    planned: [],
    skipped: [],
    disagreements: [],
    problems: [],
  }
  const prefix = values["strip-prefix"]
  for (const entry of entries) {
    const renamed =
      prefix && typeof entry.name === "string" && entry.name.startsWith(prefix)
        ? { ...entry, name: entry.name.slice(prefix.length) }
        : entry
    await planEntry(renamed, batch)
  }
  const { planned, skipped, disagreements, problems } = batch
  list("skipped (already present)", skipped)
  list(
    "disagree with the observation in the file (mermaid's result is recorded)",
    disagreements,
  )
  if (problems.length) {
    list("cannot be added", problems)
    throw new Error("nothing written; fix the entries above")
  }
  // Listed so that each can be checked: one mermaid rejects only because of
  // embedded data is accepted by the specification and needs the mark
  // `embedded-data-opaque` (see tools/README.md).
  list(
    "rejected by mermaid",
    planned.flatMap(({ entry, file: expected }) =>
      expected.accepted
        ? []
        : [`${entry.name}: ${describeError(expected.error)}`],
    ),
  )
  for (const { entry, file: expected, specified } of planned) {
    if (!values["dry-run"])
      writeNewFixture(diagram, entry.name, entry.input, expected, specified)
  }
  console.log(
    `${values["dry-run"] ? "would add" : "added"} ${planned.length} fixtures to ${diagram}/`,
  )
  reportUnusual(
    planned
      .filter(
        ({ file: expected }) =>
          !expected.accepted &&
          !STANDARD_REJECTIONS.includes(expected.error.name),
      )
      .map(
        ({ entry, file: expected }) =>
          `${diagram}/${entry.name}: ${expected.accepted ? "" : describeError(expected.error)}`,
      ),
  )
}

/**
 * State of an `add-many` run.
 */
interface Batch {
  readonly diagram: DiagramType
  readonly defaultNote: string | undefined
  /** Fixture names taken, including planned ones. */
  readonly names: Set<string>
  /** Input and configuration keys taken, with the fixture holding each. */
  readonly keys: Map<string, string>
  readonly planned: {
    entry: BatchEntry
    file: ExpectedFile
    specified: Expectation | undefined
  }[]
  readonly skipped: string[]
  readonly disagreements: string[]
  readonly problems: string[]
}

/**
 * Returns where an `add-many` entry came from, or what is wrong with it.
 */
function entrySource(
  entry: BatchEntry,
  defaultNote: string | undefined,
): FixtureSource | string {
  if (typeof entry.name !== "string" || typeof entry.input !== "string") {
    return "needs a name and an input"
  }
  if (!isFixtureName(entry.name)) {
    return "the name must be lowercase kebab-case ([a-z0-9-])"
  }
  if (
    entry.knownDivergence !== undefined &&
    !KNOWN_DIVERGENCES.includes(entry.knownDivergence)
  ) {
    return `knownDivergence must be one of ${KNOWN_DIVERGENCES.join(", ")}`
  }
  if (entry.source !== undefined) {
    if (entry.note !== undefined) return "has both a note and a source"
    const problem = fixtureSourceProblem(entry.source)
    if (problem) return problem
    if (entry.source.kind !== "mermaid") {
      return "a source must be of kind mermaid; give a note instead"
    }
    return entry.source
  }
  const note = entry.note ?? defaultNote
  if (!note) return "needs a note (or --note) or a source"
  return { kind: "authored", note }
}

/**
 * Generates one `add-many` entry, or records why it is skipped or invalid.
 */
async function planEntry(entry: BatchEntry, batch: Batch): Promise<void> {
  const source = entrySource(entry, batch.defaultNote)
  if (typeof source === "string") {
    batch.problems.push(`${String(entry.name)}: ${source}`)
    return
  }
  const key = fixtureKey(entry.input, entry.config)
  const same = batch.keys.get(key)
  if (batch.names.has(entry.name) || same) {
    batch.skipped.push(
      `${entry.name}: ${same ? `same input as ${same}` : "name taken"}`,
    )
    return
  }
  let expected: ExpectedFile, specified: Expectation | undefined
  try {
    const head = {
      source,
      ...(entry.config ? { config: entry.config } : {}),
      ...(entry.knownDivergence === undefined
        ? {}
        : { knownDivergence: entry.knownDivergence }),
    }
    expected = await generateExpected(batch.diagram, entry.input, head)
    specified = await generateSpecified(
      batch.diagram,
      entry.input,
      head,
      expected,
    )
  } catch (error) {
    batch.problems.push(
      `${entry.name}: ${error instanceof Error ? error.message : String(error)}`,
    )
    return
  }
  if (entry.accepted !== undefined && entry.accepted !== expected.accepted) {
    const actual = expected.accepted
      ? "accepts"
      : `rejects (${describeError(expected.error)})`
    batch.disagreements.push(
      `${entry.name}: observed ${entry.accepted ? "accepted" : "rejected"}, mermaid ${actual}`,
    )
  }
  batch.planned.push({ entry, file: expected, specified })
  batch.names.add(entry.name)
  batch.keys.set(key, entry.name)
}

/**
 * Sets or removes `knownDivergence` in existing fixtures, from a JSON object
 * mapping `<diagram>/<name>` to a divergence identifier, or to `null` to
 * remove it. Only that field changes, and `specified.json`, which depends on
 * it: mermaid.js runs only for a fixture whose mark has a specified reading.
 */
async function setDivergence(args: string[]): Promise<void> {
  await updateHeads(args, true, (file, value) => {
    if (value !== null && !KNOWN_DIVERGENCES.includes(value as string)) {
      return `must be null or one of ${KNOWN_DIVERGENCES.join(", ")}`
    }
    const { knownDivergence: _previous, ...rest } = file
    return value === null ? rest : { ...rest, knownDivergence: value as string }
  })
}

/**
 * Replaces the note of existing hand-written fixtures, from a JSON object
 * mapping `<diagram>/<name>` to the new note. Only that field changes;
 * mermaid is not run.
 */
async function setNote(args: string[]): Promise<void> {
  await updateHeads(args, false, (file, value) => {
    if (typeof value !== "string" || !value.trim()) {
      return "the note must be a non-empty string"
    }
    if (file.source.kind !== "authored") {
      return "taken from mermaid; only authored fixtures have a note"
    }
    return { ...file, source: { kind: "authored", note: value } }
  })
}

/**
 * Writes or removes the `specified.json` of a fixture whose mark changed:
 * the reading of the specification depends on the mark, so the file does too.
 * This runs mermaid.js, for a fixture whose mark has such a reading.
 */
async function writeSpecifiedFor(item: {
  readonly diagram: DiagramType
  readonly dir: string
  readonly input: string
  readonly updated: ExpectedFile
}): Promise<void> {
  const specified = await generateSpecified(
    item.diagram,
    item.input,
    headOf(item.updated),
    item.updated,
  )
  const file = path.join(item.dir, SPECIFIED_FILE)
  if (specified === undefined) rmSync(file, { force: true })
  else writeFileSync(file, serializeSpecifiedFile(specified))
}

/**
 * Applies `update` to the `expected.json` of each fixture named in a JSON
 * object `{ "<diagram>/<name>": value }`. `update` returns the new content,
 * or a problem. Nothing is written if any entry has a problem or names an
 * unknown fixture. With `--dry-run`, only lists what would change.
 */
async function updateHeads(
  args: string[],
  changesMark: boolean,
  update: (file: ExpectedFile, value: unknown) => ExpectedFile | string,
): Promise<void> {
  const { values, positionals } = parseArgs({
    args,
    options: { "dry-run": { type: "boolean", default: false } },
    allowPositionals: true,
  })
  const [file] = positionals
  if (!file || positionals.length !== 1) usage()
  const mapping = JSON.parse(readFileSync(file, "utf8")) as Record<
    string,
    unknown
  >
  const problems: string[] = []
  const updates: {
    diagram: DiagramType
    dir: string
    input: string
    updated: ExpectedFile
    path: string
    next: string
    label: string
  }[] = []
  for (const [label, value] of Object.entries(mapping)) {
    const [diagramName = "", name = ""] = label.split("/")
    const fixture = isDiagramType(diagramName)
      ? readFixtures(diagramName).find((item) => item.name === name)
      : undefined
    if (!fixture || !isDiagramType(diagramName)) {
      problems.push(`${label}: no such fixture`)
      continue
    }
    const updated = update(fixture.file, value)
    if (typeof updated === "string") {
      problems.push(`${label}: ${updated}`)
      continue
    }
    updates.push({
      diagram: diagramName,
      dir: fixture.dir,
      input: fixture.input,
      updated,
      path: path.join(fixture.dir, "expected.json"),
      next: serializeExpectedFile(updated),
      label: `${label}: ${value === null ? "removed" : String(value)}`,
    })
  }
  if (problems.length) {
    list("cannot be updated", problems)
    throw new Error("nothing written; fix the entries above")
  }
  for (const item of updates) {
    if (values["dry-run"]) continue
    writeFileSync(item.path, item.next)
    if (changesMark) await writeSpecifiedFor(item)
  }
  list(
    values["dry-run"] ? "would update" : "updated",
    updates.map((item) => item.label),
  )
}

/**
 * Prints a titled list, if it is not empty.
 */
function list(title: string, lines: string[]): void {
  if (!lines.length) return
  console.log(`${lines.length} ${title}:`)
  for (const line of lines) console.log(`  ${line}`)
}

/**
 * Lists fixtures rejected with an error mermaid does not throw on purpose.
 * Each must be checked by hand to be caused by the input, not by Node.
 */
function reportUnusual(lines: string[]): void {
  if (!lines.length) return
  console.log(
    `${lines.length} fixtures rejected with an error other than ${STANDARD_REJECTIONS.join(", ")}; ` +
      "check that each is caused by the input:",
  )
  for (const line of lines) console.log(`  ${line}`)
}

/**
 * Formats a recorded error on one line.
 */
function describeError(error: MermaidError): string {
  return `${error.name}: ${error.message.split("\n")[0]}`
}

/**
 * Adds a hand-written fixture, e.g. one backing a claim in the spec.
 */
async function add(args: string[]): Promise<void> {
  const { values, positionals } = parseArgs({
    args,
    options: {
      note: { type: "string" },
      config: { type: "string" },
      input: { type: "string" },
    },
    allowPositionals: true,
  })
  const [diagramName, name] = positionals
  if (!diagramName || !name || !values.note) usage()
  const [diagram] = diagramsFrom([diagramName])
  const input =
    values.input === undefined
      ? readFileSync(0, "utf8")
      : readFileSync(values.input, "utf8")
  const config = values.config
    ? (JSON.parse(values.config) as MermaidConfig)
    : undefined
  const key = fixtureKey(input, config)
  const duplicate = readFixtures(diagram).find(
    (fixture) => fixtureKey(fixture.input, fixture.file.config) === key,
  )
  if (duplicate) {
    throw new Error(
      `${diagram}/${duplicate.name} already has this input and config`,
    )
  }
  const file = await generateExpected(diagram, input, {
    source: { kind: "authored", note: values.note },
    ...(config ? { config } : {}),
  })
  const dir = writeNewFixture(diagram, name, input, file)
  console.log(`added ${path.relative(process.cwd(), dir)}`)
  console.log(serializeExpectedFile(file))
  if (!file.accepted && !STANDARD_REJECTIONS.includes(file.error.name)) {
    reportUnusual([`${diagram}/${name}: ${describeError(file.error)}`])
  }
}

const [command, ...rest] = process.argv.slice(2)

// The fixtures record what mermaid.js does, so every result is made by
// mermaid.js itself and none is taken from the store of earlier results.
// eslint-disable-next-line no-process-env -- the switch of the store is this variable, for this process as for any other
process.env[MERMAID_RUN_STORE_SWITCH] = MERMAID_RUN_STORE_DISABLED

try {
  switch (command) {
    case "generate":
      await generate(rest)
      break
    case "add":
      await add(rest)
      break
    case "add-many":
      await addMany(rest)
      break
    case "set-divergence":
      await setDivergence(rest)
      break
    case "set-note":
      await setNote(rest)
      break
    default:
      usage()
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
}

/* eslint-enable no-console -- end of the command-line tool */
