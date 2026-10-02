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

| ファイル                                    | 確かめること                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tests/plugin.test.ts`                      | プラグインが宣言する言語、パーサー、printer。                                                                                                                                                                                                                                                                                                                                                                                            |
| `tests/dispatch.test.ts`                    | 図の本体が、その図種の printer に渡ること。printer のない図種と、パーサーが対応しない図種を、ファイルでも Markdown でも変えずに印字すること。                                                                                                                                                                                                                                                                                            |
| `tests/failure.test.ts`                     | パーサーが拒否する入力を、ファイルでは構文エラーとして報告し、Markdown では Prettier に任せること。バイト順マークの制限。                                                                                                                                                                                                                                                                                                                |
| `tests/markdown.test.ts`                    | どの Markdown のコードブロックがプラグインに届くか。パーサーの代わりのスタブを使います。                                                                                                                                                                                                                                                                                                                                                 |
| `tests/markdown-flowchart.test.ts`          | Markdown のコードブロックの中で整形した flowchart。トップレベル、リスト項目、引用の中と、行末の空白。                                                                                                                                                                                                                                                                                                                                    |
| `tests/markdown-sequence.test.ts`           | Markdown のコードブロックの中で整形した sequence 図。トップレベル、リスト項目の中と、タイトルの末尾の空白。                                                                                                                                                                                                                                                                                                                              |
| `tests/markdown-class.test.ts`              | Markdown のコードブロックの中で整形した class 図。トップレベル、リスト項目の中と、コメントの後の空白 1 つの行。                                                                                                                                                                                                                                                                                                                          |
| `tests/format.test.ts`                      | 整形の fixture ごとに、入力が出力に整形されること、出力を整形しても変わらないこと、mermaid.js が両方から同じ図を読むこと（[mermaid.js の読み方](#mermaidjs-の読み方)を参照）。                                                                                                                                                                                                                                                           |
| `tests/corpus.test.ts`                      | `@mmd-toolkit/tests` の適合性コーパス（common、flowchart、sequence、class）のうち、プラグインが整形する入力すべて。もう一度整形しても変わらないこと、mermaid.js が前と後で同じ図を読むか、同じエラーで両方を拒否すること。                                                                                                                                                                                                               |
| `tests/docs.test.ts`                        | 規則の文書と README が fixture と一致すること（[文書と fixture](#文書と-fixture) を参照）。                                                                                                                                                                                                                                                                                                                                              |
| `tests/value-nodes.test.ts`                 | printer のある図種ごとに、子の欄を持たない木の型（その図種の型と、共有する葉のノード）が、どれも、書かれたまま印字する値か、例外として挙げたもののどちらかであること。木に足された型が、意図して扱われるようにするためです。                                                                                                                                                                                                             |
| `tests/source.test.ts`                      | printer がノードの構造のトークンとみなすもの。ディレクティブ、`;`、フロントマターのトークンは含みません。フロントマターの区切りの `---` は、flowchart の矢印と同じ種類と値です。                                                                                                                                                                                                                                                         |
| `tests/generated-mutation.test.ts`          | コーパスの flowchart、sequence、class の fixture の変異。`mutate()` で、fixture ごとに 4 個、seed 1 で作ります。                                                                                                                                                                                                                                                                                                                         |
| `tests/generated-label-edges.test.ts`       | 空白に接して ASCII の記号で始まるか終わるラベル。ラベルを持つすべての括弧で試します。                                                                                                                                                                                                                                                                                                                                                    |
| `tests/generated-insertions.test.ts`        | コーパスの flowchart、sequence、class の fixture の、トークンの境界に挿したもの。空白を前、後ろ、両方に置く場合と置かない場合のディレクティブ、2 つのディレクティブ（接する場合と離れる場合）、改行、空行、コメント行、行のテキストの後のコメントと空白だけの行、最後のトークンの後の、空白と改行が続く閉じていないディレクティブ、flowchart では `style`・`classDef`・`linkStyle` の行の `;` です。使える境界の 64 個目ごとに挿します。 |
| `tests/generated-line-semicolons.test.ts`   | 文を区切る `;` 以外の `;` を、ラベル、文字列、アクセシビリティ文に含む行。`style` を含む行と含まない行、1 文だけの行と同じ行に別の文がある行。                                                                                                                                                                                                                                                                                           |
| `tests/generated-statement-pairs.test.ts`   | flowchart と sequence の、あらゆる種類の文と、文を始める語を id にしたものの 2 つを `;` でつないだもの。トップレベルとブロックの中で試します。class 図には、文を区切る `;` がありません。                                                                                                                                                                                                                                                |
| `tests/generated-sequence-messages.test.ts` | さまざまな形の sequence のメッセージ。空白、`-`、`/`、括弧、`#` を含む id と数の形の id、矢印のどちらかの側に置いた、キーワードの綴りや数の形に近い綴りの id、すべての矢印、矢印の隣の `()`・`+`・`-`、矢印の両側の空白の有無、`%%` や折り返しの接頭辞で始まるテキストです。                                                                                                                                                             |
| `tests/generated-class-forms.test.ts`       | さまざまな形の class の文。あらゆる形の名前の間の関係を、すべての矢印、矢印の周りと中の空白の有無、カーディナリティ、ラベル（空白だけのラベルと、`;` を含む行のラベルを含む）で試します。メンバー文と、ラベル、CSS クラスか注釈、総称型、メンバーの本体を持つクラス文も、トップレベルと namespace の中で試します。                                                                                                                       |

`generated-` のテストは入力を機械的に作り、`tests/generated.ts` で確かめます。
パーサーが受理する入力のそれぞれについて、エラーなく整形されることと、
出力を整形しても変わらないことを確かめ、mermaid.js も受理する入力では、
mermaid.js が出力から同じ図を読むことも確かめます
（[mermaid.js の読み方](#mermaidjs-の読み方)を参照）。
入力の選び方は毎回同じで、全体で数分かかります。

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

### 大きな実行

生成した入力のテストの大きさは、2 つの環境変数で決めます。
大きな確認のためにテストを書き換えずに済むようにするためです。
`tests/generated.ts` が読み、正の整数でない値が設定されていると例外を投げます。

| 変数                         | 既定 | 意味                                     |
| ---------------------------- | ---- | ---------------------------------------- |
| `MMD_GENERATED_SAMPLE_EVERY` | 64   | 挿入のテストは n 個目ごとの境界に挿す    |
| `MMD_MUTANTS_PER_FIXTURE`    | 4    | 変異のテストは fixture ごとに n 個を作る |

`MMD_GENERATED_SAMPLE_EVERY` を 1 にすると、
挿入のテストはすべてのトークンの境界に挿し、数時間かかります。
テストの時間の上限は、大きさに合わせて長くなります。
各テストは件数を注記として残し、verbose の表示に出ます。

```sh
MMD_GENERATED_SAMPLE_EVERY=1 MMD_MUTANTS_PER_FIXTURE=30 pnpm vitest run --project prettier-plugin-mmd tests/generated- --reporter=verbose
```

背景で実行し、コードを変えたら実行し直します。
変える前に始めた実行は、そのときのコードを確かめています。

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
  図種ごとに、printer（`flowchart.ts`、`sequence.ts`、`class.ts`）、
  文の配置（`flowchart-layout.ts`、`sequence-layout.ts`、`class-layout.ts`）、
  保つ行（`flowchart-kept-lines.ts`、`sequence-kept-lines.ts`、
  `class-kept-lines.ts`）があり、
  `blocks.ts` に `BlockRules` を渡します。
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
[docs/sequence.md](./sequence.md)、[docs/class.md](./class.md) です。
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
