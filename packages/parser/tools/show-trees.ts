/**
 * Prints the trees that the `ast.json` files of fixtures hold, to read them
 * against the specification: `pnpm run show-trees <diagram> <fixture>...`.
 * For each fixture it prints its input; then each node, indented under its
 * parent, with its plain fields (a direction, the markers, the line, and
 * the length of an arrow, a kind) and, for a
 * node that holds a written value, the value, its range, and the source
 * text of the range when that differs from the value; then the tokens. For
 * a fixture that the parser rejects, it prints the error of its
 * `parse-error.json`: the message, the range, and the source text of the range.
 */
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import type { JsonObject, JsonValue } from "@mmd-toolkit/tests"
import { getFixturesRoot } from "@mmd-toolkit/tests"

/** Whether `value` is a JSON object, not an array and not null. */
function isJsonObject(value: JsonValue): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/** Prints each node of `value` at the depth `depth`; `source` is the input. */
function printNodes(value: JsonValue, source: string, depth: number): void {
  if (isJsonObject(value)) {
    printNode(value, source, depth)
  } else if (Array.isArray(value)) {
    for (const item of value) printNodes(item, source, depth)
  }
}

/** Prints `value`, when it is a node, and then the nodes in its fields. */
function printNode(value: JsonObject, source: string, depth: number): void {
  const written = value.name ?? value.value
  if (typeof value.type === "string") {
    let line = `${"  ".repeat(depth)}${value.type}`
    const { range } = value
    if (typeof written === "string" && Array.isArray(range)) {
      const [start, end] = range as [number, number]
      const text = source.slice(start, end)
      line += ` ${JSON.stringify(written)} [${start}, ${end}]`
      if (text !== written) line += ` source ${JSON.stringify(text)}`
    }
    for (const [key, field] of Object.entries(value)) {
      const isPlain =
        typeof field === "string" ||
        typeof field === "boolean" ||
        typeof field === "number"
      if (isPlain && key !== "type" && field !== written) {
        line += ` ${key}=${JSON.stringify(field)}`
      }
    }
    process.stdout.write(`${line}\n`)
  }
  for (const [key, child] of Object.entries(value)) {
    if (key !== "tokens" && key !== "loc" && key !== "range") {
      printNodes(child, source, depth + 1)
    }
  }
}

/** A token as `ast.json` holds it. */
interface Token {
  readonly type: string
  readonly value: string
}

const [diagram, ...names] = process.argv.slice(2)
if (diagram === undefined || names.length === 0) {
  throw new Error("usage: show-trees <diagram> <fixture> [<fixture>...]")
}
for (const name of names) {
  const directory = path.join(getFixturesRoot(), diagram, name)
  const source = readFileSync(path.join(directory, "input.mmd"), "utf8")
  process.stdout.write(`== ${name} ${JSON.stringify(source)}\n`)
  if (!existsSync(path.join(directory, "ast.json"))) {
    // A fixture that the parser rejects records its error instead.
    const error = JSON.parse(
      readFileSync(path.join(directory, "parse-error.json"), "utf8"),
    ) as { readonly message: string; readonly range: readonly [number, number] }
    const [start, end] = error.range
    process.stdout.write(
      `  rejected: ${error.message} [${start}, ${end}] ${JSON.stringify(source.slice(start, end))}\n`,
    )
    continue
  }
  const root = JSON.parse(
    readFileSync(path.join(directory, "ast.json"), "utf8"),
  ) as { readonly body: JsonValue; readonly tokens: readonly Token[] }
  printNodes(root.body, source, 1)
  const tokens = root.tokens.map(
    (token) => `${token.type} ${JSON.stringify(token.value)}`,
  )
  process.stdout.write(`  tokens ${tokens.join(", ")}\n`)
}
