# @mmd-toolkit/block-no-mismatched-edge

英語版: [block-no-mismatched-edge.md](./block-no-mismatched-edge.md)

2 つの矢印が合わない、ラベルを持つ辺を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

ラベルを持つ辺は、`A -- "x" --> B` のようにラベルの両側に矢印を書く。
mermaid.js は、ラベルの後の矢印だけを使って線と矢じりを描く。
ラベルの前に書いた別の線や矢じりが失われても、エラーを出さない。

## 規則の詳細

この規則は、ブロック図（`block-beta`、`block`）に当てる。
ラベルの前の矢印が後の矢印と違う線を持つか、
後の矢印が持たない矢じりを始まりに持つ、ラベル付きの辺を報告する。
両方の誤りを持つ辺は 1 度報告する。

線は実線（`--`）、太線（`==`）、点線（`-.`）であり、長い矢印も同じ線を持つ。
`A -- "x" <--> B` は、ラベルの後の矢印が両方の矢じりを指定するので報告しない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/block-no-mismatched-edge: error
block
  A -- "x" ==> B
```

```mmd
%% eslint @mmd-toolkit/block-no-mismatched-edge: error
block
  A <-- "x" --> B
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/block-no-mismatched-edge: error
block
  A == "x" ==> B
```

```mmd
%% eslint @mmd-toolkit/block-no-mismatched-edge: error
block
  A -- "x" <--> B
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [block-no-mismatched-shape](./block-no-mismatched-shape.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/block-no-mismatched-edge.ts)
- [テストのソース](../../tests/rules/block-no-mismatched-edge.test.ts)

<!-- end auto-generated rule resources -->
