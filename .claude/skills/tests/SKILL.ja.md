---
name: tests
description: >-
  The policies of @mmd-toolkit/tests and tools/, how to check a claim with
  mermaid.js, and the fixture tools and lists that the other packages use
  (adding, renaming, and marking fixtures, known divergence identifiers,
  specified readings). Use for any work on packages/tests or tools/, and when a
  fixture, a rename or a known divergence identifier is needed. Adding a diagram
  type, the tree checks, and updating mermaid.js have skills of their own that
  use this one.
---

# 正解の取り出しと fixture（tests）

`@mmd-toolkit/tests` と `tools/` の作業のうち、どの作業も従う手順と、
ほかのパッケージのために fixture の道具と一覧を保つことを扱う。
このパッケージの方針と基準は 1 の節にある。
すべてのパッケージに当たるものは AGENTS.md と SKILL `conventions` にある。
図種を足すことは SKILL [tests-diagram-type](../tests-diagram-type/SKILL.ja.md)、
木からの Db と木の検査は SKILL
[tests-tree-checks](../tests-tree-checks/SKILL.ja.md)、
pin した mermaid.js の更新は SKILL
[tests-mermaid-update](../tests-mermaid-update/SKILL.ja.md) にある。
この SKILL の 1〜4 の節は、それらの手順にも当たる。

## 1. 方針と基準

`packages/tests`（CLI は `tools/`）:

- mermaid を devDependency として pin し、
  Node（DOM なし）で mermaid の Db を取り出す。
- fixture の形式を定め、ローダーと README をそれに合わせて保つ。
- fixture 生成器を提供する。
  mermaid を import する部分（Db 取り出し、
  正規化関数）は `@mmd-toolkit/tests` のサブパスに、CLI は `tools/` に置く。
- fixture を再生成し、
  mermaid の挙動が変わっていたら失敗する CI ジョブを提供する。
- 図種ごとに、正解の取り出し（正規化関数）と fixture の収集を行う。

## 2. 最初に読むもの

1. この文書の 1 の節、AGENTS.md の「共有するインターフェース」と「行動原則」、
   コードや文書を書く前に SKILL `conventions`。
2. `packages/tests/README.md` と `packages/tests/docs/` の文書、
   `tools/README.md`。
   fixture の形式、期待値の求め方、Db の要約、埋め込まれたデータの値、
   fixture の保守と収集の手順はそこにある。

## 3. これらの SKILL が書くもの

- この SKILL と、SKILL `tests-diagram-type`、`tests-tree-checks`、
  `tests-mermaid-update` の手順が書くのは、`packages/tests`、`tools/`、
  これらの SKILL の文書だけ。
  ほかのパッケージ（`packages/spec`、`packages/parser`、
  `packages/prettier-plugin-mmd`）を直す必要が出たら、
  そのパッケージの SKILL の手順で直す。
  ほかのパッケージのテストから入力を取るときは、読むだけにする。
- fixture のディレクトリを消すことは取り消せない。
  消す必要があるときは、消すものの一覧とコマンドを示して決定を求める。
- `eslint --fix` と Prettier の結果は、SKILL `conventions` のとおり必ず読む。

## 4. 確かめ方（すべての作業で）

- 主張は、それが誰のものでも、
  mermaid.js を実際に動かして確かめてから採り入れる。
  次のスクリプトを `probe.mts` として保存し、
  `<repo>` をリポジトリのルートの絶対パスに置き換えて、
  `node probe.mts` で動かす。

  ```ts
  import { runMermaidWithEmbeddedData } from "<repo>/packages/tests/src/mermaid.ts"

  const texts = ["flowchart LR\n  A --> B\n", "flowchart LR\n  A -->\n"]
  for (const text of texts) {
    const mermaidRun = await runMermaidWithEmbeddedData(text)
    console.log(
      JSON.stringify(text),
      JSON.stringify(mermaidRun.outcome).slice(0, 120),
    )
  }
  ```

- 結果を示すときは、主張ごとに、実行して確かめたか、読んで確かめたか、
  確かめていないかを区別する。
- 例を手で数個書いて済ませない。
  規則が値に効く境界は、文字の集合を全部回して確かめる。
  例えば、style の値の末尾に残る空白は、
  JavaScript の `\s` から LF と CR を除いた文字（仕様の行の空白）を 1
  つずつ置いて mermaid.js に通して確かめる。
  fixture の全件や、収集した入力の全件に対して、
  前後で結果が変わらないことを確かめる。
- どのテストをいつ回すかは、
  SKILL `conventions`
  の[「テストの実行」](../conventions/SKILL.ja.md#テストの実行)に従う。
  このパッケージでは次のとおり。

  | 変えたコード                                                               | 回すテストのファイル（`tests/`）                               |
  | -------------------------------------------------------------------------- | -------------------------------------------------------------- |
  | `src/index.ts`（形式、ローダー、`KNOWN_DIVERGENCES`）                      | `fixtures.test.ts`、`expected-changes.test.ts`                 |
  | `src/fixture-acceptance.ts`                                                | `fixture-acceptance.test.ts`、`fixtures.test.ts`               |
  | `src/mermaid.ts`、`rejections.ts`、`run-mermaid-options.ts`                | `mermaid.test.ts`、`mermaid-run-store.test.ts`                 |
  | `src/mermaid-run-store.ts`                                                 | `mermaid-run-store.test.ts`                                    |
  | `src/divergence-removals.ts`                                               | `divergence-removals.test.ts`、`mermaid.test.ts`               |
  | `src/normalizers/<図種>.ts`、`normalizers/index.ts`                        | `mermaid.test.ts`、`fixtures.test.ts`、その後 `fixtures:check` |
  | `src/normalizers/data-blocks.ts`                                           | `data-blocks.test.ts`、`mermaid.test.ts`                       |
  | `src/normalizers/browser-stand-ins.ts`                                     | `browser-stand-ins.test.ts`、`mermaid.test.ts`                 |
  | `src/normalizers/json.ts`                                                  | `json.test.ts`、その後 `fixtures:check`                        |
  | `src/expected-changes.ts`                                                  | `expected-changes.test.ts`                                     |
  | `src/recorded-embedded.ts`                                                 | `recorded-embedded.test.ts`、その後 `fixtures:check`           |
  | `src/fixture-shapes.ts`                                                    | `fixture-shapes.test.ts`                                       |
  | `src/db-from-tree/`                                                        | `db-from-tree.test.ts`、`converted-text.test.ts`               |
  | `src/source-scan.ts`                                                       | `source-scan.test.ts`                                          |
  | `src/ordered-json.ts`                                                      | `ordered-json.test.ts`, `tools-fixture-store.test.ts`          |
  | `src/check-tree/`                                                          | `check-tree-corpus.test.ts`、`check-tree*.test.ts`             |
  | `tools/src/diagrams.ts`                                                    | `tools-diagrams.test.ts`                                       |
  | `tools/src/fixture-store.ts`                                               | `tools-fixture-store.test.ts`                                  |
  | `tools/src/spec-recorder.ts`                                               | `tools-spec-recorder.test.ts`                                  |
  | `tools/src/specified-reading.ts`                                           | `tools-specified-reading.test.ts`                              |
  | `tools/src/recorded-tree*.ts`、`coverage-table.ts`、`fixture-citations.ts` | `tools-recorded-trees.test.ts`                                 |
  | `tools/src/runtime-imports.ts`                                             | `tools-recorded-trees.test.ts`、`mermaid-run-store.test.ts`    |
  | `tools/fixtures.ts`、`tools/collect.ts`、`tools/recorded-trees.ts`         | テストのファイルはない。下を参照                               |
  | `recorded-trees/coverage-table/*.json`                                     | テストのファイルはない。下を参照                               |

  `tools/src` の関数のうち、fixture の記録ファイルの中身を決めるものは、
  モジュールごとに 1 つの `tests/tools-*.test.ts` でテストする。
  記録器は Node.js 自身の `import()` を必要とするので、
  そのテストでは別のプロセスで動かす。
  コマンドラインのファイル（`tools/fixtures.ts`、`tools/collect.ts`、
  `tools/recorded-trees.ts`）にはテストのファイルがなく、
  それぞれのコマンドを動かして確かめる。
  `add-many`、`set-divergence`、`set-note` は `--dry-run` を付け、
  変える予定のものを読む。
  `generate` は `fixtures:check` で確かめる。
  `tools/collect.ts` は、`--out` をリポジトリの外に向けて動かし、
  書いたファイルを読む。
  `tools/recorded-trees.ts` は、`recorded-trees:check --base HEAD` を動かし、
  出力を読む。
  `recorded-trees/coverage-table/` の表を変えたときは、
  `recorded-trees:check` を動かし、古い行が出ないことを見る。
  記録器（`tools/src/spec-recorder.ts`）を変えるときに守ることは、
  SKILL tests-diagram-type の
  [references/collecting-fixtures.ja.md](../tests-diagram-type/references/collecting-fixtures.ja.md)
  の手順 3 にある。

  1 つのファイルは
  `pnpm --filter @mmd-toolkit/tests exec vitest run tests/<ファイル>` で回す。
  `fixtures.test.ts` は 2 つの README を読む（既知の差異ごとに項目がある）ので、
  README を変えたときにも回す。
  完了を報告する前の実行は、
  パッケージ全体（`pnpm --filter @mmd-toolkit/tests test`）。
  `fixtures:check` は、結果の作り方か記録の仕方（`src/mermaid.ts`、正規化関数、
  形式、生成器）を変えた後と、その変更の完了を報告する前に回す。
  ほかのパッケージは、使うものについての自分のテストを回す。
  全件を 1 つのテストで読むテストには、
  単独の所要時間を測って時間制限を明示する（既定の 5 秒に頼らない）。

- `runMermaid()` は、前に動かしたテキストに、貯めた結果を返す。
  鍵に `src/` か `lib/` のコードが入るので、
  コードを変えた後に古い結果が返ることはない（`docs/expected-results.md`）。
  このパッケージのテストと生成器は、貯蔵庫を使わずに動く。
  ただし、貯蔵庫のテストの 1 つは、リポジトリの貯蔵庫にテキストを 1 つ通す。
  確かめのスクリプトは、`MMD_TOOLKIT_MERMAID_CACHE=disabled` を付けない限り、
  貯蔵庫を使う。
  鍵に入るのは `RESULT_FILES` にある `src/` のファイルだけで、それを変えると、
  貯めた結果がすべて使われなくなる。
  その一覧を正しく保つ（テストが確かめる）。
  それらのファイルの変更は、長い実行が動いていないときに入れる。
  動いている長い実行が貯めた結果を、捨てることになるためである。
  すぐに入れてよいのは、誤った結果を直す変更だけである。
- 生成器が何も変えないことは、件数の表示だけでなく、
  ファイルのハッシュで確かめる（リポジトリのルートで実行する）。

  `WORK` には、リポジトリの外の作業用のディレクトリを入れておく。

  ```sh
  find packages/tests/fixtures -type f | sort | xargs shasum > "$WORK/before.sha"
  pnpm --filter @mmd-toolkit/tests run fixtures:generate
  find packages/tests/fixtures -type f | sort | xargs shasum > "$WORK/after.sha"
  cmp "$WORK/before.sha" "$WORK/after.sha"
  ```

- `src/` を変えたら、
  `pnpm --filter @mmd-toolkit/tests run build` で `lib/` を作り直す。
  このリポジトリの中では、ほかのパッケージのテスト、ツール、型検査は、
  `src/` を読む。
  そのため、`src/` の変更は、それらの次の実行にすぐ届く。
  `lib/` は、それ以外の所でパッケージの名前が読み込むもので、
  たとえば素の `node` のスクリプトから読まれる。

## 5. ほかのパッケージのための fixture の道具と一覧

仕様の主張を支える fixture は、
tests の生成器（`fixtures:add-many` など）で足す（方針と手順は spec の SKILL）。
埋め込みデータのためだけに mermaid.js が拒否した入力として `add-many`
が挙げたものには、
SKILL tests-diagram-type の
[references/collecting-fixtures.ja.md](../tests-diagram-type/references/collecting-fixtures.ja.md)
の手順 7 のとおり印を付ける。
この SKILL が行うのは次のこと。

1. 道具と形式を保つ。
   生成器、`add`、`add-many`、`set-divergence`、`set-note`、ローダー、
   収集の道具が、`docs/maintaining-fixtures.md` に書いたとおりに動くようにする。

   使い方を変えたら、その文書（英日）を同じ変更で直す。

2. 仕様の Known divergences
   （`packages/spec/docs/known-divergences.md`）が変わったら、
   識別子の一覧（`src/index.ts` の `KNOWN_DIVERGENCES`、
   README の一覧）を合わせる。
   `src/fixture-acceptance.ts` の `DIVERGENCE_PROPERTIES` には、
   識別子ごとの向きと指定読みの要否を明記する。
   利用側は fixture の受理に `fixtureAccepts()` を使う。
   印の形の検査は
   [parser のスキル](../parser/SKILL.ja.md#6-fixture-が足されたとき規則が変わったとき)
   の §6 に従う。
   読み込みは一覧にない識別子を拒否するので、識別子を改名するときは、
   (1) 新しい識別子を一覧に足す（古いものは残す）、
   (2) `fixtures:set-divergence` で fixture を新しい識別子に付け替える、
   (3) 古い識別子を一覧から外す、の順にする。
   識別子を取りやめるときは、印を外してから一覧から外す。
   README の一覧は、
   テスト（両方の README に各識別子の項目があること）が確かめる。
3. fixture を改名するとき（仕様が変わって名前が合わなくなったときなど）は、
   旧名の印がないこと、
   入力の結果が名前の示すとおりであることを mermaid.js で確かめてから、
   ディレクトリごと通常の `mv` で動かし、`fixtures:check` を通す。
   tests と tools の中に旧名の参照がないことを grep で確かめる。
   仕様の本文の参照は、spec の SKILL の手順で直す。
4. parser が失敗した入力（review、生成した入力、
   差分テストから得たもの）を残すときは、コーパスの fixture にする。
   parser のファイルに残した失敗の入力は、ほかの実装のためには残らず、
   fixture は、すべての実装が確かめるためである。
   フォーマッターと規則の入力は、それぞれのパッケージに残す。
   期待（受理・拒否、Db の値）を足す前に mermaid.js で確かめる。
   合わなければ足さずに、そのことを示す。
   失敗の原因が、仕様にその形の文がないことなら、先に仕様に文を足す。
   形ごとに 1 件だけ残す。
   入力の形は、入力のうち、
   字と数字の並びをそれぞれ 1 つの印にしたものである（キーワードは、
   書かれた大文字小文字のまま残すので、`State` と `state` は別の形である）。
   ほかの文字は、すべて残す。
   空白、U+2028、U+2029、記号、ディレクティブとコメントの中身である。
   比べるのは、失敗の入力の同じファイルの中だけにする。
   別の種類の失敗の同じ形は、そのファイルが別の理由で持つので、落とさない。
   入力をほかのパッケージのファイルから取るときは、読むだけにし、
   文字列は構文木で取り出してバイト単位で一致させる。
   名前は既存の付け方に合わせる（`gram-`、`lex-`、`db-`、`tokens-`、
   `config-` などの接頭辞と、示すものの名前。同じ話題の入力が多いときは、
   入力の SHA-256 の先頭 8 桁の 16 進数を付ける）。
   note には、
   何を示す入力かを書く（入力の出どころの review や実行の呼び名は書かない）。
   `fixtures:add-many` で足す（`fixtures:add` には印の指定がない）。
   実装のテストは、新しい fixture をほかの fixture と同じに読む。
   そのあと、失敗の入力のファイルは、それを持っていたパッケージから消す。
5. 結果として、変えたもの、足した名前、件数、`fixtures:check` の結果を示す。

### 5.1 保持する形式と埋め込みデータの指定読み

1. 新たに受理して保持する形の `specified.json` を生成する前に、
   新しい接頭部ごとに、
   関係する差異の除去それぞれと接する固定の marked 入力を書く。
   通過した裸行と trivia の前・間に接頭部がある場合も含める。
   既存の `tools/src/specified-reading.ts` の `specifiedRunOf` と、
   fixture CLI の dry-run の経路で実行する。
   参照テキスト、受理、Db、埋め込みの title・設定・data block effects を調べる。
   仕様が意図する読みと照合する。
   保持する原文と、共有の frontmatter・設定の読みを保つ。
2. `embedded-data-opaque` の向きと指定読みの要否は、
   `packages/tests/src/fixture-acceptance.ts` の `DIVERGENCE_PROPERTIES`
   のその識別子の行を参照し、
   [比較する Db](../../../packages/spec/docs/known-divergences/embedded-data-opaque.ja.md#比較する-db)
   の読みを実装する。
   `tools/src/specified-reading.ts` の `opaqueReferenceInput` と
   `specifiedRunOf` を、既存の CLI の経路で実行する。
   固定の frontmatter・directive の場合で、その行の向きを確かめる。
   参照テキスト、
   `packages/tests/src/mermaid.ts` の `readMermaidConfiguration`
   が返す設定とタイトル、生成した受理・Db・埋め込み値を調べ、
   その定義と照合する。
   `OPAQUE_ACCEPTANCE_KEYS` を仕様が名指す鍵と照合する。
   受理条件の鍵と共存する保持タイトル、
   拒否されたブロックと共存する正しい Db 設定も含める。
3. 共有 helper の拡張が必要なら、ほかの呼出し元を読む。
   他図種も含め、呼出し元の marked fixture を確かめる。
   共有 helper のテストに固定の回帰例を加える。
   生成の前後で、既存 `specified.json` 全件の hash を比べる。
   全カテゴリに `generate --check` を実行する。
   記録の変更はすべて分類してから受け入れる。
   受理、Db、埋め込み値、記録の追加・削除も含める。
   既存の共有経路を拡張する。
   図種固有の読み方を加えたり、道具が新しい保持形式を扱うと決めつけたりしない。
4. 参照経路を確かめてから、
   SKILL tests-diagram-type の
   [references/collecting-fixtures.ja.md](../tests-diagram-type/references/collecting-fixtures.ja.md)
   の手順 8 の、安定した生成の手順を行う。
   別の所で述べられた件数を信じず、CLI の操作後の現在の corpus から、
   印と必須の読みを数え、足りない記録を報告する。
   比較する Db のない opaque-data の場合は、テストと報告で明示する。
   比較できるようにするための指定読みや Db を作り上げない。
