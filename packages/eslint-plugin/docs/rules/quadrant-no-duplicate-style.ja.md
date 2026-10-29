# @mmd-toolkit/quadrant-no-duplicate-style

英語版: [quadrant-no-duplicate-style.md](./quadrant-no-duplicate-style.md)

点やクラスがもう一度与えるスタイルを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

点と `classDef` のスタイルは、コンマで区切った並びで書く。
同じスタイルを 2 度与えると、mermaid.js はエラーなしに後の値を使い、
前の値は失われる。

## 規則の詳細

この規則は、象限チャート（`quadrantChart`）に当てる。
点か `classDef` のスタイルの一覧で、
同じ一覧が前に与えた同じスタイルの値を別の値に置き換える `radius`、`color`、
`stroke-color`、`stroke-width` を報告する。
その値の繰り返しは報告しない。
点とそのクラスのスタイルは、点のスタイルが優先するので比べない。

半径は数として比べ、コロンの前後の空白は数えないので、
`radius: 05` は `radius: 5` の繰り返しである。
色と線の幅は書いたとおりに比べるので、
`stroke-color: #f00` の後の `stroke-color: f00` は報告する。
`radius: 5` と `radius: 9` の後の 3 つ目の `radius: 5` は、
9 を置き換えるので報告する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/quadrant-no-duplicate-style: error
quadrantChart
  Campaign A: [0.3, 0.6] radius: 5, color: #f00, radius: 9
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/quadrant-no-duplicate-style: error
quadrantChart
  Campaign A: [0.3, 0.6] radius: 9, color: #f00
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [quadrant-no-redefined-class](./quadrant-no-redefined-class.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/quadrant-no-duplicate-style.ts)
- [テストのソース](../../tests/rules/quadrant-no-duplicate-style.test.ts)

<!-- end auto-generated rule resources -->
