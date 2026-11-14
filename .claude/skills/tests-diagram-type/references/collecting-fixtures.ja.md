# fixture を集める（tests-diagram-type）

以下の節の番号は、[SKILL.ja.md](../SKILL.ja.md) の節の番号である。

1. 入力は、
   その図種の構文に図のテキストを渡す mermaid のテスト（Langium の図種では、
   mermaid の parser パッケージのその図種のテストも含む）と、
   docs の mermaid のブロック、demos から集める。
   集めるテストファイルの一覧と除外の理由は `tools/collect.ts` の `SPEC_FILES`
   だけが持ち、範囲は `tools/README.md` にある。
2. 図種の間で収集の道具（`tools/collect.ts`、
   `tools/src/spec-recorder.ts`）が違うのは、読む spec ファイルと、
   テキストを受け取る関数だけ。
   `collect.ts` の `SPEC_FILES` に、その図種の spec ファイルのうち、
   図のテキストを mermaid に渡すものを足す。
   除くファイルには理由を書く。
   spec ファイルが import するモジュールと、
   テキストを受け取る関数（図種のパーサーの `parse`、
   `Diagram.fromText` など）のスタブは、`spec-recorder.ts` の一覧に足す。
   この一覧は全図種で共有する。
3. spec ファイルの記録器（`tools/src/spec-recorder.ts`）は、
   各 spec ファイルをスタブに対して実行する。
   記録器が前提にしていることと、
   変えるとき・図種を足すときに守ることは次のとおり:
   - spec ファイルは、ループやテンプレートリテラルで入力を作るので、
     文字列リテラルを静的に読むと取りこぼす。
     ファイルをスタブに対して実行して、parse に渡された文字列を記録する。
   - Node の module hooks（`registerHooks`、`register`）は、
     lint が実験的な機能として止める。
     TypeScript で transpile すると行番号がずれる。
     そのため記録器は、テストファイルを一時ディレクトリに写し、
     import のパスの引用符の中だけを書き換えて、そのまま import する。
     テストの中の `import("...")` の呼び出しのパスも書き換える。
     型だけの import は、Node が消すので、そのままにする。
   - macOS の一時ディレクトリはシンボリックリンクなので、
     スタックトレースの実パスと合わせるために `realpathSync` を通す。
   - Node は URL ごとにモジュールを 1 回しか評価しないので、
     スタブのモジュールはテストファイルごとに別のディレクトリに置く。
   - 例外で入力を隠さない。
     スタブが文字列にされたら例外にし、本体の例外があれば収集を止める。
     収集を続けられるのは、ファイル・テスト名・エラーの本文が、
     `collect.ts` の `ERRORS_AFTER_THEIR_INPUT` に載っていて、
     最後の parse 呼出しの後でだけ失敗し、全入力を記録したと証明できる場合だけ。
   - 描画の配置を確かめるテストは、スタブで算術をする。
     スタブの算術は `NaN` になり、`NaN` を含むテキストを記録したら止まる。
   - 実際の DOM で描画して図を確かめるテストは、
     スタブでは動かない（sequence の `actorBandModel.spec.ts`）。
     その入力が docs や demos にもあることを確かめて、理由を書いて除く。
   - 記録した各入力の行に、実際にテキストを渡す呼び出しがあることを確かめる。
4. docs と demos のブロックは、
   mermaid.js の検出器（`detectDiagramType`）でその図種のものだけを取る。
   demos のテキストは `mermaid.run()` が読むものにそろえる。
   `<pre>` の直後の改行を落とし、文字参照を解決し、
   mermaid が使う `ts-dedent` をかけ、trim する。
   ブラウザで実際のページと照らすと、確かめられる。
   この照合だけは、収集と違い、clone に依存を入れる必要がある。
   clone の開発サーバー（`pnpm run dev`）を起動する。
   これは demos のページが import する `mermaid.esm.mjs` を作り、demos を配る。
   demos のページを開いて照らす。
5. 収集した入力には `config` を付けない。
   名前は `<出どころ>-<ファイル>-<入力の SHA-256 の先頭 8 桁の 16 進数>`
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
   2 節のとおり代役を与える（`docs/expected-results.md`）。
   正しい埋め込み設定が受理を両方向に変える場合も probe し、
   仕様の印と必須の読みを SKILL
   [tests](../../tests/SKILL.ja.md#51-保持する形式と埋め込みデータの指定読み) の
   5.1 で適用する。
   拒否の一覧だけを、差異の全件の一覧としない。
8. `fixtures:generate` を 2 回実行し、
   SKILL [tests](../../tests/SKILL.ja.md#4-確かめ方すべての作業で) の 4
   の節のハッシュの比較で 2 回目が何も変えないことを確かめる。
   `fixtures:check` を通す。
   収集をもう一度実行し、
   新規が 0 件であること（名前が安定していること）を確かめる。
