# Packet のノード

英語版: [packet.md](./packet.md)

この文書は `packet` と `packet-beta` の木を定義する。
共有の木は [ast.md](../ast.md)、
構文と受理は [diagrams/packet.md](../diagrams/packet.md) で定める。
欄は書かれた値を保ち、省略値も null として存在し、不在のリストは空とする。
リストはソース順を保ち、子の欄は訪問順を示す。 [fixture: packet/gram-mixed]
[fixture: packet/spec-packet-c4580507] [fixture: packet/title-repeat-empty]
[fixture: packet/accdescr-block-repeat]

## ノード

### PacketDiagram

| 欄                 | 型                        | 意味                       |
| ------------------ | ------------------------- | -------------------------- |
| `textBeforeHeader` | list of PacketIgnoredText | 見出し前に残る形。         |
| `body`             | list of PacketBodyItem    | 書かれた文と hidden な形。 |

子の欄: `textBeforeHeader`、`body`。
範囲は見出し前の最初の残存形、なければ見出しから、
最後の見出し・body の形までで、無関係な外側 padding を除く。
二つの見出しの綴りは keyword のトークンに残し、別名の欄や独立ノードは作らない。
Root.diagramType はどちらも `packet` である。
[fixture: packet/spec-packet-7426afc4] [fixture: packet/spec-packet-c4580507]
[fixture: packet/detect-one-block]
[fixture: packet/detect-yaml-properties-ignored]
[fixture: packet/detect-second-scan-directive]

textBeforeHeader は、
検出点から残る native YAML と二回目の scan の DIRECTIVE を所有する。
percent-brace の形も含む通過した裸の行は共有 Comment とし、範囲を広げない。
通過した空白・改行は残存する形の間でも trivia であり、読み直さない。
native の閉じの境界は引き続き適用する。 [fixture: packet/detect-one-block]
[fixture: packet/detect-yaml-properties-ignored]
[fixture: packet/detect-second-scan-directive]
[fixture: packet/detect-empty-braces-bare]
[fixture: packet/detect-unclosed-brace-bare]
[fixture: packet/retained-yaml-bare-ls]
[fixture: packet/div-detect-yaml-bare-directive-ls]
[fixture: packet/detect-yaml-bare-directive-ascii]
[fixture: packet/detect-second-scan-glued]

PacketBodyItem は PacketRangeBlockStatement、PacketSingleBlockStatement、
PacketRelativeBlockStatement、PacketTitleStatement、PacketAccTitleStatement、
PacketAccDescrStatement、PacketAccDescrBlockStatement、
PacketIgnoredText のいずれか。
反復・空の共通文と公開上限後の全ブロックを残し、
分割ブロックや絶対位置を合成しない。
空行・comment だけの行は body 要素を作らない。
ブロックの前、または可視 EOL の後の hidden な形は body 要素である。
[fixture: packet/gram-mixed] [fixture: packet/gram-common-interleaved]
[fixture: packet/title-repeat-empty] [fixture: packet/accdescr-block-repeat]
[fixture: packet/db-cap-following-block-unpublished]
[fixture: packet/db-cap-later-logical-end]
[fixture: packet/gram-block-blank-lines] [fixture: packet/comment-bare]
[fixture: packet/gram-yaml-around-range]
[fixture: packet/lex-hidden-after-visible-eol]

### PacketRangeBlockStatement

| 欄                | 型                        | 意味                          |
| ----------------- | ------------------------- | ----------------------------- |
| `start`           | NumericLiteral            | 書かれた開始位置。            |
| `textBeforeDash`  | list of PacketIgnoredText | 範囲の dash の前の形。        |
| `textBeforeEnd`   | list of PacketIgnoredText | dash と end の間の形。        |
| `end`             | NumericLiteral            | 書かれた包含終端。            |
| `textBeforeColon` | list of PacketIgnoredText | colon の前の形。              |
| `textBeforeLabel` | list of PacketIgnoredText | colon と label の間の形。     |
| `label`           | StringLiteral             | 書かれた引用 label。          |
| `textAfter`       | list of PacketIgnoredText | 可視 EOL 前の hidden 接尾辞。 |

子の欄: `start`、`textBeforeDash`、`textBeforeEnd`、`end`、`textBeforeColon`、
`textBeforeLabel`、`label`、`textAfter`。
範囲は start の最初の数字から label の閉じ quote までで、
最後の textAfter があればそこまで広げ、外側 padding と EOL を除く。
書かれた `start-end: label` の形だけを表し、端点が等しくてもこのノードを使う。
[fixture: packet/gram-mixed] [fixture: packet/gram-zero-range]
[fixture: packet/gram-hidden-range-gap-spaced]
[fixture: packet/gram-yaml-around-range]

内部の四リストは、名前の示す隙間の hidden な形全体だけを所有する。
公開時に範囲が分割されても start/end は書かれた数の葉のままである。
label は必須だが空でもよく、single/double quote のどちらも使える。
共通値の literal へ置き換えない。
Comment と global Directive は共有の記録であり、これらのリストに入れない。
[fixture: packet/gram-hidden-range-gap-spaced] [fixture: packet/db-row-split]
[fixture: packet/db-label-empty-single] [fixture: packet/db-label-empty-double]
[fixture: packet/db-label-single] [fixture: packet/comment-block]
[fixture: packet/directive-label-middle]

### PacketSingleBlockStatement

| 欄                | 型                        | 意味                          |
| ----------------- | ------------------------- | ----------------------------- |
| `start`           | NumericLiteral            | 書かれた単一位置。            |
| `textBeforeColon` | list of PacketIgnoredText | colon の前の形。              |
| `textBeforeLabel` | list of PacketIgnoredText | colon と label の間の形。     |
| `label`           | StringLiteral             | 書かれた引用 label。          |
| `textAfter`       | list of PacketIgnoredText | 可視 EOL 前の hidden 接尾辞。 |

子の欄: `start`、`textBeforeColon`、`textBeforeLabel`、`label`、`textAfter`。
範囲は start の最初の数字から label の閉じ quote までで、
最後の textAfter があればそこまで広げ、外側 padding と EOL を除く。
`start: label` だけを表し、end や count の欄は加えない。
textBeforeColon は start の後、textBeforeLabel は colon の後の形を所有する。
label は必須で、空・どちらの quote も許す。 [fixture: packet/gram-single-zero]
[fixture: packet/gram-single-hidden-gaps] [fixture: packet/gram-mixed]
[fixture: packet/db-label-empty-double] [fixture: packet/db-label-empty-single]
[fixture: packet/hidden-directive-block-eof]

### PacketRelativeBlockStatement

| 欄                | 型                        | 意味                          |
| ----------------- | ------------------------- | ----------------------------- |
| `textBeforeCount` | list of PacketIgnoredText | plus と count の間の形。      |
| `count`           | NumericLiteral            | 書かれた符号なし count。      |
| `textBeforeColon` | list of PacketIgnoredText | colon の前の形。              |
| `textBeforeLabel` | list of PacketIgnoredText | colon と label の間の形。     |
| `label`           | StringLiteral             | 書かれた引用 label。          |
| `textAfter`       | list of PacketIgnoredText | 可視 EOL 前の hidden 接尾辞。 |

子の欄: `textBeforeCount`、`count`、`textBeforeColon`、`textBeforeLabel`、
`label`、`textAfter`。
範囲は書かれた plus から label の閉じ quote までで、
最後の textAfter があればそこまで広げ、外側 padding と EOL を除く。
`+count: label` だけを表し、plus は count.raw の外の句読点である。
start/end の欄は合成しない。
内部リストは plus と count の間の YAML も含め、名前の示す隙間の形を所有する。
label は必須で、空・どちらの quote も許す。 [fixture: packet/gram-mixed]
[fixture: packet/gram-gaps] [fixture: packet/gram-hidden-gap]
[fixture: packet/gram-hidden-yaml-gap]
[fixture: packet/gram-relative-hidden-colon]
[fixture: packet/db-precision-rounded]

三つのブロックとも、
label の後で最初の可視 EOL より前の hidden な形は textAfter が所有する。
各一致は別々に保持し、消費した後続の行終端はその範囲から除く。
可視 EOL でこの所有は終わり、後の形は body 要素になる。
label と数の葉は、
共有の [StringLiteral](../ast.md#stringliteral) と
[NumericLiteral](../ast.md#numericliteral) の契約に従う。
書かれた raw・内側、文字列の true の closed、double の数値を使う。
hidden な形で葉を複数の整数に分割することはできない。
[fixture: packet/lex-hidden-two-suffixes]
[fixture: packet/hidden-directive-block-eof] [fixture: packet/hidden-yaml-crlf]
[fixture: packet/lex-hidden-after-visible-eol]
[fixture: packet/db-label-escapes] [fixture: packet/db-precision-rounded]
[fixture: packet/lex-hidden-between-digits]

### PacketTitleStatement

| 欄          | 型                        | 意味                          |
| ----------- | ------------------------- | ----------------------------- |
| `value`     | PacketLiteral or null     | 書かれた共通値。              |
| `textAfter` | list of PacketIgnoredText | 可視 EOL 前の hidden 接尾辞。 |

value は title と一つだけの ASCII space/tab の後から行値の末尾までで、
残る padding をすべて保持する。
区切りがない場合、または共通の除去後に内容が残らない場合は null とする。
二個目の区切りは空白の literal である。 [fixture: packet/title-empty]
[fixture: packet/lex-title-one-space] [fixture: packet/lex-title-one-tab]
[fixture: packet/lex-title-two-spaces]
[fixture: packet/lex-title-directive-only]
[fixture: packet/hidden-directive-title-eof]

子の欄: `value`、`textAfter`。
範囲は title から最後の値の文字、null なら keywordまでで、
最後の textAfter があればそこまで広げ、EOL と無関係な外側 padding を除く。
最初の可視 EOL 前の hidden な形は textAfter、その後は body に属する。
反復・空の出現も別々に保つ。
native comment は共有 Comment とし、 hidden な接尾辞の要素にはしない。
[fixture: packet/title-empty] [fixture: packet/lex-title-one-space]
[fixture: packet/lex-title-one-tab] [fixture: packet/lex-title-two-spaces]
[fixture: packet/lex-title-directive-only]
[fixture: packet/hidden-directive-title-eof]
[fixture: packet/lex-hidden-after-visible-eol]
[fixture: packet/comment-block-description]

### PacketAccTitleStatement

| 欄          | 型                        | 意味                          |
| ----------- | ------------------------- | ----------------------------- |
| `value`     | PacketLiteral or null     | 書かれた共通値。              |
| `textAfter` | list of PacketIgnoredText | 可視 EOL 前の hidden 接尾辞。 |

value は colon 直後の行テキストで、両端の padding を保つ。
共通の除去後に内容が残らない場合だけ null とし、
空白だけのテキストは literal である。 [fixture: packet/acctitle-empty]
[fixture: packet/acctitle-repeat-empty]
[fixture: packet/lex-acctitle-directive-only]
[fixture: packet/hidden-directive-acctitle-eof]

子の欄: `value`、`textAfter`。
範囲は accTitle からcolon または最後の値の文字までで、
最後の textAfter があればそこまで広げ、EOL と無関係な外側 padding を除く。
最初の可視 EOL 前の hidden な形は textAfter、その後は body に属する。
反復・空の出現も別々に保つ。
native comment は共有 Comment とし、 hidden な接尾辞の要素にはしない。
[fixture: packet/acctitle-empty] [fixture: packet/acctitle-repeat-empty]
[fixture: packet/lex-acctitle-directive-only]
[fixture: packet/hidden-directive-acctitle-eof]
[fixture: packet/lex-hidden-after-visible-eol]
[fixture: packet/comment-block-description]

### PacketAccDescrStatement

| 欄          | 型                        | 意味                          |
| ----------- | ------------------------- | ----------------------------- |
| `value`     | PacketLiteral or null     | 書かれた共通値。              |
| `textAfter` | list of PacketIgnoredText | 可視 EOL 前の hidden 接尾辞。 |

value は colon 直後の行テキストで、両端の padding を保つ。
共通の除去後に内容が残らない場合だけ null とし、
空白だけのテキストは literal である。
colon の後の brace らしい内容もこの行形のままである。
[fixture: packet/accdescr-line-empty]
[fixture: packet/lex-accdescr-whitespace-only]
[fixture: packet/lex-accdescr-directive-only]
[fixture: packet/lex-description-colon-first]
[fixture: packet/hidden-directive-accdescr-eof]

子の欄: `value`、`textAfter`。
範囲は accDescr からcolon または最後の値の文字までで、
最後の textAfter があればそこまで広げ、EOL と無関係な外側 padding を除く。
最初の可視 EOL 前の hidden な形は textAfter、その後は body に属する。
反復・空の出現も別々に保つ。
native comment は共有 Comment とし、 hidden な接尾辞の要素にはしない。
[fixture: packet/accdescr-line-empty]
[fixture: packet/lex-accdescr-whitespace-only]
[fixture: packet/lex-accdescr-directive-only]
[fixture: packet/lex-description-colon-first]
[fixture: packet/hidden-directive-accdescr-eof]
[fixture: packet/lex-hidden-after-visible-eol]
[fixture: packet/comment-block-description]

### PacketAccDescrBlockStatement

| 欄          | 型                        | 意味                          |
| ----------- | ------------------------- | ----------------------------- |
| `value`     | PacketLiteral or null     | 書かれた共通値。              |
| `textAfter` | list of PacketIgnoredText | 可視 EOL 前の hidden 接尾辞。 |

value は brace の内側で、両端の共通空白だけを除く。
空白・共通 directive・comment region だけの内容は null である。
内部の字下げ、ソースの改行、裸の percent 行、quote、escape は原文を保つ。
最初の閉じ brace は必須なので closed の欄は不要である。
空のブロックもこの文になる。 [fixture: packet/gram-empty-description]
[fixture: packet/accdescr-block-lines]
[fixture: packet/lex-description-whitespace-only]
[fixture: packet/lex-description-directive-only]
[fixture: packet/lex-description-comment-only]
[fixture: packet/common-block-bare] [fixture: packet/accdescr-block-open]
[fixture: packet/hidden-directive-description-eof]

子の欄: `value`、`textAfter`。
範囲は accDescr から最初の閉じ braceまでで、
最後の textAfter があればそこまで広げ、EOL と無関係な外側 padding を除く。
最初の可視 EOL 前の hidden な形は textAfter、その後は body に属する。
反復・空の出現も別々に保つ。
native comment は共有 Comment とし、 hidden な接尾辞の要素にはしない。
[fixture: packet/gram-empty-description] [fixture: packet/accdescr-block-lines]
[fixture: packet/lex-description-whitespace-only]
[fixture: packet/lex-description-directive-only]
[fixture: packet/lex-description-comment-only]
[fixture: packet/common-block-bare] [fixture: packet/accdescr-block-open]
[fixture: packet/hidden-directive-description-eof]
[fixture: packet/lex-hidden-after-visible-eol]
[fixture: packet/comment-block-description]

### PacketLiteral

| 欄      | 型     | 意味                       |
| ------- | ------ | -------------------------- |
| `value` | string | 書かれた共通値のテキスト。 |

子の欄はありません。
範囲は文で定めた値の最初から最後のソース文字までで、内部の共通 trivia をまたぐ。
null に空の literal は作らない。
共通 directive、comment region、選ばれた semicolon を除き、ほかの改行、quote、
entity、escape の綴りはすべて保つ。
空白の圧縮や escape の復号はしない。
quote らしい共通テキストも PacketLiteral のままで、 quote の閉じは不要である。
[fixture: packet/common-whitespace] [fixture: packet/common-block-comment]
[fixture: packet/directive-title-value]
[fixture: packet/directive-description-value] [fixture: packet/style-title]
[fixture: packet/html-all-fields] [fixture: packet/entity-all-text]
[fixture: packet/title-open-quote] [fixture: packet/accdescr-block-quoted]
[fixture: packet/accdescr-block-lines]

### PacketIgnoredText

| 欄      | 型     | 意味                              |
| ------- | ------ | --------------------------------- |
| `kind`  | string | yaml-block または directive。     |
| `value` | string | 空でない書かれた fence 付きの形。 |

子の欄はありません。
範囲は `---` または `%%{` の開始から条件を満たす閉じまでで、
前の padding と閉じの直後に消費した行終端を除く。
内部のソースの改行と padding は保持する。
追加 LF はソースの範囲・値に入らない。
両形とも閉じが必須なので closed は不要であり、
空の本文でも fence を含む値は空でない。
[fixture: packet/hidden-yaml-adjacent-eof] [fixture: packet/hidden-yaml-padding]
[fixture: packet/hidden-directive-header]
[fixture: packet/hidden-directive-block-eof]
[fixture: packet/hidden-yaml-block-eof] [fixture: packet/hidden-directive-cr]
[fixture: packet/hidden-directive-crlf] [fixture: packet/hidden-yaml-cr]
[fixture: packet/hidden-yaml-crlf] [fixture: packet/lex-yaml-body-separators]
[fixture: packet/lex-directive-body-separators]

範囲は内部の共通 directive、comment region、選ばれた semicolon をまたぐが、
value からはそれらを除く。
形全体に frontmatter・設定の効果はない。
内部の認識された global directive は独立した効果を保つ。
directive らしい一致が失敗すると共有 Comment になる場合がある。
先行する文字列・共通値は内部の hidden らしいテキストを所有する。
[fixture: packet/detect-one-block]
[fixture: packet/detect-yaml-properties-ignored]
[fixture: packet/lex-hidden-nested-global]
[fixture: packet/lex-yaml-common-comment]
[fixture: packet/detect-second-scan-directive]
[fixture: packet/lex-yaml-opener-global]
[fixture: packet/lex-yaml-fence-selected]
[fixture: packet/lex-hidden-opener-selected]
[fixture: packet/hidden-directive-close-glued]
[fixture: packet/hidden-yaml-in-label]
[fixture: packet/hidden-yaml-in-description]
[fixture: packet/hidden-yaml-title-absorbed]

各一致全体は textBeforeHeader、body、
対応する文の隙間・接尾辞のいずれかに一度だけ属し、
共有の frontmatter/directive データとして重複させない。
範囲は[字句規則](../diagrams/packet.md#hidden-forms)で定める。
本文ありの YAML は三本の fence を一つにし得て、
非空の二ブロックは別々に残り得る。 [fixture: packet/detect-one-block]
[fixture: packet/detect-yaml-properties-ignored]
[fixture: packet/gram-hidden-gap] [fixture: packet/gram-hidden-range-gap-spaced]
[fixture: packet/gram-hidden-yaml-gap]
[fixture: packet/gram-relative-hidden-colon]
[fixture: packet/lex-hidden-two-suffixes]
[fixture: packet/hidden-yaml-adjacent-later]
[fixture: packet/lex-yaml-two-nonempty]

## 例

次の書かれた例は三つの別のブロックノードを示す。
空白は書かれた形を分かりやすくするために示す。 [fixture: packet/gram-mixed]

```mmd
packet
+2: "two"
2: "single"
3-5: "range"
```

PacketDiagram.body は、count.raw が `2` の PacketRelativeBlockStatement、
start.raw が `2` の PacketSingleBlockStatement、 start.raw が `3`、
end.raw が `5` の PacketRangeBlockStatement の順となる。
相対ノードに start/end、単一ノードに end は合成しない。
範囲は公開が複数行にわたっても一つのノードのままである。
[fixture: packet/gram-mixed] [fixture: packet/db-row-split]
