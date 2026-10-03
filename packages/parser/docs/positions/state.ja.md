# state の位置

英語版: [state.md](./state.md)

この文書は、`@mmd-toolkit/parser` が作る木の、この図種のノードの範囲を定めます。
すべての図種に共通する決まりは [positions.ja.md](../positions.ja.md) にあります。
ノードは仕様の [`ast/state.ja.md`](../../../spec/docs/ast/state.ja.md) が、
トークンは [tokens/state.ja.md](../tokens/state.ja.md) が定めます。

## 範囲

この図種のノードの範囲です。
[positions.ja.md](../positions.ja.md#ノードの範囲) の規則のほかのものです。

### StateDiagram

範囲は、ヘッダーのキーワードから、
`Directive` と `IgnoredSemicolon` のトークンを除く図のテキストの
最後のトークンまでで、
どの文にも属さないトークンも含みます。
どの図の `Root.body` のノードとも同じです
（[ノード](../../../spec/docs/ast.ja.md#ノード) を参照）。

### StateAliasDefinitionStatement

行の規則が無視する `;` は 2 つ目の説明を切ります。
空白 2 個が続く `state "d" as A style:#x;` では、
そのトークンは `#x` と空白 2 個で、
その間に `IgnoredSemicolon` のトークンがあります。
[fixture: state/tokens-alias-ignored-semicolon-then-spaces]

### StateDirectionStatement

範囲は方向の行の全体です。

### StateIgnoredStatement

範囲は、一続きの最初の `"` から最後の `"` までです。

### StateIgnoredText

範囲は、それが持つ単位のトークンを、種類を問わず含み、
それぞれは
[トークン](../tokens/state.ja.md#トークン) がその単位に与える種類を持ちます。
空の文字列の `String` のトークン、`%%` の `RawText` のトークン、
空の説明ブロックの `Keyword` のトークン `accDescr` と、
`Punctuator` のトークン `{` と `}`、
`ignored-state` の単位の `Keyword` のトークンです。
トークンの種類は単位で決まり、それを持つノードでは決まりません。
[fixture: state/gram-empty-description-block-before-alias-body-next-line]
