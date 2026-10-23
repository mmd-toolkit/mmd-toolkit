# @mmd-toolkit/sequence-no-ignored-text

英語版: [sequence-no-ignored-text.md](./sequence-no-ignored-text.md)

mermaid.js が何も読まない行を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`)` や `/` のように、文が始まる場所にあって文を始めない文字は、文ではない。
mermaid.js はそれを受理し、エラーなしに捨てるので、
書いたものは何の効果も持たない。
そうした文字は、それだけの行にも、
`) A ->> B: x` のように同じ行の文の前にも、
同じ行のブロックの `end` の後にも置ける。

## 規則の詳細

この規則は、そうした文字を 1 文字ずつ報告する。
対象の図種は `sequence` である。
行 `) )` はそうした文字を 2 つ持ち、報告は 2 つになる。

こうした文字は、たいてい、メッセージの終わりを次の行に書いたときに生じる。
メッセージは次の行に続かない。
`A ->> B: call(x`、改行、`)` のメッセージは `call(x` で、`)` は捨てられる。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/sequence-no-ignored-text: error
sequenceDiagram
  A ->> B: call(x
  )
  B -->> A: done
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/sequence-no-ignored-text: error
sequenceDiagram
  A ->> B: call(x)
  B -->> A: done
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart-no-ignored-text](./flowchart-no-ignored-text.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/sequence-no-ignored-text.ts)
- [テストのソース](../../tests/rules/sequence-no-ignored-text.test.ts)

<!-- end auto-generated rule resources -->
