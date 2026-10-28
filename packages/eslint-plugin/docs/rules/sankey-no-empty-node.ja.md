# @mmd-toolkit/sankey-no-empty-node

英語版: [sankey-no-empty-node.md](./sankey-no-empty-node.md)

名前のないノードを作る、空白だけの source や target を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

レコードの最初の 2 つの欄は、リンクの source と target を名指す。
mermaid.js はそれぞれを両端の空白を除いて読むので、
空白だけの欄は空の id を名指す。
mermaid.js はそれをエラーなしに受理し、名前のないノードを、
そこへのリンクとともに図に加える。
そうした欄は、たいてい、名前を消して空白を残した残りである。

## 規則の詳細

この規則は、両端の空白を除くと空になる source や target を報告する。
対象の図種は `sankey` である。

`a, ,1` は `a` を名前の空のノードにつなぎ、`  ,b,1` もそこからつなぐ。
引用符の中の欄も同じように読む。
`" "` と、引用符の中の改行だけの欄も空の id である。
そうした欄はそれぞれ報告する。
`  ,  ,1` は 2 つ報告し、空の id へつなぐ 2 つのレコードは、
mermaid.js がノードを 1 度だけ作っても、1 つずつ報告する。
欄は、指令と、文字列の中のコメント行と、
仕様の [`style` 行と `classDef` 行](../../../spec/docs/common.ja.md#style-行と-classdef-行) の決まりが無視する `;` を除いて、
mermaid.js が読むとおりに読む。
そのため、`a, %%{init: {}}%% ,1`、 `"`、`%% c`、
`"` のようにコメント行だけの文字列、 `style:#x, ;,1` の行の target
` ;` は空の id であり、報告する。
`"  a  "` のように両端に空白のある名前は id `a` であり、報告しない。
`a,,1` のように何もない欄は mermaid.js が拒否し、規則は要らない。
空白だけの値は、
[sankey-no-invalid-value](./sankey-no-invalid-value.ja.md) が報告する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/sankey-no-empty-node: error
sankey
Electricity grid, ,104.453
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/sankey-no-empty-node: error
sankey
Electricity grid,Homes,104.453
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [journey-no-empty-person](./journey-no-empty-person.ja.md)
- [sankey-no-invalid-value](./sankey-no-invalid-value.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/sankey-no-empty-node.ts)
- [テストのソース](../../tests/rules/sankey-no-empty-node.test.ts)

<!-- end auto-generated rule resources -->
