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
行頭は規則 1 の場所ではないので、
[規則 2](./printed-form.ja.md#2-prettier-にない種類の隙間)が決めます。
[flowchart](./flowchart.ja.md#字下げ)、[sequence](./sequence.ja.md#字下げ)、
[gantt](./gantt.ja.md#インデント)、[pie](./pie.ja.md#indentation)、
[info](./info.ja.md#indentation) も、本文の文を見出しの 1 段下に置きます。
本文は平坦で、`in` は参照なので入れ子の段を増やしません。
architecture の列には文法上の意味がないため、`tabWidth: 0` は空白0個、
`useTabs` は幅0でもタブ1個です。
段の種類（空白かタブか）と数は、
Prettier の `tabWidth` と `useTabs` の設定が決めます。
[pie](./pie.ja.md#indentation)、[packet](./packet.ja.md#indentation)、
[gitgraph](./gitgraph.ja.md#indentation)、[info](./info.ja.md#indentation)、
[radar](./radar.ja.md#indentation)、
[wardley](./wardley.ja.md#字下げ) もそう印字し、
Prettier が JavaScript を字下げするのも同じです。
`if (a) { b }` の `b` の前は、`tabWidth: 0` で空白 0 個、
`useTabs` でタブ 1 個です。
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
対象にする版の mermaid.js のすべてが、
`architecture-beta title t` の後で改行して `service a; junction j`
を次の行にした形を拒否します。
詳しくは
[対象にする版の mermaid.js のために残す形](./compatibility.ja.md#対象にする版の-mermaidjs-のために残す形)
を参照してください。
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
規則 1 は、キーワードと ID の間の印を挙げていないので、
[規則 2](./printed-form.ja.md#2-prettier-にない種類の隙間)が決めます。
[wardley](./wardley.ja.md#部品間の空白)
はコマンドのキーワードと最初の名前の間に、
[radar](./radar.ja.md#groups-and-commas)
はグループのキーワードと最初の項目の間に、普通の空白 1 個を置きます。
`group g(cloud)[G]`、`service a(server)[A]`、`service a[A]` と印字し、
括弧・角括弧の付属部品を1つの node として印字します。
[規則 1](./printed-form.ja.md#1-記号の横の空白)が、
くっつく `(` と `[` を与えます。
Prettier は、呼び出しの `(` の前にも、添字の `[` の前にも空白を印字しません。
`f (a) [0]` は `f(a)[0];` と印字されます。
[block](./block.ja.md#形) と [mindmap](./mindmap.ja.md#ノードのテキスト) も、
ノードの形を id にくっつけて印字します。
`A ("x")` は `A("x")`、`a (x)` は `a(x)` と印字されます。
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
[規則 1](./printed-form.ja.md#1-記号の横の空白)が `in` の前後の空白を与えます。
`in` は 2 つのものの間の印で、JavaScript でも同じです。
Prettier は `[G]in p` を `[G] in p`、`a  in   b` を `a in b` と印字し、
2 つのものの間の印は、どれも前後に空白を 1 個ずつ置きます。
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
Db はアイコン名を書かれたとおりに持ち、描画もその名前でアイコンを探します。
そのため別の綴りは、同じ名前の別の形ではなく、別の名前です。
この構文単位は空でなく空白のない名前を要求するため、空白を加えると拒否されます。
規則 1 も括弧の内側に空白を置きません（`f( a )` は `f(a);` と印字されます）。
完全な部品間の大域的なディレクティブは境界を保ちます。
そのような隙間のディレクティブは、
[ディレクティブ](./flowchart.ja.md#ディレクティブ)のとおりに置きます。
隙間はディレクティブがないときと同じに印字され、
アイコンの括弧の内側には空白がないので、ディレクティブは両側の単位に接します。

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
[規則 1](./printed-form.ja.md#1-記号の横の空白)が両側の空白を与えます。
印を付けた線は、flowchart の `-->` と同じく 2 つのものの間の印で、Prettier は、
2 つのものの間の印の前後に空白を 1 個ずつ置きます。
規則 1 の表の「2 つのものの間に置く、ほかの記号」の行では、
flowchart の `A-->B` が `A --> B` と印字されます。
`A<-->B` と `A---B` も、`A <--> B` と `A --- B` と印字されます。
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
規則 1 は、文の語と語の間の印を挙げていないので、
[規則 2](./printed-form.ja.md#2-prettier-にない種類の隙間)が決めます。
キーワードとその後のテキストの間は空白 1 個です。
規則 2 の例では、円グラフの `title    Pets` が `title Pets` と印字されます。
[block](./block.ja.md#行) も、空白とタブで区切って書かれた行のノードを、
空白 1 個で区切って印字します。
`a`、空白 3 個、`b`、タブ、`c` は `a b c` と印字されます。
列揃え、構成要素の並べ替え、繰り返す制約の統合、折り返しはしません。
作者が書いた順序を変えず、可視の改行を加えずに隙間を統一し、読みやすくします。

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

共有の共通行処理を、
下の段落と[セミコロン](#semicolons)の節が述べるところを除いて使い、
`title value` の両端から、共通規則が読む空白だけを除きます。
`null` と空白だけの値は `title` とし、同じ意味の外側の空白を詰めます。
値の中の空白とタブの連なりは空白 1 つにして印字します。
（[同じに描かれるテキスト中の空白の連なり](./compatibility.ja.md#同じに描かれるテキスト中の空白の連なり)）。
注釈類を挟んでも次の物理行を値にしません。
mermaid.js は次の行を独立した文として読むので、つなぐと、その文が title に入り、
その文が宣言するもの（ノード、グループ、ジャンクション、エッジ）がなくなります。
architecture の要約が title を公開しなくても、文と内容を保ちます。
題にテキストがあり、そのテキストの前にも中にもディレクティブがなく、
テキストの中に U+2028 も U+2029 もないとき、題の終わりのディレクティブは、
その前と後に何があるかで、次のように印字します。
ただし、未決の行は除きます。
未決の行とは、ディレクティブのある行のうち、ディレクティブのほかに、
コメントの外の `;`（ディレクティブの中のものも含みます）がある行、
コメントの中の `;` と U+2028 か U+2029 がある行、
最初のディレクティブの中か後に U+2028 か U+2029 がある行、
ディレクティブが改行を含む行、または次の文までの間の行に、
コメントかディレクティブの中の `;` がある行です。
幅のある空白は、U+000B、U+000C、U+00A0、U+1680、U+2000 から U+200A、U+202F、
U+205F、U+3000、U+FEFF のどれかです。
項目 6 が行を分けるときは、ほかの項目はその行に当たりません。

- ディレクティブの前が空白とタブだけ、または何もなく、その前のテキストにも、
  どのディレクティブの中にも `;` がなく、どのディレクティブも改行、U+2028、
  U+2029 を含まず、最後のディレクティブの後が空白とタブだけのときは、
  それぞれのディレクティブの前に空白かタブがあれば空白 1 つを置き、
  行末の空白とタブの有無にかかわらず、
  最後のディレクティブの後の空白とタブを除いて印字します。
- ディレクティブの前に幅のある空白があり、ディレクティブが互いに接して、
  最後のディレクティブに行末かコメントが接するときは、その文字を、
  同じ連なりの残りとともに空白 1 つで印字します。
- ディレクティブの前に幅のある空白があり、最初のディレクティブの後に、
  空白かタブと、別のディレクティブかコメントが続くときは、その文字は残り、
  その後ろからディレクティブかコメントまでの、空白とタブの連なりを、
  それぞれ空白 1 つで印字します。
- ディレクティブの前に U+2028 か U+2029 があり、ディレクティブが互いに接して、
  最後のディレクティブに行末が接するときは、空白 1 つで印字します。
- ディレクティブの前に U+2028 か U+2029 があり、
  最後のディレクティブにコメントが続かず、
  最後のディレクティブの後に空白かタブが続くとき、
  または最初のディレクティブの後に空白かタブと別のディレクティブが続くときは、
  行を書かれたままにします。
- ディレクティブの前に U+2028 か U+2029 があり、
  最後のディレクティブの後にコメントが続くときは、
  コメント領域が次の行を結びます。
  詳しくは
  [U+2028 か U+2029 の後のコメント行](./compatibility.ja.md#u2028-か-u2029-の後のコメント行)
  にあります。
  コメント行は、その前の空行、空白だけの行、
  ディレクティブの行とともに取り除かれ、残った最初の行が決めます。
  それが文か空白だけの行なら、その行まで書かれたままにします。
  それが空行かディレクティブの行のとき、または残る行がないときは、
  U+2028 か U+2029 を落とし、ディレクティブとコメントを別の行に置き、
  それらの間の隙間は、どの空白文字でも空白 1 つで印字します。
  後ろにコメント行が続かないとき、ディレクティブの行は、ディレクティブだけが、
  前にも間にも後にも空白なしで並ぶ行です（`%%{y}%%`、`%%{y}%%%%{z}%%`）。
  字下げのあるディレクティブ、後ろに空白が続くディレクティブ、
  空白が間にあるディレクティブ、後ろに文字が続くディレクティブは、
  そこでは文です。
  コメント行は、コメントを含む行です（`%% d`、`  %% d`、`%%{y}%% %% e`）。
  空白だけの行は、空白、タブ、幅のある空白、U+2028、U+2029 だけの行です。
  U+0085 と U+180E は空白ではなく、それを含む行は文です。
  コメント行の前にある行は、空白、ディレクティブ、コメントだけを含むときは、
  その並び方によらずコメント行とともに取り除かれます。
  空行、空白だけの行、ディレクティブの行、字下げのあるディレクティブ、
  後ろに空白が続くディレクティブ、空白が間にあるディレクティブ（`%%{y}%%`、
  空白 2 つ、`%%{z}%%`）は取り除かれ、文字、U+0085、U+180E、
  コメントとディレクティブの外の `;` を含む行は文です。
- 幅のある空白がディレクティブの間にあるときは、
  最後のディレクティブの後に何が続いても、行を書かれたままにします。
- 最後のディレクティブの後に幅のある空白があるときは、
  その前に空白やタブがあっても、その後に何が続いても、行を書かれたままにします。
  テキストの中にディレクティブのある題も、書かれたままです。

最後のディレクティブの後にコメントが続き、
テキストとコメントの間に U+2028 も U+2029 もなく、行が未決でなく、
項目 7 と 8 のどちらにも当たらないときは、
それぞれのディレクティブの前とコメントの前の空白とタブの連なりを、
空白 1 つで印字します。
コメントの中に `;` があっても同じです。
（[同じに描かれるキーワードの後のテキスト](./compatibility.ja.md#同じに描かれるキーワードの後のテキスト)）。

規則 1 は、ディレクティブの隣の隙間の印を挙げていないので、
[規則 2](./printed-form.ja.md#2-prettier-にない種類の隙間)が決めます。
ほかの図の種類は、ディレクティブの前の空白とタブの連なりを空白 1 つで印字し、
行末の空白を除きます（項目 1）。
（[同じに描かれるキーワードの後のテキスト](./compatibility.ja.md#同じに描かれるキーワードの後のテキスト)）。
ほかの項目は、規則が決めない隙間と文字について、
リリース済みの版が印字する形を述べています。
ほかの図の種類が違う形で印字する形は、決まるまでそのまま残します。
（[どの決まりも形を決めない所](./printed-form.ja.md#4-どの決まりも形を決めない所)）。

テキストの中に U+2028 か U+2029 があるとき、または値がディレクティブだけで、
行が未決でないときは、
最後のディレクティブの後に空白かタブが続けば（その後が行末でもコメントでも）、
またはディレクティブの間に空白かタブがあれば、行を書かれたままにし、
項目 3 は適用しません。
どちらでもなければ、ほかの項目が、
ほかのテキストの行を印字するのと同じに印字するので、
ディレクティブの前の空白とタブの連なり（キーワードの後のものも）はそれぞれ空白 1
つになります。

未決の行は述べません。
そこでは出力が、`;` と U+2028 か U+2029 の両側の文字ごとに決まり、
規則 1 はこれらの隙間の印を挙げず、図の種類も同じには印字しません。
そこでリリース済みの版が印字する形は、
[どの決まりも形を決めない所](./printed-form.ja.md#4-どの決まりも形を決めない所)
のとおり、決めるまでそのままです。
行に U+2028 も U+2029 もないとき、
行そのもののコメントの中の `;` は行を変えないので、`;` がそこだけにある行は、
題と次の文の間の行のコメントかディレクティブの中に `;` がある場合を除き、
未決ではありません。
整形が投げる行は、そこでは述べません。

題のテキストが、キーワードの後の空白 1 つかタブ 1 つの後で、ディレクティブか、
互いに接するディレクティブで始まり、行のそれ以外の部分にディレクティブ、
コメント、`;`、幅のある空白、U+2028、U+2029 がなく、行が未決でないときは、
ディレクティブとそれ以外のテキストの間の空白とタブを除き、
行末の空白とタブも除きます（`title %%{x}%%  T  ` は `title %%{x}%%T` に、
`title %%{x}%%%%{y}%%  T  ` は `title %%{x}%%%%{y}%%T` になります）。
[規則 2](./printed-form.ja.md#2-prettier-にない種類の隙間)が決めます。
sequence 図の[題](./sequence.ja.md#タイトル)も同じで、
`title %%{init: {}}%% T` を `title %%{init: {}}%%T` と印字します。
mermaid.js はテキストを読む前にディレクティブを除き、
題をその先頭の空白なしで描くからです。
（[同じに描かれるキーワードの後のテキスト](./compatibility.ja.md#同じに描かれるキーワードの後のテキスト)）。
ディレクティブがテキストの前にあるほかの題は述べません。
ディレクティブがキーワードに接する題、
最初のディレクティブの前に空白文字が 2 つ続く題、
2 つのディレクティブの間に空白がある題、行のほかの所にディレクティブ、コメント、
`;`、幅のある空白、U+2028、U+2029 がある題、
テキストがディレクティブで始まる `accTitle:` と `accDescr:` の行です。
そこでリリース済みの版が印字する形は、
[どの決まりも形を決めない所](./printed-form.ja.md#4-どの決まりも形を決めない所)
のとおり、決めるまでそのままです。

[fixture: title/title-directives-end-blanks-dropped]
[fixture: title/title-directives-end-tabs-dropped]
[fixture: title/title-directives-in-the-text-kept]
[fixture: title/title-directives-end-before-comment-line-and-empty-line]
[fixture: title/title-directives-then-comment]
[fixture: title/title-directives-end-at-the-end-of-the-text]
[corpus fixture: architecture/directive-fields]
[test: a no-break space after the last directive of a title of an architecture diagram]
[test: U+3000 after the last directive of a title of an architecture diagram]
[test: U+2028 after the last directive of a title of an architecture diagram]
[test: U+2029 after the last directive of a title of an architecture diagram]
[test: a space and a no-break space after the last directive of a title of an architecture diagram]
[test: a no-break space after the last of two directives of a title of an architecture diagram]
[test: a no-break space before the directive that ends a title of an architecture diagram]
[test: U+3000 before the directive that ends a title of an architecture diagram]
[test: a space, a no-break space, and a space before the directive that ends a title of an architecture diagram]
[test: a no-break space before two directives that touch and end a title of an architecture diagram]
[test: a no-break space before a directive that a comment touches in a title of an architecture diagram]
[test: U+2028 before the directive that ends a title of an architecture diagram]
[test: U+2029 before the directive that ends a title of an architecture diagram]
[test: a no-break space before a directive that a space and another directive follow in a title of an architecture diagram]
[test: U+3000 before a directive that a space and a comment follow in a title of an architecture diagram]
[test: a tab and a no-break space after the last directive of a title of an architecture diagram]
[test: U+3000 before a directive that a comment touches in a title of an architecture diagram]
[test: U+3000 before two directives that touch and end a title of an architecture diagram]
[test: U+3000 before a directive that a space and another directive follow in a title of an architecture diagram]
[test: a no-break space before a directive that a space and a comment follow in a title of an architecture diagram]
[test: a no-break space between two directives that end a title of an architecture diagram]
[test: U+3000 between two directives that end a title of an architecture diagram]
[test: a no-break space between two directives, spaces after the last, in a title of an architecture diagram]
[test: U+3000 between two directives, spaces after the last, in a title of an architecture diagram]
[test: U+2028 before two directives that touch and end a title of an architecture diagram]
[test: U+2029 before two directives that touch and end a title of an architecture diagram]
[test: U+2028 before the last directive, a space and a tab after it, in a title of an architecture diagram]
[test: U+2029 before the last directive, a space and a tab after it, in a title of an architecture diagram]
[test: U+2028 before a directive that a space and another directive follow in a title of an architecture diagram]
[test: U+2029 before a directive that a space and another directive follow in a title of an architecture diagram]
[test: U+2028 between two directives that end a title of an architecture diagram]
[test: U+2029 between two directives that end a title of an architecture diagram]
[test: U+2028 between two directives, spaces after the last, in a title of an architecture diagram]
[test: U+2029 between two directives, spaces after the last, in a title of an architecture diagram]
[test: a space, a tab, and a no-break space after the last directive of a title of an architecture diagram]
[test: a space, a tab, and U+3000 after the last directive of a title of an architecture diagram]
[test: a space, a tab, and U+2028 after the last directive of a title of an architecture diagram]
[test: a space, a tab, and U+2029 after the last directive of a title of an architecture diagram]
[test: a semicolon before the directive of a title of an architecture diagram, spaces after it]
[test: a semicolon and spaces before the directive that ends a title of an architecture diagram]
[test: a semicolon after the last directive of a title of an architecture diagram, spaces around it]
[test: a semicolon before the directive of a title of an architecture diagram, a tab after it]
[test: a semicolon and a no-break space before the directive of a title of an architecture diagram, spaces after it]
[test: a semicolon and a no-break space before the directive that ends a title of an architecture diagram]
[test: a semicolon touching the last directive of a title of an architecture diagram]
[test: U+000B before the directive that ends a title of an architecture diagram]
[test: U+000C before the directive that ends a title of an architecture diagram]
[test: U+1680 before the directive that ends a title of an architecture diagram]
[test: U+2000 before the directive that ends a title of an architecture diagram]
[test: U+2001 before the directive that ends a title of an architecture diagram]
[test: U+2002 before the directive that ends a title of an architecture diagram]
[test: U+2003 before the directive that ends a title of an architecture diagram]
[test: U+2004 before the directive that ends a title of an architecture diagram]
[test: U+2005 before the directive that ends a title of an architecture diagram]
[test: U+2006 before the directive that ends a title of an architecture diagram]
[test: U+2007 before the directive that ends a title of an architecture diagram]
[test: U+2008 before the directive that ends a title of an architecture diagram]
[test: U+2009 before the directive that ends a title of an architecture diagram]
[test: U+200A before the directive that ends a title of an architecture diagram]
[test: U+202F before the directive that ends a title of an architecture diagram]
[test: U+205F before the directive that ends a title of an architecture diagram]
[test: U+FEFF before the directive that ends a title of an architecture diagram]
[test: U+000B before two directives that touch and end a title of an architecture diagram]
[test: U+000B before a directive that a comment touches in a title of an architecture diagram]
[test: U+000B between two directives that end a title of an architecture diagram]
[test: U+000B after the last directive of a title of an architecture diagram]
[test: a semicolon and U+000B before the directive that ends a title of an architecture diagram]
[test: U+000C before two directives that touch and end a title of an architecture diagram]
[test: U+000C before a directive that a comment touches in a title of an architecture diagram]
[test: U+000C between two directives that end a title of an architecture diagram]
[test: U+000C after the last directive of a title of an architecture diagram]
[test: a semicolon and U+000C before the directive that ends a title of an architecture diagram]
[test: U+1680 before two directives that touch and end a title of an architecture diagram]
[test: U+1680 before a directive that a comment touches in a title of an architecture diagram]
[test: U+1680 between two directives that end a title of an architecture diagram]
[test: U+1680 after the last directive of a title of an architecture diagram]
[test: a semicolon and U+1680 before the directive that ends a title of an architecture diagram]
[test: U+2000 before two directives that touch and end a title of an architecture diagram]
[test: U+2000 before a directive that a comment touches in a title of an architecture diagram]
[test: U+2000 between two directives that end a title of an architecture diagram]
[test: U+2000 after the last directive of a title of an architecture diagram]
[test: a semicolon and U+2000 before the directive that ends a title of an architecture diagram]
[test: U+2001 before two directives that touch and end a title of an architecture diagram]
[test: U+2001 before a directive that a comment touches in a title of an architecture diagram]
[test: U+2001 between two directives that end a title of an architecture diagram]
[test: U+2001 after the last directive of a title of an architecture diagram]
[test: a semicolon and U+2001 before the directive that ends a title of an architecture diagram]
[test: U+2002 before two directives that touch and end a title of an architecture diagram]
[test: U+2002 before a directive that a comment touches in a title of an architecture diagram]
[test: U+2002 between two directives that end a title of an architecture diagram]
[test: U+2002 after the last directive of a title of an architecture diagram]
[test: a semicolon and U+2002 before the directive that ends a title of an architecture diagram]
[test: U+2003 before two directives that touch and end a title of an architecture diagram]
[test: U+2003 before a directive that a comment touches in a title of an architecture diagram]
[test: U+2003 between two directives that end a title of an architecture diagram]
[test: U+2003 after the last directive of a title of an architecture diagram]
[test: a semicolon and U+2003 before the directive that ends a title of an architecture diagram]
[test: U+2004 before two directives that touch and end a title of an architecture diagram]
[test: U+2004 before a directive that a comment touches in a title of an architecture diagram]
[test: U+2004 between two directives that end a title of an architecture diagram]
[test: U+2004 after the last directive of a title of an architecture diagram]
[test: a semicolon and U+2004 before the directive that ends a title of an architecture diagram]
[test: U+2005 before two directives that touch and end a title of an architecture diagram]
[test: U+2005 before a directive that a comment touches in a title of an architecture diagram]
[test: U+2005 between two directives that end a title of an architecture diagram]
[test: U+2005 after the last directive of a title of an architecture diagram]
[test: a semicolon and U+2005 before the directive that ends a title of an architecture diagram]
[test: U+2006 before two directives that touch and end a title of an architecture diagram]
[test: U+2006 before a directive that a comment touches in a title of an architecture diagram]
[test: U+2006 between two directives that end a title of an architecture diagram]
[test: U+2006 after the last directive of a title of an architecture diagram]
[test: a semicolon and U+2006 before the directive that ends a title of an architecture diagram]
[test: U+2007 before two directives that touch and end a title of an architecture diagram]
[test: U+2007 before a directive that a comment touches in a title of an architecture diagram]
[test: U+2007 between two directives that end a title of an architecture diagram]
[test: U+2007 after the last directive of a title of an architecture diagram]
[test: a semicolon and U+2007 before the directive that ends a title of an architecture diagram]
[test: U+2008 before two directives that touch and end a title of an architecture diagram]
[test: U+2008 before a directive that a comment touches in a title of an architecture diagram]
[test: U+2008 between two directives that end a title of an architecture diagram]
[test: U+2008 after the last directive of a title of an architecture diagram]
[test: a semicolon and U+2008 before the directive that ends a title of an architecture diagram]
[test: U+2009 before two directives that touch and end a title of an architecture diagram]
[test: U+2009 before a directive that a comment touches in a title of an architecture diagram]
[test: U+2009 between two directives that end a title of an architecture diagram]
[test: U+2009 after the last directive of a title of an architecture diagram]
[test: a semicolon and U+2009 before the directive that ends a title of an architecture diagram]
[test: U+200A before two directives that touch and end a title of an architecture diagram]
[test: U+200A before a directive that a comment touches in a title of an architecture diagram]
[test: U+200A between two directives that end a title of an architecture diagram]
[test: U+200A after the last directive of a title of an architecture diagram]
[test: a semicolon and U+200A before the directive that ends a title of an architecture diagram]
[test: U+202F before two directives that touch and end a title of an architecture diagram]
[test: U+202F before a directive that a comment touches in a title of an architecture diagram]
[test: U+202F between two directives that end a title of an architecture diagram]
[test: U+202F after the last directive of a title of an architecture diagram]
[test: a semicolon and U+202F before the directive that ends a title of an architecture diagram]
[test: U+205F before two directives that touch and end a title of an architecture diagram]
[test: U+205F before a directive that a comment touches in a title of an architecture diagram]
[test: U+205F between two directives that end a title of an architecture diagram]
[test: U+205F after the last directive of a title of an architecture diagram]
[test: a semicolon and U+205F before the directive that ends a title of an architecture diagram]
[test: a semicolon and U+3000 before the directive that ends a title of an architecture diagram]
[test: U+FEFF before two directives that touch and end a title of an architecture diagram]
[test: U+FEFF before a directive that a comment touches in a title of an architecture diagram]
[test: U+FEFF between two directives that end a title of an architecture diagram]
[test: U+FEFF after the last directive of a title of an architecture diagram]
[test: a semicolon and U+FEFF before the directive that ends a title of an architecture diagram]
[test: a semicolon and U+2028 before the directive that ends a title of an architecture diagram]
[test: a semicolon and U+2029 before the directive that ends a title of an architecture diagram]
[test: a semicolon and a tab before the directive that ends a title of an architecture diagram]
[test: released output that the document does not state: a semicolon that the line rule ignores and spaces before the directive that ends a title of an architecture diagram]
[test: released output that the document does not state: a semicolon that the line rule ignores before the directive of a title of an architecture diagram, spaces after it]
[test: a semicolon before the directive of a title of an architecture diagram, a space and a comment after it]
[test: a semicolon and spaces before a directive that a comment touches in a title of an architecture diagram]
[test: a comment that ends with a semicolon after the last directive of a title of an architecture diagram]
[test: a comment that has a space before its semicolon after the last directive of a title of an architecture diagram]
[test: a comment that starts with a semicolon after the last directive of a title of an architecture diagram]
[test: a semicolon inside the directive that ends a title, spaces after it, of an architecture diagram]
[test: a semicolon inside the directive that ends a title, spaces and a comment after it, of an architecture diagram]
[test: a semicolon inside the directive that ends a title, a space and a comment after it, of an architecture diagram]
[test: a semicolon inside the last of two directives that end a title, spaces after it, of an architecture diagram]
[test: a semicolon inside the first of two directives that end a title, spaces between them, of an architecture diagram]
[test: a semicolon inside the first of two directives that end a title, a space between them, of an architecture diagram]
[test: a semicolon inside the only directive that ends a title, spaces before it, of an architecture diagram]
[test: a semicolon inside the last of two directives that end a title, spaces before both, of an architecture diagram]
[test: a semicolon inside a directive that a comment touches in a title, spaces before the directive, of an architecture diagram]
[test: a semicolon inside the first of two directives that touch in a title, spaces before them, of an architecture diagram]
[test: a semicolon inside the directive that ends a title, a no-break space before it, of an architecture diagram]
[test: a semicolon inside the directive that ends a title, U+2028 before it, of an architecture diagram]
[test: a semicolon in the text, two directives with spaces between them, a title, of an architecture diagram]
[test: a semicolon in the text, two directives with a space between them, a title, of an architecture diagram]
[test: a semicolon and a space before two directives with spaces between them, a title, of an architecture diagram]
[test: a semicolon in the text, two directives with a tab between them, a title, of an architecture diagram]
[test: a semicolon in the text, two directives that touch, spaces before them, a title, of an architecture diagram]
[test: a semicolon that touches two directives in a title, of an architecture diagram]
[test: a semicolon that touches the second of two directives in a title, of an architecture diagram]
[test: a semicolon that touches the first of two directives in a title, of an architecture diagram]
[test: a semicolon between two directives in a title, spaces around it, of an architecture diagram]
[test: a semicolon touching the last of two directives in a title, of an architecture diagram]
[test: a semicolon after the last of two directives in a title, spaces around it and a comment after it, of an architecture diagram]
[test: released output that the document does not state: a second semicolon touching the semicolon that the line rule ignores, spaces and a directive after them, in a title of an architecture diagram]
[test: released output that the document does not state: a second semicolon touching the semicolon that the line rule ignores, a directive and spaces after them, in a title of an architecture diagram]
[test: released output that the document does not state: a second semicolon touching the semicolon that the line rule ignores, a directive touching them, in a title of an architecture diagram]
[test: released output that the document does not state: a second semicolon touching the semicolon that the line rule ignores, a directive that a comment touches, in a title of an architecture diagram]
[test: released output that the document does not state: a second semicolon touching the semicolon that the line rule ignores, a directive and a space and a comment, in a title of an architecture diagram]
[test: released output that the document does not state: spaces and a second semicolon after the semicolon that the line rule ignores, a directive after them, in a title of an architecture diagram]
[test: released output that the document does not state: a space and a second semicolon after the semicolon that the line rule ignores, a directive after them, in a title of an architecture diagram]
[test: released output that the document does not state: a tab and a second semicolon after the semicolon that the line rule ignores, a directive after them, in a title of an architecture diagram]
[test: released output that the document does not state: a no-break space and a second semicolon after the semicolon that the line rule ignores, a directive after them, in a title of an architecture diagram]
[test: released output that the document does not state: a second semicolon touching the semicolon that the line rule ignores, a no-break space and a directive after them, in a title of an architecture diagram]
[test: released output that the document does not state: a second semicolon touching the semicolon that the line rule ignores, U+2028 and a directive after them, in a title of an architecture diagram]
[test: released output that the document does not state: two semicolons after the semicolon that the line rule ignores, a directive after them, in a title of an architecture diagram]
[test: released output that the document does not state: U+2028 and a directive after the semicolon that the line rule ignores, in a title of an architecture diagram]
[test: released output that the document does not state: U+2029 and a directive after the semicolon that the line rule ignores, in a title of an architecture diagram]
[test: released output that the document does not state: U+2028, a directive and spaces after the semicolon that the line rule ignores, in a title of an architecture diagram]
[test: two semicolons that the line rule does not ignore, spaces and a directive after them, in a title of an architecture diagram]
[test: released output that the document does not state: text and a semicolon after the semicolon that the line rule does not ignore, spaces and a directive after them, in a title of an architecture diagram]
[test: released output that the document does not state: a tab and a directive after the semicolon that the line rule ignores, in a title of an architecture diagram]
[test: released output that the document does not state: a no-break space and a directive after the semicolon that the line rule ignores, in a title of an architecture diagram]
[test: released output that the document does not state: spaces and a directive that a comment touches after the semicolon that the line rule ignores, in a title of an architecture diagram]
[test: released output that the document does not state: spaces and two directives with spaces between them after the semicolon that the line rule ignores, in a title of an architecture diagram]
[test: a semicolon at the end of a title with whitespace around its text, of an architecture diagram]
[test: a semicolon in the text of a title, spaces and a directive after it, of an architecture diagram]
[test: spaces around a semicolon in the text of a title, a directive after it, of an architecture diagram]
[test: U+000B between two directives, spaces after the last, in a title of an architecture diagram]
[test: U+000B after the last directive and spaces of a title of an architecture diagram]
[test: U+000C between two directives, spaces after the last, in a title of an architecture diagram]
[test: U+000C after the last directive and spaces of a title of an architecture diagram]
[test: a no-break space after the last directive and spaces of a title of an architecture diagram]
[test: U+1680 between two directives, spaces after the last, in a title of an architecture diagram]
[test: U+1680 after the last directive and spaces of a title of an architecture diagram]
[test: U+2000 between two directives, spaces after the last, in a title of an architecture diagram]
[test: U+2000 after the last directive and spaces of a title of an architecture diagram]
[test: U+2001 between two directives, spaces after the last, in a title of an architecture diagram]
[test: U+2001 after the last directive and spaces of a title of an architecture diagram]
[test: U+2002 between two directives, spaces after the last, in a title of an architecture diagram]
[test: U+2002 after the last directive and spaces of a title of an architecture diagram]
[test: U+2003 between two directives, spaces after the last, in a title of an architecture diagram]
[test: U+2003 after the last directive and spaces of a title of an architecture diagram]
[test: U+2004 between two directives, spaces after the last, in a title of an architecture diagram]
[test: U+2004 after the last directive and spaces of a title of an architecture diagram]
[test: U+2005 between two directives, spaces after the last, in a title of an architecture diagram]
[test: U+2005 after the last directive and spaces of a title of an architecture diagram]
[test: U+2006 between two directives, spaces after the last, in a title of an architecture diagram]
[test: U+2006 after the last directive and spaces of a title of an architecture diagram]
[test: U+2007 between two directives, spaces after the last, in a title of an architecture diagram]
[test: U+2007 after the last directive and spaces of a title of an architecture diagram]
[test: U+2008 between two directives, spaces after the last, in a title of an architecture diagram]
[test: U+2008 after the last directive and spaces of a title of an architecture diagram]
[test: U+2009 between two directives, spaces after the last, in a title of an architecture diagram]
[test: U+2009 after the last directive and spaces of a title of an architecture diagram]
[test: U+200A between two directives, spaces after the last, in a title of an architecture diagram]
[test: U+200A after the last directive and spaces of a title of an architecture diagram]
[test: U+202F between two directives, spaces after the last, in a title of an architecture diagram]
[test: U+202F after the last directive and spaces of a title of an architecture diagram]
[test: U+205F between two directives, spaces after the last, in a title of an architecture diagram]
[test: U+205F after the last directive and spaces of a title of an architecture diagram]
[test: U+3000 after the last directive and spaces of a title of an architecture diagram]
[test: U+FEFF between two directives, spaces after the last, in a title of an architecture diagram]
[test: U+FEFF after the last directive and spaces of a title of an architecture diagram]
[test: U+2028 after the last directive and spaces of a title of an architecture diagram]
[test: U+2029 after the last directive and spaces of a title of an architecture diagram]
[test: a no-break space between two directives, a comment touching the last, in a title of an architecture diagram]
[test: a no-break space between two directives, a space and a comment after the last, in a title of an architecture diagram]
[test: a no-break space between two directives, spaces and a comment after the last, in a title of an architecture diagram]
[test: a no-break space after the last directive, a comment touching it, in a title of an architecture diagram]
[test: a no-break space after the last directive, spaces and a comment after it, in a title of an architecture diagram]
[test: a no-break space after the last directive and spaces, spaces and a comment after it, in a title of an architecture diagram]
[test: a no-break space after the last directive and a tab, spaces and a comment after it, in a title of an architecture diagram]
[test: U+2003 between two directives, a comment touching the last, in a title of an architecture diagram]
[test: U+2003 between two directives, a space and a comment after the last, in a title of an architecture diagram]
[test: U+2003 between two directives, spaces and a comment after the last, in a title of an architecture diagram]
[test: U+2003 after the last directive, a comment touching it, in a title of an architecture diagram]
[test: U+2003 after the last directive, spaces and a comment after it, in a title of an architecture diagram]
[test: U+2003 after the last directive and spaces, spaces and a comment after it, in a title of an architecture diagram]
[test: U+2003 after the last directive and a tab, spaces and a comment after it, in a title of an architecture diagram]
[test: a semicolon in the text, a no-break space between two directives, in a title of an architecture diagram]
[test: a semicolon in the text, a no-break space after the last directive, in a title of an architecture diagram]
[test: a semicolon inside the directive, a no-break space after it, in a title of an architecture diagram]
[test: released output that the document does not state: U+000B between a semicolon that the line rule ignores and a second semicolon, a directive after them, in a title of an architecture diagram]
[test: released output that the document does not state: U+000C between a semicolon that the line rule ignores and a second semicolon, a directive after them, in a title of an architecture diagram]
[test: released output that the document does not state: U+1680 between a semicolon that the line rule ignores and a second semicolon, a directive after them, in a title of an architecture diagram]
[test: released output that the document does not state: U+2000 between a semicolon that the line rule ignores and a second semicolon, a directive after them, in a title of an architecture diagram]
[test: released output that the document does not state: U+2001 between a semicolon that the line rule ignores and a second semicolon, a directive after them, in a title of an architecture diagram]
[test: released output that the document does not state: U+2002 between a semicolon that the line rule ignores and a second semicolon, a directive after them, in a title of an architecture diagram]
[test: released output that the document does not state: U+2003 between a semicolon that the line rule ignores and a second semicolon, a directive after them, in a title of an architecture diagram]
[test: released output that the document does not state: U+2004 between a semicolon that the line rule ignores and a second semicolon, a directive after them, in a title of an architecture diagram]
[test: released output that the document does not state: U+2005 between a semicolon that the line rule ignores and a second semicolon, a directive after them, in a title of an architecture diagram]
[test: released output that the document does not state: U+2006 between a semicolon that the line rule ignores and a second semicolon, a directive after them, in a title of an architecture diagram]
[test: released output that the document does not state: U+2007 between a semicolon that the line rule ignores and a second semicolon, a directive after them, in a title of an architecture diagram]
[test: released output that the document does not state: U+2008 between a semicolon that the line rule ignores and a second semicolon, a directive after them, in a title of an architecture diagram]
[test: released output that the document does not state: U+2009 between a semicolon that the line rule ignores and a second semicolon, a directive after them, in a title of an architecture diagram]
[test: released output that the document does not state: U+200A between a semicolon that the line rule ignores and a second semicolon, a directive after them, in a title of an architecture diagram]
[test: released output that the document does not state: U+202F between a semicolon that the line rule ignores and a second semicolon, a directive after them, in a title of an architecture diagram]
[test: released output that the document does not state: U+205F between a semicolon that the line rule ignores and a second semicolon, a directive after them, in a title of an architecture diagram]
[test: released output that the document does not state: U+3000 between a semicolon that the line rule ignores and a second semicolon, a directive after them, in a title of an architecture diagram]
[test: released output that the document does not state: U+FEFF between a semicolon that the line rule ignores and a second semicolon, a directive after them, in a title of an architecture diagram]
[test: U+000B before the first of two directives that a space separates, in a title of an architecture diagram]
[test: U+000B before the first of two directives that spaces separate, in a title of an architecture diagram]
[test: U+000B before a directive that spaces and a comment follow in a title of an architecture diagram]
[test: U+000C before the first of two directives that a space separates, in a title of an architecture diagram]
[test: U+000C before the first of two directives that spaces separate, in a title of an architecture diagram]
[test: U+000C before a directive that spaces and a comment follow in a title of an architecture diagram]
[test: a no-break space before the first of two directives that spaces separate, in a title of an architecture diagram]
[test: U+1680 before the first of two directives that a space separates, in a title of an architecture diagram]
[test: U+1680 before the first of two directives that spaces separate, in a title of an architecture diagram]
[test: U+1680 before a directive that spaces and a comment follow in a title of an architecture diagram]
[test: U+2000 before the first of two directives that a space separates, in a title of an architecture diagram]
[test: U+2000 before the first of two directives that spaces separate, in a title of an architecture diagram]
[test: U+2000 before a directive that spaces and a comment follow in a title of an architecture diagram]
[test: U+2001 before the first of two directives that a space separates, in a title of an architecture diagram]
[test: U+2001 before the first of two directives that spaces separate, in a title of an architecture diagram]
[test: U+2001 before a directive that spaces and a comment follow in a title of an architecture diagram]
[test: U+2002 before the first of two directives that a space separates, in a title of an architecture diagram]
[test: U+2002 before the first of two directives that spaces separate, in a title of an architecture diagram]
[test: U+2002 before a directive that spaces and a comment follow in a title of an architecture diagram]
[test: U+2003 before the first of two directives that a space separates, in a title of an architecture diagram]
[test: U+2003 before the first of two directives that spaces separate, in a title of an architecture diagram]
[test: U+2003 before a directive that spaces and a comment follow in a title of an architecture diagram]
[test: U+2004 before the first of two directives that a space separates, in a title of an architecture diagram]
[test: U+2004 before the first of two directives that spaces separate, in a title of an architecture diagram]
[test: U+2004 before a directive that spaces and a comment follow in a title of an architecture diagram]
[test: U+2005 before the first of two directives that a space separates, in a title of an architecture diagram]
[test: U+2005 before the first of two directives that spaces separate, in a title of an architecture diagram]
[test: U+2005 before a directive that spaces and a comment follow in a title of an architecture diagram]
[test: U+2006 before the first of two directives that a space separates, in a title of an architecture diagram]
[test: U+2006 before the first of two directives that spaces separate, in a title of an architecture diagram]
[test: U+2006 before a directive that spaces and a comment follow in a title of an architecture diagram]
[test: U+2007 before the first of two directives that a space separates, in a title of an architecture diagram]
[test: U+2007 before the first of two directives that spaces separate, in a title of an architecture diagram]
[test: U+2007 before a directive that spaces and a comment follow in a title of an architecture diagram]
[test: U+2008 before the first of two directives that a space separates, in a title of an architecture diagram]
[test: U+2008 before the first of two directives that spaces separate, in a title of an architecture diagram]
[test: U+2008 before a directive that spaces and a comment follow in a title of an architecture diagram]
[test: U+2009 before the first of two directives that a space separates, in a title of an architecture diagram]
[test: U+2009 before the first of two directives that spaces separate, in a title of an architecture diagram]
[test: U+2009 before a directive that spaces and a comment follow in a title of an architecture diagram]
[test: U+200A before the first of two directives that a space separates, in a title of an architecture diagram]
[test: U+200A before the first of two directives that spaces separate, in a title of an architecture diagram]
[test: U+200A before a directive that spaces and a comment follow in a title of an architecture diagram]
[test: U+202F before the first of two directives that a space separates, in a title of an architecture diagram]
[test: U+202F before the first of two directives that spaces separate, in a title of an architecture diagram]
[test: U+202F before a directive that spaces and a comment follow in a title of an architecture diagram]
[test: U+205F before the first of two directives that a space separates, in a title of an architecture diagram]
[test: U+205F before the first of two directives that spaces separate, in a title of an architecture diagram]
[test: U+205F before a directive that spaces and a comment follow in a title of an architecture diagram]
[test: U+3000 before the first of two directives that spaces separate, in a title of an architecture diagram]
[test: U+FEFF before the first of two directives that a space separates, in a title of an architecture diagram]
[test: U+FEFF before the first of two directives that spaces separate, in a title of an architecture diagram]
[test: U+FEFF before a directive that spaces and a comment follow in a title of an architecture diagram]
[test: a run before the directive after a U+2028 inside the text of a title of an architecture diagram]
[test: spaces after the directive after a U+2028 inside the text of a title of an architecture diagram]
[test: spaces after the directive after a U+2029 inside the text of a title of an architecture diagram]
[test: spaces between two directives after a U+2028 inside the text of a title of an architecture diagram]
[test: a tab after the directive after a U+2028 inside the text of a title of an architecture diagram]
[test: a run before two directives that touch after a U+2028 inside the text of a title of an architecture diagram]
[test: U+000B and spaces before the first of two directives that spaces separate, in a title of an architecture diagram]
[test: U+000C and spaces before the first of two directives that spaces separate, in a title of an architecture diagram]
[test: a no-break space and spaces before the first of two directives that spaces separate, in a title of an architecture diagram]
[test: U+1680 and spaces before the first of two directives that spaces separate, in a title of an architecture diagram]
[test: U+2000 and spaces before the first of two directives that spaces separate, in a title of an architecture diagram]
[test: U+2001 and spaces before the first of two directives that spaces separate, in a title of an architecture diagram]
[test: U+2002 and spaces before the first of two directives that spaces separate, in a title of an architecture diagram]
[test: U+2003 and spaces before the first of two directives that spaces separate, in a title of an architecture diagram]
[test: U+2004 and spaces before the first of two directives that spaces separate, in a title of an architecture diagram]
[test: U+2005 and spaces before the first of two directives that spaces separate, in a title of an architecture diagram]
[test: U+2006 and spaces before the first of two directives that spaces separate, in a title of an architecture diagram]
[test: U+2007 and spaces before the first of two directives that spaces separate, in a title of an architecture diagram]
[test: U+2008 and spaces before the first of two directives that spaces separate, in a title of an architecture diagram]
[test: U+2009 and spaces before the first of two directives that spaces separate, in a title of an architecture diagram]
[test: U+200A and spaces before the first of two directives that spaces separate, in a title of an architecture diagram]
[test: U+202F and spaces before the first of two directives that spaces separate, in a title of an architecture diagram]
[test: U+205F and spaces before the first of two directives that spaces separate, in a title of an architecture diagram]
[test: U+3000 and spaces before the first of two directives that spaces separate, in a title of an architecture diagram]
[test: U+FEFF and spaces before the first of two directives that spaces separate, in a title of an architecture diagram]
[test: a no-break space and a tab before the first of two directives that a space separates, in a title of an architecture diagram]
[test: a no-break space before the first of two directives that a tab separates, in a title of an architecture diagram]
[test: U+2003 and a tab before the first of two directives that a space separates, in a title of an architecture diagram]
[test: U+2003 before the first of two directives that a tab separates, in a title of an architecture diagram]
[test: U+2028 before the first of two directives that a tab separates, in a title of an architecture diagram]
[test: U+2029 before the first of two directives that a tab separates, in a title of an architecture diagram]
[test: a U+2028 inside the directive that ends a title, spaces before it, of an architecture diagram]
[test: a U+2028 inside the directive that ends a title, spaces after it, of an architecture diagram]
[test: a U+2029 inside the directive that ends a title, spaces before it, of an architecture diagram]
[test: a U+2029 inside the directive that ends a title, spaces after it, of an architecture diagram]
[test: a line break inside the directive that ends a title, spaces before it, of an architecture diagram]
[test: a line break inside the directive that ends a title, spaces after it, of an architecture diagram]
[test: a U+2028 inside the first of two directives that spaces separate, in a title of an architecture diagram]
[test: a U+2028 inside the last of two directives, spaces before both, in a title of an architecture diagram]
[test: a U+2028 inside the first of two directives that touch, spaces before them, in a title of an architecture diagram]
[test: a U+2028 inside the directive that ends a title, a no-break space before it, of an architecture diagram]
[test: a U+2028 inside a directive that a comment touches in a title, spaces before it, of an architecture diagram]
[test: a U+2028 inside a directive that spaces and a comment follow in a title, of an architecture diagram]
[test: a line break inside the first of two directives that spaces separate, in a title of an architecture diagram]
[test: a line break inside the last of two directives, spaces before both, in a title of an architecture diagram]
[test: a line break inside the first of two directives that touch, spaces before them, in a title of an architecture diagram]
[test: a line break inside the directive that ends a title, a no-break space before it, of an architecture diagram]
[test: a line break inside a directive that a comment touches in a title, spaces before it, of an architecture diagram]
[test: a line break inside a directive that spaces and a comment follow in a title, of an architecture diagram]
[test: a tab between the keyword and the directive of a title of directives only of an architecture diagram]
[test: spaces between the keyword and the directive of a title of directives only of an architecture diagram]
[test: spaces after the directive of a title of directives only of an architecture diagram]
[test: spaces on both sides of the directive of a title of directives only of an architecture diagram]
[test: two directives that spaces separate, a title of directives only of an architecture diagram]
[test: two directives that touch, spaces before them, a title of directives only of an architecture diagram]
[test: a comment that touches the directive of a title of directives only of an architecture diagram]
[test: a space and a comment after the directive of a title of directives only of an architecture diagram]
[test: a wide space before two directives that spaces separate, one space before the first directive, in a title of an architecture diagram]
[test: a wide space before two directives that spaces separate, a run of spaces before the first directive, in a title of an architecture diagram]
[test: a wide space before two directives that spaces separate, a tab before the first directive, in a title of an architecture diagram]
[test: a wide space before two directives that spaces separate, U+2028 before the first directive, in a title of an architecture diagram]
[test: a wide space before two directives that spaces separate, U+2029 before the first directive, in a title of an architecture diagram]
[test: a wide space before two directives that spaces separate, a no-break space between the two directives, in a title of an architecture diagram]
[test: a wide space before two directives that spaces separate, U+2028 between the two directives, in a title of an architecture diagram]
[test: a wide space before two directives that spaces separate, U+2029 between the two directives, in a title of an architecture diagram]
[test: a wide space before two directives that spaces separate, the first directive holds a line break inside, in a title of an architecture diagram]
[test: a wide space before two directives that spaces separate, the last directive holds a line break inside, in a title of an architecture diagram]
[test: a wide space before two directives that spaces separate, the first directive holds a `;` inside, in a title of an architecture diagram]
[test: a wide space before two directives that spaces separate, the last directive holds a `;` inside, in a title of an architecture diagram]
[test: a wide space before two directives that spaces separate, the first directive holds a U+2028 inside, in a title of an architecture diagram]
[test: a wide space before two directives that spaces separate, the last directive holds a U+2028 inside, in a title of an architecture diagram]
[test: a wide space before two directives that spaces separate, a comment touching the last directive, in a title of an architecture diagram]
[test: a wide space before two directives that spaces separate, a value of directives only, in a title of an architecture diagram]
[test: a wide space before a directive that spaces and a comment follow, one space before the first directive, in a title of an architecture diagram]
[test: a wide space before a directive that spaces and a comment follow, a run of spaces before the first directive, in a title of an architecture diagram]
[test: a wide space before a directive that spaces and a comment follow, a tab before the first directive, in a title of an architecture diagram]
[test: a wide space before a directive that spaces and a comment follow, one space after the last directive, in a title of an architecture diagram]
[test: a wide space before a directive that spaces and a comment follow, a tab after the last directive, in a title of an architecture diagram]
[test: a wide space before a directive that spaces and a comment follow, a no-break space after the last directive, in a title of an architecture diagram]
[test: a wide space before a directive that spaces and a comment follow, the first directive holds a line break inside, in a title of an architecture diagram]
[test: a wide space before a directive that spaces and a comment follow, the first directive holds a `;` inside, in a title of an architecture diagram]
[test: a wide space before a directive that spaces and a comment follow, the first directive holds a U+2028 inside, in a title of an architecture diagram]
[test: a wide space before a directive that spaces and a comment follow, a second directive touching the first, in a title of an architecture diagram]
[test: a wide space before a directive that spaces and a comment follow, a second directive after a space, in a title of an architecture diagram]
[test: a wide space before a directive that spaces and a comment follow, a value of directives only, in a title of an architecture diagram]
[test: a wide space before two directives that touch and a comment that touches the last, in a title of an architecture diagram]
[test: a wide space before two directives that touch and a comment that touches the last, one space before the first directive, in a title of an architecture diagram]
[test: a wide space before two directives that touch and a comment that touches the last, a run of spaces before the first directive, in a title of an architecture diagram]
[test: a wide space before two directives that touch and a comment that touches the last, a tab before the first directive, in a title of an architecture diagram]
[test: a wide space before two directives that touch and a comment that touches the last, one space after the last directive, in a title of an architecture diagram]
[test: a wide space before two directives that touch and a comment that touches the last, a tab after the last directive, in a title of an architecture diagram]
[test: a wide space before two directives that touch and a comment that touches the last, a no-break space after the last directive, in a title of an architecture diagram]
[test: a wide space before two directives that touch and a comment that touches the last, the first directive holds a line break inside, in a title of an architecture diagram]
[test: a wide space before two directives that touch and a comment that touches the last, the last directive holds a line break inside, in a title of an architecture diagram]
[test: a wide space before two directives that touch and a comment that touches the last, the first directive holds a `;` inside, in a title of an architecture diagram]
[test: a wide space before two directives that touch and a comment that touches the last, the last directive holds a `;` inside, in a title of an architecture diagram]
[test: a wide space before two directives that touch and a comment that touches the last, the first directive holds a U+2028 inside, in a title of an architecture diagram]
[test: a wide space before two directives that touch and a comment that touches the last, the last directive holds a U+2028 inside, in a title of an architecture diagram]
[test: a wide space before two directives that touch and a comment that touches the last, a value of directives only, in a title of an architecture diagram]
[test: a U+2028 before two directives that touch, one space before the first directive, in a title of an architecture diagram]
[test: a U+2028 before two directives that touch, a run of spaces before the first directive, in a title of an architecture diagram]
[test: a U+2028 before two directives that touch, a tab before the first directive, in a title of an architecture diagram]
[test: a U+2028 before two directives that touch, one space after the last directive, in a title of an architecture diagram]
[test: a U+2028 before two directives that touch, a run of spaces after the last directive, in a title of an architecture diagram]
[test: a U+2028 before two directives that touch, a tab after the last directive, in a title of an architecture diagram]
[test: a U+2028 before two directives that touch, a no-break space after the last directive, in a title of an architecture diagram]
[test: a U+2028 before two directives that touch, U+2028 after the last directive, in a title of an architecture diagram]
[test: a U+2028 before two directives that touch, U+2029 after the last directive, in a title of an architecture diagram]
[test: a U+2028 before two directives that touch, the first directive holds a line break inside, in a title of an architecture diagram]
[test: a U+2028 before two directives that touch, the last directive holds a line break inside, in a title of an architecture diagram]
[test: a U+2028 before two directives that touch, the first directive holds a `;` inside, in a title of an architecture diagram]
[test: a U+2028 before two directives that touch, the last directive holds a `;` inside, in a title of an architecture diagram]
[test: a U+2028 before two directives that touch, the first directive holds a U+2028 inside, in a title of an architecture diagram]
[test: a U+2028 before two directives that touch, the last directive holds a U+2028 inside, in a title of an architecture diagram]
[test: a U+2028 before two directives that touch, a value of directives only, in a title of an architecture diagram]
[test: a U+2028 before a directive that spaces follow, in a title of an architecture diagram]
[test: a U+2028 before a directive that spaces follow, one space before the first directive, in a title of an architecture diagram]
[test: a U+2028 before a directive that spaces follow, a run of spaces before the first directive, in a title of an architecture diagram]
[test: a U+2028 before a directive that spaces follow, a tab before the first directive, in a title of an architecture diagram]
[test: a U+2028 before a directive that spaces follow, U+2029 before the first directive, in a title of an architecture diagram]
[test: a U+2028 before a directive that spaces follow, one space after the last directive, in a title of an architecture diagram]
[test: a U+2028 before a directive that spaces follow, a tab after the last directive, in a title of an architecture diagram]
[test: a U+2028 before a directive that spaces follow, a no-break space after the last directive, in a title of an architecture diagram]
[test: a U+2028 before a directive that spaces follow, U+2028 after the last directive, in a title of an architecture diagram]
[test: a U+2028 before a directive that spaces follow, U+2029 after the last directive, in a title of an architecture diagram]
[test: a U+2028 before a directive that spaces follow, the first directive holds a line break inside, in a title of an architecture diagram]
[test: a U+2028 before a directive that spaces follow, the first directive holds a `;` inside, in a title of an architecture diagram]
[test: a U+2028 before a directive that spaces follow, the first directive holds a U+2028 inside, in a title of an architecture diagram]
[test: a U+2028 before a directive that spaces follow, a second directive after a space, in a title of an architecture diagram]
[test: a U+2028 before two directives that spaces separate, a no-break space between the two directives, in a title of an architecture diagram]
[test: a U+2028 before two directives that spaces separate, U+2028 between the two directives, in a title of an architecture diagram]
[test: a U+2028 before two directives that spaces separate, U+2029 between the two directives, in a title of an architecture diagram]
[test: a U+2028 before two directives that spaces separate, the first directive holds a line break inside, in a title of an architecture diagram]
[test: a U+2028 before two directives that spaces separate, the last directive holds a line break inside, in a title of an architecture diagram]
[test: a U+2028 before two directives that spaces separate, the first directive holds a `;` inside, in a title of an architecture diagram]
[test: a U+2028 before two directives that spaces separate, the last directive holds a `;` inside, in a title of an architecture diagram]
[test: a U+2028 before two directives that spaces separate, the first directive holds a U+2028 inside, in a title of an architecture diagram]
[test: a U+2028 before two directives that spaces separate, the last directive holds a U+2028 inside, in a title of an architecture diagram]
[test: a directive that holds a line break, spaces before it, one space before the first directive, in a title of an architecture diagram]
[test: a directive that holds a line break, spaces before it, a tab before the first directive, in a title of an architecture diagram]
[test: a directive that holds a line break, spaces before it, U+2028 before the first directive, in a title of an architecture diagram]
[test: a directive that holds a line break, spaces before it, U+2029 before the first directive, in a title of an architecture diagram]
[test: a directive that holds a line break, spaces before it, one space after the last directive, in a title of an architecture diagram]
[test: a directive that holds a line break, spaces before it, a tab after the last directive, in a title of an architecture diagram]
[test: a directive that holds a line break, spaces before it, a no-break space after the last directive, in a title of an architecture diagram]
[test: a directive that holds a line break, spaces before it, U+2028 after the last directive, in a title of an architecture diagram]
[test: a directive that holds a line break, spaces before it, U+2029 after the last directive, in a title of an architecture diagram]
[test: a directive that holds a line break, spaces before it, a second directive after a space, in a title of an architecture diagram]
[test: a directive that holds a line break, spaces before it, a value of directives only, in a title of an architecture diagram]
[test: a directive that holds a U+2028, spaces before it, one space before the first directive, in a title of an architecture diagram]
[test: a directive that holds a U+2028, spaces before it, a tab before the first directive, in a title of an architecture diagram]
[test: a directive that holds a U+2028, spaces before it, U+2028 before the first directive, in a title of an architecture diagram]
[test: a directive that holds a U+2028, spaces before it, U+2029 before the first directive, in a title of an architecture diagram]
[test: a directive that holds a U+2028, spaces before it, one space after the last directive, in a title of an architecture diagram]
[test: a directive that holds a U+2028, spaces before it, a tab after the last directive, in a title of an architecture diagram]
[test: a directive that holds a U+2028, spaces before it, a no-break space after the last directive, in a title of an architecture diagram]
[test: a directive that holds a U+2028, spaces before it, U+2028 after the last directive, in a title of an architecture diagram]
[test: a directive that holds a U+2028, spaces before it, U+2029 after the last directive, in a title of an architecture diagram]
[test: a directive that holds a U+2028, spaces before it, a second directive after a space, in a title of an architecture diagram]
[test: a directive that holds a U+2028, spaces before it, a value of directives only, in a title of an architecture diagram]
[test: a U+2028 inside the text, spaces before the directive, one space before the first directive, in a title of an architecture diagram]
[test: a U+2028 inside the text, spaces before the directive, a tab before the first directive, in a title of an architecture diagram]
[test: a U+2028 inside the text, spaces before the directive, a no-break space before the first directive, in a title of an architecture diagram]
[test: a U+2028 inside the text, spaces before the directive, U+2028 before the first directive, in a title of an architecture diagram]
[test: a U+2028 inside the text, spaces before the directive, U+2029 before the first directive, in a title of an architecture diagram]
[test: a U+2028 inside the text, spaces before the directive, one space after the last directive, in a title of an architecture diagram]
[test: a U+2028 inside the text, spaces before the directive, a tab after the last directive, in a title of an architecture diagram]
[test: a U+2028 inside the text, spaces before the directive, a no-break space after the last directive, in a title of an architecture diagram]
[test: a U+2028 inside the text, spaces before the directive, U+2028 after the last directive, in a title of an architecture diagram]
[test: a U+2028 inside the text, spaces before the directive, U+2029 after the last directive, in a title of an architecture diagram]
[test: a U+2028 inside the text, spaces before the directive, the first directive holds a line break inside, in a title of an architecture diagram]
[test: a U+2028 inside the text, spaces before the directive, the first directive holds a `;` inside, in a title of an architecture diagram]
[test: a U+2028 inside the text, spaces before the directive, the first directive holds a U+2028 inside, in a title of an architecture diagram]
[test: a U+2028 inside the text, spaces before the directive, a second directive touching the first, in a title of an architecture diagram]
[test: a U+2028 inside the text, spaces before the directive, a second directive after a space, in a title of an architecture diagram]
[test: a U+2028 inside the text, spaces before the directive, a comment touching the last directive, in a title of an architecture diagram]
[test: a U+2028 inside the text, spaces before the directive, a value of directives only, in a title of an architecture diagram]
[test: a value of directives only, spaces after the directive, a tab before the first directive, in a title of an architecture diagram]
[test: a value of directives only, spaces after the directive, one space after the last directive, in a title of an architecture diagram]
[test: a value of directives only, spaces after the directive, a tab after the last directive, in a title of an architecture diagram]
[test: a value of directives only, spaces after the directive, a no-break space after the last directive, in a title of an architecture diagram]
[test: a value of directives only, spaces after the directive, U+2028 after the last directive, in a title of an architecture diagram]
[test: a value of directives only, spaces after the directive, U+2029 after the last directive, in a title of an architecture diagram]
[test: a value of directives only, spaces after the directive, the first directive holds a line break inside, in a title of an architecture diagram]
[test: a value of directives only, spaces after the directive, the first directive holds a `;` inside, in a title of an architecture diagram]
[test: a value of directives only, spaces after the directive, the first directive holds a U+2028 inside, in a title of an architecture diagram]
[test: a value of directives only, spaces after the directive, a second directive touching the first, in a title of an architecture diagram]
[test: a value of directives only, spaces after the directive, a second directive after a space, in a title of an architecture diagram]
[test: a directive inside the text, spaces before and after the last directive, in a title of an architecture diagram]
[test: a directive inside the text, spaces before and after the last directive, one space before the first directive, in a title of an architecture diagram]
[test: a directive inside the text, spaces before and after the last directive, a tab before the first directive, in a title of an architecture diagram]
[test: a directive inside the text, spaces before and after the last directive, a no-break space before the first directive, in a title of an architecture diagram]
[test: a directive inside the text, spaces before and after the last directive, U+2028 before the first directive, in a title of an architecture diagram]
[test: a directive inside the text, spaces before and after the last directive, U+2029 before the first directive, in a title of an architecture diagram]
[test: a directive inside the text, spaces before and after the last directive, one space after the last directive, in a title of an architecture diagram]
[test: a directive inside the text, spaces before and after the last directive, a tab after the last directive, in a title of an architecture diagram]
[test: a directive inside the text, spaces before and after the last directive, a no-break space after the last directive, in a title of an architecture diagram]
[test: a directive inside the text, spaces before and after the last directive, U+2028 after the last directive, in a title of an architecture diagram]
[test: a directive inside the text, spaces before and after the last directive, U+2029 after the last directive, in a title of an architecture diagram]
[test: a directive inside the text, spaces before and after the last directive, the first directive holds a line break inside, in a title of an architecture diagram]
[test: a directive inside the text, spaces before and after the last directive, the first directive holds a `;` inside, in a title of an architecture diagram]
[test: a directive inside the text, spaces before and after the last directive, the first directive holds a U+2028 inside, in a title of an architecture diagram]
[test: a directive inside the text, spaces before and after the last directive, a second directive touching the first, in a title of an architecture diagram]
[test: a directive inside the text, spaces before and after the last directive, a second directive after a space, in a title of an architecture diagram]
[test: a directive inside the text, spaces before and after the last directive, a comment touching the last directive, in a title of an architecture diagram]
[test: a directive inside the text, spaces before and after the last directive, a value of directives only, in a title of an architecture diagram]
[test: a `;` in the text, spaces before the directive, one space before the first directive, in a title of an architecture diagram]
[test: a `;` in the text, spaces before the directive, one space after the last directive, in a title of an architecture diagram]
[test: a `;` in the text, spaces before the directive, U+2028 after the last directive, in a title of an architecture diagram]
[test: a `;` in the text, spaces before the directive, U+2029 after the last directive, in a title of an architecture diagram]
[test: a `;` in the text, spaces before the directive, the first directive holds a line break inside, in a title of an architecture diagram]
[test: a `;` in the text, spaces before the directive, the first directive holds a `;` inside, in a title of an architecture diagram]
[test: a `;` in the text, spaces before the directive, the first directive holds a U+2028 inside, in a title of an architecture diagram]
[test: a `;` in the text, spaces between two directives, a tab before the first directive, in a title of an architecture diagram]
[test: a `;` in the text, spaces between two directives, a no-break space before the first directive, in a title of an architecture diagram]
[test: a `;` in the text, spaces between two directives, U+2028 before the first directive, in a title of an architecture diagram]
[test: a `;` in the text, spaces between two directives, U+2029 before the first directive, in a title of an architecture diagram]
[test: a `;` in the text, spaces between two directives, a tab between the two directives, in a title of an architecture diagram]
[test: a `;` in the text, spaces between two directives, U+2028 between the two directives, in a title of an architecture diagram]
[test: a `;` in the text, spaces between two directives, U+2029 between the two directives, in a title of an architecture diagram]
[test: a `;` in the text, spaces between two directives, the first directive holds a line break inside, in a title of an architecture diagram]
[test: a `;` in the text, spaces between two directives, the last directive holds a line break inside, in a title of an architecture diagram]
[test: a `;` in the text, spaces between two directives, the first directive holds a `;` inside, in a title of an architecture diagram]
[test: a `;` in the text, spaces between two directives, the last directive holds a `;` inside, in a title of an architecture diagram]
[test: a `;` in the text, spaces between two directives, the first directive holds a U+2028 inside, in a title of an architecture diagram]
[test: a `;` in the text, spaces between two directives, the last directive holds a U+2028 inside, in a title of an architecture diagram]
[test: a `;` in the text, spaces between two directives, a comment touching the last directive, in a title of an architecture diagram]
[test: a `;` between two directives, spaces around it, one space before the first directive, in a title of an architecture diagram]
[test: a `;` between two directives, spaces around it, a tab before the first directive, in a title of an architecture diagram]
[test: a `;` between two directives, spaces around it, a no-break space before the first directive, in a title of an architecture diagram]
[test: a `;` between two directives, spaces around it, U+2028 before the first directive, in a title of an architecture diagram]
[test: a `;` between two directives, spaces around it, U+2029 before the first directive, in a title of an architecture diagram]
[test: a `;` between two directives, spaces around it, one space after the last directive, in a title of an architecture diagram]
[test: a `;` between two directives, spaces around it, a run of spaces after the last directive, in a title of an architecture diagram]
[test: a `;` between two directives, spaces around it, a tab after the last directive, in a title of an architecture diagram]
[test: a `;` between two directives, spaces around it, a no-break space after the last directive, in a title of an architecture diagram]
[test: a `;` between two directives, spaces around it, U+2028 after the last directive, in a title of an architecture diagram]
[test: a `;` between two directives, spaces around it, U+2029 after the last directive, in a title of an architecture diagram]
[test: a `;` between two directives, spaces around it, the first directive holds a line break inside, in a title of an architecture diagram]
[test: a `;` between two directives, spaces around it, the last directive holds a line break inside, in a title of an architecture diagram]
[test: a `;` between two directives, spaces around it, the first directive holds a `;` inside, in a title of an architecture diagram]
[test: a `;` between two directives, spaces around it, the last directive holds a `;` inside, in a title of an architecture diagram]
[test: a `;` between two directives, spaces around it, the first directive holds a U+2028 inside, in a title of an architecture diagram]
[test: a `;` between two directives, spaces around it, the last directive holds a U+2028 inside, in a title of an architecture diagram]
[test: a `;` between two directives, spaces around it, one directive only, in a title of an architecture diagram]
[test: a `;` between two directives, spaces around it, a comment touching the last directive, in a title of an architecture diagram]
[test: a `;` between two directives, spaces around it, a value of directives only, in a title of an architecture diagram]
[test: a `;` after the last directive, one space before the first directive, in a title of an architecture diagram]
[test: a `;` after the last directive, a tab before the first directive, in a title of an architecture diagram]
[test: a `;` after the last directive, a no-break space before the first directive, in a title of an architecture diagram]
[test: a `;` after the last directive, U+2028 before the first directive, in a title of an architecture diagram]
[test: a `;` after the last directive, U+2029 before the first directive, in a title of an architecture diagram]
[test: a `;` after the last directive, the first directive holds a line break inside, in a title of an architecture diagram]
[test: a `;` after the last directive, the first directive holds a `;` inside, in a title of an architecture diagram]
[test: a `;` after the last directive, the first directive holds a U+2028 inside, in a title of an architecture diagram]
[test: a `;` after the last directive, a second directive touching the first, in a title of an architecture diagram]
[test: a `;` after the last directive, a second directive after a space, in a title of an architecture diagram]
[test: a `;` after the last directive, a comment touching the last directive, in a title of an architecture diagram]
[test: a `;` after the last directive, a value of directives only, in a title of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, one space before the first directive, in a title of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a tab before the first directive, in a title of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a no-break space before the first directive, in a title of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a value of directives only, in a title of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, one space before the first directive, in a title of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, a tab before the first directive, in a title of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, a value of directives only, in a title of an architecture diagram]
[test: a `;` after the last directive, a U+2028 before the directives, a comment after it, in a title of an architecture diagram]
[test: a `;` after the last directive, a U+2028 before the directives, a comment after it, one space before the first directive, in a title of an architecture diagram]
[test: a `;` after the last directive, a U+2028 before the directives, a comment after it, a run of spaces before the first directive, in a title of an architecture diagram]
[test: a `;` after the last directive, a U+2028 before the directives, a comment after it, a tab before the first directive, in a title of an architecture diagram]
[test: a `;` after the last directive, a U+2028 before the directives, a comment after it, a no-break space before the first directive, in a title of an architecture diagram]
[test: a `;` after the last directive, a U+2028 before the directives, a comment after it, U+2029 before the first directive, in a title of an architecture diagram]
[test: a `;` after the last directive, a U+2028 before the directives, a comment after it, the first directive holds a line break inside, in a title of an architecture diagram]
[test: a `;` after the last directive, a U+2028 before the directives, a comment after it, the first directive holds a `;` inside, in a title of an architecture diagram]
[test: a `;` after the last directive, a U+2028 before the directives, a comment after it, the first directive holds a U+2028 inside, in a title of an architecture diagram]
[test: a `;` after the last directive, a U+2028 before the directives, a comment after it, a second directive touching the first, in a title of an architecture diagram]
[test: a `;` after the last directive, a U+2028 before the directives, a comment after it, a second directive after a space, in a title of an architecture diagram]
[test: a `;` after the last directive, a U+2028 before the directives, a comment after it, no comment, in a title of an architecture diagram]
[test: a `;` after the last directive, a U+2028 before the directives, a comment after it, a value of directives only, in a title of an architecture diagram]
[test: a `;` between two directives, a U+2028 before the directives, a comment after them, in a title of an architecture diagram]
[test: a `;` between two directives, a U+2028 before the directives, a comment after them, one space before the first directive, in a title of an architecture diagram]
[test: a `;` between two directives, a U+2028 before the directives, a comment after them, a run of spaces before the first directive, in a title of an architecture diagram]
[test: a `;` between two directives, a U+2028 before the directives, a comment after them, a tab before the first directive, in a title of an architecture diagram]
[test: a `;` between two directives, a U+2028 before the directives, a comment after them, a no-break space before the first directive, in a title of an architecture diagram]
[test: a `;` between two directives, a U+2028 before the directives, a comment after them, U+2029 before the first directive, in a title of an architecture diagram]
[test: a `;` between two directives, a U+2028 before the directives, a comment after them, the first directive holds a line break inside, in a title of an architecture diagram]
[test: a `;` between two directives, a U+2028 before the directives, a comment after them, the last directive holds a line break inside, in a title of an architecture diagram]
[test: a `;` between two directives, a U+2028 before the directives, a comment after them, the first directive holds a `;` inside, in a title of an architecture diagram]
[test: a `;` between two directives, a U+2028 before the directives, a comment after them, the last directive holds a `;` inside, in a title of an architecture diagram]
[test: a `;` between two directives, a U+2028 before the directives, a comment after them, the first directive holds a U+2028 inside, in a title of an architecture diagram]
[test: a `;` between two directives, a U+2028 before the directives, a comment after them, the last directive holds a U+2028 inside, in a title of an architecture diagram]
[test: a `;` between two directives, a U+2028 before the directives, a comment after them, no comment, in a title of an architecture diagram]
[test: a `;` between two directives, a U+2028 before the directives, a comment after them, a value of directives only, in a title of an architecture diagram]
[test: a U+2028 after the last directive that spaces and a comment follow, one space after the last directive, in a title of an architecture diagram]
[test: a U+2028 after the last directive that spaces and a comment follow, a tab after the last directive, in a title of an architecture diagram]
[test: a U+2028 after the last directive that spaces and a comment follow, no comment, in a title of an architecture diagram]
[test: a U+2028 between two directives, spaces and a comment after the last one, one space between the two directives, in a title of an architecture diagram]
[test: a U+2028 between two directives, spaces and a comment after the last one, a run of spaces between the two directives, in a title of an architecture diagram]
[test: a U+2028 between two directives, spaces and a comment after the last one, a tab between the two directives, in a title of an architecture diagram]
[test: a U+2028 between two directives, spaces and a comment after the last one, a no-break space between the two directives, in a title of an architecture diagram]
[test: a U+2028 between two directives, spaces and a comment after the last one, no comment, in a title of an architecture diagram]
[test: a directive, a `;`, two spaces, a directive, in a title of directives only of an architecture diagram]
[test: a directive, a space, a `;`, two spaces, a directive, in a title of directives only of an architecture diagram]
[test: a directive, a tab, a `;`, two spaces, a directive, in a title of directives only of an architecture diagram]
[test: a directive, a no-break space, a `;`, two spaces, a directive, in a title of directives only of an architecture diagram]
[test: a directive, U+3000, a `;`, two spaces, a directive, in a title of directives only of an architecture diagram]
[test: a directive, a vertical tab, a `;`, two spaces, a directive, in a title of directives only of an architecture diagram]
[test: a directive, a form feed, a `;`, two spaces, a directive, in a title of directives only of an architecture diagram]
[test: a directive, U+2028, a `;`, two spaces, a directive, in a title of directives only of an architecture diagram]
[test: a directive, U+2029, a `;`, two spaces, a directive, in a title of directives only of an architecture diagram]
[test: a directive, a space, U+2028, a `;`, two spaces, a directive, in a title of directives only of an architecture diagram]
[test: a directive, U+2028, a space, a `;`, two spaces, a directive, in a title of directives only of an architecture diagram]
[test: a directive, two spaces, a `;`, a directive, in a title of directives only of an architecture diagram]
[test: a directive, two spaces, a `;`, a space, a directive, in a title of directives only of an architecture diagram]
[test: a directive, two spaces, a `;`, a tab, a directive, in a title of directives only of an architecture diagram]
[test: a directive, two spaces, a `;`, a no-break space, a directive, in a title of directives only of an architecture diagram]
[test: a directive, two spaces, a `;`, U+3000, a directive, in a title of directives only of an architecture diagram]
[test: a directive, two spaces, a `;`, U+2028, a directive, in a title of directives only of an architecture diagram]
[test: a directive, two spaces, a `;`, U+2029, a directive, in a title of directives only of an architecture diagram]
[test: a directive, two spaces, a `;`, a space, U+2028, a directive, in a title of directives only of an architecture diagram]
[test: a directive, two spaces, a `;`, two spaces, a directive, a space, in a title of directives only of an architecture diagram]
[test: a directive, two spaces, a `;`, two spaces, a directive, two spaces, in a title of directives only of an architecture diagram]
[test: a directive, two spaces, a `;`, two spaces, a directive, a tab, in a title of directives only of an architecture diagram]
[test: a directive, two spaces, a `;`, two spaces, a directive, a no-break space, in a title of directives only of an architecture diagram]
[test: a directive, two spaces, a `;`, two spaces, a directive, U+3000, in a title of directives only of an architecture diagram]
[test: a directive, two spaces, a `;`, two spaces, a directive, a vertical tab, in a title of directives only of an architecture diagram]
[test: a directive, two spaces, a `;`, two spaces, a directive, U+2028, in a title of directives only of an architecture diagram]
[test: a directive, two spaces, a `;`, two spaces, a directive, U+2029, in a title of directives only of an architecture diagram]
[test: a directive, two spaces, a `;`, two spaces, a directive, a comment, in a title of directives only of an architecture diagram]
[test: a directive, two spaces, a `;`, two spaces, a directive, a space, a comment, in a title of directives only of an architecture diagram]
[test: a directive, two spaces, a `;`, two spaces, a directive, a tab, a comment, in a title of directives only of an architecture diagram]
[test: a directive, two spaces, a `;`, two spaces, a directive, a no-break space, a comment, in a title of directives only of an architecture diagram]
[test: a directive, two spaces, a `;`, in a title of directives only of an architecture diagram]
[test: a directive, a `;`, two spaces, in a title of directives only of an architecture diagram]
[test: a directive, two spaces, a `;`, two spaces, in a title of directives only of an architecture diagram]
[test: a directive, two spaces, a `;`, a comment, in a title of directives only of an architecture diagram]
[test: a directive, a `;`, a space, a comment, in a title of directives only of an architecture diagram]
[test: a directive, two spaces, a `;`, two spaces, a comment, in a title of directives only of an architecture diagram]
[test: a directive, a `;`, a comment, in a title of directives only of an architecture diagram]
[test: a directive, two spaces, a `;`, a tab, a comment, in a title of directives only of an architecture diagram]
[test: a directive, a `;`, a `;`, in a title of directives only of an architecture diagram]
[test: a directive, two spaces, a `;`, a `;`, in a title of directives only of an architecture diagram]
[test: a directive, a `;`, two spaces, a `;`, in a title of directives only of an architecture diagram]
[test: a directive, two spaces, a `;`, two spaces, a `;`, in a title of directives only of an architecture diagram]
[test: a directive, two spaces, a `;`, two spaces, a `;`, two spaces, a directive, in a title of directives only of an architecture diagram]
[test: a directive, a `;`, a `;`, two spaces, a directive, in a title of directives only of an architecture diagram]
[test: a directive, a directive, two spaces, a `;`, two spaces, a directive, in a title of directives only of an architecture diagram]
[test: a directive, two spaces, a `;`, two spaces, a directive, a directive, in a title of directives only of an architecture diagram]
[test: a directive, a `;`, a directive, a `;`, a directive, in a title of directives only of an architecture diagram]
[test: a directive, two spaces, a `;`, two spaces, a directive, two spaces, a `;`, two spaces, a directive, in a title of directives only of an architecture diagram]
[test: a directive, two spaces, a `;`, two spaces, a directive, a `;`, in a title of directives only of an architecture diagram]
[test: a directive, two spaces, a `;`, two spaces, a directive, two spaces, a `;`, in a title of directives only of an architecture diagram]
[test: a directive, two spaces, a directive, two spaces, a `;`, two spaces, a directive, in a title of directives only of an architecture diagram]
[test: a directive, two spaces, a `;`, two spaces, a directive, two spaces, a directive, in a title of directives only of an architecture diagram]
[test: a directive, a `;`, two spaces, a directive, two spaces, a `;`, two spaces, a directive, in a title of directives only of an architecture diagram]
[test: a directive, a `;`, a directive, a `;`, in a title of directives only of an architecture diagram]
[test: a `;`, a directive, in a title of directives only of an architecture diagram]
[test: a `;`, two spaces, a directive, in a title of directives only of an architecture diagram]
[test: a directive, a `;`, two spaces, a `;`, two spaces, in a title of directives only of an architecture diagram]
[test: a `;` in the comment after the last directive, two spaces around the `;` between two directives, in a title of directives only of an architecture diagram]
[test: a directive, a `;`, a no-break space, a `;`, two spaces, a directive, in a title of directives only of an architecture diagram]
[test: a directive, a no-break space, a `;`, two spaces, a `;`, two spaces, a directive, in a title of directives only of an architecture diagram]
[test: a directive, a `;`, U+2028, a `;`, a directive, in a title of directives only of an architecture diagram]
[test: a directive, two spaces, a `;`, two spaces, a no-break space, two spaces, a `;`, two spaces, a directive, in a title of directives only of an architecture diagram]
[test: a directive, a `;`, a no-break space, a `;`, two spaces, a `;`, two spaces, a directive, in a title of directives only of an architecture diagram]
[test: a directive, U+2028, a `;`, two spaces, a `;`, two spaces, a directive, in a title of directives only of an architecture diagram]
[test: two U+2028 before the directive that ends a title, of an architecture diagram]
[test: two U+2029 before the directive that ends a title, of an architecture diagram]
[test: U+2028 and U+2029 before the directive that ends a title, of an architecture diagram]
[test: two U+2028 before the directive that ends a title, spaces after it, of an architecture diagram]
[test: U+2029 and U+2028 before the directive that ends a title, spaces after it, of an architecture diagram]
[test: two U+2028 before two directives that touch and end a title, of an architecture diagram]
[test: two U+2028 before a directive that a space and another directive follow in a title, of an architecture diagram]
[test: a U+2028 inside the directive that ends a title, spaces before it, a comment after two spaces, of an architecture diagram]
[test: a U+2028 inside the directive of a title of directives only, spaces before and after it, of an architecture diagram]
[test: a directive that starts the text of a title, two spaces and a text after it, spaces at the end, of an architecture diagram]
[test: a directive that starts the text of a title, a space and a text after it, of an architecture diagram]
[test: two directives that touch and start the text of a title, two spaces and a text after them, spaces at the end, of an architecture diagram]
[test: two directives that touch and start the text of a title, a tab and a text after them, of an architecture diagram]
[test: a directive that starts the text of a title, a text with a run of spaces inside it, spaces at the end, of an architecture diagram]
[test: a directive that starts the text of a title, a text with a tab inside it, a tab at the end, of an architecture diagram]
[test: two spaces before the directive that starts the text of a title, of an architecture diagram]
[test: two directives with spaces between them that start the text of a title, of an architecture diagram]
[test: a directive that starts the text of a title and a directive that ends it, of an architecture diagram]
[test: a U+2028 inside the directive that starts the text of a title, two spaces and a text after it, spaces at the end, of an architecture diagram]
[test: a line break inside the directive that starts the text of a title, two spaces and a text after it, spaces at the end, of an architecture diagram]
[test: a `;` inside the directive that starts the text of a title, two spaces and a text after it, spaces at the end, of an architecture diagram]
[test: a `;` at the end of a title, spaces after the keyword, of an architecture diagram]
[test: a `;` at the end of a title, a run of spaces inside the text, of an architecture diagram]
[test: a `;` at the end of a title, spaces after it, of an architecture diagram]
[test: a `;` after spaces at the end of a title, spaces after it, of an architecture diagram]
[test: a text after the `;` of a title, spaces at the end, of an architecture diagram]
[test: released output that the document does not state: a `;` inside the comment after the text of a title, spaces at the end, of an architecture diagram]
[test: a `;` at the end of a title, U+3000 after it, of an architecture diagram]
[test: released output that the document does not state: a U+2028 in the text of a title that ends with a `;`, of an architecture diagram]
[test: a comment after the text of a title, spaces before it, of an architecture diagram]
[test: a run of spaces inside the text of a title, of an architecture diagram]
[test: a run of tabs inside the text of a title, spaces at the end, of an architecture diagram]
[test: a run of spaces inside a quoted string in a title, of an architecture diagram]
[test: a run of spaces beside a directive inside the text of a title, of an architecture diagram]
[test: released output that the document does not state: text after the `;` that the line rule ignores in a title, runs before and after it, of an architecture diagram]
[test: released output that the document does not state: text touching the `;` that the line rule ignores in a title, a run before it, of an architecture diagram]
[test: released output that the document does not state: text and a run after the `;` that the line rule ignores in a title, spaces at the end, of an architecture diagram]
[test: released output that the document does not state: two touching `;` that the line rule reads in a title, a run before them, of an architecture diagram]
[test: released output that the document does not state: two `;` with spaces between them that the line rule reads in a title, a run before them, of an architecture diagram]
[test: released output that the document does not state: text after the last of two `;` that the line rule reads in a title, runs around them, of an architecture diagram]
[test: released output that the document does not state: text after the `;` that the line rule ignores after classDef in a title, of an architecture diagram]
[test: nothing after the `;` that the line rule ignores in a title, runs before it, of an architecture diagram]
[test: a run inside the stretch of the line rule, nothing after the `;` in a title, spaces at the end, of an architecture diagram]
[test: released output that the document does not state: nothing after the last of two `;` that the line rule reads in a title, of an architecture diagram]
[test: released output that the document does not state: a comment after the `;` that the line rule ignores in a title, of an architecture diagram]
[test: released output that the document does not state: a `;` inside the comment at the end of a title, a run and spaces at the end, of an architecture diagram]
[test: nothing after the `;` that the line rule ignores in a title, spaces at the end, of an architecture diagram]
[test: a run after the keyword of a title, nothing after the `;` that the line rule ignores, of an architecture diagram]
[test: the literal style without the trigger and a `;` at the end of a title, spaces at the end, of an architecture diagram]
[test: the word Style with a capital and a `;` at the end of a title, spaces at the end, of an architecture diagram]
[test: a tab after the `;` that the line rule ignores in a title, runs before it, of an architecture diagram]
[test: a classDef trigger with nothing after the `;` in a title, runs before it, of an architecture diagram]
[test: the literal classDef and a `;` at the end of a title, spaces at the end, of an architecture diagram]
[test: the literal style inside a word and a `;` at the end of a title, spaces at the end, of an architecture diagram]
[test: the word classdef in lower case and a `;` at the end of a title, spaces at the end, of an architecture diagram]
[test: U+2028 before a directive that a comment touches, a line follows, in a title of an architecture diagram]
[test: U+2028 before a directive that a comment touches, the text ends, in a title of an architecture diagram]
[test: U+2028 before a directive that a comment touches, an empty line follows, in a title of an architecture diagram]
[test: U+2028 before a directive that a comment follows after spaces, a line follows, in a title of an architecture diagram]
[test: U+2028 before a directive that a comment follows after spaces, the text ends, in a title of an architecture diagram]
[test: U+2028 before a directive that a comment follows after spaces, an empty line follows, in a title of an architecture diagram]
[test: U+2029 before a directive that a comment touches, a line follows, in a title of an architecture diagram]
[test: U+2029 before a directive that a comment touches, the text ends, in a title of an architecture diagram]
[test: U+2029 before a directive that a comment touches, an empty line follows, in a title of an architecture diagram]
[test: U+2029 before a directive that a comment follows after spaces, a line follows, in a title of an architecture diagram]
[test: U+2029 before a directive that a comment follows after spaces, the text ends, in a title of an architecture diagram]
[test: U+2029 before a directive that a comment follows after spaces, an empty line follows, in a title of an architecture diagram]
[test: U+2028 before a directive that a comment touches, a comment line follows, in a title of an architecture diagram]
[test: U+2028 before a directive that a comment touches, a line of whitespace follows, in a title of an architecture diagram]
[test: U+2028 before a directive that a comment touches, a directive line follows, in a title of an architecture diagram]
[test: U+2028 before a directive that a comment touches, a directive line and a comment line follow, in a title of an architecture diagram]
[test: U+2028 before a directive that a comment touches, an empty line and a comment line follow, in a title of an architecture diagram]
[test: U+2028 before a directive that a comment touches, a directive line, an empty line, and a comment line follow, in a title of an architecture diagram]
[test: U+2028 before a directive that a comment touches, an empty line and a directive line follow, in a title of an architecture diagram]
[test: U+2028 before a directive that a comment touches, a directive line follows and the text ends, in a title of an architecture diagram]
[test: U+2028 before two directives with spaces between them that a comment touches, the text ends, in a title of an architecture diagram]
[test: U+2028 before two directives with a tab between them that a comment follows after spaces, the text ends, in a title of an architecture diagram]
[test: U+2029 before a directive that a comment touches, a directive line and a comment line follow, in a title of an architecture diagram]
[test: U+2028 after the last directive, spaces and a comment after it, a comment line follows, in a title of an architecture diagram]
[test: U+2028 after the last directive, spaces and a comment after it, a line of whitespace follows, in a title of an architecture diagram]
[test: U+2028 after the last directive, spaces and a comment after it, a directive line follows, in a title of an architecture diagram]
[test: U+2028 after the last directive, spaces and a comment after it, a directive line and a comment line follow, in a title of an architecture diagram]
[test: U+2028 after the last directive, spaces and a comment after it, an empty line and a comment line follow, in a title of an architecture diagram]
[test: U+2028 after the last directive, spaces and a comment after it, a directive line, an empty line, and a comment line follow, in a title of an architecture diagram]
[test: U+2028 after the last directive, spaces and a comment after it, an empty line and a directive line follow, in a title of an architecture diagram]
[test: U+2028 after the last directive, spaces and a comment after it, a directive line follows and the text ends, in a title of an architecture diagram]
[test: U+2028 after the last directive, spaces and a comment after it, the text ends, in a title of an architecture diagram]
[test: U+2028 after the last directive, spaces and a comment after it, an empty line follows, in a title of an architecture diagram]
[test: U+2028 after the last directive, spaces and a comment after it, a line follows, in a title of an architecture diagram]
[test: U+2029 after the last directive, spaces and a comment after it, the text ends, in a title of an architecture diagram]
[test: U+2028 after the last directive, a comment touching it, the text ends, in a title of an architecture diagram]
[test: U+2028 after the last directive, a comment touching it, a directive line follows, in a title of an architecture diagram]
[test: U+2028 between two directives, spaces and a comment after it, a comment line follows, in a title of an architecture diagram]
[test: U+2028 between two directives, spaces and a comment after it, a line of whitespace follows, in a title of an architecture diagram]
[test: U+2028 between two directives, spaces and a comment after it, a directive line follows, in a title of an architecture diagram]
[test: U+2028 between two directives, spaces and a comment after it, a directive line and a comment line follow, in a title of an architecture diagram]
[test: U+2028 between two directives, spaces and a comment after it, an empty line and a comment line follow, in a title of an architecture diagram]
[test: U+2028 between two directives, spaces and a comment after it, a directive line, an empty line, and a comment line follow, in a title of an architecture diagram]
[test: U+2028 between two directives, spaces and a comment after it, an empty line and a directive line follow, in a title of an architecture diagram]
[test: U+2028 between two directives, spaces and a comment after it, a directive line follows and the text ends, in a title of an architecture diagram]
[test: U+2028 between two directives, spaces and a comment after it, the text ends, in a title of an architecture diagram]
[test: U+2028 between two directives, spaces and a comment after it, an empty line follows, in a title of an architecture diagram]
[test: U+2028 between two directives, spaces and a comment after it, a line follows, in a title of an architecture diagram]
[test: U+2029 between two directives, spaces and a comment after it, the text ends, in a title of an architecture diagram]
[test: U+2028 between two directives, a comment touching it, the text ends, in a title of an architecture diagram]
[test: U+2028 between two directives, a comment touching it, a directive line follows, in a title of an architecture diagram]
[test: U+2028 after the last directive and spaces, spaces and a comment after it, the text ends, in a title of an architecture diagram]
[test: a U+2028 inside the text, a directive, and a comment after spaces, in a title of an architecture diagram]
[test: a U+2028 inside the text, a directive that a comment touches, in a title of an architecture diagram]
[test: a wide space before two directives that spaces separate, the text ends, in a title of an architecture diagram]
[test: a wide space before a directive that spaces and a comment follow, the text ends, in a title of an architecture diagram]
[test: a wide space before two directives that touch and a comment that touches the last, the text ends, in a title of an architecture diagram]
[test: a U+2028 before two directives that touch, the text ends, in a title of an architecture diagram]
[test: a U+2028 before a directive that spaces follow, the text ends, in a title of an architecture diagram]
[test: a U+2028 before two directives that spaces separate, the text ends, in a title of an architecture diagram]
[test: a directive that holds a line break, spaces before it, the text ends, in a title of an architecture diagram]
[test: a directive that holds a U+2028, spaces before it, the text ends, in a title of an architecture diagram]
[test: a U+2028 inside the text, spaces before the directive, the text ends, in a title of an architecture diagram]
[test: a value of directives only, spaces after the directive, the text ends, in a title of an architecture diagram]
[test: a directive inside the text, spaces before and after the last directive, the text ends, in a title of an architecture diagram]
[test: a `;` in the text, spaces before the directive, the text ends, in a title of an architecture diagram]
[test: a `;` in the text, spaces between two directives, the text ends, in a title of an architecture diagram]
[test: a `;` between two directives, spaces around it, the text ends, in a title of an architecture diagram]
[test: a `;` after the last directive, the text ends, in a title of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, a comment line follows, in a title of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, an empty line follows, in a title of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, a line of whitespace follows, in a title of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, a directive line follows, in a title of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, a comment line and a statement follow, in a title of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, an empty line and a statement follow, in a title of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, the text ends, in a title of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, a comment line follows, in a title of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, an empty line follows, in a title of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, a line of whitespace follows, in a title of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, a directive line follows, in a title of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, a comment line and a statement follow, in a title of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, an empty line and a statement follow, in a title of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a comment line follows, in a title of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, an empty line follows, in a title of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a line of whitespace follows, in a title of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a directive line follows, in a title of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a comment line and a statement follow, in a title of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, an empty line and a statement follow, in a title of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, the text ends, in a title of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a comment line follows, in a title of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, an empty line follows, in a title of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a line of whitespace follows, in a title of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a directive line follows, in a title of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a comment line and a statement follow, in a title of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, an empty line and a statement follow, in a title of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, a comment line follows, in a title of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, an empty line follows, in a title of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, a line of whitespace follows, in a title of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, a directive line follows, in a title of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, a comment line and a statement follow, in a title of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, an empty line and a statement follow, in a title of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, the text ends, in a title of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, a comment line follows, in a title of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, an empty line follows, in a title of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, a line of whitespace follows, in a title of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, a directive line follows, in a title of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, a comment line and a statement follow, in a title of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, an empty line and a statement follow, in a title of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, an indented directive line follows, in a title of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, a directive and spaces follow, in a title of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, two directives that touch follow, in a title of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, a directive and a comment on a line follow, in a title of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, a line of a no-break space follows, in a title of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, a line of a tab follows, in a title of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, an indented comment line follows, in a title of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, an indented directive line follows, in a title of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, a directive and spaces follow, in a title of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, two directives that touch follow, in a title of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, a directive and a comment on a line follow, in a title of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, a line of a no-break space follows, in a title of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, a line of a tab follows, in a title of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, an indented comment line follows, in a title of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, an indented directive line follows, in a title of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a directive and spaces follow, in a title of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, two directives that touch follow, in a title of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a directive and a comment on a line follow, in a title of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a line of a no-break space follows, in a title of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a line of a tab follows, in a title of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, an indented comment line follows, in a title of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, an indented directive line follows, in a title of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a directive and spaces follow, in a title of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, two directives that touch follow, in a title of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a directive and a comment on a line follow, in a title of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a line of a no-break space follows, in a title of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a line of a tab follows, in a title of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, an indented comment line follows, in a title of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, an indented directive line follows, in a title of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, a directive and spaces follow, in a title of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, two directives that touch follow, in a title of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, a directive and a comment on a line follow, in a title of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, a line of a no-break space follows, in a title of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, a line of a tab follows, in a title of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, an indented comment line follows, in a title of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, an indented directive line follows, in a title of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, a directive and spaces follow, in a title of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, two directives that touch follow, in a title of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, a directive and a comment on a line follow, in a title of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, a line of a no-break space follows, in a title of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, a line of a tab follows, in a title of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, an indented comment line follows, in a title of an architecture diagram]
[test: a `;` after the last directive, a U+2028 before the directives, a comment after it, the text ends, in a title of an architecture diagram]
[test: a `;` between two directives, a U+2028 before the directives, a comment after them, the text ends, in a title of an architecture diagram]
[test: a U+2028 after the last directive that spaces and a comment follow, a comment line follows, in a title of an architecture diagram]
[test: a U+2028 after the last directive that spaces and a comment follow, an empty line follows, in a title of an architecture diagram]
[test: a U+2028 after the last directive that spaces and a comment follow, a line of whitespace follows, in a title of an architecture diagram]
[test: a U+2028 after the last directive that spaces and a comment follow, a directive line follows, in a title of an architecture diagram]
[test: a U+2028 after the last directive that spaces and a comment follow, a comment line and a statement follow, in a title of an architecture diagram]
[test: a U+2028 after the last directive that spaces and a comment follow, an empty line and a statement follow, in a title of an architecture diagram]
[test: a U+2028 after the last directive that spaces and a comment follow, the text ends, in a title of an architecture diagram]
[test: a U+2028 after the last directive that spaces and a comment follow, a comment line follows, in a title of an architecture diagram]
[test: a U+2028 after the last directive that spaces and a comment follow, an empty line follows, in a title of an architecture diagram]
[test: a U+2028 after the last directive that spaces and a comment follow, a line of whitespace follows, in a title of an architecture diagram]
[test: a U+2028 after the last directive that spaces and a comment follow, a directive line follows, in a title of an architecture diagram]
[test: a U+2028 after the last directive that spaces and a comment follow, a comment line and a statement follow, in a title of an architecture diagram]
[test: a U+2028 after the last directive that spaces and a comment follow, an empty line and a statement follow, in a title of an architecture diagram]
[test: a U+2028 between two directives, spaces and a comment after the last one, a comment line follows, in a title of an architecture diagram]
[test: a U+2028 between two directives, spaces and a comment after the last one, an empty line follows, in a title of an architecture diagram]
[test: a U+2028 between two directives, spaces and a comment after the last one, a line of whitespace follows, in a title of an architecture diagram]
[test: a U+2028 between two directives, spaces and a comment after the last one, a directive line follows, in a title of an architecture diagram]
[test: a U+2028 between two directives, spaces and a comment after the last one, a comment line and a statement follow, in a title of an architecture diagram]
[test: a U+2028 between two directives, spaces and a comment after the last one, an empty line and a statement follow, in a title of an architecture diagram]
[test: a U+2028 between two directives, spaces and a comment after the last one, the text ends, in a title of an architecture diagram]
[test: a U+2028 between two directives, spaces and a comment after the last one, a comment line follows, in a title of an architecture diagram]
[test: a U+2028 between two directives, spaces and a comment after the last one, an empty line follows, in a title of an architecture diagram]
[test: a U+2028 between two directives, spaces and a comment after the last one, a line of whitespace follows, in a title of an architecture diagram]
[test: a U+2028 between two directives, spaces and a comment after the last one, a directive line follows, in a title of an architecture diagram]
[test: a U+2028 between two directives, spaces and a comment after the last one, a comment line and a statement follow, in a title of an architecture diagram]
[test: a U+2028 between two directives, spaces and a comment after the last one, an empty line and a statement follow, in a title of an architecture diagram]
[test: a line of a directive, two spaces before a comment line after a U+2028 before two directives, the text ends, in a title of an architecture diagram]
[test: a line of two spaces, a directive before a comment line after a U+2028 before two directives, the text ends, in a title of an architecture diagram]
[test: a line of a tab, a directive before a comment line after a U+2028 before two directives, the text ends, in a title of an architecture diagram]
[test: a line of a directive, a tab before a comment line after a U+2028 before two directives, the text ends, in a title of an architecture diagram]
[test: a line of a no-break space, a directive before a comment line after a U+2028 before two directives, the text ends, in a title of an architecture diagram]
[test: a line of a directive, a no-break space before a comment line after a U+2028 before two directives, the text ends, in a title of an architecture diagram]
[test: a line of a directive, two spaces, a directive before a comment line after a U+2028 before two directives, the text ends, in a title of an architecture diagram]
[test: a line of a directive, U+2028 before a comment line after a U+2028 before two directives, the text ends, in a title of an architecture diagram]
[test: a line of a directive, a space, a comment before a comment line after a U+2028 before two directives, the text ends, in a title of an architecture diagram]
[test: a line of a tab before a comment line after a U+2028 before a directive, the text ends, in a title of an architecture diagram]
[test: a line of a no-break space before a comment line after a U+2028 before a directive, the text ends, in a title of an architecture diagram]
[test: a line of U+3000 before a comment line after a U+2028 before a directive, the text ends, in a title of an architecture diagram]
[test: a line of a vertical tab before a comment line after a U+2028 before a directive, the text ends, in a title of an architecture diagram]
[test: a line of a form feed before a comment line after a U+2028 before a directive, the text ends, in a title of an architecture diagram]
[test: a line of U+2028 before a comment line after a U+2028 before a directive, the text ends, in a title of an architecture diagram]
[test: a line of U+2029 before a comment line after a U+2028 before a directive, the text ends, in a title of an architecture diagram]
[test: a line of U+0085 before a comment line after a U+2028 before a directive, the text ends, in a title of an architecture diagram]
[test: a line of U+180E before a comment line after a U+2028 before a directive, the text ends, in a title of an architecture diagram]
[test: U+2028 between two directives and after the last, a comment touches it, the text ends, in a title of an architecture diagram]
[test: U+2028 between two directives and after the last, a comment follows after spaces, the text ends, in a title of an architecture diagram]
[test: U+2029 between two directives and after the last, a comment follows after spaces, the text ends, in a title of an architecture diagram]
[test: U+2029 between two directives and U+2028 after the last, a comment follows after a tab, the text ends, in a title of an architecture diagram]
[test: U+2028 between two directives and after the last, a comment follows after a no-break space, the text ends, in a title of an architecture diagram]
[test: U+2028 between two directives and after the last, a comment follows after spaces, a statement follows, in a title of an architecture diagram]
[test: U+2028 between two directives and after the last, a comment follows after spaces, an empty line and a statement follow, in a title of an architecture diagram]
[test: U+2028 between two directives and after the last, a comment follows after spaces, a directive line and a statement follow, in a title of an architecture diagram]
[test: U+2028 between two directives and after the last, a comment follows after spaces, a comment line and a statement follow, in a title of an architecture diagram]
[test: U+2028 between two directives and after the last, a comment follows after spaces, a comment line follows and the text ends, in a title of an architecture diagram]
[test: U+2028 between two directives and after the last, a comment follows after spaces, a directive line follows and the text ends, in a title of an architecture diagram]
[test: U+2028 between the first and the second of three directives, between the second and the third, and after the third, a comment touches it, the text ends, in a title of an architecture diagram]
[test: U+2028 before the directives, between two directives, and after the last, a comment touches it, the text ends, in a title of an architecture diagram]
[test: U+2028 between two directives of a title of directives only and after the last, a comment follows after spaces, the text ends, in a title of an architecture diagram]
[test: U+2028 after the last directive, a no-break space and a comment after it, the text ends, in a title of an architecture diagram]
[test: U+2028 between two directives, a no-break space and a comment after the last, the text ends, in a title of an architecture diagram]
[test: U+2028 after the last directive, U+3000 and a comment after it, the text ends, in a title of an architecture diagram]
[test: U+2028 between two directives, U+3000 and a comment after the last, the text ends, in a title of an architecture diagram]
[test: U+2028 after the last directive, a space and a no-break space and a comment after it, the text ends, in a title of an architecture diagram]
[test: U+2028 between two directives, a space and a no-break space and a comment after the last, the text ends, in a title of an architecture diagram]
[test: U+2028 after the last directive, a no-break space and a comment after it, a statement follows, in a title of an architecture diagram]
[test: U+2028 between two directives and after the last, two spaces after the first, a comment touches the last U+2028, the text ends, in a title of an architecture diagram]
[test: U+2028 between two directives and after the last, a tab after the first, a comment touches the last U+2028, the text ends, in a title of an architecture diagram]
[test: U+2028 between two directives and after the last, a no-break space after the first, a comment touches the last U+2028, the text ends, in a title of an architecture diagram]
[test: U+2028 between two directives and after the last, U+3000 after the first, a comment touches the last U+2028, the text ends, in a title of an architecture diagram]
[test: U+2028 between two directives and after the last, two spaces before the first, a comment touches the last U+2028, the text ends, in a title of an architecture diagram]
[test: U+2028 between two directives and after the last, a tab before the first, a comment touches the last U+2028, the text ends, in a title of an architecture diagram]
[test: U+2028 between two directives and after the last, a no-break space before the first, a comment touches the last U+2028, the text ends, in a title of an architecture diagram]
[test: U+2029 between two directives, two spaces after it, and U+2028 after the last, a comment touches the last U+2028, the text ends, in a title of an architecture diagram]
[test: U+2028 between two directives of a title of directives only, two spaces after it, and U+2028 after the last, a comment touches the last U+2028, the text ends, in a title of an architecture diagram]
[test: U+2028 between two directives, two spaces after it, and U+2028 after the last, a comment touches the last U+2028, a statement follows, in a title of an architecture diagram]
[test: U+2028 between two directives, two spaces after it, a comment touches the last directive, the text ends, in a title of an architecture diagram]
[test: U+2028 between two directives, two spaces after it, a comment follows the last directive after spaces, the text ends, in a title of an architecture diagram]
[test: U+2028 between two directives, a no-break space before the comment, the text ends, in a title of an architecture diagram]
[test: U+2028 between two directives, two spaces after it, a comment touches the last directive, a statement follows, in a title of an architecture diagram]
[test: U+2028 between the first and the second of three directives and between the second and the third, a comment follows the third after a space, the text ends, in a title of an architecture diagram]
[test: U+2028 between the first and the second of three directives and between the second and the third, a comment touches the third, the text ends, in a title of an architecture diagram]
[test: U+2029 between the first and the second of three directives and between the second and the third, a comment follows the third after two spaces, the text ends, in a title of an architecture diagram]
[test: U+2028 between the first and the second of three directives and between the second and the third, a comment follows the third after a space, a statement follows, in a title of an architecture diagram]
[test: U+2028 between the first and the second of three directives and between the second and the third of a title of directives only, a comment follows the third after a space, the text ends, in a title of an architecture diagram]
[test: U+2028 between two directives and after the last, a comment line stands between the last U+2028 and a statement, in a title of an architecture diagram]
[test: a `;` after the last directive, touching the directive, U+2028 after it, the text ends, in a title of an architecture diagram]
[test: a `;` after the last directive, two spaces after the directive, U+2028 after it, the text ends, in a title of an architecture diagram]
[test: a `;` after the last directive, touching the directive, U+2029 after it, the text ends, in a title of an architecture diagram]
[test: a `;` after the last directive, two spaces after the directive, U+2029 after it, the text ends, in a title of an architecture diagram]
[test: a `;` after the last directive, touching the directive, a space and U+2028 after it, the text ends, in a title of an architecture diagram]
[test: a `;` after the last directive, two spaces after the directive, a space and U+2028 after it, the text ends, in a title of an architecture diagram]
[test: a `;` after the last directive, touching the directive, U+2028 and a space after it, the text ends, in a title of an architecture diagram]
[test: a `;` after the last directive, two spaces after the directive, U+2028 and a space after it, the text ends, in a title of an architecture diagram]
[test: a `;` after the last directive, touching the directive, a no-break space and U+2028 after it, the text ends, in a title of an architecture diagram]
[test: a `;` after the last directive, two spaces after the directive, a no-break space and U+2028 after it, the text ends, in a title of an architecture diagram]
[test: a `;` after the last directive, touching the directive, U+2028 and a no-break space after it, the text ends, in a title of an architecture diagram]
[test: a `;` after the last directive, two spaces after the directive, U+2028 and a no-break space after it, the text ends, in a title of an architecture diagram]
[test: a `;` after the last directive, touching the directive, U+2028, a space, and U+2028 after it, the text ends, in a title of an architecture diagram]
[test: a `;` after the last directive, two spaces after the directive, U+2028, a space, and U+2028 after it, the text ends, in a title of an architecture diagram]
[test: a `;` after the last directive, touching the directive, two spaces and U+2028 after it, the text ends, in a title of an architecture diagram]
[test: a `;` after the last directive, two spaces after the directive, two spaces and U+2028 after it, the text ends, in a title of an architecture diagram]
[test: a `;` after the last directive, touching the directive, a no-break space after it, the text ends, in a title of an architecture diagram]
[test: a `;` after the last directive, two spaces after the directive, a no-break space after it, the text ends, in a title of an architecture diagram]
[test: a `;` after the last directive, touching the directive, U+3000 after it, the text ends, in a title of an architecture diagram]
[test: a `;` after the last directive, two spaces after the directive, U+3000 after it, the text ends, in a title of an architecture diagram]
[test: a `;` after the last directive, U+2028 after it, a statement follows, in a title of an architecture diagram]
[test: a `;` after the last directive, two spaces and U+2028 after it, a statement follows, in a title of an architecture diagram]
[test: a `;` after the last directive, a no-break space after it, a statement follows, in a title of an architecture diagram]
[test: a `;`, two spaces, a `;`, and U+2028 after the last directive, the text ends, in a title of an architecture diagram]
[test: a line of a directive and a `;` before a comment line after a U+2028 before a directive, the text ends, in a title of an architecture diagram]
[test: a line of a `;` and a comment before a comment line after a U+2028 before a directive, the text ends, in a title of an architecture diagram]
[test: a line of a comment that holds a `;` before a comment line after a U+2028 before a directive, the text ends, in a title of an architecture diagram]
[test: a line of a directive and a comment that holds a `;` before a comment line after a U+2028 before a directive, the text ends, in a title of an architecture diagram]
[test: a line of a directive that holds a `;` before a comment line after a U+2028 before a directive, the text ends, in a title of an architecture diagram]
[test: a `;` before the U+2028 between two directives, a comment follows the last directive after two spaces, the text ends, in a title of an architecture diagram]
[test: a `;` before the U+2028 between two directives, two spaces after the U+2028, a comment follows the last directive after two spaces, the text ends, in a title of an architecture diagram]
[test: a `;` between two directives, a U+2028 after the last directive, two spaces and a comment after it, the text ends, in a title of an architecture diagram]
[test: a `;` after the U+2028 between two directives, a comment follows the last directive after two spaces, the text ends, in a title of an architecture diagram]
[test: a `;` before the U+2028 between two directives, two spaces after the U+2028, a comment follows the last directive after two spaces, a statement follows, in a title of an architecture diagram]
[test: two U+2028 with two spaces on each side between two directives, a comment follows the last directive after two spaces, the text ends, in a title of an architecture diagram]
[test: two U+2029 between two directives, a comment follows the last directive after two spaces, the text ends, in a title of an architecture diagram]
[test: U+2028 and U+2029 between two directives, a comment follows the last directive after two spaces, the text ends, in a title of an architecture diagram]
[test: two U+2028 after the last directive, a comment touches the second, the text ends, in a title of an architecture diagram]
[test: U+2028 and U+2029 with two spaces on each side after the last directive, a comment follows the second after two spaces, the text ends, in a title of an architecture diagram]
[test: two U+2028 with two spaces on each side after a single directive, a comment follows after two spaces, the text ends, in a title of an architecture diagram]
[test: a `;` inside the comment after the last directive, two spaces before the comment, the text ends, in a title of an architecture diagram]
[test: a U+2028 between the text and a directive, a U+2028 between the directive and the comment, an empty line and a statement follow, in a title of an architecture diagram]
[test: a U+2028 after the last directive of a title of directives only, two spaces before and after it, a comment follows, the text ends, in a title of an architecture diagram]
[test: two U+2028 before a directive that a comment touches, an empty line and a statement follow, in a title of an architecture diagram]
[test: two U+2028 before a directive that a comment follows after spaces, an empty line and a statement follow, in a title of an architecture diagram]
[test: U+2029 and U+2028 before a directive that a comment touches, the text ends, in a title of an architecture diagram]
[test: two U+2028 before a directive that a comment touches, a comment line follows, in a title of an architecture diagram]
[test: two U+2028 before a directive that a comment touches, a line of whitespace follows, in a title of an architecture diagram]
[test: two U+2028 before a directive that a comment touches, a directive line follows, in a title of an architecture diagram]
[test: a comment after the last directive after two spaces, a comment line that holds a `;` and an empty line follow, a statement follows, in a title of an architecture diagram]
[test: a U+2028 before a directive that a comment follows after two spaces, a comment line that holds a `;` follows, a statement follows, in a title of an architecture diagram]
[test: a comment after the last directive after two spaces, a directive line that holds a `;` and an empty line follow, a statement follows, in a title of an architecture diagram]
[test: a directive that starts the text, two spaces and a text after it, spaces at the end, the text ends, in a title of an architecture diagram]
[test: two directives that touch and start the text, a text after them, spaces at the end, the text ends, in a title of an architecture diagram]
[test: a directive that starts the text, two spaces and a text after it, spaces at the end, a statement follows, in a title of an architecture diagram]
[test: a directive that starts the text, two spaces and a text after it, a statement whose label holds a `;` follows, in a title of an architecture diagram]

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

共有の `accTitle: value` と `accDescr: value` を、下の段落と、
[ディレクティブが前にある題](#title)と、
[セミコロン](#semicolons)の節が述べるところを除いて使います。
コロンをキーワードに付け、両端の空白を除いた非空値の前は空白1個、
空ならコロンで終えます。
[規則 1](./printed-form.ja.md#1-記号の横の空白)がコロンを与えます。
これはキーのコロンです。
詳しくは
[コロンがどの種類かの決め方](./printed-form.ja.md#コロンがどの種類かの決め方)
の手順 2 を参照してください。
そこの表に `accTitle: text` があります。
キーに接し、後ろに空白 1 個が付きます。
これにより外側の空白を統一します。
`accDescr` の値の中の空白とタブの連なりは空白 1 つにして印字し、
`accTitle` の連なりはブラウザがツールチップとして表示するので、
書かれたまま残します。
（[同じに描かれるテキスト中の空白の連なり](./compatibility.ja.md#同じに描かれるテキスト中の空白の連なり)）。
次行の文を取り込まず、コロン後の波括弧は行値のまま保ちます。
mermaid.js は次の行を独立した文として読むので、つなぐと、
その文が title や description に入り、その文が宣言するもの（ノード、グループ、
ジャンクション、エッジ）がなくなります。
値にテキストがあり、そのテキストの前にも中にもディレクティブがなく、
テキストの中に U+2028 も U+2029 もないとき、値の終わりのディレクティブは、
その前と後に何があるかで、次のように印字します。
ただし、[題の一覧](#title)が述べる未決の行は除きます。
幅のある空白は、U+000B、U+000C、U+00A0、U+1680、U+2000 から U+200A、U+202F、
U+205F、U+3000、U+FEFF のどれかです。
ディレクティブの前に U+2028 か U+2029 があり、
最後のディレクティブの後にコメントが続くときは、
未決でない行を題の一覧の項目 6 と同じに印字し、
題の一覧の項目 6 が行を分けるときは、以下の項目はその行に当たりません。
コロンはキーワードに接するので、コロンの前の隙間は、
行を書かれたままにするときも、隙間なしで印字します。

- ディレクティブの前が空白とタブだけ、または何もなく、その前のテキストにも、
  どのディレクティブの中にも `;` がなく、どのディレクティブも改行、U+2028、
  U+2029 を含まず、最後のディレクティブの後が空白とタブだけのときは、
  それぞれのディレクティブの前に空白かタブがあれば空白 1 つを置き、
  行末の空白とタブの有無にかかわらず、
  最後のディレクティブの後の空白とタブを除いて印字します。
- ディレクティブの前に幅のある空白があり、ディレクティブが互いに接して、
  最後のディレクティブに行末かコメントが接するときは、その文字を、
  同じ連なりの残りとともに空白 1 つで印字します。
  U+2028 か U+2029 が前にあり、
  最後のディレクティブに行末が接するときも同じです。
- ディレクティブの前に幅のある空白があり、最初のディレクティブの後に、
  空白かタブと、別のディレクティブかコメントが続くときは、その文字は残り、
  その後ろからディレクティブかコメントまでの、空白とタブの連なりを、
  それぞれ空白 1 つで印字します。
- ディレクティブの前に U+2028 か U+2029 があり、
  最後のディレクティブにコメントが続かず、
  最後のディレクティブの後に空白かタブが続くとき、
  または最初のディレクティブの後に空白かタブと別のディレクティブが続くときは、
  行を書かれたままにします。
- 幅のある空白がディレクティブの間にあるときは、
  最後のディレクティブの後に何が続いても、行を書かれたままにします。
- 最後のディレクティブの後に幅のある空白があるときは、
  その前に空白やタブがあっても、その後に何が続いても、行を書かれたままにします。
  テキストの中にディレクティブのある値も、書かれたままです。

最後のディレクティブの後にコメントが続き、
テキストとコメントの間に U+2028 も U+2029 もなく、行が未決でなく、
項目 5 と 6 のどちらにも当たらないときは、
それぞれのディレクティブの前とコメントの前の空白とタブの連なりを、
空白 1 つで印字します。
コメントの中に `;` があっても同じです。
（[同じに描かれるキーワードの後のテキスト](./compatibility.ja.md#同じに描かれるキーワードの後のテキスト)）。

規則 1 は、ディレクティブの隣の隙間の印を挙げていないので、
[規則 2](./printed-form.ja.md#2-prettier-にない種類の隙間)が決めます。
ほかの図の種類は、ディレクティブの前の空白とタブの連なりを空白 1 つで印字し、
行末の空白を除きます（項目 1）。
（[同じに描かれるキーワードの後のテキスト](./compatibility.ja.md#同じに描かれるキーワードの後のテキスト)）。
ほかの項目は、規則が決めない隙間と文字について、
リリース済みの版が印字する形を述べています。
ほかの図の種類が違う形で印字する形は、決まるまでそのまま残します。
（[どの決まりも形を決めない所](./printed-form.ja.md#4-どの決まりも形を決めない所)）。

テキストの中に U+2028 か U+2029 があるとき、または値がディレクティブだけで、
行が未決でないときは、
最後のディレクティブの後に空白かタブが続けば（その後が行末でもコメントでも）、
またはディレクティブの間に空白かタブがあれば、行を書かれたままにし、
項目 3 は適用しません。
どちらでもなければ、ほかの項目が、
ほかのテキストの行を印字するのと同じに印字するので、
ディレクティブの前の空白とタブの連なり（キーワードの後のものも）はそれぞれ空白 1
つになります。

未決の行は述べません。
そこでは出力が、`;` と U+2028 か U+2029 の両側の文字ごとに決まり、
規則 1 はこれらの隙間の印を挙げず、図の種類も同じには印字しません。
そこでリリース済みの版が印字する形は、
[どの決まりも形を決めない所](./printed-form.ja.md#4-どの決まりも形を決めない所)
のとおり、決めるまでそのままです。
行に U+2028 も U+2029 もないとき、
行そのもののコメントの中の `;` は行を変えないので、`;` がそこだけにある行は、
題と次の文の間の行のコメントかディレクティブの中に `;` がある場合を除き、
未決ではありません。
整形が投げる行は、そこでは述べません。

[fixture: accessibility-lines/acc-directives-end-blanks-dropped]
[fixture: accessibility-lines/acc-directives-end-tabs-dropped]
[fixture: accessibility-lines/acc-directives-in-the-text-kept]
[fixture: accessibility-lines/acc-directives-then-comment]
[fixture: accessibility-lines/acctitle-directives-end-at-the-end-of-the-text]
[fixture: accessibility-lines/accdescr-directives-end-at-the-end-of-the-text]
[fixture: accessibility-lines/acc-directives-end-before-comment-line-and-empty-line]
[fixture: architecture/accessibility-lines/a11y-empty-comment-gap]
[test: a no-break space after the last directive of an accTitle line of an architecture diagram]
[test: a no-break space before the directive that ends an accTitle line of an architecture diagram]
[test: a no-break space after the last directive of an accDescr line of an architecture diagram]
[test: a no-break space before the directive that ends an accDescr line of an architecture diagram]
[test: U+2028 before the directive that ends an accTitle line of an architecture diagram]
[test: a no-break space before a directive that a space and a comment follow in an accDescr line of an architecture diagram]
[test: the gap before the colon of an accTitle line with a no-break space after its last directive of an architecture diagram]
[test: U+3000 after the last directive of an accTitle line of an architecture diagram]
[test: U+2028 after the last directive of an accTitle line of an architecture diagram]
[test: U+2029 after the last directive of an accTitle line of an architecture diagram]
[test: U+3000 before the directive that ends an accTitle line of an architecture diagram]
[test: U+2029 before the directive that ends an accTitle line of an architecture diagram]
[test: U+3000 after the last directive of an accDescr line of an architecture diagram]
[test: U+2028 after the last directive of an accDescr line of an architecture diagram]
[test: U+2029 after the last directive of an accDescr line of an architecture diagram]
[test: U+3000 before the directive that ends an accDescr line of an architecture diagram]
[test: U+2028 before the directive that ends an accDescr line of an architecture diagram]
[test: U+2029 before the directive that ends an accDescr line of an architecture diagram]
[test: a no-break space before a directive that a space and a comment follow in an accTitle line of an architecture diagram]
[test: U+2028 before the last directive, a space and a tab after it, in an accTitle line of an architecture diagram]
[test: U+2029 before the last directive, a space and a tab after it, in an accTitle line of an architecture diagram]
[test: a space, a tab, and a no-break space after the last directive of an accTitle line of an architecture diagram]
[test: a space, a tab, and U+3000 after the last directive of an accTitle line of an architecture diagram]
[test: the gap before the colon of an accTitle line with U+3000 after its last directive of an architecture diagram]
[test: a space, a tab, and U+2028 after the last directive of an accTitle line of an architecture diagram]
[test: the gap before the colon of an accTitle line with U+2028 after its last directive of an architecture diagram]
[test: a space, a tab, and U+2029 after the last directive of an accTitle line of an architecture diagram]
[test: the gap before the colon of an accTitle line with U+2029 after its last directive of an architecture diagram]
[test: a semicolon before the directive of an accTitle line of an architecture diagram, spaces after it]
[test: a semicolon and spaces before the directive that ends an accTitle line of an architecture diagram]
[test: a semicolon after the last directive of an accTitle line of an architecture diagram, spaces around it]
[test: U+2028 before the last directive, a space and a tab after it, in an accDescr line of an architecture diagram]
[test: U+2029 before the last directive, a space and a tab after it, in an accDescr line of an architecture diagram]
[test: a space, a tab, and a no-break space after the last directive of an accDescr line of an architecture diagram]
[test: the gap before the colon of an accDescr line with a no-break space after its last directive of an architecture diagram]
[test: a space, a tab, and U+3000 after the last directive of an accDescr line of an architecture diagram]
[test: the gap before the colon of an accDescr line with U+3000 after its last directive of an architecture diagram]
[test: a space, a tab, and U+2028 after the last directive of an accDescr line of an architecture diagram]
[test: the gap before the colon of an accDescr line with U+2028 after its last directive of an architecture diagram]
[test: a space, a tab, and U+2029 after the last directive of an accDescr line of an architecture diagram]
[test: the gap before the colon of an accDescr line with U+2029 after its last directive of an architecture diagram]
[test: a semicolon before the directive of an accDescr line of an architecture diagram, spaces after it]
[test: a semicolon and spaces before the directive that ends an accDescr line of an architecture diagram]
[test: a semicolon after the last directive of an accDescr line of an architecture diagram, spaces around it]
[test: a semicolon before the directive of an accTitle line of an architecture diagram, a space and a comment after it]
[test: a semicolon and spaces before a directive that a comment touches in an accTitle line of an architecture diagram]
[test: a comment that ends with a semicolon after the last directive of an accTitle line of an architecture diagram]
[test: a comment that has a space before its semicolon after the last directive of an accTitle line of an architecture diagram]
[test: a comment that starts with a semicolon after the last directive of an accTitle line of an architecture diagram]
[test: a semicolon before the directive of an accDescr line of an architecture diagram, a space and a comment after it]
[test: a semicolon and spaces before a directive that a comment touches in an accDescr line of an architecture diagram]
[test: a comment that ends with a semicolon after the last directive of an accDescr line of an architecture diagram]
[test: a comment that has a space before its semicolon after the last directive of an accDescr line of an architecture diagram]
[test: a comment that starts with a semicolon after the last directive of an accDescr line of an architecture diagram]
[test: U+3000 before a directive that a space and a comment follow in an accTitle line of an architecture diagram]
[test: the gap before the colon of an accTitle line with U+2028 before the last directive, a space and a tab after it of an architecture diagram]
[test: the gap before the colon of an accTitle line with U+2029 before the last directive, a space and a tab after it of an architecture diagram]
[test: the gap before the colon of an accTitle line with a semicolon before the directive, spaces after it of an architecture diagram]
[test: the gap before the colon of an accTitle line with a semicolon and spaces before the directive that ends it of an architecture diagram]
[test: the gap before the colon of an accTitle line with a semicolon after the last directive of an architecture diagram]
[test: the gap before the colon of an accTitle line with a space, a tab, and a no-break space after the last directive of an architecture diagram]
[test: the gap before the colon of an accTitle line with a space, a tab, and U+3000 after the last directive of an architecture diagram]
[test: the gap before the colon of an accTitle line with a space, a tab, and U+2028 after the last directive of an architecture diagram]
[test: the gap before the colon of an accTitle line with a space, a tab, and U+2029 after the last directive of an architecture diagram]
[test: released output that the document does not state: a semicolon that the line rule ignores before the directive of an accTitle line of an architecture diagram, spaces after it]
[test: U+3000 before a directive that a space and a comment follow in an accDescr line of an architecture diagram]
[test: the gap before the colon of an accDescr line with U+2028 before the last directive, a space and a tab after it of an architecture diagram]
[test: the gap before the colon of an accDescr line with U+2029 before the last directive, a space and a tab after it of an architecture diagram]
[test: the gap before the colon of an accDescr line with a semicolon before the directive, spaces after it of an architecture diagram]
[test: the gap before the colon of an accDescr line with a semicolon and spaces before the directive that ends it of an architecture diagram]
[test: the gap before the colon of an accDescr line with a semicolon after the last directive of an architecture diagram]
[test: the gap before the colon of an accDescr line with a space, a tab, and a no-break space after the last directive of an architecture diagram]
[test: the gap before the colon of an accDescr line with a space, a tab, and U+3000 after the last directive of an architecture diagram]
[test: the gap before the colon of an accDescr line with a space, a tab, and U+2028 after the last directive of an architecture diagram]
[test: the gap before the colon of an accDescr line with a space, a tab, and U+2029 after the last directive of an architecture diagram]
[test: released output that the document does not state: a semicolon that the line rule ignores before the directive of an accDescr line of an architecture diagram, spaces after it]
[test: the gap before the colon of an accTitle line that holds only `a;` of an architecture diagram]
[test: the gap before the colon of an accDescr line that holds only `a;` of an architecture diagram]
[test: the gap before the colon of an accTitle line that holds only `style:#x;` of an architecture diagram]
[test: the gap before the colon of an accTitle line with a semicolon inside the directive, spaces after it, of an architecture diagram]
[test: the gap before the colon of an accDescr line with a semicolon inside the directive that ends it, of an architecture diagram]
[test: a semicolon inside the directive of an accDescr line, spaces and a comment after it, of an architecture diagram]
[test: a semicolon inside the directive that ends an accTitle line, spaces before it, of an architecture diagram]
[test: released output that the document does not state: a second semicolon touching the semicolon that the line rule ignores, a tab and a directive after them, in an accTitle line of an architecture diagram]
[test: released output that the document does not state: spaces and a second semicolon after the semicolon that the line rule ignores, a directive after them, in an accTitle line of an architecture diagram]
[test: released output that the document does not state: a second semicolon touching the semicolon that the line rule ignores, spaces and a directive after them, in an accDescr line of an architecture diagram]
[test: released output that the document does not state: U+2029 and a directive after the semicolon that the line rule ignores, in an accTitle line of an architecture diagram]
[test: released output that the document does not state: U+2028 and a directive after the semicolon that the line rule ignores, in an accDescr line of an architecture diagram]
[test: released output that the document does not state: spaces and a directive after the semicolon that the line rule ignores, in an accDescr line of an architecture diagram]
[test: released output that the document does not state: a no-break space and a directive after the semicolon that the line rule ignores, in an accDescr line of an architecture diagram]
[test: a tab before the text of a title that ends with a semicolon, of an architecture diagram]
[test: spaces before the text of an accTitle line that ends with a semicolon, of an architecture diagram]
[test: no gap before the text of an accTitle line that ends with a semicolon, of an architecture diagram]
[test: a tab before the text of an accDescr line that ends with a semicolon, of an architecture diagram]
[test: the gap before the colon of an accTitle line that ends with a semicolon, of an architecture diagram]
[test: the gap before the colon of an accDescr line with a semicolon inside the last of two directives, of an architecture diagram]
[test: U+000B before the directive that ends an accTitle line of an architecture diagram]
[test: U+000B before a directive that a space and a comment follow in an accDescr line of an architecture diagram]
[test: U+000B after the last directive of an accTitle line of an architecture diagram]
[test: U+000B after the last directive and spaces of an accDescr line, spaces after it, of an architecture diagram]
[test: U+000C before the directive that ends an accTitle line of an architecture diagram]
[test: U+000C before a directive that a space and a comment follow in an accDescr line of an architecture diagram]
[test: U+000C after the last directive of an accTitle line of an architecture diagram]
[test: U+000C after the last directive and spaces of an accDescr line, spaces after it, of an architecture diagram]
[test: a no-break space after the last directive and spaces of an accDescr line, spaces after it, of an architecture diagram]
[test: U+1680 before the directive that ends an accTitle line of an architecture diagram]
[test: U+1680 before a directive that a space and a comment follow in an accDescr line of an architecture diagram]
[test: U+1680 after the last directive of an accTitle line of an architecture diagram]
[test: U+1680 after the last directive and spaces of an accDescr line, spaces after it, of an architecture diagram]
[test: U+2000 before the directive that ends an accTitle line of an architecture diagram]
[test: U+2000 before a directive that a space and a comment follow in an accDescr line of an architecture diagram]
[test: U+2000 after the last directive of an accTitle line of an architecture diagram]
[test: U+2000 after the last directive and spaces of an accDescr line, spaces after it, of an architecture diagram]
[test: U+2001 before the directive that ends an accTitle line of an architecture diagram]
[test: U+2001 before a directive that a space and a comment follow in an accDescr line of an architecture diagram]
[test: U+2001 after the last directive of an accTitle line of an architecture diagram]
[test: U+2001 after the last directive and spaces of an accDescr line, spaces after it, of an architecture diagram]
[test: U+2002 before the directive that ends an accTitle line of an architecture diagram]
[test: U+2002 before a directive that a space and a comment follow in an accDescr line of an architecture diagram]
[test: U+2002 after the last directive of an accTitle line of an architecture diagram]
[test: U+2002 after the last directive and spaces of an accDescr line, spaces after it, of an architecture diagram]
[test: U+2003 before the directive that ends an accTitle line of an architecture diagram]
[test: U+2003 before a directive that a space and a comment follow in an accDescr line of an architecture diagram]
[test: U+2003 after the last directive of an accTitle line of an architecture diagram]
[test: U+2003 after the last directive and spaces of an accDescr line, spaces after it, of an architecture diagram]
[test: U+2004 before the directive that ends an accTitle line of an architecture diagram]
[test: U+2004 before a directive that a space and a comment follow in an accDescr line of an architecture diagram]
[test: U+2004 after the last directive of an accTitle line of an architecture diagram]
[test: U+2004 after the last directive and spaces of an accDescr line, spaces after it, of an architecture diagram]
[test: U+2005 before the directive that ends an accTitle line of an architecture diagram]
[test: U+2005 before a directive that a space and a comment follow in an accDescr line of an architecture diagram]
[test: U+2005 after the last directive of an accTitle line of an architecture diagram]
[test: U+2005 after the last directive and spaces of an accDescr line, spaces after it, of an architecture diagram]
[test: U+2006 before the directive that ends an accTitle line of an architecture diagram]
[test: U+2006 before a directive that a space and a comment follow in an accDescr line of an architecture diagram]
[test: U+2006 after the last directive of an accTitle line of an architecture diagram]
[test: U+2006 after the last directive and spaces of an accDescr line, spaces after it, of an architecture diagram]
[test: U+2007 before the directive that ends an accTitle line of an architecture diagram]
[test: U+2007 before a directive that a space and a comment follow in an accDescr line of an architecture diagram]
[test: U+2007 after the last directive of an accTitle line of an architecture diagram]
[test: U+2007 after the last directive and spaces of an accDescr line, spaces after it, of an architecture diagram]
[test: U+2008 before the directive that ends an accTitle line of an architecture diagram]
[test: U+2008 before a directive that a space and a comment follow in an accDescr line of an architecture diagram]
[test: U+2008 after the last directive of an accTitle line of an architecture diagram]
[test: U+2008 after the last directive and spaces of an accDescr line, spaces after it, of an architecture diagram]
[test: U+2009 before the directive that ends an accTitle line of an architecture diagram]
[test: U+2009 before a directive that a space and a comment follow in an accDescr line of an architecture diagram]
[test: U+2009 after the last directive of an accTitle line of an architecture diagram]
[test: U+2009 after the last directive and spaces of an accDescr line, spaces after it, of an architecture diagram]
[test: U+200A before the directive that ends an accTitle line of an architecture diagram]
[test: U+200A before a directive that a space and a comment follow in an accDescr line of an architecture diagram]
[test: U+200A after the last directive of an accTitle line of an architecture diagram]
[test: U+200A after the last directive and spaces of an accDescr line, spaces after it, of an architecture diagram]
[test: U+202F before the directive that ends an accTitle line of an architecture diagram]
[test: U+202F before a directive that a space and a comment follow in an accDescr line of an architecture diagram]
[test: U+202F after the last directive of an accTitle line of an architecture diagram]
[test: U+202F after the last directive and spaces of an accDescr line, spaces after it, of an architecture diagram]
[test: U+205F before the directive that ends an accTitle line of an architecture diagram]
[test: U+205F before a directive that a space and a comment follow in an accDescr line of an architecture diagram]
[test: U+205F after the last directive of an accTitle line of an architecture diagram]
[test: U+205F after the last directive and spaces of an accDescr line, spaces after it, of an architecture diagram]
[test: U+3000 after the last directive and spaces of an accDescr line, spaces after it, of an architecture diagram]
[test: U+FEFF before the directive that ends an accTitle line of an architecture diagram]
[test: U+FEFF before a directive that a space and a comment follow in an accDescr line of an architecture diagram]
[test: U+FEFF after the last directive of an accTitle line of an architecture diagram]
[test: U+FEFF after the last directive and spaces of an accDescr line, spaces after it, of an architecture diagram]
[test: a no-break space after the last directive of an accTitle line, a comment touching it, of an architecture diagram]
[test: a no-break space after the last directive of an accDescr line, spaces and a comment after it, of an architecture diagram]
[test: U+2003 after the last directive of an accTitle line, a comment touching it, of an architecture diagram]
[test: U+2003 after the last directive of an accDescr line, spaces and a comment after it, of an architecture diagram]
[test: a semicolon in the text, two directives with spaces between them, an accTitle line, of an architecture diagram]
[test: a semicolon in the text, two directives that touch, spaces before them, an accTitle line, of an architecture diagram]
[test: a semicolon inside the first of two directives, a space between them, an accDescr line, of an architecture diagram]
[test: a semicolon inside the last of two directives, spaces after it, an accDescr line, of an architecture diagram]
[test: a semicolon inside the last of two directives that end an accTitle line, spaces before both, of an architecture diagram]
[test: a semicolon that touches two directives in an accTitle line, of an architecture diagram]
[test: a semicolon after the last of two directives in an accDescr line, spaces around it and a comment after it, of an architecture diagram]
[test: a semicolon in the text, a no-break space after the last directive, an accTitle line, of an architecture diagram]
[test: a semicolon inside the directive, a no-break space after it, an accDescr line, of an architecture diagram]
[test: released output that the document does not state: U+000B between a semicolon that the line rule ignores and a second semicolon, a directive after them, in an accTitle line of an architecture diagram]
[test: released output that the document does not state: U+000C between a semicolon that the line rule ignores and a second semicolon, a directive after them, in an accTitle line of an architecture diagram]
[test: released output that the document does not state: a no-break space between a semicolon that the line rule ignores and a second semicolon, a directive after them, in an accTitle line of an architecture diagram]
[test: released output that the document does not state: U+1680 between a semicolon that the line rule ignores and a second semicolon, a directive after them, in an accTitle line of an architecture diagram]
[test: released output that the document does not state: U+2000 between a semicolon that the line rule ignores and a second semicolon, a directive after them, in an accTitle line of an architecture diagram]
[test: released output that the document does not state: U+2001 between a semicolon that the line rule ignores and a second semicolon, a directive after them, in an accTitle line of an architecture diagram]
[test: released output that the document does not state: U+2002 between a semicolon that the line rule ignores and a second semicolon, a directive after them, in an accTitle line of an architecture diagram]
[test: released output that the document does not state: U+2003 between a semicolon that the line rule ignores and a second semicolon, a directive after them, in an accTitle line of an architecture diagram]
[test: released output that the document does not state: U+2004 between a semicolon that the line rule ignores and a second semicolon, a directive after them, in an accTitle line of an architecture diagram]
[test: released output that the document does not state: U+2005 between a semicolon that the line rule ignores and a second semicolon, a directive after them, in an accTitle line of an architecture diagram]
[test: released output that the document does not state: U+2006 between a semicolon that the line rule ignores and a second semicolon, a directive after them, in an accTitle line of an architecture diagram]
[test: released output that the document does not state: U+2007 between a semicolon that the line rule ignores and a second semicolon, a directive after them, in an accTitle line of an architecture diagram]
[test: released output that the document does not state: U+2008 between a semicolon that the line rule ignores and a second semicolon, a directive after them, in an accTitle line of an architecture diagram]
[test: released output that the document does not state: U+2009 between a semicolon that the line rule ignores and a second semicolon, a directive after them, in an accTitle line of an architecture diagram]
[test: released output that the document does not state: U+200A between a semicolon that the line rule ignores and a second semicolon, a directive after them, in an accTitle line of an architecture diagram]
[test: released output that the document does not state: U+202F between a semicolon that the line rule ignores and a second semicolon, a directive after them, in an accTitle line of an architecture diagram]
[test: released output that the document does not state: U+205F between a semicolon that the line rule ignores and a second semicolon, a directive after them, in an accTitle line of an architecture diagram]
[test: released output that the document does not state: U+3000 between a semicolon that the line rule ignores and a second semicolon, a directive after them, in an accTitle line of an architecture diagram]
[test: released output that the document does not state: U+FEFF between a semicolon that the line rule ignores and a second semicolon, a directive after them, in an accTitle line of an architecture diagram]
[test: U+000B before two directives that touch and end an accTitle line of an architecture diagram]
[test: U+000C before two directives that touch and end an accTitle line of an architecture diagram]
[test: a no-break space before two directives that touch and end an accTitle line of an architecture diagram]
[test: U+1680 before two directives that touch and end an accTitle line of an architecture diagram]
[test: U+2000 before two directives that touch and end an accTitle line of an architecture diagram]
[test: U+2001 before two directives that touch and end an accTitle line of an architecture diagram]
[test: U+2002 before two directives that touch and end an accTitle line of an architecture diagram]
[test: U+2003 before two directives that touch and end an accTitle line of an architecture diagram]
[test: U+2004 before two directives that touch and end an accTitle line of an architecture diagram]
[test: U+2005 before two directives that touch and end an accTitle line of an architecture diagram]
[test: U+2006 before two directives that touch and end an accTitle line of an architecture diagram]
[test: U+2007 before two directives that touch and end an accTitle line of an architecture diagram]
[test: U+2008 before two directives that touch and end an accTitle line of an architecture diagram]
[test: U+2009 before two directives that touch and end an accTitle line of an architecture diagram]
[test: U+200A before two directives that touch and end an accTitle line of an architecture diagram]
[test: U+202F before two directives that touch and end an accTitle line of an architecture diagram]
[test: U+205F before two directives that touch and end an accTitle line of an architecture diagram]
[test: U+3000 before two directives that touch and end an accTitle line of an architecture diagram]
[test: U+FEFF before two directives that touch and end an accTitle line of an architecture diagram]
[test: U+2028 before two directives that touch and end an accTitle line of an architecture diagram]
[test: U+2029 before two directives that touch and end an accTitle line of an architecture diagram]
[test: U+000B before the first of two directives that a space separates, in an accTitle line of an architecture diagram]
[test: U+000B before the first of two directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+000C before the first of two directives that a space separates, in an accTitle line of an architecture diagram]
[test: U+000C before the first of two directives that spaces separate, in an accTitle line of an architecture diagram]
[test: a no-break space before the first of two directives that a space separates, in an accTitle line of an architecture diagram]
[test: a no-break space before the first of two directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+1680 before the first of two directives that a space separates, in an accTitle line of an architecture diagram]
[test: U+1680 before the first of two directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+2000 before the first of two directives that a space separates, in an accTitle line of an architecture diagram]
[test: U+2000 before the first of two directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+2001 before the first of two directives that a space separates, in an accTitle line of an architecture diagram]
[test: U+2001 before the first of two directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+2002 before the first of two directives that a space separates, in an accTitle line of an architecture diagram]
[test: U+2002 before the first of two directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+2003 before the first of two directives that a space separates, in an accTitle line of an architecture diagram]
[test: U+2003 before the first of two directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+2004 before the first of two directives that a space separates, in an accTitle line of an architecture diagram]
[test: U+2004 before the first of two directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+2005 before the first of two directives that a space separates, in an accTitle line of an architecture diagram]
[test: U+2005 before the first of two directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+2006 before the first of two directives that a space separates, in an accTitle line of an architecture diagram]
[test: U+2006 before the first of two directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+2007 before the first of two directives that a space separates, in an accTitle line of an architecture diagram]
[test: U+2007 before the first of two directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+2008 before the first of two directives that a space separates, in an accTitle line of an architecture diagram]
[test: U+2008 before the first of two directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+2009 before the first of two directives that a space separates, in an accTitle line of an architecture diagram]
[test: U+2009 before the first of two directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+200A before the first of two directives that a space separates, in an accTitle line of an architecture diagram]
[test: U+200A before the first of two directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+202F before the first of two directives that a space separates, in an accTitle line of an architecture diagram]
[test: U+202F before the first of two directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+205F before the first of two directives that a space separates, in an accTitle line of an architecture diagram]
[test: U+205F before the first of two directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+3000 before the first of two directives that a space separates, in an accTitle line of an architecture diagram]
[test: U+3000 before the first of two directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+FEFF before the first of two directives that a space separates, in an accTitle line of an architecture diagram]
[test: U+FEFF before the first of two directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+2028 before the first of two directives that a space separates, in an accTitle line of an architecture diagram]
[test: U+2028 before the first of two directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+2029 before the first of two directives that a space separates, in an accTitle line of an architecture diagram]
[test: U+2029 before the first of two directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+000B between two directives that end an accTitle line of an architecture diagram]
[test: U+000B between two directives, spaces after the last, in an accDescr line of an architecture diagram]
[test: U+000C between two directives that end an accTitle line of an architecture diagram]
[test: U+000C between two directives, spaces after the last, in an accDescr line of an architecture diagram]
[test: a no-break space between two directives that end an accTitle line of an architecture diagram]
[test: a no-break space between two directives, spaces after the last, in an accDescr line of an architecture diagram]
[test: U+1680 between two directives that end an accTitle line of an architecture diagram]
[test: U+1680 between two directives, spaces after the last, in an accDescr line of an architecture diagram]
[test: U+2000 between two directives that end an accTitle line of an architecture diagram]
[test: U+2000 between two directives, spaces after the last, in an accDescr line of an architecture diagram]
[test: U+2001 between two directives that end an accTitle line of an architecture diagram]
[test: U+2001 between two directives, spaces after the last, in an accDescr line of an architecture diagram]
[test: U+2002 between two directives that end an accTitle line of an architecture diagram]
[test: U+2002 between two directives, spaces after the last, in an accDescr line of an architecture diagram]
[test: U+2003 between two directives that end an accTitle line of an architecture diagram]
[test: U+2003 between two directives, spaces after the last, in an accDescr line of an architecture diagram]
[test: U+2004 between two directives that end an accTitle line of an architecture diagram]
[test: U+2004 between two directives, spaces after the last, in an accDescr line of an architecture diagram]
[test: U+2005 between two directives that end an accTitle line of an architecture diagram]
[test: U+2005 between two directives, spaces after the last, in an accDescr line of an architecture diagram]
[test: U+2006 between two directives that end an accTitle line of an architecture diagram]
[test: U+2006 between two directives, spaces after the last, in an accDescr line of an architecture diagram]
[test: U+2007 between two directives that end an accTitle line of an architecture diagram]
[test: U+2007 between two directives, spaces after the last, in an accDescr line of an architecture diagram]
[test: U+2008 between two directives that end an accTitle line of an architecture diagram]
[test: U+2008 between two directives, spaces after the last, in an accDescr line of an architecture diagram]
[test: U+2009 between two directives that end an accTitle line of an architecture diagram]
[test: U+2009 between two directives, spaces after the last, in an accDescr line of an architecture diagram]
[test: U+200A between two directives that end an accTitle line of an architecture diagram]
[test: U+200A between two directives, spaces after the last, in an accDescr line of an architecture diagram]
[test: U+202F between two directives that end an accTitle line of an architecture diagram]
[test: U+202F between two directives, spaces after the last, in an accDescr line of an architecture diagram]
[test: U+205F between two directives that end an accTitle line of an architecture diagram]
[test: U+205F between two directives, spaces after the last, in an accDescr line of an architecture diagram]
[test: U+3000 between two directives that end an accTitle line of an architecture diagram]
[test: U+3000 between two directives, spaces after the last, in an accDescr line of an architecture diagram]
[test: U+FEFF between two directives that end an accTitle line of an architecture diagram]
[test: U+FEFF between two directives, spaces after the last, in an accDescr line of an architecture diagram]
[test: U+2028 between two directives that end an accTitle line of an architecture diagram]
[test: U+2028 between two directives, spaces after the last, in an accDescr line of an architecture diagram]
[test: U+2029 between two directives that end an accTitle line of an architecture diagram]
[test: U+2029 between two directives, spaces after the last, in an accDescr line of an architecture diagram]
[test: a no-break space between two directives, a comment touching the last, in an accTitle line of an architecture diagram]
[test: a no-break space between two directives, a space and a comment after the last, in an accTitle line of an architecture diagram]
[test: a no-break space between two directives, spaces and a comment after the last, in an accTitle line of an architecture diagram]
[test: U+2003 between two directives, a comment touching the last, in an accTitle line of an architecture diagram]
[test: U+2003 between two directives, a space and a comment after the last, in an accTitle line of an architecture diagram]
[test: U+2003 between two directives, spaces and a comment after the last, in an accTitle line of an architecture diagram]
[test: a run before the directive after a U+2028 inside the text of an accTitle line of an architecture diagram]
[test: spaces after the directive after a U+2028 inside the text of an accTitle line of an architecture diagram]
[test: U+000B before a directive that a comment touches in an accTitle line of an architecture diagram]
[test: U+000C before a directive that a comment touches in an accTitle line of an architecture diagram]
[test: a no-break space before a directive that a comment touches in an accTitle line of an architecture diagram]
[test: U+1680 before a directive that a comment touches in an accTitle line of an architecture diagram]
[test: U+2000 before a directive that a comment touches in an accTitle line of an architecture diagram]
[test: U+2001 before a directive that a comment touches in an accTitle line of an architecture diagram]
[test: U+2002 before a directive that a comment touches in an accTitle line of an architecture diagram]
[test: U+2003 before a directive that a comment touches in an accTitle line of an architecture diagram]
[test: U+2004 before a directive that a comment touches in an accTitle line of an architecture diagram]
[test: U+2005 before a directive that a comment touches in an accTitle line of an architecture diagram]
[test: U+2006 before a directive that a comment touches in an accTitle line of an architecture diagram]
[test: U+2007 before a directive that a comment touches in an accTitle line of an architecture diagram]
[test: U+2008 before a directive that a comment touches in an accTitle line of an architecture diagram]
[test: U+2009 before a directive that a comment touches in an accTitle line of an architecture diagram]
[test: U+200A before a directive that a comment touches in an accTitle line of an architecture diagram]
[test: U+202F before a directive that a comment touches in an accTitle line of an architecture diagram]
[test: U+205F before a directive that a comment touches in an accTitle line of an architecture diagram]
[test: U+3000 before a directive that a comment touches in an accTitle line of an architecture diagram]
[test: U+FEFF before a directive that a comment touches in an accTitle line of an architecture diagram]
[test: a no-break space and spaces before a directive that a comment touches in an accTitle line of an architecture diagram]
[test: a no-break space and a tab before the directive that ends an accTitle line of an architecture diagram]
[test: U+000B and spaces before the first of two directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+000C and spaces before the first of two directives that spaces separate, in an accTitle line of an architecture diagram]
[test: a no-break space and spaces before the first of two directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+1680 and spaces before the first of two directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+2000 and spaces before the first of two directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+2001 and spaces before the first of two directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+2002 and spaces before the first of two directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+2003 and spaces before the first of two directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+2004 and spaces before the first of two directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+2005 and spaces before the first of two directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+2006 and spaces before the first of two directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+2007 and spaces before the first of two directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+2008 and spaces before the first of two directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+2009 and spaces before the first of two directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+200A and spaces before the first of two directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+202F and spaces before the first of two directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+205F and spaces before the first of two directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+3000 and spaces before the first of two directives that spaces separate, in an accTitle line of an architecture diagram]
[test: U+FEFF and spaces before the first of two directives that spaces separate, in an accTitle line of an architecture diagram]
[test: a no-break space and a tab before the first of two directives that a space separates, in an accTitle line of an architecture diagram]
[test: a no-break space before the first of two directives that a tab separates, in an accTitle line of an architecture diagram]
[test: U+2003 and a tab before the first of two directives that a space separates, in an accTitle line of an architecture diagram]
[test: U+2003 before the first of two directives that a tab separates, in an accTitle line of an architecture diagram]
[test: U+2028 before the first of two directives that a tab separates, in an accTitle line of an architecture diagram]
[test: U+2029 before the first of two directives that a tab separates, in an accTitle line of an architecture diagram]
[test: a U+2028 inside the directive that ends an accTitle line, spaces before it, of an architecture diagram]
[test: a U+2028 inside the directive that ends an accTitle line, spaces after it, of an architecture diagram]
[test: a U+2029 inside the directive that ends an accTitle line, spaces before it, of an architecture diagram]
[test: a U+2029 inside the directive that ends an accTitle line, spaces after it, of an architecture diagram]
[test: a line break inside the directive that ends an accTitle line, spaces before it, of an architecture diagram]
[test: a line break inside the directive that ends an accTitle line, spaces after it, of an architecture diagram]
[test: a U+2028 inside the directive that ends an accDescr line, spaces before it, of an architecture diagram]
[test: a U+2028 inside the directive that ends an accDescr line, spaces after it, of an architecture diagram]
[test: a U+2029 inside the directive that ends an accDescr line, spaces before it, of an architecture diagram]
[test: a U+2029 inside the directive that ends an accDescr line, spaces after it, of an architecture diagram]
[test: a line break inside the directive that ends an accDescr line, spaces before it, of an architecture diagram]
[test: a line break inside the directive that ends an accDescr line, spaces after it, of an architecture diagram]
[test: U+000B between the colon and the directive of an accTitle line of directives only of an architecture diagram]
[test: U+000C between the colon and the directive of an accTitle line of directives only of an architecture diagram]
[test: a no-break space between the colon and the directive of an accTitle line of directives only of an architecture diagram]
[test: U+1680 between the colon and the directive of an accTitle line of directives only of an architecture diagram]
[test: U+2000 between the colon and the directive of an accTitle line of directives only of an architecture diagram]
[test: U+2001 between the colon and the directive of an accTitle line of directives only of an architecture diagram]
[test: U+2002 between the colon and the directive of an accTitle line of directives only of an architecture diagram]
[test: U+2003 between the colon and the directive of an accTitle line of directives only of an architecture diagram]
[test: U+2004 between the colon and the directive of an accTitle line of directives only of an architecture diagram]
[test: U+2005 between the colon and the directive of an accTitle line of directives only of an architecture diagram]
[test: U+2006 between the colon and the directive of an accTitle line of directives only of an architecture diagram]
[test: U+2007 between the colon and the directive of an accTitle line of directives only of an architecture diagram]
[test: U+2008 between the colon and the directive of an accTitle line of directives only of an architecture diagram]
[test: U+2009 between the colon and the directive of an accTitle line of directives only of an architecture diagram]
[test: U+200A between the colon and the directive of an accTitle line of directives only of an architecture diagram]
[test: U+202F between the colon and the directive of an accTitle line of directives only of an architecture diagram]
[test: U+205F between the colon and the directive of an accTitle line of directives only of an architecture diagram]
[test: U+3000 between the colon and the directive of an accTitle line of directives only of an architecture diagram]
[test: U+FEFF between the colon and the directive of an accTitle line of directives only of an architecture diagram]
[test: a directive that touches the keyword of a title of directives only of an architecture diagram]
[test: the gap before the colon of an accDescr line of directives only of an architecture diagram]
[test: spaces after the directive of an accDescr line of directives only of an architecture diagram]
[test: released output that the document does not state: U+000B between a semicolon that the line rule ignores and a second semicolon, a directive after them, in an accDescr line of an architecture diagram]
[test: released output that the document does not state: U+000C between a semicolon that the line rule ignores and a second semicolon, a directive after them, in an accDescr line of an architecture diagram]
[test: released output that the document does not state: a no-break space between a semicolon that the line rule ignores and a second semicolon, a directive after them, in an accDescr line of an architecture diagram]
[test: released output that the document does not state: U+1680 between a semicolon that the line rule ignores and a second semicolon, a directive after them, in an accDescr line of an architecture diagram]
[test: released output that the document does not state: U+2000 between a semicolon that the line rule ignores and a second semicolon, a directive after them, in an accDescr line of an architecture diagram]
[test: released output that the document does not state: U+2001 between a semicolon that the line rule ignores and a second semicolon, a directive after them, in an accDescr line of an architecture diagram]
[test: released output that the document does not state: U+2002 between a semicolon that the line rule ignores and a second semicolon, a directive after them, in an accDescr line of an architecture diagram]
[test: released output that the document does not state: U+2003 between a semicolon that the line rule ignores and a second semicolon, a directive after them, in an accDescr line of an architecture diagram]
[test: released output that the document does not state: U+2004 between a semicolon that the line rule ignores and a second semicolon, a directive after them, in an accDescr line of an architecture diagram]
[test: released output that the document does not state: U+2005 between a semicolon that the line rule ignores and a second semicolon, a directive after them, in an accDescr line of an architecture diagram]
[test: released output that the document does not state: U+2006 between a semicolon that the line rule ignores and a second semicolon, a directive after them, in an accDescr line of an architecture diagram]
[test: released output that the document does not state: U+2007 between a semicolon that the line rule ignores and a second semicolon, a directive after them, in an accDescr line of an architecture diagram]
[test: released output that the document does not state: U+2008 between a semicolon that the line rule ignores and a second semicolon, a directive after them, in an accDescr line of an architecture diagram]
[test: released output that the document does not state: U+2009 between a semicolon that the line rule ignores and a second semicolon, a directive after them, in an accDescr line of an architecture diagram]
[test: released output that the document does not state: U+200A between a semicolon that the line rule ignores and a second semicolon, a directive after them, in an accDescr line of an architecture diagram]
[test: released output that the document does not state: U+202F between a semicolon that the line rule ignores and a second semicolon, a directive after them, in an accDescr line of an architecture diagram]
[test: released output that the document does not state: U+205F between a semicolon that the line rule ignores and a second semicolon, a directive after them, in an accDescr line of an architecture diagram]
[test: released output that the document does not state: U+3000 between a semicolon that the line rule ignores and a second semicolon, a directive after them, in an accDescr line of an architecture diagram]
[test: released output that the document does not state: U+FEFF between a semicolon that the line rule ignores and a second semicolon, a directive after them, in an accDescr line of an architecture diagram]
[test: spaces between two directives after a U+2028 inside the text of an accTitle line of an architecture diagram]
[test: spaces after the directive after a U+2029 inside the text of an accTitle line of an architecture diagram]
[test: a run before the directive after a U+2029 inside the text of an accTitle line of an architecture diagram]
[test: a run before two directives that touch after a U+2028 inside the text of an accTitle line of an architecture diagram]
[test: spaces between two directives after a U+2028 inside the text of an accDescr line of an architecture diagram]
[test: spaces after the directive after a U+2029 inside the text of an accDescr line of an architecture diagram]
[test: a run before the directive after a U+2029 inside the text of an accDescr line of an architecture diagram]
[test: a run before two directives that touch after a U+2028 inside the text of an accDescr line of an architecture diagram]
[test: a wide space before two directives that spaces separate, in an accDescr line of an architecture diagram]
[test: a wide space before two directives that touch and a comment that touches the last, in an accTitle line of an architecture diagram]
[test: a wide space before two directives that touch and a comment that touches the last, in an accDescr line of an architecture diagram]
[test: a U+2028 before two directives that touch, in an accDescr line of an architecture diagram]
[test: a U+2028 before a directive that spaces follow, in an accTitle line of an architecture diagram]
[test: a U+2028 before a directive that spaces follow, in an accDescr line of an architecture diagram]
[test: a U+2028 before two directives that spaces separate, in an accDescr line of an architecture diagram]
[test: a U+2028 inside the text, spaces before the directive, in an accDescr line of an architecture diagram]
[test: a value of directives only, spaces after the directive, in an accTitle line of an architecture diagram]
[test: a directive inside the text, spaces before and after the last directive, in an accTitle line of an architecture diagram]
[test: a directive inside the text, spaces before and after the last directive, in an accDescr line of an architecture diagram]
[test: a `;` in the text, spaces between two directives, in an accDescr line of an architecture diagram]
[test: a `;` between two directives, spaces around it, in an accTitle line of an architecture diagram]
[test: a `;` between two directives, spaces around it, in an accDescr line of an architecture diagram]
[test: a `;` after the last directive, in an accTitle line of an architecture diagram]
[test: a `;` after the last directive, in an accDescr line of an architecture diagram]
[test: a `;` after the last directive, a U+2028 before the directives, a comment after it, in an accTitle line of an architecture diagram]
[test: a `;` after the last directive, a U+2028 before the directives, a comment after it, in an accDescr line of an architecture diagram]
[test: a `;` between two directives, a U+2028 before the directives, a comment after them, in an accTitle line of an architecture diagram]
[test: a `;` between two directives, a U+2028 before the directives, a comment after them, in an accDescr line of an architecture diagram]
[test: two U+2028 before the directive that ends an accTitle line, of an architecture diagram]
[test: U+2029 and U+2028 before the directive that ends an accDescr line, of an architecture diagram]
[test: two U+2028 before the directive that ends an accTitle line, spaces after it, of an architecture diagram]
[test: two U+2029 before a directive that a space and another directive follow in an accDescr line, of an architecture diagram]
[test: a U+2028 inside the directive that ends an accDescr line, spaces before it, a comment after two spaces, of an architecture diagram]
[test: a line break inside the directive that ends an accTitle line, a comment after two spaces, of an architecture diagram]
[test: a directive that starts the text of a title, tabs before and after it, of an architecture diagram]
[test: a directive that touches the keyword of a title, a space and a text after it, of an architecture diagram]
[test: a directive that touches the colon of an accTitle line, a space and a text after it, of an architecture diagram]
[test: a directive that starts the text of an accTitle line, two spaces and a text after it, spaces at the end, of an architecture diagram]
[test: a directive that starts the text of an accDescr line, two spaces and a text after it, spaces at the end, of an architecture diagram]
[test: a `;` at the end of a title, a tab after the keyword, spaces after the `;`, of an architecture diagram]
[test: a `;` at the end of an accTitle line, a gap before the colon, of an architecture diagram]
[test: a `;` at the end of an accDescr line, a run of spaces inside the text, of an architecture diagram]
[test: a `;` at the end of an accTitle line, a tab after the colon, spaces after the `;`, of an architecture diagram]
[test: a `;` at the end of an accDescr line, a gap before the colon, of an architecture diagram]
[test: a comment after the text of an accTitle line, spaces before it, of an architecture diagram]
[test: a comment after the text of an accDescr line, spaces before it, of an architecture diagram]
[test: a run of spaces inside the text of an accDescr line, of an architecture diagram]
[test: a run of spaces inside the text of an accTitle line, of an architecture diagram]
[test: a run of spaces inside a quoted string in an accDescr line, of an architecture diagram]
[test: released output that the document does not state: text after the `;` that the line rule ignores in an accDescr line, runs before and after it, of an architecture diagram]
[test: nothing after the `;` that the line rule ignores in an accDescr line, runs before it, of an architecture diagram]
[test: released output that the document does not state: two touching `;` that the line rule reads in an accDescr line, a run before them, of an architecture diagram]
[test: released output that the document does not state: text after the `;` that the line rule ignores in an accTitle line, of an architecture diagram]
[test: released output that the document does not state: a `;` inside the comment at the end of an accTitle line, a gap before the colon, spaces at the end, of an architecture diagram]
[test: a gap before and after the colon of an accTitle line, nothing after the `;` that the line rule ignores, of an architecture diagram]
[test: U+2028 before a directive that a comment touches, a line follows, in an accTitle line of an architecture diagram]
[test: U+2028 before a directive that a comment touches, the text ends, in an accTitle line of an architecture diagram]
[test: U+2028 before a directive that a comment follows after spaces, a line follows, in an accTitle line of an architecture diagram]
[test: U+2028 before a directive that a comment follows after spaces, the text ends, in an accTitle line of an architecture diagram]
[test: U+2029 before a directive that a comment touches, a line follows, in an accTitle line of an architecture diagram]
[test: U+2029 before a directive that a comment touches, the text ends, in an accTitle line of an architecture diagram]
[test: U+2029 before a directive that a comment follows after spaces, a line follows, in an accTitle line of an architecture diagram]
[test: U+2029 before a directive that a comment follows after spaces, the text ends, in an accTitle line of an architecture diagram]
[test: U+2028 before a directive that a comment touches, a line follows, in an accDescr line of an architecture diagram]
[test: U+2028 before a directive that a comment touches, the text ends, in an accDescr line of an architecture diagram]
[test: U+2028 before a directive that a comment follows after spaces, a line follows, in an accDescr line of an architecture diagram]
[test: U+2028 before a directive that a comment follows after spaces, the text ends, in an accDescr line of an architecture diagram]
[test: U+2029 before a directive that a comment touches, a line follows, in an accDescr line of an architecture diagram]
[test: U+2029 before a directive that a comment touches, the text ends, in an accDescr line of an architecture diagram]
[test: U+2029 before a directive that a comment follows after spaces, a line follows, in an accDescr line of an architecture diagram]
[test: U+2029 before a directive that a comment follows after spaces, the text ends, in an accDescr line of an architecture diagram]
[test: a U+2028 inside the text, a directive, and a comment after spaces, in an accTitle line of an architecture diagram]
[test: a U+2028 inside the text, a directive that a comment touches, in an accTitle line of an architecture diagram]
[test: a U+2029 inside the text, a directive, and a comment after spaces, in an accDescr line of an architecture diagram]
[test: a U+2028 inside the text, two directives that touch, and a comment after spaces, in an accDescr line of an architecture diagram]
[test: a wide space before two directives that spaces separate, the text ends, in an accTitle line of an architecture diagram]
[test: a wide space before two directives that spaces separate, the text ends, in an accDescr line of an architecture diagram]
[test: a wide space before a directive that spaces and a comment follow, the text ends, in an accTitle line of an architecture diagram]
[test: a wide space before a directive that spaces and a comment follow, the text ends, in an accDescr line of an architecture diagram]
[test: a wide space before two directives that touch and a comment that touches the last, the text ends, in an accTitle line of an architecture diagram]
[test: a wide space before two directives that touch and a comment that touches the last, the text ends, in an accDescr line of an architecture diagram]
[test: a U+2028 before two directives that touch, the text ends, in an accTitle line of an architecture diagram]
[test: a U+2028 before two directives that touch, the text ends, in an accDescr line of an architecture diagram]
[test: a U+2028 before a directive that spaces follow, the text ends, in an accTitle line of an architecture diagram]
[test: a U+2028 before a directive that spaces follow, the text ends, in an accDescr line of an architecture diagram]
[test: a U+2028 before two directives that spaces separate, the text ends, in an accTitle line of an architecture diagram]
[test: a U+2028 before two directives that spaces separate, the text ends, in an accDescr line of an architecture diagram]
[test: a directive that holds a line break, spaces before it, the text ends, in an accTitle line of an architecture diagram]
[test: a directive that holds a line break, spaces before it, the text ends, in an accDescr line of an architecture diagram]
[test: a directive that holds a U+2028, spaces before it, the text ends, in an accTitle line of an architecture diagram]
[test: a directive that holds a U+2028, spaces before it, the text ends, in an accDescr line of an architecture diagram]
[test: a U+2028 inside the text, spaces before the directive, the text ends, in an accTitle line of an architecture diagram]
[test: a U+2028 inside the text, spaces before the directive, the text ends, in an accDescr line of an architecture diagram]
[test: a value of directives only, spaces after the directive, the text ends, in an accTitle line of an architecture diagram]
[test: a value of directives only, spaces after the directive, the text ends, in an accDescr line of an architecture diagram]
[test: a directive inside the text, spaces before and after the last directive, the text ends, in an accTitle line of an architecture diagram]
[test: a directive inside the text, spaces before and after the last directive, the text ends, in an accDescr line of an architecture diagram]
[test: a `;` in the text, spaces before the directive, the text ends, in an accTitle line of an architecture diagram]
[test: a `;` in the text, spaces before the directive, the text ends, in an accDescr line of an architecture diagram]
[test: a `;` in the text, spaces between two directives, the text ends, in an accTitle line of an architecture diagram]
[test: a `;` in the text, spaces between two directives, the text ends, in an accDescr line of an architecture diagram]
[test: a `;` between two directives, spaces around it, the text ends, in an accTitle line of an architecture diagram]
[test: a `;` between two directives, spaces around it, the text ends, in an accDescr line of an architecture diagram]
[test: a `;` after the last directive, the text ends, in an accTitle line of an architecture diagram]
[test: a `;` after the last directive, the text ends, in an accDescr line of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, the text ends, in an accTitle line of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, a comment line follows, in an accTitle line of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, an empty line follows, in an accTitle line of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, a line of whitespace follows, in an accTitle line of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, a directive line follows, in an accTitle line of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, a comment line and a statement follow, in an accTitle line of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, an empty line and a statement follow, in an accTitle line of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, the text ends, in an accDescr line of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, a comment line follows, in an accDescr line of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, an empty line follows, in an accDescr line of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, a line of whitespace follows, in an accDescr line of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, a directive line follows, in an accDescr line of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, a comment line and a statement follow, in an accDescr line of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, an empty line and a statement follow, in an accDescr line of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, the text ends, in an accTitle line of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a comment line follows, in an accTitle line of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, an empty line follows, in an accTitle line of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a line of whitespace follows, in an accTitle line of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a directive line follows, in an accTitle line of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a comment line and a statement follow, in an accTitle line of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, an empty line and a statement follow, in an accTitle line of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, the text ends, in an accDescr line of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a comment line follows, in an accDescr line of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, an empty line follows, in an accDescr line of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a line of whitespace follows, in an accDescr line of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a directive line follows, in an accDescr line of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a comment line and a statement follow, in an accDescr line of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, an empty line and a statement follow, in an accDescr line of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, the text ends, in an accTitle line of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, a comment line follows, in an accTitle line of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, an empty line follows, in an accTitle line of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, a line of whitespace follows, in an accTitle line of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, a directive line follows, in an accTitle line of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, a comment line and a statement follow, in an accTitle line of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, an empty line and a statement follow, in an accTitle line of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, the text ends, in an accDescr line of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, a comment line follows, in an accDescr line of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, an empty line follows, in an accDescr line of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, a line of whitespace follows, in an accDescr line of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, a directive line follows, in an accDescr line of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, a comment line and a statement follow, in an accDescr line of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, an empty line and a statement follow, in an accDescr line of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, an indented directive line follows, in an accTitle line of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, a directive and spaces follow, in an accTitle line of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, two directives that touch follow, in an accTitle line of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, a directive and a comment on a line follow, in an accTitle line of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, a line of a no-break space follows, in an accTitle line of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, a line of a tab follows, in an accTitle line of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, an indented comment line follows, in an accTitle line of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, an indented directive line follows, in an accDescr line of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, a directive and spaces follow, in an accDescr line of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, two directives that touch follow, in an accDescr line of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, a directive and a comment on a line follow, in an accDescr line of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, a line of a no-break space follows, in an accDescr line of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, a line of a tab follows, in an accDescr line of an architecture diagram]
[test: a U+2028 before a directive that spaces and a comment follow, an indented comment line follows, in an accDescr line of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, an indented directive line follows, in an accTitle line of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a directive and spaces follow, in an accTitle line of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, two directives that touch follow, in an accTitle line of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a directive and a comment on a line follow, in an accTitle line of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a line of a no-break space follows, in an accTitle line of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a line of a tab follows, in an accTitle line of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, an indented comment line follows, in an accTitle line of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, an indented directive line follows, in an accDescr line of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a directive and spaces follow, in an accDescr line of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, two directives that touch follow, in an accDescr line of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a directive and a comment on a line follow, in an accDescr line of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a line of a no-break space follows, in an accDescr line of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a line of a tab follows, in an accDescr line of an architecture diagram]
[test: a U+2028 before two directives that a wide space separates, a comment after them, an indented comment line follows, in an accDescr line of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, an indented directive line follows, in an accTitle line of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, a directive and spaces follow, in an accTitle line of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, two directives that touch follow, in an accTitle line of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, a directive and a comment on a line follow, in an accTitle line of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, a line of a no-break space follows, in an accTitle line of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, a line of a tab follows, in an accTitle line of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, an indented comment line follows, in an accTitle line of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, an indented directive line follows, in an accDescr line of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, a directive and spaces follow, in an accDescr line of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, two directives that touch follow, in an accDescr line of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, a directive and a comment on a line follow, in an accDescr line of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, a line of a no-break space follows, in an accDescr line of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, a line of a tab follows, in an accDescr line of an architecture diagram]
[test: a U+2028 before a directive that a wide space and a comment follow, an indented comment line follows, in an accDescr line of an architecture diagram]
[test: a `;` after the last directive, a U+2028 before the directives, a comment after it, the text ends, in an accTitle line of an architecture diagram]
[test: a `;` after the last directive, a U+2028 before the directives, a comment after it, the text ends, in an accDescr line of an architecture diagram]
[test: a `;` between two directives, a U+2028 before the directives, a comment after them, the text ends, in an accTitle line of an architecture diagram]
[test: a `;` between two directives, a U+2028 before the directives, a comment after them, the text ends, in an accDescr line of an architecture diagram]
[test: a U+2028 after the last directive that spaces and a comment follow, the text ends, in an accTitle line of an architecture diagram]
[test: a U+2028 after the last directive that spaces and a comment follow, a comment line follows, in an accTitle line of an architecture diagram]
[test: a U+2028 after the last directive that spaces and a comment follow, an empty line follows, in an accTitle line of an architecture diagram]
[test: a U+2028 after the last directive that spaces and a comment follow, a line of whitespace follows, in an accTitle line of an architecture diagram]
[test: a U+2028 after the last directive that spaces and a comment follow, a directive line follows, in an accTitle line of an architecture diagram]
[test: a U+2028 after the last directive that spaces and a comment follow, a comment line and a statement follow, in an accTitle line of an architecture diagram]
[test: a U+2028 after the last directive that spaces and a comment follow, an empty line and a statement follow, in an accTitle line of an architecture diagram]
[test: a U+2028 after the last directive that spaces and a comment follow, the text ends, in an accDescr line of an architecture diagram]
[test: a U+2028 after the last directive that spaces and a comment follow, a comment line follows, in an accDescr line of an architecture diagram]
[test: a U+2028 after the last directive that spaces and a comment follow, an empty line follows, in an accDescr line of an architecture diagram]
[test: a U+2028 after the last directive that spaces and a comment follow, a line of whitespace follows, in an accDescr line of an architecture diagram]
[test: a U+2028 after the last directive that spaces and a comment follow, a directive line follows, in an accDescr line of an architecture diagram]
[test: a U+2028 after the last directive that spaces and a comment follow, a comment line and a statement follow, in an accDescr line of an architecture diagram]
[test: a U+2028 after the last directive that spaces and a comment follow, an empty line and a statement follow, in an accDescr line of an architecture diagram]
[test: a U+2028 between two directives, spaces and a comment after the last one, the text ends, in an accTitle line of an architecture diagram]
[test: a U+2028 between two directives, spaces and a comment after the last one, a comment line follows, in an accTitle line of an architecture diagram]
[test: a U+2028 between two directives, spaces and a comment after the last one, an empty line follows, in an accTitle line of an architecture diagram]
[test: a U+2028 between two directives, spaces and a comment after the last one, a line of whitespace follows, in an accTitle line of an architecture diagram]
[test: a U+2028 between two directives, spaces and a comment after the last one, a directive line follows, in an accTitle line of an architecture diagram]
[test: a U+2028 between two directives, spaces and a comment after the last one, a comment line and a statement follow, in an accTitle line of an architecture diagram]
[test: a U+2028 between two directives, spaces and a comment after the last one, an empty line and a statement follow, in an accTitle line of an architecture diagram]
[test: a U+2028 between two directives, spaces and a comment after the last one, the text ends, in an accDescr line of an architecture diagram]
[test: a U+2028 between two directives, spaces and a comment after the last one, a comment line follows, in an accDescr line of an architecture diagram]
[test: a U+2028 between two directives, spaces and a comment after the last one, an empty line follows, in an accDescr line of an architecture diagram]
[test: a U+2028 between two directives, spaces and a comment after the last one, a line of whitespace follows, in an accDescr line of an architecture diagram]
[test: a U+2028 between two directives, spaces and a comment after the last one, a directive line follows, in an accDescr line of an architecture diagram]
[test: a U+2028 between two directives, spaces and a comment after the last one, a comment line and a statement follow, in an accDescr line of an architecture diagram]
[test: a U+2028 between two directives, spaces and a comment after the last one, an empty line and a statement follow, in an accDescr line of an architecture diagram]
[test: a directive that two spaces follow, before a comment line after a U+2028 before a directive, the text ends, in an accTitle line of an architecture diagram]
[test: a directive that two spaces follow, before a comment line after a U+2028 before a directive, the text ends, in an accDescr line of an architecture diagram]
[test: U+2028 between two directives and after the last, a comment follows after spaces, the text ends, in an accTitle line of an architecture diagram]
[test: U+2028 between two directives and after the last, a comment follows after spaces, the text ends, in an accDescr line of an architecture diagram]
[test: U+2028 between two directives and after the last, two spaces after the first, a comment touches the last U+2028, the text ends, in an accTitle line of an architecture diagram]
[test: U+2028 between two directives and after the last, two spaces after the first, a comment touches the last U+2028, the text ends, in an accDescr line of an architecture diagram]
[test: U+2028 between the first and the second of three directives and between the second and the third, a comment follows the third after a space, the text ends, in an accTitle line of an architecture diagram]
[test: U+2028 between the first and the second of three directives and between the second and the third, a comment follows the third after a space, the text ends, in an accDescr line of an architecture diagram]
[test: accTitle with a gap before the colon, a `;` before a U+2028, the text ends, in an accTitle line of an architecture diagram]
[test: accTitle with a gap before the colon, a `;` after the U+2028, the text ends, in an accTitle line of an architecture diagram]
[test: accDescr with a gap before the colon, a `;` before a U+2028, the text ends, in an accDescr line of an architecture diagram]
[test: accDescr with a gap before the colon, a `;` after the U+2028, the text ends, in an accDescr line of an architecture diagram]
[test: accTitle with a gap before the colon, a `;` inside a directive that touches the text, the text ends, in an accTitle line of an architecture diagram]
[test: accTitle with a gap before the colon, a `;` inside a comment after the text, the text ends, in an accTitle line of an architecture diagram]
[test: accTitle with a gap before the colon, a `;` right after the colon and a U+2028 after it, the text ends, in an accTitle line of an architecture diagram]
[test: a `;` before the U+2028 between two directives, a comment follows the last directive after two spaces, the text ends, in an accTitle line of an architecture diagram]
[test: two U+2028 with two spaces on each side between two directives, a comment follows the last directive after two spaces, the text ends, in an accTitle line of an architecture diagram]
[test: accTitle with a gap before the colon, a U+2028 before a `;`, and a second U+2028 after the `;`, the text ends, in an accTitle line of an architecture diagram]
[test: accDescr with a gap before the colon, a U+2028 before a `;`, and a second U+2028 after the `;`, the text ends, in an accDescr line of an architecture diagram]
[test: accTitle with a gap before the colon, a `;` before two U+2028, the text ends, in an accTitle line of an architecture diagram]
[test: accTitle with a gap before the colon, a `;` inside a directive that a U+2028 follows, the text ends, in an accTitle line of an architecture diagram]
[test: accTitle with a gap before the colon, a `;` inside a comment that a U+2028 follows, the text ends, in an accTitle line of an architecture diagram]
[test: accTitle with a gap before the colon, a U+2028 inside a directive and a `;` after it inside the same directive, the text ends, in an accTitle line of an architecture diagram]
[test: accTitle with a gap before the colon, a U+2028 inside a directive and no `;`, the text ends, in an accTitle line of an architecture diagram]
[test: accTitle with a gap before the colon, a U+2028 inside a directive and a `;` inside a directive after it, the text ends, in an accTitle line of an architecture diagram]
[test: accTitle with a gap before the colon, a U+2028 inside a comment and a `;` after it in the comment, the text ends, in an accTitle line of an architecture diagram]
[test: accTitle with a gap before the colon, a U+2028 inside a comment and no `;`, the text ends, in an accTitle line of an architecture diagram]
[test: a U+2028 between the text and a directive, a U+2028 between the directive and the comment, an empty line and a statement follow, in an accTitle line of an architecture diagram]
[test: a U+2028 before a directive that a comment follows after two spaces, an empty line and a statement follow, in an accTitle line of an architecture diagram]
[test: a U+2028 before a directive that a comment follows after two spaces, a comment line follows, in an accTitle line of an architecture diagram]
[test: a comment after the last directive after two spaces, a comment line that holds a `;` follows, in an accTitle line of an architecture diagram]

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
[規則 1](./printed-form.ja.md#1-記号の横の空白)が与える形です。
Prettier は、キーワードとそのブロックの `{` の間に空白を 1 個置きます。
`try  { a }` は `try {`、`else   { z }` は `else {` と印字されます。
空白だけの内側は囲む文字がないため `{}` にします。
開始前の単なる空白は結合し、実際の注釈類は改行を保ちます。

規則 1 は、コメントやディレクティブの隣の改行の印を挙げていないので、
[規則 2](./printed-form.ja.md#2-prettier-にない種類の隙間)が決めます。
[sequence](./sequence.ja.md#複数行の文)、[gantt](./gantt.ja.md#複数行の文)、
[journey](./journey.ja.md#複数行の文)も、そのような改行を残します。
ただし、ほかの規則が配置を書かれたまま残す所は別です。
`accDescr` の後に U+2028 か U+2029 があるときは、
その前に空白があってもなくても、コメントが続けばそれを改行で印字し、
コメントは 1 段深い独立した行に置きます。
ディレクティブだけが続き、`{` が後の行にあれば空白 1 つで印字し、
ディレクティブは `accDescr` の行に置きます。
ディレクティブの後にコメントが続けば、ディレクティブとコメントを、
コメントと同じく 1 段深い独立した行に置きます。
`{` がディレクティブと同じ行に続くときは、その行を書かれたままにします。
規則 2 は、この区切り文字の形を 1 つに決めません。
フォーマッタで `accDescr`、U+2028、コメントを走らせると、sequence、gantt、
journey は書かれたまま印字し、radar は architecture と同じく改行で印字します。
決まるまで公開版の形を残します。
（[どの決まりも形を決めない所](./printed-form.ja.md#4-どの決まりも形を決めない所)）。

コメントやディレクティブの後の `{` を持つ行は、文と同じ段に置きます。
ほかの図の種類のうちこの形を受け付ける 23 種類では、c4、class、er、flowchart、
gantt、journey、quadrant、requirement、sequence、state、timeline、xychart は、
コメントの行と同じく 1 段深く置きます。
cynefin、gitgraph、info、ishikawa、packet、pie、radar、railroad、treemap、
treeview、wardley は、文と同じ段に置きます。
規則 2 はこの形を 1 つに決めないので、決まるまで公開版の形を残します。

[fixture: architecture/description-blocks/opener-trivia]
[test: architecture/description-blocks/keyword-u2028-before-directive-touching-comment]
[test: architecture/description-blocks/keyword-u2029-before-directive-touching-comment]
[test: architecture/description-blocks/keyword-u2028-before-directive-and-comment]
[test: architecture/description-blocks/keyword-u2029-before-directive-and-comment]
[test: architecture/description-blocks/keyword-space-u2028-before-directive-touching-comment]
[test: architecture/description-blocks/keyword-space-u2029-before-directive-touching-comment]
[test: architecture/description-blocks/keyword-space-u2028-before-directive-and-comment]
[test: architecture/description-blocks/keyword-space-u2029-before-directive-and-comment]
[test: architecture/description-blocks/keyword-u2028-before-comment]
[test: architecture/description-blocks/keyword-u2029-before-comment]
[test: architecture/description-blocks/keyword-u2028-before-directive]
[test: architecture/description-blocks/keyword-u2029-before-directive]
[test: architecture/description-blocks/keyword-space-u2028-before-comment]
[test: architecture/description-blocks/keyword-space-u2029-before-comment]
[test: architecture/description-blocks/keyword-space-u2028-before-directive]
[test: architecture/description-blocks/keyword-space-u2029-before-directive]
[test: architecture/description-blocks/keyword-u2028-directive-then-brace-on-line]
[test: architecture/description-blocks/keyword-u2029-directive-then-brace-on-line]
[test: architecture/description-blocks/keyword-space-u2028-directive-then-brace-on-line]
[test: architecture/description-blocks/keyword-u2028-directive-touching-brace-on-line]
[test: architecture/description-blocks/keyword-u2028-directive-then-spaces-and-brace-on-line]

コメント・ディレクティブだけの内側を保ちます。
規則 1 は、ブロックの中の行の印を挙げておらず、どの規則もこの内側を与えません。
[xychart](./xychart.ja.md#空の説明ブロック) と
[quadrant](./quadrant.ja.md#空の説明ブロック) は、
ディレクティブかコメント行があるブロックの内容と改行を、そのまま残しますが、
どちらでもこの形は、決まっていない形の一覧（D34）の問いと、
決まりに反して印字している形です。
そのため、その印字は決まった形ではなく、決まるまでリリース済みの形を残します。
詳しくは
[どの決まりも形を決めない所](./printed-form.ja.md#4-どの決まりも形を決めない所)
を参照してください。
通常の説明本文と独立したコメント行は文より1段内側に揃えます。
Db で LF 後の字下げが取り除かれるためです。
改行と内部の空行は保ちます。
行末の空白は、テキストの最後の行のものを除いて保ちます。
空白だけの行は空行にします。
最後のテキスト行の行末の空白は、閉じ括弧が自分の行にあるときは落とし、
同じ行で閉じ括弧が続くときは空白 1 つで印字します。
説明ブロックの行の段と、独立した閉じ括弧の位置は、規則 2 が与えます。
flowchart、sequence、state、gantt、journey、timeline、pie、radar のそれぞれで、
フォーマッタを走らせると、
ブロックのテキスト行とコメント行を文より 1 段内側に置き、
独立した閉じ括弧を文の段に置きます。
[flowchart](./flowchart.ja.md#複数行の値)、
[sequence](./sequence.ja.md#複数行の値)、[state](./state.ja.md#複数行の値)、
[gantt](./gantt.ja.md#アクセシビリティの文)、
[journey](./journey.ja.md#アクセシビリティの文) の節は、
この 2 つを書いています。
改行、空行、各行の行末の空白、最後の行は、どの規則も与えません。
それらの図種も同じに印字しますが、どれでもこれらの形は、
決まっていない形の一覧（D38 と D39）の問いです。
そのため、その印字は決まった形ではなく、決まるまでリリース済みの形を残します。
詳しくは
[どの決まりも形を決めない所](./printed-form.ja.md#4-どの決まりも形を決めない所)
を参照してください。
ディレクティブと共有の除去対象となるコメント領域は原文全体を保ちます。
独立する閉じは文の位置に揃え、最初の閉じ波括弧が値を終える規則も保ちます。

[fixture: architecture/description-blocks/asymmetric]
[fixture: architecture/description-blocks/directive-line-between-keyword-and-brace]
[fixture: description-blocks/block-trailing-whitespace]
[fixture: description-blocks/block-trailing-whitespace-closer-on-the-text-line]

[fixture: architecture/description-blocks/block-empty-fixed]

[fixture: architecture/description-blocks/block-present-spaces-fixed]

[fixture: architecture/description-blocks/block-touching-fixed]

[fixture: architecture/description-blocks/empty-block-comment-only-fixed]

[fixture: architecture/description-blocks/empty-block-global-only-fixed]

[fixture: architecture/description-blocks/interior-trivia]

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
規則 1 は、ここを決めません（[規則 1](./printed-form.ja.md#1-記号の横の空白)）。
規則 1 の表は行頭を挙げていないからです。
[規則 2](./printed-form.ja.md#2-prettier-にない種類の隙間)が形を与えます。
[flowchart](./flowchart.ja.md#コメント) と [wardley](./wardley.ja.md#コメント)
も、独立した行のコメントを本文と同じ段に揃えます。
同じ行のコメントは同じ行に残し、接していれば接したまま、
空白とタブの連なりがあれば空白 1 つにします。
規則 2 は、行内のコメントの前の隙間も決めます。
[sequence](./sequence.ja.md#コメント)、[journey](./journey.ja.md#コメント)、
[timeline](./timeline.ja.md#コメント)も、
文の後ろのコメントを同じように印字します。
ほかの規則が空白を書かれたまま残す所は別です。
どの図の文書も、その所を、
自分の節か [文字の直後のコメント](./compatibility.ja.md#文字の直後のコメント)
で挙げています（Db が持つ空白、たとえば `section` と期間の後の空白と、
mermaid.js の読みを変える空白です）。
付属先を保つため印・内容・末尾空白を保持します。
図固有のコメントは LF・CR で終わり、LS・PS は内容です。
先に始まった値は内側のパーセント文字を所有し、共通行はそこで終わります。
共通処理が除く領域は原文全体と継続列を保ちます。

[fixture: architecture/comments/comment-attachments]
[fixture: architecture/comments/inline-gap-run-before-comment]

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
規則 1 は、2 つの単位の間のディレクティブの印を挙げていないので、
[規則 2](./printed-form.ja.md#2-prettier-にない種類の隙間)が決めます。
[gantt](./gantt.ja.md#ディレクティブ)と
[journey](./journey.ja.md#ディレクティブ)も、
整形が分ける単位の隙間のディレクティブを後ろの単位と一緒に動かし、
右側の接触か間隔を残し、左側の接触は切ります。
ただし、ほかの規則が配置を書かれたまま残す所は別です。
通常の独立開始だけ本文の1段に揃え、複数行の内部と EOF までの末尾は保ちます。
独立した行のディレクティブは、周りの文と同じ段に置きます。
[flowchart](./flowchart.ja.md#ディレクティブ)、
[sequence](./sequence.ja.md#ディレクティブ)、
[gantt](./gantt.ja.md#ディレクティブ)も同じです。
共通処理の除去は両側を結合するため、
部品の境界の空白を消すと宣言が拒否され得ます。
部品間・値内部のディレクティブを保ち、不透明な内容を JSON として扱いません。

[fixture: architecture/global-directives/header-to-body]
[fixture: architecture/global-directives/header-split-both-separated]
[fixture: architecture/global-directives/header-split-left-separated-right-touching]

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
区切り行 3 本からなる 1 つの形、別々の形、後の有効な閉じ、
内部の大域的な切れ目を保ちます。
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
`service following` の前の `service space_suffix%%{}%%` に続く空白は、
対象にする版の mermaid.js はすべて、
同じ 2 行からその空白を除いた形を拒否するため保ちます（詳しくは
[対象にする版の mermaid.js のために残す形](./compatibility.ja.md#対象にする版の-mermaidjs-のために残す形)
を参照）。
見出し自身の隠れた形の直後だけ予備の LF は不要です。
見出し行に残った文も、その後置部分の後ろは文と文の境界です。
複数の後置部分の所有ノードと可視 EOL 後の形を区別し、
外側の余分な空行は共有の最大1空行の規則に従います。
[規則 1](./printed-form.ja.md#1-記号の横の空白)が与える形です。
Prettier は、JavaScript と CSS で、空行の連なりを 1 行にし、
ファイルとブロックの先頭と末尾の空行を取り除きます。
[gantt](./gantt.ja.md#空行)、[journey](./journey.ja.md#空行)、
[sankey](./sankey.ja.md#空行)も、空行の連続を 1 行にし、
本文の先頭と末尾の空行を取り除きます。

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
[規則 1](./printed-form.ja.md#1-記号の横の空白)が与える形です。
Prettier は、JavaScript と CSS で、空行の連なりを 1 行にし、
ファイルとブロックの先頭と末尾の空行を除きます。
[隠れた境界](#hidden-boundaries)と同じく、[gantt](./gantt.ja.md#空行)、
[journey](./journey.ja.md#空行)、[sankey](./sankey.ja.md#空行)は、
空行の連なりを 1 行にし、本文の先頭と末尾の空行を除きます。
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
[規則 1](./printed-form.ja.md#1-記号の横の空白)が与える形です。
Prettier は行末に空白を印字しません（`a = 1;` の後の空白とタブは取り除かれ、
`a = 1;` と印字されます）。
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
`tabWidth` が 0 のとき、対象にする版の mermaid.js のすべてが、
字下げのないブロックスカラーを拒否し、
入れ子の `config` の値が入れ子でなくなると、図を別に描きます。
詳しくは [フロントマター](./compatibility.ja.md#フロントマター)
を参照してください。
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
`;` を 1 つ取り除くと、行の規則がほかの `;` を無視するようになり、
ラベルやエンティティが変わることがあるためです。
（[`;` を含む行](./compatibility.ja.md#-を含む行)）。
保つ `;` を含む区間は、行の規則が無視する `;` が整形で変わる所を除き、
ほかの場所と同じように整形します。
この規則は、[セミコロン](./flowchart.ja.md#セミコロン)のとおり、
`style` か `classDef` の後の最初の `:` から、
最後の保つ `;` の前の最後の `#` までに空白がない並びを読みます。
その範囲の隙間と余白は空白の有無を保ち、空白の連続は空白 1 つにします。
範囲の外は、この図種の通常の規則に従います（題とアクセシビリティの行は、
引用の後の段落が述べるとおりです）。
どの部分の配置も持たないテキストは、書かれたまま残します。
複数行にわたる文の行を空白 1 つか何も挟まずにつなぐと、
行の規則が無視する `;` が変わりうる場合は、各区間の頭から最後の保つ `;` までを、
書かれたまま残します。
それ以外の複数行の文は、1 行の文と同じように整形します。

[fixture: semicolons/stretch-kept-rest-formatted]
[fixture: semicolons/no-stretch-formatted]
[fixture: semicolons/crossing-comment]

行の規則が働く題かアクセシビリティの行は述べません（1 つの場合を除きます。
行の規則は[`;` を含む行](./compatibility.ja.md#-を含む行)にあります）。
形は、規則が無視する `;` の後のテキスト、2 つめの `;`、ディレクティブ、
コメント、U+2028 か U+2029、キーワードの後の隙間で変わり、
[印字形の決め方](./printed-form.ja.md)の規則はこれらの形を与えません。
そこでリリース済みの版が印字する形は、
[どの決まりも形を決めない所](./printed-form.ja.md#4-どの決まりも形を決めない所)
のとおり、決めるまでそのままです。
通常の規則が決める 1 つの場合は、
`;` を 1 つだけ持ってその `;` で終わり（後ろに空白とタブがあってもよい）、
ディレクティブ、コメント、U+2028、
U+2029 のない行です（`title a   b   style:#x;` は `title a b style:#x;`
になります）。

[test: nothing after the `;` that the line rule ignores in a title, runs before it, of an architecture diagram]
[test: a run inside the stretch of the line rule, nothing after the `;` in a title, spaces at the end, of an architecture diagram]
[test: nothing after the `;` that the line rule ignores in an accDescr line, runs before it, of an architecture diagram]
[test: nothing after the `;` that the line rule ignores in a title, spaces at the end, of an architecture diagram]
[test: a run after the keyword of a title, nothing after the `;` that the line rule ignores, of an architecture diagram]
[test: a gap before and after the colon of an accTitle line, nothing after the `;` that the line rule ignores, of an architecture diagram]
[test: a tab after the `;` that the line rule ignores in a title, runs before it, of an architecture diagram]
[test: a classDef trigger with nothing after the `;` in a title, runs before it, of an architecture diagram]

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
Prettier は、プラグインが読む前に、
すべての CR と CRLF を `endOfLine` の改行にし、
テンプレートリテラルやコメントの中も同じです。
`endOfLine: "crlf"` では全体が CRLF になります。
内容の LS・PS・NBSP・BOM は保ち、共通の行値の端からだけ、
共通規則が読む空白を除きます。
構造の非 ASCII 区切りは拒否のままです。
先頭 BOM はバイト同一性でなく埋め込み先の Prettierの処理に従います。
Prettier は JavaScript のファイルの先頭の BOM を残します。

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
どちらも[規則 1](./printed-form.ja.md#1-記号の横の空白)が与える形です。
Prettier は改行がないファイルに改行を 1 個加え、末尾の空行は除いて、
改行 1 個で終えます。
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
空の引用符付きアイコン・ラベル、空の説明、図固有の隠れた形を、
新たな差異として定義する必要はありません。

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
