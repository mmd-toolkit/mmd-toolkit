# @mmd-toolkit/radar-no-undef

英語版: [radar-no-undef.md](./radar-no-undef.md)

どの軸も名指さない曲線の値を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`A: 1` のように軸とともに書いた曲線の値は、その軸の値を与える。
どの `axis` 文もその名前を宣言しないと、mermaid.js はエラーなしにその値を捨て、
値は失われる。

## 規則の詳細

この規則は、図のどの `axis` 文も宣言しない軸の名前を持つ曲線の値を報告する。
対象の図種は `radar` である。

`axis A, B, C` の後では、`curve sales{A: 1, B: 2, C: 3, D: 9}` の値 `D: 9` は
点を与えず、曲線は `1`、`2`、`3` から描かれる。

名前は大文字小文字を区別して比べ、軸はラベルではなく id で名指す。
`axis A["North"]` の後では、値 `North: 1` はどの軸も名指さない。
曲線の後の `axis` 文も名前を宣言する。
宣言した軸の値を欠く曲線は、mermaid.js が受理しない。

軸の名前を直すか、その値を取り除く。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/radar-no-undef: error
radar-beta
  axis A, B, C
  curve sales{A: 1, B: 2, C: 3, D: 9}
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/radar-no-undef: error
radar-beta
  axis A, B, C
  curve sales{C: 3, A: 1, B: 2}
```

## オプション

この規則にはオプションがない。

## 背景

[`computeCurveEntries`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/radar/db.ts#L75-L91)
は、宣言した軸ごとにそれを名指す最初の値を取り、ほかの値を除く。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/radar-no-undef.ts)
- [テストのソース](../../tests/rules/radar-no-undef.test.ts)

<!-- end auto-generated rule resources -->
