# 開発

英語版: [development.md](./development.md)

プラグインのテストのしかたと、整形の例を足す、更新するしかたを説明します。
プラグインは [`@mmd-toolkit/parser`](../../parser) で図を読み、
出力を mermaid.js を動かさずに確かめます。
テキストの木が表す Db を、
[`@mmd-toolkit/tests`](../../tests) の補助関数で作って比べます。

## テストの実行

```sh
pnpm vitest run --project prettier-plugin-mmd
```

これは、整形の fixture、コーパス、単体テストを回します。
実行には約 10 秒かかります。

テストは `@mmd-toolkit/parser` と `@mmd-toolkit/tests` を、
ビルドではなくソースから読みます（`vitest.config.ts` を参照）。
そのため、ビルドは要りません。
plugin のソースを import して Node で動かすスクリプトは、
それらのパッケージを `lib/` のビルドから読みます。
そのため、動かす前に `pnpm --filter @mmd-toolkit/parser run build` と
`pnpm --filter @mmd-toolkit/tests run build` で作り直してください。

## テスト

| ファイル                             | 確かめること                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tests/plugin.test.ts`               | プラグインが宣言する言語、パーサー、printer。                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `tests/dispatch.test.ts`             | 図の本体が、その図種の printer に渡ること。printer のない図種と、パーサーが対応しない図種を、ファイルでも Markdown でも変えずに印字すること。                                                                                                                                                                                                                                                                                                                                             |
| `tests/failure.test.ts`              | パーサーが拒否する入力を、ファイルでは構文エラーとして報告し、Markdown では Prettier に任せること。バイト順マークの制限。                                                                                                                                                                                                                                                                                                                                                                 |
| `tests/markdown.test.ts`             | どの Markdown のコードブロックがプラグインに届くか。パーサーの代わりのスタブを使います。                                                                                                                                                                                                                                                                                                                                                                                                  |
| `tests/markdown-flowchart.test.ts`   | Markdown のコードブロックの中で整形した flowchart。トップレベル、リスト項目、引用の中と、行末の空白。                                                                                                                                                                                                                                                                                                                                                                                     |
| `tests/markdown-sequence.test.ts`    | Markdown のコードブロックの中で整形した sequence 図。トップレベル、リスト項目の中と、タイトルの末尾の空白。                                                                                                                                                                                                                                                                                                                                                                               |
| `tests/markdown-class.test.ts`       | Markdown のコードブロックの中で整形した class 図。トップレベル、リスト項目の中と、コメントの後の空白 1 つの行。                                                                                                                                                                                                                                                                                                                                                                           |
| `tests/markdown-state.test.ts`       | Markdown のコードブロックの中で整形した state 図。トップレベルとリスト項目の中。                                                                                                                                                                                                                                                                                                                                                                                                          |
| `tests/markdown-er.test.ts`          | Markdown のコードブロックの中で整形した ER 図。トップレベル、リスト項目の中、方向を含む `accTitle`。                                                                                                                                                                                                                                                                                                                                                                                      |
| `tests/markdown-gantt.test.ts`       | Markdown のコードブロックの中で整形した Gantt 図。トップレベル、リスト項目の中、空白だけのデータを持つタスク。                                                                                                                                                                                                                                                                                                                                                                            |
| `tests/markdown-journey.test.ts`     | Markdown のコードブロックの中で整形した journey 図。トップレベル、リスト項目の中、空白だけのデータを持つタスク。                                                                                                                                                                                                                                                                                                                                                                          |
| `tests/markdown-mindmap.test.ts`     | Markdown のコードブロックの中で整形した mindmap。トップレベル、リスト項目の中、ノードのテキストの末尾の空白。                                                                                                                                                                                                                                                                                                                                                                             |
| `tests/markdown-sankey.test.ts`      | Markdown のコードブロックの中で整形した sankey 図。トップレベル、リスト項目の中、別の記録の前にある空白だけの値。                                                                                                                                                                                                                                                                                                                                                                         |
| `tests/markdown-timeline.test.ts`    | Markdown のコードブロックの中で整形した timeline。トップレベル、リスト項目の中、event の末尾の空白。                                                                                                                                                                                                                                                                                                                                                                                      |
| `tests/markdown-requirement.test.ts` | Markdown のコードブロックの中で整形した requirement 図。トップレベル、リスト項目の中、コメント行が前の行から分けない文。                                                                                                                                                                                                                                                                                                                                                                  |
| `tests/markdown-xychart.test.ts`     | Markdown のコードブロックの中で整形した XY チャート。トップレベル、リスト項目の中、閉じていない説明ブロック。                                                                                                                                                                                                                                                                                                                                                                             |
| `tests/markdown-quadrant.test.ts`    | Markdown のコードブロックの中で整形した象限チャート。トップレベル、リスト項目の中、テキストの中の空白。                                                                                                                                                                                                                                                                                                                                                                                   |
| `tests/markdown-block.test.ts`       | Markdown のコードブロックの中で整形したブロック図。トップレベル、リスト項目の中、ラベルの中の空白。                                                                                                                                                                                                                                                                                                                                                                                       |
| `tests/line-separators.test.ts`      | 書かれたまま残す U+2028 か U+2029 を含む state 図、sequence 図、ER 図、Gantt 図、journey 図、requirement 図、mindmap、timeline、XY チャート、象限チャート、ブロック図と、U+00A0、U+3000、U+FEFF を含む Gantt 図、journey 図、requirement 図、mindmap、timeline、XY チャート、象限チャート、ブロック図と、テキストの末尾にそれらを含む sankey 図。文字はエスケープで書きます。                                                                                                             |
| `tests/line-terminators.test.ts`     | 行が `\r\n` か単独の `\r` で終わる図。改行のときと同じに整形し、オプションの行末で印字します。文字はエスケープで書きます。                                                                                                                                                                                                                                                                                                                                                                |
| `tests/format.test.ts`               | 整形の fixture ごとに、入力が出力に整形されること、出力を整形しても変わらないこと、木が表す Db が両方で同じこと、埋め込みデータが書かれたままであること（[テストが保つもの](#テストが保つもの)を参照）。                                                                                                                                                                                                                                                                                  |
| `tests/corpus.test.ts`               | `@mmd-toolkit/tests` の適合性コーパス（common、flowchart、sequence、class、state、ER、Gantt、journey、requirement、mindmap、timeline、sankey、XY チャート、象限チャート、ブロック図）のうち、プラグインが整形する入力すべて。もう一度整形しても変わらないこと、埋め込みデータが書かれたままであること、出力の木が表す Db が、コーパスが入力について記録した Db と同じこと（[テストが保つもの](#テストが保つもの)を参照）。parser が拒否する入力すべてが、構文エラーとして報告されること。 |
| `tests/docs.test.ts`                 | 規則の文書と README が fixture と一致すること（[文書と fixture](#文書と-fixture) を参照）。                                                                                                                                                                                                                                                                                                                                                                                               |
| `tests/value-nodes.test.ts`          | printer のある図種ごとに、子の欄を持たない木の型（その図種の型と、共有する葉のノード）が、どれも、書かれたまま印字する値か、例外として挙げたもののどちらかであること。木に足された型が、意図して扱われるようにするためです。                                                                                                                                                                                                                                                              |
| `tests/source.test.ts`               | printer がノードの構造のトークンとみなすもの。ディレクティブ、`;`、フロントマターのトークンは含みません。フロントマターの区切りの `---` は、flowchart の矢印と同じ種類と値です。                                                                                                                                                                                                                                                                                                          |
| `tests/sequence-layout.test.ts`      | 後ろの空白が別の単位にしてしまう id のうち、sequence の printer が取るもの。数と `title` で、その隣では矢印の前後に空白を置きません。                                                                                                                                                                                                                                                                                                                                                     |

### テストが保つもの

整形は、冪等で、Db を変えてはいけません。
Db は mermaid.js から読みません。
`tests/db-reading.ts` の `dbOfText` が、テキストの木から、
`@mmd-toolkit/tests` の `dbFromTree` で作ります。
入力の埋め込みデータ（フロントマター、ディレクティブ、データブロック）から
mermaid.js が導く値を使います。
コーパスは、fixture ごとにその値（`embeddedValuesOf`）と、
入力の Db（`expected.json`。仕様が違う読み方をするものは `specified.json`）を
記録しているので、コーパスのテストは、整形後のテキストの Db を、
記録された Db と比べます。
ほかのテストには記録がないので、整形後のテキストの Db を、
入力の Db と、既定の値で比べます。

埋め込みデータの値は入力のものを使うので、
整形が埋め込みデータを書かれたまま残すことも確かめます。
`writtenEmbeddedTexts` が、ディレクティブとデータブロックの書かれたテキストを、
出現順に並べ、その並びが整形の前と後で同じこと
（行終端はすべて改行として読みます）を確かめます。
フロントマターは例外です。
printer は、安全なら、その YAML を Prettier の YAML 整形で整形するので、
`describeFrontmatterChange` は、書かれたままか、その整形の出力かを受理し、
YAML の値を保つことはその整形に頼ります。テストは値を読みません。
データブロックを持つテキストで効果が与えられていないときは、
`dbOfText` は Db を返しません。
データブロックが Db にすることは mermaid.js が導くもので、
テキストだけからは分からないからです。
そのときも、ブロックの書かれたテキストは確かめます。

## printer の作り

- コメントとディレクティブは、printer が印字するものの間のソースから印字します。
  Prettier のコメントの付着の仕組み（`canAttachComment`、`printComment`）で、
  ノードに付けることはしません。
  ディレクティブは名前の中にあったり、空白なしでトークンに接していたりし、
  コメントは複数行に書かれた文の中にあることがあります。
  ノードに付けると、位置が動きます。
  Prettier は一番上のノードの `comments` を読み、
  その仕組みで印字されなかったコメントごとに例外を投げるので、
  木を `FormattedDocument` のノードで包みます（`src/parser.ts`）。
- すべての図種に共通の部分は、共通のモジュールが印字します。
  `root.ts` は、フロントマターと、図の前に立つものを印字します。
  `blocks.ts` は、ブロックの文、その間のコメントとディレクティブ、
  文を区切る `;`、空行、ブロックを閉じる行を印字します。
  `atoms.ts` と `layout.ts` は、文を原子とその間の隙間として組み立てます。
  ほかに `gap.ts`、`lines.ts` があります。
  ER 図と requirement 図が共有する隙間の規則
  （クラスと名前のリスト、direction の行、アクセシビリティの文）は
  `statement-rules.ts` に、
  1 桁目を保つ `accTitle` の判定は `accessibility-lines.ts` にあります。
  Prettier の path を、printer がいるノードの型に絞る関数は
  `paths.ts` にあります。
  図種ごとに、次のファイルがあり、`blocks.ts` に `BlockRules` を渡します。
  printer は `flowchart.ts`、`sequence.ts`、`class.ts`、`state.ts`、
  `er.ts`、`gantt.ts`、`journey.ts`、`requirement.ts`、`mindmap.ts`、
  `timeline.ts`、`sankey.ts`、`xychart.ts`、`quadrant.ts`、`block.ts` です。
  文の配置は `flowchart-layout.ts`、`sequence-layout.ts`、
  `class-layout.ts`、`state-layout.ts`、`er-layout.ts`、`gantt-layout.ts`、
  `journey-layout.ts`、`requirement-layout.ts`、`mindmap-layout.ts`、
  `timeline-layout.ts`、`sankey-layout.ts`、`xychart-layout.ts`、
  `quadrant-layout.ts`、`block-layout.ts` です。
  保つ行は `flowchart-kept-lines.ts`、`sequence-kept-lines.ts`、
  `class-kept-lines.ts`、`state-kept-lines.ts`、`er-kept-lines.ts`、
  `gantt-kept-lines.ts`、`journey-kept-lines.ts`、
  `requirement-kept-lines.ts`、`mindmap-kept-lines.ts`、
  `timeline-kept-lines.ts`、`sankey-kept-lines.ts`、
  `xychart-kept-lines.ts`、`quadrant-kept-lines.ts`、
  `block-kept-lines.ts` です。
  保つ行の共通の部分は `kept-lines.ts` にあります。
  `BlockRules` は、保つ行、文の印字の終わり、文を持つ文、
  トップレベルで落とす文と、
  コメントの後の空白だけの行を残すかどうかを伝えます。
  ブロック図は、文ではなく単位を渡します。
  1 行に続く node と `space` は 1 つの単位で、その行に残ります
  （`block-layout.ts` の `groupBlockUnits`）。
- 規則は木から決めます。
  木に現れない字句の事実には明示の規則を置き、それぞれ仕様の節を指します。
  printer は、実行のときに結果を parser で読み直して確かめることはしません。
  そうした確かめは、規則の欠けを隠すだけで、規則になりません。
  規則の欠けは、生成した入力のテストが見つけます。

## 整形の fixture

fixture は整形そのものを示します。
`tests/fixtures/<diagram>/<rule>/` の下に、
整形の規則ごとに 1 つのフォルダーを置きます。
1 つの例は次のファイルからなります。

- `<example>-input.mmd`: 整形の前のテキスト。
- `<example>-output.mmd`: 整形したテキスト。
- `<example>-options.json`: 例に要るときの Prettier のオプション。

どの例にも属さないファイルや、入力のない出力やオプションのファイルがあると、
テストが失敗します。
入力の名前を変えたときに、古い出力が残らないようにするためです。
`tests/fixtures/.gitattributes` と `.editorconfig` は、行末の空白も含めて、
ファイルをバイトのとおりに保ちます。

U+2028 や U+2029 のような不可視文字を含むテキストは、
ここでは fixture にしません。
エディターは、その文字を含むファイルを開くたびに、取り除くかどうかを尋ねるので、
テストのコード（`tests/line-separators.test.ts`）に、エスケープで書きます。
その文字をそのまま持つのは、適合コーパスの fixture
（`packages/tests/fixtures/`）だけです。

例を足すときは、入力を書き、出力を書き出します。

```sh
pnpm --filter prettier-plugin-mmd run test:update
```

このコマンドはパーサーをビルドし、整形した入力と違う出力をすべて書き出します。
変わった出力は、残す前に差分として読んでください。
テストが確かめるのは、出力が安定していることと、
Db を変えないことで、整形が意図したとおりであることではありません。

## 文書と fixture

規則の文書の例は fixture の写しで、`tests/format.test.ts` は、
プラグインがそれぞれの出力を印字することと、
Db と埋め込みデータを保つことの両方を確かめます
（[テストが保つもの](#テストが保つもの)を参照）。
英語版の規則の文書は、[docs/flowchart.md](./flowchart.md)、
[docs/sequence.md](./sequence.md)、[docs/class.md](./class.md)、
[docs/state.md](./state.md)、[docs/er.md](./er.md)、
[docs/gantt.md](./gantt.md)、
[docs/journey.md](./journey.md)、[docs/requirement.md](./requirement.md)、
[docs/mindmap.md](./mindmap.md)、[docs/timeline.md](./timeline.md)、
[docs/sankey.md](./sankey.md)、[docs/xychart.md](./xychart.md)、
[docs/quadrant.md](./quadrant.md)、[docs/block.md](./block.md) です。
それらでは、
`###` の見出しが規則で、その fixture のフォルダーは、
図種のフォルダーの下の、見出しを小文字にし、空白を `-` にしたものです。
「Arrow spacing」は `arrow-spacing` です。
文書の中の例は、fixture のファイルへのリンクと `:` で終わる行、空行、
そのファイルの中身を書いた `mmd` のコードブロックです。
`tests/docs.test.ts` は次を確かめます。

- 規則の文書ごとに、その規則が、図種の fixture のフォルダーと一致すること。
- 各例が、その規則のフォルダーのファイルにリンクすること。
- 規則の文書の日本語版が、同じ規則の下に同じ例を持つこと。
  `README.ja.md` が `README.md` と同じ例を持つこと。
- 各例のブロックが、リンク先のファイルと一致すること。

fixture を変えたときは、それを載せている文書に新しい中身を写してください。
