# sequence の位置

英語版: [sequence.md](./sequence.md)

この文書は、`@mmd-toolkit/parser` が作る木の、この図種のノードの範囲を定めます。
すべての図種に共通する決まりは [positions.ja.md](../positions.ja.md) にあります。
ノードは仕様の [`ast/sequence.ja.md`](../../../spec/docs/ast/sequence.ja.md) が、
トークンは [tokens/sequence.ja.md](../tokens/sequence.ja.md) が定めます。

## 範囲

この図種のノードの範囲です。
[positions.ja.md](../positions.ja.md#ノードの範囲) の規則のほかのものです。

### SequenceDiagram

範囲は、キーワードから、
`Directive` と `IgnoredSemicolon` のトークンを除く図のテキストの
最後のトークンまでで、
どの文にも属さないトークンも含みます。
どの図の `Root.body` のノードとも同じです
（[ノード](../../../spec/docs/ast.ja.md#ノード) を参照）。

### SequenceParticipantStatement

`create` があるときは、範囲は `create` から始まります。

### SequenceDestroyStatement

`create` があるときは、範囲は `create` から始まります。

### SequenceBoxText

部分は 1 つのトークンですが、
ディレクティブが同じ種類のトークンに切ることがあります
（[トークン](../tokens/sequence.ja.md#トークン) を参照）。
`box Gr%%{init: {}}%%oup` では、候補の範囲は、
`RawText` のトークン `Gr` と `oup` と、その間のディレクティブを覆います。
[fixture: sequence/tokens-box-text-directive-in-candidate]
[fixture: sequence/tokens-box-text-directive-in-remainder]

### SequenceArrow

範囲はそのトークンです。

### SequenceSection

範囲は、節を始めるキーワードから始まり、その最後のトークンで終わります。
節を始めるキーワードは、`else`、`and`、`option`、
最初の節ならブロックのキーワードです。
`end` はブロックに属します。

### SequenceIdentifier

そのトークンは `RawText` のトークンで、1 つです。
単位の中のディレクティブや無視される `;` が単位を切ると、それより多くなります
（[トークン](../tokens/sequence.ja.md#トークン) を参照）。

`participant A%%{init: {}}%% c%%B` では、
参加者の 1 つの単位がトークン `A` と ` c%%B` に切られます。
` c%%B` は、id が持つ空白を含みます。
[fixture: sequence/lex-directive-in-id-before-space]

### SequenceText

範囲は、接頭辞（接頭辞がなければテキスト）から、テキストの終わりまでです。

### SequenceDataBlock

範囲は `@{` から `}` までです。
