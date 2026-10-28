# Cynefin

英語版: [cynefin.md](./cynefin.md)

cynefin 図とその[書かれた木](../ast/cynefin.ja.md)を定義する。
公開の見出しは cynefin-beta で、
直結した colon を付けてもよい。 [fixture: cynefin/header-only]
[fixture: cynefin/header-colon]

## 検出

[detector][detector] は [detection.md](../detection.ja.md) の 38 番で、
大文字小文字を区別する。
先頭の共通空白の後の cynefin-beta に、共通空白、colon、
テキスト末尾のいずれかが続く。
英字、数字、underscore、dash、他の Unicode 文字、
semicolon はその境目を満たさない。 [fixture: cynefin/header-only]
[fixture: cynefin/header-colon] [fixture: cynefin/header-uppercase]
[fixture: cynefin/header-letter] [fixture: cynefin/header-digit]
[fixture: cynefin/header-word] [fixture: cynefin/header-dash]
[fixture: cynefin/header-unicode] [fixture: cynefin/header-punctuation]

[文法][grammar] の見出しは cynefin-beta と cynefin-beta: の二つで、
どちらにも後続の EOL は要らない。
colon の無い形の独自の境目は共通空白、テキスト末尾、%% で、
colon つきの形には後続の境目の検査が無い。
語と colon の間の空白や native
hidden な形は colon つきの見出しを作らない。 [fixture: cynefin/header-inline]
[fixture: cynefin/header-colon-inline] [fixture: cynefin/header-colon-title]
[fixture: cynefin/header-spaced-colon]
[fixture: cynefin/native-header-word-colon]
[fixture: cynefin/header-native-spaced-no-eol]

CR の変換、共通 directive、選ばれた semicolon、HTML 属性、entity、
論理的なテキスト末尾を含む[共通の読み](../common.ja.md#ソースの読み方)を適用する。
文法の見出しの境目は共通の除去の後で判定する。
colon の前や残る空白の前の共通 directive は許すが、
除去で見出しと complex が接合すれば拒否する。
検出は選ばれた semicolon の除去より先なので、
見出しの中や語と colon の間の semicolon は検出を修復しない。
先にある C4 の検出には c4-keyword-anywhere を適用する。 [fixture: cynefin/line-cr]
[fixture: cynefin/line-crlf] [fixture: cynefin/directive-every-field]
[fixture: cynefin/entity-texts] [fixture: cynefin/header-global-before-colon]
[fixture: cynefin/header-global-boundary-space]
[fixture: cynefin/directive-header-glued]
[fixture: cynefin/selected-header-detection]
[fixture: cynefin/selected-header-components]
[fixture: cynefin/c4-component-item]

colon の無い見出しに接する %% は、検出対象のソースに後続の LF がある場合にだけ、
検出用のコメント除去によってテキスト末尾を露出できる。
同じ行の領域が続く native
directive の直結は、末尾に LF があれば受理し、無ければ検出で拒否する。
通常のコメントの直結にも同じ LF の条件がある。
%% の前に空白があれば、それ自体が検出の境目となる。
検出用の除去は、文法の入力から native
directive や続く領域を除かない。 [fixture: cynefin/header-native-no-eol]
[fixture: cynefin/header-native-spaced-no-eol]
[fixture: cynefin/header-native-glued-line-feed]
[fixture: cynefin/header-native-comment-glued-line-feed]
[fixture: cynefin/header-native-comment-glued-eof]
[fixture: cynefin/header-native-colon-glued]

本来の先頭 frontmatter は共有の Frontmatter レコードである。
その後の検出点では、
共通の検出は retained な frontmatter 状のブロックを高々一つ飛ばし、
その後で通過する裸の %% 行と二度目の directive の走査を扱う。
retained なブロックの飛ばしには本文の行、
字下げの無い三つの dash の閉じとその後の改行が必要で、
閉じに接尾の文字を許さない。
空の隣接する fence、閉じの欠落、字下げした閉じ、四つの dash、接尾の文字、
EOF の閉じ、二つ目のブロック、先行する裸の %% 行はこの飛ばしを止める。
開きの前の字下げを通過しても、
閉じの字下げは許されない。 [fixture: cynefin/frontmatter-title]
[fixture: cynefin/detect-block-after-directive]
[fixture: cynefin/detect-retained-empty]
[fixture: cynefin/detect-retained-three-fences]
[fixture: cynefin/detect-retained-missing]
[fixture: cynefin/detect-retained-indent-mismatch]
[fixture: cynefin/detect-retained-four-dashes]
[fixture: cynefin/detect-retained-close-suffix]
[fixture: cynefin/detect-retained-close-no-lf]
[fixture: cynefin/detect-retained-close-eof]
[fixture: cynefin/detect-retained-two]
[fixture: cynefin/detect-retained-opening-indent]
[fixture: cynefin/detect-retained-before-bare]

文法は retained YAML と本物の二度目の走査の directive を、
それぞれ native の境目で読む。
これらは埋め込み設定でなく CynefinIgnoredText である。
その前に本来の frontmatter を置ける。
retained YAML が二度目の走査の directive より前なら受理できるが、
逆順でもう一度 YAML を飛ばすことはない。
二つの二度目の走査の directive を読める場合はあるが、
閉じと見出しの直結は native の境目を満たさない。 [fixture: cynefin/detect-real-before-retained-secondscan]
[fixture: cynefin/detect-retained-yaml-properties]
[fixture: cynefin/prefix-yaml-before-secondscan]
[fixture: cynefin/prefix-yaml-after-secondscan]
[fixture: cynefin/prefix-two-secondscans]
[fixture: cynefin/detect-secondscan-glued]

検出が通過した裸の %% 行は共有の Comment となり、
一緒に通過した空白と改行は retained な形の間でも trivia となる。
見出しの位置と検出点は異なる。
ASCII の対照は native の境目を保つ。
通過した U+2028 や U+2029 は、bare-percent-line-before-header に従って、
native の空白として読み直さない。
通過した裸の行が無ければ、
native の接頭の境目の Unicode の文字には native の規則が必要である。 [fixture: cynefin/detect-retained-secondscan-bare-ascii]
[fixture: cynefin/detect-retained-secondscan-bare-ls]
[fixture: cynefin/detect-retained-secondscan-bare-ps]
[fixture: cynefin/bare-before-ls] [fixture: cynefin/bare-line-ps]
[fixture: cynefin/retained-directive-between-bares]
[fixture: cynefin/prefix-yaml-unicode-no-bare]

## 字句構造

### 単位の優先順

[Cynefin の token builder][cynefin-token] は [共通の token builder][common-token] に、
colon の無い cynefin-beta だけの独自 matcher を加える。
実効の一つの文脈の順序は次のとおりで、先に合うものを採り、longer
alternative や一般の最長一致の規則は無い。
到達する[共通 terminal][common] を含むが、import した BOOLEAN、FLOAT、INT、
NUMBER、ID には到達しない。 [fixture: cynefin/header-colon-inline]
[fixture: cynefin/lex-domain-title-priority]
[fixture: cynefin/gram-glued-domains] [fixture: cynefin/common-title-prefix]
[fixture: cynefin/domain-digit]

| 順  | 単位             | 形                                                   |
| --- | ---------------- | ---------------------------------------------------- |
| 1   | header-colon     | cynefin-beta:                                        |
| 2   | header-bare      | 独自の境目のある cynefin-beta                        |
| 3   | transition-arrow | -->                                                  |
| 4   | label-colon      | :                                                    |
| 5   | domain-name      | complex、complicated、clear、chaotic、confusion の順 |
| 6   | acc-descr-form   | 行の選択肢がブロックより先                           |
| 7   | acc-title-line   | accTitle、空白、colon、値                            |
| 8   | title-line       | title と任意の区切りと値                             |
| 9   | string           | 対になる二重引用符または単一引用符                   |
| 10  | newline          | 共通の CR 変換後の LF                                |
| 11  | native-padding   | ASCII space と tab。読み飛ばす                       |
| 12  | native-yaml      | hidden な YAML 状のブロック                          |
| 13  | native-directive | hidden な directive 状の形                           |
| 14  | native-comment   | %% から CR または LF の直前まで                      |

領域の語と共通 keyword は大文字小文字を区別する。
領域の語には語末の境目が無く、complexclear は二つの領域、 complextitle
T は領域と title となる。
未知の接尾の文字は依然として lexer error になる。
--> は分割しない一つの矢印で、colon が別の単位となるのは囲む形の外だけである。
他の矢印、任意の領域名、
引用符の無い項目は単位でない。 [fixture: cynefin/gram-glued-domains]
[fixture: cynefin/lex-domain-title-priority] [fixture: cynefin/domain-letter]
[fixture: cynefin/domain-digit] [fixture: cynefin/domain-dash]
[fixture: cynefin/domain-word] [fixture: cynefin/domain-unicode]
[fixture: cynefin/domain-uppercase] [fixture: cynefin/common-uppercase]
[fixture: cynefin/lex-arrow-forms] [fixture: cynefin/gram-unquoted-item]

### 文字列と共通の値

string は対になる単一引用符または二重引用符を使い、空でもよい。
内側では、その引用符と backslash 以外の文字を LF、U+2028、U+2029 を含めて読む。
backslash の後には CR、LF、U+2028、U+2029 以外の一文字が必要である。
単独の backslash、escape した行区切り、対応する閉じの欠落は拒否する。
他方の引用符では閉じない。
共通の除去は内側にも適用する。 [fixture: cynefin/db-empty-texts]
[fixture: cynefin/lex-string-escaped-quotes]
[fixture: cynefin/lex-string-conversion] [fixture: cynefin/line-string-values]
[fixture: cynefin/lex-string-open-double]
[fixture: cynefin/lex-string-open-single]
[fixture: cynefin/lex-string-dangling-backslash]
[fixture: cynefin/lex-string-escaped-lf]
[fixture: cynefin/lex-string-escaped-ls]
[fixture: cynefin/lex-string-escaped-ps]
[fixture: cynefin/directive-every-field]
[fixture: cynefin/comment-line-in-string]

項目と遷移ラベルの文字列は共有の StringLiteral を使う。
raw は引用符と共通の trivia を含む書かれた全体を保ち、
value は共通の除去を除く未変換の内側を保ち、 closed は true である。
木の値の中で文字列の escape、HTML の引用符、entity を変換しない。
これらの文字列の[共通と既定の変換][converter]は、
書かれた木と分けて tests の要約で記録する。 [fixture: cynefin/lex-string-conversion]
[fixture: cynefin/lex-transition-string-conversion]
[fixture: cynefin/lex-string-unknown-single]
[fixture: cynefin/lex-transition-unknown-double] [fixture: cynefin/html-texts]
[fixture: cynefin/entity-texts] [fixture: cynefin/directive-every-field]

title-line は title の後に何も無い形、または正確に一つの ASCII
space か tab の区切りとその行の残りを読む。
語末の境目は要求しないため、titleX の X は値でなく未読の接尾の文字になる。
acc-title-line と acc-descr-form の行の選択肢は colon の前に ASCII
space と tab を許し、colon の直後から値を読む。
行の値は CR、LF、最初の %% の直前で止まり、U+2028、U+2029、引用符、
波括弧は通常の文字として含む。
特に accDescr: {x} は行の値である。 [fixture: cynefin/common-title-eof]
[fixture: cynefin/common-title-prefix] [fixture: cynefin/common-line-whitespace]
[fixture: cynefin/common-quoted-values] [fixture: cynefin/common-open-quote]
[fixture: cynefin/common-title-comment-only]
[fixture: cynefin/common-acctitle-comment-only]
[fixture: cynefin/common-description-comment-only]
[fixture: cynefin/common-colon-block-priority]
[fixture: cynefin/line-common-values] [fixture: cynefin/lex-title-one-space]
[fixture: cynefin/lex-title-one-tab] [fixture: cynefin/lex-title-two-spaces]
[fixture: cynefin/lex-common-whitespace-literals]

ブロックの選択肢は accDescr、零個以上の共通空白、開きの波括弧、
最初の閉じの波括弧までの任意の文字、その閉じを読む。
本文に CR、LF、U+2028、U+2029 を含み、引用符や backslash は閉じを保護しない。
閉じが無ければ拒否する。
空や空白だけのブロックも完全な文である。
共通 directive やコメント領域の除去でブロックが空になる場合もあり、
囲むブロックの中の native 状の形は値の文字のままとなる。 [fixture: cynefin/common-block-unicode-gap]
[fixture: cynefin/common-block-empty-gap]
[fixture: cynefin/common-block-comment-gap]
[fixture: cynefin/common-block-directive-gap]
[fixture: cynefin/common-block-ls-gap] [fixture: cynefin/line-block-values]
[fixture: cynefin/common-block-first-close]
[fixture: cynefin/common-block-escaped-close]
[fixture: cynefin/common-block-quoted-close]
[fixture: cynefin/common-block-open] [fixture: cynefin/common-repeat-empty]
[fixture: cynefin/common-block-whitespace]
[fixture: cynefin/common-block-comment-only]
[fixture: cynefin/common-block-directive-only]
[fixture: cynefin/hidden-yaml-block] [fixture: cynefin/hidden-directive-block]

共通の四つの形はそれぞれ別の文の node を持つ。
行の値は区切りや colon の後の書かれた空白をすべて保つ。
title の区切り一つだけなら null、
二つの space なら一つの space の non-null の literal、
accessibility の colon の後の空白なら non-null の literal となる。
ブロックの値は外端だけの共通空白を除き、内部の字下げと改行を保ち、
残りが空なら null となる。
CynefinLiteral に、
[converter][converter] の空白の圧縮や escape の変換を適用しない。 [fixture: cynefin/lex-title-one-space]
[fixture: cynefin/lex-title-one-tab] [fixture: cynefin/lex-title-two-spaces]
[fixture: cynefin/lex-common-whitespace-literals]
[fixture: cynefin/common-line-whitespace]
[fixture: cynefin/common-block-whitespace]
[fixture: cynefin/common-empty-interleaved]
[fixture: cynefin/directive-every-field]

### native hidden な形と EOL

完全な可視の単位の間で native-padding が飛ばすのは ASCII space と tab だけで、
newline は共通の CR と CRLF の変換後の LF である。
U+2028、U+2029、NBSP、BOM、全角 space は native の空白にも EOL にもならない。
先頭の共通空白は別に扱う。
native-comment は、任意の ASCII の空白の接頭と %% から、
CR または LF の直前までを読み、その newline は可視のまま残す。
percent 一つはその印でない。
共有のコメントのレコードは、
共通の除去を除いた書かれた印と文字を保つ。 [fixture: cynefin/space-tabs]
[fixture: cynefin/space-lines]
[fixture: cynefin/line-cr] [fixture: cynefin/line-crlf]
[fixture: cynefin/line-ls-gap] [fixture: cynefin/line-ps-gap]
[fixture: cynefin/space-nbsp-body] [fixture: cynefin/space-bom-body]
[fixture: cynefin/space-3000-body] [fixture: cynefin/space-bom-leading]
[fixture: cynefin/comment-native-between-items]
[fixture: cynefin/comment-single-percent]

native-yaml は正確に三つの dash、任意の ASCII space と tab、newline、
newline で終わる任意の本文、字下げの無い三つの閉じの dash を読む。
閉じは後続の newline を消費するか、
消費しない共通空白かテキスト末尾の境目を要求する。
本文のある選択肢を空の本文より先に試し、どちらもできるだけ短く読む。
隣接する三つの fence が一つの一致になる場合があり、
閉じの境目が合わなければ後の閉じまで続く。
空でない二つのブロックは二つの一致のままにもなる。
四つの dash、字下げした閉じ、閉じの欠落、
空白でない接尾の文字はこの形を満たさない。 [fixture: cynefin/hidden-yaml-adjacent-later]
[fixture: cynefin/hidden-yaml-adjacent-eof]
[fixture: cynefin/hidden-yaml-adjacent-no-later]
[fixture: cynefin/hidden-yaml-two-nonempty]
[fixture: cynefin/hidden-yaml-closer-indented]
[fixture: cynefin/hidden-yaml-four-close]
[fixture: cynefin/hidden-yaml-closer-inline-gap]
[fixture: cynefin/hidden-yaml-opener-padding]
[fixture: cynefin/hidden-yaml-open-eof]
[fixture: cynefin/hidden-yaml-four-dashes]
[fixture: cynefin/hidden-yaml-closing-ls]
[fixture: cynefin/selected-native-yaml-closer]

native-directive は任意の ASCII の空白、%%{、
後続の境目が合う }%% までのできるだけ短い任意の文字を読み、
その後で newline を消費するか共通空白かテキスト末尾を検査する。
空白でない文字に直結する閉じは、一致を後の閉じまで延ばしうる。
全体の形が合わなければ native-comment がその行を読める。
これらは共通 directive ではない。
先に試す文字列と共通の値は native 状の文字を囲むため、その中に ignored
node を作らない。 [fixture: cynefin/hidden-directive-adjacent]
[fixture: cynefin/hidden-native-comment-fallback]
[fixture: cynefin/hidden-directive-comment-fallback-kept]
[fixture: cynefin/hidden-directive-string] [fixture: cynefin/hidden-yaml-string]
[fixture: cynefin/hidden-yaml-block] [fixture: cynefin/hidden-directive-block]

両方の hidden の本文は LF、U+2028、U+2029 を含められ、
ソースの CR と CRLF の綴りを木に保つ。
本文内で除去した共通 directive とコメント領域は値から除くが、
ソースの範囲には残る。
Unicode の閉じの境目が hidden の一致を成立させても、
native の空白でない文字が残って入力全体を拒否する場合がある。 [fixture: cynefin/hidden-yaml-ps-body]
[fixture: cynefin/hidden-directive-ls-body]
[fixture: cynefin/hidden-directive-cr] [fixture: cynefin/hidden-directive-crlf]
[fixture: cynefin/hidden-yaml-bare-cr]
[fixture: cynefin/hidden-yaml-common-directive]
[fixture: cynefin/hidden-yaml-comment-region]
[fixture: cynefin/hidden-directive-closing-ps]
[fixture: cynefin/hidden-yaml-closing-ls]

可視の EOL は一つ以上の可視の newline または論理的なテキスト末尾である。
hidden な形は、付加した LF を含む唯一の後続の LF を、
EOL を供給せずに消費しうる。
その場合、遷移と共通の文にはもう一つの可視の LF かテキスト末尾が必要で、
閉じに space が続けば LF は残る。
領域のブロックと項目には EOL が要らないため、同じ消費を許す。
native な形全体を[名前つきの所有者](../ast/cynefin.ja.md#hidden-な形の所有)の CynefinIgnoredText とし、
消費した後続の改行を自身の範囲から除く。 [fixture: cynefin/hidden-directive-sole-lf]
[fixture: cynefin/hidden-directive-spare-lf]
[fixture: cynefin/hidden-directive-eof]
[fixture: cynefin/hidden-directive-closing-space]
[fixture: cynefin/hidden-yaml-sole-lf] [fixture: cynefin/hidden-yaml-spare-lf]
[fixture: cynefin/hidden-yaml-eof] [fixture: cynefin/hidden-yaml-closing-space]
[fixture: cynefin/hidden-after-domain] [fixture: cynefin/hidden-after-item]
[fixture: cynefin/hidden-after-block]
[fixture: cynefin/hidden-after-block-spare]
[fixture: cynefin/hidden-after-label]
[fixture: cynefin/hidden-after-label-space]

### 作者の部品の境目

共通 directive と実際に選ばれた semicolon は、完全な作者の部品の間に置ける。
部品は見出しの語と colon、領域の語と項目、
遷移の両端と矢印全体と colon と文字列、共通 keyword と区切りと colon と波括弧、
native fence の個々の句読の文字である。
文字列、共通の値、hidden な値の内側にも置ける。
固定語や分割しない --> の中は割れない。
複合の行の単位でも、作者の句読の境目は語の内部にならない。
一方、native
hidden な形は複合の見出しや共通の行の単位を割れない。 [fixture: cynefin/header-global-before-colon]
[fixture: cynefin/directive-transition-parts]
[fixture: cynefin/directive-title-parts]
[fixture: cynefin/directive-description-parts]
[fixture: cynefin/directive-description-brace]
[fixture: cynefin/directive-native-yaml-components]
[fixture: cynefin/directive-native-directive-components]
[fixture: cynefin/selected-colon-label-components]
[fixture: cynefin/semicolon-arrow-parts]
[fixture: cynefin/semicolon-acctitle-parts]
[fixture: cynefin/semicolon-block-parts]
[fixture: cynefin/selected-native-yaml-opener]
[fixture: cynefin/selected-native-directive-opener]
[fixture: cynefin/selected-string-interior]
[fixture: cynefin/selected-title-components]
[fixture: cynefin/selected-native-directive-closer]
[fixture: cynefin/hidden-native-directive-opener-raw]
[fixture: cynefin/native-common-keyword-colon]
[fixture: cynefin/native-header-word-colon]
[fixture: cynefin/directive-domain-inside]
[fixture: cynefin/directive-arrow-inside]
[fixture: cynefin/semicolon-complex-inside]
[fixture: cynefin/semicolon-arrow-inside]

semicolon の選択は見た目だけでなく共通の行の規則に従う。
先に完了した文字列の style:# が後の semicolon を選べる一方、
後の印はその前の semicolon を選ばない。
同じ規則が native fence の句読や文字列の内側にも適用され、
残る semicolon は一般の文の区切りでない。 [fixture: cynefin/selected-arrow-inside]
[fixture: cynefin/semicolon-arrow-inside]
[fixture: cynefin/selected-colon-label-components]
[fixture: cynefin/selected-native-yaml-opener]
[fixture: cynefin/selected-native-directive-opener]
[fixture: cynefin/selected-string-interior]
[fixture: cynefin/selected-native-yaml-closer]
[fixture: cynefin/selected-native-directive-closer]
[fixture: cynefin/tail-domain-semicolon]

## 文法

記法は [common.md](../common.ja.md#表記) に従う。
字句の規則が許す完全な単位の間には native の空白、native hidden な形、
共有の trivia を置ける。
文法に参加するのは可視の newline だけである。
acc-descr-line と acc-descr-block は acc-descr-form の二つの選択肢である。 [fixture: cynefin/db-all-fields]
[fixture: cynefin/hidden-all-unit-gaps] [fixture: cynefin/gram-adjacent-items]
[fixture: cynefin/common-colon-block-priority]

```text
diagram = newline* header newline*
          (domain-block | transition | common-statement | newline)* end-of-text
header = header-colon | header-bare
domain-block = domain-name newline* (domain-item newline*)*
domain-item = string
transition = domain-name transition-arrow domain-name (label-colon string)? eol
common-statement = (title-line | acc-title-line | acc-descr-line | acc-descr-block) eol
eol = newline+ | end-of-text
```

| 規則または形                        | node                                   |
| ----------------------------------- | -------------------------------------- |
| diagram                             | CynefinDiagram                         |
| domain-block                        | CynefinDomainStatement                 |
| domain-item                         | StringLiteral を持つ CynefinDomainItem |
| transition                          | CynefinTransitionStatement             |
| transition-arrow                    | CynefinArrow                           |
| title-line                          | CynefinTitleStatement                  |
| acc-title-line                      | CynefinAccTitleStatement               |
| acc-descr-line                      | CynefinAccDescrStatement               |
| acc-descr-block                     | CynefinAccDescrBlockStatement          |
| 空でない共通の値                    | CynefinLiteral                         |
| native-yaml または native-directive | CynefinIgnoredText                     |

本文と各領域の項目のリストは空でもよい。
領域には波括弧も colon も要らず、項目は引用符つきの文字列だけである。
名前と項目の間、項目の間、次の領域の前に EOL は要らない。
同じ項目や領域の宣言の繰り返しも受理する。
現在の領域のブロックが無い文字列は拒否する。 [fixture: cynefin/header-only]
[fixture: cynefin/gram-domain-empty-eof] [fixture: cynefin/gram-adjacent-items]
[fixture: cynefin/gram-inline-items] [fixture: cynefin/gram-glued-domains]
[fixture: cynefin/gram-item-duplicates] [fixture: cynefin/db-domain-duplicates]
[fixture: cynefin/gram-orphan-item] [fixture: cynefin/gram-domain-colon]
[fixture: cynefin/gram-domain-braces]

領域の項目の並びでは、directive だけの行、選ばれた semicolon、コメント行、
空行は並びを閉じない。
項目の間の U+2028 と U+2029 は拒否する。
空の説明ブロックは別の共通の文なので、その後の領域に属さない文字列は拒否するが、
領域を再宣言すれば次の項目を置ける。
遷移も直前の領域の並びを終える。 [fixture: cynefin/gram-items-directive-line]
[fixture: cynefin/gram-items-selected-semicolon]
[fixture: cynefin/gram-items-comment-line]
[fixture: cynefin/gram-items-blank-line] [fixture: cynefin/gram-items-ls]
[fixture: cynefin/gram-items-ps] [fixture: cynefin/gram-items-empty-description]
[fixture: cynefin/gram-items-empty-description-redeclare]
[fixture: cynefin/gram-domain-after-transition-orphan]

遷移には二つの固定の領域の語と --> が必要で、任意で colon と文字列の組が続き、
その後に EOL が要る。
行先の欠落、引用符の無いラベル、文字列の無い colon、
colon の無い文字列は許さない。
可視の newline で部品を割れないが、 native
hidden な形は可視の newline を加えずに名前つきの gap に置ける。
複数の遷移にはそれぞれの EOL が要る。 [fixture: cynefin/gram-transition-first]
[fixture: cynefin/gram-missing-target] [fixture: cynefin/gram-label-unquoted]
[fixture: cynefin/gram-label-missing-string]
[fixture: cynefin/gram-label-without-colon]
[fixture: cynefin/gram-domain-before-arrow-newline]
[fixture: cynefin/gram-target-before-colon-newline]
[fixture: cynefin/hidden-all-unit-gaps]
[fixture: cynefin/db-transition-duplicates]
[fixture: cynefin/gram-transition-eol]

共通の各文には EOL が必要で、空の title や accessibility の行、
空の説明ブロックも同じである。
同じ行の別の文が行の値に吸収される場合があり、
完了したブロックの後で EOL 無しに領域を続けると拒否する。
空を含め、
共通の文の繰り返しは別の文のまま残る。 [fixture: cynefin/common-repeat-empty]
[fixture: cynefin/common-empty-interleaved] [fixture: cynefin/common-title-eof]
[fixture: cynefin/gram-title-inline-domain]
[fixture: cynefin/common-empty-block-same-line]
[fixture: cynefin/hidden-after-block] [fixture: cynefin/hidden-title-suffix]
[fixture: cynefin/hidden-acctitle-suffix]
[fixture: cynefin/hidden-description-suffix]
[fixture: cynefin/hidden-block-suffix]

### 意味上の受理条件

公開の [parse wrapper][parse] は、回復で model が作られてもすべての lexer
error と parser error を拒否し、完全な消費を要求する。
[service module][module]、[adapter][adapter]、
[Db][db] に追加の意味の拒否は無い。
五つの領域の語は宣言が無くても参照でき、領域や遷移の繰り返し、自己遷移、
空の領域や文字列は受理する。 [fixture: cynefin/error-start]
[fixture: cynefin/error-after-prefix] [fixture: cynefin/error-recovered]
[fixture: cynefin/gram-transition-first] [fixture: cynefin/db-domain-duplicates]
[fixture: cynefin/db-transition-duplicates] [fixture: cynefin/db-self-loops]
[fixture: cynefin/gram-domain-empty-eof] [fixture: cynefin/db-empty-texts]

空の遷移ラベルは、Mermaid が STRING を読んで文法で label に代入し、
その後で Db が偽の値を除くだけで、
class の空の多重度と同じく書かれた構文として残るため、
tokenless-empty-forms ではない。 [fixture: cynefin/db-empty-texts]
[fixture: cynefin/db-self-loop-empty-label]
[fixture: class/gram-cardinality-empty]

### 全出現の保持と設定

書かれた領域のブロック、項目、遷移、共通の文をすべてソース順で保つ。
自己遷移、置き換えられる前のブロック、空の領域、重複する項目や遷移、空のラベル、
空の共通の形はすべて node を持つ。
native の無視される形も node を持つ。
書かれた木に実効の宣言の合成、除去、
置き換えを行わない。 [fixture: cynefin/db-self-loops]
[fixture: cynefin/db-domain-duplicates] [fixture: cynefin/db-domain-empty-first]
[fixture: cynefin/db-domain-empty-last] [fixture: cynefin/gram-domain-empty-eof]
[fixture: cynefin/gram-item-duplicates]
[fixture: cynefin/db-transition-duplicates] [fixture: cynefin/db-empty-texts]
[fixture: cynefin/common-repeat-empty]
[fixture: cynefin/hidden-domain-item-members]

cynefin 固有の受理の設定の鍵は無い。
adapter と Db に設定可能な意味の gate は無く、
[Db の設定][db-config]と [renderer][renderer] は描画のためのものである。
site、frontmatter、init directive の描画の設定は不正な文法を救わず、
site の小さい描画の上限も parse の拒否を加えない。
共通の設定によって、
共通の文字の変換が変わったり埋め込みデータの処理が失敗したりする場合は、
共有の規則に従い、書かれた値は変えない。 [fixture: cynefin/config-drawing-site]
[fixture: cynefin/config-frontmatter-drawing]
[fixture: cynefin/config-init-drawing]
[fixture: cynefin/config-frontmatter-cannot-rescue]
[fixture: cynefin/config-init-cannot-rescue]
[fixture: cynefin/config-site-small-limits]
[fixture: cynefin/config-security-level-other]
[fixture: cynefin/config-frontmatter-fontfamily-number]
[fixture: cynefin/config-init-fontfamily-number]

### Db の正規化

変換された値、省略、選択、置き換え、順序は、
[tests の要約](../../../tests/docs/db-summaries.ja.md#cynefin) と、
[Db-from-tree の契約](../../../tests/docs/db-from-tree.ja.md) に定義する。
それらによって書かれた構文を木から除かない。 [fixture: cynefin/db-all-fields]
[fixture: cynefin/db-domain-duplicates] [fixture: cynefin/db-self-loops]
[fixture: cynefin/db-empty-texts] [fixture: cynefin/common-empty-interleaved]

## 既知の差異

**[directive-as-token-boundary](../known-divergences/directive-as-token-boundary.ja.md)。**
共有の directive のレコードにソースを持てても、固定の見出し、領域、
共通の語や分割しない矢印には内部の作者の gap が無い。
その atom 内の共通 directive を拒否する。
完全な部品の境目と文字の内部は許す。
native hidden な形はすでに node を持ち、
差異を要しない。 [fixture: cynefin/directive-header-inside]
[fixture: cynefin/directive-domain-inside]
[fixture: cynefin/directive-arrow-inside]
[fixture: cynefin/directive-common-keyword]
[fixture: cynefin/directive-title-inside]
[fixture: cynefin/directive-block-inside]
[fixture: cynefin/directive-clear-inside]
[fixture: cynefin/directive-transition-parts]
[fixture: cynefin/directive-description-brace]
[fixture: cynefin/directive-native-yaml-components]
[fixture: cynefin/directive-native-directive-components]
[fixture: cynefin/directive-every-field]

**[ignored-semicolon-as-token-boundary](../known-divergences/ignored-semicolon-as-token-boundary.ja.md)。**
実際に選ばれた semicolon だけに同じ atom の境目の規則を適用する。
共有の trivia に句読を持てても、固定語や --> の内部に gap は作れない。
部品の境目、文字列の文字、native fence の句読は許す。
任意の semicolon が区切りになるわけではない。 [fixture: cynefin/semicolon-complex-inside]
[fixture: cynefin/semicolon-clear-inside]
[fixture: cynefin/semicolon-arrow-inside]
[fixture: cynefin/semicolon-title-inside]
[fixture: cynefin/semicolon-acctitle-inside]
[fixture: cynefin/semicolon-block-inside]
[fixture: cynefin/semicolon-colon-header-selected-parts]
[fixture: cynefin/semicolon-arrow-parts]
[fixture: cynefin/selected-colon-label-components]
[fixture: cynefin/selected-native-yaml-opener]
[fixture: cynefin/selected-native-directive-opener]
[fixture: cynefin/selected-string-interior]
[fixture: cynefin/selected-title-components]
[fixture: cynefin/selected-native-directive-closer]

**[html-tag-in-frontmatter](../known-divergences/html-tag-in-frontmatter.ja.md)。**
frontmatter と本文の node を保ったうえで、
本文の HTML 属性の走査は本来の frontmatter の後から始める。
不透明な YAML の未完の tag は後の文字列の引用符を支配しない。
Mermaid が受理してこの規則が拒否する場合、逆の場合、
両方受理して値だけが異なる場合があり、
本文だけの引用符の対照には共通の HTML の規則を適用する。 [fixture: cynefin/div-html-frontmatter-accept]
[fixture: cynefin/div-html-frontmatter-reject]
[fixture: cynefin/div-html-frontmatter-value]
[fixture: cynefin/html-body-double-control]
[fixture: cynefin/html-body-single-control]

**[embedded-data-opaque](../known-divergences/embedded-data-opaque.ja.md)。**
共有のレコードに認識した frontmatter と共通 directive の全体を持てるため、
YAML や設定が読めないことを理由に構文を拒否しない。
不正なデータで有効な title や設定を消さず、共有の比較の設定の規則を適用する。
retained な native
YAML は代わりに CynefinIgnoredText である。 [fixture: cynefin/div-frontmatter-invalid]
[fixture: cynefin/div-init-invalid-colour]
[fixture: cynefin/div-init-primitive-wrap]
[fixture: cynefin/config-frontmatter-fontfamily-number]
[fixture: cynefin/config-init-fontfamily-number]
[fixture: cynefin/config-fontfamily-keeps-title]
[fixture: cynefin/div-invalid-keeps-config]
[fixture: cynefin/detect-retained-yaml-properties]

**[bare-percent-line-before-header](../known-divergences/bare-percent-line-before-header.ja.md)。**
検出が通過した裸の行と空白を共有の Comment と trivia に持つ。
通過した Unicode の trivia を native lexer で読み直さず、
通過した接頭の直接の規則を使う。
native の retained な形には依然としてそれ自体の境目が必要である。 [fixture: cynefin/bare-before-ls]
[fixture: cynefin/bare-line-ps]
[fixture: cynefin/detect-retained-secondscan-bare-ascii]
[fixture: cynefin/detect-retained-secondscan-bare-ls]
[fixture: cynefin/detect-retained-secondscan-bare-ps]
[fixture: cynefin/retained-directive-between-bares]
[fixture: cynefin/prefix-yaml-unicode-no-bare]

**[c4-keyword-anywhere](../known-divergences/c4-keyword-anywhere.ja.md)。**
後の値に C4 の検出の語があっても見出しから cynefin を選ぶ。
値は Cynefin の node を持つが、
同じ木に置き換わった C4 の図種も持つことはできない。
検出用に除去する通常の LF つきコメントは差異の無い対照である。 [fixture: cynefin/c4-component-item]
[fixture: cynefin/c4-container-title] [fixture: cynefin/c4-component-header-eof]
[fixture: cynefin/c4-component-header-lf]

[grammar]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/cynefin/cynefin.langium#L1-L30
[common]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/common/common.langium#L6-L34
[cynefin-token]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/cynefin/tokenBuilder.ts#L1-L7
[common-token]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/common/tokenBuilder.ts#L14-L27
[converter]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/common/valueConverter.ts#L27-L79
[parse]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/parse.ts#L133-L149
[module]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/cynefin/module.ts#L30-L54
[adapter]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/cynefin/cynefinParser.ts#L8-L19
[db]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/cynefin/cynefinDb.ts#L34-L69
[db-config]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/cynefin/cynefinDb.ts#L71-L76
[renderer]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/cynefin/cynefinRenderer.ts#L71-L115
[detector]: https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/cynefin/cynefinDetector.ts#L7-L11
