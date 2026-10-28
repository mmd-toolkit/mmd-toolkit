# Requirement の位置

英語版: [requirement.md](./requirement.md)

この文書は、`@mmd-toolkit/parser` が作る木の、この図種のノードの範囲を定めます。
すべての図種に共通する決まりは [positions.ja.md](../positions.ja.md) にあります。
ノードは仕様の [`ast/requirement.ja.md`](../../../spec/docs/ast/requirement.ja.md) が、
トークンは [tokens/requirement.ja.md](../tokens/requirement.ja.md) が定めます。

## 範囲

この図種のノードの範囲です。
[positions.ja.md](../positions.ja.md#ノードの範囲) の規則のほかのものです。

### RequirementDiagram

範囲は、
どの図の `Root.body` のノードとも同じ定めに従います（[ノードの範囲](../positions.ja.md#ノードの範囲) を参照）。

### 引用符なしのテキストで終わる文と欄

`unquoted-text` 単位は行の中で後ろの空白を読み、
そのトークンはそれを除きます（[トークン](../tokens/requirement.ja.md#トークン) を参照）。
そのため、それで終わる文や欄は、空白でない最後の文字で終わります。
欄 `id:   1` と 2 つの空白は `id:   1` を覆い、
`text:   spaced out` と 3 つの空白は `text:   spaced out` を覆います。 [fixture: requirement/db-requirement-value-spaces]

### RequirementClassStatement

範囲は、`class` から最後のクラスまでです。
文が style の文脈を出る改行の後に続くところでも同じです。
`class r`、改行、`c` は、
両方の行を覆います。 [fixture: requirement/lex-class-list-next-line]

### RequirementIdentifier と RequirementLiteral

範囲はノードのトークンの範囲で、値はその範囲の書かれたテキストです。
ただしスタイルは別です。
引用符なしの名前や値は、後ろの空白を除き、間の空白を含めて、
その文字を覆います（`requirement  spaced name  {` の名前 `spaced name` は、
`spaced name` を覆います）。
アクセシビリティのテキストは、両端の空白を除いてテキストを覆います。
スタイルは、最初の単位から最後の単位までを、間の空白を含めて覆い、
値はその空白を除きます。
`style r fill: red , stroke : blue` の最初のスタイルは `fill: red` を覆い、
値は `fill:red` です。 [fixture: requirement/db-requirement-name-spaces]
[fixture: requirement/db-acc-title-descr]
[fixture: requirement/lex-style-spaces]

### RequirementIgnoredText

方向の行のテキストは、両端の空白を除いてそれを覆います。
`foo direction LR bar` のテキストは `foo` と `bar` です。
本文の中の空の説明ブロックは、`accDescr` から `}` までを、
複数の行にわたるときも覆います。
値は、その中のコメント行を除きます。
`accDescr {`、コメント行 `%% c`、`}` の値は、 `accDescr {`、改行、
`}` です。 [fixture: requirement/lex-direction-line-text-before-and-after]
[fixture: requirement/gram-empty-description-block-multiline-in-body]
[fixture: requirement/gram-empty-description-block-comment-line-in-body]
