# Scripts (spec)

Put scripts in a working directory outside the repository, with the extension
`.mts`, and run them with `node <file>`: Node runs TypeScript as it is, from any
directory. Package names do not resolve from outside the repository, so a script
imports the source files by absolute path; replace `<repo>` in the scripts below
with the absolute path of the root of the repository. Node only removes types
that can be erased: write a type-only import as `import type`, and use no
`enum`, no `namespace`, and no parameter properties. Calls to mermaid.js are
serial and slow (tens of milliseconds each). With many inputs, run in the
background and write the output to a file in the working directory.

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

Write the JSON of inputs with a script, not by hand, so that whitespace at the
end of a line, tabs, and `\r` are exact. After writing, check the bytes with
`od -c`.

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
