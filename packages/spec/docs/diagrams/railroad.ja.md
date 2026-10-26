# Railroad

英語版: [railroad.md](./railroad.md)

この文書は railroad の 4 方言を定義する。
[原文の木](../ast/railroad.md)は書かれた構文を保ち、
Db の導出値は
[tests の要約](../../../tests/docs/db-summaries.md#railroad)が定義する。
選んだ方言の節と、後述の共通 metadata・hidden form・境界の規則を読む。
[fixture: railroad/ir-gram-written-tree]
[fixture: railroad/ebnf-gram-written-tree]
[fixture: railroad/abnf-gram-written-tree]
[fixture: railroad/peg-gram-written-tree]

## 検出

[detection.md](../detection.md)の項目 32〜35 は、
次の接頭辞を大文字小文字を区別せず、接尾字の境目を検査せずに比較する。
検出だけでは受理は決まらず、
各文法は正確な小文字の見出しと後述の見出しの境目を要求する。
[fixture: railroad/ir-header-only]
[fixture: railroad/ebnf-header-only]
[fixture: railroad/abnf-header-only]
[fixture: railroad/peg-header-only]
[fixture: railroad/ir-header-upper]
[fixture: railroad/ebnf-header-upper]
[fixture: railroad/abnf-header-upper]
[fixture: railroad/peg-header-upper]

| 方言・出典                             | 見出し               | Root.diagramType                                      |
| -------------------------------------- | -------------------- | ----------------------------------------------------- |
| IR、[railroadDetector.ts][ir-detector] | `railroad-beta`      | `railroad` [fixture: railroad/ir-header-inline]       |
| EBNF、[ebnfDetector.ts][ebnf-detector] | `railroad-ebnf-beta` | `railroadEbnf` [fixture: railroad/ebnf-header-inline] |
| ABNF、[abnfDetector.ts][abnf-detector] | `railroad-abnf-beta` | `railroadAbnf` [fixture: railroad/abnf-header-inline] |
| PEG、[pegDetector.ts][peg-detector]    | `railroad-peg-beta`  | `railroadPeg` [fixture: railroad/peg-header-inline]   |

[共通の前処理](../common.md#reading-a-source)を適用する。
真の先頭 frontmatter、global directive、comment region、先頭空白、
改行変換、HTML 属性の引用符、文字参照、選ばれたセミコロンを含む。
真の frontmatter は共有の Frontmatter record で、
後に残る block は図のテキストである。
先行する C4 detector には後述の共有の見出し選択の差異を適用する。
[fixture: railroad/ir-frontmatter-title-only]
[fixture: railroad/ebnf-frontmatter-title-only]
[fixture: railroad/abnf-frontmatter-title-only]
[fixture: railroad/peg-frontmatter-title-only]
[fixture: railroad/ir-div-directive-header]
[fixture: railroad/ir-entity-texts]
[fixture: railroad/ir-style-fields]
[fixture: railroad/ir-c4-container-terminal]

検出点では、bare な percent-pair の行と directive の第二走査より先に、
[共通の frontmatter の形](../common.md#frontmatter)に合う
block を 1 個だけ通過する。
その block は native hidden-yaml にも合う必要があり、
RailroadDiagram.textBeforeHeader に属し、YAML の値を適用しない。
真の frontmatter の後に、この別の block があってもよい。
[fixture: railroad/ir-prefix-yaml-no-bare]
[fixture: railroad/ebnf-retained-leading]
[fixture: railroad/abnf-retained-leading]
[fixture: railroad/peg-retained-leading]
[fixture: railroad/ir-detect-block-after-frontmatter]
[fixture: railroad/ebnf-frontmatter-retained]
[fixture: railroad/abnf-frontmatter-retained]
[fixture: railroad/peg-frontmatter-retained]

本文行も後の closing fence もない隣接 fence、
closer の欠落、indent の不一致、4 個の dash、
closing fence の接尾字、closer の後の改行の欠落は、その通過を止める。
先頭の trim が opening indent だけを除く場合もある。
2 個目の block、passed bare line の後の block、
第二走査 directive の後の block は通過しない。
[fixture: railroad/ir-detect-block-after-directive]
[fixture: railroad/ir-retained-no-closer]
[fixture: railroad/ir-retained-mismatch-indent]
[fixture: railroad/ir-detect-retained-four-dashes]
[fixture: railroad/ir-detect-retained-close-suffix]
[fixture: railroad/ir-retained-close-only-eof]
[fixture: railroad/ir-retained-close-no-lf]
[fixture: railroad/ir-retained-leading-indent-trim]
[fixture: railroad/ir-retained-two-valid-blocks]
[fixture: railroad/ir-prefix-yaml-between-bare]
[fixture: railroad/ir-secondscan-before-yaml-real]
[fixture: railroad/ebnf-secondscan-before-yaml-real]
[fixture: railroad/abnf-secondscan-before-yaml-real]
[fixture: railroad/peg-secondscan-before-yaml-real]

検出の第二走査でだけ directive になる形は図のテキストに残り、
textBeforeHeader の native hidden-directive として読む。
`%%{%%{wrap}%%wrap}%%` では内側の source directive が共有の trivia、
外側の残る形が 1 個の ignored-text node となる。
複数の残る形は別々に保つ。
native closer に見出しを直結すると拒否する。
[fixture: railroad/ir-secondscan-real]
[fixture: railroad/ebnf-secondscan-real]
[fixture: railroad/abnf-secondscan-real]
[fixture: railroad/peg-secondscan-real]
[fixture: railroad/ir-secondscan-multiline]
[fixture: railroad/ir-two-secondscans]
[fixture: railroad/ir-secondscan-glued]

retained YAML の後に第二走査 directive を置いた形は 4 方言で読めるが、
逆順では検出に失敗する。
到達した見出しからだけでなく、検出点から残る形を読む。
[fixture: railroad/ir-yaml-before-secondscan-real]
[fixture: railroad/ebnf-yaml-before-secondscan-real]
[fixture: railroad/abnf-yaml-before-secondscan-real]
[fixture: railroad/peg-yaml-before-secondscan-real]
[fixture: railroad/ir-secondscan-before-yaml-real]
[fixture: railroad/ebnf-secondscan-before-yaml-real]
[fixture: railroad/abnf-secondscan-before-yaml-real]
[fixture: railroad/peg-secondscan-before-yaml-real]

検出が通過した bare percent-pair の行は、
nonword の percent-brace の形も含めて mark `%%` の共有 Comment。
それに伴って通過した空白と改行は trivia で、
残る形の前や間でも再び読まない。
先頭の `%%{!}%%` はこの passed bare line であり、
真の第二走査 directive とは区別する。
[fixture: railroad/ir-prefix-retained-directive]
[fixture: railroad/ebnf-prefix-retained-directive]
[fixture: railroad/ebnf-directive-bare-unicode]
[fixture: railroad/abnf-prefix-retained-directive]
[fixture: railroad/abnf-directive-bare-unicode]
[fixture: railroad/peg-prefix-retained-directive]
[fixture: railroad/peg-directive-bare-unicode]
[fixture: railroad/ir-bare-before-secondscan]
[fixture: railroad/ir-secondscan-between-bares]
[fixture: railroad/ir-secondscan-between-bares-unicode]
[fixture: railroad/ir-retained-bare-secondscan-unicode]

このため、通過した Unicode trivia は、
Mermaid の native lexer が拒否する場合でもこの仕様では受理する。
passed bare line のない対照では、同じ後続空白は native text に残って拒否し、
ASCII の space/tab の対照は受理する。
残る形は常にその native closing boundary を満たす必要がある。
[fixture: railroad/ir-bare-nbsp]
[fixture: railroad/ebnf-retained-before-bare-unicode]
[fixture: railroad/abnf-retained-before-bare-unicode]
[fixture: railroad/peg-retained-before-bare-unicode]
[fixture: railroad/ir-yaml-unicode-no-bare]
[fixture: railroad/ebnf-retained-unicode-no-bare]
[fixture: railroad/abnf-retained-unicode-no-bare]
[fixture: railroad/peg-retained-unicode-no-bare]
[fixture: railroad/ir-prefix-yaml-before-bare]
[fixture: railroad/ebnf-retained-ascii-control]
[fixture: railroad/abnf-retained-ascii-control]
[fixture: railroad/peg-retained-ascii-control]
[fixture: railroad/ir-secondscan-no-bare-unicode]

## 字句構造

### 共通の読取りと見出しの境目

各文法は共通の文法を import しない。
出典は [railroad.langium][ir-lex]、[railroad-ebnf.langium][ebnf-lex]、
[railroad-abnf.langium][abnf-lex]、[railroad-peg.langium][peg-lex]。
各単位の先頭で、後述する方言の順序の最初に合う規則を取り、
その後から同じ規則を試す。
明示した longer alternative だけが先の一致を長い一致へ置き換え、
一般的な最長一致の規則はない。
[fixture: railroad/ir-keywords-long-rule-name]
[fixture: railroad/ir-lex-name-nonascii]
[fixture: railroad/ebnf-postfix-special-priority]
[fixture: railroad/abnf-comment-empty-line]
[fixture: railroad/peg-comment-in-literal]

有効な順序は [IR の module.ts][ir-module]、
[EBNF の module.ts][ebnf-module]、[ABNF の module.ts][abnf-module]、
[PEG の module.ts][peg-module] から各 token builder と
[AbstractMermaidTokenBuilder][common-builder]を辿ったもの。
custom keyword は各見出しだけで、
`%%`、共通 Notation の空白、EOF の直前で終わる必要がある。
境目は消費しない。それ以外の keyword も正確な case で比較する。
[fixture: railroad/ir-header-letter]
[fixture: railroad/ebnf-header-word]
[fixture: railroad/abnf-header-dash]
[fixture: railroad/peg-header-unicode]
[fixture: railroad/ir-keyword-optional-upper]

native padding は ASCII space、tab、CR、LF の空でない最大の並び。
visible EOL の単位はなく、物理改行は規則の終端にならない。
Notation の他の空白は、見出しや hidden closer の境目になっても、
native gap にはならない。
共通の先頭 trivia と検出が通過する trivia は別の規則である。
[fixture: railroad/ir-space-tabs]
[fixture: railroad/ir-line-crlf]
[fixture: railroad/ebnf-line-cr]
[fixture: railroad/abnf-line-crlf]
[fixture: railroad/peg-line-cr]
[fixture: railroad/ir-line-ls-gap]
[fixture: railroad/ebnf-ls-gap]
[fixture: railroad/abnf-ps-gap]
[fixture: railroad/peg-ls-gap]
[fixture: railroad/ir-native-close-boundary-nbsp]
[fixture: railroad/ir-space-bom-leading]

global directive と選ばれたセミコロンを除いた後で見出しの境目を判断する。
次の規則までに space が残る directive の対照は各方言で受理し、
space がないと除去後の見出しと規則名が接合して拒否し得る。
EOF に付加される LF は書かれた値には含めない。
[fixture: railroad/ir-directive-header-glued]
[fixture: railroad/ebnf-header-global-boundary]
[fixture: railroad/abnf-header-global-boundary]
[fixture: railroad/peg-header-global-boundary]
[fixture: railroad/ir-header-global-space-control]
[fixture: railroad/ebnf-header-global-space-control]
[fixture: railroad/abnf-header-global-space-control]
[fixture: railroad/peg-header-global-space-control]
[fixture: railroad/ir-header-only]
[fixture: railroad/ebnf-header-only]
[fixture: railroad/abnf-header-only]
[fixture: railroad/peg-header-only]

### IR の単位

IR の順序は、見出し、constructor の `nonterminal`、`zeroOrMore`、
`oneOrMore`、`sequence`、`optional`、`terminal`、`special`、`choice`、
`= ; ( , )`、metadata、ir-name、ir-string、native padding、
hidden-yaml、hidden-directive、native-percent-comment、C-comment。
見出しと constructor の longer alternative は ir-name で、
それ以外の句読点にはない。
[fixture: railroad/ir-db-all-fields]
[fixture: railroad/ir-keywords-rule-name]
[fixture: railroad/ir-keywords-long-rule-name]
[fixture: railroad/ir-keywords-all-calls]
[fixture: railroad/ir-native-ownership]

ir-name は ASCII 英字か underscore で始まり、
word character または hyphen を最大限続ける。
constructor の接頭辞に名前の字が続けば名前となり、
constructor と完全に同じ語は規則名にできない。
ただし先行する metadata の title 接頭辞は、
後述のとおり長い名前からも `title` を取る。
[fixture: railroad/ir-keywords-long-rule-name]
[fixture: railroad/ir-keywords-rule-name]
[fixture: railroad/ir-db-prototype-names]
[fixture: railroad/ir-name-title-prefix-first]
[fixture: railroad/ir-name-title-prefix-later]

ir-string は対応する単一引用符か二重引用符を使う。
空でもよく、物理改行も内容に入る。
引用符と backslash 以外の字、
または backslash とその直後の 1 字を読み、escape されない同じ引用符で終わる。
backslash の直後には CR、LF、U+2028、U+2029 を置けない。
閉じる引用符の欠落は拒否する。IR に数の単位はない。
[fixture: railroad/ir-db-empty-strings]
[fixture: railroad/ir-lex-string-conversion]
[fixture: railroad/ir-line-string-values]
[fixture: railroad/ir-string-escaped-lf]
[fixture: railroad/ir-string-backslash-ls]
[fixture: railroad/ir-lex-string-open-double]
[fixture: railroad/ir-lex-string-open-single]
[fixture: railroad/ir-error-bare-string]

### EBNF の単位

EBNF の順序は、見出し、`::=`、`= ; | , ( ) [ ] { } ? * + -`、
metadata、ebnf-name、ebnf-string、special-sequence、native padding、
hidden-yaml、hidden-directive、native-percent-comment、
C-comment、ISO-comment。
見出しの longer alternative は ebnf-name、`(` は ISO-comment、
`?` は special-sequence、`-` は hidden-yaml。
それ以外の EBNF の句読点にはない。
[fixture: railroad/ebnf-db-all-fields]
[fixture: railroad/ebnf-comment-iso]
[fixture: railroad/ebnf-postfix-special-priority]
[fixture: railroad/ebnf-hidden-yaml-unit-gap]
[fixture: railroad/ebnf-native-ownership]
[fixture: railroad/ebnf-hidden-yaml-inline]

ebnf-name は ASCII 英字か underscore で始まり、
word character または hyphen を最大限続ける。
特に `A-B` は 1 個の名前で、`A - B` には例外の演算子がある。
必要な colon か brace がなければ accTitle/accDescr の接頭辞は名前になれるが、
先行する title 接頭辞は長い名前からも取られる。
[fixture: railroad/ebnf-name-dash]
[fixture: railroad/ebnf-lex-name-nonascii]
[fixture: railroad/ebnf-exception-dash-name]
[fixture: railroad/ebnf-reference-acctitle-prefix]
[fixture: railroad/ebnf-reference-title-prefix]
[fixture: railroad/ebnf-reference-accdescr-prefix]
[fixture: railroad/abnf-reference-accdescr-prefix]
[fixture: railroad/peg-reference-accdescr-prefix]
[fixture: railroad/ebnf-name-reserved-title]

ebnf-string は対応する単一引用符か二重引用符を使い、
空でもよく、物理改行も内容に入る。
backslash は直後の CR、LF、U+2028、U+2029 以外の 1 字を取り、
escape されない同じ引用符で閉じる。
未閉鎖の文字列は拒否する。独立した EBNF の数の単位はない。
[fixture: railroad/ebnf-db-empty-string]
[fixture: railroad/ebnf-lex-string-conversion]
[fixture: railroad/ebnf-line-string-values]
[fixture: railroad/ebnf-string-escaped-lf]
[fixture: railroad/ebnf-string-backslash-ps]
[fixture: railroad/ebnf-lex-string-open-double]
[fixture: railroad/ebnf-lex-string-open-single]

special-sequence は `?`、`?` と `;` を含まず
non-whitespace を 1 字以上持つ内容、最初の `?`。
内容には物理改行、U+2028、U+2029 も入り、
backslash と引用符は closer を保護しない。
空か whitespace-only の内容はこの単位にならない。
長い special-sequence は後置の `?` より優先するので、
`"a"? "b"?` は文字列と special sequence の並びであり、
2 個の optional string ではない。
[fixture: railroad/ebnf-special-whitespace]
[fixture: railroad/ebnf-special-empty]
[fixture: railroad/ebnf-special-whitespace-only]
[fixture: railroad/ebnf-special-semicolon]
[fixture: railroad/ebnf-special-adjacent]
[fixture: railroad/ebnf-postfix-special-priority]
[fixture: railroad/ebnf-hidden-directive-special]

### ABNF の単位

ABNF の順序は、見出し、`= ; / ( ) [ ]`、metadata、abnf-name、
abnf-string、abnf-numeric-value、star-repeat、exact-repeat、native padding、
hidden-yaml、hidden-directive、native-percent-comment、semicolon-comment。
見出しの longer alternative は abnf-name、`;` は semicolon-comment。
それ以外にはない。
[fixture: railroad/abnf-db-all-fields]
[fixture: railroad/abnf-comment-empty-line]
[fixture: railroad/abnf-comment-before-rule]
[fixture: railroad/abnf-comment-terminator-space]
[fixture: railroad/abnf-native-ownership]

abnf-name は ASCII 英字で始まり、
ASCII 英字、数字、hyphen を最大限続ける。
underscore と非 ASCII 英字は名前の字ではない。
metadata の先行する接頭辞の規則は、参照も含めて名前より先に適用する。
[fixture: railroad/abnf-name-underscore]
[fixture: railroad/abnf-lex-name-nonascii]
[fixture: railroad/abnf-db-prototype-names]
[fixture: railroad/abnf-reference-acctitle-prefix]
[fixture: railroad/abnf-reference-title-prefix]
[fixture: railroad/abnf-name-title-prefix-first]

abnf-string は二重引用符で始まり、次の二重引用符までのすべての字を取る。
空でもよく、物理改行、U+2028、U+2029 も内容に入る。
backslash は普通の字で、引用符を保護しない。
単一引用符と、閉じる二重引用符の欠落は拒否する。
[fixture: railroad/abnf-db-empty-string]
[fixture: railroad/abnf-line-string-values]
[fixture: railroad/abnf-lex-string-conversion]
[fixture: railroad/abnf-string-backslash-quote]
[fixture: railroad/abnf-error-single-quote]
[fixture: railroad/abnf-lex-string-open]

abnf-numeric-value は `%`、`x X d D b B` のどれか、
空でない最大の十六進の字の並び、
続いて `-` か `.` と空でない十六進の字の並びを 0 回以上。
十六進の字は ASCII の `0`〜`9`、`A`〜`F`、`a`〜`f`。
base の字に対する桁や range の大小を検査しない。
全綴りを text として保ち、`%x41Z` の Z は別の参照になる。
[fixture: railroad/abnf-numval-boundaries]
[fixture: railroad/abnf-numval-empty]
[fixture: railroad/abnf-numval-suffix]
[fixture: railroad/abnf-gram-written-tree]

abnf-count は ASCII 十進数字の空でない最大の並び。
star-repeat は任意の count、`*`、任意の count で、
exact-repeat は 1 個の count。
通常の空白と native hidden form は repeat の内部に置けないが、
完成した repeat と primary の間には置ける。
両方の count を省略でき、先頭ゼロも許す。
[fixture: railroad/abnf-db-all-fields]
[fixture: railroad/abnf-db-repeat-leading-zero]
[fixture: railroad/abnf-db-repeat-implicit-optional]
[fixture: railroad/abnf-db-repeat-implicit-zero]
[fixture: railroad/abnf-repeat-gap-star]
[fixture: railroad/abnf-native-in-atom]
[fixture: railroad/abnf-hidden-directive-unit-gap]
[fixture: railroad/abnf-hidden-yaml-unit-gap]

### PEG の単位

PEG の順序は、見出し、`<- ; / & ! ? * + ( ) .`、metadata、peg-name、
peg-string、native padding、hidden-yaml、hidden-directive、
native-percent-comment、hash-comment。
longer alternative があるのは見出しだけで、peg-name を指定する。
代入の矢印は 1 個の書かれた delimiter、
前置と後置の演算子はそれぞれ別の句読点である。
[fixture: railroad/peg-db-all-fields]
[fixture: railroad/peg-native-ownership]
[fixture: railroad/peg-arrow-hidden]
[fixture: railroad/peg-directive-operator]

peg-name は ASCII 英字か underscore で始まり、
word character または hyphen を最大限続ける。
metadata は名前より先に試すため、title 接頭辞の参照は拒否するが、
colon のない accTitle 接頭辞の参照は名前になれる。
[fixture: railroad/peg-db-prototype-names]
[fixture: railroad/peg-lex-name-nonascii]
[fixture: railroad/peg-reference-title-prefix]
[fixture: railroad/peg-reference-acctitle-prefix]
[fixture: railroad/peg-name-title-prefix-first]
[fixture: railroad/peg-name-title-prefix-later]

peg-string は対応する単一引用符か二重引用符を使い、空でもよく、
物理改行、U+2028、U+2029 も内容に入る。
escape の組は backslash と、
その直後の CR、LF、U+2028、U+2029 以外のちょうど 1 字。
escape されない同じ引用符で閉じ、未閉鎖なら拒否する。
PEG に数の単位はない。
[fixture: railroad/peg-db-empty-string]
[fixture: railroad/peg-line-string-values]
[fixture: railroad/peg-lex-string-conversion]
[fixture: railroad/peg-string-escaped-lf]
[fixture: railroad/peg-lex-string-open-double]
[fixture: railroad/peg-lex-string-open-single]
[fixture: railroad/peg-string-backslash-ls]
[fixture: railroad/peg-string-backslash-ps]

### Metadata の単位

4 文法とも名前より先に title-line、acc-title-line、
acc-descr-line または acc-descr-block を試す。
title-line は `title` と、任意の、
ちょうど 1 個の ASCII space/tab の separator と行の内容。
内容は CR/LF か最初の `%%` の、先に現れる方の直前まで。
空でない title の内容には separator が要るが、
裸の `title` も完成した単位であり、単語の境目はない。
[fixture: railroad/ir-common-title-eof]
[fixture: railroad/ir-common-title-comment]
[fixture: railroad/ir-common-title-colon]
[fixture: railroad/ir-name-title-prefix-first]
[fixture: railroad/ebnf-name-reserved-title]
[fixture: railroad/abnf-name-title-prefix-first]
[fixture: railroad/peg-name-title-prefix-first]
[fixture: railroad/ir-common-whitespace-shapes]
[fixture: railroad/ebnf-common-whitespace-shapes]
[fixture: railroad/abnf-common-whitespace-shapes]
[fixture: railroad/peg-common-whitespace-shapes]

acc-title-line は `accTitle`、ASCII space/tab の 0 個以上、
`:`、CR/LF か最初の `%%` の直前までの、空でもよい内容。
colon は次の行に置けない。
accDescr の colon 形も同じ規則で、block 形より優先する。
colon 後の brace に見える text は行の内容である。
[fixture: railroad/ir-common-acctitle-eof]
[fixture: railroad/ir-common-acctitle-gap-blank]
[fixture: railroad/ir-common-acctitle-comment]
[fixture: railroad/ir-common-description-eof]
[fixture: railroad/ir-common-description-gap-blank]
[fixture: railroad/ir-common-colon-block-priority]
[fixture: railroad/ir-common-repeat-empty]
[fixture: railroad/ebnf-common-repeat-empty]
[fixture: railroad/abnf-common-repeat-empty]
[fixture: railroad/peg-common-repeat-empty]

acc-descr-block は `accDescr`、Notation の空白の 0 個以上、
`{`、最初の `}` までのすべての字。
内部は空でも、複数行でもよく、U+2028/U+2029 も入る。
引用符、backslash、入れ子の brace は最初の closer を保護しない。
closer の欠落は拒否する。
keyword から brace への gap が合うかを決める前に、
共通 directive と comment region の読取りを適用する。
[fixture: railroad/ir-common-block-empty-interleaved]
[fixture: railroad/ir-line-block-values]
[fixture: railroad/ir-common-block-first-close]
[fixture: railroad/ir-common-block-quoted-close]
[fixture: railroad/ir-common-block-escaped-close]
[fixture: railroad/ir-common-block-open]
[fixture: railroad/ir-common-block-gap-comment]
[fixture: railroad/ir-common-block-gap-directive]
[fixture: railroad/ir-common-block-bom-gap]
[fixture: railroad/ir-common-block-ls-gap]

metadata の keyword は大文字小文字を区別する。
先頭の `titlex = …;` は空の title と名前 x の規則になれるが、
規則の後の同じ接頭辞は拒否する。
title 後に space があると、
規則に見える行全体が title の内容になる場合もある。
これらは書かれた文を保つ読取りであり、新たな差異にはしない。
[fixture: railroad/ir-common-uppercase]
[fixture: railroad/ir-name-title-prefix-first]
[fixture: railroad/ebnf-name-reserved-title]
[fixture: railroad/abnf-name-title-prefix-first]
[fixture: railroad/peg-name-title-prefix-first]
[fixture: railroad/ir-name-title-prefix-later]
[fixture: railroad/ebnf-name-title-prefix-later]
[fixture: railroad/abnf-name-title-prefix-later]
[fixture: railroad/peg-name-title-prefix-later]
[fixture: railroad/ir-name-title-whole-line]
[fixture: railroad/ebnf-name-title-whole-line]
[fixture: railroad/abnf-name-title-whole-line]
[fixture: railroad/peg-name-title-whole-line]

metadata の値は、引用文字列に見える場合も、
閉じていない引用符を含む場合も、書かれた RailroadLiteral の text。
元の引用符、escape の綴り、内部空白、改行を木で decode や collapse しない。
[RailroadValueConverter][ir-converter]、
[RailroadEbnfValueConverter][ebnf-converter]、
[RailroadAbnfValueConverter][abnf-converter]、
[RailroadPegValueConverter][peg-converter]の後の公開値は、
tests の要約が定義する。
[fixture: railroad/ir-common-title-open-quote]
[fixture: railroad/ir-common-quoted-title-escape]
[fixture: railroad/ebnf-common-quoted-title-escape]
[fixture: railroad/abnf-common-quoted-title-escape]
[fixture: railroad/peg-common-quoted-title-escape]
[fixture: railroad/ir-common-quotes-whitespace]
[fixture: railroad/ebnf-common-block-values]
[fixture: railroad/abnf-common-block-values]
[fixture: railroad/peg-common-block-values]

### Native hidden form

単位の境目で hidden-yaml は `---`、ASCII space/tab の 0 個以上、
LF で始まり、raw の CRLF も共通改行変換の後は同じ。
任意の本文は closing `---` の前の LF で終わる。
本文のある選択肢を先に試し、
条件に合う closer が成立する最小の本文を取る。
それが失敗したときだけ空本文の選択肢を使う。
このため、後方に closer があると、
隣接 fence が closer に見える部分を通過し、途中の規則も隠す。
[fixture: railroad/ir-hidden-separator-content]
[fixture: railroad/ebnf-hidden-separator-content]
[fixture: railroad/abnf-hidden-separator-content]
[fixture: railroad/peg-hidden-separator-content]
[fixture: railroad/ir-hidden-yaml-crlf]
[fixture: railroad/ir-hidden-yaml-cr]
[fixture: railroad/ir-hidden-yaml-adjacent-later]
[fixture: railroad/ebnf-hidden-yaml-adjacent-later]
[fixture: railroad/abnf-hidden-yaml-adjacent-later]
[fixture: railroad/peg-hidden-yaml-adjacent-later]
[fixture: railroad/ir-hidden-yaml-adjacent-no-later]
[fixture: railroad/ir-hidden-yaml-adjacent-eof]

hidden-yaml の closer の直後に LF があれば 1 個消費し、
なければ Notation の空白か EOF を先読みの境目として要求する。
opener は物理行の先頭でなくてもよい。
opening padding は ASCII space/tab だけで、
indent された closer は closing fence にならない。
opener 前の source padding と、消費した直後の LF は
RailroadIgnoredText の外に置く。
[fixture: railroad/ir-hidden-yaml-unit-gap]
[fixture: railroad/ebnf-hidden-yaml-unit-gap]
[fixture: railroad/abnf-hidden-yaml-unit-gap]
[fixture: railroad/peg-hidden-yaml-unit-gap]
[fixture: railroad/ir-hidden-yaml-closing-space]
[fixture: railroad/ir-native-close-boundary-nbsp]
[fixture: railroad/ir-retained-mismatch-indent]
[fixture: railroad/ir-hidden-yaml-eof]
[fixture: railroad/ebnf-hidden-yaml-eof]
[fixture: railroad/abnf-hidden-yaml-eof]
[fixture: railroad/peg-hidden-yaml-eof]
[fixture: railroad/ir-hidden-yaml-inline]
[fixture: railroad/ebnf-hidden-yaml-inline]
[fixture: railroad/abnf-hidden-yaml-inline]
[fixture: railroad/peg-hidden-yaml-inline]

hidden-directive は `%%{` で始まり、
LF、Notation の空白、EOF のいずれかが続く最初の `}%%` で終わる。
直後の LF は消費し、他の境目の字は見るだけ。
境目のない closer は通過し、後の条件に合う closer を探す。
native directive に合わなければ、
代わりに native-percent-comment が opening line を取る場合がある。
[fixture: railroad/ir-hidden-directive-closing-space]
[fixture: railroad/ebnf-hidden-directive-closing-space]
[fixture: railroad/abnf-hidden-directive-closing-space]
[fixture: railroad/peg-hidden-directive-closing-space]
[fixture: railroad/ir-native-directive-adjacent]
[fixture: railroad/ir-hidden-directive-no-boundary]
[fixture: railroad/ebnf-native-directive-fallback]
[fixture: railroad/abnf-native-directive-fallback]
[fixture: railroad/peg-native-directive-fallback]
[fixture: railroad/ir-hidden-directive-unclosed]

hidden YAML と directive の内部には物理改行、U+2028、U+2029 が入る。
次の規則までに visible LF を残す必要はなく、
sole LF、spare LF、closer 後の space、EOF の形を全方言で許す。
[名前つき owner](../ast/railroad.md#gap-ownership)の中の
whole RailroadIgnoredText node として保ち、
消費した後続 LF は range の外に置く。
[fixture: railroad/ir-hidden-yaml-sole-lf]
[fixture: railroad/ir-hidden-yaml-spare-lf]
[fixture: railroad/ebnf-hidden-yaml-sole-lf]
[fixture: railroad/ebnf-hidden-yaml-spare-lf]
[fixture: railroad/abnf-hidden-yaml-sole-lf]
[fixture: railroad/abnf-hidden-yaml-spare-lf]
[fixture: railroad/peg-hidden-yaml-sole-lf]
[fixture: railroad/peg-hidden-yaml-spare-lf]
[fixture: railroad/ir-hidden-directive-eof]
[fixture: railroad/ebnf-hidden-directive-eof]
[fixture: railroad/abnf-hidden-directive-eof]
[fixture: railroad/peg-hidden-directive-eof]
[fixture: railroad/ir-hidden-directive-multiline]
[fixture: railroad/ebnf-hidden-directive-multiline]
[fixture: railroad/abnf-hidden-directive-multiline]
[fixture: railroad/peg-hidden-directive-multiline]

これらの形は native の単位を分け、名前や repeat の断片を接合しない。
先に始まった文字列、special sequence、metadata は、
hidden に見える内容をその値として所有する。
通常の word-start global directive は native の照合より先に読む共有 trivia で、
追加の ignored-text node にはしない。
[fixture: railroad/ir-native-in-atom]
[fixture: railroad/ebnf-native-in-atom]
[fixture: railroad/abnf-native-in-atom]
[fixture: railroad/peg-native-in-atom]
[fixture: railroad/ir-hidden-yaml-string]
[fixture: railroad/ir-hidden-directive-string]
[fixture: railroad/ebnf-enclosing-string-hidden]
[fixture: railroad/abnf-enclosing-string-hidden]
[fixture: railroad/peg-enclosing-string-hidden]
[fixture: railroad/ebnf-hidden-directive-special]
[fixture: railroad/ir-hidden-yaml-title]
[fixture: railroad/ir-hidden-yaml-block]
[fixture: railroad/ir-directive-string-middle]

### Native のコメント

native-percent-comment は `%%` で始まり、CR/LF か EOF の直前まで読む。
その改行は含めず、裸の `%%` も合う。
IR と EBNF の C-comment は `/*` から最初の `*/` まで。
EBNF の ISO-comment は `(*` から最初の `*)` まで。
block comment は入れ子にならず、すべての改行字を内容に含められ、
closer を必須とする。
[fixture: railroad/ir-comment-percent-ls]
[fixture: railroad/ir-comment-bare-percent-body]
[fixture: railroad/ebnf-comment-bare-percent-body]
[fixture: railroad/abnf-comment-bare-percent-body]
[fixture: railroad/peg-comment-bare-percent-body]
[fixture: railroad/ebnf-comment-block-ps]
[fixture: railroad/ir-tail-comment]
[fixture: railroad/ebnf-tail-comment]
[fixture: railroad/ir-c-comment-first-closer]
[fixture: railroad/ebnf-iso-first-closer]
[fixture: railroad/ir-comment-c-unclosed]
[fixture: railroad/ebnf-comment-c-unclosed]
[fixture: railroad/ebnf-comment-iso-unclosed]

ABNF の semicolon-comment は `;` で始まり、CR/LF か EOF の直前まで読む。
1 字の終端記号より長い一致だけが longer alternative として優先する。
したがって裸の `;` は句読点だが、
後に space か他の行内 text が続く `;` は、
規則の終端を意図した位置でも comment となる。
[fixture: railroad/abnf-comment-semicolon-ls]
[fixture: railroad/abnf-comment-empty-line]
[fixture: railroad/abnf-comment-before-rule]
[fixture: railroad/abnf-comment-terminator]
[fixture: railroad/abnf-comment-terminator-space]
[fixture: railroad/abnf-comment-terminator-control]
[fixture: railroad/abnf-comment-two-rules-line]

PEG の hash-comment は `#` で始まり、CR/LF か EOF の直前まで読み、
その改行は含めず、裸の hash も合う。
U+2028 と U+2029 は native line comment を終えない。
hash comment は IR、EBNF、ABNF の comment ではない。
C comment は ABNF、PEG の comment ではなく、
ISO comment は EBNF だけにある。
[fixture: railroad/peg-comment-hash-ps]
[fixture: railroad/peg-comment-bare-hash]
[fixture: railroad/peg-comment-hash]
[fixture: railroad/ir-comment-hash-foreign]
[fixture: railroad/ebnf-comment-hash-foreign]
[fixture: railroad/abnf-comment-hash-foreign]
[fixture: railroad/abnf-comment-c-foreign]
[fixture: railroad/peg-comment-c-foreign]
[fixture: railroad/ir-comment-iso-foreign]
[fixture: railroad/peg-comment-iso-foreign]

native comment は共有 Comment record で、body の文や
RailroadIgnoredText にはしない。
先に始まった文字列、special sequence、metadata の値は、
その先行する単位が包んだ comment に見える text を所有する。
共通 comment region は別の規則で、
この native の読取りより先に source の行を除く場合がある。
[fixture: railroad/ir-comment-string]
[fixture: railroad/ebnf-enclosing-string-hidden]
[fixture: railroad/abnf-enclosing-string-hidden]
[fixture: railroad/peg-comment-in-literal]
[fixture: railroad/ir-common-block-comment]
[fixture: railroad/ir-common-block-gap-comment]

### 共通 directive とセミコロンの境界

共通の[directive](../common.md#a-directive-is-a-token-boundary)と
[ignored-semicolon](../common.md#style-and-classdef-lines)の境界では、
4 見出し、IR constructor の語、metadata keyword、名前、
十進の count、`::=`、`<-` を atom とする。
metadata の keyword、colon または brace、値は別の書かれた部品。
ABNF repeat の部品は十進の両端値と star で、
native の照合で隣接が必須でも、その部品を区別する。
[fixture: railroad/ir-div-directive-header]
[fixture: railroad/ir-directive-keyword-glued]
[fixture: railroad/ir-directive-description-keyword]
[fixture: railroad/ir-directive-name]
[fixture: railroad/peg-directive-operator]
[fixture: railroad/ir-div-semicolon-title-keyword]
[fixture: railroad/ir-div-semicolon-constructor-keyword]
[fixture: railroad/ir-div-semicolon-rule-name]
[fixture: railroad/abnf-div-semicolon-repeat-number]
[fixture: railroad/peg-div-semicolon-assignment]
[fixture: railroad/abnf-directive-repeat]
[fixture: railroad/abnf-directive-repeat-star]
[fixture: railroad/abnf-directive-repeat-number]

引用文字列の内部、metadata の値、special-sequence の内容、
abnf-numeric-value 全体は string/text の単位で、
内部の共通 directive と選ばれたセミコロンは atom を分断しない。
metadata keyword と colon の間、repeat の bound と star の間の
directive は、必要な書かれた gap が引き続き合う場合に許す。
選ばれたセミコロンも、repeat の bound と star の間や、
完成した repeat と primary の間では部品を分断しない。
完成した repeat と primary の間の directive も許す。
通常の native hidden form に同じ接合を許すわけではない。
[fixture: railroad/ir-directive-common-colon]
[fixture: railroad/ir-directive-string-middle]
[fixture: railroad/ebnf-directive-string]
[fixture: railroad/abnf-directive-string]
[fixture: railroad/peg-directive-string]
[fixture: railroad/abnf-directive-numval-prefix]
[fixture: railroad/abnf-directive-numval-digits]
[fixture: railroad/abnf-directive-numval-range]
[fixture: railroad/abnf-directive-repeat]
[fixture: railroad/abnf-directive-repeat-star]
[fixture: railroad/abnf-native-in-atom]
[fixture: railroad/ir-style-terminal-only]
[fixture: railroad/ebnf-style-special-only]
[fixture: railroad/abnf-semicolon-numval-text]
[fixture: railroad/abnf-semicolon-repeat-before-star]
[fixture: railroad/abnf-semicolon-repeat-after-star]
[fixture: railroad/abnf-semicolon-repeat-before-primary]
[fixture: railroad/abnf-directive-repeat-before-primary]

## 文法

### 配置と metadata

```text
ir-diagram = "railroad-beta" metadata* ir-rule* end-of-text
ebnf-diagram = "railroad-ebnf-beta" metadata* ebnf-rule* end-of-text
abnf-diagram = "railroad-abnf-beta" metadata* abnf-rule* end-of-text
peg-diagram = "railroad-peg-beta" metadata* peg-rule* end-of-text
metadata = title-line | acc-title-line | acc-descr-line | acc-descr-block
```

[共通の文法記法](../common.md#notation)を使う。
repeat の内部を除き、完成した native の単位の間には
native padding、comment、合う hidden form を置ける。
metadata は任意の順で繰り返せるが、最初の規則より前に限る。
空の metadata block も文であり、式の内部の hidden gap にはできない。
見出しに flag はない。
[fixture: railroad/ir-native-ownership]
[fixture: railroad/ebnf-native-ownership]
[fixture: railroad/abnf-native-ownership]
[fixture: railroad/peg-native-ownership]
[fixture: railroad/ir-common-repeat]
[fixture: railroad/ir-common-repeat-empty]
[fixture: railroad/ebnf-common-repeat-empty]
[fixture: railroad/abnf-common-repeat-empty]
[fixture: railroad/peg-common-repeat-empty]
[fixture: railroad/ir-metadata-after-rule-title]
[fixture: railroad/ebnf-metadata-after-rule-title]
[fixture: railroad/abnf-metadata-after-rule-title]
[fixture: railroad/peg-metadata-after-rule-title]
[fixture: railroad/ir-native-empty-block]
[fixture: railroad/ebnf-native-empty-block]
[fixture: railroad/abnf-native-empty-block]
[fixture: railroad/peg-native-empty-block]

body は空でも、metadata と残る形だけでもよい。
見出しの境目と行の内容の規則を満たせば、
見出し後や文の間に visible newline は要らない。
規則には visible なセミコロンが常に要り、
余分な単独のセミコロンは空の文にはならない。
[fixture: railroad/ir-header-only]
[fixture: railroad/ebnf-header-only]
[fixture: railroad/abnf-header-only]
[fixture: railroad/peg-header-only]
[fixture: railroad/ir-header-inline]
[fixture: railroad/ebnf-header-inline]
[fixture: railroad/abnf-header-inline]
[fixture: railroad/peg-header-inline]
[fixture: railroad/ir-rule-tail-semicolon]
[fixture: railroad/ebnf-rule-tail-semicolon]
[fixture: railroad/abnf-comment-double-terminator]
[fixture: railroad/peg-rule-tail-semicolon]

### IR の文法

```text
ir-rule = ir-name "=" ir-expression ";"
ir-expression = ir-sequence | ir-choice | ir-optional | ir-one-or-more
              | ir-zero-or-more | ir-terminal | ir-nonterminal | ir-special
ir-sequence = "sequence" "(" ir-arguments ")"
ir-choice = "choice" "(" ir-arguments ")"
ir-arguments = ir-expression ("," ir-expression)*
ir-optional = "optional" "(" ir-expression ")"
ir-one-or-more = "oneOrMore" "(" ir-expression ")"
ir-zero-or-more = "zeroOrMore" "(" ir-expression ")"
ir-terminal = "terminal" "(" ir-string ")"
ir-nonterminal = "nonterminal" "(" ir-string ")"
ir-special = "special" "(" ir-string ")"
```

[IR の文法][ir-expressions]は case-sensitive な 8 constructor を持つ。
sequence と choice は 1 個以上の引数、
それ以外は指定の形の引数をちょうど 1 個要求する。
空 call、末尾の comma、余分な引数、裸の文字列、裸の参照、
未知の constructor は拒否する。
1 引数の sequence と choice も、木では書かれた call のまま保つ。
[fixture: railroad/ir-gram-written-tree]
[fixture: railroad/ir-error-empty-call]
[fixture: railroad/ir-error-empty-choice]
[fixture: railroad/ir-error-empty-optional]
[fixture: railroad/ir-choice-trailing-comma]
[fixture: railroad/ir-error-extra-argument]
[fixture: railroad/ir-error-bare-string]
[fixture: railroad/ir-error-unknown-expression]
[fixture: railroad/ir-error-bare-reference]
[fixture: railroad/ir-db-singletons]
[fixture: railroad/ir-error-empty-oneormore]
[fixture: railroad/ir-error-extra-oneormore]
[fixture: railroad/ir-error-empty-zeroormore]
[fixture: railroad/ir-error-extra-zeroormore]
[fixture: railroad/ir-error-extra-optional]
[fixture: railroad/ir-error-extra-nonterminal]
[fixture: railroad/ir-error-extra-special]

### EBNF の文法

```text
ebnf-rule = ebnf-name ("=" | "::=") ebnf-choice ";"
ebnf-choice = ebnf-sequence ("|" ebnf-sequence)*
ebnf-sequence = ebnf-term (","? ebnf-term)*
ebnf-term = ebnf-primary ebnf-postfix*
ebnf-primary = ebnf-string | ebnf-name | special-sequence
             | "(" ebnf-choice ")" | "[" ebnf-choice "]"
             | "{" ebnf-choice "}"
ebnf-postfix = "?" | "*" | "+" | "-" ebnf-primary
```

[EBNF の文法][ebnf-expressions]は外側から choice、sequence、
後置演算を持つ term、最も内側の primary の順。
sequence の各境目の comma は任意だが、項の欠落は許さない。
空の definition、alternative、group、optional group、
repetition group は拒否する。
[fixture: railroad/ebnf-gram-written-tree]
[fixture: railroad/ebnf-rhs-empty]
[fixture: railroad/ebnf-alternative-empty-first]
[fixture: railroad/ebnf-alternative-empty-last]
[fixture: railroad/ebnf-comma-trailing]
[fixture: railroad/ebnf-error-empty-group]
[fixture: railroad/ebnf-empty-optional]
[fixture: railroad/ebnf-error-empty-repetition]

後置演算は書かれた順に左から入れ子に適用し、
例外の右 operand は primary に限る。
`A - B - C+` の最後の plus は、先の 2 個の例外全体へ掛かる。
字句の special-sequence の規則を先に決めるため、
後置の question mark に見える部分がその primary に入る場合もある。
[fixture: railroad/ebnf-exception-leftfold]
[fixture: railroad/ebnf-db-postfix-order]
[fixture: railroad/ebnf-postfix-special-priority]
[fixture: railroad/ebnf-gram-postfix-chain]

### ABNF の文法

```text
abnf-rule = abnf-name "=" abnf-choice ";"
abnf-choice = abnf-sequence ("/" abnf-sequence)*
abnf-sequence = abnf-element+
abnf-element = abnf-repeat? abnf-primary
abnf-repeat = abnf-count | abnf-count? "*" abnf-count?
abnf-primary = abnf-string | abnf-numeric-value | abnf-name
             | "(" abnf-choice ")" | "[" abnf-choice "]"
```

[ABNF の文法][abnf-expressions]は外側から slash choice、連結、
1 個の primary への任意の repeat prefix の順。
native の repeat の部品は前述のとおり隣接する必要がある。
空の definition、alternative、group、optional group と、
追加定義の `=/` は拒否する。
count と参照は別で、符号や小数の count は扱わない。
[fixture: railroad/abnf-gram-written-tree]
[fixture: railroad/abnf-rhs-empty]
[fixture: railroad/abnf-alternative-empty-first]
[fixture: railroad/abnf-alternative-empty-last]
[fixture: railroad/abnf-empty-group]
[fixture: railroad/abnf-empty-optional]
[fixture: railroad/abnf-error-incremental]
[fixture: railroad/abnf-number-negative]
[fixture: railroad/abnf-number-plus]
[fixture: railroad/abnf-number-fraction]

native comment が取ったセミコロンは規則を終えない。
`r="a"; comment` には別の visible セミコロンが要り、
そのセミコロンの後の同じ行に書いた次の規則は、
別の規則でなく comment の内容となる。
直後が LF か EOF の終端記号は visible のままである。
[fixture: railroad/abnf-comment-terminator]
[fixture: railroad/abnf-comment-terminator-control]
[fixture: railroad/abnf-comment-two-rules-line]
[fixture: railroad/abnf-comment-terminator-space]
[fixture: railroad/abnf-db-empty-string]
[fixture: railroad/abnf-line-crlf]

### PEG の文法

```text
peg-rule = peg-name "<-" peg-choice ";"
peg-choice = peg-sequence ("/" peg-sequence)*
peg-sequence = peg-prefix+
peg-prefix = ("&" | "!")? peg-suffix
peg-suffix = peg-primary ("?" | "*" | "+")?
peg-primary = peg-string | peg-name | "(" peg-choice ")" | "."
```

[PEG の文法][peg-expressions]は slash の選択肢の順を保つ。
choice の内側に sequence、prefix の内側に suffix が結び付き、
group は choice 全体を囲む。
各項の prefix と suffix はそれぞれ 1 個までで、
括弧の内側にはさらに式を入れられる。
空の definition、alternative、group、operand のない prefix は拒否する。
[fixture: railroad/peg-gram-written-tree]
[fixture: railroad/peg-gram-double-prefix]
[fixture: railroad/peg-gram-double-suffix]
[fixture: railroad/peg-rhs-empty]
[fixture: railroad/peg-gram-empty-alternative]
[fixture: railroad/peg-alternative-empty-last]
[fixture: railroad/peg-gram-empty-group]
[fixture: railroad/peg-prefix-missing-operand]
[fixture: railroad/peg-db-predicate-predicate]

dot は独立した primary で、predicate は group と postfix も含めて、
suffix operand 全体を保つ。
書かれた predicate の operand を公開 label に置き換えたり、
singleton group を除いたりしない。
[fixture: railroad/peg-gram-written-tree]
[fixture: railroad/peg-db-predicates]
[fixture: railroad/peg-db-predicate-singleton-group]
[fixture: railroad/peg-db-predicate-quote-newline]

### 文法と木のノード

| 生成規則                                        | ノード                                                                                                                                                                                    |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 各 diagram                                      | RailroadDiagram [fixture: railroad/ir-header-only] [fixture: railroad/ebnf-header-only] [fixture: railroad/abnf-header-only] [fixture: railroad/peg-header-only]                          |
| 各 rule                                         | RailroadRule [fixture: railroad/ir-gram-written-tree] [fixture: railroad/ebnf-gram-written-tree] [fixture: railroad/abnf-gram-written-tree] [fixture: railroad/peg-gram-written-tree]     |
| title-line / acc-title-line                     | RailroadTitleStatement / RailroadAccTitleStatement [fixture: railroad/ir-common-repeat-empty]                                                                                             |
| acc-descr-line / acc-descr-block                | RailroadAccDescrStatement / RailroadAccDescrBlockStatement [fixture: railroad/ir-common-block-empty-interleaved]                                                                          |
| ir-sequence / ir-choice                         | RailroadSequenceCall / RailroadChoiceCall [fixture: railroad/ir-db-singletons] [fixture: railroad/ir-gram-written-tree]                                                                   |
| ir-optional / ir-one-or-more / ir-zero-or-more  | RailroadOptionalCall / RailroadOneOrMoreCall / RailroadZeroOrMoreCall [fixture: railroad/ir-gram-written-tree]                                                                            |
| ir-terminal / ir-nonterminal / ir-special       | RailroadTerminalCall / RailroadNonterminalCall / RailroadSpecialCall [fixture: railroad/ir-db-empty-strings]                                                                              |
| 複数要素の自然記法の choice / sequence          | RailroadChoiceExpression / RailroadSequenceExpression [fixture: railroad/ebnf-gram-written-tree] [fixture: railroad/abnf-gram-written-tree] [fixture: railroad/peg-gram-written-tree]     |
| 括弧・角括弧の group                            | RailroadGroupExpression / RailroadOptionalGroupExpression [fixture: railroad/ebnf-gram-written-tree] [fixture: railroad/abnf-gram-written-tree] [fixture: railroad/peg-gram-written-tree] |
| EBNF brace group / special sequence / exception | RailroadRepetitionGroupExpression / RailroadSpecialSequence / RailroadExceptionExpression [fixture: railroad/ebnf-gram-written-tree]                                                      |
| EBNF・PEG の postfix                            | RailroadPostfixExpression [fixture: railroad/ebnf-db-postfix-order] [fixture: railroad/peg-gram-written-tree]                                                                             |
| ABNF repeat / star-repeat                       | RailroadRepeatExpression / RailroadRepeatRange [fixture: railroad/abnf-gram-written-tree]                                                                                                 |
| abnf-numeric-value                              | RailroadNumericValue [fixture: railroad/abnf-numval-boundaries]                                                                                                                           |
| PEG predicate / dot                             | RailroadPredicateExpression / RailroadAnyExpression [fixture: railroad/peg-gram-written-tree]                                                                                             |
| 名前・引用文字列・十進 count                    | Identifier / StringLiteral / NumericLiteral [fixture: railroad/ir-db-empty-strings] [fixture: railroad/abnf-gram-written-tree]                                                            |
| metadata の値・native hidden form               | RailroadLiteral / RailroadIgnoredText [fixture: railroad/ir-common-whitespace-shapes] [fixture: railroad/ir-native-ownership]                                                             |

自然記法の 1 要素の choice と sequence は wrapper を作らず、その要素にする。
明示された call と書かれたすべての group は、子が 1 個でもノードとして保つ。
list の member は、木の文書の名前つき hidden ownership のために
RailroadExpressionMember を使う。
[fixture: railroad/ir-db-singletons]
[fixture: railroad/ebnf-db-singletons]
[fixture: railroad/abnf-db-singletons]
[fixture: railroad/peg-db-singletons]
[fixture: railroad/ir-native-ownership]
[fixture: railroad/ebnf-native-ownership]
[fixture: railroad/abnf-native-ownership]
[fixture: railroad/peg-native-ownership]

### 受理と設定

未読の単位も合わない字もない完全な読取りだけを受理する。
回復した読取りは受理の根拠にならない。
追加の意味的な受理条件はなく、重複名、前方参照、未定義参照、再帰、
repeat の逆順の両端値、有限の double を超える count も許す。
規則名の一意性や base ごとの numeric value の検証は要求しない。
[fixture: railroad/ir-error-before-rule]
[fixture: railroad/ir-gram-reference-resolution]
[fixture: railroad/ebnf-gram-reference-resolution]
[fixture: railroad/abnf-gram-reference-resolution]
[fixture: railroad/peg-gram-reference-resolution]
[fixture: railroad/ebnf-error-before-rule]
[fixture: railroad/abnf-error-before-rule]
[fixture: railroad/peg-error-before-rule]
[fixture: railroad/ir-db-duplicates]
[fixture: railroad/ebnf-db-duplicates]
[fixture: railroad/abnf-db-duplicates]
[fixture: railroad/peg-db-duplicates]
[fixture: railroad/ir-db-all-fields]
[fixture: railroad/abnf-db-repeat-reversed]
[fixture: railroad/abnf-db-repeat-precision]
[fixture: railroad/abnf-db-repeat-overflow]
[fixture: railroad/abnf-numval-boundaries]

これらの条件の出典は [railroadParser.ts][ir-gate]、
[ebnfParser.ts][ebnf-gate]、[abnfParser.ts][abnf-gate]、
[pegParser.ts][peg-gate] の完全入力の検査と、
[railroadDb.ts][db]に追加の拒否がないこと。
有効な `railroad.*` の設定は描画に作用し、構文受理には作用せず、
semantic acceptance key を追加しない。
埋込みデータの導出の失敗には、共通の opaque-data の規則を適用する。
[fixture: railroad/ir-config-drawing-site]
[fixture: railroad/ir-config-frontmatter-drawing]
[fixture: railroad/ebnf-config-init-drawing]
[fixture: railroad/abnf-config-frontmatter-drawing]
[fixture: railroad/peg-config-init-drawing]
[fixture: railroad/ir-config-frontmatter-cannot-rescue]
[fixture: railroad/ebnf-config-frontmatter-cannot-rescue]
[fixture: railroad/abnf-config-init-cannot-rescue]
[fixture: railroad/peg-config-init-cannot-rescue]
[fixture: railroad/ir-config-frontmatter-fontfamily-number]
[fixture: railroad/ebnf-config-init-fontfamily-number]
[fixture: railroad/abnf-config-frontmatter-fontfamily-number]
[fixture: railroad/peg-config-init-fontfamily-number]

### Db の正規化

[railroad の Db 要約](../../../tests/docs/db-summaries.md#railroad)が、
4 id の変換と正規化を定義する。
図全体の title はその比較用要約から除くが、原文の木には残す。
frontmatter の title は共有の embedded values に残る。
group、call の構文、引用符、repeat の綴り、predicate の全 operand も、
正規化後の Db にかかわらず書かれた構造として保つ。
[fixture: railroad/ir-frontmatter-empty-body-title]
[fixture: railroad/ebnf-frontmatter-empty-body-title]
[fixture: railroad/abnf-frontmatter-empty-body-title]
[fixture: railroad/peg-frontmatter-empty-body-title]
[fixture: railroad/ir-db-singletons]
[fixture: railroad/ebnf-db-singletons]
[fixture: railroad/abnf-db-repeat-leading-zero]
[fixture: railroad/peg-db-predicates]

## 既知の差異

次の既存の識別子を適用する。
空文字列は値として保ち、空 call は構文エラーなので、
tokenless-empty-forms は適用しない。
native hidden form には owner があり、
Mermaid が公開しないことだけを理由に拒否しない。
[fixture: railroad/ir-db-empty-strings]
[fixture: railroad/ebnf-db-empty-string]
[fixture: railroad/abnf-db-empty-string]
[fixture: railroad/peg-db-empty-string]
[fixture: railroad/ir-error-empty-call]
[fixture: railroad/ir-native-ownership]
[fixture: railroad/ebnf-native-ownership]
[fixture: railroad/abnf-native-ownership]
[fixture: railroad/peg-native-ownership]

[`directive-as-token-boundary`](../known-divergences/directive-as-token-boundary.ja.md):
前述の書かれた atom の内部の directive は拒否する。
repeat の bound と star の間、numeric value の text の内部では引き続き許す。
共有 Directive record は source を保つが、
分断した名前、keyword、delimiter、十進 count を 1 atom にはしない。
[fixture: railroad/ir-div-directive-header]
[fixture: railroad/ir-directive-keyword-glued]
[fixture: railroad/ebnf-div-directive-assignment]
[fixture: railroad/abnf-directive-repeat-number]
[fixture: railroad/peg-directive-operator]
[fixture: railroad/abnf-directive-repeat]
[fixture: railroad/abnf-directive-numval-digits]

[`ignored-semicolon-as-token-boundary`](../known-divergences/ignored-semicolon-as-token-boundary.ja.md): 共通の line rule が選んだセミコロンが
名前、keyword、十進 count、複合 delimiter の内部にあると、その atom を分断する。
numeric value の text も含め、text の値では選ばれたセミコロンを引き続き許す。
元の句読点は共通の trivia として残る。
[fixture: railroad/ir-div-semicolon-rule-name]
[fixture: railroad/ir-div-semicolon-constructor-keyword]
[fixture: railroad/ir-div-semicolon-title-keyword]
[fixture: railroad/abnf-div-semicolon-repeat-number]
[fixture: railroad/peg-div-semicolon-assignment]
[fixture: railroad/abnf-semicolon-numval-text]

[`html-tag-in-frontmatter`](../known-divergences/html-tag-in-frontmatter.ja.md):
body の HTML の引用符の読取りは frontmatter の後で始め、
frontmatter の開いた tag を body の文字列や共通値へ持ち越さない。
Frontmatter と値のノードは source を保つが、
ignored-text の兄弟ノードでは fence を跨ぐ引用符の文脈を表せない。
各方言に Mermaid だけの受理、仕様だけの受理、両受理の値の差がある。
[fixture: railroad/ir-div-html-frontmatter-rule-accept]
[fixture: railroad/ir-div-html-frontmatter-rule-reject]
[fixture: railroad/ir-div-html-frontmatter-acctitle]
[fixture: railroad/ebnf-div-html-frontmatter-rule-accept]
[fixture: railroad/ebnf-div-html-frontmatter-rule-reject]
[fixture: railroad/ebnf-div-html-frontmatter-acctitle]
[fixture: railroad/abnf-div-html-frontmatter-rule-accept]
[fixture: railroad/abnf-div-html-frontmatter-rule-reject]
[fixture: railroad/abnf-div-html-frontmatter-acctitle]
[fixture: railroad/peg-div-html-frontmatter-rule-accept]
[fixture: railroad/peg-div-html-frontmatter-rule-reject]
[fixture: railroad/peg-div-html-frontmatter-acctitle]

[`embedded-data-opaque`](../known-divergences/embedded-data-opaque.ja.md):
先頭 frontmatter と global directive の内容を、
YAML、JSON、設定の型を検証せず保つ。
有効な設定から railroad の acceptance key は除かない。
数の railroad font family を埋め込むと Mermaid の設定導出が失敗し得るが、
この仕様は適切な delimiter を持つ図を受理する。
[fixture: railroad/ir-div-frontmatter-invalid]
[fixture: railroad/ir-config-frontmatter-fontfamily-number]
[fixture: railroad/ebnf-config-init-fontfamily-number]
[fixture: railroad/abnf-config-frontmatter-fontfamily-number]
[fixture: railroad/peg-config-init-fontfamily-number]

[`bare-percent-line-before-header`](../known-divergences/bare-percent-line-before-header.ja.md):
通過した bare line と伴う trivia を再び読まない。
Comment record と空白として原文を保ち、
共有の直接規則により、その Unicode padding を拒否する
native lexer へ渡し直さない。
[fixture: railroad/ir-bare-nbsp]
[fixture: railroad/ebnf-bare-unicode]
[fixture: railroad/abnf-bare-unicode]
[fixture: railroad/peg-bare-unicode]
[fixture: railroad/ir-secondscan-between-bares-unicode]

[`c4-keyword-anywhere`](../known-divergences/c4-keyword-anywhere.ja.md):
後の text に C4Container、C4Component、
C4Dynamic、C4Deployment があるため C4 に切り替えるのでなく、
見出しで railroad の方言を選ぶ。
書かれた名前、文字列、special の形は、それぞれの自然なノードにその語を保つ。
[fixture: railroad/ir-c4-container-terminal]
[fixture: railroad/ebnf-c4-component-special]
[fixture: railroad/abnf-c4-dynamic-string]
[fixture: railroad/peg-c4-deployment-predicate]

[ir-module]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/railroad/module.ts#L1-L56
[ir-converter]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/railroad/valueConverter.ts#L1-L68
[ebnf-module]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/railroad-ebnf/module.ts#L1-L58
[ebnf-converter]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/railroad-ebnf/valueConverter.ts#L1-L72
[abnf-module]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/railroad-abnf/module.ts#L1-L58
[abnf-converter]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/railroad-abnf/valueConverter.ts#L1-L37
[peg-module]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/railroad-peg/module.ts#L1-L58
[peg-converter]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/railroad-peg/valueConverter.ts#L1-L68
[ir-lex]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/railroad/railroad.langium#L3-L14
[ebnf-lex]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/railroad-ebnf/railroad-ebnf.langium#L3-L20
[abnf-lex]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/railroad-abnf/railroad-abnf.langium#L3-L17
[peg-lex]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/railroad-peg/railroad-peg.langium#L3-L14
[ir-expressions]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/railroad/railroad.langium#L72-L113
[ebnf-expressions]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/railroad-ebnf/railroad-ebnf.langium#L100-L166
[abnf-expressions]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/railroad-abnf/railroad-abnf.langium#L76-L114
[peg-expressions]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/railroad-peg/railroad-peg.langium#L74-L111
[common-builder]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/common/tokenBuilder.ts#L1-L31
[db]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/railroad/railroadDb.ts#L1-L155
[ir-detector]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/railroad/railroadDetector.ts#L1-L32
[ir-gate]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/railroad/parser/railroadParser.ts#L92-L113
[ebnf-detector]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/railroad/ebnfDetector.ts#L1-L22
[ebnf-gate]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/railroad/parser/ebnfParser.ts#L148-L169
[abnf-detector]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/railroad/abnfDetector.ts#L1-L22
[abnf-gate]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/railroad/parser/abnfParser.ts#L130-L151
[peg-detector]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/railroad/pegDetector.ts#L1-L22
[peg-gate]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/railroad/parser/pegParser.ts#L139-L160
