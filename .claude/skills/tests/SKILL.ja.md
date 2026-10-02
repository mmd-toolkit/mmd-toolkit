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
方針と基準はここに書かない。
下の「最初に読むもの」を指す。

## 1. 最初に読むもの

1. AGENTS.md の「各パッケージの責務」の `packages/tests` の節、
   「共有するインターフェース」、「行動原則」。
   基準は変わるので、作業のたびに読む。
2. `packages/tests/README.md` と `packages/tests/docs/` の 5 つの文書、
   `tools/README.md`。
   fixture の形式、期待値の求め方、Db の要約、埋め込まれたデータの値、
   fixture の保守と収集の手順はそこにある。

## 2. 作業ツリーの扱い

- この SKILL の手順が書くのは、`packages/tests`、`tools/`、
  この SKILL の文書だけ。
  ほかのパッケージ
  （`packages/spec`、`packages/parser`、`packages/prettier-plugin-mmd`）
  を直す必要が出たら、
  そのパッケージの SKILL の手順で直す。
  ほかのパッケージのテストから入力を取るときは、読むだけにする。
- コミットと push は、求められたときだけ行う（AGENTS.md の「行動原則」）。
  fixture の改名は、ディレクトリごと通常の `mv` で行う。
  `ast.json` や `parse-error.json` も一緒に動く。
  `git mv` はステージも変える。
- ルートの共有ファイルは、すべてのパッケージに効く。
  共有ファイルは、`package.json`、`pnpm-lock.yaml`、`eslint.config.mjs`、
  `prettier.config.js`、`tsconfig.json`、`.github/workflows/`、`scripts/`
  である。
  必要なときだけ変え、
  変えたらリポジトリ全体の検査（`pnpm run lint` と全体のテスト）を通す。
- 確かめのためのスクリプトや一時ファイルは、
  作業ツリーではなく、リポジトリの外の作業用のディレクトリに置く。
- fixture のディレクトリを消すと、
  権限の判定で止められることがある（取り消せない削除）。
  消す必要があるときは、消すものの一覧とコマンドを示して決定を求める。
- Write ツールとシェルのヒアドキュメントは、
  `\u00a0` のようなエスケープを実際の文字に変えることがある。
  ソースや文書を書いたら `node scripts/check-invisible-chars.mjs` を実行し、
  見えない文字がないことを確かめる。
- `eslint --fix` や Prettier の結果は必ず読む。
  空の JSDoc や、意味の変わった正規表現が入ることがある。

作業ツリーをほかの作業と共有しているとき:

- ほかの作業が編集中のファイルに触らない。
- 追跡されているファイルを一時的に書き換えて試さない。
  途中でステージされることがある。
- git のステージと、チェックアウトされたファイルを変えない
  （`git add`、`git mv`、`stash`、`checkout`、`reset`）。
  プロセスを名前で止めない（`pkill -f vitest` は、ほかの作業のテストも止める）。

## 3. 確かめ方（すべての作業で）

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
- テストは `pnpm --filter @mmd-toolkit/tests test` で実行する。
  全体のテストは重いので、負荷が高いときは自分のパッケージだけを流す。
  全件を 1 つのテストで読むテストには、
  単独の所要時間を測って時間制限を明示する（既定の 5 秒に頼らない）。
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
  ほかのパッケージは `lib/` を読む。

## 4. 図種を足すとき（Jison の図）

図種は 1 つずつ足し、1 つの図種を、正規化関数と fixture（この節）、
仕様（spec の SKILL）、parser（parser の SKILL）、
printer（prettier-plugin の SKILL）の順に終えてから次の図種に進む。
後の作業は前の作業の結果を使う。
仕様の Db normalization の節は要約の欄の一覧から書き、
仕様の主張と parser のテストは fixture を使う。

### 4.1 入力

- 足す図種の名前と、同じ Db を使う図種 ID の一覧。
  図種 ID は、mermaid.js の検出器の一覧と、図種の定義の `db` から分かる。
  1 つの検出器が、いくつもの宣言の語を受け持つことがある。
  `classDiagram` と `classDiagram-v2` は、
  どちらも `classDiagram` として検出される。
  図種の fixture は、図種 ID がいくつあっても 1 つのディレクトリに置く。
- pin した版のタグの mermaid.js の clone。
  リポジトリの外に置く。
  作り方は `tools/README.md` にある。

### 4.2 正規化関数

1. clone の中で、その図種の文法定義（`.jison`）と Db クラスを開く。
   Db の private フィールドと、
   文法が呼ぶ Db のメソッド（`yy.` の呼び出し）を全部挙げる。
   Db がブラウザのグローバル（`window`、`document`、`Option`、`CSS`）を
   読む箇所をすべて探し、
   それが mermaid の解析中に動くのか、描画の後にだけ動くのかを確かめる。
   class の click のコールバックと tooltip は描画の後に動くので、何も要らない。
2. 要約に含める欄の案を、
   欄ごとに「構文が決めるか」「含める理由」「落とすものと理由」の表にする。
   次のものは落とす候補として必ず問う。
   括弧に、flowchart と sequence での例を書く。
   - 描画にだけ使う値、描画が埋める値
     （`domId`、sequence の `actorCnt` と `rectData`）。
   - ほかの欄から一意に導ける値
     （`textStyles`、sequence のメッセージの `id` とノートの一覧）。
   - サイト設定でだけ変わる値
     （`securityLevel: loose` のときだけ付く `haveCallback`）。
     構文が決める欄で、サイト設定でも変わるものは含め、
     Db のパッチがほかの設定のときの値を記録する
     class のリンクの target は、
     `securityLevel: sandbox` のときに `_top` になる。
     `securityLevel` を変えて全件を流し、要約が変わらないことを確かめる。
   - 整形が変える空白が値に残る場所（style の値の末尾の空白）。
     その図種の整形の方針と照らす
     （`packages/prettier-plugin-mmd/docs/<図種>.md`）。
     落とす前に、mermaid.js がその空白を読まないことを確かめる
     （sequence の空白だけの題は、描画が題として場所を取るので落とさない）。
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
3. 表を決めてから書く。
   決める根拠は、
   AGENTS.md の正しさの基準（受理する入力の Db は mermaid.js と一致する）と、
   要約は構文が決める情報だけを持つこと（`docs/db-summaries.md`）、
   使う側への影響（仕様の Db normalization の節、parser の Db の導出）。
   分からない形（データブロックの記録など）は、
   リポジトリの外の作業用のディレクトリで試作して確かめてから決める。
4. `packages/tests/src/normalizers/<図種>.ts` に正規化関数を書き、
   `src/normalizers/index.ts` に、同じ Db を使う図種 ID をすべて登録する。
   Db のパッチが要るか
   （リンクを `utils.formatUrl()` で保存する、データブロックを持つ）を確かめ、
   要るなら同じファイルに書いて `dbPatches` に登録する。
   登録には、mermaid が受理し、その図種 ID として検出するテキストを添える
   （`classDiagram` だけでは拒否されるので、class の見本は class を 1 つ持つ）。
   `runMermaid()` は、どの入力を解析するよりも前に、
   すべての Db クラスにパッチを当てる。
   Db のメソッドが、Node にないブラウザの関数
   （`window`、`document`、`Option`）を呼ぶと、
   `MermaidEnvironmentError` になる。
   そのときは、パッチがその呼び出しの間だけ、その関数の代役を与える
   （`src/normalizers/browser-stand-ins.ts`）。
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
5. `src/index.ts` の `DiagramType` と、
   `tools/src/diagrams.ts` の `diagramIds` に図種を足す。
   `tests/fixtures.test.ts` の、図種ごとの読み込みのテストと、
   全件を読むテストの一覧にも足す。
6. `tests/` にテストを足す。
   確かめるのは、落とした欄が出ないこと、パッチが要約を変えないこと、
   データブロックの効果。
7. `pnpm --filter @mmd-toolkit/tests run fixtures:generate` を実行する。
   変わるのは、`common/` の fixture のうち、
   その図種を載せたもの（`db: null` が要約になる）だけのはず。
   それ以外が変われば、理由を調べる。
8. `docs/db-summaries.md` と `.ja.md` に、
   その図種の節（何を落とし、なぜか）を書く。
9. 結果として、要約の欄の一覧と、落とした欄とその理由を示す。
   仕様の Db normalization の節は、この一覧から書く（spec の SKILL）。

### 4.3 fixture

1. 入力を集める場所は 3 つ: その図種の spec ファイル、
   docs の mermaid のブロック、demos。
   範囲の外（ほかのディレクトリの spec、e2e）は集めない。
   範囲は `tools/README.md` に書く。
2. 収集の道具（`tools/collect.ts`、`tools/src/spec-recorder.ts`）は、
   図種を引数に取る。
   図種ごとに違うのは、読む spec ファイルと、テキストを受け取る関数だけ。
   `collect.ts` の `SPEC_FILES` に、その図種の spec ファイルのうち、
   図のテキストを mermaid に渡すものを足す。
   除くファイルには理由を書く。
   spec ファイルが import するモジュールと、テキストを受け取る関数
   （図種のパーサーの `parse`、`Diagram.fromText` など）のスタブは、
   `spec-recorder.ts` の一覧に足す。
   この一覧は全図種で共有する。
3. spec ファイルの記録器について、flowchart と sequence でつまずいたこと:
   - spec ファイルは、ループやテンプレートリテラルで入力を作るので、
     文字列リテラルを静的に読むと取りこぼす。
     ファイルをスタブに対して実行して、parse に渡された文字列を記録する。
   - import をスタブに向けるのに
     Node の module hooks（`registerHooks`、`register`）を使うと、
     lint が実験的な機能として止める。
     TypeScript で transpile すると行番号がずれる。
     テストファイルを一時ディレクトリに写し、
     import のパスの引用符の中だけを書き換えて、そのまま import する。
     テストの中の `import("...")` の呼び出しのパスも書き換える。
     型だけの import は、Node が消すので、そのままにする。
   - macOS の一時ディレクトリはシンボリックリンクなので、
     スタックトレースの実パスと合わせるために `realpathSync` を通す。
   - Node は URL ごとにモジュールを 1 回しか評価しないので、
     スタブのモジュールはテストファイルごとに別のディレクトリに置く。
   - テストの本体の例外を黙って捨てない。
     スタブが文字列にされたら例外にし、
     例外で終わったテストがあれば収集を止める（入力が跡を残さず欠けるため）。
   - 描画の配置を確かめるテストは、スタブで算術をする。
     スタブの算術は `NaN` にし、`NaN` を含むテキストを記録したら止める。
   - 実際の DOM で描画して図を確かめるテストは、スタブでは動かない
     （sequence の `actorBandModel.spec.ts`）。
     その入力が docs や demos にもあることを確かめて、理由を書いて除く。
   - 記録した各入力の行に、実際にテキストを渡す呼び出しがあることを確かめる。
4. docs と demos のブロックは、
   mermaid.js の検出器（`detectDiagramType`）でその図種のものだけを取る。
   demos のテキストは `mermaid.run()` が読むものにそろえる。
   `<pre>` の直後の改行を落とし、文字参照を解決し、
   mermaid が使う `ts-dedent` をかけ、trim する。
   ブラウザで実際のページと照らすと確かめられる
   （flowchart では demos を localhost で配って照合した）。
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
   4.2 のとおり代役を与える（`docs/expected-results.md`）。
8. `fixtures:generate` を 2 回実行し、
   上のハッシュの比較で 2 回目が何も変えないことを確かめる。
   `fixtures:check` を通す。
   収集をもう一度実行し、
   新規が 0 件であること（名前が安定していること）を確かめる。
9. 結果として、出どころごとの件数（受理・拒否）、標準外の拒否の内訳、
   印を付けた fixture、
   `fixtures:generate` と `fixtures:check` の所要時間を示す。

## 5. Langium の図

pie（最初の Langium の図）のときに書く。

## 6. ほかのパッケージのための fixture の道具と一覧

仕様の主張を支える fixture は、tests の生成器（`fixtures:add-many` など）で足す
（AGENTS.md の `packages/spec` の節。手順は spec の SKILL）。
この SKILL が行うのは次のこと。

1. 道具と形式を保つ。
   生成器、`add`、`add-many`、`set-divergence`、`set-note`、ローダー、
   収集の道具が、`docs/maintaining-fixtures.md` に書いたとおりに動くようにする。
   道具の使い方は、その文書にある。
   使い方を変えたら、その文書（英日）を同じ変更で直す。
2. 仕様の Known divergences
   （`packages/spec/docs/known-divergences.md`）が変わったら、
   識別子の一覧
   （`src/index.ts` の `KNOWN_DIVERGENCES`、README の一覧）を合わせる。
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
4. ほかのパッケージのテストが読み誤った形を、
   回帰の入力として fixture にするときは、
   期待（受理・拒否、Db の値）を足す前に mermaid.js で確かめる。
   合わなければ足さずに、そのことを示す。
   入力をほかのパッケージのファイルから取るときは、読むだけにし、
   文字列は構文木で取り出してバイト単位で一致させる。
   名前は既存の付け方に合わせる
   （`gram-`、`lex-`、`db-`、`config-` などの接頭辞と、示すものの名前）。
   note に何を示す入力かを書いて、
   `fixtures:add-many` で足す（`fixtures:add` には印の指定がない）。
5. 結果として、変えたもの、足した名前、件数、`fixtures:check` の結果を示す。

## 7. mermaid.js を更新するとき

1. `packages/tests/package.json` の devDependency `mermaid` を新しい版にし、
   `pnpm install` を実行する（`pnpm-lock.yaml` はルートの共有ファイル）。
   新しい版のタグで clone を作り直す。
2. 版に結び付いた箇所を直す。
   古い版と古いコミットを、`packages/tests` と `tools/` で検索して見つける。
   `fixtures/`、`lib/`、`node_modules/` は除く。
   - `tests/mermaid.test.ts` の版の検査、`tools/README.md` の clone のタグ、
     `README.md` が名指す版。
   - `docs/` と `tools/collect.ts` の、
     mermaid.js のソースへのパーマリンク。
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
   - Db のパッチ（flowchart では `setLink` と `addVertex`）:
     2 つのタグの間で Db クラスを比べる。
   - データブロックの記録の 2 つの検査と、
     `runMermaid()` の手順（`docs/expected-results.md`）: テストは確かめない。
     4 の全件の実行で確かめる。
     `runMermaid()` は、`mermaid.parse()` が受理し、
     `getDiagramFromText()` が拒否するテキストで、
     `MermaidEnvironmentError` を投げる。
     データブロックの記録は、ブロックが想定外のことをすると例外を投げる。
   - 既知の差を除いて動かすときの字句解析器の規則
     （`src/divergence-removals.ts`、選択肢 `withoutDivergences`）:
     `runMermaid()` はコンパイルされた形で規則を探す。
     試す順を変える規則は、その開始状態だけが試す規則の中から探す。
     規則が見つからないか 2 つ以上見つかるとき、
     または字句解析器が行のどこにいるかを呼び出しの中で決められないときに、
     `MermaidEnvironmentError` で止まるので、テストが失敗する。
     そのときは新しい字句解析器を読み、
     その差がまだあるかを spec の SKILL の手順で確かめて、表か識別子を合わせる。
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
     正規化関数を直すか、落とす欄にするかを、4.2 の表と同じ形で決める。
   - `detection`、図種が増えたか、なくなったもの:
     `diagramIds` と、仕様の `packages/spec/docs/detection.md` に関わる
     （detection.md は spec の SKILL の手順で直す）。
   - `error name`: 新しい名前も入力が原因であることを確かめる
     （生成器は、標準の拒否のほかの名前を一覧に出す）。
   - `error message only`: 何もしない。
     実装は message を比べないため。
   - `MermaidEnvironmentError` で作れない fixture:
     `mermaid.parse()` と `getDiagramFromText()` が食い違うか、
     Node にない機能を mermaid.js が使っている。
     `runMermaid()` の手順が成り立たない。
     そのような入力をどう記録するかは、
     `docs/expected-results.md` の定義と、実装が比べる相手を変える。
     そのため、選択肢と fixture と推奨を示して決定を求め、決まってから進む。
   - `knownDivergence` の印が付いた行:
     印がまだ当てはまるかは、spec の SKILL の手順で確かめる。

   その後、`fixtures:generate` でファイルを書く。

5. 新しい版のタグで収集をやり直す。
   名前は入力で決まるので、既存の名前は変わらず、新しい入力だけが足される。
   mermaid.js から消えた入力は fixture に残る。
   テストファイルがスタブのないモジュールを import して収集器が止まったら、
   `tools/src/spec-recorder.ts` にスタブを足して、収集し直す
   （`tools/README.md`）。
6. CI の fixtures ジョブが通る状態にする
   （`fixtures:generate` の後で差分があれば失敗する）。
   `MermaidEnvironmentError` が残っている間は通らない。
7. 結果として、分類した差分の一覧（fixture の名前と、何が変わったか）を、
   関わるパッケージごとにまとめて示す。

この節の手順は、まだ実際の更新で通していない。
最初の本物の更新のときに、
spec、parser、prettier-plugin の SKILL の更新の手順と合わせて、
手順に沿って進めながら確かめ、誤りや足りないところはその場で直す。
