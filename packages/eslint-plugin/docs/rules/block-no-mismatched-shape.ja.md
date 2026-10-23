# @mmd-toolkit/block-no-mismatched-shape

英語版: [block-no-mismatched-shape.md](./block-no-mismatched-shape.md)

開きと合わない閉じを持つ形を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

ブロックの形は、正方形の `A["x"]` や円の `A(("x"))` のように、
開きと閉じの組で決まる。
mermaid.js は `A["x")` のような別の閉じを持つ開きもエラーなしに受理し、
ラベルを残すが、ブロックは形を持たず、ただの長方形に描かれる。

## 規則の詳細

この規則は、開きが mermaid.js の知るもので、
開きと閉じの組が形を与えない形を報告する。
対象の図種は `block` であり、単独で書いたブロックにも辺のブロックにも当てる。

`A(("x")` のような括弧の不足と、`A["x"]]` のような括弧の余りは報告する。
mermaid.js の文書が左右の違う組として挙げる `A>"x"]` と、
2 つの台形 `A[/"x"\]`、`A[\"x"/]` は報告しない。
複合ブロックの頭は、組にかかわらず複合ブロックとして描かれるので、確かめない。

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
