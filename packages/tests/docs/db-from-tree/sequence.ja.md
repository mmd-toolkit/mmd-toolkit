# sequence の Db を木から作る

英語版: [sequence.md](./sequence.md)

sequence 図の木から Db の要約を作る手順です。
`src/db-from-tree/sequence.ts` がこれを実装します
（[db-from-tree.ja.md](../db-from-tree.ja.md) を参照）。
構文と木は、仕様の
[diagrams/sequence.ja.md](../../../spec/docs/diagrams/sequence.ja.md) と
[ast/sequence.ja.md](../../../spec/docs/ast/sequence.ja.md) が定めます。

フロントマターの図のタイトルと、設定に依る Db の値は、木からは来ません。
Db の値を確かめる側が、mermaid.js 自身の関数で求めます
（[設定（参考）](../configuration.ja.md#設定参考) を参照）。
ここでは、折り返しの接頭辞のないテキストが受け取る折り返しの設定がそれです。
設定の `wrap`、なければ `sequence.wrap`、なければ偽です。
[fixture: sequence/config-wrap-site] [fixture:
sequence/config-sequence-wrap-site] [fixture:
sequence/config-wrap-site-nowrap-prefix]

## 木から要約を作る

文はソースの順に適用し、ブロックの自分の項目はその本体の前と後に適用します。
各文は次のとおりです。
下のテキスト部分の**テキスト**は、
その `text` の単位から両端の空白を除いたもので、
`text` の単位がなければ空のテキストです
（[テキスト部分](../../../spec/docs/diagrams/sequence.ja.md#テキスト部分) を参照）。
その**折り返し**は、`wrap:` の後なら真、`nowrap:` の後なら偽、
それ以外は設定の折り返しの設定です。

どの値も[変換した形](../../../spec/docs/common.ja.md#ソースの読み方)で読むので、
実体は、テキストの中と同じく id の中でもプレースホルダです。
`participant #quot;B` は参加者 `ﬂ°quot¶ßB` を加え、
`A->>B#quot;: x` は `Bﬂ°quot¶ß` へのメッセージを加えます。
id を挙げるどの文も同じです。
[fixture: sequence/db-participant-id-entity]
[fixture: sequence/db-participant-id-numeric-entity]
[fixture: sequence/db-actor-id-entity]
[fixture: sequence/db-participant-alias-id-entity]
[fixture: sequence/db-message-from-id-entity]
[fixture: sequence/db-message-to-id-entity]
[fixture: sequence/db-create-id-entity] [fixture: sequence/db-destroy-id-entity]
[fixture: sequence/db-note-over-id-entity]
[fixture: sequence/db-note-right-id-entity]
[fixture: sequence/db-activate-id-entity]
[fixture: sequence/db-box-participant-id-entity]
[fixture: sequence/db-link-id-entity]

**参加者。**
id、説明、種類、データブロックを持つ参加者を加えると、次のようになります。

- 箱の中では、その id の参加者がすでにあれば、
  [文法の外での拒否](../../../spec/docs/diagrams/sequence.ja.md#文法の外での拒否)
  の **2 つの箱に入る参加者** が定めるとおり、
  参加者がその箱を持つか、入力が拒否されます。
  これは次の 2 つの項目より先に起こるので、
  ほかに何も変わらないときも起こります。
  [fixture: sequence/db-box-existing-participant-joins-box] [fixture:
  sequence/gram-box-participant-in-two-boxes]
- その id の参加者がすでにあり、文が説明を持たないときは、
  ほかに何も変わりません。
  `participant A as Alice` の後の `participant A` は、説明 `Alice` を保ちます。
  [fixture: sequence/db-participant-redeclared-without-alias]
- それ以外では、参加者を新しく記録します。
  `name` は id、`description` は説明かなければ id、`wrap` は説明の折り返し、
  `type` は種類、`links` と `properties` は空、
  `prevActor` は最後に加えた参加者の id（あれば）です。
  その参加者は `nextActor` にこの id を持ちます。
  すでにあった参加者は、`actors` の中の位置と箱を保ちます。
  その links と properties は空になり、`prevActor` は最後に加えた参加者で、
  それは自分自身のこともあります。
  `participant A`、`participant B`、`participant A as Alice` の後では、
  A は説明 `Alice` と `prevActor` B を持ち、B は `nextActor` A を持ちます。
  [fixture: sequence/db-participant-redeclared-with-alias] [fixture:
  sequence/db-participant-redeclared-after-links] [fixture:
  sequence/db-participant-redeclared-itself-previous]
- 箱の中で参加者を記録するときは、初めて記録する参加者はその箱を持ち、
  参加者を記録するたびに、箱は `actorKeys` の最後にその id を加えます。
  `box a`、`participant A`、`participant A as X`、`end` では、
  `actorKeys` は A を 2 回持ちます。
  `participant A` が 2 つなら 1 回です。
  箱の前と箱の中の `participant A` では、
  `actorKeys` は空で、A はその箱を持ちます。
  箱の外では、参加者は箱を保ちます。
  [fixture: sequence/spec-sequence-diagram-f1763a40] [fixture:
  sequence/db-box-participant-twice-with-alias] [fixture:
  sequence/db-box-participant-twice] [fixture:
  sequence/db-box-existing-participant-with-alias] [fixture:
  sequence/db-box-participant-redeclared-outside]

参加者の文は、その id を、`as` のテキストがあればそれを説明とし、
種類 `participant` か `actor` として加えます。
データブロックが設定する `type` と説明は、木からは求めません
（[Db の中のデータブロック](#db-の中のデータブロック) を参照）。
参加者を加えるほかの文
（[文法の外での拒否](../../../spec/docs/diagrams/sequence.ja.md#文法の外での拒否)
の **すでにある参加者の create** が挙げるもの）は、
まず、それが挙げる各 id を、説明なし、種類 `participant` で加えます。
そのため、すでにある id は変わりません。
[fixture: sequence/lex-activate-id-space]

**create と destroy。**
参加者の文の前の `create` は、その id の参加者がすでにあれば拒否されます
（[文法の外での拒否](../../../spec/docs/diagrams/sequence.ja.md#文法の外での拒否) を参照）。
そうでなければ参加者を加え、その id を `createdActors` に記録します。
`messageIndex` は、それまでの `messages` の項目の数です。
`destroy` は、同じように id を `destroyedActors` に記録します。
[fixture: sequence/db-create-participant] [fixture:
sequence/db-destroy-participant] [fixture:
sequence/db-create-participant-before-message]
`create` の付いた destroy の文は、
その id で `create participant` と同じことをします。
種類が `participant` で、id を説明とする参加者を加え、
`createdActors` に記録します。
`destroyedActors` には何も記録せず、`create` の後の検査が当てはまります
（[文法の外での拒否](../../../spec/docs/diagrams/sequence.ja.md#文法の外での拒否) を参照）。
[fixture: sequence/gram-create-destroy] [fixture:
sequence/db-create-destroy-then-destroy] [fixture:
sequence/gram-create-destroy-without-message] [fixture:
sequence/gram-create-destroy-existing]

**メッセージ。**
メッセージの文は、`messages` に項目を 1 つ加えます。
`from` と `to` は 2 つの id、`message` はテキスト、`wrap` はその折り返し、
`type` は矢印の番号（[矢印](#矢印) を参照）で、
`activate` と `centralConnection` を持ちます。
その後は次のとおりです。

- `+` のとき: `activate` は真。その後に、宛先の型 17 の項目。
- `-` のとき: `activate` は偽。その後に、送り手の型 18 の項目。
- 矢印の後の `()` のとき: `activate` は真で、`centralConnection` は 59。
  その後に、宛先の型 59 の項目。
- 矢印の前の `()` のとき: `activate` は偽で、`centralConnection` は 60。
  その後に、送り手の型 60 の項目。
- 両方のとき: `activate` は真で、`centralConnection` は 61。
  その後に、宛先の型 59 の項目と、送り手の型 60 の項目。
- それ以外: `activate` は偽で、`centralConnection` は 0。

1 つの参加者の項目は、`from` にその id を持ち、`to` を持たず、
`message` は空、`wrap` は設定の折り返しの設定、`activate` は偽、
`centralConnection` は 0 です。
`activate` と `deactivate` は、そのような型 17 と型 18 の項目を加えます。
[fixture: sequence/db-message-activate-target] [fixture:
sequence/db-message-central-connection-target] [fixture:
sequence/db-message-central-connection-source] [fixture:
sequence/db-message-central-connection-both]

**ノート。**
ノートは項目を 1 つ加えます。
その項目は、`from` と `to` にその id（`,` のある `over` なら 2 つの id）を持ち、
`message` はテキスト、`wrap` はその折り返し、`type` は 2 です。
`placement` は、`left of` なら 0、`right of` なら 1、`over` なら 2 です。
[fixture: sequence/db-note-over-two] [fixture: sequence/db-note-left-of]

**autonumber。**
`autonumber` は、`message` が `visible` 真で、
数が続くときは `start` と `step` を持つ型 26 の項目を加えます。
`start` は 1 つ目の数で、`step` は 2 つ目の数、なければ 1 です。
`autonumber off` は、`visible` が偽で、数を持ちません。
その `wrap` は偽です。
[fixture: sequence/db-autonumber-bare] [fixture:
sequence/db-autonumber-start] [fixture: sequence/db-autonumber-start-step]
[fixture: sequence/db-autonumber-off]

**ブロック。**
ブロックは、始まりにテキストとその折り返しの項目を、
各 `else`、`and`、`option` にそのテキストの項目を、
`end` に空のテキストと設定の折り返しの設定の項目を加えます。
型は次のとおりです。

| ブロック   | 始まり | 節  | 終わり |
| ---------- | ------ | --- | ------ |
| `loop`     | 10     |     | 11     |
| `alt`      | 12     | 13  | 14     |
| `opt`      | 15     |     | 16     |
| `par`      | 19     | 20  | 21     |
| `rect`     | 22     |     | 23     |
| `critical` | 27     | 28  | 29     |
| `break`    | 30     |     | 31     |
| `par_over` | 32     | 20  | 21     |

ブロックの項目は、`from` と `to` を持たず、`activate` は偽、
`centralConnection` は 0 です。
`rect` のテキストは、描画が塗りの色として使います。
Db はそれをテキストとして持ちます。
[fixture: sequence/db-block-loop-wrap] [fixture: sequence/db-block-alt]
[fixture: sequence/db-block-opt] [fixture: sequence/db-block-rect] [fixture:
sequence/db-block-critical] [fixture: sequence/db-block-par] [fixture:
sequence/db-block-par-over] [fixture: sequence/db-block-break]

**箱。**
箱は、`actorKeys` が空の項目を `boxes` に加え、
その中の参加者の文がそれぞれの id を加えます。
その中の destroy の文は何も加えません。
[fixture: sequence/db-box-empty] [fixture: sequence/db-box-destroy-inside]
その `name`、`fill`、`wrap` は、テキストの始まりが色かどうかに依り、
mermaid.js はそれをブラウザに問い合わせます。
これらは木の外から与えます（[箱の色](#箱の色) を参照）。

**links と properties。**
`links` と `properties` は、テキストを JSON として読み、
その値の各キーを、参加者の `links` か `properties` に写します。
前の文のキーに加え、すでにあるキーは置き換えます。
JSON のオブジェクトのキーはその名前です。
JSON の配列は、各要素を 0 から数えた位置の下に与え、
JSON の文字列は、各 UTF-16 コード単位を 0 から数えた位置の下に与えます。
数、`true`、`false`、`null` は何も与えません。
JSON でないテキストは何も変えず、入力は受理されます。
Db を求める側は、その JSON を、木のテキストから、変換後の形で読みます。
変換後の形では、エンティティはプレースホルダです。
この JSON は、
[`embedded-data-opaque`](../../../spec/docs/known-divergences/embedded-data-opaque.ja.md)
の意味での埋め込みデータではありません。
mermaid.js はそれを理由に入力を拒否することがなく、
木はそれをほかのテキストと同じく保つからです。
[fixture: sequence/db-links-not-json] [fixture:
sequence/db-properties-not-json] [fixture: sequence/db-links-string-value]
[fixture: sequence/db-properties-string-value] [fixture:
sequence/db-links-array-value] [fixture: sequence/db-links-number-value]
[fixture: sequence/db-links-two-statements] [fixture: sequence/db-links-entity]
[fixture: sequence/db-links-object] [fixture: sequence/db-links-trailing-comma]
[fixture: sequence/db-properties-trailing-comma]
テキストのない文のテキストは空のテキストで、JSON ではありません。
`links A:` と `properties A:` は何も変えません。
[fixture: sequence/db-links-empty] [fixture: sequence/db-properties-empty]
[fixture:
sequence/db-links-proto-key] [fixture: sequence/db-properties-proto-key]
`link` は 1 つのリンクを設定します。
そのラベルは、最初の `@` より前のテキストから `@` の直前の 1 文字を除いたもの、
URL はその `@` より後のテキストで、それぞれ両端の空白を除きます。
`@` が最初の文字なら、その前に文字はなく、
ラベルはテキストから最後の 1 文字を除いたものです。
`@` が 2 番目の文字なら、ラベルは空です。
`@` がないときは、ラベルはテキストから最後の 2 文字を除いたもの、
URL はテキスト全体です。
`link A: Dash @ https://x` は `Dash` を、
`link A: Dash@https://x` は `Das` を、
`link A: @ https://alic` は `@ https://ali` に `https://alic` を設定し、
`link A: x@https://u` は空のラベルを設定し、
`link A: no at` は `no` に `no at` を設定します。
[fixture: sequence/db-link-label] [fixture: sequence/db-link-without-space]
[fixture: sequence/db-link-at-first] [fixture: sequence/db-link-at-second]
[fixture: sequence/db-link-at-only] [fixture: sequence/db-link-without-at]
[fixture: sequence/db-link-without-at-url]
テキストが空なら、`link A:` は `@` を持たず、空のラベルに空の URL を設定します。
[fixture: sequence/db-link-empty]
`details` は、テキストがなくても、何も変えません。
mermaid.js は、テキストを id とするページの要素を探しますが、
ページは図のテキストの一部ではなく、要約はそれのないページとして作ります。
[fixture: sequence/db-details-empty]

**タイトル。**
`title` は、タイトルを、その SequenceTitleStatement の値、
つまり `title-text` の単位のテキストに、空白を含めて書かれたとおりに設定します。
`title`、空白 2 個、`x`、空白 2 個のタイトルは、空白、`x`、空白 2 個で、
空白 4 個が続く `title` のタイトルは、空白 3 個です。
`title:` も同じです。
`accTitle:` はアクセシビリティのタイトルを、
`accDescr:` と `accDescr {` は説明を設定します。
[flowchart.ja.md](./flowchart.ja.md#木から要約を作る) と同じく、
両端の空白を除き、各改行とその後の空白を 1 つの改行として読み、
後の文が前の文を置き換え、閉じていない `accDescr {` のブロックは説明を空にし、
テキストのない閉じたブロックは何も変えません。
[fixture: sequence/db-title-spaces] [fixture:
sequence/db-title-whitespace-only] [fixture: sequence/db-title-legacy]
[fixture: sequence/db-acc-descr-block-lines] [fixture:
sequence/db-acc-descr-block-unclosed] [fixture:
sequence/db-acc-descr-line-alone] [fixture:
sequence/db-acc-descr-block-after-message]

文はブロックの中も含めてソースの順に適用され、
3 つの値はどれも最後に設定されたものを保ちます。
タイトルは、木からは来ないフロントマターのタイトルから始まり
（[要約](../db-summaries.ja.md#sequence) を参照）、
`title` の文がそれを置き換えます。
フロントマターに `title: From frontmatter` があるとき、
`title From statement` のタイトルは `From statement` です。
`title first` と `title second` は `second` を与え、
`accTitle:` と `accDescr:` も、同じ種類の前の文を同じように置き換えます。
`accDescr:` の行は前のブロックの説明も置き換え、
ループの後の `accDescr: outer` は、
ループの中の `accDescr: inner` を置き換えます。
タイトルとアクセシビリティのタイトルは別の値です。
`title first` と `accTitle: second` は、
タイトル `first` とアクセシビリティのタイトル `second` を与えます。
テキストのない閉じたブロックは、空白、改行、コメント行だけを持つものも、
何も変えません。
`accDescr: x` の後の `accDescr {}` と `accDescr { }` は `x` を保ちます。
[fixture: sequence/db-title-replaces-frontmatter] [fixture:
sequence/db-title-replaces] [fixture: sequence/db-acc-title-replaces] [fixture:
sequence/db-acc-descr-replaces] [fixture:
sequence/db-acc-descr-line-replaces-block] [fixture:
sequence/db-acc-descr-outer-replaces-loop] [fixture:
sequence/db-title-and-acc-title] [fixture:
sequence/db-acc-descr-empty-block-keeps] [fixture:
sequence/db-acc-descr-spaces-block-keeps] [fixture:
sequence/db-acc-descr-comment-block-keeps] [fixture:
sequence/db-acc-descr-empty-block-after-message] [fixture:
sequence/db-acc-descr-empty-block-spaces-after-message] [fixture:
sequence/db-acc-descr-empty-block-lines-after-message] [fixture:
sequence/db-acc-descr-block-comment-only-after-message]

**読まれない文。**
SequenceIgnoredStatement は、`end` の後の同じ行でも、何も変えません。
`)` だけの行がそうです。
[fixture: sequence/lex-invalid-line-parenthesis] [fixture:
sequence/gram-invalid-after-end]

## 矢印

メッセージの `type` は、その矢印の線と記号から決まる番号です
（[SequenceArrow](../../../spec/docs/ast/sequence.ja.md#sequencearrow) を参照）。

- 半分の記号がないとき: 線 `solid` では、記号なしは 5、
  終わりの記号 `arrow` は 0、`cross` は 3、`open-arrow` は 24、
  始まりと終わりの記号 `arrow` は 33 です。
  線 `dotted` では 1 大きく、6、1、4、25、34 です。
- 終わりの記号が `half-arrow-top`、`half-arrow-bottom`、`half-stick-top`、
  `half-stick-bottom` のとき: 線 `solid` では 41、42、43、44、
  `dotted` では 51、52、53、54 です。
- そのような始まりの記号のとき: 線 `solid` では 45、46、47、48、
  `dotted` では 55、56、57、58 です。

そのため、`->>` は 0、`<<-->>` は 34、`-//` は 44、`//--` は 57 です。
[fixture: sequence/db-arrow-types]

## 箱の色

mermaid.js は、箱のテキストを色の候補と残りに分け、
候補が色かどうかをブラウザに問い合わせます
（[`parseBoxData()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/sequenceDb.ts#L394-L419)
を参照）。
その答えはテキストから来ないので、箱の `name`、`fill`、`wrap` は、
設定の値と同じく、木の外から与えます。

分け方が受け取るテキストは、色の候補から、候補がなければテキストから、
`text` の単位の終わりまでで、終わりの空白も含みます。
分け方は、部分の両端のほかの空白を削るので、
その空白のうち結果を変えるのは U+2028 か U+2029 だけです。
[SequenceBoxText](../../../spec/docs/ast/sequence.ja.md#sequenceboxtext) の値は、
そのうち最後のものまでのテキストを持ち、それが分け方の読むテキストです。
その型が U+2028 か U+2029 を読むのは、1 か所だけです。
色の候補の、`rgb`、`rgba`、`hsl`、`hsla` と `(` の間の空白です。
テキストがほかの所に U+2028 か U+2029 を持つと、終わりにだけ持つときも、
分け方は当てはまらず、
箱は、テキストによらず `fill` が `transparent` で名前を持たず、
答えは問い合わせません。
行の終わりで U+2028 が続く `box red-team` と `box aqua` は、
U+2028 の周りに空白があっても、
`box red`、U+2029、`team` も、名前を持たず、`fill` は `transparent` です。
一方、空白が続く `box red-team` は、`fill` が `red` で、名前は `-team` です。
テキストの前の U+2028 は、行の文脈が何も読まない空白なので
（[行の文脈](../../../spec/docs/diagrams/sequence.ja.md#行の文脈) の規則 1）、
`box`、空白、U+2028、`red team` は、`fill` が `red` で名前は `team` です。
それらの文字が色の候補のその空白にだけあるときは、分け方は当てはまり、
候補は、下の `rgb (0, 0, 255)` と同じく色ではありません。
`box rgb`、U+2028、`(1, 2, 3) G` と、`hsl` と U+2029 2 つの同じ形は、
`fill` が `transparent` で、U+2028 か U+2029 を含むテキスト全体が名前です。
一方、`box rgb(1, 2, 3)`、U+2028、` G` は名前を持ちません。
[fixture: sequence/db-box-line-separator-in-colour-function] [fixture:
sequence/db-box-paragraph-separator-in-colour-function] [fixture:
sequence/db-box-line-separator-after-colour-function]
[fixture: sequence/db-box-line-separator-at-end] [fixture:
sequence/db-box-spaces-around-line-separator-at-end] [fixture:
sequence/db-box-colour-then-spaces-and-line-separator] [fixture:
sequence/tokens-box-text-trailing-spaces] [fixture:
sequence/db-box-paragraph-separator-in-text] [fixture:
sequence/db-box-colour-then-line-separator] [fixture:
sequence/db-box-line-separator-before-text]

答えが与えられると、それらは SequenceBoxText から求まります
（[SequenceBoxText](../../../spec/docs/ast/sequence.ja.md#sequenceboxtext) を参照）。
色の候補が色なら、`fill` は候補で、名前は残りから来ます。
そうでなければ、`fill` は `transparent` で、名前はテキスト全体から来ます。
名前の始まりの折り返しの接頭辞は、テキスト部分と同じく `wrap` を決め
（[テキスト部分](../../../spec/docs/diagrams/sequence.ja.md#テキスト部分)
を参照）、名前はその残りです。
名前が空のときや、箱がテキストを持たないときは、箱は `name` を持ちません。
ブラウザの答えでは、次のようになります。

- `box green Group 1` は fill `green` と名前 `Group 1` を、
  `box Group 1` は fill `transparent` と名前 `Group 1` を持ちます。
  [fixture: sequence/spec-sequence-diagram-f1763a40] [fixture:
  sequence/spec-sequence-diagram-1705b6f7]
- `box aqua` は fill `aqua` を持ち、名前を持ちません。
  テキストのない箱は fill `transparent` を持ち、名前を持ちません。
  [fixture: sequence/spec-sequence-diagram-9f31df65] [fixture:
  sequence/db-box-no-text]
- `box rgb(34, 56, 0) Group1` は fill `rgb(34, 56, 0)` を、
  `box Purple Alice & John` は fill `Purple` と名前 `Alice & John` を持ちます。
  [fixture: sequence/spec-sequence-diagram-97d37793] [fixture:
  sequence/docs-syntax-sequence-diagram-93d3c0ff] [fixture:
  sequence/demo-sequence-ec7c4269]
- `box red-team` は fill `red` と名前 `-team` を持ちます。
  [fixture: sequence/db-box-colour-candidate-word-prefix]
- `box RGB(0, 0, 255) Team` の候補は語 `RGB` で、
  `rgb (0, 0, 255)` は色ではありません。
  どちらの箱も、fill `transparent` を持ち、テキスト全体を名前とします。
  [fixture: sequence/db-box-colour-function-upper-case] [fixture:
  sequence/db-box-colour-function-space]
- `box aqua wrap:Group` は fill `aqua` を、
  `box wrap:Group` は fill `transparent` を持ちます。
  どちらも名前 `Group` と `wrap` 真を持ちます。
  [fixture: sequence/db-box-wrap-after-colour] [fixture:
  sequence/db-box-wrap-without-colour]
- `#` はテキストを終えます。`box aqua G # c` の名前は `G` です。
  [fixture: sequence/lex-box-hash-comment]

## Db の中のデータブロック

参加者の `@{ ... }` のブロックが設定する `type` と説明は、
`@mmd-toolkit/tests` の `dataBlockEffects` から来ます。
データブロックを持つ参加者の文ごとに 1 項目です
（[`dataBlockEffects`](../embedded-data.ja.md#datablockeffects)
を参照）。
`as` の説明は、ブロックの説明より優先します。
`participant A@{ "alias": "Q" } as R` は説明 `R` を持ちます。
[fixture: sequence/db-data-block-alias-and-as]
