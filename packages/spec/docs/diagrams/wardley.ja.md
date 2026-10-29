# Wardley

英語版: [wardley.md](./wardley.md)

この文書は wardley の構文と受理を定義する。
[木](../ast/wardley.ja.md) は書かれた形を保ち、
Db の導出値は [tests の要約](../../../tests/docs/db-summaries.ja.md#wardley)
が定める。
根拠は [wardley.langium][grammar] と [common.langium][common]。
[fixture: wardley/db-all-fields] [fixture: wardley/header-only]

## 検出

[detection.md](../detection.ja.md) の 37 番、[wardleyDetector.ts][detector] は、
境界を要求せず wardley-beta の接頭辞を大文字小文字を区別せず比較する。
文法の見出しは小文字だけ。
大文字、見出しの反復、colon、読めない接尾辞は拒否する。
見出しに EOL は要らず、次の文を直接つなげてもよい。
Root.diagramType は wardley。 [fixture: wardley/header-only]
[fixture: wardley/header-upper] [fixture: wardley/header-double]
[fixture: wardley/header-punctuation] [fixture: wardley/header-letter]
[fixture: wardley/header-word] [fixture: wardley/header-dash]
[fixture: wardley/header-unicode] [fixture: wardley/header-glued-statement]
[fixture: wardley/header-inline]

本物の先頭 frontmatter、global directive、comment region、先頭の空白、改行変換、
HTML 属性の引用符、entity、
選ばれた semicolon
には[共通の前処理](../common.ja.md#ソースの読み方)を適用する。
[diagram-orchestration.ts][order] は Wardley を C4 より後に登録するため、
後の C4 語には後述の共有の見出し選択の差異が適用される。
[fixture: wardley/frontmatter-title] [fixture: wardley/space-bom-leading]
[fixture: wardley/line-cr] [fixture: wardley/line-crlf]
[fixture: wardley/html-texts] [fixture: wardley/entity-texts]
[fixture: wardley/style-every-text] [fixture: wardley/c4-component-component]
[fixture: wardley/c4-component-header-lf]

本物の frontmatter は共有 Frontmatter。
検出点では、
[共通の frontmatter の形](../common.ja.md#フロントマター)を満たす残存 block
を高々 1 個、裸の percent 対の行と第 2 directive scan より先に通す。
block は図のテキストに残り、hidden-yaml を満たす必要がある。
WardleyDiagram.textBeforeHeader が所有し、YAML の properties は適用しない。
この別 block の前に本物の frontmatter があってもよい。
[fixture: wardley/detect-block-after-directive]
[fixture: wardley/detect-block-after-frontmatter]
[fixture: wardley/detect-two-blocks]
[fixture: wardley/detect-real-before-retained-secondscan]

本文行のない隣接 fence、閉じの欠落、字下げの不一致、開始の 4 本 dash、
閉じの接尾辞、EOF を含む後続改行のない閉じは skip を止める。
隣接する 3 本の fence は本文行を持てる。
先頭の trim は開始側だけの字下げを除くこともある。
検出を通っても native の開始・終了境界は緩めない。
[fixture: wardley/detect-empty-after-directive]
[fixture: wardley/detect-retained-missing]
[fixture: wardley/detect-retained-indent-mismatch]
[fixture: wardley/detect-retained-four-dashes]
[fixture: wardley/detect-retained-close-suffix]
[fixture: wardley/detect-retained-close-no-lf]
[fixture: wardley/detect-retained-close-eof]
[fixture: wardley/detect-retained-three-fences]
[fixture: wardley/detect-retained-opening-indent]
[fixture: wardley/detect-body-equal-indentation]
[fixture: wardley/detect-retained-opening-nbsp]
[fixture: wardley/detect-retained-closing-u3000]

2 個目の残存 block、通した裸の行の後の block、
第 2 scan の directive の後の block は通さない。
残存 YAML の後に第 2 scan の directive を置けるが、逆順は検出に失敗する。
到達した見出しだけでなく、検出点から残った形を読む。
[fixture: wardley/detect-retained-two]
[fixture: wardley/retained-yaml-between-bares]
[fixture: wardley/detect-block-after-bare-brace]
[fixture: wardley/prefix-yaml-before-secondscan]
[fixture: wardley/prefix-yaml-after-secondscan]

第 2 scan だけが作る directive は図のテキストに残り、
textBeforeHeader の hidden-directive として読む。
native の閉じ境界も必要で、見出しを閉じに詰めると拒否する。
本物の frontmatter や残存 YAML の後も含め、複数の残存形は別々に保つ。
[fixture: wardley/prefix-secondscan]
[fixture: wardley/prefix-secondscan-multiline]
[fixture: wardley/detect-secondscan-glued]
[fixture: wardley/detect-two-secondscans]
[fixture: wardley/detect-real-before-retained-secondscan]

global directive でない percent-brace 形を含め、
通した裸の percent 対の行は mark が %% の共有 Comment となり、再読しない。
それに伴う空白と改行も、残存形の前や間を含め trivia。
ASCII の space/tab の対照は受理する。
見出し直前や独立行の、
通した Unicode trivia は bare-percent-line-before-header の差異になり得る。
通した裸の行がなければ、後の native な Unicode の隙間は拒否し得る。
[fixture: wardley/retained-directive-between-bares]
[fixture: wardley/prefix-directive-between-bare-unicode]
[fixture: wardley/detect-retained-secondscan-bare-ascii]
[fixture: wardley/detect-retained-secondscan-bare-ls]
[fixture: wardley/bare-before-space] [fixture: wardley/bare-before-tab]
[fixture: wardley/bare-before-ls] [fixture: wardley/bare-before-ps]
[fixture: wardley/bare-line-ls] [fixture: wardley/bare-line-ps]
[fixture: wardley/prefix-yaml-bare-unicode]
[fixture: wardley/prefix-yaml-unicode-no-bare]
[fixture: wardley/retained-no-bare-unicode]

## 字句構造

### 単位の優先順

共通 trivia と検出が通した区間を除いた、変換形の図のテキストを読む。
各単位の先頭で、次の最初に成立する規則を取り、その後で再び先頭から試す。
一般的な最長一致ではない。
[module.ts][module] は default token builder と固有の
[valueConverter.ts][wardley-converter] を使い、
custom keyword matcher や validator を加えない。
回復した model があっても、読めない文字は入力全体の拒否となる。
[fixture: wardley/db-all-fields] [fixture: wardley/error-start]
[fixture: wardley/error-after-prefix] [fixture: wardley/error-recovered]

| 順  | 単位（左から順）                                                            |
| --- | --------------------------------------------------------------------------- |
| 1   | `[ , ] @ / ( ) - { }`                                                       |
| 2   | decimal、dependency-arrow、port、link-arrow、link-label、strategy           |
| 3   | wardley-beta、size、evolution、anchor、component、label、inertia            |
| 4   | evolve、pipeline、note、annotations、annotation、accelerator、deaccelerator |
| 5   | spaced-name、native space/tab padding                                       |
| 6   | acc-descr-line / acc-descr-block、acc-title-line、title-line                |
| 7   | integer、string、id-name、newline                                           |
| 8   | hidden-yaml、hidden-directive、native-comment                               |

表の unit の優先順位を次の fixture が示します。
[fixture: wardley/keywords-all-glued] [fixture: wardley/db-link-forms]
[fixture: wardley/hidden-yaml-component-gaps]
[fixture: wardley/lex-name-priority] [fixture: wardley/common-repeat]

minus の句読点には dependency-arrow、link-arrow、hidden-yaml の順で、
より長く一致する選択肢がある。
他の句読点にはない。
keyword と strategy の terminal に長い代替や末尾の境界はない。
import された BOOLEAN・FLOAT・NUMBER と space/tab padding は未到達で、
単位を作らない。
import された padding は native space/tab padding と同じ形で、
先の native の規則が常に先に一致するため到達しない。
[fixture: wardley/space-tabs] [fixture: wardley/space-lines]
実効順は [wardley.langium][terminals] と [common.langium][common] による。
[fixture: wardley/db-link-forms] [fixture: wardley/hidden-yaml-block]
[fixture: wardley/keywords-all-glued]
[fixture: wardley/number-integer-coordinate]

### keyword と名前の境界

strategy は優先順に build、buy、outsource、 market。
[fixture: wardley/db-inertia-forms]
[fixture: wardley/spec-wardley-parser-95189f48]

Wardley の command/header keyword と strategy の値は、小文字の完全な綴りを、
word や空白の境界なしで読む。
componentA と anchor_A は keyword の接頭辞で分かれ、
annotations は annotation に先行する。
完全な keyword の直後に詰めた global directive を除いても、
境界の要件は加わらない。
keyword の内部の分割には後述の atomic な差異を適用する。
[fixture: wardley/keywords-all-glued] [fixture: wardley/keywords-letter]
[fixture: wardley/anchor-word] [fixture: wardley/annotations-letter]
[fixture: wardley/annotation-letter] [fixture: wardley/strategy-prefix]
[fixture: wardley/strategy-upper] [fixture: wardley/directive-keyword-glued]
[fixture: wardley/directive-keyword-middle]
[fixture: wardley/directive-header-inside]

id-name は ASCII letter/digit/underscore で始まり、それらと hyphen が続き、
word character で終わる。
先の規則が優先され、9a の 9 は integer が取るが、_a は名前になる。
非 ASCII の bare name は拒否する。
引用した名前には、この keyword と bare name の制約はない。
[fixture: wardley/lex-id-forms] [fixture: wardley/db-id-underscore]
[fixture: wardley/lex-name-nonascii] [fixture: wardley/lex-keyword-name-quoted]
[fixture: wardley/db-prototype-names]

spaced-name は ASCII letter で始まる。
ASCII letter/digit/underscore、丸括弧、ampersand、
直後が > でない hyphen が続く。
その後は、非空の space/tab の連続と、
ASCII letter または開き丸括弧で始まり同じ続きの文字を持つ部分を反復する。
この形が許すだけ多く取る。
内部の space/tab は名前の原文で、末尾の padding は名前の外。
space の後の ampersand は次の部分を始められない。
[fixture: wardley/db-unquoted-names]
[fixture: wardley/spec-wardley-parser-069bb337]
[fixture: wardley/spec-wardley-parser-2ba74bc6]
[fixture: wardley/lex-native-after-name-space]
[fixture: wardley/lex-name-trailing-space] [fixture: wardley/lex-name-spaces]
[fixture: wardley/space-tabs]

先頭が title と共通 whitespace、
または accTitle/accDescr で始まる場合は spaced-name を試さない。
後の共通形や id-name がその位置を読めることはある。
[ の直前の title は名前になれるが、space が続く title はメタデータになり、
accTitlex は id-name になれる一方 accTitlex Foo は component
の一つの名前にならない。
先頭の予約された接頭辞と、既に始まった spaced-name の内部は異なる。
component 名の builder は拒否するが、My builder は一つの名前。
[fixture: wardley/lex-name-title-glued] [fixture:
wardley/lex-name-title-with-space] [fixture: wardley/lex-name-title-prefix]
[fixture: wardley/lex-name-acctitle-multiword] [fixture:
wardley/lex-name-priority] [fixture: wardley/lex-name-inner-keyword]

字句の優先順は矢印の境界も決める。
A->B は名前 A と dependency-arrow -> だが、
A-->B は名前 A- と dependency-arrow ->。
A-.->B は dot で拒否する。
長い矢印や破線矢印の前に padding があれば全体を読める。
大文字の Evolution A -> B は名前 Evolution A からの link であり、
evolution 文ではない。 [fixture: wardley/spec-wardley-parser-14953f7f]
[fixture: wardley/lex-link-long-arrow-glued]
[fixture: wardley/lex-link-dashed-arrow-glued] [fixture: wardley/db-link-forms]
[fixture: wardley/evolution-upper]

### 数

decimal は非空の ASCII digit 列、dot 一つ、非空の ASCII digit 列。
先頭の zero を許す。
integer は先に試す 0、または非零の ASCII digit とその後の digit 列で、
dot の直前で終えずできるだけ多く取る。
decimal は integer に先行する。
そのため先頭 zero の整数は分かれ、一つの integer を要求する位置では拒否する。
plus、負の decimal、指数表記、dot の片側がない形、
NaN/Infinity の綴りは数の単位ではない。 [fixture: wardley/number-leading-zero]
[fixture: wardley/number-int-leading-zero]
[fixture: wardley/lex-number-int-annotation-leading-zero]
[fixture: wardley/number-plus] [fixture: wardley/number-negative-zero]
[fixture: wardley/number-exponent] [fixture: wardley/number-leading-dot]
[fixture: wardley/number-trailing-dot] [fixture: wardley/number-nan]
[fixture: wardley/number-infinity] [fixture: wardley/number-suffix]

anchor/component/note/force の座標、pipeline の evolution、evolve の target、
stage の boundary は decimal を要求する。
annotation と annotations box の座標は decimal または integer。
size の寸法、annotation の番号、offset の大きさは integer。
offset の minus は別の句読点であり、
unsigned の大きさとの間に space/tab や whole hidden form を置ける。
decimal の offset や size は拒否する。
[fixture: wardley/number-integer-coordinate]
[fixture: wardley/lex-number-boundary-integer]
[fixture: wardley/lex-number-evolve-integer]
[fixture: wardley/db-coordinate-boundary]
[fixture: wardley/lex-number-offset-decimal]
[fixture: wardley/lex-number-size-decimal]
[fixture: wardley/lex-number-offset-separated-minus]
[fixture: wardley/hidden-yaml-component-gaps]

NumericLiteral は百分率化前の、数の原綴と double の値を持つ。
integer と decimal は [module.ts][module] の converter fallback と共有の double
の定義に従う。
丸め、subnormal、underflow、overflow は raw を変えない。
offset の大きさの葉は unsigned のままで、minus zero も含め書いた符号は別に持つ。
座標の受理は後述の double の比較で決める。
[fixture: wardley/db-number-int-precision]
[fixture: wardley/db-number-subnormal] [fixture: wardley/db-number-underflow]
[fixture: wardley/db-number-overflow]
[fixture: wardley/number-offset-negative-zero]
[fixture: wardley/db-coordinate-double-hundred]
[fixture: wardley/db-coordinate-double-one]
[fixture: wardley/lex-coordinate-above-boundary]

### 文字列と link のラベル

string は対応する single/double quote を使い、空でもよいが必ず閉じる。
対応 quote と backslash 以外の文字、または backslash とその直後の 1 文字を、
escape されていない対応 quote まで読む。
backslash の後は正規化後の LF、U+2028、U+2029 にできない。
escape していない実際の改行と両 separator は中身になる。
閉じの欠落や末尾の backslash は拒否する。
この照合より先に共通の quote 変換を行い、
原文の quote と escape は StringLiteral.raw に残す。
[fixture: wardley/db-empty-texts] [fixture: wardley/lex-string-escaped-quotes]
[fixture: wardley/lex-string-multiline] [fixture: wardley/line-string-values]
[fixture: wardley/lex-string-escaped-lf]
[fixture: wardley/lex-string-escaped-ls]
[fixture: wardley/lex-string-escaped-ps]
[fixture: wardley/lex-string-open-single]
[fixture: wardley/lex-string-open-double]
[fixture: wardley/lex-string-dangling-backslash] [fixture: wardley/html-texts]

意味の比較でだけ、string の escape b/f/n/r/t/v/0 を対応する制御文字として読む。
それ以外は backslash を除いた直後の文字として読み、backslash-q は q、
backslash-u0041 は Unicode escape ではなく u0041。
bare name と string の中身は trim や空白縮約をしない。
木の値にはこの比較変換を施さず原文を残す。
[fixture: wardley/lex-string-conversion]
[fixture: wardley/lex-string-escaped-quotes]
[fixture: wardley/gram-reference-decoded-escape]
[fixture: wardley/gram-reference-same-whitespace]
[fixture: wardley/gram-reference-case-mismatch]
[fixture: wardley/gram-reference-unicode-mismatch]
[fixture: wardley/space-name-values]

port は優先順に +<>、+>、+<。
dependency-arrow は ->。
link-arrow は -->、-.->、>、または +、single quote の中身、
marker <>・<・> からなる label 付き flow。
flow の中身は single quote 以外の任意の文字で、改行と U+2028/U+2029 を含められ、
空でもよい。
backslash は普通の文字で quote を escape しない。
この label には string の escape 変換を施さない。
[fixture: wardley/db-link-forms] [fixture: wardley/line-every-text]
[fixture: wardley/lex-link-flow-raw-escapes]
[fixture: wardley/lex-link-flow-quote-not-escapable]
[fixture: wardley/lex-flow-label-changes-direction]
[fixture: wardley/lex-flow-label-changes-bidirectional]
[fixture: wardley/lex-flow-label-changes-dashed]
[fixture: wardley/lex-flow-label-changes-dashed-short]

link-label は semicolon と、その後の CR/LF 以外の 1 文字以上で、
実際の行の残りを取る。
semicolon だけは拒否する。
semicolon-space は導出値が空でも非空の原文 literal であり、
二つの semicolon は二つ目を中身とする。
U+2028/U+2029 や native hidden に見える形も label の中身。
この label は Db で flow label が優先されても別に保つ。
導出される label/flow の規則は tests の要約が定め、原文の arrow 欄ではない。
[fixture: wardley/tail-link-empty-label]
[fixture: wardley/tail-link-spaced-label]
[fixture: wardley/tail-link-double-label]
[fixture: wardley/line-link-label-values]
[fixture: wardley/lex-hidden-directive-multiline-label]
[fixture: wardley/db-link-forms] [fixture: wardley/lex-flow-port-wins]

### 共通メタデータの値

title-line は title と、
任意の「ちょうど一つの ASCII space/tab とその後の行の中身」。
acc-title-line と acc-descr-line は完全な keyword、任意の space/tab、colon、
行の中身。
行の中身は最初の %% または CR/LF の直前で終わる。
quote は普通のテキストで閉じなくてもよい。
title-colon は title の形ではない。
先の spaced-name の除外も適用する。 [fixture: wardley/common-title-eof]
[fixture: wardley/common-title-tabs] [fixture: wardley/common-title-two-spaces]
[fixture: wardley/common-line-whitespace] [fixture: wardley/common-acctitle-eof]
[fixture: wardley/common-description-eof] [fixture: wardley/common-open-quote]
[fixture: wardley/common-quoted-values] [fixture: wardley/common-title-colon]

acc-descr-block は accDescr、省略可能な共通 whitespace、開き brace、
最初の閉じ brace までの中身を持つ。
閉じは必須。
quote と backslash は閉じ brace を保護しない。
共有の除去がなければ内部の改行、字下げ、裸の percent 行、
native YAML に見える文字も中身になる。
native directive に見える文字は、その最初の brace で block を閉じることもある。
[fixture: wardley/common-block-empty-gap]
[fixture: wardley/common-block-comment-gap]
[fixture: wardley/common-block-directive-gap]
[fixture: wardley/common-block-open] [fixture: wardley/common-block-first-close]
[fixture: wardley/common-block-escaped-close]
[fixture: wardley/common-block-bare-percent]
[fixture: wardley/hidden-yaml-block] [fixture: wardley/hidden-directive-block]
[fixture: wardley/common-block-comment]

木では別々の 4 文を使う。
title の値は書いた separator ちょうど一つの後から、
accessibility の行の値は colon 直後から始める。
共有 trivia を除き、残りの padding、quote、entity、escape、
source の改行を WardleyLiteral の原文に残す。
行の中身が残らなければ null、空白だけの行の中身は literal。
block の値は両端の共通 whitespace だけを除き、中身がなくなれば null にするが、
空 block も文になる。
反復した出現は別に保つ。
導出されるメタデータは [AbstractMermaidValueConverter][converter] と
[populateCommonDb][populate-common] に基づき、 tests の要約が定める。
[fixture: wardley/common-empty-literals]
[fixture: wardley/common-title-two-spaces] [fixture: wardley/common-title-tabs]
[fixture: wardley/common-block-whitespace] [fixture: wardley/common-line-ls-ps]
[fixture: wardley/line-block-values] [fixture: wardley/common-repeat]
[fixture: wardley/common-repeat-empty]
[fixture: wardley/frontmatter-empty-body-title]
[fixture: wardley/directive-every-field]

### native の空白、hidden form、EOL

native padding は非空の ASCII space/tab 列。
newline は共通の CR/CRLF 変換後の可視 LF。
EOL は可視 newline の一つ以上、または end-of-text。
他の共通 whitespace、BOM、NBSP、U+2028、
U+2029 は本文の一般的な padding ではない。
囲む値と hidden の境界にはそれぞれの規則がある。
source の後に追加する LF は原文の値や範囲に含めない。
[fixture: wardley/space-tabs] [fixture: wardley/space-lines]
[fixture: wardley/line-cr] [fixture: wardley/line-crlf]
[fixture: wardley/space-bom-body] [fixture: wardley/space-nbsp-body]
[fixture: wardley/line-ls-gap] [fixture: wardley/line-ps-eof]
[fixture: wardley/hidden-directive-eof] [fixture: wardley/hidden-yaml-eof]

hidden-yaml は 3 本 dash、任意の ASCII space/tab、改行で始まる。
空の本文より先に、改行で終わる本文を試し、その最初の選択肢の中で、
条件を満たす閉じに届く最小の本文を取る。
閉じは行頭の 3 本 dash と、その後の消費する改行、
または消費しない共通 whitespace/終端の境界。
開始の字下げを引き継ぐのではない。
字下げした閉じや 4 本の閉じ dash はその閉じではない。
[fixture: wardley/hidden-yaml-nested]
[fixture: wardley/hidden-yaml-adjacent-eof]
[fixture: wardley/hidden-yaml-adjacent-later]
[fixture: wardley/hidden-yaml-adjacent-no-later]
[fixture: wardley/lex-hidden-yaml-closer-indented]
[fixture: wardley/lex-hidden-yaml-four-dashes]
[fixture: wardley/hidden-yaml-closing-space]

この選択順により 3 本の fence を一つの whole match にできる。
隣接 2 本の fence の後に別の閉じがあると、間の文に見える文字も囲むことがある。
非空の YAML block 二つは別々に残る。
開始は完全な単位の後にも置けるが、
先の名前の貪欲な読みが dash を取る場合は異なる。
条件を満たす hidden の閉じの後の U+2028/U+2029 は、
境界として見るだけで消費しないため、残る空白を読めなければ拒否する。
[fixture: wardley/hidden-yaml-adjacent-later]
[fixture: wardley/hidden-yaml-nested] [fixture: wardley/hidden-yaml-unit-gap]
[fixture: wardley/hidden-after-link] [fixture: wardley/hidden-yaml-closing-ls]
[fixture: wardley/detect-retained-closing-u3000]
[fixture: wardley/lex-native-directive-closing-ls]

hidden-directive は任意の ASCII space/tab と %%{ で始まり、
条件を満たす }%% まで任意の文字をできるだけ少なく読み、
その後の改行を消費するか共通 whitespace/終端の境界だけを検査する。
早い閉じに非空白が詰まれば、後の適格な閉じを試す。
規則全体が失敗すると、native-comment が percent 対から行の残りを、
続く構文に見える文字も含めて読める。
native comment は CR/LF の前で止まり改行を消費しない。
mark は %% で、単独 percent は comment ではない。
[fixture: wardley/hidden-directive-adjacent]
[fixture: wardley/lex-hidden-directive-later-closer]
[fixture: wardley/hidden-directive-no-boundary] [fixture: wardley/comment-eof]
[fixture: wardley/comment-native-triple]
[fixture: wardley/comment-single-percent]

string、flow の中身、link-label、
共通値は native hidden を試す前に囲んだ文字を取り、
ignored node を重複して作らない。
共通の行の値は %%、description block は最初の brace で止まるため、
native に見える文字で先の単位が終わることもある。
hidden form の中でも共有 Directive、comment region、
選ばれた semicolon の範囲は共通規則のまま。
その除去による hidden の句読点や comment mark の接合を許す。
[fixture: wardley/hidden-directive-string] [fixture: wardley/hidden-yaml-string]
[fixture: wardley/hidden-yaml-title] [fixture: wardley/hidden-yaml-acctitle]
[fixture: wardley/hidden-yaml-description] [fixture: wardley/hidden-yaml-block]
[fixture: wardley/hidden-directive-block]
[fixture: wardley/hidden-directive-title]
[fixture: wardley/lex-hidden-directive-multiline-label]
[fixture: wardley/lex-hidden-yaml-common-directive]
[fixture: wardley/lex-hidden-yaml-comment-region]
[fixture: wardley/directive-native-opener-split]
[fixture: wardley/directive-native-yaml-closer]
[fixture: wardley/directive-native-directive-opener]
[fixture: wardley/lex-selected-native-yaml-opener]
[fixture: wardley/lex-selected-native-directive-opener]

whole hidden form は WardleyIgnoredText。
開始から適格な閉じまでを範囲にし、
前の padding と直後に消費した最後の改行は除く。
内部の原文の改行を保つ。
各 match は[名前つきの所有欄](../ast/wardley.ja.md)に一度だけ置く。
native form に frontmatter や設定の効果はなく、
その中の独立した global directive は固有の効果を保つ。
comment は代わりに共有 Comment record。
[fixture: wardley/lex-hidden-directive-cr] [fixture: wardley/lex-hidden-yaml-cr]
[fixture: wardley/hidden-yaml-crlf] [fixture: wardley/lex-hidden-two-suffixes]
[fixture: wardley/lex-hidden-yaml-common-directive]
[fixture: wardley/comment-line-in-string] [fixture: wardley/prefix-secondscan]

EOL を調べる前に hidden form の後の LF を消費する。
文間の唯一の LF を消費してしまえば不足し、余分な可視 LF、
閉じの後の space と LF、または EOF なら終わりを満たせる。
見出し後の hidden form には可視 EOL は要らない。
一方 pipeline の開始は hidden の終わりの消費後にも可視 LF が必要で、
各子にも固有の EOL が要る。
可視 EOL の後の hidden form は前の suffix ではなく body に属する。
[fixture: wardley/hidden-directive-sole-lf]
[fixture: wardley/hidden-directive-spare-lf]
[fixture: wardley/hidden-directive-closing-space]
[fixture: wardley/hidden-directive-eof] [fixture: wardley/hidden-yaml-sole-lf]
[fixture: wardley/hidden-yaml-spare-lf] [fixture: wardley/hidden-yaml-eof]
[fixture: wardley/lex-hidden-header-no-eol]
[fixture: wardley/hidden-pipeline-open-gap]
[fixture: wardley/lex-hidden-pipeline-open-spare]
[fixture: wardley/hidden-pipeline-eol]
[fixture: wardley/lex-hidden-pipeline-child-spare]
[fixture: wardley/lex-hidden-pipeline-before-close]
[fixture: wardley/lex-hidden-after-visible-eol]
[fixture: wardley/lex-hidden-common-prefix-eol]

### 作者の部品にある共通の境界

global directive と共有の行規則が実際に選んだ semicolon は、
作者の完全な部品の間に置ける。
座標 pair の部品は bracket、数、comma、数、bracket。
offset の符号と整数は別で、strategy と括弧つき inertia は parenthesis、固定語、
parenthesis。
stage の名前、@、boundary、slash、second name の間にも別の境界がある。
共通メタデータは完全な語と colon/brace/title separator を分ける。
[fixture: wardley/directive-coordinate-parts]
[fixture: wardley/directive-offset-sign]
[fixture: wardley/directive-strategy-parts]
[fixture: wardley/directive-parenthesized-inertia-parts]
[fixture: wardley/lex-selected-parenthesized-inertia-parts]
[fixture: wardley/lex-hidden-evolution-members]
[fixture: wardley/directive-common-colon]
[fixture: wardley/lex-selected-coordinate-parts]
[fixture: wardley/lex-selected-offset-sign]
[fixture: wardley/lex-selected-strategy-parts]

label 付き flow の作者の部品は +、引用した label 全体、終わりの marker。
global trivia はそれらの間と label のテキストの中に置ける。
dependency arrow、port 全体、<> marker は不可分の glyph。
固定 keyword、strategy の語、integer、decimal、id-name も不可分。
spaced-name は text の単位なので共有の除去を含められる。
atom の内部の分割は後述の二つの atomic な差異として拒否する。
[fixture: wardley/directive-flow-before-label]
[fixture: wardley/directive-flow-after-label]
[fixture: wardley/directive-every-field]
[fixture: wardley/directive-name-inside] [fixture: wardley/directive-id-inside]
[fixture: wardley/directive-strategy-inside]
[fixture: wardley/directive-arrow-inside]
[fixture: wardley/directive-port-inside]
[fixture: wardley/directive-flow-marker-inside]
[fixture: wardley/lex-selected-flow-after-label]
[fixture: wardley/lex-selected-flow-label-inside]
[fixture: wardley/lex-selected-flow-marker-inside]
[fixture: wardley/lex-selected-arrow-inside]
[fixture: wardley/lex-selected-target-id-inside]
[fixture: wardley/lex-selected-port-inside]
[fixture: wardley/lex-selected-label-keyword]
[fixture: wardley/lex-selected-strategy-inside]
[fixture: wardley/lex-selected-decimal-inside]
[fixture: wardley/common-keyword-directive]

この許可により複合 flow やメタデータの単位の内部へ普通の空白や native hidden
の隙間を加えず、native の別々の数や名前を接合しない。
条件を満たす style/hash の文字より前の semicolon は選ばれないこともあり、
その semicolon は許された値の外では拒否する。
検出は選択 semicolon の除去より先なので、
分かれた見出しは atomic な規則の前に検出で失敗し得る。
[fixture: wardley/lex-link-native-flow-components]
[fixture: wardley/lex-native-common-keyword-colon]
[fixture: wardley/lex-native-inside-number]
[fixture: wardley/lex-native-between-name-chunks]
[fixture: wardley/lex-selected-keyword-inside]
[fixture: wardley/lex-selected-flow-parts]
[fixture: wardley/lex-selected-header-before-detection]

## 文法

```text
diagram = newline* "wardley-beta" (newline | common-statement eol | statement)* end-of-text
statement = (anchor | component | link | evolve | pipeline | note
           | annotations | annotation | accelerator | deaccelerator
           | evolution-statement | size) eol
name = string | id-name | spaced-name
coordinates = "[" decimal "," decimal "]"
annotation-coordinates = "[" coordinate-value "," coordinate-value "]"
coordinate-value = decimal | integer
anchor = "anchor" name coordinates
component = "component" name coordinates label-offset? source-strategy? inertia-decoration?
label-offset = "label" "[" "-"? integer "," "-"? integer "]"
source-strategy = "(" strategy ")"
inertia-decoration = "inertia" | "(" "inertia" ")"
link = name port? (dependency-arrow | link-arrow)? name port? link-label?
evolve = "evolve" name decimal
pipeline = "pipeline" name "{" newline+ pipeline-component+ "}"
pipeline-component = "component" name "[" decimal "]" label-offset? eol
note = "note" string coordinates
annotations = "annotations" annotation-coordinates
annotation = "annotation" integer "," annotation-coordinates string
accelerator = "accelerator" name coordinates
deaccelerator = "deaccelerator" name coordinates
evolution-statement = "evolution" stage (dependency-arrow stage)+
stage = name ("@" decimal)? ("/" name)?
size = "size" "[" integer "," integer "]"
common-statement = title-line | acc-title-line | acc-descr-line | acc-descr-block
eol = newline+ | end-of-text
```

[共通の表記](../common.ja.md#表記)と上の字句規則を使う。
native hidden form は定められた所有欄に入り、可視 EOL を供給しない。
body は空でもよい。
通常の文と共通文はそれぞれ EOL が必要で、見出しだけは不要。
文の部品間に、記していない可視 newline は許さない。
[fixture: wardley/header-only] [fixture: wardley/header-inline]
[fixture: wardley/tail-all-spaces] [fixture: wardley/gram-component-empty-gap]
[fixture: wardley/gram-component-comment-gap]
[fixture: wardley/gram-component-directive-gap]
[fixture: wardley/common-empty-block-same-line]
[fixture: wardley/common-title-empty-gap]
[fixture: wardley/common-acctitle-empty-gap]
[fixture: wardley/common-description-empty-gap]

| 規則                                 | 木の node                                                        |
| ------------------------------------ | ---------------------------------------------------------------- |
| diagram                              | WardleyDiagram                                                   |
| anchor                               | WardleyAnchorStatement                                           |
| component                            | WardleyComponentStatement                                        |
| link                                 | WardleyLinkStatement                                             |
| evolve                               | WardleyEvolveStatement                                           |
| pipeline                             | WardleyPipelineStatement                                         |
| pipeline-component                   | WardleyPipelineComponent                                         |
| note                                 | WardleyNoteStatement                                             |
| annotations                          | WardleyAnnotationsStatement                                      |
| annotation                           | WardleyAnnotationStatement                                       |
| accelerator                          | WardleyAcceleratorStatement                                      |
| deaccelerator                        | WardleyDeacceleratorStatement                                    |
| evolution-statement / stage          | WardleyEvolutionStatement / WardleyEvolutionStage                |
| size                                 | WardleySizeStatement                                             |
| coordinates / annotation-coordinates | WardleyCoordinates                                               |
| label-offset                         | WardleyLabelOffsetDecoration                                     |
| source-strategy                      | WardleySourceStrategyDecoration                                  |
| bare / parenthesized inertia         | WardleyInertiaDecoration / WardleyParenthesizedInertiaDecoration |
| dependency-arrow / link-arrow        | WardleyArrow                                                     |
| title-line / acc-title-line          | WardleyTitleStatement / WardleyAccTitleStatement                 |
| acc-descr-line / acc-descr-block     | WardleyAccDescrStatement / WardleyAccDescrBlockStatement         |

表の文と値の形を次の fixture が示します。 [fixture: wardley/db-all-fields]
[fixture: wardley/db-inertia-forms] [fixture: wardley/db-link-forms]
[fixture: wardley/common-repeat]

component はこの順で label offset、source strategy、
inertia の装飾を高々一つずつ持つ。
inertia は裸または括弧つき。
anchor に装飾はない。
class の代入構文はなく、class はこれらの文の原文の欄ではない。
未知・反復・逆順の装飾と data block の構文は拒否する。
[fixture: wardley/db-inertia-forms] [fixture: wardley/gram-label-order]
[fixture: wardley/gram-decorator-order]
[fixture: wardley/gram-component-class-unsupported]
[fixture: wardley/gram-anchor-decoration-rejected]
[fixture: wardley/gram-component-inertia-duplicate]
[fixture: wardley/gram-component-strategy-duplicate]
[fixture: wardley/gram-data-block] [fixture: wardley/strategy-upper]

pipeline の body は一つ以上の pipeline component を持ち、
入れ子の pipeline 文や共通メタデータは持たない。
そのため、空の説明 block も本文の独立行と開き brace と同じ行の両方で拒否する。
開き brace の後は可視 newline が必要。
子 component は evolution の一値と任意の label offset だけを持ち、
閉じ brace の前に EOL が必要。
空・inline・閉じない body は拒否する。
許された newline 列に空行や comment 行を置ける。
global directive だけの行は、Wardley の文法が body を読む前に、
共通の前処理が directive を除くため許される。
開き brace の直後や子と子の間の U+2028 は拒否する。
U+2028 は可視 LF にも native padding にもならない。
[fixture: wardley/directive-pipeline-line]
[fixture: wardley/gram-pipeline-empty-description]
[fixture: wardley/gram-pipeline-open-empty-description]
[fixture: wardley/lex-pipeline-open-ls]
[fixture: wardley/lex-pipeline-between-children-ls]
[fixture: wardley/gram-empty-pipeline] [fixture: wardley/gram-pipeline-inline]
[fixture: wardley/gram-pipeline-open]
[fixture: wardley/gram-pipeline-nondeclaration-lines]
[fixture: wardley/gram-pipeline-nested-body]
[fixture: wardley/gram-pipeline-child-strategy-rejected]
[fixture: wardley/gram-pipeline-blank-child-gap]
[fixture: wardley/gram-pipeline-blank-before-first]
[fixture: wardley/spec-wardley-parser-2c2c9064]

link は両 port の一方または両方と、任意の arrow を許す。
引用名二つは arrow なしの link になれるが、
bare word 二つは貪欲な一つの名前となって target がなくなることがある。
未解決の端点、重複、自己 link を許す。
evolve は node が見つからなくても名前と decimal target を書く。
note と annotation は空も含め string が必要。 [fixture: wardley/db-bare-link]
[fixture: wardley/lex-link-target-port-no-arrow]
[fixture: wardley/lex-link-no-arrow-bare-greedy]
[fixture: wardley/db-link-unresolved-duplicates]
[fixture: wardley/db-trend-missing] [fixture: wardley/db-empty-texts]

evolution は -> で区切る二つ以上の stage を持ち、
任意の boundary は任意の second name より先。
引用した空の stage 名、stage の反復、
部分的な boundary も書かれた構文として残す。
末尾の stage separator や余分な座標/size の comma は許さない。
ドキュメントの trend indicator の綴りは追加の文法規則ではない。
[fixture: wardley/gram-evolution-single]
[fixture: wardley/db-stage-empty-second-name]
[fixture: wardley/db-stages-boundaries]
[fixture: wardley/gram-stage-trailing-arrow]
[fixture: wardley/gram-coordinate-trailing-comma]
[fixture: wardley/gram-size-trailing-comma]
[fixture: wardley/gram-trend-indicator-unsupported]
[fixture: wardley/db-all-fields]

### 意味による受理条件

public の [parse][parse] は、
回復した model の error と読めない末尾の単位も含め、
lexer/parser の error があれば拒否する。
完全に parse した後、[wardleyParser.ts][adapter] が次の条件を適用する。
別の validation 段階はない。
登録する全 node に座標を与えるため、このテキスト経路で、
[WardleyBuilder.build][builder-build] の座標存在検査 が、
追加の到達可能な拒否を作ることはない。 [fixture: wardley/error-start]
[fixture: wardley/error-after-prefix] [fixture: wardley/error-recovered]
[fixture: wardley/db-all-fields]

比較名は、名前の原文の共通の変換形に、
string の quote 除去と上記の escape の解釈を当てたもの。
escape の解釈より先に、改行変換、HTML 属性の quote、
entity の placeholder を当てる。
内部空白、大文字小文字、Unicode の綴りは変えず、trim、縮約、Unicode 正規化、
entity placeholder の最終 decode はしない。
security level が変わっても Wardley の名前に共通のテキストの sanitize
を施さない。 [fixture: wardley/gram-reference-decoded-escape]
[fixture: wardley/gram-reference-same-whitespace]
[fixture: wardley/gram-reference-html-converted]
[fixture: wardley/gram-reference-entity-converted]
[fixture: wardley/gram-reference-security-noeffect]
[fixture: wardley/gram-reference-html-before-escape]
[fixture: wardley/gram-reference-html-escape-mismatch]
[fixture: wardley/entity-texts] [fixture: wardley/line-string-values]
[fixture: wardley/space-name-values]

検査する各座標は先に double の値を読む。
1 以下なら 100 倍し、それ以外はそのままにする。
その結果が 0 未満または 100 より大きければ拒否する。
数学的な十進値ではなく丸めた double を比較し、
1 や 100 をわずかに超える綴りも境界へ丸まることがある。
文法は負の座標や NaN を供給せず、正の無限大への overflow はこの検査で拒否する。
[fixture: wardley/db-coordinate-boundary]
[fixture: wardley/db-coordinate-double-one]
[fixture: wardley/db-coordinate-double-hundred]
[fixture: wardley/lex-coordinate-above-boundary]
[fixture: wardley/number-coordinate-overflow]
[fixture: wardley/number-negative-zero] [fixture: wardley/number-nan]

後の宣言が名前を置き換える場合も、anchor、top-level component、note、
annotation、accelerator、 deaccelerator の全出現の両座標を検査する。
pipeline の各子の evolution も検査する。
source の欄名が x/y である annotation/force の構文も含め、
二値の位置の記述順は visibility、evolution。
size の寸法と stage の boundary に追加の範囲・順・個数・有限値の制約はない。
[fixture: wardley/gram-invalid-anchor]
[fixture: wardley/gram-replaced-invalid-node]
[fixture: wardley/gram-replaced-invalid-node-last]
[fixture: wardley/gram-invalid-note] [fixture: wardley/gram-invalid-annotation]
[fixture: wardley/gram-invalid-accelerator]
[fixture: wardley/gram-invalid-deaccelerator]
[fixture: wardley/gram-invalid-pipeline-child]
[fixture: wardley/gram-pipeline-invalid-replaced]
[fixture: wardley/db-all-fields] [fixture: wardley/db-stages-boundaries]
[fixture: wardley/db-number-overflow] [fixture: wardley/gram-size-zero]

存在の状態は、source order の全 anchor、source order の全 top-level component、
source order の pipeline の順に定める。
宣言は比較名をキーとして登録し、置換しても最初の登録位置は変えない。
pipeline を処理するとき、
親は数の座標を持つ ID 完全一致の登録として既に存在しなければならない。
source 上で後の top-level 宣言は既に利用でき、
anchor や先に処理した pipeline の子も親になれる。
label だけの一致や後の pipeline が作る子は該当しない。
[fixture: wardley/db-publication-order]
[fixture: wardley/db-pipeline-forward-parent]
[fixture: wardley/db-pipeline-anchor-parent]
[fixture: wardley/db-pipeline-nested-parent]
[fixture: wardley/gram-missing-pipeline-parent]
[fixture: wardley/gram-pipeline-plain-name-ref]
[fixture: wardley/gram-pipeline-child-parent-before]

pipeline の各子について、後の存在検査の ID は親の比較名、underscore、
子の比較名をこの順で連ねたもの。
親のその時の visibility とともに登録する。
置換と、書いた ID/synthetic ID の衝突を適用し、
pipeline の再定義で先の子の登録を消さない。
この状態は後の親と evolve の検査に必要で、原文の木は変えない。
[fixture: wardley/db-pipeline-collision]
[fixture: wardley/db-pipeline-duplicates]
[fixture: wardley/db-pipeline-label-inheritance]
[fixture: wardley/db-pipeline-nested-parent]
[fixture: wardley/db-empty-pipeline-names]

全 node の登録後、各 evolve の比較名が登録 ID に完全一致する場合だけ、
その target を検査する。
ID がなければ 100 を超える target も範囲を検査せず受理し、
pipeline の子の label だけの一致も存在しない場合に当たる。
そのため source で前の evolve が、
後の top-level 宣言に対して失敗することもある。
別の evolve に置き換わっても、存在する target の検査を飛ばさない。
[fixture: wardley/db-trend-missing]
[fixture: wardley/gram-evolve-missing-label-invalid]
[fixture: wardley/gram-evolve-exact-child-invalid]
[fixture: wardley/gram-evolve-forward-invalid]
[fixture: wardley/gram-invalid-evolve] [fixture: wardley/db-trend-duplicates]
[fixture: wardley/gram-evolve-replaced-invalid]

座標 pair を検査する annotations box は最初だけ。
後の box は文法を満たす必要があるが座標範囲を検査せず、
後の有効な box は最初の不正な box を救わない。
空名、prototype のような名前、宣言の重複、未解決 link、
後で置換される文や公開されない文による他の拒否はない。
[fixture: wardley/db-later-invalid-box]
[fixture: wardley/gram-box-first-invalid] [fixture: wardley/db-empty-texts]
[fixture: wardley/db-prototype-names] [fixture: wardley/db-node-duplicates]
[fixture: wardley/db-link-unresolved-duplicates]
[fixture: wardley/db-singletons-last]

名前を ID 完全一致、次に node の初回登録順の最初の現在の label の一致、
なければ未解決の比較名の順で解決するのは link だけ。
この fallback は受理を決めず、pipeline の親や evolve には適用しない。
木には各参照の原綴を残す。 [fixture: wardley/db-link-resolution]
[fixture: wardley/db-link-exact-id]
[fixture: wardley/db-link-unresolved-duplicates]
[fixture: wardley/gram-pipeline-plain-name-ref]
[fixture: wardley/gram-evolve-missing-label-invalid]

### 全出現の保持と設定

空・置換・未公開の形も含め、size、evolution、共通メタデータ、annotations box、
node 宣言、pipeline、link、evolve の全出現を木に保つ。
選択、nullish merge、順序、省略される値は tests の要約が定め、
構文の削除や差異の追加の根拠にはしない。
特に、一方が優先されても両 label と両 port を保つ。
[fixture: wardley/db-singletons-last] [fixture: wardley/common-repeat-empty]
[fixture: wardley/frontmatter-empty-body-title]
[fixture: wardley/db-node-duplicates] [fixture: wardley/db-pipeline-duplicates]
[fixture: wardley/db-trend-missing] [fixture: wardley/db-later-invalid-box]
[fixture: wardley/db-link-forms] [fixture: wardley/lex-flow-port-wins]

Wardley 固有の意味による受理の設定はない。
adapter と builder は wardley/wardley-beta の設定を読まず、
[wardleyDb.ts][db] と [wardleyRenderer.ts][renderer-config]
が公開・使用するのは描画設定。
テキストの描画設定は不正な座標を救わない。
共通の設定処理で失敗する数値の wardley.fontFamily を含め、
不正な embedded data は embedded-data-opaque とする。
設定による escape は共通メタデータと Wardley の名前で異なる場合があり、
tests の要約が記録する。 [fixture: wardley/config-frontmatter-drawing]
[fixture: wardley/config-init-drawing]
[fixture: wardley/config-frontmatter-cannot-rescue]
[fixture: wardley/config-init-cannot-rescue]
[fixture: wardley/config-frontmatter-fontfamily-number]
[fixture: wardley/config-init-fontfamily-number]
[fixture: wardley/config-frontmatter-beta-fontfamily-number]
[fixture: wardley/config-init-beta-fontfamily-number]
[fixture: wardley/config-security-level-other]
[fixture: wardley/gram-reference-security-noeffect]

### Db の正規化

正規化する値とその導出は、
[db-summaries.md](../../../tests/docs/db-summaries.ja.md#wardley) と、
tests の [Db-from-tree の契約](../../../tests/docs/db-from-tree.ja.md)
が定める。
座標の正規化、label、class 名、選択、置換はそちらの担当で、
この仕様の木は原文の全出現と値を保つ。 [fixture: wardley/db-all-fields]
[fixture: wardley/db-node-duplicates] [fixture: wardley/db-singletons-last]
[fixture: wardley/db-link-forms]

## 既知の差異

**[directive-as-token-boundary](../known-divergences/directive-as-token-boundary.ja.md)。**
global directive は固定語、id-name、数、
不可分な arrow/port/marker を分割できない。
共有記録に原文は残せるが、atom の内部に作者の隙間はない。
完全な部品の境界、spaced-name のテキスト、string、 hidden の句読点は読めるまま。
[fixture: wardley/directive-keyword-middle] [fixture: wardley/directive-number]
[fixture: wardley/directive-header-inside]
[fixture: wardley/directive-id-inside]
[fixture: wardley/directive-strategy-inside]
[fixture: wardley/directive-arrow-inside]
[fixture: wardley/directive-port-inside]
[fixture: wardley/directive-flow-marker-inside]
[fixture: wardley/common-keyword-directive]
[fixture: wardley/directive-coordinate-parts]
[fixture: wardley/directive-flow-before-label]
[fixture: wardley/directive-flow-after-label]
[fixture: wardley/directive-native-opener-split]

**[ignored-semicolon-as-token-boundary](../known-divergences/ignored-semicolon-as-token-boundary.ja.md)。**
同じ atomic な規則を、共通の行規則が実際に選んだ semicolon だけに適用する。
完全な部品の間や text/string/hidden の内部で選んだ文字は trivia となり、
任意の semicolon が separator になるわけではない。
[fixture: wardley/lex-selected-decimal-inside]
[fixture: wardley/lex-selected-label-keyword]
[fixture: wardley/lex-selected-strategy-inside]
[fixture: wardley/lex-selected-port-inside]
[fixture: wardley/lex-selected-flow-marker-inside]
[fixture: wardley/lex-selected-arrow-inside]
[fixture: wardley/lex-selected-target-id-inside]
[fixture: wardley/lex-selected-coordinate-parts]
[fixture: wardley/lex-selected-strategy-parts]
[fixture: wardley/lex-selected-flow-after-label]
[fixture: wardley/lex-selected-native-yaml-opener]
[fixture: wardley/lex-selected-keyword-inside]

**[html-tag-in-frontmatter](../known-divergences/html-tag-in-frontmatter.ja.md)。**
HTML の quote の探索は本物の frontmatter の後から始める。
両 block の原文は保てるが、
不透明な YAML の未完の tag に body の string の境界や値を支配させない。
Mermaid が受理し仕様が拒否する場合、逆の場合、両方受理し共通値が違う場合がある。
[fixture: wardley/div-html-frontmatter-accept]
[fixture: wardley/div-html-frontmatter-reject]
[fixture: wardley/div-html-frontmatter-value]
[fixture: wardley/html-body-double-control]
[fixture: wardley/html-body-single-control]

**[embedded-data-opaque](../known-divergences/embedded-data-opaque.ja.md)。**
認識した frontmatter と global directive の本文は、
YAML/設定として解析しない不透明な共有記録。
共通の embedded data の失敗で Wardley の構文を拒否せず、
共有規則に従い比較用の title と他の有効な設定を保つ。
native に残る YAML は別の ignored node。
[fixture: wardley/div-frontmatter-invalid]
[fixture: wardley/config-frontmatter-fontfamily-number]
[fixture: wardley/config-init-fontfamily-number]
[fixture: wardley/config-fontfamily-keeps-title]
[fixture: wardley/div-invalid-keeps-config]
[fixture: wardley/detect-block-after-directive]

**[bare-percent-line-before-header](../known-divergences/bare-percent-line-before-header.ja.md)。**
検出が通した裸の percent 行は共有 Comment、伴って通した空白は trivia。
残存形には名前つきの所有欄と native の境界が必要。
Mermaid が通した Unicode 空白を native lexer で再読する場合が拒否の差異となり、
通した行のない native gap は差異のない対照。 [fixture: wardley/bare-before-ls]
[fixture: wardley/bare-line-ps] [fixture: wardley/prefix-yaml-bare-unicode]
[fixture: wardley/detect-retained-secondscan-bare-ls]
[fixture: wardley/detect-retained-secondscan-bare-ascii]
[fixture: wardley/prefix-yaml-unicode-no-bare]

**[c4-keyword-anywhere](../known-divergences/c4-keyword-anywhere.ja.md)。**
後の名前や値に C4 の検出語があっても Wardley の見出しで Wardley を選ぶ。
文字は Wardley の node に持てるが、
Mermaid に置き換えられた C4 の図種を同時には持てない。
検出前に除いた通常の LF 終端の comment は差異のないまま。
[fixture: wardley/c4-component-component]
[fixture: wardley/c4-dynamic-flow-label] [fixture: wardley/c4-container-title]
[fixture: wardley/c4-component-header-eof]
[fixture: wardley/c4-component-header-lf]

whole hidden form、空の string/description block、置換される文、missing evolve、
余分な annotations box は node に持てるため、追加の差異にしない。
原文の arrow/label の綴りで不審な導出 flow/line を説明でき、
拒否の理由にはしない。 [fixture: wardley/db-empty-texts]
[fixture: wardley/common-empty-interleaved]
[fixture: wardley/db-singletons-last] [fixture: wardley/db-trend-missing]
[fixture: wardley/db-later-invalid-box]
[fixture: wardley/lex-flow-label-changes-direction]
[fixture: wardley/lex-flow-label-changes-bidirectional]
[fixture: wardley/lex-flow-label-changes-dashed]
[fixture: wardley/lex-flow-label-changes-dashed-short]

[grammar]: https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/wardley/wardley.langium#L1-L154
[common]: https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/common/common.langium#L1-L34
[module]: https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/wardley/module.ts#L39-L77
[wardley-converter]: https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/wardley/valueConverter.ts#L5-L19
[converter]: https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/common/valueConverter.ts#L27-L69
[parse]: https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/parse.ts#L133-L149
[adapter]: https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/wardley/wardleyParser.ts#L8-L245
[db]: https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/wardley/wardleyDb.ts#L17-L21
[terminals]: https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/wardley/wardley.langium#L106-L154
[detector]: https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/wardley/wardleyDetector.ts#L7-L11
[populate-common]: https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/common/populateCommonDb.ts#L4-L13
[builder-build]: https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/wardley/wardleyBuilder.ts#L187-L207
[renderer-config]: https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/wardley/wardleyRenderer.ts#L31-L64
[order]: https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagram-api/diagram-orchestration.ts#L84-L126
