# comment-takes-character

英語版: [comment-takes-character.md](./comment-takes-character.md)

図種: sequence、gantt、journey、timeline、xychart、quadrant。
これは、
この仕様の mermaid.js との [既知の差異](../known-divergences.ja.md) の 1 つです。

## 構文

Mermaid の図のコメントは `%%` で始まり、その行の終わりまで続きます。
sequence 図では、ふつうはそれだけの行に書きます。

```mmd
sequenceDiagram
  Alice ->> John: Hello John, how are you?
  %% this is a comment
  John -->> Alice: Great!
```

この例はメッセージの間の単独行にコメントを置きます。 [fixture: sequence/docs-syntax-sequence-diagram-c404e4ed]

この文書は、`autonumber 10%% c` のように、その行のほかの文字のすぐ後に、
間に空白なしで来る `%%` についてのものです。
この仕様では、その前の文字は、字句解析器がそこで読むものに属します。
数の後では `%%` はコメントを始め、
id の並びの文字の後とテキストの前の `:` の後では、
id の並びかテキストの文字です。
単独の `%` がコメントを始めるガントチャートでは、 `a% : 1d` のように、
単位の最初の文字（`}` と空白以外の文字）の直後の `%` についてのものです。
ユーザージャーニー図、timeline、XY chart、quadrant chart では、`A%%B: 5`、
`a%% c`、 `title T%% c` のように、同じ位置の `%%` についてのものです。

## 差異

どの例も、sequence 図の全体です。

1. `%%` のすぐ前の 1 文字の id:

   ```mmd
   sequenceDiagram
     A ->> B: x
     C%% c
   ```

2. メッセージの宛先の最初の文字のすぐ後の `%%`:

   ```mmd
   sequenceDiagram
     Alice ->> B%% cob: Hello
   ```

3. メッセージのテキストの前の `:` のすぐ後の `%%`:

   ```mmd
   sequenceDiagram
     A ->> B:%% c
   ```

4. 2 桁の数のすぐ後の `%%`:

   ```mmd
   sequenceDiagram
     autonumber 10%% c
     A ->> B: x
   ```

5. 1 桁の数のすぐ後の `%%`:

   ```mmd
   sequenceDiagram
     autonumber 5%% c
     A ->> B: x
   ```

6. `%%` の前の空白:

   ```mmd
   sequenceDiagram
     autonumber 10 %% c
     A ->> B: x
   ```

| 例  | mermaid.js                   | この仕様                            |
| --- | ---------------------------- | ----------------------------------- |
| 1   | メッセージと、コメント       | 拒否                                |
| 2   | 拒否                         | Alice から `B%% cob` へのメッセージ |
| 3   | 拒否                         | メッセージ `%% c`                   |
| 4   | 拒否                         | 10 からの番号付け                   |
| 5   | 開始番号を指定しない番号付け | 5 からの番号付け                    |
| 6   | 10 からの番号付け            | 同じ                                |

表で比較した読みを次の fixture が記録します。 [fixture: sequence/div-comment-after-one-character-id]
[fixture:
sequence/div-comment-after-id-run-first-character-target] [fixture:
sequence/div-comment-after-text-colon] [fixture:
sequence/div-comment-after-two-digit-number] [fixture:
sequence/lex-percent-comment-takes-number] [fixture:
sequence/lex-space-before-comment-after-two-digit-number]

つまり、mermaid.js の字句解析器のある規則が、
`%%` のすぐ前の文字で一致を始めるはずの場所では、
mermaid.js はその文字をコメントの一部として読み、行の残りとともに失います。
また、`%%` のすぐ前の数は、mermaid.js にとって数ではありません。
この仕様は、その文字を残します。
例 1 では、`C%% c` は id の並びで、矢印のない文なので拒否されます。
例 2 では、メッセージの宛先は `B%% cob` です。
id の並びの中では、`%` はその並びの文字だからです。
mermaid.js も、`CD%% c` を id の並び `CD%% c` として読みます。

差異は両方向にあります。
mermaid.js が受理しこの仕様が拒否するのは、
文かその次の単位を始める 1 文字の id、数字、`.` が、
`%%` のすぐ前にあるときです。
mermaid.js が拒否しこの仕様が受理するのは、
mermaid.js が失うものが要るときです。
id の並びの最初の文字、メッセージのテキストの前の `:`、
mermaid.js が id の並びとして読む、2 文字以上の数です。
mermaid.js のコメントの後に残ったものがまだ受理されるときは、どちらも受理し、
Db が違います。
例 5 と、`autonumber 5 2%% c`（この仕様では刻み 2、mermaid.js では 1）、
そして `A%% clice->>Bob: Hello` （この仕様では `A%% clice` からのメッセージ、
mermaid.js ではメッセージなし）です。 [fixture: sequence/div-comment-after-one-digit-line]
[fixture: sequence/div-comment-after-first-letter-of-keyword] [fixture:
sequence/div-comment-after-dot-before-number] [fixture:
sequence/div-comment-after-fraction-number] [fixture:
sequence/div-comment-after-step-number] [fixture:
sequence/div-comment-after-id-run-first-character-line-start]

`%%` の前の `;` のように、mermaid.js が失う文字が何も変えないときは、
どちらも同じ結果で、その入力は差異ではありません。
`%%` の前の空白は、例 6 のように、ほとんどの場所で両方を同じ読み方にし、
`A->>B: %% c` はどちらでもメッセージ `%% c` を持ちます。
ただし、id の並びの中では空白が残るので、
`A %% clice->>Bob: Hello` はどちらでも `A %% clice` からのメッセージです。 [fixture: sequence/lex-comment-after-semicolon]
[fixture:
sequence/lex-comment-after-invalid-unit] [fixture:
sequence/lex-space-before-comment-after-text-colon] [fixture:
sequence/lex-space-before-comment-in-id-run]

`%%` が文字のすぐ後に来るかは、ディレクティブを除いた図のテキスト、
つまり両方の字句解析器が読むテキストで決まります。
`autonumber 1%%{init: {}}%%%% c0` では、
`%%` は数 1 のすぐ後に来ます。 [fixture: sequence/div-comment-after-number-across-directive]

ガントチャートでは、mermaid.js の字句解析器は単独の `%` に同じ規則を持ちます。
単位の始まる位置の `%` のすぐ前に `}` 以外の文字があるところでは、その文字、
`%`、行の残りを 1 つのコメントとして読みます。
`a% : 1d` はコメントでタスクはなく、`t%itle T` はコメントでタイトルはなく、
`a : 1d;%c` と `dateFormat X;%c` はタスクと設定の後に `;` からのコメントです。
この仕様ではコメントは単位の始まる位置でだけ始まり、
`%` はそれを含む単位の文字です。
`a% : 1d` はタスク `a% `、`t%itle T` はデータのないタスクのテキストで、
タスクのデータや設定のテキストの後の `;%c`、タスクのデータの後の `#%c`、
URL 文字列の後の `"%c` も同じなので、これらの入力は拒否されます。
一方 `a :%c` は終わり `%c` を持つタスク `a ` で、mermaid.js は拒否します。
gantt では差異は両方向です。
`ab% : 1d` と `}%c : 1d` はどちらでもタスクで、
`%` の前の空白はどちらでもコメントにします。
[コメント](../diagrams/gantt.ja.md#コメント) を参照してください。 [fixture: gantt/lex-colon-then-percent]
[fixture: gantt/div-comment-after-task-text-start]
[fixture: gantt/div-comment-after-keyword-start]
[fixture: gantt/div-comment-after-semicolon-after-data]
[fixture: gantt/div-comment-after-semicolon-after-setting]
[fixture: gantt/lex-comment-after-two-characters]
[fixture: gantt/lex-brace-before-percent]
[fixture: gantt/lex-space-then-percent-after-unit]

ユーザージャーニー図では、mermaid.js の字句解析器は `%%` に同じ規則を持ちます。
単位の始まる位置の `%%` のすぐ前に `}` でも空白でもない文字があるところでは、
その文字、`%%`、行の残りを 1 つのコメントとして読みます。
`A%%B: 5` はコメントでタスクはなく、
`A: 5;%% c` と `title x;%% c` はタスクとタイトルの後に `;` からのコメントで、
`section a:%% c` は section `a` の後に `:` からのコメントです。
この仕様ではコメントは単位の始まる位置でだけ始まります。
`A%%B: 5` はタスク `A%%B` で、
タスクのデータやタイトルの後の `;` は文法の取らない `;` の単位、
section の後の `:%% c` はタスクのないデータなので、これらの入力は拒否されます。
一方 `A:%% c` はスコアの部分が `%% c` のタスク `A` で、mermaid.js は拒否します。
journey では差異は両方向です。
`a%: 5` のように文字の後の単独の `%` は、どちらでもタスクのテキストの文字で、
`}%% c` はどちらでもデータのないタスクのテキストで、
`%%` の前の `#` はどちらにもコメントを読ませます。
[コメント](../diagrams/journey.ja.md#コメント) を参照してください。 [fixture: journey/div-comment-after-task-text-start]
[fixture: journey/div-comment-after-semicolon-after-data]
[fixture: journey/div-comment-after-semicolon-after-title]
[fixture: journey/div-comment-after-colon-after-section]
[fixture: journey/div-comment-after-task-colon]
[fixture: journey/lex-single-percent-after-character]
[fixture: journey/lex-brace-before-percent]
[fixture: journey/lex-hash-before-percent]

timeline では、
mermaid.js の字句解析器はユーザージャーニー図と同じ `%%` の規則を持ちます。
period が始まるところの `a%% c`、`;%% c`、`é%% c`、ヘッダー直後の `;%% c`、
説明ブロック直後の `x%%{ }%%` は、 mermaid.js ではコメントで、
この仕様では period です。
`:%% c` は mermaid.js ではコメントで、
コロンの後に空白がないのでここでは拒否されます。
timeline でも差異は両方向です。
`}%% c` はどちらでも period で、
`%%` の前の `#` はどちらにもコメントを読ませます。
[コメント](../diagrams/timeline.ja.md#コメント) を参照してください。 [fixture: timeline/div-comment-after-period-start]
[fixture: timeline/div-comment-after-semicolon]
[fixture: timeline/div-comment-after-non-ascii-letter]
[fixture: timeline/div-comment-after-semicolon-after-header]
[fixture: timeline/div-comment-after-block-character]
[fixture: timeline/div-comment-after-colon]
[fixture: timeline/db-comment-percent-after-closing-brace]
[fixture: timeline/lex-hash-before-percent]

XY chart では、mermaid.js の字句解析器は、
ユーザージャーニー図と同じ `%%` の規則を持ち、文字の並び、数字の並び、
数を一度に読みます。
そのため、コメントが取る文字は 1 文字の単位です。
単独の文字や数字、または `-`、`]`、`;` のような文字です。
`title T%% c`、`x-axis T%% c`、`line [1]%% c`、`x-axis [a, b]%% c`、
`bar [1 "a"]%% c`、`y-axis 0 --> 1%% c` は、mermaid.js では拒否され、
ここでは受理されます。
`title A B%% c` は mermaid.js ではタイトル `A` を、ここでは `AB` を持ち、
`title a-%% c` はタイトル `a` と `a-` を持ちます。
`title AB%% c`、`y-axis 0 --> 10%% c`、`title T;%% c`、
文字列の閉じる引用符のすぐ後の `%%` は、
両方が同じに読みます（[コメント](../diagrams/xychart.ja.md#コメント) を参照）。
コメントは、行頭から `%%` だけの行の前の改行文字も取ります。
これはどの文も変えず、
[`title-digit-after-axis-statement`](./title-digit-after-axis-statement.ja.md) でだけ数に入り、
そこでは段を降ろしません。 [fixture: xychart/div-title-digit-after-bare-percent-line-after-axis-and-plot]
[fixture: xychart/db-title-digit-after-bare-percent-line-and-empty-line]
[fixture: xychart/header-bare-percent-line-after-header]
[fixture: xychart/div-comment-glued-after-title-word]
[fixture: xychart/div-comment-glued-after-axis-title]
[fixture: xychart/div-comment-glued-after-bracket]
[fixture: xychart/div-comment-glued-after-categories]
[fixture: xychart/div-comment-glued-after-label]
[fixture: xychart/div-comment-glued-after-range]
[fixture: xychart/div-comment-takes-one-letter-word]
[fixture: xychart/div-comment-takes-hyphen]
[fixture: xychart/db-comment-glued-after-two-letter-word]
[fixture: xychart/db-comment-glued-after-two-digit-number]
[fixture: xychart/db-comment-glued-after-semicolon]
[fixture: xychart/db-comment-glued-after-quote]

quadrant chart では、mermaid.js の字句解析器は、
ユーザージャーニー図と同じ `%%` の規則を持ちます。
文字の並び、数字の並び、ASCII 外の文字の並びを一度に読み、
それ以外の文字は 1 文字ずつ読みます。
空白文字もその 1 つで、 quadrant chart の文法は、
説明ブロックの後と点の `]` の後でそれを数えます。
そのため、コメントが取るのは、単独の文字や数字、`,`、`-`、`#` のような文字、
単独の ASCII 外の文字、または 1 つの空白文字です。
`x-axis L%% c`、`quadrant-1 a%%b`、`A: [0.3, 0.6] radius: 1%% c` は、
mermaid.js では拒否され、ここでは受理されます。
違いは逆の向きにもあります。
差異の理由の 2 つ目は、この仕様が違うように読む入力だけでなく、
拒否する入力も含むからです。
`A%% c` と `a%%b: [0.3, 0.6]` は、mermaid.js では何もない行として受理され、
ここでは点のない名前として拒否されます。
`accDescr {x}` にスペースと `%% c` が続くものと、
`A: [0.3, 0.6]` にタブと `%% c` が続くものは、
mermaid.js では空白なしとして受理され、ここでは空白が残って拒否されます。
`x-axis L --> R%% c` は、
mermaid.js では矢印を持つ左のテキストを持って右のテキストを持たず、
ここではテキスト `L` と `R` を持ちます。
`quadrant-1 ab,%% c` と `quadrant-1 a b%% c` は、
mermaid.js ではテキスト `ab` と `a` を、ここでは `ab,` と `a b` を持ちます。
`quadrant-1 ab12%% c`、`%%` の前の ASCII 外の文字の並び、`x-axis L;%% c`、
点の `]` のすぐ後の `%%`、ブロックの `}` のすぐ後の `%%` は、
両方が同じに読みます。
[コメント](../diagrams/quadrant.ja.md#コメント) を参照してください。 [fixture: quadrant/div-after-x-axis-glued-comment]
[fixture: quadrant/div-after-y-axis-glued-comment]
[fixture: quadrant/div-comment-unit-letter-then-non-ascii]
[fixture: quadrant/div-comment-unit-letters-then-digit]
[fixture: quadrant/div-comment-unit-non-ascii-single]
[fixture: quadrant/div-comment-unit-punctuation]
[fixture: quadrant/div-comment-unit-word-after-space]
[fixture: quadrant/div-grid-comment-glued-point-bare]
[fixture: quadrant/div-grid-comment-glued-x-axis-right-bare]
[fixture: quadrant/div-grid-comment-glued-y-axis-top-bare]
[fixture: quadrant/div-name-comment-glued]
[fixture: quadrant/div-x-axis-comment-glued-arrow]
[fixture: quadrant/div-x-axis-comment-unit-dash]
[fixture: quadrant/div-x-axis-comment-unit-right-digit]
[fixture: quadrant/div-y-axis-comment-glued-arrow]
[fixture: quadrant/div-y-axis-comment-unit-dash]
[fixture: quadrant/div-y-axis-comment-unit-top-digit]
[fixture: quadrant/div-acc-descr-block-space-and-comment-after-brace]
[fixture: quadrant/div-acc-descr-block-tab-and-comment-after-brace]
[fixture: quadrant/div-comment-glued-digit-in-quadrant-text]
[fixture: quadrant/div-comment-glued-hash-in-quadrant-text]
[fixture: quadrant/div-comment-glued-one-letter-name]
[fixture: quadrant/div-comment-glued-tab-after-point]
[fixture: quadrant/div-acc-descr-block-empty-block-space-and-comment]
[fixture: quadrant/div-acc-descr-block-directive-space-and-comment]
[fixture: quadrant/div-after-point-style-glued-comment]
[fixture: quadrant/div-after-quadrant-glued-comment]
[fixture: quadrant/div-classdef-comment-unit-single-digit]
[fixture: quadrant/div-grid-comment-glued-quadrant-bare]
[fixture: quadrant/div-grid-comment-glued-x-axis-bare]
[fixture: quadrant/div-grid-comment-glued-y-axis-bare]
[fixture: quadrant/div-quadrant-comment-glued]
[fixture: quadrant/div-style-radius-comment-glued-one-digit]
[fixture: quadrant/div-x-axis-comment-glued-text]
[fixture: quadrant/div-y-axis-comment-glued-text]
[fixture: quadrant/db-comment-unit-two-digits]
[fixture: quadrant/db-comment-unit-non-ascii-run]
[fixture: quadrant/db-comment-glued-after-semicolon]
[fixture: quadrant/db-point-comment-glued]
[fixture: quadrant/db-comment-after-statement-brace]

## 書き手にとっての結果

文のすぐ後に空白なしで書いたコメントは、
mermaid.js では文の最後の文字と一緒に読まれることがあります。
そのとき図は拒否されるか、警告なしに、その文字のないものとして描かれます。
mmd-toolkit のパーサーは、文を書かれたとおりに読みます。
どちらも同じに読む図を書くには、コメントを独立した行に書くか、
少なくとも `%%` の前に空白を置きます。

## mermaid.js がそう読む理由

mermaid.js の字句解析器には、
この仕様と違う 2 つの規則があります（[`sequenceDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/parser/sequenceDiagram.jison#L29-L30)）。
文の状態で、数と id の規則より前に、
`}` 以外の文字に `%%` と行の残りが続くものを、
1 つのコメントとして読む規則を試します。
また、数は、空白か改行が後に続くところでだけ読みます。
ある規則が `%%` のすぐ前の文字で一致を始めるはずの場所では、
コメントの規則が先に当たり、`%%` のすぐ前の数は数として読まれません。
gantt の字句解析器は単独の `%` で同じコメントの規則を持ち（[`gantt.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/parser/gantt.jison#L29-L29)）、
タスクのテキストとタスクのデータのコロンの規則より前に試します。
journey の字句解析器は `%%` で同じコメントの規則を持ち（[`journey.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/user-journey/parser/journey.jison#L15-L15)）、
改行、空白、タスクのテキスト、タスクのデータの規則より前に試します。
timeline の字句解析器も同じ規則を持ち（[`timeline.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/timeline/parser/timeline.jison#L15-L15)）、
改行、空白、キーワード、event、period の規則より前に試します。
xychart の字句解析器も同じ規則を持ち（[`xychart.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/xychart/parser/xychart.jison#L16-L16)）、
単位が始まるところの `%%` のコメントの規則を除く、すべての規則より前に試します。
quadrant の字句解析器も同じ規則を持ち（[`quadrant.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/quadrant-chart/parser/quadrant.jison#L17-L17)）、
同じ位置で試します。

## この仕様の規則と、その理由

この仕様では、コメントはその印で始まり、
数の後には `%%` が続いてもかまいません（[文の文脈](../diagrams/sequence.ja.md#文の文脈)、
gantt の [コメント](../diagrams/gantt.ja.md#コメント)、
journey の [コメント](../diagrams/journey.ja.md#コメント)、
timeline の [コメント](../diagrams/timeline.ja.md#コメント)、
xychart の [コメント](../diagrams/xychart.ja.md#コメント)、
quadrant の [コメント](../diagrams/quadrant.ja.md#コメント) を参照）。

コメントがその前の文字を取ること、
しかもほかの規則がそこで一致を始める場所でだけ取ることは、
mermaid.js の字句解析器の規則の順から生じるもので、
仕様が構文の規則として述べるものではありません。
これは既知の差異の 2 つ目の理由に当たります（[known-divergences.ja.md](../known-divergences.ja.md) を参照）。

## mermaid.js の文書と issue

- mermaid.js の sequence 図の文書は、
  [Comments](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/sequenceDiagram.md#L680-L682) で「Comments
  need to be on their own line」と書いています。
- [Issue #6401](https://github.com/mermaid-js/mermaid/issues/6401) 「Inline
  comments cause errors when compiling」は、
  flowchart の文の後のコメントを報告しています。
  2026-10-02 の時点で open で、ラベルは `Type: Bug / Error`、`Type: Other`、
  `Close after 30 days` です。
  2026-03-02 に collaborator が、bot が書いた印のある返信で、
  文の後のコメントは文法の設計どおり未対応で、それはすべての図種に当てはまる、
  と答えています。
