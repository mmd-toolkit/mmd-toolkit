# 確かめのスクリプト（rule-ideas）

[SKILL.ja.md](../SKILL.ja.md#4-mermaid-と-parse-で確かめる手順) の 4
節の確かめが動かすスクリプト。
`probe.mts` は、固定した mermaid.js と `parse()` を入力の一覧に流し、
`format.mts` はそれを整形する。
SKILL eslint-plugin と eslint-plugin-rules も、これを動かす。

目次:

- mermaid.js と parse() で確かめる: `probe.mts` と、その置き方、入力の書き方、
  実行の仕方。
- 整形して確かめる: `format.mts`。

## mermaid.js と parse() で確かめる

次のスクリプトを、
リポジトリの外の作業用ディレクトリに `probe.mts` として置き（top-level の
`await` を使うので `.mts`）、
`<repo>` をリポジトリのルートの絶対パスに置き換える。
リポジトリの外のファイルからはパッケージ名が解決されないからである。
Node は型の注記を取り除いて実行するので、スクリプトを変えるときは、
型だけの import を `import type` で書き、`enum`、`namespace`、
引数のプロパティを使わない。

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

- 入力の一覧は、
  シェルでなく Python などの `json.dump` で JSON のファイルにする。
  シェルでは `\n`、引用符、行末の空白を誤る。
- `node <作業用ディレクトリ>/probe.mts <cases.json>` で実行し、
  結果はファイルから読む。

## 整形して確かめる（SKILL.ja.md の 2 節の問い 5）

次のスクリプトを作業用ディレクトリに `format.mts` として置き、
`<repo>` を置き換えて、probe と同じように実行する。
prettier は、プラグインのパッケージが依存として持つものを import する。
プラグインはビルド済みの `packages/parser/lib` を使うので、
parser のソースが変わったら、
先に `pnpm --filter @mmd-toolkit/parser run build` を実行する。

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
