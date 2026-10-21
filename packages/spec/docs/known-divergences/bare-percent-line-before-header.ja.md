# bare-percent-line-before-header

英語版:
[bare-percent-line-before-header.md](./bare-percent-line-before-header.md)

図種: flowchart、class、state、er、gantt、journey、requirement、timeline、
sankey、block、c4。
この仕様と mermaid.js の [既知の差異](../known-divergences.ja.md) の 1 つです。

## 対象の構文

コメント行は、`%%` の後に `{` 以外の文字が 1 つ以上続いて
行の終わりまでのもので、
どこにあってもトリビアです（[コメント行](../common.ja.md#コメント行) を参照）。
**`%%` だけの行**は、行の空白の後の図のテキストが、`%%` と、
それに続く行終端、テキストの終わり、
またはディレクティブの始まらない `{` で始まる行です。
`%%` だけの行や、ディレクティブではない `%%{ }%%` の行がそうです。
ヘッダーの前では、検出がこの行を読んで通り過ぎ、
どの図種でもそれぞれが印 `%%` の図のコメントになります
（[図種の検出](../common.ja.md#図種の検出) を参照）。

```mmd
%%
sequenceDiagram
  A->>B: x
```

[fixture: sequence/header-after-bare-percent-line]

mermaid.js は同じ入力を違って読みます。
その検出は、後ろに改行がある `%%` を行の残りごとすべて消してヘッダーを見つけ、
その後、`%%` だけの行を残したままのテキストを検出した図の字句解析器に渡します。
その字句解析器がこの行をコメントとして読むところ
（sequence・class・state の字句解析器は `%%` だけの行をそう読みます）では、
両者が入力を受理します。
そうでないところ（er、sankey、block の字句解析器はどの行もそう読まず、
gantt、journey、requirement、timeline の字句解析器は
ヘッダーの前ではそう読みません）では
mermaid.js が入力を拒否し、この仕様は受理します。
それがこの差異です。

## 差異

どの例も、それぞれが図全体です。

1. flowchart のヘッダーの前の、`%%` だけの行:

   ```mmd
   %%
   flowchart LR
     A-->B
   ```

2. flowchart のヘッダーの前の、`%%{ }%%` の行:

   ```mmd
   %%{ }%%
   flowchart LR
     A-->B
   ```

3. state のヘッダーの前の、`%%{ }%%` の行:

   ```mmd
   %%{ }%%
   stateDiagram-v2
     [*] --> A
   ```

4. `%%` だけの行と class のヘッダーの間の、空白だけで空でない行。
   `%%`、空白 2 つの行、`classDiagram`、`class A` を 1 行ずつ
   （空白の行はコードブロックに書けません。整形が行末の空白を消すためです）。

5. 同じ形で、`%%` の行の代わりに `%%{ }%%` の行。
   `%%{ }%%`、空白 2 つの行、`classDiagram`、`class A`。

6. ER のヘッダーの前の、`%%` だけの行:

   ```mmd
   %%
   erDiagram
     A ||--o{ B : has
   ```

7. ER のヘッダーの前の `%%{ }%%` の行と、
   `%%` だけの行と ER のヘッダーの間の、空白だけで空でない行。
   `%%`、空白 2 つの行、`erDiagram`、`A`。

8. gantt のヘッダーの前の、`%%` だけの行、`%%{ }%%` の行、
   `%%` だけの行と空白 2 つの行:

   ```mmd
   %%
   gantt
     title T
   ```

9. journey のヘッダーの前の、`%%` だけの行、`%%{ }%%` の行、
   `%%` だけの行と空白 2 つの行:

   ```mmd
   %%
   journey
   A: 1
   ```

10. requirement のヘッダーの前の、`%%` だけの行、`%%{ }%%` の行、
    `%%` だけの行と空白 2 つの行:

    ```mmd
    %%
    requirementDiagram
    requirement r {
    }
    ```

11. timeline のヘッダーの前の、`%%` だけの行、`%%{ }%%` の行、
    `%%` だけの行と空白 2 つの行:

    ```mmd
    %%
    timeline
      a
    ```

12. sankey のヘッダーの前の、`%%` だけの行、`%%{ }%%` の行、
    `%%` だけの行と空白 2 つの行:

    ```mmd
    %%
    sankey
    a,b,1
    ```

13. block のヘッダーの前の、`%%` だけの行、`%%{ }%%` の行、
    `%%` だけの行と空白 2 つの行:

    ```mmd
    %%
    block-beta
      A
    ```

| 例  | mermaid.js                                              | この仕様                            |
| --- | ------------------------------------------------------- | ----------------------------------- |
| 1   | 拒否。`%%` はヘッダーの前の id                          | A から B への辺を持つ flowchart     |
| 2   | 拒否。`%%` はヘッダーの前の id                          | A から B への辺を持つ flowchart     |
| 3   | 拒否。`%%` は無視されるテキストで、`{` は何にも合わない | A への遷移を持つ state 図           |
| 4   | 拒否。空白の行は `newline` の単位                       | クラス A を持つ class 図            |
| 5   | 拒否。空白の行は `newline` の単位                       | クラス A を持つ class 図            |
| 6   | 拒否。字句解析器に `%` の規則がない                     | 関係を持つ ER 図                    |
| 7   | 拒否。字句解析器に `%` の規則がない                     | 実体 A を持つ ER 図                 |
| 8   | 拒否。改行は `newline` の単位                           | タイトル T を持つガントチャート     |
| 9   | 拒否。改行は `newline` の単位                           | タスク A を持つユーザージャーニー図 |
| 10  | 拒否。改行は `newline` の単位                           | 要求 r を持つ要求図                 |
| 11  | 拒否。改行は `newline` の単位                           | period a を持つ timeline            |
| 12  | 拒否。`%%` はヘッダーの前の欄                           | a から b へのリンクを持つ sankey 図 |
| 13  | 拒否。`%%` はヘッダーの前の id                          | ブロック A を持つ block 図          |

[fixture: flowchart/header-after-bare-percent-line] [fixture:
flowchart/header-after-empty-braces-line] [fixture:
state/header-after-empty-braces-line]
[fixture: class/header-after-bare-percent-then-whitespace-line] [fixture:
class/header-after-empty-braces-then-whitespace-line] [fixture:
er/header-after-bare-percent-line] [fixture:
er/header-after-empty-braces-line] [fixture:
er/header-after-bare-percent-line-and-whitespace-line] [fixture:
gantt/header-after-bare-percent-line] [fixture:
gantt/header-after-empty-braces-line] [fixture:
gantt/header-after-bare-percent-line-and-whitespace-line] [fixture:
journey/header-after-bare-percent-line] [fixture:
journey/header-after-empty-braces-line] [fixture:
journey/header-after-bare-percent-line-and-whitespace-line] [fixture:
requirement/header-after-bare-percent-line] [fixture:
requirement/header-after-empty-braces-line] [fixture:
requirement/header-after-bare-percent-line-and-whitespace-line] [fixture:
timeline/header-after-bare-percent-line] [fixture:
timeline/header-after-empty-braces-line] [fixture:
timeline/header-after-bare-percent-line-and-whitespace-line] [fixture:
sankey/header-after-bare-percent-line] [fixture:
sankey/header-after-empty-braces-line] [fixture:
sankey/header-after-bare-percent-line-and-whitespace-line]
[fixture: block/div-after-bare-percent-line]
[fixture: block/div-after-empty-braces-line]
[fixture: block/div-after-bare-percent-line-and-whitespace-line]

隣の形も同じに読まれます。
flowchart と state では、ディレクティブの始まらない `%%{-x}%%` や `%%{}` の行は
`%%` だけの行で、ここではコメント、mermaid.js では拒否です。
class では、タブだけの行や、ディレクティブを除くと空白だけになる行
（`  %%{init: {}}%%` など）は空白だけの行で、ここではトリビア、
mermaid.js では `newline` の単位です。
[fixture: flowchart/header-after-non-word-brace-line] [fixture:
flowchart/header-after-empty-braces-no-space] [fixture:
state/header-after-non-word-brace-line] [fixture:
state/header-after-empty-braces-no-space] [fixture:
class/header-after-bare-percent-then-tab-line] [fixture:
class/header-after-bare-percent-then-indented-directive-line]
`%%` だけの行の前にディレクティブやフロントマターがあっても変わりません。
それらはトリビアで、`%%` だけの行は上と同じに読まれます。
[fixture: flowchart/header-after-directive-then-bare-percent-line] [fixture:
flowchart/header-after-frontmatter-then-bare-percent-line]

mermaid.js が受理するところでは、両者は同じに読みます。
sequence・class・state のヘッダーの前の `%%` だけの行、
sequence・class のヘッダーの前の `%%{ }%%` の行、
そのような行と sequence・state のヘッダーの間の空白だけの行、
class でコメント行の直前にある空白だけの行（コメント領域に入ります）です。
[fixture: sequence/header-after-bare-percent-line] [fixture:
class/header-after-bare-percent-line] [fixture:
state/header-after-bare-percent-line] [fixture:
sequence/header-after-empty-braces-line] [fixture:
class/header-after-empty-braces-line] [fixture:
sequence/header-after-bare-percent-then-whitespace-line] [fixture:
class/header-after-bare-percent-then-whitespace-line-then-comment-line]
[fixture: class/header-after-bare-percent-then-empty-line]
差異は一方向です。
この仕様は mermaid.js が拒否する入力を受理し、
mermaid.js がここで受理する入力を拒否することはありません。

C4 では見出しの前で `%%` だけの行にスペースだけの行が続くと、
ここでは前置きとなり、
mermaid.js は見出しの前に改行を残して拒否します。
[fixture: c4/div-leading-percent-space-blank]

C4 の見出しの直前の裸のパーセント行と、
その後に空行だけがある形は両者とも受理します。
[fixture: c4/header-after-bare-percent-line]
[fixture: c4/header-leading-percent-blank]
[fixture: c4/header-leading-percent-before-different-header]

## 書き手にとっての意味

ヘッダーの前の `%%` だけの行や `%%{ }%%` の行を、
このツールキットはどの図種でもコメントとして読み、
mermaid.js は sequence・class・state でだけそう読み
（class では、その後に空白の行があると読みません）、
er、gantt、journey、requirement、timeline、sankey、block では読みません。
両者が同じに読む図を書くには、ヘッダーの前のコメントは `%%` の後に 1 文字以上
置いたコメント行にし、ヘッダーとの間に空白だけの行を置かないことです。

## mermaid.js がそう読む理由

[`detectType()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/detectType.ts#L36-L48)
は、後ろのどこかに改行がある `%%` を行の残りごと消し
（[`stripAnyComments()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/regexes.ts#L46-L73)）、
残ったものからヘッダーを見つけます。
検出した図の字句解析器が受け取るのは
[`preprocessDiagram()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/preprocess.ts#L58-L91)
のテキストで、その
[`cleanupComments()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/comments.ts#L6-L8)
は `%%` の後に 1 文字以上あるコメント行しか消さないので、
`%%` だけの行は字句解析器に届きます。
flowchart の字句解析器は `%%` を id として読み、
state の字句解析器は `%%` を無視されるテキストとして読んで
そこの `{` の規則を持たず、
class の字句解析器は空白だけの行を `newline` の単位として読み、
文法はヘッダーの前でそれを取りません。
er の字句解析器には `%` の規則がまったくありません。
sankey の字句解析器は `%%` を欄として読み、
文法はヘッダーの前でそれを取りません。
block の字句解析器は `%%` を id として読み、
文法はヘッダーの前でそれを取りません。
gantt、journey、requirement、timeline の字句解析器は
`%%` をコメントとして読みますが、
その後の改行を `newline` の単位として読み、
文法はヘッダーの前でそれを取りません。
open の issue
[mermaid-js/mermaid#8196](https://github.com/mermaid-js/mermaid/issues/8196)
は、検出と前処理のコメント除去の方法が食い違うことを記録しています。

## この仕様の規則とその理由

木は `%%` だけの行を、sequence 図でそうであるのと同じく、
コメント（印 `%%` の `Comment`）として持ちます。
入力は書かれたとおりに読まれ、受理されます。
mermaid.js でこの行が受理されるかどうかは、
検出がその行を消した後に見つけた図の字句解析器しだい、
つまりパイプラインの段階の順番しだいで、仕様が述べることではありません。
既知の差異の理由の 2 つ目です
（[known-divergences.ja.md](../known-divergences.ja.md) を参照）。
代わりに、すべての図種に 1 つの規則を述べ、
mermaid.js がこの理由で拒否する入力を差異とします。

## mermaid.js の文書と issue

- [構文のリファレンス](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/intro/syntax-reference.md)
  は、行コメントは `%% ` の後の行の残りを無視すること、
  すべての図の定義は図種の宣言で始まることを述べています。
  `%%` だけの行については何も述べていません。
- [mermaid-js/mermaid#8196](https://github.com/mermaid-js/mermaid/issues/8196)
  （open、2026-09-01）は、`detectType()` と `preprocessDiagram()` の
  コメント除去が違うことを記録しています。
  ヘッダーの前の `%%` の行についての issue と pull request は
  見つかりませんでした
  （2026-10-07 に `comment before diagram type`、`detectType comment`、
  `stripAnyComments`、`UnknownDiagramError comment` で検索）。

- 固定した版の
  [C4 の文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/c4.md#L7-L17)
  は例を C4 の見出しから始め、
  その前の `%%` だけの行を説明していません。
  `mermaid-js/mermaid` の issue と pull request を、
  2026-10-21 に `C4 comment header in:title,body`、
  `C4 comment "header" in:title,body`、
  `C4 "bare" comment in:title,body`、
  `stripAnyComments in:title,body` で検索したところ、
  [issue #8196](https://github.com/mermaid-js/mermaid/issues/8196)
  が見つかりました。
  この issue は C4 だけを取り上げるものではなく、
  検出時と前処理時のコメント除去の不一致を記録しています。
  C4 の見出しの前で、
  裸のパーセント行にスペースだけの行が続く形についての報告は、
  見つかりませんでした。
