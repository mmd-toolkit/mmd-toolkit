# @mmd-toolkit/quadrant-no-duplicate-style

英語版: [quadrant-no-duplicate-style.md](./quadrant-no-duplicate-style.md)

点やクラスがもう一度与えるスタイルを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

点と `classDef` のスタイルは、`radius`、`color`、`stroke-color`、
`stroke-width` をコンマで区切った並びである。
mermaid.js は、並びが 2 度与えるスタイルを受理し、
後の値が前の値を黙って置き換える。
`radius: 5, radius: 9` は半径 9 を与える。
2 つ目の値は、たいてい、並びを編集した残りである。

## 規則の詳細

この規則は、点か `classDef` のスタイルのうち、
並びの中で同じ名前の最初のものより後のものを、前と違う値を与えるときに報告する。
対象の図種は `quadrantChart` である。

`color: #f00, radius: 5` の後の、同じ並びの `color: #00f` は、
色 `#00f` を与える。
点のスタイルとそのクラスのスタイルは比べない。
mermaid.js の文書が書くとおり、点のスタイルが勝つ。

並びがすでに与えた値を与えるスタイルは報告しない。
値は、mermaid.js が持つとおりに比べる。
半径は数なので、`radius: 5` の後の `radius: 05` は同じであり、
コロンの前後の空白は数えない。
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
