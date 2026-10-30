# Info のノード

英語版: [info.md](./info.md)

この文書は `info` のソースの木を定めます。
共有の木は [ast.md](../ast.ja.md)、
構文と受理条件は [diagrams/info.md](../diagrams/info.ja.md) にあります。
フィールドは書かれた値を保ちます。
任意の値はなければ null、ない一覧は空で、一覧はソース順です。
子の欄は巡回順を示します。 [fixture: info/header-lf] [fixture: info/common-all]
[fixture: info/common-flag-all] [fixture: info/title-repeat-empty]
[fixture: info/acctitle-repeat-empty] [fixture: info/accdescr-line-repeat]
[fixture: info/accdescr-block-repeat]

## ノード

### InfoDiagram

| フィールド           | 型                     | 意味                     |
| -------------------- | ---------------------- | ------------------------ |
| `showInfo`           | 真偽値                 | フラグを書いたか。       |
| `textBeforeHeader`   | InfoIgnoredText の一覧 | info の前の残された形。  |
| `textBeforeShowInfo` | InfoIgnoredText の一覧 | 書かれたフラグの前の形。 |
| `body`               | InfoBodyItem の一覧    | 書かれた文と隠れた形。   |

子の欄: `textBeforeHeader`、`textBeforeShowInfo`、`body`。
範囲: 残された見出し前の最初の形、なければ info から、
最後に書かれた見出し・フラグ・本文の形までです。
無関係な外側の空白は除きます。
固定の見出しはキーワードであり、独立したノードではありません。
有効な title や version のフィールドを合成しません。 [fixture: info/header-lf]
[fixture: info/header-inline-flag] [fixture: info/common-all]
[fixture: info/frontmatter-nonleading-comment]
[fixture: info/detect-second-scan-directive]

textBeforeHeader は検出点から残された通常の隠れた形を持ちます。
通過した裸の行は percent と波括弧の形も共有 Comment であり、
この範囲を広げません。
共に通した空白・改行はトリビアであり、読み直しません。
残された形の間に通過したトリビアがある場合も同じです。
通常の隠れた形の境界は引き続き受理を決めます。
[fixture: info/frontmatter-nonleading-comment]
[fixture: info/detect-second-scan-directive]
[fixture: info/lex-detect-preheader-empty-braces]
[fixture: info/lex-detect-preheader-open-brace]
[fixture: info/div-detect-retained-yaml-bare-ls]
[fixture: info/div-detect-retained-directive-bare-bom]
[fixture: info/div-detect-yaml-bare-directive]
[fixture: info/lex-detect-yaml-bare-directive-ascii]
[fixture: info/lex-preheader-closer-u3000]

showInfo はフラグのキーワードを書いた場合だけ真です。
真なら、可視の改行を越えていても、
info とフラグの間の隠れた形はすべて textBeforeShowInfo に属します。
フラグがなければその一覧は空で、見出しの後の形は body の先頭になります。
フラグの後の隠れた形も body の先頭になります。
そこにコメントを重複して置きません。 [fixture: info/header-lf]
[fixture: info/header-inline-flag] [fixture: info/header-flag-next-line]
[fixture: info/hidden-directive-body] [fixture: info/hidden-yaml-body]
[fixture: info/lex-flag-hidden-two] [fixture: info/lex-hidden-without-flag]
[fixture: info/hidden-directive-flag-next-common]
[fixture: info/hidden-yaml-after-flag]
[fixture: info/hidden-directive-close-glued]

InfoBodyItem は InfoTitleStatement、InfoAccTitleStatement、
InfoAccDescrStatement、InfoAccDescrBlockStatement、InfoIgnoredText です。
info が共通の値を公開しなくても、繰り返しと空の文をすべて保ちます。
空行とコメントだけの行は本文項目を作りません。
隠れた形の前に可視の EOL があれば、前の文の接尾ではなく本文項目になります。
[fixture: info/common-all] [fixture: info/common-blank-lines]
[fixture: info/title-repeat-empty] [fixture: info/acctitle-repeat-empty]
[fixture: info/accdescr-line-repeat] [fixture: info/accdescr-block-repeat]
[fixture: info/comment-bare-body] [fixture: info/lex-hidden-after-visible-eol]
[fixture: info/hidden-yaml-between-common]

### InfoTitleStatement

| フィールド  | 型                      | 意味                     |
| ----------- | ----------------------- | ------------------------ |
| `value`     | InfoLiteral または null | 書かれた共通の値。       |
| `textAfter` | InfoIgnoredText の一覧  | EOL より前の隠れた接尾。 |

value は title と ASCII space/tab のちょうど 1
文字の後から行の値の終わりまでのテキストで、残る空白をすべて保ちます。
区切りがない場合やその後に内容がない場合は null です。
2 個目の区切りは空白のリテラルです。
共通のディレクティブだけなら null の内容になることがあります。
[fixture: info/title-empty] [fixture: info/title-tabs]
[fixture: info/lex-title-one-space] [fixture: info/lex-title-one-tab]
[fixture: info/lex-title-two-spaces] [fixture: info/lex-title-directive-only]

子の欄: `value`、`textAfter`。
範囲: title から最後の値の文字まで、null ならキーワードまでで、
最後の textAfter の形まで広げます。
EOL と無関係な外側の空白を除きます。
最初の可視の EOL より前の隠れた形は textAfter に、
その EOL より後の形は body に属します。
空の文と繰り返す文も、別々の出現として保ちます。
通常のコメントは共有 Comment であり、隠れた接尾ではありません。
[fixture: info/title-empty] [fixture: info/title-tabs]
[fixture: info/lex-title-one-space] [fixture: info/lex-title-one-tab]
[fixture: info/lex-title-two-spaces] [fixture: info/lex-title-directive-only]
[fixture: info/hidden-directive-title-eof]
[fixture: info/lex-hidden-after-visible-eol] [fixture: info/comment-after-block]

### InfoAccTitleStatement

| フィールド  | 型                      | 意味                     |
| ----------- | ----------------------- | ------------------------ |
| `value`     | InfoLiteral または null | 書かれた共通の値。       |
| `textAfter` | InfoIgnoredText の一覧  | EOL より前の隠れた接尾。 |

value はコロンの直後から行の値の終わりまでのテキストで、両端の空白を保ちます。
共通のトリビアを除いた後に内容がない場合だけ null です。
空白だけの内容はリテラルです。 [fixture: info/acctitle-empty]
[fixture: info/acctitle-gap] [fixture: info/acctitle-repeat-empty]
[fixture: info/lex-acctitle-directive-only]

子の欄: `value`、`textAfter`。
範囲: accTitle からコロンまたは最後の値の文字までで、
最後の textAfter の形まで広げます。
EOL と無関係な外側の空白を除きます。
最初の可視の EOL より前の隠れた形は textAfter に、
その EOL より後の形は body に属します。
空の文と繰り返す文も、別々の出現として保ちます。
通常のコメントは共有 Comment であり、隠れた接尾ではありません。
[fixture: info/acctitle-empty] [fixture: info/acctitle-gap]
[fixture: info/acctitle-repeat-empty]
[fixture: info/lex-acctitle-directive-only]
[fixture: info/hidden-directive-acctitle-eof]
[fixture: info/lex-hidden-after-visible-eol] [fixture: info/comment-after-block]

### InfoAccDescrStatement

| フィールド  | 型                      | 意味                     |
| ----------- | ----------------------- | ------------------------ |
| `value`     | InfoLiteral または null | 書かれた共通の値。       |
| `textAfter` | InfoIgnoredText の一覧  | EOL より前の隠れた接尾。 |

value はコロンの直後から行の値の終わりまでの行テキストで、両端の空白を保ちます。
共通のトリビアを除いた後に内容がない場合だけ null です。
空白だけの内容はリテラルです。
コロンの後の波括弧に見える値も、この行の形のままです。
[fixture: info/accdescr-line-empty] [fixture: info/accdescr-line-repeat]
[fixture: info/lex-accdescr-directive-only]
[fixture: info/lex-accdescr-line-whitespace]
[fixture: info/lex-block-colon-first]

子の欄: `value`、`textAfter`。
範囲: accDescr からコロンまたは最後の値の文字までで、
最後の textAfter の形まで広げます。
EOL と無関係な外側の空白を除きます。
最初の可視の EOL より前の隠れた形は textAfter に、
その EOL より後の形は body に属します。
空の文と繰り返す文も、別々の出現として保ちます。
通常のコメントは共有 Comment であり、隠れた接尾ではありません。
[fixture: info/accdescr-line-empty] [fixture: info/accdescr-line-repeat]
[fixture: info/lex-accdescr-directive-only]
[fixture: info/lex-accdescr-line-whitespace]
[fixture: info/lex-block-colon-first]
[fixture: info/hidden-directive-accdescr-eof]
[fixture: info/lex-hidden-after-visible-eol] [fixture: info/comment-after-block]

### InfoAccDescrBlockStatement

| フィールド  | 型                      | 意味                     |
| ----------- | ----------------------- | ------------------------ |
| `value`     | InfoLiteral または null | 書かれた共通の値。       |
| `textAfter` | InfoIgnoredText の一覧  | EOL より前の隠れた接尾。 |

value は波括弧の内部で、外側の両端の共通の空白だけを除きます。
空白・共通のディレクティブ・コメント領域だけの内容は null です。
内部の字下げ、ソースの改行、裸の percent 行、引用符、
バックスラッシュは書かれたテキストのままです。
最初の閉じ波括弧が必須なので closed フィールドは不要です。
空のブロックもこの文です。 [fixture: info/accdescr-block-empty]
[fixture: info/space-block-interior] [fixture: info/accdescr-block-quoted]
[fixture: info/comment-bare-block] [fixture: info/lex-block-directive-only]
[fixture: info/lex-block-comment-only] [fixture: info/lex-block-whitespace-only]
[fixture: info/accdescr-block-open]

子の欄: `value`、`textAfter`。
範囲: accDescr から最初の閉じ波括弧までで、最後の textAfter の形まで広げます。
EOL と無関係な外側の空白を除きます。
最初の可視の EOL より前の隠れた形は textAfter に、
その EOL より後の形は body に属します。
空の文と繰り返す文も、別々の出現として保ちます。
通常のコメントは共有 Comment であり、隠れた接尾ではありません。
[fixture: info/accdescr-block-empty] [fixture: info/space-block-interior]
[fixture: info/accdescr-block-quoted] [fixture: info/comment-bare-block]
[fixture: info/lex-block-directive-only] [fixture: info/lex-block-comment-only]
[fixture: info/lex-block-whitespace-only] [fixture: info/accdescr-block-open]
[fixture: info/hidden-directive-block-eof] [fixture: info/hidden-yaml-block-eof]
[fixture: info/lex-hidden-after-visible-eol] [fixture: info/comment-after-block]

### InfoLiteral

| フィールド | 型     | 意味                         |
| ---------- | ------ | ---------------------------- |
| `value`    | 文字列 | 書かれた共通の値のテキスト。 |

子の欄はありません。
範囲は、その文が定める値の最初から最後のソース文字までで、
内部の共通のトリビアをまたぎます。
null に空のリテラルを作りません。
共通のディレクティブ、コメント領域、選ばれたセミコロンを除き、改行、
属性の引用符、文字参照、エスケープの綴りも含め、他のソース文字をすべて保ちます。
引用されたように見えるテキストも StringLiteral ではなく InfoLiteral であり、
引用符は閉じなくてもかまいません。
空白の縮約やエスケープの復号は適用しません。 [fixture: info/title-tabs]
[fixture: info/title-open-quote] [fixture: info/title-double-quotes]
[fixture: info/directive-title-value] [fixture: info/directive-block-value]
[fixture: info/comment-block] [fixture: info/lex-line-comment-region-ls]
[fixture: info/style-title] [fixture: info/html-all-common]
[fixture: info/line-crlf] [fixture: info/space-block-interior]
[fixture: info/lex-title-one-tab]

### InfoIgnoredText

| フィールド | 型     | 意味                          |
| ---------- | ------ | ----------------------------- |
| `kind`     | 文字列 | yaml-block または directive。 |
| `value`    | 文字列 | フェンスを含む空でない形。    |

子の欄はありません。
範囲は `---` または `%%{` の開きから条件を満たす閉じまでで、
前の ASCII 空白と閉じの直後に消費する LF を除きます。
内部のソースの改行や空白は保ちます。
追加の LF はソースの範囲や値に入りません。
どちらの形も閉じが必要なので closed フィールドは不要です。
空の本文もフェンスを持つ空でない値になります。 [fixture: info/hidden-yaml-empty]
[fixture: info/hidden-yaml-open-padding]
[fixture: info/hidden-directive-padding]
[fixture: info/hidden-directive-nonqualifying-closer]
[fixture: info/hidden-directive-cr] [fixture: info/hidden-directive-crlf]
[fixture: info/hidden-yaml-cr] [fixture: info/hidden-yaml-crlf]
[fixture: info/hidden-directive-title-eof] [fixture: info/hidden-yaml-block-eof]
[fixture: info/lex-yaml-body-separators]
[fixture: info/lex-hidden-body-separators]

value から共通のディレクティブ・コメント領域・選ばれたセミコロンを除きますが、
ソースの範囲はそれらをまたぎます。
隠れた形全体には固有のフロントマターや設定の効果はありません。
内部で認識する大域的なディレクティブは、独立した共通の効果を保ちます。
失敗したディレクティブ風の形は共有 Comment であり、このノードではありません。
先に始まった行・ブロックの値は、内部の隠れた形に見えるテキストを持ちます。
[fixture: info/hidden-yaml-config-ignored]
[fixture: info/lex-hidden-nested-global] [fixture: info/lex-yaml-common-comment]
[fixture: info/lex-hidden-common-comment]
[fixture: info/lex-yaml-fences-selected]
[fixture: info/lex-hidden-opener-selected]
[fixture: info/lex-hidden-closer-selected]
[fixture: info/hidden-directive-close-glued]
[fixture: info/hidden-yaml-inside-block] [fixture: info/hidden-yaml-after-title]
[fixture: info/hidden-directive-block-first-brace]

一致した形全体の所有者は、textBeforeHeader、textBeforeShowInfo、body、
文の textAfter の一つだけです。
Root.frontmatter/directives に重複して置きません。
YAML の本文ありの優先順位により、
隣接する 3 本のフェンスは空の形と別の開きではなく一つの一致になります。
空でない 2 ブロックは別々のままにできます。
その範囲は [字句規則](../diagrams/info.ja.md#隠れた-yaml) が決めます。
[fixture: info/frontmatter-nonleading-comment] [fixture: info/hidden-yaml-body]
[fixture: info/lex-hidden-without-flag] [fixture: info/lex-hidden-tail-two]
[fixture: info/lex-yaml-three-fences]
[fixture: info/lex-yaml-empty-then-content]
[fixture: info/lex-yaml-two-before-flag]
