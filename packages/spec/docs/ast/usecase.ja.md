# Usecase の節点

英語版: [usecase.md](./usecase.md)

`usecase` のソースの木を定義します。
共有の欄は [ast.md](../ast.ja.md)、
構文と受理条件は [diagrams/usecase.md](../diagrams/usecase.ja.md)、
値の変換と Db は [tests の要約](../../../tests/docs/db-summaries.ja.md#usecase)
に定義します。

各節点は共通の `type`、範囲、位置も持ちます。
任意の欄は省略せず null とし、書かれないリストは空にします。
子の欄は示す順に訪問し、リストはソース順です。
親の範囲は書かれた形全体で、文を終える行終端や前後の余白を除きます。
値自身の規則が読む場合を除き、空白は節点ではありません。
値からは共通の directive、コメント領域、選ばれたセミコロンを除きます。
それ以外の文字、実体参照、行終端、大文字と小文字は書かれたままです。
[fixture: usecase/db-all-fields]

## 節点

### UsecaseDiagram

| 欄     | 型                       | 意味                 |
| ------ | ------------------------ | -------------------- |
| `body` | list of UsecaseStatement | 書かれた最上位の文。 |

子の欄: `body`。
範囲はヘッダーから最後の文までです。
空の本体でもヘッダーを含みます。
ヘッダーの子、既定方向、beta、実効タイトル、解決済み記号、生成節点は持ちません。
UsecaseStatement は以下の文の型のいずれかです。
UsecaseActorStatement, UsecaseEntityStatement, UsecaseRelationshipStatement,
UsecaseSystemBoundaryStatement, UsecaseMetadataAssignmentStatement,
UsecaseNoteStatement, UsecaseJsonStatement, UsecaseDirectionStatement,
UsecaseClassDefStatement, UsecaseClassStatement, UsecaseStyleStatement,
UsecaseAccTitleStatement, UsecaseAccDescrStatement,
UsecaseAccDescrBlockStatement。 [fixture: usecase/header-lf]
[fixture: usecase/docs-syntax-usecase-00339c49]

### UsecaseActorStatement

| 欄       | 型                            | 意味                                |
| -------- | ----------------------------- | ----------------------------------- |
| `actors` | nonempty list of UsecaseActor | 1 つの actor キーワードに続く項目。 |

子の欄: `actors`。
範囲は `actor` から最後の項目の末尾までです。
コンマの後に別の actor キーワードは置きません。
関連を持たない actor リストの選択肢を表します。
[fixture: usecase/gram-actor-list]

### UsecaseActor

| 欄           | 型                      | 意味                                     |
| ------------ | ----------------------- | ---------------------------------------- |
| `id`         | Identifier or null      | 明示 id。引用符だけの名前では null。     |
| `label`      | UsecaseLabel or null    | 引用符だけの名前か、括弧内の明示ラベル。 |
| `metadata`   | UsecaseMetadata or null | この箇所の native metadata。             |
| `stereotype` | UsecaseLiteral or null  | 余白も含めた stereotype の中身。         |
| `classes`    | list of Identifier      | class 接尾辞の名前。                     |

子の欄: `id`、`label`、`metadata`、`stereotype`、`classes`。
範囲は名前の最初の単位から最後の接尾辞までで、actor キーワードを除きます。
id が null なら label は string または markdown です。
label が null なら id があります。
生成された id ラベル、actor の type、icon、business の欄は作りません。
metadata と stereotype は別々に書かれた形を保ちます。
[fixture: usecase/gram-actor-keyword-adjacent-string]
[fixture: usecase/gram-empty-actor-label]

### UsecaseEntityStatement

| 欄       | 型            | 意味                          |
| -------- | ------------- | ----------------------------- |
| `entity` | UsecaseEntity | 書かれた単独の usecase 宣言。 |

子の欄: `entity`。
範囲は entity の範囲と同じです。
境界内では id に metadata が続く形も宣言としてこの節点に入ります。
同じ形でも最上位では metadata の更新です。
[fixture: usecase/gram-boundary-target-update-is-member]
[fixture: usecase/gram-bare-source-metadata-forces-update]
[fixture: usecase/gram-boundary-standalone-metadata-inside]
[fixture: usecase/db-metadata-forward]

### UsecaseEntity

| 欄           | 型                      | 意味                                                  |
| ------------ | ----------------------- | ----------------------------------------------------- |
| `id`         | Identifier or null      | 明示 id。引用符だけの名前では null。                  |
| `shape`      | string or null          | 括弧は ellipse、角括弧は rectangle、それ以外は null。 |
| `label`      | UsecaseLabel or null    | 明示ラベルか引用符だけの名前。                        |
| `metadata`   | UsecaseMetadata or null | この箇所の native metadata。                          |
| `stereotype` | UsecaseLiteral or null  | 書かれた stereotype の中身。                          |
| `classes`    | list of Identifier      | 書かれた class 接尾辞の名前。                         |

子の欄: `id`、`label`、`metadata`、`stereotype`、`classes`。
範囲は名前の最初の単位から最後の接尾辞までです。
裸の id では shape と label が null、
引用符だけの名前では id と shape が null です。
明示形状の両側の区切りは entity の書かれた句読点です。
宣言か参照かの boolean は作らず、構文の欄と親の位置で決めます。
actor や JSON に解決される端点も別の型に変えません。
`rectangle` は toolkit の完全な形状名で、 mermaid の `rect` ではありません。
[fixture: usecase/gram-labeled-source-metadata-declaration]
[fixture: usecase/gram-target-metadata-declaration]
[fixture: usecase/lex-label-unquoted-hws-trim]

### UsecaseSystemBoundaryStatement

| 欄         | 型                            | 意味                                |
| ---------- | ----------------------------- | ----------------------------------- |
| `id`       | Identifier or null            | 明示 id。なければ null。            |
| `title`    | UsecaseLabel or null          | 引用符だけの名前か明示表示名。      |
| `metadata` | UsecaseMetadata or null       | 境界の native metadata。            |
| `classes`  | list of Identifier            | class 接尾辞の名前。                |
| `body`     | list of boundary declarations | 書かれた actor と entity の宣言文。 |

子の欄: `id`、`title`、`metadata`、`classes`、`body`。
範囲は `systemBoundary` から閉じる `end` までです。
id が null なら title は string または markdown、
裸の id なら title が null です。
表示名の括弧と角括弧は境界の形状を選ばず、追加の欄は不要です。
推定した parentId や members は作りません。
空の引用名に mermaid が親 id を付けなくても、書かれた本体を保持します。
閉じない境界は拒否するので closed はありません。
[fixture: usecase/gram-boundary-empty-id-reference]
[fixture: usecase/gram-boundary-empty-label]

### UsecaseRelationshipStatement

| 欄        | 型                            | 意味                                           |
| --------- | ----------------------------- | ---------------------------------------------- |
| `source`  | UsecaseActor or UsecaseEntity | 書かれた左側の出現。                           |
| `id`      | Identifier or null            | @ の前の明示辺 id。                            |
| `kind`    | string                        | association、include、extend、generalization。 |
| `opening` | UsecaseOpeningArrow or null   | ラベルつき関連の開き矢印。                     |
| `label`   | UsecaseLabel or null          | 書かれた関連のラベルだけ。                     |
| `arrow`   | UsecaseArrow                  | 単独の矢印か分割形の右側。                     |
| `target`  | UsecaseEntity                 | 書かれた右側の出現。                           |

子の欄: `source`、`id`、`opening`、`label`、`arrow`、`target`。
この順はソース順です。
actor キーワードのある source なら範囲は `actor` から始まり、
それ以外は source の最初から、target の最後の接尾辞までです。
source と target は入れ替えません。
opening と label は両方あるか両方 null です。
意味つきの種類には、書かれたラベルの子はありません。
コロンと大文字小文字を保った include/extend は文の書かれた単位です。
[fixture: usecase/db-labeled-arrows] [fixture: usecase/db-semantic-case]

### UsecaseOpeningArrow

| 欄            | 型      | 意味                                 |
| ------------- | ------- | ------------------------------------ |
| `value`       | string  | 書かれた --、<--、o--、x--。         |
| `startMarker` | string  | none、arrow、circle、cross。         |
| `line`        | string  | 常に solid。                         |
| `length`      | integer | 書かれたダッシュ数。ここでは常に 2。 |

子の欄はありません。
範囲は演算子だけで、空白と続くラベルを除きます。
完全な終点 marker や Db の minlen は持ちません。
[fixture: usecase/db-labeled-arrows]

### UsecaseArrow

| 欄            | 型      | 意味                                   |
| ------------- | ------- | -------------------------------------- |
| `value`       | string  | 書かれた単独または末尾の矢印。         |
| `startMarker` | string  | none、arrow、circle、cross。           |
| `endMarker`   | string  | none、arrow、circle、cross、triangle。 |
| `line`        | string  | solid または dotted。                  |
| `length`      | integer | ダッシュ数。..> ではドット数。         |

子の欄はありません。
範囲は演算子だけです。
`--|>` の endMarker は triangle、`..>` は dotted で末尾が arrow です。
分割形の閉じ側の startMarker は none で、開き側が始点 marker を持ちます。
Db が固定 minlen を使う場合も文字数を保ちます。
triangle は ClassArrow と同じ語です。
[fixture: usecase/lex-forward-circle-id-prefix]
[fixture: usecase/db-labeled-arrows]

### UsecaseLabel

| 欄      | 型     | 意味                     |
| ------- | ------ | ------------------------ |
| `kind`  | string | text、string、markdown。 |
| `value` | string | 書かれた中身全体。       |

子の欄はありません。
範囲は文字列や markdown の区切りを含み、
外側の形状括弧や stereotype 印を除きます。
裸のラベルは最初から最後の構成単位までで、内部の ASCII 空白とタブを保ちます。
その外側の ASCII 空白とタブは trivia です。
Unicode 空白は普通のラベル内容です。
引用ラベルは内部の余白をすべて保ち、空でも構いません。
受理する文字列はすべて閉じるので closed はありません。
[fixture: usecase/lex-label-unquoted-hws-trim]
[fixture: usecase/lex-label-unicode-whitespace-only]
[fixture: usecase/gram-empty-actor-label]

### UsecaseLiteral

| 欄      | 型     | 意味                             |
| ------- | ------ | -------------------------------- |
| `value` | string | この構文位置に書かれたテキスト。 |

子の欄はありません。
stereotype、CSS 値、アクセシビリティに使います。
stereotype は内部の余白をすべて保ちます。
CSS 値はコロン直後から始まり、先頭の空白とタブを含みます。
最後の構成単位で終わり、その後の読み飛ばす余白は範囲外です。
アクセシビリティの行値はコロン直後から物理行末までです。
ブロック値は波括弧の中身全体で、余白も保ちます。
変換や trim は木の値ではありません。
完全に空のアクセシビリティ内容は null、空白だけなら空でない Literal です。
[fixture: usecase/lex-css-property-padding]
[fixture: usecase/gram-a11y-line-raw-padding]
[fixture: usecase/gram-a11y-block-raw-padding]
[fixture: usecase/gram-stereotype-trimmed-conflict]

### UsecaseMetadata

| 欄           | 型                              | 意味                           |
| ------------ | ------------------------------- | ------------------------------ |
| `properties` | list of UsecaseMetadataProperty | ソース順の native プロパティ。 |

子の欄: `properties`。
範囲は連続する `@{` から閉じ波括弧までです。
空の metadata もプロパティなしの実在する節点です。
改行とコンマの区切りは句読点か trivia で、null の項目は作りません。
このブロックは opaque data ではありません。
[fixture: usecase/gram-metadata-empty]
[fixture: usecase/gram-native-trailing-comma-newline]

### UsecaseMetadataProperty

| 欄      | 型                          | 意味                               |
| ------- | --------------------------- | ---------------------------------- |
| `key`   | Identifier or StringLiteral | 書かれたキー。                     |
| `value` | Identifier or StringLiteral | 書かれた裸のスカラーか引用文字列。 |

子の欄: `key`、`value`。
範囲はキーの先頭から値の末尾までで、コロンを含みます。
raw から引用符を除きません。
裸の true/false は Identifier.name にそのままの語を持ちます。
その引用されない綴りだけを native 検証と Db が boolean と読みます。
整数に見える語も Identifier です。
[fixture: usecase/lex-native-single-quoted-keys]
[fixture: usecase/lex-native-string-backslashes]
[fixture: usecase/lex-identifier-leading-zero-icon]
[fixture: usecase/gram-native-key-newline-colon]
[fixture: usecase/gram-native-value-newline]
[fixture: usecase/lex-native-single-quote-comment-region-ls]
[fixture: usecase/lex-native-single-quote-comment-region-control]
[fixture: usecase/lex-native-single-quote-comment-region-lf]

### UsecaseMetadataAssignmentStatement

| 欄         | 型                         | 意味                           |
| ---------- | -------------------------- | ------------------------------ |
| `target`   | Identifier or UsecaseLabel | 裸の id か引用符つきの対象名。 |
| `metadata` | UsecaseMetadata            | 書かれた native 更新。         |

子の欄: `target`、`metadata`。
UsecaseLabel の target は string または markdown で、裸の text ではありません。
範囲は対象名の先頭から metadata の閉じまでです。
後で actor、entity、境界、JSON、明示辺に解決されても型を変えません。
解決された対象の欄は作りません。 [fixture: usecase/db-metadata-forward]
[fixture: usecase/gram-metadata-on-anonymous-resolved-node]

### UsecaseNoteStatement

| 欄       | 型           | 意味                   |
| -------- | ------------ | ---------------------- |
| `target` | Identifier   | 1 つの対象 id。        |
| `label`  | UsecaseLabel | 書かれた注釈のラベル。 |

子の欄: `target`、`label`。
範囲は note からラベル末尾までです。
生成する note id、接続辺、位置、別名の欄はありません。
[fixture: usecase/gram-note-adjacent-string-label]

### UsecaseJsonStatement

| 欄        | 型                   | 意味                       |
| --------- | -------------------- | -------------------------- |
| `id`      | Identifier           | JSON 接頭部の裸の語 id。   |
| `data`    | UsecaseJsonDataBlock | 不透明なオブジェクト本体。 |
| `classes` | list of Identifier   | 任意の class 接尾辞。      |

子の欄: `id`、`data`、`classes`。
範囲は json から最後の接尾辞までです。
JSON 接頭部の id は空でない ASCII 語文字列で、キーワード形でも構いません。
普通の id の位置では identifier 単位を要求します。
[fixture: usecase/gram-json-keyword-id]
[fixture: usecase/gram-json-space-after-at]

### UsecaseJsonDataBlock

| 欄      | 型     | 意味                             |
| ------- | ------ | -------------------------------- |
| `value` | string | 外側のオブジェクト波括弧の中身。 |

子の欄はありません。
範囲は @ から対応する閉じ波括弧までで、@ と { の間の空白とタブを含みます。
value は実際の開き { の直後から対応する } の直前までです。
入れ子のオブジェクトと配列、引用符、重複キー、escape の綴りを不透明に保ちます。
usecase で共通の opaque block に入るのはこのブロックだけです。
ブロックは常に閉じ、不釣り合いな括弧は拒否します。
[fixture: usecase/db-json-duplicate-order]
[fixture: usecase/div-json-balanced-invalid-array]

### UsecaseDirectionStatement

| 欄          | 型     | 意味                          |
| ----------- | ------ | ----------------------------- |
| `direction` | string | 書かれた TD、TB、BT、LR、RL。 |

子の欄はありません。
範囲は direction から値までです。
固定集合のキーワードはスカラー欄で、 Identifier の子を作りません。
[fixture: usecase/db-semantic-case]
[fixture: usecase/gram-direction-adjacent-quoted]
[fixture: usecase/db-direction-all] [fixture: usecase/db-direction-td]

### UsecaseClassDefStatement

| 欄        | 型                                       | 意味                |
| --------- | ---------------------------------------- | ------------------- |
| `classes` | nonempty list of Identifier              | 定義する class 名。 |
| `styles`  | nonempty list of UsecaseStyleDeclaration | 書かれた CSS 宣言。 |

子の欄: `classes`、`styles`。
範囲は classDef から最後の CSS 構成単位までです。
重複名と繰り返しの定義も別々の出現として保ちます。
[fixture: usecase/gram-styles-components]

### UsecaseClassStatement

| 欄        | 型                          | 意味                |
| --------- | --------------------------- | ------------------- |
| `targets` | nonempty list of Identifier | 書かれた対象名。    |
| `classes` | nonempty list of Identifier | 書かれた class 名。 |

子の欄: `targets`、`classes`。
範囲は class から最後の class 名までです。
空の項目と末尾コンマは許しません。
2 つのリストの間にコンマがないことが文法の境界で、
ソースの空白やタブが両側の id を分けます。
[fixture: usecase/gram-class-target-hole]
[fixture: usecase/gram-class-name-trailing-comma]

### UsecaseStyleStatement

| 欄       | 型                                       | 意味                |
| -------- | ---------------------------------------- | ------------------- |
| `target` | Identifier                               | 1 つの対象名。      |
| `styles` | nonempty list of UsecaseStyleDeclaration | 書かれた CSS 宣言。 |

子の欄: `target`、`styles`。
範囲は style から最後の CSS 構成単位までです。
class のスタイルをこの節点の直接の styles に展開しません。
[fixture: usecase/lex-style-quoted-value-and-comma]

### UsecaseStyleDeclaration

| 欄      | 型                | 意味                              |
| ------- | ----------------- | --------------------------------- |
| `name`  | UsecaseIdentifier | コロン前のプロパティ名。          |
| `value` | UsecaseLiteral    | コロン後の空でない CSS テキスト。 |

子の欄: `name`、`value`。
範囲は最初のプロパティ単位から最後の値の構成単位までです。
コロン前の余白は範囲内の trivia、コロン後の余白は value に入ります。
引用成分や `\,` で保護しないコンマは宣言を分けます。
null の宣言や末尾コンマはなく、 CSS 関数や文字列成分を解釈・復号しません。
[fixture: usecase/lex-css-property-padding]
[fixture: usecase/lex-style-quoted-value-and-comma]
[fixture: usecase/gram-css-empty-string-component]
[fixture: usecase/gram-css-whitespace-without-component]

### UsecaseIdentifier

| 欄     | 型     | 意味                                |
| ------ | ------ | ----------------------------------- |
| `name` | string | 内部の空白も含む CSS プロパティ名。 |

子の欄はありません。
範囲は名前の最初から最後の単位までです。
この位置は markerless のダッシュと後の語の間に空白やタブを許すので、
共有の Identifier と分けます。
コロン前の余白は除き、通常の id や native metadata のキーには使いません。
[fixture: usecase/lex-class-property-custom-gap]
[fixture: usecase/lex-class-property-long-custom]
[fixture: usecase/lex-css-name-custom-tab]
[fixture: usecase/lex-css-name-custom-nbsp]

`--` と後の語の間の HWS にある directive は共通 trivia です。
`name` はその両側の空白を保持します。
[fixture: usecase/lex-directive-css-name-gap]

### UsecaseAccTitleStatement

| 欄      | 型                     | 意味                 |
| ------- | ---------------------- | -------------------- |
| `value` | UsecaseLiteral or null | コロン後の完全な値。 |

子の欄: `value`。
範囲は accTitle からコロンか最後の値の文字までです。
完全に空なら null、空白だけなら Literal を保ちます。
次の物理行は別の文です。 [fixture: usecase/gram-a11y-line-raw-padding]
[fixture: usecase/db-acctitle-empty] [fixture: usecase/db-acctitle-eof]

### UsecaseAccDescrStatement

| 欄      | 型                     | 意味                     |
| ------- | ---------------------- | ------------------------ |
| `value` | UsecaseLiteral or null | コロン後の完全な行の値。 |

子の欄: `value`。
範囲は accDescr からコロンか最後の値の文字までです。
完全に空なら null、空白だけなら Literal を保ちます。
[fixture: usecase/db-accdescr-directive-gap] [fixture: usecase/db-accdescr-eof]
[fixture: usecase/db-accdescr-empty-gap]

### UsecaseAccDescrBlockStatement

| 欄      | 型                     | 意味                            |
| ------- | ---------------------- | ------------------------------- |
| `value` | UsecaseLiteral or null | 書かれた中身全体。空なら null。 |

子の欄: `value`。
範囲は accDescr から最初の閉じ波括弧までです。
閉じないブロックは拒否するので closed はありません。
空ブロックも普通の文で、任意の単位間に置ける無視される形ではありません。
[fixture: usecase/gram-a11y-whitespace-block]
[fixture: usecase/gram-a11y-block-raw-padding]
[fixture: usecase/db-accdescr-empty] [fixture: usecase/db-accdescr-unclosed]
