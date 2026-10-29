# Treemap

英語版: [treemap.md](./treemap.md)

この文書は `treemap` と `treemap-beta` を定義する。
[木](../ast/treemap.md)は書かれた構文を保ち、
導出値は [tests の要約](../../../tests/docs/db-summaries.md#treemap)が定める。
構文の根拠は [treemap.langium][grammar] である。
[fixture: treemap/gram-written-tree] [fixture: treemap/header-beta]

## 検出

[detection.md](../detection.md) の 31 番、 [treemap の detector][detector] は、
後続の境界を要求せず小文字の接頭辞 `treemap` を選ぶ。
受理する見出しは `treemap-beta` と `treemap` で、
どちらの diagram id も `treemap` である。
大文字、見出しの反復、見出しの colon、読めない接尾辞は拒否する。
検出だけでは受理を決めない。 [fixture: treemap/header-beta]
[fixture: treemap/spec-treemap-test-ts-892fa294]
[fixture: treemap/header-uppercase] [fixture: treemap/header-repeat]
[fixture: treemap/header-colon] [fixture: treemap/header-letter-suffix]
[fixture: treemap/header-digit-suffix]
[fixture: treemap/header-underscore-suffix]
[fixture: treemap/header-dash-suffix] [fixture: treemap/header-unicode-suffix]

[共通の前処理](../common.md#reading-a-source)を適用する。
先頭の frontmatter、global directive、comment region、先頭の空白、改行、
HTML 属性の引用符、entity、選択された semicolon が対象となる。
本物の先頭 frontmatter は共有 Frontmatter record とする。
先に試す C4 の detector が後の C4 の語に一致する場合は、
後述の共通の見出し選択の差異を適用する。 [fixture: treemap/frontmatter-title]
[fixture: treemap/frontmatter-crlf] [fixture: treemap/detect-equally-indented]
[fixture: treemap/comment-leading] [fixture: treemap/space-bom-leading]
[fixture: treemap/line-cr] [fixture: treemap/line-crlf]
[fixture: treemap/html-fields] [fixture: treemap/entity-names]
[fixture: treemap/style-fields] [fixture: treemap/c4-component-section]

検出点では、
共通の [Frontmatter の形](../common.md#frontmatter)を満たす残存 block
を高々一つ、裸の percent 対の行と第 2 directive scan より先に通す。
block は図のテキストに残る。
treemap に native YAML の規則はなく、通した block でも拒否する。
第 2 の block、通した裸の行の後、
第 2 scan の directive の後の block は通さない。
本物の frontmatter が残存 block より前にあってもよい。
[fixture: treemap/detect-retained-body-yaml-no-native]
[fixture: treemap/detect-two-body-blocks]
[fixture: treemap/detect-block-after-bare-brace]
[fixture: treemap/detect-second-scan-before-yaml]
[fixture: treemap/detect-yaml-before-second-scan]
[fixture: treemap/detect-block-after-frontmatter]

本文行のない隣接 fence、閉じの欠落、字下げの不一致、開始の四本の dash、
閉じの接尾辞、後続改行のない閉じは skip を止める。
先頭の trim が開始側の字下げだけを除き、不一致を作る場合もある。
閉じの padding と LF が検出の条件を満たしても、 native の読みは拒否する。
[fixture: treemap/retained-yaml-no-bare] [fixture: treemap/frontmatter-unclosed]
[fixture: treemap/detect-retained-indent-mismatch]
[fixture: treemap/detect-retained-four-dashes]
[fixture: treemap/detect-retained-close-suffix]
[fixture: treemap/detect-retained-close-without-lf]
[fixture: treemap/detect-retained-leading-indent-trim]
[fixture: treemap/detect-retained-closing-space]

検出の第 2 directive scan だけで成立する形も図のテキストに残る。
`%%{%%{wrap}%%wrap}%%`、改行、`treemap` の入力では、
内側のソースの directive を除くと一行の percent の形が残る。
native Comment として読み、新しい Directive や ignored-text node にしない。
内側のソースの directive は Root.directives に一度だけ残す。
複数行に残った形の閉じの行が comment でなければ拒否する。
native comment が接着した見出しを飲む場合も拒否する。
[fixture: treemap/detect-second-scan-single-line-comment]
[fixture: treemap/detect-second-scan-multiline-rejected]
[fixture: treemap/detect-second-scan-multiline-glued]
[fixture: treemap/detect-second-scan-single-line-header-swallowed]

検出で通す裸の percent 対の行は、mark が `%%` の共有 Comment とする。
付随する空白と改行は trivia とし、残存する形の前後・間、空白だけの行、
見出しの直前でも読み直さない。
残存する形そのものは読める必要がある。
bare-percent-line-before-header により、
Mermaid が拒否する ASCII・Unicode の gap の一部を受理する。
通した裸の行がなければ、その後の gap は native の図のテキストであり、
その場所の Unicode の空白は拒否する。
[fixture: treemap/bare-before-header-space]
[fixture: treemap/bare-before-header-tab]
[fixture: treemap/bare-before-header-ls] [fixture: treemap/bare-line-nbsp]
[fixture: treemap/retained-directive-before-bare]
[fixture: treemap/retained-directive-between-bare]
[fixture: treemap/div-retained-before-bare-unicode-line]
[fixture: treemap/div-bare-before-retained-unicode-line]
[fixture: treemap/div-bare-retained-ascii-padding]
[fixture: treemap/div-retained-bare-ascii-line]
[fixture: treemap/div-bare-retained-unicode-header]
[fixture: treemap/div-bare-retained-ascii-header]
[fixture: treemap/detect-retained-bare-lf-control]
[fixture: treemap/lex-retained-no-bare-unicode-line]
[fixture: treemap/lex-retained-no-bare-unicode-header]
[fixture: treemap/detect-retained-yaml-bare-ascii-gap]

## 字句構造

### 規則の優先順

前述の通過区間を除き、検出点から変換後の図のテキストを読む。
各 unit の開始位置で次の最初の成立する規則を取り、その後で再開する。
全体で最長の一致を選ぶ規則や明示的な longer alternative はない。
どの規則でも読めない文字があれば入力を拒否する。
空白を一般に読み飛ばす規則ではない。 [fixture: treemap/gram-written-tree]
[fixture: treemap/gram-selector-reserved-treemap]
[fixture: treemap/lex-class-name-title-prefix] [fixture: treemap/db-class-names]
[fixture: treemap/error-start] [fixture: treemap/error-after-prefix]
[fixture: treemap/gram-header-trailing-indent-eof]

| 順  | unit または trivia                | 読み                                                     |
| --- | --------------------------------- | -------------------------------------------------------- |
| 1   | acc-descr-line or acc-descr-block | 前置空白を含む共通の description。colon 形式を先に試す。 |
| 2   | acc-title-line                    | 前置空白を含む accessibility title。                     |
| 3   | title-line                        | 前置空白を含む title。keyword だけの選択肢もある。       |
| 4   | Header                            | `treemap-beta`、`treemap` の順。                         |
| 5   | class-definition                  | 後述の classDef の形全体。                               |
| 6   | class-marker                      | `:::`。                                                  |
| 7   | colon                             | `:`。                                                    |
| 8   | comma                             | `,`。                                                    |
| 9   | indentation                       | 空でない ASCII space・tab の最大の連続。                 |
| 10  | Hidden WS                         | space・tab の同じ集合。indentation が先に一致する。      |
| 11  | Native comment                    | `%%` から LF の手前まで。                                |
| 12  | Hidden newline                    | LF。共通の変換前なら CRLF も一致する。                   |
| 13  | identifier                        | ASCII 英字・underscore で始まり、word 文字が続く。       |
| 14  | number                            | 空でない数字・underscore・dot・comma の連続。            |
| 15  | string                            | double quote・single quote の文字列。                    |

[文法][grammar]は共通の文法を import しない。
BOOLEAN の unit はなく、selector の位置の `true` と `false` は identifier、
単独の boolean は拒否する。
native YAML・DIRECTIVE の unit や、一般の Unicode の空白を無視する規則もない。
[fixture: treemap/gram-selector-keywords]
[fixture: treemap/gram-standalone-boolean] [fixture: treemap/hidden-yaml-body]
[fixture: treemap/hidden-comment-inline] [fixture: treemap/space-nbsp-body]
[fixture: treemap/space-3000-body]

### 見出しと字下げ

どちらの見出しも単語や空白の境界を要求しない。
引用した row や title を直後に続けられるが、 `treemapX` は読めない接尾辞を残す。
完全な構成要素の間の global directive はこの規則を変えない。
[fixture: treemap/header-inline-section] [fixture: treemap/header-inline-leaf]
[fixture: treemap/header-glued-title] [fixture: treemap/header-beta-glued-title]
[fixture: treemap/header-letter-suffix]
[fixture: treemap/directive-header-glued]

indentation unit は ASCII の space・tab を一文字ずつ数え、 tab を展開しない。
文法上の位置は row の前と leaf の値の separator の前後だけである。
完全な unit の間には hidden newline を挟める。
特に selector の marker と identifier は字下げなしで後の行へ置けるが、
marker の前後の space・tab は拒否する。 [fixture: treemap/db-tabs-count]
[fixture: treemap/gram-leaf-newlines-around-separator]
[fixture: treemap/gram-leaf-indentation-before-newlines]
[fixture: treemap/gram-selector-marker-next-line]
[fixture: treemap/gram-selector-value-next-line]
[fixture: treemap/gram-section-space-before-selector]
[fixture: treemap/gram-space-after-selector]
[fixture: treemap/gram-space-before-selector]
[fixture: treemap/gram-spaced-leaf]

完成した selector の後の space・tab の並びは、
隣接する次の引用された行の字下げにできる。
selector 内の gap ではない。
[fixture: treemap/gram-selector-followed-by-indented-row]

row の字下げは物理行の先頭だけから来るとは限らない。
直前の見出し・section・leaf の行末、
classDef の semicolon の後の space・tab も、
hidden newline を越えてその字下げになり得る。
空白だけの行からも同様に取る。
別の行の連続は別々の unit のままであり、
一つしか許さない場所の二つの連続は拒否する。
最後に余る連続も拒否する。 [fixture: treemap/db-header-tail-space]
[fixture: treemap/db-header-tail-tab] [fixture: treemap/db-section-tail-space]
[fixture: treemap/db-section-tail-tab] [fixture: treemap/db-leaf-tail-space]
[fixture: treemap/db-leaf-tail-tab] [fixture: treemap/db-class-tail-space]
[fixture: treemap/db-class-tail-tab]
[fixture: treemap/gram-indent-from-whitespace-line]
[fixture: treemap/gram-two-indent-runs]
[fixture: treemap/gram-header-tail-space-next-indent]
[fixture: treemap/gram-header-tail-tab-next-indent]
[fixture: treemap/gram-section-tail-space-next-indent]
[fixture: treemap/gram-section-tail-tab-next-indent]
[fixture: treemap/gram-leaf-tail-space-next-indent]
[fixture: treemap/gram-leaf-tail-tab-next-indent]
[fixture: treemap/gram-class-tail-space-next-indent]
[fixture: treemap/gram-class-tail-tab-next-indent]
[fixture: treemap/gram-header-trailing-indent-eof]
[fixture: treemap/gram-leaf-trailing-indent-eof]

行末空白を除くと親子が変わる場合がある。
title、accessibility の行、終端 semicolon より前の class style、
native comment が既に囲んだ空白は、
その一致の内容であり新しい indentation unit ではない。
同じ位置では前置空白を含む共通の形が indentation より先に成立するが、
改行で離れた前の連続を共通の形の前に付けることはできない。
共通の comment region の除去が前の空白だけの行も除く場合がある。
空白の連続の中の directive は、数えるときその前後を接合する。
[fixture: treemap/db-section-tail-no-space]
[fixture: treemap/db-leaf-tail-no-space]
[fixture: treemap/db-class-tail-no-space] [fixture: treemap/db-style-whitespace]
[fixture: treemap/common-line-whitespace]
[fixture: treemap/hidden-comment-space]
[fixture: treemap/lex-leading-padding-title-priority]
[fixture: treemap/gram-indent-before-common-on-next-line]
[fixture: treemap/comment-region-removes-blank-indent]
[fixture: treemap/gram-indent-around-global-directive]
[fixture: treemap/db-style-tail-stays-content]
[fixture: treemap/db-title-tail-stays-content]
[fixture: treemap/db-acctitle-tail-stays-content]
[fixture: treemap/db-native-comment-tail-stays-content]

### 名前・数・文字列

identifier は ASCII の英字か underscore で始まり、
その後は零文字以上の ASCII 英字・数字・underscore とする。
一文字でもよい。
先に一致する形は優先され、
`treemap` や `title` で始まる selector は拒否され得る。
`accTitleStyle` と `classDefStyle` は先の複合形が成立しなければ identifier。
hyphen、Unicode の英字、引用符、entity、
数字始まりは selector の identifier にならない。
[fixture: treemap/lex-selector-single-letter]
[fixture: treemap/lex-selector-single-underscore]
[fixture: treemap/gram-selector-underscore]
[fixture: treemap/gram-selector-reserved-treemap]
[fixture: treemap/db-class-names]
[fixture: treemap/gram-selector-reserved-acctitle]
[fixture: treemap/gram-selector-reserved-class]
[fixture: treemap/gram-selector-dash] [fixture: treemap/gram-selector-unicode]
[fixture: treemap/gram-selector-quoted]
[fixture: treemap/gram-selector-entities]
[fixture: treemap/gram-selector-number]

number unit は数字・underscore・dot・comma を可能な限り多く読む。
開始位置では identifier と comma の規則が先であり、 `_12` は identifier、
`,12` は comma で始まるため leaf の数にはならない。
数字か dot で始まれば、その後の comma・underscore は同じ数に含む。
次の quoted row の前の末尾 comma も同じである。
符号、指数、英字の接尾辞、裸の NaN・Infinity は拒否する。
改行は、除かれる comment 行の隣でも二つの数の unit を接合しない。
[fixture: treemap/db-number-mixed] [fixture: treemap/db-number-trailing-comma]
[fixture: treemap/lex-number-commas-before-next-node]
[fixture: treemap/number-leading-underscore]
[fixture: treemap/number-leading-comma]
[fixture: treemap/gram-comma-leaf-leading-comma-number]
[fixture: treemap/number-negative] [fixture: treemap/number-negative-zero]
[fixture: treemap/number-plus] [fixture: treemap/number-exponent]
[fixture: treemap/number-suffix] [fixture: treemap/number-nan]
[fixture: treemap/number-infinity]
[fixture: treemap/lex-number-lf-no-concatenation]
[fixture: treemap/lex-number-comment-no-concatenation]
[fixture: treemap/directive-invalid-number-suffix-control]

`1_234.50`、`1.2.3`、`.`、`._` という変則的な表記も受理する。
丸め・overflow・subnormal・underflow を起こす値も受理する。
原綴は NumericLiteral.raw に残し、
この位置の数値の欄は [NumericLiteral](../ast.md#numericliteral) で定める。
これらの値による semantic な拒否はない。 [fixture: treemap/db-number-underscore]
[fixture: treemap/db-number-multiple-dots] [fixture: treemap/db-number-nan]
[fixture: treemap/lex-number-dot-underscore]
[fixture: treemap/db-number-rounded] [fixture: treemap/db-number-overflow]
[fixture: treemap/db-number-subnormal] [fixture: treemap/db-number-underflow]

文字列は double または single quote で開き、次の同じ quote で閉じる。
空でもよく、反対の quote、backslash、改行、 U+2028・U+2029 を含められる。
backslash は quote を escape せず、文字も復号しない。
backslash 直後の物理的な LF も許す。
閉じない文字列は拒否する。
ソースの引用符と改行は StringLiteral.raw に残す。
[fixture: treemap/db-empty-names]
[fixture: treemap/docs-syntax-treemap-20b3fefc]
[fixture: treemap/lex-string-conversion] [fixture: treemap/line-name-values]
[fixture: treemap/lex-string-backslash-line-feed]
[fixture: treemap/lex-string-escaped-quote]
[fixture: treemap/lex-string-open-double]
[fixture: treemap/lex-string-open-single]

### クラスの定義

class-definition unit は `classDef`、一文字以上の共通 Notation の空白、
class 名、任意の空白に導かれる style text、高々一つの末尾 semicolon からなる。
名前は ASCII 英字か underscore で始まり、
さらに一文字以上の ASCII 英字・数字・underscore を要する。
複合形の中の名前を先の title・header の規則で字句解析し直さない。
一文字の class 名は、一文字の selector と異なり拒否する。
[fixture: treemap/gram-class-name-two-characters]
[fixture: treemap/gram-class-one-letter]
[fixture: treemap/lex-class-name-title-prefix]
[fixture: treemap/lex-selector-single-letter]
[fixture: treemap/space-class-name-bom] [fixture: treemap/gram-class-newline]
[fixture: treemap/gram-class-glued] [fixture: treemap/gram-class-number]
[fixture: treemap/gram-class-name-quoted] [fixture: treemap/gram-class-upper]

style text の前の区切りの空白を最大限に読む。
LF や空行を越え、
次の quoted row や classDef が新しい文でなく style になる場合がある。
style text 自体は最初の semicolon か改行の手前までの全ての文字であり、 comma、
colon、quote、percent 対、U+2028・U+2029 も含む。
空の style も許す。
無視されない第 2 の semicolon は読めず、拒否する。
[fixture: treemap/db-class-consumes-next-line]
[fixture: treemap/lex-class-style-takes-next-class]
[fixture: treemap/lex-class-style-crosses-blank-line]
[fixture: treemap/gram-class-style-next-line]
[fixture: treemap/db-class-escaped-comma]
[fixture: treemap/hidden-comment-class] [fixture: treemap/line-class-ls]
[fixture: treemap/line-class-ps]
[fixture: treemap/gram-class-empty-with-semicolon]
[fixture: treemap/gram-class-whitespace-style-null]
[fixture: treemap/tail-class-double-semicolon]

空白を挟まなければ、style のない class 名の直後に quoted row を置ける。
終端 semicolon の直後にも次の row を置ける。
未知の CSS、未使用の定義、定義の反復、未解決の selector は拒否条件ではない。
各定義の style text 全体を保ち、分割・統合は tests の要約で扱う。
[fixture: treemap/gram-class-name-glued-node]
[fixture: treemap/gram-class-semicolon-glued-node]
[fixture: treemap/db-class-unused] [fixture: treemap/db-class-repeat]
[fixture: treemap/db-class-missing] [fixture: treemap/db-prototype-names]

### 共通の形

三つの共通 terminal の文字の規則は [common.langium][common] と同じだが、
この図種はその fragment を import せず、共通の形の後に EOL を要求しない。
unit の開始位置では、それぞれ前置 ASCII space・tab を取れる。
title は `title` と、あれば正確に一つの ASCII space・tab と、
後続の行 text を読む。
keyword だけの選択肢も許す。
行 text は最初の percent 対か改行で終わる。
`title"A":1` は空 title と leaf だが、
`titleX` は文法が取らない identifier を残す。
[fixture: treemap/common-title-eof] [fixture: treemap/common-title-one-space]
[fixture: treemap/common-title-one-tab]
[fixture: treemap/common-title-two-spaces]
[fixture: treemap/gram-title-empty-before-glued-node]
[fixture: treemap/common-title-letter] [fixture: treemap/common-title-colon]
[fixture: treemap/hidden-comment-title]
[fixture: treemap/gram-title-block-node-adjacent]
[fixture: treemap/gram-description-block-acctitle-adjacent]

acc-title-line は `accTitle`、任意の ASCII space・tab、
colon と空でもよい行 text を読む。
acc-descr-line も `accDescr` について同じとし、block 形式より先に試す。
両方の行値は最初の percent 対か改行で終わり、 U+2028・U+2029 を含められる。
colon の前の padding に Unicode の空白や改行は含めない。
[fixture: treemap/common-acctitle-eof] [fixture: treemap/common-description-eof]
[fixture: treemap/common-accdescr-colon-block-priority]
[fixture: treemap/comment-acctitle] [fixture: treemap/comment-accdescr]
[fixture: treemap/line-common-values] [fixture: treemap/space-acctitle-nbsp-gap]
[fixture: treemap/common-acctitle-next-statement]
[fixture: treemap/common-accdescr-next-statement]

acc-descr-block は `accDescr`、零文字以上の共通 Notation の空白、 `{`、
最初の `}` までの任意の文字、必須の閉じを読む。
開始記号の前の空白には、改行、BOM、U+2028、
除かれる共通 directive・comment region を含められる。
quote・backslash は閉じ brace を隠さない。
空・空白だけの block も文である。
後続 EOL や出現一回だけという条件を加えない。
[fixture: treemap/common-block-newline-gap]
[fixture: treemap/common-block-bom-gap] [fixture: treemap/common-block-ls-gap]
[fixture: treemap/common-block-directive-gap]
[fixture: treemap/common-block-comment-gap]
[fixture: treemap/common-block-quoted-close]
[fixture: treemap/common-block-escaped-close]
[fixture: treemap/common-block-first-close] [fixture: treemap/common-block-open]
[fixture: treemap/common-block-empty-interleaved]
[fixture: treemap/common-block-whitespace-only]
[fixture: treemap/gram-description-block-acctitle-adjacent]
[fixture: treemap/common-repeat-empty]

### コメントと書かれた境界

native unit の開始位置では percent 対から次の LF の手前までを Comment とする。
共通の改行変換により、ソース上の CR・CRLF・LF が終端になる。
U+2028・U+2029 は終端ではない。
`}%%`、第 2 の percent の形、その行の後続 text は全て値に残る。
LF 自体は消費せず、EOF に付加する LF も別の hidden newline の規則で読む。
Comment.mark は `%%`、範囲は最初の percent から改行を除く位置まで、
value は mark を除いた内容である。 [fixture: treemap/comment-native-crlf-ending]
[fixture: treemap/comment-ls] [fixture: treemap/comment-ps]
[fixture: treemap/hidden-comment-closer] [fixture: treemap/hidden-comment-no-lf]
[fixture: treemap/hidden-comment-sole-lf]
[fixture: treemap/hidden-comment-spare-lf] [fixture: treemap/hidden-comment-eof]
[fixture: treemap/lex-indent-comment-ps-semicolon-space]
[fixture: treemap/lex-indent-comment-ls-semicolon-space]
[fixture: treemap/lex-indent-comment-ps-selected-semicolon]

先に囲んだ string・class style・description block は percent のような text
も所有する。
行の共通形式は最初の percent 対の手前で終わり、その後に Comment を許す。
native comment は完全な leaf・selector の構成要素の間に置けるが、
selector の前で禁じた字下げを隠すことはできない。
ソースの comment region・directive は共通の所有を保つ。
二つの percent の間の directive を除くと native の mark ができる場合もある。
[fixture: treemap/comment-in-name] [fixture: treemap/hidden-comment-string]
[fixture: treemap/hidden-comment-class]
[fixture: treemap/lex-description-block-native-percent]
[fixture: treemap/hidden-comment-title]
[fixture: treemap/comment-leaf-separator-indent]
[fixture: treemap/comment-value-selector-gap]
[fixture: treemap/comment-selector-forbidden-indent]
[fixture: treemap/comment-mark-joined-by-directive]

`%%{other: x}%%` を含む通常の word 始まりの global directive は共通の trivia
であり、native hidden directive ではない。
残る `%%{!}%%` のような nonword の形は一行の Comment とし、
閉じ delimiter の規則は設けない。
裸の YAML は、string・style・共通の値が囲む場合を除き拒否する。
TreemapIgnoredText や hidden な形の gap node は作らない。
[fixture: treemap/hidden-native-inline]
[fixture: treemap/hidden-native-multiline] [fixture: treemap/hidden-native-open]
[fixture: treemap/hidden-comment-inline]
[fixture: treemap/hidden-comment-multiline] [fixture: treemap/hidden-yaml-body]
[fixture: treemap/hidden-yaml-gap] [fixture: treemap/hidden-yaml-string]
[fixture: treemap/hidden-yaml-block] [fixture: treemap/hidden-yaml-title]
[fixture: treemap/hidden-yaml-class]
[fixture: treemap/comment-second-scan-shaped-body]

共通 directive・ignored-semicolon の境界規則では、
複合形の書かれた構成要素を区別する。
見出し、classDef keyword、class 名、共通の keyword、 number、identifier、
`:::` は原子である。
class style、共通の値 text、string の内側は text・string の位置とし、
空白だけの部分は透過とする。
共通 keyword と colon の間、
または必須の空白を残す classDef keyword と name の間に directive を許す。
不足する空白を directive で補うことはできない。
class-definition 全体や共通の形全体を不可分な原子にしない。
[fixture: treemap/directive-header-middle]
[fixture: treemap/div-directive-beta-header]
[fixture: treemap/directive-class-keyword]
[fixture: treemap/directive-class-name]
[fixture: treemap/directive-common-keyword] [fixture: treemap/directive-number]
[fixture: treemap/directive-selector]
[fixture: treemap/div-directive-style-marker]
[fixture: treemap/directive-common-colon]
[fixture: treemap/directive-class-keyword-name-gap]
[fixture: treemap/directive-class-keyword-missing-space]
[fixture: treemap/directive-class-name-node-boundary]
[fixture: treemap/directive-style] [fixture: treemap/directive-title]
[fixture: treemap/directive-name-middle]
[fixture: treemap/directive-title-glued-value]
[fixture: treemap/div-semicolon-selector-atom]
[fixture: treemap/div-semicolon-number-atom]
[fixture: treemap/div-semicolon-style-marker]
[fixture: treemap/div-semicolon-class-keyword-style-trigger]
[fixture: treemap/div-semicolon-class-name-style-trigger]
[fixture: treemap/div-semicolon-title-keyword]
[fixture: treemap/div-semicolon-class-keyword-classdef-trigger]
[fixture: treemap/lex-class-name-unselected-semicolon]
[fixture: treemap/style-fields]

## 文法

```text
diagram = ("treemap-beta" | "treemap") statement* end-of-text
statement = row | common-statement
row = indentation? (section | leaf | class-definition)
section = string (class-marker identifier)?
leaf = string indentation? (colon | comma) indentation? number
       (class-marker identifier)?
common-statement = title-line | acc-title-line
                 | acc-descr-line | acc-descr-block
```

[共通の記法](../common.md#notation)を適用する。
hidden newline と native Comment は文の separator や body 要素を作らない。
完全な leaf の production が一致するときは leaf を取り、
そうでなければ引用した名前と任意の selector を section とする。
body は空でもよく、文を接着したり、共通の形や class 定義を挟んだりできる。
EOL は要求しない。
単独の数、引用しない row 名、class assignment、data block、数・selector の欠落、
一般の semicolon separator は拒否する。
[fixture: treemap/spec-treemap-test-ts-892fa294]
[fixture: treemap/gram-adjacent-sections] [fixture: treemap/gram-same-line]
[fixture: treemap/gram-written-tree]
[fixture: treemap/gram-title-block-node-adjacent]
[fixture: treemap/gram-description-block-acctitle-adjacent]
[fixture: treemap/lex-string-unquoted] [fixture: treemap/gram-data-block]
[fixture: treemap/error-recovered-row] [fixture: treemap/gram-selector-empty]
[fixture: treemap/tail-leaf-semicolon]
[fixture: treemap/lex-number-lf-no-concatenation]
[fixture: treemap/spec-treemap-test-ts-42b43ee6]
[fixture: treemap/spec-treemap-test-ts-e40d6eee]

| Rule                       | Node                          |
| -------------------------- | ----------------------------- |
| diagram                    | TreemapDiagram                |
| section                    | TreemapSection                |
| leaf                       | TreemapLeaf                   |
| class-definition           | TreemapClassDefStatement      |
| title-line                 | TreemapTitleStatement         |
| acc-title-line             | TreemapAccTitleStatement      |
| acc-descr-line             | TreemapAccDescrStatement      |
| acc-descr-block            | TreemapAccDescrBlockStatement |
| string                     | StringLiteral                 |
| identifier / class name    | Identifier                    |
| number                     | NumericLiteral                |
| Class style / common value | TreemapLiteral                |

### 字下げと親

[buildHierarchy][hierarchy] に対応する次の直接の規則が、
TreemapSection.children の入れ子と TreemapDiagram.body の根を決める。
section と leaf を記述順に処理し、共通の文と class 定義は参加させない。
開いている section のリストを保つ。
各 node の前に、末尾の開いている section の字下げがその node 以上なら、
その section を取り除く操作を繰り返す。
残る末尾の section が親であり、残らなければ新しい根となる。
現在の node が section のときだけ開いているリストへ加える。
leaf も同じ比較で section を閉じるが、自身は親にならない。
[fixture: treemap/db-indent-pop] [fixture: treemap/db-leaf-not-parent]
[fixture: treemap/db-leaf-closes-open-sections]
[fixture: treemap/db-class-indented]
[fixture: treemap/common-block-empty-interleaved]
[fixture: treemap/gram-written-tree]

最初の node が字下げされていてもよく、複数の根と任意幅の字下げの増加を許す。
leaf の後の深い row は、まだ開いている section の子か新しい根になる。
閉じた section は再び開かない。
`"A"`、二つの space の `"B"`、字下げなしの `"L":1`、
四つの space の `"C":2` では、B は A の子、L と C は根である。
前述の前の行の末尾の space・tab もこの比較に数える。
[fixture: treemap/db-first-indented] [fixture: treemap/db-tabs-count]
[fixture: treemap/db-leaf-not-parent]
[fixture: treemap/db-leaf-closes-open-sections]
[fixture: treemap/db-section-tail-space] [fixture: treemap/db-leaf-tail-space]
[fixture: treemap/db-header-tail-space] [fixture: treemap/db-class-tail-space]

directive、コメント、空行、選択された無視するセミコロンは、
階層 node を増やさない。
字下げへの字句上の効果は変えない。
空の description block は共通の文であり、開いている section を閉じない。
unit の外の LS・PS は引き続き拒否する。
native comment の内側では LF までコメントの内容なので、
その中の見かけの node は子にならない。
[fixture: treemap/gram-indent-around-global-directive]
[fixture: treemap/gram-nesting-child-after-directive-line]
[fixture: treemap/gram-nesting-child-after-comment]
[fixture: treemap/gram-nesting-child-after-empty-line]
[fixture: treemap/db-class-tail-space]
[fixture: treemap/common-block-empty-interleaved]
[fixture: treemap/line-ls-between] [fixture: treemap/line-ps-between]
[fixture: treemap/gram-nesting-child-after-comment-ls]
[fixture: treemap/gram-nesting-child-after-comment-ps]

### 意味による受理条件

[公開 parse wrapper][parse] は、未消費の入力や回復した木のエラーも含め、
lexer・parser のエラーが一つでもあれば拒否する。
この経路は[登録された single-root validator][validator] を呼ばない。
[adapter][adapter] と [Db][db] に、さらに入力依存の semantic な拒否はない。
前述の字句・文法規則を満たせば、複数の根、空・重複の名前、空 section、
NaN・overflow の数、未使用・再定義の class、未解決の selector を受理する。
[fixture: treemap/error-start] [fixture: treemap/error-after-prefix]
[fixture: treemap/error-recovered-row] [fixture: treemap/db-first-indented]
[fixture: treemap/db-empty-names] [fixture: treemap/db-duplicate-names]
[fixture: treemap/db-number-nan] [fixture: treemap/db-number-overflow]
[fixture: treemap/db-class-unused] [fixture: treemap/db-class-repeat]
[fixture: treemap/db-class-missing]

Treemap の設定は描画用であり、文法の受理を変えず、
public parse に node 数の上限も加えない。
site・frontmatter・init の設定は有効な treemap 構文を拒否せず、
不正な構文も救済しない。
public parse 中に renderer が不正な valueFormat を解析することはない。
treemap 固有の acceptance key はない。
埋め込みデータの検証は共通の opaque-data の差異とする。
[fixture: treemap/config-drawing-only]
[fixture: treemap/config-frontmatter-drawing]
[fixture: treemap/config-init-drawing]
[fixture: treemap/config-site-cannot-rescue]
[fixture: treemap/config-frontmatter-cannot-rescue]
[fixture: treemap/config-init-cannot-rescue]
[fixture: treemap/config-limit-small] [fixture: treemap/div-frontmatter-invalid]

### Db の正規化

[tests の要約](../../../tests/docs/db-summaries.md#treemap)は、共通値の公開、
数の変換、class の分割・統合、公開する森を定める。
その字下げにも、ここで定めた直前の末尾空白を含める。
ソースの AST の順序と原綴はその正規化と独立であり、人工の根、
コンパイル済み style、集計値、座標、描画順を木へ加えない。
[fixture: treemap/gram-written-tree] [fixture: treemap/db-all-fields]
[fixture: treemap/db-class-forward] [fixture: treemap/db-section-tail-space]

## 既知の差異

**[`directive-as-token-boundary`][difference-1]。**
原子である見出し・keyword・class 名・selector・数・class marker の内部の
directive は拒否する。
text・string・完全な構成要素の間では許される読みを保つ。
[fixture: treemap/directive-header-middle]
[fixture: treemap/div-directive-beta-header]
[fixture: treemap/directive-class-name]
[fixture: treemap/directive-common-keyword] [fixture: treemap/directive-number]
[fixture: treemap/directive-selector]
[fixture: treemap/div-directive-style-marker]
[fixture: treemap/directive-common-colon] [fixture: treemap/directive-style]

**[`ignored-semicolon-as-token-boundary`][difference-2]。**
keyword・class 名・selector・数・marker 内の ignored semicolon は拒否する。
選択されない semicolon はこの差異ではない。
[fixture: treemap/div-semicolon-selector-atom]
[fixture: treemap/div-semicolon-number-atom]
[fixture: treemap/div-semicolon-style-marker]
[fixture: treemap/div-semicolon-class-keyword-style-trigger]
[fixture: treemap/div-semicolon-class-name-style-trigger]
[fixture: treemap/div-semicolon-title-keyword]
[fixture: treemap/div-semicolon-class-keyword-classdef-trigger]
[fixture: treemap/lex-class-name-unselected-semicolon]

**[`html-tag-in-frontmatter`][difference-3]。**
本文の HTML 属性の引用符は frontmatter の後から読む。
frontmatter に始まる閉じていない tag は、名前の文字列の境界や、
共通の値・class style の引用符を変えない。
これにより受理が両方向に逆転したり、両方で受理し値だけが変わったりする。
比較は specified.json に記録する。
[fixture: treemap/div-html-tag-starts-in-frontmatter]
[fixture: treemap/div-html-frontmatter-reverse]
[fixture: treemap/div-html-frontmatter-title-value]
[fixture: treemap/div-html-frontmatter-style-value]

**[`embedded-data-opaque`][difference-4]。**
共有 frontmatter・directive の内容は opaque のまま保ち、
比較の読みに際して treemap の acceptance key を取り除かない。
[fixture: treemap/div-frontmatter-invalid]
[fixture: treemap/div-invalid-keeps-config]
[fixture: treemap/div-init-fontfamily-number]
[fixture: treemap/div-init-primitive-wrap]
[fixture: treemap/div-init-invalid-colour-base]

**[`bare-percent-line-before-header`][difference-5]。**
通した裸の行と付随する trivia は読み直さず、
Mermaid が拒否する ASCII・Unicode の padding を受理し得る。
残存する形は引き続き native の規則で読める必要がある。
[fixture: treemap/bare-before-header-space] [fixture: treemap/bare-line-nbsp]
[fixture: treemap/div-retained-before-bare-unicode-line]
[fixture: treemap/div-bare-retained-ascii-header]
[fixture: treemap/lex-retained-no-bare-unicode-line]
[fixture: treemap/detect-retained-yaml-bare-ascii-gap]

**[`c4-keyword-anywhere`][difference-6]。**
後の名前・style・共通値・終端改行のない comment が C4 の四つの anywhere keyword
を含んでも、見出しによって treemap を選ぶ。
[fixture: treemap/c4-container-section] [fixture: treemap/c4-component-leaf]
[fixture: treemap/c4-dynamic-title] [fixture: treemap/c4-deployment-block]
[fixture: treemap/c4-component-header-eof]
[fixture: treemap/c4-component-header-lf]

[grammar]: https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/treemap/treemap.langium#L9-L89
[common]: https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/common/common.langium#L6-L34
[detector]: https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/treemap/detector.ts#L7-L11
[hierarchy]: https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/treemap/utils.ts#L8-L64
[parse]: https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/parse.ts#L133-L149
[validator]: https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/treemap/treemap-validator.ts#L8-L61
[adapter]: https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/treemap/parser.ts#L13-L108
[db]: https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/treemap/db.ts#L17-L95
[difference-1]: ../known-divergences/directive-as-token-boundary.md
[difference-2]: ../known-divergences/ignored-semicolon-as-token-boundary.md
[difference-3]: ../known-divergences/html-tag-in-frontmatter.md
[difference-4]: ../known-divergences/embedded-data-opaque.md
[difference-5]: ../known-divergences/bare-percent-line-before-header.md
[difference-6]: ../known-divergences/c4-keyword-anywhere.md
