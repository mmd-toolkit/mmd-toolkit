# mmd/flowchart/no-redefined-vertex

英語版: [no-redefined-vertex.md](./no-redefined-vertex.md)

規則 [mmd/flowchart/no-redefined-vertex](../../rules/flowchart/no-redefined-vertex.ja.md) を実装するための覚え書き。

この規則はまだ実装していない。
ここには、実装するときに要ることを書く。

## 木での現れ方

`id` の `name` が同じで、どちらも `shape` を持つ 2 つの `FlowchartVertex` で、
形の `name` か、`label` の `value` が違うもの。
規則は後のほうを報告する。
`A@{ shape: rect }` のようにデータブロックで決めた形やラベルは比べない。
木はデータブロックを読まないからである。

## fixture

規則が依拠する mermaid.js の読み方は、
`@mmd-toolkit/tests` の次の fixture に記録されている。

- `flowchart/db-vertex-label-redefined`
- `flowchart/db-vertex-label-kept-without-label`
- `flowchart/db-vertex-label-redefined-same`
