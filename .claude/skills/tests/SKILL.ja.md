---
name: tests
description:
  Extract mermaid.js's truth for a diagram type (the Db normalizer) and collect
  its fixtures in @mmd-toolkit/tests, keep the fixture tools that the other
  packages use, and update the pinned mermaid.js (regenerate, classify the
  differences). Use when a diagram type is added, when a fixture, a rename or a
  known divergence identifier is needed, or when mermaid.js is to be updated.
---

# 正解の取り出しと fixture（tests）

`@mmd-toolkit/tests` と `tools/` の作業の手順。
図種を 1 つ足すときの正規化関数と fixture、
ほかのパッケージのために fixture の道具と一覧を保つこと、
pin した mermaid.js の更新を扱う。
会話の履歴や記憶がなくても、この文書だけで同じ品質で進められるように書く。
このパッケージの方針と基準は 1 の節にある。
すべてのパッケージに当たるものは AGENTS.md と SKILL `conventions` にあり、
2 の節がそれを指す。

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
   基準は変わるので、作業のたびに読む。
2. `packages/tests/README.md` と `packages/tests/docs/` の 5 つの文書、
   `tools/README.md`。
   fixture の形式、期待値の求め方、Db の要約、埋め込まれたデータの値、
   fixture の保守と収集の手順はそこにある。

## 3. 作業ツリーの扱い

- この SKILL の手順が書くのは、`packages/tests`、`tools/`、
  この SKILL の文書だけ。
  ほかのパッケージ（`packages/spec`、`packages/parser`、
  `packages/prettier-plugin-mmd`）を直す必要が出たら、
  そのパッケージの SKILL の手順で直す。
  ほかのパッケージのテストから入力を取るときは、読むだけにする。
- コミットと push は、求められたときだけ行う（AGENTS.md の「行動原則」）。
  fixture の改名は、ディレクトリごと通常の `mv` で行う。
  `ast.json` や `parse-error.json` も一緒に動く。
  `git mv` はステージも変える。
- ルートの共有ファイルは、すべてのパッケージに効く。
  共有ファイルは、`package.json`、`pnpm-lock.yaml`、`eslint.config.mjs`、
  `prettier.config.js`、`tsconfig.json`、`.github/workflows/`、
  `scripts/` である。
  必要なときだけ変え、
  変えたらリポジトリ全体の検査（`pnpm run lint` と全体のテスト）を通す。
- 確かめのためのスクリプトや一時ファイルは、作業ツリーではなく、
  リポジトリの外の作業用のディレクトリに置く。
- fixture のディレクトリを消すと、
  権限の判定で止められることがある（取り消せない削除）。
  消す必要があるときは、消すものの一覧とコマンドを示して決定を求める。
- Write ツールとシェルのヒアドキュメントは、
  `\u00a0` のようなエスケープを実際の文字に変えることがある。
  ソースや文書を書いたら `node scripts/check-invisible-chars.mjs` を実行し、
  見えない文字がないことを確かめる。
- `eslint --fix` と Prettier の結果は、SKILL `conventions` のとおり必ず読む。

作業ツリーをほかの作業と共有しているとき:

- ほかの作業が編集中のファイルに触らない。
- 追跡されているファイルを一時的に書き換えて試さない。
  途中でステージされることがある。
- git のステージと、チェックアウトされたファイルを変えない（`git add`、
  `git mv`、`stash`、`checkout`、`reset`）。
  プロセスを名前で止めない（`pkill -f vitest` は、ほかの作業のテストも止める）。

## 4. 確かめ方（すべての作業で）

- 主張は、それが誰のものでも、
  mermaid.js を実際に動かして確かめてから採り入れる。
  リポジトリの外の作業用のディレクトリに、
  次のスクリプトを `probe.mts` として置き、
  `<repo>` をリポジトリのルートの絶対パスに置き換えて、
  `node <作業用のディレクトリ>/probe.mts` で動かす。
  Node は TypeScript をそのまま実行し、どのディレクトリから実行しても動く。
  拡張子を `.mts` にすると、Node はファイルを ES モジュールとして読み、
  top-level の `await` が使える。
  ソースファイルは絶対パスで import する。
  リポジトリの外のファイルからは、パッケージ名が解決されないため。
  Node は型を取り除くだけなので、型だけの import は `import type` で書き、
  `enum`、`namespace`、引数のプロパティは使わない。

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
  JavaScript の `\s` の 23 文字を 1 つずつ置いて mermaid.js に通して確かめた。
  fixture の全件や、収集した入力の全件に対して、
  前後で結果が変わらないことを確かめる。
- どのテストをいつ回すかは、SKILL `conventions` の「テストの実行」に従う。
  このパッケージでは次のとおり。

  | 変えたコード                                                | 回すテストのファイル（`tests/`）                               |
  | ----------------------------------------------------------- | -------------------------------------------------------------- |
  | `src/index.ts`（形式、ローダー、`KNOWN_DIVERGENCES`）       | `fixtures.test.ts`、`expected-changes.test.ts`                 |
  | `src/fixture-acceptance.ts`                                 | `fixture-acceptance.test.ts`、`fixtures.test.ts`               |
  | `src/mermaid.ts`、`rejections.ts`、`run-mermaid-options.ts` | `mermaid.test.ts`、`mermaid-run-store.test.ts`                 |
  | `src/mermaid-run-store.ts`                                  | `mermaid-run-store.test.ts`                                    |
  | `src/divergence-removals.ts`                                | `divergence-removals.test.ts`、`mermaid.test.ts`               |
  | `src/normalizers/<図種>.ts`、`normalizers/index.ts`         | `mermaid.test.ts`、`fixtures.test.ts`、その後 `fixtures:check` |
  | `src/normalizers/data-blocks.ts`                            | `data-blocks.test.ts`、`mermaid.test.ts`                       |
  | `src/normalizers/browser-stand-ins.ts`                      | `browser-stand-ins.test.ts`、`mermaid.test.ts`                 |
  | `src/normalizers/json.ts`                                   | `json.test.ts`、その後 `fixtures:check`                        |
  | `src/expected-changes.ts`                                   | `expected-changes.test.ts`                                     |
  | `src/recorded-embedded.ts`                                  | `recorded-embedded.test.ts`、その後 `fixtures:check`           |
  | `src/fixture-shapes.ts`                                     | `fixture-shapes.test.ts`                                       |
  | `src/db-from-tree/`                                         | `db-from-tree.test.ts`、`converted-text.test.ts`               |
  | `src/source-scan.ts`                                        | `source-scan.test.ts`                                          |
  | `src/check-tree/`                                           | `check-tree-corpus.test.ts`、`check-tree*.test.ts`             |
  | `tools/src/diagrams.ts`                                     | `tools-diagrams.test.ts`                                       |
  | `tools/src/fixture-store.ts`                                | `tools-fixture-store.test.ts`                                  |
  | `tools/src/spec-recorder.ts`                                | `tools-spec-recorder.test.ts`                                  |
  | `tools/src/specified-reading.ts`                            | `tools-specified-reading.test.ts`                              |
  | `tools/fixtures.ts`、`tools/collect.ts`                     | テストのファイルはない。下を参照                               |

  `tools/src` の関数のうち、fixture の記録ファイルの中身を決めるものは、
  モジュールごとに 1 つの `tests/tools-*.test.ts` でテストする。
  記録器は Node.js 自身の `import()` を必要とするので、
  そのテストでは別のプロセスで動かす。
  コマンドラインのファイル（`tools/fixtures.ts`、
  `tools/collect.ts`）にはテストのファイルがなく、
  それぞれのコマンドを動かして確かめる。
  `add-many`、`set-divergence`、`set-note` は `--dry-run` を付け、
  変える予定のものを読む。
  `generate` は `fixtures:check` で確かめる。
  `tools/collect.ts` は、`--out` をリポジトリの外に向けて動かし、
  書いたファイルを読む。

  1 つのファイルは
  `pnpm --filter @mmd-toolkit/tests exec vitest run tests/<ファイル>` で回す。
  `fixtures.test.ts` は 2 つの README を読む（既知の差異ごとに項目がある）ので、
  README を変えたときにも回す。
  このパッケージには大きくする量がない。
  完了を報告する前の実行は、全体（`pnpm --filter @mmd-toolkit/tests test`）。
  `fixtures:check` は、結果の作り方か記録の仕方（`src/mermaid.ts`、正規化関数、
  形式、生成器）を変えた後と、その変更の完了を報告する前に回す。
  `src/` を変えたら `lib/` を作り直す（下）。
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
  それらのファイルの変更は、入れる前に、テストを回す人に知らせる。
  そして、長い実行が動いていないときに入れる。
  動いている長い実行が貯めた結果を、捨てることになるためである。
  すぐに入れてよいのは、誤った結果を直す変更だけで、そのときも知らせる。
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
  `src/` を読む（vitest の設定の alias、相対の import、
  ルートの `tsconfig.json` の `paths` による）。
  そのため、`src/` の変更は、それらの次の実行にすぐ届く。
  `lib/` は、それ以外の所でパッケージの名前が読み込むもので、
  たとえば素の `node` のスクリプトから読まれる。

## 5. 図種を足すとき

図種は 1 つずつ足し、1 つの図種を、正規化関数と fixture（この節）、
仕様（spec の SKILL）、parser（parser の SKILL）、
printer（prettier-plugin の SKILL）の順に終えてから次の図種に進む。
後の作業は前の作業の結果を使う。
仕様と parser は要約の欄の一覧（`docs/db-summaries.ja.md`）を参照し、
仕様の主張と parser のテストは fixture を使う。
木から要約を作る手順は、仕様の木の文書の後に、
ここに書く（`docs/db-from-tree/<図種>.ja.md` と `src/db-from-tree/<図種>.ts`）。

Chevrotain の図種にも同じ手順を適用し、トークン定義を字句規則として読む。
単位を決めるのはトークンの順序、有効な mode、明示的な `longer_alt` であり、
一般的な最長一致ではない。
パーサーが木を回復しても、字句エラーは構文エラーより先に入力を拒否する。
パーサーの rule メソッドを文法規則、model builder の検証を受理条件として読む。
それぞれを区別する場合を集め、
トークン数だけでは確かめられない mode の切替と優先順位の組合せも含める。

Langium の図種では、その図種自身の文法と service から次の事項を導く。
terminal の順序、境界、変換、公開を図種ごとに導き直す。
共通規則を import しただけでは、その図種での使われ方は決まらない。

1. `entry` 規則から import と規則呼出しをたどる。
   書かれた文法と生成文法を読む。
   token builder と value converter を注入する service module も確かめる。
   hidden を含め、到達可能な terminal だけを結果の順序で列挙する。
   import 先に宣言があるだけでは到達しない。
   terminal の構成規則も、独立した字句単位になるとは限らない。
   clone に生成ファイルがなければ、
   インストールされた pin の bundle の source map を読み、
   生成 module・文法と書かれた service の配線を照合する。
2. keyword のパターンも読む。
   独自の境界を持つもの、既定の順序を使うもの、
   明示的な `longer_alt` の選択肢を持つものを列挙する。
   [共有の token builder](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/common/tokenBuilder.ts#L7-L31)
   は指定された keyword だけに、空白・EOF・percent ペアの先読み境界を加える。
   一般的な最長一致ではなく、最初に合う規則を取る。
   keyword 境界と明示的な選択肢も単位を決める。
   接着した接尾辞、keyword の接頭辞、keyword に接した記号、
   参照・数・文字列・共通の複合 terminal との優先順位を probe する。
   検出には、それ自身の境界がある。
3. hidden terminal が字句規則として消費するテキストを調べる。
   全体の除去とは区別する。
   import した
   [YAML・DIRECTIVE terminal](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/common/common.langium#L25-L34)
   は直後の LF を消費し、ほかの空白境界は先読みだけする。
   各単位の隙間と各文の EOL・EOF を probe する。
   唯一の LF が消えると次の文は拒否されるが、
   共通の付加 LF が消えた場合は EOF で EOL を満たせる。
   先頭の frontmatter、共通の directive 除去、本文の hidden terminal を分ける。
   閉じを選ぶ前に、選択肢の優先順位を導く。
   本文のある選択肢が、隣接する空の閉じより先に選ばれる場合がある。
   保持する接頭部と、通過した裸行の trivia について、
   検出から parser への受渡しを、その図種で独立に probe する。
4. 実際の terminal 規則名から、注入された converter と fallback をたどる。
   恒等・文字列・整数・double の変換は、到達するものだけを調べる。
   [共通の converter](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/common/valueConverter.ts#L26-L70)
   は、行とブロックの共通の値で空白の読みが異なる。
   たとえば pie の
   [独自分岐](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/pie/valueConverter.ts#L6-L16)
   は PIE_SECTION_LABEL を名指すが、
   [文法](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/pie/pie.langium#L1-L20)
   は STRING を呼び、既定の escape 変換に進む。
   到達する単位について、両方の引用符、未知の escape、精度、 overflow、
   underflow を集める。
   前の図種の単位に到達しない所は、拒否の対照を置き、理由を記す。
5. 回復した AST だけでなく公開の受理の門を読む。
   [公開 parse wrapper](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/parse.ts#L134-L150)
   は字句・構文エラーが 1 つでもあれば拒否する。
   次に、その図種の AST から Db への公開をたどる。
   保存する値、条件付き・省略する代入、値を代入しない文法の literal、
   adapter が捨てる文を区別する。
   再代入の順序、最後の空値、重複の扱い、公開後の意味上の拒否を記録する。
   何も公開せず、要約が空になる図種もある。
   先頭・回復した文の内部・正しい接頭辞の後のエラーを、
   到達可能な Db の拒否それぞれとは別に調べる。
6. parse を await する spec を記録できるよう、
   collector の parse stub は非同期にする。
   `Promise.resolve(record(text))` で呼出しを記録する。
   Langium を実行せず、受理を模倣しない。
   共有の recorder で spec を実行し、
   各記録位置が実際の parse 呼出しであることを確かめる。
   stub のために最後の入力の後でだけ本体が失敗するテストは、
   入力の欠落がないと証明してから、§5.3.3 の既存の明示的な許可を使える。
   normalizer、固定 fixture、安定した生成は §5.2〜5.3 に従う。
   AST の定義後は §6 の手順で Db builder と checker を実装する。

### 5.1 入力

- 足す図種の名前と、同じ Db を使う図種 ID の一覧。
  図種 ID は、mermaid.js の検出器の一覧と、図種の定義の `db` から分かる。
  1 つの検出器が、いくつもの宣言の語を受け持つことがある。
  `classDiagram` と `classDiagram-v2` は、
  どちらも `classDiagram` として検出される。
  図種の fixture は、図種 ID がいくつあっても 1 つのディレクトリに置く。
  図種名の規則は [conventions](../conventions/SKILL.ja.md#コード) にある。
- pin した版のタグの mermaid.js の clone。
  `.gitignore` に入っている `.work/mermaid` に置く。
  作り方は `tools/README.md` にある。

### 5.2 正規化関数

1. clone の中で、文法、AST から Db への adapter があればそれ、 Db の実装、
   renderer を開く。
   private・closure 内の状態と、
   公開の呼出しを全部挙げる（Jison の `yy.` 呼出しか、
   上で導いた adapter の呼出し）。
   Db がブラウザのグローバル（`window`、`document`、`Option`、
   `CSS`）を読む箇所をすべて探し、それが mermaid の解析中に動くのか、
   描画の後にだけ動くのかを確かめる。
   class の click のコールバックと tooltip は描画の後に動くので、何も要らない。
2. 要約に含める欄の案を、欄ごとに、renderer が読む所、構文が決めるか、
   含める理由、落とすものと理由の表にする。
   ほかの Db メソッドが読むというだけで、解析・検証用の状態を残さず、
   値を代入しない keyword、捨てる AST の値、build 定数から欄を作らない。
   空の要約も正しい結果である。
   次のものは落とす候補として必ず問う。
   括弧に、flowchart と sequence での例を書く。
   - 描画から導く値、描画が埋める値（`domId`、
     sequence の `actorCnt` と `rectData`）。
   - ほかの欄から一意に導ける値（`textStyles`、
     sequence のメッセージの `id` とノートの一覧）。
   - サイト設定でだけ変わる値（`securityLevel: loose` のときだけ付く
     `haveCallback`）。
     構文が決める欄で、サイト設定でも変わるものは含め、
     Db のパッチがほかの設定のときの値を記録する class のリンクの target は、
     `securityLevel: sandbox` のときに `_top` になる。
     `securityLevel` を変えて全件を流し、要約が変わらないことを確かめる。
   - 整形が変える空白が値に残る場所（style の値の末尾の空白）。
     その図種の整形の方針と照らす（`packages/prettier-plugin-mmd/docs/<図種>.md`）。
     落とす前に、
     mermaid.js がその空白を読まないことを確かめる（sequence の空白だけの題は、
     描画が題として場所を取るので落とさない）。
   - `@{ ... }` のデータブロックだけが設定する欄。
     これは要約に含め、
     `dataBlockEffects` で実装に渡す（`docs/embedded-data.md`）。
   - 利用者が書いたキーを持つオブジェクト。
     データブロックの中身、`[|field:value|]` の props、
     sequence の links と properties がそれに当たる。
     `__proto__` のようなキーがどうなるかを、fixture で確かめる。
     own property として残る（flowchart）か、
     プロトタイプを置き換える（sequence の links と properties）。
     後者は `toJson` が拒むので、
     プロトタイプを最初の項目 `__proto__` として記録する。
   - Db が読んだものを 2 つ以上の形で持つときの、要約の元。
     各要素を 1 度ずつ、それに当たるものとともに持つ形を取る。
     たいていは描画が読むもの。
     ほかの形を取らない理由を書き残す（state: 文の木は何も変えない文を持ち、
     状態の表は最上位だけを持つので、
     要約はレイアウトのデータ `getData()` から取る）。
     collection の走査順、置換の位置、生成の順序を区別し、
     renderer がそれぞれを必要とする場合だけ残す。
   - mermaid.js が無作為に作る id（state の、最後の `--` の後の領域）。
     綴りから推測せず、公開時に、書かれた id と生成 id のどちらかを記録する。
     生成された同一性・参照と証明できる位置だけを、定めた生成順で置き換え、
     後の文に書かれたものも含め、著者の placeholder 名を予約する。
     著者のテキストから id に見える部分文字列を探さない。
     記録が変換より前で、公開が変換後に由来を決めるなら、 converter を写さず、
     記録が依る同値性を明記してテストする。
     拒否後の reset と、生成の 2 回の安定を確かめる。
   - テキストではなく、実行の時刻や偶然に依る値（gantt は日付を、
     プロセスのタイムゾーンで計算し、
     タスクでない id の後ろの開始では今日の日付を読む）。
     これまでの結果の貯蔵庫（`docs/expected-results.md`）は、
     別の日に作った結果を返す。
     そのため、そうした値は要約から落とすか、その図種の結果を貯めないか、
     依るものを貯蔵庫の鍵に入れる。
     gantt の要約は日付を持たない。
     Db が日付を計算するのは図を描くときだけだからである。
     確かめは、すべての fixture を別の日、別のタイムゾーン（`TZ=...`）、
     別の順で動かし直し、`expected.json` と比べて行う。
3. 表を決めてから書く。
   決める根拠は、
   AGENTS.md の正しさの基準（受理する入力の Db は mermaid.js と一致する）と、
   要約は構文が決める情報だけを持つこと（`docs/db-summaries.md`）、
   使う側への影響（仕様と parser が参照する要約の欄、木からの Db の導出）。
   分からない形（データブロックの記録など）は、
   リポジトリの外の作業用のディレクトリで試作して確かめてから決める。
4. `packages/tests/src/normalizers/<図種>.ts` に正規化関数を書き、
   `src/normalizers/index.ts` に、同じ Db を使う図種 ID をすべて登録する。
   Db のパッチが要るか（リンクを `utils.formatUrl()` で保存する、
   データブロックを持つ）を確かめ、
   要るなら同じファイルに書いて `dbPatches` に登録する。
   登録には、mermaid が受理し、
   その図種 ID として検出するテキストを添える（`classDiagram`
   だけでは拒否されるので、 class の見本は class を 1 つ持つ）。
   `runMermaid()` は、どの入力を解析するよりも前に、
   すべての Db クラスにパッチを当てる。
   Db のメソッドが、Node にないブラウザの関数（`window`、`document`、
   `Option`）を呼ぶと、 `MermaidEnvironmentError` になる。
   そのときは、パッチがその呼び出しの間だけ、
   その関数の代役を与える（`src/normalizers/browser-stand-ins.ts`）。
   mermaid の処理は書き写さない。
   代役が何を答えるかは、実装が比べる相手を決める。
   そのため、選択肢と推奨を示して決定を求め、
   決まったものを `docs/expected-results.md` に書く。
   データブロックの効果は、`data-blocks.ts` の `blockEffect` で、
   ブロックのない状態とある状態の要素の要約を比べて記録する。
   比べ方は、文法がブロックをどう渡すかで決まる。
   別の呼び出しで渡すなら、その呼び出しの前後を比べる（flowchart）。
   要素を足すのと同じ呼び出しで渡すなら、
   ブロックなしで 1 回実行して Db の一覧を元に戻し、
   本来の呼び出しと比べる（sequence）。
   すべての図が共有する 1 つのオブジェクトで、
   状態をモジュールの変数に持つ Db は、クラスを持たない（gantt）。
   そのパッチは `appliedTo: "object"` で登録してオブジェクトを受け取り、
   パッチが記録するものは、Db の `clear()` に合わせて初期化する。
   生成された構文解析器は、オブジェクトの性質の写しに対してメソッドを呼ぶので、
   パッチしたメソッドの中の `this` は Db ではない。
5. `src/index.ts` の `DiagramType` と、
   `tools/src/diagrams.ts` の `diagramIds` に図種を足す。
   `tests/fixtures.test.ts` の、図種ごとの読み込みのテストと、
   全件を読むテストの一覧にも足す。
   normalizer のファイルを、
   `packages/tests/src/mermaid-run-store.ts` の `RESULT_FILES` に足す。
   `codeIdentityOf` はこの一覧を使って結果の識別を作る。
   他パッケージの利用側の一覧の担当へ図種を伝え、担当範囲の外を編集しない。
6. `tests/` にテストを足す。
   確かめるのは、落とした欄が出ないこと、パッチが要約を変えないこと、
   データブロックの効果。
   corpus に基づくテストでは入力文字列を写さず、fixture を名前で読み、
   足りない入力は probe 後に CLI で足す。
   新しい図種を要約のない見本として使うテストを探し、その assertion を、
   確かめた別の要約のない fixture に移す。
7. `pnpm --filter @mmd-toolkit/tests run fixtures:generate` を実行する。
   変わるのは、`common/` の fixture のうち、
   その図種を載せたもの（`db: null` が要約になる）だけのはず。
   それ以外が変われば、理由を調べる。
   それらの fixture は要約を持ち、木を持たない。
   `tests/db-from-tree.test.ts` の `DIAGRAM_TYPES_WITHOUT_RECORDED_TREES`
   にその図種を足し、 parser が木を記録したら外して、
   builder を記録した木で走らせるよう、同じファイルの `DIAGRAMS` に足す。
   その図種のノードの型の接頭辞（`Requirement`）も、
   `tests/check-tree-recorded.ts` の `NODE_TYPE_PREFIXES_WITHOUT_RECORDED_TREES`
   に足す。
   ノードの型ごとに記録した木を求めるテストはこの接頭辞の型を除く。
   これも同じときに外す。
   外すときは、その図種の値の欄の行（`VALUE_FIELD_REPORTS` ほか、
   欄と値のテストの表）を書いておく。
   この一覧は図種の間は空のままにする。
8. `docs/db-summaries.md` と `.ja.md` に、その図種の節（何を落とし、
   なぜか）を書く。
9. 結果として、要約の欄の一覧と、落とした欄とその理由を示す。
   仕様と parser は、この一覧を参照する（`docs/db-summaries.ja.md`）。

### 5.3 fixture

1. 入力は、その図種の構文に図のテキストを渡す mermaid のテストと、
   docs の mermaid のブロック、demos から集める。
   Langium の図種では、
   そのテストに mermaid の parser パッケージのその図種のテストも含める。
   図種ごとに集めるテストファイルの一覧と除外の理由は、
   `tools/collect.ts` の `SPEC_FILES` だけが持つ。
   無関係なテストや e2e は集めない。
   範囲は `tools/README.md` で説明する。
2. 収集の道具（`tools/collect.ts`、`tools/src/spec-recorder.ts`）は、
   図種を引数に取る。
   図種ごとに違うのは、読む spec ファイルと、テキストを受け取る関数だけ。
   `collect.ts` の `SPEC_FILES` に、その図種の spec ファイルのうち、
   図のテキストを mermaid に渡すものを足す。
   除くファイルには理由を書く。
   spec ファイルが import するモジュールと、
   テキストを受け取る関数（図種のパーサーの `parse`、
   `Diagram.fromText` など）のスタブは、 `spec-recorder.ts` の一覧に足す。
   この一覧は全図種で共有する。
3. spec ファイルの記録器について、flowchart と sequence でつまずいたこと:
   - spec ファイルは、ループやテンプレートリテラルで入力を作るので、
     文字列リテラルを静的に読むと取りこぼす。
     ファイルをスタブに対して実行して、parse に渡された文字列を記録する。
   - import をスタブに向けるのに Node の module hooks（`registerHooks`、
     `register`）を使うと、 lint が実験的な機能として止める。
     TypeScript で transpile すると行番号がずれる。
     テストファイルを一時ディレクトリに写し、
     import のパスの引用符の中だけを書き換えて、そのまま import する。
     テストの中の `import("...")` の呼び出しのパスも書き換える。
     型だけの import は、Node が消すので、そのままにする。
   - macOS の一時ディレクトリはシンボリックリンクなので、
     スタックトレースの実パスと合わせるために `realpathSync` を通す。
   - Node は URL ごとにモジュールを 1 回しか評価しないので、
     スタブのモジュールはテストファイルごとに別のディレクトリに置く。
   - 入力を隠し得る例外を黙って捨てない。
     スタブが文字列にされたら例外にし、本体の例外があれば収集を止める。
     収集を続けられるのは、ファイル・テスト名・エラーの本文が、
     `collect.ts` の `ERRORS_AFTER_THEIR_INPUT` に載っていて、
     最後の parse 呼出しの後でだけ失敗し、全入力を記録したと証明できる場合だけ。
   - 描画の配置を確かめるテストは、スタブで算術をする。
     スタブの算術は `NaN` にし、`NaN` を含むテキストを記録したら止める。
   - 実際の DOM で描画して図を確かめるテストは、
     スタブでは動かない（sequence の `actorBandModel.spec.ts`）。
     その入力が docs や demos にもあることを確かめて、理由を書いて除く。
   - 記録した各入力の行に、実際にテキストを渡す呼び出しがあることを確かめる。
4. docs と demos のブロックは、
   mermaid.js の検出器（`detectDiagramType`）でその図種のものだけを取る。
   demos のテキストは `mermaid.run()` が読むものにそろえる。
   `<pre>` の直後の改行を落とし、文字参照を解決し、
   mermaid が使う `ts-dedent` をかけ、trim する。
   ブラウザで実際のページと照らすと、
   確かめられる（flowchart では demos を localhost で配って照合した）。
5. 収集した入力には `config` を付けない。
   名前は `<出どころ>-<ファイル>-<入力の SHA-256 の先頭 8 桁>`
   （`docs/maintaining-fixtures.md`）。
6. `fixtures:add-many <図種> <ファイル> --dry-run` で試し、
   出力を読んでから本番を実行する。
7. `add-many` が出す「rejected by mermaid」の一覧を 1 件ずつ見る。
   埋め込まれたデータだけが原因で拒否されるものには、
   `fixtures:set-divergence` で `embedded-data-opaque` を付ける。
   埋め込まれたデータとは、データブロックの未知の shape や壊れた YAML、
   フロントマター、ディレクティブのこと。
   標準外のエラー（`TypeError` など）は、入力が原因かを手で確かめる。
   `MermaidEnvironmentError` が出たら、
   Node にない機能を mermaid.js が使っている。
   5.2 のとおり代役を与える（`docs/expected-results.md`）。
   正しい埋め込み設定が受理を両方向に変える場合も probe し、
   仕様の印と必須の読みを §7.1 で適用する。
   拒否の一覧だけを、差異の全件の一覧としない。
8. `fixtures:generate` を 2 回実行し、
   上のハッシュの比較で 2 回目が何も変えないことを確かめる。
   `fixtures:check` を通す。
   収集をもう一度実行し、
   新規が 0 件であること（名前が安定していること）を確かめる。
9. 手書きの入力。
   各入力は、note の 1 行で 1 つの問いに答える。
   書く前に、これまでの図種の review が足りないと見つけた場合の種類を、
   新しい図種の文と fixture に先に当てる。
   一覧にして当て、当てはまらない種類は、省かずに理由を書く。
   どの種類でも、構文のテキストを持つ場所すべて（欄、名前、文字列、
   ブロック。引用符の内外、最初の行とあとの行）を mermaid.js で確かめる。
   入力は、一覧の文言からでなく、これまでの図種の fixture の名前から取る。
   近い 2 つの図種の手書きの fixture の名前を `ls` で一覧にし、名前ごとに、
   新しい図種での対応か、対応しない理由を書く。
   一覧は、これまでの review が見つけた種類をすべて持ち、
   見つけた review を添える。
   - `style` 行と `classDef` 行の行の規則が届く値。
     `style`、その後ろの `:` と `#` を持つ行の最後の `;` が、
     その行のどのテキストからも落ちる（timeline の review 435、sankey の 441）。
     語の大文字小文字が違う、`:` と `#` の間に空白がある、`#` がない、
     `;` が別の行にある場合は `;` が残り、
     `;` が 2 つあれば最初の `;` が文字参照を終える。
     引用符の中の行は、それだけで 1 つの行（441）。
   - キーワードと値の間のコメント行、ディレクティブの行、
     空行（timeline の review 435 の軽 1）。
     また、行にテキストのないキーワードが、
     後の行を値に取る場合（アクセシビリティのテキスト）は、取られる行そのもの。
     図の文の行であっても、
     そのまま値になる（xychart の review 448。 `accTitle:` の次に `line [1]`）。
   - キーワードの別の大文字小文字と、その後ろにくっついた文字、語の文字、`-`、
     ASCII の外の文字。
     ヘッダーにも、各文のキーワードにも。
   - `Object.prototype` の名前（`__proto__`、`constructor`）を名前や id にする。
   - 同じ名前の 2 つ目、3 つ目の定義。
     どれが残るか、文法のアクションのほかの呼び出しが働くか。
     3 つ目は、相手が最初の定義でない組み合わせにする（review 419・420）。
   - 空の説明ブロック（またはテキストのない文）が、
     前の値を保つこと（timeline の review 436。 er と requirement にも）。
   - CRLF、単独の CR、U+2028、U+2029。
     行末として、値や引用符の中で、テキストの末尾で。
   - 空白の種類のタブと U+FEFF。
     行の先頭、値の中、行とテキストの末尾で（timeline の review 436 の軽 2、
     437 の軽 5）。
   - 文字参照。
     すべてのテキストと引用符の中で、
     また文字参照の `#` はコメントを始めないこと。
   - ディレクティブで切れる値。
     値の中、その先頭と末尾、引用符の中、ヘッダーの行、キーワードに続けて、
     閉じないもの（次の行の先頭の語か、
     テキストの残りを取る）（sankey の review 441）。
   - 閉じない文脈の中でテキストが終わる場合。
     `accTitle:` で終わる、終わりのないブロック、閉じない引用符。
   - 各文の形の後ろの行末。
     ` ;`、`;`、`;;`、コメント、閉じたディレクティブ、閉じないディレクティブ。
   - 値、行、テキストの末尾の空白。
     ノーブレークスペースと U+3000 を含む。
     空白だけの行。
   - 複数の行にまたがる値の途中にあるコメント行とディレクティブの行。
   - Db がテキストから読む数。
     符号、`-0`（Db は -0 で、JSON は 0 と書く）、 `NaN`、`Infinity`、
     倍精度に収まらない大きな数、
     数の後ろのテキスト（journey と sankey の review 441）。
   - Db が読む埋め込み設定の値（packet の review pk12-1）。
   - `html-tag-in-frontmatter` の受理の両方向と値だけの違い（review ra3-1、
     tm3-1、rr12-3）。
   - 文の直後の hidden の形（本文の `---` ブロック、`%%{...}%%`）。
     消費した LF の後に文が続く場合、空行が余分の LF を与える場合、
     閉じの後の空白が LF を残す場合、EOF を確かめる。
     開きをテキストとして取り込む行の値も含める（pie12-1）。
   - hidden ブロックの隣接する fence。
     本文のある選択肢を空の fallback より先に試し、
     後に適合する閉じがある場合とない場合、
     EOF と閉じの空白も含める（pie-yaml-1）。
   - 省略可能なヘッダーのフラグの後に、同じ行で文が続く場合（pie12-2）。
   - 重複した定義の 2 度目に、`-0` のような意味上の境目の値を置く場合。
     両方の順で、どの値が残るか、
     意味上の拒否が重複を捨てる前に起きるかを調べる（pie12-3）。
   - C4 検出の 4 語（`C4Container`、`C4Component`、`C4Dynamic`、
     `C4Deployment`）を、すべてのテキストの欄に置く場合。
     label、title、accTitle、accDescr の行とブロックを含める。
     文の後とヘッダーの行で、EOF で終わるコメントにも置く。
     LF で終わる対照も含める（pie3-4）。
   - 通過した裸の `%%` 行とヘッダーの間の空白。
     VT、FF、NBSP、BOM、U+1680、U+2000〜U+200A、U+202F、U+205F、 U+3000、LS、
     PS をそれぞれ空白だけの行とヘッダーの直前に置く。
     ASCII の空白・タブの対照も含める（pie3-3）。
   - 検出がブロックを 1 つ飛ばす場合の 6 通り。
     2 つ目のブロック、裸の `%%{` 行の後、本物の frontmatter の後、
     二度目の directive 読みの前と後を別々に、
     開きと閉じが同じ字下げの形を調べる（pie3-6）。
   - keyword の直後に global な directive が接着し、
     その後に次の keyword や値が接着する場合。
     境界は、
     global な directive と選ばれたセミコロンを除いた文で判定する（pie3-7）。
   - 各図種の atom（固定語、ヘッダーの keyword、矢印、共通の keyword、
     空白を含められない class 名や icon の値）の中と、
     作者が書いた部品の間にある global な directive と選ばれたセミコロン。
     atom の中を割り、mermaid.js が受理する場合は、
     `directive-as-token-boundary` または `ignored-semicolon-as-token-boundary`
     の印を付ける。
     pie3-7 のように末尾に接する場合と、
     atom 自体を割る場合を区別する（review cy12-1、
     tv12-2。 railroad の工程 1・2 と、
     wardley の工程 1・2 および 3 の review でも確認）。

   review がこの一覧にない種類を見つけたら、review の番号とともにここに足す。
   その review を閉じる変更で行う。

10. 結果として、出どころごとの件数（受理・拒否）、標準外の拒否の内訳、
    印を付けた fixture、
    `fixtures:generate` と `fixtures:check` の所要時間を示す。

## 6. Langium の図

§5 に従い、その図種の挙動を抽出して固定 fixture を集める。
保持する形や不透明な埋め込みデータの指定読みを生成する前に、§7.1 に従う。
構文と AST の定義後は、その契約から、
次の手順で Db builder と checker を実装する。
以下のパスは `packages/tests` からの相対パスである。

`checkTree` が見るのは、木の欄、範囲、token、字句の不変条件だけである。
意味上の受理は parser のもので、記録の種類と `fixtureAccepts` の比較で確かめる。
仕様側の module と helper は規則で名付ける。
エンジン名は抽出手順で Mermaid の実装を指すもので、木が実装する規則ではない。

1. その図種の構文・AST の文書、parser の token・位置の契約、
   `docs/db-from-tree.md`、`docs/check-tree.md` を読む。
   意味上の受理条件は、Db 抽出の文書に委ねず、構文仕様の直接の文として求める。
   比べる値と状態の遷移も、escaping、entity の変換、実効の同一性、
   各文の後の更新を含め、そこに定義を求める。
   定義された全ノードと欄を、共有の振り分けと欄・値の表に登録し、
   AST 文書の表の形が異なる場合は、共有の表 reader を拡張する。
2. 要約と仕様の値・状態の規則から `src/db-from-tree/<図種>.ts` を実装し、
   Mermaid の処理手順を写さず、converted-text、数、埋め込み値の helper と、
   定めた生成 id の順序を使う。
   文書の置換・順序の規則を保ち、node があっても公開されない値は除き、
   木の coverage を落とさずに空の要約を認める。
   builder には固定の手組みの木のテストを、
   checker には受理木と不正木のテストを書く。
3. `src/check-tree/<図種>.ts` に、coverage、欄、範囲、token、
   書かれた値の共有検査を使う。
   各葉が、その位置の完全な字句単位であることを検査する。
   その位置の最初の一致の優先順と、keyword・構成要素の境界に従う。
   複合形式は、書かれた keyword、記号、値の構成要素と照合する。
   AST の空・null・空白の規則も含める。
   ここで検査する書かれた綴りと、converter による Db の読みを区別する。
4. 保持する hidden の一致が、指定された隙間か本体の位置に、
   ソース順でちょうど一度あることを検査する。
   文字を明示的に走査し、仕様が先に選ぶ選択肢の中で最初の閉じを探し、
   本文のある一致が隣接する空の fallback より先なら、その順に試す。
   kind・value フィールドだけでなく、書かれた形式全体を検査する。
   文の末尾の隙間と本体の境界は AST の定義に従う。
   形式の前に可視 EOL があるかも検査する。
5. hidden terminal が直後の LF を消費するとき、
   その LF は保持する形式の範囲の外に置く。
   区切りを検査する前に、その消費を反映する。
   次の文には、文法規則が要求する可視 EOL が残っていなければならない。
   余分の LF、先読みだけの閉じ境界、付加 LF、EOF を別々に確かめる。
   書かれた EOL がなくても、EOF が文法規則を満たす場合がある。
6. ヘッダー後の native Comment ごとに、その単位位置で、
   先行する terminal が一致しないことを検査する。
   先に開始した文字列・複合値が、開始点を包んでいないことも検査する。
   terminal の一致は、文字の明示的な走査で確かめる。
   source のコメント領域と native Comment を区別する。
   ヘッダー前では、検出が通した裸行は Comment であり、
   一緒に通した空白・改行は trivia である。
   これらを図の単位として読み直さない。
   保持する接頭部には、それ自身の terminal の規則を適用する。
   本文の通常の隙間と hidden の閉じ境界は、図種の仕様どおり厳密に保つ。
   検出の例外は、検出が通した区間だけに適用する。
7. `tests/check-tree-<図種>.test.ts` に、明示的な受理木と不正木を書く。
   hidden の形式を落とす・複製する・移すことで、所有先を壊す。
   選んだ選択肢の中で後の閉じを選ぶ、
   本文に適合する一致があるのに隣接する空の閉じを選ぶ、
   消費した LF を範囲に含める、残る EOL を消す、書かれた構成要素を変える、
   先行 terminal を Comment に偽装する場合も含める。
   包む値の内側の hidden に見えるテキスト、余分の LF、EOF の受理対照も書く。
   保持する各接頭部の後に、
   検出が通した裸行と Unicode trivia がある固定例を書く。
   保持した形式同士の間に、通過した trivia がある場合も書く。
   通過した行がない対照も含める。
   本文の通常の隙間が厳密なままであることも確かめる。
   コーパスの成功だけでなく、各文と規則の接点から場合を導く。
8. builder を `docs/db-from-tree/<図種>.md`、
   検査を `docs/check-tree.md` に書く。
   どちらも日本語の対を持たせ、区別する場合ごとに fixture を引用する。
   木の記録を待つ間は、記録から契約を推測せず、
   仕様と固定の手組みの木で実装する。
   木が記録されたら、すべての記録木に checker を実行する。
   共有の埋め込み値の helper を使い、比較可能な `dbFromTree` の結果すべてを、
   記録された読みと比べる。
   木と Db の実数、記録の不足、不一致ごとの入力を報告する。
   受理の読みで木がない場合やエラー記録を黙って飛ばさず、
   エラー記録を飛ばすのは、その印の読みが拒否するときだけとする。
   §7.1 と同じく、比較する Db のない場合を明示する。

## 7. ほかのパッケージのための fixture の道具と一覧

仕様の主張を支える fixture は、
tests の生成器（`fixtures:add-many` など）で足す（方針と手順は spec の SKILL）。
この SKILL が行うのは次のこと。

1. 道具と形式を保つ。
   生成器、`add`、`add-many`、`set-divergence`、`set-note`、ローダー、
   収集の道具が、`docs/maintaining-fixtures.md` に書いたとおりに動くようにする。
   道具の使い方は、その文書にある。
   使い方を変えたら、その文書（英日）を同じ変更で直す。
2. 仕様の Known divergences
   （`packages/spec/docs/known-divergences.md`）が変わったら、
   識別子の一覧（`src/index.ts` の `KNOWN_DIVERGENCES`、
   README の一覧）を合わせる。
   `src/fixture-acceptance.ts` の `DIVERGENCE_PROPERTIES` には、
   識別子ごとの向きと指定読みの要否を明記する。
   利用側は fixture の受理に `fixtureAccepts()` を使う。
   印の形の検査は [parser のスキル](../parser/SKILL.ja.md) の §6 に従う。
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
   差分テストが見つけたもの）を残すときは、コーパスの fixture にする。
   parser のファイルに残した失敗の入力は、ほかの実装のためには残らず、
   fixture は、すべての実装が確かめるためである。
   フォーマッターと規則の入力は、それぞれのパッケージに残す。
   期待（受理・拒否、Db の値）を足す前に mermaid.js で確かめる。
   合わなければ足さずに、そのことを示す。
   失敗の原因が、仕様にその形の文がないことなら、先に仕様に文を足す。
   形ごとに 1 件だけ残す。
   入力の形は、入力のうち、
   字と数字の並びをそれぞれ 1 つの印にしたものである（キーワードは、
   書かれた大文字小文字のまま残すので、 `State` と `state` は別の形である）。
   ほかの文字は、すべて残す。
   空白、U+2028、U+2029、記号、ディレクティブとコメントの中身である。
   比べるのは、失敗の入力の同じファイルの中だけにする。
   別の種類の失敗で見つかった同じ形は、別の理由で残してあるので、落とさない。
   入力をほかのパッケージのファイルから取るときは、読むだけにし、
   文字列は構文木で取り出してバイト単位で一致させる。
   名前は既存の付け方に合わせる（`gram-`、`lex-`、`db-`、`tokens-`、
   `config-` などの接頭辞と、示すものの名前。同じ話題の入力が多いときは、
   入力の SHA-256 の先頭 8 桁の 16 進数を付ける）。
   note には、何を示す入力かを書く（見つけた review や実行の呼び名は書かない）。
   `fixtures:add-many` で足す（`fixtures:add` には印の指定がない）。
   実装のテストは、新しい fixture をほかの fixture と同じに読む。
   そのあと、失敗の入力のファイルは、それを持っていたパッケージから消す。
5. 結果として、変えたもの、足した名前、件数、`fixtures:check` の結果を示す。

### 7.1 保持する形式と埋め込みデータの指定読み

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
4. 参照経路を確かめてから、§5.3.8 の安定した生成の手順を行う。
   伝えられた fixture 数を信じず、CLI の操作後の現在の corpus から、
   印と必須の読みを数え、足りない記録を報告する。
   比較する Db のない opaque-data の場合は、テストと報告で明示する。
   比較できるようにするための指定読みや Db を作り上げない。

## 8. mermaid.js を更新するとき

1. `packages/tests/package.json` の devDependency `mermaid` を新しい版にし、
   `pnpm install` を実行する（`pnpm-lock.yaml` はルートの共有ファイル）。
   新しい版のタグで clone を作り直す。
   この節の手順は、すべて `MMD_TOOLKIT_MERMAID_CACHE=disabled` を付けて動かす。
   比べるのが mermaid.js そのものになるようにするため。
   新しい版は、どのみち貯蔵庫に新しい鍵を与える。
2. 版に結び付いた箇所を直す。
   古い版と古いコミットを、`packages/tests` と `tools/` で検索して見つける。
   `fixtures/`、`lib/`、`node_modules/` は除く。
   - `tests/mermaid.test.ts` の版の検査、`tools/README.md` の clone のタグ、
     `README.md` が名指す版。
   - `docs/` と `tools/collect.ts` の、 mermaid.js のソースへのパーマリンク。
     コミットを替え、行番号を新しい版の同じコードへ移す。
     同じ行の並びが新しいファイルに 1 か所だけあれば、その位置にする。
     コードが変わっていれば、関数を探して範囲を選び直す。
     ファイルや、文が名指すものがなくなっていれば、文を書き直す。
   - `src/` のコメントのうち、版についての主張を書いたもの。
     `src/mermaid.ts` が写したフロントマターの関数、
     `src/rejections.ts` の YAML のエラーのクラス名、
     `src/normalizers/index.ts` の `formatUrl()` を呼ぶ Db がそれに当たる。
     新しい版で主張を確かめてから、版を直す。

   記録された値の例としての版は、そのままにする。
   `src/index.ts` と `docs/maintaining-fixtures.md` にある、
   fixture の `source` の `ref` の例がそれに当たる。
   仕様の `packages/spec/docs/index.md` のコミットは、
   spec の SKILL の手順で直す。
   それまで、`pnpm run lint:docs` はこれらの文書のリンクをすべて報告する。

3. パッチと前提が新しい版でも成り立つかを確かめる。
   - DOMPurify を恒等にする差し替え: テストが確かめる。
   - Db のパッチ（flowchart では `setLink` と `addVertex`）: 2 つのタグの間で Db
     クラスを比べる。
   - データブロックの記録の 2 つの検査と、
     `runMermaid()` の手順（`docs/expected-results.md`）: テストは確かめない。
     4 の全件の実行で確かめる。
     `runMermaid()` は、`mermaid.parse()` が受理し、
     `getDiagramFromText()` が拒否するテキストで、
     `MermaidEnvironmentError` を投げる。
     データブロックの記録は、ブロックが想定外のことをすると例外を投げる。
   - 既知の差異を除いて動かすときの字句解析器の規則（`src/divergence-removals.ts`、
     選択肢 `withoutDivergences`）:
     `runMermaid()` はコンパイルされた形で規則を探す。
     試す順を変える規則は、その開始状態だけが試す規則の中から探す。
     規則が見つからないか 2 つ以上見つかるとき、
     または字句解析器が行のどこにいるかを呼び出しの中で決められないときに、
     `MermaidEnvironmentError` で止まるので、テストが失敗する。
     そのときは新しい字句解析器を読み、
     その差異がまだあるかを spec の SKILL の手順で確かめて、
     表か識別子を合わせる。
4. `fixtures:check` を実行する。
   何も書かず、作れない fixture があっても止まらない。
   `expected.json` が変わる fixture を、どう変わったかとともに出し、
   その後に作れない fixture を出す（`docs/maintaining-fixtures.md`）。
   何かを決める前に、この一覧から分類する。
   - `acceptance` と `Db values`: 構文の変化。
     仕様（spec の SKILL）と parser（parser の SKILL）の更新に関わる。
     新しい版にない図種は、それを載せた `common/` の fixture で、
     `UnknownDiagramError` への `acceptance` として出る。
     これは下の検出の項に入れる。
   - `summary fields`: Db の内部の変化。
     ただし、キーが著者の書いたものなら、そうではない。
     正規化関数を直すか、落とす欄にするかを、5.2 の表と同じ形で決める。
   - `detection`、図種が増えたか、なくなったもの: `diagramIds` と、
     仕様の `packages/spec/docs/detection.md` に関わる（detection.md は spec の
     SKILL の手順で直す）。
   - `error name`: 新しい名前も入力が原因であることを確かめる（生成器は、
     標準の拒否のほかの名前を一覧に出す）。
   - `error message only`: 何もしない。
     実装は message を比べないため。
   - `embedded values`: 入力が与えるタイトル、データブロックの効果、設定の変更。
     実装が、それらから Db を組み続けられるかを確かめる。
     mermaid.js の既定値の変更は、`default-config.json` の変更として現れる。
   - `specified.json added`、`removed`、
     変更: 読み方を変える印のある fixture への、仕様どおりの読み。
     `acceptance` や `Db values` と同じに扱う。
   - `MermaidEnvironmentError` で作れない fixture: `mermaid.parse()` と
     `getDiagramFromText()` が食い違うか、
     Node にない機能を mermaid.js が使っている。
     `runMermaid()` の手順が成り立たない。
     そのような入力をどう記録するかは、 `docs/expected-results.md` の定義と、
     実装が比べる相手を変える。
     そのため、選択肢と fixture と推奨を示して決定を求め、決まってから進む。
   - `knownDivergence` の印が付いた行: 印がまだ当てはまるかは、
     spec の SKILL の手順で確かめる。

   その後、`fixtures:generate` でファイルを書く。

5. 新しい版のタグで収集をやり直す。
   名前は入力で決まるので、既存の名前は変わらず、新しい入力だけが足される。
   mermaid.js から消えた入力は fixture に残る。
   テストファイルがスタブのないモジュールを import して収集器が止まったら、
   `tools/src/spec-recorder.ts` にスタブを足して、
   収集し直す（`tools/README.md`）。
6. CI の fixtures ジョブが通る状態にする（`fixtures:generate`
   の後で差分があれば失敗する）。
   `MermaidEnvironmentError` が残っている間は通らない。
7. 結果として、分類した差分の一覧（fixture の名前と、何が変わったか）を、
   関わるパッケージごとにまとめて示す。

この節の手順は、まだ実際の更新で通していない。
最初の本物の更新のときに、 spec、parser、
prettier-plugin の SKILL の更新の手順と合わせて、手順に沿って進めながら確かめ、
誤りや足りないところはその場で直す。
