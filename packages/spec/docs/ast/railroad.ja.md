# Railroad のノード

英語版: [railroad.md](./railroad.md)

この文書は `railroad`、`railroadEbnf`、`railroadAbnf`、
`railroadPeg` に共通する 1 個の原文の木を定義する。
共有ノードと不変条件は [ast.md](../ast.md)、
構文と受理は [diagrams/railroad.md](../diagrams/railroad.md) で定める。
欄は書かれた値を保ち、省略した値は null、list は source 順とする。
以下の子の欄は訪問順を示す。 [fixture: railroad/ir-gram-written-tree]
[fixture: railroad/ebnf-gram-written-tree]
[fixture: railroad/abnf-gram-written-tree]
[fixture: railroad/peg-gram-written-tree]

Identifier は書かれた名前を保つ。
StringLiteral.value は共通 trivia を除いた書かれた内部で、escape を解かない。
raw は元の引用符、escape の綴り、source の改行、内部の共通 trivia を保ち、
closed は true とする。
空文字列もノードとして保つ。
ABNF の十進 count は共有の NumericLiteral の定義に従い、全桁を raw に保つ。
省略した bound は null で、 0 を合成しない。
[fixture: railroad/ir-db-empty-strings] [fixture: railroad/ebnf-db-empty-string]
[fixture: railroad/abnf-db-empty-string] [fixture: railroad/peg-db-empty-string]
[fixture: railroad/ir-lex-string-conversion]
[fixture: railroad/ebnf-lex-string-conversion]
[fixture: railroad/abnf-lex-string-conversion]
[fixture: railroad/peg-lex-string-conversion]
[fixture: railroad/abnf-db-repeat-leading-zero]
[fixture: railroad/abnf-db-repeat-precision]
[fixture: railroad/abnf-db-repeat-overflow]
[fixture: railroad/abnf-gram-written-tree]

RailroadExpression は選んだ方言で許す式を指す。
IR は 8 個の Call 型だけを許す。
自然記法の方言は Identifier と StringLiteral を wrapper なしで直接許し、
さらに次の式ノードを許す。
EBNF は choice、sequence、group、optional group、repetition group、 postfix、
exception、special sequence。
ABNF は choice、sequence、group、optional group、repeat、numeric value。
PEG は choice、sequence、group、postfix、predicate、any expression。
RailroadRepeatRange と RailroadExpressionMember は式の子で、独立した式ではない。
[fixture: railroad/ir-gram-written-tree]
[fixture: railroad/ebnf-gram-written-tree]
[fixture: railroad/abnf-gram-written-tree]
[fixture: railroad/peg-gram-written-tree]

## ノード

### RailroadDiagram

| 欄                 | 型                          | 意味                                          |
| ------------------ | --------------------------- | --------------------------------------------- |
| `textBeforeHeader` | RailroadIgnoredText の list | 見出しの前に残る native form。                |
| `body`             | RailroadBodyItem の list    | 書かれた全 statement と body の hidden form。 |

子の欄: `textBeforeHeader`、`body`。
範囲: 見出し前に残る最初の opener、なければ見出しの先頭から、最後の body item、
body が空なら見出しの末尾まで。
その端点の外の無関係な padding、Comment、付加 LF を除く。
[fixture: railroad/ir-header-only] [fixture: railroad/ebnf-header-only]
[fixture: railroad/abnf-header-only] [fixture: railroad/peg-header-only]
[fixture: railroad/ir-secondscan-real]
[fixture: railroad/ir-yaml-before-secondscan-real]
[fixture: railroad/ir-native-ownership]

方言は Root.diagramType だけで選び、dialect、header、alias の欄は作らない。
RailroadBodyItem は RailroadRule、RailroadTitleStatement、
RailroadAccTitleStatement、RailroadAccDescrStatement、
RailroadAccDescrBlockStatement、RailroadIgnoredText。
空や上書きされる metadata、重複規則、末尾の native form もすべて保つ。
空行と Comment は body item を作らない。
metadata は最初の規則より前に限る。 [fixture: railroad/ir-common-repeat-empty]
[fixture: railroad/ebnf-common-repeat-empty]
[fixture: railroad/abnf-common-repeat-empty]
[fixture: railroad/peg-common-repeat-empty] [fixture: railroad/ir-db-duplicates]
[fixture: railroad/ir-hidden-directive-eof]
[fixture: railroad/ebnf-metadata-after-rule-acctitle]
[fixture: railroad/abnf-metadata-after-rule-acctitle]
[fixture: railroad/peg-metadata-after-rule-acctitle]

### RailroadRule

| 欄                     | 型                          | 意味                       |
| ---------------------- | --------------------------- | -------------------------- |
| `name`                 | Identifier                  | 書かれた宣言名。           |
| `textBeforeOperator`   | RailroadIgnoredText の list | 名前と代入記号の間。       |
| `textBeforeDefinition` | RailroadIgnoredText の list | 代入記号の後。             |
| `definition`           | RailroadExpression          | 書かれた式の全体。         |
| `textBeforeTerminator` | RailroadIgnoredText の list | visible なセミコロンの前。 |

子の欄: `name`、`textBeforeOperator`、`textBeforeDefinition`、`definition`、
`textBeforeTerminator`。
範囲: 名前の先頭から必須の visible なセミコロンまで。
代入記号の綴り `=`、`::=`、`<-` は token に保つ。
そのセミコロン後の hidden form はこの規則でなく body に属する。
[fixture: railroad/ir-native-ownership]
[fixture: railroad/ebnf-native-ownership]
[fixture: railroad/abnf-native-ownership]
[fixture: railroad/peg-native-ownership]
[fixture: railroad/abnf-comment-terminator-control]

### RailroadTitleStatement

| 欄      | 型                          | 意味                    |
| ------- | --------------------------- | ----------------------- |
| `value` | RailroadLiteral または null | 書かれた共通値の text。 |

子の欄: `value`。
範囲: title から値の最後の字まで、値が null なら keyword の末尾まで。
1 個の ASCII space/tab の separator は value の外。
文を終える改行と外側の padding は除く。
後続の native form は別の body item とする。
[fixture: railroad/ir-common-whitespace-shapes]
[fixture: railroad/ebnf-common-whitespace-shapes]
[fixture: railroad/abnf-common-whitespace-shapes]
[fixture: railroad/peg-common-whitespace-shapes]
[fixture: railroad/ir-gram-written-tree] [fixture: railroad/ir-common-title-eof]
[fixture: railroad/ir-hidden-after-title]

value は title とちょうど 1 個の ASCII space/tab の後で始め、
残りの padding は保つ。
separator がないか、共通の除去後に内容がなければ null。
2 個目の space は whitespace literal となる。
[fixture: railroad/ir-common-whitespace-shapes]
[fixture: railroad/ebnf-common-whitespace-shapes]
[fixture: railroad/abnf-common-whitespace-shapes]
[fixture: railroad/peg-common-whitespace-shapes]
[fixture: railroad/ir-title-value-directive-only]
[fixture: railroad/ir-title-value-comment-only]
[fixture: railroad/ir-common-repeat-empty]

### RailroadAccTitleStatement

| 欄      | 型                          | 意味                    |
| ------- | --------------------------- | ----------------------- |
| `value` | RailroadLiteral または null | 書かれた共通値の text。 |

子の欄: `value`。
範囲: accTitle から、null なら colon、値があれば行値の最後の字まで。
文を終える改行と外側の padding は除く。
後続の native form は別の body item とする。
[fixture: railroad/ir-common-whitespace-shapes]
[fixture: railroad/ebnf-common-whitespace-shapes]
[fixture: railroad/abnf-common-whitespace-shapes]
[fixture: railroad/peg-common-whitespace-shapes]
[fixture: railroad/ir-gram-written-tree]
[fixture: railroad/ir-hidden-after-acctitle]
[fixture: railroad/ir-common-acctitle-eof]

value は colon の直後の行の text で、両端の padding も保つ。
共通の除去後に内容がなければ null で、 whitespace-only の text は literal。
[fixture: railroad/ir-common-whitespace-shapes]
[fixture: railroad/ebnf-common-whitespace-shapes]
[fixture: railroad/abnf-common-whitespace-shapes]
[fixture: railroad/peg-common-whitespace-shapes]
[fixture: railroad/ir-acctitle-value-directive-only]
[fixture: railroad/ir-acctitle-value-comment-only]
[fixture: railroad/ir-common-repeat-empty]

### RailroadAccDescrStatement

| 欄      | 型                          | 意味                    |
| ------- | --------------------------- | ----------------------- |
| `value` | RailroadLiteral または null | 書かれた共通値の text。 |

子の欄: `value`。
範囲: accDescr から、null なら colon、値があれば行値の最後の字まで。
文を終える改行と外側の padding は除く。
後続の native form は別の body item とする。
[fixture: railroad/ir-common-whitespace-shapes]
[fixture: railroad/ebnf-common-whitespace-shapes]
[fixture: railroad/abnf-common-whitespace-shapes]
[fixture: railroad/peg-common-whitespace-shapes]
[fixture: railroad/ir-gram-written-tree]
[fixture: railroad/ir-hidden-after-description]
[fixture: railroad/ir-common-description-eof]

value は colon の直後の行の text で、whitespace-only も含め padding を保つ。
共通の除去後に内容がなければ null。
brace に見える内容も行値のまま。 [fixture: railroad/ir-common-whitespace-shapes]
[fixture: railroad/ebnf-common-whitespace-shapes]
[fixture: railroad/abnf-common-whitespace-shapes]
[fixture: railroad/peg-common-whitespace-shapes]
[fixture: railroad/ir-accdescr-line-value-directive-only]
[fixture: railroad/ir-accdescr-line-value-comment-only]
[fixture: railroad/ir-common-repeat-empty]

### RailroadAccDescrBlockStatement

| 欄      | 型                          | 意味                    |
| ------- | --------------------------- | ----------------------- |
| `value` | RailroadLiteral または null | 書かれた共通値の text。 |

子の欄: `value`。
範囲: accDescr から必須の最初の closing brace まで。
value が null でも両方の brace を含む。
文を終える改行と外側の padding は除く。
後続の native form は別の body item とする。
[fixture: railroad/ir-common-whitespace-shapes]
[fixture: railroad/ebnf-common-whitespace-shapes]
[fixture: railroad/abnf-common-whitespace-shapes]
[fixture: railroad/peg-common-whitespace-shapes]
[fixture: railroad/ir-gram-written-tree]
[fixture: railroad/ir-hidden-after-block]
[fixture: railroad/ir-common-block-empty-interleaved]

value は brace の内部の、外端の共通 Notation の空白だけを除いたもの。
空、whitespace-only、共通 directive だけ、comment region だけの内容は null。
内部の padding、引用符、escape、source 改行は保つ。
closer は必須で、 closed の欄は要らない。
[fixture: railroad/ir-common-whitespace-shapes]
[fixture: railroad/ebnf-common-whitespace-shapes]
[fixture: railroad/abnf-common-whitespace-shapes]
[fixture: railroad/peg-common-whitespace-shapes]
[fixture: railroad/ir-common-block-directive-only]
[fixture: railroad/ir-common-block-comment-only]
[fixture: railroad/ir-common-repeat-empty]

### RailroadLiteral

| 欄      | 型     | 意味                        |
| ------- | ------ | --------------------------- |
| `value` | string | 書かれた metadata の text。 |

子の欄はありません。
範囲: その metadata の値が所有する source の最初から最後の字までで、
内部の共通 trivia も跨ぐ。
value からは共通 directive、comment region、選ばれたセミコロンを除き、
それ以外の書かれた字をすべて保つ。
引用符があっても StringLiteral にはせず、閉じない引用符に見える値も literal。
[fixture: railroad/ir-common-title-open-quote]
[fixture: railroad/ir-common-quotes-whitespace]
[fixture: railroad/ir-common-quoted-title-escape]
[fixture: railroad/ebnf-common-quoted-title-escape]
[fixture: railroad/abnf-common-quoted-title-escape]
[fixture: railroad/peg-common-quoted-title-escape]
[fixture: railroad/ir-common-block-directive]
[fixture: railroad/ir-common-block-comment]

### RailroadIgnoredText

| 欄      | 型     | 意味                             |
| ------- | ------ | -------------------------------- |
| `kind`  | string | yaml-block または directive。    |
| `value` | string | fence を含む空でない書かれた形。 |

子の欄はありません。
範囲: 認識した `---` または `%%{` の opener から選ばれた closer まで。
先行 padding と消費した直後の LF を除き、付加 LF は source の内容にしない。
source の改行と内部 padding を保つ。
value は内部の共通 directive、comment region、選ばれたセミコロンを除くが、
range はそれらも跨ぐ。 [fixture: railroad/ir-hidden-yaml-adjacent-later]
[fixture: railroad/ir-hidden-yaml-adjacent-eof]
[fixture: railroad/ir-hidden-yaml-crlf]
[fixture: railroad/ir-hidden-directive-eof]
[fixture: railroad/ir-native-directive-adjacent]
[fixture: railroad/ir-secondscan-real]
[fixture: railroad/ir-secondscan-multiline]
[fixture: railroad/ir-native-ownership]

native YAML は yaml-block、native DIRECTIVE は directive とする。
空の fenced body も含め、whole match を 1 回ずつ保つ。
1 回で消費する 3 fence は 1 ノード。
native comment と検出が通過した bare line は代わりに共有 Comment record を使う。
先行する値が囲んだ hidden に見える内容には ignored-text の子を作らない。
[fixture: railroad/ir-hidden-yaml-adjacent-later]
[fixture: railroad/ir-prefix-retained-directive]
[fixture: railroad/ir-comment-bare-percent-body]
[fixture: railroad/ir-hidden-directive-string]
[fixture: railroad/ebnf-enclosing-string-hidden]
[fixture: railroad/abnf-enclosing-string-hidden]
[fixture: railroad/peg-enclosing-string-hidden]

### RailroadExpressionMember

| 欄           | 型                          | 意味                          |
| ------------ | --------------------------- | ----------------------------- |
| `textBefore` | RailroadIgnoredText の list | list 内でこの式の前にある形。 |
| `expression` | RailroadExpression          | 書かれた member の式。        |
| `textAfter`  | RailroadIgnoredText の list | list 内でこの式の後にある形。 |

子の欄: `textBefore`、`expression`、`textAfter`。
範囲: 所有する最初の textBefore、なければ式の先頭から、
所有する最後の textAfter、なければ式の末尾まで。
list の separator は含めない。
所有は後述の Gap ownership に従い、別の式の層や句読点の node を作らない。
[fixture: railroad/ir-native-ownership]
[fixture: railroad/ebnf-native-ownership]
[fixture: railroad/abnf-native-ownership]
[fixture: railroad/peg-native-ownership]

### RailroadSequenceCall

| 欄               | 型                               | 意味                                      |
| ---------------- | -------------------------------- | ----------------------------------------- |
| `textBeforeOpen` | RailroadIgnoredText の list      | constructor と opening parenthesis の間。 |
| `arguments`      | RailroadExpressionMember の list | 書かれた 1 個以上の IR 引数。             |

子の欄: `textBeforeOpen`、`arguments`。
範囲: sequence から closing parenthesis まで。
1 引数でもこの call を保ち、comma は句読点として残す。
opening/closing delimiter の内側の形は argument member が所有する。
[fixture: railroad/ir-gram-written-tree] [fixture: railroad/ir-db-singletons]
[fixture: railroad/ir-native-ownership]

末尾の comma に次の引数が続かない形は拒否し、完成した sequence call を作らない。
[fixture: railroad/ir-error-prefix]

### RailroadChoiceCall

| 欄               | 型                               | 意味                                      |
| ---------------- | -------------------------------- | ----------------------------------------- |
| `textBeforeOpen` | RailroadIgnoredText の list      | constructor と opening parenthesis の間。 |
| `arguments`      | RailroadExpressionMember の list | 書かれた 1 個以上の IR 引数。             |

子の欄: `textBeforeOpen`、`arguments`。
範囲: choice から closing parenthesis まで。
1 引数でもこの call を保ち、comma は句読点として残す。
opening/closing delimiter の内側の形は argument member が所有する。
[fixture: railroad/ir-gram-written-tree] [fixture: railroad/ir-db-singletons]
[fixture: railroad/ir-choice-native-ownership]

末尾の comma に次の引数が続かない形は拒否し、完成した choice call を作らない。
[fixture: railroad/ir-choice-trailing-comma]

### RailroadOptionalCall

| 欄                  | 型                          | 意味                        |
| ------------------- | --------------------------- | --------------------------- |
| `textBeforeOpen`    | RailroadIgnoredText の list | opening parenthesis の前。  |
| `textBeforeElement` | RailroadIgnoredText の list | opening parenthesis の後。  |
| `element`           | RailroadExpression          | 書かれた単一の IR operand。 |
| `textBeforeClose`   | RailroadIgnoredText の list | closing parenthesis の前。  |

子の欄: `textBeforeOpen`、`textBeforeElement`、`element`、`textBeforeClose`。
範囲: optional から必須の closing parenthesis まで。
両方の括弧は token で、operand はちょうど 1 個の IR の式。
この call は postfix や bracket/brace の形とは別に保つ。
[fixture: railroad/ir-gram-written-tree] [fixture: railroad/ir-native-ownership]
[fixture: railroad/ir-error-empty-optional]
[fixture: railroad/ir-error-extra-optional]

### RailroadOneOrMoreCall

| 欄                  | 型                          | 意味                        |
| ------------------- | --------------------------- | --------------------------- |
| `textBeforeOpen`    | RailroadIgnoredText の list | opening parenthesis の前。  |
| `textBeforeElement` | RailroadIgnoredText の list | opening parenthesis の後。  |
| `element`           | RailroadExpression          | 書かれた単一の IR operand。 |
| `textBeforeClose`   | RailroadIgnoredText の list | closing parenthesis の前。  |

子の欄: `textBeforeOpen`、`textBeforeElement`、`element`、`textBeforeClose`。
範囲: oneOrMore から必須の closing parenthesis まで。
両方の括弧は token で、operand はちょうど 1 個の IR の式。
この call は postfix や bracket/brace の形とは別に保つ。
[fixture: railroad/ir-gram-written-tree]
[fixture: railroad/ir-error-empty-oneormore]
[fixture: railroad/ir-error-extra-oneormore]

### RailroadZeroOrMoreCall

| 欄                  | 型                          | 意味                        |
| ------------------- | --------------------------- | --------------------------- |
| `textBeforeOpen`    | RailroadIgnoredText の list | opening parenthesis の前。  |
| `textBeforeElement` | RailroadIgnoredText の list | opening parenthesis の後。  |
| `element`           | RailroadExpression          | 書かれた単一の IR operand。 |
| `textBeforeClose`   | RailroadIgnoredText の list | closing parenthesis の前。  |

子の欄: `textBeforeOpen`、`textBeforeElement`、`element`、`textBeforeClose`。
範囲: zeroOrMore から必須の closing parenthesis まで。
両方の括弧は token で、operand はちょうど 1 個の IR の式。
この call は postfix や bracket/brace の形とは別に保つ。
[fixture: railroad/ir-gram-written-tree]
[fixture: railroad/ir-error-empty-zeroormore]
[fixture: railroad/ir-error-extra-zeroormore]

### RailroadTerminalCall

| 欄                | 型                          | 意味                             |
| ----------------- | --------------------------- | -------------------------------- |
| `textBeforeOpen`  | RailroadIgnoredText の list | opening parenthesis の前。       |
| `textBeforeValue` | RailroadIgnoredText の list | 引用引数の前。                   |
| `value`           | StringLiteral               | 空文字列も含め、単一の引用引数。 |
| `textBeforeClose` | RailroadIgnoredText の list | closing parenthesis の前。       |

子の欄: `textBeforeOpen`、`textBeforeValue`、`value`、`textBeforeClose`。
範囲: terminal から必須の closing parenthesis まで。
StringLiteral の range は元の引用符を含む。
call を Identifier、裸の文字列、正規化した terminal node に置き換えない。
[fixture: railroad/ir-gram-written-tree] [fixture: railroad/ir-db-empty-strings]
[fixture: railroad/ir-native-ownership]
[fixture: railroad/ir-lex-string-conversion]

### RailroadNonterminalCall

| 欄                | 型                          | 意味                             |
| ----------------- | --------------------------- | -------------------------------- |
| `textBeforeOpen`  | RailroadIgnoredText の list | opening parenthesis の前。       |
| `textBeforeName`  | RailroadIgnoredText の list | 引用引数の前。                   |
| `name`            | StringLiteral               | 空文字列も含め、単一の引用引数。 |
| `textBeforeClose` | RailroadIgnoredText の list | closing parenthesis の前。       |

子の欄: `textBeforeOpen`、`textBeforeName`、`name`、`textBeforeClose`。
範囲: nonterminal から必須の closing parenthesis まで。
StringLiteral の range は元の引用符を含む。
call を Identifier、裸の文字列、正規化した terminal node に置き換えない。
[fixture: railroad/ir-gram-written-tree] [fixture: railroad/ir-db-empty-strings]
[fixture: railroad/ir-native-ownership]
[fixture: railroad/ir-lex-string-conversion]
[fixture: railroad/ir-error-extra-nonterminal]

### RailroadSpecialCall

| 欄                | 型                          | 意味                             |
| ----------------- | --------------------------- | -------------------------------- |
| `textBeforeOpen`  | RailroadIgnoredText の list | opening parenthesis の前。       |
| `textBeforeText`  | RailroadIgnoredText の list | 引用引数の前。                   |
| `text`            | StringLiteral               | 空文字列も含め、単一の引用引数。 |
| `textBeforeClose` | RailroadIgnoredText の list | closing parenthesis の前。       |

子の欄: `textBeforeOpen`、`textBeforeText`、`text`、`textBeforeClose`。
範囲: special から必須の closing parenthesis まで。
StringLiteral の range は元の引用符を含む。
call を Identifier、裸の文字列、正規化した terminal node に置き換えない。
[fixture: railroad/ir-gram-written-tree] [fixture: railroad/ir-db-empty-strings]
[fixture: railroad/ir-lex-string-conversion]
[fixture: railroad/ir-error-extra-special]

### RailroadChoiceExpression

| 欄             | 型                               | 意味                        |
| -------------- | -------------------------------- | --------------------------- |
| `alternatives` | RailroadExpressionMember の list | 書かれた 2 個以上の選択肢。 |

子の欄: `alternatives`。
範囲: 最初の式の先頭から最後の式の末尾まで。
EBNF の縦棒、ABNF/PEG の slash は token に、選択肢の順序はすべて保つ。
1 選択肢はこの wrapper を作らずその式とし、 IR の choice call は別の型を使う。
[fixture: railroad/ebnf-gram-written-tree]
[fixture: railroad/abnf-gram-written-tree]
[fixture: railroad/peg-gram-written-tree] [fixture: railroad/ebnf-db-singletons]
[fixture: railroad/abnf-db-singletons] [fixture: railroad/peg-db-singletons]
[fixture: railroad/ebnf-native-ownership]
[fixture: railroad/abnf-native-ownership]
[fixture: railroad/peg-native-ownership]

### RailroadSequenceExpression

| 欄         | 型                               | 意味                            |
| ---------- | -------------------------------- | ------------------------------- |
| `elements` | RailroadExpressionMember の list | 書かれた 2 個以上の並びの要素。 |

子の欄: `elements`。
範囲: 最初の式の先頭から最後の式の末尾まで。
EBNF の任意の comma は句読点として保ち、隣接を合成 comma に置き換えない。
1 要素はこの wrapper を作らずその式とし、 IR の sequence call は別に保つ。
[fixture: railroad/ebnf-gram-written-tree]
[fixture: railroad/abnf-gram-written-tree]
[fixture: railroad/peg-gram-written-tree] [fixture: railroad/ebnf-db-singletons]
[fixture: railroad/abnf-db-singletons] [fixture: railroad/peg-db-singletons]
[fixture: railroad/ebnf-native-ownership]
[fixture: railroad/abnf-native-ownership]
[fixture: railroad/peg-native-ownership]

### RailroadGroupExpression

| 欄                  | 型                          | 意味                   |
| ------------------- | --------------------------- | ---------------------- |
| `textBeforeElement` | RailroadIgnoredText の list | opener の後。          |
| `element`           | RailroadExpression          | 空でない内側の式全体。 |
| `textBeforeClose`   | RailroadIgnoredText の list | closer の前。          |

子の欄: `textBeforeElement`、`element`、`textBeforeClose`。
範囲: `(` から必須の `)` まで。
EBNF, ABNF and PEG で許す形。
両方の delimiter は token として保ち、内側の式が 1 葉でもこのノードを残す。
空の内側の式と closer の欠落は許さない。
[fixture: railroad/ebnf-gram-written-tree]
[fixture: railroad/abnf-gram-written-tree]
[fixture: railroad/peg-gram-written-tree] [fixture: railroad/ebnf-db-singletons]
[fixture: railroad/abnf-db-singletons] [fixture: railroad/peg-db-singletons]
[fixture: railroad/ebnf-native-ownership]
[fixture: railroad/abnf-native-ownership]
[fixture: railroad/peg-native-ownership]

### RailroadOptionalGroupExpression

| 欄                  | 型                          | 意味                   |
| ------------------- | --------------------------- | ---------------------- |
| `textBeforeElement` | RailroadIgnoredText の list | opener の後。          |
| `element`           | RailroadExpression          | 空でない内側の式全体。 |
| `textBeforeClose`   | RailroadIgnoredText の list | closer の前。          |

子の欄: `textBeforeElement`、`element`、`textBeforeClose`。
範囲: `[` から必須の `]` まで。
EBNF and ABNF で許す形。
両方の delimiter は token として保ち、内側の式が 1 葉でもこのノードを残す。
空の内側の式と closer の欠落は許さない。
[fixture: railroad/ebnf-gram-written-tree]
[fixture: railroad/abnf-gram-written-tree]
[fixture: railroad/ebnf-native-ownership]
[fixture: railroad/abnf-native-ownership]

### RailroadRepetitionGroupExpression

| 欄                  | 型                          | 意味                   |
| ------------------- | --------------------------- | ---------------------- |
| `textBeforeElement` | RailroadIgnoredText の list | opener の後。          |
| `element`           | RailroadExpression          | 空でない内側の式全体。 |
| `textBeforeClose`   | RailroadIgnoredText の list | closer の前。          |

子の欄: `textBeforeElement`、`element`、`textBeforeClose`。
範囲: `{` から必須の `}` まで。
EBNF で許す形。
両方の delimiter は token として保ち、内側の式が 1 葉でもこのノードを残す。
空の内側の式と closer の欠落は許さない。
[fixture: railroad/ebnf-gram-written-tree]
[fixture: railroad/ebnf-native-ownership]

### RailroadPostfixExpression

| 欄                   | 型                          | 意味               |
| -------------------- | --------------------------- | ------------------ |
| `element`            | RailroadExpression          | 先行する operand。 |
| `textBeforeOperator` | RailroadIgnoredText の list | 後置記号の前。     |
| `operator`           | string                      | ?、*、+ のどれか。 |

子の欄: `element`、`textBeforeOperator`。
範囲: operand の先頭から後置記号まで。
EBNF の後置列は書かれた順に左から入れ子にし、PEG はこの層で 1 suffix まで。
記号は operator の欄と token の両方に保つ。
IR call、optional group、 brace の repetition とは別の型である。
[fixture: railroad/ebnf-gram-written-tree]
[fixture: railroad/peg-gram-written-tree]
[fixture: railroad/ebnf-db-postfix-order]
[fixture: railroad/ebnf-exception-leftfold]
[fixture: railroad/peg-gram-double-suffix]
[fixture: railroad/ebnf-native-ownership]
[fixture: railroad/peg-native-ownership]

### RailroadExceptionExpression

| 欄                   | 型                          | 意味                      |
| -------------------- | --------------------------- | ------------------------- |
| `left`               | RailroadExpression          | 先行する EBNF term の式。 |
| `textBeforeOperator` | RailroadIgnoredText の list | minus の前。              |
| `textBeforeRight`    | RailroadIgnoredText の list | minus の後。              |
| `right`              | RailroadExpression          | EBNF primary に限る。     |

子の欄: `left`、`textBeforeOperator`、`textBeforeRight`、`right`。
範囲: left の先頭から right の末尾までで、minus token も含む。
literal dash を挟む合成の並びでなく、書かれた例外を保つ。
後の postfix と例外は書かれた順でこの式の外側を包む。
名前の内部の hyphen はその Identifier の一部のままである。
[fixture: railroad/ebnf-gram-written-tree]
[fixture: railroad/ebnf-exception-dash-name]
[fixture: railroad/ebnf-exception-leftfold]
[fixture: railroad/ebnf-db-postfix-order]
[fixture: railroad/ebnf-native-ownership]

### RailroadSpecialSequence

| 欄      | 型     | 意味                                        |
| ------- | ------ | ------------------------------------------- |
| `value` | string | 両端の question mark を除いた書かれた内部。 |

子の欄はありません。
範囲: opening question mark から必須の closing question mark まで。
value はその delimiter と共通 trivia だけを除き、外端と内部の空白、source 改行、
引用符、backslash を trim/decode せず保つ。
字句規則は non-whitespace の内容を要求するので、空の値のノードは作らない。
[fixture: railroad/ebnf-special-whitespace]
[fixture: railroad/ebnf-special-empty]
[fixture: railroad/ebnf-special-whitespace-only]
[fixture: railroad/ebnf-special-adjacent]
[fixture: railroad/ebnf-hidden-directive-special]
[fixture: railroad/ebnf-directive-string]

### RailroadRepeatExpression

| 欄                  | 型                                        | 意味                                    |
| ------------------- | ----------------------------------------- | --------------------------------------- |
| `repeat`            | NumericLiteral または RailroadRepeatRange | 書かれた exact count または star の形。 |
| `textBeforeElement` | RailroadIgnoredText の list               | 完成した repeat の後。                  |
| `element`           | RailroadExpression                        | 1 個の ABNF primary。                   |

子の欄: `repeat`、`textBeforeElement`、`element`。
範囲: 書かれた count または star の先頭から、その primary の末尾まで。
両端値が 0/1 回を表す場合もこの形を保ち、
optional group や正規化した汎用 repetition に置き換えない。
その primary は、 group なしでは別の repeat prefix を持てない。
[fixture: railroad/abnf-gram-written-tree]
[fixture: railroad/abnf-db-repeat-optional]
[fixture: railroad/abnf-db-repeat-implicit-optional]
[fixture: railroad/abnf-db-repeat-zero-padded-optional]
[fixture: railroad/abnf-db-repeat-zero] [fixture: railroad/abnf-native-in-atom]
[fixture: railroad/abnf-native-ownership]

### RailroadRepeatRange

| 欄        | 型                         | 意味                                |
| --------- | -------------------------- | ----------------------------------- |
| `minimum` | NumericLiteral または null | 書かれた下限 count。省略時は null。 |
| `maximum` | NumericLiteral または null | 書かれた上限 count。省略時は null。 |

子の欄: `minimum`、`maximum`。
範囲: 下限 count の最初の桁、省略時は star から、上限 count の最後の桁、
省略時は star まで。
star は句読点として保つ。
`*`、`0*`、`*1`、`00*01`、exact の `1` を区別する。
exact count にはこの型を使わない。
native whitespace と hidden form は部品を分断できないが、
完成した部品の間の共通 directive と選ばれたセミコロンは trivia となる。
[fixture: railroad/abnf-gram-written-tree]
[fixture: railroad/abnf-db-repeat-implicit-optional]
[fixture: railroad/abnf-db-repeat-zero-padded-optional]
[fixture: railroad/abnf-db-repeat-leading-zero]
[fixture: railroad/abnf-repeat-gap-star]
[fixture: railroad/abnf-directive-repeat]
[fixture: railroad/abnf-directive-repeat-star]
[fixture: railroad/abnf-native-in-atom]
[fixture: railroad/abnf-semicolon-repeat-before-star]
[fixture: railroad/abnf-semicolon-repeat-after-star]

### RailroadNumericValue

| 欄      | 型     | 意味                                  |
| ------- | ------ | ------------------------------------- |
| `value` | string | 書かれた percent-value の text 全体。 |

子の欄はありません。
範囲: percent sign から最後の十六進の字までで、内部の共通 trivia も跨ぐ。
value は base の字の case、全桁、dot、hyphen を保ち、共通 directive、
comment region、選ばれたセミコロンだけを除く。
専用の text の葉であり、 NumericLiteral や変換済み文字コードの list ではない。
[fixture: railroad/abnf-numval-boundaries]
[fixture: railroad/abnf-numval-suffix]
[fixture: railroad/abnf-directive-numval-prefix]
[fixture: railroad/abnf-directive-numval-digits]
[fixture: railroad/abnf-directive-numval-range]
[fixture: railroad/abnf-semicolon-numval-text]

### RailroadPredicateExpression

| 欄                  | 型                          | 意味                         |
| ------------------- | --------------------------- | ---------------------------- |
| `operator`          | string                      | & または !。                 |
| `textBeforeElement` | RailroadIgnoredText の list | 前置記号の後。               |
| `element`           | RailroadExpression          | PEG suffix の operand 全体。 |

子の欄: `textBeforeElement`、`element`。
範囲: 前置記号から suffix operand の末尾まで。
比較 Db が label だけを公開する場合も、 group、postfix、
内部の全 operand node を保つ。
2 個目の直接の prefix は許さず、別の predicate は書かれた group の内部に置ける。
[fixture: railroad/peg-gram-written-tree] [fixture: railroad/peg-db-predicates]
[fixture: railroad/peg-db-predicate-singleton-group]
[fixture: railroad/peg-db-predicate-predicate]
[fixture: railroad/peg-gram-double-prefix]
[fixture: railroad/peg-native-ownership]

### RailroadAnyExpression

子の欄はありません。
欄もありません。 [fixture: railroad/peg-gram-written-tree]
[fixture: railroad/peg-db-all-fields]

範囲: dot の 1 字だけ。
PEG のこの primary を StringLiteral や合成した special text にしない。
[fixture: railroad/peg-gram-written-tree] [fixture: railroad/peg-db-all-fields]

## Gap の所有

すべての textBefore/textAfter の欄は、
RailroadIgnoredText の source 順の list で、ない場合は空 list とする。
完成した native hidden form だけを所有し、空白と改行は source の隙間、
通常の comment は共有 Comment record として保つ。
hidden form は、以下の最も近い名前つき owner にちょうど 1 回置く。
式の core は、外側の欄が所有する hidden form まで範囲を延ばさない。
[fixture: railroad/ir-native-ownership]
[fixture: railroad/ebnf-native-ownership]
[fixture: railroad/abnf-native-ownership]
[fixture: railroad/peg-native-ownership]

見出し前の textBeforeHeader は、
検出で残る YAML と真の第二走査 directive だけを所有する。
通過した bare line とそれに伴う trivia は含めない。
見出し、完成した metadata の文、規則の終端記号の後の whole hidden form は、
直接 body に置く。
metadata の suffix の欄も visible EOL による所有規則もない。
規則内では、代入記号、定義、終端記号の前の形を規則の 3 gap が所有する。
[fixture: railroad/ir-secondscan-real]
[fixture: railroad/ir-prefix-retained-directive]
[fixture: railroad/ir-native-ownership]
[fixture: railroad/ebnf-native-ownership]
[fixture: railroad/abnf-native-ownership]
[fixture: railroad/peg-native-ownership]
[fixture: railroad/ir-hidden-after-title]
[fixture: railroad/ir-hidden-after-block]

各 call は opening parenthesis 前の形を textBeforeOpen に持つ。
単一 operand と引用引数の call は、opener の後と closer の前の形を専用欄に持つ。
sequence/choice call は内部の全形を member に持つ。
comma の前は前の member の textAfter、後は次の member の textBefore。
最初と最後の member は、 call の括弧のすぐ内側の形も持つ。
[fixture: railroad/ir-native-ownership]

自然記法の choice/sequence の list では、
明示した separator の前の形は前の member の textAfter、
後の形は次の member の textBefore に置く。
separator のない隣接では、隙間全体を次の member の textBefore に置き、
前の textAfter は空にする。
自然記法の最初の member の textBefore と最後の member の textAfter は空で、
その外側の gap は囲む group、規則、単項式が所有する。
list が入れ子の場合は、最も近い境目にこの規則を適用する。
[fixture: railroad/ebnf-native-ownership]
[fixture: railroad/abnf-native-ownership]
[fixture: railroad/peg-native-ownership]

group は delimiter の内側の 2 gap を持つ。
exception は minus の前後を所有する。
各 postfix は自分の演算子の前の gap だけを持ち、後の postfix は先行式を包む。
repeat は完成した count/range の後、predicate は prefix の後の gap を持つ。
repeat の部品の間には native gap を許さない。
共有 Directive と選ばれたセミコロンは、
node の range が跨いでも gap の子にしない。
[fixture: railroad/ebnf-native-ownership]
[fixture: railroad/abnf-native-ownership]
[fixture: railroad/peg-native-ownership] [fixture: railroad/abnf-native-in-atom]
[fixture: railroad/abnf-directive-repeat]
[fixture: railroad/abnf-semicolon-numval-text]

## 例

以下は木の構造を示すために意図して書いた例で、整形方法の決定ではない。
各 body は 6 item を持つ。
title、access title、行の access description、空の block access description、
空でない block access description、規則である。
空の block は value が null の文であり、hidden gap ではない。
以下の説明では共有の token/comment/directive の list を省く。
[fixture: railroad/ir-gram-written-tree]
[fixture: railroad/ebnf-gram-written-tree]
[fixture: railroad/abnf-gram-written-tree]
[fixture: railroad/peg-gram-written-tree]

### IR

```mmd
railroad-beta
title "Syntax"
accTitle: Rules
accDescr: Short
accDescr {}
accDescr { Details }
item = sequence(terminal("a\n"), nonterminal("item"), choice(special("note"), optional(terminal(""))), zeroOrMore(terminal("b")), oneOrMore(terminal("c")));
```

定義は 5 引数の RailroadSequenceCall。
RailroadTerminalCall、RailroadNonterminalCall、RailroadChoiceCall、
RailroadZeroOrMoreCall、RailroadOneOrMoreCall を持つ。
choice は RailroadSpecialCall と RailroadOptionalCall を持ち、
後者の子は空の StringLiteral を持つ terminal call。
すべての call と最初の文字列の書かれた backslash を保つ。
[fixture: railroad/ir-gram-written-tree]

### EBNF

```mmd
railroad-ebnf-beta
title "Syntax"
accTitle: Rules
accDescr: Short
accDescr {}
accDescr { Details }
item ::= ("a", name) - "b"+ | ["c"] { ? special ? } "d"?;
```

定義は 2 選択肢の RailroadChoiceExpression。
最初は、
RailroadExceptionExpression 全体を operator + で包む RailroadPostfixExpression。
left の group は comma の並び、right は文字列 "b"。
2 番目は 3 要素の並びで、optional group、
special sequence を持つ repetition group、後置 ? の文字列を持つ。
書かれた ::=、comma、すべての delimiter を token に保つ。
[fixture: railroad/ebnf-gram-written-tree]

### ABNF

```mmd
railroad-abnf-beta
title "Syntax"
accTitle: Rules
accDescr: Short
accDescr {}
accDescr { Details }
item = 002*004("a" / %X41.42-43) [other] 0*1"" 3"x" *"z";
```

定義は 5 要素の並び。
最初の RailroadRepeatExpression は、
両端値の raw が 002 と 004 の RailroadRepeatRange と group を持つ。
group 内の choice は文字列と、value が %X41.42-43 の RailroadNumericValue。
後は optional group、空文字列を持つ range repeat、exact-count repeat、
両端値を省略した repeat。
optional/repeat の構造を Db の等価な形に置き換えない。
[fixture: railroad/abnf-gram-written-tree]

### PEG

```mmd
railroad-peg-beta
title "Syntax"
accTitle: Rules
accDescr: Short
accDescr {}
accDescr { Details }
item <- &("a" / ref)+ !. "b"? "c"* (("d"));
```

定義は 5 要素の並び。
最初の 2 個は RailroadPredicateExpression。
& は choice を囲む group とその後置 +、! は RailroadAnyExpression を持つ。
次は後置 ? と * の文字列、最後は文字列を囲む 2 層の RailroadGroupExpression。
predicate の全 operand と、明示した singleton group の両方を木に保つ。
[fixture: railroad/peg-gram-written-tree]
