# Cynefin: 木から Db を構築する

英語版: [cynefin.md](./cynefin.md)

`cynefinDbOf` は受理済みの [Cynefin の木](../../../spec/docs/ast/cynefin.ja.md)を読み、
[Cynefin の要約](../db-summaries.ja.md#cynefin)と同じ項目を返す。
受理の条件は [構文](../../../spec/docs/diagrams/cynefin.ja.md#意味上の受理条件)に定める。 [fixture: cynefin/db-all-fields]
[fixture: cynefin/gram-transition-first]

## 木から要約を構築する

1. **変換したテキスト。**
   範囲を共有の [変換形](../db-from-tree.ja.md#変換した形)で読む。
   共通の除去、CR・CRLF、ソース全体の HTML 属性の引用符、
   文字参照の仮の形を使う。
   StringLiteral の引用符を除き、共有の `decodedString` を使う。
   b/f/n/r/t/v/0 の escape は制御文字になる。
   ほかはバックスラッシュを除いた文字になる。
   Unicode や十六進の復号はしない。
   文字列の空白と空文字列を保つ。
   項目と遷移の文字列には security によるテキスト置換を適用しない。
   CynefinIgnoredText は読み飛ばす。 [fixture: cynefin/lex-string-conversion]
   [fixture: cynefin/lex-transition-string-conversion]
   [fixture: cynefin/entity-texts] [fixture: cynefin/html-texts]
   [fixture: cynefin/line-string-values]
   [fixture: cynefin/directive-every-field]
   [fixture: cynefin/hidden-yaml-common-directive]
2. **共通の代入。**
   変換した CynefinLiteral の範囲を読み、 null は空のテキストにする。
   共有の `commonValue` を使う。
   行の値の前後を trim し、連続する ASCII の空白とタブを畳む。
   ブロックでは各行も trim し、連続する改行を畳む。
   最後の代入を採り、空の代入も前の本文の値を消す。
   最後の title が空なら `embedded.title`、それもなければ空のテキストを使う。
   空の accessibility の値は空の既定値にする。
   最後の説明に共有の `descriptionOf` を適用し、
   title・accTitle・accDescr に `textReplacementOf(embedded.config)` を適用する。 [fixture: cynefin/common-repeat]
   [fixture: cynefin/common-repeat-empty]
   [fixture: cynefin/common-empty-interleaved]
   [fixture: cynefin/frontmatter-empty-body-title]
   [fixture: cynefin/common-line-whitespace]
   [fixture: cynefin/common-block-whitespace]
   [fixture: cynefin/config-security-level-other]
3. **領域。**
   各領域の文は、その名前の項目のリスト全体を置き換える。
   空も含む。
   最後のリストに項目が 1 つ以上ある領域だけを、renderer の参照順で公開する。
   順は complex・complicated・chaotic・clear・confusion。
   項目の順と重複を保ち、空の label も項目に数える。
   confusion の項目は表示上限を越えてもすべて保つ。 [fixture: cynefin/db-domain-duplicates]
   [fixture: cynefin/db-domain-empty-first]
   [fixture: cynefin/db-domain-empty-last] [fixture: cynefin/gram-glued-domains]
   [fixture: cynefin/db-empty-texts] [fixture: cynefin/db-all-fields]
   [fixture: cynefin/gram-item-duplicates]
4. **遷移。**
   ソース順で公開し、重複と未宣言の端点を保つ。
   自己遷移は除く。
   変換した文字列が truthy の場合だけ label を含める。
   空文字列は除き、空白だけなら保つ。
   矢印と native の gap の node は要約に含めない。 [fixture: cynefin/db-transition-duplicates]
   [fixture: cynefin/gram-transition-first] [fixture: cynefin/db-self-loops]
   [fixture: cynefin/db-empty-texts] [fixture: cynefin/hidden-all-unit-gaps]

## 記録との比較

`specified.json` があればそれを使い、なければ `expected.json` を使う。
設定と title は共有の `embeddedValuesOf` で得る。
サイトの security の fixture は記録した設定で、
frontmatter の HTML による値の fixture は指定の読みで比較する。
受理する木の不足と不一致を入力とともに報告する。
parser のエラーを飛ばすのは `fixtureAccepts` がその読みを拒否する場合だけ。
opaque の受理で比較用の Db が無い場合は、
[共有の比較規則](../../../spec/docs/known-divergences/embedded-data-opaque.ja.md#比較する-db)で明示する。 [fixture: cynefin/config-security-level-other]
[fixture: cynefin/div-html-frontmatter-value]
[fixture: cynefin/config-fontfamily-keeps-title]
[fixture: cynefin/div-invalid-keeps-config]
