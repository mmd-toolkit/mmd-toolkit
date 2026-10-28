/**
 * The formatting fixtures, under `tests/fixtures/<diagram>/<rule>/`: one
 * folder per formatting rule, named as the rule's section in the rules
 * document, and in it pairs of files that show one example each,
 * `<example>-input.mmd` and the formatted `<example>-output.mmd`, with
 * Prettier options in `<example>-options.json` when the example needs any.
 */
import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import type { Options } from "prettier"

const fixturesRoot: string = fileURLToPath(
  new URL("fixtures/", import.meta.url),
)

const INPUT_SUFFIX = "-input.mmd"
const OUTPUT_SUFFIX = "-output.mmd"
const OPTIONS_SUFFIX = "-options.json"

/** One formatting fixture. */
export interface FormatFixture {
  /** The diagram, the rule, and the example, such as `flowchart/semicolons/removed`. */
  readonly id: string
  readonly input: string
  /** The formatted input; null when `-output.mmd` does not exist yet. */
  readonly output: string | null
  readonly options: Options
  /** Where `-output.mmd` is, or would be. */
  readonly outputPath: string
}

/**
 * Returns the names of the directories in `dir`.
 */
async function readDirectories(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
}

/**
 * Returns the rule folders of a diagram, such as `semicolons`.
 */
export function readRuleNames(diagram: string): Promise<string[]> {
  return readDirectories(path.join(fixturesRoot, diagram))
}

/**
 * Loads the fixtures of one diagram type, or of every diagram type when none
 * is given: a test that needs the fixtures of one diagram type names it, so
 * that it does not read the files of the others. Throws on a file that
 * belongs to no fixture, and on an `-output.mmd` or `-options.json` file
 * without its `-input.mmd`, so that a renamed input does not leave a stale
 * expectation behind.
 */
export async function loadFormatFixtures(
  onlyDiagram?: string,
): Promise<FormatFixture[]> {
  const diagrams =
    onlyDiagram === undefined
      ? await readDirectories(fixturesRoot)
      : [onlyDiagram]
  const fixtures: FormatFixture[] = []
  for (const diagram of diagrams) {
    for (const rule of await readRuleNames(diagram)) {
      const dir = path.join(fixturesRoot, diagram, rule)
      fixtures.push(...(await loadRuleFixtures(dir, `${diagram}/${rule}`)))
    }
  }
  return fixtures
}

/** Loads the fixtures of one rule folder. */
async function loadRuleFixtures(
  dir: string,
  idPrefix: string,
): Promise<FormatFixture[]> {
  const files = new Set(await readdir(dir))
  for (const file of files) {
    const example = exampleOf(file)
    if (example === null) {
      throw new Error(`Unexpected file in ${dir}: ${file}`)
    }
    if (!files.has(example + INPUT_SUFFIX)) {
      throw new Error(`${file} in ${dir} has no ${example}${INPUT_SUFFIX}`)
    }
  }
  const fixtures: FormatFixture[] = []
  for (const file of [...files].sort()) {
    if (!file.endsWith(INPUT_SUFFIX)) continue
    const example = file.slice(0, -INPUT_SUFFIX.length)
    const outputPath = path.join(dir, example + OUTPUT_SUFFIX)
    const optionsFile = example + OPTIONS_SUFFIX
    fixtures.push({
      id: `${idPrefix}/${example}`,
      input: await readFile(path.join(dir, file), "utf8"),
      output: files.has(example + OUTPUT_SUFFIX)
        ? await readFile(outputPath, "utf8")
        : null,
      options: files.has(optionsFile)
        ? (JSON.parse(
            await readFile(path.join(dir, optionsFile), "utf8"),
          ) as Options)
        : {},
      outputPath,
    })
  }
  return fixtures
}

/**
 * The example name of a fixture file without its suffix, or null for a file
 * that is not part of a fixture.
 */
function exampleOf(file: string): string | null {
  for (const suffix of [INPUT_SUFFIX, OUTPUT_SUFFIX, OPTIONS_SUFFIX]) {
    if (file.endsWith(suffix)) return file.slice(0, -suffix.length)
  }
  return null
}
