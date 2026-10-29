---
name: eslint-plugin-rules
description:
  Implement, change, or remove a rule of @mmd-toolkit/eslint-plugin (the rule
  file under src/rules/, its messages and suggestions, its tests and fixtures).
  Use when a rule has been decided with the rule-ideas skill and is to be
  implemented, when the condition, the messages, or the suggestions of a rule
  change, and when the tests or the fixtures of a rule are added. The documents
  of the rules are in the eslint-plugin skill.
---

# 規則の実装（eslint-plugin-rules）

`@mmd-toolkit/eslint-plugin` の規則を実装、変更、削除する手順。
規則が報告するものが、固定した mermaid.js についての事実であり、規則が、
道具が使う形で木を読むようにする。
パッケージの構成、どの規則も従う選択、テストと fixture は、
`packages/eslint-plugin/docs/development.md` に書いてあり、
この手順はそれを写さない。
この手順が足すのは、作業そのものの決まり、つまり、何を、どの順で確かめ、
何を報告するかである。

## 1. 最初に読むもの

1. 規則についての決定。
   rule-ideas の SKILL （`.claude/skills/rule-ideas/SKILL.md`）で決まる。
   規則を持つこと、名前と範囲、`recommended` で有効にするか、提案を持つか。
   これらはここでは決めない。
   実装してみて、決定が成り立たないと分かったら（条件が木から読めない、
   提案が確かめられない、など）、別の決定をせずに、その根拠を持って決定に戻る。
2. まだ実装していない間は規則の覚え書き（`docs/rule-notes/<名前>.md`）。
   それと、テストが読む例を持つ、規則の英語の文書。
3. SKILL `eslint-plugin` の「方針と基準」の節と、 SKILL `conventions`。
   前者は `.claude/skills/eslint-plugin/SKILL.md` にある。
4. 木の定義: `packages/spec/docs/ast.md` と `packages/spec/docs/ast/<図種>.md`。
5. `packages/eslint-plugin/docs/development.md` の Writing a rule、
   The fixtures of the rules、Snapshots、 Rules and their documents。

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
  その文が分ける場合（誤りがどの文の中にあるか、行のどこか、
  隣に区切りや空白があるか、どの文脈の中か）と、
  その文が名指す場所で出会う言語の規則（ディレクティブ、無視される `;`、
  コメントの行、空の行、行区切り、空の説明ブロック）を挙げる。
  場合ごとに、規則の fixture である入力を 1 つ与え、場合の名前を付ける。
  各入力で mermaid.js を 1 回動かし、規則の報告を、
  その振る舞いと両方向で比べる。
  報告されない誤りと、誤りではない報告である。
  mermaid.js が拒否する場合には、fixture を付けない。
  乱数や数で入力を選ばず、入力を生成する命令も使わない。
  比べで見つけた失敗は、その場合の fixture（4 節）で閉じ、
  仕様がその読み方を述べていなければ、仕様の文でも閉じる。
  報告には、読んだ文と、足した入力を書く。
- 図のどこにあってもよい定義に条件が依る規則（id、文が作る頂点など）には、
  定義が使う所の後にある入力と前にある入力、それを作る文が、
  名指す文の前にある入力と後ろにある入力が要る。
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
  import { Linter } from "<repo>/packages/eslint-plugin/node_modules/eslint/lib/api.js"
  import plugin from "<repo>/packages/eslint-plugin/src/index.ts"

  const linter = new Linter({ configType: "flat" })
  const config = {
    ...plugin.configs.recommended,
    rules: { "@mmd-toolkit/flowchart-no-empty-description-block": "error" },
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
  4 節の fixture で、結果のテキストがメッセージの言うものかを確かめる。
  スナップショットは、各提案と、その出力の全文を記録する。
  `RuleTester` の場合は、提案の `output` にその出力を書く。
  メッセージは、提案を出すすべての場合に、当てた後に真であることを言う。
  その読み方は、2 節のとおり、規則とは独立に確かめる。
  規則のテストは mermaid.js を動かさない。
  候補の条件が、rule-ideas の記録（8 節）が与える文で書けないときは、
  その候補を rule-ideas に戻す。
  提案を出さないことは、普通の結論である。
  条件や確かめを足して候補を守ってはならず、結果を parse したり、
  既知の相違ごとに判定したりしてもならない。
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
  古い版と新しい版を同じ fixture に当て、報告と提案を比べて示す。
- 自分のコードの欠陥は、言われるのを待たずに直す。
  自分に決められた設計への異論は、実装の前に、コードを開いて 1 度だけ述べる。
  答えが変わらなければ、頼まれたものを実装する。

## 4. テストと fixture

- 規則のスナップショットテストは、
  `testRule(name, rule)` の 1 回の呼び出しである（`docs/development.md`）。
  英語の文書の例と規則の fixture の入力がケースで、報告の有無と、
  各提案が作るテキストを確かめる。
- 入力は、確かめる場合に合わせて名前を付け、
  規則の文書の文が分ける場合ごとに入力を持つ。
  レビューでは、文と場合を照らす。
  テストに、文書と入力を対応させる別の表は置かない。
- eslint-plugin の SKILL に従い、従う例も反する例も、
  先頭の `%% eslint @mmd-toolkit/<規則>: error` コメントを残す。
  parser とサイトの検査は、このコメントを含めて読む。
  スナップショットのテストヘルパーだけは、規則を二重に有効にしないよう、
  このコメントを除く。
  規則の名前を変えるときは、英日の文書のコメントも更新する。
- 振る舞いが変わるとき（条件、メッセージ、提案）は、
  その変更の中で fixture を足し、足す前に各入力で mermaid.js を確かめる。
  スクラッチの確かめは、テストの入力の代わりにならない。
- 規則の fixture は規則のテストが持ち、対応するコーパスの fixture は必要ない。
  `valid/` か `invalid/` の下に置き、下位のディレクトリに置いてもよい。
  文書の例や同じ規則の別の入力と重複させない。
  共通のディレクティブの規則は、元からのコーパスの入力名の表を残す。
- fixture のファイルに、CR（単独のものも CRLF の中のものも）と、
  `pnpm run lint:chars` が調べる文字は入れない。
  そのような入力は ESLint の `RuleTester` で検査する。
  `code` と各提案の期待する `output` は、テンプレートリテラルで書く。
  それらの文字はエスケープする。
  CR は `\r` と書き、CRLF は `\r` の後に実際の改行を置く。
  U+2028、U+2029、U+00A0 は `\u2028`、`\u2029`、`\u00a0` と書く。
  CR 以外の改行は、実際の改行で書く。
  タブと行末の空白は、`\t` と `\u0020` で書いてよい。
  そう書くと、ケースが対象にする空白がコードの中で見える。
  `errors` に期待する報告を書き、各提案の出力は全文を指定する。
  この場合はコーパスを読まない。
  行末の空白は、そのような文字ではない。
  fixture のファイルに置き、`.editorconfig` が保つ。
- 出力を意図して変えたときは、`test:update` を使う。
  差を読み、各差を説明する。
  ケースを足すときは、既存のスナップショットを保ち、足りないものだけを足す。
  パッケージで `UPDATE_SNAPSHOTS=true npx vitest run <テストファイル>`
  を実行する。

### 回すテスト

SKILL `conventions` の決まり（テストの実行）に従う。
作業の途中は、
変更が影響しうるテストのファイルだけを回し（`packages/eslint-plugin` で
`npx vitest run <ファイル>`）、全体は、作業の完了を報告する前に 1 回だけ回す。

| 変えたもの                                              | 回すテストのファイル                                                                                                                                                                             |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 規則のファイル `src/rules/<名前>.ts`                    | `tests/rules/<名前>.test.ts`                                                                                                                                                                     |
| 図種の規則のハンドラー                                  | 上と同じ、それと `tests/diagram-rules.test.ts`                                                                                                                                                   |
| `src/utils/` の補助                                     | それを import する規則のテスト（import を探す）。`subgraph-ids.ts` は `tests/subgraph-ids.test.ts`、`compact-range.ts` は `tests/compact-range.test.ts`、`removal.ts` は `tests/removal.test.ts` |
| 提案 `removePrevious`、またはその一覧に加える規則       | `tests/suggestion-history.test.ts`                                                                                                                                                               |
| `tools/rule-docs.ts`、または例の先頭の指示              | `tests/rule-docs.test.ts`                                                                                                                                                                        |
| 規則の fixture のディレクトリ                           | `tests/rules/<名前>.test.ts`                                                                                                                                                                     |
| 規則の英語の文書の例                                    | `tests/rules/<名前>.test.ts` と `tests/rule-cases.test.ts`                                                                                                                                       |
| 規則の追加、改名、削除                                  | その規則の上のテストと、`tests/rules-index.test.ts`                                                                                                                                              |
| `tests/rule-test.ts`、`tests/rule-cases.ts`             | `tests/rules/**/*.test.ts` のすべて、`tests/rule-cases.test.ts`                                                                                                                                  |
| `src/language.ts`、`src/source-code.ts`、トークンストア | `tests/language.test.ts`、`tests/token-store.test.ts`、`tests/snapshot.test.ts`、`tests/inline-config.test.ts`、`tests/markdown.test.ts`                                                         |
| parser（プラグインが読むノードが変わったとき）          | 上の言語のテスト、`tests/diagram-rules.test.ts`、そのノードを読む規則のテスト                                                                                                                    |

文書を読むテストは、`tests/rule-cases.test.ts` と、
`tests/rules/**/*.test.ts` のすべて（規則の英語の文書の例を読む）、それに、
規則の文書と索引を読む `pnpm run check:docs` である。
文書の変更でこれらを回すのは、これらが読むものを変えたとき、つまり例、
最初の段落、規則のファイルを変えたときだけである。

言語のテストは、 `tests/language.test.ts`、`tests/token-store.test.ts`、
`tests/diagram-rules.test.ts` で、 `tests/language-inputs.ts` の fixture、
つまり言語がそれだけで扱う場合ごとの 1 つに掛ける。
言語、ソースコード、図種のハンドラー、parser に変更が及ぶときに回し、
規則 1 つの変更のたびには回さない。

規則のテストは、規則の fixture と英語の文書から入力を取る。
スナップショットは、報告と提案の出力を記録する。
例外の `RuleTester` の場合は、テストのソースに、
エスケープを使う入力と期待する出力を書く。
2 節で見つけた場合は、作業の完了を報告する前にテストの入力を足す。

## 5. 変更を仕上げる

- 規則をいま実装するとき: メッセージとハンドラーを与え、テストを足し、
  覚え書きの fixture を規則の fixture のディレクトリに移し、
  覚え書きを英日とも取り除く。
  これを同じ変更の中で行う。
  `recommended` は決定のとおりにする。
  それから `update` と `check:docs` を動かす。
- 規則の振る舞いを変えたら、
  英語の文書と日本語の文書も一緒に直す（SKILL `eslint-plugin`）。
- 作業の完了を報告する前に、次の検査を 1 回動かし、変更による失敗でないものは、
  そう言う（作業の途中は、上の表のとおり、変更が影響しうるものだけを回す）。
  - `packages/eslint-plugin` の中で、
    `npx vitest run`（テストの全体）と `pnpm run check:docs`。
  - リポジトリのルートから、
    `npx eslint packages/eslint-plugin` （パッケージの中で動かす ESLint は、
    ルートの設定を読まない）、 `pnpm run lint:docs`、`pnpm run lint:chars`、
    `pnpm run format:check`、 `npx tsc --noEmit`。
- コミットも push も、ステージの変更もしない。
  コミットと push はユーザーの言葉を待ち、
  ステージはユーザーが行う（`git mv` と `git rm` はステージを変える）。
  `rm` と `mv` をそのまま使う。
  作業用のファイルはリポジトリの外に置く。

## 6. 報告

結果を、頼んだ人に報告する。
振る舞いごとに、動かして確かめたか、読んで確かめたか、確かめていないかを言う。
規則、入力、スナップショットの変更と、差ごとの理由を示す。
読んだ文書の一節と足した入力、回したものと回していないもの、
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
