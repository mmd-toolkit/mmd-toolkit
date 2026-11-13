# 書く前と書いた後に確かめること（eslint-plugin）

以下の節の番号は、[SKILL.ja.md](../SKILL.ja.md) の節の番号である。

mermaid.js を動かし、テキストを parse し、整形するスクリプトは、
rule-ideas の SKILL の
[references/probe-scripts.ja.md](../../rule-ideas/references/probe-scripts.ja.md)
にある。

1. mermaid.js の読み方: 各例を `packages/tests/src/mermaid.ts` の
   `runMermaid(text)` に掛ける。
   どの例も受理されなければならない（拒否される入力は構文エラーで、
   規則は報告しない）。
   Db の値は、文書に書いたとおりでなければならない。
2. 木での条件: 規則の条件を、ノードの型、欄、トークンの種類と値、範囲で書き、
   `packages/parser/src/index.ts` の `parse(text)` の結果（`traverseNodes`、
   `root.tokens`、`root.comments`、`root.directives`）に当てるコードにして、
   反する例すべてに当たり、従う例のどれにも当たらないことを確かめる。
   境界の入力も足す。
   空白の有無、`\n` と `\r\n`、同じ行と次の行、ディレクティブ、コメント行、
   文字列の中、subgraph の中、`;` で区切った 1 行の複数の文である。
3. 整形: 反する例をすべて、整形のスクリプトで整形し、
   出力に mermaid.js の読み方が現れないことを確かめる。
   フォーマッターがすでに見えるようにするものの規則は、
   持たないからである（rule-ideas の SKILL
   の[基準](../../rule-ideas/SKILL.ja.md#方針と基準)）。
   プラグインが import する `@mmd-toolkit/parser` は、ソースではなく、
   ビルドした `packages/parser/lib` に解決される。
   parser のソースが変わっていたら、
   先に `pnpm --filter @mmd-toolkit/parser run build` で lib を作り直す。
   作り直さないと、例が古い parser で整形される。
   反する例それぞれの整形の結果は、作業の結果（9 節）に含める。
4. 例と fixture: 各例の図の部分は、
   示したいテキストを入力に持つ `packages/tests/fixtures` の fixture の
   `input.mmd` を、整形のスクリプト（prettier-plugin-mmd、
   既定のオプション）で整形した出力から、
   末尾に行終端子があればそれを除いたものにする。
   閉じていないディレクティブの中でテキストが終わるときは、
   出力は行終端子で終わらない。
   その fixture は、
   例を mermaid.js がどう読むかを記録している（SKILL `conventions`: Mermaid
   の例はフォーマッターが印字する形で書く）。
   フォーマッターが行を書いたまま残すところも、出力のとおりにする。
   文書の例については、`update` がそれを行う（6 節）。
   例を fixture の入力のとおりに書いて `update` を実行し、印字された形を読む。
   例の先頭の ESLint 設定コメントだけを除いて、出力と比べる。
   公開する例を parser やサイトの表示処理で確かめるときは、コメントも残す。
   スナップショットのテストヘルパーは、このコメントだけを除く。
   テスターが同じ規則を `rule-to-test/` の下で有効にするため、
   `@mmd-toolkit/` の下でも有効にすると、すべての報告が二重になるからである。
   コメントは公開する例の一部で、コーパスの fixture の一部ではない。
   足すために fixture を変更しない。
   例外は、フォーマッターが 1 つの形に印字する書き方（空白、
   値やキーワードの大文字小文字、引用符、数の書き方）そのものが要点で、
   わざと書いたまま残す例だけである。
   そのコードブロックの直前に、英日とも `<!-- prettier-ignore -->` を置き、
   3 節が求める文を規則の詳細に書く。
   理由は、例えば、
   フォーマッターが空の `accDescr` のブロックを `accDescr {}` と書くので、
   波括弧の間に空白がある例を残す、というものである。
   書き方ではなく説明のブロックを示す例は、テキストが 2 行以上のブロックで書く。
   フォーマッターは、その形をブロックのまま残すので、印は要らない。
   `check:docs` は、その文も、印がまだ要るかも読まない。
   確かめるのはレビューである。
   使う fixture の `expected.json` が文書の主張どおりであることを確かめる。
   例にする fixture は、従う例も含めて、`accepted` が true のものだけにする。
   fixture のない例と主張には、SKILL `tests` の手順で fixture を足す。
   それを示す最小の入力と、その fixture が答える規則の文書の主張を添え、
   `pnpm run fixtures:add` で足して、
   mermaid.js
   の結果を記録する（`packages/tests/docs/maintaining-fixtures.md`）。
   そのうえで、parser に木を記録する（SKILL `parser`）。
   その `expected.json` を読み、規則のテストに入れる。
