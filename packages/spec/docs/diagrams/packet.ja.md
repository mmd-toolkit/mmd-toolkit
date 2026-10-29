# Packet

英語版: [packet.md](./packet.md)

この文書は `packet` と `packet-beta` を定義する。
[木](../ast/packet.md)は書かれた形を保持し、
導出値は [tests の要約](../../../tests/docs/db-summaries.md#packet)で定める。
構文の根拠は、
[packet.langium](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/packet/packet.langium#L1-L21)
と、
[common.langium](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/common/common.langium#L6-L34)
である。 [fixture: packet/gram-mixed] [fixture: packet/spec-packet-c4580507]

## 検出

[detection.md](../detection.md) の 24 番、
[packet の detector](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/packet/detector.ts#L7-L15)
は、接尾辞境界なしで小文字の接頭辞 `packet` を選ぶ。
`packet-beta` も含み、どちらの図種 id も `packet` である。
検出だけで `packetx`、`packet2`、`packet-BETA` を受理することにはならない。
`Packet` は別名ではない。 [fixture: packet/spec-packet-7426afc4]
[fixture: packet/spec-packet-c4580507] [fixture: packet/header-letter-suffix]
[fixture: packet/header-digit-suffix] [fixture: packet/header-beta-uppercase]
[fixture: packet/header-uppercase]

[common.md](../common.md#reading-a-source) の先頭の trivia、実際の frontmatter、
変換を適用する。
どちらの見出しの前にも space、tab、空行、字下げを置ける。
実際の frontmatter は共有 Frontmatter であり、packet の文にはならない。
両 fence の直前の BOM が一致すると、
そのブロックは本物の先頭 frontmatter になり得る。
[fixture: packet/lex-yaml-bom-both-fences]
[fixture: packet/header-parser-packet-spaces]
[fixture: packet/header-parser-packet-tabs]
[fixture: packet/header-parser-packet-indented]
[fixture: packet/header-parser-beta-spaces]
[fixture: packet/header-parser-beta-tabs]
[fixture: packet/header-parser-beta-indented]
[fixture: packet/space-leading-unicode] [fixture: packet/frontmatter-title]

検出点では、
共通の [Frontmatter](../common.md#frontmatter)
の形を持つ残存ブロックを最大一つ、
裸の percent 対の行と二回目の directive scan より先に通過する。
ブロックは図のテキストに残り、native hidden YAML に一致する必要がある。
textBeforeHeader が PacketIgnoredText として所有し、そのプロパティは適用しない。
実際の frontmatter が先行し、二回目の scan の directive が後続してもよい。
二つ目のブロック、二回目の scan の directive の後、
通過した裸の行の後にあるブロックは通過しない。
先頭の trim が開始 fence の字下げだけを取り除き、
fence を不一致にする場合もある。 [fixture: packet/detect-one-block]
[fixture: packet/detect-yaml-properties-ignored]
[fixture: packet/detect-block-after-real-frontmatter]
[fixture: packet/detect-block-before-directive]
[fixture: packet/detect-two-blocks]
[fixture: packet/detect-directive-before-block]
[fixture: packet/detect-block-after-bare-brace]
[fixture: packet/detect-equally-indented] [fixture: packet/detect-opener-indent]

本文行のない隣接 fence、閉じの欠落、字下げの不一致、開始の四本 dash、
閉じ fence の接尾辞、必要な後続改行のない閉じは、その skip を止める。
隣接する三本の fence 行では、中間が本文行になり得る。
検出後も native の受理が必要であり、
開始の Unicode padding と閉じの後の読めない空白は拒否する。
[fixture: packet/detect-adjacent-fences] [fixture: packet/detect-unclosed-block]
[fixture: packet/detect-mismatched-indent] [fixture: packet/detect-four-dashes]
[fixture: packet/detect-closing-suffix] [fixture: packet/detect-no-closing-lf]
[fixture: packet/detect-three-fences] [fixture: packet/detect-opener-bom]
[fixture: packet/detect-closer-u3000]

二回目の scan だけで見つかった directive も textBeforeHeader に残し、
native DIRECTIVE の境界を要求するため、接着した見出しは拒否され得る。
一致する残存 directive が複数あれば、別々のノードにする。
`%%{}%%` と未閉鎖の `%%{!` を含む通過した裸の行は、
mark が `%%` の共有 Comment である。
それらと付随して通過した空白・改行は読み直さない。
[fixture: packet/detect-second-scan-directive]
[fixture: packet/detect-second-scan-glued]
[fixture: packet/detect-two-second-scan-forms]
[fixture: packet/detect-empty-braces-bare]
[fixture: packet/detect-unclosed-brace-bare]

裸の行とともに通過した共通の空白はすべて trivia とする。
見出しの直前、空白だけの行、残存する形の間でも同じである。
Mermaid の native な読みはそこで非 ASCII 空白を拒否するが、
本仕様は
[bare-percent-line-before-header](../known-divergences/bare-percent-line-before-header.md)
により受理する。
通過した行がなければ、同じ隙間は native な図のテキストのままである。
[fixture: packet/bare-before-header-space]
[fixture: packet/bare-line-ascii-whitespace]
[fixture: packet/bare-before-header-tab]
[fixture: packet/bare-before-header-bom] [fixture: packet/bare-before-header-ls]
[fixture: packet/bare-line-ps] [fixture: packet/retained-directive-bare-bom]
[fixture: packet/retained-yaml-bare-ls]
[fixture: packet/retained-yaml-bare-ls-line]
[fixture: packet/retained-directive-bare-ls]
[fixture: packet/detect-yaml-bare-directive-ascii]
[fixture: packet/div-detect-yaml-bare-directive-ls]
[fixture: packet/lex-retained-no-bare-ls]
[fixture: packet/bare-before-header-1680]
[fixture: packet/bare-before-header-2000]
[fixture: packet/bare-before-header-2001]
[fixture: packet/bare-before-header-2002]
[fixture: packet/bare-before-header-2003]
[fixture: packet/bare-before-header-2004]
[fixture: packet/bare-before-header-2005]
[fixture: packet/bare-before-header-2006]
[fixture: packet/bare-before-header-2007]
[fixture: packet/bare-before-header-2008]
[fixture: packet/bare-before-header-2009]
[fixture: packet/bare-before-header-200a]
[fixture: packet/bare-before-header-202f]
[fixture: packet/bare-before-header-205f]
[fixture: packet/bare-before-header-3000]
[fixture: packet/bare-before-header-ff]
[fixture: packet/bare-before-header-nbsp]
[fixture: packet/bare-before-header-ps] [fixture: packet/bare-before-header-vt]
[fixture: packet/bare-line-1680] [fixture: packet/bare-line-2000]
[fixture: packet/bare-line-2001] [fixture: packet/bare-line-2002]
[fixture: packet/bare-line-2003] [fixture: packet/bare-line-2004]
[fixture: packet/bare-line-2005] [fixture: packet/bare-line-2006]
[fixture: packet/bare-line-2007] [fixture: packet/bare-line-2008]
[fixture: packet/bare-line-2009] [fixture: packet/bare-line-200a]
[fixture: packet/bare-line-202f] [fixture: packet/bare-line-205f]
[fixture: packet/bare-line-3000] [fixture: packet/bare-line-bom]
[fixture: packet/bare-line-ff] [fixture: packet/bare-line-nbsp]
[fixture: packet/bare-line-vt]

## 字句構造

### 規則の順序

検出点から変換後の図のテキストを読み、上で通過した区間を除く。
各単位の開始で、次の順序の最初の一致を取り、直後から再開する。
一般的な最長一致ではない。
範囲の dash には明示的な長い代替があり、
同じ位置で hidden YAML 全体が一致すればそちらを選ぶ。
読めない文字があれば入力全体を拒否する。 [fixture: packet/gram-mixed]
[fixture: packet/hidden-yaml-body] [fixture: packet/lex-dash-before-yaml]
[fixture: packet/error-start] [fixture: packet/error-after-prefix]

1. `packet-beta`。
2. `packet`。
3. `range-dash`（`-`）。
   上記の hidden YAML の代替を持つ。
4. `relative-plus`（`+`）。
5. `colon`（`:`）。
6. `acc-descr-line` または `acc-descr-block`。
7. `acc-title-line`。
8. `title-line`。
9. `integer`。
10. `string`。
11. `newline`（LF）。
12. hidden な ASCII 空白。
13. hidden YAML。
14. hidden DIRECTIVE。
15. native comment。

import された BOOLEAN、FLOAT、NUMBER、ID は追加の単位を供給しない。
単独の boolean、名前、空文字列は拒否する。
文字列はブロックの label としてだけ使える。
[fixture: packet/gram-standalone-boolean] [fixture: packet/gram-standalone-name]
[fixture: packet/gram-standalone-empty-string]
[fixture: packet/gram-number-float] [fixture: packet/db-label-empty-double]

### 見出しの境界と隙間

`packet` だけは、直後に共通の空白、`%%`、またはテキストの終端を要求する。
文字、数字、underscore、dash、Unicode の文字、colon、hash、単独の percent、
brace、quote はこの境界を満たさない。
共通 directive と選ばれた semicolon を除いてから判定し、
除かれた directive だけでは境界にならない。
`packet-beta` にはこの検査がなく、ブロックや共通の形に接着できる。
[fixture: packet/header-letter-suffix] [fixture: packet/header-digit-suffix]
[fixture: packet/lex-header-underscore] [fixture: packet/header-dash-suffix]
[fixture: packet/header-unicode-suffix] [fixture: packet/lex-header-colon]
[fixture: packet/lex-header-hash] [fixture: packet/lex-header-percent]
[fixture: packet/lex-header-brace] [fixture: packet/lex-header-quote]
[fixture: packet/directive-header-glued]
[fixture: packet/directive-header-space-control]
[fixture: packet/header-beta-glued-block]
[fixture: packet/header-beta-glued-relative]
[fixture: packet/directive-beta-glued-relative]
[fixture: packet/header-beta-title]

境界は空白を消費せず、合法な隙間にもしない。
単位間で隠される空白は ASCII space/tab だけで、LF は可視である。
共通の CR・CRLF 変換を先に適用する。
NBSP、BOM、LS/PS などの共通空白は、
共通の先頭 trivia または包含する値・開始の隙間が許す場所だけで読める。
[fixture: packet/header-packet-spaces-before-lf]
[fixture: packet/header-packet-tab-before-lf]
[fixture: packet/header-beta-spaces-before-lf]
[fixture: packet/header-beta-tab-before-lf] [fixture: packet/space-count-tab]
[fixture: packet/space-header-nbsp] [fixture: packet/space-header-bom]
[fixture: packet/space-count-bom] [fixture: packet/lex-integer-trailing-gap-ls]
[fixture: packet/space-block-3000] [fixture: packet/line-cr]
[fixture: packet/line-crlf] [fixture: packet/line-ls-between]
[fixture: packet/line-ps-eof]

### 数値と文字列

整数は `0`、または非ゼロの ASCII 数字から始まる ASCII 数字列である。
後者は、直後が dot にならない範囲で最長に読む。
ゼロの代替は一桁で終わる。
非ゼロの一致は dot の前で短くなり得るが、残る文字は引き続き拒否の原因になる。
符号、小数点、指数、 NaN と Infinity の綴りは整数ではない。
[fixture: packet/gram-single-zero] [fixture: packet/gram-leading-zero]
[fixture: packet/lex-integer-shorter-before-dot]
[fixture: packet/gram-negative-zero] [fixture: packet/gram-number-dot]
[fixture: packet/gram-number-exponent] [fixture: packet/gram-number-nan]
[fixture: packet/gram-number-infinity]

文字列はどちらかの quote で始まり、同じ quote の閉じを必要とする。
その quote と backslash 以外の通常文字、
または backslash と LF・CR・LS・PS 以外の一文字を、
完全な構成要素として最長に繰り返す。
通常の内容には物理改行、LS/PS、反対の quote も含められる。
文字列は内部の native comment・YAML・native directive らしいテキストを所有する。
共通 directive と comment region は引き続き共通の適用範囲を持つ。
[fixture: packet/db-label-empty-double] [fixture: packet/db-label-empty-single]
[fixture: packet/db-label-single-escapes] [fixture: packet/lex-label-open]
[fixture: packet/lex-label-open-single] [fixture: packet/lex-label-multiline]
[fixture: packet/line-crlf-label] [fixture: packet/line-ls-label]
[fixture: packet/line-ps-label] [fixture: packet/html-all-fields]
[fixture: packet/lex-label-escaped-lf] [fixture: packet/lex-label-escaped-ls]
[fixture: packet/lex-label-escaped-ps] [fixture: packet/lex-label-comment]
[fixture: packet/hidden-yaml-in-label]
[fixture: packet/lex-label-native-directive]
[fixture: packet/directive-label-middle]
[fixture: packet/lex-label-comment-line]

NumericLiteral は raw に書かれた数字、value にその double 値を保持する。
StringLiteral は raw に quote と escape、value に書かれた内側を保持し、
escape の復号や空白の正規化をしない。
Db の変換は別である。 [fixture: packet/db-precision-rounded]
[fixture: packet/db-overflow-wide] [fixture: packet/db-label-escapes]
[fixture: packet/db-label-space]

### 複合した共通の形

各共通の形の前には ASCII の字下げを置ける。
`title-line` は `title` 単独、
またはその後の一つの ASCII space/tab と空でもよい行テキストである。
`acc-title-line` は `accTitle`、ゼロ個以上の ASCII space/tab、 colon、
空でもよい行テキストで、`acc-descr-line` は `accDescr` を使う。
構成要素の規則は大文字小文字を区別し、見出しの独自の境界は使わない。
二つの accessibility の行形は colon を必要とする。 [fixture: packet/title-empty]
[fixture: packet/lex-title-one-space] [fixture: packet/lex-title-one-tab]
[fixture: packet/lex-title-two-spaces] [fixture: packet/common-whitespace]
[fixture: packet/acctitle-empty] [fixture: packet/accdescr-line-empty]
[fixture: packet/acctitle-no-colon] [fixture: packet/title-colon]
[fixture: packet/title-uppercase] [fixture: packet/acctitle-uppercase]
[fixture: packet/accdescr-uppercase] [fixture: packet/common-title-nbsp-gap]
[fixture: packet/common-acctitle-nbsp-gap]

行テキストは最初の `%%` または物理行末の前で終わる。
LS/PS、単独の percent、句読点、quote、backslash、
後の keyword に見えるものも内容のままである。
quote の閉じは不要で、escape は文字列構文ではない。
空の値は comment 行を挟んでも次の物理行を取らない。
[fixture: packet/comment-title] [fixture: packet/comment-acctitle]
[fixture: packet/comment-accdescr] [fixture: packet/common-title-ls]
[fixture: packet/common-acctitle-ps] [fixture: packet/common-accdescr-ls]
[fixture: packet/title-open-quote] [fixture: packet/title-quotes]
[fixture: packet/acctitle-quoted] [fixture: packet/accdescr-line-quoted]
[fixture: packet/end-line-semicolons]
[fixture: packet/common-line-consumes-keyword]
[fixture: packet/lex-common-line-percent]
[fixture: packet/common-line-no-next-value] [fixture: packet/common-comment-gap]

`acc-descr-block` は `accDescr`、ゼロ個以上の共通空白、 `{`、
最初の必須の `}` までの任意のテキストである。
開始の隙間には LF、空行、LS/BOM、共通 directive を置けるが、
残存する native comment では橋渡しできない。
内容には LF/LS/PS を含む。
brace は入れ子にならず、quote と backslash は閉じを保護しない。
colon があれば代わりに行テキストを選び、 brace もその内容となる。
[fixture: packet/accdescr-block-gap-lf]
[fixture: packet/lex-block-native-comment-inline-gap]
[fixture: packet/lex-block-gap-comment-region]
[fixture: packet/accdescr-block-gap-ls] [fixture: packet/accdescr-block-gap-bom]
[fixture: packet/common-empty-gap] [fixture: packet/common-directive-gap]
[fixture: packet/accdescr-block-lines] [fixture: packet/common-block-ps]
[fixture: packet/gram-empty-description]
[fixture: packet/accdescr-block-first-close]
[fixture: packet/accdescr-block-escaped-close]
[fixture: packet/lex-description-quoted-close]
[fixture: packet/lex-description-nested-open]
[fixture: packet/accdescr-block-open]
[fixture: packet/lex-description-colon-first]

### hidden な形

単位の開始では、hidden YAML は `---`、ゼロ個以上の ASCII space/tab、
LF で始まり、物理行の先頭でなくてもよい。
まず本文ありの一致を試す。
任意の文字を最短に読み、後の LF と字下げのない `---`、
その直後の LF・共通空白・EOF を探す。
これが一致できない場合だけ、開始 LF の直後に閉じがある空の形を試す。
本文には LF/LS/PS を含み、YAML として解釈しない。
開始の四本 dash、Unicode padding、字下げされた閉じ、閉じの欠落は一致しないが、
範囲の dash の直後に有効な YAML opener を置ける。
[fixture: packet/hidden-yaml-padding] [fixture: packet/hidden-yaml-body]
[fixture: packet/hidden-yaml-adjacent-eof]
[fixture: packet/hidden-yaml-adjacent-later]
[fixture: packet/lex-yaml-body-separators] [fixture: packet/lex-yaml-opener-bom]
[fixture: packet/lex-hidden-yaml-four-dashes]
[fixture: packet/hidden-yaml-indent-close]
[fixture: packet/hidden-yaml-unclosed] [fixture: packet/lex-dash-before-yaml]

隣接する三本の fence は一つの一致になり得る。
二つの空ブロックに見える形では四本目の fence が余る場合がある。
閉じの境界を満たす本文ありの二ブロックは別々のままである。
境界を満たさない閉じは、後の閉じが条件を満たすまで本文に残る。
[fixture: packet/hidden-yaml-adjacent-later]
[fixture: packet/lex-yaml-two-empty] [fixture: packet/lex-yaml-two-nonempty]
[fixture: packet/hidden-yaml-nonqualifying]

任意の ASCII padding の後、native hidden DIRECTIVE は `%%{` で始まり、
直後が LF・共通空白・EOF の `}%%` まで任意の文字を最短に読む。
空・非単語の内容と LF/LS/PS を許す。
境界を満たさない閉じは後の閉じのために通過する。
条件を満たす閉じがなければ、代わりに native comment の規則が適用され得る。
[fixture: packet/hidden-directive-header]
[fixture: packet/hidden-directive-empty-adjacent]
[fixture: packet/lex-directive-body-separators]
[fixture: packet/hidden-directive-later-close]
[fixture: packet/hidden-directive-close-glued]
[fixture: packet/hidden-directive-unclosed]

両形は直後の LF を消費する。
ほかの条件を満たす空白は先読みだけであり、後続の位置で読める必要がある。
文の後の唯一の LF を消費すると、次の文へ進めない。
余分な LF、または閉じの直後の ASCII space/tab は可視 EOL を残す。
元の EOF では追加 LF を消費しても、EOF が EOL を満たす。
消費した行終端は PacketIgnoredText の範囲の外である。
[fixture: packet/hidden-directive-block]
[fixture: packet/hidden-directive-block-spare]
[fixture: packet/hidden-directive-block-space]
[fixture: packet/hidden-directive-block-eof]
[fixture: packet/hidden-directive-title]
[fixture: packet/hidden-directive-title-spare]
[fixture: packet/hidden-directive-title-space]
[fixture: packet/hidden-directive-title-eof]
[fixture: packet/hidden-directive-acctitle]
[fixture: packet/hidden-directive-acctitle-spare]
[fixture: packet/hidden-directive-acctitle-space]
[fixture: packet/hidden-directive-acctitle-eof]
[fixture: packet/hidden-directive-accdescr]
[fixture: packet/hidden-directive-accdescr-spare]
[fixture: packet/hidden-directive-accdescr-space]
[fixture: packet/hidden-directive-accdescr-eof]
[fixture: packet/hidden-directive-description]
[fixture: packet/hidden-directive-description-spare]
[fixture: packet/hidden-directive-description-space]
[fixture: packet/hidden-directive-description-eof]
[fixture: packet/hidden-yaml-block] [fixture: packet/hidden-yaml-block-spare]
[fixture: packet/hidden-yaml-block-space]
[fixture: packet/hidden-yaml-block-eof]
[fixture: packet/hidden-yaml-description]
[fixture: packet/hidden-yaml-description-spare]
[fixture: packet/hidden-yaml-description-space]
[fixture: packet/hidden-yaml-description-eof]
[fixture: packet/hidden-directive-close-ls]
[fixture: packet/hidden-yaml-close-ps] [fixture: packet/hidden-directive-cr]
[fixture: packet/hidden-directive-crlf] [fixture: packet/hidden-yaml-cr]
[fixture: packet/hidden-yaml-crlf]

hidden な形全体の所有者は一つだけであり、textBeforeHeader、body、
文の名前付きの隙間・接尾辞のいずれかである。
可視 EOL の後は body に属する。
先行する文字列・行値・説明ブロックは、内部の hidden らしい形を代わりに所有する。
行値は YAML の dash を吸収する。
hidden な形は単位を区切り、整数や固定語を連結しない。
[fixture: packet/gram-hidden-gap] [fixture: packet/gram-single-hidden-gaps]
[fixture: packet/gram-relative-hidden-colon]
[fixture: packet/gram-hidden-range-gap-spaced]
[fixture: packet/gram-hidden-range-gap] [fixture: packet/gram-hidden-yaml-gap]
[fixture: packet/gram-yaml-around-range]
[fixture: packet/lex-hidden-after-visible-eol]
[fixture: packet/lex-hidden-two-suffixes]
[fixture: packet/lex-yaml-directive-sequence]
[fixture: packet/hidden-yaml-in-label]
[fixture: packet/hidden-yaml-in-description]
[fixture: packet/hidden-yaml-title-absorbed]
[fixture: packet/hidden-yaml-acctitle-absorbed]
[fixture: packet/hidden-yaml-accdescr-absorbed]
[fixture: packet/lex-hidden-between-digits]

### comment と共通 trivia

native comment は任意の ASCII 字下げ、`%%`、
物理 LF/CR の前までの最長の内容を読む。
LS/PS は内容のままである。
mark は `%%`、value はその後である。
前の文字も終端の改行も Comment に含めない。
裸の percent 対と三個の percent は許すが、単独の percent は許さない。
[fixture: packet/comment-header] [fixture: packet/comment-block]
[fixture: packet/comment-eof] [fixture: packet/comment-bare]
[fixture: packet/lex-native-comment-triple]
[fixture: packet/lex-native-comment-single]
[fixture: packet/lex-native-comment-ls] [fixture: packet/lex-native-comment-ps]

comment は共有の記録で、PacketIgnoredText にはしない。
説明ブロックは裸の percent 行を所有し、共通 comment region は引き続き除く。
説明内の native directive らしい形は最初の brace で説明を閉じ、
native comment を残し得る。 [fixture: packet/common-block-bare]
[fixture: packet/common-block-comment]
[fixture: packet/lex-description-comment-only]
[fixture: packet/lex-description-hidden-first-brace]

共通 directive、comment region、選ばれた semicolon は、
値や hidden な形の中でも共通の適用範囲を持つ。
書かれた値の欄ではそれらを除き、範囲は内部 trivia をまたぐ。
除去により hidden な delimiter や native comment の mark の句読点を連結できる。
完全な共通 keyword と colon・brace・title の区切りの間にも置ける。
固定語と整数の内部には、代わりに後述の単位境界の差異を適用する。
[fixture: packet/directive-label-middle] [fixture: packet/directive-title-value]
[fixture: packet/directive-acctitle-value]
[fixture: packet/directive-accdescr-value]
[fixture: packet/directive-description-value]
[fixture: packet/lex-hidden-nested-global]
[fixture: packet/lex-yaml-common-comment]
[fixture: packet/detect-second-scan-directive]
[fixture: packet/lex-yaml-opener-global]
[fixture: packet/lex-yaml-closer-global]
[fixture: packet/lex-hidden-joined-opener]
[fixture: packet/lex-hidden-joined-closer]
[fixture: packet/lex-native-comment-split-mark]
[fixture: packet/lex-yaml-fence-selected]
[fixture: packet/lex-hidden-opener-selected]
[fixture: packet/lex-hidden-closer-selected]
[fixture: packet/directive-acctitle-colon]
[fixture: packet/directive-accdescr-colon]
[fixture: packet/directive-accdescr-brace]
[fixture: packet/directive-title-separator]
[fixture: packet/lex-selected-colon-boundary]
[fixture: packet/lex-selected-brace-boundary]

共通の style/classDef 行の規則は条件に合う semicolon だけを選ぶ。
残る semicolon は値の外では拒否され、packet の文の区切りにはならない。
HTML 属性の quote と entity は共通の変換に従うが、木は書かれた綴りを保持する。
[fixture: packet/style-label] [fixture: packet/style-title]
[fixture: packet/style-description-end]
[fixture: packet/style-description-double] [fixture: packet/end-block-semicolon]
[fixture: packet/end-header-semicolon] [fixture: packet/html-all-fields]
[fixture: packet/entity-all-text] [fixture: packet/entity-block]

## 文法

```text
diagram = newline* ("packet" | "packet-beta")
          (block | common-statement | newline)* end-of-text
block = (range-block | single-block | relative-block) eol
range-block = integer range-dash integer colon string
single-block = integer colon string
relative-block = relative-plus integer colon string
common-statement = (title-line | acc-title-line
                   | acc-descr-line | acc-descr-block) eol
eol = newline+ | end-of-text
```

[共通の記法](../common.md#notation)を使う。
hidden な形の所有者は木で定め、可視の区切りは供給しない。
body は空でもよく、見出しの後に改行は不要である。
ブロックと共通文は交互に置ける。
showInfo・showBits flag はなく、二回目の見出しは拒否する。
[fixture: packet/spec-packet-7426afc4] [fixture: packet/header-inline-block]
[fixture: packet/header-inline-title] [fixture: packet/header-beta-title]
[fixture: packet/gram-common-interleaved] [fixture: packet/gram-no-showinfo]
[fixture: packet/gram-no-showbits] [fixture: packet/gram-second-header]

完結した各ブロック・共通の形は可視 EOL または EOF を必要とする。
空行は文の前・間・後に置け、末尾の EOL は余分な body 要素を作らない。
可視改行、comment 行、空の説明はブロックの構成要素間には置けない。
端点・colon・引用された label の欠落と、同じ行に隣接するブロック、
完結したブロックの後の共通文は拒否する。
[fixture: packet/gram-block-blank-lines] [fixture: packet/comment-inside-range]
[fixture: packet/gram-visible-newline-in-block]
[fixture: packet/gram-empty-description-in-block]
[fixture: packet/gram-end-missing] [fixture: packet/gram-colon-missing]
[fixture: packet/gram-label-missing] [fixture: packet/gram-bare-label]
[fixture: packet/gram-same-line-blocks]
[fixture: packet/gram-block-title-same-line]
[fixture: packet/common-block-needs-eol]

| 規則            | ノード                       |
| --------------- | ---------------------------- |
| diagram         | PacketDiagram                |
| range-block     | PacketRangeBlockStatement    |
| single-block    | PacketSingleBlockStatement   |
| relative-block  | PacketRelativeBlockStatement |
| title-line      | PacketTitleStatement         |
| acc-title-line  | PacketAccTitleStatement      |
| acc-descr-line  | PacketAccDescrStatement      |
| acc-descr-block | PacketAccDescrBlockStatement |
| integer         | NumericLiteral               |
| string          | StringLiteral                |
| 共通の値        | PacketLiteral                |
| hidden な形全体 | PacketIgnoredText            |

### Db の正規化

[tests の packet 要約](../../../tests/docs/db-summaries.md#packet)が、
変換されたテキスト、最終的な共通値、公開される行を定める。
これらは導出値であり、追加の構文ノードや受理条件ではない。
反復、空の値、公開上限後に省略されたブロックも含め、各文を保持する。
[fixture: packet/gram-mixed] [fixture: packet/db-label-escapes]
[fixture: packet/title-repeat-empty] [fixture: packet/accdescr-block-repeat]
[fixture: packet/db-cap-following-block-unpublished]
[fixture: packet/db-cap-later-logical-end]

### 意味上の受理条件

字句・文法の全体の受理後、次の条件を文の順序で適用する。
lexer/parser の error または未消費の可視単位があれば、
有効な接頭辞や回復があってもソース全体を拒否する。
label と共通値は追加の意味上の拒否を起こさない。
根拠は、
[public wrapper](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/parse.ts#L134-L150)
と、
[packet adapter](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/packet/parser.ts#L11-L90)
である。 [fixture: packet/error-after-prefix]
[fixture: packet/error-recovered-block] [fixture: packet/db-label-empty-double]
[fixture: packet/gram-empty-description]

書かれた整数と以下の各演算には IEEE 754 double を使い、丸めと overflow を含め、
記載した演算順序を保つ。
最後の論理端点は最初はマイナス一である。
各ブロックでは、まず明示した範囲の end が start より小さければ拒否する。
等しい端点は許す。
次に相対ブロックの start を最後の論理端点に一を加えた値とし、
明示したすべての start にも、丸めた後の double 値で同じ値との一致を要求する。
その後で相対 count のゼロを拒否する。 [fixture: packet/db-precision-rounded]
[fixture: packet/db-overflow-wide] [fixture: packet/error-descending-before-gap]
[fixture: packet/gram-zero-range] [fixture: packet/error-first-nonzero]
[fixture: packet/error-overlap] [fixture: packet/error-repeat-third]
[fixture: packet/gram-mixed] [fixture: packet/spec-packet-a0e6e5ca]
[fixture: packet/error-zero-after-valid]
[fixture: packet/db-explicit-start-rounded]
[fixture: packet/db-explicit-end-rounded-continuity]
[fixture: packet/db-explicit-end-and-start-rounded-continuity]
[fixture: packet/db-explicit-end-overflow-continuity]

たとえば、書かれた明示 start `9007199254740993` は、
連続性の比較の前に `9007199254740992` へ丸められる。

たとえば、明示 end が `9007199254740992` の後では、
一を加えても同じ端点になるため、
次の start が `9007199254740992` と書かれていても、
`9007199254740993` と書かれていても、
前の範囲に重なるブロックは連続性の比較を通る。

書かれた明示 end と次の start がともに無限大へ overflow すると、
一を加えても無限大のままなので、連続性の比較は次のブロックを受理する。
[fixture: packet/db-explicit-end-overflow-continuity]

相対ブロックの論理 end は、start に書かれた count を加え、その後で一を引く。
単一ブロックでは start に一を加えてから一を引き、範囲では明示した end を使う。
行の分割より前に、最後の論理端点をその end に更新する。
共通文、comment、hidden な形はこれを更新しない。
これらの演算を代数的に簡略化した式へ置き換えない。 [fixture: packet/gram-mixed]
[fixture: packet/gram-common-interleaved] [fixture: packet/comment-block]
[fixture: packet/lex-hidden-after-visible-eol]
[fixture: packet/db-rounded-following-unpublished]
[fixture: packet/error-rounded-following-wide]
[fixture: packet/error-single-rounded-end-wide]
[fixture: packet/db-single-rounded-end-default]

たとえば、start が `9007199254740992` の単一ブロックでは、
この演算順で end が `9007199254740991` となり、
サイトの行幅 `10000000000000000` では保留 fragment の検査が拒否するが、
既定幅では先に公開上限に達するため受理する。

行幅は `packet.bitsPerRow` で、既定値は 32 である。
サイト設定で変わる場合は、flowchart のサイト上限 maxEdges と同様に、
設定を持つ者が以下の検査へ適用する。
上の残りのブロック検査は木だけから決める。
schema の検証を構文上の拒否として追加しない。
埋め込みの frontmatter/directive 設定は、これらの受理条件を変えない。
テキスト設定の `packet.bitsPerRow` でどちらかの方向に受理が変わる入力には、
[embedded-data-opaque](../known-divergences/embedded-data-opaque.md) を付ける。
[fixture: packet/config-fraction-default]
[fixture: packet/config-fraction-reject] [fixture: packet/config-rows-eight]
[fixture: packet/config-frontmatter-fraction]
[fixture: packet/config-directive-fraction]
[fixture: packet/config-frontmatter-overrides-site]
[fixture: packet/config-directive-overrides-site]
[fixture: packet/config-frontmatter-row-fraction-accepted]
[fixture: packet/config-frontmatter-row-zero]
[fixture: packet/config-frontmatter-row-negative]

行境界の検査には、最初は一の行番号、最初はゼロの現在行の fragment 数、
最初はゼロの公開済み行数を持つ。
これらはブロックをまたいで保持する。
各ブロックでは論理 start と end を保留中の fragment とする。
現在行の fragment 数が行幅に一を加えた値以下で、
公開済み行数が 10,000 未満の間だけ、次の反復に入る。
[fixture: packet/db-row-split] [fixture: packet/db-row-exact]
[fixture: packet/config-fraction-reject]
[fixture: packet/db-rounded-following-unpublished]
[fixture: packet/error-rounded-following-wide]

入った各反復では、まず保留 start が end を超えれば拒否する。
保留 end に一を加えた値が行番号と行幅の積以下なら、 fragment はそのまま収まり、
残りはない。
それ以外では収まる end を行番号と行幅の積から一を引いた値とし、
残りの start を行番号と行幅の積、end を元の保留 end とする。
現在行の fragment 数を一増やす。
収まる end に一を加えた値が行番号と行幅の積に等しければ、
公開済み行数と行番号を一ずつ増やし、現在行の fragment 数をゼロに戻す。
残りがあれば入口条件から繰り返し、なければこのブロックを終える。
[fixture: packet/db-row-split] [fixture: packet/db-row-exact]
[fixture: packet/config-fraction-reject]
[fixture: packet/error-rounded-following-wide]

既定の行幅 32 では、2^53 未満の整数とその演算は正確であり、
逆転が可能な 2^53 付近の開始に達する前に 10,000 行の上限に達するため、
保留 start が end を超える拒否は起こらない。
この拒否が効くのは、変更されたサイトの行幅を適用する者だけである。
[fixture: packet/db-single-rounded-end-default]
[fixture: packet/error-single-rounded-end-wide]
[fixture: packet/db-rounded-following-unpublished]
[fixture: packet/error-rounded-following-wide]

公開上限に達すると、その後の行境界の反復は飛ばすが、
後のブロックの降順範囲・連続性・ゼロ count の検査は続ける。
論理 end の更新も続ける。
したがって、後のブロックが受理され、公開されずに木に残ることがある。
[fixture: packet/db-cap-following-block-unpublished]
[fixture: packet/db-cap-later-logical-end]
[fixture: packet/error-cap-following-descending]
[fixture: packet/error-cap-following-noncontiguous]
[fixture: packet/error-cap-following-zero]
[fixture: packet/db-rounded-following-unpublished]

## 既知の差異

適用するのは以下の既存の六識別子だけで、
[各文書](../known-divergences.md)が理由と比較読みを定める。
hidden な形全体、空 label、空の説明には独自のノードがあり、
tokenless-empty-forms の差異は不要である。 [fixture: packet/hidden-yaml-body]
[fixture: packet/db-label-empty-double] [fixture: packet/gram-empty-description]

- **[directive-as-token-boundary](../known-divergences/directive-as-token-boundary.md).**
  共有 Directive がテキストを保持するが、
  固定語と整数の内部に構成要素の境界はない。
  理由 2 の直接の単位規則で分割形を拒否する。
  完全な keyword/colon・keyword/brace の境界と、
  値のテキストは差異のない対照である。 [fixture: packet/directive-header-middle]
  [fixture: packet/directive-beta-middle]
  [fixture: packet/directive-title-middle]
  [fixture: packet/directive-acctitle-middle]
  [fixture: packet/directive-accdescr-middle]
  [fixture: packet/directive-number-middle]
  [fixture: packet/directive-acctitle-colon]
  [fixture: packet/directive-accdescr-brace]
  [fixture: packet/directive-label-middle]
- **[ignored-semicolon-as-token-boundary](../known-divergences/ignored-semicolon-as-token-boundary.md).**
  選ばれた文字は trivia だが、固定語や整数を分割できない。
  完全な構成要素の境界や hidden な句読点には置ける。
  検出は選択より先なので、分割された見出しは差異に至る前に拒否され得る。
  [fixture: packet/div-selected-title-interior]
  [fixture: packet/div-selected-acctitle-interior]
  [fixture: packet/div-selected-accdescr-line-interior]
  [fixture: packet/div-selected-accdescr-block-interior]
  [fixture: packet/div-selected-integer-interior]
  [fixture: packet/lex-selected-colon-boundary]
  [fixture: packet/lex-selected-brace-boundary]
  [fixture: packet/lex-yaml-fence-selected]
  [fixture: packet/detect-selected-split-header]
- **[html-tag-in-frontmatter](../known-divergences/html-tag-in-frontmatter.md).**
  Frontmatter と値は原文を保持するが、
  本文の quote 変換は不透明な frontmatter の未閉鎖 tag に依存しない。
  値が変わる場合と、両方向に受理が逆転する場合があり、本文だけの対照は一致する。
  [fixture: packet/div-html-frontmatter-value]
  [fixture: packet/div-html-frontmatter-accept]
  [fixture: packet/div-html-frontmatter-reject]
  [fixture: packet/gram-html-body-only-reference]
- **[embedded-data-opaque](../known-divergences/embedded-data-opaque.md).**
  Frontmatter/directive ノードは内容を受理のために解釈せず保持する。
  不正な YAML は Mermaid だけが拒否する場合がある。
  両方向とも比較では有効なテキスト設定から `packet.bitsPerRow` だけを除き、
  サイト設定、Mermaid が導いた frontmatter title、ほかの有効な設定を残す。
  [fixture: packet/frontmatter-invalid]
  [fixture: packet/frontmatter-invalid-keeps-config]
  [fixture: packet/config-frontmatter-fraction]
  [fixture: packet/config-directive-fraction]
  [fixture: packet/config-frontmatter-overrides-site]
  [fixture: packet/config-directive-overrides-site]
- **[c4-keyword-anywhere](../known-divergences/c4-keyword-anywhere.md).**
  文字列、共通 literal、ignored text、Comment は C4 語を保持できる。
  理由 2 の逆方向の見出しだけの選択により、
  Mermaid が C4 へ切り替えて拒否する後続の C4 語を受理する。
  Mermaid が受理する入力は拒否しない。
  LF 終端の接尾辞と検出が通過した残存 YAML は差異のない対照である。
  [fixture: packet/c4container-label] [fixture: packet/c4component-title]
  [fixture: packet/c4deployment-block]
  [fixture: packet/c4dynamic-header-comment-eof]
  [fixture: packet/div-c4-hidden-yaml]
  [fixture: packet/div-c4-hidden-suffix-eof]
  [fixture: packet/c4-hidden-suffix-lf]
  [fixture: packet/c4-retained-preheader-yaml]
- **[bare-percent-line-before-header](../known-divergences/bare-percent-line-before-header.md).**
  通過した行は共有 Comment、付随する空白は trivia である。
  直接の検出規則は残存する形の間も含め、
  Mermaid が拒否する Unicode trivia を受理する。
  Mermaid が受理する入力は拒否しない。
  通過した行がなければ native な隙間の規則を適用する。
  [fixture: packet/bare-before-header-bom] [fixture: packet/bare-line-ls]
  [fixture: packet/retained-yaml-bare-ls]
  [fixture: packet/div-detect-yaml-bare-directive-ls]
  [fixture: packet/detect-yaml-bare-directive-ascii]
  [fixture: packet/lex-retained-no-bare-ls]
