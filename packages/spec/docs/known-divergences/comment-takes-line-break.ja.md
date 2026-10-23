# comment-takes-line-break

英語版: [comment-takes-line-break.md](./comment-takes-line-break.md)

図種: class、gantt、c4。
これは、この仕様の mermaid.js との
[既知の差異](../known-divergences.ja.md) の 1 つです。

## 構文

Mermaid の図のコメントは `%%` で始まり、その行の終わりまで続きます。
mermaid.js はそれを、ないものとして除きます。
コメントのふつうの置き場所は、それだけの行です。

```mmd
classDiagram
  %% The animals of the farm
  class Animal
  Animal <|-- Duck
```

コメントは、`Animal <|-- Duck %% ducks` のように、文の後の同じ行にも書けます。
この文書は、class 図の文の後のそのようなコメントについてのものです。
それだけの行のコメントは、mermaid.js もこの仕様も同じに読みます。
文の後のコメントも、テキストの最後の行にあるときは同じで、
後にディレクティブだけの行が続くときもそうです。
`%%` の前にディレクティブだけがある行も、コメント行です。
[fixture: class/lex-comment-own-line] [fixture:
class/lex-comment-on-last-line] [fixture:
class/lex-comment-then-directive-at-end] [fixture:
class/lex-directive-then-comment-line]

## 差異

どの例も、class 図の全体です。

1. 次の行に文があるもの:

   ```mmd
   classDiagram
     Animal <|-- Duck %% ducks
     class Fish
   ```

2. 空の行の後に文があるもの:

   ```mmd
   classDiagram
     Animal <|-- Duck %% ducks

     class Fish
   ```

3. 次の行にメンバーがあるもの:

   ```mmd
   classDiagram
     Animal <|-- Duck %% ducks
     Animal : +int age
   ```

4. コメントが関係を分けているもの:

   ```mmd
   classDiagram
     Animal <|-- %% ducks
     Duck
   ```

5. ヘッダーの行のコメント:

   ```mmd
   classDiagram %% animals
     class Animal
   ```

6. 最後の行のコメント:

   ```mmd
   classDiagram
     class Animal
     Animal <|-- Duck %% ducks
   ```

| 例  | mermaid.js                               | この仕様                        |
| --- | ---------------------------------------- | ------------------------------- |
| 1   | 拒否                                     | 関係と、クラス Fish             |
| 2   | 拒否                                     | 関係と、クラス Fish             |
| 3   | `DuckAnimal` への関係。ラベル `+int age` | 関係と、Animal のメンバー `age` |
| 4   | Animal から Duck への関係                | 拒否                            |
| 5   | 拒否                                     | クラス Animal                   |
| 6   | 関係                                     | 同じ                            |

例 2 の空の行の代わりに空白だけの行があれば、
どちらも関係とクラス Fish を読みます。
[fixture: class/div-comment-then-statement] [fixture:
class/div-comment-then-empty-line] [fixture: class/div-comment-joins-member]
[fixture: class/div-comment-splits-relation] [fixture:
class/div-comment-after-header] [fixture: class/lex-comment-on-last-line]
[fixture: class/lex-comment-then-spaces-line]

つまり mermaid.js は、そのようなコメントの次の行を、前の文の続きとして読みます。
2 つの行を合わせたものが文にならなければ、テキストを拒否し、
たまたま文になれば、書き手が書いていない文を読みます。
この仕様は、コメントをコメントとして、その次の行を次の文として読みます。

関係の後のコメント、`%%` だけの行、空白の行と続くものでは、
mermaid.js はコメントの後と `%%` の後の改行を取って改行を 1 つ読み、
この仕様は 2 つ読んで、テキストを拒否します。
関係の後のコメントがなければ、どちらも拒否します。
[fixture: class/div-comment-then-comment-only-line]

ガントチャートでは、mermaid.js が直接たどり着く
（[コメント](../diagrams/gantt.ja.md#コメント) の定め）印 `%` のコメントが、
同じようにその後の改行を取ります。
それが効くのは click の文の中だけです。その部分は改行をまたいで続けられます。
`click id1 %c`、改行、`href "u"` は mermaid.js ではリンクを設定し、
`click id1 call f()%c`、改行、`href "u"` も、改行 2 つでも、同じです。
ここではコメントはその行で終わり、`newline` の単位が文を終えるので、
入力は拒否されます。
call の部分の後の `%` の前に空白があるか `%%` のときはどちらも拒否し、
文と文の間では mermaid.js が取る改行は何も変えません
（[コメント](../diagrams/gantt.ja.md#コメント) を参照）。
gantt では差異は一方向です。mermaid.js が受理し、この仕様が拒否します。
[fixture: gantt/div-percent-comment-takes-line-feed-after-click-id]
[fixture: gantt/div-percent-comment-takes-line-feed-after-call]
[fixture: gantt/div-percent-comment-takes-line-feeds-after-call]
[fixture: gantt/div-percent-comment-takes-line-feed-after-href]
[fixture: gantt/lex-space-percent-comment-after-call-then-href-line]
[fixture: gantt/lex-double-percent-comment-after-click-id-then-href-line]
[fixture: gantt/lex-percent-comment-glued-after-header-blank-line]

C4 では見出し、呼び出し、境界の後の図のコメントは、
この仕様では後続の行終端子をコメントの外に残します。
[fixture: c4/header-component-comment-glued]
[fixture: c4/header-component-comment-on-header-line]
[fixture: c4/header-container-comment-glued]
[fixture: c4/header-container-comment-on-header-line]
[fixture: c4/header-context-comment-glued]
[fixture: c4/header-context-comment-on-header-line]
[fixture: c4/header-deployment-comment-glued]
[fixture: c4/header-deployment-comment-on-header-line]
[fixture: c4/header-dynamic-comment-glued]
[fixture: c4/header-dynamic-comment-on-header-line]
[fixture: c4/div-comment-between-joined-statements]
[fixture: c4/div-boundary-comment-before-inline-body]
[fixture: c4/div-boundary-comment-before-next-statement]

mermaid.js は後続の連続する LF を取り、
必須の区切りを失うこれらの入力を拒否し、
コメントの後に空行がある場合も同じです。
[fixture: c4/div-header-comment-blank-recovery]
[fixture: c4/div-comment-between-blank-recovery]
[fixture: c4/div-diagram-comment-u2028][fixture: c4/div-diagram-comment-u2029]

コメントの後のスペースだけの行は C4 のコメント規則を止め、
区切られた文を両者とも受理します。
[fixture: c4/header-header-comment-spaces-recovery]
[fixture: c4/lex-comment-between-spaces-recovery]

## 書き手にとっての結果

mmd-toolkit のパーサーが受理する、文の後にコメントのある class 図は、
mermaid.js では拒否されるか、次の行を文につないで描かれることがあります。
mermaid.js が同じに読む図を書くには、コメントを独立した行に書きます。
mermaid.js がつなぐ、コメントで 2 つの行に分かれた文は、
この仕様では拒否されます。

## mermaid.js がそう読む理由

mermaid.js の字句解析器は、コメントを 1 つの規則で読みます
（[`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L28-L28)）。
`%%`、行の残り、その後に続く改行のすべてです。
この規則は、それだけの行のコメントに合っていて、その行を改行ごと除きます。
文の後では、文を終える改行を除くので、
文法は次の行を同じ文の一部として見ます。
空白だけの行は、空白が改行でないので規則を止めますが、空の行は止めません。
字句解析器はディレクティブのないテキストを読むので、
ディレクティブだけの行はそれにとって空の行で、
空白の後のディレクティブは空白だけの行を残します。
`A <|-- B %% c`、行 `%%{init: {}}%%`、`class C` は、mermaid.js では拒否され、
ディレクティブの前に空白があれば、どちらも関係とクラス C を読みます。
[fixture: class/div-comment-then-directive-line] [fixture:
class/lex-comment-then-indented-directive-line]
ただし mermaid.js は、字句解析器がテキストを読む前に、
`%%` の後に文字のある、ディレクティブでないコメント行を、
すぐ前の空白だけの行と一緒に除きます
（[`cleanupComments`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/comments.ts#L6-L8)）。
そのようなコメント行のすぐ前の空白の行はなくなり、何も止めません。
`A --> B %% c`、空白の行、`%% x`、`A : +int age` は、
例 3 と同じく、mermaid.js では、
ラベル `+int age` を持つ A から `BA` への 1 つの関係です。
[fixture: class/div-comment-then-spaces-line-then-comment-line]
gantt の字句解析器は、単独の `%` で始まるコメントに同じ形の規則を持ち
（[`gantt.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/parser/gantt.jison#L30-L30)）、
`%` に直接立つところでだけそれにたどり着きます。
`%%` の規則と、前に文字のある `%` の規則は改行を取りません。

## この仕様の規則と、その理由

この仕様では、文の後のコメントはその行の終わりで終わり、
その後の改行は、ほかのどこの改行とも同じく文を終えます。
それだけの行のコメントは、mermaid.js と同じく改行ごと除きます
（[文の文脈](../diagrams/class.ja.md#文の文脈) を参照）。

文の後のコメントは、書き手がすでに使っている書き方で、
上で「同じ」とした場所では、mermaid.js も書かれたとおりに読みます。
この仕様は、それを拒否にせず、どこでも読めるようにします。
書き手がすでに書いているものを拒否にする規則は、後で取り消せないからです。
mermaid.js が次の行をつなぐのは、その字句の規則の作りから生じることで、
仕様が構文の規則として述べるものではありません。
これは既知の差異の 2 つ目の理由に当たります
（[known-divergences.ja.md](../known-divergences.ja.md) を参照）。

## mermaid.js の文書と issue

- mermaid.js の class 図の文書は、
  [Comments](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/classDiagram.md#L573-L575)
  で「Comments need to be on their own line」と書いています。
  [flowchart](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/flowchart.md#L1219-L1219)
  と
  [sequence 図](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/sequenceDiagram.md#L682-L682)
  の文書も同じです。
- [Issue #6401](https://github.com/mermaid-js/mermaid/issues/6401)
  「Inline comments cause errors when compiling」は、
  flowchart の文の後のコメントを報告しています。
  2026-10-02 の時点で open で、ラベルは `Type: Bug / Error`、`Type: Other`、
  `Close after 30 days` です。
  2026-03-02 に collaborator が、bot が書いた印のある返信で、
  文の後のコメントは文法の設計どおり未対応で、
  それはすべての図種に当てはまる、と答えています。
- [Issue #1646](https://github.com/mermaid-js/mermaid/issues/1646) は、
  class 図で行の終わりのコメントを求めています。
  contributor が 2020 年に、対応されるべきだと返信し、
  2023 年に [issue #1645](https://github.com/mermaid-js/mermaid/issues/1645)
  に寄せて閉じました。
  2026-10-02 の時点で、#1646 はラベル `Type: Enhancement` のまま closed です。
  #1645 は、文の後ではなく、クラスの本体の中のコメントについてのもので、
  ラベル `Type: Bug / Error` と `Status: Approved` などを持ち、closed です。

- 固定した版の
  [C4 の文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/c4.md#L7-L17)
  は見出しと呼び出しを別の行に置き、
  行の途中のコメントが後続の改行を取る規則を示していません。
  `mermaid-js/mermaid` の issue と pull request を、
  2026-10-21 に `C4 comment in:title,body`、
  `C4 newline in:title,body`、
  `C4 "inline comments" in:title,body`、
  `C4 comment "line break" in:title,body` で検索したところ、
  [PR #8504](https://github.com/mermaid-js/mermaid/pull/8504)
  が見つかりました。
  この PR の変更は C4 の検出位置についてで、
  パーサーを変更していません。
  C4 のコメント規則が必須の改行を取ることについての報告は、
  見つかりませんでした。
