# mermaid.js を更新するとき（parser）

以下の節の番号は、[SKILL.ja.md](../SKILL.ja.md) の節の番号である。

入力: 新しい版で生成し直した fixture と、
分類した差分（tests-mermaid-update の SKILL）、
それに合わせて直した仕様（spec の SKILL）。
パーサーは、仕様が変わる前に挙動を変えない。

1. 仕様の変わった節を読み、変わった規則ごとに、4.2 節の手順 2 で確かめる。
2. 版に結び付いた箇所を直す。
   `packages/parser` で古い版の番号を `grep -rn` すると、
   README と `docs/development.md` に見つかり、それぞれ `.ja.md` もある。
   mermaid.js のソースへのリンクは、固定した commit の permalink である。
   仕様の更新が出す、古いリンクと新しいリンクの表に従って、
   それぞれを新しい commit のリンクに置き換え、
   `node scripts/check-mermaid-links.mjs` で確かめる。
3. 図種 ID が増えた、
   または変わった: 仕様の `detection.md` と `ast.md` の DiagramType に従って、
   `src/detection.ts`、`packages/ast/src/ast.ts` の `DiagramType`、
   `tests/types.test.ts` の `allDiagramTypes`、
   `tests/detection.test.ts` を直す。
   増えた ID は、
   まず `tests/fixtures.test.ts` の `DIAGRAM_TYPES_WITHOUT_BODY` に入れる。
   次に本体を書き（4 節）、本体を足す変更で、上の箇所を直し、ID を一覧から消す。
4. 仕様の一覧を写した表が、仕様と一致するかを確かめる。
   flowchart と class では、
   両者が共有する `src/unicode-letters.ts` の文字の範囲である。
5. 4.7 節の手順 4 で木の違いを分類し、4.8 節で確かめる。
6. 結果として、直したもの、木の違いの種類ごとの数、
   書き直した木のそれぞれの答え（4.7 節の手順 3）、残る不一致を示す。

更新のときに合わない手順があれば、それを直す。
