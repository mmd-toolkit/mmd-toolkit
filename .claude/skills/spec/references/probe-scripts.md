# Scripts (spec)

The scripts below are not files of the repository and are not committed. They
import sources by the absolute path of the repository root: replace `<repo>`
with that path. Save them as `.mts` files and run them from any directory with
`node <file>`. Node only removes types that can be erased: use `import type` for
type-only imports, and no `enum`, `namespace`, or parameter properties.

## Checking inputs with mermaid.js

```ts
// Runs the pinned mermaid.js on each input of a JSON file of the form
// { "<key>": "<input>" } and prints whether it is accepted, with the Db summary
// or the error:
//   node <this file> <inputs.json>
import { readFileSync } from "node:fs"
import { runMermaid } from "<repo>/packages/tests/src/mermaid.ts"

const inputs: Record<string, string> = JSON.parse(
  readFileSync(process.argv[2]!, "utf8"),
)
for (const [key, input] of Object.entries(inputs)) {
  const outcome = await runMermaid(input)
  const result = outcome.accepted
    ? JSON.stringify(outcome.db)
    : `rejected: ${outcome.error.name}: ${outcome.error.message.split("\n")[0]}`
  console.log(`${key}\t${JSON.stringify(input)}\n  ${result}`)
}
```

To compare with the tree and the Db derivation of the parser, load `parse` from
`<repo>/packages/parser/src/index.ts` and `dbOf` from
`<repo>/packages/parser/tests/helpers/db.ts` in the same script (read only; do
not edit the parser's files). Pass `dbOf` the values that `resolveEmbeddedData`
of `<repo>/packages/tests/src/mermaid.ts` returns for the same text; it returns
undefined when mermaid.js rejects the text.

## Finding existing fixtures

```ts
// Lists the fixtures whose input contains a text, with what mermaid.js did:
//   node <this file> "<text>"
import { loadFixtures } from "<repo>/packages/tests/src/index.ts"
import { diagramIds, isDiagramType } from "<repo>/tools/src/diagrams.ts"

// The fixture directories: one per diagram type, and `common`.
const diagrams = Object.keys(diagramIds).filter(isDiagramType)

const wanted = process.argv[2]!
for (const diagram of diagrams) {
  for (const fixture of await loadFixtures(diagram)) {
    if (!fixture.input.includes(wanted)) continue
    const outcome = fixture.expected.accepted
      ? `accepted ${JSON.stringify(fixture.expected.db)}`
      : `rejected ${fixture.expected.error.name}`
    const divergence = fixture.knownDivergence ?? "none"
    console.log(
      `${diagram}/${fixture.name} (divergence: ${divergence})\n  ${JSON.stringify(fixture.input)}\n  ${outcome}`,
    )
  }
}
```
