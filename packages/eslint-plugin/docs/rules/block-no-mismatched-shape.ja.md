# @mmd-toolkit/block-no-mismatched-shape

英語版: [block-no-mismatched-shape.md](./block-no-mismatched-shape.md)

開きと合わない閉じを持つ形を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

ブロックの形は、`A["x"]` や `A(("x"))` のように、開きと閉じの組で決まる。
mermaid.js は `A["x")` のような合わない組もエラーなしに受理する。
ラベルは残るが、意図した形ではなく、ただの長方形を描く。

## 規則の詳細

この規則は、ブロック図（`block-beta`、`block`）に当てる。
単独のブロックや辺の形のうち、開きは mermaid.js の知るものだが、
開きと閉じが形の組にならないものを報告する。

`A(("x")` や `A["x"]]` のような括弧の不足や余りは報告する。
左右が異なる組 `A>"x"]`、`A[/"x"\]`、`A[\"x"/]` は形を指定するので報告しない。
複合ブロックの頭は、組にかかわらず複合ブロックとして描かれるので確かめない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/block-no-mismatched-shape: error
block
  A["Start")
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/block-no-mismatched-shape: error
block
  A["Start"]
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [block-no-mismatched-edge](./block-no-mismatched-edge.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/block-no-mismatched-shape.ts)
- [テストのソース](../../tests/rules/block-no-mismatched-shape.test.ts)

<!-- end auto-generated rule resources -->
