---
name: eslint-plugin-rules
description:
  Implement, change, or remove a rule of eslint-plugin-mmd (the rule file under
  src/rules/, its messages and suggestions, its tests and fixtures). Use when a
  rule has been decided with the rule-ideas skill and is to be implemented, when
  the condition, the messages, or the suggestions of a rule change, and when the
  tests or the fixtures of a rule are added. The documents of the rules are in
  the eslint-plugin skill.
---

# 規則の実装（eslint-plugin-rules）

`eslint-plugin-mmd` の規則を実装、変更、削除する手順。
規則が報告するものが、固定した mermaid.js についての事実であり、
規則が、道具が使う形で木を読むようにする。
パッケージの構成、どの規則も従う選択、テストと fixture は、
`packages/eslint-plugin-mmd/docs/development.md` に書いてあり、
この手順はそれを写さない。
この手順が足すのは、作業そのものの決まり、
つまり、何を、どの順で確かめ、何を報告するかである。

## 1. 最初に読むもの

1. 規則についての決定。rule-ideas の SKILL
   （`.claude/skills/rule-ideas/SKILL.md`）で決まる。
   規則を持つこと、名前と範囲、`recommended` で有効にするか、提案を持つか。
   これらはここでは決めない。
   実装してみて、決定が成り立たないと分かったら
   （条件が木から読めない、提案が確かめられない、など）、
   別の決定をせずに、その根拠を持って決定に戻る。
2. まだ実装していない間は規則の覚え書き
   （`docs/rule-notes/<規則のパス>.md`）。
   それと、テストが読む例を持つ、規則の英語の文書。
3. SKILL `eslint-plugin`（`.claude/skills/eslint-plugin/SKILL.md`）の
   「方針と基準」の節と、SKILL `conventions`。
4. 木の定義: `packages/spec/docs/ast.md` と
   `packages/spec/docs/ast/<図種>.md`。
5. `packages/eslint-plugin-mmd/docs/development.md` の
   Writing a rule、The fixtures of the rules、Snapshots、
   Rules and their documents。

## 2. 規則とは独立に、事実を確かめる

規則が報告するものは、mermaid.js についての事実である。
規則は自分自身の証拠にならない。
そこで、規則を書く前と書いた後に、規則を使わない方法で事実を確かめる。

- 事実を、mermaid.js だけで言えるように定める。
  文を取り除いた Db、Db の関数が受け取る値、入力を受理するか、など。
  Db の要約が事実を隠すときは、それを受け取る Db の関数を包み、
  渡された値を記録する。
- 規則の主張ごとに、その主張が分ける場合ごとの入力で確かめる。
  主張は、報告する条件、しない条件、メッセージ、提案である。
  規則の文書と、それを決めたメモの文ごとに、
  その文が分ける場合
  （誤りがどの文の中にあるか、行のどこか、隣に区切りや空白があるか、
  どの文脈の中か）と、
  その文が名指す場所で出会う言語の規則
  （ディレクティブ、無視される `;`、コメントの行、空の行、行区切り、
  空の説明ブロック）を挙げる。
  場合ごとに、規則の fixture である入力を 1 つ与え、場合の名前を付ける。
  各入力で mermaid.js を 1 回動かし、
  規則の報告を、その振る舞いと両方向で比べる。
  報告されない誤りと、誤りではない報告である。
  mermaid.js が拒否する場合には、fixture を付けない。
  乱数や数で入力を選ばず、入力を生成する命令も使わない。
  比べで見つけた失敗は、その場合の fixture（4 節）で閉じ、
  仕様がその読み方を述べていなければ、仕様の文でも閉じる。
  報告には、読んだ文と、足した入力を書く。
- 図のどこにあってもよい定義に条件が依る規則
  （id、文が作る頂点など）には、
  定義が使う所の後にある入力と前にある入力、
  それを作る文が、名指す文の前にある入力と後ろにある入力が要る。
  それぞれを mermaid.js で確かめる。
- mermaid.js を動かす、テキストを parse するスクリプトは、
  rule-ideas の SKILL の 4 節にある。
  下のスクリプトは、テストと同じように 1 つの規則でテキストを lint し、
  提案をそれぞれ当てる。
  それらのスクリプトと同じく、
  `<repo>` はリポジトリのルートの絶対パスに置き換える。
  スクリプトはリポジトリの外に置き、`node <ファイル>` で動かす。
  `tsx` は使わない。
  mermaid.js の呼び出しは直列で遅い。
  長くかかる確かめはバックグラウンドで動かし、出力をファイルに書き、
  一部ではなく、件数を読む。

  ```ts
  import { Linter } from "<repo>/packages/eslint-plugin-mmd/node_modules/eslint/lib/api.js"
  import plugin from "<repo>/packages/eslint-plugin-mmd/src/index.ts"

  const linter = new Linter({ configType: "flat" })
  const config = {
    ...plugin.configs.recommended,
    rules: { "mmd/flowchart/no-empty-description-block": "error" },
  }
  const text = "flowchart LR\n  A accDescr {}\n"
  for (const message of linter.verify(text, config, "probe.mmd")) {
    console.log(message.ruleId, message.line, message.column, message.message)
    for (const suggestion of message.suggestions ?? []) {
      const { range, text: replacement } = suggestion.fix
      const applied =
        text.slice(0, range[0]) + replacement + text.slice(range[1])
      console.log(" suggestion:", JSON.stringify(applied))
    }
  }
  ```

## 3. 規則を書く

- `docs/development.md` の Writing a rule に従う。
  規則の採否、範囲、`recommended`、提案を持つかは rule-ideas の SKILL から来る。
  規則に fix はない。
- 提案は、`create` から分けた関数で組み立てる。
  提案の結果を、4 節の fixture で mermaid.js で確かめる。
  場合ごとの入力に当て、
  parser がそのテキストを受理すること、
  Db がメッセージの言うものであること（書き手のつもりどおりのテキストの Db）、
  規則の報告が減ることを確かめる。
  メッセージは、提案を出すすべての場合に、当てた後に真であることを言う。
  提案ごとの主張は、`testRule` のオプション `claims` に書く。
  テストが出力を mermaid.js で読み、主張を確かめる。
  主張は、メッセージの言うことをすべて言う
  （説明の値、文として読まれるテキスト、テキストの中の行が 1 つ減ること）。
  固定した mermaid.js の Db がメッセージの言うことを示さないときは、
  主張を弱めずに、tests パッケージにそれを記録するよう頼む。
- 別のものを書く前に、`src/utils/` の補助を使う。
  補助が持つ前提を新しい規則が破るときは、テキストではなく木から読んで決め、
  その補助を使うほかの規則も確かめ直す。
- 1 つの判断は 1 か所に。
  1 回しか使わないもの、名前を付けても意味が増えないものを定数にしない。
  決して成り立たない確かめを残さない（仕様で確かめる）。
  オペランドの選び方を 1 つにすれば要らなくなる分岐を、繰り返さない。
  規則を整えるよう頼まれたら、短くではなく、賢くする。
  目的は、判断が 1 度だけされることで、行数ではない。
  振る舞いが変わっていないことは、スナップショットに加えて、
  古い版と新しい版を同じ fixture に当て、
  報告と提案を比べて示す。
- 自分のコードの欠陥は、言われるのを待たずに直す。
  自分に決められた設計への異論は、実装の前に、コードを開いて 1 度だけ述べる。
  答えが変わらなければ、頼まれたものを実装する。

## 4. テストと fixture

- 規則のテストは `testRule` の 1 回の呼び出しである
  （`docs/development.md`）。
  英語の文書の例がケースで、fixture のディレクトリの入力がほかのケースである。
- 規則のテストは、どの入力がどの場合かを示す。
  オプション `sentences` に、英語の文書の、振る舞いを定める文ごとに、
  その一節（一字一句そのまま）、
  その文が分ける場合（言葉で）、場合ごとの入力を並べる
  （`docs/development.md`）。
  文と場合と入力は、fixture と同じ変更で足す。
  文書の文に項目がないこと、場合に入力がないことは、
  レビューが探す欠けである。
- eslint-plugin の SKILL に従い、従う例も反する例も、
  先頭の `%% eslint mmd/<規則>: error` コメントを残す。
  parser とサイトの検査は、このコメントを含めて読む。
  スナップショットのテストヘルパーだけは、テスターの別名と `mmd/` で
  規則を二重に有効にしないよう、このコメントを除く。
  規則の名前を変えるときは、英日の文書のコメントも更新する。
- 振る舞いが変わるとき
  （条件を広げる、狭める、メッセージや提案を変える）は、
  その変更の中で、変更の fixture を足す。
  足す前に、入力ごとに mermaid.js で確かめる。
  スクラッチのファイルでの確かめは、リポジトリの fixture の代わりにならない。
- 規則の fixture の入力は、コーパスの fixture の入力の写し
  （バイト単位で同じ）で、mermaid.js の読み方が記録されている。
  コーパスにない入力は、コーパスを持つ tests パッケージに頼む。
  入力と、それが答える文書の主張を渡す。
  tests パッケージは `pnpm run fixtures:add` で足し、
  それは mermaid.js の振る舞いを記録し
  （`packages/tests/docs/maintaining-fixtures.md`）、
  parser が木を記録する。
  fixture の名前が届いたら、その `expected.json` を読み、
  入力の写しを、規則の fixture のディレクトリの
  `valid/<図種>/` か `invalid/<図種>/` に、その名前で置く。
  届くまでは、報告に、足している入力として挙げる。
  fixture のファイルに、`pnpm run lint:chars` が調べる文字は入れない。
  それが要る入力は、コーパスの fixture で、規則のテストが名前で読む。
- スナップショットは `test:update`（`CI=true` なしで）で作り直す。
  新しいスナップショットを古いものと比べ、差のそれぞれを説明する。
  意図しない差は欠陥である。

### 回すテスト

SKILL `conventions` の決まり（テストの実行）に従う。
作業の途中は、変更が影響しうるテストのファイルだけを回し
（`packages/eslint-plugin-mmd` で `npx vitest run <ファイル>`）、
全体は、作業の完了を報告する前に 1 回だけ回す。

| 変えたもの                                              | 回すテストのファイル                                                                                                                              |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 規則のファイル `src/rules/<パス>.ts`                    | `tests/rules/<パス>.test.ts`                                                                                                                      |
| 図種の規則のハンドラー                                  | 上と同じ、それと `tests/diagram-rules.test.ts`                                                                                                    |
| `src/utils/` の補助                                     | それを import する規則のテスト（import を探す）。`subgraph-ids.ts` は `tests/subgraph-ids.test.ts`、`text-nodes.ts` は `tests/text-nodes.test.ts` |
| 規則の fixture のディレクトリ                           | `tests/rules/<パス>.test.ts` と `tests/rule-fixtures.test.ts`                                                                                     |
| 規則の英語の文書の例                                    | `tests/rules/<パス>.test.ts` と `tests/rule-cases.test.ts`                                                                                        |
| 規則の追加、改名、削除                                  | その規則の上のテストと、`tests/rules-index.test.ts`                                                                                               |
| `tests/rule-test.ts`、`tests/rule-cases.ts`             | `tests/rules/**/*.test.ts` のすべて、`tests/rule-cases.test.ts`、`tests/suggestion-claims.test.ts`                                                |
| `src/language.ts`、`src/source-code.ts`、トークンストア | `tests/language.test.ts`、`tests/token-store.test.ts`、`tests/snapshot.test.ts`、`tests/inline-config.test.ts`、`tests/markdown.test.ts`          |
| parser（プラグインが読むノードが変わったとき）          | 上の言語のテスト、`tests/diagram-rules.test.ts`、そのノードを読む規則のテスト                                                                     |

文書を読むテストは、`tests/rule-cases.test.ts` と、
`tests/rules/**/*.test.ts` のすべて（規則の英語の文書の例を読む）、
それに、規則の文書と索引を読む `pnpm run check:docs` である。
文書の変更でこれらを回すのは、これらが読むものを変えたとき、
つまり例、最初の段落、規則のファイルを変えたときだけである。

言語のテストは、
`tests/language.test.ts`、`tests/token-store.test.ts`、
`tests/diagram-rules.test.ts` で、
`tests/language-inputs.ts` の fixture、
つまり言語がそれだけで扱う場合ごとの 1 つに掛ける。
言語、ソースコード、図種のハンドラー、parser に変更が及ぶときに回し、
規則 1 つの変更のたびには回さない。

テストの入力はコーパスと規則の fixture のディレクトリから取り、
mermaid.js の読み方は、コーパスの fixture の `expected.json` から取る。
提案が作ったテキストは、実装のテキストでコーパスにはない。
`testRule` が mermaid.js で読み、提案の主張と照らす
（オプション `claims` と `docs/development.md`）。
コーパスの入力の写しでない入力は、入力の Db も mermaid.js で読む。
fixture が示す主張は、テストが保つ。
2 節の確かめが fixture のない場合を見つけたら、
作業の完了を報告する前に fixture を足す。

## 5. 変更を仕上げる

- 規則をいま実装するとき:
  メッセージとハンドラーを与え、テストを足し、
  覚え書きの fixture を規則の fixture のディレクトリに移し、
  覚え書きを英日とも取り除く。これを同じ変更の中で行う。
  `recommended` は決定のとおりにする。
  それから `update` と `check:docs` を動かす。
- 規則の振る舞いを変えたら、英語の文書と日本語の文書も一緒に直す
  （SKILL `eslint-plugin`）。
- 作業の完了を報告する前に、次の検査を 1 回動かし、
  変更による失敗でないものは、そう言う
  （作業の途中は、上の表のとおり、変更が影響しうるものだけを回す）。
  - `packages/eslint-plugin-mmd` の中で、
    `CI=true npx vitest run`（テストの全体）と `pnpm run check:docs`。
  - リポジトリのルートから、`npx eslint packages/eslint-plugin-mmd`
    （パッケージの中で動かす ESLint は、ルートの設定を読まない）、
    `pnpm run lint:docs`、`pnpm run lint:chars`、`pnpm run format:check`、
    `npx tsc --noEmit`。
- 共有の作業ツリーで、コミットも push も、ステージの変更もしない。
  `rm` と `mv` をそのまま使う。作業用のファイルはリポジトリの外に置く。

## 6. 報告

結果を、頼んだ人に報告する。
主張ごとに、動かして確かめたか、読んで確かめたか、確かめていないかを言う。
変わったもの（規則、fixture、スナップショット。差ごとに理由を付ける）、
読んだ文と足した入力（tests に頼んで足している入力を含む）、
何を回し何を回していないか（テストと検査）、
まだ開いているものと確かめていないものを出す。
結果をレビューに掛け、指摘を直し、また報告する。
これを、レビューが何も指摘しなくなるまで続ける（7 節）。

## 7. review の指摘を直す

1 つの項目で何回も繰り返すのは、何かがうまくいっていない印である。
指摘の 1 点だけを塞ぐ直しか、review が 1 回で言い切っていないか、である。
そこで、指摘ごとに次のことをする。

1. 指摘が正しいかを、コードを開き、mermaid.js で確かめる（2 節）。
   正しくなければ、直さずに、根拠を付けて返す。
2. 直す前に、その指摘が属する種類を挙げる。
   同じ誤りがほかの規則、ほかの図種、入力のほかの形にないか。
   同じ言い方がほかの文書にないか。
   指摘の 1 点だけでなく、種類ごと直す。
3. 報告の前に、直しが新しく許すもの、変えるものを確かめる。
   振る舞いを変える直しは、4 節の fixture で mermaid.js と照らす。
   文書の直しは、同じ言い方がほかの場所に残っていないかを探す。
4. 報告に、直しが影響しうる範囲と、それをどう確かめたかを書く。
