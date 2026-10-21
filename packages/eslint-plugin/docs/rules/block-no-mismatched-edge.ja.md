# @mmd-toolkit/block-no-mismatched-edge

英語版: [block-no-mismatched-edge.md](./block-no-mismatched-edge.md)

2 つの矢印が合わない、ラベルを持つ辺を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

ラベルを持つ辺は、`A -- "x" --> B` のように、ラベルの両側に矢印を書く。
mermaid.js は、辺の線と印を、ラベルの後の矢印だけから取る。
`A -- "x" ==> B` は太い線を描き、`A <-- "x" --> B` では `A` の矢じりが
エラーなしに失われる。

## 規則の詳細

この規則は、ラベルを持つ辺のうち、
ラベルの前の矢印が後の矢印と違う線を持つか、
後の矢印が持たない矢じりを始まりに持つものを報告する。
対象の図種は `block` である。

線は、実線（`--`）、太線（`==`）、点線（`-.`）であり、長い矢印も同じ線を持つ。
両端に矢じりを描くには、`A -- "x" <--> B` のようにラベルの後の矢印に書き、
これは報告しない。
両方の誤りを持つ辺は 1 度報告する。

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
