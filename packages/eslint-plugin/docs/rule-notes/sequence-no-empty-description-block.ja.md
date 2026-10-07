# @mmd-toolkit/sequence-no-empty-description-block

英語版:
[sequence-no-empty-description-block.md](./sequence-no-empty-description-block.md)

規則
[@mmd-toolkit/sequence-no-empty-description-block](../rules/sequence-no-empty-description-block.ja.md)
を実装するための覚え書き。

この規則はまだ実装していない。
ここには、実装するときに要ることを書く。

## 木での現れ方

`value` が null で、
`closed` が true の `SequenceAccDescrBlockStatement` のうち、
その範囲（`{` のトークンから `}` のトークンまで）に、
`Root.comments` のコメントが 1 つもないもの。
この文は、`box G`、改行、`accDescr {}` のように、
文が始まる場所なら `SequenceBoxStatement` の `body` の中にもある。
また、`autonumber accDescr {}` や `sequenceDiagram accDescr {}` のように、
同じ行の文の最後の部分の後やヘッダーの後にもある。
どの場所でも何も変えない
（受理される sequence の fixture の各行の終わりにブロックを足して確かめた。
646 個のブロックのどれも、Db を変えなかった）。

ブロックを消す提案は、ブロックが行の最初のトークンのときだけ出す。
ブロックと後ろの空白を消し、行にほかに何もなければ行ごと消す。
後ろの `;` は決して消さない
（fixture から作ったそうしたブロック 13,004 個で、
消した後の読み方は変わらなかった）。
`autonumber accDescr {}` のように行の中で何かの後にあるブロックでは、
ブロックの前の空白を消すと `autonumber ` の意味が変わるので、提案を出さない。

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
- `sequence/db-empty-description-block-with-directive-wrap`
