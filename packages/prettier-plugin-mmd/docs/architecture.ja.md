# Architecture formatting rules

英語版: [architecture.md](./architecture.md)

29項目の決定を、作者の AST と共有の平坦な本文処理で実装します。
以下に各整形の選択を説明します。
互換性の制限は [compatibility.ja.md](./compatibility.ja.md) にあります。

## Rules

### Header

`architecture-beta` を第1列に置き、通常の最初の文を次行へ移します。
ほかの図種と同じです。
空の本文も保ちます。
隠れた形の境界と保護された見出し・本文の区間を優先し、
接着したキーワードを作りません。

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

入力（エスケープ表記）: `"architecture-beta accTitle: Topic\n"`

出力
([header/header-inline-accessibility-output.mmd](../tests/fixtures/architecture/header/header-inline-accessibility-output.mmd)):

```mmd
architecture-beta
  accTitle: Topic
```

### Indentation

通常の宣言・辺・整列指定・共通文・独立した注釈類は設定の1段だけ字下げします。
本文は平坦で、`in` は参照なので入れ子の段を増やしません。
architecture の列には文法上の意味がないため、`tabWidth: 0` は空白0個、
`useTabs` は幅0でもタブ1個です。
説明本文以外の値の継続列、隠れた形の閉じ、保持する前置部分は原形を保ちます。

[fixture: architecture/indentation/indent-four]

[fixture: architecture/indentation/indent-tabs]

[fixture: architecture/indentation/indent-two]

[fixture: architecture/indentation/indent-zero]

[fixture: architecture/indentation/zero-tabs]

入力（エスケープ表記）: `"architecture-beta\nservice a\n"`

設定: `{"tabWidth": 4}`

出力
([indentation/indent-four-output.mmd](../tests/fixtures/architecture/indentation/indent-four-output.mmd)):

```mmd
architecture-beta
    service a
```

### Statements one per line

通常の文は、ほかの図種と同じく1行ずつ印字します。
共通の行値は物理行末までのキーワードに見える文字も所有するため、分割しません。
セミコロンは文の区切りではありません。
隣接する不正な文や部品の隙間に使われた空の説明は、失敗のままです。

[fixture: architecture/statements-one-per-line/line-value-owns-keywords]

[corpus fixture: architecture/gram-same-line-statements]

[corpus fixture: architecture/end-group-semicolon]

[corpus fixture: architecture/gram-empty-description-gap]

[corpus fixture: architecture/gram-empty-description-after-service]

入力（エスケープ表記）: `"architecture-beta title t service a; junction j\n"`

出力
([statements-one-per-line/line-value-owns-keywords-output.mmd](../tests/fixtures/architecture/statements-one-per-line/line-value-owns-keywords-output.mmd)):

```mmd
architecture-beta title t service a; junction j
```

### Declaration spacing

キーワードと ID の間は空白1個です。
`group g(cloud)[G]`、`service a(server)[A]`、`service a[A]` と印字し、
括弧・角括弧の付属部品を1つの node として印字します。
文字アイコンは独立した値なので `service a "I" [A]` とします。
省略された部品は補わず、注釈類のある隙間は接触を保ちます。

[fixture: architecture/declaration-spacing/double-text-icon]

[fixture: architecture/declaration-spacing/group-id]

[fixture: architecture/declaration-spacing/group-label]

[fixture: architecture/declaration-spacing/junction-id]

[fixture: architecture/declaration-spacing/named-group]

[fixture: architecture/declaration-spacing/named-service]

[fixture: architecture/declaration-spacing/service-id]

[fixture: architecture/declaration-spacing/service-label]

[fixture: architecture/declaration-spacing/single-text-icon]

入力（エスケープ表記）: `"architecture-beta\ngroup  g (cloud) [Group]\n"`

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

入力（エスケープ表記）: `"architecture-beta\ngroup p\ngroup g(cloud)[G]in\tp\n"`

出力
([parent-references/group-parent-output.mmd](../tests/fixtures/architecture/parent-references/group-parent-output.mmd)):

```mmd
architecture-beta
  group p
  group g(cloud)[G] in p
```

### Named icons

括弧内のアイコン名は先頭の記号や未知の名前も原綴を保ちます。
この構文単位は空でなく空白のない名前を要求するため、空白を加えると拒否されます。
完全な部品間の大域的なディレクティブは境界を保ちます。

[fixture: architecture/named-icons/leading-symbols]

[fixture: architecture/named-icons/unknown-name]

[corpus fixture: architecture/lex-icon-leading-symbols]

[corpus fixture: architecture/db-unknown-icon]

[corpus fixture: architecture/lex-icon-empty]

[corpus fixture: architecture/lex-icon-spaces]

[corpus fixture: architecture/lex-icon-text-parenthesized]

入力（エスケープ表記）: `"architecture-beta\ngroup symbols (-:A_)\n"`

出力
([named-icons/leading-symbols-output.mmd](../tests/fixtures/architecture/named-icons/leading-symbols-output.mmd)):

```mmd
architecture-beta
  group symbols(-:A_)
```

### Text icons

`StringLiteral` の範囲全体を保ちます。
単引用符、二重引用符、反対側の引用符、空文字、エスケープ、空白、
継続行も保持します。
ただし、テキストの中の空白とタブの連なりは、
空白 1 つにして印字します（[ラベルの内容](#label-content)を参照）。
`singleQuote` では書き換えません。
再符号化は作者の綴りを失い、両端の空白の除去や復号は Db を変え得るためです。

[fixture: architecture/text-icons/double-quote]

[fixture: architecture/text-icons/empty]

[fixture: architecture/text-icons/padding]

[fixture: architecture/text-icons/single-quote]

[corpus fixture: architecture/lex-string-conversion]

[corpus fixture: architecture/lex-string-number-escape]

[corpus fixture: architecture/directive-empty-text-icon]

入力（エスケープ表記）:
`"architecture-beta\nservice double\"a'\\n\\t\\q\\\\b\"\n"`

設定: `{"singleQuote": true}`

出力
([text-icons/double-quote-output.mmd](../tests/fixtures/architecture/text-icons/double-quote-output.mmd)):

```mmd
architecture-beta
  service double "a'\n\t\q\\b"
```

### Label forms

`ArchitectureLabel` の全範囲と引用符の綴りを保ちますが、
引用符つきの平易なラベルは引用符なしで印字します（[引用符](#quotes)を参照）。
引用符の前に余白があるラベル（`[ "x" ]`）は、
木では引用符を含む引用符なしラベルですが、
mermaid.js は余白を除いて引用符を外し `x` と読むので、
`["x"]` や `[x]` と同じに読みます。
印字は引用符つきのラベルと同じで、
`service padded [ "x" ]` は `service padded[x]` になります。
引用符に見えても引用符付きとして読まれなかったテキストは、引用符なしのままにし、
変換後の文字から種別を推測しません。

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

入力（エスケープ表記）: `"architecture-beta\nservice padded [ \"x\" ]\n"`

設定: `{"singleQuote": true}`

出力
([label-forms/padded-quotes-output.mmd](../tests/fixtures/architecture/label-forms/padded-quotes-output.mmd)):

```mmd
architecture-beta
  service padded[x]
```

### Quotes

引用符つきの平易なラベルは、mermaid.js の文書の例のとおり、
引用符なしで印字します。
（[テキストの引用符](./compatibility.ja.md#テキストの引用符)）。
`group api(cloud)["API Group"]` は `group api(cloud)[API Group]` と印字し、
`service s(server)['Plain Single']` は `service s(server)[Plain Single]`
と印字します。
平易なラベルとは、角括弧、引用符、バックスラッシュ、改行を含まず、
両端に空白がないものです。
引用符なしのラベルは次の `]` まで続き、
同じ引用符で始まり終わるラベルは引用符つきのラベルとして読まれるので、`"a-b"`、
`"A.B"`、`"日本語"` は引用符なしで印字します。
`"a[b"`、空のラベル、引用符の内側に余白があるラベル（`[" padded "]`）は、
引用符を保ちます。
バックスラッシュや引用符があるラベルも同じです。
mermaid.js は、読むタイトルの外側の `"` か `'` の引用符 1 組を外し、
外側に引用符があったタイトルだけで `\"` と `\'` を `"` と `'` に戻すので、
`"a\"b"` を `a\"b` と、`"'x'"` を `'x'` と印字すると、
別のタイトルとして読まれます。
引用符なしのラベルを引用符で囲むことはありません。
ラベルの中の空白とタブの連続は空白 1 つにしますが、
それだけで 1 語になる場合は残します。
mermaid.js はラベルを、1 つの空白で区切った語ごとに描くので、タブだけの連続と、
空白にはさまれたタブは、別の語になります。
`"A<タブ>B"` は `A<タブ>B` と印字します。
これらの語は、mermaid.js がタイトルから残すものです。
角括弧を外し、両端の空白を除き、外側の引用符 1 組を外して、
再び両端の空白を除きます。
語の中や、語の中の角括弧の隣にある引用符も、ほかと同じく語の文字なので、
その隣のタブも残します。
`["A'<タブ>B"]` と `["A[<タブ>B"]` は書かれたまま印字します。
[fixture: quotes/labels-without-quotes]
[fixture: quotes/labels-with-punctuation-without-quotes]
[fixture: quotes/labels-that-need-quotes]
[fixture: quotes/labels-with-runs-without-quotes]
[fixture: quotes/labels-with-tab-words-kept]
[fixture: quotes/labels-with-quotes-beside-tab-words-kept]

入力
([quotes/labels-without-quotes-input.mmd](../tests/fixtures/architecture/quotes/labels-without-quotes-input.mmd)):

```mmd
architecture-beta
group api(cloud)["API Group"]
service db(database)["Database_1"] in api
service s(server)['Plain Single']
service t(server)[Already bare]
```

出力
([quotes/labels-without-quotes-output.mmd](../tests/fixtures/architecture/quotes/labels-without-quotes-output.mmd)):

```mmd
architecture-beta
  group api(cloud)[API Group]
  service db(database)[Database_1] in api
  service s(server)[Plain Single]
  service t(server)[Already bare]
```

### Label content

角括弧の内側はそのまま保ちますが、group と service のタイトル、
および矢印のラベル（[Arrow labels](#arrow-labels) を参照）の括弧に接する空白、
タブ、改行しない空白は例外です。
mermaid.js が両端の空白を除くからです。
`group a(cloud)[ API ]` は `group a(cloud)[API]` に、
`service s(server)["x" ]` は `service s(server)["x"]` になります。
[fixture: label-content/title-edge-whitespace-dropped]
保つ `;` のある行でも同じです。
ただし、行の規則が読む範囲は除きます（[Semicolons](#semicolons)を参照）。
その範囲の外の空白を落としても `;` は動かず、増えも減りもしないので、
行の規則は同じ `;` を選びます。
`group g(cloud)[ a;b ]` は `group g(cloud)[a;b]` に、
`service s(server)[ x; ] in g` は `service s(server)[x;] in g` になります。
空白が、行の規則が読むかもしれない行の `:` と `#` の間にあるときは、
空白 1 つを残します。
空白があるかどうかが、無視される `;` を決めるからです。
`service style(logos:aws)[ #y; ]` は `service style(logos:aws)[ #y;]` になり、
`:` の前に `style` がない `service s(logos:aws)[ #y; ]` は
`service s(logos:aws)[#y;]` になります。
この規則はディレクティブを除いた行を読むので、その中の `style`、`:`、`#`、
`;` は区間を作りません。
`service%%{style}%% s0(logos:aws)[ #y; ]` は
`service %%{style}%%s0(logos:aws)[#y;]` に、
`service style1(logos:aws)[ #y ]%%{init:{"a":";"}}%%` は `[#y]` になります。
`;` がディレクティブの外にある `[ #y; ]` は、空白を残します。
[fixture: label-content/title-padding-line-rule-chars-in-directive]
行の途中の `%%` はコメント行ではないので、規則はそのテキストを読みます。
`service style3(logos:aws)[ #y ] %% note;` は
`service style3(logos:aws)[ #y] %% note;` になります。
注の `;` があるので、規則は `logos:aws` の `:` から合うからです。
`service classDef(logos:aws)[#a;style: ]%%#c;` は、
`%%` の後の `#` と `;` も規則に加わるので、変わりません。
[fixture: label-content/title-padding-line-rule-chars-in-comment]
ディレクティブにもコメントにも含まれない U+2028 と U+2029 は、
規則が読む行を終わらせるので、その前の `:` とその後の `;` は区間を作りません。
[test: architecture/label-content/title-style-rule-ends-at-u2028]
[test: architecture/label-content/title-style-rule-ends-at-u2029]
コメントやディレクティブを含むタイトルと、U+2028 や U+2029 を含む空白は、
書かれたまま残します。
[fixture: label-content/title-padding-with-directive-or-semicolon]
[fixture: label-content/title-padding-in-style-rule-stretch]
[fixture: label-content/title-padding-after-colon-without-style]
[test: architecture/label-content/title-u2028]
[test: architecture/label-content/title-u2029]
[test: architecture/label-content/title-with-semicolon-u2028]
[test: architecture/label-content/title-with-semicolon-u2029]
テキストの中の空白とタブの連なりは、図が同じなので、空白 1 つにして印字します。
（[同じに描かれるテキスト中の空白の連なり](./compatibility.ja.md#同じに描かれるテキスト中の空白の連なり)）。
`group labels[A  B]` は `group labels[A B]` と印字します。
[fixture: label-content/bare-padding]
空白だけの値、引用符付きの空値、エスケープ、HTML、entity、
隠れた形に見える文字は保ちます。
Db がこれらを区別するためです。
コメントやディレクティブのあるタイトルも、そのままです。
物理 CR・CRLF だけは共有の埋め込み先方針に従います。

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

入力（エスケープ表記）: `"architecture-beta\ngroup labels [  A  B\t C  ]\n"`

出力
([label-content/bare-padding-output.mmd](../tests/fixtures/architecture/label-content/bare-padding-output.mmd)):

```mmd
architecture-beta
  group labels[A B C]
```

### Port colons

`a:R` と `L:b` のように port のコロンの両側を詰めます。
このコロンは名前の中のコロンで、辺が端を名付ける仕方の一部です。
`R` は service `a` の側であり、どちらの側にも空白を置きません。
詳しくは
[コロンがどの種類かの決め方](./printed-form.ja.md#コロンがどの種類かの決め方)
の手順 1 を参照してください。
列を揃える欄ではありません。
注釈類と隠れた形の境界は詰めずに保ちます。

[fixture: architecture/port-colons/port-colons-tight]

入力（エスケープ表記）:
`"architecture-beta\nservice a\nservice b\na {group} : R -- L : b {group}\n"`

出力
([port-colons/port-colons-tight-output.mmd](../tests/fixtures/architecture/port-colons/port-colons-tight-output.mmd)):

```mmd
architecture-beta
  service a
  service b
  a{group}:R -- L:b{group}
```

### Arrow lines

線と任意の印をまとめ、その両側を空白1個にします。
`a:R <-- L:b`、`a:T --> B:b`、`a:R <--> L:b` とし、port から線を区別します。
`>--<` を含め、実際の印の文字を保ちます。
有無の真偽値から文字は決められません。
印のない線も同じ空白にします。

[fixture: architecture/arrow-lines/arrow-both-markers]

[fixture: architecture/arrow-lines/arrow-end-marker]

[fixture: architecture/arrow-lines/arrow-no-markers]

[fixture: architecture/arrow-lines/arrow-reversed-markers]

[fixture: architecture/arrow-lines/arrow-start-marker]

[corpus fixture: architecture/db-directions]

[corpus fixture: architecture/gram-edge-separated-dashes]

入力（エスケープ表記）:
`"architecture-beta\nservice a\nservice b\na:R < -- > L:b\n"`

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
1 つのダッシュ、角括弧ラベル全体、印を視覚上の1単位にします。
通常の外側の隙間と、ラベルの括弧に接する空白、タブ、改行しない空白を、
group や service のタイトルと同じく除きます。
[ラベルの内容](#label-content) を参照してください。
`a:R -[ Label ]- L:b` は `a:R -[Label]- L:b` に、
`a:R - [ "x" ] - L:b` は `a:R -["x"]- L:b` と印字します。
mermaid.js がラベルの両端の空白を除くので Db は同じです。
引用符付きの空値も含め、ラベルの残りの範囲を保ちます。
コメントやディレクティブがあるラベルと、U+2028 や U+2029 を含む空白は、
書かれたまま残します。

[fixture: architecture/arrow-labels/edge-label-padded-quote]

[fixture: architecture/arrow-labels/edge-label-quoted]

[fixture: architecture/arrow-labels/labelled-dash-tight]

[fixture: architecture/arrow-labels/edge-label-padding-dropped]

[fixture: architecture/arrow-labels/edge-label-directive-kept]

[test: architecture/arrow-labels/edge-label-padding-u2028]

[test: architecture/arrow-labels/edge-label-padding-u2029]

[corpus fixture: architecture/gram-edge-reversed-labeled-markers]

[corpus fixture: architecture/db-edge-title-quote-only]

入力（エスケープ表記）:
`"architecture-beta\nservice a\nservice b\na:R - [ \"x\" ] - L:b\n"`

出力
([arrow-labels/edge-label-padded-quote-output.mmd](../tests/fixtures/architecture/arrow-labels/edge-label-padded-quote-output.mmd)):

```mmd
architecture-beta
  service a
  service b
  a:R -["x"]- L:b
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

入力（エスケープ表記）:
`"architecture-beta\nservice a\nservice b\na  {group}:R -- L:b\t{group}\n"`

出力
([group-modifiers/modifier-touch-output.mmd](../tests/fixtures/architecture/group-modifiers/modifier-touch-output.mmd)):

```mmd
architecture-beta
  service a
  service b
  a{group}:R -- L:b{group}
```

### Alignment

`align`、row・column の方向、各構成要素の間は通常の空白1個です。
列揃え、構成要素の並べ替え、繰り返す制約の統合、折り返しはしません。
作者の順番や可視 EOL を変えずに隙間を統一します。

[fixture: architecture/alignment/alignment-row-and-column]

[corpus fixture: architecture/db-align-forward-repeat]

[corpus fixture: architecture/db-align-layout-conflict]

入力（エスケープ表記）:
`"architecture-beta\nservice a\nservice b\njunction j\nalign\t row\t a   b\tj\nalign  column j\t b\n"`

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

共有の共通行処理を使い、`title value` の両端から、
共通規則が読む空白だけを除きます。
`null` と空白だけの値は `title` とし、同じ意味の外側の空白を詰めます。
注釈類を挟んでも次の物理行を値にしません。
architecture の要約が title を公開しなくても、文と内容を保ちます。
注釈類のある値と保護された隠れた形の境界は原文の隙間を保ちます。
題の終わりのディレクティブは、それぞれの前に空白があれば空白 1 つを置き、
行末の空白の有無にかかわらず、最後のディレクティブの後の空白を除いて印字します。
（[同じに描かれるキーワードの後のテキスト](./compatibility.ja.md#同じに描かれるキーワードの後のテキスト)）。
[fixture: title/title-directives-end-blanks-dropped]

[corpus fixture: architecture/directive-fields]

[fixture: architecture/title/empty-next-statement]

[fixture: architecture/title/title-edge-trim]

[fixture: architecture/title/title-empty]

[fixture: architecture/title/title-next-global-gap]

[corpus fixture: architecture/common-title-next-statement]

[corpus fixture: architecture/common-title-comment-gap]

[corpus fixture: architecture/common-title-literal-quotes]

[corpus fixture: architecture/common-repeat-empty]

入力（エスケープ表記）:
`"architecture-beta\ntitle\n%% next\nservice next_title\ntitle \"unclosed\n"`

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
コロンをキーワードに付け、両端の空白を除いた非空値の前は空白1個、
空ならコロンで終えます。
これにより外側の空白を統一します。
次行の文を取り込まず、コロン後の波括弧は行値のまま保ちます。
保護された注釈類と隠れた形の隙間を優先します。
値の終わりのディレクティブは、それぞれの前に空白があれば空白 1 つを置き、
最後のディレクティブの後の空白を除いて印字します。
（[同じに描かれるキーワードの後のテキスト](./compatibility.ja.md#同じに描かれるキーワードの後のテキスト)）。
[fixture: accessibility-lines/acc-directives-end-blanks-dropped]

[fixture: architecture/accessibility-lines/a11y-empty-comment-gap]

[fixture: architecture/accessibility-lines/accdescr-spacing]

[fixture: architecture/accessibility-lines/acctitle-spacing]

[fixture: architecture/accessibility-lines/empty-next-statement]

[corpus fixture: architecture/common-acctitle-next-statement]

[corpus fixture: architecture/common-accdescr-next-statement]

[corpus fixture: architecture/common-repeat-empty]

入力（エスケープ表記）:
`"architecture-beta\naccTitle: %% note\n\naccDescr: %% note\nservice a\n"`

出力
([accessibility-lines/a11y-empty-comment-gap-output.mmd](../tests/fixtures/architecture/accessibility-lines/a11y-empty-comment-gap-output.mmd)):

```mmd
architecture-beta
  accTitle: %% note

  accDescr: %% note
  service a
```

### Description blocks

1 行の説明ブロックは、
[1 行の説明ブロック](./compatibility.ja.md#1-行の説明ブロック) に従います。
波括弧を残すブロックは、境界がわかるよう、
キーワードと開始波括弧の間に空白を 1 つ置きます。
空白だけの内側は囲む文字がないため `{}` にします。
開始前の単なる空白は結合し、実際の注釈類は改行を保ちます。
コメント・ディレクティブだけの内側を保ちます。
通常の説明本文と独立したコメント行は文より1段内側に揃えます。
Db で LF 後の字下げが取り除かれるためです。
改行、内部の空行、行末空白を保ちます。
ディレクティブと共有の除去対象となるコメント領域は原文全体を保ちます。
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

入力（エスケープ表記）:
`"architecture-beta\naccDescr{A }\naccDescr{ B}\naccDescr {C}\naccDescr\n\n{ D }\n"`

出力
([description-blocks/asymmetric-output.mmd](../tests/fixtures/architecture/description-blocks/asymmetric-output.mmd)):

```mmd
architecture-beta
  accDescr: A
  accDescr: B
  accDescr: C
  accDescr: D
```

### Multiline values

`printWidth` で折り返しません。
通常の部品間の可視 LF は拒否され、
文字アイコンやラベルの折り返し直しは Db を変え得ます。
作者が書いたラベルと文字アイコンの物理行、継続列と内部空行を保ちます。
説明本文は前述の共有の字下げを使います。

[fixture: architecture/multiline-values/continuation-columns]

[fixture: architecture/multiline-values/no-wrap-long-declaration]

[fixture: architecture/multiline-values/no-wrap-long-edge]

[corpus fixture: architecture/line-lf-string-title]

入力（エスケープ表記）:
`"architecture-beta\nservice multi \"A\n   B\n\nC\" [\"D\n E\"]\naccDescr {\n  F\n\n G\n}\n"`

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
同じ行のコメントは同じ行で接触を保ち、離れていれば空白1個にします。
付属先を保つため印・内容・末尾空白を保持します。
図固有のコメントは LF・CR で終わり、LS・PS は内容です。
先に始まった値は内側のパーセント文字を所有し、共通行はそこで終わります。
共通処理が除く領域は原文全体と継続列を保ちます。

[fixture: architecture/comments/comment-attachments]

[fixture: architecture/comments/value-ownership]

[corpus fixture: architecture/space-comment-ls]

[corpus fixture: architecture/space-comment-ps]

[corpus fixture: architecture/comment-in-quoted-label]

[corpus fixture: architecture/comment-directive-in-mark]

[corpus fixture: architecture/comment-directive-in-value]

[test: architecture/comments/ls-ps-content]

入力（エスケープ表記）:
`"architecture-beta\nservice percent \"A%%B\" [C%%D]\naccDescr {E%%F}\ntitle Topic%% inline\n"`

出力
([comments/value-ownership-output.mmd](../tests/fixtures/architecture/comments/value-ownership-output.mmd)):

```mmd
architecture-beta
  service percent "A%%B" [C%%D]
  accDescr { E%%F }
  title Topic%% inline
```

### Global directives

`Root` ディレクティブの内容・順序・所有位置を保ちます。
同じ印字行の中のディレクティブは、
[ディレクティブ](./flowchart.ja.md#ディレクティブ)のとおりに置きます。
元は同じ行にあった単位を別の行へ分けるときは、
間のディレクティブを次の単位に付けます。
右側の接触・分離は保ち、左側の接触は切れます。
通常の独立開始だけ本文の1段に揃え、複数行の内部と EOF までの末尾は保ちます。
共通処理の除去は両側を結合するため、
部品の境界の空白を消すと宣言が拒否され得ます。
部品間・値内部のディレクティブを保ち、不透明な内容を JSON として扱いません。

[fixture: architecture/global-directives/header-to-body]

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

入力（エスケープ表記）:
`"architecture-beta\nservice composite(%%{wrap}%%cloud%%{wrap}%%)\nservice target\ncomposite{%%{wrap}%%group%%{wrap}%%} : R < %%{wrap}%% -- > L :target\n"`

出力
([global-directives/composite-boundaries-output.mmd](../tests/fixtures/architecture/global-directives/composite-boundaries-output.mmd)):

```mmd
architecture-beta
  service composite(%%{wrap}%%cloud%%{wrap}%%)
  service target
  composite{%%{wrap}%%group%%{wrap}%%}:R <%%{wrap}%%--> L:target
```

### Hidden forms

`ArchitectureIgnoredText` は名前付き隙間、`textBeforeHeader`、`body`、
`textAfter` の所有ノードごとに1回だけ保ち、
注釈類を除いた値でなく原文の全範囲を使います。
図固有の YAML と DIRECTIVE は不透明で、
フロントマターや `Root` ディレクティブではありません。
本文の開始は字下げできますが、内部列と閉じの列を保ちます。
3 つの囲みの一致、別々の形、後の有効な閉じ、内部の大域的な切れ目を保ちます。
先行する値は隠れた形に見える文字を所有し、
アイコン・修飾子内に図固有の隙間を作りません。

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

入力（エスケープ表記）:
`"architecture-beta\n%%{!opaque\nbody}%%\nservice body_directive\n"`

出力
([hidden-forms/body-directive-output.mmd](../tests/fixtures/architecture/hidden-forms/body-directive-output.mmd)):

```mmd
architecture-beta
  %%{!opaque
body}%%
  service body_directive
```

### Hidden boundaries

共有の消費済み LF と閉じの余白の規則を使います。
これらの境界が次の文の可視 EOL を決めるためです。
閉じの余白がない文末の後置部分は、次の文までに予備の LF が1個必要です。
EOF も文を終えます。
見出し自身の隠れた形の直後だけ予備の LF は不要です。
見出し行に残った文も、その後置部分の後ろは文と文の境界です。
複数の後置部分の所有ノードと可視 EOL 後の形を区別し、
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

入力（エスケープ表記）: `"architecture-beta%%{}%% group a%%{}%%\n\nservice b"`

出力
([hidden-boundaries/header-and-statement-output.mmd](../tests/fixtures/architecture/hidden-boundaries/header-and-statement-output.mmd)):

```mmd
architecture-beta%%{}%% group a%%{}%%

  service b
```

### Blank lines

通常の ASCII 空行は文・注釈類間に最大1行残し、本文・文書端では除きます。
過剰な空白を除きながら、見た目のまとまりを保つためです。
値の内部、保持する前置部分、保護区間、
隠れた形の境界に必要な LF は各規則に従います。

[fixture: architecture/blank-lines/blank-collapse]

[fixture: architecture/blank-lines/blank-in-value-kept]

入力（エスケープ表記）:
`"\n\narchitecture-beta\n\n\nservice a\n\n \t\n\n%% note\n\n\nservice b\n\n\n"`

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
完結した宣言・辺・整列指定・説明の閉じの後の無害な ASCII 余白を除きます。
値と継続行、コメント末尾、ディレクティブ・隠れた形の内部、保持する前置部分、
保護区間は保ちます。
隠れた形の閉じの余白は EOF でも保持します。
両端の空白を除くと可視 EOL が消え得るためです。

[fixture: architecture/trailing-whitespace/trailing-exterior]

[fixture: architecture/trailing-whitespace/trailing-string-content-kept]

入力（エスケープ表記）:
`"architecture-beta \t\nservice a(cloud)[A] \t\njunction j\t\na:R -- L:j\t\nalign row a j \t\naccDescr {D}\t\n"`

出力
([trailing-whitespace/trailing-exterior-output.mmd](../tests/fixtures/architecture/trailing-whitespace/trailing-exterior-output.mmd)):

```mmd
architecture-beta
  service a(cloud)[A]
  junction j
  a:R -- L:j
  align row a j
  accDescr: D
```

### Frontmatter yaml

安全な実際のフロントマターだけを、共有の保護条件付きの YAML 整形で整えます。
不正な YAML、字下げした囲み、区切りの余白、HTML の危険、
整形で囲みができる本文は保ちます。
YAML は `tabWidth` 0 でも共有の正の最小字下げ幅を使います。
`textBeforeHeader` があれば、先頭 LF、コメント、通過した単独行の注釈類、
再走査で読む形、実際の形と隠れた形の順番を含む前置部分全体を保ちます。
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

入力（エスケープ表記）:
`"---\ntitle: \"<a b=\\\"c\\\">\"\n---\narchitecture-beta\nservice a\n"`

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

作者のセミコロンをすべて保ちます。
保つ `;` を含む区間は、行の規則が無視する `;` が整形で変わる所を除き、
ほかの場所と同じように整形します。
この規則は、[セミコロン](./flowchart.ja.md#セミコロン)のとおり、
`style` か `classDef` の後の最初の `:` から、
最後の保つ `;` の前の最後の `#` までに空白がない並びを読みます。
その範囲の隙間と余白は空白の有無を保ち、空白の連続は空白 1 つにします。
範囲の外は、この図種の通常の規則に従います。
どの部分の配置も持たないテキストは、書かれたまま残します。
複数行にわたる文の行を空白 1 つか何も挟まずにつなぐと、
行の規則が無視する `;` が変わりうる場合は、各区間の頭から最後の保つ `;` までを、
書かれたまま残します。
それ以外の複数行の文は、1 行の文と同じように整形します。
[fixture: semicolons/stretch-kept-rest-formatted]
[fixture: semicolons/no-stretch-formatted]
[fixture: semicolons/crossing-comment]
保護された見出し・最初の文は一緒に保ちます。
選択された1個の削除や style・classDef の条件を満たす語の移動は、
別のセミコロンを選んで Db を変え得るため、2 回の走査、条件を満たさない語、
entity、値の物理行、大域的な除去で結合する条件を満たす語を保ちます。

[fixture: architecture/semicolons/native-service-value]

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

入力（エスケープ表記）:
`"architecture-beta\naccDescr {\nstyle A fill:#red\n%% owned;\ntext\n}\n"`

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

共有の埋め込み先方針で物理 CR・CRLF を LF にし、設定の `endOfLine` を出します。
値と隠れた形の内部も同じです。
内容の LS・PS・NBSP・BOM は保ち、共通の行値の端からだけ、
共通規則が読む空白を除きます。
構造の非 ASCII 区切りは拒否のままです。
先頭 BOM はバイト同一性でなく埋め込み先の Prettierの処理に従います。

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

入力（エスケープ表記）: `"architecture-beta\rservice cr_node\r"`

出力（エスケープ表記）: `"architecture-beta\n  service cr_node\n"`

### Final newline

空本文、最後の文・コメントを含め、通常の受理入力は設定の改行1個で終えます。
文書末尾を一定にするため、通常の末尾空行列は除きます。
EOF までの大域的なディレクティブと隠れた形の閉じの余白は、
共有の境界の挙動を保ちます。
閉じた隠れた形には LF を加えられます。

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

入力（エスケープ表記）: `"architecture-beta\nservice a"`

出力
([final-newline/ending-service-output.mmd](../tests/fixtures/architecture/final-newline/ending-service-output.mmd)):

```mmd
architecture-beta
  service a
```

### Source order

すべての文、参照、整列指定の構成要素、繰り返す辺・制約、
空の代入を原文順に保ちます。
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

入力（エスケープ表記）:
`"architecture-beta\nalign row later cross\njunction cross in parent\nservice later in parent\ngroup parent\nlater:R -- L:cross\nlater:R -- L:cross\nalign column cross later\nalign row later cross\ntitle First\ntitle\naccTitle: First\naccTitle:\naccDescr {First}\naccDescr {}\n"`

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
  accDescr: First
  accDescr {}
```

### Specified readings

既存の directive-as-token-boundary、ignored-semicolon-as-token-boundary、
html-tag-in-frontmatter、embedded-data-opaque、
bare-percent-line-before-header の仕様の読みを使います。
architecture に受理を決める設定キーはなく、検出は C4 より前です。
生の拒否から生の Db を作りません。
拒否構文を修復せず、単独整形は出力のない構文エラー、
Markdown は埋め込みを辞退します。
空の引用符付きアイコン・ラベル、空の説明、
図固有の隠れた形に新しい差分は不要です。

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

共有の Markdown 経路で字下げを除いた図の本文に同じ規則を適用します。
囲み・リスト・引用の字下げと EOL は埋め込み先が用意します。
最後の隠れた形の余白を含め、図の本文の最終行の余白は埋め込み先が除きますが、
内部の隠れた形の境界は必要です。
埋め込み先の出力と冪等性は図の本文の Db・原文保持と別に確認します。

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

入力（エスケープ表記）:

````json
"```mermaid\narchitecture-beta service fence\n```\n"
````

出力（エスケープ表記）:

````json
"```mermaid\narchitecture-beta\n  service fence\n```\n"
````
