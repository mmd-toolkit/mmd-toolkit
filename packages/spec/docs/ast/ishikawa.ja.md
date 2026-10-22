# Ishikawa のノード

英語版: [ishikawa.md](./ishikawa.md)

図種 `ishikawa` の木を定めます。
共通部分は [ast.md](../ast.ja.md)、
構文と受理は [diagrams/ishikawa.md](../diagrams/ishikawa.ja.md)、
値の変換と Db は
[tests パッケージの要約](../../../tests/docs/db-summaries.ja.md#ishikawa) に
定めます。

本文は IshikawaDiagram で、各節点の字下げを保つ入れ子の木を持ちます。
親は Ishikawa 自身の「[字下げと親](../diagrams/ishikawa.ja.md#字下げと親)」
の規則で定めます。
兄弟はソース順で、重複するテキストも別々に保ちます。
[fixture: ishikawa/db-indent-first-cause]
[fixture: ishikawa/db-indent-clamped] [fixture: ishikawa/db-three-definitions]

## ノード

### IshikawaDiagram

| フィールド | 型                       | 意味                                        |
| ---------- | ------------------------ | ------------------------------------------- |
| `root`     | IshikawaNode または null | 最初の節点。節点が書かれていなければ null。 |

子フィールド: `root`。
見出しのノードや beta の欄はありません。
空行、コメント、
directive は図固有のノードを作りません。
タイトルやアクセシビリティの欄もありません。
そのように見えるテキストは節点であり、frontmatter は共通の根に保持します。
[fixture: ishikawa/header-only-lf] [fixture: ishikawa/header-beta-only-lf]
[fixture: ishikawa/header-lf-directive-eof]
[fixture: ishikawa/gram-root-comment-only-document]
[fixture: ishikawa/gram-whitespace-only-document]
[fixture: ishikawa/db-title-line-is-node]
[fixture: ishikawa/db-accdescr-empty-keeps-node]
[fixture: ishikawa/db-frontmatter-title]

範囲は、見出しと全子孫の節点を含む図の本文を覆います。
根のない図にも見出しがあります。
[fixture: ishikawa/header-only-lf] [fixture: ishikawa/db-all-fields]
[fixture: ishikawa/header-same-line-root]

### IshikawaNode

| フィールド | 型                    | 意味                           |
| ---------- | --------------------- | ------------------------------ |
| `indent`   | 整数                  | 前にある行内空白の個数。非負。 |
| `text`     | IshikawaLiteral       | 空でない節点のテキスト。       |
| `children` | IshikawaNode のリスト | ソース順の子。                 |

子フィールド: `text`、`children` の順です。
子がない節点の `children` は空です。
範囲は自身のテキストから最後の子孫までを覆い、
子孫がなければ自身のテキストだけです。
先頭の字下げは空白であり、
テキストの値ではありません。
[fixture: ishikawa/gram-root-lf] [fixture: ishikawa/db-indent-first-cause]
[fixture: ishikawa/db-indent-pop-several]

`indent` はタブ、U+00A0、U+3000、
先行する図のコメントを終える U+2028 や U+2029 も含め、
行内空白を 1 つずつ数えます。
directive は除き、
見出しの行では見出しの後の空白を数えます。
根の字下げも保ちますが、
親の決定には使いません。
[fixture: ishikawa/db-indent-tab-character]
[fixture: ishikawa/db-indent-equal-mixed-whitespace]
[fixture: ishikawa/lex-ideographic-positions]
[fixture: ishikawa/comment-preserved-u2028]
[fixture: ishikawa/comment-preserved-u2029]
[fixture: ishikawa/db-comment-ls-indent-below-first-cause]
[fixture: ishikawa/db-indent-around-directives]
[fixture: ishikawa/header-same-line-root]
[fixture: ishikawa/db-indent-root-deeper]

最初の原因は根の子です。
それ以後の節点は、字下げが最初の原因以下なら根の子、
それ以外なら先行する原因で字下げが厳密に小さい最も近いものの子です。
推定した字下げや段階で `indent` を置き換えません。
[fixture: ishikawa/db-indent-first-cause]
[fixture: ishikawa/db-indent-clamp-below-base]
[fixture: ishikawa/db-indent-relative-zero]
[fixture: ishikawa/db-indent-nearest-smaller-cause]

### IshikawaLiteral

| フィールド | 型     | 意味                           |
| ---------- | ------ | ------------------------------ |
| `value`    | 文字列 | 書かれたままの節点のテキスト。 |

子フィールドはありません。
範囲は節点のテキストの最初から最後までで、
末尾の空白を含みます。
`value` は「[書かれたテキスト](../ast.ja.md#ノード)」の規則に従い、引用符、
バッククォート、実体参照、内部と末尾の空白を保ちます。
directive、
共通のコメント領域、選ばれた無視するセミコロンは値から除きます。
範囲はそれらの除外領域も含むことがあります。
[fixture: ishikawa/gram-root-trailing-space]
[fixture: ishikawa/lex-trailing-ls-ps-whitespace]
[fixture: ishikawa/gram-quotes-padding]
[fixture: ishikawa/gram-empty-backticks-text]
[fixture: ishikawa/header-root-inline-entity]
[fixture: ishikawa/directive-root-middle]
[fixture: ishikawa/directive-multiline-joins-node-text]
[fixture: ishikawa/comment-ls-region-in-text]
[fixture: ishikawa/lex-root-style-semicolon]
[fixture: ishikawa/lex-style-semicolon-before-directive]
[fixture: ishikawa/lex-entity-directive-in-node-text]
[fixture: ishikawa/lex-html-tag-starts-in-comment-line]
[fixture: ishikawa/lex-html-tag-crosses-directive]
[fixture: ishikawa/lex-html-tag-ends-in-comment-line]
[fixture: ishikawa/lex-node-text-ps-comment-region]
[fixture: ishikawa/lex-style-rule-directive-in-trigger]
[fixture: ishikawa/lex-style-rule-ls-segment]
[fixture: ishikawa/lex-style-rule-ps-segment]
[fixture: ishikawa/lex-style-rule-comment-region-in-text]
[fixture: ishikawa/lex-trailing-whitespace-eof]
[fixture: ishikawa/lex-root-style-semicolon-padding]
[fixture: ishikawa/lex-root-style-two-semicolons]
[fixture: ishikawa/lex-root-style-two-semicolons-padding]
[fixture: ishikawa/lex-root-style-three-semicolons]
[fixture: ishikawa/lex-root-style-three-semicolons-padding]

値は空になりません。
数に見えるテキストも、
空の引用符や括弧の綴りも IshikawaLiteral であり、
StringLiteral や NumericLiteral にはしません。
[fixture: ishikawa/db-number-labels] [fixture: ishikawa/gram-empty-quotes]
[fixture: ishikawa/gram-empty-brackets]
[fixture: ishikawa/lex-directive-in-numeric-looking-text]

引用符は区切りではなく内容なので、
閉じ引用符がない形にも `closed` の欄は不要です。
[fixture: ishikawa/gram-root-unclosed-quote]
