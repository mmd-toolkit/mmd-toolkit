# Venn の位置

英語版: [venn.md](./venn.md)

[positions.md](../positions.ja.md) を補う範囲を定めます。
ノードは [ast/venn.md](../../../spec/docs/ast/venn.ja.md)、
トークンは [tokens/venn.md](../tokens/venn.ja.md) で定めています。

## 範囲

### VennDiagram と文

図はヘッダーから最後の図のトークンまでを覆い、末尾のトリビアを除きます。
ヘッダーだけの図は `venn-beta` だけを覆います。
文はキーワードから最後のオペランドか閉じ角括弧までを覆います。
title は値の末尾の空白も含みます。
字下げと後続の行終端は文の外です。
[fixture: venn/header-only] [fixture: venn/header-statement-on-line]
[fixture: venn/db-all-fields] [fixture: venn/db-title-padding]
[fixture: venn/db-indent-width]

### VennStyleProperty、VennLabel、共有の葉

プロパティはキーから値までを覆います。
ラベルは両方の角括弧を覆います。
値は角括弧を除き、引用したラベルでは両方の引用符も除きます。
識別子と数は、それぞれの 1 つのトークンを覆います。
StringLiteral は両方の引用符を覆います。
その `raw` は数の `raw` と同じく、ソースの範囲全体です。
文字列内部の共通のトリビアも含みます。
[fixture: venn/db-form-style-multiple] [fixture: venn/db-set-label]
[fixture: venn/db-label-empty] [fixture: venn/db-form-set-label-size]
[fixture: venn/db-size-leading-zeros]
[fixture: venn/lex-identifier-directive-middle]
[fixture: venn/lex-crlf-quoted-value]

ディレクティブか選ばれたセミコロンで空になった引用ラベルも、
両方の角括弧と引用符を覆い、そのトリビアを含みます。
コメント領域を含む裸か引用のラベルでは、
領域の前の最初の LF が値と内部のトークンに残ります。
[fixture: venn/lex-label-quoted-directive-only]
[fixture: venn/lex-label-quoted-ignored-semicolon-only]
[fixture: venn/lex-label-bare-comment-only]
[fixture: venn/lex-label-quoted-comment-only]

### VennLiteral と VennIgnoredText

title のリテラルは、最初の空白の区切りの後のすべての文字を覆います。
その後の先頭と末尾の空白も含みます。
空白だけの title の値は、その空白を覆います。
裸の style のリテラルは、最初から最後の単位までを覆い、
単位間の空白を元のまま含みます。
[fixture: venn/db-title-padding] [fixture: venn/db-title-only-whitespace]
[fixture: venn/lex-title-separator-crlf] [fixture: venn/db-form-style-tokens]
[fixture: venn/lex-style-adjacent-units]

ignored-text のノードは、飲み込まれた非空白のコード単位だけを覆います。
コメントはその外にあります。
直前に完結した文があっても、その文とは別のままです。
[fixture: venn/db-grid-comment-header-line]
[fixture: venn/lex-set-extra-id-eaten] [fixture: venn/lex-style-extra-id-eaten]
