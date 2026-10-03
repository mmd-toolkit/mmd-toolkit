# パーサーのテスト

英語版: [testing.md](./testing.md)

テストは `tests/` にあります。
パーサーを、[`@mmd-toolkit/tests`](../../tests) の fixture に照らして、
確かめます。
生成した入力は回しません。
パーサーがすべきことは、仕様と fixture が述べます。
記録した木が仕様の条件を保つか、mermaid.js の Db を与えるかは、
コーパスの確かめで、`@mmd-toolkit/tests` が記録した木に行います。
パーサーのテストは、パーサーがその木を与えることを確かめ、
mermaid.js も生成した入力も動かしません。
`tools/explore/` の探索は、入力を生成し、
pin した mermaid.js（12.0.0）と比べます。
探索はテストではありません
（[mermaid.js と比べる探索](#mermaidjs-と比べる探索)を見てください）。

## fixture

`tests/fixtures.test.ts` は、`common/`、`flowchart/`、`sequence/`、
`class/`、`state/` のすべての fixture を parse し、次を確かめます。

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

## 既知の差異

[既知の差異](../../spec/docs/known-divergences.ja.md)が付いた fixture は、
パーサー自身の字句解析器で、その差異の形を持つことも確かめます。
一方向の差異では、その形を除いた参照入力でも確かめます。
両方向の差異では、仕様どおりの読みがコーパスに記録されていて
（`specified.json`。`expected.json` と違うときに置かれます）、
パーサーの受理・拒否と図種をそれと比べ、
コーパスが、記録した木から組んだ Db とそれを比べます。

- `directive-as-token-boundary`:
  ディレクティブを取り除いた入力をパーサーが読み、
  元の入力に対する mermaid.js の結果と、受理・拒否、図種、Db が一致すること。
  Db は、`@mmd-toolkit/tests` が記録した木から組むのと同じに
  （`dbFromTree`）、パーサーの木から、fixture が記録した埋め込みの値で組みます。
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
- `comment-takes-line-break`: 入力が、
  行の中で単位の後にある図のコメントを持つクラス図であること。
  そのコメントは、パーサーの字句解析器と単位から求めます。
- `name-start-reads-unit`: 入力が、テキストが `"`、
  `~`（バッククォートの名前のとき）、`<<`、`>>`、
  差異が挙げるキーワードのどれかで始まる、
  バッククォートの名前かジェネリクスの型を持つクラス図であること。
  それは、パーサーの `backquoted` と `generic-text` の単位から求めます。
- `html-tag-in-frontmatter`: フロントマターで始まるタグが、
  mermaid.js が `'` として読む `"` を変えること。
  それは、パーサーのフロントマターと属性の引用符の読み方から求めます。

### 参照入力

参照入力は、パーサーが見つけた差異の形を、入力から除くか置き換えたものです。
差異によっては、コメント領域やほかの形も除きます。
`directive-as-token-boundary` の参照入力の作り方と比べ方は上の一覧にあり、
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
そしてクラス図では、
それぞれの空のバッククォートの名前と空のジェネリクスの型です。
空の説明ブロックが文でないのは、
文の始まりでも、文やヘッダーの区切りの前でもない、文の中にあり、
state の文の `textBeforeBody` が持たないときです。
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

`html-tag-in-frontmatter` は両方向の差異なので、
fixture には参照入力が要りませんが、下の探索は、
参照入力で mermaid.js と比べます。
参照入力は、フロントマターのすべての `<` を `(` に替えて、
そこでタグが始まらないようにした入力です。
パーサーの木から組む Db には、
参照入力の埋め込みデータから mermaid.js が求めた値を使うので、
タイトルのような、フロントマターから来る値は、両方で同じです。

## 木の検査

[不変条件](./positions.ja.md#不変条件)と、
各図種の文書が木について述べることは、
`@mmd-toolkit/tests` が確かめます（`checkTree`）。
それは、木が破る条件を一覧にします。
コーパスの記録したすべての木を確かめ、
パーサーのテストと探索も、自分の入力の木にそれを使い
（`tests/helpers/tree-problems.ts`）、一覧が空であることを求めます。

子の欄の順は、パーサー自身のものです。
`visitorKeys` の順に子の欄をたどる道具は、子のノードにソースの順で出会います。
ただし、開く矢印とラベルを持つ FlowchartLink では、
ラベルは矢印より前に書かれ、矢印より後にたどられます。
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

## mermaid.js と比べる探索

`tools/explore/` の探索は、fixture に欠けているものを探します。
探索はテストに入りません。
`packages/parser` で `pnpm run explore` が回します
（`tools/explore/vitest.config.ts`）。
図種の字句か文法を変えたときに回します。
探索が見つけた mermaid.js との違いは、コーパスの fixture で閉じます。
仕様がその読み方を述べていなかったなら、仕様の文でも閉じます。
探索は、`@mmd-toolkit/tests/mutation` を通じて、
`parse()` を pin した mermaid.js と比べます。
比べるのは、受理、図種、木から作った Db の要約と、
受理した入力では木の検査（[木の検査](#木の検査)を参照）です。

- すべての図に共通の規則は、生成した入力で比べます
  （`common-mermaid.test.ts`、`common-invariants.test.ts`）。
- 各図種は、fixture の入力を 1 か所だけ編集した変異の入力で比べます
  （`<diagram>-mermaid.test.ts`）。
  シーケンス図、クラス図、状態図では、同じファイルが、
  文が終わる所か始まる所にコメントを入れます。
  状態図では、行も入れます。
- flowchart、クラス図、状態図の Db が単位の境界でテキストを読む所は、
  そうした文の各位置に、空白、ディレクティブ、コメントの行を入れて比べます
  （`<diagram>-source-reading.test.ts`）。
  実体は、リンクのテキストと楕円のラベルの各位置に実体を入れて比べます
  （`entity-units.test.ts`）。
- 状態図は、fixture の入力の場所にテキストを入れたものでも比べます
  （`state-insertions.test.ts`、`insertions.ts`）。
  場所は、`@mmd-toolkit/tests` が見つける場所の種類で選びます。
  境目と、トークンの中の場所の種類ごとに 1 か所へ、
  各族の文字列をすべて入れます。
  行末の種類ごとに 1 か所へ、並びと、その図種の行を入れます。
  種類ごとに、別の fixture の 2 か所目へ、文字列を 1 つ入れます。

パーサーは既知の差異を区別しないので、差異の申告は探索が行います。
申告の規則は `tests/helpers/known-divergences.ts` にあり、
`tests/fixtures.test.ts` も、印のある fixture にそれを使います。
申告した違いは、すべて確かめます。

- ディレクティブによる拒否は、ディレクティブを取り除くとなくなること。
- クリックの文を始めない `click` や空の形による拒否は、
  パーサーが参照入力を受理するなら、
  元の入力に対する mermaid.js の結果と一致すること。
- 両方向の違いは、`html-tag-in-frontmatter` では参照入力
  （[参照入力](#参照入力) を参照）に対する、
  `comment-takes-character`、`comment-takes-line-break`、
  `name-start-reads-unit` では、
  差異が名指す字句解析器の規則を変えた入力に対する、
  mermaid.js の結果と一致すること。
- 最初の単位がヘッダーでないクラス図の拒否
  （`headerless-empty-ending`。一方向の差で、参照の読み方はない）は、
  mermaid.js が受理する入力であること。
  ヘッダーがないことは、パーサーの字句解析器が決める。
- 埋め込みデータによる mermaid.js の拒否は、
  仕様が挙げるエラーのどれかであること。
  Db や図種の違いは、埋め込みデータのせいにしない。
