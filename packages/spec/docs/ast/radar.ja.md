# Radar のノード

英語版: [radar.md](./radar.md)

この文書は radar の木を定義する。
共有の葉と不変条件は [ast.md](../ast.md)、構文と受理は
[diagrams/radar.md](../diagrams/radar.md) が定める。
欄は Db の変換を当てず、書かれた値を保つ。
省略欄も null として存在し、リストはソース順を保ち、隙間のリストは空でもよい。
子の欄は訪問順を示す。
[fixture: radar/gram-written-tree]
[fixture: radar/db-empty-labels]
[fixture: radar/db-options-repeat]
[fixture: radar/common-repeat-empty]

Identifier は書いた名前を保つ。
label の StringLiteral.raw は元の両引用符と間のソース全体を保つ。
value は共通 trivia を除いた未変換の内部を保ち、closed は true とする。
空の引用 label も StringLiteral node とする。
NumericLiteral.raw は全ての桁と dot を保つ。
数値は非有限も含め共有の倍精度の定義に従い、raw を変換後の綴りに置き換えない。
共有の葉はそれぞれ書いた形の範囲を持つ。
[fixture: radar/db-empty-labels]
[fixture: radar/lex-string-conversion]
[fixture: radar/directive-axis-label]
[fixture: radar/db-number-leading-zero-decimal]
[fixture: radar/db-number-overflow]
[fixture: radar/db-number-rounded]

## ノード

### RadarDiagram

| 欄                 | 型                       | 意味                        |
| ------------------ | ------------------------ | --------------------------- |
| `textBeforeHeader` | list of RadarIgnoredText | 見出し前に残る形。          |
| `textBeforeColon`  | list of RadarIgnoredText | 分離した見出し colon の前。 |
| `body`             | list of RadarBodyItem    | 書かれた文と hidden な形。  |

子の欄: textBeforeHeader、textBeforeColon、body。
範囲は最初の見出し前の残存形、なければ見出しから、
最後の見出し/body の形までとし、外の padding と改行を除く。
Root.diagramType は radar。
3 種の見出しは keyword/句読点の構文に保ち、
見出し node、別名の欄、colon flag は作らない。
[fixture: radar/header-colon-inline]
[fixture: radar/header-separated-colon]
[fixture: radar/header-colon-hidden]
[fixture: radar/detect-secondscan-native]
[fixture: radar/detect-yaml-before-secondscan-native]
[fixture: radar/gram-written-tree]

textBeforeHeader は検出点から残る native hidden-yaml と、
第 2 scan の hidden-directive を持つ。
通した裸の percent 行は共有 Comment とし、付随する空白・改行は trivia とする。
それらを読み直したり残存 node の範囲へ加えたりしない。
複数の残存形は別々に保ち、native の閉じの境界を要求する。
[fixture: radar/retained-yaml-control]
[fixture: radar/detect-secondscan-native]
[fixture: radar/detect-secondscan-native-glued]
[fixture: radar/detect-secondscan-native-twice]
[fixture: radar/detect-yaml-before-secondscan-native]
[fixture: radar/div-detect-yaml-bare-secondscan-native-ls]
[fixture: radar/detect-yaml-bare-secondscan-native-ascii]
[fixture: radar/detect-secondscan-native-nbsp]

textBeforeColon は見出しの語と、実際に書いた分離 colon の間の
native hidden form だけを持つ。
その colon がなければリストは空で、見出し後の hidden form は body に入る。
分離 colon の前に可視 newline は置けないが、hidden form が物理 LF
を消費してもよい。
結合 colon の形の内部には native の隙間はない。
[fixture: radar/header-colon-newline]
[fixture: radar/header-colon-hidden]
[fixture: radar/header-native-glued]
[fixture: radar/header-colon-yaml]
[fixture: radar/gram-directive-composite-header]
[fixture: radar/header-separated-colon]

RadarBodyItem は RadarAxisStatement、RadarCurveStatement、
RadarOptionsStatement、RadarTitleStatement、RadarAccTitleStatement、
RadarAccDescrStatement、RadarAccDescrBlockStatement、
RadarIgnoredText のいずれか。
全出現を公開順でなくソース順に保つ。
空行・comment だけの行は body 要素を作らない。
見出し後と、文を終える可視 EOL の後の hidden form は body に属する。
[fixture: radar/gram-written-tree]
[fixture: radar/gram-common-interleaved]
[fixture: radar/db-forward-axis]
[fixture: radar/common-repeat-empty]
[fixture: radar/space-lines]
[fixture: radar/lex-hidden-after-visible-eol]
[fixture: radar/lex-hidden-yaml-two-nonempty]

### RadarAxisStatement

| 欄     | 型                | 意味                            |
| ------ | ----------------- | ------------------------------- |
| `axes` | list of RadarAxis | 書いた comma 群。軸は一つ以上。 |

子の欄: axes。
範囲は axis keyword から最後の RadarAxis の末尾までとし、
その member の接尾辞を含め、EOL と外の padding を除く。
一つの axis keyword が、空でない comma 区切りの群を所有する。
同じ行でも axis keyword が別なら別の文とする。
comma は句読点のままで、separator node や別の配列欄にはしない。
[fixture: radar/gram-written-tree]
[fixture: radar/db-all-fields]
[fixture: radar/gram-inline-statements]
[fixture: radar/lex-hidden-axis-comma]
[fixture: radar/gram-axis-trailing-comma]

### RadarCurveStatement

| 欄       | 型                 | 意味                              |
| -------- | ------------------ | --------------------------------- |
| `curves` | list of RadarCurve | 書いた comma 群。曲線は一つ以上。 |

子の欄: curves。
範囲は curve keyword から最後の RadarCurve の末尾までとし、
接尾辞を含め、EOL と外の padding を除く。
書いた各 curve keyword は新しい群を始める。
重複名や、群内で entry 形式が異なる曲線も全て保つ。
comma は句読点とする。
[fixture: radar/gram-written-tree]
[fixture: radar/db-duplicate-curves]
[fixture: radar/lex-hidden-curve-comma]
[fixture: radar/gram-curve-kind-per-curve]
[fixture: radar/gram-curve-trailing-comma]

### RadarOptionsStatement

| 欄        | 型                  | 意味                                 |
| --------- | ------------------- | ------------------------------------ |
| `options` | list of RadarOption | 書いた comma 群。option は一つ以上。 |

子の欄: options。
範囲は最初の option keyword から最後の option までとし、
接尾辞を含め、EOL と外の padding を除く。
RadarOption は RadarShowLegendOption、RadarTicksOption、RadarMaxOption、
RadarMinOption、RadarGraticuleOption のいずれか。
反復代入と comma を全て保つ。
comma のない次の option は別の RadarOptionsStatement を始める。
有効な options の object でリストを置き換えない。
[fixture: radar/gram-written-tree]
[fixture: radar/db-options-repeat]
[fixture: radar/gram-inline-statements]
[fixture: radar/gram-option-number-adjacent]
[fixture: radar/gram-option-bool-adjacent]
[fixture: radar/lex-hidden-option-comma]
[fixture: radar/gram-option-comma-trailing]

### RadarAxis

| 欄                     | 型                       | 意味                            |
| ---------------------- | ------------------------ | ------------------------------- |
| `textBefore`           | list of RadarIgnoredText | axis または群の comma の後。    |
| `name`                 | Identifier               | 書いた軸名。                    |
| `textBeforeLabel`      | list of RadarIgnoredText | 開始 bracket の前。             |
| `textBeforeLabelValue` | list of RadarIgnoredText | 開始 bracket の後。             |
| `label`                | StringLiteral or null    | 書いた引用符付き label。        |
| `textBeforeLabelClose` | list of RadarIgnoredText | 終了 bracket の前。             |
| `textAfter`            | list of RadarIgnoredText | comma・次の文・EOL 前の接尾辞。 |

子の欄: textBefore、name、textBeforeLabel、textBeforeLabelValue、label、
textBeforeLabelClose、textAfter。
範囲は最初の textBefore、なければ name から、
label があれば終了 bracket、なければ name までとし、textAfter へ広げる。
name は id の原綴を保つ。
label は bracket の形全体がない場合だけ null とし、
空 string は StringLiteral とする。
label がなければ 3 種の label gap は空で、後続 hidden は textAfter に置く。
[fixture: radar/gram-written-tree]
[fixture: radar/db-empty-labels]
[fixture: radar/lex-id-underscore]
[fixture: radar/hidden-native-axis]
[fixture: radar/hidden-native-label-gap]
[fixture: radar/lex-hidden-before-label-open]
[fixture: radar/lex-hidden-before-label-close]
[fixture: radar/lex-hidden-axis-comma]
[fixture: radar/hidden-yaml-after-axis]

### RadarCurve

| 欄                     | 型                       | 意味                          |
| ---------------------- | ------------------------ | ----------------------------- |
| `textBefore`           | list of RadarIgnoredText | curve または群の comma の後。 |
| `name`                 | Identifier               | 書いた曲線名。                |
| `textBeforeLabel`      | list of RadarIgnoredText | 開始 bracket の前。           |
| `textBeforeLabelValue` | list of RadarIgnoredText | 開始 bracket の後。           |
| `label`                | StringLiteral or null    | 書いた引用符付き label。      |
| `textBeforeLabelClose` | list of RadarIgnoredText | 終了 bracket の前。           |
| `textBeforeEntries`    | list of RadarIgnoredText | 開始 brace の前。             |
| `entries`              | list of RadarEntry       | 書いた全 entry。一つ以上。    |
| `textAfter`            | list of RadarIgnoredText | 終了 brace の後の接尾辞。     |

子の欄: textBefore、name、textBeforeLabel、textBeforeLabelValue、label、
textBeforeLabelClose、textBeforeEntries、entries、textAfter。
範囲は最初の textBefore、なければ name から entries の終了 brace までとし、
textAfter へ広げる。
label は bracket がない場合だけ null とし、なければ label gap は空とする。
textBeforeEntries は name または label の終了 bracket と開始 brace の間。
その形を、存在しない label の gap には置かない。
[fixture: radar/gram-written-tree]
[fixture: radar/db-empty-labels]
[fixture: radar/hidden-native-curve]
[fixture: radar/hidden-native-curve-gap]
[fixture: radar/lex-hidden-curve-comma]
[fixture: radar/hidden-yaml-after-curve]
[fixture: radar/lex-curve-label-hidden-gaps]

RadarEntry は RadarNumberEntry または RadarNamedEntry。
curve の空でない entries list はその一方の型だけを、書いた順に持つ。
別の curve は他方の形式でもよい。
余分な名前と重複 entry を保ち、軸 index に解決したり並べ替えたり、
公開する数列で置き換えたりしない。
entry の comma は curve の句読点とし、省略した colon もそのままにする。
[fixture: radar/gram-written-tree]
[fixture: radar/db-extra-detailed-entry]
[fixture: radar/db-duplicate-axes]
[fixture: radar/db-detailed-zero-first]
[fixture: radar/gram-detailed-colon-mixed-spelling]
[fixture: radar/gram-curve-kind-per-curve]
[fixture: radar/gram-entry-mixed-detailed-first]
[fixture: radar/spec-radar-test-ts-59721355]

### RadarNumberEntry

| 欄           | 型                       | 意味                    |
| ------------ | ------------------------ | ----------------------- |
| `textBefore` | list of RadarIgnoredText | 数の前。                |
| `value`      | NumericLiteral           | 書いた位置指定の数。    |
| `textAfter`  | list of RadarIgnoredText | comma/終了 brace の前。 |

子の欄: textBefore、value、textAfter。
範囲は最初の textBefore、なければ数から、数または最後の textAfter まで。
最初の entry の前と comma 後では、許された可視 newline の後に textBefore
を置ける。
textAfter は次の comma、最後の entry なら終了 brace の前を所有する。
許された末尾 newline によって内部の形を diagram の body へ移さない。
axis や暗黙の index は加えない。
[fixture: radar/gram-written-tree]
[fixture: radar/lex-hidden-entry-comma]
[fixture: radar/lex-hidden-before-first-entry]
[fixture: radar/lex-hidden-before-entries-close]
[fixture: radar/gram-entry-newline-after-comma]
[fixture: radar/gram-entry-before-comma-native-spare]
[fixture: radar/db-positional-no-axis]
[fixture: radar/lex-number-entry-hidden-across-lines]

### RadarNamedEntry

| 欄                | 型                       | 意味                    |
| ----------------- | ------------------------ | ----------------------- |
| `textBefore`      | list of RadarIgnoredText | 軸名の前。              |
| `axis`            | Identifier               | 書いた軸の参照名。      |
| `textBeforeColon` | list of RadarIgnoredText | 書いた colon の前。     |
| `textBeforeValue` | list of RadarIgnoredText | 数の前。                |
| `value`           | NumericLiteral           | 書いた名前つきの数。    |
| `textAfter`       | list of RadarIgnoredText | comma/終了 brace の前。 |

子の欄: textBefore、axis、textBeforeColon、textBeforeValue、value、textAfter。
範囲は最初の textBefore、なければ axis から、数または最後の textAfter まで。
axis は書いた id であり、解決済みの宣言や label に差し替えない。
colon があれば textBeforeColon は名前と colon の間、
textBeforeValue は colon の後。
colon がなければ textBeforeColon は空で、名前と数の間の全 native hidden form を
textBeforeValue が所有する。
colon の有無は句読点に保ち、AST の flag は作らない。
[fixture: radar/gram-written-tree]
[fixture: radar/gram-detailed-colon-mixed-spelling]
[fixture: radar/gram-detailed-entry-comment]
[fixture: radar/lex-hidden-detailed-before-colon]
[fixture: radar/lex-hidden-detailed-no-colon]
[fixture: radar/hidden-native-entry-gap]
[fixture: radar/error-reference-label]
[fixture: radar/db-extra-detailed-entry]

entry の textBefore は開始 brace、または comma と許された改行の後に置ける。
textAfter は次の comma、最後の entry なら終了 brace の前の形を所有し、
許された末尾の改行を跨いでもよい。
通常の空白と共有 trivia は gap 要素にしない。
value の raw を公開時の順や丸めた値の綴りへ置き換えない。
[fixture: radar/gram-detailed-entry-comment]
[fixture: radar/lex-hidden-detailed-before-colon]
[fixture: radar/lex-hidden-detailed-no-colon]
[fixture: radar/db-number-rounded]
[fixture: radar/gram-written-tree]
[fixture: radar/lex-named-entry-hidden-across-lines]

### RadarShowLegendOption

| 欄                | 型                       | 意味                            |
| ----------------- | ------------------------ | ------------------------------- |
| `textBefore`      | list of RadarIgnoredText | 群の前の comma の後。           |
| `textBeforeValue` | list of RadarIgnoredText | option keyword の後。           |
| `value`           | string                   | 書いた true または false。      |
| `textAfter`       | list of RadarIgnoredText | comma・次の文・EOL 前の接尾辞。 |

子の欄: textBefore、textBeforeValue、textAfter。
範囲は最初の textBefore、なければ showLegend から、書いた値までとし、
textAfter へ広げる。
群の最初の option の textBefore は空とし、前の hidden form は前の文の接尾辞か
diagram の body に置く。
textBeforeValue は完成した keyword の後とする。
上書きされる代入も全ての出現を保つ。
[fixture: radar/gram-written-tree]
[fixture: radar/db-options-repeat]
[fixture: radar/lex-hidden-option-comma]
[fixture: radar/hidden-native-option]

value は固定語 true または false を文字列で保ち、
変換後の boolean や子の葉にしない。
位置はその単位が持ち、name/raw の欄を別に加えない。
[fixture: radar/gram-written-tree]
[fixture: radar/db-options-repeat]
[fixture: radar/gram-option-boolean-number]
[fixture: radar/div-directive-boolean-atom]
[fixture: radar/div-semicolon-boolean-atom]

### RadarTicksOption

| 欄                | 型                       | 意味                            |
| ----------------- | ------------------------ | ------------------------------- |
| `textBefore`      | list of RadarIgnoredText | 群の前の comma の後。           |
| `textBeforeValue` | list of RadarIgnoredText | option keyword の後。           |
| `value`           | NumericLiteral           | 上限制限前の書いた ticks。      |
| `textAfter`       | list of RadarIgnoredText | comma・次の文・EOL 前の接尾辞。 |

子の欄: textBefore、textBeforeValue、value、textAfter。
範囲は最初の textBefore、なければ ticks から、書いた値までとし、
textAfter へ広げる。
群の最初の option の textBefore は空とし、前の hidden form は前の文の接尾辞か
diagram の body に置く。
textBeforeValue は完成した keyword の後とする。
上書きされる代入も全ての出現を保つ。
[fixture: radar/gram-written-tree]
[fixture: radar/db-options-repeat]
[fixture: radar/lex-hidden-option-comma]
[fixture: radar/hidden-native-option]

value は元の raw を持つ共有 NumericLiteral とし、
小数の精度や overflow も保持する。
有効な option 値で置き換えない。
[fixture: radar/gram-written-tree]
[fixture: radar/db-option-overflow]
[fixture: radar/db-ticks-cap-fraction]

### RadarMaxOption

| 欄                | 型                       | 意味                            |
| ----------------- | ------------------------ | ------------------------------- |
| `textBefore`      | list of RadarIgnoredText | 群の前の comma の後。           |
| `textBeforeValue` | list of RadarIgnoredText | option keyword の後。           |
| `value`           | NumericLiteral           | 書いた max。                    |
| `textAfter`       | list of RadarIgnoredText | comma・次の文・EOL 前の接尾辞。 |

子の欄: textBefore、textBeforeValue、value、textAfter。
範囲は最初の textBefore、なければ max から、書いた値までとし、
textAfter へ広げる。
群の最初の option の textBefore は空とし、前の hidden form は前の文の接尾辞か
diagram の body に置く。
textBeforeValue は完成した keyword の後とする。
上書きされる代入も全ての出現を保つ。
[fixture: radar/gram-written-tree]
[fixture: radar/db-options-repeat]
[fixture: radar/lex-hidden-option-comma]
[fixture: radar/hidden-native-option]

value は元の raw を持つ共有 NumericLiteral とし、
小数の精度や overflow も保持する。
有効な option 値で置き換えない。
[fixture: radar/gram-written-tree]
[fixture: radar/db-option-overflow]
[fixture: radar/db-ticks-cap-fraction]

### RadarMinOption

| 欄                | 型                       | 意味                            |
| ----------------- | ------------------------ | ------------------------------- |
| `textBefore`      | list of RadarIgnoredText | 群の前の comma の後。           |
| `textBeforeValue` | list of RadarIgnoredText | option keyword の後。           |
| `value`           | NumericLiteral           | 書いた min。                    |
| `textAfter`       | list of RadarIgnoredText | comma・次の文・EOL 前の接尾辞。 |

子の欄: textBefore、textBeforeValue、value、textAfter。
範囲は最初の textBefore、なければ min から、書いた値までとし、
textAfter へ広げる。
群の最初の option の textBefore は空とし、前の hidden form は前の文の接尾辞か
diagram の body に置く。
textBeforeValue は完成した keyword の後とする。
上書きされる代入も全ての出現を保つ。
[fixture: radar/gram-written-tree]
[fixture: radar/db-options-repeat]
[fixture: radar/lex-hidden-option-comma]
[fixture: radar/hidden-native-option]

value は元の raw を持つ共有 NumericLiteral とし、
小数の精度や overflow も保持する。
有効な option 値で置き換えない。
[fixture: radar/gram-written-tree]
[fixture: radar/db-option-overflow]
[fixture: radar/db-ticks-cap-fraction]

### RadarGraticuleOption

| 欄                | 型                       | 意味                            |
| ----------------- | ------------------------ | ------------------------------- |
| `textBefore`      | list of RadarIgnoredText | 群の前の comma の後。           |
| `textBeforeValue` | list of RadarIgnoredText | option keyword の後。           |
| `value`           | string                   | 書いた circle または polygon。  |
| `textAfter`       | list of RadarIgnoredText | comma・次の文・EOL 前の接尾辞。 |

子の欄: textBefore、textBeforeValue、textAfter。
範囲は最初の textBefore、なければ graticule から、書いた値までとし、
textAfter へ広げる。
群の最初の option の textBefore は空とし、前の hidden form は前の文の接尾辞か
diagram の body に置く。
textBeforeValue は完成した keyword の後とする。
上書きされる代入も全ての出現を保つ。
[fixture: radar/gram-written-tree]
[fixture: radar/db-options-repeat]
[fixture: radar/lex-hidden-option-comma]
[fixture: radar/hidden-native-option]

value は固定語 circle または polygon とし、StringLiteral や Identifier
の子にはしない。
引用符や他の綴りは構文で拒否する。
[fixture: radar/gram-written-tree]
[fixture: radar/db-options-repeat]
[fixture: radar/gram-option-graticule-string]
[fixture: radar/gram-option-graticule-case]
[fixture: radar/div-directive-graticule-atom]
[fixture: radar/div-semicolon-graticule-atom]

### RadarTitleStatement

| 欄          | 型                       | 意味                          |
| ----------- | ------------------------ | ----------------------------- |
| `value`     | RadarLiteral or null     | 書いた common 値。            |
| `textAfter` | list of RadarIgnoredText | 可視 EOL 前の hidden 接尾辞。 |

value は title とちょうど 1 個の ASCII space/tab の後から始まり、
残る行の padding を保つ。
separator がないか、内容が残らなければ null。
2 個目の separator は空白の literal となる。
[fixture: radar/lex-common-title-one-space]
[fixture: radar/lex-common-title-two-spaces]
[fixture: radar/lex-title-tab-null]
[fixture: radar/lex-title-second-tab]
[fixture: radar/common-title-next-statement]

子の欄: value、textAfter。
範囲は title から 値の最後の文字、null なら titleまでとし、
最後の textAfter へ広げ、EOL と無関係な外の padding を除く。
繰返しと空の出現を別々に保つ。
最初の可視 EOL より前の native hidden form は textAfter、
その EOL の後は diagram の body に置く。
native comment は共有 Comment とし、接尾辞 node にはしない。
[fixture: radar/common-repeat-empty]
[fixture: radar/lex-hidden-after-visible-eol]
[fixture: radar/hidden-native-title-eof]
[fixture: radar/hidden-native-acctitle-eof]
[fixture: radar/hidden-native-description-eof]
[fixture: radar/hidden-native-eof]

### RadarAccTitleStatement

| 欄          | 型                       | 意味                          |
| ----------- | ------------------------ | ----------------------------- |
| `value`     | RadarLiteral or null     | 書いた common 値。            |
| `textAfter` | list of RadarIgnoredText | 可視 EOL 前の hidden 接尾辞。 |

value は colon 直後からの行のテキストで、両端の padding を保つ。
内容が残らない場合だけ null とし、空白だけなら literal とする。
[fixture: radar/lex-common-empty-values]
[fixture: radar/common-acctitle-eof]
[fixture: radar/common-acctitle-next-statement]

子の欄: value、textAfter。
範囲は accTitle から 値の最後の文字、null なら colonまでとし、
最後の textAfter へ広げ、EOL と無関係な外の padding を除く。
繰返しと空の出現を別々に保つ。
最初の可視 EOL より前の native hidden form は textAfter、
その EOL の後は diagram の body に置く。
native comment は共有 Comment とし、接尾辞 node にはしない。
[fixture: radar/common-repeat-empty]
[fixture: radar/lex-hidden-after-visible-eol]
[fixture: radar/hidden-native-title-eof]
[fixture: radar/hidden-native-acctitle-eof]
[fixture: radar/hidden-native-description-eof]
[fixture: radar/hidden-native-eof]

### RadarAccDescrStatement

| 欄          | 型                       | 意味                          |
| ----------- | ------------------------ | ----------------------------- |
| `value`     | RadarLiteral or null     | 書いた common 値。            |
| `textAfter` | list of RadarIgnoredText | 可視 EOL 前の hidden 接尾辞。 |

value は colon 直後からの行のテキストで、両端の padding を保つ。
内容が残らない場合だけ null とし、空白だけなら literal とする。
colon の後の brace らしいテキストもこの行形に保つ。
[fixture: radar/lex-common-empty-values]
[fixture: radar/lex-common-block-colon-first]
[fixture: radar/common-description-eof]
[fixture: radar/common-accdescr-next-statement]

子の欄: value、textAfter。
範囲は accDescr から 値の最後の文字、null なら colonまでとし、
最後の textAfter へ広げ、EOL と無関係な外の padding を除く。
繰返しと空の出現を別々に保つ。
最初の可視 EOL より前の native hidden form は textAfter、
その EOL の後は diagram の body に置く。
native comment は共有 Comment とし、接尾辞 node にはしない。
[fixture: radar/common-repeat-empty]
[fixture: radar/lex-hidden-after-visible-eol]
[fixture: radar/hidden-native-title-eof]
[fixture: radar/hidden-native-acctitle-eof]
[fixture: radar/hidden-native-description-eof]
[fixture: radar/hidden-native-eof]

### RadarAccDescrBlockStatement

| 欄          | 型                       | 意味                          |
| ----------- | ------------------------ | ----------------------------- |
| `value`     | RadarLiteral or null     | 書いた common 値。            |
| `textAfter` | list of RadarIgnoredText | 可視 EOL 前の hidden 接尾辞。 |

value は brace の内部から、共通 Notation の空白を外端だけ除いたもの。
空白・共通 directive・comment region だけなら null とする。
内部の字下げ、原文の改行、引用符、backslash、裸の percent 行は保つ。
最初の終了 brace を必須とし、closed 欄は加えない。
空 block もこの文を作る。
[fixture: radar/lex-common-empty-values]
[fixture: radar/lex-common-hidden-yaml-block-owner]
[fixture: radar/lex-common-hidden-percent-block-owner]
[fixture: radar/lex-common-description-only-directive]
[fixture: radar/lex-common-description-only-comment]
[fixture: radar/common-block-empty-interleaved]
[fixture: radar/common-block-whitespace]
[fixture: radar/common-block-open]

子の欄: value、textAfter。
範囲は accDescr から 最初の終了 braceまでとし、
最後の textAfter へ広げ、EOL と無関係な外の padding を除く。
繰返しと空の出現を別々に保つ。
最初の可視 EOL より前の native hidden form は textAfter、
その EOL の後は diagram の body に置く。
native comment は共有 Comment とし、接尾辞 node にはしない。
[fixture: radar/common-repeat-empty]
[fixture: radar/lex-hidden-after-visible-eol]
[fixture: radar/hidden-native-title-eof]
[fixture: radar/hidden-native-acctitle-eof]
[fixture: radar/hidden-native-description-eof]
[fixture: radar/hidden-native-eof]

### RadarLiteral

| 欄      | 型     | 意味                         |
| ------- | ------ | ---------------------------- |
| `value` | string | 書いた common 値のテキスト。 |

子の欄はない。
範囲は文が定める値の最初から最後の原文文字までとし、内部の共通 trivia を跨ぐ。
value から共通 directive、comment region、選択 semicolon を除き、
原文の改行、引用符、entity、escape、所有する空白など、それ以外は全て保つ。
null に対して空 literal は作らない。
引用符らしい common テキストも RadarLiteral とし、引用符の閉じを要求しない。
空白の統合と escape の復号は当てない。
[fixture: radar/common-title-open-quote]
[fixture: radar/common-quotes-entities]
[fixture: radar/common-line-whitespace]
[fixture: radar/common-block-whitespace]
[fixture: radar/directive-common]
[fixture: radar/common-block-directive]
[fixture: radar/common-block-comment]
[fixture: radar/style-fields]
[fixture: radar/line-cr-values]
[fixture: radar/lex-common-title-two-spaces]
[fixture: radar/lex-common-empty-values]

### RadarIgnoredText

| 欄      | 型     | 意味                            |
| ------- | ------ | ------------------------------- |
| `kind`  | string | yaml-block または directive。   |
| `value` | string | 空でない原文の fence 付きの形。 |

子の欄はない。
範囲は成立した --- または %%{ の開始から、選ばれた適格な閉じまでとする。
前の padding と直後に消費した LF は除く。
内部の原文の改行と padding を保ち、付加 LF は範囲/値に加えない。
value は共通 directive、comment region、選択 semicolon を除き、
範囲はそれらを跨ぐ。
両形とも閉じを必須とし、closed 欄は不要。
本文が空でも fence を含む値は空にならない。
[fixture: radar/hidden-yaml-adjacent-eof]
[fixture: radar/lex-hidden-padding]
[fixture: radar/hidden-native-eof]
[fixture: radar/hidden-yaml-crlf]
[fixture: radar/lex-hidden-yaml-global-inside]
[fixture: radar/lex-hidden-yaml-opener-selected-control]
[fixture: radar/lex-hidden-yaml-opener-global]
[fixture: radar/lex-hidden-yaml-closer-global]
[fixture: radar/lex-hidden-native-opener-global]
[fixture: radar/lex-hidden-native-closer-global]
[fixture: radar/lex-hidden-yaml-content-common-comment]
[fixture: radar/lex-hidden-native-content-common-comment]
[fixture: radar/lex-hidden-yaml-body-separators]
[fixture: radar/lex-hidden-native-body-separators]
[fixture: radar/lex-hidden-native-opener-selected]

kind は native YAML なら yaml-block、native DIRECTIVE なら directive。
この値を YAML properties や root の frontmatter/directive data にしない。
内部の独立した common directive は共通の効果を保つ。
共有の埋め込みデータの読み方は tests の要約に従う。
各 match 全体には gap/body の所有先を一つだけ与える。
先に始まった string と common 値は内部の hidden
風のテキストを内容として所有する。
本文がある選択肢の優先により 3 本の fence が一つの node になり得るが、
二つの非空 match は二つの node に保つ。
失敗した native directive が comment となる場合は共有 Comment を使う。
[fixture: radar/retained-yaml-control]
[fixture: radar/lex-hidden-yaml-two-nonempty]
[fixture: radar/lex-hidden-yaml-global-inside]
[fixture: radar/lex-hidden-native-fallback]
[fixture: radar/detect-secondscan-native]
[fixture: radar/detect-retained-three-native]
[fixture: radar/hidden-native-string]
[fixture: radar/hidden-yaml-in-string]
[fixture: radar/lex-common-hidden-yaml-block-owner]
[fixture: radar/lex-common-hidden-percent-block-owner]
[fixture: radar/hidden-native-unclosed]

### 隙間の所有

native hidden の各 gap は、ソース順の RadarIgnoredText のリストとする。
通常の空白、共有 Comment/Directive、共通 comment region、
選択 semicolon は要素にしない。
各 member の textBefore は、導く axis/curve keyword、comma、開始 brace の後。
textAfter は次の comma・終了 brace・文・文末の可視 EOL の前までとする。
comma と並行する所有配列は作らず、一つの match を重ねて置かない。
[fixture: radar/lex-hidden-axis-comma]
[fixture: radar/lex-hidden-curve-comma]
[fixture: radar/lex-hidden-entry-comma]
[fixture: radar/lex-hidden-option-comma]
[fixture: radar/lex-hidden-two-suffixes]
[fixture: radar/gram-comment-mark-global]
[fixture: radar/lex-hidden-before-first-entry]
[fixture: radar/lex-hidden-before-entries-close]

label の textBeforeLabel は開始 bracket の前、textBeforeLabelValue はその後、
textBeforeLabelClose は終了 bracket の前とする。
省略した部品の gap list は空で、形は次に存在する部品の gap か textAfter に置く。
curve の entries 内部は、そこで許された改行を跨いでも前後の所有を保つ。
hidden の LF 消費は可視の separator を変えるが、
検出で通過した区間の所有は変えない。
[fixture: radar/hidden-native-label-gap]
[fixture: radar/hidden-native-curve-gap]
[fixture: radar/lex-hidden-before-label-open]
[fixture: radar/lex-hidden-before-label-close]
[fixture: radar/lex-hidden-entry-comma]
[fixture: radar/lex-hidden-detailed-before-colon]
[fixture: radar/lex-hidden-detailed-no-colon]
[fixture: radar/lex-hidden-after-visible-eol]
[fixture: radar/div-detect-yaml-bare-secondscan-native-ls]
[fixture: radar/detect-yaml-bare-secondscan-native-ascii]
[fixture: radar/lex-hidden-before-first-entry]
[fixture: radar/lex-hidden-before-entries-close]
[fixture: radar/gram-entry-before-comma-native-spare]

## 例

この記法の例は 3 種の文の群、2 種の entry、全 option 型を示す。
名前つき curve は、どの軸も使わない Z:9 を保つ。
数の curve は同じ群内でも別の member とする。
ticks の raw は 33 のまま保つ。
4 種の common 形は、description の両形も含め別々の node とする。
[fixture: radar/gram-written-tree]

```mmd
radar-beta:
  axis A["Axis A"], B
  curve c['Curve']{A 1, B: 2, Z: 9}, d{3, 4}
  showLegend false, ticks 33, max 10, min 0, graticule polygon
  title Radar
  accTitle: Axis comparison
  accDescr: Short
  accDescr {
    Long
  }
```
