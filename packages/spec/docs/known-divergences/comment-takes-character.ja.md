# comment-takes-character

英語版: [comment-takes-character.md](./comment-takes-character.md)

図種: sequence。
これは、この仕様の mermaid.js との
[既知の差](../known-divergences.ja.md) の 1 つです。

## 構文

Mermaid の図のコメントは `%%` で始まり、その行の終わりまで続きます。
sequence 図では、ふつうはそれだけの行に書きます。

```mmd
sequenceDiagram
  Alice ->> John: Hello John, how are you?
  %% this is a comment
  John -->> Alice: Great!
```

[fixture: sequence/docs-syntax-sequence-diagram-c404e4ed]

この文書は、`autonumber 10%% c` のように、
その行のほかの文字のすぐ後に、間に空白なしで来る `%%` についてのものです。
この仕様では、コメントはその `%%` で始まり、
その前の文字は、字句解析器がそこで読むものに属します。

## 差

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

| 例  | mermaid.js             | この仕様                            |
| --- | ---------------------- | ----------------------------------- |
| 1   | メッセージと、コメント | 拒否                                |
| 2   | 拒否                   | Alice から `B%% cob` へのメッセージ |
| 3   | 拒否                   | メッセージ `%% c`                   |
| 4   | 拒否                   | 10 からの番号付け                   |
| 5   | 始まりのない番号付け   | 5 からの番号付け                    |
| 6   | 10 からの番号付け      | 同じ                                |

[fixture: sequence/div-comment-after-one-character-id] [fixture:
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

差は両方向にあります。
mermaid.js が受理しこの仕様が拒否するのは、
文かその次の単位を始める 1 文字の id、数字、`.` が、
`%%` のすぐ前にあるときです。
mermaid.js が拒否しこの仕様が受理するのは、
mermaid.js が失うものが要るときです。
id の並びの最初の文字、メッセージのテキストの前の `:`、
mermaid.js が id の並びとして読む、2 文字以上の数です。
mermaid.js のコメントの後に残ったものがまだ受理されるときは、
どちらも受理し、Db が違います。
例 5 と、`autonumber 5 2%% c`（この仕様では刻み 2、mermaid.js では 1）、
そして `A%% clice->>Bob: Hello`
（この仕様では `A%% clice` からのメッセージ、
mermaid.js ではメッセージなし）です。
[fixture: sequence/div-comment-after-one-digit-line]
[fixture: sequence/div-comment-after-first-letter-of-keyword] [fixture:
sequence/div-comment-after-dot-before-number] [fixture:
sequence/div-comment-after-fraction-number] [fixture:
sequence/div-comment-after-step-number] [fixture:
sequence/div-comment-after-id-run-first-character-line-start]

`%%` の前の `;` のように、mermaid.js が失う文字が何も変えないときは、
どちらも同じ結果で、その入力は差ではありません。
`%%` の前の空白は、例 6 のように、ほとんどの場所で両方を同じ読み方にし、
`A->>B: %% c` はどちらでもメッセージ `%% c` を持ちます。
ただし、id の並びの中では空白が残るので、
`A %% clice->>Bob: Hello` はどちらでも `A %% clice` からのメッセージです。
[fixture: sequence/lex-comment-after-semicolon] [fixture:
sequence/lex-comment-after-invalid-unit] [fixture:
sequence/lex-space-before-comment-after-text-colon] [fixture:
sequence/lex-space-before-comment-in-id-run]

`%%` が文字のすぐ後に来るかは、ディレクティブを除いた図のテキスト、
つまり両方の字句解析器が読むテキストで決まります。
`autonumber 1%%{init: {}}%%%% c0` では、`%%` は数 1 のすぐ後に来ます。
[fixture: sequence/div-comment-after-number-across-directive]

## mermaid.js がそう読む理由

mermaid.js の字句解析器には、この仕様と違う 2 つの規則があります
（[`sequenceDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/parser/sequenceDiagram.jison#L29-L30)）。
文の状態で、数と id の規則より前に、
`}` 以外の文字に `%%` と行の残りが続くものを、
1 つのコメントとして読む規則を試します。
また、数は、空白か改行が後に続くところでだけ読みます。
ある規則が `%%` のすぐ前の文字で一致を始めるはずの場所では、
コメントの規則が先に当たり、`%%` のすぐ前の数は数として読まれません。

## この仕様の規則と、その理由

この仕様では、コメントはその印で始まり、数の後には `%%` が続いてもかまいません
（[文の文脈](../diagrams/sequence.ja.md#文の文脈) を参照）。

コメントがその前の文字を取ること、
しかもほかの規則がそこで一致を始める場所でだけ取ることは、
mermaid.js の字句解析器の規則の順から生じるもので、
仕様が構文の規則として述べるものではありません。
これは既知の差の 2 つ目の理由に当たります
（[known-divergences.ja.md](../known-divergences.ja.md) を参照）。

## 書き手にとっての結果

文のすぐ後に空白なしで書いたコメントは、
mermaid.js では文の最後の文字と一緒に読まれることがあります。
そのとき図は拒否されるか、その文字なしで描かれ、何も言われません。
この道具は、文を書かれたとおりに読みます。
どちらも同じに読む図を書くには、コメントをそれぞれの行に置くか、
少なくとも `%%` の前に空白を置きます。

## mermaid.js の文書と issue

- mermaid.js の sequence 図の文書は、
  [Comments](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/sequenceDiagram.md#L680-L682)
  で「Comments need to be on their own line」と書いています。
- [Issue #6401](https://github.com/mermaid-js/mermaid/issues/6401)
  「Inline comments cause errors when compiling」は、
  flowchart の文の後のコメントを報告しています。
  2026-10-02 の時点で open で、ラベルは `Type: Bug / Error`、`Type: Other`、
  `Close after 30 days` です。
  2026-03-02 に collaborator が、bot が書いた印のある返信で、
  文の後のコメントは文法の設計どおり未対応で、
  それはすべての図種に当てはまる、と答えています。
