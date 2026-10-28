# Architecture のノード

英語版: [architecture.md](./architecture.md)

この文書は `architecture-beta` の木を定義する。
共有の木は [ast.md](../ast.md)、
構文と受理は [diagrams/architecture.md](../diagrams/architecture.md) で定める。
欄は Db の変換を当てず原文を保つ。
省略欄も null として存在し、リストは空でもよく、各リストはソース順を保つ。
子の欄は訪問順を示す。 [fixture: architecture/db-mixed]
[fixture: architecture/db-empty-values]
[fixture: architecture/common-repeat-empty]
[fixture: architecture/lex-title-unquoted-fallback]
[fixture: architecture/lex-string-conversion]

## ノード

### ArchitectureDiagram

| 欄                 | 型                              | 意味                       |
| ------------------ | ------------------------------- | -------------------------- |
| `textBeforeHeader` | list of ArchitectureIgnoredText | 見出し前に残る形。         |
| `body`             | list of ArchitectureBodyItem    | 書かれた文と hidden な形。 |

子の欄: `textBeforeHeader`、`body`。
範囲は最初の見出し前の残存形、なければ見出しから、
最後の見出し/body の形までとし、外の padding と改行を除く。
Root.diagramType は architecture。
固定の見出しは keyword とし、独立した header
node や別名の欄は作らない。 [fixture: architecture/header-beta]
[fixture: architecture/detect-retained-before-second-scan]
[fixture: architecture/detect-two-second-scan-forms]
[fixture: architecture/db-mixed]

ArchitectureBodyItem は ArchitectureGroupStatement、
ArchitectureServiceStatement、ArchitectureJunctionStatement、
ArchitectureEdgeStatement、ArchitectureAlignmentStatement、
ArchitectureTitleStatement、ArchitectureAccTitleStatement、
ArchitectureAccDescrStatement、ArchitectureAccDescrBlockStatement、
ArchitectureIgnoredText のいずれか。
全出現を公開順でなくソース順に保つ。
所属は in の参照とし、
親の body へ宣言を移したり子のリストを合成したりしない。 [fixture: architecture/db-mixed]
[fixture: architecture/db-junction-order]
[fixture: architecture/db-align-forward-repeat]
[fixture: architecture/common-repeat-empty]
[fixture: architecture/db-service-forward-parent]

textBeforeHeader は検出で残る native
YAML と 2 回目の scan の DIRECTIVE を所有する。
通した裸の percent 行は共有 Comment とし、
付随して通した空白・改行も読み直さず ignored-node の範囲に加えない。
native の閉じの境界は維持する。
空行・comment だけの行は body 要素を作らない。
見出しの後、文の前、可視 EOL の後の hidden
form は body 要素である。 [fixture: architecture/detect-retained-before-second-scan]
[fixture: architecture/detect-empty-braces-bare]
[fixture: architecture/div-retained-bare-second-scan-ls]
[fixture: architecture/detect-second-scan-glued]
[fixture: architecture/space-lines]
[fixture: architecture/hidden-directive-body]
[fixture: architecture/lex-hidden-after-visible-eol]

### ArchitectureGroupStatement

| 欄                 | 型                              | 意味                    |
| ------------------ | ------------------------------- | ----------------------- |
| `textBeforeId`     | list of ArchitectureIgnoredText | id の前の形。           |
| `id`               | Identifier                      | 書いた group id。       |
| `textBeforeIcon`   | list of ArchitectureIgnoredText | 開始 parenthesis の前。 |
| `icon`             | Identifier or null              | 括弧内部の名前。        |
| `textBeforeTitle`  | list of ArchitectureIgnoredText | 開始 bracket の前。     |
| `title`            | ArchitectureLabel or null       | 書いた角括弧 title。    |
| `textBeforeIn`     | list of ArchitectureIgnoredText | in の前。               |
| `textBeforeParent` | list of ArchitectureIgnoredText | in の後、親の前。       |
| `in`               | Identifier or null              | 明示した親の参照。      |
| `textAfter`        | list of ArchitectureIgnoredText | 可視 EOL 前の接尾辞。   |

子の欄: `textBeforeId`、`id`、`textBeforeIcon`、`icon`、`textBeforeTitle`、
`title`、`textBeforeIn`、`textBeforeParent`、`in`、`textAfter`。
範囲は group から、親 id があればその末尾、なければ title の終了 bracket、
icon の終了 parenthesis、宣言 id のうち最後の形まで。
textAfter があればその末尾まで広げ、外の padding と EOL を除く。
icon は括弧の形がない場合だけ null。
Identifier の範囲は両括弧を除き、name は括弧内部の原綴を保つ。
宣言 id でなく icon-name の文字規則を適用する。
title は bracket がなければ null。
in は in 節全体がなければ null とし、
暗黙の親や hasIn 欄は作らない。 [fixture: architecture/db-mixed]
[fixture: architecture/lex-icon-leading-symbols]
[fixture: architecture/db-empty-values]
[fixture: architecture/header-inline-group]
[fixture: architecture/hidden-yaml-group-gap]
[fixture: architecture/hidden-yaml-group-eof]
[fixture: architecture/hidden-directive-unit-gaps]

### ArchitectureServiceStatement

| 欄                 | 型                                  | 意味                    |
| ------------------ | ----------------------------------- | ----------------------- |
| `textBeforeId`     | list of ArchitectureIgnoredText     | id の前。               |
| `id`               | Identifier                          | 書いた service id。     |
| `textBeforeIcon`   | list of ArchitectureIgnoredText     | icon の開始の前。       |
| `icon`             | Identifier or StringLiteral or null | 名前または文字の icon。 |
| `textBeforeTitle`  | list of ArchitectureIgnoredText     | 開始 bracket の前。     |
| `title`            | ArchitectureLabel or null           | 書いた title。          |
| `textBeforeIn`     | list of ArchitectureIgnoredText     | in の前。               |
| `textBeforeParent` | list of ArchitectureIgnoredText     | in の後、親の前。       |
| `in`               | Identifier or null                  | 明示した group 参照。   |
| `textAfter`        | list of ArchitectureIgnoredText     | 可視 EOL 前の接尾辞。   |

子の欄: `textBeforeId`、`id`、`textBeforeIcon`、`icon`、`textBeforeTitle`、
`title`、`textBeforeIn`、`textBeforeParent`、`in`、`textAfter`。
範囲は service から、親 id があればその末尾、なければ title の終了 bracket、
名前 icon の終了 parenthesis、文字 icon の終了 quote、
宣言 id のうち最後の形まで。
textAfter があればその末尾まで広げ、外の padding と EOL を除く。
名前 icon の icon は括弧内部の範囲の Identifier、
文字 icon は quote を含む閉じた StringLiteral、どちらもなければ null。
空の文字 icon も StringLiteral のままである。
title と in は、
それぞれ任意の形全体がない場合だけ null。 [fixture: architecture/db-mixed]
[fixture: architecture/header-inline-service]
[fixture: architecture/db-empty-values]
[fixture: architecture/lex-string-conversion]
[fixture: architecture/directive-empty-text-icon]
[fixture: architecture/hidden-directive-unit-gaps]
[fixture: architecture/hidden-yaml-parent-gap]
[fixture: architecture/hidden-directive-eof]

### ArchitectureJunctionStatement

| 欄                 | 型                              | 意味                  |
| ------------------ | ------------------------------- | --------------------- |
| `textBeforeId`     | list of ArchitectureIgnoredText | id の前。             |
| `id`               | Identifier                      | 書いた junction id。  |
| `textBeforeIn`     | list of ArchitectureIgnoredText | in の前。             |
| `textBeforeParent` | list of ArchitectureIgnoredText | in の後、親の前。     |
| `in`               | Identifier or null              | 明示した group 参照。 |
| `textAfter`        | list of ArchitectureIgnoredText | 可視 EOL 前の接尾辞。 |

子の欄: `textBeforeId`、`id`、`textBeforeIn`、`textBeforeParent`、`in`、
`textAfter`。
範囲は junction から、親 id があればその末尾、なければ宣言 id まで。
textAfter があればその末尾まで広げ、外の padding/EOL を除く。
in は in 節全体がない場合に null。
icon、title、
導出した親子の欄は持たない。 [fixture: architecture/header-inline-junction]
[fixture: architecture/db-junction-forward-parent]
[fixture: architecture/hidden-directive-unit-gaps]
[fixture: architecture/hidden-yaml-junction-gap]
[fixture: architecture/hidden-yaml-junction-eof]
[fixture: architecture/gram-junction-title]

### ArchitectureEdgeStatement

| 欄                   | 型                              | 意味                      |
| -------------------- | ------------------------------- | ------------------------- |
| `lhsId`              | Identifier                      | 書いた左端点。            |
| `textBeforeLhsGroup` | list of ArchitectureIgnoredText | 左 modifier の前。        |
| `lhsGroup`           | boolean                         | 左の {group} を書いたか。 |
| `textBeforeArrow`    | list of ArchitectureIgnoredText | 左 colon の前。           |
| `arrow`              | ArchitectureArrow               | port 間の arrow。         |
| `textBeforeRhsId`    | list of ArchitectureIgnoredText | 右 colon の後。           |
| `rhsId`              | Identifier                      | 書いた右端点。            |
| `textBeforeRhsGroup` | list of ArchitectureIgnoredText | 右 modifier の前。        |
| `rhsGroup`           | boolean                         | 右の {group} を書いたか。 |
| `textAfter`          | list of ArchitectureIgnoredText | 可視 EOL 前の接尾辞。     |

子の欄: `lhsId`、`textBeforeLhsGroup`、`textBeforeArrow`、`arrow`、
`textBeforeRhsId`、`rhsId`、`textBeforeRhsGroup`、`textAfter`。
範囲は lhsId から、右 modifier があれば終了 brace、なければ rhsId まで。
textAfter があればその末尾まで広げ、外の padding と EOL を除く。
boolean は所属なしの node でも、書いた modifier を記録する。
その modifier がない場合に限り false とする。
端点を解決済みの group 名で置き換えない。 [fixture: architecture/db-mixed]
[fixture: architecture/db-group-modifier-ungrouped]
[fixture: architecture/db-group-modifier-one-group]
[fixture: architecture/gram-hidden-modifier-gaps]
[fixture: architecture/hidden-yaml-edge-eof]
[fixture: architecture/end-edge-eof]

### ArchitectureArrow

| 欄                         | 型                              | 意味                           |
| -------------------------- | ------------------------------- | ------------------------------ |
| `value`                    | string                          | arrow 全体の原文。             |
| `textBeforeStartDirection` | list of ArchitectureIgnoredText | 左 colon の後。                |
| `startDirection`           | string                          | 書いた L、R、T、B。            |
| `textBeforeStartMarker`    | list of ArchitectureIgnoredText | 書いた開始 marker の前。       |
| `startMarker`              | string                          | 開始 marker の有無。           |
| `textBeforeLine`           | list of ArchitectureIgnoredText | 最初の線 dash の前。           |
| `line`                     | string                          | 実線。                         |
| `textBeforeTitle`          | list of ArchitectureIgnoredText | label の開始の前。             |
| `title`                    | ArchitectureLabel or null       | single dash 間の label。       |
| `textBeforeEndDash`        | list of ArchitectureIgnoredText | label つき線の最終 dash の前。 |
| `textBeforeEndMarker`      | list of ArchitectureIgnoredText | 書いた終了 marker の前。       |
| `endMarker`                | string                          | 終了 marker の有無。           |
| `textBeforeEndDirection`   | list of ArchitectureIgnoredText | 右方向の前。                   |
| `endDirection`             | string                          | 書いた L、R、T、B。            |
| `textBeforeEndColon`       | list of ArchitectureIgnoredText | 右 colon の前。                |

子の欄: `textBeforeStartDirection`、`textBeforeStartMarker`、`textBeforeLine`、
`textBeforeTitle`、`title`、`textBeforeEndDash`、`textBeforeEndMarker`、
`textBeforeEndDirection`、`textBeforeEndColon`。
範囲は左 colon から右 colon まで。
value は内部の padding、原文の改行、label の構文、native ignored
form も含めた原文とする。
共通 directive、comment region、選ばれた semicolon は value から除き、
範囲は跨ぐ。
escape の復号と marker の綴りの正規化はしない。 [fixture: architecture/db-mixed]
[fixture: architecture/hidden-directive-unit-gaps]
[fixture: architecture/hidden-yaml-edge-gaps]
[fixture: architecture/directive-fields]
[fixture: architecture/style-fields]
[fixture: architecture/gram-edge-reversed-labeled-markers]

startDirection/endDirection は書かれた固定の port 方向。
各 marker 欄はその端に < または > を書けば arrow、なければ none とする。
逆向きも含む実際の文字は value に残す。
line は常に solid。
title は double dash では null、single dash・label・single
dash では ArchitectureLabel とし、引用した空 label も null にしない。
title がなければ textBeforeEndDash は空。 [fixture: architecture/db-directions]
[fixture: architecture/gram-edge-reversed-labeled-markers]
[fixture: architecture/db-empty-values]
[fixture: architecture/db-mixed]
[fixture: architecture/end-edge-eof]

### ArchitectureAlignmentStatement

| 欄                    | 型                                  | 意味                       |
| --------------------- | ----------------------------------- | -------------------------- |
| `textBeforeDirection` | list of ArchitectureIgnoredText     | align と direction の間。  |
| `direction`           | string                              | 書いた row または column。 |
| `members`             | list of ArchitectureAlignmentMember | 記述順の member。          |
| `textAfter`           | list of ArchitectureIgnoredText     | 可視 EOL 前の接尾辞。      |

子の欄: `textBeforeDirection`、`members`、`textAfter`。
範囲は align から最後の member id までで、 textAfter があればその末尾まで広げ、
外の padding と EOL を除く。
members は 2 個以上。
反復した alignment の文もすべて保ち、member をソートせず制約を統合しない。
layout の結果を木の欄にしない。 [fixture: architecture/db-align-forward-repeat]
[fixture: architecture/db-mixed]
[fixture: architecture/hidden-yaml-align-gap]
[fixture: architecture/hidden-directive-align-eof]
[fixture: architecture/error-align-one]
[fixture: architecture/db-align-layout-conflict]

### ArchitectureAlignmentMember

| 欄             | 型                              | 意味                   |
| -------------- | ------------------------------- | ---------------------- |
| `textBeforeId` | list of ArchitectureIgnoredText | この member id の前。  |
| `id`           | Identifier                      | 書いた member の参照。 |

子の欄: `textBeforeId`、`id`。
範囲は最初の textBeforeId、なければ id から id の末尾まで。
最初の member も含め、自分の id の直前の native hidden な隙間全体を所有する。
通常の空白と共有 trivia は要素にしない。
暗黙の member や null の穴は加えない。 [fixture: architecture/hidden-yaml-align-gap]
[fixture: architecture/hidden-directive-unit-gaps]
[fixture: architecture/db-align-forward-repeat]

### ArchitectureTitleStatement

| 欄          | 型                              | 意味                          |
| ----------- | ------------------------------- | ----------------------------- |
| `value`     | ArchitectureLiteral or null     | 書かれた共通値。              |
| `textAfter` | list of ArchitectureIgnoredText | 可視 EOL 前の hidden 接尾辞。 |

value は title とちょうど 1 文字の ASCII space/tab 区切りの後で始まり、
行に残る padding をすべて保つ。
区切りなし、または内容が残らなければ null。
追加の区切りは空白の Literal とする。
範囲は title から値の末尾、null なら keyword までで、textAfter があれば広げる。
EOL と無関係な外の padding を除く。 [fixture: architecture/common-title-next-statement]
[fixture: architecture/lex-title-one-space-null]
[fixture: architecture/lex-title-one-tab-null]
[fixture: architecture/lex-title-two-spaces-literal]
[fixture: architecture/common-repeat-empty]

子の欄: `value`、`textAfter`。
反復と空の出現を別々に保つ。
最初の可視 EOL 前の形は textAfter、その EOL 後は body に所有させる。
native
comment は接尾辞の要素でなく共有 Comment とする。 [fixture: architecture/common-repeat-empty]
[fixture: architecture/hidden-directive-title-eof]
[fixture: architecture/lex-hidden-after-visible-eol]
[fixture: architecture/end-statements-comments]

### ArchitectureAccTitleStatement

| 欄          | 型                              | 意味                          |
| ----------- | ------------------------------- | ----------------------------- |
| `value`     | ArchitectureLiteral or null     | 書かれた共通値。              |
| `textAfter` | list of ArchitectureIgnoredText | 可視 EOL 前の hidden 接尾辞。 |

value は colon の直後からの行のテキストで、両端の padding を保つ。
内容が残らない場合だけ null とし、空白だけなら Literal とする。
範囲は accTitle から colon または最後の値の文字までで、 textAfter があれば広げ、
EOL と無関係な外の padding を除く。 [fixture: architecture/lex-acctitle-whitespace-only]
[fixture: architecture/common-acctitle-next-statement]
[fixture: architecture/common-repeat-empty]

子の欄: `value`、`textAfter`。
反復と空の出現を別々に保つ。
最初の可視 EOL 前の形は textAfter、その EOL 後は body に所有させる。
native
comment は接尾辞の要素でなく共有 Comment とする。 [fixture: architecture/common-repeat-empty]
[fixture: architecture/hidden-directive-acctitle-eof]
[fixture: architecture/lex-hidden-after-visible-eol]
[fixture: architecture/end-statements-comments]

### ArchitectureAccDescrStatement

| 欄          | 型                              | 意味                          |
| ----------- | ------------------------------- | ----------------------------- |
| `value`     | ArchitectureLiteral or null     | 書かれた共通値。              |
| `textAfter` | list of ArchitectureIgnoredText | 可視 EOL 前の hidden 接尾辞。 |

value は colon の直後からの行のテキストで、両端の padding を保つ。
内容が残らない場合だけ null とし、空白だけなら Literal とする。
範囲は accDescr から colon または最後の値の文字までで、 textAfter があれば広げ、
EOL と無関係な外の padding を除く。 [fixture: architecture/lex-description-line-whitespace-only]
[fixture: architecture/common-accdescr-next-statement]
[fixture: architecture/common-repeat-empty]

子の欄: `value`、`textAfter`。
反復と空の出現を別々に保つ。
最初の可視 EOL 前の形は textAfter、その EOL 後は body に所有させる。
native
comment は接尾辞の要素でなく共有 Comment とする。 [fixture: architecture/common-repeat-empty]
[fixture: architecture/hidden-directive-accdescr-eof]
[fixture: architecture/lex-hidden-after-visible-eol]
[fixture: architecture/end-statements-comments]

### ArchitectureAccDescrBlockStatement

| 欄          | 型                              | 意味                          |
| ----------- | ------------------------------- | ----------------------------- |
| `value`     | ArchitectureLiteral or null     | 書かれた共通値。              |
| `textAfter` | list of ArchitectureIgnoredText | 可視 EOL 前の hidden 接尾辞。 |

value は brace 内部から外側の共通の空白だけを除いた内容。
空白・共通 directive・comment region だけなら null とする。
内部の indentation、原文の改行、quote、escape、裸の percent 行は保つ。
範囲は accDescr から最初の終了 brace までで、textAfter があれば広げ、
EOL と無関係な外の padding を除く。
閉じは必須なので closed 欄は不要。 [fixture: architecture/common-empty-block-after-value]
[fixture: architecture/lex-description-block-whitespace-only]
[fixture: architecture/common-description-block-comment]
[fixture: architecture/common-description-block-directive]
[fixture: architecture/common-block-whitespace]
[fixture: architecture/common-block-open]

子の欄: `value`、`textAfter`。
反復と空の出現を別々に保つ。
最初の可視 EOL 前の形は textAfter、その EOL 後は body に所有させる。
native
comment は接尾辞の要素でなく共有 Comment とする。 [fixture: architecture/common-repeat-empty]
[fixture: architecture/hidden-directive-block-eof]
[fixture: architecture/lex-hidden-after-visible-eol]
[fixture: architecture/end-statements-comments]

### ArchitectureLabel

| 欄      | 型     | 意味                               |
| ------- | ------ | ---------------------------------- |
| `kind`  | string | 最初に全体が成立した字句の選択肢。 |
| `value` | string | ラベル内容の原文。                 |

子の欄はありません。
範囲は開始 bracket から終了 bracket まで。
kind は、開始 bracket の直後で始まり、終了 bracket の直前で終わる、
完全な single/double-quoted の選択肢に限り、string とし、それ以外は text。
string の value は bracket と同じ quote の 1 組を除き、
text は bracket だけを除く。
single/double の綴りも含め quote は範囲が覆う原文に残る。
converter の出力から kind を推測しない。 [fixture: architecture/lex-title-quoted-brackets]
[fixture: architecture/lex-title-padded-quotes]
[fixture: architecture/lex-title-unclosed-quote-with-close]
[fixture: architecture/lex-title-unquoted-fallback]
[fixture: architecture/lex-title-unescaped-quote-fallback]
[fixture: architecture/lex-title-cross-quote-escape]

value は内部の空白、原文の改行、entity、escape の綴りを保つ。
共通 directive、comment region、
選ばれた semicolon は written-text の trivia として除く。
それ以外の trim、空白縮約、escape 復号はしない。
引用した空は value が空の string、裸の空白はその空白を持つ text とする。
裸の空ラベルと bracket の未閉鎖の形はない。 [fixture: architecture/lex-title-conversion]
[fixture: architecture/db-empty-values]
[fixture: architecture/line-cr-title]
[fixture: architecture/line-ls-ps-values]
[fixture: architecture/directive-fields]
[fixture: architecture/comment-in-quoted-label]
[fixture: architecture/style-fields]
[fixture: architecture/lex-title-empty-unquoted]
[fixture: architecture/lex-title-unclosed]
[fixture: architecture/directive-empty-bare-label]

ラベルの選択肢は、共通の変換後の図のテキストで決める。
kind は HTML 属性 quote の変換と選ばれた semicolon を反映するが、
value は written-value の規則で原文を保つ。 [fixture: architecture/html-label-authored-quotes]
[fixture: architecture/lex-label-selected-semicolon-after-quote]

### ArchitectureLiteral

| 欄      | 型     | 意味           |
| ------- | ------ | -------------- |
| `value` | string | 共通値の原文。 |

子の欄はありません。
範囲は文が定める値の最初から最後の文字までで、内部の共通 trivia を跨ぐ。
value から共通 directive、comment region、選ばれた semicolon を除き、
原文の改行、quote、entity、escape、その文が所有する空白など、それ以外は保つ。
null に対して空の Literal は作らない。
quote に見える共通値も ArchitectureLiteral で、
quote の閉じを要求しない。 [fixture: architecture/common-title-literal-quotes]
[fixture: architecture/common-line-whitespace]
[fixture: architecture/common-block-whitespace]
[fixture: architecture/common-quotes-entities]
[fixture: architecture/directive-fields]
[fixture: architecture/common-description-block-comment]
[fixture: architecture/style-fields]
[fixture: architecture/lex-title-two-spaces-literal]

### ArchitectureIgnoredText

| 欄      | 型     | 意味                        |
| ------- | ------ | --------------------------- |
| `kind`  | string | native hidden form の種類。 |
| `value` | string | fence を含む空でない原文。  |

子の欄はありません。
範囲は認識した --- または %%{ の開始から採用した閉じまで。
前の padding と消費した直後 LF を除く。
内部の原文の改行と padding は保ち、追加された LF は範囲・値に入れない。
value から内部の共通 directive、comment region、選ばれた semicolon を除き、
範囲はそれらを跨ぐ。
本文が空でも fence を持つ原文は空でない。
両形式とも閉じは必須であり、
directive が失敗して comment になる形は共有 Comment に持つ。 [fixture: architecture/hidden-yaml-adjacent-eof]
[fixture: architecture/hidden-yaml-open-padding]
[fixture: architecture/hidden-yaml-crlf]
[fixture: architecture/hidden-directive-eof]
[fixture: architecture/hidden-directive-crlf]
[fixture: architecture/lex-yaml-ls-ps-body]
[fixture: architecture/lex-yaml-global-directive]
[fixture: architecture/lex-yaml-common-comment]
[fixture: architecture/hidden-directive-close-glued]
[fixture: architecture/lex-yaml-global-opener]
[fixture: architecture/lex-yaml-selected-semicolon]
[fixture: architecture/lex-native-directive-selected-semicolon]
[fixture: architecture/lex-native-directive-common-comment]

native YAML は yaml-block、native DIRECTIVE は directive とする。
その値を YAML properties や root の frontmatter/directive data にしない。
内部の独立した共通 directive は共通の効果を保つ。
先行する string・label・共通値に囲まれた hidden に見える text は、
その値の内容とする。
全 hidden match は固有の所有先に 1 回だけ保つ。
3 本 fence の 1 回の一致は 1 node、別々の非空の 2 回の一致は 2
node とする。 [fixture: architecture/detect-retained-before-second-scan]
[fixture: architecture/lex-yaml-global-directive]
[fixture: architecture/hidden-directive-inside-values]
[fixture: architecture/hidden-yaml-inside-values]
[fixture: architecture/hidden-yaml-three-fences]
[fixture: architecture/lex-yaml-two-nonempty]

### 隙間の所有

各隙間の欄はソース順の ArchitectureIgnoredText のリストとする。
任意の構成要素がなければその直前の欄は空とし、次に実在する構成要素の前、
または EOL 前に後続要素がなければ textAfter に形を持つ。
共有 Comment、Directive、通常の空白、選ばれた semicolon は隙間の要素にしない。
文の内部では、
hidden の LF 消費によりソース上の行を跨いでも可視 EOL は作られない。 [fixture: architecture/hidden-directive-unit-gaps]
[fixture: architecture/hidden-yaml-service-gap]
[fixture: architecture/hidden-yaml-edge-gaps]
[fixture: architecture/hidden-yaml-align-gap]
[fixture: architecture/lex-hidden-two-suffixes]
[fixture: architecture/end-statements-comments]

textBeforeIcon/title は parenthesis/quote/bracket の開始全体の前に置く。
textBeforeIn は in の前、textBeforeParent はその後。
Edge の modifier の隙間は {group} 全体の前に置く。
Arrow の textBeforeLine は -- または最初の single dash の前、
textBeforeEndDash は label 後の dash の前、
textBeforeEndColon は最後の colon の前に置く。
その colon の後の隙間は Edge.textBeforeRhsId とする。
marker がなければその隙間は空とし、次の実在する構成要素へ形を持たせる。
複合形 icon/modifier の内部には native
hidden な隙間の要素を持たない。 [fixture: architecture/hidden-directive-unit-gaps]
[fixture: architecture/hidden-yaml-parent-gap]
[fixture: architecture/hidden-yaml-edge-gaps]
[fixture: architecture/gram-hidden-modifier-gaps]
[fixture: architecture/gram-hidden-inside-icon]
[fixture: architecture/gram-hidden-inside-modifier]

## 例

次の図の body は group、service、junction、edge、alignment の平坦な列である。
service と junction は in で g を参照する。
arrow は角括弧の title を所有し、value に両 marker の文字を保つ。
例はソースの構造を示し、
導出した layout は示さない。 [fixture: architecture/db-mixed]
[fixture: architecture/db-group-modifier-junction]
[fixture: architecture/gram-written-tree]

```mmd
architecture-beta
  group g(cloud)[Group]
  service a "A" [Service] in g
  junction j in g
  a:R <-[link]-> L:j
  align row a j
```
