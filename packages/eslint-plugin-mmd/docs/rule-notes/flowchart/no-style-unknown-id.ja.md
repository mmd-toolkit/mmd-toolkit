# mmd/flowchart/no-style-unknown-id

英語版: [no-style-unknown-id.md](./no-style-unknown-id.md)

規則 [mmd/flowchart/no-style-unknown-id](../../rules/flowchart/no-style-unknown-id.ja.md) を実装するための覚え書き。

この規則はまだ実装していない。
ここには、実装するときに要ることを書く。

## 木での現れ方

`FlowchartStyleStatement` で、`id` の `name` が、
文の前後を問わず図のどの `FlowchartVertex` の `id` とも違い、
subgraph の id でもないもの。

難点は subgraph の id である。
これは木の欄ではない。
mermaid.js は、名前、タイトル、名前の後のソースのテキストから id を導き、
`subGraph0` のような id を生成する
（仕様の diagrams/flowchart.md の Db normalization）。
規則はその導き方を繰り返すことになり、
それは `@mmd-toolkit/tests` の正規化関数も行っている。
subgraph の id をパーサーが提供すべきかは、未決の問題である。

## fixture

規則が依拠する mermaid.js の読み方は、
`@mmd-toolkit/tests` の次の fixture に記録されている。

- `flowchart/db-style-unknown-vertex`
- `flowchart/db-style-before-vertex`
- `flowchart/db-style-subgraph-id`
