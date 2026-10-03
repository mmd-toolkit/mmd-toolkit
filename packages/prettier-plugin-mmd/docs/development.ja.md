# 開発

英語版: [development.md](./development.md)

プラグインのテストのしかたと、整形の例を足す、更新するしかたを説明します。
プラグインは [`@mmd-toolkit/parser`](../../parser) で図を読み、
[`@mmd-toolkit/tests`](../../tests) の補助関数で、
出力を mermaid.js と照らして確かめます。

## テストの実行

```sh
pnpm vitest run --project prettier-plugin-mmd
```

テストは `@mmd-toolkit/parser` と `@mmd-toolkit/tests` を、
ビルドではなくソースから読みます（`vitest.config.ts` を参照）。
そのため、ビルドは要りません。
plugin のソースを import して Node で動かすスクリプトは、
それらのパッケージを `lib/` のビルドから読みます。
そのため、動かす前に `pnpm --filter @mmd-toolkit/parser run build` と
`pnpm --filter @mmd-toolkit/tests run build` で作り直してください。

## テスト

| ファイル                                 | 確かめること                                                                                                                                                                                                                                               |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tests/plugin.test.ts`                   | プラグインが宣言する言語、パーサー、printer。                                                                                                                                                                                                              |
| `tests/dispatch.test.ts`                 | 図の本体が、その図種の printer に渡ること。printer のない図種と、パーサーが対応しない図種を、ファイルでも Markdown でも変えずに印字すること。                                                                                                              |
| `tests/failure.test.ts`                  | パーサーが拒否する入力を、ファイルでは構文エラーとして報告し、Markdown では Prettier に任せること。バイト順マークの制限。                                                                                                                                  |
| `tests/markdown.test.ts`                 | どの Markdown のコードブロックがプラグインに届くか。パーサーの代わりのスタブを使います。                                                                                                                                                                   |
| `tests/markdown-flowchart.test.ts`       | Markdown のコードブロックの中で整形した flowchart。トップレベル、リスト項目、引用の中と、行末の空白。                                                                                                                                                      |
| `tests/markdown-sequence.test.ts`        | Markdown のコードブロックの中で整形した sequence 図。トップレベル、リスト項目の中と、タイトルの末尾の空白。                                                                                                                                                |
| `tests/markdown-class.test.ts`           | Markdown のコードブロックの中で整形した class 図。トップレベル、リスト項目の中と、コメントの後の空白 1 つの行。                                                                                                                                            |
| `tests/markdown-state.test.ts`           | Markdown のコードブロックの中で整形した state 図。トップレベルとリスト項目の中。                                                                                                                                                                           |
| `tests/line-separators.test.ts`          | 書かれたまま残す U+2028 か U+2029 を含む state 図と sequence 図。文字はエスケープで書きます。                                                                                                                                                              |
| `tests/format.test.ts`                   | 整形の fixture ごとに、入力が出力に整形されること、出力を整形しても変わらないこと、mermaid.js が両方から同じ図を読むこと（[mermaid.js の読み方](#mermaidjs-の読み方)を参照）。                                                                             |
| `tests/corpus.test.ts`                   | `@mmd-toolkit/tests` の適合性コーパス（common、flowchart、sequence、class、state）のうち、プラグインが整形する入力すべて。もう一度整形しても変わらないこと、mermaid.js が前と後で同じ図を読むか、同じエラーで両方を拒否すること。                          |
| `tests/docs.test.ts`                     | 規則の文書と README が fixture と一致すること（[文書と fixture](#文書と-fixture) を参照）。                                                                                                                                                                |
| `tests/value-nodes.test.ts`              | printer のある図種ごとに、子の欄を持たない木の型（その図種の型と、共有する葉のノード）が、どれも、書かれたまま印字する値か、例外として挙げたもののどちらかであること。木に足された型が、意図して扱われるようにするためです。                               |
| `tests/source.test.ts`                   | printer がノードの構造のトークンとみなすもの。ディレクティブ、`;`、フロントマターのトークンは含みません。フロントマターの区切りの `---` は、flowchart の矢印と同じ種類と値です。                                                                           |
| `tests/regression.test.ts`               | 見つかって直した失敗の入力（`tests/regression/*.json`）を毎回整形します。U+2028 と U+2029 はエスケープで書きます。                                                                                                                                         |
| `tests/boundaries-<図種>.test.ts`        | ある図種のコーパスの fixture のトークンの境目に、境目の種類（前の要素、行の中の位置、後の要素。行末では文のキーワード）ごとに、ディレクティブ、ディレクティブ 2 つ、改行、テキストの後のコメント、U+2028 か U+2029、閉じていないディレクティブを挿します。 |
| `tests/statement-endings-<図種>.test.ts` | ある図種のすべての種類の文（パーサーの文のノードの型）を fixture から取り、最初の行の末尾に、同じ部品の並びを付けます。単独のときと、次の行が続くとき。                                                                                                    |
| `tests/forms-<図種>.test.ts`             | さまざまな形の文。形の軸を、2 つの軸の値のすべての組が一緒になるように組みます（`tests/pairwise.ts`）。class の関係・メンバー・文、sequence のメッセージ、state の遷移・文・別名・ノート、flowchart の端が記号のラベル。                                   |
| `tests/separators.test.ts`               | `;` が区切る・終わらせる文。すべての文の対、語で終わる文、`;` を含むテキスト、`;` を持つ行、コメントの後の `;`、語で終わる subgraph の名前、区切りの前の空の説明ブロック。                                                                                 |
| `tests/line-shapes.test.ts`              | 行の形。値の終わり、文を切るディレクティブ、改行をまたぐ文、複数行の click 文、U+2028 か U+2029 の後の style 行、文の末尾の U+2028 か U+2029 の後のコメント行（mermaid.js が 1 行として読む行）。                                                          |
| `tests/mutation.test.ts`                 | コーパスの fixture の変異（`mutate()`）。fixture の種類ごとに 3 件に 1 件、seed 1。                                                                                                                                                                        |
| `tests/sequence-newline-units.test.ts`   | `newline` の単位を要する sequence の文に、ディレクティブ・空白・`;` を付けます。                                                                                                                                                                           |
| `tests/pairwise.test.ts`                 | forms を作る pairwise の行。                                                                                                                                                                                                                               |

`boundaries-`、`statement-endings-`、`forms-`、`separators`、`line-shapes`、
`mutation`、`sequence-newline-units` のテストは入力を機械的に作り、
`tests/generated.ts` で確かめます。
パーサーが受理する入力のそれぞれについて、エラーなく整形されることと、
出力を整形しても変わらないことを確かめ、mermaid.js も受理する入力では、
mermaid.js が出力から同じ図を読むことも確かめます
（[mermaid.js の読み方](#mermaidjs-の読み方)を参照）。
入力は種類ごとに、毎回同じ方法で選ぶので、
境界と文のすべての種類が、偶然ではなく必ず試されます。
境目の種類は、
`@mmd-toolkit/tests` の `findBoundaries` と `selectByKey` が定めます。
`tests/regression.test.ts` は、見つけて直した失敗の入力を持ち、
毎回確かめます。

### mermaid.js の読み方

整形の前と後で mermaid.js が読むものを比べるテストは、
`tests/mermaid-readings.ts` で、次の 2 通りに比べます。

- 仕様が読むとおりに比べる。
  mermaid.js を、受理したテキストの読み方を変える既知の差
  `comment-takes-character`、`comment-takes-line-break`、
  `name-start-reads-unit` を取り除いて動かし
  （`runMermaidWithEmbeddedData` の `withoutDivergences`）、
  Db が同じか、両方が同じエラーで拒否されることを確かめます。
  整形が保つべき Db は仕様の Db で、
  それが mermaid.js と違うのは、既知の差が定める箇所だけだからです。
- mermaid.js のままで比べる。
  mermaid.js が整形の前のテキストを受理するときは、
  整形の後のテキストも受理し、Db が同じであることを確かめます。
  整形が、mermaid.js の描くものを変えないようにするためです。

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
  図種ごとに、次のファイルがあり、`blocks.ts` に `BlockRules` を渡します。
  printer は `flowchart.ts`、`sequence.ts`、`class.ts`、`state.ts` です。
  文の配置は `flowchart-layout.ts`、`sequence-layout.ts`、
  `class-layout.ts`、`state-layout.ts` です。
  保つ行は `flowchart-kept-lines.ts`、`sequence-kept-lines.ts`、
  `class-kept-lines.ts`、`state-kept-lines.ts` です。
  保つ行の共通の部分は `kept-lines.ts` にあります。
  `BlockRules` は、保つ行、文の印字の終わり、文を持つ文、
  トップレベルで落とす文と、
  コメントの後の空白だけの行を残すかどうかを伝えます。
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
mermaid.js が同じ図を読むことで、整形が意図したとおりであることではありません。

## 文書と fixture

英語版の規則の文書は、[docs/flowchart.md](./flowchart.md)、
[docs/sequence.md](./sequence.md)、[docs/class.md](./class.md)、
[docs/state.md](./state.md) です。
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
