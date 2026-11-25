# Pie の整形規則

英語版: [pie.md](./pie.md)

決定した21項目を定めます。
原文の木を使い、実行時に Mermaid を呼ばず、出力を再解析しません。
不可視文字の例はテストのエスケープで表します。

## Rules

### Header

XY chart の[ヘッダーと向き](./xychart.ja.md#ヘッダーと向き) を再利用します。
ほかの図種と同じく、正確な小文字の `pie` を先頭列に置きます。
[規則 1](./printed-form.ja.md#1-記号の横の空白)が、
`pie` と書かれた `showData` の間に空白 1 つを与えます。
Prettier が `return  x` を `return x;` と印字するためです。
通常の同一行の最初の文は次行へ移します。
指定前の隠れた形と消費される改行は保持します。
移動すると指定を読めなくなるためです。

[fixture: pie/header/header-space] [fixture: pie/header/header-absent]
[fixture: pie/header/flag-hidden-yaml]
[fixture: pie/header/flag-hidden-directive] [fixture: pie/header/flag-in-title]
[fixture: pie/header/header-global-flag]
[fixture: pie/header/flag-hidden-remove-kept]
[fixture: pie/header/header-hidden-after-flag]
[fixture: pie/header/header-hidden-without-flag]
[fixture: pie/header/header-two-hidden-forms]
[fixture: pie/header/header-spare-visible-lf]

入力（エスケープ表記）: `" \tpie   showData \"Revenue\":8"`

出力
([header/header-space-output.mmd](../tests/fixtures/pie/header/header-space-output.mmd)):

```mmd
pie showData
  "Revenue": 8
```

### Indentation

XY chart の[インデント](./xychart.ja.md#インデント)を再利用します。
通常の文と独立したコメント・ディレクティブを、
ほかの図種と同じく見出しより1段深く置きます。
pie の区分は扇形であり、追加の階層にはしません。
pie では列が構文を決めないため、`tabWidth: 0` の本文は空白0個です。
`useTabs` は幅0でもタブ 1つです。
説明本文以外の値の継続行と隠れた形の閉じは元の列を保ち、
YAML だけは共有の正の最小幅を使います。

[fixture: pie/indentation/indent-default] [fixture: pie/indentation/indent-four]
[fixture: pie/indentation/indent-zero] [fixture: pie/indentation/indent-tabs]
[fixture: pie/indentation/indent-zero-tabs]
[fixture: pie/indentation/indent-two]
[fixture: pie/indentation/indent-four-trivia]

入力（エスケープ表記）:
`"pie\n    \"Zero\":0\n    accTitle: direction LR\n    accDescr {direction TB}"`
({"tabWidth":0})

出力
([indentation/indent-zero-output.mmd](../tests/fixtures/pie/indentation/indent-zero-output.mmd)):

```mmd
pie
"Zero": 0
accTitle: direction LR
accDescr: direction TB
```

### Statements one per line

ほかの図種と同じく、[1 行 1 文](./xychart.ja.md#1-行-1-文)を再利用します。
ただし pie の EOL と保持する原文のまとまりを優先します。
空の説明ブロックも含め、区分と共通文を元の順序で残します。
pie のセミコロンは文の区切りではなく、ラベルや共通値の文字です。
不正に並ぶ文は修復せず、コーパスの失敗経路で扱います。

[fixture: pie/statements-one-per-line/body-lines]
[fixture: pie/statements-one-per-line/semicolon-values]
[fixture: pie/statements-one-per-line/statement-interleaving]

入力（エスケープ表記）:
`"pie \"Line\":2\naccTitle: Data; title Later\n\"Next\":3"`

出力
([statements-one-per-line/body-lines-output.mmd](../tests/fixtures/pie/statements-one-per-line/body-lines-output.mmd)):

```mmd
pie
  "Line": 2
  accTitle: Data; title Later
  "Next": 3
```

### Sections

区分は `"label": value` とし、コロンはラベルに接し、後ろに空白 1 つを置きます。
幅に合わせた整列はしません。
区分のコロンはキーのコロンで、後ろに続くものは前のラベルのただ 1 つの値です。
そのため、空白は Prettier がキーのコロンの隣に印字する形（前に空白なし、
後ろに空白 1 つ）です。
コロンの前に空白を置いて書く
[Mermaid の pie の例](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/pie.md#L68-L73)
とは違う形です。
両方の引用符と空ラベルにも適用します。
ディレクティブのある隙間は、
[ディレクティブ](./flowchart.ja.md#ディレクティブ)のとおりに置きます。
隠れた形は物理的な境界を保持します。
これらは区切りを供給しないためです。

[fixture: pie/sections/section-colon]
[fixture: pie/sections/section-colon-tight-authored]
[fixture: pie/sections/section-gap-directive]
[fixture: pie/sections/section-gap-sides]
[fixture: pie/sections/section-hidden-both-sides]

入力（エスケープ表記）: `"pie\n\"Wide\"\t:   12\n'Narrow':3\n\"\":1"`

出力
([sections/section-colon-output.mmd](../tests/fixtures/pie/sections/section-colon-output.mmd)):

```mmd
pie
  "Wide": 12
  "Narrow": 3
  "": 1
```

### Labels

XY chart の[引用符](./xychart.ja.md#引用符)を再利用します。
原文は著者の選択なので、引用符を含む範囲全体を保ちます。
エスケープは復号せず、空・空白だけのラベル、
実体参照・HTML・隠れた形に見えるパーセントの文字列を残します。
`'` で囲まれた文字列は、内容に `'`、`"`、バックスラッシュ、改行、U+2028、
U+2029、バッククォート、`&`、`#`、`<` がある場合を除き、`"` で囲んで印字します。
（[同じに描かれる綴り](./compatibility.ja.md#同じに描かれる綴り)）。
`singleQuote` は読みません。
変換後に衝突するラベルも別の出現として残します。
解決後の `Map` は原文ではないためです。

[fixture: pie/labels/single-quote-sensitive-kept]
[fixture: pie/labels/label-quotes] [fixture: pie/labels/label-escapes]
[fixture: pie/labels/label-inner-trim-kept]
[fixture: pie/labels/label-quote-one-form]
[fixture: pie/labels/label-hidden-looking] [fixture: pie/labels/div-c4-label]
[fixture: pie/labels/div-c4-eof] [test: pie/labels/div-bare-unicode]
[test: pie/labels/div-retained-bare-unicode]
[fixture: pie/labels/div-html-invalid]
[fixture: pie/labels/label-whitespace-opposite]
[fixture: pie/labels/label-html-entities]
[fixture: pie/labels/label-converted-collisions]
[fixture: pie/labels/label-quote-option]

入力（エスケープ表記）:
`"pie\n' single  label ':3\n\" double  label \":4\n'':2"`

出力
([labels/label-quotes-output.mmd](../tests/fixtures/pie/labels/label-quotes-output.mmd)):

```mmd
pie
  " single  label ": 3
  " double  label ": 4
  "": 2
```

### Numbers

XY chart の[数](./xychart.ja.md#数)を再利用します。
普通の十進表記の `NumericLiteral` は最短の形で印字し、`1.50` は `1.5`、
`2.0` は `2` にします。
（[同じに描かれる綴り](./compatibility.ja.md#同じに描かれる綴り)）。
その他は、変換後の倍精度浮動小数点数ではなく原文の範囲を印字します。
負のゼロ、整数部の先頭のゼロ、長い精度、ゼロや小さい扇形を残します。
桁あふれと符号付きの過小値の丸めはコーパスの受理された読みを使い、
不正な綴りや負の重複値は解析失敗のままです。

[fixture: pie/numbers/shortest-form] [fixture: pie/numbers/forms-kept]
[fixture: pie/numbers/number-spellings]
[fixture: pie/numbers/number-normalize-authored]
[fixture: pie/numbers/number-zero-small] [corpus fixture: pie/number-overflow]
[corpus fixture: pie/review-number-negative-underflow-final]
[corpus fixture: pie/db-duplicate-negative]

入力（エスケープ表記）:
`"pie showData\n\"negative zero\":-0\n\"fraction\":0007.2300\n\"precision\":0.12345678901234567890123456789"`

出力
([numbers/number-spellings-output.mmd](../tests/fixtures/pie/numbers/number-spellings-output.mmd)):

```mmd
pie showData
  "negative zero": -0
  "fraction": 0007.2300
  "precision": 0.12345678901234567890123456789
```

### Title

共通値の同等な外側空白には、[規則 1](./printed-form.ja.md#1-記号の横の空白)が、
キーワードと値の間に空白 1 つを与えます。
Prettier が `return  x` を `return x;` と印字するためです。
`title` の後は空白1つと両端を除いた空でない値にし、
`null`・空・空白だけなら `title` だけにします。
値の中の空白とタブの連なりは、空白 1 つにして印字します。
（[同じに描かれるテキスト中の空白の連なり](./compatibility.ja.md#同じに描かれるテキスト中の空白の連なり)）。
引用符、バックスラッシュ、
重複代入と代わりに使われるフロントマターの値は残します。
固定した文法は次の物理行を title に結合しません。
空行・コメント・ディレクティブを挟んでも次の区分は別文で、
数える版のうち最も古い版が別に読む場合は、下の場合に書きます。
保持する注釈類とセミコロンのまとまりを優先します。
テキストと `%%` のコメントの間の、空白でもタブでもない空白文字（U+000B、U+000C、
改行しない空白、U+1680、U+2000 から U+200A、U+202F、U+205F、U+3000、U+FEFF）は、
その場に残し、その両側の空白とタブは、それぞれ空白 1 つにして印字します。
対象にする版のうち最も古い版が title の一部として描き、
後の版は取り除くからです。
（[対象にする版の mermaid.js のために残す形](./compatibility.ja.md#対象にする版の-mermaidjs-のために残す形)）。
`title T`、改行しない空白、`%% c` は変えず、`title T`、空白 2 つ、
`%% c` は `title T %% c` と印字します。
コメントに接するディレクティブがあっても同じです（`title T`、改行しない空白、
`%%{x}%%`、`%% c` は変えません）。
`%%{` の後ろに、空白を除いて語の文字が続かないもの（`%%{}%%` など）は、
その版が `%%` と同じようにテキストとして読むので、その前の空白も同じに扱います。
`title T`、改行しない空白、`%%{}%%` は変えません。
`title T`、空白 2 つ、`%%{}%%` は `title T %%{}%%` と印字します。
詳しくは
[最も古い版が末尾まで読むアクセシビリティの行](./compatibility.ja.md#最も古い版が末尾まで読むアクセシビリティの行)
を参照してください。
テキストの後のディレクティブの後に空白が続くときは、ほかの図と同じに印字します。
`title    T`、改行しない空白、`%%{x}%%`、空白 2 つ、`%% c` は、`title T`、
その改行しない空白、`%%{x}%% %% c` と印字します。
題のテキストの後にディレクティブだけが続くときは、
それぞれの前に空白かタブがあれば空白 1 つを置き、
最後のディレクティブの後の空白とタブを除いて印字します。
ただし、行のディレクティブのどれかに改行、`;`、U+2028、
U+2029 があるときを除きます。
（[改行かセミコロンを含むディレクティブ](./compatibility.ja.md#改行かセミコロンを含むディレクティブ)）。
（[同じに描かれるキーワードの後のテキスト](./compatibility.ja.md#同じに描かれるキーワードの後のテキスト)）。

[fixture: title/title-directives-end-blanks-dropped]
[fixture: pie/title/title-trim] [fixture: pie/title/title-empty]
[fixture: pie/title/title-next-section] [fixture: pie/title/title-next-trivia]
[fixture: pie/title/title-inner-text]
[fixture: pie/title/empty-value-with-directive]
[fixture: pie/title/title-empty-directive-gap-printed]
[test: a whitespace character that is no space or tab before an empty directive after the title of a pie chart]
[test: a no-break space before a comment after the title of a pie chart]
[test: U+3000 before a comment after the title of a pie chart]
[test: U+2003 before a comment after the title of a pie chart]
[test: spaces and a no-break space before a comment after the title of a pie chart]
[test: a no-break space before a directive and a comment after the title of a pie chart]
[test: two spaces before a comment after the title of a pie chart]
[test: a no-break space at the end of the title of a pie chart]
[test: a whitespace character that is no space or tab before a comment after the title of a pie chart]
[test: a no-break space before a directive and two spaces before a comment after the title of a pie chart]
[test: spaces before the text, a no-break space before a directive and two spaces before a comment after the title of a pie chart]
[test: a no-break space before a directive and a tab before a comment after the title of a pie chart]
[test: a no-break space before two directives and a comment after the title of a pie chart]
[test: a no-break space before a comment after the title of a pie chart, with CRLF line ends]
[test: a no-break space before a comment after the last line of a pie chart, with no line break]

入力（エスケープ表記）: `"pie\ntitle\t   Sales  report  \n\"Sales\":8"`

出力
([title/title-trim-output.mmd](../tests/fixtures/pie/title/title-trim-output.mmd)):

```mmd
pie
  title Sales report
  "Sales": 8
```

数える版のうち最も古い版では、U+2028 か U+2029 でテキストが終わり、
コメントの領域が続く title は、その領域の後の `%%` だけの行を、
テキストの一部として取り込みます。
mermaid.js はコメントの領域を、それを終える改行と一緒に取り除くので、
その後の行は title の行に続きます。
`%%` だけの行はコメント行ではないので残り、
固定した文法はそれをコメントと読みます。
そのような行が続く title は、その `%%` まで書かれたまま印字します。
title を独立した行にして、コメントの領域と `%%` の行を続けると、
その版は違う title を描くためです。
領域の後に空行かディレクティブの行が続くとき、またはテキストが終わるときは、
どの title とも同じく、title と領域を独立した行に移します。
テキストのあるコメント行か、空白だけの行が続くときは、
title と続きを書かれたまま残します。
U+2028 か U+2029 で title が終わらないときは、通常どおり印字します。
どれもこれまでどおりです。

[test: pie/title/title-text-ls-comment-then-whitespace-line-kept]
[test: pie/title/title-text-ls-comment-at-end-moved]
[test: pie/title/title-ignored-semicolon-ls-comment-then-percent-line-kept]
[test: pie/title/title-two-ignored-semicolons-ls-comment-then-percent-line-kept]
[test: pie/title/title-ls-comment-then-percent-line-kept]
[test: pie/title/title-text-ls-comment-then-percent-line-kept]
[test: pie/title/title-ps-comment-then-percent-line-kept]
[test: pie/title/title-ls-spaced-comment-then-percent-line-kept]
[test: pie/title/title-ls-comment-only-then-percent-line-kept]
[test: pie/title/title-ls-comment-then-percent-line-at-end-kept]
[test: pie/title/title-ls-comment-then-blank-line-moved]
[test: pie/title/title-ls-comment-then-directive-line-moved]
[test: pie/title/title-ls-comment-then-comment-line-kept]
[test: pie/title/title-comment-then-percent-line-without-separator]
[test: pie/title/title-text-ls-comment-then-comment-lines-then-percent-line-kept]
[test: pie/title/title-text-ls-comment-then-two-percent-lines-kept]
[test: pie/title/title-text-ls-comment-then-percent-line-crlf-kept]
[test: pie/title/title-text-ls-comment-then-unclosed-directive-line-moved]

### Accessibility lines

C4 の[アクセシビリティの行](./c4.ja.md#アクセシビリティの行)
を同じ理由で再利用します。
外側空白を簡潔にするため、コロンを語に付け、
両端を除いた空でない値の前を空白1つにします。
空なら `accTitle:` または `accDescr:` で終えます。
`accDescr` の値の中の空白とタブの連なりは空白 1 つにして印字します。
（[同じに描かれるテキスト中の空白の連なり](./compatibility.ja.md#同じに描かれるテキスト中の空白の連なり)）。
`accTitle` の連なりは、書かれたまま残します。
ブラウザがツールチップとして表示するうえ、
対象にする版の mermaid.js のうちいくつかが、
`accTitle: A B` を `accTitle: A   B` とは違うテキストで描くからです。
詳しくは
[対象にする版の mermaid.js のために残す形](./compatibility.ja.md#対象にする版の-mermaidjs-のために残す形)
を参照してください。
引用符・行形式の波括弧は文字として残し、
重複代入とパーセントコメントの接続も保ちます。
固定した文法の行形式は物理的な EOL で終わるため、
空行・コメント・ディレクティブを挟んでも次行の値を結合しません。
しかし、対象にする版のうち最も古い版は結合します。
その字句解析器は、
空の `accTitle:` または `accDescr:` の `:` の後の空白に改行も含めます。
mermaid.js が先に取り除く空行・コメント・ディレクティブの後の次の文を、
値として読みます。
その文は書かれたまま残します（`"A":1` を `"A": 1` と印字しません）。
`accTitle` の値の後の `%%` の前の空白も、その版が title の一部として読むので、
書かれたまま残します（`accTitle: Value   %% note`）。
`%%{` の後ろに、空白を除いて語の文字が続かないもの（`%%{}%%` など）も、
その版はテキストとして読むので、
その前の空白は同じに残します（`accTitle: Value   %%{}%%`）。
`accDescr` の値の後の `%%` か、そうした `%%{` の前の、
空白でもタブでもない空白文字（[Title](./pie.ja.md#title)
が挙げる文字）も同じです。
その版が説明の一部として描くので、その場に残します（`accDescr: Value`、
改行しない空白、`%% note`）。
その両側の空白とタブは、それぞれ空白 1 つにして印字します。
値の中にディレクティブがあるときは、ほかの図と同じに印字します。
説明ブロックの `}` の後のコメントは、コロンの形の本文が取り込むので、
ブロックの形を残します。
詳しくは
[最も古い版が末尾まで読むアクセシビリティの行](./compatibility.ja.md#最も古い版が末尾まで読むアクセシビリティの行)
を参照してください。
隠れた形と保持する文字のまとまりの隙間を残します。
値のテキストの後にディレクティブだけが続くときは、
それぞれの前に空白かタブがあれば空白 1 つを置き、
最後のディレクティブの後の空白とタブを除いて印字します。
ただし、行のディレクティブのどれかに改行、`;`、U+2028、
U+2029 があるときを除きます。
（[改行かセミコロンを含むディレクティブ](./compatibility.ja.md#改行かセミコロンを含むディレクティブ)）。
（[同じに描かれるキーワードの後のテキスト](./compatibility.ja.md#同じに描かれるキーワードの後のテキスト)）。

[fixture: accessibility-lines/acc-directives-end-blanks-dropped]
[fixture: accessibility-lines/acc-title-percent-gap-kept]
[fixture: accessibility-lines/acc-value-after-blank-and-directive-kept]
[fixture: accessibility-lines/acc-value-with-value-then-row-split]
[fixture: pie/accessibility-lines/acc-title-empty-directive-gap-kept]
[fixture: pie/accessibility-lines/acc-title-empty-directive-tab-kept]
[fixture: pie/accessibility-lines/acc-title-spaced-directive-gap-kept]
[fixture: pie/accessibility-lines/acc-title-punctuation-directive-gap-kept]
[fixture: pie/accessibility-lines/acc-title-empty-directive-then-comment-gap-kept]
[fixture: pie/accessibility-lines/acc-title-directive-then-empty-directive-gap-kept]
[fixture: pie/accessibility-lines/acc-title-unclosed-empty-directive-gap-kept]
[fixture: pie/accessibility-lines/acc-title-empty-directive-no-final-newline-gap-kept]
[fixture: pie/accessibility-lines/acc-title-spaced-word-directive-gap-printed]
[fixture: pie/accessibility-lines/acc-descr-empty-directive-gap-printed]
[test: a whitespace character that is no space or tab before an empty directive after the accTitle line of a pie chart]
[test: a whitespace character that is no space or tab before an empty directive after the accDescr line of a pie chart]
[fixture: pie/accessibility-lines/a11y-lines]
[fixture: pie/accessibility-lines/a11y-empty]
[fixture: pie/accessibility-lines/a11y-next-section]
[fixture: pie/accessibility-lines/a11y-next-join-kept]
[fixture: pie/accessibility-lines/a11y-colon-braces]
[fixture: pie/accessibility-lines/a11y-percent]
[fixture: pie/accessibility-lines/accessibility-next-trivia]
[fixture: pie/accessibility-lines/accessibility-directive-edges]
[fixture: pie/accessibility-lines/accessibility-inner-tab]
[fixture: pie/accessibility-lines/acc-title-inner-spaces-kept]
[fixture: pie/accessibility-lines/accessibility-only-global-trivia]
[test: a no-break space before a comment after the accDescr line of a pie chart]
[test: U+3000 before a comment after the accDescr line of a pie chart]
[test: two spaces before a comment after the accDescr line of a pie chart]
[test: a no-break space before a comment after the accDescr line of a gitGraph]
[test: U+3000 before a comment after the accDescr line of a gitGraph]
[test: U+2003 before a comment after the accDescr line of a pie chart]
[test: a whitespace character that is no space or tab before a comment after the accDescr line of a pie chart]
[test: a no-break space and spaces before a comment after the accDescr line of a pie chart]
[test: a no-break space before a directive and two spaces before a comment after the accDescr line of a pie chart]
[test: a no-break space before a comment after the accDescr line, with no line break at the end of a pie chart]

`accTitle:` と `accDescr:` の行も同じです。
U+2028 か U+2029 で値が終わり、コメントの領域が続き、
その後に `%%` だけの行がある行は、その `%%` まで書かれたまま印字します。
数える版のうち最も古い版が、`%%` の行を、描画に出る値に取り込むためです。
領域の後に空行かディレクティブの行が続くとき、またはテキストが終わるときは、
これまでどおり、その行と領域を独立した行に移します。

[test: pie/accessibility-lines/accdescr-ps-directive-comment-at-end-moved]
[test: pie/accessibility-lines/acctitle-ls-comment-then-percent-line-kept]
[test: pie/accessibility-lines/acctitle-ps-comment-then-percent-line-kept]
[test: pie/accessibility-lines/acctitle-ls-comment-then-percent-line-at-end-kept]
[test: pie/accessibility-lines/acctitle-ls-comment-then-comment-lines-then-percent-line-kept]
[test: pie/accessibility-lines/acctitle-ls-comment-then-two-percent-lines-kept]
[test: pie/accessibility-lines/acctitle-ls-comment-then-percent-line-crlf-kept]
[test: pie/accessibility-lines/acctitle-ls-comment-then-blank-line-moved]
[test: pie/accessibility-lines/acctitle-ls-comment-then-unclosed-directive-line-moved]
[test: pie/accessibility-lines/accdescr-ls-comment-then-percent-line-kept]
[test: pie/accessibility-lines/accdescr-ps-comment-then-percent-line-kept]
[test: pie/accessibility-lines/accdescr-ls-comment-then-percent-line-at-end-kept]
[test: pie/accessibility-lines/accdescr-ls-comment-then-comment-lines-then-percent-line-kept]
[test: pie/accessibility-lines/accdescr-ls-comment-then-two-percent-lines-kept]
[test: pie/accessibility-lines/accdescr-ls-comment-then-percent-line-crlf-kept]
[test: pie/accessibility-lines/accdescr-ls-comment-then-blank-line-moved]
[test: pie/accessibility-lines/accdescr-ls-comment-then-unclosed-directive-line-moved]

入力（エスケープ表記）:
`"pie\naccTitle \t:   Title  words \t\naccDescr\t:  Description  text  \n\"Line\":1"`

出力
([accessibility-lines/a11y-lines-output.mmd](../tests/fixtures/pie/accessibility-lines/a11y-lines-output.mmd)):

```mmd
pie
  accTitle: Title  words
  accDescr: Description text
  "Line": 1
```

### Description blocks

1 行の説明ブロックは、
[1 行の説明ブロック](./compatibility.ja.md#1-行の説明ブロック) に従います。
波括弧を残すブロックは、
flowchart の[複数行の値](./flowchart.ja.md#複数行の値)と、
sequence の[複数行の値](./sequence.ja.md#複数行の値)を再利用します。
どちらも、ブロックの行を文の 1 段内側に置きます。
説明の Db では LF 後の字下げが取り除かれるためです。
通常の隙間では、接して書かれていても語と開き括弧の間に空白 1 つを置きます。
保護対象の注釈類やセミコロンの配置では、その隙間を保ちます。
開き括弧の前が空白だけなら改行や Unicode の境界も結合できます。
コメント・ディレクティブの改行は残します。
`accDescr`、`%% c`、`{D}` を別行に置く形を残すのは、
`accDescr %% c` と `{D}` を別行に置くと、
mermaid.js が拒否するためです（詳しくは
[対象にする版の mermaid.js のために残す形](./compatibility.ja.md#対象にする版の-mermaidjs-のために残す形)
を参照してください）。
空白だけの内部は囲む値がないため `{}` にします。
コメントだけなら1段内側に置き、別行の閉じを文の列に揃えます。
`accDescr {%% c` の次行が `}` または `D}` のブロックで、
`{` の後の `%% c` を説明のテキストとしてその位置に残すのは、
`%% c` をブロックの 1 段内側の独立した行へ移し、
後者では `D` と `}` も別行に置くと、mermaid.js が `%% c` をコメントとして読み、
説明がそれぞれ空または `D` だけになるためです（詳しくは
[対象にする版の mermaid.js のために残す形](./compatibility.ja.md#対象にする版の-mermaidjs-のために残す形)
を参照してください）。
ほかの図種と同じく、通常の後続本文と独立したコメント行は、
文より1段内側に揃えます。
改行と内部の空行は保ちます。
行末の空白は、テキストの最後の行のものを除いて保ちます。
空白だけの行は空行にします。
最後のテキスト行の行末の空白は、閉じ括弧が自分の行にあるときは落とし、
同じ行で閉じ括弧が続くときは空白 1 つで印字します。
ディレクティブと共有の除去対象となるコメント領域は原文全体を保ちます。
別行の `}` は文の列です。
注釈類のある内部は残します。
引用符・バックスラッシュ・隠れた形に見える文字列でも最初の `}` が閉じます。

[fixture: pie/description-blocks/block-runs]
[fixture: pie/description-blocks/block-empty]
[fixture: pie/description-blocks/block-columns]
[fixture: pie/description-blocks/block-opener-newline]
[fixture: pie/description-blocks/block-comment-only]
[fixture: pie/description-blocks/block-directive-only]
[fixture: pie/description-blocks/block-inner-runs-collapsed]
[fixture: pie/description-blocks/block-opener-trivia]
[fixture: pie/description-blocks/block-asymmetric]
[fixture: pie/description-blocks/block-inline-leading-lines]
[fixture: pie/description-blocks/block-first-brace]
[fixture: pie/description-blocks/block-keyword-tab]
[fixture: pie/description-blocks/block-mixed-trivia]
[fixture: pie/description-blocks/block-trailing-comment]
[fixture: pie/description-blocks/block-opener-directive]
[fixture: pie/description-blocks/block-quotes-backslashes]
[fixture: pie/description-blocks/opener-comment-only-kept]
[fixture: pie/description-blocks/opener-comment-with-text-kept]
[fixture: pie/description-blocks/opener-comment-break-kept]
[fixture: description-blocks/block-trailing-whitespace]
[fixture: description-blocks/block-trailing-whitespace-closer-on-the-text-line]

入力（エスケープ表記）:
`"pie\naccDescr {\n  first\n    second\n        }\n\"Data\":2"`

出力
([description-blocks/block-columns-output.mmd](../tests/fixtures/pie/description-blocks/block-columns-output.mmd)):

```mmd
pie
  accDescr {
    first
    second
  }
  "Data": 2
```

### Hidden yaml

YAML ブロックの `PieIgnoredText` は、
ヘッダー・本文・区分の隙間・`textAfter` の元の位置で、
注釈類を除いた値ではなく範囲全体を保ちます。
隠れた形式を元の位置で保持する規則は、
仕様の字句規則にこれらの形式を持つ図種に共通です。
pie はこれを適用する最初の印字処理です。
pie の隠れた規則はノード外の直後の LF を消費し、
閉じ境界の空白が必要な EOL を残す場合があります。
EOF も含む閉じの空白を保ちます。
範囲外の必須 LF と端の空行は [空行](#blank-lines) に従います。
不正・空・入れ子に見える内容、内部の注釈類、複数の形を保持します。
直前へ改行を加えません。
これらの編集は、いずれも Mermaid の受理を変えるためです。
形の前に改行を加える、または形を別の行へ移すと、
形が消費していた LF が文の途中の見える LF になります。
形を削ると、消費されていた LF が現れます。
閉じの空白を削ると、形が次の文に必要な LF を消費し、その文が拒否されます。
隠れた YAML の閉じ囲み記号は先頭列に置きます。
先頭列にあるときだけ閉じとなり、字下げした閉じ囲み記号は拒否されます。
通常の開きの前の空白は縮められ、本文の開きには字下げできます。
内部と先頭列の閉じは元の列です。
すでに始まった文字列・title・ブロックを優先します。

本文の先頭・途中の単独の形、字下げされた形、ヘッダー・`showData` の後、
EOF の形でも、閉じの空白を保持します。
隠れた YAML と隠れたディレクティブに同じ境界の規則を適用します。
形間や同じ行の次の文の前でも、閉じの空白を保ちます。

[fixture: pie/hidden-yaml/yaml-section-gaps]
[fixture: pie/hidden-yaml/yaml-body]
[fixture: pie/hidden-yaml/yaml-move-gap-kept]
[fixture: pie/hidden-yaml/yaml-after-space-boundary]
[fixture: pie/hidden-yaml/yaml-extra-eol] [fixture: pie/hidden-yaml/yaml-eof]
[fixture: pie/hidden-yaml/yaml-two-in-gap]
[fixture: pie/hidden-yaml/yaml-closer-indent-kept]
[fixture: pie/hidden-yaml/yaml-in-line-value]
[fixture: pie/hidden-yaml/yaml-global-trivia]
[fixture: pie/hidden-yaml/yaml-empty-body]
[fixture: pie/hidden-yaml/yaml-padding]
[fixture: pie/hidden-yaml/yaml-qualifying-later-closer]
[fixture: pie/hidden-yaml/yaml-after-block]
[fixture: pie/hidden-yaml/yaml-selected-content]
[fixture: pie/hidden-yaml/yaml-followed-trivia]
[fixture: pie/hidden-yaml/body-closing-padding]
[fixture: pie/hidden-yaml/first-body-closing-padding]
[fixture: pie/hidden-yaml/indented-body-spare-lf]
[fixture: pie/hidden-yaml/header-closing-padding]
[fixture: pie/hidden-yaml/flag-closing-padding]
[fixture: pie/hidden-yaml/header-eof-closing-padding]
[fixture: pie/hidden-yaml/body-eof-closing-padding]
[fixture: pie/hidden-yaml/flag-eof-closing-padding]
[fixture: pie/hidden-yaml/inline-section-padding]
[fixture: pie/hidden-yaml/inline-two-forms-padding]
[fixture: pie/hidden-yaml/closing-line-comment-padding]

入力（エスケープ表記）:
`"pie\n\"Yaml\"---\nnot: [yaml\n---\n:---\nignored\n---\n7"`

出力
([hidden-yaml/yaml-section-gaps-output.mmd](../tests/fixtures/pie/hidden-yaml/yaml-section-gaps-output.mmd)):

```mmd
pie
  "Yaml"---
not: [yaml
---
:---
ignored
---
7
```

### Hidden directives

ディレクティブの `PieIgnoredText` にも [隠れた YAML](#hidden-yaml)と同じ、
共有する範囲・境界の理由を適用します。
`Root` のディレクティブとは別です。
空・句読点だけ・複数行の形、コロン・数値・指定前の隙間、内部の大域的な注釈類、
5種類の文の `textAfter` を保持します。
数字に接する不適格な閉じは実際のコメントとなるか、
後の閉じまで続く場合があります。
境界を加えず、この分類を保持します。
そのような `}%%` の後に空白を加えると、
Mermaid が読むコメントが隠れたトークンに変わるためです。
文字列とブロックは先に適用します。
次の文がある場合の閉じの空白と余分な LF は重要です。
EOF の閉じた形には共有の最後の LF を加えられます。

[fixture: pie/hidden-directives/hidden-number-gap]
[fixture: pie/hidden-directives/hidden-before-colon]
[fixture: pie/hidden-directives/hidden-after-space]
[fixture: pie/hidden-directives/hidden-after-extra-lf]
[fixture: pie/hidden-directives/hidden-after-title]
[fixture: pie/hidden-directives/hidden-after-block]
[fixture: pie/hidden-directives/hidden-eof]
[fixture: pie/hidden-directives/hidden-fallback]
[fixture: pie/hidden-directives/hidden-accdescr-line]
[fixture: pie/hidden-directives/hidden-acctitle-line]
[fixture: pie/hidden-directives/hidden-title-eof]
[fixture: pie/hidden-directives/hidden-description-eof]
[fixture: pie/hidden-directives/hidden-block-eof]
[fixture: pie/hidden-directives/hidden-multiline]
[fixture: pie/hidden-directives/hidden-global-trivia]
[fixture: pie/hidden-directives/hidden-body-standalone]
[fixture: pie/hidden-directives/hidden-later-closer]
[fixture: pie/hidden-directives/hidden-comment-cuts]
[fixture: pie/hidden-directives/hidden-split-opener]
[fixture: pie/hidden-directives/hidden-split-closer]
[fixture: pie/hidden-directives/hidden-boundary-comment]
[fixture: pie/hidden-directives/hidden-followed-trivia]
[fixture: pie/hidden-directives/body-closing-padding]
[fixture: pie/hidden-directives/first-body-closing-padding]
[fixture: pie/hidden-directives/indented-body-spare-lf]
[fixture: pie/hidden-directives/header-closing-padding]
[fixture: pie/hidden-directives/flag-closing-padding]
[fixture: pie/hidden-directives/header-eof-closing-padding]
[fixture: pie/hidden-directives/body-eof-closing-padding]
[fixture: pie/hidden-directives/flag-eof-closing-padding]
[fixture: pie/hidden-directives/inline-section-padding]
[fixture: pie/hidden-directives/inline-two-forms-padding]
[fixture: pie/hidden-directives/closing-line-comment-padding]

入力（エスケープ表記）: `"pie\n\"Hidden\":%%{}%%\n7"`

出力
([hidden-directives/hidden-number-gap-output.mmd](../tests/fixtures/pie/hidden-directives/hidden-number-gap-output.mmd)):

```mmd
pie
  "Hidden":%%{}%%
7
```

### Comments

著者の接続と文字を保つため、
共有の[コメント](./flowchart.ja.md#コメント)を再利用します。
同一行のコメントは、接していれば接したまま、
空白とタブの連なりがあれば空白 1 つにします。
独立したコメントは本文の文に揃え、見出し前は先頭列に置きます。
規則 1 は、コメントの前の印を挙げていないので、
[規則 2](./printed-form.ja.md#2-prettier-にない種類の隙間)が決めます。
[sequence](./sequence.ja.md#コメント)、[journey](./journey.ja.md#コメント)、
[timeline](./timeline.ja.md#コメント)も、
文の後ろのコメントを同じように印字します。
ほかの規則が空白を書かれたまま残す所は別です。
どの図の文書も、その所を、
自分の節か [文字の直後のコメント](./compatibility.ja.md#文字の直後のコメント)
で挙げています（Db が持つ空白、たとえば `section` と期間の後の空白と、
mermaid.js の読みを変える空白です）。
コメントの前の空白が例外になるのは、
`accTitle` の値の後ろの `%%` と `%%{}%%` です。
数える版のうち最も古い版が、その空白をタイトルの一部として読むためです。
詳しくは [アクセシビリティの行](#accessibility-lines) を参照してください。
裸・3つのパーセントと末尾の空白を残します。
pie 固有のコメントは LF で終わり、LS・PS は内部に残ります。
LS・PS は区切りではなく、
そこで終えると行の残りが文として現れて Db が変わるためです。
文字列とブロック内のパーセントは内容で、共通の行形式の値はその直前で終わります。
共通の削除領域は飲み込んだ範囲と結合後の継続列を保ちます。
継続行を字下げし直すと、結合したラベルに空白が加わるためです。
保持する前置きは通常の整列より優先します。

[fixture: pie/comments/comments-align] [fixture: pie/comments/comment-bare]
[fixture: pie/comments/inline-gap-run-before-comment]
[fixture: pie/comments/comment-value-text]
[test: pie/comments/comment-region-join]
[fixture: pie/comments/comment-section-move-attachment]
[fixture: pie/comments/comments-block-attachments]
[fixture: pie/comments/comments-final-triple]

入力（エスケープ表記）:
`"pie\n\"percent %% label\":3\naccDescr {a%% text}\naccTitle: a%% real comment"`

出力
([comments/comment-value-text-output.mmd](../tests/fixtures/pie/comments/comment-value-text-output.mmd)):

```mmd
pie
  "percent %% label": 3
  accDescr { a%% text }
  accTitle: a%% real comment
```

[fixture: pie/blank-lines/hidden-comment-whitespace]

### Directives and semicolons

[ディレクティブ](./flowchart.ja.md#ディレクティブ)を再利用します。
共通の削除は区切りを供給せず、セミコロンの選択は原文の区間を読むためです。
単位の間の位置、複数行の内部、EOF までの末尾を保持します。
同じ印字行の中のディレクティブは、
[ディレクティブ](./flowchart.ja.md#ディレクティブ)のとおりに置きます。
元は同じ行にあった単位を別の行へ分けるときは、
間のディレクティブを次の単位に付けます。
右側の接触・分離は保ち、左側の接触は切れます。
規則 1 は、2 つの単位の間のディレクティブの印を挙げていないので、
[規則 2](./printed-form.ja.md#2-prettier-にない種類の隙間)が決めます。
[sequence](./sequence.ja.md#ディレクティブ)、
[flowchart](./flowchart.ja.md#ディレクティブ)、
[journey](./journey.ja.md#ディレクティブ)も、この隙間を同じに印字します。
保つ `;` を含む区間は、行の規則が無視する `;` が整形で変わる所を除き、
ほかの場所と同じように整形します。
この規則は、[セミコロン](./flowchart.ja.md#セミコロン)のとおり、
`style` か `classDef` の後の最初の `:` から、
最後の保つ `;` の前の最後の `#` までに空白がない並びを読みます。
その範囲の隙間と余白は空白の有無を保ち、空白の連続は空白 1 つにします。
範囲の外は、この図種の通常の規則に従います。
どの部分の配置も持たないテキストは、書かれたまま残します。
たとえば `accDescr {style:#x;y}` を `accDescr {style: #x;y}` にすると、
mermaid.js が描く説明のテキストが変わります（詳しくは
[対象にする版の mermaid.js のために残す形](./compatibility.ja.md#対象にする版の-mermaidjs-のために残す形)
を参照してください）。
複数行にわたる文の行を空白 1 つか何も挟まずにつなぐと、
行の規則が無視する `;` が変わりうる場合は、各区間の頭から最後の保つ `;` までを、
書かれたまま残します。
それ以外の複数行の文は、1 行の文と同じように整形します。

[fixture: directives-and-semicolons/stretch-kept-rest-formatted]
[fixture: directives-and-semicolons/no-stretch-formatted]
[fixture: pie/directives-and-semicolons/block-style-colon-gap-kept]

保護したヘッダーと本文を分割しません。
全セミコロン、style/classDef の両段階、
大小文字とコロン-ハッシュ記号の空白の区別、Unicode の区間境界、
ディレクティブが再結合する条件を満たす語、コメント内のセミコロンを残します。
語・数値の内部の切断は指定の解析失敗です。

[fixture: pie/directives-and-semicolons/native-label-value]

[fixture: pie/directives-and-semicolons/global-header-first-statement]

[fixture: pie/directives-and-semicolons/global-align]
[fixture: pie/directives-and-semicolons/global-touch]
[fixture: pie/directives-and-semicolons/global-value]
[fixture: pie/directives-and-semicolons/global-colon-brace]
[fixture: pie/directives-and-semicolons/global-multiline]
[fixture: pie/directives-and-semicolons/selected-labels]
[fixture: pie/directives-and-semicolons/selected-delete-kept]
[fixture: pie/directives-and-semicolons/selected-common]
[fixture: pie/directives-and-semicolons/selected-two-passes]
[fixture: pie/directives-and-semicolons/selected-nontriggers]
[fixture: pie/directives-and-semicolons/selected-header-group]
[fixture: pie/directives-and-semicolons/selected-comment-tail]
[test: pie/directives-and-semicolons/selected-ls-segments]
[fixture: pie/directives-and-semicolons/global-joined-trigger]
[fixture: pie/directives-and-semicolons/global-header-first-statement]
[fixture: pie/directives-and-semicolons/global-gap-sides]
[fixture: pie/directives-and-semicolons/global-value-boundaries]
[fixture: pie/directives-and-semicolons/selected-one-three-padding]
[fixture: pie/directives-and-semicolons/selected-comment-semicolon]
[fixture: pie/directives-and-semicolons/semicolon-header-gap]

入力（エスケープ表記）: `"pie title style:#a;b"`

出力
([directives-and-semicolons/selected-header-group-output.mmd](../tests/fixtures/pie/directives-and-semicolons/selected-header-group-output.mmd)):

```mmd
pie title style:#a;b
```

### Blank lines

見えるまとまりを保つため、共有の[空行](./flowchart.ja.md#空行)を再利用します。
通常の ASCII の空行の連続は1行にし、文書・本文の端の通常の空行は除きます。
値・ディレクティブ・無視された部分の内部、
共通領域の結合と前置き全体は元の空行を保ちます。
変えると原文の役割や YAML の意味が変わり得るためです。
隠れた形が LF を消費した後は、次の文に必要なときだけ予備の LF 1 つを保ちます。
文書の終わりは設定の終端改行1つにし、見出しの直後の空行は削除します。
見出しと最初の文の間に EOL は必要ありません。
それ以外は予備の LF の後に通常の空行の規則を適用し、連続空行を1行、
空白だけの行を空行にします。
予備の LF は文法の要件で、それ以降はコメントの後と同じ作者の区切りです。
Unicode だけの不正な本文行はコーパスの解析失敗です。

隠れた形の境界やセミコロンの保護で文が見出しの行に残っても、
その文の後置隠れた形の後は文と文の間として扱います。

[fixture: pie/blank-lines/hidden-following-blanks]

[fixture: pie/blank-lines/header-statement-hidden]

[fixture: pie/blank-lines/header-statement-semicolon]

[fixture: pie/blank-lines/hidden-document-end]

[fixture: pie/blank-lines/hidden-eof-whitespace-line]

[fixture: pie/blank-lines/hidden-body-end]

[fixture: pie/blank-lines/hidden-header-blanks]

[fixture: pie/blank-lines/hidden-comment-whitespace]

[fixture: pie/blank-lines/blank-runs] [fixture: pie/blank-lines/blank-trivia]
[fixture: pie/blank-lines/blank-literal]
[fixture: pie/blank-lines/blank-hidden-body]
[fixture: pie/blank-lines/blank-directive-content]

入力（エスケープ表記）: `"\npie\n\n\n\"First\":2\n \t\n\n\"Second\":3\n\n"`

出力
([blank-lines/blank-runs-output.mmd](../tests/fixtures/pie/blank-lines/blank-runs-output.mmd)):

```mmd
pie
  "First": 2

  "Second": 3
```

### Trailing whitespace

C4 の[末尾空白](./c4.ja.md#末尾空白)を再利用し、
見出し・数値・完了したブロック後の無害な ASCII 空白を除きます。
共通の行形式の両端はタイトルとアクセシビリティの行に従います。
ラベル行・コメント・ディレクティブと、
無視された部分の内部・共通領域の継続・セミコロンの保護範囲は残します。
隠れた形の閉じ境界の空白はノード外でも EOL を保つ場合があるため、
EOF も含め残します。

[fixture: pie/trailing-whitespace/trailing-exterior]
[fixture: pie/trailing-whitespace/trailing-values]
[fixture: pie/trailing-whitespace/trailing-label-trim-kept]
[fixture: pie/trailing-whitespace/trailing-hidden-eof]
[fixture: pie/trailing-whitespace/trailing-protected-prefix]

セミコロンがあるだけでは行の値の末尾空白を保護しません。
共有のセミコロン前置部分の規則が、保持する原文を決めます。

[fixture: pie/trailing-whitespace/line-semicolons]
[fixture: pie/trailing-whitespace/line-selected-semicolons]
[fixture: pie/trailing-whitespace/line-without-semicolons]
[fixture: pie/trailing-whitespace/header-line-semicolon]

入力（エスケープ表記）: `"pie showData \t\n\"Data\" : 2 \t\naccDescr {a} \t"`

出力
([trailing-whitespace/trailing-exterior-output.mmd](../tests/fixtures/pie/trailing-whitespace/trailing-exterior-output.mmd)):

```mmd
pie showData
  "Data": 2
  accDescr: a
```

### Multiline values and order

flowchart の [複数行の値](./flowchart.ja.md#複数行の値) と共有の
[折り返し](./flowchart.ja.md#折り返し) を再利用します。
原文は著者の選択で、幅によらず同じ配置にするためです。
ラベルの物理行、継続列、内部の空行を保持します。
説明本文は [説明ブロック](#description-blocks) に従います。
`printWidth` で長い文を折り返さず、区分の部品も別行にしません。
挿入順、変換後に重なるラベル、プロトタイプ・数値に見えるキー、
共通文の重複・空代入、ゼロや小さい扇形を残します。
解決した `Map` から組み直すと出現を失うか最初の値が変わるためです。

[fixture: pie/multiline-values-and-order/multiline-label]
[fixture: pie/multiline-values-and-order/no-wrap]
[fixture: pie/multiline-values-and-order/order-duplicates]
[fixture: pie/multiline-values-and-order/order-sort-kept]
[fixture: pie/multiline-values-and-order/order-converted-prototype]
[fixture: pie/multiline-values-and-order/order-common-resets]

入力（エスケープ表記）:
`"pie\n\"10\":3\n\"2\":4\n\"__proto__\":5\n\"constructor\":6\n'10':8\n\"a\\n\":1\n\"a\n\":7"`

出力
([multiline-values-and-order/order-converted-prototype-output.mmd](../tests/fixtures/pie/multiline-values-and-order/order-converted-prototype-output.mmd)):

```mmd
pie
  "10": 3
  "2": 4
  "__proto__": 5
  "constructor": 6
  "10": 8
  "a\n": 1
  "a
": 7
```

### Line terminators and unicode

共有の[行末](./compatibility.ja.md#行末)と
[バイト順マーク](./compatibility.ja.md#バイト順マーク)を再利用します。
Prettier は印字前に CR・CRLF を正規化し、後から `endOfLine` を適用します。
ラベル・ブロック・隠れた形の消費する LF も Mermaid の読みを保ちます。
LS・PS・NBSP・BOM は値・コメント・無視された部分のモードに従って残します。
LS・PS は pie の区切りではなく、文字列、共通値、コメント、
無視された部分の内部では内容で、構造上の位置では不正なので、
そこで分割しても置換してもいけません。
分割すると Db が変わります。
保護範囲外の共通値は、
両端の [仕様で定義する共通の空白](../../spec/docs/common.ja.md#表記)
を除きます。

[corpus fixture: pie/review-common-all-whitespace-trim]

空白だけのブロックの開きの隙間は結合します。
通常のコロンの隙間は ASCII です。
図固有のコロンの隙間は ASCII の空白だけで、そこの NBSP は拒否されます。
不正な構造上の Unicode は拒否のままです。
先頭の BOM は Prettier が処理するため、バイトの同一性は約束しません。

[test: pie/line-terminators-and-unicode/eol-cr]
[test: pie/line-terminators-and-unicode/eol-crlf-hidden]
[test: pie/line-terminators-and-unicode/eol-output-cr]
[test: pie/line-terminators-and-unicode/eol-output-crlf]
[test: pie/line-terminators-and-unicode/unicode-values]
[test: pie/line-terminators-and-unicode/unicode-comments]
[test: pie/line-terminators-and-unicode/unicode-comment-split-kept]
[test: pie/line-terminators-and-unicode/unicode-opener]
[test: pie/line-terminators-and-unicode/unicode-block-empty]
[test: pie/line-terminators-and-unicode/unicode-line-trim]
[test: pie/line-terminators-and-unicode/bom-header]
[test: pie/line-terminators-and-unicode/unicode-label-boundaries]
[test: pie/line-terminators-and-unicode/unicode-ignored-bodies]
[test: pie/line-terminators-and-unicode/unicode-block-value-edges]
[test: pie/line-terminators-and-unicode/unicode-line-edges-and-internal]
[test: pie/line-terminators-and-unicode/eol-yaml-cr]
[test: pie/line-terminators-and-unicode/eol-block-crlf]
[test: pie/line-terminators-and-unicode/unicode-preheader-comment]
[test: pie/line-terminators-and-unicode/unicode-comment-region-common]
[test: pie/line-terminators-and-unicode/div-unicode-preheader-nbsp-hidden]
[test: pie/line-terminators-and-unicode/title-leading-ls]
[test: pie/line-terminators-and-unicode/title-leading-ps]
[test: pie/line-terminators-and-unicode/acctitle-leading-ls]
[test: pie/line-terminators-and-unicode/acctitle-leading-ps]
[test: pie/line-terminators-and-unicode/accdescr-leading-ls]
[test: pie/line-terminators-and-unicode/accdescr-leading-ps]
[test: pie/line-terminators-and-unicode/line-values-only-unicode]

入力（エスケープ表記）:
`"pie\n\"x\u2028y\u2029z\":2\ntitle x\u2028y\naccTitle: x\u2029y\naccDescr {x\u2028y}"`

出力（エスケープ表記）:
`"pie\n  \"x\u2028y\u2029z\": 2\n  title x\u2028y\n  accTitle: x\u2029y\n  accDescr {x\u2028y}\n"`

### Frontmatter yaml

[フロントマターの YAML](./flowchart.ja.md#フロントマターの-yaml)を再利用します。
実際の先頭の YAML だけが title/configuration を与えるためです。
安全な YAML は整え、区切りの空白を残し、
不正・字下げ付き・HTML の危険・区切りを生成する内部は原文を保ちます。
YAML の字下げは幅0でも最低1文字です。
隠れた形式を含む前置きを保持する規則は、
仕様の字句規則がヘッダーより前にこれらの形式を保持する図種に共通です。
pie はこれを適用する最初の印字処理です。
先頭 LF、コメントの列、2回目の走査の形、裸の行の注釈類、囲み記号の順序も含め、
前置き全体を保持します。
削除・移動すると無効だった YAML が実際のフロントマターになるためです。
`PieIgnoredText` を YAML 整形処理へ渡しません。
原文と埋め込まれた効果を別々に確認します。

[fixture: pie/frontmatter-yaml/frontmatter-safe]
[fixture: pie/frontmatter-yaml/frontmatter-invalid]
[fixture: pie/frontmatter-yaml/frontmatter-zero]
[fixture: pie/frontmatter-yaml/frontmatter-indent]
[fixture: pie/frontmatter-yaml/frontmatter-html-guard]
[fixture: pie/frontmatter-yaml/preheader-retained]
[fixture: pie/frontmatter-yaml/preheader-leading-lf]
[fixture: pie/frontmatter-yaml/preheader-second-scan]
[fixture: pie/frontmatter-yaml/frontmatter-delimiter-guard]
[fixture: pie/frontmatter-yaml/frontmatter-closing-padding]
[fixture: pie/frontmatter-yaml/frontmatter-less-than-safe]
[fixture: pie/frontmatter-yaml/preheader-malformed-yaml]
[fixture: pie/frontmatter-yaml/preheader-directive-before-yaml]
[fixture: pie/frontmatter-yaml/preheader-real-and-hidden]
[fixture: pie/frontmatter-yaml/preheader-leading-comments]

入力（エスケープ表記）: `"\n---\ntitle: Hidden\n---\npie\n\"Leading\":2"`

出力
([frontmatter-yaml/preheader-leading-lf-output.mmd](../tests/fixtures/pie/frontmatter-yaml/preheader-leading-lf-output.mmd)):

```mmd

---
title: Hidden
---
pie
  "Leading": 2
```

### Specified readings

共有の
[mermaid.js と違って読む入力](./compatibility.ja.md#mermaidjs-と違って読む入力)
を再利用します。
受理した木は仕様の読みで整形し、解析失敗は単独ファイルで構文エラー、
Markdown では埋め込みを辞退します。
既知の差異の印があるコーパス入力には、仕様が定める受理と Db の読みを使います。
素の mermaid.js の拒否には素の mermaid.js の Db がありません。
不正な不透明 YAML は受理した効果を捏造せず、原文と木を確認します。
隠れた形・空ラベル・空ブロックに別の差異を加えません。
正常な前置部分後の失敗もコーパスで扱います。

[corpus fixture: pie/div-directive-number]
[corpus fixture: pie/div-atomic-semicolon-number]
[corpus fixture: pie/div-review-frontmatter-html-cross-label]
[corpus fixture: pie/div-review-yaml-leading-invalid]
[corpus fixture: pie/div-detect-c4-label]
[corpus fixture: pie/div-preheader-retained-yaml-bare-ls]
[corpus fixture: pie/recover-lexer-after-parser]

例えば、
入力 `"pie\n\"Atom\":1%%{init: {}}%%2"` は単独ファイルでは構文エラーです。
出力を修復せず、Markdown では埋め込み先に委ねます。

### Final newline

終端を揃えるため、共有の[末尾の改行](./c4.ja.md#末尾の改行)を再利用します。
通常の受理したファイルは指定の改行1つで終えます。
見出しだけ、区分、閉じたブロック、空の共通値、裸・3つのパーセントコメント、
閉じた隠れた形も同じ経路です。
EOF まで続く大域的なディレクティブと隠れた形の閉じの空白は残します。
閉じた隠れたトークンが追加の LF を消費しても EOF で EOL を満たせます。
通常の末尾空行は除き、保護した隠れた形・前置きの境界は残します。
最後の LF が素の mermaid.js の C4 判定を変えても、
指定の pie の読みは変わりません。

[fixture: pie/final-newline/final-newline]
[fixture: pie/final-newline/final-bare]
[fixture: pie/final-newline/final-global-open]
[fixture: pie/final-newline/final-hidden-space]
[fixture: pie/final-newline/markdown-top-payload]
[fixture: pie/final-newline/markdown-nested-payload]
[fixture: pie/final-newline/markdown-final-hidden-limit]
[fixture: pie/final-newline/final-section-without-lf]
[fixture: pie/final-newline/final-block]
[fixture: pie/final-newline/final-common-empty]
[corpus fixture: pie/header-only] [corpus fixture: pie/acctitle-eof]

入力（エスケープ表記）: `"pie\n\"End\":2\n\n\n"`

出力
([final-newline/final-newline-output.mmd](../tests/fixtures/pie/final-newline/final-newline-output.mmd)):

```mmd
pie
  "End": 2
```

### Markdown fences

共有の
[Markdown のコードブロック](./compatibility.ja.md#markdown-のコードブロック)
を再利用します。
埋め込み先の字下げを除いた図の本文に pie の規則を適用し、
リスト・引用・囲み記号の字下げは Markdown が与えます。
固定した先頭・リスト・引用の埋め込み先で、複数行の値、幅0・タブ、
隠れた形の隙間と境界、保持する前置き、実際の YAML、
セミコロンとディレクティブのまとまりを確認します。
埋め込み先は辞退した図の本文も最後のコードブロック行の空白を削り、
改行を制御します。
後続の文に EOL が不要なら最後の隠れた形の境界の空白が消える場合があります。
内部の隠れた形の境界を削る許可にはなりません。
埋め込み先の出力と冪等性を、図の本文の Db・木・原文とは別に確認します。

[test: pie Markdown: top-level] [test: pie Markdown: list]
[test: pie Markdown: quote] [test: pie Markdown: zero]
[test: pie Markdown: tabs] [test: pie Markdown: hidden-gap]
[test: pie Markdown: hidden-boundary] [test: pie Markdown: preheader]
[test: pie Markdown: frontmatter] [test: pie Markdown: global-and-semicolons]
[test: pie Markdown: final-comment] [test: pie Markdown: final-hidden-padding]
[test: pie Markdown: rejected]

入力（エスケープ表記）: `"```mermaid\npie showData \"Fence\":2\n```\n"`

出力（エスケープ表記）: `"```mermaid\npie showData\n  \"Fence\": 2\n```\n"`
