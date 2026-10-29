# 木から gitgraph の Db を組み立てる

英語版: [gitgraph.md](./gitgraph.md)

`src/db-from-tree/gitgraph.ts` は、
[ast/gitgraph.md](../../../spec/docs/ast/gitgraph.md) から、
[概要](../db-summaries.md#gitgraph) を組み立てる。
木は
[意味の受理条件](../../../spec/docs/diagrams/gitgraph.md#semantic-acceptance-conditions)
を満たしている。
builder は parser の受理検査を繰り返さない。

## 木から概要を組み立てる

1. **変換した値。**
   共通の converted-text reader でソースの除去、 CR・CRLF、
   本文の HTML 属性の引用符、entity marker を読む。
   GitgraphIgnoredText はすべて無視する。
   裸の参照は変換したテキストを読む。
   STRING の内部では b/f/n/r/t/v/0 の escape を対応する制御文字へ復号する。
   ほかの escape は backslash だけを除き、16 進・Unicode の復号はしない。
   文字列は trim しない。 [fixture: gitgraph/lex-string-escapes] [fixture:
   gitgraph/lex-cherry-pick-string-escape] [fixture:
   gitgraph/gram-commit-space-values] [fixture: gitgraph/entity-all-fields]
   [fixture: gitgraph/lex-html-attribute-quotes] [fixture:
   gitgraph/lex-yaml-invalid-body]
2. **設定と共通値。**
   初期 branch の名前と順序は設定値を直接使う。
   書かれた branch 名、id、parent・source の参照、通常の tag、
   cherry-pick の tag は `textReplacementOf(embedded.config.gitGraph)` に通す。
   merge の tag は通さない。
   共通値は root の設定を使う。
   行の値は共通の空白を両端から除き、ASCII space・tab 2 つ以上の連続を縮める。
   ブロックはさらに各行の端を除き、連続する LF を縮める。
   空でも最後の代入が勝ち、その変換値が非空のときだけ公開する。
   最後の title が空なら共有の変換済み frontmatter title を保つ。
   最後の accessibility 値が空ならクリア済みの初期値を保つ。
   description はさらに `descriptionOf` に通す。
   [fixture: gitgraph/config-main-branch] [fixture:
   gitgraph/config-main-empty-name] [fixture: gitgraph/config-main-html]
   [fixture: gitgraph/html-all-texts] [fixture:
   gitgraph/config-gitgraph-html-false] [fixture:
   gitgraph/config-gitgraph-loose] [fixture:
   gitgraph/config-merge-tag-escape-difference] [fixture:
   gitgraph/html-cherry-pick-tags] [fixture: gitgraph/title-conversion]
   [fixture: gitgraph/accdescr-block] [fixture: gitgraph/common-third-values]
   [fixture: gitgraph/title-repeat-empty] [fixture:
   gitgraph/acctitle-repeat-empty] [fixture: gitgraph/accdescr-repeat-empty]
3. **生成 id と sequence。**
   commit・merge の最終的な非空の authored target id を先に予約する。
   後の文と上書きされる commit の id も含む。
   ソース順に、該当 id がない commit・merge とすべての cherry-pick に、
   1 から始まる次の `generated-commit-N` を割り当てる。
   予約済み・割当済みの名前は飛ばす。
   cherry-pick の id option は source であり、target id ではない。
   sequence は 0 から始まり、置換も含めて作成ごとに増える。
   [fixture: gitgraph/db-generated-ids] [fixture:
   gitgraph/db-generated-name-collision] [fixture:
   gitgraph/db-random-shaped-custom-id] [fixture:
   gitgraph/gram-commit-repeated-options] [fixture:
   gitgraph/gram-merge-empty-id] [fixture: gitgraph/db-three-definitions]
4. **公開。**
   文をソース順に読み、 branch の先端と選択中の branch は中間状態だけに保つ。
   branch 作成は現在の先端をコピーして新 branch を選ぶ。
   checkout・switch は既存の先端を選ぶ。
   通常の commit は現在の先端を親に持ち、空の branch なら親を持たない。
   type は NORMAL=0、REVERSE=1、HIGHLIGHT=2 である。
   scalar option は最後の代入、tag は追記で、空文字列も保つ。
   Map の置換は最初の id の位置を保ち、sequence・親も含む描画の値を置き換える。
   親が新しい id と同じでもよい。
   message は概要に寄与しない。 [fixture: gitgraph/gram-switch] [fixture:
   gitgraph/gram-commit-empty-values] [fixture:
   gitgraph/gram-commit-repeated-options] [fixture: gitgraph/db-duplicate-id]
   [fixture: gitgraph/db-three-definitions] [fixture:
   gitgraph/db-duplicate-earlier-id-current-head] [fixture:
   gitgraph/db-prototype-ids]
5. **merge と cherry-pick。**
   merge は type 3 を作り、現在・source の順に親を持つ。
   数値の customType は任意で、customId は非空の authored id の有無を示す。
   cherry-pick は常に type 4 を作り、現在・source の順に親を持つ。
   tag が書かれていれば空を除き、すべて空でも既定 tag を使わない。
   書かれていなければ `cherry-pick:<source>` を使う。
   source が merge の場合だけ `|parent:<parent>` を足し、
   tag の sanitizer に通す。 [fixture: gitgraph/gram-merge-options] [fixture:
   gitgraph/gram-merge-empty-id] [fixture: gitgraph/gram-cherry-pick]
   [fixture: gitgraph/gram-cherry-pick-tags] [fixture:
   gitgraph/db-cherry-pick-only-empty-tags] [fixture:
   gitgraph/gram-cherry-pick-merge-parent] [fixture:
   gitgraph/gram-cherry-pick-repeated-options]
6. **結果の順序。**
   commit は最初の id の挿入順で、最後の sequence・親を返す。
   branch は数値の順序で並べ、同値は作成順を保つ。
   書かれない order は 0 である。
   書かれた数字は共有の double として読み、精度の損失・overflow も含む。
   branch は名前だけを返す。
   direction は書かれた LR・TB・BT、なければ LR である。
   [fixture: gitgraph/db-three-definitions] [fixture:
   gitgraph/gram-branch-order] [fixture: gitgraph/gram-branch-order-tie]
   [fixture: gitgraph/config-main-order-negative] [fixture:
   gitgraph/number-precision] [fixture: gitgraph/number-overflow] [fixture:
   gitgraph/header-only] [fixture: gitgraph/header-tb] [fixture:
   gitgraph/header-bt]

## 記録した結果との比較

`specified.json` があればそれを使い、なければ `expected.json` と比較する。
設定と共有の frontmatter title は `embeddedValuesOf` から受け取る。
atomic な切断は既存の印で拒否する。
共有の HTML・C4・bare-percent の読みが、
保持した YAML・二度目の directive の前置きも扱う。
参照の読みでは、そのテキストと共通の埋め込みの効果を保つ必要がある。
Mermaid が拒否した opaque な先頭 YAML には比較用 Db がない。
図種ごとの指定の読みは足さない。 [fixture: gitgraph/div-directive-in-number]
[fixture: gitgraph/div-style-semicolon-in-order-number] [fixture:
gitgraph/div-frontmatter-cross-title-value] [fixture:
gitgraph/div-detect-c4container-id] [fixture:
gitgraph/div-detect-retained-yaml-bare-ls-line] [fixture:
gitgraph/div-detect-retained-directive-bare-bom] [fixture:
gitgraph/div-lex-preheader-bare-between-retained-unicode] [fixture:
gitgraph/div-frontmatter-invalid-yaml] [fixture:
gitgraph/div-frontmatter-html-invalid-yaml]
