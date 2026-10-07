# 木から Db を作る

English version: [db-from-tree.md](./db-from-tree.md)

この文書は、`@mmd-toolkit/tests` の `dbFromTree()` を説明します。
記録した木が表す Db の要約を作り、
パーサーを動かさずに、同じ入力で mermaid.js が記録する Db と木を照らします。

## なぜ必要か

fixture は入力について 2 つを記録します。
1 つは mermaid.js が入力から作るもの
（`expected.json` の Db。仕様が入力を別に読むときは `specified.json` の Db）、
もう 1 つはパーサーが入力から作る木（`ast.json`）です。
この 2 つは合っていなければなりません。
木が表す Db が mermaid.js の Db であるとき、木は正しいのです。
`dbFromTree()` は、この確かめを記録したファイルだけの関数にします。
そのため、次のようになります。

- パーサーは、自分の木に対して試験します
  （`parse(input)` が `ast.json` と等しい）。
  木が mermaid.js と合っているかは、ここで確かめます。
  それぞれ、持ち主のパッケージで確かめることになります。
- ほかの言語のパーサーは、Db を作らなくてよいです。
  `ast.json` が記録する木を返せば足ります。

## 何を読むか

```ts
dbFromTree(text, tree, embedded, isColor)
```

- `text` は、書かれたままの入力です。
- `tree` は `ast.json` の内容で、`DbTreeRoot` です。
  `src/db-from-tree/*-tree.ts` の型が、Db が読む欄を、それだけ並べています。
  実装が与えなければならない欄の一覧です。
  木は JSON そのままで、関数はパーサーも字句解析器も、その単位も使いません。
  関数は欄を確かめずに読みます。
  欄のない木は [checkTree()](./check-tree.ja.md) が見つけ、
  そのような木の読み込みは、欄がないことの誤りで失敗します。
- `embedded` は、入力の埋め込みデータから mermaid.js が導く値で、木は持ちません
  （[embedded-data.ja.md](./embedded-data.ja.md) を参照）。
  fixture からは `embeddedValuesOf()` で得ます。
- `isColor` は、sequence の `box` の色の候補が色かを答えます。
  これはブラウザの答えでテキストにはないので、
  テストは、正規化器も使う代役の、
  `@mmd-toolkit/tests` の `cssSupportsColor()` を渡します。

## 変換した形

Db は、書いた人が書いたとおりでなく、
mermaid.js が読むとおりの木の値から作ります。
木は書かれたテキストを保つ（ast.md の Nodes）ので、関数は、
[common.md の Reading a source](../../spec/docs/common.md#reading-a-source) の
**変換した形**のために、テキストを読み直します。
ディレクティブ、コメント領域、行の規則が無視する `;` の外の文字について、
各行終端を `\n`、各属性の引用符を `'`、各エンティティをその置換文字列とします。
ディレクティブとコメント行は、common.md の Where a directive is と
Comment lines の規則で、テキストそのものから見つけます
（`src/source-scan.ts` の `scanSource()`。
記録した木の検査も使うので、規則は 1 か所に書きます）。
ディレクティブと、その走査が後ろに取るもの、
そしてコメント行です。
コメント行は、`%%` のうち、次の 2 つを満たすものです。
コメントの始まりとの間に、空白とディレクティブだけがあること。
後ろに `{` でも行終端でもない文字があること。
領域は、そのようなコメントの始まりの一番早いものから、行の終わりまでです。
[fixture: common/comment-bare-then-u2028]
[fixture: common/comment-bare-then-u2029]
それ以外の `%%` は図のテキストです。
テキストだけからは分からないものは、木が与えます。

- `IgnoredSemicolon` のトークン。
  行の規則がどの `;` を無視するかは、行の区切りと図種に依るためです。
- フロントマターの終わり。テキストはそこから始まります。

先頭の空白は読みません。テキストの終わりには、`\n` がもう 1 つあります。
flowchart では、`}` の後の空白は、最後の改行までを 1 つの改行として読みます。

図のコメントの中の文字は、字句解析器が読むとおりには読みません。
Db の値にコメントを含むものがないからです。
同じ理由で、図のコメントの中のエンティティや、
行の規則が無視する `;` は、数えません。
テストは、コメントの中の文字を比べません。

## 木からテキストを得る所

Db の値のうち、ノードが直接は与えない範囲のテキストを要るものがあります。
木からは、次のように読みます。

- **sequence の参加者の id**: 識別子の範囲全体の変換した形です。
  id の中のディレクティブの両側の空白が入るからです
  （規則は [db-from-tree/sequence.ja.md](./db-from-tree/sequence.ja.md)）。
- **class の名前**: `ClassIdentifier` のトークン（`RawText`）の変換した形を
  つないだもの。
  トークンの間の空白は入りません
  （名前のテキスト、書いた名前、id は
  [文法の外での拒否](../../spec/docs/diagrams/class.ja.md#文法の外での拒否)
  が定め、書いた名前の型は
  [db-from-tree/class.ja.md](./db-from-tree/class.ja.md) の **Names**
  が定めます）。
- **class の style**: `ClassLiteral` のトークンのテキストの変換した形を
  つなぎ、`,` で分けたもの
  （規則は [db-from-tree/class.ja.md](./db-from-tree/class.ja.md) の
  **Styles**）。
  style のトークンは、ディレクティブの隣で mermaid.js が値として読む空白を持ち
  （tokens.md の A token that a directive cuts）、
  単位の間の空白は持たないので、
  トークンのテキストをつないだものが値です。
- **state の、2 つ目の説明のない別名**: 文に `:` のトークンがあるか。
- **state の note の位置**: 文で `note` の後の 2 つの `Keyword` のトークン、
  `left` か `right` と `of`。書かれたままで、mermaid.js が読む 1 つの空白で
  つなぎます。
- **flowchart の文字列**:
  ノードが始まる文字列、または markdown 文字列の区切りは、値から除きます。
  木は文字列のトークンを持ち、字句解析器の文脈は持たないので、
  文脈は変換した形から、
  [diagrams/flowchart.md の Strings](../../spec/docs/diagrams/flowchart.md)
  の規則で読み直します。
  開きの `"` は、後ろにバッククォートがあれば markdown の文脈に入り、
  文脈を出たところで文字列が終わり、内容は区切りの間の 1 つの連なりです。
  属性の引用符である `"` はそこでは `'` です。
  [fixture: flowchart/db-markdown-string-attribute-quote]
  文字列のトークンを切るコメント領域はそこにありません。
  [fixture: flowchart/lex-comment-line-in-markdown-string]
- **flowchart の subgraph の名前**: 名前のテキストは、名前の始めから、
  規則が与える終わりまでの変換した形です
  （規則は
  [文法の外での拒否](../../spec/docs/diagrams/flowchart.ja.md#文法の外での拒否)
  の **Subgraph members**）。
  文字列の区切りと、先頭の空の説明ブロックを除きます。
  コメント領域、ディレクティブ、行の規則が無視する `;` は変換した形になく、
  `}` の後の空白は変換した形で 1 つの改行なので、どれも名前を終えません。
  [fixture: flowchart/lex-comment-line-in-markdown-subgraph-name]
- **flowchart の辺**: `maxEdges` の上限は、パーサーが設定を知らないので、
  木に対して `exceedsMaxEdges()` が確かめます。
  関数が読む `maxEdges` は、設定が辺の最大数として文書化する、
  負でない数です。
  それ以外の値のときの結果は定めません。

## 確かめ

`tests/db-from-tree.test.ts` は、木と受理の結果（Db 付き）を記録する
すべての fixture の Db を作り、記録した Db
（`specified.json` があればそれ、なければ `expected.json`）と
等しいことを求めます。
キーの順は問いません。
木もパーサーの誤りも記録しない fixture は報告します。
黙って比べないものはありません。
失敗は fixture の名前を添えて報告され、
木に欄がないときは、読み込みの誤りも添えます。
失敗したとき、誤りは、木か、ここの作り手か、
記録（`embedded`、`specified`）のどれかです。
fixture がどれかを教えます。

## 図種を足す

1. 仕様の木の文書 `docs/ast/<diagram>.md` から、Db が読む欄の型を
   `<diagram>-tree.ts` に書く。
2. 図種の手順 `db-from-tree/<diagram>.ja.md` に沿って `<diagram>.ts` を書く。
   「Building the summary from the tree」の段落ごとに 1 つの関数とし、
   `index.ts` に登録する。
3. テストを動かす。木で説明される失敗は、木の文書かパーサーの欠けである。
   入力を付けて報告する。
