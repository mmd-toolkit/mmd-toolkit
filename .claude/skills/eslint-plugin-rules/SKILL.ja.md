---
name: eslint-plugin-rules
description:
  Implement, change, or remove a rule of @mmd-toolkit/eslint-plugin (the rule
  file under src/rules/, its messages, fixes, and suggestions, its tests and
  fixtures). Use when a rule has been decided with the rule-ideas skill and is
  to be implemented, when the condition, the messages, the fixes, or the
  suggestions of a rule change, and when the tests or the fixtures of a rule are
  added. The documents of the rules are in the eslint-plugin skill.
---

# 規則の実装（eslint-plugin-rules）

`@mmd-toolkit/eslint-plugin` の規則を実装、変更、削除する手順。
規則が報告するものが、固定した mermaid.js についての事実であり、規則が、
道具が使う形で木を読むようにする。
パッケージの構成、どの規則も従う選択、テストと fixture は、
`packages/eslint-plugin/docs/development.md` に書いてある。

## 1. 最初に読むもの

1. 規則についての決定。
   rule-ideas の SKILL （`.claude/skills/rule-ideas/SKILL.md`）で決まる。
   規則を持つこと、名前と範囲、`recommended` で有効にするか、fix を持つか、
   提案を持つか。
   実装してみて、決定が成り立たないと分かったら（条件が木から読めない、
   fix や提案が確かめられない、など）、その根拠を持って決定に戻る。
2. テストが読む例を持つ、規則の英語の文書。
3. SKILL `eslint-plugin` の「方針と基準」の節と、 SKILL `conventions`。
   前者は `.claude/skills/eslint-plugin/SKILL.md` にある。
4. 木の定義: `packages/spec/docs/ast.md` と `packages/spec/docs/ast/<図種>.md`。
5. `packages/eslint-plugin/docs/development.md` の Writing a rule、
   The fixtures of the rules、Snapshots、 Rules and their documents。

## 2. 規則とは独立に、事実を確かめる

規則が報告するものは mermaid.js についての事実で、
規則は自分自身の証拠にならない。
規則を書く前と書いた後に、規則を使わない方法で事実を確かめる。

- 事実を、mermaid.js だけで言えるように定める。
  文を取り除いた Db、Db の関数が受け取る値、入力を受理するか、など。
  Db の要約が事実を隠すときは、それを受け取る Db の関数を包み、
  渡された値を記録する。
- 規則の主張ごとに、その主張が分ける場合ごとの入力で確かめる。
  主張は、報告する条件、しない条件、メッセージ、fix、提案である。
  規則の文書と、rule-ideas の SKILL の 7 節にあるその規則の記録の文ごとに、
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
- 図のどこにあってもよい定義に条件が依る規則（id、文が作る頂点など）には、
  定義が使う所の後にある入力と前にある入力、それを作る文が、
  名指す文の前にある入力と後ろにある入力が要る。
  それぞれを mermaid.js で確かめる。
- mermaid.js を動かす、テキストを parse するスクリプトは、
  rule-ideas の SKILL の 4 節にある。
  下のスクリプトは、テストと同じように 1 つの規則でテキストを lint し、
  fix と提案をそれぞれ当てる。
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
    if (message.fix !== undefined) {
      const { range, text: replacement } = message.fix
      const applied =
        text.slice(0, range[0]) + replacement + text.slice(range[1])
      console.log(" fix:", JSON.stringify(applied))
    }
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
  規則の採否、範囲、`recommended`、fix を持つか、
  提案を持つかは rule-ideas の SKILL から来る。
- fix と提案は、それぞれ `create` から分けた関数で組み立てる。
  fix は、編集できる場所でだけ出す。
  ほかでは、報告は fix を持たない。
  4 節の fixture で、
  それぞれの結果のテキストがメッセージの言うものかを確かめる。
  スナップショットは、各 fix と各提案の出力の全文を記録する。
  `RuleTester` の場合は、ケースの `output` に fix の出力を、
  提案の `output` に提案の出力を書く。
  提案のメッセージは、提案を出すすべての場合に、当てた後に真であることを言う。
  その読み方は、2 節のとおり、規則とは独立に確かめる。
  規則のテストは mermaid.js を動かさない。
  候補の条件が、rule-ideas の記録（8 節）が与える文で書けないときは、
  その候補を rule-ideas に戻す。
  提案を出さないことは、普通の結論である。
  条件や確かめを足して候補を守ってはならず、結果を parse したり、
  既知の相違ごとに判定したりしてもならない。
- 条件は、木とトークンの上で書く。
  ノードの型、欄、トークンの種類と値、範囲である。
  共通の規則は、すべての図種が共有する木の部分（Root、そのトークン、コメント、
  ディレクティブ、共通の葉のノード）だけを使う。
  木とトークンの外に出る部分は、規則のファイルの規則の上のコメントに、
  そうと名指しし、それが生む設計上の論点を書く。
  ソースを読む（空白は木にない）、値を解釈する（ラベルの中の HTML）、
  埋め込みデータを読む（ディレクティブの引数）、
  Db の導き方を繰り返す（subgraph の id）、などである。
  木とトークンからまったく見つけられないときは、字句解析し直す方法を書かない。
  木がもっと示す必要があるなら、それは木の仕様の変更（spec の SKILL）であり、
  そうでなければ、その規則は持たない（rule-ideas の SKILL）。
- 別のものを書く前に、`src/utils/` の補助を使う。
  補助が持つ前提を新しい規則が破るときは、テキストではなく木から読んで決め、
  その補助を使うほかの規則も確かめ直す。
- 1 つの判断は 1 か所に。
  1 回しか使わないもの、名前を付けても意味が増えないものを定数にしない。
  決して成り立たない確かめを残さない（仕様で確かめる）。
  オペランドの選び方を 1 つにすれば要らなくなる分岐を、繰り返さない。
  規則を整えるときは、短くではなく、賢くする。
  振る舞いが変わっていないことは、スナップショットに加えて、
  古い版と新しい版を同じ fixture に当て、報告と fix と提案を比べて示す。
- 決まった設計への異論は、実装の前に、コードを開いて 1 度だけ述べる。
  答えが変わらなければ、決まったとおりに実装する。

## 4. テストと fixture

- 規則のスナップショットテストは、
  `testRule(name, rule)` の 1 回の呼び出しである（`docs/development.md`）。
  英語の文書の例と規則の fixture の入力がケースで、報告の有無と、
  各 fix と各提案が作るテキストを確かめる。
- 入力は、確かめる場合に合わせて名前を付け、
  規則の文書の文が分ける場合ごとに入力を持つ。
  テストに、文書と入力を対応させる別の表は置かない。
- 従う例も反する例も、
  先頭の `%% eslint @mmd-toolkit/<規則>: error` コメントを残す（SKILL
  `eslint-plugin`）。
  スナップショットのテストヘルパーだけは、これを除く。
  テスターの別名と `@mmd-toolkit/`
  の両方で規則が有効になるのを避けるためである。
  規則の名前を変えるときは、英日の文書のコメントも更新する。
- 振る舞いが変わるとき（条件、メッセージ、fix、提案）は、
  その変更の中で fixture を足し、足す前に各入力で mermaid.js を確かめる。
  スクラッチの確かめは、テストの入力の代わりにならない。
- 規則の fixture は規則のテストが持ち、対応するコーパスの fixture は必要ない。
  `valid/` か `invalid/` の下に置き、下位のディレクトリに置いてもよい。
  文書の例や同じ規則の別の入力と重複させない。
  共通のディレクティブの規則は、元からのコーパスの入力名の表を残す。
- fixture のファイルに、CR（単独のものも CRLF の中のものも）と、
  `pnpm run lint:chars` が調べる文字は入れない。
  そのような入力は ESLint の `RuleTester` で検査する。
  `code`、fix の期待する `output`、各提案の期待する `output` は、
  テンプレートリテラルで書く。
  それらの文字はエスケープする。
  CR は `\r` と書き、CRLF は `\r` の後に実際の改行を置く。
  U+2028、U+2029、U+00A0 は `\u2028`、`\u2029`、`\u00a0` と書く。
  CR 以外の改行は、実際の改行で書く。
  タブと行末の空白は、`\t` と `\u0020` で書いてよい。
  そう書くと、ケースが対象にする空白がコードの中で見える。
  `errors` に期待する報告を書き、fix と各提案の出力は全文を指定する。
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

2 節で見つけた場合は、作業の完了を報告する前にテストの入力を足す。

## 5. 変更を仕上げる

- 新しい規則: メッセージとハンドラーを与え、テストと fixture を足し、
  英日の文書を書く。
  これを同じ変更の中で行う。
  `recommended` は決定のとおりにする。
  それから `update` と `check:docs` を動かす。
- 規則の振る舞いを変えたら、英語の文書と日本語の文書を一緒に直す。
  日本語の文書がない、または英語より古いときは、書く（SKILL `eslint-plugin`）。
- 作業の完了を報告する前に、次の検査を 1 回動かし、変更による失敗でないものは、
  そう言う。
  - `packages/eslint-plugin` の中で、
    `npx vitest run`（テストの全体）と `pnpm run check:docs`。
  - リポジトリのルートから、
    `npx eslint packages/eslint-plugin` （パッケージの中で動かす ESLint は、
    ルートの設定を読まない）、 `pnpm run lint:docs`、`pnpm run lint:chars`、
    `pnpm run format:check`、 `npx tsc --noEmit`。
- コミットも push も、
  ステージの変更もしない（`git mv` と `git rm` はステージを変える）。
  `rm` と `mv` をそのまま使う。
  作業用のファイルはリポジトリの外に置く。

## 6. 報告

振る舞いごとに、動かして確かめたか、読んで確かめたか、確かめていないかを言う。
規則、入力、スナップショットの変更と、差ごとの理由を示す。
読んだ文書の一節と足した入力、回したものと回していないもの、
まだ開いているものと確かめていないものを出す。
レビューの指摘を直し（7 節）、また報告する。
これを、レビューが何も指摘しなくなるまで続ける。

## 7. review の指摘を直す

指摘ごとに次のことをする。

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
