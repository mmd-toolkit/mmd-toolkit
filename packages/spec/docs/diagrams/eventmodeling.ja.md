# eventmodeling

英語版: [eventmodeling.md](./eventmodeling.md)

eventmodeling の構文と[書かれた木](../ast/eventmodeling.ja.md)を定義する。
[event-modeling.langium][grammar]、[parser のテスト][parser-tests]、
[adapter のテスト][mermaid-tests]に従う。 [fixture: eventmodeling/gram-written-tree]
[fixture: eventmodeling/header-only]

## 検出

[detection.md](../detection.ja.md) の項目 27、
[detector.ts][detector]は共通の先頭空白の後で小文字そのままの prefix
eventmodeling を選ぶ。
その後ろの境目は見ない。
検出だけでは受理は決まらず、大文字、読めない suffix、colon、
重複する見出しは拒否する。 [fixture: eventmodeling/header-only]
[fixture: eventmodeling/header-uppercase]
[fixture: eventmodeling/header-letter]
[fixture: eventmodeling/header-digit]
[fixture: eventmodeling/header-word]
[fixture: eventmodeling/header-dash]
[fixture: eventmodeling/header-unicode]
[fixture: eventmodeling/header-punctuation]
[fixture: eventmodeling/header-double]

[共通の原文の読み](../common.ja.md#ソースの読み方)に従い、改行、
HTML 属性の引用符、本当の先頭 frontmatter、共通 directive、コメント領域、
先頭 trivia、文字参照、選ばれた semicolon を扱う。
[前処理][preprocess]と[検出の走査][detect-type]は図種の文法より先。
本当の frontmatter は共有 Frontmatter。
先行する C4 検出には c4-keyword-anywhere を適用する。 [fixture: eventmodeling/frontmatter-title]
[fixture: eventmodeling/line-cr]
[fixture: eventmodeling/line-crlf]
[fixture: eventmodeling/html-common]
[fixture: eventmodeling/entity-common]
[fixture: eventmodeling/directive-header-inside]
[fixture: eventmodeling/semicolon-selected-common-parts]
[fixture: eventmodeling/c4-component-identifier]

検出点では、通過する裸の percent 行と二度目の directive 走査より前に、
共通の [frontmatter の形](../common.ja.md#フロントマター)に合う retained
block を高々一つ通る。
それは図の text として残る。
二つ目の retained block は拒否する。
本当の frontmatter は retained block と二度目の走査の directive より前に置ける。
block の後の directive は通れるが、逆順で block の通過をやり直さない。
先行する裸の percent 行もその block の通過を止める。 [fixture: eventmodeling/detect-retained-two]
[fixture: eventmodeling/detect-two-blocks]
[fixture: eventmodeling/detect-real-retained-secondscan]
[fixture: eventmodeling/detect-yaml-secondscan]
[fixture: eventmodeling/detect-secondscan-yaml]
[fixture: eventmodeling/prefix-yaml-between-bares]
[fixture: eventmodeling/detect-block-after-bare-brace]

本文行のない隣接 fence、closer の欠落、opening の四つの dash、 closing
fence の suffix、改行が続かない closer は retained block の通過を止める。
先頭の trim は opening の indent だけを除きうる。
元は indented な opener と indent のない closer、closer だけの indent、
trim 後に片側だけ indent の残る fence を区別する。
closing の padding と LF は検出と native の読みに両方合いうる。 [fixture: eventmodeling/detect-adjacent-no-body]
[fixture: eventmodeling/detect-missing-close]
[fixture: eventmodeling/detect-four-opening-dashes]
[fixture: eventmodeling/detect-closing-suffix]
[fixture: eventmodeling/detect-closer-no-lf]
[fixture: eventmodeling/detect-indent-mismatch]
[fixture: eventmodeling/detect-close-indent-mismatch]
[fixture: eventmodeling/detect-opening-indent-trim]
[fixture: eventmodeling/detect-close-space-native]

二度目の走査で初めて見つかる directive は図の text として残り、 native
directive の境目を満たす必要がある。
二つの形は個別に読めるが、
closer に見出しを直結すると native の読みが失敗しうる。
retained な native
YAML と directive は EventmodelingDiagram.textBeforeHeader に属し、
共有 frontmatter や設定ではない。 [fixture: eventmodeling/detect-two-secondscan]
[fixture: eventmodeling/detect-secondscan-glued]
[fixture: eventmodeling/detect-real-retained-secondscan]

通過した裸の percent 行は mark が %% の共有 Comment。
伴って通過した空白と改行は trivia で、retained form の前後や間でも読み直さない。
検出点、到達した見出し、その後の native 空白を区別する。
ASCII space/tab と Unicode 空白は、独立の行でも見出しの直前でも、
この図種では裸の行の有無によらず受理する。
bare-percent-line-before-header の差異にはならない。 [fixture: eventmodeling/bare-before-space]
[fixture: eventmodeling/bare-before-tab]
[fixture: eventmodeling/bare-before-ls]
[fixture: eventmodeling/bare-before-ps]
[fixture: eventmodeling/bare-line-ls]
[fixture: eventmodeling/bare-line-ps]
[fixture: eventmodeling/prefix-directive-between-bares]
[fixture: eventmodeling/detect-bare-retained]
[fixture: eventmodeling/prefix-yaml-bare-unicode]
[fixture: eventmodeling/detect-retained-bare-ascii-line]
[fixture: eventmodeling/detect-retained-bare-ls-line]
[fixture: eventmodeling/detect-retained-no-bare-ls-line]
[fixture: eventmodeling/detect-retained-bare-nbsp-header]
[fixture: eventmodeling/detect-retained-no-bare-nbsp-header]

## 字句構造

### 単位の優先順

上の通過範囲を除いて検出点から図の text を読む。
各位置で表の最初に成立する規則を取り、次の位置で同じ順を繰り返す。
一般の最長一致ではない。
[module.ts][module]は [EventModelingTokenBuilder][token-builder] と[共通 token builder][common-token-builder]を使う。
[文法][grammar]は common grammar を import しない。
継承した STRING、INT、BOOLEAN、EOL などの単位はない。
どの規則も読まない文字は拒否する。 [fixture: eventmodeling/header-only]
[fixture: eventmodeling/gram-written-tree]
[fixture: eventmodeling/error-start]
[fixture: eventmodeling/error-recovered]
[fixture: eventmodeling/error-after-prefix]

| 順  | 単位または trivia                     | 読み                                        |
| --- | ------------------------------------- | ------------------------------------------- |
| 1   | `eventmodeling`                       | keyword。identifier が longer alternative。 |
| 2   | `resetframe`                          | keyword。identifier が longer alternative。 |
| 3   | `readmodel`                           | keyword。identifier が longer alternative。 |
| 4   | `processor`                           | keyword。identifier が longer alternative。 |
| 5   | `timeframe`                           | keyword。identifier が longer alternative。 |
| 6   | `command`                             | keyword。identifier が longer alternative。 |
| 7   | `entity`                              | keyword。identifier が longer alternative。 |
| 8   | `event`                               | keyword。identifier が longer alternative。 |
| 9   | `jsobj`                               | keyword。identifier が longer alternative。 |
| 10  | `figma`                               | keyword。identifier が longer alternative。 |
| 11  | `given`                               | keyword。identifier が longer alternative。 |
| 12  | `json`                                | keyword。identifier が longer alternative。 |
| 13  | `salt`                                | keyword。identifier が longer alternative。 |
| 14  | `html`                                | keyword。identifier が longer alternative。 |
| 15  | `text`                                | keyword。identifier が longer alternative。 |
| 16  | `data`                                | keyword。identifier が longer alternative。 |
| 17  | `note`                                | keyword。identifier が longer alternative。 |
| 18  | `when`                                | keyword。identifier が longer alternative。 |
| 19  | `then`                                | keyword。identifier が longer alternative。 |
| 20  | `rmo`                                 | keyword。identifier が longer alternative。 |
| 21  | `cmd`                                 | keyword。identifier が longer alternative。 |
| 22  | `evt`                                 | keyword。identifier が longer alternative。 |
| 23  | `pcr`                                 | keyword。identifier が longer alternative。 |
| 24  | `uri`                                 | keyword。identifier が longer alternative。 |
| 25  | `->>`                                 | 句読点。longer alternative はない。         |
| 26  | `gwt`                                 | keyword。identifier が longer alternative。 |
| 27  | `ui`                                  | keyword。identifier が longer alternative。 |
| 28  | `md`                                  | keyword。identifier が longer alternative。 |
| 29  | `tf`                                  | keyword。identifier が longer alternative。 |
| 30  | `[[`                                  | 句読点。longer alternative はない。         |
| 31  | `]]`                                  | 句読点。longer alternative はない。         |
| 32  | `rf`                                  | keyword。identifier が longer alternative。 |
| 33  | type-tag-delimiter                    | 句読点。longer alternative はない。         |
| 34  | `.`                                   | 句読点。longer alternative はない。         |
| 35  | identifier                            | ASCII 識別子。                              |
| 36  | frame-name                            | 一〜三桁の数字。                            |
| 37  | inline-data                           | 同一行の brace または quote の data。       |
| 38  | block-data                            | 複数行の brace data。                       |
| 39  | description-line or description-block | colon 形を brace 形より先に。               |
| 40  | accessibility-title-line              | padding 付きの accessibility 行。           |
| 41  | title-line                            | padding 付きの title または bare title。    |
| 42  | native whitespace                     | native の空白。                             |
| 43  | hidden-yaml                           | native の無視される block。                 |
| 44  | hidden-directive                      | native の無視される形。                     |
| 45  | percent-comment                       | native の行コメント。                       |
| 46  | slash-block-comment                   | native の block コメント。                  |
| 47  | slash-line-comment                    | native の行コメント。                       |

各単語の keyword は identifier を明示的 longer alternative とする。
identifier の方が長いとそれを取り、同じ長さなら keyword を取る。
句読点には longer alternative がない。
大文字小文字を区別する。
Jison の word boundary ではなく、tf01 と evtA は identifier になり、
数字の frame-name は次の型の keyword に直結できる。
普通の keyword そのものは identifier にできないが、
eventX のような長い語は名前になる。 [fixture: eventmodeling/lex-glued-frame-id]
[fixture: eventmodeling/lex-glued-type-name]
[fixture: eventmodeling/lex-glued-frame-parts]
[fixture: eventmodeling/lex-keyword-name]
[fixture: eventmodeling/lex-keyword-prefix-name]
[fixture: eventmodeling/gram-gwt-keyword-identifier-prefix]
[fixture: eventmodeling/type-uppercase]
[fixture: eventmodeling/frame-uppercase]

### 見出しの境目

eventmodeling keyword だけには追加の境目がある。
直後が %%、共通 Notation の空白、または text の終わりでなければならない。
LS、PS、NBSP、BOM を含み、U+0085 と U+200B を含まない。
percent comment は直結できるが slash comment は直結できず、
その前の space が境目になる。
共通の除去の後で判定する。
directive の除去後に space や LF が残れば成立するが、eventmodeling と tf、
tf と数字が結合すれば拒否する。 [fixture: eventmodeling/header-percent-comment]
[fixture: eventmodeling/header-slash-comment-glued]
[fixture: eventmodeling/header-slash-comment-spaced]
[fixture: eventmodeling/header-global-directive-space]
[fixture: eventmodeling/header-global-directive-newline]
[fixture: eventmodeling/directive-header-glued]
[fixture: eventmodeling/directive-keyword-glued]
[fixture: eventmodeling/line-ls-gap]
[fixture: eventmodeling/line-ps-gap]
[fixture: eventmodeling/space-nbsp-body]
[fixture: eventmodeling/space-bom-body]
[fixture: eventmodeling/header-nel]
[fixture: eventmodeling/header-zero-width-space]

名前の位置でこの独自の keyword matcher が失敗しても identifier は一致しうる。
eventmodeling.A は修飾名になるが、 event.A は普通の予約 keyword
event で始まるので拒否する。 [fixture: eventmodeling/lex-name-custom-header-dot]
[fixture: eventmodeling/lex-name-ordinary-keyword-dot]

### 名前と参照

[名前の規則][names]の identifier は ASCII letter または underscore で始まり、
ASCII letter、digit、underscore が 0 個以上続く。
一文字の名前や prototype の形の名前も許す。
Unicode letter、dash、quote、文字参照でその単位を延ばせない。
frame-name は一〜三桁の ASCII digit の文字列で、量ではない。
1、01、001 は別名。
四桁、符号、NaN、Infinity、
空白で分かれた二つの数字の単位は frame-name にならない。 [fixture: eventmodeling/lex-id-forms]
[fixture: eventmodeling/lex-id-unicode]
[fixture: eventmodeling/lex-id-unicode-tail]
[fixture: eventmodeling/db-prototype-names]
[fixture: eventmodeling/entity-id-rejected]
[fixture: eventmodeling/db-source-leading-zero]
[fixture: eventmodeling/number-one]
[fixture: eventmodeling/number-three]
[fixture: eventmodeling/number-four]
[fixture: eventmodeling/number-plus]
[fixture: eventmodeling/number-negative-zero]
[fixture: eventmodeling/number-nan]
[fixture: eventmodeling/number-infinity]
[fixture: eventmodeling/gram-frame-id-split-whitespace]

qualified-name は一個以上の identifier を dot の句読点で結ぶ。
dot の両側には native 空白、コメント、hidden を置けるが、segment の欠落、
先頭や末尾の dot は拒否する。
data の宣言名、bracket の data 参照、 GWT
item の参照は一個の identifier を必要とし、
qualified-name の形ではない。 [fixture: eventmodeling/db-qualified-names]
[fixture: eventmodeling/space-qualified-name]
[fixture: eventmodeling/lex-qualified-hidden-components]
[fixture: eventmodeling/lex-qualified-empty-segment]
[fixture: eventmodeling/lex-qualified-leading-dot]
[fixture: eventmodeling/lex-qualified-trailing-dot]
[fixture: eventmodeling/data-reference-qualified]
[fixture: eventmodeling/gwt-qualified-reference]
[fixture: eventmodeling/gram-gwt-numeric-source-four]

### data

[data の fragment][data]は任意の tag を許す。
opening backtick、json、jsobj、figma、salt、uri、md、html、text のいずれか、
closing backtick の順。
部品は別々で、間に native の gap を置ける。
その後の本文は必須。
空の tag や未知の型は拒否する。
tag により本文を JSON、URI、
別の言語として検証しない。 [fixture: eventmodeling/data-all-types]
[fixture: eventmodeling/data-block-types]
[fixture: eventmodeling/data-unknown-type]
[fixture: eventmodeling/lex-block-type-empty]
[fixture: eventmodeling/lex-block-type-multiline-gaps]
[fixture: eventmodeling/lex-hidden-type-tag]
[fixture: eventmodeling/lex-hidden-data-tag-gaps]

[inline-data の規則][data-terminals]は braces、double quotes、 single
quotes の順に試す。
同じ行の最後の対応する closer まで読み、
途中の closer や後の文に見える text も含める。
CR、LF、LS、PS は内側に置けない。
backslash は普通の内容で、quote や brace を保護しない。
空の braces と空の quoted string も受理する。
文法が block を求める位置でも、同じ位置では inline data が block
data に優先する。 [fixture: eventmodeling/lex-inline-greedy]
[fixture: eventmodeling/lex-inline-quote-greedy]
[fixture: eventmodeling/lex-inline-two-objects-following-frame]
[fixture: eventmodeling/lex-inline-quote-conversion]
[fixture: eventmodeling/lex-inline-empty]
[fixture: eventmodeling/lex-inline-multiline]
[fixture: eventmodeling/line-inline-ls]
[fixture: eventmodeling/line-inline-ps]
[fixture: eventmodeling/lex-inline-brace-ls]
[fixture: eventmodeling/lex-inline-open-brace]
[fixture: eventmodeling/lex-inline-open-double]
[fixture: eventmodeling/lex-inline-open-single]
[fixture: eventmodeling/data-block-inline-rejected]
[fixture: eventmodeling/lex-block-data-quoted-not-block]
[fixture: eventmodeling/data-inline-block-rejected]

block-data は opening brace、0 個以上の ASCII space/tab、LF で始まる。
closer は LF の直後の indent のない brace で、後ろに LF、他の Notation の空白、
または text の終わりが続く。
opening の NBSP や LS、indent のある closer、LS の直後の closer は拒否する。
内側には LS と PS を含むすべての文字を置ける。
閉じなければ拒否する。 [fixture: eventmodeling/data-block-empty]
[fixture: eventmodeling/lex-block-empty-whitespace]
[fixture: eventmodeling/lex-block-open-padding]
[fixture: eventmodeling/lex-block-opening-ls]
[fixture: eventmodeling/data-block-indented-close]
[fixture: eventmodeling/lex-block-close-after-ls]
[fixture: eventmodeling/line-block-values]
[fixture: eventmodeling/data-block-close-suffix]
[fixture: eventmodeling/lex-block-open]

opening 行の後に少なくとも一行の本文を置く形を先に試し、
適格な closing 行を成立させる最小の本文を取る。
それが成立しない時だけ、opening 行の直後で閉じる空の形を試す。
そのため、後の closer があれば直後の closing 行が本文になりうる。
本文のある形で適格な closer に達したらそこで止まる。
quote、nested brace、frame に見える行は closer を保護しない。
境目を満たさない closing に見える行は内容になりうる。 [fixture: eventmodeling/lex-block-adjacent-closers]
[fixture: eventmodeling/lex-block-adjacent-later-close]
[fixture: eventmodeling/lex-block-unqualified-close-later]
[fixture: eventmodeling/data-block-nested]
[fixture: eventmodeling/data-block-empty]

block-data は closing の直後の LF を消費する。
他の後続空白は境目に使うだけで消費しない。
text の終わりに加わる論理上の LF もそれを満たす。
これは字句上の境目であり、
文を終える EOL の単位ではない。 [fixture: eventmodeling/data-block-close-eof]
[fixture: eventmodeling/data-block-close-space]
[fixture: eventmodeling/lex-block-close-ps-boundary]
[fixture: eventmodeling/lex-block-closer-native-comment]
[fixture: eventmodeling/lex-block-closer-native-comment-space]

### 共通の文

[metadata の規則][metadata]は図種固有の EM_TITLE、EM_ACC_TITLE、
EM_ACC_DESCR で、import した共通 terminal ではない。
[module.ts][module]が選ぶ [CommonValueConverter][converter]の TITLE、ACC_TITLE、
ACC_DESCR の分岐に名前が合わない。
有効な fallback は keyword、区切り、前置の水平 padding を含む terminal 全体を、
trim、空白の collapse、escape の decode をせず残す。
木の本文は変換せず、
後の Db 正規化は [tests の要約](../../../tests/docs/db-summaries.md#eventmodeling)が定義する。 [fixture: eventmodeling/common-inline]
[fixture: eventmodeling/common-whitespace]
[fixture: eventmodeling/common-repeat-empty]
[fixture: eventmodeling/common-description-repeat]
[fixture: eventmodeling/common-quoted-values]

これらの composite は native whitespace より先、identifier より後。
現在位置の先頭の ASCII space/tab の連なりを取れる。
LF と padding は、共通 directive、共通 comment region、
共通の行規則が選ぶ semicolon という共通の除去の後で判断する。
共通 comment region は、その字下げと終わりの LF ごと除かれる。
閉じた共通 directive だけを除いても、その外の LF は残る。
選ばれた semicolon を除いても LF は残り、空行も LF を残す。
その後、次の行の字下げを取れるかは、前の単位が残る LF を消費したかで決まる。
消費済みなら字下げが現在位置から始まり、 native
whitespace より先に composite を成立させられる。
未消費なら native whitespace が LF から字下げまで取り、
keyword の位置では identifier が勝つ。
block-data、hidden-yaml、hidden-directive は閉じの LF を消費する。
その次の行でも字下げがなければ identifier が勝つ。
共通の CRLF 変換後も同じ LF の場合になる。
これらの closer の後の LS と PS は消費されず、 native
whitespace がそこから共通の形の前の padding まで取る。
同じ物理行では、行内の共通 directive や選ばれた semicolon をまたいでも、
残る ASCII space/tab の連なりが composite を成立させられる。
選ばれない semicolon は空白ではなく、その gap では拒否する。
空の説明ブロックは文として残り、後ろの LF は消費しないが、同じ行の closing
brace の直後の padding は次の共通の形が取れる。
名前の位置でも padding 付きの title は composite としてその位置を奪いうるが、
padding のない title は identifier になれる。
必要な delimiter のない accTitle と accDescr は identifier。 [fixture: eventmodeling/common-line-keywords]
[fixture: eventmodeling/lex-common-no-padding-after-brace]
[fixture: eventmodeling/common-inline]
[fixture: eventmodeling/lex-common-after-slash-comment]
[fixture: eventmodeling/lex-common-after-slash-comment-space]
[fixture: eventmodeling/lex-common-next-line-comment]
[fixture: eventmodeling/lex-name-title-padded]
[fixture: eventmodeling/lex-name-title-after-lf]
[fixture: eventmodeling/lex-name-title-after-comment]
[fixture: eventmodeling/lex-name-acctitle-without-colon]
[fixture: eventmodeling/lex-name-accdescr-without-delimiter]
[fixture: eventmodeling/gram-gwt-title-name-after-lf]
[fixture: eventmodeling/lex-common-after-block-lf-indented]
[fixture: eventmodeling/lex-common-after-block-lf-unindented]
[fixture: eventmodeling/lex-common-after-note-lf-tab]
[fixture: eventmodeling/lex-common-after-yaml-lf-indented]
[fixture: eventmodeling/lex-common-after-yaml-lf-unindented]
[fixture: eventmodeling/lex-common-after-directive-lf-indented]
[fixture: eventmodeling/lex-common-after-directive-lf-unindented]
[fixture: eventmodeling/lex-common-after-block-same-line-tab]
[fixture: eventmodeling/lex-common-after-block-ls-indented]
[fixture: eventmodeling/lex-common-after-yaml-crlf-indented]
[fixture: eventmodeling/lex-common-after-block-ps-indented]
[fixture: eventmodeling/lex-common-yaml-comment-line-padding]
[fixture: eventmodeling/lex-common-block-comment-line-padding]
[fixture: eventmodeling/lex-common-native-directive-comment-line-padding]
[fixture: eventmodeling/lex-common-yaml-directive-only-line]
[fixture: eventmodeling/lex-common-block-directive-only-line]
[fixture: eventmodeling/lex-common-yaml-blank-line-padding]
[fixture: eventmodeling/lex-common-block-inline-directive-padding]
[fixture: eventmodeling/lex-common-selected-semicolon-exposes-lf]
[fixture: eventmodeling/lex-common-selected-semicolon-padding]
[fixture: eventmodeling/lex-common-selected-semicolon-before-lf]
[fixture: eventmodeling/lex-common-unselected-semicolon-padding]
[fixture: eventmodeling/lex-common-empty-description-inline-padding]
[fixture: eventmodeling/lex-common-empty-description-leaves-lf]

title-line は任意の ASCII space/tab の padding、title、そして一つの ASCII
space/tab と CR/LF 以外の行本文、または空の suffix を読む。
accessibility-title-line は同じ padding、accTitle、任意の ASCII space/tab、
colon、行本文。
description-line は同じ形で accDescr を使い、brace の選択肢に優先する。
行本文は空でもよく LS/PS を含む。
最初の %% の直前を優先し、なければ行末まで読む。
bare title は許すが、bare prefix の後の読めない text は拒否する。
後の行を欠けた行の値にしない。 [fixture: eventmodeling/common-title-empty]
[fixture: eventmodeling/common-title-prefix]
[fixture: eventmodeling/common-acctitle-eof]
[fixture: eventmodeling/common-description-eof]
[fixture: eventmodeling/common-colon-block-priority]
[fixture: eventmodeling/line-common-values]
[fixture: eventmodeling/common-next-statement]
[fixture: eventmodeling/common-title-comment-gap]
[fixture: eventmodeling/common-title-directive-gap]
[fixture: eventmodeling/common-title-empty-gap]
[fixture: eventmodeling/common-comment-gap]
[fixture: eventmodeling/common-directive-gap]
[fixture: eventmodeling/common-empty-gap]
[fixture: eventmodeling/lex-common-title-two-spaces]

description-block は padding 付きの accDescr、任意の Notation 空白、 opening
brace、最初の closing brace までのすべての文字、その closer を読む。
LF、LS、PS をまたげる。
quote と backslash は closer を保護せず、閉じない形は拒否する。
空 block も文として残す。
書かれた内側を trim しない。
空白だけも literal になる。
共通の除去で本文が空になっても、
書かれた文や data の殻を除かない。 [fixture: eventmodeling/common-block-first-close]
[fixture: eventmodeling/lex-common-block-after-close]
[fixture: eventmodeling/common-block-quoted-close]
[fixture: eventmodeling/common-block-open]
[fixture: eventmodeling/common-description-repeat]
[fixture: eventmodeling/lex-common-block-whitespace-only]
[fixture: eventmodeling/lex-common-empty-line-whitespace]
[fixture: eventmodeling/line-common-values]
[fixture: eventmodeling/gram-empty-payload-after-removals]
[fixture: eventmodeling/gram-description-block-empty-after-removal]

keyword と brace の間では、
whitespace の一致より先に共通 directive とコメント領域を除く。
空行も許す。
native comment を composite の単位に挿入できるという意味ではない。
metadata の値がすでに包む slash comment や YAML に見える形は、
その text であって別の hidden ではない。 [fixture: eventmodeling/common-description-comment-gap]
[fixture: eventmodeling/common-description-directive-gap]
[fixture: eventmodeling/common-description-empty-gap]
[fixture: eventmodeling/lex-common-block-slash-text]
[fixture: eventmodeling/lex-native-yaml-inside-common]

### native hidden とコメント

native whitespace は LF、LS、PS、BOM、
NBSP を含む共通 Notation 空白の一個以上で、node にしない。
可視の EOL 単位はなく、見出し、frame、entity、data、note、 GWT の後に EOL
production はない。
字句規則が許す完全な単位は改行をまたいだり同じ行に並んだりできる。
普通の semicolon は区切りでなく、包む text の単位の外では拒否する。
共通の行の規則が選ぶものだけを無視する。 [fixture: eventmodeling/space-tabs]
[fixture: eventmodeling/space-bom-body]
[fixture: eventmodeling/space-nbsp-body]
[fixture: eventmodeling/space-3000-body]
[fixture: eventmodeling/space-lines]
[fixture: eventmodeling/line-ls-gap]
[fixture: eventmodeling/line-ps-gap]
[fixture: eventmodeling/header-inline]
[fixture: eventmodeling/gram-gwt-next-top-level]
[fixture: eventmodeling/tail-frame-semicolon]
[fixture: eventmodeling/tail-data-semicolon]
[fixture: eventmodeling/tail-gwt-semicolon]
[fixture: eventmodeling/semicolon-frame-parts]

[hidden の規則][hidden]の hidden-yaml は三つの dash、任意の ASCII space/tab、
LF で始まる。
closer は indent のない三つの dash で、LF、他の Notation 空白、
または text の終わりが続く。
block-data と同じ終端の選択で、
少なくとも一行の本文を置く形を隣接する空の形より先に試す。
opening の四つの dash や indent のある closer は失敗する。
YAML を解析せず設定も適用しない。
後続 LF は消費し、
他の境目の空白は消費しない。 [fixture: eventmodeling/hidden-yaml-adjacent-later]
[fixture: eventmodeling/hidden-yaml-adjacent-no-later]
[fixture: eventmodeling/hidden-yaml-adjacent-eof]
[fixture: eventmodeling/hidden-yaml-adjacent-space]
[fixture: eventmodeling/hidden-yaml-four-dashes]
[fixture: eventmodeling/hidden-yaml-closer-indent]
[fixture: eventmodeling/hidden-yaml-after-frame]
[fixture: eventmodeling/hidden-yaml-after-frame-space]
[fixture: eventmodeling/hidden-yaml-after-frame-spare]
[fixture: eventmodeling/hidden-yaml-closing-ls]
[fixture: eventmodeling/hidden-yaml-eof]

hidden-directive は任意の ASCII space/tab、%%{、LF/LS/PS を含むすべての文字、
境目を満たす最初の }%% を読む。
後続の境目は LF、他の Notation 空白、または text の終わり。
後続 LF は消費し、他の空白は先読みだけ。
境目を満たさない前の closer を含めて後の適格な closer を探せる。
共通 directive の除去と区別する。
%%{x}%% のように名前が単語の形はすでに消えている場合がある。
native の動作は名前が単語でない形で確かめる。 [fixture: eventmodeling/lex-native-directive-object]
[fixture: eventmodeling/lex-native-directive-object-space]
[fixture: eventmodeling/lex-native-directive-object-eof]
[fixture: eventmodeling/hidden-native-directive-later]
[fixture: eventmodeling/hidden-directive-native]
[fixture: eventmodeling/hidden-directive-no-boundary]

hidden-directive が失敗したら percent-comment を試す。
%% から CR/LF の直前または text の終わりまでで、裸の %% も含む。
一行の native directive の失敗形は、
後の frame に見える text まで飲み込む comment になりうる。
複数行の残りの text は拒否されうる。
先の inline、block、common の値の単位が包む native に見える text は内容になる。
hidden-yaml と hidden-directive は EventmodelingIgnoredText、
comment は共有 Comment
record にする。 [fixture: eventmodeling/lex-native-directive-one-line-fallback]
[fixture: eventmodeling/lex-native-directive-object-glued]
[fixture: eventmodeling/comment-eof]
[fixture: eventmodeling/comment-header]
[fixture: eventmodeling/hidden-data-yaml-text]
[fixture: eventmodeling/lex-inline-double-embedded-slash]
[fixture: eventmodeling/lex-native-yaml-in-inline]

slash-block-comment は `/*` から最初の `*/` までで、
入れ子にせず closer を必須とする。
本文に LF、LS、PS を含められる。
slash-line-comment は `//` から CR/LF の直前または text の終わりまで。
LS と PS は終端ではない。
mark は `/*` と `//`、値は mark と block の closer を含めず、
外の padding も内容でない。
comment は完全な単位の間に置けるが identifier の断片を結合しない。
共通 directive は comment の本文や mark の文字の間にも置け、
共有のコメント領域の除去は先に適用する。 [fixture: eventmodeling/comment-native]
[fixture: eventmodeling/comment-between-id]
[fixture: eventmodeling/comment-block-open]
[fixture: eventmodeling/comment-block-nearest-close]
[fixture: eventmodeling/comment-line-ls-body]
[fixture: eventmodeling/comment-line-ps-body]
[fixture: eventmodeling/comment-mark-directive]
[fixture: eventmodeling/comment-block-open-mark-directive]
[fixture: eventmodeling/comment-block-close-mark-directive]
[fixture: eventmodeling/comment-inline-data]
[fixture: eventmodeling/comment-block-data]

### 作者の部品の境目

共通 directive と選ばれた semicolon の規則では、各見出し・文・共通文の keyword、
entity/data type の語、identifier の segment、frame-name の数字列、完全な ->>、
[[、]] を atom とする。
その内部の directive や選ばれた semicolon はここでは拒否する。
qualified-name の dot、type tag の backtick と型の語、
参照の opener・名前・closer、arrow と参照名、
共通 keyword・colon・brace・値は作者の別の部品。
間の共通の除去は、残った字句の境目が成立する時だけ許す。
native
hidden で atom を割れるようにはしない。 [fixture: eventmodeling/directive-header-inside]
[fixture: eventmodeling/directive-id-inside]
[fixture: eventmodeling/directive-number-inside]
[fixture: eventmodeling/directive-arrow-inside]
[fixture: eventmodeling/directive-reference-inside]
[fixture: eventmodeling/directive-reference-close-inside]
[fixture: eventmodeling/directive-json-inside]
[fixture: eventmodeling/directive-qualified]
[fixture: eventmodeling/directive-reference]
[fixture: eventmodeling/directive-tag]
[fixture: eventmodeling/directive-common-parts]
[fixture: eventmodeling/directive-qualified-before-word]
[fixture: eventmodeling/lex-semicolon-identifier-inside]
[fixture: eventmodeling/lex-semicolon-frame-id-inside]
[fixture: eventmodeling/semicolon-arrow-inside]
[fixture: eventmodeling/lex-semicolon-before-dot]
[fixture: eventmodeling/lex-semicolon-after-dot]
[fixture: eventmodeling/lex-semicolon-after-reference-open]
[fixture: eventmodeling/lex-semicolon-before-reference-close]
[fixture: eventmodeling/lex-semicolon-after-tag-open]
[fixture: eventmodeling/lex-semicolon-before-tag-close]
[fixture: eventmodeling/lex-semicolon-after-tag]
[fixture: eventmodeling/lex-frame-native-split-arrow]
[fixture: eventmodeling/lex-reference-native-split-open]

data と共通の値の内側は text で、共通 directive と選ばれた semicolon を置ける。
retained な IgnoredText や Comment は、結合した native fence や comment
mark の綴りも持てる。
原文の directive を一度だけ残し、所有者のある text を拒否しない。
共通の行の規則が選ぶ semicolon だけを無視し、
行のすべての semicolon を消さない。 [fixture: eventmodeling/directive-block-middle]
[fixture: eventmodeling/directive-string-start]
[fixture: eventmodeling/directive-string-middle]
[fixture: eventmodeling/directive-string-end]
[fixture: eventmodeling/style-every-text]
[fixture: eventmodeling/style-two-semicolons]
[fixture: eventmodeling/style-nohash]
[fixture: eventmodeling/style-colon-space]
[fixture: eventmodeling/style-other-line]
[fixture: eventmodeling/lex-hidden-yaml-fence-directive]
[fixture: eventmodeling/comment-mark-directive]

## 文法

[共通の記法](../common.ja.md#表記)を使う。
native 空白、コメント、無視される形は完全な単位を隔てられる。
composite の行や data の規則は固有の境目と優先順を保つ。
[entry と到達する規則][entry]は次の形。
単位をすべて消費し、末尾の不完全な source、参照、clause、
読めない suffix は拒否する。 [fixture: eventmodeling/header-only]
[fixture: eventmodeling/gram-written-tree]
[fixture: eventmodeling/frame-source-missing]
[fixture: eventmodeling/frame-reference-open]
[fixture: eventmodeling/gwt-empty-then]
[fixture: eventmodeling/gram-gwt-empty-name]
[fixture: eventmodeling/error-after-prefix]

```text
diagram = (hidden-yaml | hidden-directive)* "eventmodeling" body-item* end-of-text
body-item = time-frame | reset-frame | model-entity | data-entity | note | gwt
          | title-line | accessibility-title-line | description-line | description-block
          | hidden-yaml | hidden-directive
time-frame = ("tf" | "timeframe") frame-name entity-type qualified-name source*
             data-reference? inline-value?
reset-frame = ("rf" | "resetframe") frame-name entity-type qualified-name source*
              data-reference? inline-value?
model-entity = "entity" qualified-name
data-entity = "data" identifier block-value
note = "note" frame-name block-value
gwt = "gwt" frame-name given-clause when-clause? then-clause
given-clause = "given" gwt-item+
when-clause = "when" gwt-item+
then-clause = "then" gwt-item+
gwt-item = entity-type identifier
source = "->>" frame-name
data-reference = "[[" identifier "]]"
qualified-name = identifier ("." identifier)*
inline-value = type-tag? inline-data
block-value = type-tag? block-data
type-tag = "`" data-type "`"
entity-type = "rmo" | "readmodel" | "ui" | "cmd" | "command"
            | "evt" | "event" | "pcr" | "processor"
data-type = "json" | "jsobj" | "figma" | "salt" | "uri" | "md" | "html" | "text"
```

| 規則                                     | node                                                                 |
| ---------------------------------------- | -------------------------------------------------------------------- |
| diagram                                  | EventmodelingDiagram                                                 |
| time-frame                               | EventmodelingTimeFrameStatement                                      |
| reset-frame                              | EventmodelingResetFrameStatement                                     |
| model-entity                             | EventmodelingModelEntityStatement                                    |
| data-entity                              | EventmodelingDataEntityStatement                                     |
| note                                     | EventmodelingNoteStatement                                           |
| gwt                                      | EventmodelingGwtStatement                                            |
| given-clause / when-clause / then-clause | EventmodelingGwtClause                                               |
| gwt-item                                 | EventmodelingGwtItem                                                 |
| qualified-name                           | EventmodelingQualifiedName and its tail parts                        |
| source                                   | EventmodelingSourceReference and EventmodelingArrow                  |
| data-reference                           | EventmodelingDataReference                                           |
| inline-value / block-value               | EventmodelingInlineData / EventmodelingDataBlock                     |
| title-line                               | EventmodelingTitleStatement                                          |
| accessibility-title-line                 | EventmodelingAccTitleStatement                                       |
| description-line / description-block     | EventmodelingAccDescrStatement / EventmodelingAccDescrBlockStatement |
| hidden-yaml / hidden-directive           | EventmodelingIgnoredText                                             |

source は書かれた順に繰り返せる。
frame の data 参照は高々一個で、すべての source の後、inline data より前。
data 宣言と note は block data を必須とし、frame は inline data だけを許す。
各 GWT group は少なくとも一個の item を持つ。
given と then は必須、when は任意で、この順。
entity 宣言が修飾名でも GWT の参照は単一 identifier。
後の完全な top-level 文は新しい body
item を始める。 [fixture: eventmodeling/db-source-order]
[fixture: eventmodeling/frame-data-order]
[fixture: eventmodeling/gram-frame-sources-after-dataref]
[fixture: eventmodeling/gram-frame-repeat-dataref]
[fixture: eventmodeling/gram-frame-reference-empty]
[fixture: eventmodeling/data-block-inline-rejected]
[fixture: eventmodeling/note-inline-rejected]
[fixture: eventmodeling/data-inline-block-rejected]
[fixture: eventmodeling/gwt-complete]
[fixture: eventmodeling/gwt-without-when]
[fixture: eventmodeling/gwt-empty-given]
[fixture: eventmodeling/gwt-empty-when]
[fixture: eventmodeling/gwt-empty-then]
[fixture: eventmodeling/gwt-missing-then]
[fixture: eventmodeling/gram-gwt-order]
[fixture: eventmodeling/gwt-qualified-reference]
[fixture: eventmodeling/gram-gwt-next-top-level]

GWT 内では、共通 directive だけの行、選ばれた semicolon、コメント行、空行、LS、
PS は item を隔てられる。
そこでの空の説明 block は GWT item にならず拒否する。
data block 内では対応する形は共通の除去の対象になる text で、
入れ子の文ではない。
LS、PS、
空の説明に見える行は内容に残る。 [fixture: eventmodeling/gram-nested-gwt-global-directive-line]
[fixture: eventmodeling/lex-native-directive-in-gwt]
[fixture: eventmodeling/gram-nested-gwt-selected-semicolon]
[fixture: eventmodeling/gram-nested-gwt-comment-line]
[fixture: eventmodeling/gram-nested-gwt-blank-line]
[fixture: eventmodeling/gram-nested-gwt-ls]
[fixture: eventmodeling/gram-nested-gwt-ps]
[fixture: eventmodeling/gram-nested-gwt-empty-description]
[fixture: eventmodeling/gram-nested-block-global-directive-line]
[fixture: eventmodeling/gram-nested-block-selected-semicolon]
[fixture: eventmodeling/gram-nested-block-comment-line]
[fixture: eventmodeling/gram-nested-block-blank-line]
[fixture: eventmodeling/gram-nested-block-ls]
[fixture: eventmodeling/gram-nested-block-ps]
[fixture: eventmodeling/gram-nested-block-empty-description]

GWT item の型の語と必須の参照名は別の部品である。
共通 directive だけの行、選ばれた semicolon、コメント行、空行、LS、
PS はその間を分けられる。
その位置の空の説明ブロックは名前にならず拒否する。 [fixture: eventmodeling/gram-gwt-item-directive-only-line]
[fixture: eventmodeling/gram-gwt-item-selected-semicolon]
[fixture: eventmodeling/gram-gwt-item-comment-line]
[fixture: eventmodeling/gram-gwt-item-blank-line]
[fixture: eventmodeling/gram-gwt-item-ls]
[fixture: eventmodeling/gram-gwt-item-ps]
[fixture: eventmodeling/gram-gwt-item-empty-description]

### 意味上の受理条件

[public parse の gate][parse]は recovered tree のエラーも含め、
lexer または parser のエラーをすべて拒否する。
[validator の登録][validator]があっても、
この wrapper は検証も参照のリンクも実行しない。
未知、前方、自己参照、重複定義、
source の型の組合せを拒否する追加の意味上の gate はない。
[adapter][adapter]は AST と共通 metadata を保存し、
[setAst][store]は保存するだけ。
描画と getState は受理の外。 [fixture: eventmodeling/error-start]
[fixture: eventmodeling/error-recovered]
[fixture: eventmodeling/error-after-prefix]
[fixture: eventmodeling/db-source-missing]
[fixture: eventmodeling/db-source-forward]
[fixture: eventmodeling/db-source-self]
[fixture: eventmodeling/db-frame-duplicates]
[fixture: eventmodeling/db-data-first]
[fixture: eventmodeling/db-entities-notes-gwt]
[fixture: eventmodeling/link-note-forward]
[fixture: eventmodeling/link-gwt-forward]
[fixture: eventmodeling/validator-command-invalid]
[fixture: eventmodeling/validator-event-invalid]
[fixture: eventmodeling/validator-readmodel-invalid]
[fixture: eventmodeling/validator-processor-invalid]
[fixture: eventmodeling/validator-ui-invalid]
[fixture: eventmodeling/validator-reset-invalid]
[fixture: eventmodeling/validator-multiple-invalid]

### 全出現の保持

frame の繰り返し、後の同名 data 宣言、未使用の entity、note、GWT を含め、
すべての文と参照の出現を原文順に残す。
上流の unassigned な文法の呼び出しがモデルから落とす GWT item の entity
type の語も保持する。
参照を解決せず、source 参照を sort や重複除去せず、
参照を選択した data で置き換えず、参照先があっても書いた inline
data を捨てない。
空 data や共通の空の形も node にする。
木に場所のある意味の読み違いは受理したままにする。 [fixture: eventmodeling/db-frame-duplicates]
[fixture: eventmodeling/db-data-first]
[fixture: eventmodeling/db-data-unused]
[fixture: eventmodeling/db-entities-notes-gwt]
[fixture: eventmodeling/gram-gwt-unassigned-type]
[fixture: eventmodeling/db-source-order]
[fixture: eventmodeling/db-data-reference-inline]
[fixture: eventmodeling/lex-inline-empty]
[fixture: eventmodeling/common-description-repeat]
[fixture: eventmodeling/gram-written-tree]

### 設定と Db の正規化

eventmodeling 固有の受理の鍵はない。
描画の padding や useMaxWidth は構文を変えず、不正な入力も救済しない。
[renderer][renderer]が parse の外で読む。
不正な埋め込み設定は共通の設定処理で失敗しえ、embedded-data-opaque で比較する。
拒否された埋め込み block を除くときも、独立した有効な metadata や設定を残す。
共通の sanitization の影響を受ける値と Db のすべての正規化は[tests の要約](../../../tests/docs/db-summaries.md#eventmodeling)が定義し、
この構文や書かれた木は定義しない。 [fixture: eventmodeling/config-drawing-site]
[fixture: eventmodeling/config-frontmatter-drawing]
[fixture: eventmodeling/config-init-drawing]
[fixture: eventmodeling/config-frontmatter-cannot-rescue]
[fixture: eventmodeling/config-init-cannot-rescue]
[fixture: eventmodeling/config-frontmatter-fontfamily-number]
[fixture: eventmodeling/config-init-fontfamily-number]
[fixture: eventmodeling/config-fontfamily-keeps-title]
[fixture: eventmodeling/div-invalid-keeps-config]
[fixture: eventmodeling/config-security-level-other]

## 既知の差異

上の atom に、
[directive-as-token-boundary](../known-divergences/directive-as-token-boundary.ja.md) と、
[ignored-semicolon-as-token-boundary](../known-divergences/ignored-semicolon-as-token-boundary.ja.md) を適用する。
除いた trivia 越しに単一 atom の断片を結合しない。
directive や semicolon だけを保持しても atom の綴りは保てない。
完全な作者の部品の間と text の内側では、
許された共通 trivia を保持する。 [fixture: eventmodeling/directive-arrow-inside]
[fixture: eventmodeling/directive-reference-inside]
[fixture: eventmodeling/directive-reference-close-inside]
[fixture: eventmodeling/lex-semicolon-identifier-inside]
[fixture: eventmodeling/lex-semicolon-frame-id-inside]
[fixture: eventmodeling/directive-qualified]
[fixture: eventmodeling/directive-reference]
[fixture: eventmodeling/directive-tag]

[html-tag-in-frontmatter](../known-divergences/html-tag-in-frontmatter.ja.md)は HTML の quote の変換を本当の frontmatter の後の text に限る。
opaque な frontmatter の中で始まる tag で後の値を書き換えない。
Mermaid が受理する入力の拒否、Mermaid が拒否する入力の受理、
accessibility 値だけの変化の三つを区別して残す。 [fixture: eventmodeling/div-html-frontmatter-accept]
[fixture: eventmodeling/div-html-frontmatter-reject]
[fixture: eventmodeling/div-html-frontmatter-value]
[fixture: eventmodeling/html-body-double-control]
[fixture: eventmodeling/html-body-mismatch-control]
[fixture: eventmodeling/prefix-yaml-html]
[fixture: eventmodeling/prefix-directive-html]

[embedded-data-opaque](../known-divergences/embedded-data-opaque.ja.md)は frontmatter の本文と共通 directive の引数を評価せず残す。
native inline/block data を opaque な設定にする規則ではない。
[c4-keyword-anywhere](../known-divergences/c4-keyword-anywhere.ja.md)は後の名前、
参照、text 内の C4 の語でなく見出しから図種を選ぶ。
裸の先頭行の空白と空の data/共通文には node や trivia としての場所があり、
bare-percent-line-before-header と tokenless-empty-forms は追加しない。 [fixture: eventmodeling/div-frontmatter-invalid]
[fixture: eventmodeling/div-init-invalid-colour]
[fixture: eventmodeling/div-init-primitive-wrap]
[fixture: eventmodeling/c4-container-data]
[fixture: eventmodeling/c4-component-identifier]
[fixture: eventmodeling/c4-dynamic-gwt]
[fixture: eventmodeling/c4-deployment-reference]
[fixture: eventmodeling/c4-component-header-lf]
[fixture: eventmodeling/bare-before-ls]
[fixture: eventmodeling/lex-inline-empty]
[fixture: eventmodeling/common-description-repeat]

[grammar]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/eventmodeling/event-modeling.langium#L1-L70
[entry]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/eventmodeling/event-modeling.langium#L9-L49
[names]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/eventmodeling/event-modeling.langium#L24-L55
[data]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/eventmodeling/event-modeling.langium#L17-L22
[data-terminals]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/eventmodeling/event-modeling.langium#L57-L58
[metadata]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/eventmodeling/event-modeling.langium#L60-L62
[hidden]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/eventmodeling/event-modeling.langium#L64-L70
[module]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/eventmodeling/module.ts#L31-L62
[token-builder]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/eventmodeling/tokenBuilder.ts#L1-L7
[common-token-builder]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/common/tokenBuilder.ts#L6-L29
[converter]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/common/valueConverter.ts#L6-L81
[parse]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/parse.ts#L133-L150
[validator]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/eventmodeling/event-modeling-validator.ts#L12-L66
[adapter]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/eventmodeling/parser.ts#L8-L14
[store]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/eventmodeling/db.ts#L50-L141
[renderer]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/eventmodeling/renderer.ts#L128-L167
[detector]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/eventmodeling/detector.ts#L4-L8
[preprocess]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/preprocess.ts#L6-L65
[detect-type]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/detectType.ts#L36-L48
[docs]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/eventmodeling.md#L1-L322
[parser-tests]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/tests/eventmodeling.test.ts#L1-L339
[mermaid-tests]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/eventmodeling/eventmodeling.spec.ts#L1-L79
