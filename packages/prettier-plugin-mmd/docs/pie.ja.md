# Pie の整形規則

英語版: [pie.md](./pie.md)

決定した21項目を定めます。
原文の木を使い、実行時に Mermaid を呼ばず、出力を再解析しません。
不可視文字の例はテストの escape で表します。

## Rules

### Header

[XY chart の header/body 配置](./xychart.ja.md#header-and-orientation)を
再利用します。
見出しを揃えるため、正確な小文字の `pie` を先頭列に置き、書かれた `showData`
の前を空白1つにします。
通常の同一行の最初の文は次行へ移します。
flag 前の hidden form と消費される改行は保持します。
移動すると flag を読めなくなるためです。

固定例: [fixture: pie/header/header-space]
[fixture: pie/header/header-absent] [fixture: pie/header/flag-hidden-yaml]
[fixture: pie/header/flag-hidden-directive]
[fixture: pie/header/flag-in-title] [fixture: pie/header/header-global-flag]
[fixture: pie/header/flag-hidden-remove-kept]
[fixture: pie/header/header-hidden-after-flag]
[fixture: pie/header/header-hidden-without-flag]
[fixture: pie/header/header-two-hidden-forms]
[fixture: pie/header/header-spare-visible-lf].

入力（escape 表記）: `" \tpie   showData \"Revenue\":8"`.

出力
([header/header-space-output.mmd](../tests/fixtures/pie/header/header-space-output.mmd)):

```mmd
pie showData
  "Revenue" : 8
```

### Indentation

[XY chart の字下げ](./xychart.ja.md#indentation)を再利用します。
構造を読みやすくするため、通常の文と独立したコメント・directive を
見出しより1段深く置きます。
pie の区分は slice であり、追加の階層にはしません。
pie では列が構文を決めないため、`tabWidth: 0` の本文は空白0個です。
`useTabs` は幅0でも tab 1つです。
値の継続行と hidden の閉じは元の列を保ち、YAML だけは共有の最小幅を使います。

固定例: [fixture: pie/indentation/indent-default]
[fixture: pie/indentation/indent-four] [fixture: pie/indentation/indent-zero]
[fixture: pie/indentation/indent-tabs]
[fixture: pie/indentation/indent-zero-tabs]
[fixture: pie/indentation/indent-two]
[fixture: pie/indentation/indent-four-trivia].

入力（escape 表記）:
`"pie\n    \"Zero\":0\n    accTitle: direction LR\n    accDescr {direction TB}"`
({"tabWidth":0}).

出力
([indentation/indent-zero-output.mmd](../tests/fixtures/pie/indentation/indent-zero-output.mmd)):

```mmd
pie
"Zero" : 0
accTitle: direction LR
accDescr {direction TB}
```

### Statements one per line

読みやすさのため、[1行1文](./xychart.ja.md#statements-one-per-line)を
再利用します。
ただし pie の EOL と保持する source group を優先します。
空の説明ブロックも含め、区分と共通文を元の順序で残します。
pie のセミコロンは文の区切りではなく、ラベルや共通値の文字です。
不正に並ぶ文は修復せず、corpus の失敗経路で扱います。

固定例: [fixture: pie/statements-one-per-line/body-lines]
[fixture: pie/statements-one-per-line/semicolon-values]
[fixture: pie/statements-one-per-line/statement-interleaving].

入力（escape 表記）:
`"pie \"Line\":2\naccTitle: Data; title Later\n\"Next\":3"`.

出力
([statements-one-per-line/body-lines-output.mmd](../tests/fixtures/pie/statements-one-per-line/body-lines-output.mmd)):

```mmd
pie
  "Line" : 2
  accTitle: Data; title Later
  "Next" : 3
```

### Sections

区分は `"label" : value` とし、コロンの両側を空白1つにします。
幅に合わせた整列はしません。
pie 固有の選択であり、
[Mermaid の pie の例](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/pie.md#L64-L69)
の綴りに従います。
両方の引用符と空ラベルにも適用します。
directive のある gap は各側の接触の有無を保持し、hidden form は物理的な境界も
保持します。
これらは区切りを供給しないためです。

固定例: [fixture: pie/sections/section-colon]
[fixture: pie/sections/section-colon-tight-authored]
[fixture: pie/sections/section-gap-directive]
[fixture: pie/sections/section-gap-sides]
[fixture: pie/sections/section-hidden-both-sides].

入力（escape 表記）: `"pie\n\"Wide\"\t:   12\n'Narrow':3\n\"\":1"`.

出力
([sections/section-colon-output.mmd](../tests/fixtures/pie/sections/section-colon-output.mmd)):

```mmd
pie
  "Wide" : 12
  'Narrow' : 3
  "" : 1
```

### Labels

[XY chart の文字列保持](./xychart.ja.md#quotes)を再利用します。
引用符と原文は著者の選択なので、引用符を含む範囲全体を保ちます。
引用符の種類、逆側の引用符、escape の綴り、空・空白だけのラベル、
entity・HTML・hidden に見える percent の文字列を残します。
`singleQuote` でも書き換えません。
変換後に衝突するラベルも別の出現として残します。
解決後の Map は原文ではないためです。

固定例: [fixture: pie/labels/label-quotes]
[fixture: pie/labels/label-escapes]
[fixture: pie/labels/label-inner-trim-kept]
[fixture: pie/labels/label-quote-authored]
[fixture: pie/labels/label-hidden-looking] [fixture: pie/labels/div-c4-label]
[fixture: pie/labels/div-c4-eof] [test: pie/labels/div-bare-unicode]
[test: pie/labels/div-retained-bare-unicode]
[fixture: pie/labels/div-html-invalid]
[fixture: pie/labels/label-whitespace-opposite]
[fixture: pie/labels/label-html-entities]
[fixture: pie/labels/label-converted-collisions]
[fixture: pie/labels/label-quote-option].

入力（escape 表記）: `"pie\n' single  label ':3\n\" double  label \":4\n'':2"`.

出力
([labels/label-quotes-output.mmd](../tests/fixtures/pie/labels/label-quotes-output.mmd)):

```mmd
pie
  ' single  label ' : 3
  " double  label " : 4
  '' : 2
```

### Numbers

[XY chart の数値保持](./xychart.ja.md#numbers)を再利用します。
変換後の double ではなく NumericLiteral の原文を印字します。
負のゼロ、小数の先頭ゼロ、末尾ゼロ、長い精度、ゼロや小さい slice を残します。
overflow と符号付き underflow は
corpus の受理された読みを使い、不正な綴りや負の重複値は解析失敗のままです。

固定例: [fixture: pie/numbers/number-spellings]
[fixture: pie/numbers/number-normalize-authored]
[fixture: pie/numbers/number-zero-small].

[corpus fixture: pie/number-overflow]
[corpus fixture: pie/review-number-negative-underflow-final]
[corpus fixture: pie/db-duplicate-negative]

入力（escape 表記）:
`"pie showData\n\"negative zero\":-0\n\"fraction\":0007.2300\n\"precision\":0.12345678901234567890123456789"`.

出力
([numbers/number-spellings-output.mmd](../tests/fixtures/pie/numbers/number-spellings-output.mmd)):

```mmd
pie showData
  "negative zero" : -0
  "fraction" : 0007.2300
  "precision" : 0.12345678901234567890123456789
```

### Title

[C4 の accessibility 行](./c4.ja.md#accessibility-lines)と同じ理由で、
共通値の同等な外側空白を1つの形にします。
`title`
の後は空白1つと両端を除いた空でない値にし、null・空・空白だけなら `title`
だけにします。
内部の語、tab、引用符、backslash、重複代入と frontmatter への
fallback は残します。
pie は次の物理行を title に結合しません。
空行・コメント・directive を挟んでも次の区分は別文です。
保持する trivia とセミコロンの group を優先します。

固定例: [fixture: pie/title/title-trim] [fixture: pie/title/title-empty]
[fixture: pie/title/title-next-section]
[fixture: pie/title/title-next-trivia] [fixture: pie/title/title-inner-text].

入力（escape 表記）: `"pie\ntitle\t   Sales  report  \n\"Sales\":8"`.

出力
([title/title-trim-output.mmd](../tests/fixtures/pie/title/title-trim-output.mmd)):

```mmd
pie
  title Sales  report
  "Sales" : 8
```

### Accessibility lines

[C4 の accessibility 行](./c4.ja.md#accessibility-lines)を同じ理由で
再利用します。
外側空白を簡潔にするため、コロンを語に付け、両端を除いた空でない値の前を
空白1つにします。
空なら `accTitle:` または `accDescr:` で終えます。
内部の tab・引用符・行形式の波括弧は文字として残し、重複代入と
percent コメントの接続も保ちます。
pie の行形式は物理的な EOL で終わるため、空行・コメント・directive を挟んでも
次行の値を結合しません。
hidden form と保持する文字 group の gap を残します。

固定例: [fixture: pie/accessibility-lines/a11y-lines]
[fixture: pie/accessibility-lines/a11y-empty]
[fixture: pie/accessibility-lines/a11y-next-section]
[fixture: pie/accessibility-lines/a11y-next-join-kept]
[fixture: pie/accessibility-lines/a11y-colon-braces]
[fixture: pie/accessibility-lines/a11y-percent]
[fixture: pie/accessibility-lines/accessibility-next-trivia]
[fixture: pie/accessibility-lines/accessibility-directive-edges]
[fixture: pie/accessibility-lines/accessibility-inner-tab]
[fixture: pie/accessibility-lines/accessibility-only-global-trivia].

入力（escape 表記）:
`"pie\naccTitle \t:   Title  words \t\naccDescr\t:  Description  text  \n\"Line\":1"`.

出力
([accessibility-lines/a11y-lines-output.mmd](../tests/fixtures/pie/accessibility-lines/a11y-lines-output.mmd)):

```mmd
pie
  accTitle: Title  words
  accDescr: Description  text
  "Line" : 1
```

### Description blocks

[flowchart の複数行の値](./flowchart.ja.md#multi-line-values)を同じ理由で
再利用します。
値の列を常に一貫して保つためです。
語と開き括弧、内部の接した側は接したまま、空白の連なりは1つにします。
開き括弧の前が空白だけなら改行や Unicode の境界も結合できます。
コメント・directive の改行は残します。
空白だけの内部は囲む値がないため `{}` にします。
コメントだけなら1段内側に置き、別行の閉じを文の列に揃えます。
後続行から始まる値は内部のコメント行も含め、列と空行を保ちます。
別行の `}` は文の列です。
trivia のある内部は残します。
引用符・backslash・hidden に見える文字列でも最初の `}` が閉じます。

固定例: [fixture: pie/description-blocks/block-runs]
[fixture: pie/description-blocks/block-empty]
[fixture: pie/description-blocks/block-columns]
[fixture: pie/description-blocks/block-opener-newline]
[fixture: pie/description-blocks/block-comment-only]
[fixture: pie/description-blocks/block-directive-only]
[fixture: pie/description-blocks/block-inner-collapse-kept]
[fixture: pie/description-blocks/block-opener-trivia]
[fixture: pie/description-blocks/block-asymmetric]
[fixture: pie/description-blocks/block-inline-leading-lines]
[fixture: pie/description-blocks/block-first-brace]
[fixture: pie/description-blocks/block-keyword-tab]
[fixture: pie/description-blocks/block-mixed-trivia]
[fixture: pie/description-blocks/block-trailing-comment]
[fixture: pie/description-blocks/block-opener-directive]
[fixture: pie/description-blocks/block-quotes-backslashes].

入力（escape 表記）:
`"pie\naccDescr {\n  first\n    second\n        }\n\"Data\":2"`.

出力
([description-blocks/block-columns-output.mmd](../tests/fixtures/pie/description-blocks/block-columns-output.mmd)):

```mmd
pie
  accDescr {
  first
    second
  }
  "Data" : 2
```

### Hidden yaml

yaml-block の PieIgnoredText は header・本文・区分の
gap・textAfter の元の位置で、trivia を除いた値ではなく範囲全体を保ちます。
隠れた形式を元の位置で保持する規則は、
仕様の字句規則にこれらの形式を持つ図種に共通です。
pie はこれを適用する最初の printer です。
pie の hidden 規則は node 外の直後の
LF を消費し、閉じ境界の空白が必要な EOL を残す場合があります。
EOF も含む閉じの空白を保ちます。
範囲外の必須 LF と端の空行は [Blank lines](#blank-lines) に従います。
不正・空・入れ子に見える内容、内部の trivia、複数の form を保持します。
直前へ改行を加えません。
通常の開きの前の空白は縮められ、本文の開きには字下げできます。
内部と先頭列の閉じは元の列です。
すでに始まった文字列・title・block を優先します。

本文の先頭・途中の単独の form、字下げされた form、header・showData の後、
EOF の form でも、閉じの空白を保持します。
hidden YAML と hidden directive に同じ境界の規則を適用します。
form 間や同じ行の次の文の前でも、閉じの空白を保ちます。

固定例: [fixture: pie/hidden-yaml/yaml-section-gaps]
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
[fixture: pie/hidden-yaml/yaml-followed-trivia].

[fixture: pie/hidden-yaml/body-closing-padding]
[fixture: pie/hidden-yaml/first-body-closing-padding]
[fixture: pie/hidden-yaml/indented-body-spare-lf]
[fixture: pie/hidden-yaml/header-closing-padding]
[fixture: pie/hidden-yaml/flag-closing-padding]
[fixture: pie/hidden-yaml/header-eof-closing-padding]
[fixture: pie/hidden-yaml/body-eof-closing-padding]
[fixture: pie/hidden-yaml/flag-eof-closing-padding]
[fixture: pie/hidden-yaml/inline-section-padding]
[fixture: pie/hidden-yaml/inline-two-forms-padding].

[fixture: pie/hidden-yaml/closing-line-comment-padding].

入力（escape 表記）:
`"pie\n\"Yaml\"---\nnot: [yaml\n---\n:---\nignored\n---\n7"`.

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

directive の PieIgnoredText にも
[Hidden yaml](#hidden-yaml)と同じ、共有する範囲・境界の理由を適用します。
Root の directive とは別です。
空・句読点だけ・複数行の form、コロン・数値・flag 前の gap、内部の
global trivia、5種類の文の textAfter を保持します。
数字に接する不適格な閉じは実際のコメントとなるか、後の閉じまで続く場合が
あります。
境界を加えず、この分類を保持します。
文字列と block は先に適用します。
次の文がある場合の閉じの空白と余分な LF は重要です。
EOF の閉じた form には共有の最後の LF を加えられます。

固定例: [fixture: pie/hidden-directives/hidden-number-gap]
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
[fixture: pie/hidden-directives/hidden-followed-trivia].

[fixture: pie/hidden-directives/body-closing-padding]
[fixture: pie/hidden-directives/first-body-closing-padding]
[fixture: pie/hidden-directives/indented-body-spare-lf]
[fixture: pie/hidden-directives/header-closing-padding]
[fixture: pie/hidden-directives/flag-closing-padding]
[fixture: pie/hidden-directives/header-eof-closing-padding]
[fixture: pie/hidden-directives/body-eof-closing-padding]
[fixture: pie/hidden-directives/flag-eof-closing-padding]
[fixture: pie/hidden-directives/inline-section-padding]
[fixture: pie/hidden-directives/inline-two-forms-padding].

[fixture: pie/hidden-directives/closing-line-comment-padding].

入力（escape 表記）: `"pie\n\"Hidden\":%%{}%%\n7"`.

出力
([hidden-directives/hidden-number-gap-output.mmd](../tests/fixtures/pie/hidden-directives/hidden-number-gap-output.mmd)):

```mmd
pie
  "Hidden" :%%{}%%
7
```

### Comments

著者の接続と文字を保つため、[共有のコメント配置](./flowchart.ja.md#comments)を
再利用します。
同一行の接したコメントは接したまま、離れていれば空白1つにします。
独立したコメントは本文の文に揃え、見出し前は先頭列に置きます。
裸・3つの percent と末尾の空白を残します。
pie 固有のコメントは LF で終わり、LS・PS は内部に残ります。
文字列と block 内の percent は内容で、共通の行形式の値はその直前で終わります。
共通の削除領域は飲み込んだ範囲と結合後の継続列を保ちます。
保持する前置きは通常の整列より優先します。

固定例: [fixture: pie/comments/comments-align]
[fixture: pie/comments/comment-bare]
[fixture: pie/comments/comment-value-text]
[test: pie/comments/comment-region-join]
[fixture: pie/comments/comment-section-move-attachment]
[fixture: pie/comments/comments-block-attachments]
[fixture: pie/comments/comments-final-triple].

入力（escape 表記）:
`"pie\n\"percent %% label\":3\naccDescr {a%% text}\naccTitle: a%% real comment"`.

出力
([comments/comment-value-text-output.mmd](../tests/fixtures/pie/comments/comment-value-text-output.mmd)):

```mmd
pie
  "percent %% label" : 3
  accDescr {a%% text}
  accTitle: a%% real comment
```

[fixture: pie/blank-lines/hidden-comment-whitespace]

### Directives and semicolons

[global directive の不透明性](./flowchart.ja.md#directives)と
[C4 のセミコロン保護](./c4.ja.md#line-rule-and-semicolons)を再利用します。
共通の削除は区切りを供給せず、セミコロンの選択は原文の区間を読むためです。
位置、両側の接触の有無、複数行の内部、EOF までの末尾を保持します。
最初の空白以外の文字から最後のセミコロンまでを保護し、
交差する値・コメント・directive の全体まで広げます。
保護した header/body を分割しません。
全セミコロン、style/classDef の両段階、大小文字と
colon-hash の空白の区別、Unicode の区間境界、directive が再結合する trigger、
コメント内のセミコロンを残します。
安全な外側と後続の gap だけ整えます。
語・数値の内部の切断は指定の解析失敗です。

固定例: [fixture: pie/directives-and-semicolons/global-align]
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
[fixture: pie/directives-and-semicolons/global-gap-side-presence]
[fixture: pie/directives-and-semicolons/global-value-boundaries]
[fixture: pie/directives-and-semicolons/selected-one-three-padding]
[fixture: pie/directives-and-semicolons/selected-comment-semicolon]
[fixture: pie/directives-and-semicolons/semicolon-header-gap].

入力（escape 表記）: `"pie title style:#a;b"`.

出力
([directives-and-semicolons/selected-header-group-output.mmd](../tests/fixtures/pie/directives-and-semicolons/selected-header-group-output.mmd)):

```mmd
pie title style:#a;b
```

### Blank lines

見えるまとまりを保つため、[共有の空行の規則](./flowchart.ja.md#blank-lines)を
再利用します。
通常の ASCII の空行の連続は1行にし、文書・本文の端の通常の空行は除きます。
値・directive・ignored の内部、共通領域の結合と前置き全体は元の空行を保ちます。
変えると原文の役割や YAML の意味が変わり得るためです。
hidden form が LF を消費した後は、
次の文に必要なときだけ予備の LF 1 つを保ちます。
文書の終わりは設定の終端改行1つにし、見出しの直後の空行は削除します。
見出しと最初の文の間に EOL は必要ありません。
それ以外は予備の LF の後に通常の空行の規則を適用し、
連続空行を1行、空白だけの行を空行にします。
予備の LF は文法の要件で、それ以降はコメントの後と同じ作者の区切りです。
Unicode だけの不正な本文行は corpus の解析失敗です。

hidden の境界や semicolon の保護で文が見出しの行に残っても、
その文の後置 hidden form の後は文と文の間として扱います。

[fixture: pie/blank-lines/hidden-following-blanks]

[fixture: pie/blank-lines/header-statement-hidden]

[fixture: pie/blank-lines/header-statement-semicolon]

[fixture: pie/blank-lines/hidden-document-end]

[fixture: pie/blank-lines/hidden-body-end]

[fixture: pie/blank-lines/hidden-header-blanks]

[fixture: pie/blank-lines/hidden-comment-whitespace]

固定例: [fixture: pie/blank-lines/blank-runs]
[fixture: pie/blank-lines/blank-trivia]
[fixture: pie/blank-lines/blank-literal]
[fixture: pie/blank-lines/blank-hidden-body]
[fixture: pie/blank-lines/blank-directive-content].

入力（escape 表記）: `"\npie\n\n\n\"First\":2\n \t\n\n\"Second\":3\n\n"`.

出力
([blank-lines/blank-runs-output.mmd](../tests/fixtures/pie/blank-lines/blank-runs-output.mmd)):

```mmd
pie
  "First" : 2

  "Second" : 3
```

### Trailing whitespace

[C4 の外側の整理](./c4.ja.md#trailing-whitespace)を再利用し、
見出し・数値・完了した block 後の無害な ASCII 空白を除きます。
共通の行形式の両端は Title と Accessibility lines に従います。
ラベル行・コメント・directive と
ignored の内部・共通領域の継続・セミコロンの保護範囲は残します。
hidden の閉じ境界の空白は node 外でも
EOL を保つ場合があるため、EOF も含め残します。

固定例: [fixture: pie/trailing-whitespace/trailing-exterior]
[fixture: pie/trailing-whitespace/trailing-values]
[fixture: pie/trailing-whitespace/trailing-label-trim-kept]
[fixture: pie/trailing-whitespace/trailing-hidden-eof]
[fixture: pie/trailing-whitespace/trailing-protected-prefix].

セミコロンがあるだけでは行の値の末尾空白を保護しません。
共有のセミコロン prefix の規則が、保持する原文を決めます。
[fixture: pie/trailing-whitespace/line-semicolons]
[fixture: pie/trailing-whitespace/line-selected-semicolons]
[fixture: pie/trailing-whitespace/line-without-semicolons]
[fixture: pie/trailing-whitespace/header-line-semicolon].

入力（escape 表記）: `"pie showData \t\n\"Data\" : 2 \t\naccDescr {a} \t"`.

出力
([trailing-whitespace/trailing-exterior-output.mmd](../tests/fixtures/pie/trailing-whitespace/trailing-exterior-output.mmd)):

```mmd
pie showData
  "Data" : 2
  accDescr {a}
```

### Multiline values and order

[flowchart の値の列](./flowchart.ja.md#multi-line-values)と
[共有の折り返さない規則](./flowchart.ja.md#line-wrapping)を再利用します。
原文は著者の選択で、幅によらず同じ配置にするためです。
ラベルと block の物理行、継続列、内部の空行を保持します。
printWidth で長い文を折り返さず、区分の部品も別行にしません。
挿入順、変換後に重なるラベル、prototype・数値に見える key、共通文の
重複・空代入、ゼロや小さい slice を残します。
解決した Map から組み直すと出現を失うか最初の値が変わるためです。

固定例: [fixture: pie/multiline-values-and-order/multiline-label]
[fixture: pie/multiline-values-and-order/no-wrap]
[fixture: pie/multiline-values-and-order/order-duplicates]
[fixture: pie/multiline-values-and-order/order-sort-kept]
[fixture: pie/multiline-values-and-order/order-converted-prototype]
[fixture: pie/multiline-values-and-order/order-common-resets].

入力（escape 表記）:
`"pie\n\"10\":3\n\"2\":4\n\"__proto__\":5\n\"constructor\":6\n'10':8\n\"a\\n\":1\n\"a\n\":7"`.

出力
([multiline-values-and-order/order-converted-prototype-output.mmd](../tests/fixtures/pie/multiline-values-and-order/order-converted-prototype-output.mmd)):

```mmd
pie
  "10" : 3
  "2" : 4
  "__proto__" : 5
  "constructor" : 6
  '10' : 8
  "a\n" : 1
  "a
" : 7
```

### Line terminators and unicode

[共有の改行](./compatibility.ja.md#line-endings)と
[BOM の host 処理](./compatibility.ja.md#byte-order-mark)を再利用します。
Prettier は印字前に CR・CRLF を正規化し、後から endOfLine を適用します。
ラベル・block・hidden の消費する LF も Mermaid の読みを保ちます。
LS・PS・NBSP・BOM は値・コメント・ignored のモードに従って残します。
保護範囲外の共通値は、両端の
[仕様で定義する共通の空白](../../spec/docs/common.ja.md#表記)
を除きます。[corpus fixture: pie/review-common-all-whitespace-trim]
空白だけの block の開きの gap は結合します。
通常の colon の gap は ASCII です。
不正な構造上の Unicode は拒否のままです。
先頭の BOM は Prettier が処理するため、byte の同一性は約束しません。

固定例: [test: pie/line-terminators-and-unicode/eol-cr]
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
[test: pie/line-terminators-and-unicode/div-unicode-preheader-nbsp-hidden].

[test: pie/line-terminators-and-unicode/title-leading-ls]
[test: pie/line-terminators-and-unicode/title-leading-ps]
[test: pie/line-terminators-and-unicode/acctitle-leading-ls]
[test: pie/line-terminators-and-unicode/acctitle-leading-ps]
[test: pie/line-terminators-and-unicode/accdescr-leading-ls]
[test: pie/line-terminators-and-unicode/accdescr-leading-ps]
[test: pie/line-terminators-and-unicode/line-values-only-unicode].

入力（escape 表記）:
`"pie\n\"x\u2028y\u2029z\":2\ntitle x\u2028y\naccTitle: x\u2029y\naccDescr {x\u2028y}"`.

出力（escape 表記）:
`"pie\n  \"x\u2028y\u2029z\" : 2\n  title x\u2028y\n  accTitle: x\u2029y\n  accDescr {x\u2028y}\n"`.

### Frontmatter yaml

[保護した frontmatter](./flowchart.ja.md#frontmatter-yaml)を再利用します。
実際の先頭の YAML だけが title/configuration を与えるためです。
安全な YAML は整え、区切りの空白を残し、不正・字下げ付き・HTML の
危険・区切りを生成する内部は原文を保ちます。
YAML の字下げは幅0でも最低1文字です。
隠れた形式を含む前置きを保持する規則は、
仕様の字句規則がヘッダーより前にこれらの形式を保持する図種に共通です。
pie はこれを適用する最初の printer です。
先頭 LF、コメントの列、2回目の走査の form、裸の行の trivia、
fence の順序も含め、前置き全体を保持します。
削除・移動すると無効だった YAML が実際の frontmatter になるためです。
PieIgnoredText を YAML formatter へ渡しません。
原文と embedded effect を別々に確認します。

固定例: [fixture: pie/frontmatter-yaml/frontmatter-safe]
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
[fixture: pie/frontmatter-yaml/preheader-leading-comments].

入力（escape 表記）: `"\n---\ntitle: Hidden\n---\npie\n\"Leading\":2"`.

出力
([frontmatter-yaml/preheader-leading-lf-output.mmd](../tests/fixtures/pie/frontmatter-yaml/preheader-leading-lf-output.mmd)):

```mmd

---
title: Hidden
---
pie
  "Leading" : 2
```

### Specified readings

[共有の失敗方針](./compatibility.ja.md#inputs-read-differently-from-mermaidjs)
を再利用します。
受理した木は仕様の読みで整形し、解析失敗は単独ファイルで構文エラー、Markdown
では埋め込みを辞退します。
既知の差異の印がある corpus 入力には、仕様が定める受理と Db の読みを使います。
raw の拒否には raw Db がありません。
不正な opaque YAML は受理した effect を捏造せず、原文と木を確認します。
hidden form・空ラベル・空 block に別の差異を加えません。
正常な prefix 後の失敗も corpus で扱います。

[corpus fixture: pie/div-directive-number]
[corpus fixture: pie/div-atomic-semicolon-number]
[corpus fixture: pie/div-review-frontmatter-html-cross-label]
[corpus fixture: pie/div-review-yaml-leading-invalid]
[corpus fixture: pie/div-detect-c4-label]
[corpus fixture: pie/div-preheader-retained-yaml-bare-ls]
[corpus fixture: pie/recover-lexer-after-parser]

例えば、入力 `"pie\n\"Atom\":1%%{init: {}}%%2"`
は単独ファイルでは構文エラーです。
出力を修復せず、Markdown では host に委ねます。

### Final newline

終端を揃えるため、[共有の末尾改行](./c4.ja.md#final-newline)を再利用します。
通常の受理したファイルは指定の改行1つで終えます。
見出しだけ、区分、閉じた block、空の共通値、裸・3つの
percent コメント、閉じた hidden form も同じ経路です。
EOF まで続く global directive と hidden の閉じの空白は残します。
閉じた hidden token が追加の LF を消費しても EOF で EOL を満たせます。
通常の末尾空行は除き、保護した hidden・前置きの境界は残します。
最後の LF が raw の C4 判定を変えても、指定の pie の読みは変わりません。

固定例: [fixture: pie/final-newline/final-newline]
[fixture: pie/final-newline/final-bare]
[fixture: pie/final-newline/final-global-open]
[fixture: pie/final-newline/final-hidden-space]
[fixture: pie/final-newline/markdown-top-payload]
[fixture: pie/final-newline/markdown-nested-payload]
[fixture: pie/final-newline/markdown-final-hidden-limit]
[fixture: pie/final-newline/final-section-without-lf]
[fixture: pie/final-newline/final-block]
[fixture: pie/final-newline/final-common-empty].

[corpus fixture: pie/header-only] [corpus fixture: pie/acctitle-eof]

入力（escape 表記）: `"pie\n\"End\":2\n\n\n"`.

出力
([final-newline/final-newline-output.mmd](../tests/fixtures/pie/final-newline/final-newline-output.mmd)):

```mmd
pie
  "End" : 2
```

### Markdown fences

[共有の Markdown の統合](./compatibility.ja.md#markdown-code-blocks)を
再利用します。
host の字下げを除いた payload に
pie の規則を適用し、リスト・引用・fence の字下げは Markdown が与えます。
固定した先頭・リスト・引用の host で、複数行の値、幅0・tab、hidden の
gap と境界、保持する前置き、実際の YAML、セミコロンと directive の
group を確認します。
host は辞退した payload も最後の code block 行の空白を削り、改行を制御します。
後続の文に EOL が不要なら最後の hidden 境界の空白が消える場合があります。
内部の hidden 境界を削る許可にはなりません。
host の出力と冪等性を、payload の Db・木・原文とは別に確認します。

[test: pie Markdown: top-level] [test: pie Markdown: list]
[test: pie Markdown: quote] [test: pie Markdown: zero]
[test: pie Markdown: tabs] [test: pie Markdown: hidden-gap]
[test: pie Markdown: hidden-boundary] [test: pie Markdown: preheader]
[test: pie Markdown: frontmatter] [test: pie Markdown: global-and-semicolons]
[test: pie Markdown: final-comment]
[test: pie Markdown: final-hidden-padding] [test: pie Markdown: rejected]

入力（escape 表記）: `"```mermaid\npie showData \"Fence\":2\n```\n"`.

出力（escape 表記）: `"```mermaid\npie showData\n  \"Fence\" : 2\n```\n"`.
