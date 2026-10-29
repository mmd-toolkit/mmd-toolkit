# Venn の整形規則

英語版: [venn.md](./venn.md)

`venn-beta` を整形する規則です。
[Venn の構文](../../spec/docs/diagrams/venn.ja.md)と
[木](../../spec/docs/ast/venn.ja.md)に従います。
mermaid.js の読み方を保ち、 Db が同じ複数の形から選ぶ場合は理由を示します。

以下の語を使います。

- **宣言**は `set` か `union` の文です。
  **名前の一覧**は宣言の集合か text・style の対象です。
- **明示の text** は対象を書きます（`text A item`）。
  **暗黙の text** は `targets: null`（`  text item`）で、
  **モード**が有効な間は最後の宣言を使います。
  正の字下げは構文を選び、入れ子は表しません。
- **値**は書かれた名前、id、ラベル、サイズ、style の値、title です。
  **外側の空白**は値、コメントとディレクティブの外にあります。
- **ディレクティブ**は `%%{ ... }%%` で、図を読む前に除かれます。
  **単独のコメント**は行を占め、 **後続コメント**は同じ行のテキストに続きます。
  **図コメント**は Venn の読み手が扱い、共通コメント領域は先に除かれます。
  **飲み込まれる断片**は直前のコード単位で、 `VennIgnoredText` に記録されます。
- **行**は CR・CRLF の正規化後の LF で終わります。
  **行規則の区間**は共通のセミコロンの規則が読む範囲です。
  ディレクティブの外の改行、U+2028、U+2029 で終わり、
  ディレクティブと除去済みの共通コメント領域を除いて読みます。
  図コメント内の区切りも区間を終えます。
  正確な大小文字の `style` か `classDef`、コロン、
  空白を挟まない後のハッシュと後のセミコロンが、
  区間の最後のセミコロンを除去対象にできます。
  [共通の規則](../../spec/docs/common.ja.md#style-行と-classdef-行)
  を参照してください。
- **保護する範囲**（**保持部分**）はプリンターが保つ接頭部です。
  最後のセミコロンまでと、端にかかる値、コメント、
  ディレクティブの全体を含みます。
  複数の行規則の区間にまたがることがあります。
  図コメントを Unicode 区切りで切ると、内容が図の構文として現れたり、
  行規則が選ぶセミコロンが変わったりするためです。

入出力の例は固定の整形フィクスチャへリンクします。
エスケープ表記の `\n` は LF、`\r` は CR、`\t` はタブ、
`\u2028` と `\u2029` は Unicode 区切りを表します。
図内のバックスラッシュではありません。
[文書と fixture](./development.ja.md#文書と-fixture)を参照してください。

## 規則

### Header

正確な `venn-beta` ヘッダーを1列目に置き、図の始まりを見つけやすくします。
通常のヘッダー行の文は本文の行へ移し、接する断片、ディレクティブ、
保持部分の関係は保ちます。 [corpus fixture: venn/header-before-comment]
[corpus fixture: venn/header-before-directive]
[corpus fixture: venn/header-before-frontmatter-comment]
[corpus fixture: venn/header-statement-tab]
[fixture: venn/header/header-comment-fragment]
[corpus fixture: venn/db-form-set] [fixture: venn/header/header-inline]
[fixture: venn/header/header]
[fixture: venn/header/header-leading-inline-directive]
[corpus fixture: venn/header-only-lf] [corpus fixture: venn/header-only]
[fixture: venn/header/header-semicolon-prefix]
[fixture: venn/header/header-title]
[fixture: venn/header/header-trailing-comment]

入力（escape 表記）:

```json
"venn-beta set A"
```

出力
([header/header-inline-output.mmd](../tests/fixtures/venn/header/header-inline-output.mmd)):

```mmd
venn-beta
set A
```

仕様の
[`c4-keyword-anywhere`](../../spec/docs/known-divergences/c4-keyword-anywhere.ja.md)
の乖離では、名前や値の C4 の語は Venn の振り分けを変えません。
受理するこれらの入力は Venn の整形規則に従います。
[corpus fixture: venn/div-c4-bare-identifier]
[fixture: venn/header/div-c4-detector]

入力（escape 表記）:

```json
"venn-beta\nset \"C4Container\""
```

出力
([header/div-c4-detector-output.mmd](../tests/fixtures/venn/header/div-c4-detector-output.mmd)):

```mmd
venn-beta
set "C4Container"
```

### Indentation

空白の設定の1段は `tabWidth: 0` でも1文字以上にします。
`useTabs` はタブのままです。
整形で Db を変えてはならず、 1文字が字下げの読みを保つ最小の幅だからです。
正の印が必要なのは暗黙の text だけで、通常の文は1列目のままです。
[fixture: venn/indentation/tab-width-0]
[fixture: venn/indentation/tab-width-0-leading-directive]
[fixture: venn/indentation/tab-width-0-kept]
[fixture: venn/indentation/tab-width-0-kept-leading-directive]
[fixture: venn/indentation/tab-width-0-internal-marker]
[fixture: venn/indentation/tab-width-0-use-tabs]

通常の set、union、style、title と対象つき text は1列目に置きます。
暗黙の text だけを設定の1段で字下げします（`tabWidth`、`useTabs`）。
モードが有効な間は正の字下げが暗黙の構文を選び、入れ子は表しません。
対象つき text を字下げすると読み方が変わることがあります。
宣言がモードを有効にし、後の通常の行頭の文が解除し、次の宣言が再び有効にします。
[corpus fixture: venn/db-form-indent-id-label]
[corpus fixture: venn/db-form-indent-number]
[corpus fixture: venn/db-form-indent-string]
[corpus fixture: venn/db-form-indent-string-label]
[corpus fixture: venn/db-indent-after-header-set]
[corpus fixture: venn/db-indent-after-indented-set]
[corpus fixture: venn/db-indent-after-indented-union]
[corpus fixture: venn/db-indent-after-union]
[fixture: venn/indentation/explicit-indent-unsafe]
[corpus fixture: venn/db-indent-id-eof] [fixture: venn/indentation/indent-four]
[fixture: venn/indentation/indent-tabs] [fixture: venn/indentation/indent-width]
[fixture: venn/indentation/leading-directives-positive]
[fixture: venn/indentation/leading-directives-zero]
[fixture: venn/indentation/marker-kept-prefix]
[fixture: venn/indentation/mode-end-explicit]
[fixture: venn/indentation/mode-end-style]
[fixture: venn/indentation/mode-end-title]
[corpus fixture: venn/db-form-text-id]
[fixture: venn/indentation/mode-no-current]
[fixture: venn/indentation/mode-reenabled]
[fixture: venn/indentation/union-positive-widths]

入力（escape 表記）:

```json
"venn-beta\n    set A\n         text one\n text two"
```

出力
([indentation/indent-width-output.mmd](../tests/fixtures/venn/indentation/indent-width-output.mmd)):

```mmd
venn-beta
set A
  text one
  text two
```

### Statements one per line

通常の完結した文は読みやすいように1行ずつにします。
宣言と同じ行に続く style、対象つき text、title は同じ行に保ちます。
分けると行頭の文が暗黙モードを解除するためです。
同じ行の宣言の列は分けられます。
各宣言が同じモードを有効にするためです。
保持する組は、
同じ行の後の宣言がモードを更新して分けても害がない場合も分けません。
規則は構文に対して局所的で、正規化後の最終状態を探すものではないためです。
title は行の残りを値として取るので、title の後の文に見える語は分けられません。
飲み込まれる断片は書かれた行の隣とともに保ちます。
[corpus fixture: venn/db-indent-after-same-line-explicit-text]
[corpus fixture: venn/db-indent-after-same-line-style]
[corpus fixture: venn/db-indent-after-same-line-title]
[corpus fixture: venn/header-statement-on-line]
[fixture: venn/statements-one-per-line/declaration-runs]
[fixture: venn/statements-one-per-line/header-declaration-group]
[fixture: venn/statements-one-per-line/ordinary-semicolon-repair-control]

[fixture: venn/statements-one-per-line/same-line-declaration-reset]
[fixture: venn/statements-one-per-line/same-line-style-kept]
[fixture: venn/statements-one-per-line/same-line-style-split-unsafe]
[fixture: venn/statements-one-per-line/same-line-text-kept]
[fixture: venn/statements-one-per-line/same-line-text-split-unsafe]
[fixture: venn/statements-one-per-line/same-line-title-kept]
[fixture: venn/statements-one-per-line/same-line-title-split-unsafe]
[fixture: venn/statements-one-per-line/same-line-title-value]
[fixture: venn/statements-one-per-line/split-inline-directive]
[fixture: venn/statements-one-per-line/statements-split-control]
[fixture: venn/statements-one-per-line/statements-split]
[fixture: venn/statements-one-per-line/title-not-two-statements]

入力（escape 表記）:

```json
"venn-beta set A   style A fill : red\n text item"
```

出力
([statements-one-per-line/header-declaration-group-output.mmd](../tests/fixtures/venn/statements-one-per-line/header-declaration-group-output.mmd)):

```mmd
venn-beta
set A style A fill:red
  text item
```

### Blank lines

通常の空行の列は1行にまとめ、本文の両端の空行を除きます。
余分な空間を減らしてまとまりを残すためです。
値の空行と保護する図コメントの隙間は保ちます。
字下げのない `%%{ }%%` の前では、
空行と空でない空白・タブだけの行でモードが異なります。
ソース行を結ぶ共通コメント領域の境界も保ちます。
[fixture: venn/blank-lines/blank-before-empty-braces-explicit]
[fixture: venn/blank-lines/blank-before-indented-empty-braces]
[fixture: venn/blank-lines/blank-in-value]
[fixture: venn/blank-lines/blank-runs]
[fixture: venn/blank-lines/comment-groups]
[corpus fixture: venn/db-indent-after-blank]
[corpus fixture: venn/db-indent-blank-line]
[corpus fixture: venn/gram-indent-after-empty-braces-explicit-id]
[corpus fixture: venn/gram-indent-after-empty-braces-explicit-string]
[corpus fixture: venn/gram-indent-after-empty-braces-explicit-target-list]
[corpus fixture: venn/lex-indent-indented-empty-braces-after-blank]
[corpus fixture: venn/lex-indent-set-blank-directive]
[corpus fixture: venn/lex-indent-set-empty-braces-blank]
[corpus fixture: venn/lex-indent-set-two-empty-braces]
[corpus fixture: venn/lex-indent-spaces-before-empty-braces]
[corpus fixture: venn/lex-indent-tab-line-before-empty-braces]
[corpus fixture: venn/lex-indent-union-blank-directive]
[corpus fixture: venn/lex-unindented-blank-followed-comment]
[fixture: venn/blank-lines/directive-groups]
[fixture: venn/blank-lines/fragment-gaps]
[fixture: venn/blank-lines/mode-trivia]
[fixture: venn/blank-lines/whitespace-before-empty-braces]

入力
([blank-lines/blank-runs-input.mmd](../tests/fixtures/venn/blank-lines/blank-runs-input.mmd)):

```mmd

venn-beta


set A


set B

```

出力
([blank-lines/blank-runs-output.mmd](../tests/fixtures/venn/blank-lines/blank-runs-output.mmd)):

```mmd
venn-beta
set A

set B
```

### Comments

単独のコメントは次の文にそろえ、末尾では最後の文にそろえて対応を示します。
後続コメントの接触と空白の有無は保ち、通常の空白の隙間は1つにします。
飲み込まれる `VennIgnoredText` の断片はコメントに接したまま保ちます。
離すと入力が拒否されることがあるためです。
字句解析は直前の断片を位置で飲み込むので、
コメントの前の隙間を足したり除いたりすると、
飲み込まれる断片が変わることがあります。
コメントが飲み込んだ必須の1文字の名前は拒否され、救うために空白は足しません。
末尾空白と LF・末尾までの U+2028・U+2029 を含む内容は保ちます。
値内のパーセント対は値のままです。
保護する隙間ではコメントとモードの境界も保ちます。
[fixture: venn/comments/bare-percent-tail]
[fixture: venn/comments/comment-directives]
[fixture: venn/comments/comment-mark-value]
[fixture: venn/comments/comment-spaced] [fixture: venn/comments/comment-touch]
[fixture: venn/comments/comments-align]
[fixture: venn/comments/complete-multiletter]
[corpus fixture: venn/lex-bare-percent-between-set-and-text]
[corpus fixture: venn/lex-comment-line-before-text]
[corpus fixture: venn/lex-comment-multiple-spaces-before-text]
[corpus fixture: venn/lex-eaten-fragment-before-line-break]
[corpus fixture: venn/lex-empty-braces-percent-between-set-and-text]
[corpus fixture: venn/lex-inline-comment-spaced]
[corpus fixture: venn/lex-style-extra-id-eaten]
[fixture: venn/comments/empty-braces-tail]
[fixture: venn/comments/fragment-tail] [fixture: venn/comments/header-comment]
[fixture: venn/comments/header-only-comment]
[fixture: venn/comments/ignored-fragment]
[fixture: venn/comments/ignored-line-preserves-mode]

入力（escape 表記）:

```json
"venn-beta\nset A Q%% note\n text item"
```

出力
([comments/ignored-fragment-output.mmd](../tests/fixtures/venn/comments/ignored-fragment-output.mmd)):

```mmd
venn-beta
set A Q%% note
  text item
```

### Name lists

キーワードと引数は空白1つで区切ります。
名前のコンマは直前の名前に接し、後ろを空白1つにして一覧を読みやすくします。
裸と引用符つきの名前、引用符内の余白、空の名前、
順序と重複は Db が対象を並べ替える場合も保ちます。
引用符は、外しても Db が同じ場合（`set "A"` と `set A`）も書き手の選択です。
引用符内の余白は名前の一部で、`" A "` と `"A"` は Db が異なります。
Db が対象を並べ替えるのは、書かれた一覧の並べ替えを許すものではなく、
重複したメンバーは union の項数として残します。
Venn は引用符つきの名前の隣の空白を受理するので、sankey の一覧と違い、
コンマごとの後ろの空白1つは安全です。
ディレクティブと無視されるセミコロンは通常の隙間の規則に優先します。
[corpus fixture: venn/db-case-distinct-ids]
[corpus fixture: venn/db-empty-identifiers]
[corpus fixture: venn/db-union-repeated-member]
[corpus fixture: venn/lex-name-list-comma-directive]
[corpus fixture: venn/lex-union-empty-quoted-members]
[corpus fixture: venn/lex-union-matching-quoted-padding]
[fixture: venn/name-lists/empty-quoted-targets]
[fixture: venn/name-lists/name-order-keep]
[fixture: venn/name-lists/names-quotes-equivalent]
[fixture: venn/name-lists/name-quoted-padding]
[fixture: venn/name-lists/names-comma] [corpus fixture: venn/db-form-set]
[fixture: venn/name-lists/quoted-keyword]

入力（escape 表記）:

```json
"venn-beta\nset A\nset \"B\"\nunion A ,\"B\" , A\ntext A , \"B\" item\nstyle A ,\"B\" fill:red"
```

出力
([name-lists/names-comma-output.mmd](../tests/fixtures/venn/name-lists/names-comma-output.mmd)):

```mmd
venn-beta
set A
set "B"
union A, "B", A
text A, "B" item
style A, "B" fill:red
```

### Labels

角括弧ラベルは名前か text の id に接し、短い接尾部にします。
裸と引用符つきの形と内部の全ての文字を保ちます。
Db の空白除去は値を編集する理由にはしません。
空の引用符つきラベルと裸の空白ラベルは Db のラベルを省き、
引用符内の空白は空のラベルを保存します。
内部の項目はラベル内に保ち、隙間の項目は接触関係を優先します。
[fixture: venn/labels/specified-c4-label-title]
[fixture: venn/labels/all-suffixes]
[corpus fixture: venn/db-form-text-string-label]
[corpus fixture: venn/db-form-union-label]
[corpus fixture: venn/lex-directive-label-delimiter-gap]
[corpus fixture: venn/lex-label-bare-comment-only]
[corpus fixture: venn/lex-label-bare-padding]
[corpus fixture: venn/lex-label-quoted-comment-only]
[corpus fixture: venn/lex-label-quoted-directive-only]
[corpus fixture: venn/lex-label-quoted-ignored-semicolon-only]
[fixture: venn/labels/directive-attachment]
[fixture: venn/labels/labels-empty-form-differs-control]
[fixture: venn/labels/labels-empty-form-differs]
[fixture: venn/labels/labels-empty-kept]
[fixture: venn/labels/labels-form-equal-control]
[corpus fixture: venn/db-set-label-eof]
[fixture: venn/labels/labels-padding-trim-equal-control]
[fixture: venn/labels/labels-padding-trim-equal]
[fixture: venn/labels/multiline-padding]
[fixture: venn/labels/quoted-delimiter-directive]
[fixture: venn/labels/quoted-label-padding-trim-equal]
[fixture: venn/labels/suffix-spacing]

入力（escape 表記）:

```json
"venn-beta\nset A [ L ] : 002.00\n text item [\" Label \"]"
```

出力
([labels/suffix-spacing-output.mmd](../tests/fixtures/venn/labels/suffix-spacing-output.mmd)):

```mmd
venn-beta
set A[ L ]:002.00
  text item[" Label "]
```

### Sizes and numbers

サイズは名前かラベルに `:number` と接し、接尾部を一貫して短い形にします。
符号、小数、先頭のゼロ、符号つきゼロ、桁あふれの綴りを保ちます。
数値の text id も綴りを保ちます。
書き換えると Db が変わるためです。
サイズの省略と書かれたゼロは別の形として保ちます。
[fixture: venn/sizes-and-numbers/absent-zero-signs]
[corpus fixture: venn/db-set-colon-size-inline-directive]
[corpus fixture: venn/db-set-label-colon-size-inline-directive]
[corpus fixture: venn/db-size-negative-overflow]
[corpus fixture: venn/db-size-negative-zero]
[corpus fixture: venn/db-size-overflow] [corpus fixture: venn/db-size-zero]
[fixture: venn/sizes-and-numbers/size-spaces]
[fixture: venn/sizes-and-numbers/size-spelling-equal-control]
[fixture: venn/sizes-and-numbers/size-spelling-equal]
[fixture: venn/sizes-and-numbers/text-number-forms]
[fixture: venn/sizes-and-numbers/text-number-spelling-differs-control]
[fixture: venn/sizes-and-numbers/text-number-spelling-differs]

入力（escape 表記）:

```json
"venn-beta\nset A : +02.50 set B: -.5 union A,B : 007\n text 007"
```

出力
([sizes-and-numbers/size-spaces-output.mmd](../tests/fixtures/venn/sizes-and-numbers/size-spaces-output.mmd)):

```mmd
venn-beta
set A:+02.50
set B:-.5
union A, B:007
  text 007
```

### Style properties

プロパティは `key:value`、区切りはコンマと空白1つにします。
短い句読点と値の空白を区別するためです。
裸の値は1つの `VennLiteral` として、
Db が単位を空白で結ぶ場合も隣接する単位と空白を保ちます。
隙間を整えても Db は変わりませんが、木は裸の値を書かれた綴りのまま持つので、
それを保てばプリンターに第二の字句解析器が要りません。
rgb・rgba の内部の空白は別で、成分の隙間を変えると Db が変わり、
結んだ裸の値を引用符で囲んでも変わります。
引用符つきの値、rgb・rgba 全体、キーの大小文字、重複と別々の文も保ちます。
保持部分では句読点の空白を変えません。
コロンとハッシュの隙間がセミコロンの選択を変えないためです。
[corpus fixture: venn/div-c4-bare-style-value]
[corpus fixture: venn/db-style-case-and-order]
[corpus fixture: venn/db-style-colon-value-inline-directive]
[corpus fixture: venn/db-style-property-colon-inline-directive]
[corpus fixture: venn/db-style-prototype-keys]
[corpus fixture: venn/db-style-unknown]
[corpus fixture: venn/lex-directive-style-value-color]
[corpus fixture: venn/lex-style-adjacent-units]
[corpus fixture: venn/lex-style-hex-ignored-semicolon]
[corpus fixture: venn/lex-style-rgb-ignored-semicolon]
[corpus fixture: venn/lex-style-single-number-whole-spelling]
[fixture: venn/style-properties/property-directives]
[fixture: venn/style-properties/prototype-repeat]
[fixture: venn/style-properties/style-atoms-kept]
[fixture: venn/style-properties/style-atoms-normalize-equal-control]
[fixture: venn/style-properties/style-color-kept]
[corpus fixture: venn/db-form-style-rgb]
[fixture: venn/style-properties/style-color-space-differs]
[fixture: venn/style-properties/style-common-comment]
[fixture: venn/style-properties/style-order-kept]
[fixture: venn/style-properties/style-property-spacing]
[fixture: venn/style-properties/style-quote-differs-control]
[fixture: venn/style-properties/style-quote-differs]
[fixture: venn/style-properties/style-string-empty]

入力（escape 表記）:

```json
"venn-beta\nstyle A , B fill : red , opacity : .50 , custom : \" dark blue \""
```

出力
([style-properties/style-property-spacing-output.mmd](../tests/fixtures/venn/style-properties/style-property-spacing-output.mmd)):

```mmd
venn-beta
style A, B fill:red, opacity:.50, custom:" dark blue "
```

### Line rule and kept lines

全てのセミコロンを保ちます。
Venn の文を区切る文字ではないためです。
最初の非空白から最後のセミコロンまでの範囲を保護し、端にかかる値、コメント、
ディレクティブの末尾まで延ばします。
不一致や文をまたぐ印も含め、同じテキストの行規則の選択を保つためです。
字下げと外側の末尾空白はプリンターが決め、安全な接尾部は通常どおり整形します。
共通の行規則の区間は図コメントの途中でも終わりますが、
プリンターはそのコメント全体を保護します。
端をまたぐ値は一度だけ出力し、
セミコロンで止まる閉じないディレクティブは停止境界を保ちます。

たとえば入力 `"venn-beta\nset A[style:#x;y]%% c\u2028tail;"` は
`"venn-beta\nset A[style:#x;y]%% c\u2028tail;\n"` になり、
Db のラベル `"style:#xy"` を保ちます。
ラベル内のセミコロンが最初の行規則の区間の最後だからです。
U+2029 でも同じラベルです。
区切りを ASCII 空白にした入力 `"venn-beta\nset A[style:#x;y]%% c tail;"`
は末尾に改行を足して印字します。
この場合はコメント内のセミコロンが最後なので、ラベルのエンティティが残ります。
正規化した Db のテキストは `"style:\ufb02\u00b0x\u00b6\u00dfy"` です。
各入力の読み方を保ち、どちらもコメント全体を残します。
[test: venn: ls-comment-competing-semicolon]
[test: venn: ps-comment-competing-semicolon]
[fixture: venn/comments/comment-competing-semicolon-space]
[fixture: venn/line-rule-and-kept-lines/comment-only-semicolon]
[corpus fixture: venn/lex-after-set-directive-unclosed]
[corpus fixture: venn/lex-identifier-style-rule-other-line]
[corpus fixture: venn/lex-identifier-style-rule-two-semicolons]
[corpus fixture: venn/lex-label-classdef-rule]
[corpus fixture: venn/lex-label-style-rule-other-line]
[corpus fixture: venn/lex-style-style-rule]
[corpus fixture: venn/lex-style-style-rule-other-line]
[corpus fixture: venn/lex-text-style-rule-other-line]
[fixture: venn/line-rule-and-kept-lines/crossing-multiline-value]
[fixture: venn/line-rule-and-kept-lines/directive-crossing-prefix]
[fixture: venn/line-rule-and-kept-lines/directive-semicolon-stop]
[fixture: venn/line-rule-and-kept-lines/line-rule-colon-space-unsafe]
[fixture: venn/line-rule-and-kept-lines/line-rule-comment-keep]
[fixture: venn/line-rule-and-kept-lines/line-rule-comment-move-control]
[fixture: venn/line-rule-and-kept-lines/line-rule-comment-move]
[fixture: venn/line-rule-and-kept-lines/line-rule-cross-statement-control]
[fixture: venn/line-rule-and-kept-lines/line-rule-cross-statement]
[fixture: venn/line-rule-and-kept-lines/line-rule-double-pass]
[fixture: venn/line-rule-and-kept-lines/line-rule-kept-whitespace]
[fixture: venn/line-rule-and-kept-lines/line-rule-no-hash-control-control]
[fixture: venn/line-rule-and-kept-lines/line-rule-no-hash-control]
[fixture: venn/line-rule-and-kept-lines/line-rule-nonmatch-value-control]
[fixture: venn/line-rule-and-kept-lines/line-rule-nonmatch-value]
[fixture: venn/line-rule-and-kept-lines/line-rule-other-line-control-control]
[fixture: venn/line-rule-and-kept-lines/line-rule-other-line-control]
[fixture: venn/line-rule-and-kept-lines/line-rule-split-equal-control-control]
[fixture: venn/line-rule-and-kept-lines/line-rule-split-equal-control]
[fixture: venn/line-rule-and-kept-lines/line-rule-suffix-spacing]
[fixture: venn/line-rule-and-kept-lines/line-rule-uppercase-control-control]
[fixture: venn/line-rule-and-kept-lines/line-rule-uppercase-control]
[fixture: venn/line-rule-and-kept-lines/markers-across-statements]
[fixture: venn/line-rule-and-kept-lines/multiple-last-semicolons]
[fixture: venn/line-rule-and-kept-lines/semicolon-removal-shifts]

入力（escape 表記）:

```json
"venn-beta\n set A[style:#x;y]   set B : 2   "
```

出力
([line-rule-and-kept-lines/line-rule-suffix-spacing-output.mmd](../tests/fixtures/venn/line-rule-and-kept-lines/line-rule-suffix-spacing-output.mmd)):

```mmd
venn-beta
set A[style:#x;y] set B:2
```

### Title

読みやすいように title の最初の区切りを ASCII 空白1つにします。
その後の値の全ての文字は、前後の空白と文に見える単語も含めて保ちます。
最初の区切りの後は全て title の値で、木でも Db でもそうなので、
除いたりまとめたりすると Db が変わるためです。
次のソース行の字下げは値の一部なので、
`title` の LF と `  T` は `title   T` と印字されます。
LF と title で受理する広い種類の区切りは正規化します。
ただし項目、結合領域、保持部分の境界は保ちます。
[corpus fixture: venn/db-frontmatter-title-overridden]
[corpus fixture: venn/db-title-on-header]
[corpus fixture: venn/db-title-only-whitespace]
[corpus fixture: venn/db-title-padding]
[corpus fixture: venn/db-title-value-next-line]
[corpus fixture: venn/lex-gap-title-comment]
[fixture: venn/title/repeated-title] [fixture: venn/title/title-directive]
[fixture: venn/title/title-inline-percent] [fixture: venn/title/title-next-line]
[fixture: venn/title/title-statement-words]
[fixture: venn/title/title-tab-separator]

[fixture: venn/title/title-trim-unsafe]
[fixture: venn/title/title-whitespace-only]

入力（escape 表記）:

```json
"venn-beta\ntitle\n  T"
```

出力
([title/title-next-line-output.mmd](../tests/fixtures/venn/title/title-next-line-output.mmd)):

```mmd
venn-beta
title   T
```

### Directives

単独のディレクティブは近くの文にそろえて対応を示します。
行内のディレクティブは行、順序、内容と接触関係を保ち、
通常の空白の隙間は1つにします。
先頭のディレクティブは暗黙と明示の text を分ける、
論理的な字下げの正とゼロを保ちます。
内部の隙間の関係を保ち、最初のディレクティブの前の字下げを決めます。
先行する複数のディレクティブの間の空白も正の印です。
内部の隙間が印にならない暗黙の行だけ、
最初のディレクティブの前に設定の1段を足します。
通常行と保持行で同じ規則を使います。
除去が全ての隙間を結ぶためです。
埋め込み、複数行、セミコロンで止まるもの、末尾のものの境界を保ちます。
埋め込みデータは整形しません。

ヘッダーや文の行では、
後の文を別の行へ移すときもディレクティブを前のテキストと同じ行に保ちます。
ディレクティブ前の隙間は空白1つか接したままにします。
後の文に接するディレクティブがある場合は、接触関係を保つため行を分けません。
ディレクティブは区切りを与えずに除かれるので、
ディレクティブと隣のテキストの接触関係が読みを決めるためです。
これは class・flowchart・gantt・timeline・block と同じです。
kanban がディレクティブごと移すのは、
ディレクティブの後ろの空白がそこでは節点の字下げになるためで、
Venn のヘッダー行の文にはその役割がありません。
セミコロンを保持する行もヘッダーとの関係を保ちます。
[corpus fixture: venn/db-indent-after-directive]
[corpus fixture: venn/db-set-label-unclosed-directive-gap]
[corpus fixture: venn/lex-after-set-directive-unclosed]
[corpus fixture: venn/lex-comment-after-directive-keeps-id]
[corpus fixture: venn/lex-directive-style-value-color]
[corpus fixture: venn/lex-identifier-directive-only]
[fixture: venn/directives/directive-body-tail]
[fixture: venn/directives/directive-bounded-argument]
[corpus fixture: venn/header-directive-glued]
[fixture: venn/directives/directive-header-inline]
[fixture: venn/directives/directive-in-value]
[fixture: venn/directives/directive-leading-explicit]
[fixture: venn/directives/directive-leading-indent-chosen]
[fixture: venn/directives/directive-leading-marker]
[fixture: venn/directives/directive-multiline]
[fixture: venn/directives/directive-unclosed-eof]
[fixture: venn/directives/directive-unclosed-object]
[fixture: venn/directives/directives-inline-gaps]
[fixture: venn/directives/directives-standalone]
[corpus fixture: venn/db-set-label-inline-directive]
[fixture: venn/directives/directives-touch]
[fixture: venn/directives/leading-inline-directive-comment]
[fixture: venn/directives/leading-intermediate-marker]
[fixture: venn/directives/kept-leading-intermediate-marker]
[fixture: venn/directives/header-directive-spaced]
[fixture: venn/directives/header-directive-touching-statement]
[fixture: venn/directives/header-directives-touching]
[fixture: venn/directives/header-directives-spaced]
[fixture: venn/directives/header-directives-last-touching]
[fixture: venn/directives/header-directive-explicit-text]
[fixture: venn/directives/header-directive-implicit-line]
[fixture: venn/directives/header-directive-title]
[fixture: venn/directives/header-directive-touching-title]
[fixture: venn/directives/header-directive-comment]
[fixture: venn/directives/header-directive-touching-comment]
[fixture: venn/directives/header-directive-kept-line]
[fixture: venn/directives/header-directive-before-kept-line]
[fixture: venn/directives/declaration-trailing-directive]
[fixture: venn/directives/style-trailing-directive]
[fixture: venn/directives/style-directive-touching-next]
[fixture: venn/directives/declaration-directive-touching-next]

入力（escape 表記）:

```json
"venn-beta\nset A  %%{init: {}}%% [L] : 2"
```

出力
([directives/directives-inline-gaps-output.mmd](../tests/fixtures/venn/directives/directives-inline-gaps-output.mmd)):

```mmd
venn-beta
set A %%{init: {}}%% [L]:2
```

入力（escape 表記）:

```json
"venn-beta%%{init: {}}%% set A"
```

出力
([directives/directive-header-inline-output.mmd](../tests/fixtures/venn/directives/directive-header-inline-output.mmd)):

```mmd
venn-beta%%{init: {}}%%
set A
```

### Trailing whitespace

完結したヘッダーと title 以外の文の後の外側の ASCII 空白とタブは除き、
行末をそろえます。
保持部分と安全な接尾部の後も同じです。
名前、ラベル、色、style の文字列、title の値、
コメントとディレクティブ内の空白は書かれたテキストとして保ちます。
[fixture: venn/trailing-whitespace/continuation-spaces]
[corpus fixture: venn/db-after-set-label-size-space]
[corpus fixture: venn/db-title-padding] [corpus fixture: venn/lex-tab-line-end]
[fixture: venn/trailing-whitespace/kept-prefix-exterior]
[fixture: venn/trailing-whitespace/trailing-comment]

[fixture: venn/trailing-whitespace/trailing-exterior]
[fixture: venn/trailing-whitespace/trailing-in-values]

入力 `"venn-beta \nset A \n"` は `"venn-beta\nset A\n"` になり、
`title T  ` の値の空白は保ちます。

### Multiline values

値の行、空行と継続行の列を保ちます。
結合や字下げの変更で Db が変わることがあるためです。
文と値は `printWidth` で折り返しません。
通常の単位の境界には改行を足せないためです。
前述の title の区切りだけが狭い例外です。
[fixture: venn/multiline-values/comment-in-value]
[corpus fixture: venn/lex-identifier-blank-line]
[corpus fixture: venn/lex-identifier-comment-line]
[corpus fixture: venn/lex-label-blank-line]
[corpus fixture: venn/lex-style-blank-line]
[corpus fixture: venn/lex-style-value-rgb-multiline]
[fixture: venn/multiline-values/long-no-wrap]
[fixture: venn/multiline-values/multiline-directive]
[fixture: venn/multiline-values/multiline-empty-lines]
[fixture: venn/multiline-values/multiline-join-unsafe-control]
[fixture: venn/multiline-values/multiline-join-unsafe]
[fixture: venn/multiline-values/multiline-reindent-unsafe-control]
[fixture: venn/multiline-values/multiline-reindent-unsafe]
[fixture: venn/multiline-values/multiline-values]
[fixture: venn/multiline-values/wrap-list-rejected]

入力（escape 表記）:

```json
"venn-beta\nset \"A\n B\"[L\n  M]\ntext A \"x\n y\"[N\n O]\nstyle A fill:\"red\n blue\",stroke:rgb(1,\n  2,3)"
```

出力
([multiline-values/multiline-values-output.mmd](../tests/fixtures/venn/multiline-values/multiline-values-output.mmd)):

```mmd
venn-beta
set "A
 B"[L
  M]
text A "x
 y"[N
 O]
style A fill:"red
 blue", stroke:rgb(1,
  2,3)
```

### Keyword case and order

書かれた選択を保つため、キーワードの大小文字と全ての宣言、対象、
プロパティの順序を保ちます。
重複と Db に効果のない項目も含みます。
名前、キーと色の大小文字も保ちます。
文のキーワードと異なり、セミコロンのテキストの印は大小文字を区別します。
[fixture: venn/keyword-case-and-order/all-written-repeats]
[corpus fixture: venn/db-style-three-definitions-same-target]
[corpus fixture: venn/db-text-three-definitions]
[corpus fixture: venn/db-three-definitions]
[corpus fixture: venn/db-union-three-definitions]
[corpus fixture: venn/lex-keyword-set-upper]
[fixture: venn/keyword-case-and-order/declarations-order-keep-control]
[fixture: venn/keyword-case-and-order/declarations-order-keep]
[fixture: venn/keyword-case-and-order/keyword-case-kept]

[fixture: venn/keyword-case-and-order/keyword-lower-equal]

入力（escape 表記）:

```json
"venn-beta\nSET A\n  TeXt item\nSTYLE A fill:RED\nTitle T"
```

出力
([keyword-case-and-order/keyword-case-kept-output.mmd](../tests/fixtures/venn/keyword-case-and-order/keyword-case-kept-output.mmd)):

```mmd
venn-beta
SET A
  TeXt item
STYLE A fill:RED
Title T
```

### Line terminators

CRLF と単独の CR は値の内部も共通の `endOfLine` に従います。
mermaid.js が LF と読むためです。 [test: a venn diagram with other line endings]
[test: uses lone CR inside values and after implicit text]
U+2028・U+2029 は値、コメント、ディレクティブ内の文字として保ちます。
保存される文字なので、LF に置き換えると Db が変わるためです。
Venn の図コメントはこれらを越えて LF か末尾まで続きます。
ASCII 空白にできるのは title の最初の区切りだけです。
通常の本文や裸の style の隙間としての Unicode 区切りは拒否されます。

[fixture: venn/line-terminators/ls-comment-split-unsafe-control]

[fixture: venn/line-terminators/ls-value-to-lf-differs-control]
[fixture: venn/line-terminators/ps-value-to-lf-differs-control]
[test: a venn diagram with other line endings] [test: venn: crlf-values]
[test: venn: cr-values] [test: venn: ls-values] [test: venn: ps-values]
[test: venn: ls-comment-kept] [test: venn: ps-comment-kept]
[test: venn: ls-header-comment] [test: venn: ps-header-comment]
[test: venn: ps-comment-eof] [test: venn: ls-kept-comment-last-character]
[test: venn: ps-kept-comment-last-character]
[test: venn: ls-kept-comment-whitespace-line]
[test: venn: ps-kept-comment-whitespace-line]
[corpus fixture: venn/lex-diagram-comment-cut-ls-tree-gap]
[corpus fixture: venn/lex-diagram-comment-cut-ps-tree-gap]
[test: venn: ls-kept-directive] [test: venn: ps-kept-directive]
[test: venn: ls-kept-overlapping-value] [test: venn: ps-kept-overlapping-value]

エスケープ表記の入出力:
`"venn-beta\nset \"A\u2028 B\"[L\u2028 M]\nstyle A fill:rgb(1,\u2028 2,3)"` ->
`"venn-beta\nset \"A\u2028 B\"[L\u2028 M]\nstyle A fill:rgb(1,\u2028 2,3)\n"`。
[test: venn: ls-values]

### Whitespace characters

通常の隙間は受理される ASCII 空白とタブだけを正規化します。
値内の非 ASCII 空白は保ち、
検出前の広い空白と title の区切りは専用の規則に従います。
U+0085 は空白ではなく、 NBSP、BOM、U+3000、VT、
FF を本文の隙間として受理はしません。
ファイル先頭の BOM と BOM・frontmatter の制限は共通のホスト処理に従います。

[corpus fixture: venn/db-form-set]

[fixture: venn/whitespace-characters/tab-gaps] [test: venn: nbsp-leading-header]
[test: venn: nbsp-value-kept] [test: venn: vt-value-kept]
[test: venn: ff-title-separator] [test: venn: bom-title-separator]
[test: venn: bom-leading-header] [test: venn: bom-frontmatter]
[test: venn: unicode-role-whitespace]

エスケープ表記の入出力:
`"venn-beta\ntitle\u00a0 T" -> "venn-beta\ntitle  T\n"`。
[test: venn: nbsp-title-separator]

### Frontmatter YAML

frontmatter は読みやすい設定にするため、共通の保護つき YAML 整形を使います。
区切り、閉じる行の余白、ヘッダー前のコメントとディレクティブ、
title の上書きの役割を保ちます。
不正、字下げつき、HTML に影響するもの、区切りが変わる YAML は保ちます。
効果のないアクセシビリティのメタデータも残します。
[corpus fixture: venn/frontmatter-invalid]
[fixture: venn/frontmatter-yaml/closing-delimiter-padding]
[corpus fixture: venn/db-frontmatter-accessibility]
[corpus fixture: venn/db-frontmatter-title]
[corpus fixture: venn/frontmatter-html-title]
[corpus fixture: venn/header-before-frontmatter-comment]
[fixture: venn/frontmatter-yaml/frontmatter-comments-directives]
[fixture: venn/frontmatter-yaml/frontmatter-delimiter-hazard]
[fixture: venn/frontmatter-yaml/frontmatter-html-kept]
[fixture: venn/frontmatter-yaml/frontmatter-html-requote-unsafe-control]
[fixture: venn/frontmatter-yaml/frontmatter-indented-kept]
[fixture: venn/frontmatter-yaml/frontmatter-invalid-kept]
[fixture: venn/frontmatter-yaml/frontmatter-title-override]
[fixture: venn/frontmatter-yaml/frontmatter-yaml-control]
[fixture: venn/frontmatter-yaml/frontmatter-yaml]

入力（escape 表記）:

```json
"---\ntitle:   T\nconfig: {venn: {padding:  20}}\n---\nvenn-beta\nset A"
```

出力
([frontmatter-yaml/frontmatter-yaml-output.mmd](../tests/fixtures/venn/frontmatter-yaml/frontmatter-yaml-output.mmd)):

```mmd
---
title: T
config: { venn: { padding: 20 } }
---
venn-beta
set A
```

### Final newline

通常の受理する入力は共通のファイルの規則に合わせ、設定の改行1つで終えます。
ヘッダーだけの本文も同じです。
保護するコメントの隙間と末尾までの閉じないディレクティブは終端を保ち、
値の末尾空白も残します。
Markdown は同じ Venn の規則の外側にフェンスとコンテナーの字下げを付けます。
[fixture: venn/final-newline/bounded-argument-eof]
[fixture: venn/final-newline/comment-gap-eof]
[corpus fixture: venn/db-style-string-eof] [corpus fixture: venn/db-title-eof]
[corpus fixture: venn/header-only]
[corpus fixture: venn/lex-after-set-directive-unclosed]
[corpus fixture: venn/lex-after-set-comment]
[fixture: venn/final-newline/final-comment] [corpus fixture: venn/db-form-set]
[fixture: venn/final-newline/final-newline]
[fixture: venn/final-newline/final-open-directive]
[corpus fixture: venn/lex-after-title-spaces]
[fixture: venn/final-newline/final-title-spaces]
[fixture: venn/final-newline/ignored-fragment-comment]
[fixture: venn/final-newline/multiple-terminal-lf]

入力（escape 表記）:

```json
"venn-beta\nset A"
```

出力
([final-newline/final-newline-output.mmd](../tests/fixtures/venn/final-newline/final-newline-output.mmd)):

```mmd
venn-beta
set A
```

## Rejected inputs

共通の失敗経路は構文エラーを報告し、拒否するソースを整形せず、
拒否する Markdown フェンスの整形を引き受けません。
名前、一覧、ラベル、サイズ、引用符、改行、ヘッダー、
通常のセミコロンと未対応の構文は修復しません。
修復は誤りを別の意味に変えるためです。
欠けた名前、セミコロン、ヘッダーの大小文字、未知の union のメンバーを直すと、
受理の可否か意図が変わります。
印字時に mermaid.js を再実行すると、言語の実装が重複し、足りない規則が隠れます。
仕様の単位境界の乖離は失敗のままです。

たとえば `venn-beta\nset A;` は構文エラーを報告し、単独のソースは整形しません。
拒否する Markdown フェンスはホストの通常のコードブロック処理で内容を保ちます。
[corpus fixture: venn/lex-after-set-semicolon]
[corpus fixture: venn/header-semicolon-spaced]
[corpus fixture: venn/gram-bare-word] [corpus fixture: venn/gram-unclosed-id]
[corpus fixture: venn/gram-set-label-crlf-gap]
