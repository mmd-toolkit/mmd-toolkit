# 開発

英語版: [development.md](./development.md)

プラグインの言語の作りと、そのテストの方法を書きます。
プラグインは [`@mmd-toolkit/parser`](../../parser) で図を読み、
テストは [`@mmd-toolkit/tests`](../../tests) と `tests/fixtures/` の
fixture から入力を取ります。

## テストの実行

```sh
pnpm --filter eslint-plugin-mmd run test
```

リポジトリのルートでは、
`pnpm vitest run --project eslint-plugin-mmd` が同じテストを実行します。
スナップショットを書き直すには、次を実行します
（[スナップショット](#スナップショット)を参照）。

```sh
pnpm --filter eslint-plugin-mmd run test:update
```

テストは、`@mmd-toolkit/parser` と `@mmd-toolkit/tests` のビルドではなく、
ソースを import します（`vitest.config.ts` を参照）。
そのため、ビルドの手順は要りません。
プラグインのビルドと、そのソースを import して Node で動かすスクリプトは、
parser を `lib/` のビルドから読みます。
parser が変わったら、
`pnpm --filter @mmd-toolkit/parser run build` で作り直します。

## テスト

| ファイル                      | 確かめること                                                                                                                                                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `tests/language.test.ts`      | `@mmd-toolkit/tests` の適合コーパスのすべての入力を ESLint に掛ける。拒否される入力は、parser のエラーの位置で報告される。受理される入力では、ESLint が `traverseNodes` の順にノードをたどり、行、列、親が木と一致する。 |
| `tests/snapshot.test.ts`      | コーパスのいくつかの入力で、ESLint がノード、トークン、コメントをどこに見るかのスナップショット。                                                                                                                        |
| `tests/token-store.test.ts`   | parser が受理するコーパスのすべての入力で、ソースコードのトークンの方法を、木の範囲だけから求めた答えと比べる。各ノードの中、前、後のトークンとコメント、2 つのトークンの間に空白があるか。                              |
| `tests/inline-config.test.ts` | ESLint を設定するコメント（`%% eslint-disable…`、`%% eslint <規則>: <設定>`）のスナップショット。入力は `tests/fixtures/inline-config/`。                                                                                |
| `tests/markdown.test.ts`      | `tests/fixtures/markdown/` の `mermaid` と `mmd` のコードブロックを、`@eslint/markdown` のプロセッサーを通して検査する。報告は Markdown のファイルの位置になる。                                                         |
| `tests/rules/<規則>.test.ts`  | 規則ごとに、eslint-snapshot-rule-tester で、規則の文書が挙げる fixture の入力を検査する。                                                                                                                                |

規則のテストは、eslint-snapshot-rule-tester を使います
（[スナップショット](#スナップショット)を参照）。
言語のテストは、スナップショットが結果をいちばんよく示すところで使います。

テストの中の規則は、観察するだけです。
ESLint から渡されたものを報告し、
プラグインの規則が何を見るかを、テストが示すようにします。
プラグインの規則ではありません。

## スナップショット

規則のテストと、`tests/snapshot.test.ts`、`tests/inline-config.test.ts` は、
[eslint-snapshot-rule-tester](https://github.com/RunDevelopment/eslint-snapshot-rule-tester)
を使います。
スナップショットは、テストのファイルの隣の
`__snapshots__/<テストのファイル>.eslintsnap` に、
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
  スクリプト `test:update` は、
  `tests/` の下のすべての `__snapshots__` を消してテストを実行し直し、
  テスターが、ないスナップショットを書きます。
  `CI=true` なしで実行します。
- `CI=true` のときは、ないスナップショットと、
  どのテストケースも使わなくなったスナップショットが、テストを失敗させます。

テスターには、ほかに 3 つの限りがあり、入力をどこでテストするかを決めます。

- テキストを、`\n` か `\r\n` で終わる行として示します。
  単独の `\r` を持つ入力は示さず、
  `tests/language.test.ts` がその位置を確かめます。
- 致命的なメッセージのあるテストケースを失敗させます。
  拒否される入力と、ESLint が読めない設定のコメントは、
  ESLint の Linter を直接使って確かめます。
- テストする規則を `rule-to-test/<名前>` と名付けます。
  そのため、`tests/fixtures/inline-config/` の入力で規則を名指すものは、
  その id を使います。

## 言語の作り

- 行は、木と同じく、`\r\n`、単独の `\r`、`\n` で終わります
  （ast.md の Positions）。
  `TextSourceCodeBase` にはその形を渡します。
  その既定は、単独の `\r` で行を終えません。
- 列は、木と同じく 0 から数え、言語は `columnStart: 0` でそれを示します。
  ESLint はこれをパースのエラーには当てないので、
  `ParseError` の列は、報告するときに 1 から数えます。
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
  の `TokenStore` の方法
  （`getFirstToken`、`getTokenBefore`、`getTokens`、`getCommentsInside`、
  `commentsExistBetween`、`isSpaceBetween` など）を持ちます。
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
共通の規則は `src/rules/<名前>.ts` に、
図種の規則は `src/rules/<図種>/<名前>.ts` に置きます。
各ファイルは、ファイル名を camel case にした名前で、規則を 1 つ export します
（`no-ignored-text.ts` なら `noIgnoredText`）。
プラグインでの名前は、`.ts` を除いたパス（`flowchart/no-ignored-text`）です。
id は、名前空間の後にその名前を続けたもの
（`mmd/flowchart/no-ignored-text`）です。
文書は `docs/rules/<名前>.md` と `docs/rules/<名前>.ja.md` です。

名前空間は、`@mmd-toolkit` のようなスコープ付きの名前ではなく、`mmd` です。
ESLint は、`@` で始まる id を、最後の `/` でプラグインと規則に分けます。
そのため、`@mmd-toolkit/flowchart/no-ignored-text` は、
プラグイン `@mmd-toolkit/flowchart` の規則 `no-ignored-text` と読まれます。
`@` で始まらない id は、最初の `/` で分けます。

文書が挙げるものは、規則が持ちます。
`meta.docs.description` は英語の説明で、
`meta.docs.recommended` は、
`recommended` の設定がその規則を有効にするかどうかです。
規則から作るファイルは、次の 2 つのコマンドで最新に保ちます。

```sh
pnpm --filter eslint-plugin-mmd run update
pnpm --filter eslint-plugin-mmd run check:docs
```

`update` は、規則のファイルから規則の一覧 `src/rules/index.ts` を書き
（`tools/update-rules.ts`）、
続けて文書の生成する部分を書きます（`tools/update-docs.ts`）。

- `docs/rules/index.md` と `index.ja.md` の、
  `<!-- begin auto-generated rules list -->` から
  `<!-- end auto-generated rules list -->` までのすべて。
  共通の規則と図種ごとの規則の表で、説明と、
  `recommended` の設定が有効にする規則の ✅ を持ちます。
  英語の説明は `meta.docs.description`、
  日本語の説明は日本語の文書の最初の段落です。
- 各規則の文書（英日）の、題（`# mmd/<名前>`）と、
  最初の段落の後の `<!-- begin auto-generated rule notice -->` から
  `<!-- end auto-generated rule notice -->` まで。
  `recommended` の設定がその規則を有効にするかどうかを書きます。

文書のほかの部分は手で書きます。
`check:docs` は何も書かず、次のときに失敗します。
`src/rules/index.ts` か生成する部分が最新でないとき、
規則にどちらかの言語の文書がないとき、どの規則のものでもない文書があるとき、
英語の文書の最初の段落が、その規則の `meta.docs.description` でないときです。
最初の段落の中の改行は問いません。

規則を足すには、次のようにします。

1. `src/rules/` の下に、規則のファイルを足す。
   まだ実装していない規則は骨組みにする。
   骨組みは、`meta`（`type`、`docs.description`、`docs.recommended`、
   `docs.url`、`schema`、`messages`）と、ハンドラーを返さない `create` を持つ。
2. 英日の文書を書く。
   英語の文書の最初の段落は、`meta.docs.description` と一字一句同じにする。
3. `update` を実行し、続けて `check:docs` を実行する。

規則の名前を変えるには、
ファイル、その中の `ruleDocsUrl` の引数、文書を一緒に変え、
`update` を実行します。
規則を消すには、ファイルと文書を消し、`update` を実行します。
規則の説明を変えるには、
`meta.docs.description` と英語の文書の最初の段落を同じ文に変え、
日本語の文書の最初の段落も変えて、`update` を実行します。

## 規則の型

`MermaidRuleDefinition` と `MermaidRuleVisitor` は、
Mermaid のテキストの規則に型を付けます。
あるノードの型のハンドラーは、その型のノードと、その親を受け取ります。

```ts
import type { MermaidRuleDefinition } from "eslint-plugin-mmd"

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
