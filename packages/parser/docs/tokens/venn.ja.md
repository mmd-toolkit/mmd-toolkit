# Venn のトークン

英語版: [venn.md](./venn.md)

[tokens.md](../tokens.ja.md) を補うトークンを定めます。
ノードは [ast/venn.md](../../../spec/docs/ast/venn.ja.md)、
字句規則は [diagrams/venn.md](../../../spec/docs/diagrams/venn.ja.md) で定めています。

## トークン

| 種類         | 対象                                                                               |
| ------------ | ---------------------------------------------------------------------------------- |
| `Keyword`    | `venn-beta`、`set`、`union`、明示・暗黙の `text`、`style`、title 行の `title` 部分 |
| `Punctuator` | コンマ、コロン、開き角括弧、閉じ角括弧のそれぞれ                                   |
| `Identifier` | 裸の名前、text id、プロパティのキー、裸の style 値の識別子単位                     |
| `Numeric`    | size、数値の text id、裸の style 値の数の単位                                      |
| `String`     | 引用した名前、text id、style 値、引用したラベルの内部。両方の引用符を含む          |
| `RawText`    | 裸のラベルの内部、title の内容、色の単位全体、飲み込まれた非空白の断片             |

[fixture: venn/db-all-fields] [fixture: venn/db-form-text-number]
[fixture: venn/db-form-style-number] [fixture: venn/db-form-style-hex]
[fixture: venn/db-form-style-rgba] [fixture: venn/lex-style-adjacent-units]
[fixture: venn/db-grid-comment-header-line]

各項目は、共通のトリビアに切られる前に 1 つのトークンを作ります。
ラベル全体の一致を、2 つの角括弧のトークンと内部の項目に分けます。
空の引用ラベルにも、2 つの引用符の `String` トークンがあります。
裸のラベルは内部の空白をすべて保ち、空白だけの値も同じです。
文字列は内部の空白と、
書かれたとおりの行終端を保ちます。 [fixture: venn/db-label-empty]
[fixture: venn/lex-label-bare-padding]
[fixture: venn/lex-label-bare-whitespace-line]
[fixture: venn/lex-crlf-quoted-value]

ディレクティブか選ばれたセミコロンだけを含む引用ラベルにも、
引用された内部の項目があり、`StringFragment` トークンに切られます。
裸か引用のラベルで、ほかの内容がコメント領域の場合は、
最初の LF が内部のトークンに残ります。
トリビアを除くと文字がない裸のラベルは拒否します。 [fixture: venn/lex-label-quoted-directive-only]
[fixture: venn/lex-label-quoted-ignored-semicolon-only]
[fixture: venn/lex-label-bare-comment-only]
[fixture: venn/lex-label-quoted-comment-only]
[fixture: venn/gram-label-bare-directive-only]
[fixture: venn/gram-label-bare-ignored-semicolon-only]

title 行の一致を、キーワードと空でない内容に分けます。
最初の空白の区切りにはトークンがありません。
その後の先頭と末尾の空白は `RawText` トークンに属し、空白だけの値も同じです。
最初の区切りが CRLF の場合は、
両方の文字を除きます。 [fixture: venn/db-title-padding]
[fixture: venn/db-title-only-whitespace]
[fixture: venn/lex-title-separator-crlf]
[fixture: venn/lex-title-separator-ls]

裸の style 値の単位は、隣接していてもそれぞれのトークンの種類を保ちます。
単位間の空白はトークンに属さず、VennLiteral の書かれた値には属します。
色全体の内部の空白は、その `RawText` トークンに属します。
字下げ、ほかの単位間の空白、
newline 単位はトークンを作りません。 [fixture: venn/lex-style-adjacent-units]
[fixture: venn/db-form-style-tokens]
[fixture: venn/lex-style-value-rgb-multiline]
[fixture: venn/db-indent-width] [fixture: venn/lex-tab-whitespace-line]

共通のトリビアは、[共通規則](../tokens.ja.md) に従って、
テキストと文字列を切ります。
切られた文字列は `StringFragment` トークンになります。
識別子と数の単位の内部にあるディレクティブや選ばれたセミコロンは、
裸の style 値の内部でも入力を拒否させます。
角括弧と引用符は別の区切りなので、開き側の `[` と `"` の間でも、
閉じ側の `"` と `]` の間でも、
ディレクティブはどちらのトークンも切りません。 [fixture: venn/lex-label-directive-middle]
[fixture: venn/lex-identifier-comment-line]
[fixture: venn/lex-identifier-style-rule]
[fixture: venn/div-directive-style-value-word]
[fixture: venn/div-directive-style-value-number]
[fixture: venn/div-ignored-semicolon-style-value-selected]
[fixture: venn/lex-directive-label-delimiter-gap]
[fixture: venn/lex-directive-label-closing-delimiter-gap]
[fixture: venn/div-ignored-semicolon-style-value-number-selected]

色の単位全体の内部にある選ばれたセミコロンは、その `RawText` トークンを切り、
`IgnoredSemicolon` として記録します。
名前リストのコンマは独立した `Punctuator` の項目なので、
直前と直後のディレクティブは隣接する名前を切りません。 [fixture: venn/lex-style-hex-ignored-semicolon]
[fixture: venn/lex-style-rgb-ignored-semicolon]
[fixture: venn/lex-name-list-comma-directive]

飲み込まれた非空白の断片には、
図のコメントの前に独立した `RawText` トークンがあります。
U+0085 は空白ではなく、
このトークンを持つ `VennIgnoredText` ノードとして残ります。 [fixture: venn/db-grid-comment-header-line]
[fixture: venn/lex-inline-comment-spaced]
[fixture: venn/lex-swallowed-nel-gap]

図のコメントは、変換後の図のテキストで `%%` から始まり、
U+2028 と U+2029 を越えて LF かテキストの終わりまで続きます。
`Root.comments` は[共通のコメント領域の規則](../tokens.ja.md#comment) に従ってソースの断片を記録し、
領域の後の断片では `mark: null` です。 [fixture: venn/lex-bare-percent-between-set-and-text]
[fixture: venn/lex-inline-comment-line-separators]
[fixture: venn/lex-diagram-comment-cut-ls-tree-gap]
[fixture: venn/lex-diagram-comment-cut-ps-tree-gap]
[fixture: venn/lex-diagram-comment-cut-ls-spaces-tree-gap]
[fixture: venn/lex-diagram-comment-cut-ps-spaces-tree-gap]
[fixture: venn/lex-diagram-comment-cut-ls-tab-tree-gap]
[fixture: venn/lex-diagram-comment-cut-ps-tab-tree-gap]
[fixture: venn/lex-diagram-comment-cut-ls-eof-tree-gap]
[fixture: venn/lex-diagram-comment-cut-ps-eof-tree-gap]
[fixture: venn/lex-diagram-comment-cut-ls-following-real-statement]
[fixture: venn/lex-diagram-comment-cut-ps-following-real-statement]
[fixture: venn/lex-diagram-comment-cut-ls-joined-unit]

規則 2 が飲み込む文字が[表記](../../../spec/docs/common.ja.md#表記) の空白なら、
トークンを作りません。
U+0009–U+000D、U+0020、U+00A0、U+1680、U+2000–U+200A、 U+2028、U+2029、U+202F、
U+205F、U+3000、U+FEFF が該当します。
共通のコメント行やディレクティブの除去で、
図のテキストに残った `%%` の直前にある U+2028 と U+2029 も含みます。 [fixture: venn/lex-comment-swallowed-vt]
[fixture: venn/lex-comment-swallowed-ff]
[fixture: venn/lex-comment-swallowed-cr]
[fixture: venn/lex-comment-swallowed-nbsp]
[fixture: venn/lex-comment-swallowed-nbsp-between-statements]
[fixture: venn/lex-comment-swallowed-ogham]
[fixture: venn/lex-comment-swallowed-en-quad]
[fixture: venn/lex-comment-swallowed-em-quad]
[fixture: venn/lex-comment-swallowed-en-space]
[fixture: venn/lex-comment-swallowed-em-space]
[fixture: venn/lex-comment-swallowed-three-per-em]
[fixture: venn/lex-comment-swallowed-four-per-em]
[fixture: venn/lex-comment-swallowed-six-per-em]
[fixture: venn/lex-comment-swallowed-figure]
[fixture: venn/lex-comment-swallowed-punctuation]
[fixture: venn/lex-comment-swallowed-thin-space]
[fixture: venn/lex-comment-swallowed-hair-space]
[fixture: venn/lex-comment-swallowed-narrow-nbsp]
[fixture: venn/lex-comment-swallowed-medium-math]
[fixture: venn/lex-comment-swallowed-ideographic]
[fixture: venn/lex-comment-swallowed-bom]
[fixture: venn/lex-swallowed-nbsp-gap] [fixture: venn/lex-swallowed-vt-gap]
[fixture: venn/lex-swallowed-ff-gap] [fixture: venn/lex-swallowed-bom-gap]
[fixture: venn/lex-swallowed-ideographic-gap]
[fixture: venn/lex-swallowed-nbsp-header]
[fixture: venn/lex-swallowed-nbsp-eof]
[fixture: venn/lex-swallowed-nbsp-between-subsets]
[fixture: venn/gram-comment-prefix-line-separator-bare-percent]
[fixture: venn/gram-comment-prefix-line-separator-u2029-bare-percent]
[fixture: venn/gram-comment-prefix-line-separator-brace-comment]
[fixture: venn/gram-comment-prefix-line-separator-u2029-brace-comment]
[fixture:
venn/gram-comment-prefix-line-separator-between-statements-bare-percent]
[fixture:
venn/gram-comment-prefix-line-separator-between-statements-u2029-bare-percent]
[fixture:
venn/gram-comment-prefix-line-separator-between-statements-brace-comment]
[fixture:
venn/gram-comment-prefix-line-separator-between-statements-u2029-brace-comment]
[fixture:
venn/gram-comment-prefix-line-separator-between-statements-implicit-text]
[fixture:
venn/gram-comment-prefix-line-separator-between-statements-u2029-implicit-text]
[fixture:
venn/gram-comment-prefix-line-separator-between-statements-extra-id]
[fixture:
venn/gram-comment-prefix-line-separator-between-statements-u2029-extra-id]

共通のトリビアの除去で、値の外の U+2028 か U+2029 の後に `%%` が残らなければ、
その区切りは拒否します。 [fixture: venn/gram-comment-prefix-line-separator]
[fixture: venn/gram-comment-prefix-line-separator-u2029]
[fixture: venn/gram-comment-prefix-line-separator-directive]
[fixture: venn/gram-comment-prefix-line-separator-u2029-directive]

コメントの外の `Directive` と `IgnoredSemicolon` のトークンは、
共通処理が記録します。 [fixture: venn/lex-identifier-style-rule]
[fixture: venn/lex-label-directive-middle]
