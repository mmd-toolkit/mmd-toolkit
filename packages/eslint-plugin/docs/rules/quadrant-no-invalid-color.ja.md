# @mmd-toolkit/quadrant-no-invalid-color

英語版: [quadrant-no-invalid-color.md](./quadrant-no-invalid-color.md)

点やクラスのスタイルで、`#` のない 16 進数の色を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

🔧
[`--fix` オプション](https://eslint.org/docs/latest/use/command-line-interface#--fix)
で自動修正できる。

<!-- end auto-generated rule notice -->

点の色は `color` スタイルで決まる。
mermaid.js は、ここに `#` のない 3 桁か 6 桁の 16 進数を書いてもエラーを出さず、
図にそのまま書くが、ブラウザーは `f00` を色として読まない。
点は書いた色で描かれない。

## 規則の詳細

この規則は、象限チャート（`quadrantChart`）に当てる。
点か `classDef` の `color` スタイルが、
`#` のない 3 桁か 6 桁の 16 進数のときに報告する。

`color: red` は報告しない。
16 進数でない値には mermaid.js がエラーを出すからである。
`stroke-color` スタイルは調べない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/quadrant-no-invalid-color: error
quadrantChart
  Point A: [0.3, 0.5] color: f00, radius: 12
```

```mmd
%% eslint @mmd-toolkit/quadrant-no-invalid-color: error
quadrantChart
  classDef hot color: f00
  Point A:::hot: [0.3, 0.5]
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/quadrant-no-invalid-color: error
quadrantChart
  Point A: [0.3, 0.5] color: #f00, radius: 12
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [quadrant-no-invalid-coordinate](./quadrant-no-invalid-coordinate.ja.md)

<!-- begin auto-generated rule version -->

## バージョン

この規則は、まだリリースされていない。

<!-- end auto-generated rule version -->

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/quadrant-no-invalid-color.ts)
- [テストのソース](../../tests/rules/quadrant-no-invalid-color.test.ts)

<!-- end auto-generated rule resources -->
