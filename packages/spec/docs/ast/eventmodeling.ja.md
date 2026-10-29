# Eventmodeling の node

英語版: [eventmodeling.md](./eventmodeling.md)

eventmodeling の書かれた木を定義する。
[ast.md](../ast.ja.md)は共有の葉と不変条件、
[構文](../diagrams/eventmodeling.ja.md)は受理を定義する。
任意の欄は不在時も null として存在し、list は原文順、子の欄は訪問順を示す。
model entity、note、GWT、tag、重複参照、
比較 Db が使わない data も全出現を保持する。
[fixture: eventmodeling/gram-written-tree]
[fixture: eventmodeling/db-data-first]
[fixture: eventmodeling/db-entities-notes-gwt]
[fixture: eventmodeling/db-source-order]

Identifier は単一の identifier の segment または frame-name の原綴を持つ。
数字だけの frame 名も identity であって NumericLiteral ではない。
1、01、001 を区別する。
quote の inline 値には共有 StringLiteral を使う。
value は共通 trivia を除く未変換の内側、
raw は両 quote とすべての原文の文字を保ち、closed は true。
backslash を decode しない。
空の quoted string も node にする。 [fixture: eventmodeling/lex-id-forms]
[fixture: eventmodeling/db-source-leading-zero]
[fixture: eventmodeling/lex-inline-quote-conversion]
[fixture: eventmodeling/lex-inline-empty]
[fixture: eventmodeling/directive-string-middle]

## gap の所有

以下の gap の欄はすべて EventmodelingIgnoredText の list で、空白、
共有 Comment、共通 Directive は入れない。
一つの形の所有者は一つ。
見出し前に残る形は textBeforeHeader、
見出しの後や完全な top-level 文の間の形は body に属する。
可視の EOL がなく、次の EOL までの textAfter の欄は作らない。
最後の完全な文の後の native form も body item。
[fixture: eventmodeling/gram-written-tree]
[fixture: eventmodeling/detect-real-retained-secondscan]
[fixture: eventmodeling/lex-hidden-between-statements]
[fixture: eventmodeling/lex-native-directive-object-eof]

未完の必須の構成内では次の部品の前の名前つき gap に置く。
後続する任意の source、data 参照、inline data、type tag はその前の形を所有する。
部品がなければ完成した frame の後の形は body に戻る。
qualified-name の tail member は dot の前と名前の前の形を所有する。
後続の GWT item は自身の textBefore、次の clause も自身の textBefore を所有し、
最後の then item の後の形は top-level body に戻る。
[fixture: eventmodeling/lex-hidden-frame-type-gap]
[fixture: eventmodeling/lex-hidden-frame-entity-gap]
[fixture: eventmodeling/lex-hidden-frame-optional-gaps]
[fixture: eventmodeling/lex-qualified-hidden-components]
[fixture: eventmodeling/lex-hidden-gwt-required-gaps]
[fixture: eventmodeling/lex-hidden-gwt-items]
[fixture: eventmodeling/lex-hidden-gwt-clause]
[fixture: eventmodeling/lex-native-directive-object-eof]

native の無視される形がなければ gap は空。
不在の任意の構成の内部 gap も空。
literal の内側が包む native に見える text は内容として残し、
hidden の子へ取り出さない。
native YAML、directive、
block data が消費する closing の改行は node の range の外。
論理上加わる LF を合成しない。
内部の原文の改行と padding は囲む range に残る。
[fixture: eventmodeling/gram-written-tree]
[fixture: eventmodeling/hidden-data-yaml-text]
[fixture: eventmodeling/lex-native-yaml-inside-common]
[fixture: eventmodeling/hidden-yaml-after-frame]
[fixture: eventmodeling/hidden-yaml-after-frame-space]
[fixture: eventmodeling/data-block-close-eof]
[fixture: eventmodeling/data-block-close-space]

## 共通の文の値

以下の共通の 4 文の node は書かれた本文を持つ。
公開される `EM_*` の値には前置の水平 padding、keyword、区切りも入る。
本文だけでは別に書かれた部分を持てず、普通の前置空白は node にしない。
そのため Db の導出は、
[共通の除去](../common.ja.md#ソースの読み方)を施した原文の読みから、
文全体と直前の ASCII space/tab の連なりを読む。
共通の除去は共通 directive、共通 comment region、選ばれた semicolon であり、
そのすべての除去後に連なりを数える。
除いた共通 directive または選ばれた semicolon の両側の space と tab は、
一つの連なりにつながる。
共通 comment region は自身の字下げと終わりの LF ごと除き、
残る prefix だけを保つ。
閉じた directive だけを除いても外の LF は除かず、
空行や選ばれた semicolon の後の LF も残る。
LF、LS、PS は ASCII space/tab の連なりに含めない。
その後の文の成立条件は、
[共通の文](../diagrams/eventmodeling.ja.md#共通の文)に従う。
選ばれない semicolon はこの gap では拒否され、
空の説明ブロックは文の境目として残る。
どちらも除かれたかのように、前後の padding をつながない。
この prefix を本文の欄に重複させたり、共通 converter の trim を施したりしない。
[fixture: eventmodeling/gram-common-leading-directive-both-sides]
[fixture: eventmodeling/gram-common-leading-directive-before-padding]
[fixture: eventmodeling/gram-common-leading-directive-after-padding]
[fixture: eventmodeling/gram-common-leading-directive-after-header]
[fixture: eventmodeling/gram-common-block-leading-directive]
[fixture: eventmodeling/lex-common-block-directive-only-line]
[fixture: eventmodeling/gram-common-leading-semicolon-both-sides]
[fixture: eventmodeling/gram-common-leading-semicolon-after-padding]
[fixture: eventmodeling/gram-common-leading-semicolon-before-padding]
[fixture: eventmodeling/gram-common-leading-semicolon-unselected]
[fixture: eventmodeling/gram-common-leading-comment-region-padding]
[fixture: eventmodeling/lex-common-yaml-blank-line-padding]
[fixture: eventmodeling/lex-common-after-block-ls-indented]
[fixture: eventmodeling/lex-common-after-block-ps-indented]
[fixture: eventmodeling/gram-common-leading-empty-description-boundary]

## node

### EventmodelingDiagram

| 欄                 | 型                               | 意味                          |
| ------------------ | -------------------------------- | ----------------------------- |
| `textBeforeHeader` | list of EventmodelingIgnoredText | 見出し前に残る形。            |
| `body`             | list of EventmodelingBodyItem    | すべての文と body の hidden。 |

子の欄: `textBeforeHeader`、`body`。
range は最初の retained form、なければ見出しから最後の body item まで。
body が空なら見出しの終わりまで。
Root.diagramType は eventmodeling。
外の padding、native comment、その終点より後の closing LF は含めない。
header node や alias の欄はない。
EventmodelingBodyItem は二種の frame 文、ModelEntityStatement、
DataEntityStatement、NoteStatement、GwtStatement、共通の四種の文、
IgnoredText のいずれかで、すべて Eventmodeling の prefix を持つ。
body は空でもよく、保存先の型ごとに文をまとめない。
[fixture: eventmodeling/header-only] [fixture: eventmodeling/gram-written-tree]
[fixture: eventmodeling/detect-real-retained-secondscan]
[fixture: eventmodeling/lex-native-directive-object-eof]

### EventmodelingTimeFrameStatement

| 欄                           | 型                                   | 意味                        |
| ---------------------------- | ------------------------------------ | --------------------------- |
| `textBeforeName`             | list of EventmodelingIgnoredText     | frame 名の前の形。          |
| `name`                       | Identifier                           | 書かれた数字列の名前。      |
| `textBeforeModelEntityType`  | list of EventmodelingIgnoredText     | entity type の語の前の形。  |
| `modelEntityType`            | string                               | 書かれた entity type の語。 |
| `textBeforeEntityIdentifier` | list of EventmodelingIgnoredText     | 修飾名の前の形。            |
| `entityIdentifier`           | EventmodelingQualifiedName           | 書かれた entity 名。        |
| `sourceFrames`               | list of EventmodelingSourceReference | 重複も含む全 source。       |
| `dataReference`              | EventmodelingDataReference or null   | 明示した data 参照。        |
| `data`                       | EventmodelingInlineData or null      | 明示した inline data。      |

子の欄: `textBeforeName`、`name`、`textBeforeModelEntityType`、
`textBeforeEntityIdentifier`、`entityIdentifier`、`sourceFrames`、
`dataReference`、`data`。
range は tf または timeframe から、存在する最後の data、dataReference、
source 参照、または修飾名の部品まで。
modelEntityType は rmo、readmodel、ui、cmd、command、evt、event、pcr、
processor のいずれかで、省略名を正規化しない。
sourceFrames は空でもよい。
dataReference と data は書かれた形全体がなければ null。
data 参照があっても inline data を残す。
短い frame keyword と長い keyword は構文に残し、 alias の欄を作らない。
[fixture: eventmodeling/gram-written-tree]
[fixture: eventmodeling/lex-hidden-frame-type-gap]
[fixture: eventmodeling/lex-hidden-frame-entity-gap]
[fixture: eventmodeling/lex-hidden-frame-optional-gaps]
[fixture: eventmodeling/db-source-order]
[fixture: eventmodeling/db-data-reference-inline]
[fixture: eventmodeling/lex-inline-empty]

### EventmodelingResetFrameStatement

| 欄                           | 型                                   | 意味                        |
| ---------------------------- | ------------------------------------ | --------------------------- |
| `textBeforeName`             | list of EventmodelingIgnoredText     | frame 名の前の形。          |
| `name`                       | Identifier                           | 書かれた数字列の名前。      |
| `textBeforeModelEntityType`  | list of EventmodelingIgnoredText     | entity type の語の前の形。  |
| `modelEntityType`            | string                               | 書かれた entity type の語。 |
| `textBeforeEntityIdentifier` | list of EventmodelingIgnoredText     | 修飾名の前の形。            |
| `entityIdentifier`           | EventmodelingQualifiedName           | 書かれた entity 名。        |
| `sourceFrames`               | list of EventmodelingSourceReference | 重複も含む全 source。       |
| `dataReference`              | EventmodelingDataReference or null   | 明示した data 参照。        |
| `data`                       | EventmodelingInlineData or null      | 明示した inline data。      |

子の欄: `textBeforeName`、`name`、`textBeforeModelEntityType`、
`textBeforeEntityIdentifier`、`entityIdentifier`、`sourceFrames`、
`dataReference`、`data`。
range は rf または resetframe から、存在する最後の data、dataReference、
source 参照、または修飾名の部品まで。
modelEntityType は rmo、readmodel、ui、cmd、command、evt、event、pcr、
processor のいずれかで、省略名を正規化しない。
sourceFrames は空でもよい。
dataReference と data は書かれた形全体がなければ null。
data 参照があっても inline data を残す。
短い frame keyword と長い keyword は構文に残し、 alias の欄を作らない。
[fixture: eventmodeling/gram-written-tree]
[fixture: eventmodeling/db-all-aliases]
[fixture: eventmodeling/validator-reset-invalid]
[fixture: eventmodeling/spec-eventmodeling-test-ts-8573a603]

### EventmodelingQualifiedName

| 欄     | 型                                     | 意味                           |
| ------ | -------------------------------------- | ------------------------------ |
| `head` | Identifier                             | 最初の segment。               |
| `tail` | list of EventmodelingQualifiedNamePart | 原文順の dot と名前の member。 |

子の欄: `head`、`tail`。
range は最初の segment の先頭から最後の segment の終わりまで。
一個だけの名前もこの node を使い、tail は空。
部品間の空白と hidden は原文とその gap に保つ。
空白を許す名前全体を共有 Identifier に入れず、
namespace や解決済みの宣言も合成しない。
[fixture: eventmodeling/db-qualified-names]
[fixture: eventmodeling/space-qualified-name]
[fixture: eventmodeling/lex-qualified-hidden-components]
[fixture: eventmodeling/gram-written-tree]

### EventmodelingQualifiedNamePart

| 欄               | 型                               | 意味                     |
| ---------------- | -------------------------------- | ------------------------ |
| `textBeforeDot`  | list of EventmodelingIgnoredText | dot の前の形。           |
| `textBeforeName` | list of EventmodelingIgnoredText | dot の後、名前の前の形。 |
| `name`           | Identifier                       | 後続の segment。         |

子の欄: `textBeforeDot`、`textBeforeName`、`name`。
range は最初の所有する textBeforeDot の形、なければ dot から名前の終わりまで。
dot は句読点。
並行する配列でなく、各名前とその gap を対にする。
name は必須で、いずれの gap も普通の空白やコメントは含めない。
[fixture: eventmodeling/space-qualified-name]
[fixture: eventmodeling/lex-qualified-hidden-components]
[fixture: eventmodeling/gram-written-tree]

### EventmodelingSourceReference

| 欄                | 型                               | 意味                      |
| ----------------- | -------------------------------- | ------------------------- |
| `textBefore`      | list of EventmodelingIgnoredText | arrow の前の形。          |
| `arrow`           | EventmodelingArrow               | 書かれた arrow。          |
| `textBeforeFrame` | list of EventmodelingIgnoredText | arrow と名前の間の形。    |
| `frame`           | Identifier                       | 書かれた frame の参照名。 |

子の欄: `textBefore`、`arrow`、`textBeforeFrame`、`frame`。
range は最初の textBefore の形、なければ arrow から frame 名の終わりまで。
重複、未解決、前方、自己参照の名前も各 member と位置を保持する。
frame は一〜三桁の書かれた identity で、参照先 node の pointer にしない。
[fixture: eventmodeling/db-source-order]
[fixture: eventmodeling/db-source-missing]
[fixture: eventmodeling/db-source-forward]
[fixture: eventmodeling/db-source-self]
[fixture: eventmodeling/lex-hidden-source-frame-gap]
[fixture: eventmodeling/lex-hidden-frame-optional-gaps]

### EventmodelingArrow

| 欄            | 型     | 意味           |
| ------------- | ------ | -------------- |
| `value`       | string | 書かれた ->>。 |
| `startMarker` | string | none。         |
| `line`        | string | solid。        |
| `endMarker`   | string | arrow。        |

子の欄はありません。
range は三文字の arrow 全体。
value は原綴、startMarker は none、line は solid、endMarker は arrow。
欄は書かれた arrow を記述し、描画の向きに合わせて参照を反転しない。
[fixture: eventmodeling/db-source-order]
[fixture: eventmodeling/gram-written-tree]

### EventmodelingDataReference

| 欄                | 型                               | 意味                     |
| ----------------- | -------------------------------- | ------------------------ |
| `textBefore`      | list of EventmodelingIgnoredText | opener の前の形。        |
| `textBeforeName`  | list of EventmodelingIgnoredText | opener の後の形。        |
| `name`            | Identifier                       | 単一の書かれた data 名。 |
| `textBeforeClose` | list of EventmodelingIgnoredText | closer の前の形。        |

子の欄: `textBefore`、`textBeforeName`、`name`、`textBeforeClose`。
range は最初の textBefore の形、なければ [[ から ]] まで。
name は単一の identifier で必須。
未解決の参照もこの node のままで null にしない。
bracket の形全体がないときだけ親の欄が null。
二文字ずつの両 delimiter は句読点。 [fixture: eventmodeling/db-data-unresolved]
[fixture: eventmodeling/lex-hidden-reference-name-close]
[fixture: eventmodeling/gram-written-tree]

### EventmodelingInlineData

| 欄                    | 型                                            | 意味                               |
| --------------------- | --------------------------------------------- | ---------------------------------- |
| `textBefore`          | list of EventmodelingIgnoredText              | tag または本文の opener の前の形。 |
| `dataType`            | string or null                                | 書かれた data type の語。          |
| `textBeforeDataType`  | list of EventmodelingIgnoredText              | opening backtick の後の形。        |
| `textBeforeTypeClose` | list of EventmodelingIgnoredText              | closing backtick の前の形。        |
| `textBeforeValue`     | list of EventmodelingIgnoredText              | closing backtick の後の形。        |
| `value`               | StringLiteral or EventmodelingLiteral or null | quote または brace の内側。        |

子の欄: `textBefore`、`textBeforeDataType`、`textBeforeTypeClose`、
`textBeforeValue`、`value`。
range は最初の textBefore の形、なければ opening backtick、quote、
brace から本文の closing quote または brace まで。
dataType は json、jsobj、figma、salt、uri、md、html、text、
または tag がなければ null。
tag がなければ内部の三つの gap は空。
quote の本文は空の string も StringLiteral。
brace の本文は EventmodelingLiteral で、共通の除去後の内側が空のときだけ null。
空白だけの brace の内容は null でない。
braces と tag の backtick は句読点で、本文の文字でない。
[fixture: eventmodeling/lex-inline-empty]
[fixture: eventmodeling/space-data-values]
[fixture: eventmodeling/data-all-types]
[fixture: eventmodeling/lex-hidden-type-tag]
[fixture: eventmodeling/gram-written-tree]
[fixture: eventmodeling/gram-empty-payload-after-removals]

### EventmodelingDataBlock

| 欄                    | 型                               | 意味                               |
| --------------------- | -------------------------------- | ---------------------------------- |
| `textBefore`          | list of EventmodelingIgnoredText | tag または本文の opener の前の形。 |
| `dataType`            | string or null                   | 書かれた data type の語。          |
| `textBeforeDataType`  | list of EventmodelingIgnoredText | opening backtick の後の形。        |
| `textBeforeTypeClose` | list of EventmodelingIgnoredText | closing backtick の前の形。        |
| `textBeforeValue`     | list of EventmodelingIgnoredText | closing backtick の後の形。        |
| `value`               | EventmodelingLiteral             | brace の内側全体。                 |

子の欄: `textBefore`、`textBeforeDataType`、`textBeforeTypeClose`、
`textBeforeValue`、`value`。
range は最初の textBefore の形、
なければ opening backtick または brace から closing brace まで。
dataType は json、jsobj、figma、salt、uri、md、html、text、
または tag がなければ null で、その場合内部の三つの gap は空。
value は常に非 null。
空 block にも braces の内側の opening 行の padding と LF がある。
内部の空白、原文の改行、先の closing に見える行、文に見える text をすべて保つ。
消費した closing LF と論理上の追加 LF はこの node の外。
[tests の要約](../../../tests/docs/db-summaries.md#eventmodeling)
が説明するとおり、 Db の導出は原文からその境目を読む。
[fixture: eventmodeling/data-block-empty]
[fixture: eventmodeling/lex-block-empty-whitespace]
[fixture: eventmodeling/line-block-values]
[fixture: eventmodeling/lex-block-adjacent-later-close]
[fixture: eventmodeling/lex-hidden-data-tag-gaps]
[fixture: eventmodeling/data-block-close-eof]
[fixture: eventmodeling/data-block-close-space]
[fixture: eventmodeling/lex-block-close-ps-boundary]

### EventmodelingModelEntityStatement

| 欄               | 型                               | 意味              |
| ---------------- | -------------------------------- | ----------------- |
| `textBeforeName` | list of EventmodelingIgnoredText | entity の後の形。 |
| `name`           | EventmodelingQualifiedName       | 書かれた宣言名。  |

子の欄: `textBeforeName`、`name`。
range は entity から名前の最後の segment まで。
重複と未使用の宣言も独立に残し、暗黙の frame や解決済みの親を合成しない。
[fixture: eventmodeling/db-entities-notes-gwt]
[fixture: eventmodeling/lex-hidden-yaml-name-gap]
[fixture: eventmodeling/lex-qualified-hidden-components]
[fixture: eventmodeling/gram-written-tree]

### EventmodelingDataEntityStatement

| 欄               | 型                               | 意味                        |
| ---------------- | -------------------------------- | --------------------------- |
| `textBeforeName` | list of EventmodelingIgnoredText | data keyword の後の形。     |
| `name`           | Identifier                       | 単一の書かれた宣言名。      |
| `data`           | EventmodelingDataBlock           | 必須の block と任意の tag。 |

子の欄: `textBeforeName`、`name`、`data`。
range は data keyword から data block の closing brace まで。
name と data はどちらも非 null。
未使用の宣言と後の同名宣言も別の文とし、有効な宣言だけを選ばない。
[fixture: eventmodeling/db-data-first] [fixture: eventmodeling/db-data-unused]
[fixture: eventmodeling/lex-hidden-data-name-gap]
[fixture: eventmodeling/lex-hidden-data-tag-gaps]
[fixture: eventmodeling/gram-written-tree]

### EventmodelingNoteStatement

| 欄                      | 型                               | 意味                        |
| ----------------------- | -------------------------------- | --------------------------- |
| `textBeforeSourceFrame` | list of EventmodelingIgnoredText | note の後の形。             |
| `sourceFrame`           | Identifier                       | 書かれた frame の参照。     |
| `data`                  | EventmodelingDataBlock           | 必須の block と任意の tag。 |

子の欄: `textBeforeSourceFrame`、`sourceFrame`、`data`。
range は note から block の closing brace まで。
参照と block はどちらも必須。
空 block、未解決や前方の参照名も保持し、描画される note node を推測しない。
[fixture: eventmodeling/gram-note-empty]
[fixture: eventmodeling/link-note-forward]
[fixture: eventmodeling/db-entities-notes-gwt]
[fixture: eventmodeling/lex-hidden-note-frame-gap]
[fixture: eventmodeling/data-block-types]
[fixture: eventmodeling/gram-written-tree]

### EventmodelingGwtStatement

| 欄                      | 型                               | 意味                    |
| ----------------------- | -------------------------------- | ----------------------- |
| `textBeforeSourceFrame` | list of EventmodelingIgnoredText | gwt の後の形。          |
| `sourceFrame`           | Identifier                       | 書かれた frame の参照。 |
| `given`                 | EventmodelingGwtClause           | 必須の given clause。   |
| `when`                  | EventmodelingGwtClause or null   | 書かれた when clause。  |
| `then`                  | EventmodelingGwtClause           | 必須の then clause。    |

子の欄: `textBeforeSourceFrame`、`sourceFrame`、`given`、`when`、`then`。
range は gwt から then の最後の item の名前まで。
given.kind は given、then.kind は then、存在する when.kind は when。
when は clause 全体がないときだけ null。
sourceFrame を解決せず、clause を保存先の list に置き換えない。
後続する完全な top-level 文はこの node の外。
[fixture: eventmodeling/gwt-complete] [fixture: eventmodeling/gwt-without-when]
[fixture: eventmodeling/lex-hidden-gwt-required-gaps]
[fixture: eventmodeling/gram-gwt-next-top-level]
[fixture: eventmodeling/gram-written-tree]

### EventmodelingGwtClause

| 欄           | 型                               | 意味                      |
| ------------ | -------------------------------- | ------------------------- |
| `textBefore` | list of EventmodelingIgnoredText | clause keyword の前の形。 |
| `kind`       | string                           | given、when、then。       |
| `body`       | list of EventmodelingGwtItem     | 一個以上の書かれた item。 |

子の欄: `textBefore`、`body`。
range は最初の textBefore の形、
なければ clause keyword から最後の item の名前まで。
kind は書かれた固定語。
body は空にせず、item の順序と重複を残す。
次の clause の前の形は次の clause に属し、この body に属さない。
[fixture: eventmodeling/gwt-complete]
[fixture: eventmodeling/gram-gwt-unassigned-type]
[fixture: eventmodeling/lex-hidden-gwt-clause]
[fixture: eventmodeling/lex-hidden-gwt-required-gaps]
[fixture: eventmodeling/gram-written-tree]

### EventmodelingGwtItem

| 欄                           | 型                               | 意味                         |
| ---------------------------- | -------------------------------- | ---------------------------- |
| `textBefore`                 | list of EventmodelingIgnoredText | 型の語の前の形。             |
| `modelEntityType`            | string                           | 書かれた entity type の語。  |
| `textBeforeEntityIdentifier` | list of EventmodelingIgnoredText | entity 名の前の形。          |
| `entityIdentifier`           | Identifier                       | 単一の書かれた entity 参照。 |

子の欄: `textBefore`、`textBeforeEntityIdentifier`、`entityIdentifier`。
range は最初の textBefore の形、なければ entity type の語から参照名まで。
modelEntityType は rmo、readmodel、ui、cmd、command、evt、event、pcr、
processor。
上流のモデルが unassigned な出現を落としても語を残す。
entityIdentifier は単一の書かれた identifier で、修飾名や解決済みの宣言でない。
item の合成や重複除去をしない。 [fixture: eventmodeling/gwt-complete]
[fixture: eventmodeling/gram-gwt-unassigned-type]
[fixture: eventmodeling/lex-hidden-gwt-item-gap]
[fixture: eventmodeling/lex-hidden-gwt-items]
[fixture: eventmodeling/gram-gwt-title-name-after-lf]
[fixture: eventmodeling/gram-written-tree]

### EventmodelingTitleStatement

| 欄      | 型                           | 意味           |
| ------- | ---------------------------- | -------------- |
| `value` | EventmodelingLiteral or null | 書かれた本文。 |

子の欄: `value`。
range は title から本文の最後まで、null なら title の終わりまで。
前置の padding と文末 LF を除く。
value は title とちょうど一つの ASCII space/tab の後からで、
残りの padding は保つ。
その separator がないか、その後と共通の除去の後に何もなければ null。
残る空白だけの内容は literal。
空の出現と上書き前の出現も残す。
原文からの Db の導出は[共通の文の値](#共通の文の値)に従う。
[fixture: eventmodeling/common-title-only]
[fixture: eventmodeling/common-title-empty]
[fixture: eventmodeling/lex-common-title-two-spaces]
[fixture: eventmodeling/gram-empty-payload-after-removals]
[fixture: eventmodeling/gram-written-tree]

### EventmodelingAccTitleStatement

| 欄      | 型                           | 意味           |
| ------- | ---------------------------- | -------------- |
| `value` | EventmodelingLiteral or null | 書かれた本文。 |

子の欄: `value`。
range は accTitle から本文の最後まで、null なら colon の終わりまでで、
前置の padding と LF を除く。
value は colon の直後からで、書かれた padding をすべて保つ。
共通の除去後に内容がないときだけ null。
空白だけも literal。
繰り返しも別の文にする。
原文からの Db の導出は[共通の文の値](#共通の文の値)に従う。
[fixture: eventmodeling/common-acctitle-eof]
[fixture: eventmodeling/common-whitespace]
[fixture: eventmodeling/common-repeat]
[fixture: eventmodeling/common-repeat-empty]
[fixture: eventmodeling/gram-empty-payload-after-removals]
[fixture: eventmodeling/gram-written-tree]

### EventmodelingAccDescrStatement

| 欄      | 型                           | 意味           |
| ------- | ---------------------------- | -------------- |
| `value` | EventmodelingLiteral or null | 書かれた本文。 |

子の欄: `value`。
range は accDescr から本文の最後まで、null なら colon の終わりまでで、
前置の padding と LF を除く。
value は colon の直後からで、padding と brace に見える text も保つ。
共通の除去後に内容がないときだけ null。
空白だけも literal。
colon 形を block 文に変えない。
原文からの Db の導出は[共通の文の値](#共通の文の値)に従う。
[fixture: eventmodeling/common-description-eof]
[fixture: eventmodeling/common-colon-block-priority]
[fixture: eventmodeling/common-quoted-values]
[fixture: eventmodeling/gram-empty-payload-after-removals]
[fixture: eventmodeling/gram-written-tree]

### EventmodelingAccDescrBlockStatement

| 欄      | 型                           | 意味           |
| ------- | ---------------------------- | -------------- |
| `value` | EventmodelingLiteral or null | 書かれた本文。 |

子の欄: `value`。
range は accDescr から最初の closing brace までで、null でも delimiter を含む。
brace の内側を trim せず保つ。
空、または共通の除去だけの内容は null。
空白だけも literal。
closer が必須なので closed の欄はない。
空や上書き前の block もそれぞれ文として残す。
原文からの Db の導出は[共通の文の値](#共通の文の値)に従う。
[fixture: eventmodeling/common-description-repeat]
[fixture: eventmodeling/common-whitespace]
[fixture: eventmodeling/lex-common-block-whitespace-only]
[fixture: eventmodeling/lex-common-empty-line-whitespace]
[fixture: eventmodeling/gram-description-block-empty-after-removal]
[fixture: eventmodeling/gram-written-tree]

### EventmodelingLiteral

| 欄      | 型     | 意味                   |
| ------- | ------ | ---------------------- |
| `value` | string | 未変換の書かれた本文。 |

子の欄はありません。
range は親が指定する本文の最初から最後の文字までで、内部の共通 trivia もまたぐ。
value は共通 directive、コメント領域、選ばれた semicolon を除き、
所有する padding、改行、文字参照の綴り、quote、
backslash を含む他の原文の文字をすべて保つ。
data の braces は親の構文。
null の欄のために空の literal を作らない。
block-data の braces 内には少なくとも opening LF があり、
metadata と inline brace の本文は null にもなれる。
quote のない text に raw の欄は不要。 [fixture: eventmodeling/line-block-values]
[fixture: eventmodeling/lex-block-empty-whitespace]
[fixture: eventmodeling/common-whitespace]
[fixture: eventmodeling/lex-common-block-whitespace-only]
[fixture: eventmodeling/gram-nested-block-empty-description]
[fixture: eventmodeling/directive-block-middle]
[fixture: eventmodeling/style-every-text]
[fixture: eventmodeling/gram-written-tree]

### EventmodelingIgnoredText

| 欄      | 型     | 意味                             |
| ------- | ------ | -------------------------------- |
| `kind`  | string | yaml-block または directive。    |
| `value` | string | 書かれた native の無視される形。 |

子の欄はありません。
range は最初の opening dash または percent から最後の closing dash または
percent までで、前置の水平 padding と消費した後続 LF を除く。
kind は hidden-yaml なら yaml-block、hidden-directive なら directive。
value は共通 trivia を除く共有の written text の規則に従い、
native delimiter と内部の空白を含む。
内容を YAML/JSON として解析せず、設定として公開しない。
失敗した native directive が comment になった場合は共有 Comment であり、
この node でない。
所有する gap と body/textBeforeHeader に完全な形をちょうど一度残す。
[fixture: eventmodeling/hidden-yaml-unit-gap]
[fixture: eventmodeling/hidden-yaml-after-frame]
[fixture: eventmodeling/hidden-yaml-after-frame-space]
[fixture: eventmodeling/lex-native-directive-object]
[fixture: eventmodeling/lex-native-directive-object-space]
[fixture: eventmodeling/lex-native-directive-object-eof]
[fixture: eventmodeling/lex-hidden-gwt-required-gaps]
[fixture: eventmodeling/lex-hidden-yaml-fence-directive]
[fixture: eventmodeling/detect-real-retained-secondscan]
[fixture: eventmodeling/gram-written-tree]

## 例

この例は意図的に共通の文を同じ行に置き、すべての文の種類、重複 source、
data 参照と並ぶ inline 値、型付き data block、空 note、
top-level の無視される block を保つ。
この文法では共通の文をすべて行頭に移す配置は等価でない。
[fixture: eventmodeling/gram-written-tree]

```mmd
eventmodeling accTitle: Title
tf 01 evt Shop.Bought ->> 02 ->> 02 [[D]] `json`{x} accDescr: D
rf 02 cmd Shop.Buy
entity Shop.Buy
data D `text`{
y
}
note 99 {
}
gwt 99 given evt Bought when cmd Buy then ui Screen
---
hidden
---
tf 03 ui Shop.Screen accDescr {} title All
```

最初の frame は、比較要約が参照先 data を選んでも、
二つの SourceReference の子と InlineData を保持する。
GWT item の型の語は Item の欄に残る。
空 note は DataBlock と LF を持つ Literal、
空の説明 block は null の value を持つ。
宣言、source、 tag を合成せず捨てない。
[fixture: eventmodeling/gram-written-tree]

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
