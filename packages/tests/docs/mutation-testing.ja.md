# 変異差分テスト

英語版: [mutation-testing.md](./mutation-testing.md)

この文書は、`@mmd-toolkit/tests/mutation` が実装を mermaid.js とどう比べるかと、
その報告の読み方を説明します。

## 何をするか

fixture から 1 か所だけ編集した入力を作り、
それぞれを mermaid.js と比較対象の実装に通し、受理・拒否、図種 ID、
Db の要約の食い違いを報告します。
編集は、文字の削除・挿入・置換と、トークンか行の削除・複製・入れ替えです。
挿入と置換に使う文字は、
決まった文字の集合（`src/mutation.ts`）の中から選びます。
mermaid.js の文法のどこかで意味を持つ記号、
空白と改行の種類
（単独の CR、ノーブレークスペース、バイトオーダーマークを含む）、
英字 1 つと数字 1 つです。
行は LF、CRLF、単独の CR で終わるものとして扱います。

```js
import { loadFixtures } from "@mmd-toolkit/tests"
import { runMutationDiff } from "@mmd-toolkit/tests/mutation"

const fixtures = await loadFixtures("flowchart")
const report = await runMutationDiff(
  fixtures.map((f) => ({ name: f.name, text: f.input, config: f.config })),
  (text) => ({ accepted: myParserAccepts(text) }),
  { count: 20, seed: 1 },
)
```

変異体はシード付きの生成器で選ぶので、
fixture の名前とシードから報告を再現できます。
`mutate(text, { seed, count })` は、変異体だけを、
それを作った編集とともに返します。

## ほかの入力

入力は fixture でなくてもかまいません。

- `generatedInputs(generator, seeds, count, prefix)` は、
  入力の生成器 `(seed, count) => Iterable<string>` の出力に
  `<prefix>-s<seed>-<index>` という名前を付ける。
- `compareAll(inputs, candidate)` は、入力を変えずに比べる。
- `runMutationDiff(..., { includeInputs: true })` は、
  各入力をその変異体より先に比べる。

Node で mermaid.js が判定できないテキストは `skipped` として報告します。

## 比較対象

比較対象は `candidate(text, config, embedded)` として呼ばれ、
`{ accepted, diagramType?, db?, knownDivergence? }` か、
その promise を返します。

`embedded` は、そのテキストについて `resolveEmbeddedData()` が返すものを、
同じ mermaid.js の実行から取ったものです。
埋め込まれたデータに左右される Db の値を作るのに使います
（[embedded-data.ja.md](./embedded-data.ja.md) を参照）。
mermaid.js がテキストを拒否したときは `undefined` です。

比較対象は、はじめは `accepted` だけを返してもかまいません。
`diagramType` と `db` は比較対象が返したときだけ比べ、
`report.comparedParts` がそれぞれ何回比べたかを数えます。
`require: ["diagramType", "db"]`（CLI では `--require db`）を渡すと、
その部分を返さない比較対象を `missing-*` の不一致として報告します。

## 既知の差

仕様が mermaid.js と違いうる入力だと見分けた比較対象は、
`KNOWN_DIVERGENCES` のいずれかを `knownDivergence` として返します。

- そのとき、受理・拒否、図種 ID、Db の違いは、
  不一致ではなく `report.divergences` に報告する。
- それでも結果が一致した場合（文法が分かれた部分を再びつなぐことがある）は、
  申告を `report.declaredWithoutDifference` に数えるだけ。
- `KNOWN_DIVERGENCES` にない識別子は `unknown-divergence` の不一致。
- 必須の部分の欠落は、申告があっても `missing-*` の不一致。

変異体は fixture の `knownDivergence` を引き継ぎません。
編集によって差が消えることがあるためです。

## 報告

| 欄                          | 内容                                                                                  |
| --------------------------- | ------------------------------------------------------------------------------------- |
| `compared`                  | 比べたテキストの数。                                                                  |
| `comparedParts`             | そのうち、図種 ID と Db の要約を比べた数。                                            |
| `mismatches`                | 食い違い。テキスト、編集（`description`）、もとの入力、両方の結果を持つ。             |
| `divergences`               | 比較対象が既知の差として申告した違い。                                                |
| `declaredWithoutDifference` | 既知の差として申告したのに結果が一致したテキストの数（識別子ごと）。                  |
| `skipped`                   | Node で mermaid.js が判定できなかったテキストとその理由。比較対象の良し悪しではない。 |

## コマンドライン

```sh
pnpm --filter @mmd-toolkit/tests run mutation --candidate <module> --seed 1
```

`<module>` は比較対象を default export します。
`--diagram`（既定は `flowchart`）の全 fixture、
または `--fixture` で名前を挙げたものを変異させます。
CLI は既知の差を識別子ごとに表示し、それでは失敗しません。
不一致か `skipped` が 1 件でもあれば、終了コード 1 で終わります。

fixture は、当てはまる編集の演算子を、seed と fixture が決める順に、
1 回ずつ使って変異させます
（1 行の fixture には、入れ替える行がありません）。
位置は、その演算子の位置から無作為に選びます。
そのため、fixture の最初の変異は別々の演算子を使い、
当てはまる演算子は、seed によらず、すべて使われます。
`--count` は、fixture ごとの変異の数です。
省くと 1 周、つまり当てはまる演算子ごとに 1 件です。
`--count` が 1 のときは、当てはまる演算子から無作為に 1 つを選びます。
1 周を超えると、演算子をもう一度使います。
`--count` を増やすのは、ある演算子の変異の形を広げたいときで、
確かさのためではありません。
同じ種類の変異を増やしても、新しく見つかるものはありません。
位置の少ない演算子（3 行のテキストの 2 行の入れ替えなど）は、
違う変異が少なく、別の演算子がその代わりをしないので、
`--count` より少ない変異になる fixture があります。
