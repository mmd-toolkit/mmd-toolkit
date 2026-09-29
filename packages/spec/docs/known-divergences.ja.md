# 既知の差

英語版: [known-divergences.md](./known-divergences.md)

この仕様は、受理・拒否のすべての判断とすべての Db の値で mermaid.js に従います。
例外は、この文書で定める入力です。
そのような入力の各群は差の識別子を持ち、
その影響を受ける fixture には、その識別子を付けます。
比べるのは受理・拒否の判断と Db だけです。
両方が入力を拒否するときは、拒否する段階が違っても差ではなく、
その fixture に識別子は付けません。
`flow%%{init: {}}%%chart LR` の後に行 `A-->` が続くものは、
mermaid.js では flowchart の文法で拒否され、
この仕様ではディレクティブが `Keyword`
の単位であるヘッダーのキーワードの中にあるので拒否されます。
[fixture: common/directive-splits-header-keyword]

各図の文書は、その既知の差の節で、
その図種に当てはまる差と、それがその図種でどう現れるかを挙げます。

| 識別子                                                        | 図種                | 入力                                                         |
| ------------------------------------------------------------- | ------------------- | ------------------------------------------------------------ |
| [`directive-as-token-boundary`](#directive-as-token-boundary) | すべて              | `RawText` でも `Identifier` でもない単位の中のディレクティブ |
| [`html-tag-in-frontmatter`](#html-tag-in-frontmatter)         | すべて              | フロントマターの中で始まる HTML タグ                         |
| [`embedded-data-opaque`](#embedded-data-opaque)               | すべて              | mermaid.js が拒否する埋め込みデータ                          |
| [`click-reserved-word`](#click-reserved-word)                 | flowchart           | クリックの文が始まらないところの語 `click`                   |
| [`tokenless-empty-forms`](#tokenless-empty-forms)             | flowchart、sequence | mermaid.js がトークンを読まない空の形                        |
| [`comment-takes-character`](#comment-takes-character)         | sequence            | `%%` の直前の文字か数                                        |

## `directive-as-token-boundary`

mermaid.js は、各ディレクティブをテキストから取り除き、
その前後のテキストをつなぎます。
この仕様も同じようにテキストを読みます
（[ディレクティブはトークンの境界](./common.ja.md#ディレクティブはトークンの境界) を参照）。
違いは 1 つだけです。
キーワード、矢印、文字列のような、`RawText` でも `Identifier` でもない単位は、
中にディレクティブを持てず、入力は拒否されます。
mermaid.js は、つないだテキストを受理するときはそれを受理します。
差は一方向だけです。
この仕様は、mermaid.js が拒否する入力を受理せず、
両方が受理する入力にはどれも同じ Db を与えます。

- `A["a %%{init: {}}%% b"]` は、mermaid.js ではラベル `a  b` のノードです。
  この仕様では、ディレクティブが `String` の単位である文字列の中にあるので、
  入力は拒否されます。
  [fixture: common/directive-in-string]
- `flow%%{init: {}}%%chart LR` の後に行 `A-->B` が続くものは、
  mermaid.js では flowchart です。
  この仕様でも検出は `flowchart` を見ますが、
  ディレクティブが `Keyword` の単位であるヘッダーのキーワードの中にあるので、
  入力は拒否されます。
  [fixture: common/directive-in-header-keyword]

各図の文書は、これに当たるその図の単位を挙げます。
flowchart については [既知の差](./diagrams/flowchart.ja.md#既知の差)
を見てください。

mermaid.js は、トークンの中のディレクティブを文書にもテストにもしていません。
mermaid.js 自身のテストは、
どのディレクティブもそれだけの行に置いています
（複数行にまたがることはあります）。
pin した版の 287 個の `*.spec.ts` と `*.spec.js` ファイルにある 37 か所の `%%{`
のうち、34 か所はテストの入力で、
どれも入力のその行で（字下げの後の）最初のものです。
残りの 3 か所は
[`diagrams/agentflow/parser/agentflow-comments.spec.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/parser/agentflow-comments.spec.ts)
のコードコメントの中です。
テストの入力は、
[`utils.spec.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils.spec.ts)、
[`mermaidAPI.spec.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/mermaidAPI.spec.ts)、
[`diagram-api/comments.spec.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/comments.spec.ts)、
[`config.appearance.spec.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/config.appearance.spec.ts)、
[`rendering-util/layout-algorithms/dagre/index.spec.js`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/rendering-util/layout-algorithms/dagre/index.spec.js)、
[`diagrams/sequence/sequenceDiagram.spec.js`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/sequenceDiagram.spec.js)、
[`diagrams/radar/radar.spec.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/radar/radar.spec.ts)、
[`docs/.vitepress/theme/exampleConfig.spec.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/.vitepress/theme/exampleConfig.spec.ts)
にあります。
flowchart のパーサーのテストには、ディレクティブが 1 つもありません。
トークンの中での挙動は、
段階 4 をテキスト全体に対する文字列の置き換えとして実装したことの副作用です。

この仕様は、意図して 1 つの点でそれと異なります。
キーワード、矢印、文字列のような、`RawText` でも `Identifier` でもない単位は、
テキスト全体で 1 つのものを表し、分けられることはないので、
その中のディレクティブは入力を拒否させます。
ほかのすべての規則は、mermaid.js と同じく、
ディレクティブのないテキストを読みます。

## `html-tag-in-frontmatter`

mermaid.js は、
[`cleanupText()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/preprocess.ts#L6-L17)
で、フロントマターを取り除く前に、ソース全体から HTML タグを探します。
そのため、フロントマターの中で始まるタグがテキストの中の `>` まで届き、
テキストの中の `"` の読み方を変えることがあります。
この仕様は、
タグをフロントマターの後のテキストの中だけで探します
（[HTML 属性の引用符](./common.ja.md#html-属性の引用符) を参照）。
字句解析器はフロントマターの後から読み始め、
フロントマターの中身はテキストの読み方を変えません。
差は両方向に生じ、受理・拒否も Db も変えることがあります。
フロントマターの中で始まりフロントマターの中で終わるタグは、差を生みません。
字句解析器はフロントマターの本文を読まず、
タイトルのようにそこから導く値は mermaid.js
が導くものだからです（[フロントマターの設定](./common.ja.md#フロントマターの設定) を参照）。
[fixture: flowchart/frontmatter-title-html-attribute]

mermaid.js が受理し、この仕様が拒否するもの:

- フロントマターの `title: <a` は、mermaid.js ではタグを始め、
  その属性部は `A[b="c">d]` の `>` まで届くので、ラベルは `b='c'>d` です。
  この仕様では `"` は残り、flowchart の文法がそのラベルを拒否します。
  [fixture: flowchart/html-tag-starts-in-frontmatter]

mermaid.js が拒否し、この仕様が受理するもの:

- フロントマターに `title: <a z="` があると、
  mermaid.js ではタグが `A[<b x="y">t]` の `>` まで届き、
  その引用符付きの値はフロントマターの `z="` から `x=` の後の `"`
  までになります。
  `y` の後の `"` は残り、flowchart の文法がそのラベルを拒否します。
  この仕様では、`<b x="y">` がそれ自身のタグで、ラベルは `<b x='y'>t` です。
  [fixture: flowchart/html-tag-starts-in-frontmatter-value]

どちらも受理し、Db が異なるもの:

- フロントマターに `title: <a` があると、
  `accTitle: b="c">d` のアクセシビリティのタイトルは、
  mermaid.js では `b='c'>d`、この仕様では `b="c">d` です。
  [fixture: flowchart/html-tag-starts-in-frontmatter-acc-title]

## `embedded-data-opaque`

3 種類の埋め込みデータは、書かれたとおりに保持し、解析も検査もしません。
フロントマターの本文、ディレクティブの引数、
一部の図の本文にある `@{ ... }` のデータブロック
（flowchart のノードの形のデータなど）です。
mermaid.js は、フロントマターの本文とデータブロックを YAML として、
一部のディレクティブの引数を JSON として解析し、
そこから設定と図のデータを求めます。
それに失敗したとき、または結果が知らない形のときは、
入力を拒否します（[設定（参考）](./common.ja.md#設定参考) を参照）。
YAML や JSON を解析して中身を検査することは木を作るのに不要で、それを省けば、
実装はどちらにも依存せずにすみます。

そのため、この仕様は、
埋め込みデータの中身だけを理由に mermaid.js が拒否する入力をすべて受理します。
フロントマターの本文とディレクティブの引数については、次のものです。

- フロントマターの本文の YAML の構文エラー。
  `title: '<a b="c">'` のように、
  mermaid.js がタグの中の `="..."` を `='...'`
  に書き換えて生じるものも含みます。
  [fixture: common/frontmatter-title-single-quoted-tag] [fixture:
  common/frontmatter-yaml-error] [fixture: flowchart/frontmatter-invalid-yaml]
  [fixture: common/frontmatter-duplicate-key] [fixture:
  common/frontmatter-two-documents]
- `displayMode` と、文字列、数、真のどれかであるフロントマターの `config`、
  またはその中の `gantt` の組。
  [fixture: common/frontmatter-display-mode-primitive-config] [fixture:
  common/config-display-mode-gantt-primitive]
- wrap ディレクティブと、文字列、数、真のどれかである init の設定の組。
  [fixture: common/directive-primitive-init-wrap] [fixture:
  common/directive-primitive-init-two-wrap-substrings]
- `themeCSS`、`fontFamily`、
  `altFontFamily` のどれかを含むキーの下の数や真偽値と、
  mermaid.js が許さない文字を含む文字列の `themeVariables`。
  [fixture: common/config-css-key-not-string] [fixture:
  common/config-theme-variables-string-rejected]
- mermaid.js が色として解析できないテーマの変数。
  [fixture: common/config-theme-colour-rejected]
- init ディレクティブがあるときに mermaid.js が行う 2 回目の検出の失敗。
  [fixture: common/config-init-detection-rejects]

データブロックについては、
たとえば mermaid.js は `A@{ shape: [ }` を `YAMLException` で拒否し、
`A@{ shape: nonsense }` をそのような形がないので拒否し、
`A@{ label: 12 }` を受理して数 12 をラベルにします。
データブロックがどこで始まりどこで終わるかは各図の構文の一部で、
flowchart の文書が定めます。
この 3 つの例は、その既知の差の fixture になります。

差は一方向だけです。
埋め込みデータの中身を理由に、mermaid.js が受理し、
この仕様が拒否する入力は知られていません。
mermaid.js はこれらの入力に Db を与えないので、
その fixture は拒否だけを記録します。
この仕様は、それらの木を他の入力と同じように定めます。

## `click-reserved-word`

flowchart では、`click` は予約語で、クリックの文を始めるためだけにあります。
単位の始まりにある語 `click` は、後の空白とともに `click` の単位で、
クリックの文脈に入ります
（[クリックとコールバック](./diagrams/flowchart.ja.md#クリックとコールバック) を参照）。
この仕様は、`click` の単位を、クリックの文の最初の単位としてだけ受理し、
それ以外の位置に `click` の単位を持つ入力を拒否します。
mermaid.js の字句解析器は、
[`flow.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L112-L114)
で、`click` の後に空白が続くところでは、
そこでクリックの文を始められるかを確かめずに、いつでもクリックの文脈に入ります。
その後をクリックの id として読むか、文字列と空白だけが続くときは何も読まず、
文法は、そのクリックの id か何もないことを受け付ける位置なら、
どこでも受理します。
文の中、文と文の間、id やスタイルの中、subgraph の名前の中です。
差は一方向だけで、mermaid.js が受理し、この仕様が拒否します。
その形は、flowchart の文書の
[既知の差](./diagrams/flowchart.ja.md#既知の差) にあります。

クリックの文そのものは、`click` が頂点のつもりだったかもしれない場合も、
mermaid.js と同じように読みます。
そのクリックの id は、クリックの文脈が読む文字の並びで、
それが何であってもかまいません
（[クリックの文](./diagrams/flowchart.ja.md#クリックの文) を参照）。
`click --- abc;` は、id が `---` でコールバックの名前が `abc` のクリックの文で、
その図は頂点も辺も持ちません。
`click & B` と `click B C` は、
コールバックの名前が `B` と `C` のクリックの文です。
[fixture: flowchart/lex-click-id-arrow-callback] [fixture:
flowchart/gram-click-ampersand-id] [fixture:
flowchart/gram-click-id-then-callback-name]

mermaid.js の保守者は、`click` を予約語として扱っています。
2026-10-01 の時点で、次のとおりです。
[issue #4182](https://github.com/mermaid-js/mermaid/issues/4182)
「`click` cannot be used for node IDs」は、
`click` は予約語だという答えで閉じられました。
[issue #7023](https://github.com/mermaid-js/mermaid/issues/7023)
「node named click is not rendered in flowgraph」は、
`click --- abc;` についてのものです。
mermaid.js はそれをクリックの文として読み、空の図を描きます。
この仕様も、それをクリックの文として読みます。
その issue は未解決で、不具合として承認されています。
そこでの保守者の最初の返事は、その入力は構文エラーにすべきだと言っていて、
mermaid.js がどう変わるかは決まっていません。

そのような入力の**参照の入力**は、入力から、コメント領域と、
空の形（[`tokenless-empty-forms`](#tokenless-empty-forms) を参照）と、
クリックの文を始めない各 `click` の単位について、語 `click`、その後の空白、
その単位が入ったクリックの文脈を字句解析器が出るときの 1 個の空白（あれば）を、
除いたものです。
次の 3 つの条件が成り立つところでは、
mermaid.js は参照の入力に元の入力と同じ Db を与えます。
1 つ目は、mermaid.js が参照の入力を受理することです。
2 つ目は、この仕様の字句解析器が参照の入力を、
入力の単位のうち、取り除いたもの以外のものとして読むことです。
ただし、それらの `click` の単位のクリックの文脈が読む
クリックの id と `click-comma` の単位は例外で、
そのテキストを、それぞれと同じところで始まり終わる、
ほかの単位として読んでかまいません。
3 つ目は、それらの各クリックの id のテキストが、
参照の入力の木の 1 つの葉のノードの範囲の中にあることです。
`A:click "" b-->C` は `A:b-->C` になり、
どちらも頂点 `A:b` と、そこから C への辺を持ちます。
`subgraph click me` の後に空の行が続くものは `subgraph me` になり、
どちらも id は `me` です。
[fixture: flowchart/db-vertex-id-bare-click] [fixture:
flowchart/db-subgraph-id-click-blank-line]
そうでないときは、取り除いたことで両側がつながるか、
クリックの id のテキストが、文の文脈で別に読まれる位置に置かれ、
mermaid.js は参照の入力を別に読むことがあります。
同じ Db になるつながり方もあります。
`subgraph click me`、改行、`A` は `subgraph meA` になり、
どちらも id は `meA` です。
mermaid.js も、クリックの id と次の行を同じようにつなげるからです。
そうならないものもあります。
`subgraph click m;e` では、クリックの id の `;` が、
参照の入力 `subgraph m;e` では区切りになり、id は `m;e` ではなく `m` です。
`subgraph click a,b` では `,` が `,` の単位になり、
名前はそれを受け付けないので、
mermaid.js は `subgraph a,b` を拒否します。
[fixture: flowchart/gram-subgraph-name-click] [fixture:
flowchart/gram-subgraph-name-click-semicolon-in-id] [fixture:
flowchart/gram-subgraph-name-click-comma]

## `tokenless-empty-forms`

書かれているのに何も持たない形を、木に置く場所がないところで拒否します。
flowchart では、そのような形は 3 つです。
1 つ目は**空の文字列**で、`""` か空の markdown 文字列です。
2 つ目は**空の呼び出し**で、
`call` とその後の空白に、間に空白だけを挟んだ括弧が続くものです。
3 つ目は文を始めない**空の説明ブロック** `accDescr {}` です。
sequence の文法には文字列も `call` もないので、
そのような形は空の説明ブロックだけです（下を参照）。
mermaid.js の字句解析器は、どれにもトークンを読みません。
flowchart では、空の文字列の引用符を
[`flow.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L82-L87)
で、空の呼び出しの `call` と括弧を
[`flow.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L74-L79)
で、空の説明ブロックの `accDescr {` と `}` を
[`flow.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L35-L37)
で、トークンを返さずに読み進めます。
そのため、その文法はそれらを見ることがなく、
mermaid.js は、それらのある入力を、その形がないものとして読みます。
そのため、多くの場所でそれらを受理します。
文と文の間、文の中、ラベル、スタイル、subgraph の名前の中のほかのテキストの隣、
クリックの文の id の前、ヘッダーのキーワードの直後がそうです。
形の周りに残るものが受理されないところでは、入力を拒否します。
形が値の全体であるところ（下の例）と、
矢印や数のように字句解析器が 1 つのトークンとして読むものの中にあるところです。
`A --""> B` と `linkStyle 0""0 stroke:red` がそうです。
[fixture: flowchart/lex-empty-string-in-arrow] [fixture:
flowchart/gram-linkstyle-number-empty-string]
これらの形は、どの 2 つの単位の間にも、
id、ラベル、スタイルのような葉のノードの値の中にも、
ノードの欄と欄の間にも現れます。
木には、そこにそれ自体のノードを置く場所がありません。
そのため、この仕様は、それぞれを、文法のどの規則も取らない単位として読み、
入力を拒否します（flowchart の
[文字列](./diagrams/flowchart.ja.md#文字列)、
[クリックとコールバック](./diagrams/flowchart.ja.md#クリックとコールバック)、
[アクセシビリティの値](./diagrams/flowchart.ja.md#アクセシビリティの値)
を参照）。
mermaid.js がトークンを読まないことは、それだけでは拒否する理由になりません。
木にそのテキストを置く場所があるところでは、
それはノードになり、入力は受理されます。
方向の行の、`direction` の前と値の後のテキストは、
mermaid.js が捨てるものですが、
[FlowchartIgnoredText](./ast/flowchart.ja.md#flowchartignoredtext) です。
文が始まる位置の空の説明ブロックは、テキストのない説明のブロックの文で、
何も変えません。
どちらも、両方が受理します。
[fixture: flowchart/lex-direction-line-swallows-edge] [fixture:
flowchart/lex-direction-line-text-after-value] [fixture:
flowchart/gram-acc-descr-block-empty]
これらの形に見えるだけのテキストは、そのどれでもなく、受理のままです。
`A""-->B` の引用符は頂点 `A""` の文字で、
`accTitle: ""` のタイトルは `""` です。
`A[" "]` は空白 1 つの文字列を持ち、
`A["call ()"]` のラベルは `call ()` です。
[fixture: flowchart/lex-empty-quotes-in-id] [fixture:
flowchart/lex-acc-title-quotes] [fixture:
flowchart/gram-label-space-string] [fixture:
flowchart/gram-label-string-call-text]
差は一方向だけで、mermaid.js が受理し、この仕様が拒否します。
その形は、flowchart の文書の
[既知の差](./diagrams/flowchart.ja.md#既知の差) にあります。
sequence の文法には文字列も `call` もないので、
そのような形は空の説明ブロックだけです。
mermaid.js は、それにも同じくトークンを読みません
（[`sequenceDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/parser/sequenceDiagram.jison#L76-L77)）。
`A->>accDescr {}B: x` と `note left of accDescr {} A: x` は、
mermaid.js が受理し、ここでは拒否します。
一方、`accDescr {} A->>B: x` は、説明のブロックの文とそれに続くメッセージです
（[sequence.ja.md](./diagrams/sequence.ja.md#既知の差) を参照）。
[fixture: sequence/gram-empty-description-block-after-arrow] [fixture:
sequence/gram-empty-description-block-after-placement] [fixture:
sequence/gram-acc-descr-block-empty-then-statement]

書き手が空のものを表すつもりでこれらの形を書くところでは、
mermaid.js もそれを拒否します。
`A[""]`、`A("")`、`A-->|""|B`、`A -- "" --> B`、
`click A href ""`、`subgraph ""`、`click A call ()` は、どちらも拒否します。
[fixture: flowchart/gram-label-empty-string] [fixture:
flowchart/gram-shape-round-empty-string] [fixture:
flowchart/gram-link-text-empty-string] [fixture:
flowchart/gram-link-text-dash-empty-string] [fixture:
flowchart/gram-click-href-empty-string] [fixture:
flowchart/gram-subgraph-name-empty-string-only] [fixture:
flowchart/gram-click-empty-call-only]
mermaid.js がそれらを受理するのは、
ほかのテキストの隣で何も残さないところだけです。
mermaid.js のテスト、ドキュメント、デモから集めた入力には、
それらを含むものは 1 つもありません。

そのような入力の**参照の入力**は、
入力から、コメント領域と、空の形を除いたものです。
除くのは、各空の文字列、`call` から `)` までの各空の呼び出し、
`accDescr` から `}` までの、文を始めない各空の説明ブロックです。
ブロックが文を始めるかは、その前の空の文字列と空の呼び出しを除いて決めます。
`""accDescr {}` の後に改行と `A` が続くものでは、
空の文字列を除くとブロックが文を始めるので、ブロックは参照の入力に残ります。
[fixture: flowchart/lex-empty-string-before-empty-description-block]
この仕様の字句解析器が参照の入力を、
入力の単位から空の形の単位を除いたものとして読み、
mermaid.js が参照の入力を受理するときは、
mermaid.js はそれに元の入力と同じ Db を与えます。
`A[""x]` は `A[x]` になり、`click A call ()cb` は `click A cb` になります。
[fixture: flowchart/tokens-empty-string-in-label] [fixture:
flowchart/gram-click-empty-call-before-callback]
そうでないときは、取り除いたことで、
形の両側にあったものがつながって別の単位になり、
mermaid.js は参照の入力を別に読むことがあります。
`style A "" fill:red` では、
空の文字列の前後の空白が 1 つの `space` の単位になり、
参照の入力のスタイルは、空白と `fill:red` ではなく `fill:red` です。
`A:""::c` では、`:` と `::` が `:::` になり、
参照の入力は、頂点 `A:::c` ではなく、クラス `c` を持つ頂点 `A` を持ちます。
`flowchart""TD` は `flowchartTD` になり、mermaid.js はそれを拒否します。
[fixture: flowchart/gram-style-empty-string-before-first-style] [fixture:
flowchart/lex-empty-string-splits-triple-colon] [fixture:
flowchart/header-empty-string-no-space]

## `comment-takes-character`

sequence では、図のコメントはその `%%` から始まり、
`%%` の前の文字は、字句解析器がそこで読むものに属します。
mermaid.js の字句解析器には、これと違う 2 つの規則があります
（[`sequenceDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/parser/sequenceDiagram.jison#L29-L30)）。
文の状態で、数と id の規則より先に、
`}` 以外の 1 文字と `%%` と行の残りを 1 つのコメントとして読む規則を試します。
また、数を読むのは、後に空白か改行が続くときだけです。
そのため、`%%` の直前の文字で規則が一致を始めるところでは、
mermaid.js はその文字を行の残りとともに失い、`%%` の直前の数は数になりません。
この仕様は、それらの規則の順番ではなく、構文の規則を直接書きます。
コメントはその印から始まり、数の後には `%%` が続いてかまいません
（[文の文脈](./diagrams/sequence.ja.md#文の文脈) を参照）。
`%%` が文字の直後にあるかは、ディレクティブを除いた図のテキストの上で決めます。
それが両方の字句解析器が読むテキストです。
`autonumber 1%%{init: {}}%%%% c0` では、`%%` は数 1 の直後にあります。
[fixture: sequence/div-comment-after-number-across-directive]

差は両方向にあります。
受理される sequence の fixture の各文字の後に `%% c` を差し込んだ、
42,541 件の入力を比べました。
そのうち 2,478 件が違い、3 つの種類に分かれます。

mermaid.js は受理し、この仕様は拒否する（入力のうち 604 件）:
文かその次の単位が始まるところにある、`%%` の直前の 1 文字の id、数字、`.`。
行に何が続いてもかまいません。
mermaid.js は行の残りをコメントとして読みます。
ここでは、`C%% c` と `p%% carticipant A` は id の並びで矢印のない文、
`1%% c` は文を始められない数で、`autonumber .%% c5` の `.` は数ではありません。
この仕様は、
並びが 1 文字のときに `%%` の前で id の並びを終える規則を持ちません。
id の並びの中の `%` は、長さによらず並びの文字で、
mermaid.js も `CD%% c` を id の並び `CD%% c` として読みます。
[fixture: sequence/div-comment-after-one-character-id] [fixture:
sequence/div-comment-after-one-digit-line] [fixture:
sequence/div-comment-after-first-letter-of-keyword] [fixture:
sequence/div-comment-after-dot-before-number]

mermaid.js は拒否し、この仕様は受理する（1,368 件）:
`Alice->>B%% cob: Hello` のように、
文が必要とする id の並びの 1 文字目の直後の `%%`
（mermaid.js はメッセージの宛先を失います）、
メッセージのテキストの前の `:` の直後の `%%`（mermaid.js は `:` を失います）、
2 文字以上の数の直後の `%%`（mermaid.js は id の並びとして読みます）。
ここでは、宛先は `B%% cob`、`A->>B:%% c` のメッセージは `%% c` で、
`autonumber 10%% c` と `autonumber .5%% c` は 10 と 0.5 から始まります。
[fixture: sequence/div-comment-after-id-run-first-character-target] [fixture:
sequence/div-comment-after-text-colon] [fixture:
sequence/div-comment-after-two-digit-number] [fixture:
sequence/div-comment-after-fraction-number]

両方が受理し、Db が違う（506 件）:
mermaid.js のコメントの後に残る行がなお受理される、
id の並びの 1 文字目の直後の `%%` と、
mermaid.js が失う、1 桁の数の直後の `%%`。
`A%% clice->>Bob: Hello` は、ここでは `A%% clice` からのメッセージで、
mermaid.js ではメッセージがありません。
`autonumber 5%% c` は、ここでは 5 から始まり、
mermaid.js では始まりを持ちません。
`autonumber 5 2%% c` の刻みは、ここでは 2、mermaid.js では 1 です。
[fixture: sequence/div-comment-after-id-run-first-character-line-start]
[fixture: sequence/lex-percent-comment-takes-number] [fixture:
sequence/div-comment-after-step-number]

`%%` の前の `;` や `)` のように、mermaid.js が失う文字が何も変えないところでは、
両方が同じ結果を与え、その入力は差ではありません。
`%%` の前の空白は、多くの場所で両方の読み方をそろえます。
`autonumber 10 %% c` はどちらでも 10 から始まり、
`A->>B: %% c` のメッセージはどちらでも `%% c` です。
ただし、id の並びの中では空白が残り、
`A %% clice->>Bob: Hello` はどちらでも `A %% clice` からのメッセージです。
[fixture: sequence/lex-comment-after-semicolon] [fixture:
sequence/lex-comment-after-invalid-unit] [fixture:
sequence/lex-space-before-comment-after-two-digit-number] [fixture:
sequence/lex-space-before-comment-after-text-colon] [fixture:
sequence/lex-space-before-comment-in-id-run]

差は、この 2 つの規則だけです。
字句解析器をこの 2 点だけ変えた mermaid.js、
つまり 1 文字と `%%` をコメントとして読む規則を持たず、
数が `%%` の前でも終わる mermaid.js は、
ほかの既知の差を除き、どの入力もこの仕様と同じく受理・拒否し、
受理した入力にはこの仕様と同じ Db を与えます。
主張はこう確かめます。
各入力を、字句解析器を変えた mermaid.js に掛け、
その結果をこの仕様の結果と比べます。
上の 42,541 件では、違いは [`embedded-data-opaque`](#embedded-data-opaque)
に当たる入力だけでした。
元の字句解析器の mermaid.js に掛ける入力では、これに代えられません。
その文の状態は、どの id の規則よりも先に、
1 文字と `%%` をコメントとして読むので、
メッセージの中のような、2 番目と 3 番目の文字が `%%` の id の並びを、
どの入力も mermaid.js に読ませられないからです。
