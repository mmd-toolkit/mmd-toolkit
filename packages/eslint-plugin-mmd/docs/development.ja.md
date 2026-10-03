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

| ファイル                      | 確かめること                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tests/language.test.ts`      | `@mmd-toolkit/tests` の適合コーパスのすべての入力を ESLint に掛ける。拒否される入力は、parser のエラーの位置で報告される。受理される入力では、ESLint が `traverseNodes` の順にノードをたどり、行、列、親が木と一致する。                                                                                                                                                                                                                                                                                                   |
| `tests/snapshot.test.ts`      | コーパスのいくつかの入力で、ESLint がノード、トークン、コメントをどこに見るかのスナップショット。                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `tests/token-store.test.ts`   | parser が受理するコーパスのすべての入力で、ソースコードのトークンの方法を、木の範囲だけから求めた答えと比べる。各ノードの中、前、後のトークンとコメント、2 つのトークンの間に空白があるか。                                                                                                                                                                                                                                                                                                                                |
| `tests/inline-config.test.ts` | ESLint を設定するコメント（`%% eslint-disable…`、`%% eslint <規則>: <設定>`）のスナップショット。入力は `tests/fixtures/inline-config/`。                                                                                                                                                                                                                                                                                                                                                                                  |
| `tests/markdown.test.ts`      | `tests/fixtures/markdown/` の `mermaid` と `mmd` のコードブロックを、`@eslint/markdown` のプロセッサーを通して検査する。報告は Markdown のファイルの位置になる。                                                                                                                                                                                                                                                                                                                                                           |
| `tests/diagram-rules.test.ts` | 図種ごとの規則を、parser が受理するコーパスの入力のうち、ほかの図種のものすべてに掛け、何も報告しないことを確かめる。                                                                                                                                                                                                                                                                                                                                                                                                      |
| `tests/rule-cases.test.ts`    | すべての規則の文書の例を、`tests/rule-cases.ts` が読むとおりに確かめる。どの文書にも incorrect と correct の例があり、parser がどの例も受理する。                                                                                                                                                                                                                                                                                                                                                                          |
| `tests/rule-fixtures.test.ts` | 規則の fixture のディレクトリを確かめる。どれも規則に属し、コーパスの入力の写しは、コーパスとバイト単位で同じである。                                                                                                                                                                                                                                                                                                                                                                                                      |
| `tests/rules/<規則>.test.ts`  | 実装した規則ごとに、`tests/rule-test.ts` の `testRule(name, rule)` で検査する。eslint-snapshot-rule-tester で、`tests/rule-cases.ts` の `ruleCases` が返すケース（英語の文書の例。incorrect の例は invalid、correct の例は valid。それと、規則の fixture のディレクトリの入力）を検査する。提案を出す規則では、invalid の各ケースの提案を 1 つずつ当て、その結果を parser が受理し、その規則の報告が減り、実装したほかの規則の報告が増えないことも確かめる。提案とその結果のテキストは、テスターのスナップショットに出る。 |

規則のテストは、eslint-snapshot-rule-tester を使います
（[スナップショット](#スナップショット)を参照）。
言語のテストは、スナップショットが結果をいちばんよく示すところで使います。

言語のテストの中の規則は、観察するだけです。
ESLint から渡されたものを報告し、
プラグインの規則が何を見るかを、テストが示すようにします。
プラグインの規則ではありません。
これらのテストと規則のテストは、
`tests/helpers.ts` の `LANGUAGE_CONFIG` から始めます。
これは規則を除いた推奨の設定で、
推奨の設定が有効にする規則が、報告を足さないようにします。

## 規則の fixture

規則のテストの入力は、規則の fixture のディレクトリ
`tests/fixtures/rules/<名前>/` にあります。
置き方は、同じテスターを使う ota-meshi の ESLint のプラグインに合わせています。
`valid/` か `invalid/` の下の `<ケース>-input.mmd` が 1 つのケースで、
下位のディレクトリにあっても読みます。
名前が `_` で始まるファイルとディレクトリは読みません。
ファイルの名前は、そのケースが何を確かめるかを言います。

- mermaid.js の振る舞いを記録した入力は、適合コーパスの fixture の入力の写しで、
  `valid/<図種>/` か `invalid/<図種>/` の下に、
  コーパスの fixture の名前で置きます。
  `invalid/flowchart/db-acc-descr-unclosed-replaces-input.mmd` は、
  `@mmd-toolkit/tests` の `flowchart/db-acc-descr-unclosed-replaces` の入力で、
  mermaid.js の読み方はその `expected.json` にあります。
  `tests/rule-fixtures.test.ts` が、写しをコーパスと同じに保ちます。
- 規則のためだけに書いた入力（条件の境目など）は、
  `valid/` か `invalid/` の直下に置きます。
- fixture のファイルに、`pnpm run lint:chars` が調べる文字
  （一覧は [`packages/spec/docs/index.ja.md`](../../spec/docs/index.ja.md)）は
  入れません。
  それが要るコーパスの fixture は写しません。
  テストがそうした文字を含む入力を要するときは、
  テストのコードか JSON の fixture に、エスケープで書きます。
  実際の文字を含む `.mmd` のファイルは置きません。

規則の文書の例もケースで、文書から読みます。
ディレクトリには写しません。

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
規則を実装するための覚え書き
（報告するものを木がどう示すかと、それを記録する fixture）は、
利用者向けの文書と分けて、
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
  `recommended` の設定が有効にする規則の ✅ と、
  提案を出す規則（`meta.hasSuggestions`）の 💡 と、骨組みの 🚧 を持ちます。
  英語の説明は `meta.docs.description`、
  日本語の説明は日本語の文書の最初の段落です。
- 各規則の文書（英日）の、題（`# mmd/<名前>`）と、
  最初の段落の後の `<!-- begin auto-generated rule notice -->` から
  `<!-- end auto-generated rule notice -->` まで。
  `recommended` の設定がその規則を有効にするかどうかと、
  提案を出すかどうかを書きます。
- 実装した規則の文書（英日）の、末尾の
  `<!-- begin auto-generated rule resources -->` から
  `<!-- end auto-generated rule resources -->` まで。
  リソースの節で、規則のソースとテストへのリンクを書きます。
  骨組みの文書にはありません。

文書のほかの部分は手で書きます。
`check:docs` は何も書かず、次のときに失敗します。
`src/rules/index.ts` か生成する部分が最新でないとき、
規則にどちらかの言語の文書がないとき、
どの規則のものでもない文書か覚え書きがあるとき、
英語の文書の最初の段落が、その規則の `meta.docs.description` でないとき、
日本語の文書の `mmd` のコードブロックが、
英語の文書と同じ順に同じでないとき、
規則が実装済みでも骨組みでもないときです。
最初の段落の中の改行は問いません。

規則と文書がこのように食い違うと、
`update` は `src/rules/index.ts` だけを書き、
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
3. 英日の覚え書きを書く。
4. `update` を実行し、続けて `check:docs` を実行する。

規則を実装するには、メッセージとハンドラーを持たせ、テストを足し、
覚え書きを消すことを、1 つの変更で行います。
覚え書きの fixture は、規則の fixture のディレクトリに移します。
続けて `update` を実行すると、文書のリソースの節を書き、
索引の 🚧 を外します。

規則の名前を変えるには、
ファイル、その中の `ruleDocsUrl` の引数、文書、覚え書きかテストを一緒に変え、
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
- メッセージの id は、報告するものを言う camel case の語です
  （`unclosed`、`duplicate`）。
  2 種類のものを報告する規則は、それぞれにメッセージを持ちます。
  メッセージは、mermaid.js がテキストをどう読むかを 1 文で言い、
  値は `data` で渡します（`{{line}}`）。
- 規則は、文書が名指すノードを報告します。
  ディレクティブやトークンのようにノードでないものは、その `loc` で報告します。
  トークンの値の一部は、
  `sourceCode.getLocFromIndex` で出した `loc` で報告します。
  閉じていないブロックのように、テキストの終わりまで続くものは、
  開く所を報告します。
- 規則は、オプションと自動修正を持ちません。
  提案は、rule-ideas の SKILL が決めたときだけ持ち（`meta.hasSuggestions`）、
  どの提案も、適用した後に mermaid.js がテキストをどう読むかを言います。
  提案は、`create` から分けた関数で組み立て、
  `create` は、その関数が返すものを `context.report` に渡します。
  文やトークンを消す提案は、
  `src/utils/removal.ts` の `removalRange` が返す範囲を消します。
  要素と、まわりの空白か行で、空いた所を残しません。
  要素の後ろの `;` は消しません。
  前の文の区切りか、それだけで空の文であり、
  subgraph の中ではメンバーだからです。
- 規則のテストは、`testRule(name, rule, revealed)` の 1 回の呼び出しです。
  第 3 引数は、提案が報告を見えるようにしうる規則を挙げます。
  テキストがすでに持っていて、書き換えが見えるようにした誤りです。
  既定は `{ kind: "none" }` で、
  `{ kind: "rules", rules }` は規則ごとに示す誤りを添え、
  `{ kind: "anyRule", because }` は理由を添えます。
  ほかの規則の報告が、提案の後で増えると、テストは失敗します。

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
