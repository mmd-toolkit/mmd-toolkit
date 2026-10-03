---
name: conventions
description:
  The conventions of this repository for writing code and Markdown documents in
  any package: regular expressions, comments and autofix output, invisible
  characters, links to mermaid.js source, the English and Japanese document
  pairs, prose wrapping, Mermaid code blocks, and which tests to run after a
  change. Use before writing or reviewing source code, tests, or a Markdown
  document here, before running the tests, and when a check of
  `pnpm run lint` or `pnpm run format:check` fails on one of these.
---

# コードと文書の決まり

どのパッケージにも当たる決まり。
AGENTS.md は、それぞれを 1 行で述べ、守らせる検査の名前を書く。
全文はこの文書にある。
パッケージごとの手順は、そのパッケージの SKILL にある。

## コード

- `packages/parser` と `packages/prettier-plugin-mmd` では、
  ソースにもテストにも正規表現を使わない。
  parser は code point 単位で 1 文字ずつ照合し、
  テストの期待は文字列の比較で書く。
  それ以外（`packages/tests`、`tools/`、`scripts/`）では文字列メソッドを優先し、
  それでも必要な正規表現には `u` フラグを付け、`i` フラグは使わない。
  前者は ESLint の `regexp/require-unicode-regexp` が検査する。
- 空の JSDoc、自動修正が生成した雛形、意味のないコメント、
  コメントアウトされたコードを残さない。
  `eslint --fix` などの自動修正の結果は必ず目で確認する。
  既知の危険な自動修正: `regexp/no-missing-g-flag` は、
  `new RegExp(re)` を `new RegExp(re, "g")` に書き換えて、元のフラグを落とす。
  `new RegExp(re.source, re.flags)` と書けば報告されない。
- 不可視文字（U+2028、U+2029、U+00A0、U+FEFF、制御文字）を、
  ソースや文書に実際の文字として書かない。
  エスケープで書き、書き込み後にバイト列で確かめる。
  例外は、実際の文字が必要な、適合コーパス（`packages/tests/fixtures/`）の
  fixture だけ。
  整形と lint のテストで、そうした文字が要る入力は、
  fixture のファイルに実際の文字として書かず、
  テストのコードか JSON の fixture に、エスケープで書く。

## 文書

- 文書で mermaid.js のソースコードに言及するときは、
  pin した版のコミットハッシュ付きの GitHub のパーマリンクで該当行を指す。
  形は
  `https://github.com/mermaid-js/mermaid/blob/<コミット>/packages/mermaid/src/<パス>#L<開始>-L<終了>`。
  リンクの文字列は関数名かファイル名にする。
  リンクのないファイル名や関数名だけの言及は不可。
  pin したコミットは `packages/spec/docs/index.md` に 1 か所で記録する。
  Markdown 文書の mermaid.js へのリンクがそれ以外を指していると、
  `pnpm run lint:docs` が失敗する。
- リポジトリ内の Markdown 文書は英語で書き、
  同じ内容の日本語版を隣に `<名前>.ja.md` として必ず置く。
  README、`packages/spec/docs/` 配下、この文書などである。
  両方を同じ変更で更新する。
  英語版を変えたら、`.ja.md` に同じ変更が入るまでその変更は完了ではない。
  `pnpm run lint:docs` は、対になっていない文書があると失敗する。
  この検査は `pnpm run lint` と CI に含まれる。
  `.changeset/README.md` のようなツールが生成したファイルは対象外。
  検査の対象は `scripts/markdown-files.mjs` が定める。
- Markdown 文書の文章は、Prettier が 80 桁で折り返す。
  設定は `prettier.config.js` の `proseWrap: "always"`。
  文書を編集したら `pnpm run format` を実行する。
  実行しないと `pnpm run format:check` が失敗する。
  文章の行がどこで折れるかに依存する検査やテストを書かない。
  表とコードブロックは折り返されないので、表のセルは短く保ち、
  長い説明は表の下に書く。
  Prettier は、空白のない日本語の文を折り返さない。
  そのため、日本語の文書では Prettier は改行を書かれたまま保ち、
  改行は書き手が書く（`*.ja.md` は `proseWrap: "preserve"`）。
  1 文を 1 行に書き、長い文は意味の切れ目の `、` の後で改行して、
  文章のどの行も 80 桁（全角は 2 桁と数える）を超えないようにする。
- Mermaid のテキストを入れるコードブロックの info string は `mmd` にする。
  `mermaid` や `text` にしない。
  GitHub は色付けをし、図として描画しようとしない。
  例の多くは、意図して拒否される入力や境界の例なので、これが要る。
  行末の空白はコードブロックの中に残らないので、それが要る例は、
  コードブロックではなく文で述べる。
  Mermaid の例は、このプロジェクトのフォーマッターが印字する形で書く。
  字下げと、矢印の前後の空白である。
  例外は、書き方そのものを示すための例である。
  フォーマッターの入力や、空白の有無が要点のテキストがこれに当たる。
  fixture から取った例は、その fixture の入力を整形した形にする。
  整形は Db を変えないので、その fixture は、
  mermaid.js がその例をどう読むかを記録している。

## テストの実行

パッケージのテストには何分もかかり、いくつもの作業が 1 台のマシンを共有する。
変更のたびに全部を回さず、その変更が影響しうるものを回す。

- 文書だけの変更（Markdown、コメント）: 文書の検査を回す
  （`pnpm run lint:docs`、`pnpm run lint:chars`、`pnpm run format:check`）。
  コメントを変えたときは、変えたファイルに ESLint も回す
  （`npx eslint <ファイル>`）。
  ESLint の規則はコメントも読むためである。
  テストは回さない。
  例外は、変えた文書を読むテストである。
  どのテストが文書を読むかは、パッケージの SKILL に書く。
- コードの変更で、作業の途中: その変更が影響しうるテストのファイルを回す
  （`vitest run <ファイル>`）。
  コードのどの部分にどのテストのファイルが対応するかは、
  パッケージの SKILL に書く。
- 作業の完了を報告する前: パッケージのテストの全体を 1 回回し、
  リポジトリの検査（`pnpm run lint`、`pnpm run format:check`）を回す。
- parser のテストは、生成した入力を回さず、mermaid.js も動かさない。
  parser が何をすべきかは、仕様と適合コーパス（`packages/tests/fixtures/`）が
  述べる。入力、mermaid.js が受理するか、mermaid.js が何を読むか、である。
  どの言語の parser も、同じ fixture で確かめる。
  だから、parser のテストは、入力と期待する結果をコーパスから取る。
  コーパスそのものの確かめ（fixture の記録が mermaid.js の振る舞いと同じか）
  は、`packages/tests` のものである。
- parser では、生成した入力は、コーパスに欠けているものを見つける道具である。
  parser は、テストとは別の探索のコマンドで、それを回す。
  回すのは、図種の字句か文法を変えたときである。
  探索は、入力を種類（境目で出会うトークン、行の中の位置、文、
  差し込むテキスト）で取り、組み合わせを 1 回ずつ取る。
  件数を増やすために同じ種類を繰り返さない。
  探索が見つけた失敗は、コーパスの fixture で閉じる。
  仕様がその読み方を述べていなかったときは、仕様の文も足す。
  parser の中の一覧にだけ残した入力は、残したことにならない。
- ほかのパッケージ（フォーマッター）の生成入力のテストは、サイズが 1 つである。
  入力の種類（境目で出会うトークン、行の中の位置、文の種類）を覆い、
  種類ごとに数件を取る。
  より大きい「全量」の実行は持たない。
  すべての位置やすべての変異を回しても、同じ種類の入力に同じ確かめを
  繰り返すだけで、新しく見つかるものはない。
  確かさを増すには、欠けている種類を足す。件数を増やさない。
- 木の同じ状態について、いま報告されたばかりの結果を、別の人が回し直さない。
  種類の違う確かめ（別の入力、別の方法）は行う。
- 報告には、何を回し、何を回していないかを書く。
