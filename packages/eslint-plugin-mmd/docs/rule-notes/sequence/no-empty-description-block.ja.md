# mmd/sequence/no-empty-description-block

英語版: [no-empty-description-block.md](./no-empty-description-block.md)

規則 [mmd/sequence/no-empty-description-block](../../rules/sequence/no-empty-description-block.ja.md) を実装するための覚え書き。

この規則はまだ実装していない。
ここには、実装するときに要ることを書く。

## 木での現れ方

`value` が null で、
`closed` が true の `SequenceAccDescrBlockStatement` のうち、
その範囲（`{` のトークンから `}` のトークンまで）に、
`Root.comments` のコメントが 1 つもないもの。
文を始めない空のブロックは、parser の構文エラーになる（仕様の既知の差異の
[`tokenless-empty-forms`](../../../../spec/docs/known-divergences/tokenless-empty-forms.ja.md)）。
そのため、それを持つ木はない。
この文は、`box G`、改行、`accDescr {}` のように、
文が始まる場所なら `SequenceBoxStatement` の `body` の中にもあり、
そこでも何も変えない。

## fixture

規則が依拠する mermaid.js の読み方は、
`@mmd-toolkit/tests` の次の fixture に記録されている。

- `sequence/db-acc-descr-empty-block-after-message`
- `sequence/db-acc-descr-empty-block-spaces-after-message`
- `sequence/db-acc-descr-empty-block-lines-after-message`
- `sequence/db-acc-descr-block-after-message`
- `sequence/db-acc-descr-block-comment-only-after-message`
- `sequence/db-acc-descr-empty-block-keeps`
- `sequence/gram-acc-descr-block-empty-then-statement`
- `sequence/db-acc-descr-spaces-block-keeps`
- `sequence/db-acc-descr-comment-block-keeps`
- `sequence/gram-box-empty-description-block-line`
- `sequence/gram-box-empty-description-block-then-participant`
- `sequence/gram-box-empty-description-block-before-end`
- `sequence/gram-box-empty-description-block-lines`
