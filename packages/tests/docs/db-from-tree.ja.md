# 木から Db を作る

English version: [db-from-tree.md](./db-from-tree.md)

この文書は、`@mmd-toolkit/tests` の `dbFromTree()` を説明します。
記録した木が表す Db の要約を作り、パーサーを動かさずに、
同じ入力で mermaid.js が記録する Db と木を照らします。

## なぜ必要か

fixture は入力について 2 つを記録します。
1 つは mermaid.js が入力から作るもの（`expected.json` の Db、
仕様が入力を別に読むときは `specified.json` の Db）、
もう 1 つはパーサーが入力から作る木（`ast.json`）です。
この 2 つは合っていなければなりません。
木が表す Db が mermaid.js の Db であるとき、木は正しいのです。
`dbFromTree()` は、この確かめを記録したファイルだけの関数にします。
そのため、次のようになります。

- パーサーは、
  自分の木に対して試験します（`parse(input)` が `ast.json` と等しい）。
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
- `embedded` は、入力の埋め込みデータから mermaid.js が導く値で、
  木は持ちません（[embedded-data.ja.md](./embedded-data.ja.md) を参照）。
  fixture からは `embeddedValuesOf()` で得ます。
  その設定は、[文字の置き換え](#文字の置き換え)も決めます。
- `isColor` は、sequence の `box` の色の候補が色かを答えます。
  これはブラウザの答えでテキストにはないので、テストは、正規化器も使う代役の、
  `@mmd-toolkit/tests` の `cssSupportsColor()` を渡します。

## 変換した形

Db は、書いた人が書いたとおりでなく、
mermaid.js が読むとおりの木の値から作ります。
木は書かれたテキストを保つ（ast.md の Nodes）ので、関数は、
[common.md の Reading a source](../../spec/docs/common.md#reading-a-source) の
**変換した形**のために、テキストを読み直します。
ディレクティブ、コメント領域、行の規則が無視する `;` の外の文字について、
各行終端を `\n`、各属性の引用符を `'`、各エンティティをその置換文字列とします。
ディレクティブとコメント行は、
common.md の Where a directive is と Comment lines の規則で、
テキストそのものから見つけます（`src/source-scan.ts` の
`scanSource()`。記録した木の検査も使うので、規則は 1 か所に書きます）。
ディレクティブと、その走査が後ろに取るもの、そしてコメント行です。
コメント行は、`%%` のうち、次の 2 つを満たすものです。
コメントの始まりとの間に、空白とディレクティブだけがあること。
後ろに `{` でも行終端でもない文字があること。
領域は、そのようなコメントの始まりの一番早いものから、
行の終わりまでです。 [fixture: common/comment-bare-then-u2028]
[fixture: common/comment-bare-then-u2029]
それ以外の `%%` は図のテキストです。
テキストだけからは分からないものは、木が与えます。

- `IgnoredSemicolon` のトークン。
  行の規則がどの `;` を無視するかは、行の区切りと図種に依るためです。
- フロントマターの終わり。
  テキストはそこから始まります。

先頭の空白は読みません。
テキストの終わりには、`\n` がもう 1 つあります。
flowchart では、`}` の後の空白は、最後の改行までを 1 つの改行として読みます。
Agentflow は既定のサイズ上限以下では先頭空白と字句上のコメントを保ち、
閉じ括弧の直後の行内空白と最初の LF だけをまとめます。
正確な変換と Name.parts の読みは、
[db-from-tree/agentflow.ja.md](./db-from-tree/agentflow.ja.md) にあります。
[fixture: agentflow/comment-default-size-equal]
[fixture: agentflow/comment-default-size-fallback]
[fixture: agentflow/lex-brace-string-keeps-blank-line]
[fixture: agentflow/lex-flow-name-click-state]

HTML 属性の引用符の位置は、コメントやディレクティブを除く前に、
フロントマターの後のソース全体から一度求めます。
タグは、読む値の外のコメントや前の文から始まることもあります。
共有の変換ヘルパーがその位置を値の各範囲に当て、
木は書かれた引用符を保ちます。 [fixture: venn/db-html-tag-from-title-name]
[fixture: venn/db-html-tag-from-title-label]
[fixture: venn/db-html-tag-from-title-style]
[fixture: venn/db-html-tag-from-comment-name]
[fixture: venn/db-html-tag-across-names]
[fixture: c4/db-html-tag-from-earlier-text]
[fixture: kanban/db-html-tag-from-earlier-text]
[fixture: kanban/db-html-tag-from-earlier-text-data]
[fixture: block/db-html-tag-from-earlier-text]
[fixture: quadrant/db-html-tag-from-earlier-text]
[fixture: sankey/db-html-tag-from-earlier-text]
[fixture: sankey/db-html-tag-from-earlier-text-quoted]
[fixture: xychart/db-html-tag-from-earlier-text]

図のコメントの中の文字は、字句解析器が読むとおりには読みません。
Db の値にコメントを含むものがないからです。
同じ理由で、図のコメントの中のエンティティや、行の規則が無視する `;` は、
数えません。
テストは、コメントの中の文字を比べません。

## 木からテキストを得る所

Db の値のうち、ノードが直接は与えない範囲のテキストを要るものがあります。
木からは、次のように読みます。

- **sequence の参加者の id**: 識別子の範囲全体の変換した形です。
  id の中のディレクティブの両側の空白が入るからです（規則は
  [db-from-tree/sequence.ja.md](./db-from-tree/sequence.ja.md)）。
- **class の名前**: `ClassIdentifier`
  のトークン（`RawText`）の変換した形をつないだもの。
  トークンの間の空白は入りません（名前のテキスト、書いた名前、
  id は
  [文法の外での拒否](../../spec/docs/diagrams/class.ja.md#文法の外での拒否)
  が定め、
  書いた名前の型は [db-from-tree/class.ja.md](./db-from-tree/class.ja.md) の
  **Names** が定めます）。
- **class の style**: `ClassLiteral` のトークンのテキストの変換した形をつなぎ、
  `,` で分けたもの（規則は
  [db-from-tree/class.ja.md](./db-from-tree/class.ja.md) の **Styles**）。
  style のトークンは、
  ディレクティブの隣で mermaid.js が値として読む空白を持ち（tokens.md の A token
  that a directive cuts）、単位の間の空白は持たないので、
  トークンのテキストをつないだものが値です。
- **ER の style**: style の `ErLiteral`
  の中にあるトークンの変換した形をつないだもの。
  style の単位の間の空白は値に含まれないためです（規則は
  [db-from-tree/er.ja.md](./db-from-tree/er.ja.md)）。
- **requirement の style**: style の `RequirementLiteral`
  の中にあるトークンの変換した形をつないだもの。
  style の単位の間の空白は値に含まれないためです（規則は、
  [db-from-tree/requirement.ja.md](./db-from-tree/requirement.ja.md)）。
  [fixture: requirement/lex-style-spaces]
  [fixture: requirement/lex-style-no-comma]
- **xychart のテキスト**: タイトル、軸、カテゴリー、
  プロットの `XychartLiteral` の中にあるトークンの変換した形をつないだもの。
  引用符のないテキストの単位の間の空白は値に含まれないためです（規則は、
  [db-from-tree/xychart.ja.md](./db-from-tree/xychart.ja.md)）。
  [fixture: xychart/db-title-bare-words]
- **quadrant のテキスト**: `QuadrantLabel` と `QuadrantLiteral`
  の範囲の変換した形。
  引用符のないテキストの単位の間の空白を含みます。
  mermaid.js が空白の単位もテキストに読み込むためです（規則は、
  [db-from-tree/quadrant.ja.md](./db-from-tree/quadrant.ja.md)）。
  [fixture: quadrant/db-quadrant-spaces-trimmed]
- **block の方向、クラス、スタイル**: 方向、クラスの id、スタイルは、
  それぞれのリテラルの変換形で、
  カンマの前後の空白を持ちます（規則は
  [db-from-tree/block.md](./db-from-tree/block.md)）。
  [fixture: block/db-arrow-spaces] [fixture: block/db-class-apply-list-spaces]
  [fixture: block/db-style-spaces]
- **Venn の宣言**: 名前、ラベル、数、スタイルの値、タイトルは、
  書かれた値と葉の変換済みの範囲を使います。
  null の text の対象は、
  `checkTree` が暗黙のモードを検査した後の最後の部分集合です。
  手順は [db-from-tree/venn.md](./db-from-tree/venn.md) にあります。
  [fixture: venn/db-all-fields]
- **Usecase の出現**: 宣言、ネイティブメタデータ、参照から保存済みモデルを作り、
  JSON の値とプロパティ順はソース順の embedded effect だけから取ります。
  手順は [db-from-tree/usecase.md](./db-from-tree/usecase.ja.md) にあります。
  共通サニタイザーはアクセシビリティ文字列に適用し、
  要素テキストには適用しません。 [fixture: usecase/db-all-fields]
  [fixture: usecase/db-json-source-map-order]
  [fixture: usecase/config-security-other]
- **C4 の呼び出し**: 引数、タイトル、アクセシビリティのテキストは、
  値ノードとその範囲の変換形だけから読みます。
  入れ子の本体が境界のスタックを定め、
  名前付き属性が完全な自属性の集合を更新します。
  手順は [db-from-tree/c4.md](./db-from-tree/c4.ja.md) にあります。
  [fixture: c4/db-all-fields]
- **kanban の行**: id、ラベル、アイコンは、
  ノードの範囲と書かれた値だけから読みます。
  body の列とその children が所属を定め、
  隣接するデータ接尾辞ごとに埋め込み効果を一つ消費します。
  手順は [db-from-tree/kanban.md](./db-from-tree/kanban.ja.md) にあります。
  [fixture: kanban/db-sections-items] [fixture: kanban/db-metadata-two-items]
- **mindmap のラベル**: `MindmapLabel` の範囲の変換した形から、
  文字列か markdown 文字列の区切りを除いたもの。
  区切りは変換した形から切り落とし、文字列は両端に 1 文字ずつ、
  markdown 文字列は 2 文字ずつです（規則は、
  [db-from-tree/mindmap.ja.md](./db-from-tree/mindmap.ja.md)）。
  [fixture: mindmap/db-shape-string] [fixture: mindmap/db-shape-markdown-string]
- **subgraph の中の ER のキーワード文**: `class`、`classDef`、
  `style` の文の最初のトークンのテキストを、書かれたままで。
  subgraph がノードとして並べます（規則は
  [db-from-tree/er.ja.md](./db-from-tree/er.ja.md) の **Subgraphs**）。
- **gantt のリストのトークン**: `includes` か `excludes` の文で、
  最初の項目の始まりから最後の項目の終わりまでのテキストの変換した形を、
  全体として小文字にし、空白とコンマで分けたもの。
  ギリシャ文字の大文字シグマの小文字は、
  まわりの文字で決まるためです（規則は
  [db-from-tree/gantt.ja.md](./db-from-tree/gantt.ja.md)）。
- **state の、2 つ目の説明のない別名**: 文に `:` のトークンがあるか。
- **state の note の位置**: 文で `note` の後の 2 つの `Keyword` のトークン、
  `left` か `right` と `of`。
  書かれたままで、mermaid.js が読む 1 つの空白でつなぎます。
- **flowchart の文字列**: ノードが始まる文字列、
  または markdown 文字列の区切りは、値から除きます。
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
  規則が与える終わりまでの変換した形です（規則は
  [文法の外での拒否](../../spec/docs/diagrams/flowchart.ja.md#文法の外での拒否)
  の **Subgraph members**）。
  文字列の区切りと、先頭の空の説明ブロックを除きます。
  コメント領域、ディレクティブ、行の規則が無視する `;` は変換した形になく、
  `}` の後の空白は変換した形で 1 つの改行なので、
  どれも名前を終えません。
  [fixture: flowchart/lex-comment-line-in-markdown-subgraph-name]
- **flowchart と Agentflow の辺**: `maxEdges` の上限は、
  パーサーが設定を知らないので、木に対して `exceedsMaxEdges()` が確かめます。
  関数が読む `maxEdges` は、設定が辺の最大数として文書化する、負でない整数です。
  それ以外の値のときの結果は定めません（`maxEdges` が 1.5 のとき、
  mermaid.js は辺 2 つを受理しますが、
  関数は拒否します。 `Infinity` では `runMermaid()` が例外を投げるので、
  比べる結果がありません）。
  上限 0 は最初の辺を拒否し、
  辺のない入力は上限 0 でも受理します。
  [fixture: flowchart/config-max-edges-zero-exceeded]
  [fixture: flowchart/config-max-edges-zero-no-edge]

## 文字の置き換え

mermaid.js は、
Db が持つテキストをそれぞれ
[`sanitizeText`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/common.ts#L85-L97)
に通します。
コーパスの実行器は DOMPurify を無効にするので、残るのは、
[`sanitizeMore`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/common.ts#L70-L83)
です。
[expected-results.ja.md](./expected-results.ja.md) の「残る処理」を参照。
その処理は設定だけで決まり、
設定は `embedded.config` が丸ごと持ちます（サイト設定、フロントマター、
ディレクティブ）。
そこで `dbFromTree()` は、
置き換えを 1 か所の `textReplacementOf()`
（`src/db-from-tree/text-replacement.ts`）で作り、各図が下のテキストに当てます。

**いつ。**
HTML ラベルが有効で、`securityLevel` が `strict`、`loose`、`antiscript`、
`sandbox` のどれでもないとき、置き換えます。

- 4 つの値はどれも、
  テキストを書かれたままにします。
  [fixture: flowchart/config-security-level-strict-label-characters]
  [fixture: flowchart/config-security-level-loose-label-characters]
  [fixture: flowchart/config-security-level-antiscript-label-characters]
  [fixture: flowchart/config-security-level-sandbox-label-characters]
- ほかの値はテキストを変えます。
  値は書かれたままで比べるので、`Loose`、空のテキスト、数値は、
  4 つのどれでもありません。
  [fixture: flowchart/config-security-level-other-label-characters]
  [fixture: flowchart/config-security-level-capitalized-label-characters]
  [fixture: flowchart/config-security-level-empty-label-characters]
  [fixture: flowchart/config-security-level-number-label-characters]
- `securityLevel` を設定するのはサイト設定だけです。
  それを設定するディレクティブやフロントマターは、値を変えません。 [fixture:
  flowchart/config-security-level-other-security-level-directive-strict]
  [fixture:
  flowchart/config-security-level-loose-security-level-directive-other]
  [fixture:
  flowchart/config-security-level-loose-security-level-frontmatter-other]
- HTML ラベルは、
  ルートの `htmlLabels` が設定されていれば（欠けても `null`
  でもなければ）それで、
  ルートのものが設定されていなければ `flowchart.htmlLabels` で決まり、
  どちらもなければ有効です。
  [fixture: flowchart/config-security-level-other-html-labels-false]
  [fixture: flowchart/config-security-level-other-flowchart-html-labels-false]
  [fixture:
  flowchart/config-security-level-other-html-labels-true-flowchart-false]
  [fixture:
  flowchart/config-security-level-other-html-labels-false-flowchart-true]
  [fixture:
  flowchart/config-security-level-other-html-labels-null-flowchart-false]
- 値が `false` のとき、または値のテキストが、
  両端の空白を除いて小文字にすると `false`、`null`、`0` のどれかのとき、
  HTML ラベルは無効です。
  数値の 0 のテキストは `0` です。
  [fixture: flowchart/config-security-level-other-html-labels-false-text]
  [fixture: flowchart/config-security-level-other-html-labels-zero]
  [fixture: flowchart/config-security-level-other-html-labels-zero-text]
  [fixture: flowchart/config-security-level-other-html-labels-null-text]
  [fixture:
  flowchart/config-security-level-other-html-labels-false-spaced-upper]
  [fixture:
  flowchart/config-security-level-other-flowchart-html-labels-false-text]
  [fixture: flowchart/config-security-level-other-flowchart-html-labels-zero]
  `true`、`no`、空のテキストなど、
  ほかの値では有効のままです。
  [fixture: flowchart/config-security-level-other-html-labels-true-text]
  [fixture: flowchart/config-security-level-other-html-labels-no-text]
  [fixture: flowchart/config-security-level-other-html-labels-empty-text]
- 設定はそのテキストのものなので、
  ディレクティブやフロントマターが `htmlLabels` を設定でき、
  ディレクティブはサイト設定に優先します。
  [fixture: flowchart/config-security-level-other-html-labels-false-directive]
  [fixture:
  flowchart/config-security-level-other-html-labels-false-frontmatter] [fixture:
  flowchart/config-security-level-other-flowchart-html-labels-false-directive]
  [fixture:
  flowchart/config-security-level-other-html-labels-true-directive-over-site]
- 同じ設定が、ほかの図種でも決めます。
  そこでの `flowchart` は設定のキーで、
  図ではありません。
  [fixture: class/config-security-level-other-html-labels-false]
  [fixture: class/config-security-level-other-flowchart-html-labels-false]
  [fixture: state/config-security-level-other-html-labels-false]
  [fixture: sequence/config-security-level-other-html-labels-false]
  [fixture: class/config-security-level-loose-label-and-name]
  [fixture: state/config-security-level-loose-description-and-id]
  [fixture: sequence/config-security-level-loose-title-and-box]
  [fixture: er/config-security-level-other-subgraph-title-html-labels-false]
  [fixture: gantt/config-security-level-other-html-labels-false]
  [fixture: journey/config-security-level-other-html-labels-false]
  [fixture: requirement/config-security-level-other-html-labels-false]
  [fixture: mindmap/config-security-level-other-html-labels-false]
  [fixture: timeline/config-security-level-other-html-labels-false]

**何を。**
置き換えは、改行タグをそれぞれ `#br#` に書き、次に `<`、`>`、
`=` をそれぞれ `&lt;`、`&gt;`、`&equals;` に書き、
そのあとで `#br#` をそれぞれ `<br/>` に書きます。
作者が書いた `#br#` も `<br/>` になります。
改行タグは、`<`、省略できる `/`、大文字小文字を問わない `br`、空白、
省略できる `/`、
`>` です。 [fixture: flowchart/config-security-level-other-line-breaks]
[fixture: flowchart/config-security-level-other-line-breaks-spaced]
タグは `#br#` を置き換える前に、
左から重ならずに見つけます。
[fixture: flowchart/config-security-level-other-placeholder-repeated]
置き換えの前に、テキストからディレクティブを取り除きます。
そのため、改行タグの中や、作者が書いた `#br#` の中にあるディレクティブは、
置き換えを妨げません。
[fixture: flowchart/config-security-level-other-line-break-directive-inside]
[fixture: flowchart/config-security-level-other-placeholder-directive-inside]

**どのテキストか。**
置き換えるのは、mermaid.js が `sanitizeText` に渡すテキストだけです。
届くテキストと届かないテキストは次のとおりです。

- flowchart: 頂点のラベルとリンクのテキスト（markdown 文字列のテキスト、
  後で引用符を除く文字列を含む）、
  subgraph のタイトル（タイトルがなければ名前）、ツールチップ、
  フロントマターの title、`accTitle`、
  `accDescr`（1 行のものとブロック）。
  [fixture: flowchart/config-security-level-other-label-characters]
  [fixture: flowchart/config-security-level-other-edge-label]
  [fixture: flowchart/config-security-level-other-markdown-label]
  [fixture: flowchart/config-security-level-other-quoted-label]
  [fixture: flowchart/config-security-level-other-subgraph-title]
  [fixture: flowchart/config-security-level-other-subgraph-name-line-break]
  [fixture: flowchart/config-security-level-other-tooltip]
  [fixture: flowchart/config-security-level-other-diagram-title]
  [fixture: flowchart/config-security-level-other-acc-title]
  [fixture: flowchart/config-security-level-other-acc-descr]
  [fixture: flowchart/config-security-level-other-acc-descr-block]
  テキストになる頂点の id、subgraph の id、
  データブロックが設定するラベルには届きません。
  [fixture: flowchart/config-security-level-other-id-as-text]
  [fixture: flowchart/config-security-level-other-subgraph-name-line-break]
  [fixture: flowchart/config-security-level-other-data-block-label]
- class: title、`accTitle`、`accDescr`、クラスのラベル、
  ジェネリック型とそれを持つクラスの text、クラスの id、クラス本体の属性、
  メソッド（引数と戻り値の型を含む）、アノテーション、関係の多重度とラベル、
  click、link、
  callback のツールチップ。
  [fixture: class/config-security-level-other-diagram-title]
  [fixture: class/config-security-level-other-acc-title]
  [fixture: class/config-security-level-other-acc-descr]
  [fixture: class/config-security-level-other-acc-descr-block]
  [fixture: class/config-security-level-other-class-label]
  [fixture: class/config-security-level-other-generic-type]
  [fixture: class/config-security-level-other-member-attribute]
  [fixture: class/config-security-level-other-member-method]
  [fixture: class/config-security-level-other-member-annotation]
  [fixture: class/config-security-level-other-relation-titles]
  [fixture: class/config-security-level-other-tooltip]
  note のテキストには届きません。
  [fixture: class/config-security-level-other-note-as-written]
  文のアノテーションとリンクの target は、
  置き換えが変える文字を持ちません。
  [fixture: class/config-security-level-other-annotation-statement]
- state: title、`accTitle`、`accDescr`、状態のラベルと説明、 note のテキスト、
  遷移のラベル。
  click の URL とツールチップには届きません。
  [fixture: state/config-security-level-other-diagram-title]
  [fixture: state/config-security-level-other-acc-title]
  [fixture: state/config-security-level-other-acc-descr]
  [fixture: state/config-security-level-other-acc-descr-block]
  [fixture: state/config-security-level-other-description]
  [fixture: state/config-security-level-other-alias]
  [fixture: state/config-security-level-other-note]
  [fixture: state/config-security-level-other-transition-label]
  [fixture: state/config-security-level-other-click-as-written]
- sequence: フロントマターと `title` 文の title、`accTitle`、`accDescr`、
  box の名前、参加者の links と properties。
  参加者の説明、メッセージ、note、
  ブロックのテキストには届きません。
  [fixture: sequence/config-security-level-other-diagram-title]
  [fixture: sequence/config-security-level-other-title-statement]
  [fixture: sequence/config-security-level-other-acc-title]
  [fixture: sequence/config-security-level-other-acc-descr]
  [fixture: sequence/config-security-level-other-acc-descr-block]
  [fixture: sequence/config-security-level-other-box-name]
  [fixture: sequence/config-security-level-other-links]
  [fixture: sequence/config-security-level-other-properties]
  [fixture: sequence/config-security-level-other-texts-as-written]
- ER: title、`accTitle`、`accDescr`、subgraph の title。
  名前、別名、属性の型と名前とコメント、ロール、subgraph の id、
  subgraph のノード、クラス、
  style には届きません。 [fixture: er/config-security-level-other-diagram-title]
  [fixture: er/config-security-level-other-acc-title]
  [fixture: er/config-security-level-other-acc-descr]
  [fixture: er/config-security-level-other-acc-descr-block]
  [fixture: er/config-security-level-other-subgraph-title]
  [fixture: er/config-security-level-other-names-as-written]
  [fixture: er/config-security-level-other-subgraph-node-acc-title]
- gantt: title（フロントマターのものと `title` の文のもの）、`accTitle`、
  `accDescr`（行のものとブロックのもの）。
  タスクの説明・項目・id、section の名前、設定の値、
  `includes` と `excludes` のトークン、
  click の文の id・URL・コールバックには届きません。
  [fixture: gantt/config-security-level-other-title]
  [fixture: gantt/config-security-level-other-diagram-title]
  [fixture: gantt/config-security-level-other-acc-title]
  [fixture: gantt/config-security-level-other-acc-descr]
  [fixture: gantt/config-security-level-other-acc-descr-block]
  [fixture: gantt/config-security-level-other-names-as-written]
  [fixture: gantt/config-security-level-other-settings-as-written]
  [fixture: gantt/config-security-level-other-task-data-as-written]
  [fixture: gantt/config-security-level-other-click-as-written]
- journey: title（フロントマターのものと `title` の文のもの）、`accTitle`、
  `accDescr`（行のものとブロックのもの）。
  タスクの説明、スコア、人、
  section の名前には届きません。
  [fixture: journey/config-security-level-other-title]
  [fixture: journey/config-security-level-other-diagram-title]
  [fixture: journey/config-security-level-other-acc-title]
  [fixture: journey/config-security-level-other-acc-descr]
  [fixture: journey/config-security-level-other-acc-descr-block]
  [fixture: journey/config-security-level-other-names-as-written]
- requirement: フロントマターの title、`accTitle`、
  `accDescr`（行のものとブロックのもの）。
  この図に `title` の文はありません。
  名前、id、text、type、参照、リレーションシップの名前、クラス、
  style には届きません。 [fixture: requirement/lex-title-statement]
  [fixture: requirement/config-security-level-other-title]
  [fixture: requirement/config-security-level-other-acc-title]
  [fixture: requirement/config-security-level-other-acc-descr]
  [fixture: requirement/config-security-level-other-acc-descr-block]
  [fixture: requirement/config-security-level-other-names-as-written]
- mindmap: ノードの id、説明、icon、class。
  要約のテキストは、
  これですべてです。 [fixture: mindmap/config-security-level-other-texts]
- timeline: `title` の文の title、`accTitle`、
  `accDescr`（行のものとブロックのもの）。
  フロントマターの title は読みません。
  period、event、
  section の名前には届きません。
  [fixture: timeline/config-security-level-other-title-and-accessibility]
  [fixture: timeline/config-security-level-other-accessibility-block]
  [fixture: timeline/config-security-level-other-sections-periods-events]
- sankey: フロントマターの title と、すべてのノードの id。
  id は、欄から読んだあとで置き換えられます。
  id が等しくなったノードは 1 つのノードです。
  [fixture: sankey/config-security-level-other-title-and-ids]
- xychart: title（フロントマターのものと `title` の文のもの）、`accTitle`、
  `accDescr`（行のものとブロックのもの）、軸のタイトル、カテゴリー、
  プロットのタイトル、line が持つラベル。
  向きと数には届きません。 [fixture: xychart/config-security-level-other-all]
  [fixture: xychart/config-security-level-other-orientation-horizontal]
- quadrant: title（フロントマターのものと `title` の文のもの）、`accTitle`、
  `accDescr`（行のものとブロックのもの）、軸と象限のテキスト、点の名前。
  クラス名、座標、
  スタイルには届きません。 [fixture: quadrant/config-security-level-other-all]
- C4: タイトルとアクセシビリティのテキスト。
  図形、境界、
  関係の引数には適用しません。 [fixture: c4/config-security-level-other]
- block: ノード、ブロック矢印、複合ブロック、辺のラベル。
  id、クラス、スタイル、
  方向には届きません。 [fixture: block/config-security-level-other-all]

**mermaid.js の順序が効く所。**
テキストを読み進める前に置き換える所があり、作り手も同じにします。

- クラスの名前: クラスの書かれた名前の id と型を、
  置き換えます（バッククォートの名前は、その文字を持てます）。
  等しくなった名前は 1 つのクラスで、クラスを名指す文はどれも、
  置き換えた id でクラスを探します（namespace の中でも）。
  note の `class` と、interface の `label` と `classId` には、
  書かれた名前が残ります。
  [fixture: class/config-security-level-other-name-backquoted]
  [fixture: class/config-security-level-other-name-merged]
  [fixture: class/config-security-level-other-name-lookup]
  [fixture: class/config-security-level-other-name-namespace] [fixture:
  class/config-security-level-other-name-note-and-interface-as-written]
- クラスのメンバー: 置き換えは、可視性の印を読む前の行全体に対して行うので、
  印と名前をいっしょに置き換えます。
  `#br#` で始まる行に可視性はなく、 `#` の次がそれ以外なら、
  可視性は protected です。
  [fixture: class/config-security-level-other-member-hash-line-break]
- 状態の id: 状態のラベルは、説明が置き換えるまでは置き換えた id で、
  説明が置き換えるのは、置き換えが id を変えなかったときだけです。
  変えたときは、置き換えた id が最初の説明のまま残り、ラベルは置き換えた id で、
  説明がそのあとに続きます。
  [fixture: state/config-security-level-other-id-without-description]
  [fixture: state/config-security-level-other-id-changed-with-description]
  [fixture: state/config-security-level-other-id-unchanged-with-description]
  [fixture: state/config-security-level-other-composite-id]
- sequence の links: `links` のテキストは、置き換えたあと、
  `&equals;` を `=` に戻して JSON として読みます。
  `properties` のテキストは、置き換えて JSON として読みます。
  `link` のテキストは、置き換えたあと、その中で `@` の位置を取り、
  ラベルと URL は、`&equals;` を `=` に戻したテキストから、その位置で切るので、
  `@` の前の `=` は切る位置をずらします。
  [fixture: sequence/config-security-level-other-links]
  [fixture: sequence/config-security-level-other-properties]
  [fixture: sequence/config-security-level-other-link]

## 確かめ

Treeview は入れ子の node、書かれた注釈、罫線の直接の読みから構築する。
手順は [treeview.ja.md](./db-from-tree/treeview.ja.md) にある。
[fixture: treeview/gram-written-tree] [fixture: treeview/box-written-tree]
[fixture: treeview/config-security-level-other]
[fixture: treeview/div-html-frontmatter-value]

Eventmodeling は書かれた frame、data 宣言、
原文から読む共通 terminal 全体から作る。
手順は [eventmodeling.ja.md](./db-from-tree/eventmodeling.ja.md) にある。
[fixture: eventmodeling/gram-written-tree]
[fixture: eventmodeling/db-reset-data-reference]
[fixture: eventmodeling/config-security-level-other]
[fixture: eventmodeling/div-html-frontmatter-value]

Cynefin は、書かれた領域のブロック、項目の文字列、
遷移と共通の代入から組み立てます。
手順は [cynefin.ja.md](./db-from-tree/cynefin.ja.md) にあります。
[fixture: cynefin/db-all-fields] [fixture: cynefin/db-domain-empty-last]
[fixture: cynefin/config-security-level-other]
[fixture: cynefin/div-html-frontmatter-value]

Wardley は、書かれた全出現と仕様の比較名から組み立てます。
手順は [wardley.ja.md](./db-from-tree/wardley.ja.md) にあります。
[fixture: wardley/db-all-fields] [fixture: wardley/db-publication-order]
[fixture: wardley/config-security-level-other]
[fixture: wardley/div-html-frontmatter-value]

Railroad の 4 方言は、一つの authored tree から組み立てます。
[railroad.ja.md](./db-from-tree/railroad.ja.md) に定めます。
[fixture: railroad/ir-gram-written-tree]
[fixture: railroad/ebnf-gram-written-tree]
[fixture: railroad/abnf-gram-written-tree]
[fixture: railroad/peg-gram-written-tree]

Treemap の組み立ては [treemap.ja.md](./db-from-tree/treemap.ja.md) に定めます。
入れ子の section と leaf、
前置 gap の文と外側の共通値から組み立てます。
[fixture: treemap/gram-written-tree] [fixture: treemap/db-indent-pop]

Radar の組み立ては [radar.ja.md](./db-from-tree/radar.ja.md) に定めます。
原文の宣言群、entry、
共通の代入と option から組み立てます。 [fixture: radar/gram-written-tree]
[fixture: radar/db-all-fields]

Architecture の組み立ては
[architecture.ja.md](./db-from-tree/architecture.ja.md) に定めます。
[fixture: architecture/db-mixed]

記録した木の比較には C4、block、kanban、Venn、Agentflow、Usecase、pie、
gitgraph、info、packet、radar、treemap、railroad と common の検出例を含み、
Wardley と C4 の五つの kind もすべて含みます。

`tests/db-from-tree.test.ts` は、
木と受理の結果（Db 付き）を記録するすべての fixture の Db を作り、
記録した Db （`specified.json` があればそれ、
なければ `expected.json`）と等しいことを求めます。
キーの順は問いません。
木もパーサーの誤りも記録しない fixture は報告します。
黙って比べないものはありません。
Db の比較対象に parser の誤りだけが記録されるときは、
差異の印の読みが `fixtureAccepts` で拒否になる場合だけ省略します。
それ以外は報告します。
失敗は fixture の名前を添えて報告され、木に欄がないときは、
読み込みの誤りも添えます。
失敗したとき、誤りは、木か、ここの作り手か、記録（`embedded`、
`specified`）のどれかです。
fixture がどれかを教えます。

## 図種を足す

1. 仕様の木の文書 `docs/ast/<diagram>.md` から、
   Db が読む欄の型を `<diagram>-tree.ts` に書く。
2. 図種の手順 `db-from-tree/<diagram>.ja.md` に沿って `<diagram>.ts` を書く。
   「Building the summary from the tree」の段落ごとに 1 つの関数とし、
   `index.ts` に登録する。
3. テストを動かす。
   木で説明される失敗は、木の文書かパーサーの欠けである。
   入力を付けて報告する。

Packet、gitgraph、info、pie、Venn、Agentflow、Usecase は、
手作りの木と記録済みの木の両方で検査します。
新しい builder は [packet.md](./db-from-tree/packet.ja.md)、
[gitgraph.md](./db-from-tree/gitgraph.md) と [info.md](./db-from-tree/info.md)
に説明します。
文字の置換は frontmatter の初期タイトルも含むタイトルだけに適用します。
[fixture: venn/config-security-other]
