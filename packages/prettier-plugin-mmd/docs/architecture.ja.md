# Architecture formatting rules

英語版: [architecture.md](./architecture.md)

29項目の決定を、作者の AST と共有の平坦な本文処理で実装します。
以下に各整形の選択を説明します。
互換性の制限は [compatibility.ja.md](./compatibility.ja.md) にあります。

## Rules

### Header

`architecture-beta` を第1列に置き、
通常の最初の文を次行へ移して見出しを明確にします。
空の本文も保ちます。
hidden の境界と保護された見出し・本文の区間を優先し、
接着した keyword を作りません。

[fixture: architecture/header/header-empty]

[fixture: architecture/header/header-inline-accessibility]

[fixture: architecture/header/header-inline-description]

[corpus fixture: architecture/header-inline-group]

[corpus fixture: architecture/header-inline-service]

[corpus fixture: architecture/header-inline-junction]

[corpus fixture: architecture/header-inline-edge]

[corpus fixture: architecture/header-inline-align]

[corpus fixture: architecture/common-all]

[corpus fixture: architecture/header-glued-service]

[corpus fixture: architecture/header-letter-suffix]

入力 (escaped):
`"architecture-beta accTitle: Topic\n"`.

出力
([header/header-inline-accessibility-output.mmd](../tests/fixtures/architecture/header/header-inline-accessibility-output.mmd)):

```mmd
architecture-beta
  accTitle: Topic
```

### Indentation

通常の宣言・辺・alignment・共通文・独立した trivia は設定の1段だけ字下げします。
本文は平坦で、`in` は参照なので入れ子の段を増やしません。
architecture の列には文法上の意味がないため、
`tabWidth: 0` は空白0個、`useTabs` は幅0でもタブ1個です。
値の継続列、hidden の閉じ、保持する prefix は原形を保ちます。

[fixture: architecture/indentation/indent-four]

[fixture: architecture/indentation/indent-tabs]

[fixture: architecture/indentation/indent-two]

[fixture: architecture/indentation/indent-zero]

[fixture: architecture/indentation/zero-tabs]

入力 (escaped):
`"architecture-beta\nservice a\n"`.

Options: `{"tabWidth": 4}`.

出力
([indentation/indent-four-output.mmd](../tests/fixtures/architecture/indentation/indent-four-output.mmd)):

```mmd
architecture-beta
    service a
```

### Statements one per line

読みやすさのため、通常の文は1行ずつ印字します。
共通の行値は物理行末までの keyword に見える文字も所有するため、分割しません。
セミコロンは文の区切りではありません。
隣接する不正な文や部品の隙間に使われた空の説明は、失敗のままです。

[fixture: architecture/statements-one-per-line/line-value-owns-keywords]

[corpus fixture: architecture/gram-same-line-statements]

[corpus fixture: architecture/end-group-semicolon]

[corpus fixture: architecture/gram-empty-description-gap]

[corpus fixture: architecture/gram-empty-description-after-service]

入力 (escaped):
`"architecture-beta title t service a; junction j\n"`.

出力
([statements-one-per-line/line-value-owns-keywords-output.mmd](../tests/fixtures/architecture/statements-one-per-line/line-value-owns-keywords-output.mmd)):

```mmd
architecture-beta title t service a; junction j
```

### Declaration spacing

keyword と ID の間は空白1個です。
`group g(cloud)[G]`、`service a(server)[A]`、`service a[A]` と印字し、
括弧・角括弧の付属部品を1つの node として読みやすくします。
文字 icon は独立した値なので `service a "I" [A]` とします。
省略された部品は補わず、trivia のある隙間は接触を保ちます。

[fixture: architecture/declaration-spacing/double-text-icon]

[fixture: architecture/declaration-spacing/group-id]

[fixture: architecture/declaration-spacing/group-label]

[fixture: architecture/declaration-spacing/junction-id]

[fixture: architecture/declaration-spacing/named-group]

[fixture: architecture/declaration-spacing/named-service]

[fixture: architecture/declaration-spacing/service-id]

[fixture: architecture/declaration-spacing/service-label]

[fixture: architecture/declaration-spacing/single-text-icon]

入力 (escaped):
`"architecture-beta\ngroup  g (cloud) [Group]\n"`.

出力
([declaration-spacing/named-group-output.mmd](../tests/fixtures/architecture/declaration-spacing/named-group-output.mmd)):

```mmd
architecture-beta
  group g(cloud)[Group]
```

### Parent references

同じ意味の空白を統一するため、`in` の前後は空白1個にし、列を揃えません。
明示された参照と省略を保ちます。
親を解決するために宣言を移動したり、所属を本文の入れ子へ変えたりしません。

[fixture: architecture/parent-references/group-parent]

[fixture: architecture/parent-references/junction-parent]

[fixture: architecture/parent-references/service-parent]

[corpus fixture: architecture/lex-keyword-prefix-ids]

[corpus fixture: architecture/db-service-forward-parent]

[corpus fixture: architecture/db-junction-forward-parent]

入力 (escaped):
`"architecture-beta\ngroup p\ngroup g(cloud)[G]in\tp\n"`.

出力
([parent-references/group-parent-output.mmd](../tests/fixtures/architecture/parent-references/group-parent-output.mmd)):

```mmd
architecture-beta
  group p
  group g(cloud)[G] in p
```

### Named icons

括弧内の icon 名は先頭の記号や未知の名前も原綴を保ちます。
この構文単位は空でなく空白のない名前を要求するため、空白を加えると拒否されます。
完全な部品間の global directive は境界を保ちます。

[fixture: architecture/named-icons/leading-symbols]

[fixture: architecture/named-icons/unknown-name]

[corpus fixture: architecture/lex-icon-leading-symbols]

[corpus fixture: architecture/db-unknown-icon]

[corpus fixture: architecture/lex-icon-empty]

[corpus fixture: architecture/lex-icon-spaces]

[corpus fixture: architecture/lex-icon-text-parenthesized]

入力 (escaped):
`"architecture-beta\ngroup symbols (-:A_)\n"`.

出力
([named-icons/leading-symbols-output.mmd](../tests/fixtures/architecture/named-icons/leading-symbols-output.mmd)):

```mmd
architecture-beta
  group symbols(-:A_)
```

### Text icons

StringLiteral の範囲全体を保ちます。
単引用符・二重引用符・反対側の引用符・空文字・escape・空白・継続行も保持します。
`singleQuote` では書き換えません。
再符号化は作者の綴りを失い、trim や decode は Db を変え得るためです。

[fixture: architecture/text-icons/double-quote]

[fixture: architecture/text-icons/empty]

[fixture: architecture/text-icons/padding]

[fixture: architecture/text-icons/single-quote]

[corpus fixture: architecture/lex-string-conversion]

[corpus fixture: architecture/lex-string-number-escape]

[corpus fixture: architecture/directive-empty-text-icon]

入力 (escaped):
`"architecture-beta\nservice double\"a'\\n\\t\\q\\\\b\"\n"`.

Options: `{"singleQuote": true}`.

出力
([text-icons/double-quote-output.mmd](../tests/fixtures/architecture/text-icons/double-quote-output.mmd)):

```mmd
architecture-beta
  service double "a'\n\t\q\\b"
```

### Label forms

ArchitectureLabel の全範囲と、bare・quoted の形、引用符の綴りを保ちます。
`[ "x" ]` は bare であり、詰めてよい quoted ラベルではありません。
Db が等しい引用符変更でも、選ばれた kind と原形を失うため行いません。
引用符に見える fallback は bare のままにし、
変換後の文字から kind を推測しません。

[fixture: architecture/label-forms/backslash-fallback]

[fixture: architecture/label-forms/bare]

[fixture: architecture/label-forms/inner-quote]

[fixture: architecture/label-forms/padded-quotes]

[fixture: architecture/label-forms/quoted-brackets]

[fixture: architecture/label-forms/single-quote]

[fixture: architecture/label-forms/unclosed-quote]

[fixture: architecture/label-forms/unescaped-quote]

[corpus fixture: architecture/lex-title-unclosed-quote-with-close]

[corpus fixture: architecture/lex-title-bare-inner-quote]

[corpus fixture: architecture/lex-title-unescaped-quote-fallback]

[corpus fixture: architecture/lex-title-quoted-backslash-fallback]

[corpus fixture: architecture/lex-title-quoted-brackets]

[corpus fixture: architecture/lex-title-single-quoted-brackets]

[corpus fixture: architecture/lex-title-padded-quoted-brackets]

[corpus fixture: architecture/html-label-authored-quotes]

[corpus fixture: architecture/lex-label-selected-semicolon-after-quote]

[corpus fixture: architecture/db-title-quote-only-double]

[corpus fixture: architecture/db-title-quote-only-single]

[corpus fixture: architecture/db-title-quote-only-padded]

入力 (escaped):
`"architecture-beta\nservice padded [ \"x\" ]\n"`.

Options: `{"singleQuote": true}`.

出力
([label-forms/padded-quotes-output.mmd](../tests/fixtures/architecture/label-forms/padded-quotes-output.mmd)):

```mmd
architecture-beta
  service padded[ "x" ]
```

### Label content

角括弧の内側は、端の空白、連続空白、タブ、空白だけの値、quoted の空値、
escape、HTML、entity、hidden に見える文字もそのまま保ちます。
Db がこれらを区別するため、外側の空白のようには正規化しません。
物理 CR・CRLF だけは共有の host 方針に従います。

[fixture: architecture/label-content/bare-padding]

[fixture: architecture/label-content/escapes]

[fixture: architecture/label-content/hidden-looking]

[fixture: architecture/label-content/html-entities]

[fixture: architecture/label-content/quoted-empty]

[fixture: architecture/label-content/quoted-padding]

[fixture: architecture/label-content/whitespace-only]

[corpus fixture: architecture/lex-title-conversion]

[corpus fixture: architecture/db-empty-values]

[corpus fixture: architecture/lex-title-bare-trailing-backslash]

[corpus fixture: architecture/line-ls-ps-values]

[corpus fixture: architecture/space-unicode-values]

入力 (escaped):
`"architecture-beta\ngroup labels [  A  B\t C  ]\n"`.

出力
([label-content/bare-padding-output.mmd](../tests/fixtures/architecture/label-content/bare-padding-output.mmd)):

```mmd
architecture-beta
  group labels[  A  B	 C  ]
```

### Port colons

`a:R` と `L:b` のように port の colon の両側を詰めます。
colon は列を揃える欄ではなく端点の一部だからです。
trivia と hidden の境界は詰めずに保ちます。

[fixture: architecture/port-colons/port-colons-tight]

入力 (escaped):
`"architecture-beta\nservice a\nservice b\na {group} : R -- L : b {group}\n"`.

出力
([port-colons/port-colons-tight-output.mmd](../tests/fixtures/architecture/port-colons/port-colons-tight-output.mmd)):

```mmd
architecture-beta
  service a
  service b
  a{group}:R -- L:b{group}
```

### Arrow lines

線と任意の marker をまとめ、その両側を空白1個にします。
`a:R <-- L:b`、`a:T --> B:b`、`a:R <--> L:b` とし、port から線を区別します。
`>--<` を含め、実際の marker の文字を保ちます。
有無の flag から文字は決められません。
marker のない線も同じ空白にします。

[fixture: architecture/arrow-lines/arrow-both-markers]

[fixture: architecture/arrow-lines/arrow-end-marker]

[fixture: architecture/arrow-lines/arrow-no-markers]

[fixture: architecture/arrow-lines/arrow-reversed-markers]

[fixture: architecture/arrow-lines/arrow-start-marker]

[corpus fixture: architecture/db-directions]

[corpus fixture: architecture/gram-edge-separated-dashes]

入力 (escaped):
`"architecture-beta\nservice a\nservice b\na:R < -- > L:b\n"`.

出力
([arrow-lines/arrow-both-markers-output.mmd](../tests/fixtures/architecture/arrow-lines/arrow-both-markers-output.mmd)):

```mmd
architecture-beta
  service a
  service b
  a:R <--> L:b
```

### Arrow labels

ラベル付きの線は `a:R <-[label]-> L:b` と印字します。
単 dash、角括弧ラベル全体、marker を視覚上の1単位にします。
通常の外側の隙間だけを除き、空白付きの引用符風の文字や quoted の空値も、
ラベルの全範囲を保ちます。

[fixture: architecture/arrow-labels/edge-label-padded-quote]

[fixture: architecture/arrow-labels/edge-label-quoted]

[fixture: architecture/arrow-labels/labelled-dash-tight]

[corpus fixture: architecture/gram-edge-reversed-labeled-markers]

[corpus fixture: architecture/db-edge-title-quote-only]

入力 (escaped):
`"architecture-beta\nservice a\nservice b\na:R - [ \"x\" ] - L:b\n"`.

出力
([arrow-labels/edge-label-padded-quote-output.mmd](../tests/fixtures/architecture/arrow-labels/edge-label-padded-quote-output.mmd)):

```mmd
architecture-beta
  service a
  service b
  a:R -[ "x" ]- L:b
```

### Group modifiers

作者の `{group}` は `a{group}:R` のように端点に付け、
ID と一緒に読める形にします。
固定の内側と両端の有無を保ち、所属のない node でも削除しません。
解決した group ID へ置き換えません。

[fixture: architecture/group-modifiers/modifier-touch]

[corpus fixture: architecture/db-group-modifier-junction]

[corpus fixture: architecture/db-group-modifier-one-group]

[corpus fixture: architecture/db-group-modifier-other-parent]

[corpus fixture: architecture/gram-hidden-modifier-gaps]

入力 (escaped):
`"architecture-beta\nservice a\nservice b\na  {group}:R -- L:b\t{group}\n"`.

出力
([group-modifiers/modifier-touch-output.mmd](../tests/fixtures/architecture/group-modifiers/modifier-touch-output.mmd)):

```mmd
architecture-beta
  service a
  service b
  a{group}:R -- L:b{group}
```

### Alignment

`align`、row・column の方向、各 member の間は通常の空白1個です。
列揃え、member の並べ替え、繰り返す制約の統合、折り返しはしません。
作者の順番や可視 EOL を変えずに隙間を統一します。

[fixture: architecture/alignment/alignment-row-and-column]

[corpus fixture: architecture/db-align-forward-repeat]

[corpus fixture: architecture/db-align-layout-conflict]

入力 (escaped):
`"architecture-beta\nservice a\nservice b\njunction j\nalign\t row\t a   b\tj\nalign  column j\t b\n"`.

出力
([alignment/alignment-row-and-column-output.mmd](../tests/fixtures/architecture/alignment/alignment-row-and-column-output.mmd)):

```mmd
architecture-beta
  service a
  service b
  junction j
  align row a b j
  align column j b
```

### Title

共有の共通行処理を使い、
`title value` は common whitespace の端だけを trim します。
null と空白だけの値は `title` とし、同じ意味の外側の空白を詰めます。
trivia を挟んでも次の物理行を値にしません。
architecture の summary が title を公開しなくても、文と内容を保ちます。
trivia のある値と保護された hidden の境界は source の隙間を保ちます。

[corpus fixture: architecture/directive-fields]

[fixture: architecture/title/empty-next-statement]

[fixture: architecture/title/title-edge-trim]

[fixture: architecture/title/title-empty]

[fixture: architecture/title/title-next-global-gap]

[corpus fixture: architecture/common-title-next-statement]

[corpus fixture: architecture/common-title-comment-gap]

[corpus fixture: architecture/common-title-literal-quotes]

[corpus fixture: architecture/common-repeat-empty]

入力 (escaped):
`"architecture-beta\ntitle\n%% next\nservice next_title\ntitle \"unclosed\n"`.

出力
([title/empty-next-statement-output.mmd](../tests/fixtures/architecture/title/empty-next-statement-output.mmd)):

```mmd
architecture-beta
  title
  %% next
  service next_title
  title "unclosed
```

### Accessibility lines

共有の `accTitle: value` と `accDescr: value` を使います。
colon を keyword に付け、trim した非空値の前は空白1個、空なら colon で終えます。
これにより外側の空白を統一します。
次行の文を取り込まず、colon 後の波括弧は行値のまま保ちます。
保護された trivia と hidden の隙間を優先します。

[fixture: architecture/accessibility-lines/a11y-empty-comment-gap]

[fixture: architecture/accessibility-lines/accdescr-spacing]

[fixture: architecture/accessibility-lines/acctitle-spacing]

[fixture: architecture/accessibility-lines/empty-next-statement]

[corpus fixture: architecture/common-acctitle-next-statement]

[corpus fixture: architecture/common-accdescr-next-statement]

[corpus fixture: architecture/common-repeat-empty]

入力 (escaped):
`"architecture-beta\naccTitle: %% note\n\naccDescr: %% note\nservice a\n"`.

出力
([accessibility-lines/a11y-empty-comment-gap-output.mmd](../tests/fixtures/architecture/accessibility-lines/a11y-empty-comment-gap-output.mmd)):

```mmd
architecture-beta
  accTitle: %% note

  accDescr: %% note
  service a
```

### Description blocks

共有の `layoutDescriptionBlock` を使います。
keyword と開始、内側の端の接触を保ち、存在する外側の空白列は1個にします。
空白だけの内側は囲む文字がないため `{}` にします。
開始前の単なる空白は結合し、実際の trivia は改行を保ちます。
comment・directive だけの内側、非空値の継続列と内部空行を保ちます。
独立する閉じは文の位置に揃え、最初の閉じ波括弧が値を終える規則も保ちます。

[fixture: architecture/description-blocks/asymmetric]

[fixture: architecture/description-blocks/block-empty-fixed]

[fixture: architecture/description-blocks/block-present-spaces-fixed]

[fixture: architecture/description-blocks/block-touching-fixed]

[fixture: architecture/description-blocks/empty-block-comment-only-fixed]

[fixture: architecture/description-blocks/empty-block-global-only-fixed]

[fixture: architecture/description-blocks/interior-trivia]

[fixture: architecture/description-blocks/opener-trivia]

[corpus fixture: architecture/common-block-newline-gap]

[corpus fixture: architecture/common-block-comment-gap]

[corpus fixture: architecture/common-block-directive-gap]

[corpus fixture: architecture/common-description-block-comment]

[corpus fixture: architecture/common-description-block-directive]

[corpus fixture: architecture/common-block-whitespace]

[test: architecture/description-blocks/unicode-empty]

[test: architecture/description-blocks/unicode-opener]

入力 (escaped):
`"architecture-beta\naccDescr{A }\naccDescr{ B}\naccDescr {C}\naccDescr\n\n{ D }\n"`.

出力
([description-blocks/asymmetric-output.mmd](../tests/fixtures/architecture/description-blocks/asymmetric-output.mmd)):

```mmd
architecture-beta
  accDescr{A }
  accDescr{ B}
  accDescr {C}
  accDescr { D }
```

### Multiline values

printWidth で折り返しません。
通常の部品間の可視 LF は拒否され、
文字 icon やラベルの reflow は Db を変え得ます。
作者の物理行、値の継続列と内部空行を保ちます。
独立する説明の閉じだけは共有の配置に揃えます。

[fixture: architecture/multiline-values/continuation-columns]

[fixture: architecture/multiline-values/no-wrap-long-declaration]

[fixture: architecture/multiline-values/no-wrap-long-edge]

[corpus fixture: architecture/line-lf-string-title]

入力 (escaped):
`"architecture-beta\nservice multi \"A\n   B\n\nC\" [\"D\n E\"]\naccDescr {\n  F\n\n G\n}\n"`.

出力
([multiline-values/continuation-columns-output.mmd](../tests/fixtures/architecture/multiline-values/continuation-columns-output.mmd)):

```mmd
architecture-beta
  service multi "A
   B

C" ["D
 E"]
  accDescr {
  F

 G
  }
```

### Comments

通常の独立コメントは本文の1段、見出し前は第1列に揃えます。
inline は同じ行で接触を保ち、離れていれば空白1個にします。
付属先を保つため mark・内容・末尾空白を保持します。
native comment は LF・CR で終わり、LS・PS は内容です。
先に始まった値は内側の percent 文字を所有し、共通行はそこで終わります。
common が除く領域は全 source と継続列を保ちます。

[fixture: architecture/comments/comment-attachments]

[fixture: architecture/comments/value-ownership]

[corpus fixture: architecture/space-comment-ls]

[corpus fixture: architecture/space-comment-ps]

[corpus fixture: architecture/comment-in-quoted-label]

[corpus fixture: architecture/comment-directive-in-mark]

[corpus fixture: architecture/comment-directive-in-value]

[test: architecture/comments/ls-ps-content]

入力 (escaped):
`"architecture-beta\nservice percent \"A%%B\" [C%%D]\naccDescr {E%%F}\ntitle Topic%% inline\n"`.

出力
([comments/value-ownership-output.mmd](../tests/fixtures/architecture/comments/value-ownership-output.mmd)):

```mmd
architecture-beta
  service percent "A%%B" [C%%D]
  accDescr {E%%F}
  title Topic%% inline
```

### Global directives

Root directive の内容・順序・所有位置・各側の接触を保ちます。
通常の独立開始だけ本文の1段に揃え、複数行の内部と EOF までの末尾は保ちます。
common の除去は両側を結合するため、境界の空白を消すと宣言が拒否され得ます。
部品間・値内部の directive を保ち、不透明な内容を JSON として扱いません。

[fixture: architecture/global-directives/composite-boundaries]

[fixture: architecture/global-directives/global-both-separated]

[fixture: architecture/global-directives/global-left-touch-right-separated]

[fixture: architecture/global-directives/global-neither-side-separated]

[fixture: architecture/global-directives/global-side-spacing]

[fixture: architecture/global-directives/global-standalone]

[fixture: architecture/global-directives/inside-values]

[fixture: architecture/global-directives/multiline]

[corpus fixture: architecture/directive-fields]

[corpus fixture: architecture/directive-edge-components]

[corpus fixture: architecture/directive-parent-align-components]

[corpus fixture: architecture/directive-icon-delimiters]

[corpus fixture: architecture/directive-group-delimiters]

[corpus fixture: architecture/end-group-unclosed-directive]

[corpus fixture: architecture/end-junction-unclosed-directive]

入力 (escaped):
`"architecture-beta\nservice composite(%%{wrap}%%cloud%%{wrap}%%)\nservice target\ncomposite{%%{wrap}%%group%%{wrap}%%} : R < %%{wrap}%% -- > L :target\n"`.

出力
([global-directives/composite-boundaries-output.mmd](../tests/fixtures/architecture/global-directives/composite-boundaries-output.mmd)):

```mmd
architecture-beta
  service composite(%%{wrap}%%cloud%%{wrap}%%)
  service target
  composite{%%{wrap}%%group%%{wrap}%%}:R < %%{wrap}%% --> L:target
```

### Hidden forms

ArchitectureIgnoredText は名前付き gap、textBeforeHeader、body、textAfter の
owner ごとに1回だけ保ち、trivia を除いた value でなく全 source 範囲を使います。
native YAML と DIRECTIVE は不透明で、
frontmatter や Root directive ではありません。
本文の開始は字下げできますが、内部列と閉じの列を保ちます。
三重 fence、別々の form、後の有効な閉じ、内部の global な切れ目を保ちます。
先行する値は hidden 風の文字を所有し、
icon・modifier 内に native gap を作りません。

[fixture: architecture/hidden-forms/body-directive]

[fixture: architecture/hidden-forms/body-yaml]

[fixture: architecture/hidden-forms/hidden-group-parent-gaps]

[fixture: architecture/hidden-forms/hidden-rhs-modifier-gap]

[fixture: architecture/hidden-forms/yaml-named-icon-title-and-parent-gaps]

[corpus fixture: architecture/hidden-directive-unit-gaps]

[corpus fixture: architecture/hidden-yaml-group-gap]

[corpus fixture: architecture/hidden-yaml-service-gap]

[corpus fixture: architecture/hidden-yaml-junction-gap]

[corpus fixture: architecture/hidden-yaml-parent-gap]

[corpus fixture: architecture/hidden-yaml-edge-gaps]

[corpus fixture: architecture/hidden-yaml-align-gap]

[corpus fixture: architecture/hidden-yaml-three-fences]

[corpus fixture: architecture/hidden-yaml-adjacent-later-closer]

[corpus fixture: architecture/lex-yaml-two-nonempty]

[corpus fixture: architecture/lex-yaml-global-directive]

[corpus fixture: architecture/lex-yaml-common-comment]

[corpus fixture: architecture/lex-yaml-selected-semicolon]

[corpus fixture: architecture/lex-native-directive-selected-semicolon]

[corpus fixture: architecture/hidden-directive-nonqualifying-close]

[corpus fixture: architecture/hidden-directive-close-glued]

[corpus fixture: architecture/hidden-directive-unclosed]

[corpus fixture: architecture/hidden-directive-inside-values]

[corpus fixture: architecture/hidden-yaml-inside-values]

[corpus fixture: architecture/gram-hidden-inside-icon]

[corpus fixture: architecture/gram-hidden-inside-modifier]

入力 (escaped):
`"architecture-beta\n%%{!opaque\nbody}%%\nservice body_directive\n"`.

出力
([hidden-forms/body-directive-output.mmd](../tests/fixtures/architecture/hidden-forms/body-directive-output.mmd)):

```mmd
architecture-beta
  %%{!opaque
body}%%
  service body_directive
```

### Hidden boundaries

共有の消費済み LF と閉じの padding の規則を使います。
これらの境界が次の文の可視 EOL を決めるためです。
閉じの padding がない文末 suffix は、次の文までに予備の LF が1個必要です。
EOF も文を終えます。
見出し自身の hidden form の直後だけ予備の LF は不要です。
見出し行に残った文も、その suffix の後ろは文と文の境界です。
複数 suffix の owner と可視 EOL 後の form を区別し、
外側の余分な空行は共有の最大1空行の規則に従います。

[fixture: architecture/hidden-boundaries/header-and-statement]

[fixture: architecture/hidden-boundaries/header-inline-statement-suffix-spare-fixed]

[fixture: architecture/hidden-boundaries/header-own-hidden-no-spare-fixed]

[fixture: architecture/hidden-boundaries/hidden-multiple-blank-grouping]

[fixture: architecture/hidden-boundaries/suffix-space]

[fixture: architecture/hidden-boundaries/yaml-header-inline-statement-suffix]

[fixture: architecture/hidden-boundaries/yaml-space]

[corpus fixture: architecture/hidden-directive-group-space]

[corpus fixture: architecture/hidden-directive-closing-space]

[corpus fixture: architecture/hidden-directive-junction-space]

[corpus fixture: architecture/hidden-directive-edge-space]

[corpus fixture: architecture/hidden-directive-align-space]

[corpus fixture: architecture/hidden-directive-title-space]

[corpus fixture: architecture/hidden-directive-acctitle-space]

[corpus fixture: architecture/hidden-directive-accdescr-space]

[corpus fixture: architecture/hidden-directive-block-space]

[corpus fixture: architecture/hidden-directive-spare-lf]

[corpus fixture: architecture/hidden-yaml-service-space]

[corpus fixture: architecture/hidden-yaml-service-spare]

[corpus fixture: architecture/hidden-yaml-group-space]

[corpus fixture: architecture/hidden-yaml-junction-space]

[corpus fixture: architecture/hidden-yaml-edge-space]

[corpus fixture: architecture/hidden-yaml-align-space]

[corpus fixture: architecture/hidden-yaml-common-space]

[corpus fixture: architecture/hidden-yaml-title-absorbs-opener]

[corpus fixture: architecture/hidden-yaml-acctitle-absorbs-opener]

[corpus fixture: architecture/hidden-yaml-accdescr-absorbs-opener]

[corpus fixture: architecture/lex-hidden-two-suffixes]

[corpus fixture: architecture/lex-hidden-after-visible-eol]

[corpus fixture: architecture/hidden-directive-body]

[corpus fixture: architecture/hidden-yaml-after-header]

入力 (escaped):
`"architecture-beta%%{}%% group a%%{}%%\n\nservice b"`.

出力
([hidden-boundaries/header-and-statement-output.mmd](../tests/fixtures/architecture/hidden-boundaries/header-and-statement-output.mmd)):

```mmd
architecture-beta%%{}%% group a%%{}%%

  service b
```

### Blank lines

通常の ASCII 空行は文・trivia 間に最大1行残し、本文・文書端では除きます。
過剰な空白を除きながら、見た目のまとまりを保つためです。
値の内部、保持する prefix、保護区間、hidden 境界に必要な LF は各規則に従います。

[fixture: architecture/blank-lines/blank-collapse]

[fixture: architecture/blank-lines/blank-in-value-kept]

入力 (escaped):
`"\n\narchitecture-beta\n\n\nservice a\n\n \t\n\n%% note\n\n\nservice b\n\n\n"`.

出力
([blank-lines/blank-collapse-output.mmd](../tests/fixtures/architecture/blank-lines/blank-collapse-output.mmd)):

```mmd
architecture-beta
  service a

  %% note

  service b
```

### Trailing whitespace

見出し、
完結した宣言・辺・alignment・説明の閉じの後の無害な ASCII padding を除きます。
値と継続行、
コメント末尾、
directive・hidden 内部、
保持する prefix、
保護区間は保ちます。
hidden の閉じの padding は EOF でも保持します。
trim すると可視 EOL が消え得るためです。

[fixture: architecture/trailing-whitespace/trailing-exterior]

[fixture: architecture/trailing-whitespace/trailing-string-content-kept]

入力 (escaped):
`"architecture-beta \t\nservice a(cloud)[A] \t\njunction j\t\na:R -- L:j\t\nalign row a j \t\naccDescr {D}\t\n"`.

出力
([trailing-whitespace/trailing-exterior-output.mmd](../tests/fixtures/architecture/trailing-whitespace/trailing-exterior-output.mmd)):

```mmd
architecture-beta
  service a(cloud)[A]
  junction j
  a:R -- L:j
  align row a j
  accDescr {D}
```

### Frontmatter yaml

安全な実際の frontmatter だけを共有の guarded YAML formatter で整えます。
不正な YAML、字下げした fence、区切りの padding、HTML の危険、
整形で fence ができる本文は保ちます。
YAML は tabWidth 0 でも共有の正の最小字下げ幅を使います。
textBeforeHeader があれば、先頭 LF、コメント、通過した bare trivia、
second-scan form、real・hidden の順番を含む prefix 全体を保ちます。
整理すると無視された YAML が有効な data に変わり得るためです。

[fixture: architecture/frontmatter-yaml/frontmatter-delimiter-padding-kept]

[fixture: architecture/frontmatter-yaml/frontmatter-html-guard]

[fixture: architecture/frontmatter-yaml/frontmatter-indented-keep]

[fixture: architecture/frontmatter-yaml/frontmatter-safe]

[fixture: architecture/frontmatter-yaml/frontmatter-yaml-delimiter-hazard]

[fixture: architecture/frontmatter-yaml/frontmatter-zero-minimum-block-scalar]

[fixture: architecture/frontmatter-yaml/invalid-real]

[fixture: architecture/frontmatter-yaml/prefix-leading-lf-keep]

[fixture: architecture/frontmatter-yaml/real-and-retained]

[fixture: architecture/frontmatter-yaml/second-scan]

[corpus fixture: architecture/div-frontmatter-invalid-yaml]

[corpus fixture: architecture/div-invalid-keeps-config]

[corpus fixture: architecture/frontmatter-config]

[corpus fixture: architecture/div-frontmatter-open-tag-label]

[corpus fixture: architecture/detect-retained-before-second-scan]

[corpus fixture: architecture/detect-retained-bare-second-scan]

[corpus fixture: architecture/detect-retained-three-fences]

[corpus fixture: architecture/detect-retained-indent-opening]

[corpus fixture: architecture/retained-prefix-before-bare]

[corpus fixture: architecture/retained-directive-between-bare]

入力 (escaped):
`"---\ntitle: \"<a b=\\\"c\\\">\"\n---\narchitecture-beta\nservice a\n"`.

出力
([frontmatter-yaml/frontmatter-html-guard-output.mmd](../tests/fixtures/architecture/frontmatter-yaml/frontmatter-html-guard-output.mmd)):

```mmd
---
title: "<a b=\"c\">"
---
architecture-beta
  service a
```

### Semicolons

作者のセミコロンをすべて保ち、共有の `protectSemicolonPrefixes` を使います。
最後のセミコロンまでの文字区間を、交差する値と trivia 全体まで延ばして保護し、
安全な後ろの隙間だけを整えます。
保護された見出し・最初の文は一緒に保ちます。
選択された1個の削除や style・classDef の trigger 移動は、
別のセミコロンを選んで Db を変え得るため、
両 pass、
非 trigger、
entity、
値の物理行、
global 除去で結合する trigger を保ちます。

[fixture: architecture/semicolons/crossing-comment]

[fixture: architecture/semicolons/global-rejoin]

[fixture: architecture/semicolons/protected-header-first-statement]

[fixture: architecture/semicolons/selection]

[fixture: architecture/semicolons/values]

[corpus fixture: architecture/style-fields]

[corpus fixture: architecture/style-controls]

[corpus fixture: architecture/style-entity-semicolons]

[corpus fixture: architecture/style-block]

[corpus fixture: architecture/style-other-line]

[corpus fixture: architecture/style-quoted-lines]

[corpus fixture: architecture/lex-yaml-global-opener]

[corpus fixture: architecture/lex-label-selected-semicolon-after-quote]

[test: architecture/semicolons/unicode-segment]

入力 (escaped):
`"architecture-beta\naccDescr {\nstyle A fill:#red\n%% owned;\ntext\n}\n"`.

出力
([semicolons/crossing-comment-output.mmd](../tests/fixtures/architecture/semicolons/crossing-comment-output.mmd)):

```mmd
architecture-beta
  accDescr {
style A fill:#red
%% owned;
text
  }
```

### Line terminators and unicode

共有の host 方針で物理 CR・CRLF を LF にし、設定の endOfLine を出します。
値と hidden form の内部も同じです。
内容の LS・PS・NBSP・BOM は保ち、
共通の行値の端だけ common whitespace を trim します。
構造の非 ASCII 区切りは拒否のままです。
先頭 BOM は byte 同一性でなく Prettier host の処理に従います。

[corpus fixture: architecture/hidden-yaml-crlf]

[corpus fixture: architecture/line-cr-title]

[corpus fixture: architecture/line-cr-values]

[corpus fixture: architecture/frontmatter-crlf]

[corpus fixture: architecture/space-comment-ls]

[corpus fixture: architecture/space-comment-ps]

[corpus fixture: architecture/lex-yaml-ls-ps-body]

[corpus fixture: architecture/common-block-ls-gap]

[corpus fixture: architecture/common-block-bom-gap]

[corpus fixture: architecture/line-ls-between]

[corpus fixture: architecture/space-body-nbsp]

[corpus fixture: architecture/div-retained-bare-second-scan-ls]

[corpus fixture: architecture/space-bom-leading]

[corpus fixture: architecture/detect-retained-leading-bom]

[test: architecture/line-terminators-and-unicode/cr-structure]

[test: architecture/line-terminators-and-unicode/crlf-values-hidden]

[test: architecture/line-terminators-and-unicode/cr-yaml-block]

[test: architecture/line-terminators-and-unicode/output-crlf]

[test: architecture/line-terminators-and-unicode/output-cr]

[test: architecture/line-terminators-and-unicode/value-content]

[test: architecture/line-terminators-and-unicode/common-edge-trim]

[test: architecture/line-terminators-and-unicode/bom-header]

[test: architecture/line-terminators-and-unicode/hidden-content]

[test: architecture/line-terminators-and-unicode/description-content]

[test: architecture/line-terminators-and-unicode/frontmatter-crlf]

[test: architecture/line-terminators-and-unicode/frontmatter-bom]

Input (escaped): `"architecture-beta\rservice cr_node\r"`.

Output (escaped): `"architecture-beta\n  service cr_node\n"`.

### Final newline

空本文、最後の文・コメントを含め、通常の受理入力は設定の改行1個で終えます。
文書末尾を一定にするため、通常の末尾空行列は除きます。
EOF までの global directive と hidden の閉じの padding は、
共有の境界の挙動を保ちます。
閉じた hidden form には LF を加えられます。

[fixture: architecture/final-newline/ending-comment]

[fixture: architecture/final-newline/ending-common-empty]

[fixture: architecture/final-newline/ending-hidden-space]

[fixture: architecture/final-newline/ending-service]

[fixture: architecture/final-newline/ending-triple-comment]

[fixture: architecture/final-newline/global-open-at-eof]

[corpus fixture: architecture/hidden-directive-eof]

[corpus fixture: architecture/hidden-yaml-service-eof]

[corpus fixture: architecture/end-group-unclosed-directive]

[corpus fixture: architecture/end-junction-unclosed-directive]

入力 (escaped):
`"architecture-beta\nservice a"`.

出力
([final-newline/ending-service-output.mmd](../tests/fixtures/architecture/final-newline/ending-service-output.mmd)):

```mmd
architecture-beta
  service a
```

### Source order

すべての文、
参照、
alignment member、
繰り返す辺・制約、
空の代入を source 順に保ちます。
Db から木を再構成したり、公開順に宣言を並べたりすると作者の構造が失われます。
空の代入の削除は最終値を変え得ます。
数値に見える ID も書かれた文字のままです。

[fixture: architecture/source-order/authored-order]

[corpus fixture: architecture/db-mixed]

[corpus fixture: architecture/db-junction-order]

[corpus fixture: architecture/db-duplicate-edges]

[corpus fixture: architecture/db-align-forward-repeat]

[corpus fixture: architecture/lex-numeric-ids-text]

[corpus fixture: architecture/db-prototype-ids]

[corpus fixture: architecture/db-id-case]

[corpus fixture: architecture/common-repeat-empty]

入力 (escaped):
`"architecture-beta\nalign row later cross\njunction cross in parent\nservice later in parent\ngroup parent\nlater:R -- L:cross\nlater:R -- L:cross\nalign column cross later\nalign row later cross\ntitle First\ntitle\naccTitle: First\naccTitle:\naccDescr {First}\naccDescr {}\n"`.

出力
([source-order/authored-order-output.mmd](../tests/fixtures/architecture/source-order/authored-order-output.mmd)):

```mmd
architecture-beta
  align row later cross
  junction cross in parent
  service later in parent
  group parent
  later:R -- L:cross
  later:R -- L:cross
  align column cross later
  align row later cross
  title First
  title
  accTitle: First
  accTitle:
  accDescr {First}
  accDescr {}
```

### Specified readings

既存の directive-as-token-boundary、ignored-semicolon-as-token-boundary、
html-tag-in-frontmatter、embedded-data-opaque、
bare-percent-line-before-header の仕様の読みを使います。
architecture に受理を決める設定キーはなく、検出は C4 より前です。
生の拒否から生の Db を作りません。
拒否構文を修復せず、
単独整形は出力のない構文エラー、
Markdown は埋め込みを辞退します。
空の quoted icon・ラベル、空の説明、native hidden form に新しい差分は不要です。

[corpus fixture: architecture/div-frontmatter-invalid-yaml]

[corpus fixture: architecture/div-frontmatter-open-tag-icon]

[corpus fixture: architecture/div-retained-bare-second-scan-ls]

[corpus fixture: architecture/div-directive-name]

[corpus fixture: architecture/div-semicolon-parent-id]

[corpus fixture: architecture/error-service-duplicate]

[corpus fixture: architecture/error-edge-group-lhs]

[corpus fixture: architecture/config-embedded-limit]

[test: architecture/specified-readings/bare-unicode]

たとえば `service a%%{wrap}%%b` は ID 内部の切れ目で、修復した出力を作りません。

### Markdown fences

共有の Markdown 経路で字下げを除いた payload に同じ規則を適用します。
fence・list・quote の字下げと EOL は host が用意します。
最後の hidden padding を含め、payload の最終行の padding は host が除きますが、
内部の hidden 境界は必要です。
host の出力と冪等性は payload の Db・source 保持と別に確認します。

[test: architecture Markdown: top-level]

[test: architecture Markdown: list]

[test: architecture Markdown: quote]

[test: architecture Markdown: zero]

[test: architecture Markdown: tabs]

[test: architecture Markdown: hidden-gap]

[test: architecture Markdown: hidden-boundary]

[test: architecture Markdown: preheader]

[test: architecture Markdown: frontmatter]

[test: architecture Markdown: global-and-semicolons]

[test: architecture Markdown: final-comment]

[test: architecture Markdown: final-hidden-padding]

[test: architecture Markdown: rejected]

入力 (escaped):

````json
"```mermaid\narchitecture-beta service fence\n```\n"
````

出力 (escaped):

````json
"```mermaid\narchitecture-beta\n  service fence\n```\n"
````
