# name-start-reads-unit

英語版: [name-start-reads-unit.md](./name-start-reads-unit.md)

図種: class。
これは、この仕様の mermaid.js との
[既知の差異](../known-divergences.ja.md) の 1 つです。

## 構文

class 図では、クラスの名前をバッククォートの間に書けます。
こうすると、バッククォートで囲まないクラス名には書けない文字を持てます。
また、クラスの名前の後には、2 つの `~` の間のジェネリクスの型を書けます。

```mmd
classDiagram
  class `Car`
  class A~T~
```

バッククォートの名前は、`` ` ``、`` ` `` 以外の文字、`` ` `` で、
ジェネリクスの型のテキストは、2 つの `~` の間の `~` 以外の文字です
（[文字列、バッククォートの名前、ジェネリクスの型](../diagrams/class.ja.md#文字列バッククォートの名前ジェネリクスの型)
を参照）。
[fixture: class/spec-class-diagram-c327a7be] [fixture:
class/lex-generic-plain-type]

この文書は、そのテキストが `"`、（バッククォートでは）`~`、`<<` か `>>`、
キーワード `cssClass`、`callback`、`link`、`click`、`note`、`href` のどれかで
始まるときについてのものです。
これらを後に持つテキストや、これらで始まる長い語は、
mermaid.js もこの仕様も同じに読みます。
`` class `x note` `` と `` class `notex` `` は、
どちらでもクラス `x note` と `notex` を宣言します。
[fixture: class/lex-backquote-keyword-later] [fixture:
class/lex-backquote-keyword-prefix]

## 差異

どの例も、class 図の全体です。

1. バッククォートの間のキーワード:

   ```mmd
   classDiagram
     class `note`
   ```

2. バッククォートの名前の始めの `"`:

   ```mmd
   classDiagram
     class `"x`
   ```

3. ジェネリクスの型の始めのキーワード:

   ```mmd
   classDiagram
     class A~note x~
   ```

4. 名前の後の、バッククォートの間の文字列:

   ```mmd
   classDiagram
     A `"1"` --> B
   ```

5. ジェネリクスの型としての文字列:

   ```mmd
   classDiagram
     A~"1"~ --> B
   ```

6. バッククォートの間のキーワードと、その後の文字列:

   ```mmd
   classDiagram
     `note` "x"
   ```

| 例  | mermaid.js                 | この仕様                     |
| --- | -------------------------- | ---------------------------- |
| 1   | 拒否                       | クラス `note`                |
| 2   | 拒否                       | クラス `"x`                  |
| 3   | 拒否                       | 型 `note x` を持つクラス A   |
| 4   | 多重度 `1` の A からの関係 | クラス `A"1"` からの関係     |
| 5   | 多重度 `1` の A からの関係 | 型 `"1"` を持つ A からの関係 |
| 6   | ノート `x`                 | 拒否                         |

表で比較した読みを次の fixture が記録します。
[fixture: class/div-backquote-keyword-escaped] [fixture:
class/div-backquote-starts-with-quote] [fixture:
class/div-generic-starts-with-keyword] [fixture:
class/div-backquote-around-string] [fixture: class/div-generic-around-string]
[fixture: class/div-backquote-around-keyword]

バッククォートや `~` がなければ、どちらも同じに読みます。
`A "1" --> B` は、A の側に多重度 `1` を持つ A から B への関係で、
`note "x"` はノートです。
[fixture: class/gram-cardinality-before-arrow] [fixture: class/gram-note-plain]

つまり mermaid.js は、テキストがこれらの単位のどれかで始まると、
名前や型の代わりにその単位を読み、
その周りのバッククォートや `~` を何もないものとして読みます。
そのようなテキストのほとんどは、そのとき文にならず、mermaid.js は拒否します。
例 4 から 6 のように、読んだものがたまたまその文法に合うと、
バッククォートや `~` のないテキストが表す文を読みます。
この仕様は、バッククォートや `~` の間のテキストを、
何で始まっても名前や型として読みます。
[fixture: class/div-backquote-starts-with-double-less-than]
[fixture: class/div-backquote-starts-with-double-greater-than]
[fixture: class/div-generic-starts-with-double-less-than]
[fixture: class/div-generic-starts-with-double-greater-than]
[fixture: class/div-backquote-keyword-css-class]
[fixture: class/div-backquote-keyword-callback]
[fixture: class/div-backquote-keyword-link]
[fixture: class/div-backquote-keyword-click]
[fixture: class/div-backquote-keyword-href]
例 6 では、クラスの名前に文字列が続くものは文ではないので、
この仕様はテキストを拒否します。

## 書き手にとっての結果

バッククォートは、
バッククォートで囲まないクラス名には書けない名前を書く方法です。
その名前がキーワードや `"` で始まると、
mmd-toolkit のパーサーは名前を書かれたとおりに読み、
mermaid.js は図を拒否するか、例 4 から 6 のように、
警告を出さずに別のものを描きます。
キーワード、`"`、`<<`、`>>` で始まるジェネリクスの型も同じです。
mermaid.js が同じに読む図を書くには、
そのような名前や型を、ほかの文字で始めます。

## mermaid.js がそう読む理由

mermaid.js の字句解析器は、バッククォートの名前とジェネリクスの型のテキストを、
それぞれの状態で読みます
（[`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L106-L112)）。
その規則のいくつかは、どの状態でも当てはまります。
キーワード、`<<`、`>>`
（[`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L89-L104)）、
文字列の始まり
（[`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L62-L62)）、
ジェネリクスの型の始まりです。
字句解析器は、規則をファイルの順に試し、最初に当たったものを取ります。
これらの規則は、バッククォートの名前のテキストの規則より前にあり、
最後のもの以外は、ジェネリクスの型のテキストの規則より前にもあります。
テキストがそのどれかで始まると、その規則が先に当たります。

## この仕様の規則と、その理由

この仕様では、バッククォートの名前のテキストは次の `` ` `` まで、
ジェネリクスの型のテキストは次の `~` まで続き、何で始まっても同じです
（[文字列、バッククォートの名前、ジェネリクスの型](../diagrams/class.ja.md#文字列バッククォートの名前ジェネリクスの型)
を参照）。

バッククォートの名前が、後には `note` を持てるのに `note` で始まれないことは、
mermaid.js の字句解析器の規則の順から生じるもので、
仕様が構文の規則として述べるものではありません。
これは既知の差異の 2 つ目の理由に当たります
（[known-divergences.ja.md](../known-divergences.ja.md) を参照）。
mermaid.js は 2023 年に、文字列について同じ順を替え、
文字列がキーワードで始まれるようにしました。
バッククォートの名前とジェネリクスの型の規則は、
共有の規則の後に残りました（下を参照）。

## mermaid.js の文書と issue

- mermaid.js の class 図の文書は、
  [Class labels](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/classDiagram.md#L161-L168)
  で「You can also use backticks to escape special characters in the label」
  と書き、
  [Generic Types](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/classDiagram.md#L215-L217)
  でジェネリクスの型を説明しています。
  どちらも、テキストがキーワードで始まれないとは書いていません。
- [Issue #4590](https://github.com/mermaid-js/mermaid/issues/4590)
  「Note "note" throws an error」は、
  文字列が `note` のノートが拒否されることを報告しました。
  contributor が、字句解析器は文字列の中でも、
  どの状態でもキーワードを読む、と返信しています。
  ラベル `Type: Bug / Error`、`Graph: Class`、`Internals: Parser` などを持ち、
  2023-07-11 に、マージされた
  [pull request #4597](https://github.com/mermaid-js/mermaid/pull/4597)
  「allow notes identical to keywords」で閉じられました。
  この pull request は、文字列のテキストの規則を共有の規則より前に動かしました。
  固定した版は、そのようなノートを書かれたとおりに読みます。
  [fixture: class/spec-class-diagram-61cad801]
- [Issue #6076](https://github.com/mermaid-js/mermaid/issues/6076)
  「Allow puncutation in class names」は、2026-10-02 の時点で open で、
  ラベルは `Type: Enhancement`、`Status: Approved`、`Contributor needed`、
  `Graph: Class` です。
  2026-03-02 に collaborator が、bot が書いた印のある返信で、
  クラスの名前をバッククォートで囲むことは、
  クラスの名前の中の点への回避策だ、と答えています。
