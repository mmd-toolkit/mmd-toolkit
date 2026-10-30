# Radar

英語版: [radar.md](./radar.md)

この文書は radar の構文と受理を定義する。
[木](../ast/radar.md)は書かれた形を保ち、
Db の導出値は
[tests の要約](../../../tests/docs/db-summaries.md#radar)が定める。
構文の根拠は [radar.langium][grammar] と [common.langium][common] である。
[fixture: radar/gram-written-tree] [fixture: radar/db-all-fields]

## 検出

[detection.md](../detection.md) の 29 番、[radar の detector][detector] は、
後続の境界を要求せず小文字の接頭辞 radar-beta を選ぶ。
受理する見出しは radar-beta、radar-beta:、radar-beta と別の colon の 3 形。
裸の radar、大文字、見出しの反復、不正な接尾辞は拒否する。
検出は構文検査より先なので、 radar の選択だけでは受理を決めない。
[fixture: radar/header-colon-inline] [fixture: radar/header-separated-colon]
[fixture: radar/header-bare] [fixture: radar/header-uppercase]
[fixture: radar/header-repeated] [fixture: radar/header-letter-suffix]
[fixture: radar/header-digit-suffix] [fixture: radar/header-dash-suffix]
[fixture: radar/header-unicode-suffix]

先頭の frontmatter、global directive、comment region、先頭の空白、改行、
HTML 属性の引用符、entity、
選択 semicolon には [共通の前処理](../common.md#reading-a-source)を適用する。
先頭の frontmatter は共有 Frontmatter record であり、
図に残る YAML の形と区別する。
[diagram-orchestration.ts][order] では C4 が先に登録される。
本文中でも検出される C4 の 4 語には後述の差異を適用する。
[fixture: radar/frontmatter-title] [fixture: radar/retained-yaml-control]
[fixture: radar/line-cr] [fixture: radar/line-crlf] [fixture: radar/html-fields]
[fixture: radar/entity-labels] [fixture: radar/style-fields]
[fixture: radar/c4-component-axis-label]

検出点では、
共通の [Frontmatter の形](../common.md#frontmatter)を満たす残存 block を高々 1
個、裸の percent 対の行と第 2 directive scan より先に通す。
block は図のテキストに残り、native hidden-yaml の規則を満たす必要がある。
RadarDiagram.textBeforeHeader が所有し、YAML の properties は適用しない。
本物の frontmatter がその前にあってもよい。
2 個目、通した裸の行の後、第 2 scan の directive の後の block は通さない。
[fixture: radar/retained-yaml-control] [fixture: radar/detect-retained-two]
[fixture: radar/detect-yaml-before-secondscan-native]
[fixture: radar/detect-secondscan-before-yaml-native]
[fixture: radar/detect-native-bare-yaml]

本文行のない隣接 fence、閉じの欠落、字下げの不一致、開始の 4 本 dash、
閉じの接尾辞、EOF を含む後続改行のない閉じは skip を止める。
隣接する 3 本の fence は本文行を持ち得る。
先頭の trim が開始側の字下げだけを除く場合もある。
本物の frontmatter の字下げが一致する場合とは区別する。
検出を通っても native の開始・終了規則は緩めない。
[fixture: radar/detect-block-after-directive]
[fixture: radar/frontmatter-unclosed]
[fixture: radar/detect-retained-indent-both-native]
[fixture: radar/detect-retained-indent-open-native]
[fixture: radar/detect-retained-three-native]
[fixture: radar/detect-retained-close-eof]
[fixture: radar/detect-retained-four-dashes-control]
[fixture: radar/detect-retained-close-suffix-control]
[fixture: radar/detect-retained-close-no-lf-control]
[fixture: radar/detect-retained-opener-nbsp]
[fixture: radar/detect-retained-closer-u3000]

lexer は到達した見出しだけでなく、検出点から残る形を読む。
検出の第 2 scan だけで成立する directive は textBeforeHeader の hidden-directive
とし、固有の閉じの境界を要求する。
見出しとの接着は拒否し、複数の match は別々に残す。
word で始まる global directive は先に除かれ、この native な形とは異なる。
[fixture: radar/detect-secondscan-native]
[fixture: radar/detect-secondscan-native-glued]
[fixture: radar/detect-secondscan-native-twice]
[fixture: radar/detect-yaml-before-secondscan-native]
[fixture: radar/detect-secondscan-native-nbsp]
[fixture: radar/detect-second-scan-glued]

検出で通す裸の percent 対の行は、nonword の percent-brace の形も含め、
mark が %% の共有 Comment とする。
付随して通す空白と改行は、残存する形の間でも trivia とし、読み直さない。
残存する形には native の境界を引き続き要求する。
通した行がなければ同じ Unicode 空白は native の図のテキストであり、
拒否され得る。
ASCII の対照と、通過した Unicode の trivia は区別する。
[fixture: radar/comment-bare] [fixture: radar/retained-directive-control]
[fixture: radar/retained-directive-between-bare]
[fixture: radar/bare-before-header-space]
[fixture: radar/bare-before-header-tab] [fixture: radar/bare-before-header-ls]
[fixture: radar/bare-line-ls] [fixture: radar/retained-yaml-unicode]
[fixture: radar/retained-directive-unicode]
[fixture: radar/detect-retained-no-bare-control]
[fixture: radar/div-detect-yaml-bare-secondscan-native-ls]
[fixture: radar/detect-yaml-bare-secondscan-native-ascii]

## 字句構造

### 規則の優先順

変換後の図のテキストから上記の通過区間を除き、各位置で最初に成立する規則を採る。
その後の位置で先頭から規則を試し直す。
全規則間の最長一致ではない。
結合 colon の見出しを除く語 keyword は長い id の代替を持つが、句読点は持たない。
実効順の根拠は [module.ts][module]、[tokenBuilder.ts][builder]、
[共通の keyword builder][common-builder]、 import した文法である。
[fixture: radar/lex-id-keyword-prefix] [fixture: radar/lex-id-keywords]
[fixture: radar/lex-id-numeric-leading] [fixture: radar/lex-id-title-prefix]
[fixture: radar/lex-bare-accessibility-ids] [fixture: radar/lex-false-prefix-id]
[fixture: radar/lex-polygon-prefix-id] [fixture: radar/error-start]
[fixture: radar/error-after-prefix]

| 優先順 | 単位                             | 読み                   |
| ------ | -------------------------------- | ---------------------- |
| 1      | joined header                    | 結合した見出し         |
| 2      | bare header                      | 裸の見出し             |
| 3–9    | word keywords                    | 語 keyword             |
| 10–15  | punctuation                      | 句読点                 |
| 16     | graticule-value                  | graticule の値         |
| 17     | boolean-value                    | boolean の値           |
| 18     | acc-descr-line / acc-descr-block | 共通の複合形           |
| 19     | acc-title-line                   | 共通の複合形           |
| 20     | title-line                       | 共通の複合形           |
| 21     | number                           | 符号なし十進数         |
| 22     | string                           | 同じ引用符で閉じる形   |
| 23     | id                               | 裸の名前               |
| 24     | newline                          | LF                     |
| 25     | ASCII padding                    | hidden な space/tab    |
| 26     | hidden-yaml                      | fence 付きの形全体     |
| 27     | hidden-directive                 | percent-brace の形全体 |
| 28     | native-comment                   | percent 対から行末     |

[common.langium][common] の FLOAT と INT は number の内部を定め、
独立して読まれる単位ではない。
単位間で飛ばすのは ASCII space と tab だけで、newline は可視である。
共通の CR/CRLF 変換を適用する。
NBSP、BOM、LS U+2028、PS U+2029 などは一般の隙間ではないが、先頭の trivia、
検出で通した trivia、囲む値では許され得る。 [fixture: radar/space-tabs]
[fixture: radar/space-nbsp-body] [fixture: radar/space-bom-body]
[fixture: radar/space-3000-body] [fixture: radar/space-bom-leading]
[fixture: radar/line-cr] [fixture: radar/line-crlf]
[fixture: radar/line-ls-between] [fixture: radar/line-ps-between]
[fixture: radar/line-ls-ps-values]

### 名前と keyword の境界

id は ASCII 英字・数字・underscore で始まり、同じ文字または dash が続き、
末尾は dash 以外とする。
先行規則を優先し、その形で読める限り長く読む。
axisX のような長い名前は axis でなく id とする。
完全な語 keyword は名前にできない。
数字の接頭辞、true/false、circle/polygon、title の接頭辞は、
id の位置でも先行規則が読む。 [fixture: radar/lex-id-underscore]
[fixture: radar/lex-id-dash-end] [fixture: radar/lex-id-nonascii]
[fixture: radar/lex-id-keyword-prefix] [fixture: radar/lex-id-keywords]
[fixture: radar/lex-id-numeric-leading] [fixture: radar/lex-id-numeric-curve]
[fixture: radar/lex-id-boolean-prefix] [fixture: radar/lex-id-graticule-prefix]
[fixture: radar/lex-id-title-prefix] [fixture: radar/lex-false-prefix-id]
[fixture: radar/lex-polygon-prefix-id]

必要な colon や brace がなければ accTitle と accDescr は id にできる。
colon があれば先行する共通の複合規則が優先する。
従って軸名 accTitle は accTitle 1 で参照できるが、accTitle:1 では参照できない。
colon を省略できる文法も字句の優先順は変えない。
[fixture: radar/lex-id-accessibility-prefix]
[fixture: radar/lex-bare-accessibility-ids]
[fixture: radar/lex-bare-accessibility-axis-only]
[fixture: radar/lex-bare-accessibility-no-colon-reference]

[custom matcher][common-builder] が制限するのは裸の radar-beta だけであり、 %%、
共通 Notation の空白、EOF の直前で終わる必要がある。
その空白は U+0009–U+000D、U+0020、U+00A0、U+1680、U+2000–U+200A、 U+2028、
U+2029、U+202F、U+205F、U+3000、U+FEFF である。
境界を満たしても後続文字が合法な隙間になるわけではない。
他の語 keyword は長い id の代替以外に空白境界を要求しない。
boolean と graticule の値には後続の境界がない。 [fixture: radar/comment-header]
[fixture: radar/header-native-glued] [fixture: radar/header-native-no-boundary]
[fixture: radar/header-unicode-suffix] [fixture: radar/space-nbsp-body]
[fixture: radar/gram-option-number-adjacent]
[fixture: radar/gram-option-bool-adjacent]
[fixture: radar/gram-option-enum-adjacent]
[fixture: radar/gram-option-boolean-suffix]
[fixture: radar/gram-option-graticule-suffix]

結合形 radar-beta: は追加の境界を持たず、axis、title、hidden-yaml と接着できる。
書かれた部品は見出しの語と colon である。
分離した colon は裸の見出しの後、可視 newline より前に置く。
native の hidden form が間の LF を消費してもよい。
見出しの綴りは句読点と keyword の構文であり、別の図種 id を作らない。
[fixture: radar/header-colon-inline] [fixture: radar/header-colon-glued-title]
[fixture: radar/header-separated-colon] [fixture: radar/header-colon-newline]
[fixture: radar/header-colon-hidden] [fixture: radar/header-colon-yaml]

境界は global directive と選択 semicolon を除いて判断する。
除かれる directive 自体は separator にならない。
radar-beta と axis の間に directive を置き、除去後が radar-betaaxis なら拒否し、
space が残れば受理する。
axis、curve、 5 種の option keyword にも同じ長い id の規則を適用する。
[fixture: radar/directive-header-glued] [fixture: radar/directive-header-space]
[fixture: radar/directive-axis-glued] [fixture: radar/directive-curve-glued]
[fixture: radar/directive-showlegend] [fixture: radar/directive-ticks]
[fixture: radar/directive-max] [fixture: radar/directive-min]
[fixture: radar/directive-graticule]

### 数と文字列

number は先に ASCII 数字 1 個以上、dot、数字 1 個以上を試し、
その候補の直後が dot でないことを要求する。
次に 1 桁の zero、または zero 以外の数字と後続数字を試す。
zero 以外で始まる形にも、直後が dot でない条件を要求する。
繰返しは残る条件が成立する限り長く取る。
小数の leading zero は許すが、整数の leading zero、符号、小数点の片側の欠落、
指数、NaN、 Infinity の綴りは数ではない。
[fixture: radar/db-number-leading-zero-decimal]
[fixture: radar/number-leading-zero] [fixture: radar/number-plus]
[fixture: radar/number-negative] [fixture: radar/number-negative-zero]
[fixture: radar/number-leading-dot] [fixture: radar/number-trailing-dot]
[fixture: radar/number-exponent] [fixture: radar/number-nan]
[fixture: radar/number-infinity] [fixture: radar/number-double-dot]
[fixture: radar/number-suffix]

書いた数には原綴 raw と double 値を持つ共有 NumericLiteral を使う。
丸め、subnormal、zero への underflow、正の infinity への overflow は拒否しない。
この文法は負数を書けず、NaN や負の infinity も生じない。
数の正規化は [tests の要約](../../../tests/docs/db-summaries.md#radar)が定める。
[fixture: radar/db-number-rounded] [fixture: radar/db-number-subnormal]
[fixture: radar/db-number-underflow] [fixture: radar/db-number-overflow]
[fixture: radar/db-option-overflow] [fixture: radar/number-negative]

string は single quote または double quote で始まり、同じ引用符で閉じる。
空でもよい。
内部ではその引用符と backslash 以外を読み、LF・LS・PS も含める。
backslash は代わりに次の 1 文字を取り、その文字は LF・CR・LS・PS 以外とする。
閉じない string は拒否する。
先に始まった string が内部の native hidden 風のテキストを所有する。
StringLiteral には変換後の label でなく、書かれた escape と引用符を保つ。
[fixture: radar/db-empty-labels] [fixture: radar/lex-string-conversion]
[fixture: radar/lex-string-multiline] [fixture: radar/line-cr-values]
[fixture: radar/line-ls-ps-values] [fixture: radar/lex-string-open-axis]
[fixture: radar/lex-string-open-curve] [fixture: radar/hidden-native-string]
[fixture: radar/hidden-yaml-in-string] [fixture: radar/lex-string-escaped-ls]
[fixture: radar/lex-string-escaped-lf] [fixture: radar/lex-string-escaped-ps]

### 共通の複合形

[共通 terminal][common] は各 common 文を複合形として読む。
title は title だけ、
または title とちょうど 1 個の ASCII space/tab と行値である。
残る padding は値に含める。
accessibility title は accTitle、任意の ASCII padding、colon、行値とする。
description の行形は accDescr を使う同じ形。
行値は最初の %% または物理 EOL の前で終わり、LS/PS では終わらない。
空でもよく、次の行のテキストを値に取らない。
[fixture: radar/lex-common-title-one-space]
[fixture: radar/lex-common-title-two-spaces] [fixture: radar/lex-title-tab-null]
[fixture: radar/lex-title-second-tab] [fixture: radar/lex-common-empty-values]
[fixture: radar/common-line-whitespace] [fixture: radar/line-common-values]
[fixture: radar/common-title-next-statement]
[fixture: radar/common-acctitle-next-statement]
[fixture: radar/common-accdescr-next-statement] [fixture: radar/comment-title]
[fixture: radar/comment-acctitle] [fixture: radar/comment-accdescr]

description block は accDescr、任意の共通 Notation の空白、開始 brace、
最初の終了 brace までの任意の文字、その閉じとする。
本文は物理改行・LS・PS を許し、空でもよい。
引用符も backslash も終了 brace を保護しない。
colon があれば行形を選ぶ。
閉じない block と、native hidden form で分断した複合形は拒否する。
global directive と comment region には共通規則を適用する。
[fixture: radar/common-block-newline-gap] [fixture: radar/common-block-ls-gap]
[fixture: radar/common-block-bom-gap] [fixture: radar/common-block-whitespace]
[fixture: radar/common-block-empty-interleaved]
[fixture: radar/common-block-open] [fixture: radar/common-block-quoted-close]
[fixture: radar/common-block-escaped-close]
[fixture: radar/common-block-directive-gap]
[fixture: radar/common-block-comment-gap]
[fixture: radar/lex-common-block-colon-first]
[fixture: radar/lex-common-block-hidden-inside]
[fixture: radar/lex-common-hidden-yaml-block-owner]
[fixture: radar/lex-common-hidden-percent-block-owner]
[fixture: radar/lex-common-description-only-directive]
[fixture: radar/lex-common-description-only-comment]
[fixture: radar/gram-native-description-gap]

空の block も含む全 common 形に、可視 EOL または EOF を要求する。
完成した block に次の文を接着できないが、
行値は keyword らしい文字列を吸収し得る。
繰返しと空の文を全て保つ。
書かれた値には RadarLiteral を使う。
公開値の trim、空白の統合、
escape の変換は
[tests の要約](../../../tests/docs/db-summaries.md#radar)が定める。
木の欄には当てない。 [fixture: radar/common-block-first-close]
[fixture: radar/common-title-next-statement] [fixture: radar/common-repeat]
[fixture: radar/common-repeat-empty] [fixture: radar/common-title-open-quote]
[fixture: radar/common-line-whitespace]

### hidden な形と comment

hidden-yaml は ASCII padding の後、---、任意の ASCII padding、LF で始まる。
先に本文とその末尾 LF と終了 --- の形を試し、
成立する限り本文の文字数を少なくする。
それが失敗した場合だけ、隣接する空の fence を試す。
内容には LF・LS・PS を含められる。
閉じは本文の LF に直結し、字下げを許さず、 LF、共通 Notation の空白、
EOF の直前で終わる。
条件を満たさない閉じを越えて、後の適格な閉じを採ってもよい。
[fixture: radar/hidden-yaml-adjacent-later]
[fixture: radar/hidden-yaml-adjacent-no-later]
[fixture: radar/hidden-yaml-adjacent-eof]
[fixture: radar/hidden-yaml-closer-indent]
[fixture: radar/hidden-yaml-closer-suffix] [fixture: radar/lex-hidden-padding]
[fixture: radar/lex-hidden-yaml-two-nonempty]
[fixture: radar/lex-hidden-yaml-body-separators]

本文がある選択肢の優先により、隣接する 3 本の fence が一つの match になり得る。
二つの非空 block は別々の match となり得る。
native YAML 自体は properties や設定を適用せず、
開始 padding に NBSP/BOM を許さない。
閉じの後の共通の空白は LF でなければ境界でしかなく、
次の位置でも読める必要がある。 [fixture: radar/lex-hidden-yaml-two-nonempty]
[fixture: radar/detect-retained-three-native] [fixture: radar/hidden-yaml-body]
[fixture: radar/hidden-yaml-opener-bom] [fixture: radar/hidden-yaml-closer-ls]
[fixture: radar/hidden-yaml-closer-nbsp]
[fixture: radar/detect-retained-opener-nbsp]
[fixture: radar/detect-retained-closer-u3000]

hidden-directive は任意の ASCII padding の後、%%{ と任意の内容を読み、 LF、
共通 Notation の空白、EOF の直前で終わる最初の }%% までを取る。
内容は LF・LS・PS や空・nonword の本文を許す。
条件を満たさない閉じは通り越してもよい。
適格な閉じがなければ native-comment が、接着した axis を含め残る行を読み得る。
この native な形は、先に走る global directive scan と区別する。
[fixture: radar/hidden-native-closer] [fixture: radar/hidden-native-unclosed]
[fixture: radar/hidden-native-empty-adjacent]
[fixture: radar/lex-hidden-padding] [fixture: radar/lex-hidden-native-fallback]
[fixture: radar/lex-hidden-native-body-separators]

両 hidden form は直後の LF を消費し、原文 EOF に付加された LF も消費する。
それ以外の適格な空白は消費しない。
そのため common 文の唯一の EOL がなくなると、次の文を拒否する。
余分な LF、閉じの後の ASCII space/tab があれば EOL が残る。
EOF 自体も common 文の条件を満たす。
消費した LF は RadarIgnoredText の範囲と値から除く。
[fixture: radar/hidden-native-title] [fixture: radar/hidden-native-title-space]
[fixture: radar/hidden-native-title-spare]
[fixture: radar/hidden-native-title-eof]
[fixture: radar/hidden-native-acctitle-after]
[fixture: radar/hidden-native-acctitle-space]
[fixture: radar/hidden-native-acctitle-spare]
[fixture: radar/hidden-native-acctitle-eof]
[fixture: radar/hidden-native-description-after]
[fixture: radar/hidden-native-description-space]
[fixture: radar/hidden-native-description-spare]
[fixture: radar/hidden-native-description-eof]
[fixture: radar/hidden-native-sole-lf] [fixture: radar/hidden-native-space]
[fixture: radar/hidden-native-spare-lf] [fixture: radar/hidden-native-eof]
[fixture: radar/hidden-yaml-block-sole-lf]
[fixture: radar/hidden-yaml-block-space]
[fixture: radar/hidden-yaml-block-spare-lf]
[fixture: radar/hidden-yaml-block-eof]

hidden form は完全な単位間に置け、
可視 newline を許さない隙間の物理 LF を消費してもよい。
[木の名前つきの隙間または body](../ast/radar.md#gap-ownership)に一度だけ保つ。
id や固定語を分割できず、
先に始まった string や common 値は内部の hidden 風の形を内容として所有する。
global directive、共通 comment region、選択 semicolon は、
共通規則に従い残存形の内容や fence の中にも置ける。
[fixture: radar/hidden-native-axis] [fixture: radar/hidden-native-curve]
[fixture: radar/hidden-native-entry-gap]
[fixture: radar/lex-hidden-before-label-open]
[fixture: radar/lex-hidden-before-label-close]
[fixture: radar/lex-hidden-entry-comma]
[fixture: radar/lex-hidden-detailed-before-colon]
[fixture: radar/lex-hidden-detailed-no-colon]
[fixture: radar/lex-hidden-yaml-global-inside]
[fixture: radar/lex-hidden-yaml-opener-selected-control]
[fixture: radar/lex-hidden-yaml-opener-global]
[fixture: radar/lex-hidden-yaml-closer-global]
[fixture: radar/lex-hidden-native-opener-global]
[fixture: radar/lex-hidden-native-closer-global]
[fixture: radar/lex-hidden-yaml-content-common-comment]
[fixture: radar/lex-hidden-native-content-common-comment]
[fixture: radar/lex-common-hidden-yaml-block-owner]
[fixture: radar/lex-common-hidden-percent-block-owner]
[fixture: radar/lex-hidden-native-opener-selected]

native comment は任意の ASCII padding、%%、物理 EOL 前の最長の内容を読む。
共有 Comment の mark は %%、value はその後のテキストとし、
前の padding と終了 LF は範囲から除く。
LS/PS では終わらない。
単独 percent と分離した percent 対は拒否し、裸の対と triple-percent は許す。
global directive は二つの percent 文字の間にも置ける。
共通 comment region を引き続き優先する。 [fixture: radar/comment-axis]
[fixture: radar/comment-curve] [fixture: radar/comment-header]
[fixture: radar/comment-bare] [fixture: radar/comment-triple]
[fixture: radar/comment-ls] [fixture: radar/comment-ps]
[fixture: radar/comment-single-percent] [fixture: radar/comment-split-mark]
[fixture: radar/gram-comment-mark-global]

先に始まった description 内の裸の percent 行は、
共通前処理で除かれない限り値である。
その中の native directive 風の形も最初の brace で description を閉じる。
通常の semicolon は文の separator ではない。
行の common 値の semicolon は、
共有の style/classDef 規則が選ばない限り値に残る。
axis、curve、option、 block の後に semicolon が残れば拒否する。
[fixture: radar/common-block-comment]
[fixture: radar/lex-common-hidden-percent-block-owner]
[fixture: radar/tail-title-semicolon] [fixture: radar/tail-acctitle-semicolon]
[fixture: radar/tail-description-semicolon] [fixture: radar/tail-axis-semicolon]
[fixture: radar/tail-curve-semicolon] [fixture: radar/tail-option-semicolon]
[fixture: radar/tail-block-semicolon] [fixture: radar/style-fields]
[fixture: radar/style-controls] [fixture: radar/gram-semicolon-between-units]

## 文法

```text
diagram = newline* header newline*
          (common-statement eol | axis-statement | curve-statement
           | options-statement | newline)* end-of-text
header = "radar-beta" | "radar-beta:" | "radar-beta" ":"
axis-statement = "axis" axis ("," axis)*
axis = id ("[" string "]")?
curve-statement = "curve" curve ("," curve)*
curve = id ("[" string "]")? "{" entries "}"
entries = newline* number-entry ("," newline* number-entry)* newline*
        | newline* named-entry ("," newline* named-entry)* newline*
number-entry = number
named-entry = id ":"? number
options-statement = option ("," option)*
option = "showLegend" boolean-value | "ticks" number | "max" number
       | "min" number | "graticule" graticule-value
common-statement = title-line | acc-title-line
                 | acc-descr-line | acc-descr-block
eol = newline+ | end-of-text
```

[共通の記法](../common.md#notation)と上記の字句規則を使う。
hidden form は可視の separator を足さず、定めた所有先に置く。
body は空でもよい。
axis、curve、options の群は EOL を要求せず、
単位の境界が許せば同じ行で続けて書ける。
common 文は EOL を要求する。
見出しは一つだけとする。 [fixture: radar/spec-radar-test-ts-f0c0291e]
[fixture: radar/gram-inline-statements] [fixture: radar/header-inline-curve]
[fixture: radar/header-repeated] [fixture: radar/common-block-first-close]

| 規則                     | 木のノード                                         |
| ------------------------ | -------------------------------------------------- |
| diagram                  | RadarDiagram                                       |
| axis-statement           | RadarAxisStatement                                 |
| axis                     | RadarAxis                                          |
| curve-statement          | RadarCurveStatement                                |
| curve                    | RadarCurve                                         |
| number-entry             | RadarNumberEntry                                   |
| named-entry              | RadarNamedEntry                                    |
| options-statement        | RadarOptionsStatement                              |
| showLegend option        | RadarShowLegendOption                              |
| ticks / max / min option | RadarTicksOption / RadarMaxOption / RadarMinOption |
| graticule option         | RadarGraticuleOption                               |
| title-line               | RadarTitleStatement                                |
| acc-title-line           | RadarAccTitleStatement                             |
| acc-descr-line           | RadarAccDescrStatement                             |
| acc-descr-block          | RadarAccDescrBlockStatement                        |

axis と curve の群は一つ以上の member を持つ。
各宣言は id と任意の角括弧 string label を持ち、
省略した label は空の string と異なる。
curve には brace と空でない entries が必要。
comma は書かれた群の member を区切り、空の member と末尾 comma は拒否する。
member の comma や label・名前・brace の間に、
定めていない可視 newline は許さない。 [fixture: radar/db-empty-labels]
[fixture: radar/gram-written-tree] [fixture: radar/gram-axis-trailing-comma]
[fixture: radar/gram-curve-trailing-comma]
[fixture: radar/gram-axis-newline-comma]
[fixture: radar/gram-curve-newline-comma]
[fixture: radar/gram-axis-before-comma-visible]
[fixture: radar/gram-curve-before-brace-visible]
[fixture: radar/gram-label-before-close-visible]
[fixture: radar/gram-entry-empty]

curve の entries は全て位置指定の数か、全て名前つき entry とし、
両順の混在を拒否する。
同じ comma 群でも別の curve は別の形式を選べる。
名前つき entry の colon は省略でき、その有無は書いた句読点に保つ。
字句の優先順は引き続き適用する。
最初の entry の前、各 comma の後、最後の entry の後は newline を許す。
entry の comma の前や、名前つき entry の部品間には許さない。
[fixture: radar/gram-entry-mixed-detailed-first]
[fixture: radar/spec-radar-test-ts-59721355]
[fixture: radar/gram-detailed-line-after-colon]
[fixture: radar/gram-detailed-colon-mixed-spelling]
[fixture: radar/gram-detailed-entry-comment]
[fixture: radar/gram-curve-kind-per-curve]
[fixture: radar/gram-entry-newline-after-comma]
[fixture: radar/gram-entry-newline-before-comma]
[fixture: radar/gram-named-entry-line-before-comma]
[fixture: radar/lex-bare-accessibility-ids]

entry list は空や newline だけにできず、comma で終われない。
空の description block は body の文法が許す位置の文であり、
entries の中で自由に無視する形ではない。
native hidden の LF 消費はどの newline が可視かを変えるが、
残る newline の制限は緩めない。 [fixture: radar/gram-entry-empty]
[fixture: radar/gram-entry-trailing-comma]
[fixture: radar/gram-empty-block-in-entries]
[fixture: radar/gram-entry-empty-newlines]
[fixture: radar/gram-entry-block-after-number]
[fixture: radar/lex-hidden-entry-comma]
[fixture: radar/gram-entry-before-comma-native-spare]
[fixture: radar/common-block-empty-interleaved]

options の群は comma で区切る一つ以上の option とし、
comma 後の可視 newline は許さない。
comma なしの次の option は別の群を始める。
showLegend は小文字の固定語 true/false、ticks・max・min は number、
graticule は引用符のない小文字の固定語 circle/polygon だけを値に取る。
colon、数を quote した値、数の boolean、quote した graticule は受理しない。
値の欠落と末尾 comma は拒否する。 [fixture: radar/db-options-repeat]
[fixture: radar/gram-inline-statements] [fixture: radar/gram-option-comma]
[fixture: radar/gram-option-case] [fixture: radar/gram-option-graticule-case]
[fixture: radar/gram-option-boolean-number]
[fixture: radar/gram-option-graticule-string]
[fixture: radar/gram-option-no-value] [fixture: radar/gram-option-colon]
[fixture: radar/gram-option-quoted-number]
[fixture: radar/gram-option-comma-trailing]

### 意味上の受理条件

[parse wrapper][parse] は回復した model のエラーも含め、
lexer または parser error があれば拒否し、全入力の消費を要求する。
文法の後には [computeCurveEntries()][db-entries] の次の二条件を適用する。
curve より後の宣言も含め、図全体の axis を対象とする。
axis の宣言順は参照の可否を制限しない。 [fixture: radar/error-start]
[fixture: radar/error-after-prefix] [fixture: radar/error-recovered-curve]
[fixture: radar/db-forward-axis]

名前つき entry を持つ各 curve には、図全体で少なくとも一つの axis 宣言が必要。
その curve は、宣言された各 axis の名前と完全一致する、軸名の entry を、
少なくとも一つ持つ必要があり、一つでも欠ければ拒否する。
照合は大小文字を区別して書かれた id 名で行い、axis の label は使わない。
label が等しくても異なる名前は同じにならない。
[fixture: radar/error-reference-no-axes]
[fixture: radar/error-reference-missing] [fixture: radar/error-reference-case]
[fixture: radar/error-reference-label] [fixture: radar/db-duplicate-axes]

余分な名前、entry・axis・curve の重複、prototype 風の名前は、
それだけでは拒否しない。
位置 entry には axis が不要で、entry 数と axis 数が違ってもよい。
options に追加の意味上の拒否はなく、ticks の zero・小数、数の overflow、
min が max より大きい形も受理する。
文法の entry 形式と option 値の制限は引き続き適用する。
[fixture: radar/db-extra-detailed-entry] [fixture: radar/db-duplicate-axes]
[fixture: radar/db-duplicate-curves] [fixture: radar/db-prototype-names]
[fixture: radar/db-detailed-zero-first] [fixture: radar/db-detailed-zero-last]
[fixture: radar/db-positional-no-axis] [fixture: radar/db-positional-short]
[fixture: radar/db-positional-long] [fixture: radar/db-ticks-cap-fraction]
[fixture: radar/db-number-overflow] [fixture: radar/db-option-overflow]
[fixture: radar/db-min-above-max]

### Db の正規化

Db の公開と正規化は
[tests の要約](../../../tests/docs/db-summaries.md#radar)が定める。
木は宣言の群、元の entry 形式と順序、余分・重複の名前つき entry、
全ての反復 option と common 文、数の原綴、label の引用符、hidden form を保つ。
公開時の解決済み配列・最終 options・描画結果で、これらのノードを置き換えない。
[fixture: radar/gram-written-tree] [fixture: radar/db-extra-detailed-entry]
[fixture: radar/db-options-repeat] [fixture: radar/common-repeat-empty]
[fixture: radar/db-number-leading-zero-decimal] [fixture: radar/db-empty-labels]
[fixture: radar/lex-hidden-axis-comma] [fixture: radar/lex-hidden-curve-comma]
[fixture: radar/lex-hidden-option-comma]

### 設定

[adapter][adapter] と [Db の受理検査][db-entries] は radar.* の設定を読まない。
width/height、margins、axisScaleFactor、axisLabelFactor、curveTension、
useMaxWidth を含む描画設定は受理を変えない。
設定の showLegend、ticks、max、min、graticule も、
文中の options の値にはならない。
site・frontmatter・init から渡すこれらの radar 設定は、
有効な radar を拒否に変えず、不足した名前つき entry も受理へ救わない。
opaque-data の比較で取り除く radar 固有の受理判定キーはない。
[fixture: radar/config-drawing-only] [fixture: radar/config-options-site]
[fixture: radar/config-frontmatter-options-cannot-reject]
[fixture: radar/config-init-options-cannot-reject]
[fixture: radar/config-site-invalid-cannot-rescue]
[fixture: radar/config-invalid-cannot-rescue]
[fixture: radar/config-init-cannot-rescue]

## 既知の差異

次の既存 6 識別子を適用する。
native hidden の形全体は RadarIgnoredText に持てるため、それを理由に拒否しない。
空 label と空 description 文も保ち、 tokenless-empty-forms にはしない。
[fixture: radar/lex-hidden-yaml-two-nonempty]
[fixture: radar/lex-hidden-native-body-separators]
[fixture: radar/db-empty-labels] [fixture: radar/common-block-empty-interleaved]

[directive-as-token-boundary](../known-divergences/directive-as-token-boundary.md)
では、 id・数・固定語の内部の global directive を拒否する。
boolean/graticule の語と common keyword も固定語に含む。
一体の atom の内部には ignored-text node を置く位置がない。
完成した作者の部品の間には global directive を置ける。
見出しの語と colon、common keyword と colon/brace、label の括弧と string、
entry の軸名・colon・数、list member と comma がその境界である。
除去後も正しい字句の境界を満たす必要がある。
string、common 値、 native hidden の内容にも置ける。
[fixture: radar/directive-header-middle] [fixture: radar/directive-axis-name]
[fixture: radar/directive-curve-name] [fixture: radar/directive-number]
[fixture: radar/directive-reference] [fixture: radar/div-directive-boolean-atom]
[fixture: radar/div-directive-graticule-atom]
[fixture: radar/div-directive-common-keyword]
[fixture: radar/gram-directive-composite-header]
[fixture: radar/directive-common-colon]
[fixture: radar/common-block-directive-gap] [fixture: radar/directive-common]
[fixture: radar/directive-label-before-open]
[fixture: radar/directive-label-after-open]
[fixture: radar/directive-label-before-close]
[fixture: radar/directive-entry-before-colon]
[fixture: radar/directive-entry-before-value]
[fixture: radar/directive-entry-no-colon-joins]
[fixture: radar/directive-list-comma] [fixture: radar/directive-curve-brace]
[fixture: radar/directive-option-space-control]
[fixture: radar/directive-title-space-control]
[fixture: radar/directive-axis-label] [fixture: radar/directive-curve-label]
[fixture: radar/lex-hidden-yaml-global-inside]
[fixture: radar/lex-hidden-yaml-opener-global]
[fixture: radar/lex-hidden-yaml-closer-global]
[fixture: radar/lex-hidden-native-opener-global]
[fixture: radar/lex-hidden-native-closer-global]

[ignored-semicolon-as-token-boundary](../known-divergences/ignored-semicolon-as-token-boundary.md)
では同じく、 id・数・固定語の内部の選択 semicolon を接合せず拒否する。
完成した部品間や text・string・hidden form 内の選択 semicolon は trivia とする。
この規則も通常の semicolon を separator にはしない。
[fixture: radar/div-semicolon-id] [fixture: radar/div-semicolon-number]
[fixture: radar/div-semicolon-keyword]
[fixture: radar/div-semicolon-boolean-atom]
[fixture: radar/div-semicolon-graticule-atom]
[fixture: radar/gram-semicolon-between-units]
[fixture: radar/lex-hidden-yaml-opener-selected-control]
[fixture: radar/lex-hidden-native-opener-selected] [fixture: radar/style-fields]
[fixture: radar/tail-option-semicolon]

[html-tag-in-frontmatter](../known-divergences/html-tag-in-frontmatter.md)
では、本文の HTML quote は frontmatter の後から読み、
frontmatter で開いた tag の状態を本文へ引き継がない。
これは両方向に受理を変え得るほか、双方が受理する common 値を変える場合もある。
[embedded-data-opaque](../known-divergences/embedded-data-opaque.md) では
frontmatter と directive の引数を、内容を検査せず保つ。
比較では拒否の原因となる埋め込みデータだけを除き、無関係な埋め込み値を保つ。
[fixture: radar/div-html-frontmatter-cross]
[fixture: radar/div-html-frontmatter-reverse]
[fixture: radar/gram-html-body-only-double]
[fixture: radar/gram-html-body-only-single]
[fixture: radar/div-html-frontmatter-value] [fixture: radar/frontmatter-invalid]
[fixture: radar/frontmatter-invalid-keeps-config]
[fixture: radar/config-invalid-display-mode]

[bare-percent-line-before-header](../known-divergences/bare-percent-line-before-header.md)
では Mermaid の lexer が空白を拒否する場合も、
検出で通した行と付随する空白を trivia とする。
[c4-keyword-anywhere](../known-divergences/c4-keyword-anywhere.md) では、
後の値や名前に C4Container・C4Component・C4Dynamic・C4Deployment があっても、
radar の見出しは radar を選ぶ。
LF で終わる comment の対照と C4Context は通常の検出に従う。
[fixture: radar/bare-before-header-nbsp] [fixture: radar/bare-line-ls]
[fixture: radar/div-detect-yaml-bare-secondscan-native-ls]
[fixture: radar/detect-yaml-bare-secondscan-native-ascii]
[fixture: radar/detect-retained-no-bare-control]
[fixture: radar/c4-container-title] [fixture: radar/c4-component-axis-label]
[fixture: radar/c4-dynamic-reference] [fixture: radar/c4-deployment-line]
[fixture: radar/c4-container-header-lf] [fixture: radar/c4-context-title]

[grammar]: https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/radar/radar.langium#L1-L55
[common]: https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/common/common.langium#L6-L34
[builder]: https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/radar/tokenBuilder.ts#L1-L7
[common-builder]: https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/common/tokenBuilder.ts#L6-L31
[module]: https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/radar/module.ts#L1-L74
[parse]: https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/parse.ts#L133-L149
[adapter]: https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/radar/parser.ts#L8-L24
[db-entries]: https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/radar/db.ts#L56-L91
[detector]: https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/radar/detector.ts#L7-L11
[order]: https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagram-api/diagram-orchestration.ts#L85-L124
