# Cynefin の node

英語版: [cynefin.md](./cynefin.md)

Cynefin の書かれた木を定義する。
共有の node と不変条件は [ast.md](../ast.ja.md)、
受理は[構文](../diagrams/cynefin.ja.md)に定義する。
任意の欄も null として残し、存在しないリストは空とし、各リストはソース順を保つ。
各表は一つの node を独立に定義し、子の欄は訪問順を示す。
[fixture: cynefin/db-all-fields] [fixture: cynefin/db-empty-texts]
[fixture: cynefin/common-repeat-empty]

領域の語は決まった集合なので name、from、
to は Identifier node でなく文字列の欄である。
項目と遷移のラベルの位置は引用符つきの文字列だけを許し、
共有の StringLiteral を使う。
raw は引用符と共通の trivia を含む正確な全ソース、
value は共通の除去を除いた未変換の内側を保ち、closed は true である。
領域名の node、数値の葉、合成した実効の宣言は加えない。
[fixture: cynefin/db-all-fields] [fixture: cynefin/lex-string-conversion]
[fixture: cynefin/lex-transition-string-conversion]
[fixture: cynefin/directive-every-field] [fixture: cynefin/db-empty-texts]

以下の textBefore と textAfter の各欄は全体の CynefinIgnoredText node
のリストで、空白、共有の Comment、共通の Directive は含まない。
各 hidden の一致には正確に一つの所有者がある。
消費した後続の改行は、その ignored node 自身の範囲の外に置く。
囲む範囲は内部のソースの空白と改行をまたげるが、
無関係の外側の空白と可視の EOL は範囲を広げない。
[fixture: cynefin/hidden-all-unit-gaps]
[fixture: cynefin/hidden-domain-item-members]
[fixture: cynefin/hidden-directive-cr] [fixture: cynefin/hidden-directive-crlf]
[fixture: cynefin/hidden-yaml-bare-cr]

## node

### CynefinDiagram

| 欄                 | 型                          | 意味                                     |
| ------------------ | --------------------------- | ---------------------------------------- |
| `textBeforeHeader` | CynefinIgnoredText のリスト | 見出し前の retained な native の形。     |
| `body`             | CynefinBodyItem のリスト    | すべての文と本文が所有する hidden な形。 |

子の欄: `textBeforeHeader`、`body`。
範囲は最初の retained な見出し前の形、無ければ見出しから、
最後に書かれた見出しか本文の形まで。
Root.diagramType は cynefin で、
どちらの見出しの綴りにも別の見出しや別名の node は作らない。
両リストは空でもよい。 [fixture: cynefin/header-only]
[fixture: cynefin/header-colon]
[fixture: cynefin/detect-real-before-retained-secondscan]
[fixture: cynefin/db-all-fields]

CynefinBodyItem は CynefinDomainStatement、CynefinTransitionStatement、
CynefinTitleStatement、 CynefinAccTitleStatement、CynefinAccDescrStatement、
CynefinAccDescrBlockStatement、CynefinIgnoredText のいずれかである。
自己遷移、置き換えられるブロックや空のブロック、空の共通の文を含む全出現を保つ。
空行とコメントだけの行は本文の項目を加えない。 [fixture: cynefin/db-self-loops]
[fixture: cynefin/db-domain-duplicates] [fixture: cynefin/gram-domain-empty-eof]
[fixture: cynefin/common-repeat-empty]
[fixture: cynefin/hidden-header-after-visible-eol]
[fixture: cynefin/space-lines] [fixture: cynefin/comment-native-between-items]

textBeforeHeader は retained YAML と本物の二度目の走査の directive を native
の境目で所有する。
検出が通過した裸の行は共有の Comment、一緒に通過した空白と改行は trivia で、
retained な形の間も同じである。
見出しの後、文の前、文の可視の EOL の後の形は、
以下の項目の前の所有の場合を除いて body に属する。
[fixture: cynefin/detect-real-before-retained-secondscan]
[fixture: cynefin/detect-retained-secondscan-bare-ascii]
[fixture: cynefin/prefix-two-secondscans]
[fixture: cynefin/hidden-header-after-visible-eol]
[fixture: cynefin/hidden-domain-end-after-visible-eol]
[fixture: cynefin/hidden-after-visible-eol]
[fixture: cynefin/hidden-common-after-visible-eol]

### CynefinDomainStatement

| 欄              | 型                          | 意味                                                     |
| --------------- | --------------------------- | -------------------------------------------------------- |
| `name`          | 文字列                      | complex、complicated、clear、chaotic、confusion の一つ。 |
| `textAfterName` | CynefinIgnoredText のリスト | 名前の直後の native の形。                               |
| `items`         | CynefinDomainItem のリスト  | このブロックの書かれた全項目。                           |

子の欄: `textAfterName`、`items`。
name は子でない。
範囲は領域の語から最後の項目まで、items が空なら最後の textAfterName の形まで、
両リストが空なら領域の語だけである。
項目は同じ行でも可視の改行の後でも始められる。
空のブロックも文であり、繰り返す各宣言は重複も含め自身のリストを保つ。
[fixture: cynefin/db-all-fields] [fixture: cynefin/gram-adjacent-items]
[fixture: cynefin/gram-domain-empty-eof]
[fixture: cynefin/hidden-domain-empty-suffix]
[fixture: cynefin/gram-item-duplicates] [fixture: cynefin/db-domain-duplicates]

textAfterName は最初の可視の LF、次の項目、次の文、
テキスト末尾のうち最初の所で終わる。
その LF を探す前に hidden の消費を決める。
このブロックの最初の実際の項目の前に可視の LF があれば、
その後の native の形は項目の textBefore に属し、
その項目が無ければ Diagram.body に属する。
[fixture: cynefin/hidden-domain-item-members]
[fixture: cynefin/hidden-domain-empty-suffix]
[fixture: cynefin/hidden-before-first-item-after-eol]
[fixture: cynefin/hidden-empty-domain-after-visible-eol]
[fixture: cynefin/hidden-after-domain]

### CynefinDomainItem

| 欄           | 型                          | 意味                                     |
| ------------ | --------------------------- | ---------------------------------------- |
| `textBefore` | CynefinIgnoredText のリスト | 可視の LF の後の項目の前の形。           |
| `label`      | StringLiteral               | 必須の書かれた引用符つきのラベル。       |
| `textAfter`  | CynefinIgnoredText のリスト | ラベルから可視の LF か次の単位までの形。 |

子の欄: `textBefore`、`label`、`textAfter`。
範囲は最初の textBefore の形、無ければ文字列の開きから、最後の textAfter の形、
無ければ文字列の閉じまで。
空の文字列を含め label は null にならず、
raw と共有の closed の欄は引用符つきの形を保つ。
二つのリストは空でもよい。
直結した文字列も別々の項目となる。 [fixture: cynefin/hidden-domain-item-members]
[fixture: cynefin/hidden-item-after-visible-eol]
[fixture: cynefin/hidden-before-first-item-after-eol]
[fixture: cynefin/gram-adjacent-items] [fixture: cynefin/db-empty-texts]
[fixture: cynefin/lex-string-conversion]

textAfter は次の項目か文、または最初の可視の LF までの形を所有する。
その LF の後、同じブロックの次の項目の前の形は次の項目の textBefore に属し、
次の項目が無ければ Diagram.body に属する。
コメント、空行、除去した directive、選ばれた semicolon は項目を作らず、
並びも閉じない。 [fixture: cynefin/hidden-domain-item-members]
[fixture: cynefin/hidden-item-after-visible-eol]
[fixture: cynefin/hidden-domain-end-after-visible-eol]
[fixture: cynefin/gram-items-directive-line]
[fixture: cynefin/gram-items-selected-semicolon]
[fixture: cynefin/gram-items-comment-line]
[fixture: cynefin/gram-items-blank-line]

### CynefinTransitionStatement

| 欄                | 型                          | 意味                                      |
| ----------------- | --------------------------- | ----------------------------------------- |
| `from`            | 文字列                      | 必須の固定の領域の語。                    |
| `textBeforeArrow` | CynefinIgnoredText のリスト | from と矢印の間の形。                     |
| `arrow`           | CynefinArrow                | 必須の矢印全体。                          |
| `textBeforeTo`    | CynefinIgnoredText のリスト | 矢印と to の間の形。                      |
| `to`              | 文字列                      | 必須の固定の領域の語。                    |
| `textBeforeColon` | CynefinIgnoredText のリスト | 書かれたラベルの colon の前の形。         |
| `textBeforeLabel` | CynefinIgnoredText のリスト | colon と文字列の間の形。                  |
| `label`           | StringLiteral または null   | 空も含む書かれたラベル、または欠落。      |
| `textAfter`       | CynefinIgnoredText のリスト | 最後の可視の部品から可視の EOL までの形。 |

子の欄: `textBeforeArrow`、`arrow`、`textBeforeTo`、`textBeforeColon`、
`textBeforeLabel`、`label`、`textAfter`。
from と to はそれぞれ complex、 complicated、clear、chaotic、confusion で、
子でない。
範囲は from から最後の textAfter の形まで、無ければラベルの閉じまで、
ラベルも無ければ to まで。
必須の EOL は範囲の外に置く。 [fixture: cynefin/db-all-fields]
[fixture: cynefin/hidden-all-unit-gaps]
[fixture: cynefin/hidden-unlabeled-transition-gaps]
[fixture: cynefin/hidden-two-transition-suffixes]

label が null となるのは colon と文字列の組全体が無い場合だけである。
その場合 textBeforeColon と textBeforeLabel は空で、
to の後の native な形はすべて textAfter に属する。
ラベルがあれば各名前つきの gap を保ち、: "" や : '' は non-null の空の
StringLiteral とする。
自己遷移、未宣言の両端、重複する遷移も書かれた文として保つ。
[fixture: cynefin/hidden-unlabeled-transition-gaps]
[fixture: cynefin/hidden-two-transition-suffixes]
[fixture: cynefin/hidden-all-unit-gaps] [fixture: cynefin/db-empty-texts]
[fixture: cynefin/db-self-loops] [fixture: cynefin/gram-transition-first]
[fixture: cynefin/db-transition-duplicates]

### CynefinArrow

| 欄            | 型     | 意味                   |
| ------------- | ------ | ---------------------- |
| `value`       | 文字列 | 書かれた印全体の -->。 |
| `startMarker` | 文字列 | none。                 |
| `line`        | 文字列 | solid。                |
| `endMarker`   | 文字列 | arrow。                |

子の欄はありません。
範囲は最初の dash から > まで。
四つの欄は常にこの固定の値で存在し、kind の欄や null の marker は加えない。
矢印全体の前後の hidden な形は矢印でなく遷移に属する。
[fixture: cynefin/db-all-fields] [fixture: cynefin/hidden-all-unit-gaps]
[fixture: cynefin/hidden-unlabeled-transition-gaps]

### CynefinTitleStatement

| 欄          | 型                          | 意味                                  |
| ----------- | --------------------------- | ------------------------------------- |
| `value`     | CynefinLiteral または null  | 書かれた title の値、または空。       |
| `textAfter` | CynefinIgnoredText のリスト | 可視の EOL の前の native の接尾の形。 |

子の欄: `value`、`textAfter`。
範囲は title から値の最後の文字、null なら keyword までで、
textAfter があればそこまで延ばす。
value が null で textAfter が空なら、
区切り一つの space/tab は範囲の外の普通の空白である。
必須の EOL は範囲の外に置く。
textAfter は空でもよく、可視の EOL の後の形は Diagram.body に属する。
繰り返す全出現を文として残す。 [fixture: cynefin/hidden-title-suffix]
[fixture: cynefin/hidden-common-after-visible-eol]
[fixture: cynefin/common-title-comment-only]
[fixture: cynefin/common-title-directive-only]
[fixture: cynefin/lex-title-one-space] [fixture: cynefin/lex-title-one-tab]
[fixture: cynefin/lex-title-two-spaces]
[fixture: cynefin/common-line-whitespace]

title の後に ASCII space か tab があれば、正確に一つを値の外の区切りとする。
裸の keyword や区切り一つだけを含め、残りが無ければ null とする。
それ以外の書かれた空白は non-null の literal に属する。
[fixture: cynefin/lex-title-one-space] [fixture: cynefin/lex-title-one-tab]
[fixture: cynefin/lex-title-two-spaces] [fixture: cynefin/common-title-eof]
[fixture: cynefin/common-line-whitespace]

### CynefinAccTitleStatement

| 欄          | 型                          | 意味                                  |
| ----------- | --------------------------- | ------------------------------------- |
| `value`     | CynefinLiteral または null  | 書かれた accTitle: の値、または空。   |
| `textAfter` | CynefinIgnoredText のリスト | 可視の EOL の前の native の接尾の形。 |

子の欄: `value`、`textAfter`。
範囲は accTitle の keyword から値の最後の文字まで、
value が null なら必須の colon までで、
textAfter があればその最後の形まで延ばす。
必須の EOL は範囲の外に置く。
textAfter は空でもよく、可視の EOL の後の形は Diagram.body に属する。
繰り返す全出現を文として残す。 [fixture: cynefin/hidden-acctitle-suffix]
[fixture: cynefin/common-repeat-empty] [fixture: cynefin/common-line-whitespace]

value は colon の直後から始まり、その後の書かれた空白をすべて含む。
残る文字が無い場合だけ null となり、
空白だけの残りは non-null の literal となる。
引用符は値の通常の文字である。 [fixture: cynefin/lex-common-whitespace-literals]
[fixture: cynefin/common-repeat-empty] [fixture: cynefin/common-line-whitespace]
[fixture: cynefin/common-quoted-values]

### CynefinAccDescrStatement

| 欄          | 型                          | 意味                                  |
| ----------- | --------------------------- | ------------------------------------- |
| `value`     | CynefinLiteral または null  | 書かれた accDescr: の値、または空。   |
| `textAfter` | CynefinIgnoredText のリスト | 可視の EOL の前の native の接尾の形。 |

子の欄: `value`、`textAfter`。
範囲は accDescr の keyword から値の最後の文字まで、
value が null なら必須の colon までで、
textAfter があればその最後の形まで延ばす。
必須の EOL は範囲の外に置く。
textAfter は空でもよく、可視の EOL の後の形は Diagram.body に属する。
繰り返す全出現を文として残す。 [fixture: cynefin/hidden-description-suffix]
[fixture: cynefin/common-repeat-empty] [fixture: cynefin/common-line-whitespace]

value は colon の直後から始まり、その後の書かれた空白をすべて含む。
残る文字が無ければ null、空白だけなら non-null の literal とする。
colon の後の波括弧はブロックでなく行の値の文字である。
[fixture: cynefin/lex-common-whitespace-literals]
[fixture: cynefin/common-repeat-empty] [fixture: cynefin/common-line-whitespace]
[fixture: cynefin/common-colon-block-priority]

### CynefinAccDescrBlockStatement

| 欄          | 型                          | 意味                                   |
| ----------- | --------------------------- | -------------------------------------- |
| `value`     | CynefinLiteral または null  | 書かれた accDescr {…} の値、または空。 |
| `textAfter` | CynefinIgnoredText のリスト | 可視の EOL の前の native の接尾の形。  |

子の欄: `value`、`textAfter`。
範囲は accDescr の keyword から閉じの波括弧までで、
textAfter があればその最後の形まで延ばす。
必須の EOL は範囲の外に置く。
textAfter は空でもよく、可視の EOL の後の形は Diagram.body に属する。
繰り返す全出現を文として残す。 [fixture: cynefin/hidden-block-suffix]
[fixture: cynefin/common-empty-interleaved]
[fixture: cynefin/common-block-whitespace]

value は波括弧の内側の書かれた文字から、外端だけの共通空白を除いたものとする。
空、空白だけ、共通の除去だけの本文は null となる。
内部の字下げと改行は変えない。
閉じの波括弧は必須なので closed の欄は加えない。
[fixture: cynefin/common-empty-interleaved]
[fixture: cynefin/lex-common-whitespace-literals]
[fixture: cynefin/common-block-whitespace]
[fixture: cynefin/common-block-comment-only]
[fixture: cynefin/common-block-directive-only]
[fixture: cynefin/line-block-values]

### CynefinLiteral

| 欄      | 型     | 意味                                         |
| ------- | ------ | -------------------------------------------- |
| `value` | 文字列 | 共通の除去を除いた未変換の書かれた共通の値。 |

子の欄はありません。
範囲は保つ書かれた共通の値ちょうどで、
title の区切りか accessibility の colon の後の行の空白も含む。
ブロックでは共通空白でない最初から最後の文字までである。
内部の空白、字下げ、ソースの改行、引用符、backslash、entity の綴りを保つ。
共通の除去はソースの範囲には含むが value に含まない。
literal は空にならず、その場合は親の value を null とする。
空白だけの行の literal は空でない。 [fixture: cynefin/lex-title-two-spaces]
[fixture: cynefin/lex-common-whitespace-literals]
[fixture: cynefin/common-line-whitespace]
[fixture: cynefin/common-block-whitespace]
[fixture: cynefin/common-quoted-values] [fixture: cynefin/line-common-values]
[fixture: cynefin/line-block-values] [fixture: cynefin/directive-every-field]
[fixture: cynefin/entity-texts]

### CynefinIgnoredText

| 欄      | 型     | 意味                                           |
| ------- | ------ | ---------------------------------------------- |
| `kind`  | 文字列 | yaml-block または directive。                  |
| `value` | 文字列 | 共通の除去を除く、書かれた native の一致全体。 |

子の欄はありません。
範囲は開きの三つの dash か %%{ から境目の合う閉じの fence までで、
開きの前の空白と、直後に消費した CR と LF の並びを除く。
value は同じ書かれた区切りと内部のソースの改行を保ち、共通の除去を除く。
両方の形に閉じが必須なので closed の欄や null の value は無い。
複数に見える fence が一つの native の一致と node になる場合があり、
空でない二つの YAML ブロックは別の node にもなる。
[fixture: cynefin/hidden-directive-adjacent]
[fixture: cynefin/hidden-yaml-adjacent-later]
[fixture: cynefin/hidden-yaml-two-nonempty]
[fixture: cynefin/hidden-yaml-opener-padding]
[fixture: cynefin/hidden-directive-cr] [fixture: cynefin/hidden-directive-crlf]
[fixture: cynefin/hidden-yaml-bare-cr]
[fixture: cynefin/hidden-yaml-common-directive]
[fixture: cynefin/hidden-yaml-comment-region]
[fixture: cynefin/hidden-native-directive-opener-raw]

この node を作るのは成功した native-yaml と native-directive の一致だけで、
埋め込み設定にはならない。
directive 状の一致の失敗は共有の Comment にもなり、
その後の本物の YAML ブロックは CynefinIgnoredText を作る。
共通 directive は Root.directives に属する。
[fixture: cynefin/hidden-directive-comment-fallback-kept]
[fixture: cynefin/detect-retained-yaml-properties]
[fixture: cynefin/hidden-yaml-common-directive]
[fixture: cynefin/hidden-native-directive-opener-raw]

## hidden な形の所有

可視の LF を探す前に native の消費を決める。
次の所有の規則は一致全体にソース順で適用し、空白やコメントの node は加えない。
囲む文はその member をまたぐ。
消費した改行を囲む文がまたいでも、 ignored node 自身の範囲の外に置く。
[fixture: cynefin/hidden-domain-item-members]
[fixture: cynefin/hidden-item-after-visible-eol]
[fixture: cynefin/hidden-domain-end-after-visible-eol]
[fixture: cynefin/hidden-directive-cr]
[fixture: cynefin/hidden-before-first-item-after-eol]
[fixture: cynefin/hidden-empty-domain-after-visible-eol]
[fixture: cynefin/hidden-all-unit-gaps]

| native の形全体の位置                                        | 所有者                              |
| ------------------------------------------------------------ | ----------------------------------- |
| 見出しの前                                                   | Diagram.textBeforeHeader            |
| 見出しの後、または文の前                                     | Diagram.body                        |
| 領域名から最初の可視の LF か次の可視の単位まで               | DomainStatement.textAfterName       |
| その可視の LF の後、同じブロックの実際の最初の項目の前       | 最初の DomainItem.textBefore        |
| 項目から最初の可視の LF か次の項目か文まで                   | その DomainItem.textAfter           |
| その LF の後、同じブロックの次の項目の前                     | 次の DomainItem.textBefore          |
| 最後の項目の可視の LF の後、または項目の無い空領域の LF の後 | Diagram.body                        |
| 遷移の内側                                                   | その名前つきの gap または textAfter |
| 共通の値かブロックから最初の可視の LF まで                   | 共通の文の textAfter                |
| 遷移か共通の文の可視の EOL の後                              | Diagram.body                        |

したがって最後の項目と同じ行の形は新しい領域の前でもその項目に残る。
可視の LF の後では、同じブロックの次の項目が実際にある場合だけその項目へ移る。
空の領域は直後の接尾を保つが、後の本文の形は所有しない。
ラベルの無い遷移の行先の後の接尾は textAfter で、仮想のラベルの gap でない。
共通の行の接尾は EOL の前で所有し、可視の EOL の後なら本文の項目である。
[fixture: cynefin/hidden-domain-item-members]
[fixture: cynefin/hidden-domain-empty-suffix]
[fixture: cynefin/hidden-item-after-visible-eol]
[fixture: cynefin/hidden-domain-end-after-visible-eol]
[fixture: cynefin/hidden-unlabeled-transition-gaps]
[fixture: cynefin/hidden-two-transition-suffixes]
[fixture: cynefin/hidden-before-first-item-after-eol]
[fixture: cynefin/hidden-empty-domain-after-visible-eol]
[fixture: cynefin/hidden-title-suffix] [fixture: cynefin/hidden-acctitle-suffix]
[fixture: cynefin/hidden-description-suffix]
[fixture: cynefin/hidden-block-suffix]
[fixture: cynefin/hidden-common-after-visible-eol]
[fixture: cynefin/hidden-after-visible-eol]

## 例

この項目の直結した入力は、
一つの CynefinDomainStatement に二つの CynefinDomainItem の子を持つ。
各項目は自身の StringLiteral を所有し、両方の gap のリストは空である。
追加の区切りや実効の項目は合成しない。 [fixture: cynefin/gram-adjacent-items]

```mmd
cynefin-beta
complex"A"'B'
```
