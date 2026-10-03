# comment-takes-line-break

英語版: [comment-takes-line-break.md](./comment-takes-line-break.md)

図種: class。
これは、この仕様の mermaid.js との
[既知の差](../known-divergences.ja.md) の 1 つです。

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

## 差

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
これは既知の差の 2 つ目の理由に当たります
（[known-divergences.ja.md](../known-divergences.ja.md) を参照）。

## 書き手にとっての結果

この道具が受理する、文の後にコメントのある class 図は、
mermaid.js では拒否されるか、次の行を文につないで描かれることがあります。
mermaid.js が同じに読む図を書くには、コメントをそれぞれの行に置きます。
mermaid.js がつなぐ、コメントで 2 つの行に分かれた文は、
この仕様では拒否されます。

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

## 件数と確かめ方

受理される class の fixture のうち、差の印がないものから入力を作りました。
各行の終わりに ` %% c` を差し込み、
行の中の各空白の後に `%% c` と空白を差し込み、
各行の後に `%%` か `%%{ }%%` の行を差し込みました。
どれも図のテキストの中で、フロントマターの中ではありません。
それぞれを mermaid.js とこの仕様の parser で読み、受理と Db を比べました。

| 入力                                   | mermaid.js は拒否、この仕様は受理 | 両方受理、Db が違う | mermaid.js は受理、この仕様は拒否 |
| -------------------------------------- | --------------------------------: | ------------------: | --------------------------------: |
| 行の終わりに ` %% c`、2,728 件         |                               633 |                   8 |                                 0 |
| 行の中の空白の後に `%% c`、22,053 件   |                                83 |                 146 |                                 9 |
| コメントの行を差し込んだもの、5,924 件 |                                 0 |                   0 |                                 4 |

残りの 29,822 件は、どちらも同じに読みます。
行を差し込んだ 4 件は、文の後のコメント、差し込んだ行、空白の行と続くものです。
mermaid.js は両方のコメントの後の改行を取って改行を 1 つ読み、
この仕様は 2 つ読んで、テキストを拒否します。
文の後のコメントがなければ、どちらも拒否します。
[fixture: class/div-comment-then-comment-only-line]

これらの入力は、替えた mermaid.js とも比べました。
`%%` の前が行の中で空白だけならコメントの規則をそのまま使い、
そうでなければ `%%` と行の残りだけを読む規則を使うように替えたものです
（`withoutDivergences: ["comment-takes-line-break"]`。
[差の確かめ方](../known-divergences.ja.md#差の確かめ方) を参照）。
parser の差分テストを、そのすべてで動かしました。
この差の印がある fixture と、フロントマターの行からも、
同じように入力を作って合わせた、30,938 件です。
このテストは、どの入力でも parser と mermaid.js を比べ、
この差によるとした違いのある入力では、替えた mermaid.js とも比べます。
この差かほかの既知の差で説明されない違いは、見つかりませんでした。
フロントマターの中に差し込んだ入力の違いは、
[`embedded-data-opaque`](./embedded-data-opaque.ja.md) としてだけです。
