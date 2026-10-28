# Ishikawa の位置

英語版: [ishikawa.md](./ishikawa.md)

[positions.md](../positions.ja.md) を補う範囲です。
ノードは [ast/ishikawa.md](../../../spec/docs/ast/ishikawa.ja.md)、
トークンは [tokens/ishikawa.md](../tokens/ishikawa.ja.md) が定めます。

## 範囲

### IshikawaDiagram

図はヘッダーから最後の図のトークンまでを覆い、
すべての子孫と値の末尾の空白を含みます。
先行するトリビア、末尾のコメント、
最後のトークンの後のディレクティブは範囲外です。
根のない図はヘッダーだけを覆い、
選ばれた beta 接尾辞も含みます。 [fixture: ishikawa/db-all-fields]
[fixture: ishikawa/header-before-comments]
[fixture: ishikawa/gram-root-trailing-space] [fixture:
ishikawa/gram-last-comment-blank-line] [fixture:
ishikawa/directive-open-child-eof] [fixture: ishikawa/header-only-lf] [fixture:
ishikawa/header-beta-only-lf] [fixture: ishikawa/header-lf-directive-eof]
[fixture: ishikawa/header-comment-ls-whitespace-eof] [fixture:
ishikawa/header-comment-ps-whitespace-eof]

### IshikawaNode

ノードは自身のテキストから最後の子孫までを覆い、
葉は自身のテキストだけを覆います。
先行する字下げと後続の改行は範囲外です。
`indent` は書かれた空白の数を保ち、
タブやコメントを終える U+2028 と U+2029 を含み、ディレクティブ、
共通のコメント領域、コメント本文の空白を除きますが、
範囲を字下げへは広げません。 [fixture: ishikawa/gram-root-lf] [fixture:
ishikawa/db-indent-first-cause] [fixture: ishikawa/db-indent-pop-several]
[fixture: ishikawa/db-indent-tab-character] [fixture:
ishikawa/comment-preserved-u2028] [fixture: ishikawa/comment-preserved-u2029]
[fixture: ishikawa/db-indent-around-directives] [fixture:
ishikawa/header-same-line-root] [fixture:
ishikawa/lex-indent-multiline-directive] [fixture:
ishikawa/lex-header-indent-multiline-directive] [fixture:
ishikawa/lex-indent-comment-region-ls] [fixture:
ishikawa/lex-indent-comment-region-ps] [fixture:
ishikawa/lex-comment-ps-indent-excludes-body-padding]

### IshikawaLiteral

リテラルは、書かれたテキストの最初から最後の文字までを覆い、
引用符と末尾の空白をすべて含み、EOF やコロンの後でも同じです。
範囲はディレクティブ、共通のコメント領域、選ばれた無視する `;` をまたげます。
値はそれらを除き、
`RawText` の断片が残りのテキストを覆います。 [fixture: ishikawa/gram-empty-quotes]
[fixture:
ishikawa/gram-root-trailing-space] [fixture:
ishikawa/gram-child-trailing-space] [fixture:
ishikawa/lex-trailing-whitespace-eof] [fixture:
ishikawa/lex-trailing-ls-ps-whitespace] [fixture:
ishikawa/gram-after-root-colon-space] [fixture:
ishikawa/gram-after-child-colon-space] [fixture:
ishikawa/directive-root-middle] [fixture:
ishikawa/directive-multiline-joins-node-text] [fixture:
ishikawa/comment-ls-region-in-text] [fixture:
ishikawa/lex-root-style-semicolon-padding] [fixture:
ishikawa/lex-root-style-two-semicolons-padding] [fixture:
ishikawa/lex-root-style-three-semicolons-padding]

CR、CRLF、LF は共通の位置の規則に従って行を進めます。
U+2028 と U+2029 は列だけを進めます。 [fixture: ishikawa/lex-cr-lines]
[fixture: ishikawa/lex-crlf-lines] [fixture:
ishikawa/gram-root-lf] [fixture: ishikawa/lex-u2028-in-root] [fixture:
ishikawa/lex-u2029-in-child]
