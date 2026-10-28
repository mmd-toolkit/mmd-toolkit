# Treemap のノード

英語版: [treemap.md](./treemap.md)

この文書は `treemap` と `treemap-beta` のソースの木を定義する。
共有のノードと不変条件は [ast.md](../ast.md)、
構文と受理は [diagrams/treemap.md](../diagrams/treemap.md) で定める。
欄は書かれた値を保ち、省略した欄も null として存在する。
リストはソース順を保ち、
子の欄は訪問順を示す。 [fixture: treemap/gram-written-tree]
[fixture: treemap/db-empty-names]
[fixture: treemap/common-repeat-empty]

body は根と独立した外側の文を持つ。
section は[親の規則](../diagrams/treemap.ja.md#字下げと親)による直接の子を持ち、
leaf は親にならない。
section・leaf・class 定義のソースの字下げは全て残す。
階層ノードの間の共通の文と class 定義の owner は「gap の所有」で定める。
値の変換と公開は [tests の要約][summary]で定める。 [fixture: treemap/gram-written-tree]
[fixture: treemap/common-block-empty-interleaved]
[fixture: treemap/db-class-indented]
[fixture: treemap/db-leaf-closes-open-sections]

StringLiteral.value は共通 trivia を除く書かれた内側とし、 escape を復号しない。
raw には元の両端の引用符、directive、ソースの改行も含め、
間の全てのソース文字を残す。
空の文字列もノードとし、closed は true とする。
NumericLiteral はこの位置の[数の定義](../ast.md#numericliteral)に従い、
綴り全体を raw に保つ。
Identifier は書かれた class・selector の名前を保つ。 [fixture: treemap/lex-string-conversion]
[fixture: treemap/line-name-values]
[fixture: treemap/lex-string-backslash-line-feed]
[fixture: treemap/db-empty-names]
[fixture: treemap/gram-name-directive-only]
[fixture: treemap/directive-name-middle]
[fixture: treemap/db-number-comma]
[fixture: treemap/db-number-underscore]
[fixture: treemap/db-number-multiple-dots]
[fixture: treemap/db-number-nan]
[fixture: treemap/db-number-rounded]
[fixture: treemap/db-number-overflow]
[fixture: treemap/gram-selector-underscore]

## gap の所有

階層ノードは TreemapSection と TreemapLeaf である。
非階層の文は TreemapClassDefStatement、TreemapTitleStatement、
TreemapAccTitleStatement、TreemapAccDescrStatement、
TreemapAccDescrBlockStatement であり、
階層の親を決める判定に参加しない。 [fixture: treemap/db-class-indented]
[fixture: treemap/common-block-empty-interleaved]
[fixture: treemap/gram-nesting-title-before-child]
[fixture: treemap/gram-nesting-acctitle-before-child]
[fixture: treemap/gram-nesting-description-before-child]
[fixture: treemap/gram-nesting-block-before-child]

まず名前・数・literal の内側として読んだテキストはその葉に保つ。
改行をまたぐ style から別の文を作らない。
完成した階層ノードの間の独立した非階層の文は、
次の階層ノードの statementsBefore にソース順で置く。
次のノードは子、祖先の別の子、別の根のいずれでもよい。
前の leaf に gap を所有させない。
空の block と繰り返した文も別々に保つ。 [fixture: treemap/lex-class-style-crosses-blank-line]
[fixture: treemap/gram-written-tree]
[fixture: treemap/gram-nesting-statement-before-section]
[fixture: treemap/gram-nesting-statement-before-ancestor-child]
[fixture: treemap/db-acctitle-tail-stays-content]
[fixture: treemap/db-class-tail-no-space]
[fixture: treemap/common-block-empty-interleaved]

最初の階層ノードより前と最後より後の独立した文は Diagram.body に残す。
階層ノードが無ければ全ての文をそこに置く。
所有はソースの位置であり、section の内側だけに効く範囲を作るものではない。
class 定義と共通の文は引き続き図全体に効く。 [fixture: treemap/gram-written-tree]
[fixture: treemap/gram-nesting-statement-after-last-child]
[fixture: treemap/common-repeat-empty]
[fixture: treemap/gram-nesting-global-class-before-child]

共有 Comment・Directive、選択された無視するセミコロン、空白、
空行は既存の所有を保ち、statementsBefore の要素を作らない。
section を閉じたり、非階層の文を消したりしない。
class の終端の後の字下げも含め、unit の字句上の境界と割り当てた字下げを保つ。
空の description block は、
これらとは別に保持する文である。 [fixture: treemap/gram-indent-around-global-directive]
[fixture: treemap/gram-nesting-child-after-directive-line]
[fixture: treemap/gram-nesting-child-after-comment]
[fixture: treemap/gram-nesting-child-after-empty-line]
[fixture: treemap/gram-nesting-child-after-comment-ls]
[fixture: treemap/gram-nesting-child-after-comment-ps]
[fixture: treemap/gram-nesting-empty-class-before-child]
[fixture: treemap/db-class-tail-space]
[fixture: treemap/common-block-empty-interleaved]
[fixture: treemap/gram-nesting-statements-directive-inline]
[fixture: treemap/gram-nesting-statements-directive-line]
[fixture: treemap/gram-nesting-statements-comment-line]
[fixture: treemap/gram-nesting-statements-empty-line]
[fixture: treemap/gram-nesting-statements-comment-ls]
[fixture: treemap/gram-nesting-statements-comment-ps]

## ノード

### TreemapDiagram

| 欄     | 型                      | 意味                   |
| ------ | ----------------------- | ---------------------- |
| `body` | list of TreemapBodyItem | 根と独立した外側の文。 |

子の欄: `body`。
範囲は見出しの先頭から最後の書かれた body の文までとし、
body が空なら見出しの終端まで。
その終端より外の padding・native comment・付加 LF は除く。
Root.diagramType は `treemap`。
見出しの別名は keyword のトークンに保ち、
別名の欄や見出しノードは作らない。 [fixture: treemap/header-beta]
[fixture: treemap/spec-treemap-test-ts-892fa294]
[fixture: treemap/gram-written-tree]
[fixture: treemap/hidden-comment-eof]
[fixture: treemap/comment-bare]

TreemapBodyItem は TreemapSection、TreemapLeaf、 TreemapClassDefStatement、
TreemapTitleStatement、 TreemapAccTitleStatement、TreemapAccDescrStatement、
TreemapAccDescrBlockStatement のいずれか。
公開する最後の値だけでなく、反復・空の共通の形も一つずつ保つ。
body に直接置く section と leaf は根だけとする。
独立した非階層の文は最初の階層ノードより前と最後より後だけ body に残す。
間の文は「gap の所有」に従って statementsBefore に置く。
空行・Comment は body 要素を作らず、body は空でもよい。
native comment は共有 Comment record とし、
TreemapIgnoredText は作らない。 [fixture: treemap/gram-written-tree]
[fixture: treemap/common-repeat]
[fixture: treemap/common-repeat-empty]
[fixture: treemap/common-block-empty-interleaved]
[fixture: treemap/comment-bare]
[fixture: treemap/spec-treemap-test-ts-892fa294]
[fixture: treemap/detect-second-scan-single-line-comment]
[fixture: treemap/comment-second-scan-shaped-body]

### TreemapSection

| 欄                 | 型                                            | 意味                                   |
| ------------------ | --------------------------------------------- | -------------------------------------- |
| `indent`           | nonnegative integer                           | row の前の ASCII space・tab の文字数。 |
| `statementsBefore` | 非階層の文のリスト                            | 名前より前の独立した文。               |
| `name`             | StringLiteral                                 | 空も許す引用した名前。                 |
| `classSelector`    | Identifier or null                            | `:::` の後の名前。なければ null。      |
| `children`         | （TreemapSection または TreemapLeaf）のリスト | 直接の子。ソース順。                   |

子の欄: `statementsBefore`、`name`、`classSelector`、`children`。
範囲の開始は最初の statementsBefore の要素、空なら名前の開始引用符とする。
末尾は最後の子孫まで、子が無ければ自身の selector か名前の終了引用符まで。
連続した範囲の開始は名前の開始とは限らず、兄弟は重ならない。
外側の字下げや無関係な末尾の trivia で範囲を延ばさない。
section は数値の value を持たない。
statementsBefore と children は、無ければ空のリストとする。
children は親の規則に従う。 [fixture: treemap/gram-written-tree]
[fixture: treemap/db-empty-names]
[fixture: treemap/db-indent-pop]
[fixture: treemap/gram-adjacent-sections]
[fixture: treemap/gram-nesting-statement-before-section]
[fixture: treemap/gram-nesting-statement-after-last-child]

indent は共通の除去の後の ASCII space・tab を一文字ずつ数える。
深さではない。
前の行や空白だけの行の連続から来る場合もあり、tab は展開しない。
連続の中の directive は数える際に前後を接合する。
indent は木の深さではなく割り当てた連続を保つ。
字下げの空白は葉の値ではなくソース文字のままとし、
statementsBefore によりノードの範囲が連続より前から始まる場合も同じである。 [fixture: treemap/db-tabs-count]
[fixture: treemap/db-section-tail-space]
[fixture: treemap/db-leaf-tail-tab]
[fixture: treemap/gram-indent-from-whitespace-line]
[fixture: treemap/gram-indent-around-global-directive]

### TreemapLeaf

| 欄                 | 型                  | 意味                                   |
| ------------------ | ------------------- | -------------------------------------- |
| `indent`           | nonnegative integer | row の前の ASCII space・tab の文字数。 |
| `statementsBefore` | 非階層の文のリスト  | 名前より前の独立した文。               |
| `name`             | StringLiteral       | 空も許す引用した名前。                 |
| `value`            | NumericLiteral      | 書かれた leaf の数。                   |
| `classSelector`    | Identifier or null  | `:::` の後の名前。なければ null。      |

子の欄: `statementsBefore`、`name`、`value`、`classSelector`。
範囲の開始は最初の statementsBefore の要素、空なら名前の開始引用符とする。
末尾は数か selector まで。
範囲は連続し、名前の開始から始まるとは限らない。
兄弟は重ならず、外側の字下げや無関係な末尾の trivia で範囲を延ばさない。
leaf は children の欄を持たず、後のより深い row はその子ではない。
statementsBefore は、無ければ空のリストとする。
colon・comma の separator は句読点として保ち、欄にはしない。
両方の形がこの型を使う。
数の綴りと構成要素の間のソースの gap を保ち、
子のノードへは変えない。 [fixture: treemap/gram-written-tree]
[fixture: treemap/gram-comma-separator]
[fixture: treemap/gram-spaced-leaf]
[fixture: treemap/gram-leaf-newlines-around-separator]
[fixture: treemap/comment-value-selector-gap]
[fixture: treemap/db-number-comma]
[fixture: treemap/common-block-empty-interleaved]
[fixture: treemap/db-leaf-not-parent]

indent は共通の除去の後の ASCII space・tab を一文字ずつ数える。
深さではない。
前の行や空白だけの行の連続から来る場合もあり、tab は展開しない。
連続の中の directive は数える際に前後を接合する。
indent は木の深さではなく割り当てた連続を保つ。
字下げの空白は葉の値ではなくソース文字のままとし、
statementsBefore によりノードの範囲が連続より前から始まる場合も同じである。 [fixture: treemap/db-tabs-count]
[fixture: treemap/db-section-tail-space]
[fixture: treemap/db-leaf-tail-tab]
[fixture: treemap/gram-indent-from-whitespace-line]
[fixture: treemap/gram-indent-around-global-directive]

### TreemapClassDefStatement

| 欄       | 型                     | 意味                                      |
| -------- | ---------------------- | ----------------------------------------- |
| `indent` | nonnegative integer    | row の前の ASCII space・tab の文字数。    |
| `name`   | Identifier             | class 定義の名前。                        |
| `style`  | TreemapLiteral or null | 書かれた style text 全体。なければ null。 |

子の欄: `name`、`style`。
範囲は classDef から、終端 semicolon の unit があればそこまで、
なければ style の最後の文字まで、style が null なら class 名まで。
row の前の字下げと最後の書かれた構成要素より後の区切り空白は除く。
共通の line rule が無視する semicolon は終端 unit ではなく、
範囲を広げない。 [fixture: treemap/gram-written-tree]
[fixture: treemap/gram-class-empty-with-semicolon]
[fixture: treemap/db-class-empty]
[fixture: treemap/db-style-whitespace]
[fixture: treemap/style-fields]

class 定義は親子に参加しないが、
section・leaf の row と同じ数え方で indent を保つ。
name はこの位置の文法に従い二文字以上。
style は名前の後の最大の区切り空白と終端 semicolon を除き、
内容が空なら空 literal でなく null とする。
directive だけの style も null となる。
元の comma、escaped comma、quote、percent text、 U+2028・U+2029、
末尾空白を一つの literal に保つ。
定義を分割・統合しない。 [fixture: treemap/db-class-indented]
[fixture: treemap/gram-class-name-two-characters]
[fixture: treemap/gram-class-whitespace-style-null]
[fixture: treemap/directive-class-only-style-null]
[fixture: treemap/db-class-escaped-comma]
[fixture: treemap/hidden-comment-class]
[fixture: treemap/line-class-ls]
[fixture: treemap/line-class-ps]
[fixture: treemap/db-style-whitespace]
[fixture: treemap/db-class-repeat]

style は後の行から始まり、別の node や class 定義に見える文字も囲み得る。
その文字はこの literal のままとし、追加の文を合成しない。
完了した class 定義の後の row は、
semicolon の後から字下げを取る場合も別の階層ノードとして残す。
class 定義の所有先は「gap の所有」で決める。 [fixture: treemap/lex-class-style-takes-next-class]
[fixture: treemap/lex-class-style-crosses-blank-line]
[fixture: treemap/comment-region-in-class-style-gap]
[fixture: treemap/gram-class-semicolon-glued-node]
[fixture: treemap/db-class-tail-space]

### TreemapTitleStatement

| 欄      | 型                     | 意味               |
| ------- | ---------------------- | ------------------ |
| `value` | TreemapLiteral or null | 書かれた共通の値。 |

value は title と正確に一つの ASCII space・tab の後から始め、
残る padding を保つ。
区切りがないか、共通の除去の後に内容が残らなければ null。
第 2 の space・tab は空白の literal となる。 [fixture: treemap/common-title-eof]
[fixture: treemap/common-title-one-space]
[fixture: treemap/common-title-one-tab]
[fixture: treemap/common-title-two-spaces]
[fixture: treemap/common-title-directive-only]
[fixture: treemap/gram-title-empty-before-glued-node]

子の欄: `value`。
範囲は title から値の最後の文字までとし、null なら title の終端まで。
keyword の前の padding、外側の trivia、文の終端の改行は除く。
空・上書きされる出現も含め、それぞれ独立して保つ。
Comment は共有 record とし、
hidden な接尾辞の欄は加えない。 [fixture: treemap/common-title-eof]
[fixture: treemap/common-title-one-space]
[fixture: treemap/common-title-one-tab]
[fixture: treemap/common-title-two-spaces]
[fixture: treemap/common-title-directive-only]
[fixture: treemap/gram-title-empty-before-glued-node]
[fixture: treemap/common-repeat-empty]
[fixture: treemap/gram-written-tree]

### TreemapAccTitleStatement

| 欄      | 型                     | 意味               |
| ------- | ---------------------- | ------------------ |
| `value` | TreemapLiteral or null | 書かれた共通の値。 |

value は colon の直後の行 text とし、両端の padding を保つ。
共通の除去の後に内容が残らない場合だけ null とする。
空白だけの内容も literal である。 [fixture: treemap/common-acctitle-eof]
[fixture: treemap/common-acctitle-whitespace-only]
[fixture: treemap/common-line-whitespace]
[fixture: treemap/common-acctitle-next-statement]

子の欄: `value`。
範囲は accTitle から、null なら colon、そうでなければ値の最後の文字まで。
keyword の前の padding、外側の trivia、文の終端の改行は除く。
空・上書きされる出現も含め、それぞれ独立して保つ。
Comment は共有 record とし、
hidden な接尾辞の欄は加えない。 [fixture: treemap/common-acctitle-eof]
[fixture: treemap/common-acctitle-whitespace-only]
[fixture: treemap/common-line-whitespace]
[fixture: treemap/common-acctitle-next-statement]
[fixture: treemap/common-repeat-empty]
[fixture: treemap/gram-written-tree]

### TreemapAccDescrStatement

| 欄      | 型                     | 意味               |
| ------- | ---------------------- | ------------------ |
| `value` | TreemapLiteral or null | 書かれた共通の値。 |

value は colon の直後の行 text とし、両端の padding を保つ。
共通の除去の後に内容が残らない場合だけ null とする。
colon の後の brace のような text も行の値のままである。 [fixture: treemap/common-description-eof]
[fixture: treemap/common-description-whitespace-only]
[fixture: treemap/common-accdescr-colon-block-priority]
[fixture: treemap/common-line-whitespace]

子の欄: `value`。
範囲は accDescr から、null なら colon、そうでなければ値の最後の文字まで。
keyword の前の padding、外側の trivia、文の終端の改行は除く。
空・上書きされる出現も含め、それぞれ独立して保つ。
Comment は共有 record とし、
hidden な接尾辞の欄は加えない。 [fixture: treemap/common-description-eof]
[fixture: treemap/common-description-whitespace-only]
[fixture: treemap/common-accdescr-colon-block-priority]
[fixture: treemap/common-line-whitespace]
[fixture: treemap/common-repeat-empty]
[fixture: treemap/gram-written-tree]

### TreemapAccDescrBlockStatement

| 欄      | 型                     | 意味               |
| ------- | ---------------------- | ------------------ |
| `value` | TreemapLiteral or null | 書かれた共通の値。 |

value は brace の内側から、外側両端の共通 Notation の空白だけを除く。
内部の padding・改行・quote・backslash は保つ。
空・空白だけ・directive だけ・comment region だけの内容は null とする。
最初の closing brace は必須であり、
空 block も文となるため closed の欄は不要。 [fixture: treemap/common-block-whitespace]
[fixture: treemap/line-block-values]
[fixture: treemap/common-block-whitespace-only]
[fixture: treemap/common-block-empty-interleaved]
[fixture: treemap/common-block-directive-only]
[fixture: treemap/common-block-comment-only]
[fixture: treemap/common-block-open]
[fixture: treemap/common-block-escaped-close]

子の欄: `value`。
範囲は accDescr から最初の closing brace までとし、
null でも両方の区切りを含む。
keyword の前の padding、外側の trivia、文の終端の改行は除く。
空・上書きされる出現も含め、それぞれ独立して保つ。
Comment は共有 record とし、
hidden な接尾辞の欄は加えない。 [fixture: treemap/common-block-whitespace]
[fixture: treemap/line-block-values]
[fixture: treemap/common-block-whitespace-only]
[fixture: treemap/common-block-empty-interleaved]
[fixture: treemap/common-block-directive-only]
[fixture: treemap/common-block-comment-only]
[fixture: treemap/common-block-open]
[fixture: treemap/common-block-escaped-close]
[fixture: treemap/common-repeat-empty]
[fixture: treemap/gram-written-tree]

### TreemapLiteral

| 欄      | 型     | 意味                                   |
| ------- | ------ | -------------------------------------- |
| `value` | string | 書かれた style または共通の値の text。 |

子の欄はありません。
範囲は前述の値のソース上の最初から最後の文字までとし、
内部の共通 trivia をまたぐ。
value から共通 directive・comment region・選択 semicolon を除き、
それ以外の書かれた文字は全て保つ。
ソースの改行、entity の綴り、quote、backslash、所有する空白は変えず、
空白の collapse、HTML の quote の書換え、escape の復号はしない。
quote のような共通 text も literal とし、quote を閉じる必要はない。
null の欄のために空 literal を作らない。 [fixture: treemap/db-style-whitespace]
[fixture: treemap/directive-style]
[fixture: treemap/directive-title]
[fixture: treemap/common-block-directive]
[fixture: treemap/common-block-comment]
[fixture: treemap/style-fields]
[fixture: treemap/line-block-values]
[fixture: treemap/common-quotes-entities]
[fixture: treemap/html-fields]
[fixture: treemap/tail-title-attach]
[fixture: treemap/common-title-open-quote]
[fixture: treemap/common-title-directive-only]

## 例

次の記述例は二つの row の型、両方の separator・quote、字下げのある class 定義、
共通の全ての文の型を示す。
第 2 の leaf の前の空の description
block も残す。 [fixture: treemap/gram-written-tree]

```mmd
treemap-beta
title Map
"Root":::aa
  "Left":1,234.5
  classDef aa fill:red,color:blue;
accDescr {}
  'Right',2:::aa
accTitle: Map
accDescr: Short
accDescr { Details }
```

TreemapDiagram.body は title、根の section、accessibility title、
行の description、空でない description block を持つ。
section.children は Left と Right、
Right.statementsBefore は class 定義と空の block をこの順に持つ。
二つの leaf と class 定義の indent は 2、section は 0。
最初の leaf は raw `1,234.5` と colon、第 2 は raw `2`、comma、single quote、
selector aa を保つ。
class 定義と共通の文は、
ソース上の owner に関わらず図全体への意味を保つ。 [fixture: treemap/gram-written-tree]

[summary]: ../../../tests/docs/db-summaries.md#treemap
