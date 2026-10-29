# 木から Wardley の Db を組み立てる

英語版: [wardley.md](./wardley.md)

`wardleyDbOf()` は書かれた
[Wardley の木](../../../spec/docs/ast/wardley.md)を読み、
[Wardley の要約](../db-summaries.md#wardley)を組み立てる。
木は受理済みであり、
[意味上の受理条件](../../../spec/docs/diagrams/wardley.md#semantic-acceptance-conditions)
を再検査しない。
残された hidden form は何も公開しない。 [fixture: wardley/header-only]
[fixture: wardley/db-all-fields] [fixture: wardley/hidden-all-unit-gaps]

## 変換した値と共通の代入

葉の範囲を共有の converted-text helper で読む。
共通の trivia を除き、物理改行を LF にし、
HTML 属性の引用符と entity を変換する。
引用した名前と通常の文字列は区切りを除き、仕様の escape を復号する。
裸の名前は内側の空白と大文字小文字を保つ。
どちらも共通の sanitize と最後の entity の復号を行わない。
flow label は backslash を保つ。 [fixture: wardley/lex-string-conversion]
[fixture: wardley/line-string-values] [fixture: wardley/entity-texts]
[fixture: wardley/gram-reference-html-before-escape]
[fixture: wardley/space-name-values]
[fixture: wardley/lex-link-flow-raw-escapes]

title・accessibility title・accessibility description は、
null や空白だけの値も含め、最後の代入を採る。
共有の共通行・block の変換の後に共有の文字の置き換えを行い、
description には共有の description の読みも適用する。
最後の空の本文値は前の本文値を消す。
最後の空の title は埋め込まれた frontmatter の title に戻る。
設定による置き換えはこの三つの公開値だけに適用する。
印が求める場合は fixture の specified の埋め込み値を使い、
frontmatter 内の HTML による値の違いもその読みを使う。
[fixture: wardley/common-repeat] [fixture: wardley/common-repeat-empty]
[fixture: wardley/frontmatter-empty-body-title]
[fixture: wardley/config-security-level-other]
[fixture: wardley/div-html-frontmatter-value]
[fixture: wardley/line-block-values]

数は double に直してから 1 と比較する。
1 以下なら 100 倍し、それより大きい値は百分率として保つ。
座標対は可視性・進化の順で書かれ、進化を x、可視性を y に公開する。
label offset は別に書かれた符号を符号なしの大きさに適用する。
公開する数はすべて `numberOrText()` を通す。
非有限の size・annotation number・boundary・offset と負のゼロも同じである。
[fixture: wardley/db-coordinate-boundary]
[fixture: wardley/db-coordinate-double-one]
[fixture: wardley/db-coordinate-double-hundred]
[fixture: wardley/number-offset-negative-zero]
[fixture: wardley/db-number-overflow] [fixture: wardley/db-number-int-precision]

## 節点と pipeline

全 anchor、全 top-level component、各 pipeline の子の順に登録する。
各組の内側は source order である。
節点の比較名を id と label にする。
anchor の className は anchor で inertia は無い。
component の className は component で、inertia の装飾がなければ false にする。
strategy と符号付き offset は装飾から読む。
同じ鍵の置き換えは最初の登録位置を保つ。
省いた offset だけは前の値を引き継ぎ、省いた strategy と inertia は消す。
prototype のような名前も通常の Map の鍵として扱う。
[fixture: wardley/db-publication-order] [fixture: wardley/db-node-duplicates]
[fixture: wardley/db-inertia-forms] [fixture: wardley/db-prototype-names]
[fixture: wardley/db-zero-first] [fixture: wardley/db-zero-last]

pipeline はその登録状態から親の比較 id を完全一致で探す。
子の id は親・underscore・子の名を結び、label は子の名、
className は pipeline-component、y はその時点の親の公開済み可視性とする。
inertia と strategy は無い。
offset の引き継ぎと id の衝突には同じ規則を適用する。
membership は重複を含め子の id を順に公開する。
pipeline の置き換えは最初の位置を保ち、membership を置き換えるが、
前の子の節点は登録したままにする。 [fixture: wardley/db-pipeline-forward-parent]
[fixture: wardley/db-pipeline-anchor-parent]
[fixture: wardley/db-pipeline-nested-parent]
[fixture: wardley/db-pipeline-collision]
[fixture: wardley/db-pipeline-duplicates]
[fixture: wardley/db-pipeline-label-inheritance]
[fixture: wardley/db-empty-pipeline-names]

## link と残りの公開

link の両端は全節点の登録後に解決する。
id の完全一致、登録順で最初の現在の label の一致、未解決の比較名の順に採る。
link は重複と自己 link も含め source order に保つ。
source port、target port、arrow の flow の順に優先する。
plus で始まる arrow は変換した値全体で `<>`、`<`、`>` の順に探すため、
flow label の中の marker も結果に効く。
同じ全体値に `-.->` または `.-.` があれば dashed は true になる。
空の値も含め flow label は trim した semicolon label より優先する。
これらの読みで書かれた arrow の欄を置き換えない。
[fixture: wardley/db-link-resolution] [fixture: wardley/db-link-exact-id]
[fixture: wardley/db-link-unresolved-duplicates]
[fixture: wardley/db-link-forms] [fixture: wardley/lex-flow-port-wins]
[fixture: wardley/lex-flow-label-changes-direction]
[fixture: wardley/lex-flow-label-changes-bidirectional]
[fixture: wardley/lex-flow-label-changes-dashed]
[fixture: wardley/lex-flow-label-changes-dashed-short]

trend は id が完全一致する節点だけに公開し、
同じ id の最後の target を最初の trend の位置に保つ。
note・annotation・accelerator・deaccelerator は、空の text と重複も含め、
それぞれの source order に保つ。
annotations box は最初の一つだけを変換し、後の出現は公開しない。
[fixture: wardley/db-trend-missing] [fixture: wardley/db-trend-duplicates]
[fixture: wardley/db-array-duplicates] [fixture: wardley/db-empty-texts]
[fixture: wardley/db-later-invalid-box]
[fixture: wardley/db-coordinate-boundary]

最後の evolution 文から axes を作る。
各 stage 名を trim し、変換した second name が truthy なら、
trim した二つの名を空白・slash・空白で結ぶ。
書かれた boundary だけを stage order に保つ。
最後の size から width と height を採る。
該当する文がなければ axes は空、size は省略する。
描画の既定値と除外した派生 flag は含めない。
[fixture: wardley/db-stages-boundaries]
[fixture: wardley/db-stage-empty-second-name]
[fixture: wardley/db-singletons-last] [fixture: wardley/header-only]
