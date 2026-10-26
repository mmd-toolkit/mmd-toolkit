# パーサーのテスト

英語版: [testing.md](./testing.md)

テストは `tests/` にあります。
パーサーを、[`@mmd-toolkit/tests`](../../tests) の fixture に照らして、
確かめます。
パーサーがすべきことは、仕様と fixture が述べます。
記録した木が仕様の条件を保つか、mermaid.js の Db を与えるかは、
コーパスの確かめで、`@mmd-toolkit/tests` が記録した木に行います。
パーサーのテストは、パーサーがその木を与えることを確かめ、
mermaid.js も生成した入力も動かしません。
コーパスに欠けている場合は、それを定める仕様かパーサーの文書の文とともに、
fixture としてコーパスに足します。

## fixture

`tests/fixtures.test.ts` は、`common/`、`flowchart/`、`sequence/`、
`class/`、`state/`、`er/`、`gantt/`、`journey/`、`requirement/`、`mindmap/`、
`timeline/`、`sankey/`、`xychart/`、`quadrant/`、`block/`、`kanban/`、`c4/`、
`venn/`、`ishikawa/`、`agentflow/`、`usecase/`、`gitgraph/`、`pie/` の、
すべての fixture を parse し、
次を確かめます。

- パースの結果が、fixture がパーサーのために記録したものと同じであること
  （[記録したパースの結果](#記録したパースの結果)を参照）。
- 受理・拒否と図種が、fixture が記録した mermaid.js のものと、
  fixture の `knownDivergence` の印が求めるとおりに合うこと。
  印がなければ mermaid.js の結果、印があれば仕様の結果です。

ここでは木も Db も確かめません。
`@mmd-toolkit/tests` が、記録した各木を確かめ
（`check-tree-corpus.test.ts`。[木の検査](#木の検査)を参照）、
その木から Db を組んで、fixture が記録した Db と比べます
（`db-from-tree.test.ts`）。

kanban の fixture は `tests/kanban.test.ts` が検査します。
全 2,870 入力について、宣言された差異と、存在すれば `specified.json` を適用し、
記録された受理判定と比べます。
受理した木では、トークンとコメントによる文字被覆と、
トークンの正確なテキストも検査します。
共通の kanban 検出 fixture を含む解析結果の記録は、
`tests/fixtures.test.ts` が比べます。

C4 の fixture は `tests/c4.test.ts` が検査します。
コーパスの各入力について、宣言された差異と、
存在すれば `specified.json` を適用し、
記録された受理判定と比べます。
受理した木では、トークンとコメントによる文字被覆、
正確なトークンのテキスト、子ノードの包含とソース順も検査します。
`tests/fixtures.test.ts` は、`c4/` の外にある C4 検出 fixture も含めて、
解析結果の記録を比べます。
`tests/ast-c4-examples.test.ts` は、
型のコメントの例の範囲と木の不変条件を検査します。

venn の fixture は `tests/venn.test.ts` が検査します。
各入力に宣言された差異と、存在すれば `specified.json` を適用し、
仕様の受理判定と比べます。
受理した木では、トークンとコメントによる文字被覆、正確なトークンのテキスト、
リテラルの raw、子ノードの包含とソース順を検査します。
`tests/fixtures.test.ts` は、共通の venn 検出 fixture も含めて、
解析結果の記録を比べます。
`tests/ast-venn-examples.test.ts` は型のコメントの例の範囲を検査します。

Ishikawa の fixture は `tests/ishikawa.test.ts` が検査し、記録します。
各入力を、仕様の受理判定と宣言された差異に照らして比べます。
受理した木では、トークンとコメントによる文字被覆、
正確なトークンのテキスト、子ノードの包含とソース順を検査します。
`tests/fixtures.test.ts` も、共通の Ishikawa 検出 fixture を含む記録を比べます。
`tests/ast-ishikawa-examples.test.ts` は型のコメントの例の範囲を検査します。
tests パッケージの `checkTree` と `dbFromTree` が、
記録された木とその Db の内容を検査します。

`tests/architecture.test.ts` はコーパスを使い、木の構造、token の綴り・範囲、
gap の所有、比較可能な Db を検査します。
受理と記録は `tests/fixtures.test.ts` が
関連 common fixture も含めて検査します。
`tests/ast-architecture-examples.test.ts` は
ノード型コメントの例の範囲を検査します。

## 既知の差異

[既知の差異](../../spec/docs/known-divergences.ja.md)が付いた fixture は、
パーサー自身の字句解析器で、その差異の形を持つことも確かめます。
一方向の差異では、その形を除いた参照入力でも確かめます。
両方向の差異では、仕様どおりの読みがコーパスに記録されていて
（`specified.json`。`expected.json` と違うときに置かれます）、
パーサーの受理・拒否と図種をそれと比べ、
コーパスが、記録した木から組んだ Db とそれを比べます。

共通の fixture ループは、対応するすべての図種で
`tests/helpers/divergence-form.ts` の expectDivergenceForm を呼びます。
この関数が拒否する形、トークンを切る形の参照の読み、
フロントマターの属性の引用符、読み過ごす % だけの行、
ヘッダーの後の C4 キーワードを確かめ、
agentflow、gitgraph、info、Ishikawa、pie、usecase、venn のテストは、
このループでの検査を共有します。
[fixture: gitgraph/div-directive-in-commit]
[fixture: gitgraph/div-frontmatter-cross-string-enable]
[fixture: usecase/div-comment-preheader-bare]
[fixture: venn/div-c4-bare-identifier]

- `directive-as-token-boundary`:
  ディレクティブを取り除き、行の規則が無視する各 `;` を
  その行の区切りの終わりへ移した入力をパーサーが読み
  （[参照入力](#参照入力) を参照）、
  元の入力に対する mermaid.js の結果と、受理・拒否、図種、Db が一致すること。
  Db は、`@mmd-toolkit/tests` が記録した木から組むのと同じに
  （`dbFromTree`）、パーサーの木から、fixture が記録した埋め込みの値で組みます。
- `ignored-semicolon-as-token-boundary`:
  同じ参照入力をパーサーが読み、
  元の入力に対する mermaid.js の結果と、上と同じく一致すること。
  行の規則が無視する `;` は、パーサーの行の規則から求めます。
- `click-reserved-word`: パーサーが入力を拒否すること。
  参照入力の 3 つの条件が成り立つところでは
  （[参照入力](#参照入力) を参照）、
  参照入力に対するパーサーの結果が、
  元の入力に対する mermaid.js の結果と、上と同じく一致すること。
  どの `click` がクリックの文を始めるかは、パーサーの単位から求めます。
- `tokenless-empty-forms`: パーサーが入力を拒否すること。
  パーサーの字句解析器が参照入力を、
  空の形のもの以外の入力の単位として読み、
  パーサーが参照入力を受理するところでは
  （[参照入力](#参照入力) を参照）、
  参照入力に対するパーサーの結果が、
  元の入力に対する mermaid.js の結果と、上と同じく一致すること。
- `headerless-empty-ending`:
  パーサーが、ヘッダーがないことでクラス図を拒否すること。
  ヘッダーがないことは、パーサーの字句解析器が決める。
- `comment-takes-character`: 入力が、ディレクティブの外に、
  `number` の単位の直後か、
  シーケンス図の字句解析器が文の文脈で規則の一致を始める、
  空白でない文字の直後にある `%%` を持つこと。
  直後かどうかは図のテキストの上で決め、
  単位も、規則が一致を始める位置も、パーサーの字句解析器から取ります。
  Gantt チャートでは、`}` と空白以外の、単位の 1 文字目の直後に `%` があること。
  journey 図と timeline では、そこに `%%` があること。
  パーサーの単位と図のテキストから見つけます。
- `comment-takes-line-break`: 入力が、
  行の中で単位の後にある図のコメントを持つクラス図であること。
  そのコメントは、パーサーの字句解析器と単位から求めます。
  Gantt チャートでは、
  mermaid.js が直接たどり着く、印が `%` のコメントを持つこと。
  直接たどり着くかどうかは
  [コメント](../../spec/docs/diagrams/gantt.ja.md#コメント) の定めのとおりで、
  パーサーの単位、コメント、図のテキストから求めます。
  `newline` 単位の改行は、`%` の前の空白として数えます。
  C4 では、後続の改行をコメントの外に残す図のコメントを持つこと。
  そのコメントは、パーサーの字句解析器から求めます。
- `percent-brace-after-unit`: 入力が、ディレクティブを始めない `%%{` で、
  mermaid.js が直接たどり着くものを持つ Gantt チャートであること。
  同じように求めます。
- `blank-line-after-header-or-comments`: 入力が、ヘッダーの後か 2 つの文の間に、
  差異の 4 つの場合のどれかの空行と図のコメントを持つ、
  mindmap、kanban 図、Ishikawa 図のいずれかであること。
  パーサーの単位と図のコメントの行から求めます。
  `newline` 単位は行を終え、n 個の改行の単位は n 行を終えます。
  文字のない単位は、U+2028 や U+2029 で終わる図のコメントの行を終えます。
- `name-start-reads-unit`: 入力が、テキストが `"`、
  `~`（バッククォートの名前のとき）、`<<`、`>>`、
  差異が挙げるキーワードのどれかで始まる、
  バッククォートの名前かジェネリクスの型を持つクラス図であること。
  それは、パーサーの `backquoted` と `generic-text` の単位から求めます。
- `html-tag-in-frontmatter`: フロントマターで始まるタグが、
  mermaid.js が `'` として読む `"` を変えること。
  それは、パーサーのフロントマターと属性の引用符の読み方から求めます。
- `c4-keyword-anywhere`: パーサーが C4 以外の図種を検出し、
  検出点からの図のテキストが、
  mermaid.js がどこでも探す 4 つのキーワードのどれかを含むこと。
  図のテキストは、パーサーの字句解析器が、
  ディレクティブとコメント領域を除いて読みます。
- `bare-percent-line-before-header`: パーサーの検出が、
  ヘッダーの前で `%%` だけの行を読んで通り過ぎること。

`embedded-data-opaque` の印の付いた fixture では、中身を確かめません。
パーサーは埋め込みのデータを読まないためです。
gitgraph では、埋め込みの設定により受理判定がどちらの方向にも変わるため、
指定の読みで判定します。
[fixture: gitgraph/docs-community-contributing-05cdc44b]
[fixture: gitgraph/div-frontmatter-main-branch-checkout-default-accepted]

### 参照入力

参照入力は、パーサーが見つけた差異の形を、入力から除くか置き換えたものです。
差異によっては、コメント領域やほかの形も除きます。
`directive-as-token-boundary` と `ignored-semicolon-as-token-boundary` の
参照入力の作り方と比べ方は上の一覧にあり、
ほかの差異のものは下の段落にあります。
入力と参照入力をまたいでパーサーと mermaid.js が一致するなら、
入力そのものの違いは、その形で説明できます。
`click-reserved-word` と `tokenless-empty-forms` では、
除くことで、除いたテキストのまわりのものも変わりうるので、
参照入力を比べるのは、下の条件が成り立つところだけです。
比べる検査が空回りしないよう、テストは、
印のある fixture の半分より多くで、参照入力を比べることを求めます。

`click-reserved-word` の参照入力は、入力から、コメント領域と、
空の形（下の `tokenless-empty-forms` を参照）を除き、
クリックの文を始めない `click` の単位のそれぞれについて、
語 `click`、その後の空白、
そして字句解析器が入ったクリックの文脈を出るときの空白 1 文字（あれば）を
除いたものです。
比べるのは、3 つの条件が成り立つところです。
パーサーが参照入力を受理すること。
パーサーの字句解析器が、参照入力を、除いたもの以外の入力の単位として読むこと。
ただし、それらの `click` の単位のクリックの文脈が読むクリックの id と
`click-comma` の単位は除き、そのテキストは、
それぞれと同じ場所で始まり終わるほかの単位として読んでもかまいません。
そして、それらのクリックの id のテキストが、
参照入力の木の 1 つの葉ノードの範囲に収まること。
`A:click "" b-->C` は `A:b-->C` になり、
どちらでも頂点 `A:b` と、C へのその辺を持ちます。
`subgraph click me` の後に空の行が続くものは `subgraph me` になり、
どちらでも id `me` を持ちます。
[fixture: flowchart/db-vertex-id-bare-click] [fixture:
flowchart/db-subgraph-id-click-blank-line]
そうでなければ、除くことで両側にあるものがつながるか、
クリックの id のテキストが、文の文脈が別に読む場所に置かれ、
mermaid.js が参照入力を別に読むことがあります。
同じ Db を与えるつなぎもあります。
`subgraph click me`、改行、`A` は `subgraph meA` になり、
どちらでも id `meA` を持ちます。
mermaid.js が、クリックの id と次の行を同じようにつなぐからです。
そうでないものもあります。
`subgraph click m;e` では、クリックの id の `;` が、
参照入力 `subgraph m;e` で区切りになり、id は `m;e` でなく `m` です。
`subgraph click a,b` では、`,` が `,` の単位になり、名前はそれを取らないので、
mermaid.js は `subgraph a,b` を拒否します。
[fixture: flowchart/gram-subgraph-name-click] [fixture:
flowchart/gram-subgraph-name-click-semicolon-in-id] [fixture:
flowchart/gram-subgraph-name-click-comma]

`tokenless-empty-forms` の参照入力は、
入力から、コメント領域と空の形を除いたものです。
空の形とは、それぞれの空の文字列、`call` から `)` までのそれぞれの空の呼び出し、
文でない空の説明ブロックの `accDescr` から `}` まで、
クラス図では、それぞれの空のバッククォートの名前と空のジェネリクスの型、
ER 図では、それぞれの `empty-backquotes` 単位です。
ER 図の空のバッククォートは、どこにあっても mermaid.js は何も読みません。
空の説明ブロックが文でないのは、
文の始まりでも、文やヘッダーの区切りの前でもない、文の中にあり、
state の文の `textBeforeBody` が持たないときです。
文を区切るもののない ER 図では、ブロックが文の中にあるのは、
前の文が終わっていないときです。
濃度、線、`:`、`:::`、`,`、`[` の後と、
`class` の文の最初の名前の並びの中がそれです。
ブロックの後の単位がその文を続けるときもそうです。
濃度、`:::`、`{`、`[`、`:`、`,` がそれです。
[fixture: er/div-empty-description-block-in-relationship]
[fixture: er/div-empty-description-block-in-class]
[fixture: er/gram-empty-description-block-between-names]
Gantt チャートでは、空の href
（`href` と、間に何もない 2 つの `"`）も空の形です。
空の call と同じく、どこにあっても mermaid.js は何も読みません。
そこでは文を区切るものがなく、
空の説明ブロックが文の中にあるのは click の文の中だけです。
それは、id と最初の部分の間と、2 つの部分の間で、
空の形の後の単位が 2 つ目の部分を始めるときです。
[fixture: gantt/div-empty-href-before-call]
[fixture: gantt/div-empty-description-block-between-href-and-call]
[fixture: gantt/gram-empty-href-line]
[fixture: gantt/gram-click-href-then-empty-href]
要求図では、flowchart と同じく、空の文字列はどこにあっても空の形です。
そこでは文を区切るものがありません。
空の説明ブロックが文の中にあるのは、前の文の単位がその後に続くところです。
1 つは、その文がまだ終わっていないところです。
まだ続きが要る単位、つまり要求の種類、`element`、`:::`、`,`、欄のキーワード、
`:`、矢印、関係の後と、
文にまだ続きが要る名前の後です。
その名前は、要求や要素の名前と、その `:::` の後のクラス、
関係やクラスの略記の文を始める名前、`class` の文の最初の並びの名前、
`style` や `classDef` の後の名前です。
もう 1 つは、クラスの略記の文のクラスや、
`class` の文の 2 つ目の並びのクラスの後で、
ブロックの後の単位が `,` のところです。
スタイルは style の文脈を出る改行で終わるので、その後のブロックは文です。
要求や要素の本文の行では、ブロックは本文の項目です。
[fixture: requirement/div-empty-string-line]
[fixture: requirement/div-empty-description-block-in-relationship]
[fixture: requirement/div-empty-description-block-after-string-class]
[fixture: requirement/div-empty-description-block-before-shorthand-separator]
[fixture: requirement/div-empty-description-block-before-class-next-line]
[fixture: requirement/div-empty-description-block-before-shorthand-class-comma]
[fixture: requirement/div-empty-description-block-before-class-comma-next-line]
[fixture: requirement/gram-empty-description-block-after-shorthand-string-class]
[fixture: requirement/gram-empty-description-block-after-class-string-next-line]
[fixture: requirement/gram-empty-description-block-after-style-line]
[fixture: requirement/gram-empty-description-block-in-body]
mindmap では、空の文字列、空の markdown 文字列、
空の icon（`::icon(` 単位のすぐ後に `)` 単位が続くもの）、
空の class の行（後に `class-text` 単位が続かない `:::` 単位）が、
どこにあっても空の形です。
この図種には空の説明ブロックはありません。
[fixture: mindmap/div-empty-string-in-shape]
[fixture: mindmap/div-empty-markdown-string-in-shape]
[fixture: mindmap/div-empty-icon-before-root]
[fixture: mindmap/div-empty-class-before-root]
ブロックが文かどうかは、その前の、除く空の形を除いて決めます。
間に空白しかない、続けて書いたブロックは、
最後のブロックの後に続くものでまとめて決めます。
`""accDescr {}` に改行と `A` が続くものでは、
空の文字列を除くとブロックが文を始めるので、ブロックは参照入力に残ります。
[fixture: flowchart/lex-empty-string-before-empty-description-block]
クラス図の同じ行の `direction` とその値の間の 1 つ以上のブロックでは、
参照入力はブロックのまわりの空白も除き、`direction` と値を 1 つの語にします。
mermaid.js が 2 つの名前の部分をつなぐのと同じです。
`direction accDescr {} LR` の参照入力は `directionLR` で、
`direction accDescr {}accDescr {}LR` も同じです。
[fixture: class/div-empty-description-block-between-direction-and-value]
[fixture: class/div-empty-description-blocks-between-direction-and-value]

比べるのは、パーサーの字句解析器が、
参照入力を、空の形の単位以外の入力の単位として読み、
パーサーが参照入力を受理するところです。
`A[""x]` は `A[x]` になり、`click A call ()cb` は `click A cb` になります。
[fixture: flowchart/tokens-empty-string-in-label] [fixture:
flowchart/gram-click-empty-call-before-callback]
そうでなければ、除くことで形の両側にあるものがほかの単位につながり、
mermaid.js が参照入力を別に読むことがあります。
`style A "" fill:red` では、
空の文字列の前と後の空白が 1 つの `space` の単位になるので、
参照入力のスタイルは、空白と `fill:red` ではなく `fill:red` です。
`A:""::c` では、`:` と `::` が `:::` になるので、
参照入力は、頂点 `A:::c` ではなく、クラス `c` を持つ頂点 `A` を持ちます。
`flowchart""TD` は `flowchartTD` になり、mermaid.js はそれを拒否します。
[fixture: flowchart/gram-style-empty-string-before-first-style]
[fixture: flowchart/lex-empty-string-splits-triple-colon] [fixture:
flowchart/header-empty-string-no-space]

2 つの差異は 1 つの参照入力を共有します。
そのため、
flowchart の `A[style:#x];cl%%{init: {}}%%ick B;b call cb()` のように、
両方の形を持つ入力も、それぞれについて判定できます。
まずディレクティブを除き、次に行の規則が無視する各 `;` を、
その行の区切りの終わりへ移します。
そこでもその区切りの最後の `;` なので、行の規則はやはりそれを無視し、
それは区切りのテキストの後にあって、どのトークンにも入りません。
mermaid.js と仕様は、2 つの入力で同じ図のテキストを読みます。

`html-tag-in-frontmatter` は両方向の差異なので、
fixture には参照入力が要りません。

## 木の検査

[不変条件](./positions.ja.md#不変条件)と、
各図種の文書が木について述べることは、
`@mmd-toolkit/tests` が確かめます（`checkTree`）。
それは、木が破る条件を一覧にします。
コーパスの記録したすべての木を確かめ、
パーサーのテストも、自分の入力の木にそれを使い
（`tests/helpers/tree-problems.ts`）、一覧が空であることを求めます。

子の欄の順は、パーサー自身のものです。
`visitorKeys` の順に子の欄をたどる道具は、子のノードにソースの順で出会います。
ただし、開く矢印とラベルを持つ FlowchartLink では、
ラベルは矢印より前に書かれ、矢印より後にたどられます。
call より前にリンクが書かれた GanttClickStatement でも、
リンクは call より後にたどられます。
[fixture: gantt/gram-click-href-then-call]
`tests/traverse.test.ts` が、パーサーが受理するすべての fixture の木で
これを確かめ、子のノードの順が崩れた木が通らないことも確かめます。

## 記録したパースの結果

すべての fixture について、`parse()` の結果を、fixture の入力と並べて
`packages/tests/fixtures/<diagram>/<fixture 名>/` に記録します。
`tests/fixtures.test.ts` が、結果をそれと比べます。

- パーサーが受理する入力では、`ast.json` に木を置きます。
  中身は、位置を含めた `JSON.stringify(root, null, 2)` です。
- パーサーが拒否する入力では、`parse-error.json` に、
  `ParseError` の `message`、`range`、`loc` を置きます
  （`index` は `range` の始まりです）。
  パーサーが拒否を報告する位置の記録です。
  既知の差異では原因の形
  （[`error-positions.md`](./error-positions.ja.md) を参照）、
  mermaid.js も拒否する入力では、一般の規則が決める位置です。
  拒否も木と同じだけ記録され、
  報告する位置が変わればファイルの変化として現れます。
- fixture は 2 つのうちどちらか一方を持ちます。
  図種にまだ対応していないときは、どちらも持ちません。
  両方を持つ fixture がないことを、ファイルだけを見るテストで確かめます。
- どの木やエラーが変わっても、そのファイルの変化として現れます。
  `packages/parser` で `pnpm run test:update` を走らせると、
  fixture のテストだけを `-u` 付きで走らせ、ファイルを書き直します。
- `ast.json` と `parse-error.json` が取り残されていないことを、
  テストで確かめます。
  入力のないフォルダにあるものと、
  もう一方のファイルがあるべきところにあるものです。

### fixture を足した後

`@mmd-toolkit/tests` が足した fixture には、
パーサーのテストを走らせるまで、どちらのファイルもありません。
CI の外では、fixture のテストが足りないファイルを書いて通ります。
CI（`CI` が設定されている）では、ファイルがないとテストが失敗します。

そのため、fixture を足した人は次のようにします。

1. `packages/parser` で、fixture のテストを 1 回走らせる。
   `pnpm run test tests/fixtures.test.ts` である。
2. 新しい `ast.json` と `parse-error.json` を読み、
   木とエラーが仕様どおりであることを確かめる。
3. `packages/tests` で、記録した木へのコーパスの確かめを回す。
   `npx vitest run tests/check-tree-corpus.test.ts tests/db-from-tree.test.ts`
   である。
   パーサーのテストは、記録した木がどうであっても通るので、
   条件を破る木や別の Db を与える木は、これでしか分からない。
4. fixture と一緒にコミットする。

fixture を改名・削除するときは、古いファイルも一緒に動かすか消します。
取り残されたものは、取り残しを探すテストが名前を挙げます。

## そのほかのテスト

- ノード型のコメントにある例を、すべて parse します。
  コメントは `src/ast/flowchart.ts`、`src/ast/sequence.ts`、
  `src/ast/class.ts`、`src/ast/state.ts` にあります。
  `^` が示す範囲を、ノードの範囲と比べます。
- README の「使い方」の例を parse し、示している値と木を結果と比べます。
- 単体テストが、`common.md` の各規則、検出器の表、
  `visitorKeys`（子の欄の順も。[木の検査](#木の検査)を参照）と
  `traverseNodes`、flowchart の木とそのトークン、
  シーケンス図とクラス図と状態図の木とそのトークンと文法の外の拒否を扱います。

agentflow の fixture は `tests/agentflow.test.ts` が検査し、記録します。
受理結果は expected.json、または宣言された差異の specified.json
の読みに従います。
文字の被覆、トークン境界、raw の綴り、子の包含とソース順序を検査します。
Name、コメント、見出し、矢印、メタデータ、click 接頭辞の構造も検査します。
サイト設定の maxEdges による受理結果は、flowchart と同様に parse()
と別に検査します。
`tests/ast-agentflow-examples.test.ts` は全ノードのコメントの例を検査します。
`tests/fixtures.test.ts` も同じ記録を比較します。

usecase の fixture は `tests/usecase.test.ts` が検査し、記録します。
specified.json を優先し、指定の読みがない差異の fixture は拒否しますが、
embedded-data-opaque は受理します。
受理判定、文字被覆、トークンと raw の元の綴り、ノード境界、
子の包含とソース順を確かめます。
受理した木はすべて、コーパスの木の検査器でも確かめます。
構造の検査はネイティブ metadata、一重引用符、CSS の余白、
矢印の半分、不透明な JSON を扱います。
`tests/ast-usecase-examples.test.ts` は、26 ノードのコメント例を検査します。
木の検査器と Db builder は tests パッケージが提供し、
コーパスの比較は別に行います。

pie の fixture は `tests/pie.test.ts` が検査し、記録します。
specified.json を優先し、不透明データの乖離は受理し、
ほかの指定読みがない乖離 fixture は拒否します。
受理した木で、ソースの被覆、トークンと raw の綴り、ノード境界、
子の包含関係とソース順を検査します。
記録した Db を `dbFromTree` と直接比較します。
不可分な境界の参照入力も、元の expected Db と比較します。
構造の検査は隠し形式の所有先、共通値の余白と null、
両方の引用符、double 変換を扱います。
`tests/ast-pie-examples.test.ts` は、8 ノードのコメント例を検査します。

info と common の info 検出の fixture は、`tests/info.test.ts` が検査し、
記録します。
`fixtureAccepts` を使い、指定読みがあれば優先します。
受理した木では、文字の被覆、トークンの原文、節点の境界、親子の包含、
ソース順を検査します。
比較可能な Db は `dbFromTree` と `embeddedValuesOf` で照合し、
不透明な場合も明示します。
共通の fixture ループが、宣言された不可分な形式の分断を、
参照のトークン内で独立して検出し、参照入力も元の期待 Db と照合します。
[fixture: info/div-directive-flag-middle]
構造の検査は隠し形式の全所有先、見える EOL、空白、null、繰り返し、
記述された引用符付きテキストを対象にします。
`tests/ast-info-examples.test.ts` は 7 節点のコメント例を検査します。
[fixture: info/lex-flag-hidden-two] [fixture: info/lex-hidden-without-flag]
[fixture: info/lex-hidden-tail-two]
[fixture: info/lex-hidden-after-visible-eol] [fixture: info/title-tabs]
[fixture: info/lex-title-one-tab] [fixture: info/accdescr-line-repeat]
[fixture: info/title-open-quote] [fixture: info/div-frontmatter-invalid-yaml]
[fixture: info/div-selected-showinfo] [fixture: common/detect-minimal-info]

gitgraph と common の検出 fixture は、
`tests/gitgraph.test.ts` が検査し、記録します。
受理は fixtureAccepts で決め、比較 Db は
dbFromTree と embeddedValuesOf で求め、
受理された不透明な読みは明示的に扱います。
受理した木では、網羅・トークンと raw の綴り・包含・ソース順・境界を検査します。
共通の fixture ループが、不可分な項目の差異を、
参照のトークンと読みで独立して検査します。
[fixture: gitgraph/gram-all-fields]
[fixture: gitgraph/div-directive-in-commit]
[fixture: gitgraph/div-frontmatter-invalid-yaml]
[fixture: common/detect-minimal-git-graph]

記録は、既定の parse(text) の結果です。
outcomeOf は同じソース解析に fixture.config のサイト設定だけを適用し、
受理判定の両方向を扱います。
[fixture: gitgraph/config-main-branch]
[fixture: gitgraph/config-gitgraph-html-false]
フロントマターの config と init ディレクティブの引数は不透明なままで、
受理判定の初期ブランチと escaping の既定値を変えません。
したがって次の 2 fixture は、既定の checkout エラーの記録を保ち、
指定された拒否の読みと比べます。
[fixture: gitgraph/docs-community-contributing-05cdc44b]
[fixture: gitgraph/docs-syntax-gitgraph-2ea99686]

逆に、不透明な埋め込みの設定により mermaid.js が拒否する履歴でも、
既定で受理されるものは木を保ちます。
指定の読みが Db 比較の値を与えます。
[fixture: gitgraph/div-frontmatter-main-branch-checkout-default-accepted]
[fixture: gitgraph/div-frontmatter-main-branch-duplicate-default-accepted]
[fixture: gitgraph/div-init-main-branch-duplicate-default-accepted]

`tests/ast-gitgraph-examples.test.ts` は、18 ノードのコメント例を検査します。

packet の fixture 記録と受理判定は tests/fixtures.test.ts だけが検査し、
fixtureAccepts と outcomeOf の外部サイト設定を使います。
サイトの幅が木を拒否しても、デフォルト記録は parse(text) の結果を保持します。
[fixture: packet/config-fraction-reject]
[fixture: packet/config-frontmatter-overrides-site]
tests/packet.test.ts の単体テストはソースの被覆、トークンと raw の表記、
ノード境界、包含、ソース順、記述されたブロック形式、隠れた形式の所有先、
共通の値を検査します。
比較できる Db の読みには dbFromTree と embeddedValuesOf を使います。
デフォルトで受理してサイトの読みが拒否する木には比較 Db がありません。
[fixture: packet/gram-mixed] [fixture: packet/gram-hidden-range-gap-spaced]
[fixture: packet/lex-hidden-two-suffixes] [fixture: packet/title-repeat-empty]
[fixture: packet/error-single-rounded-end-wide]
10 ノードのコメント例は tests/ast-packet-examples.test.ts が検査します。

radar の記録と受理は tests/fixtures.test.ts だけで、
fixtureAccepts を使って検査します。
tests/radar.test.ts の単体検査はソース被覆、綴り、範囲、包含、ソース順と、
dbFromTree、embeddedValuesOf を使った比較可能な Db を確かめます。
記述されたコンマグループ、hidden form の所有先、両 entry 形式、
繰り返しと空の共通値、double の綴りを検査します。
19 ノードのコメントの例は tests/ast-radar-examples.test.ts が検査します。
[fixture: radar/gram-written-tree] [fixture: radar/lex-hidden-axis-comma]
[fixture: radar/lex-named-entry-hidden-across-lines]
[fixture: radar/common-repeat-empty] [fixture: radar/db-number-rounded]
[fixture: common/detect-minimal-radar]

treemap の受理と記録は tests/fixtures.test.ts だけで、
fixtureAccepts を使って検査します。
tests/treemap.test.ts の単体検査はソース被覆、表記、範囲、包含、ソース順、
平坦な行のインデント、複合形式の境界、空・反復の共通値、
書かれた数値と文字列の読みを検査します。
比較可能な Db は dbFromTree と embeddedValuesOf で検査します。
全 9 ノードのコメント例は tests/ast-treemap-examples.test.ts が検査します。
[fixture: treemap/gram-written-tree] [fixture: treemap/db-leaf-tail-space]
[fixture: treemap/gram-indent-around-global-directive]
[fixture: treemap/common-repeat-empty]
[fixture: treemap/db-number-multiple-dots]
[fixture: treemap/lex-string-conversion]
[fixture: common/detect-minimal-treemap]

`tests/wardley.test.ts` は corpus の記述構造、構成要素のトークン、
隠し形式の名前付き所有先、ソースの被覆、比較可能な Db を検証する。
`tests/fixtures.test.ts` は共通の検出例も含む受理と記録を検証する。
`tests/ast-wardley-examples.test.ts` は 28 ノード型のコメント例を検証する。
[fixture: wardley/db-all-fields] [fixture: wardley/hidden-all-unit-gaps]
[fixture: common/detect-minimal-wardley]

`tests/cynefin.test.ts` はコーパスのフィールド、隠し形式の所有先、
構成要素の境界、ソースの被覆と Db 値を検査します。
共通の検出ケースを含む受理と記録は `tests/fixtures.test.ts` が検査します。
`tests/ast-cynefin-examples.test.ts` は 11 ノードのコメント例を検査します。
[fixture: cynefin/db-all-fields]
[fixture: cynefin/hidden-domain-item-members]
[fixture: cynefin/hidden-all-unit-gaps]
[fixture: common/detect-minimal-cynefin]

`tests/eventmodeling.test.ts` はコーパスの構造、ソース被覆、トークン表記、
範囲、hidden form の所有先、比較可能な Db を検査します。
受理と記録は共通検出 fixture も含め `tests/fixtures.test.ts` が担当します。
`tests/ast-eventmodeling-examples.test.ts` は
全 22 ノードのコメント例を検査します。
[fixture: eventmodeling/gram-written-tree]
[fixture: eventmodeling/lex-hidden-frame-optional-gaps]
[fixture: eventmodeling/lex-hidden-gwt-required-gaps]
[fixture: common/detect-minimal-eventmodeling]

`tests/treeview.test.ts` はコーパスの書かれたフィールド、割り当て字下げ、
罫線形式の所有先、トークンとコメントの被覆、綴り、ノード範囲、
子の包含、ソース順、比較できる Db 値を検査する。
共通検出 fixture を含む受理と記録は `tests/fixtures.test.ts` が担当する。
`tests/ast-treeview-examples.test.ts` は全 13 ノードのコメント例を検査する。
ASCII 表示用の escape を復元してから、印の付いたソース範囲を検査する。
[fixture: treeview/gram-written-tree] [fixture: treeview/box-written-tree]
[fixture: treeview/ast-annotation-prefixes] [fixture:
common/detect-minimal-tree-view]
