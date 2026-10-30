# Radar: 木から Db を組み立てる

英語版: [radar.md](./radar.md)

`radarDbOf` は受理された [radar の木](../../../spec/docs/ast/radar.md)を読む。
意味上の受理条件は
[構文](../../../spec/docs/diagrams/radar.md#semantic-acceptance-conditions)
が定め、 builder は再判定しない。
結果の項目は [radar の要約](../db-summaries.md#radar)と一致する。
[fixture: radar/db-all-fields] [fixture: radar/error-reference-label]

## 木から要約を組み立てる

1. **読み取りと順序。**
   範囲は共通の[変換後のテキスト](../db-from-tree.md#the-converted-form)で読む。
   共通の切れ目、CR/CRLF、HTML 属性の quote、entity の代替文字を含む。
   全 axes、全 curves、options の順に公開し、各配列内は出現順を保つ。
   後の軸も曲線の参照先になる。
   RadarIgnoredText は無視し、native YAML・directive の property は公開しない。
   独立した共通 directive の埋め込み値の効果は共通の読み取りによる。
   [fixture: radar/db-forward-axis] [fixture: radar/line-cr-values]
   [fixture: radar/html-fields] [fixture: radar/entity-labels]
   [fixture: radar/directive-axis-label] [fixture: radar/hidden-yaml-body]
   [fixture: radar/lex-hidden-yaml-global-inside]
2. **共通の代入。**
   title・accTitle・2 形の description は変換後の literal 範囲を読み、
   null は空文字とする。
   `commonValue` で行の両端を trim し、2 個以上の ASCII space/tab を縮める。
   block は各行も trim し、連続する物理改行も縮める。
   空の代入も含めて最後が勝ち、前の本文の値を抑える。
   最後の title が空なら `embedded.title`、それもなければ空の既定値を使う。
   accessibility の空値は空の既定値になる。
   最終 description に `descriptionOf` を適用し、
   3 項目とも `textReplacementOf(embedded.config)` を適用する。
   [fixture: radar/common-all] [fixture: radar/common-line-whitespace]
   [fixture: radar/common-block-whitespace] [fixture: radar/common-repeat]
   [fixture: radar/common-repeat-empty]
   [fixture: radar/frontmatter-empty-body-title]
   [fixture: radar/db-security-label-padding] [fixture: radar/html-fields]
3. **ラベル。**
   ラベルがない軸・曲線は変換後の名前を使う。
   明示ラベルは quote を除いた変換後の StringLiteral 内部を使う。
   共通の `decodedString` により backslash の b/f/n/r/t/v/0 を制御文字にし、
   その他は backslash だけを除く。
   16 進や Unicode の復号はしない。
   空ラベル、ラベルの padding、重複名、prototype 形の名前を保つ。
   ラベルに追加の sanitization はしない。
   宣言名は要約に含めない。 [fixture: radar/db-empty-labels]
   [fixture: radar/lex-string-conversion]
   [fixture: radar/db-security-label-padding]
   [fixture: radar/lex-string-multiline] [fixture: radar/db-duplicate-axes]
   [fixture: radar/db-duplicate-curves] [fixture: radar/db-prototype-names]
   [fixture: radar/html-fields]
4. **Entry。**
   位置で並べた entry は原順序を保ち、軸なしや軸数との不一致もそのまま公開する。
   名前つき entry は軸の順に値を 1 個ずつ作り、
   完全に同じ名前の最初の entry を使う。
   重複軸には同じ最初の値を繰り返し、余分な名前は公開しない。
   数の範囲を double として読み、公開する数は共通の `numberOrText` に渡す。
   非有限は文字列、負のゼロはゼロになる。
   木の raw、任意の colon、元の entry 配列は変えない。
   [fixture: radar/db-positional-no-axis] [fixture: radar/db-positional-short]
   [fixture: radar/db-positional-long] [fixture: radar/db-all-fields]
   [fixture: radar/db-detailed-zero-first]
   [fixture: radar/db-detailed-zero-last] [fixture: radar/db-duplicate-axes]
   [fixture: radar/db-extra-detailed-entry] [fixture: radar/db-number-rounded]
   [fixture: radar/db-number-overflow] [fixture: radar/db-number-underflow]
   [fixture: radar/gram-detailed-colon-mixed-spelling]
5. **Option。**
   既定値は showLegend true、ticks 5、max null、min 0、graticule circle。
   false・ゼロも含め、各 option の最後の指定が勝つ。
   数値 option を double で読み、ticks を 32 に制限し、
   `numberOrText` を適用する。
   上限未満の小数 ticks と、未指定の max の null は保つ。
   固定語は showLegend では boolean、graticule では string になる。
   自動の最大値は計算せず、 entry を min/max に切り詰めない。
   [fixture: radar/spec-radar-test-ts-f0c0291e]
   [fixture: radar/db-options-repeat] [fixture: radar/db-ticks-cap-last]
   [fixture: radar/db-ticks-cap-before-final]
   [fixture: radar/db-ticks-cap-fraction] [fixture: radar/db-all-fields]
   [fixture: radar/db-option-overflow] [fixture: radar/db-min-above-max]
6. **設定。**
   radar.* の設定は Db option や公開時の拒否条件を供給しない。
   site・frontmatter・init の描画設定や option 設定は共通の設定に保つ。
   座標・色など renderer の値は導出しない。 [fixture: radar/config-drawing-only]
   [fixture: radar/config-options-site]
   [fixture: radar/config-frontmatter-options]
   [fixture: radar/config-init-options]
   [fixture: radar/config-frontmatter-options-cannot-reject]
   [fixture: radar/config-init-options-cannot-reject]

## 記録との比較

`specified.json` があれば使い、なければ `expected.json` を使う。
共通の設定と title は `embeddedValuesOf` で得る。
共通の比較は記録不足を報告し、受理の読み取りには木を求める。
error 記録を飛ばすのは、印の読み取りが `fixtureAccepts` で拒否される場合だけ。
比較 Db のない opaque な受理例は、
[共通の比較規則](../../../spec/docs/known-divergences/embedded-data-opaque.md#the-comparison-db)
に従い明示する。
radar 専用の specified reading は追加しない。
[fixture: radar/frontmatter-invalid-keeps-config]
[fixture: radar/config-invalid-display-mode]
[fixture: radar/div-html-frontmatter-reverse]
[fixture: radar/c4-component-axis-label]
[fixture: radar/div-detect-yaml-bare-secondscan-native-ls]
