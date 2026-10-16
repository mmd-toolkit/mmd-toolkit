# percent-brace-after-unit

英語版:
[percent-brace-after-unit.md](./percent-brace-after-unit.md)

図種: gantt。この仕様の mermaid.js からの
[既知の差異](../known-divergences.ja.md) の 1 つです。

## 構文

ディレクティブは `%%{init: {}}%%` のように `%%{` と `}%%` の間に書きます
（[ディレクティブの位置](../common.ja.md#ディレクティブの位置)
を参照）。
`%%{ }%%`、`%%{}`、`%%{-x}%%`、行末の `%%{` だけのように、
語の続かない `%%{` はディレクティブを始めず、テキストに残ります。
ガントチャートでは、文の後の独立した行のそのようなテキストは
図のコメントです。

```mmd
gantt
  a : 1d
  %%{ }%%
  b : 2d
```

[fixture: gantt/lex-percent-brace-line-after-task]

この文書は、mermaid.js が直接たどり着く
（[コメント](../diagrams/gantt.ja.md#コメント) の定め）そのような `%%{`
についてのものです。
その行の単位の直後、先頭の改行を除いてちょうど 1 文字を残さない
2 文字以上の空白の後、直接たどり着いた `%` のコメントが取る改行の後です。
この仕様では、ディレクティブを始めないどの `%%{` も、
単位の始まる位置ではコメントです。

## 差異

どの例も、ガントチャートの全体です。

1. ヘッダーの直後の `%%{ }%%`:

   ```mmd
   gantt%%{ }%%
     title T
   ```

2. キーワードの直後の `%%{ }%%`:

   ```mmd
   gantt
     inclusiveEndDates%%{ }%%
     title T
   ```

3. リンクの文字列の直後の `%%{ }%%`:

   ```mmd
   gantt
     a : id1, 2024-01-01, 1d
     click id1 href "u"%%{ }%%
   ```

4. 改行と空白 2 つの後の `%%{ }%%`:

   ```mmd
   gantt
     title T
       %%{ }%%
   ```

5. 空行の後の `%%{ }%%`:

   ```mmd
   gantt
     title T

     %%{ }%%
   ```

6. ヘッダーの直後に続く `%` のコメントの次の行の `%%{ }%%`:
   `gantt% c`、改行、`%%{ }%%`。

7. 改行と空白 1 つの後の `%%{ }%%`:

   ```mmd
   gantt
     title T
    %%{ }%%
   ```

| 例  | mermaid.js | この仕様                  |
| --- | ---------- | ------------------------- |
| 1   | 拒否       | タイトル T を持つチャート |
| 2   | 拒否       | 終了日を含めるチャート    |
| 3   | 拒否       | リンクを持つチャート      |
| 4   | 拒否       | タイトル T を持つチャート |
| 5   | 拒否       | タイトル T を持つチャート |
| 6   | 拒否       | 文のないチャート          |
| 7   | 同じ       | タイトル T を持つチャート |

[fixture: gantt/div-percent-brace-glued-after-header] [fixture:
gantt/div-percent-brace-glued-after-keyword] [fixture:
gantt/div-percent-brace-glued-after-string] [fixture:
gantt/div-percent-brace-after-two-spaces] [fixture:
gantt/div-percent-brace-after-blank-line] [fixture:
gantt/div-percent-brace-after-glued-percent-comment] [fixture:
gantt/lex-percent-brace-after-line-feed-space]

ほかの形も同じに読まれます。
ヘッダーの直後の `%%{}` と `%%{`、曜日名、説明ブロック、
空の説明ブロックの直後の `%%{ }%%`、空白と改行の後、
`%` のコメント行と空行の後の `%%{ }%%` はここではコメントで、
mermaid.js は拒否します。
一方、改行とタブの後、単位と空白 1 つの後（行の残りを取ります）、
`%` のコメント行の次の行、click の文の後の `%%{ }%%` と、
独立した行の `%%{}` や `%%{-x}%%` はどちらでもコメントです。
[fixture: gantt/div-percent-brace-glued-empty-after-header] [fixture:
gantt/div-percent-brace-open-glued-after-header] [fixture:
gantt/div-percent-brace-glued-after-day] [fixture:
gantt/div-percent-brace-glued-after-block] [fixture:
gantt/div-percent-brace-glued-after-empty-block] [fixture:
gantt/div-percent-brace-after-space-line-feed] [fixture:
gantt/div-percent-brace-after-percent-comment-blank-line] [fixture:
gantt/lex-percent-brace-after-tab] [fixture:
gantt/lex-percent-brace-after-unit-space] [fixture:
gantt/lex-percent-brace-after-percent-comment-line] [fixture:
gantt/lex-percent-brace-after-call-line-feed] [fixture:
gantt/lex-percent-brace-after-href-space] [fixture:
gantt/lex-percent-brace-empty-line] [fixture:
gantt/lex-percent-brace-non-word-line]
差異は一方向です。
この仕様は mermaid.js が拒否する入力を受理し、
mermaid.js がここで受理する入力を拒否することはありません。
タイトルのテキスト、タスクのデータ、ほかのテキストの中の `%%{` は
どちらでもテキストです。
[fixture: gantt/lex-percent-brace-in-title-text] [fixture:
gantt/lex-percent-brace-in-task-data]

## 書き手にとっての結果

ディレクティブでない `%%{` を、このツールキットはコメントとして読み、
mermaid.js は、改行、空白文字 1 つ、またはほかの文字がその直前にあるところで
だけそう読みます。
どちらも同じに読むチャートを書くには、
`%%{init: {}}%%` のように `%%{` の後に名前のあるディレクティブを書き、
`%%{` で始まるほかのものを書かないことです。

## mermaid.js がそう読む理由

この図の mermaid.js の字句解析器の最初の規則は `%%{` を読んで
`open_directive` という名前の状態に入り
（[`gantt.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/parser/gantt.jison#L18-L18)）、
字句解析器はその状態を宣言しておらず、文法の取らないトークンを返します。
この規則は、mermaid.js がディレクティブをテキストから除くようになる前、
字句解析器が自分でディレクティブを読んでいた頃の名残です。
mermaid.js は字句解析器が走る前にすべてのディレクティブを除くので、
この規則はディレクティブを始めない `%%{` にだけ出会い、入力は拒否されます。
この規則が試されるのは、字句解析器が `%%{` に直接立つところだけです。
`}` 以外の 1 文字、つまり改行、空白、テキストの文字がその直前にあるところでは、
後の規則がその文字、`%`、行の残りを 1 つのコメントとして読み
（[`gantt.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/parser/gantt.jison#L29-L29)）、
入力は受理されます。
字句解析器が `%%{` に直接立つのは、その直前で終わる単位の後、
click の状態を出る 1 つの空白文字の後、
改行の規則と空白の規則がまとめて読む 2 つ以上の空白文字の並びの後
（先頭の改行を除いてちょうど 1 文字が残るときを除く）、
そのようにたどり着いた `%` のコメントが取る改行の後です
（[`gantt.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/parser/gantt.jison#L30-L30)）。

## この仕様の規則と、その理由

この仕様では、ディレクティブを始めない `%%{` は、`%%` と同じく、
単位の始まるどの位置でも図のコメントです
（[コメント](../diagrams/gantt.ja.md#コメント) を参照）。
木はそれを印 `%%` のコメントとして持ち、入力は書かれたとおりに読まれます。
mermaid.js がそれを受理するかどうかは、
その字句解析器が `%%{` の前に最後にどの文字を読んだかしだい、
つまりその字句解析器の規則の順しだいで、
仕様が構文の規則として述べるものではありません。
既知の差異の理由の 2 つ目です
（[known-divergences.ja.md](../known-divergences.ja.md) を参照）。
mermaid.js がこの理由で拒否する入力が差異です。

## mermaid.js の文書と issue

- mermaid.js のガントチャートの文書は、
  [Comments](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/gantt.md#L319-L322)
  で、コメントは「need to be on their own line and must be prefaced with `%%`」
  と書き、`%%{` については何も書いていません。
- 2026-10-08 に、mermaid-js/mermaid の issue と pull request を
  「gantt open_directive」「gantt %%{」「gantt directive」「gantt percent」で
  検索しましたが、この挙動を報告するものはありません。
