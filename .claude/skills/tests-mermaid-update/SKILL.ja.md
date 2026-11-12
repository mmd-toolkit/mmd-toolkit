---
name: tests-mermaid-update
description: >-
  Update the mermaid.js that @mmd-toolkit/tests pins: the version and what is
  tied to it, the patches and premises, the regenerated fixtures and the
  classification of their differences, and a new collection. Use when the pinned
  mermaid.js is to be updated, together with the tests skill.
---

# mermaid.js を更新するとき（tests-mermaid-update）

SKILL [tests](../tests/SKILL.ja.md) の 1〜4 の節（方針と基準、最初に読むもの、
作業ツリーの扱い、確かめ方）は、この手順にも当たる。
先に読む。

1. `packages/tests/package.json` の devDependency `mermaid` を新しい版にし、
   `pnpm install` を実行する（`pnpm-lock.yaml` はルートの共有ファイル）。
   新しい版のタグで clone を作り直す。
   この SKILL の手順は、
   すべて `MMD_TOOLKIT_MERMAID_CACHE=disabled` を付けて動かす。
   比べるのが mermaid.js そのものになるようにするため。
   新しい版は、どのみち貯蔵庫に新しい鍵を与える。
2. 版に結び付いた箇所を直す。
   古い版と古いコミットを、`packages/tests` と `tools/` で検索して見つける。
   `fixtures/`、`lib/`、`node_modules/` は除く。
   - `tests/mermaid.test.ts` の版の検査、`tools/README.md` の clone のタグ、
     `README.md` が名指す版。
   - 図種の登録簿を持つバンドルのチャンクの名前。
     `src/mermaid.ts`（`readMermaidConfiguration()`）にある。
     バンドラーはチャンクをハッシュで名付けるので、版ごとに変わる。
     入れた `mermaid` の `dist/chunks/mermaid.core/` で、
     `getDiagramLoader` を export しているファイルがそれに当たる。
     古い名前のままだと、
     設定を読むすべての fixture が `Cannot find module` で失敗する。
   - `docs/` と `tools/collect.ts` の、mermaid.js のソースへのパーマリンク。
     コミットを替え、行番号を新しい版の同じコードへ移す。
     2 つのタグの間のファイルの行の差分で各範囲を写す script を使うと、
     行が変わらなかった範囲は見つかる。
     そうでないものは読む。
     同じ行の並びが新しいファイルに 1 か所だけあれば、その位置にする。
     コードが変わっていれば、関数を探して範囲を選び直し、
     文の主張が新しいコードで成り立つかを読む。
     成り立たなければ、その文は mermaid.js の変化を述べているので、
     4 の分類で変化を分類して、文を書き直す。
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
   - データブロックの記録の検査と、
     `runMermaid()` の手順（`docs/expected-results.md`）: テストは確かめない。
     4 の全件の実行で確かめる。
     `runMermaid()` は、`mermaid.parse()` が受理し、
     `getDiagramFromText()` が拒否するテキストで、
     `MermaidEnvironmentError` を投げる。
     データブロックの記録は、ブロックが想定外のことをすると例外を投げる。
   - 既知の差異を除いて動かすときの字句解析器の規則: `runMermaid()`
     はコンパイルされた形で規則を探す。
     規則を置く場所は `src/divergence-removals.ts` で、
     選択肢は `withoutDivergences` である。
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
     このパッケージにも関わる。
     新しい Db がテキストを違うふうに読む場合（繰り返された定義の併合、
     残るコメント行など）は、
     `src/db-from-tree/<図種>.ts` と `src/check-tree/` の検査、
     その文書 `docs/db-from-tree/<図種>.md` と
     `docs/check-tree.md`（日本語の対を含む）を直し、
     パッケージのテスト全体を実行する。
     新しい版にない図種は、それを載せた `common/` の fixture で、
     `UnknownDiagramError` への `acceptance` として出る。
     これは下の検出の項に入れる。
   - `summary fields`: Db の内部の変化。
     ただし、キーが著者の書いたものなら、そうではない。
     正規化関数を直すか、落とす欄にするかを、
     SKILL [tests-diagram-type](../tests-diagram-type/SKILL.ja.md) の 2
     節の表と同じ形で決める。
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
     そのような入力をどう記録するかは、`docs/expected-results.md` の定義と、
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
