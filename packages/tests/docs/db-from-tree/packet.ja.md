# 木から packet の Db を作る

英語版: [packet.md](./packet.md)

`src/db-from-tree/packet.ts` は、
[ast/packet.md](../../../spec/docs/ast/packet.ja.md) から、
[要約](../db-summaries.ja.md#packet)を作ります。
木は
[構文と意味上の条件](../../../spec/docs/diagrams/packet.ja.md#意味上の受理条件)
で受理済みです。
builder は parser の拒否検査を繰り返しません。

## 木から要約を作る手順

1. **変換した値。**
   共通の converted-text reader で原文の除去、CR/CRLF、 HTML 属性の引用符、
   実体参照の仮表現を読みます。
   PacketIgnoredText は無視します。
   StringLiteral の変換した引用符内を読み、
   b/f/n/r/t/v/0 の escape を制御文字へ戻します。
   ほかはバックスラッシュだけを除き、十六進・Unicode の escape は復号しません。
   label の空白と空文字は残し、
   文字置換を適用しません。 [fixture: packet/db-label-escapes]
   [fixture: packet/db-label-single-escapes] [fixture: packet/db-label-space]
   [fixture: packet/db-label-empty-double]
   [fixture: packet/db-label-empty-single] [fixture: packet/line-crlf-label]
   [fixture: packet/html-all-fields] [fixture: packet/entity-all-text]
   [fixture: packet/directive-label-middle] [fixture: packet/hidden-yaml-body]
   [fixture: packet/config-security-level-other]
2. **共通の代入。**
   title、accTitle、両 accDescr を変換した literal の範囲から読み、
   null は空文字にします。
   行の値は両端を trim し、 2 個以上続く ASCII space/tab を 1 個にします。
   ブロックは各行も trim し、連続する物理改行をまとめます。
   最後の代入を残し、空の代入も前の本文の値を消します。
   最後の値が空でなければ公開します。
   空の title は共通の embedded title を残し、
   空の accessibility は空の初期値を残します。
   共通の欄に `textReplacementOf(embedded.config)` を適用し、
   description はその前に `descriptionOf` を通します。
   [fixture: packet/common-whitespace] [fixture: packet/accdescr-block-lines]
   [fixture: packet/title-repeat] [fixture: packet/title-repeat-empty]
   [fixture: packet/acctitle-repeat-empty]
   [fixture: packet/accdescr-block-repeat]
   [fixture: packet/frontmatter-empty-body-title]
   [fixture: packet/html-all-fields]
   [fixture: packet/config-security-level-other]
3. **設定。**
   渡された embedded/site 設定の `packet.bitsPerRow` を読み、
   欠落と null は 32 にします。
   `embeddedValuesOf` が記録した `{ "nonFinite": value }` のタグを builder
   が読む前に数値へ戻します。
   value は `"Infinity"`、`"-Infinity"`、`"NaN"` のいずれかです。
   文字列は文字列のままです。
   行境界の乗算は幅を数に変えますが、
   ループ条件の 1 の加算では文字列を連結します。
   幅 `"8"` の条件の上限は `"81"`、数の 8 は 9 です。
   両方の演算の前に幅を一度だけ数へ変えてはいけません。
   [fixture: packet/config-frontmatter-row-negative-fraction]
   [fixture: packet/config-frontmatter-row-negative-fraction-string]
   [fixture: packet/config-init-row-integer]
   [fixture: packet/config-frontmatter-row-null]
   [fixture: packet/config-init-row-null]
   [fixture: packet/config-frontmatter-row-numeric-string]
   [fixture: packet/config-init-row-numeric-string]
   [fixture: packet/config-frontmatter-row-infinity]
   [fixture: packet/config-init-row-overflow]
   [fixture: packet/config-frontmatter-row-nan]
   [fixture: packet/config-frontmatter-row-negative-infinity]
   [fixture: packet/config-frontmatter-row-infinity-string]
4. **論理端点。**
   最後の論理端点は -1 から始めます。
   range は書いた start と end、single は書いた start、
   relative は最後の論理端点 + 1 と書いた count を使います。
   整数は IEEE 754 double として読みます。
   省略した end は `start + count - 1` とし、single の count は 1 です。
   演算順と double の丸めを保ちます。
   分割前に最後の論理端点をこの end に更新します。
   公開しないブロックや公開上限後も同じです。 [fixture: packet/gram-mixed]
   [fixture: packet/gram-zero-range] [fixture: packet/db-precision-rounded]
   [fixture: packet/db-overflow-wide]
   [fixture: packet/db-explicit-end-rounded-continuity]
   [fixture: packet/db-cap-later-logical-end]
5. **公開行。**
   行番号 1、作業行は空で始めます。
   各ブロックで、
   作業行の長さが `bitsPerRow + 1` 以下かつ公開済み行数が 10,000 未満の間、
   `end + 1` と `row * bitsPerRow` を比べます。
   収まれば残り全体を追加します。
   収まらなければ `row * bitsPerRow - 1` で終わるブロックを追加し、
   残りを `row * bitsPerRow` から続けます。
   分割ごとに同じ label を使います。
   追加した端点 + 1 が行境界なら作業行を公開し、空にして行番号を進めます。
   収まればそのブロックを終え、部分的な作業行は次のブロックへ残します。
   最後には空でない作業行だけを公開します。
   行・ブロック順と重複を残し、各公開端点に `numberOrText` を適用します。
   補助の bit 数は残しません。 [fixture: packet/db-row-split]
   [fixture: packet/db-row-exact] [fixture: packet/db-same-label]
   [fixture: packet/db-cap-following-block-unpublished]
   [fixture: packet/db-frontmatter-infinite-endpoint]
6. **特殊な幅。**
   -4、NaN、非数値文字列は条件を満たさず、行を公開しません。
   幅 0 は start 0、end -1 の行を 10,000 個公開します。
   2.5 は小数端点、true は 1 bit 行、数の Infinity は有限範囲を 1 行にします。
   文字列 `"Infinity"` は連結するため条件を満たしません。
   YAML の `1e400` は文字列、init の JSON の `1e400` は数の Infinity です。
   init の裸の `.nan` と `.inf` は不正なので共通の embedded reader が無視し、
   既定の幅を残します。 [fixture: packet/config-frontmatter-row-negative]
   [fixture: packet/config-init-row-negative]
   [fixture: packet/config-frontmatter-row-nan]
   [fixture: packet/config-frontmatter-row-text]
   [fixture: packet/config-init-row-text]
   [fixture: packet/config-frontmatter-row-zero]
   [fixture: packet/config-init-row-zero]
   [fixture: packet/config-frontmatter-row-fraction-accepted]
   [fixture: packet/config-init-row-fraction-accepted]
   [fixture: packet/config-frontmatter-row-true]
   [fixture: packet/config-init-row-true]
   [fixture: packet/config-frontmatter-row-infinity]
   [fixture: packet/config-init-row-infinity-word-string]
   [fixture: packet/config-frontmatter-row-overflow]
   [fixture: packet/config-init-row-overflow]
   [fixture: packet/config-init-row-nan-token]
   [fixture: packet/config-init-row-infinity-token]

## 記録との比較

`specified.json` があればそれを、なければ `expected.json` を使い、
比較用の設定と共通の frontmatter title は `embeddedValuesOf` から得ます。
受理は `fixtureAccepts` で判断し、受理する読みには木が必要です。
error 記録だけの場合は印の読みが拒否するときだけ Db 比較を省きます。
欠落記録は報告し、比較 Db がない場合も明示します。
opaque embedded data、HTML frontmatter、C4 検出、
通過した裸行は既存の共通の読みで扱い、
packet 専用の specified reading は作りません。
[fixture: packet/config-frontmatter-fraction]
[fixture: packet/config-directive-fraction]
[fixture: packet/config-frontmatter-overrides-site]
[fixture: packet/config-directive-overrides-site]
[fixture: packet/frontmatter-invalid-keeps-config]
[fixture: packet/div-html-frontmatter-value]
[fixture: packet/div-c4-hidden-yaml]
[fixture: packet/div-detect-yaml-bare-directive-ls]
[fixture: packet/directive-number-middle]
[fixture: packet/div-selected-integer-interior]

parser の記録は既定の設定を使います。
記録した木がサイト設定の比較読みでは拒否になる場合も、木の条件を検査し、
その拒否の読みとは Db を比べません。
parser のテストが外部で保持するサイトの幅を適用して受理を検査します。
[fixture: packet/config-fraction-reject]
[fixture: packet/config-directive-overrides-site]
[fixture: packet/config-frontmatter-overrides-site]
[fixture: packet/error-rounded-following-wide]
[fixture: packet/error-single-rounded-end-wide]
