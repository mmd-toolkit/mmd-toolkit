/**
 * Compares the parse results of the fixtures of a diagram, their `ast.json`
 * and `parse-error.json` files, with a copy taken before a change:
 * `pnpm run diff-trees <copy> <diagram>`, where `<copy>` is a copy of
 * `packages/tests/fixtures/<diagram>`. It prints the files that are new or
 * removed, as `new: <fixture>/<file>` and `removed: <fixture>/<file>`; then,
 * for each kind of difference, the same field of the same kind of node, or
 * of the error, with the list indexes left out, how many fixtures have it;
 * then each difference, with the value before and after.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs"
import path from "node:path"
import { getFixturesRoot } from "../../tests/src/index.ts"
import type { JsonValue } from "../../tests/src/types.ts"

/** One difference: where in the tree of `fixture`, and the two values. */
interface Difference {
  readonly fixture: string
  readonly where: string
  readonly before: JsonValue | undefined
  readonly after: JsonValue | undefined
}

/** `where` with each list index left out, as `[]`: the kind of a difference. */
function kindOf(where: string): string {
  return where
    .split("[")
    .map((part) => {
      const close = part.indexOf("]")
      return close === -1 ? part : `]${part.slice(close + 1)}`
    })
    .join("[")
}

/**
 * Adds to `differences` where the trees `before` and `after` differ: down to
 * the field of a node or the item of a list, while both have the same node
 * type and the same number of items. A node's place is written with its
 * type, as `<FlowchartVertex>`.
 */
function compare(
  fixture: string,
  where: string,
  before: JsonValue | undefined,
  after: JsonValue | undefined,
  differences: Difference[],
): void {
  if (JSON.stringify(before) === JSON.stringify(after)) return
  if (
    Array.isArray(before) &&
    Array.isArray(after) &&
    before.length === after.length
  ) {
    before.forEach((item, index) => {
      compare(fixture, `${where}[${index}]`, item, after[index], differences)
    })
    return
  }
  if (isObject(before) && isObject(after) && before.type === after.type) {
    const here =
      typeof before.type === "string" ? `${where}<${before.type}>` : where
    const keys = new Set([...Object.keys(before), ...Object.keys(after)])
    for (const key of keys) {
      compare(fixture, `${here}.${key}`, before[key], after[key], differences)
    }
    return
  }
  differences.push({ fixture, where, before, after })
}

/** Whether `value` is a JSON object, not an array and not null. */
function isObject(
  value: JsonValue | undefined,
): value is { readonly [key: string]: JsonValue } {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/** The files of a parse result: the tree of an accepted input, and the error of a rejected one. */
const RESULT_FILES = ["ast.json", "parse-error.json"]

/** The content of the file `file` of `fixture` under `directory`, if there is one. */
function resultIn(
  directory: string,
  fixture: string,
  file: string,
): JsonValue | undefined {
  const filePath = path.join(directory, fixture, file)
  if (!existsSync(filePath)) return undefined
  return JSON.parse(readFileSync(filePath, "utf8")) as JsonValue
}

/** The first 200 characters of `value` as JSON. */
function shown(value: JsonValue | undefined): string {
  return value === undefined ? "none" : JSON.stringify(value).slice(0, 200)
}

const [copyDirectory, diagram] = process.argv.slice(2)
if (copyDirectory === undefined || diagram === undefined) {
  throw new Error("usage: diff-trees <copy of the fixtures> <diagram>")
}
const currentDirectory = path.join(getFixturesRoot(), diagram)
const fixtures = new Set([
  ...readdirSync(copyDirectory),
  ...readdirSync(currentDirectory),
])
const differences: Difference[] = []
for (const fixture of [...fixtures].sort()) {
  for (const file of RESULT_FILES) {
    const before = resultIn(copyDirectory, fixture, file)
    const after = resultIn(currentDirectory, fixture, file)
    if (before === undefined && after !== undefined) {
      process.stdout.write(`new: ${fixture}/${file}\n`)
    } else if (before !== undefined && after === undefined) {
      process.stdout.write(`removed: ${fixture}/${file}\n`)
    } else {
      compare(fixture, file, before, after, differences)
    }
  }
}
const fixturesByKind = new Map<string, Set<string>>()
for (const difference of differences) {
  const kind = kindOf(difference.where)
  const fixturesOfKind = fixturesByKind.get(kind) ?? new Set<string>()
  fixturesOfKind.add(difference.fixture)
  fixturesByKind.set(kind, fixturesOfKind)
}
for (const [kind, fixturesOfKind] of fixturesByKind) {
  process.stdout.write(`${fixturesOfKind.size} fixtures: ${kind}\n`)
}
for (const difference of differences) {
  process.stdout.write(
    `\n${difference.fixture} ${difference.where}\n  before ${shown(difference.before)}\n  after  ${shown(difference.after)}\n`,
  )
}
