# The scripts of a check (rule-ideas)

The scripts that the checks of section 4 of
[SKILL.md](../SKILL.md#4-checking-with-mermaid-and-parse) run: `probe.mts` runs
the pinned mermaid.js and `parse()` on a list of inputs, and `format.mts`
formats them. The skills eslint-plugin and eslint-plugin-rules run them too.

Contents:

- Running mermaid.js and parse(): `probe.mts`, how to set it up, write its
  inputs, and run it.
- Checking by formatting: `format.mts`.

The scripts below are not files of the repository and are not committed. They
import sources by the absolute path of the repository root: replace `<repo>`
with that path. As `.mts` files, they run from any directory with `node <file>`.
Node only removes types that can be erased: use `import type` for type-only
imports, and no `enum`, `namespace`, or parameter properties.

## Running mermaid.js and parse()

Put the following script as `probe.mts`.

```ts
import { readFileSync } from "node:fs"
import { parse } from "<repo>/packages/parser/src/index.ts"
import type { Root } from "<repo>/packages/ast/src/index.ts"
import { runMermaid } from "<repo>/packages/tests/src/mermaid.ts"

const casesPath = process.argv[2]
if (casesPath === undefined) throw new Error("usage: probe.mts <cases.json>")
const inputs: string[] = JSON.parse(readFileSync(casesPath, "utf8"))

function withoutPositions(key: string, value: unknown): unknown {
  return key === "loc" || key === "range" ? undefined : value
}

for (const input of inputs) {
  console.log("INPUT", JSON.stringify(input))
  const outcome = await runMermaid(input)
  if (outcome.accepted) {
    console.log(
      "MERMAID accepted",
      outcome.diagramType,
      JSON.stringify(outcome.db),
    )
  } else {
    console.log("MERMAID rejected", outcome.error.message.split("\n")[0])
  }
  let root: Root
  try {
    root = parse(input)
  } catch (error) {
    console.log(
      "PARSER error",
      error instanceof Error ? error.message.split("\n")[0] : String(error),
    )
    continue
  }
  console.log(
    "TOKENS",
    root.tokens
      .map((token) => `${token.type}:${JSON.stringify(token.value)}`)
      .join(" "),
  )
  console.log(
    "COMMENTS",
    JSON.stringify(root.comments.map((comment) => comment.value)),
  )
  console.log(
    "DIRECTIVES",
    JSON.stringify(
      root.directives.map((directive) => ({
        name: directive.name,
        closed: directive.closed,
      })),
    ),
  )
  console.log("BODY", JSON.stringify(root.body, withoutPositions))
}
```

- Run `node <working directory>/probe.mts <cases.json>`, and read the output
  from a file.

## Checking by formatting (question 5 of section 2 of SKILL.md)

Put the following script as `format.mts` and run it like the probe; it imports
the prettier that the plugin's package depends on. A script that imports the
formatter sources (`packages/prettier-plugin-mmd`) gets `@mmd-toolkit/parser`
and `@mmd-toolkit/tests` from their builds in `lib/`. After their sources
change, rebuild them with `pnpm --filter @mmd-toolkit/parser run build` and
`pnpm --filter @mmd-toolkit/tests run build`.

```ts
import { readFileSync } from "node:fs"
import { format } from "<repo>/packages/prettier-plugin-mmd/node_modules/prettier/index.mjs"
import plugin from "<repo>/packages/prettier-plugin-mmd/src/index.ts"

const casesPath = process.argv[2]
if (casesPath === undefined) throw new Error("usage: format.mts <cases.json>")
const inputs: string[] = JSON.parse(readFileSync(casesPath, "utf8"))

for (const input of inputs) {
  const formatted = await format(input, {
    parser: "mermaid",
    plugins: [plugin],
  })
  console.log("INPUT    ", JSON.stringify(input))
  console.log("FORMATTED", JSON.stringify(formatted))
}
```
