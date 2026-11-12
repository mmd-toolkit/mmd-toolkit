# The scripts of a check (rule-ideas)

The scripts that the checks of section 4 of
[SKILL.md](../SKILL.md#4-checking-with-mermaid-and-parse) run: `probe.mts` runs
the pinned mermaid.js and `parse()` on a list of inputs, and `format.mts`
formats them. The skills eslint-plugin and eslint-plugin-rules run them too.

Contents:

- Running mermaid.js and parse(): `probe.mts`, how to set it up, write its
  inputs, and run it.
- Checking by formatting: `format.mts`.

## Running mermaid.js and parse()

Put the following script in a working directory outside the repository as
`probe.mts` (`.mts` for its top-level `await`), with `<repo>` replaced by the
absolute path of the root of the repository: a file outside the repository does
not resolve package names. Node removes the type annotations before running it,
so a change to it writes an import of types only as `import type` and uses no
`enum`, `namespace`, or parameter properties.

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

- Write the inputs to a JSON file with `json.dump` in Python or similar, not in
  the shell, where `\n`, quotes, and whitespace at the end of a line go wrong.
- Run `node <working directory>/probe.mts <cases.json>`, and read the output
  from a file.

## Checking by formatting (question 5 of section 2 of SKILL.md)

Put the following script in the working directory as `format.mts`, replace
`<repo>`, and run it like the probe; it imports the prettier that the plugin's
package depends on. The plugin uses the built `packages/parser/lib`, so after
the parser's source changes, run `pnpm --filter @mmd-toolkit/parser run build`
first.

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
