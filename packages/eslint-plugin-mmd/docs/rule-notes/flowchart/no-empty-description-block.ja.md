# mmd/flowchart/no-empty-description-block

英語版: [no-empty-description-block.md](./no-empty-description-block.md)

規則 [mmd/flowchart/no-empty-description-block](../../rules/flowchart/no-empty-description-block.ja.md) を実装するための覚え書き。

この規則はまだ実装していない。
ここには、実装するときに要ることを書く。

## 木での現れ方

`value` が null で、
`closed` が true の `FlowchartAccDescrBlockStatement` のうち、
その範囲（`{` のトークンから `}` のトークンまで）に、
`Root.comments` のコメントが 1 つもないもの。
閉じていないブロックも、テキストが `{` の直後で終わるときは値を持たない。
そのブロックは、
[no-unclosed-description-block](../../rules/flowchart/no-unclosed-description-block.ja.md)
に任せる。
文を始めない空のブロックは、`A accDescr {}` のように、
parser の構文エラーになる（仕様の既知の差異の
[`tokenless-empty-forms`](../../../../spec/docs/known-divergences/tokenless-empty-forms.ja.md)）。
そのため、それを持つ木はない。

## fixture

規則が依拠する mermaid.js の読み方は、
`@mmd-toolkit/tests` の次の fixture に記録されている。

- `flowchart/db-acc-descr-empty-block-keeps`
- `flowchart/db-acc-descr-empty-block-lines-keeps`
- `flowchart/db-acc-descr-empty-block-after-semicolon-keeps`
- `flowchart/db-acc-descr-empty-block-after-block`
- `flowchart/gram-acc-descr-block-empty`
- `flowchart/db-acc-descr-block-replaces`
- `flowchart/db-acc-descr-empty-replaces`
- `flowchart/db-acc-descr-block-comment-only-keeps`
- `flowchart/db-acc-descr-empty-block-alone`
- `flowchart/db-acc-descr-empty-block-spaces-alone`
- `flowchart/db-acc-descr-empty-block-lines-alone`
- `flowchart/db-acc-descr-block-alone`
- `flowchart/db-acc-descr-block-comment-only-alone`
