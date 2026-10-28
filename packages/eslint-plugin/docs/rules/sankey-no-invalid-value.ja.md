# @mmd-toolkit/sankey-no-invalid-value

英語版: [sankey-no-invalid-value.md](./sankey-no-invalid-value.md)

mermaid.js が書いたとおりに読まないリンクの値を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

レコードの 3 つ目の欄は、リンクの値、つまり流れの大きさである。
mermaid.js は、欄の先頭から数として読み、残りをエラーなしに捨てる。
桁区切りのある `"1,234"` は値 1 であり、
`abc` のように先頭に数のない欄はまったく数でないので、リンクは大きさを持たない。

## 規則の詳細

この規則は、mermaid.js がテキストの全体を数として読まないリンクの値を報告する。
対象の図種は `sankey` である。

mermaid.js は値を、両端の空白を除いてから、
JavaScript の `parseFloat` で読む（[`sankey.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sankey/parser/sankey.jison#L55)）。
読むのは、省略できる符号と、省略できる小数点と指数を持つ数字の並び、
または `Infinity` である。
その数の後のテキストは捨てられ、規則はそれを報告する。
`"1,234"` は 1、`1_000` は 1、`1.2.3` は 1.2、`0x10` は 0、`1 2` は 1、
`1e` は 1 であり、`5 TWh` では単位が捨てられ、値は 5 である。
そうした数で始まらない値は `NaN` であり、規則はこれも報告する。
`abc`、小文字の `infinity`、ほかのレコードの前の空白だけの欄がそうである。
引用符の中の値も同じように読む。
`" 5 "` は 5 で、`"1,234"` は 1 である。

mermaid.js が全体を読む値は報告しない。
`+5`、`.5`、`5.`、`1e3`、`-2`、`-0`、`Infinity` である。
`1 %% note` のように、数の後の `%%` で始まるテキストは報告しない。
書き手はそれをコメントとして印を付けており、
mermaid.js も書き手の意図どおりにそれを捨てる。
値は、指令と、文字列の中のコメント行と、
仕様の [`style` 行と `classDef` 行](../../../spec/docs/common.ja.md#style-行と-classdef-行) の決まりが無視する `;` を除いて、
mermaid.js が読むとおりに読む。
`1%%{init: {}}%%0` は値 10 であり、 `a,style:#x,1;2` の行の値は 12 であって、
どちらも報告しない。
文字列 `"1`、コメント行、`2"` は 1、改行、`2` であり、報告する。
ほかのレコードの前の、指令と空白だけの値は、空白だけの値で、`NaN` である。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/sankey-no-invalid-value: error
sankey
Electricity grid,Homes,"1,234"
```

```mmd
%% eslint @mmd-toolkit/sankey-no-invalid-value: error
sankey
Electricity grid,Homes,unknown
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/sankey-no-invalid-value: error
sankey
Electricity grid,Homes,1234
```

```mmd
%% eslint @mmd-toolkit/sankey-no-invalid-value: error
sankey
Electricity grid,Homes,113.726 %% estimate
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [journey-no-invalid-score](./journey-no-invalid-score.ja.md)
- [sankey-no-empty-node](./sankey-no-empty-node.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/sankey-no-invalid-value.ts)
- [テストのソース](../../tests/rules/sankey-no-invalid-value.test.ts)

<!-- end auto-generated rule resources -->
