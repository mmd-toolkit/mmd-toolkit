# @mmd-toolkit/quadrant-no-invalid-coordinate

英語版: [quadrant-no-invalid-coordinate.md](./quadrant-no-invalid-coordinate.md)

0 から 1 の数でない点の座標を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

🔧
[`--fix` オプション](https://eslint.org/docs/latest/use/command-line-interface#--fix)
で自動修正できる。

<!-- end auto-generated rule notice -->

点の座標は 0 から 1 の数である。
mermaid.js は `0,3` や `0x5` もエラーなしに受理するが、
描くときは JavaScript の数として読む。
`0,3` は数でなく、`0x5` は 5 なので、点はチャートの意図した位置に描かれない。

## 規則の詳細

この規則は、象限チャート（`quadrantChart`）に当てる。
JavaScript が 0 から 1 の数（両端を含む）として読まない座標を、
それぞれ報告する。
`0,3`、`0 3`、`0b2` は数でなく、`0x5` と `003` は範囲外の数である。

`0e5` と `0b1` のような数の形は、値が 0 と 1 なので報告しない。
`1.5`、`-0.5`、`1.0` は、mermaid.js がエラーにするので報告しない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/quadrant-no-invalid-coordinate: error
quadrantChart
  Campaign A: [0,3, 0,6]
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/quadrant-no-invalid-coordinate: error
quadrantChart
  Campaign A: [0.3, 0.6]
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [journey-no-invalid-score](./journey-no-invalid-score.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/quadrant-no-invalid-coordinate.ts)
- [テストのソース](../../tests/rules/quadrant-no-invalid-coordinate.test.ts)

<!-- end auto-generated rule resources -->
