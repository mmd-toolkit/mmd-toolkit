# mindmap の Db を木から作る

英語版: [mindmap.md](./mindmap.md)

mindmap 図の木から Db の要約を作る手順です。
`src/db-from-tree/mindmap.ts`
がこれを実装します（[db-from-tree.ja.md](../db-from-tree.ja.md) を参照）。
構文と木は、
仕様の [diagrams/mindmap.ja.md](../../../spec/docs/diagrams/mindmap.ja.md) と、
[ast/mindmap.ja.md](../../../spec/docs/ast/mindmap.ja.md) が定めます。
要約の欄は [db-summaries.ja.md](../db-summaries.ja.md#mindmap) にあります。

mermaid.js は、構文解析の間に Db を作ります。
文法は、ノード、icon、 class のいずれかがある行ごとに Db のメソッドを呼びます。
出典は
[`statement`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/mindmap/parser/mindmap.jison#L99-L108)、
[`node`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/mindmap/parser/mindmap.jison#L112-L126)
です。
Db は、メソッドに渡されたものを保ちます。
出典は
[`addNode`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/mindmap/mindmapDb.ts#L75-L125)、
[`getParent`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/mindmap/mindmapDb.ts#L62-L69)、
[`getType`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/mindmap/mindmapDb.ts#L127-L145)、
[`decorateNode`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/mindmap/mindmapDb.ts#L154-L167)
です。
要約も同じように作りますが、1 つだけ違います。
Db は、ノードの親を、それより前に足したノードから探します。
木は、各ノードをすでに親の下に持っているので、
builder は探しません（**親**を参照）。
ノードは、Db が足す順に訪ねます。
ノードは、その下のノードより先です。
値は、空白を含めて Db が持つとおりに保ちます。
要約は `getMindmap()`
が返す木（[db-summaries.ja.md](../db-summaries.ja.md#mindmap) を参照）なので、
木の各ノードは、要約のノードを 1 つずつ作ります。

## 木から要約を作る

**変換した形。**
どの値も[変換した形](../../../spec/docs/common.ja.md#ソースの読み方)で読むので、
エンティティは、ノードのテキスト、形のテキスト、icon、
class のどれでもプレースホルダです。
`a#amp; b` は、`a`、プレースホルダ、` b` のノードのテキストです。
数値のエンティティには、それ専用のプレースホルダがあります。
同じ形では、各行終端（`\r\n` と単独の `\r` も）を `\n` として読みます。
これは文字列、マークダウン文字列、形のテキスト、icon の中でのことです。
各属性の引用符は `'` として読みます。
これはノードのテキスト、形のテキスト、icon、 class の中でのことです。
[fixture: mindmap/entity-placeholder-in-node-text]
[fixture: mindmap/entity-placeholder-numeric]
[fixture: mindmap/entity-placeholder-in-description]
[fixture: mindmap/entity-placeholder-in-icon]
[fixture: mindmap/entity-placeholder-in-class]
[fixture: mindmap/lex-string-crlf] [fixture: mindmap/lex-string-lone-cr]
[fixture: mindmap/lex-shape-text-crlf]
[fixture: mindmap/lex-markdown-string-crlf] [fixture: mindmap/lex-icon-crlf]
[fixture: mindmap/lex-html-attribute-quote-in-description]
[fixture: mindmap/lex-html-attribute-quote-in-node-text]
[fixture: mindmap/lex-html-attribute-quote-in-icon]
[fixture: mindmap/lex-html-attribute-quote-in-class]
[fixture: mindmap/db-crlf-line-ends] [fixture: mindmap/db-lone-cr-line-ends]

**テキスト。**
木の葉ノードのテキストは、次のように読みます。

- MindmapLiteral は、その範囲の変換した形を持ちます。
  `value` は木が持つ書かれたとおりのテキストで、
  Db が持つのは mermaid.js が読むとおりのテキストです。
  ノードのテキストは終わりの空白を保ち、形の前のノードのテキストも同じです。
  `a (x)` の id は `a ` です。
  icon と class は、両端の空白を保ちます。
  [fixture: mindmap/db-node-trailing-whitespace]
  [fixture: mindmap/gram-node-text-space-before-shape]
  [fixture: mindmap/db-icon-surrounding-whitespace]
  [fixture: mindmap/db-class-leading-whitespace]
  [fixture: mindmap/db-class-trailing-space]
- MindmapLabel は、その範囲の変換した形を持ちます。
  範囲は、文字列の区切り（両端の `"`）と、
  markdown 文字列の区切り（`` "` `` と `` `" ``）を含みます。
  builder は、区切りを変換した形から切り落とします。
  文字列は両端に 1 文字ずつ、markdown 文字列は 2 文字ずつです。
  そのため、区切りの中にあるディレクティブは、切り落とす位置を動かしません。
  テキストは空白と改行をすべて保ち、文字列は引用符の間にあるものを保ちます。
  [fixture: mindmap/db-shape-string] [fixture: mindmap/db-shape-markdown-string]
  [fixture: mindmap/docs-syntax-mindmap-d3468819]
  [fixture: mindmap/gram-shape-text-line-feed]
  [fixture: mindmap/gram-shape-text-quoted-with-space]
  [fixture: mindmap/lex-string-line-feed]
  [fixture: mindmap/lex-markdown-string-line-feed]
- ディレクティブがテキストの単位の中にあっても、変換した形にはないので、
  テキストにもありません。
  `a%%{init: {}}%%b` はノード `ab` で、
  `::icon(a%%{init: {}}%%b)` の icon は `ab`、
  `:::a%%{init: {}}%%b` の class は `ab` です。
  `a[x%%{init: {}}%%y]` と `a["x%%{init: {}}%%y"]` のテキストは `xy` です。
  ノードのテキストの終わりにあるディレクティブは、テキストの一部ではありません。
  [fixture: mindmap/lex-directive-in-node-text]
  [fixture: mindmap/lex-directive-in-icon]
  [fixture: mindmap/lex-directive-in-class]
  [fixture: mindmap/lex-directive-in-shape-text]
  [fixture: mindmap/lex-directive-in-string]
  [fixture: mindmap/lex-directive-between-quote-and-backquote]
  [fixture: mindmap/lex-directive-between-backquote-and-quote]
  [fixture: mindmap/lex-directive-after-node-text-trailing-spaces]
  [fixture: mindmap/lex-directive-in-icon-with-spaces]
  [fixture: mindmap/lex-directive-in-shape-text-with-spaces]
  [fixture: mindmap/db-directive-after-node-text]
- 行規則が無視する `;` も、テキストの中では変換した形にありません。
  `style:#x;y` はノード `style:#xy` で、
  `a[style:#x;y]` のテキストは `style:#xy` です。
  [fixture: mindmap/tokens-ignored-semicolon-in-node-text]
  [fixture: mindmap/tokens-ignored-semicolon-in-shape-text]

**根。**
要約の欄は `root` の 1 つです。
ノードのない図では `null` で、
ヘッダーの後ろに空白やコメント行が続くときも同じです。
そうでなければ、木の根の要約です。
フロントマターは何も変えず、この図はタイトルを持ちません。
[fixture: mindmap/db-header-only]
[fixture: mindmap/db-header-only-trailing-spaces]
[fixture: mindmap/db-header-then-comment-line-only]
[fixture: mindmap/db-frontmatter-before-header]

**親。**
Db はノードを出現順に足し、ノードを、
それより前にあって level が小さい最も近いノードに渡します。
そのため、前のノードと同じ字下げのノードは、
そのノードの下にあるノードの後ろに続きます。
木は、各ノードを、 Db が選ぶノードの子として持ちます。
[字下げと親](../../../spec/docs/diagrams/mindmap.ja.md#字下げと親) を参照。
builder は、ノードの子を level を比べずに木から、出現順に取ります。
同じテキストの 2 つのノードは、 2 つのノードです。
[fixture: mindmap/db-indent-parent-is-nearest-shallower]
[fixture: mindmap/db-indent-sibling-after-deeper]
[fixture: mindmap/gram-indent-between-earlier-levels]
[fixture: mindmap/db-same-text-twice] [fixture: mindmap/demo-mindmap-34332335]

**level。**
ノードの `level` は、その `indent` から根の `indent` を引いたものです。
そのため、根の level は字下げにかかわらず 0 で、ヘッダーと同じ行にあるノードは、
ヘッダーの後ろの空白を字下げとして持つ根です。
木は、空白文字を 1 文字ずつ数えています。
[ast/mindmap.ja.md](../../../spec/docs/ast/mindmap.ja.md#mindmapnode) を参照。
タブも U+3000 も 1 文字です。
子は、親より何文字多く字下げしてもかまいません。
子の level は、その文字数に親の level を足したものです。
[fixture: mindmap/db-first-node-unindented]
[fixture: mindmap/db-indent-root-offset]
[fixture: mindmap/db-first-node-on-header-line]
[fixture: mindmap/db-first-node-on-header-line-wide-gap]
[fixture: mindmap/db-first-node-after-header-tab]
[fixture: mindmap/db-indent-tab-levels]
[fixture: mindmap/db-indent-fullwidth-space]
[fixture: mindmap/db-indent-skips-levels]
[fixture: mindmap/lex-indent-around-directive]

**ノードのテキスト。**
`nodeId` と `descr` は、ノードの `id` と `shape` から作ります。
形のないノードは、ノードのテキストを両方に持ちます。
ノードのテキストと形があるノードは、ノードのテキストを `nodeId` に、
ラベルのテキストを `descr` に持ちます。
形だけのノードは、ラベルのテキストを両方に持ちます。
[fixture: mindmap/db-first-node-unindented] [fixture: mindmap/db-shape-rect]
[fixture: mindmap/db-shape-without-id]
[fixture: mindmap/db-shape-without-id-circle]
[fixture: mindmap/gram-shape-dash-opener-without-id]

**type。**
形のないノードの `type` は 0 です。
形があるときは、opener から決まります。
`[` は 2、`((` は 3、`)` は 4、`))` は 5、`{{` は 6、`(-` と `-)` は 0 です。
`(` は closer からも決まり、`)` なら 1、それ以外の closer なら 4 です。
ほかの opener では closer は何も決めないので、 `[text)` は 2、
`((x)` は 3 です。 [fixture: mindmap/db-shape-rect]
[fixture: mindmap/db-shape-rounded] [fixture: mindmap/db-shape-circle]
[fixture: mindmap/db-shape-cloud] [fixture: mindmap/db-shape-bang]
[fixture: mindmap/db-shape-hexagon] [fixture: mindmap/db-shape-cloud-dash-form]
[fixture: mindmap/db-shape-explode-dash-form]
[fixture: mindmap/db-shape-mismatched-end]
[fixture: mindmap/gram-shape-round-other-closer]
[fixture: mindmap/gram-shape-round-double-closer]
[fixture: mindmap/gram-shape-circle-single-closer]
[fixture: mindmap/gram-strings-in-round-and-circle]
[fixture: mindmap/db-shape-round-open-circle-close]
[fixture: mindmap/db-shape-round-open-brace-close]
[fixture: mindmap/db-shape-round-string-dash-close]
[fixture: mindmap/db-shape-cloud-open-rect-close]
[fixture: mindmap/db-shape-bang-open-rect-close]
[fixture: mindmap/db-shape-hexagon-open-rect-close]
[fixture: mindmap/db-shape-dash-open-rect-close]
[fixture: mindmap/db-shape-id-ending-dash-then-cloud-rect-close]

**装飾。**
ノードの `decorations` にある icon の行と class の行は、
Db がそのノードに渡す行です。
Db は、それらを最後に足したノードに渡します。
`icon` は最後の icon の行のテキスト、`class` は最後の class の行のテキストで、
同じ種類の 2 行目は 1 行目を置き換えます。
そのような行のないノードは、要約に `icon` も `class` も持ちません。
icon の行と class の行は互いに独立で、
単語 `icon` の大文字小文字は関係ありません。 [fixture: mindmap/db-icon-line]
[fixture: mindmap/db-class-line] [fixture: mindmap/db-icon-twice]
[fixture: mindmap/db-class-twice] [fixture: mindmap/db-icon-and-class-on-child]
[fixture: mindmap/db-icon-indent-ignored]
[fixture: mindmap/gram-icon-then-child]
[fixture: mindmap/db-icon-case-insensitive]
[fixture: mindmap/db-class-then-icon-on-node]

**要約。**
要約のノードは、`nodeId`、`level`、`descr`、`type`、`children` を持ち、
装飾があるときは `icon` と `class` を持ちます。
[db-summaries.ja.md](../db-summaries.ja.md#mindmap) のとおりです。

## 文字の置き換え

Db が `sanitizeText` に通すノードのテキストは 4 つで、 id、説明、icon、
class です。
`mindmapDbOf()` は、
[db-from-tree.ja.md](../db-from-tree.ja.md#文字の置き換え)の置き換え
`textReplacementOf(embedded.config)` を、これらのテキストに適用します。
要約のテキストは、これですべてです。
形のないノードと形だけのノードは、`nodeId` と `descr` に同じテキストを持ち、
それぞれに 1 回ずつ置き換えます。
[fixture: mindmap/config-security-level-other-texts]
[fixture: mindmap/config-security-level-other-html-labels-false]
[fixture: mindmap/config-security-level-other-shape-only]
