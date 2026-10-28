# Treeview: 木から Db を構築する

英語版: [treeview.md](./treeview.md)

`treeviewDbOf` は受理済みの [入れ子の木](../../../spec/docs/ast/treeview.ja.md)を読み、
[公開する要約](../db-summaries.ja.md#treeview)に従い、
受理を判定しない。 [fixture: treeview/gram-written-tree]
[fixture: treeview/box-written-tree]

## 木から要約を構築する

1. 範囲を共有の変換形で読む。
   共通の除去、物理改行の変換、ソース全体の HTML 属性の引用符、
   文字参照の仮の形を使う。
   原文の位置で [罫線の直接規則](../../../spec/docs/diagrams/treeview.ja.md#罫線の読み)を適用する。
   値の中の装飾は内容と後続の LF を表さない。
   値の中の branch prefix は字下げを表し、その行の内容のタブを空白 4 つにし、
   行末の共通の空白を除く。
   引用名とブロックの境目はこれらの行を保護しない。
   葉の外の prefix と装飾の node は公開する項目を作らない。
   書き換えたソース、人工のソース token、native
   YAML の node は作らない。 [fixture: treeview/directive-bare-middle]
   [fixture: treeview/comment-line-in-quotes] [fixture: treeview/entity-double]
   [fixture: treeview/html-bare] [fixture: treeview/text-double-crlf]
   [fixture: treeview/box-quoted-decoration]
   [fixture: treeview/box-block-decoration]
   [fixture: treeview/box-multiline-quoted]
   [fixture: treeview/box-only-branch-content-tab]
   [fixture: treeview/box-multiline-name-tail-trim]
   [fixture: treeview/box-physical-directive-inline]
   [fixture: treeview/box-physical-directive-line]
   [fixture: treeview/box-physical-selected-semicolon]
   [fixture: treeview/box-physical-comment-line]
   [fixture: treeview/box-physical-empty-line]
   [fixture: treeview/box-physical-ls] [fixture: treeview/box-physical-ps]
   [fixture: treeview/box-physical-empty-description]
2. accessibility の値に共有の `commonValue` を使い、null は空にする。
   行の値は前後を trim し、連続する ASCII の空白とタブを畳む。
   ブロックでは各行も trim し、連続する物理改行を畳む。
   最後の代入を採り、空の代入も前の値を消す。
   最後の説明に共有の `descriptionOf` を適用し、
   公開する両方の値に `textReplacementOf(embedded.config)` を適用する。
   既定値は空文字列。
   埋め込みの title を含め、
   図の title は公開しない。 [fixture: treeview/common-whitespace]
   [fixture: treeview/common-repeat]
   [fixture: treeview/common-repeat-empty]
   [fixture: treeview/common-block-whitespace-raw]
   [fixture: treeview/db-all-fields] [fixture: treeview/frontmatter-title]
   [fixture: treeview/config-security-level-other]
3. Diagram.body の根を読み、各 TreeviewNode.children を原順で再帰的に写す。
   file も directory も子を持てる。
   indent を読んだり親を再計算したりしない。
   parser が入れ子を作り、checkTree が独立に確かめる。
   重複名、空名、すべての根、空の children リストを保つ。
   node の textBefore とほかの所有する装飾は Db の node を作らない。 [fixture: treeview/db-indent-pop]
   [fixture: treeview/db-file-parent]
   [fixture: treeview/db-first-indented] [fixture: treeview/db-duplicate-names]
   [fixture: treeview/db-empty-names] [fixture: treeview/db-tabs-one-unit]
   [fixture: treeview/db-quoted-tail-tab] [fixture: treeview/box-round-below]
   [fixture: treeview/box-decoration-trailing-body]
4. 引用名は変換した内容から両端の区切りを 1 字ずつ除く。
   escape を復号しない。
   bare 名は末尾の ASCII の空白とタブだけを除く。
   結果の末尾が `/` なら 1 字だけ除き、nodeType を directory にする。
   それ以外は file にする。
   引用名の空白、内部の空白、残る slash を保つ。
   名前を sanitize しない。 [fixture: treeview/db-quote-conversion]
   [fixture: treeview/db-bare-tail-space]
   [fixture: treeview/db-bare-internal-space]
   [fixture: treeview/db-directory-trailing-space]
   [fixture: treeview/box-dir-name-trim]
5. 注釈をソース順に適用し、各種類の最後の代入を採る。
   class の Identifier の変換形を cssClass にする。
   空でない icon の Identifier は icon にし、空の呼び出しは none にする。
   icon の指定がなければ省く。
   説明の変換形を trim し、
   `textReplacementOf(embedded.config)` で sanitize する。
   最後の説明が空なら省く。
   class 名と icon 名は sanitize しない。
   書かれた各注釈は木に独立に保つ。 [fixture: treeview/db-repeat-class]
   [fixture: treeview/db-repeat-icon]
   [fixture: treeview/db-repeat-icon-empty-first]
   [fixture: treeview/db-icon-none] [fixture: treeview/db-description-empty]
   [fixture: treeview/annotation-description-repeat-empty]
   [fixture: treeview/config-security-level-other]
   [fixture: treeview/config-security-level-other-html-false]
6. accTitle・accDescr・nodes だけを公開する。
   title、人工の root、生成 id、字下げ、counter、解決した icon の SVG、座標、
   色、描画設定を除く。
   treeView の設定の鍵は受理条件にも公開する値にもならない。 [fixture: treeview/db-all-fields]
   [fixture: treeview/config-drawing-site]
   [fixture: treeview/config-frontmatter-drawing]
   [fixture: treeview/config-init-drawing]

## 記録との比較

`specified.json` があればそれを、なければ `expected.json` を使う。
共有の設定と title は `embeddedValuesOf` から得る。
サイトの security の fixture は記録したサイト設定で、
frontmatter の HTML による値の fixture は指定の読みで比較する。
treeview のすべての木と、
treeview と検出する common のすべての fixture を調べる。
仕様の読みが受理する入力には ast.json が必要。
記録の不足と不一致を入力とともに報告する。
エラー記録を Db の比較から除くのは、
印が付いた読みを `fixtureAccepts` が拒否する場合だけ。
比較用の Db がない opaque の例は [共有の比較規則](../../../spec/docs/known-divergences/embedded-data-opaque.ja.md#比較する-db)で明示する。
treeview 専用の指定の読みは作らない。 [fixture: treeview/config-security-level-other]
[fixture: treeview/div-html-frontmatter-value]
[fixture: treeview/config-fontfamily-keeps-title]
[fixture: treeview/div-invalid-keeps-config]
[fixture: common/detect-minimal-tree-view]
