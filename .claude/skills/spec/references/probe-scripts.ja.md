# スクリプト（spec）

以下のスクリプトはリポジトリのファイルではなく、コミットしない。
ソースはリポジトリのルートの絶対パスで import するので、
`<repo>` をそのパスに置き換える。
`.mts` ファイルとして保存し、どのディレクトリからでも `node <file>` で動かせる。
Node が除去するのは消去できる型だけなので、
型だけの import は `import type` とし、`enum`、`namespace`、
引数プロパティは使わない。

## mermaid.js で入力を確かめる

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

木と Db の導出（parser の側）と比べるときは、
`<repo>/packages/parser/src/index.ts` の `parse` と、
`<repo>/packages/parser/tests/helpers/db.ts` の `dbOf` を、
同じスクリプトから読み込む（読むだけ。parser のファイルは編集しない）。
`dbOf` には、同じテキストについて、
`<repo>/packages/tests/src/mermaid.ts` の `resolveEmbeddedData` が返す値を渡す。
mermaid.js がテキストを拒否するときは、それは undefined を返す。

## 既存の fixture を探す

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
