# AGENTS.md（日本語版）

このリポジトリで作業するエージェント（と人）向けの指示。
英語版は `AGENTS.md`。

## プロジェクト

mermaid-js とは無関係の第三者プロジェクト。
Mermaid 記法（`.mmd`）について、mermaid.js が持つ全図種を対象に次の 5 つを作る。

| パッケージ                     | npm 名                | 内容                                |
| ------------------------------ | --------------------- | ----------------------------------- |
| `packages/spec`                | `@mmd-toolkit/spec`   | 構文仕様（private）                 |
| `packages/tests`               | `@mmd-toolkit/tests`  | 適合性コーパス（private）           |
| `packages/parser`              | `@mmd-toolkit/parser` | AST を返すパーサー                  |
| `packages/prettier-plugin-mmd` | `prettier-plugin-mmd` | Prettier プラグインのフォーマッター |
| `packages/eslint-plugin-mmd`   | `eslint-plugin-mmd`   | ESLint の言語プラグインのリンター   |

正しさの基準は pin した mermaid.js 本体。

1. 受理・拒否が mermaid.js と一致する。
   例外は、仕様が Known divergences
   （`packages/spec/docs/known-divergences.md`）に定義する入力で、
   それぞれが識別子を持ち、関わる fixture にその識別子の印が付く。

   入力を差にするのは、次の 2 つの問いに、この順で答えた後だけである。
   差を提案する者は、両方の答えを書く。
   1 つ目の答えのない提案は、決めない。

   1. 木が、書かれたものを持てて、
      入力を mermaid.js と同じに読めるか。
      mermaid.js が読まない、捨てる、
      または書かれたものと違う意味で読むテキストは、
      ノードにできるところではノードにする
      （`FlowchartIgnoredText`、文を始める空の説明ブロック、
      `create destroy A`）。
      そのとき入力は受理し、書かれたとおりに木に示し、
      読み違いは lint の規則に任せる。
      この問いは、挙動の原因が何であっても、
      下の 2 つ目や 3 つ目の理由が当てはまりそうなときにも、先に問う。
      mermaid.js が読まないことも、誰も書かないような形であることも、
      拒否の理由にならない。
   2. ノードにできないときに限り、mermaid.js が受理する入力を、
      差として拒否するか、違う読み方にする。
      理由は次のどれかに限る。
      - mermaid.js が読まないテキストが、木の中に自分の置き場所を持たない。
      - mermaid.js の挙動が、そのパイプラインの手順の順番から生じたもので、
        仕様として述べるものでないとき、仕様は直接の規則を述べる
        （キーワードの中のディレクティブ、直前の文字を取るコメント）。
        そのために読み方が違う入力が、差になる。
      - mermaid.js のメンテナーが、その挙動を不具合として扱っている
        （予約語の `click`）。

   不具合に見える挙動について差を提案する前に、
   mermaid.js の文書がその構文について何と書いているかを読み、
   issue と pull request を探し、見つけたものを事実として引く。

2. 受理した入力の Db が mermaid.js と一致する。
   ただし、Known divergences が読み方の違いを定義する入力を除く。
3. AST は入力を何も失わない。
   入力のすべての文字は、トークンかコメントに含まれるか、
   空白か行終端子である。
   トークンとコメントのテキストは、その範囲の入力と一致する。
   空白と行終端子はノードにしない。
   ソースの文字列と範囲があれば、入力をバイト単位で再現できる。
4. 整形は冪等で、整形前後で Db が変わらない。

図種は 1 つずつ進める。
flowchart、sequence、class、state が済んでいる。
リリースは全図種が完成してから。

## 各パッケージの責務

パッケージの方針と基準は、`.claude/skills/` にあるそのパッケージの SKILL の、
「方針と基準」の節にある。
パッケージの作業の前に、その SKILL を読む。

- `packages/tests`（CLI は `tools/`）: mermaid.js を pin し、
  その Db を取り出し、fixture の形式を定め、
  適合コーパスと、それを作って確かめる道具を持つ。
  コーパスが記録する木の確かめも持つ。
  記録した木から Db を作って mermaid.js の Db と比べ、
  木の不変条件を確かめる。
  SKILL は `tests`。
- `packages/spec`: 構文と、抽象構文木の形（ノードの型、欄、値）を定義する。
  入力を受理するかどうかを決めるものは、すべてここで定める。
  定義の出どころはここで、実装はこれに従う。
  仕様の文書は、parser のトークンと位置の仕様に言及しない。
  SKILL は `spec`。
- `packages/parser`: 仕様の参照実装であり、
  木のトークンと位置の仕様（`docs/tokens.md`、`docs/positions.md`）を持つ。
  実装する挙動は、すべて仕様と fixture から取り、
  mermaid.js のソースからは取らない。
  parser は、仕様とこれらの文書とコーパスから、
  別の言語でも書けるものにする。
  そのため、parser のテストは、結果を fixture の記録と比べ、
  mermaid.js も生成した入力も動かさない。
  SKILL は `parser`。
- `packages/prettier-plugin-mmd`: フォーマッター。
  図種ごとに printer を持ち、項目ごとに明示的に決めた整形方針に従う。
  SKILL は `prettier-plugin`。
- `packages/eslint-plugin-mmd`: リンター。ESLint の言語プラグインである。
  規則が報告するのは、書き手の誤りのうち、mermaid.js が黙って受理し、
  意図と違うものとして読むものである。
  どの規則を持つかは SKILL `rule-ideas` で決め、
  規則の文書は SKILL `eslint-plugin` に、
  規則の実装は SKILL `eslint-plugin-rules` に従う。

## 共有するインターフェース

これらを変えると使う側のパッケージに影響する。
変える前に知らせる。

| インターフェース                             | 定義する側 | 使う側                                 |
| -------------------------------------------- | ---------- | -------------------------------------- |
| fixture の形式とローダー                     | tests      | spec、parser、prettier-plugin          |
| mermaid の Db を取り出す関数                 | tests      | parser、prettier-plugin                |
| fixture の CLI（`tools/fixtures.ts`）        | tests      | spec、parser                           |
| Db の要約と、記録した木の確かめ              | tests      | parser                                 |
| AST の定義（`docs/ast.md`、`docs/ast/*.md`） | spec       | parser、prettier-plugin、eslint-plugin |
| トークンと位置（`docs/tokens.md` ほか）      | parser     | tests、prettier-plugin、eslint-plugin  |
| parser の API（`parse()`、エラー、木の走査） | parser     | prettier-plugin、eslint-plugin         |

## 行動原則

- 誰の主張であっても鵜呑みにしない。
  仕様と mermaid.js の実際の挙動に照らして、自分で確かめてから行動する。
- 共有インターフェースに依存する実装は、それが定義されて通知されるまで書かない。
  依存しない部分を先に進める。
- 設計への反論は、対象のコードを開いてから、根拠を添えて述べる。
  根拠は、コード、mermaid の実際の出力、仕様の該当箇所である。
  誤りだと分かったら撤回する。
- コードは読みやすさを常に優先する。
  値から型を推論させる技巧や過度な汎用化より、
  定義を見ただけで分かる明示的な書き方を選ぶ。
  重複の整合は型付けやテストで守る。
- 常に「あるべき形」で作り、「動くだけの形」にしない。
  同じ判定を複数の場所で繰り返す構造、
  呼び出し側が書かれていない約束を守ることに頼る構造、
  直接の規則で書けるところに外部のパイプラインを模した構造を残さない。
  あるべき形が分からないときは、書く前に尋ねる。
- コードと文書の決まりは、SKILL `conventions` にある。
  コードや Markdown 文書を書く前に読む。
  要点は次のとおり。
  - `packages/parser` と `packages/prettier-plugin-mmd` では、
    正規表現を使わない。
  - 空の JSDoc、自動修正の雛形、コメントアウトされたコードを残さない。
    自動修正の結果は必ず読む。
  - 不可視文字を実際の文字として書かない（`pnpm run lint:chars`）。
    例外は、適合コーパスの fixture だけ。
  - Markdown 文書は英語で書き、`.ja.md` の対を同じ変更で直す。
    mermaid.js のソースへのリンクは、pin したコミットのパーマリンクにする
    （`pnpm run lint:docs`）。
  - 文章は 80 桁で折り返す。
    英語は Prettier が折り返す（`pnpm run format:check`）。
    日本語は書き手が折り返し、`pnpm run lint:ja` が確かめる。
  - Mermaid のテキストのコードブロックの info string は `mmd` にし、
    フォーマッターが印字する形で書く。
    例外は、書き方そのものを示すための例である。
  - テストは、変更が影響しうるものを回す。
    パッケージの全体は、作業の完了を報告する前に 1 回回す。
    パッケージのテストは固定の入力だけを回す。コーパスの fixture、
    パッケージの fixture、過去の失敗の入力である。入力を生成するテストは
    持たず、生成するコマンドも持たない。
    振る舞いを定める文（仕様、parser のトークンと位置の文書、`dbFromTree` の
    文書、整形の規則）は、その文が分ける場合ごとに fixture を持ち、
    その文が名指す場所でほかの規則が接する場合（ディレクティブ、無視される
    `;`、コメント行、空行、行区切り、空の説明ブロック）にも fixture を持つ。
    fixture は文と一緒に書き、mermaid.js で 1 回確かめる。
    review は文ごとに、欠けている場合がないかを見る。
    乱数や数（seed、count）で入力を選ばない。
- コミットと push はユーザーの指示があったときだけ行う。
