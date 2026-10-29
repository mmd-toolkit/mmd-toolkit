# 開発

英語版: [development.md](./development.md)

プラグインの言語の作りと、そのテストの方法を書きます。
プラグインは [`@mmd-toolkit/parser`](../../parser) で図を読み、
テストは [`@mmd-toolkit/tests`](../../tests) と `tests/fixtures/` の fixture
から入力を取ります。

## テストの実行

```sh
pnpm --filter @mmd-toolkit/eslint-plugin run test
```

リポジトリのルートでは、
`pnpm vitest run --project @mmd-toolkit/eslint-plugin`
が同じテストを実行します。
スナップショットを書き直すには、
次を実行します（[スナップショット](#スナップショット)を参照）。

```sh
pnpm --filter @mmd-toolkit/eslint-plugin run test:update
```

テストは、`@mmd-toolkit/parser` と `@mmd-toolkit/tests` のビルドではなく、
ソースを import します（`vitest.config.ts` を参照）。
そのため、ビルドの手順は要りません。
プラグインのビルドと、そのソースを import して Node で動かすスクリプトは、
parser を `lib/` のビルドから読みます。
parser が変わったら、
`pnpm --filter @mmd-toolkit/parser run build` で作り直します。

## テスト

| ファイル                           | 確かめること                                |
| ---------------------------------- | ------------------------------------------- |
| `tests/language.test.ts`           | 言語（ESLint を通す）                       |
| `tests/snapshot.test.ts`           | ESLint がノード・トークン・コメントを見る所 |
| `tests/token-store.test.ts`        | ソースコードのトークンの方法                |
| `tests/inline-config.test.ts`      | ESLint を設定するコメント                   |
| `tests/markdown.test.ts`           | Markdown のコードブロック                   |
| `tests/diagram-rules.test.ts`      | 規則のセレクター                            |
| `tests/subgraph-ids.test.ts`       | 木から求める subgraph の id                 |
| `tests/compact-range.test.ts`      | 行末をまたいで詰める範囲                    |
| `tests/removal.test.ts`            | 行全体を消す範囲                            |
| `tests/suggestion-history.test.ts` | 先の設定を消す提案                          |
| `tests/rule-cases.test.ts`         | 規則の文書の例                              |
| `tests/rule-docs.test.ts`          | 規則の文書の検査                            |
| `tests/rules-index.test.ts`        | 規則の一覧                                  |
| `tests/rules/<規則>.test.ts`       | 実装した規則ごと                            |

- `tests/language.test.ts`: `tests/language-inputs.ts`（下を参照）の入力、
  つまり `@mmd-toolkit/tests` の適合コーパスの fixture を ESLint に掛ける。
  拒否される入力は、parser のエラーの位置で報告される。
  受理される入力では、ESLint が `traverseNodes` の順にノードをたどり、行、列、
  親が木と一致する。
- `tests/snapshot.test.ts`: コーパスのいくつかの入力で、ESLint がノード、
  トークン、コメントをどこに見るかのスナップショット。
- `tests/token-store.test.ts`: `tests/language-inputs.ts` の入力のうち、
  parser が受理するもので、ソースコードのトークンの方法を、
  木の範囲だけから求めた答えと比べる。
  各ノードの中、前、後のトークンとコメント、2 つのトークンの間に空白があるか。
- `tests/inline-config.test.ts`: ESLint
  を設定するコメント（`%% eslint-disable…`、
  `%% eslint <規則>: <設定>`）のスナップショット。
  入力は `tests/fixtures/inline-config/`。
- `tests/markdown.test.ts`: `tests/fixtures/markdown/` の `mermaid` と `mmd`
  のコードブロックを、 `@eslint/markdown` のプロセッサーを通して検査する。
  報告は Markdown のファイルの位置になる。
- `tests/diagram-rules.test.ts`: 図種の規則それぞれが登録するセレクターを調べ、
  すべてがその図種のノードの型であることを確かめる。
- `tests/subgraph-ids.test.ts`: `src/utils/subgraph-ids.ts` の `subgraphIdsOf`、
  つまり木から求めた各 subgraph の Db の id を、
  id についての主張を持つコーパスの fixture（テストが名前で挙げる）で、
  mermaid.js が返した Db と比べる。
- `tests/compact-range.test.ts`: `src/utils/compact-range.ts` の
  `canCompactRange`。
  編集が 2 つの場所の間の行をつなげてよいかを答える。
  間の行が空白だけならよく、
  コメントやテキストが飲まれたり動いたりするならよくない。
- `tests/removal.test.ts`: `src/utils/removal.ts` の `removalRange`、
  つまり要素を消す行全体。
  どの規則が消すかによらず、1 行目の行末、1 行のテキスト、最終行の前の行末、
  空の `accTitle:` の後で読む値の行を確かめる。
- `tests/suggestion-history.test.ts`: 一覧にある規則について、
  その規則の invalid な入力（英語の文書の incorrect の例と、
  fixture のディレクトリの `invalid/` の入力）ごとに、
  提案 `removePrevious` を確かめる。
  消す範囲は報告の始まりを含まず、parser は結果を読め、
  規則は結果でその場所をもう報告しない。
- `tests/rule-cases.test.ts`: すべての規則の文書の例を、
  `tests/rule-cases.ts` が読むとおりに確かめる。
  どの文書にも incorrect と correct の例があり、parser がどの例も受理する。
- `tests/rule-docs.test.ts`: `pnpm run check:docs` の元になる
  `tools/rule-docs.ts` の検査。
  一覧の図種の順が文書サイトのサイドバーの順であること、
  名前が図種の名前で始まる規則がその図種の組にあること、
  英日の例の `mmd` コードブロックがどれも規則を有効にする指示で始まること。
- `tests/rules-index.test.ts`: `src/rules/index.ts` が `tools/update-rules.ts`
  の書いたとおりであり、プラグインがそれらの規則を ESLint に渡すこと。
- `tests/rules/<規則>.test.ts`: 実装した規則ごとに、
  `tests/rule-test.ts` の `testRule(name, rule)` で検査する。
  eslint-snapshot-rule-tester へ、英語の文書の例と、
  規則の fixture のディレクトリの入力を渡す。
  incorrect の例と `invalid/` の入力には報告があり、
  correct の例と `valid/` の入力には報告がないことを確かめる。
  スナップショットは、報告と、各提案が作るテキストを記録する。
  CR を持つ入力と、`pnpm run lint:chars` が調べる文字（U+2028、U+2029、
  U+00A0 など）を持つ入力は、ESLint の `RuleTester` で検査する。
  入力と提案の期待する出力は、テストのソースに、
  エスケープを使うテンプレートリテラルで書く。

言語のテストは、コーパスの全体には掛けません。
コーパスは、仕様の主張ごとに入力を 1 つ持ちます。
parser とコーパスのテストが、それを 1 つずつ確かめています。
`tests/language-inputs.ts` が、それらが掛かる fixture を、
言語がそれだけで扱う場合ごとに 1 つ挙げます。
場合は、parser が読む図、拒否するテキスト、位置が数える行終端子、
バイト順マーク、frontmatter、ノードでない部分（ディレクティブ、
印ごとのコメント、行をまたぐトークン、無視される `;`、文字列の断片）です。
テストは、各 fixture がその場合のものであることを確かめます。
別の場合を覆うには、その場合に答える fixture を足し、
覆われた場合の入力は増やしません。

規則のテストは、
eslint-snapshot-rule-tester
を使います（[スナップショット](#スナップショット)を参照）。
言語のテストは、スナップショットが結果をいちばんよく示すところで使います。

言語のテストの中の規則は、観察するだけです。
ESLint から渡されたものを報告し、プラグインの規則が何を見るかを、
テストが示すようにします。
プラグインの規則ではありません。
これらのテストと規則のテストは、
`tests/helpers.ts` の `LANGUAGE_CONFIG` から始めます。
これは規則を除いた推奨の設定で、推奨の設定が有効にする規則が、
報告を足さないようにします。

## 規則の fixture

規則のテストの入力は、
規則の fixture のディレクトリ `tests/fixtures/rules/<名前>/` にあります。
置き方は、同じテスターを使う ota-meshi の ESLint のプラグインに合わせています。
`valid/` か `invalid/` の下の `<ケース>-input.mmd` が 1 つのケースで、
下位のディレクトリにあっても読みます。
名前が `_` で始まるファイルとディレクトリは読みません。
ファイルの名前は、そのケースが何を確かめるかを言います。

- 入力のファイルは規則のテストが持ち、
  対応するコーパスの fixture は必要ありません。
  `valid/` か `invalid/` の下に置き、場合に合わせて名前を付けます。
  `flowchart/` のような下位のディレクトリに置いてもかまいません。
- fixture のファイルに、CR（単独のものも CRLF の中のものも）と、
  `pnpm run lint:chars` が調べる文字は入れません。
  その一覧は、
  [`packages/spec/docs/index.ja.md`](../../spec/docs/index.ja.md) にあります。
  そのような入力は、ESLint の `RuleTester` で検査します。
  `code` と各提案の `output` はテンプレートリテラルにし、
  入力の行終端子を保ちます。
  それらの文字はエスケープします。
  CR は `\r` と書き、CRLF は `\r` の後に実際の改行を置きます。
  U+2028、U+2029、U+00A0 は `\u2028`、`\u2029`、`\u00a0` と書きます。
  CR 以外の改行は、実際の改行で書きます。
  タブと行末の空白は、`\t` と `\u0020` で書いてもかまいません。
  そう書くと、ケースが対象にする空白がコードの中で見えます。
  行末の空白は、そのような文字ではありません。
  fixture のファイルに置き、`.editorconfig` が保ちます。
- 共通のディレクティブの規則は、コーパスの入力の名前を、
  元からの `INVALID` と `VALID` の表に残し、そのテストは、
  表を `testRule` にコーパスのケースとして渡すので、
  fixture のディレクトリを持ちません。
  エスケープが必要な入力は、`RuleTester` で検査します。

規則の文書の例もケースで、文書から読みます。
ディレクトリには写しません。

## スナップショット

規則のテストと、`tests/snapshot.test.ts`、`tests/inline-config.test.ts` は、
[eslint-snapshot-rule-tester](https://github.com/RunDevelopment/eslint-snapshot-rule-tester)
を使います。
スナップショットは、
テストのファイルの隣の `__snapshots__/<テストのファイル>.eslintsnap` に、
報告のあるテストケースごとに 1 つ書かれます。
報告のないテストケースは valid で、スナップショットを持ちません。

このテスターが対応するのは Mocha と Jest で、vitest ではありません。
`tests/setup.ts` は、テスターに Jest の道を取らせます。
そのときテスターが使うのは `afterAll` と `expect.getState().testPath` だけで、
vitest は `globals: true` でそれを用意します。
このため、次の 2 つが起きます。

- `vitest -u` ではスナップショットが更新されません。
  テスターは `--update` を `process.argv` から読み、
  それは vitest のワーカーに届かないからです。
  スクリプト `test:update` は、 `tests/` の下のすべての `__snapshots__` を消し、
  `UPDATE_SNAPSHOTS=true` でテストを実行し直し、テスターが、
  ないスナップショットを書きます。
- それ以外の実行は、パッケージで始めても、リポジトリのルートで始めても、
  シェルの `CI` が何であっても、スナップショットを書きません。
  `tests/setup.ts` が、`UPDATE_SNAPSHOTS=true` でなければ、
  テスターのために `CI=true` を設定するからです。
  ないスナップショットは、テストを失敗させます。
  どのテストケースも使わなくなったスナップショットは、
  そのような実行では報告も削除もされません。
  `test:update` はすべてのスナップショットを書き直すので、それを落とします。
- 足したケースの、ないスナップショットだけを書くには、
  パッケージで `UPDATE_SNAPSHOTS=true npx vitest run <テストファイル>`
  を実行します。
  あるスナップショットは、保たれて比べられます。

テスターには、ほかに 3 つの限りがあり、入力をどこでテストするかを決めます。

- テキストを、`\n` か `\r\n` で終わる行として示します。
  単独の `\r` を持つ入力は、規則のテストでは `RuleTester` を使い、
  `tests/language.test.ts` がその位置を確かめます。
- 致命的なメッセージのあるテストケースを失敗させます。
  拒否される入力と、ESLint が読めない設定のコメントは、
  ESLint の Linter を直接使って確かめます。
- テストする規則を `rule-to-test/<名前>` と名付けます。
  そのため、`tests/fixtures/inline-config/` の入力で規則を名指すものは、
  その id を使います。

## 言語の作り

- 行は、木と同じく、`\r\n`、単独の `\r`、
  `\n` で終わります（ast.md の Positions）。
  `TextSourceCodeBase` にはその形を渡します。
  その既定は、単独の `\r` で行を終えません。
- 列は、木と同じく 0 から数え、言語は `columnStart: 0` でそれを示します。
  ESLint はこれをパースのエラーには当てないので、 `ParseError` の列は、
  報告するときに 1 から数えます。
- parser がまだ対応していない図種は、
  ファイルの始まりでパースのエラーとして報告します。
  `UnsupportedDiagramError` は位置を持たないからです。
- 言語はオプションを持たず、
  ほかの道具が `languageOptions` に入れたものを無視します。
  eslint-snapshot-rule-tester は JavaScript のオプションをそこに入れ、
  `@eslint/markdown` の `processor` の設定も、
  すべてのコードブロックに同じことをします。
- コメントは `Root.comments` の `%%` の行です。
  そのうち、`eslint`、`eslint-disable`、`eslint-enable`、`eslint-disable-line`、
  `eslint-disable-next-line` で始まるものが ESLint を設定します。
  ディレクティブとフロントマターは設定しません。
- ソースコードは、
  [`@ota-meshi/ast-token-store`](https://github.com/ota-meshi/ast-token-store)
  の `TokenStore` の方法（`getFirstToken`、 `getTokenBefore`、`getTokens`、
  `getCommentsInside`、 `commentsExistBetween`、
  `isSpaceBetween` など）を持ちます。
  ストアが定めるとおりに、`Root.tokens` と `Root.comments` から答えます。
  トークンには、種類 `Directive` のトークンとしてディレクティブが、
  区切り（`Punctuator`）と本文（`RawText`）としてフロントマターも入ります。
  そのため、ESLint が前提とするとおり、空白と行終端子でない文字は、
  すべてトークンかコメントにあります。
  ノードの前後のトークンを見る規則は、それも見ます。
  `A%%{init: {}}%%B` では、`A` の次のトークンはディレクティブで、
  `isSpaceBetween` は `A` と `B` の間に空白を見つけません。
- `traverse()` は parser の `traverseNodes` に従い、
  `getParent()` はそのたどりで渡された親を返します。
- `recommended` の設定は、プラグインのオブジェクトそのものを登録します。
  ESLint は、同じ名前のプラグインに 2 つの違うオブジェクトがあると、
  拒否するからです。

## 規則と文書

規則は `src/rules/` の下のファイルです。
規則ごとに `src/rules/<名前>.ts` を置き、図種の規則の名前は、
その図種で始めます（`flowchart-no-ignored-text`）。
各ファイルは、ファイル名を camel case にした名前で、
規則を 1 つ export します（`flowchart-no-ignored-text.ts` なら
`flowchartNoIgnoredText`）。
プラグインでの名前は、`.ts` を除いたファイル名です。
id は、名前空間の後にその名前を続けたものです。
たとえば `@mmd-toolkit/flowchart-no-ignored-text` です。
文書は `docs/rules/<名前>.md` と `docs/rules/<名前>.ja.md` です。
規則を実装するための覚え書き（報告するものを木がどう示すかと、
それを記録する fixture）は、利用者向けの文書と分けて、
`docs/rule-notes/<名前>.md` と `docs/rule-notes/<名前>.ja.md` に置きます。

規則は、実装済みか骨組みのどちらかで、次の 3 つの事実がそれを示します。
3 つは、規則を実装するときに一緒に変わります。

| 事実                         | 実装済み   | 骨組み           |
| ---------------------------- | ---------- | ---------------- |
| `meta.messages`              | 空でない   | 空               |
| `tests/rules/<名前>.test.ts` | ある       | ない             |
| `docs/rule-notes/<名前>.md`  | 消してある | 英日の両方がある |

どれか 1 つで決まるのではありません。
規則の事実が食い違うと、`check:docs` は失敗します。

規則が `recommended` の設定に入るのは、
報告がほぼいつも直すべき誤りであるときです。
その規則が報告する所では、どこでも、
mermaid.js がテキストを書き手のつもりと違う読み方をし、
書き手がわざとそう書く書き方は報告されず、直し方ははっきりしています。
進んでいる mermaid.js の修正で変わる振る舞いに頼る規則は、入れません。
index は、設定が有効にする規則を、一覧の ✅ で示すだけです。

共通の規則の文書は、parser が対応する図種ごとの項目を持ちます。
項目の形と手順は、SKILL `eslint-plugin` にあります。

名前空間は、パッケージのスコープ `@mmd-toolkit` です。
ESLint は、`@` で始まる id を、最後の `/` でプラグインと規則に分けます。
そのため、`@mmd-toolkit/flowchart-no-ignored-text` は、
プラグイン `@mmd-toolkit` の規則 `flowchart-no-ignored-text` と読まれます。
規則の名前は `/` を持てないので、規則の図種は、id のディレクトリではなく、
名前の接頭辞で表します。

文書が挙げるものは、規則が持ちます。
`meta.docs.description` は英語の説明で、 `meta.docs.recommended` は、
`recommended` の設定がその規則を有効にするかどうかです。
規則から作るファイルは、次の 2 つのコマンドで最新に保ちます。

```sh
pnpm --filter @mmd-toolkit/eslint-plugin run update
pnpm --filter @mmd-toolkit/eslint-plugin run check:docs
```

`update` は、
規則のファイルから規則の一覧 `src/rules/index.ts`
を書き（`tools/update-rules.ts`）、
続けて文書の生成する部分を書きます（`tools/update-docs.ts`）。

- `docs/rules/index.md` と `index.ja.md` の、
  `<!-- begin auto-generated rules list -->` から
  `<!-- end auto-generated rules list -->` までのすべて。
  共通の規則と図種ごとの規則の表で、説明と、
  `recommended` の設定が有効にする規則の ✅ と、
  自動修正を持つ規則（`meta.fixable`）の 🔧 と、
  提案を出す規則（`meta.hasSuggestions`）の 💡 と、骨組みの 🚧 を持ちます。
  英語の説明は `meta.docs.description`、
  日本語の説明は日本語の文書の最初の段落です。
- 各規則の文書（英日）の、題（`# @mmd-toolkit/<名前>`）と、
  最初の段落の後の `<!-- begin auto-generated rule notice -->` から
  `<!-- end auto-generated rule notice -->` まで。
  `recommended` の設定がその規則を有効にするかどうかと、
  自動修正を持つかどうかと、提案を出すかどうかを書きます。
- 実装した規則の文書（英日）の、
  末尾の `<!-- begin auto-generated rule resources -->` から
  `<!-- end auto-generated rule resources -->` まで。
  リソースの節で、規則のソースとテストへのリンクを書きます。
  骨組みの文書にはありません。

規則の文書のすべての `mmd` コードブロックは、
`%% eslint @mmd-toolkit/<名前>: error` で始めます。
`<名前>` は `flowchart-no-undef` のような規則の名前です。
字下げせず、それだけで 1 行にし、
図のヘッダーや Mermaid のディレクティブより前に置きます。
従う例にも入れます。
サイトの `twoslash-eslint` は、このコメントで規則を有効にし、
実際の診断を表示します。
parser の受理とサイトの表示の検査では、この行も含めます。
スナップショットのテストヘルパーだけは、このコメントを除きます。
テスターが規則を `rule-to-test/` の下で有効にするため、
`@mmd-toolkit/` の下でも有効にすると、すべての報告が二重になるからです。
コーパスの fixture を整形したものと例を比べるときは、
先頭の設定コメントだけを除きます。
fixture 自体には、このコメントを足しません。

文書のほかの部分は手で書きます。
`check:docs` は何も書かず、次のときに失敗します。
`src/rules/index.ts` か生成する部分が最新でないとき、
規則にどちらかの言語の文書がないとき、
どの規則のものでもない文書か覚え書きがあるとき、英語の文書の最初の段落が、
その規則の `meta.docs.description` でないとき、
日本語の文書の `mmd` のコードブロックが、英語の文書と同じ順に同じでないとき、
コードブロックが、その規則を有効にするコメントで始まっていないとき、
規則が実装済みでも骨組みでもないときです。
最初の段落の中の改行は問いません。

規則と文書がこのように食い違うと、 `update` は `src/rules/index.ts` だけを書き、
文書の生成する部分は書かずに失敗します。
索引の一覧は日本語の説明を文書から取るので、
文書が欠けているあいだは一覧を作れないためです。
文書を直してから、`update` をもう一度実行します。

規則を足すには、次のようにします。

1. `src/rules/` の下に、規則のファイルを足す。
   まだ実装していない規則は骨組みにする。
   骨組みは、`meta`（`type`、`docs.description`、`docs.recommended`、
   `docs.url`、`schema`、`messages`）と、ハンドラーを返さない `create` を持つ。
2. 英日の文書を書く。
   英語の文書の最初の段落は、`meta.docs.description` と一字一句同じにする。
   すべての `mmd` の例を、上記の規則を有効にするコメントで始める。
3. 英日の覚え書きを書く。
4. `update` を実行し、続けて `check:docs` を実行する。

規則を実装するには、メッセージとハンドラーを持たせ、テストを足し、
覚え書きを消すことを、1 つの変更で行います。
覚え書きの fixture は、規則の fixture のディレクトリに移します。
続けて `update` を実行すると、文書のリソースの節を書き、索引の 🚧 を外します。

規則の名前を変えるには、ファイル、その中の `ruleDocsUrl` の引数、文書、
覚え書きかテストを一緒に変え、各例の ESLint コメントにある規則の id も更新して、
`update` を実行します。
規則を消すには、ファイル、文書、覚え書きかテストを消し、`update` を実行します。
規則の説明を変えるには、
`meta.docs.description` と英語の文書の最初の段落を同じ文に変え、
日本語の文書の最初の段落も変えて、`update` を実行します。

## 規則の書き方

規則がそろって読めるように、どの規則も次のとおりに書きます。

- 図種の規則は、その図種のノードの型のハンドラーだけを持ちます。
  そうすれば、ESLint はほかの図種でそれを呼びません。
  トークンやコメントを読む規則も、`Root` からではなく、
  図のノード（`FlowchartDiagram` など）のハンドラーから読みます。
  `tests/diagram-rules.test.ts` がこれを確かめます。
- 規則は、木とトークン、ノードとトークンの値を読みます。
  テキストを字句解析し直しません。
- メッセージの id は、報告するものを言う camel case の語です（`unclosed`、
  `duplicate`）。
  2 種類のものを報告する規則は、それぞれにメッセージを持ちます。
  メッセージは、mermaid.js がテキストをどう読むかを 1 文で言い、
  値は `data` で渡します（`{{line}}`）。
- 規則は、文書が名指すノードを報告します。
  ディレクティブやトークンのようにノードでないものは、その `loc` で報告します。
  トークンの値の一部は、
  `sourceCode.getLocFromIndex` で出した `loc` で報告します。
  閉じていないブロックのように、テキストの終わりまで続くものは、
  開く所を報告します。
- 規則は、自動修正を持ちません。
  規則の文書は、オプションがあるかを言い、規則がオプションを持つかは、
  rule-ideas の SKILL が決めます。
  提案は、rule-ideas の SKILL が決めたときだけ持ち（`meta.hasSuggestions`）、
  どの提案も、適用した後に mermaid.js がテキストをどう読むかを言います。
  提案は、`create` から分けた関数で組み立て、 `create` は、
  その関数が返すものを `context.report` に渡します。
  文やトークンを消す提案は、
  `src/utils/removal.ts` の `removalRange` が返す範囲を消します。
  要素と、まわりの空白か行で、空いた所を残しません。
  要素の後ろの `;` は消しません。
  前の文の区切りか、それだけで空の文であり、
  subgraph の中ではメンバーだからです。
  例外は、mermaid.js が無視する `;` です。
  これは、
  `style` 行と `classDef` 行の決まりによる `IgnoredSemicolon` のトークンで、
  `oneOfTwoRemovals` は、これを前の文と一緒に消します。
- 規則のスナップショットテストは、`testRule(name, rule)` の 1 回の呼び出しです。
  英語の文書の例と規則の fixture の入力で、報告と提案を確かめます。
  規則のテストは、mermaid.js を動かしません。
  CR を持つ入力と、`pnpm run lint:chars` が調べる文字（U+2028、U+2029、
  U+00A0 など）を持つ入力は、ESLint の `RuleTester` を使います。
  `code` に、エスケープを使うテンプレートリテラルで入力を書き、
  `errors` に期待する報告を書きます。
  各提案の `output` にも、期待するテキストの全文を、
  テンプレートリテラルで書きます。
  通常の入力では、fixture のファイルとスナップショットを使います。

## 規則の型

`MermaidRuleDefinition` と `MermaidRuleVisitor` は、
Mermaid のテキストの規則に型を付けます。
あるノードの型のハンドラーは、その型のノードと、その親を受け取ります。

```ts
import type { MermaidRuleDefinition } from "@mmd-toolkit/eslint-plugin"

const rule: MermaidRuleDefinition<{ MessageIds: "identifier" }> = {
  meta: { type: "problem", messages: { identifier: "{{name}}" } },
  create(context) {
    return {
      Identifier(node) {
        context.report({
          loc: node.loc,
          messageId: "identifier",
          data: { name: node.name },
        })
      },
    }
  },
}
```
