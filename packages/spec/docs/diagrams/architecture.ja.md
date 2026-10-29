# Architecture

英語版: [architecture.md](./architecture.md)

この文書は `architecture-beta` を定義する。
[木](../ast/architecture.md)は書かれた構文を保ち、
[tests の要約](../../../tests/docs/db-summaries.md#architecture)が Db
の導出値を定める。
構文の根拠は [architecture.langium][grammar]、 [arch.langium][arch]、
[common.langium][common] である。 [fixture: architecture/header-beta]
[fixture: architecture/db-mixed]

## 検出

[detection.md](../detection.md) の 5 番、
[architecture の detector][detector] は、
後続の境界を要求せず小文字の接頭辞 `architecture` を選ぶ。
受理する見出しは `architecture-beta` だけである。
裸の `architecture`、大文字、見出しの反復、
文字・数字・underscore・dash・Unicode の接尾辞は拒否する。
[diagram-orchestration.ts][order] では C4 より先に登録されるため、
本文の C4 の語によって C4 へ切り替わらない。 [fixture: architecture/header-beta]
[fixture: architecture/header-bare-rejected]
[fixture: architecture/header-uppercase] [fixture: architecture/header-repeated]
[fixture: architecture/header-letter-suffix]
[fixture: architecture/header-digit-suffix]
[fixture: architecture/header-underscore-suffix]
[fixture: architecture/header-dash-suffix]
[fixture: architecture/header-unicode-suffix]
[fixture: architecture/c4-component-service]
[fixture: architecture/c4-header-lf-comment]

実際の先頭 frontmatter、directive、comment region、先頭の空白、改行の変換、
HTML 属性の引用符、entity、
選ばれた semicolon には
[共通の前処理](../common.md#reading-a-source)を適用する。
本物の frontmatter は共有 Frontmatter であり、architecture の文ではない。
図のテキストに残る YAML の形とは区別する。
[fixture: architecture/frontmatter-title]
[fixture: architecture/frontmatter-config]
[fixture: architecture/space-bom-leading] [fixture: architecture/line-crlf]
[fixture: architecture/html-all-fields]
[fixture: architecture/common-quotes-entities]
[fixture: architecture/style-fields]

検出点では、
共通の [Frontmatter の形](../common.md#frontmatter)を満たす残存ブロックを高々 1
個、裸の percent 対の行と 2 回目の directive scan より先に通す。
ブロックは図のテキストに残り、native YAML の規則を満たす必要がある。
textBeforeHeader の ArchitectureIgnoredText が所有し、properties は適用しない。
本物の frontmatter が先行し、2 回目の scan の directive が後続してもよい。
2 個目の残存ブロック、通した裸の行の後、
2 回目の scan の directive の後のブロックは通さない。
[fixture: architecture/detection-after-frontmatter]
[fixture: architecture/detect-retained-before-second-scan]
[fixture: architecture/detect-retained-after-second-scan]
[fixture: architecture/detect-retained-two-blocks]
[fixture: architecture/retained-prefix-between-bare]

本文行のない隣接 fence、閉じの欠落、字下げの不一致、開始の 4 本 dash、
閉じの接尾辞、後続改行のない閉じは検出の skip を止める。
隣接する 3 本の fence は本文行を持ち得る。
先頭の trim が開始側の字下げだけを除く場合もある。
先頭の BOM の trivia は検出点より前に除かれ得る。
検出を通っても、 native の開始・終了の空白規則は緩めない。
[fixture: architecture/detect-retained-adjacent-fences]
[fixture: architecture/detect-retained-unclosed]
[fixture: architecture/detect-retained-indent-both]
[fixture: architecture/detect-retained-indent-opening]
[fixture: architecture/detect-retained-four-dashes]
[fixture: architecture/detect-retained-closing-suffix]
[fixture: architecture/detect-retained-closer-no-lf]
[fixture: architecture/detect-retained-closer-at-eof]
[fixture: architecture/detect-retained-three-fences]
[fixture: architecture/detect-retained-leading-bom]
[fixture: architecture/detect-retained-opener-nbsp]
[fixture: architecture/detect-retained-closer-u3000]

図は到達した見出しからだけでなく、検出点から残存する形を読む。
2 回目の scan だけで見つかる directive は、
textBeforeHeader の native hidden DIRECTIVE とし、固有の閉じの境界を要求する。
見出しが接着していれば拒否する。
複数の残存形は別々に保つ。
通した裸の行は、空 brace と未閉鎖の非 directive の percent-brace も含め、
mark が `%%` の共有 Comment とする。
付随する空白・改行は、残存する形の間でも trivia とし、読み直さない。
[fixture: architecture/detect-retained-before-second-scan]
[fixture: architecture/detect-second-scan-glued]
[fixture: architecture/detect-two-second-scan-forms]
[fixture: architecture/detect-empty-braces-bare]
[fixture: architecture/detect-unclosed-brace-bare]
[fixture: architecture/detect-retained-bare-second-scan]
[fixture: architecture/retained-directive-between-bare]

裸の行とともに通した共通の空白は、見出し直前、空白だけの行、
残存する形の間でも trivia とする。
native Mermaid がその Unicode 空白を拒否する入力は
[bare-percent-line-before-header](../known-divergences/bare-percent-line-before-header.md)
である。
通した行がなければ同じ隙間は native の図のテキストであり、拒否され得る。
[fixture: architecture/detection-bare-space]
[fixture: architecture/detection-bare-tab]
[fixture: architecture/detection-bare-before-header-ls]
[fixture: architecture/detection-bare-ls]
[fixture: architecture/div-retained-bare-ls]
[fixture: architecture/div-retained-bare-second-scan-ls]
[fixture: architecture/retained-yaml-no-bare]
[fixture: architecture/retained-directive-no-bare]
[fixture: architecture/detect-retained-bare-ascii]

## 字句構造

### 優先順

上で通過した区間を除き、検出点から変換後の図のテキストを読む。
各位置で次の最初に適用できる規則を採り、直後から再開する。
一般の最長一致ではない。
語の keyword は長い ID、両 dash の規則は長い hidden YAML を明示的な代替とする。
読めない文字は入力全体を拒否する。
有効な順序の根拠は [module.ts][module]、 [tokenBuilder.ts][builder]、
import した文法である。 [fixture: architecture/db-mixed]
[fixture: architecture/hidden-yaml-after-header]
[fixture: architecture/error-after-prefix]
[fixture: architecture/error-recovered-statement]
[fixture: architecture/lex-keyword-prefix-ids]

| 順   | 単位                             | 読み                                                                          |
| ---- | -------------------------------- | ----------------------------------------------------------------------------- |
| 1–11 | Keywords                         | architecture-beta、junction、service、column、group、align、row、--、in、:、- |
| 12   | port-direction                   | L、R、T、B                                                                    |
| 13   | group-modifier                   | {group}                                                                       |
| 14   | arrow-marker                     | < または >                                                                    |
| 15   | acc-descr-line / acc-descr-block | 共通の複合形                                                                  |
| 16   | acc-title-line                   | 共通の複合形                                                                  |
| 17   | title-line                       | 共通の複合形                                                                  |
| 18   | string                           | 引用した文字 icon                                                             |
| 19   | id                               | 裸の名前                                                                      |
| 20   | newline                          | LF                                                                            |
| 21   | ASCII padding                    | hidden な space/tab                                                           |
| 22   | hidden-yaml                      | fence の全体                                                                  |
| 23   | hidden-directive                 | percent-brace の全体                                                          |
| 24   | native-comment                   | percent 対から行末                                                            |
| 25   | icon                             | 括弧つき icon 名                                                              |
| 26   | label                            | 角括弧つき title                                                              |

単位の間で飛ばすのは ASCII space と tab だけで、newline は可視である。
共通の CR/CRLF 変換を先に適用する。
NBSP、BOM、U+2028、U+2029 などは一般の単位区切りではないが、先頭の共通 trivia、
検出で通した trivia、値の内部では許され得る。
import した boolean と数の terminal は単位を供給しない。
数に見える ID とラベルもテキストである。 [fixture: architecture/space-tabs]
[fixture: architecture/space-body-nbsp] [fixture: architecture/space-bom-body]
[fixture: architecture/space-final-unicode]
[fixture: architecture/space-unicode-values] [fixture: architecture/line-cr]
[fixture: architecture/line-crlf] [fixture: architecture/line-ls-between]
[fixture: architecture/line-ps-eof] [fixture: architecture/lex-numeric-ids-text]
[fixture: architecture/lex-id-common-names]

### 名前・keyword の境界・方向

ID は ASCII の英字・数字・underscore で始まり、それらまたは dash が続き、
末尾は dash 以外とする。
この形の許す限り長く読むが、先行する keyword と共通の形の優先は維持する。
serviceX、columnar のような長い名前は ID だが、正確な keyword は ID ではない。
port-direction は語の境界なしで名前の先頭の L/R/T/B を取るため、
そのような ID は拒否する。
title-line の空の接尾辞は titleX の title も取る。
必要な colon や brace のない accTitle と accDescr は ID になれる。
[fixture: architecture/lex-id-numeric] [fixture: architecture/lex-id-final-dash]
[fixture: architecture/lex-id-unicode]
[fixture: architecture/lex-keyword-prefix-ids]
[fixture: architecture/lex-direction-id-exact]
[fixture: architecture/lex-direction-id-prefix]
[fixture: architecture/lex-keyword-terminal-priority]
[fixture: architecture/lex-id-common-prefix]
[fixture: architecture/lex-id-common-names]
[fixture: architecture/spec-architecture-c5579915]

keyword は長い ID の代替以外に、whitespace/percent 対の境界を要求しない。
完全な hidden YAML は見出しに接着できるが、
長い ID になる接尾辞は見出しの一致を妨げる。
global directive と選ばれた semicolon を除いた後で判断する。
除いた directive 自体は境界を供給せず、
境界があっても非 ASCII 空白を有効な隙間に変えない。
[fixture: architecture/hidden-yaml-after-header]
[fixture: architecture/header-glued-service]
[fixture: architecture/directive-keyword-rejoin]
[fixture: architecture/header-comment] [fixture: architecture/space-body-3000]

port の方向は L、R、T、B のいずれかである。
group modifier は内部の padding のない正確な {group} とし、空 brace は含めない。
arrow のどちらの端も、独立して < と > のどちらを許す。
木は `>--<` も含め、実際の綴りを保つ。
[fixture: architecture/error-direction-lowercase]
[fixture: architecture/lex-edge-empty-braces]
[fixture: architecture/db-directions]
[fixture: architecture/gram-edge-reversed-labeled-markers]

### icon・文字列・角括弧ラベル

icon は開始 parenthesis、ASCII 英数字・underscore・dash・colon の空でない名前、
終了 parenthesis とする。
名前に ID の先頭・末尾制約は当てず、`(-:A_)` と `(:-)` も許す。
空の括弧、空白、括弧内部の引用したテキストは拒否する。
未知の icon 名も受理する。 [fixture: architecture/lex-icon-leading-symbols]
[fixture: architecture/lex-icon-empty] [fixture: architecture/lex-icon-spaces]
[fixture: architecture/lex-icon-text-parenthesized]
[fixture: architecture/db-unknown-icon]

string は single quote または double quote で囲み、同じ quote で閉じる。
空でもよい。
内部では、その quote と backslash 以外の任意の文字を読み、 LF、U+2028、
U+2029 も含む。
backslash は代わりに次の文字を取り、その文字は LF、CR、U+2028、
U+2029 以外でなければならない。
未閉鎖 string の形はない。
service は括弧なしの文字 icon として許すが、group は許さない。
木の値は STRING converter の結果ではなく escape の原綴を保つ。
[fixture: architecture/db-empty-values]
[fixture: architecture/lex-string-conversion]
[fixture: architecture/lex-string-number-escape]
[fixture: architecture/line-lf-string-title]
[fixture: architecture/line-ls-ps-values]
[fixture: architecture/lex-string-escaped-ls]
[fixture: architecture/lex-string-unclosed]
[fixture: architecture/lex-group-string-icon]

角括弧ラベルは開始 bracket の直後で、次を順に試す。
完全な double-quoted string と直後の終了 bracket、次に single quote の同じ形、
次に両 bracket・CR・LF 以外の 1 文字以上と終了 bracket である。
裸のテキストは可能な限り長く読む。
引用したテキストは bracket と通常の改行を含められる。
引用した選択肢には上記の string の escape の認識規則を当てる。
ラベル全体を完成する最初の選択肢が kind を決め、後の変換では決めない。
[fixture: architecture/lex-title-quoted-brackets]
[fixture: architecture/line-lf-string-title]
[fixture: architecture/lex-title-conversion]
[fixture: architecture/lex-title-cross-quote-escape]
[fixture: architecture/lex-title-padded-quotes]
[fixture: architecture/lex-title-padded-quoted-brackets]
[fixture: architecture/lex-title-single-quoted-brackets]

裸のテキストは quote、backslash、U+2028、U+2029 を含められ、
正しい引用 string でなくてもよい。
そのため `["open]`、`[A"B]`、`["A"B"]`、末尾の backslash も裸のラベルになれる。
`[ "x" ]` は裸、`["[x]"]` は引用した形、`[ "[x]" ]` は拒否する。
backslash と U+2028 の続きは引用した選択肢に失敗しても、裸の形で成功し得る。
空の [] は拒否し、空白だけと引用した空のラベルは受理する。
[fixture: architecture/lex-title-unclosed-quote-with-close]
[fixture: architecture/lex-title-bare-inner-quote]
[fixture: architecture/lex-title-unquoted-fallback]
[fixture: architecture/lex-title-unescaped-quote-fallback]
[fixture: architecture/lex-title-bare-trailing-backslash]
[fixture: architecture/lex-title-quoted-backslash-fallback]
[fixture: architecture/lex-title-padded-quotes]
[fixture: architecture/lex-title-quoted-brackets]
[fixture: architecture/lex-title-padded-quoted-brackets]
[fixture: architecture/lex-label-escaped-ls-fallback]
[fixture: architecture/line-ls-ps-values]
[fixture: architecture/lex-title-empty-unquoted]
[fixture: architecture/db-empty-values]
[fixture: architecture/db-title-quote-only-double]
[fixture: architecture/db-title-quote-only-single]
[fixture: architecture/db-title-quote-only-padded]
[fixture: architecture/db-edge-title-quote-only]
[fixture: architecture/db-title-bare-escaped-double-quote]
[fixture: architecture/db-title-bare-escaped-single-quote]

上の優先順では icon、label、modifier は複合形の全体として一致する。
書かれた構成要素は ( / icon-name / )、[ / label-content / ]、
{ / group / } とし、double dash は不可分な線の単位とする。
global directive は delimiter と名前の間も含め、完全な構成要素の間に置ける。
icon-name、id、固定 keyword、double dash の内部は切れない。
text/string の内容には global directive を置ける。
native hidden form と padding は icon と modifier の内部を切れず、
ラベルに囲まれた hidden に見えるテキストは内容に残る。
[fixture: architecture/directive-edge-components]
[fixture: architecture/directive-parent-align-components]
[fixture: architecture/directive-icon-delimiters]
[fixture: architecture/div-directive-icon-name]
[fixture: architecture/div-directive-name]
[fixture: architecture/directive-group-delimiters]
[fixture: architecture/div-directive-group-word]
[fixture: architecture/div-directive-line]
[fixture: architecture/directive-fields]
[fixture: architecture/gram-hidden-inside-icon]
[fixture: architecture/gram-hidden-inside-modifier]
[fixture: architecture/lex-icon-spaces]
[fixture: architecture/hidden-directive-inside-values]

ラベルの選択肢は、共通の変換後の図のテキストで決める。
kind は HTML 属性 quote の変換と選ばれた semicolon を反映するが、
value は written-value の規則で原文を保つ。
[fixture: architecture/html-label-authored-quotes]
[fixture: architecture/lex-label-selected-semicolon-after-quote]

### 共通の複合形

共通の形は ID や comment より先に、keyword・句読点・値をまとめて取る。
title-line は title、任意のちょうど 1 文字の ASCII space/tab 区切り、
その行の残りとする。
acc-title-line は accTitle、任意の ASCII space/tab、colon、行の値で始まり、
acc-descr-line も accDescr で同じ形とする。
行の値は最初の percent 対または LF の前で止まる。
区切りのない title は空で、title: は colon の形ではない。
どの行形式も、次の文を値に取らない。
[fixture: architecture/common-title-next-statement]
[fixture: architecture/common-acctitle-next-statement]
[fixture: architecture/common-accdescr-next-statement]
[fixture: architecture/common-colon-title]
[fixture: architecture/common-title-nbsp-separator]
[fixture: architecture/common-acctitle-nbsp-colon]
[fixture: architecture/common-title-comment-gap]
[fixture: architecture/common-acctitle-comment-gap]
[fixture: architecture/common-accdescr-comment-gap]
[fixture: architecture/common-title-literal-quotes]

block は accDescr、0 文字以上の共通の空白、開始 brace、
最初の終了 brace までの任意の文字とする。
内容は空でもよく、LF、U+2028、U+2029 を含められる。
quote と backslash は終了 brace を保護しない。
終了 brace は必須である。
colon の選択肢を block より先に試すため、
colon の後の brace に見える形も行の値となる。
[fixture: architecture/common-empty-block-after-value]
[fixture: architecture/common-block-whitespace]
[fixture: architecture/common-block-ls-gap]
[fixture: architecture/common-block-bom-gap]
[fixture: architecture/common-block-newline-gap]
[fixture: architecture/common-block-first-close]
[fixture: architecture/common-block-quoted-close]
[fixture: architecture/common-block-escaped-close]
[fixture: architecture/common-block-open]
[fixture: architecture/hidden-yaml-accdescr-absorbs-opener]
[fixture: architecture/lex-description-colon-first]
[fixture: architecture/lex-description-glued-block]

### hidden な形と comment

hidden YAML は 3 本 dash、任意の ASCII space/tab、LF で始まる。
本文のある一致を先に試す。
LF、U+2028、U+2029 を含む任意の文字を、
後続する LF と字下げのない 3 本 dash の閉じが成立する最短まで読む。
閉じの直後の LF は消費し、
それ以外は直後が共通の空白または EOF であることを先読みで要求する。
この選択肢に失敗した場合だけ、隣接する空の閉じを試す。
閉じの条件を満たさない候補は本文であり、探索を続ける。
[fixture: architecture/hidden-yaml-open-padding]
[fixture: architecture/hidden-yaml-open-nbsp]
[fixture: architecture/hidden-yaml-close-indent]
[fixture: architecture/hidden-yaml-close-suffix]
[fixture: architecture/hidden-yaml-adjacent-eof]
[fixture: architecture/hidden-yaml-adjacent-later-closer]
[fixture: architecture/hidden-yaml-three-fences]
[fixture: architecture/lex-yaml-ls-ps-body]
[fixture: architecture/hidden-yaml-close-nbsp]
[fixture: architecture/hidden-yaml-close-ps]

そのため、隣接する 3 本 fence は 1 個の hidden form になり得る。
空に見える隣接 pair が、後方の有効な閉じまで後続の文を取り込む場合もある。
2 個の非空ブロックは別々に残れる。
ここで YAML の properties は効果を持たない。
内部の共通 directive と comment region は共通の所有を維持し、
それ以外の内部テキストは ignored value に残る。
[fixture: architecture/hidden-yaml-three-fences]
[fixture: architecture/hidden-yaml-adjacent-later-closer]
[fixture: architecture/lex-yaml-two-nonempty]
[fixture: architecture/lex-yaml-global-directive]
[fixture: architecture/lex-yaml-common-comment]
[fixture: architecture/lex-yaml-global-opener]
[fixture: architecture/lex-yaml-selected-semicolon]
[fixture: architecture/lex-native-directive-selected-semicolon]

native hidden DIRECTIVE は任意の ASCII space/tab と %%{ で始まり、 LF、U+2028、
U+2029 を含む任意の文字を、
hidden YAML と同じ閉じの境界を満たす最初の }%% まで読む。
条件を満たさない閉じ候補の後に、有効な閉じが続いてもよい。
これは共通の Directive とは異なり、本文は設定ではない。
native form が成立しなければ、 native comment へ fallback できる。
[fixture: architecture/hidden-directive-body]
[fixture: architecture/hidden-directive-nonqualifying-close]
[fixture: architecture/hidden-directive-close-glued]
[fixture: architecture/hidden-directive-unclosed]
[fixture: architecture/hidden-directive-close-ls]
[fixture: architecture/hidden-directive-close-ps]
[fixture: architecture/lex-directive-ls-ps-body]
[fixture: architecture/lex-native-directive-common-comment]

LF を消費しても hidden form は可視 EOL を供給しない。
次の文がある場合、前の文には残った LF が必要であり、余分な LF、
または閉じの後の ASCII padding によって残せる。
EOF では追加された LF を hidden が消費しても end-of-text を使える。
消費した直後 LF は ignored node の外に置く。
全体を 1 回だけ、名前つきの隙間、最初の可視 EOL 前の接尾辞、その EOL 後の body、
textBeforeHeader のどれかが所有する。
[fixture: architecture/hidden-directive-after-service]
[fixture: architecture/hidden-directive-spare-lf]
[fixture: architecture/hidden-directive-closing-space]
[fixture: architecture/hidden-directive-eof]
[fixture: architecture/hidden-yaml-service-after]
[fixture: architecture/hidden-yaml-service-spare]
[fixture: architecture/hidden-yaml-service-space]
[fixture: architecture/hidden-yaml-service-eof]
[fixture: architecture/lex-hidden-after-visible-eol]
[fixture: architecture/lex-hidden-two-suffixes]

native comment は mark の %% から行末まで読み、LF/CR を除き、
U+2028 と U+2029 を含む。
LF は消費しない。
native comment は共有 Comment であり、ArchitectureIgnoredText ではない。
先行する string・label・共通値が囲む text はその値の所有であり、
その中の percent 対や fence に見える形は hidden form を開始しない。
global な comment region と directive は、
値の内部と native mark の 2 個の percent の間にも適用する。
[fixture: architecture/end-statements-comments]
[fixture: architecture/space-comment-ls]
[fixture: architecture/space-comment-ps]
[fixture: architecture/hidden-directive-inside-values]
[fixture: architecture/hidden-yaml-inside-values]
[fixture: architecture/lex-percent-in-label]
[fixture: architecture/lex-bare-percent-in-quoted-label]
[fixture: architecture/comment-in-quoted-label]
[fixture: architecture/common-description-block-comment]
[fixture: architecture/comment-directive-in-mark]
[fixture: architecture/comment-directive-in-value]

## 文法

```text
diagram = newline* "architecture-beta" (statement | newline)* end-of-text
statement = (group | service | junction | edge | alignment
            | common-statement) eol
group = "group" id icon? label? parent?
service = "service" id (string | icon)? label? parent?
junction = "junction" id parent?
parent = "in" id
icon = "(" icon-name ")"
label = "[" (label-string | label-text) "]"
edge = id group-modifier? arrow id group-modifier?
group-modifier = "{" "group" "}"
arrow = ":" port-direction arrow-marker? line arrow-marker? port-direction ":"
line = "--" | "-" label "-"
alignment = "align" ("row" | "column") id id+
common-statement = title-line | acc-title-line | acc-descr-line | acc-descr-block
eol = newline+ | end-of-text
```

[共通の記法](../common.md#notation)を使う。
複合形には字句条件を要求し、
icon・label・group-modifier の内部に空白や native hidden を自由に挟めない。
完全な単位の間の hidden form は木で定める隙間に所有させる。
可視 newline は構成要素間の隙間を置き換えない。
値に囲まれた改行と hidden が消費する改行は別である。
[fixture: architecture/hidden-directive-unit-gaps]
[fixture: architecture/hidden-yaml-group-gap]
[fixture: architecture/hidden-yaml-parent-gap]
[fixture: architecture/hidden-yaml-edge-gaps]
[fixture: architecture/hidden-yaml-align-gap]
[fixture: architecture/gram-hidden-between-ids]
[fixture: architecture/gram-hidden-inside-icon]
[fixture: architecture/gram-hidden-inside-modifier]
[fixture: architecture/lex-icon-spaces]
[fixture: architecture/lex-title-padded-quoted-brackets]

body は空でもよい。
見出しと最初の文の間に EOL は要求せず、
group・service・junction・edge・alignment・共通の文を見出し行で始められる。
完成した各文には可視 EOL または EOF が必要である。
同一行で文を続ける形、宣言の内部や EOL の代わりの空 description は拒否する。
空行・comment だけの行は文を作らない。
通常の semicolon は EOL でも空文でもない。 [fixture: architecture/header-beta]
[fixture: architecture/header-inline-group]
[fixture: architecture/header-inline-service]
[fixture: architecture/header-inline-junction]
[fixture: architecture/header-inline-edge]
[fixture: architecture/header-inline-align] [fixture: architecture/common-all]
[fixture: architecture/gram-same-line-statements]
[fixture: architecture/gram-empty-description-gap]
[fixture: architecture/gram-empty-description-after-service]
[fixture: architecture/space-lines]
[fixture: architecture/end-statements-comments]
[fixture: architecture/end-group-semicolon]
[fixture: architecture/end-service-eof] [fixture: architecture/end-junction-eof]
[fixture: architecture/end-edge-eof] [fixture: architecture/end-align-eof]

icon、title、parent は示した順序で高々 1 回ずつ現れる。
junction は icon も title も持たない。
alignment は 2 個以上の member を要求し、可視の行境界を跨いで並べられない。
ラベルなしの辺は連続した double dash、
ラベルつきの辺は 2 本の single dash の間に label を持つ。
[fixture: architecture/gram-service-two-icons]
[fixture: architecture/gram-service-reversed-fields]
[fixture: architecture/gram-group-two-parents]
[fixture: architecture/gram-junction-title]
[fixture: architecture/error-align-one]
[fixture: architecture/gram-edge-separated-dashes]
[fixture: architecture/db-mixed]

| 規則              | ノード                             |
| ----------------- | ---------------------------------- |
| diagram           | ArchitectureDiagram                |
| group             | ArchitectureGroupStatement         |
| service           | ArchitectureServiceStatement       |
| junction          | ArchitectureJunctionStatement      |
| edge              | ArchitectureEdgeStatement          |
| arrow             | ArchitectureArrow                  |
| alignment         | ArchitectureAlignmentStatement     |
| Alignment member  | ArchitectureAlignmentMember        |
| title-line        | ArchitectureTitleStatement         |
| acc-title-line    | ArchitectureAccTitleStatement      |
| acc-descr-line    | ArchitectureAccDescrStatement      |
| acc-descr-block   | ArchitectureAccDescrBlockStatement |
| id / icon-name    | Identifier                         |
| string            | StringLiteral                      |
| label             | ArchitectureLabel                  |
| Common value      | ArchitectureLiteral                |
| Whole hidden form | ArchitectureIgnoredText            |

宣言 id、書いた親の参照、辺の両端点、port の colon と方向、
label つき線の 2 本目の dash、alignment の方向は必須である。
構成要素が欠ければ拒否し、空の member 列も alignment ではない。
[fixture: architecture/gram-group-id-missing]
[fixture: architecture/gram-service-id-missing]
[fixture: architecture/gram-junction-id-missing]
[fixture: architecture/gram-parent-id-missing]
[fixture: architecture/gram-edge-colon-missing]
[fixture: architecture/gram-edge-direction-missing]
[fixture: architecture/gram-edge-rhs-missing]
[fixture: architecture/gram-edge-label-final-dash-missing]
[fixture: architecture/gram-align-direction-missing]
[fixture: architecture/gram-align-no-members]

### 意味上の受理条件

字句と文法が全文を読んだ後、次の検査を順に適用する。
lexer/parser error のある回復モデルは [parse.ts][parse] が拒否する。
[architectureParser.ts][adapter] は groups、services、junctions、edges、
alignments の順に、各種類の内部では記述順に登録する。
この順は受理を定めるもので、木のソース順を変えない。
[fixture: architecture/error-after-prefix]
[fixture: architecture/error-recovered-statement]
[fixture: architecture/db-mixed] [fixture: architecture/db-junction-order]
[fixture: architecture/db-align-forward-repeat]

共通のテキスト変換後の ID を大文字小文字を区別して正確に比較する。
ID の変換に引用符処理、escape 復号、HTML escape、trim は加えない。
登録済み ID、その種類 group/node、各 node の任意の親 group を保持する。
`__proto__`、`constructor` も通常の ID であり、 object property として扱わない。
[fixture: architecture/db-id-case] [fixture: architecture/db-prototype-ids]
[fixture: architecture/db-prototype-services]
[fixture: architecture/lex-id-numeric]
[fixture: architecture/common-quotes-entities]

最初に group を記述順に検査する。
id は未登録でなければならない。
親を書くなら自分自身と異なり、登録済みの group でなければならない。
成功した id を group として登録する。
したがって後方の group を親にできない。
group より前に書いた service も親にはならず、この段階では node は未登録である。
根拠は [architectureDb.ts][db-nodes] である。
[fixture: architecture/error-group-duplicate]
[fixture: architecture/error-group-self-parent]
[fixture: architecture/error-group-parent-missing]
[fixture: architecture/error-group-forward-parent]
[fixture: architecture/error-group-parent-node] [fixture: architecture/db-mixed]

次に service を記述順、その後 junction を記述順に検査する。
各 id は未登録でなければならない。
親を書くなら自分自身と異なる登録済み group とし、
不在の親と node の親は拒否する。
成功した id を node として登録し、親を保持する。
そのため後方に書いた group も service/junction の親になれるが、
service が後方の junction を指す時点ではその親は未登録である。
id は 3 種類の宣言すべてで一意とする。
[fixture: architecture/error-service-duplicate]
[fixture: architecture/error-service-self-parent]
[fixture: architecture/error-service-parent-missing]
[fixture: architecture/error-service-parent-node]
[fixture: architecture/error-junction-self-parent]
[fixture: architecture/error-junction-parent-missing]
[fixture: architecture/error-junction-parent-node]
[fixture: architecture/error-service-junction-collision]
[fixture: architecture/error-group-junction-collision]
[fixture: architecture/db-service-forward-parent]
[fixture: architecture/db-junction-forward-parent]
[fixture: architecture/error-service-parent-forward-junction]

次に edge を記述順に検査する。
両端は登録済みの service または junction でなければならない。
不在の id と実在 group の id は拒否し、
group 端点の Mermaid の TypeError は再現しない。
どちらかに group modifier があるとき、
両端が同じ空でない親 group を持つ場合に限ってこの条件で拒否する。
所属なしの端点、片側だけの所属、異なる親 group はこの条件で拒否しない。
端点の宣言は辺より後でもよい。
検査の根拠は [architectureDb.ts][db-edges] である。
[fixture: architecture/error-edge-lhs-missing]
[fixture: architecture/error-edge-rhs-missing]
[fixture: architecture/error-edge-group-lhs]
[fixture: architecture/error-edge-group-rhs]
[fixture: architecture/error-edge-group-both]
[fixture: architecture/error-edge-same-group-lhs]
[fixture: architecture/error-edge-same-group-rhs]
[fixture: architecture/db-group-modifier-ungrouped]
[fixture: architecture/db-group-modifier-one-group]
[fixture: architecture/db-group-modifier-other-parent]
[fixture: architecture/db-group-modifier-junction]
[fixture: architecture/db-mixed] [fixture: architecture/db-edge-forward-nodes]

最後に alignment を記述順に検査する。
member はすべて登録済み service/junction とし、
同じ alignment 内では重複させない。
group と不在の member は拒否する。
全 node 宣言が利用可能なので、後方参照を許す。
member の順と alignment の文の反復は保つ。
2 個未満は文法が既に拒否する。 [fixture: architecture/error-align-group]
[fixture: architecture/error-align-missing]
[fixture: architecture/error-align-duplicate]
[fixture: architecture/error-align-one]
[fixture: architecture/db-align-forward-repeat] [fixture: architecture/db-mixed]

重複辺、自己辺、同じ port 方向、矛盾する alignment、
未知の icon を解析時に禁止する条件はない。
描画・layout の失敗はこの受理規則を変えない。
[fixture: architecture/db-duplicate-edges] [fixture: architecture/db-directions]
[fixture: architecture/db-align-layout-conflict]
[fixture: architecture/db-unknown-icon]

### Db の正規化

[architecture の要約](../../../tests/docs/db-summaries.md#architecture)が、
公開、省略値と false、テキスト変換、配列順を定める。
導出値を追加の構文欄にしない。
公開が省く場合も、共通の文と arrow・label・icon の原綴をすべて保つ。
特に図の title は [architectureRenderer.ts][renderer]
が描画しないため比較要約には含まれないが、木には残す。
[fixture: architecture/db-mixed] [fixture: architecture/db-empty-values]
[fixture: architecture/common-repeat-empty]
[fixture: architecture/lex-title-unquoted-fallback]
[fixture: architecture/lex-string-conversion]
[fixture: architecture/db-directions] [fixture: architecture/frontmatter-title]

### 設定

architecture の設定は描画で読み、構文・意味上の受理には使わない。
根拠は [architectureDb.ts][db-config] である。
この図の public parse は maxEdges と maxTextSize を強制しない。
小さい制限値も受理される text を拒否にせず、
設定は不正な構文と重複 id を救済しない。
embedded-data-opaque の比較に architecture の acceptance key は加えない。
不正な embedded data は引き続きその共有差異に従う。
[fixture: architecture/config-site-maxedges]
[fixture: architecture/config-limit-small]
[fixture: architecture/config-limit-accepted]
[fixture: architecture/config-embedded-limit]
[fixture: architecture/config-embedded-maxedges]
[fixture: architecture/config-drawing-only]
[fixture: architecture/config-invalid-cannot-rescue]
[fixture: architecture/config-frontmatter-invalid-unaffected]
[fixture: architecture/div-frontmatter-invalid-yaml]

## 既知の差異

次の既存の 5 識別子を適用する。
native hidden form は拒否せず ArchitectureIgnoredText に持つ。
引用した空の label/text icon と空 description の文も保持できるため、
tokenless-empty-forms ではない。
裸のラベルへの fallback と通常と異なる arrow-marker の綴りも受理する。
[fixture: architecture/hidden-directive-body]
[fixture: architecture/hidden-yaml-three-fences]
[fixture: architecture/db-empty-values]
[fixture: architecture/common-empty-block-after-value]
[fixture: architecture/lex-title-unclosed-quote-with-close]
[fixture: architecture/db-directions]

[directive-as-token-boundary](../known-divergences/directive-as-token-boundary.md)
では、 id、icon-name、固定語、double dash 内の global directive を拒否する。
完全な icon-name や group の語を囲む delimiter は別の構成要素なので、
その間の directive は許す。
label/string/共通値の内容にも directive を置ける。
これが直接の境界規則であり、
不可分な名前や語の内部に ignored-text node を置く位置はない。
[fixture: architecture/directive-keyword-split]
[fixture: architecture/div-directive-name]
[fixture: architecture/div-directive-icon-name]
[fixture: architecture/div-directive-group-word]
[fixture: architecture/div-directive-line]
[fixture: architecture/directive-icon-delimiters]
[fixture: architecture/directive-group-delimiters]
[fixture: architecture/directive-fields]
[fixture: architecture/end-group-unclosed-directive]
[fixture: architecture/end-junction-unclosed-directive]

[ignored-semicolon-as-token-boundary](../known-divergences/ignored-semicolon-as-token-boundary.md)
では、 in や親 id の中の選ばれた semicolon を、断片をつながず拒否する。
値の text 内で選ばれた semicolon は共通の読みを維持する。
[html-tag-in-frontmatter](../known-divergences/html-tag-in-frontmatter.md)
では、 frontmatter 内で始まった tag により本文へ HTML quote の変換を延長しない。
その差は受理の両方向、または受理された label の値に現れる。
[fixture: architecture/div-semicolon-parent-id]
[fixture: architecture/div-semicolon-in-keyword]
[fixture: architecture/style-fields]
[fixture: architecture/div-frontmatter-open-tag-icon]
[fixture: architecture/div-frontmatter-open-attribute-icon]
[fixture: architecture/div-frontmatter-open-tag-label]

[embedded-data-opaque](../known-divergences/embedded-data-opaque.md) では、
正しく区切られた frontmatter/directive の内容を受理のために解析しない。
拒否の原因の data だけを除き、無関係な embedded 値を保つ共通の比較を使う。
[bare-percent-line-before-header](../known-divergences/bare-percent-line-before-header.md)
では、 native な読みが空白を拒否する場合も、
通した行と付随する空白を trivia にする。
残存する形自体の字句規則は維持する。
[fixture: architecture/div-frontmatter-invalid-yaml]
[fixture: architecture/div-invalid-keeps-config]
[fixture: architecture/div-init-fontfamily-number]
[fixture: architecture/detection-bare-before-header-ls]
[fixture: architecture/div-retained-bare-second-scan-ls]
[fixture: architecture/retained-yaml-no-bare]

[grammar]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/architecture/architecture.langium#L1-L57
[arch]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/architecture/arch.langium#L1-L2
[common]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/common/common.langium#L6-L34
[builder]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/architecture/tokenBuilder.ts#L1-L7
[module]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/architecture/module.ts#L41-L81
[parse]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/parse.ts#L133-L149
[adapter]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/architecture/architectureParser.ts#L8-L35
[db-nodes]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/architecture/architectureDb.ts#L75-L188
[db-edges]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/architecture/architectureDb.ts#L192-L282
[db-config]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/architecture/architectureDb.ts#L395-L413
[detector]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/architecture/architectureDetector.ts#L7-L11
[order]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/diagram-orchestration.ts#L78-L100
[renderer]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/architecture/architectureRenderer.ts#L610-L642
