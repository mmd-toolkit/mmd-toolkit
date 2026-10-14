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
`class/`、`state/`、`er/`、`gantt/`、`journey/`、`requirement/` の、
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

## 既知の差異

[既知の差異](../../spec/docs/known-divergences.ja.md)が付いた fixture は、
パーサー自身の字句解析器で、その差異の形を持つことも確かめます。
一方向の差異では、その形を除いた参照入力でも確かめます。
両方向の差異では、仕様どおりの読みがコーパスに記録されていて
（`specified.json`。`expected.json` と違うときに置かれます）、
パーサーの受理・拒否と図種をそれと比べ、
コーパスが、記録した木から組んだ Db とそれを比べます。

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
  journey 図では、そこに `%%` があること。
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
- `percent-brace-after-unit`: 入力が、ディレクティブを始めない `%%{` で、
  mermaid.js が直接たどり着くものを持つ Gantt チャートであること。
  同じように求めます。
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

`embedded-data-opaque` の印の付いた fixture には、この確かめはありません。
mermaid.js は、パーサーが読まない埋め込みのデータの中身のためにそれを拒否し、
パーサーはそれを受理します。

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
