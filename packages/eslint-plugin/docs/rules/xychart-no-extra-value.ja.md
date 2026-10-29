# @mmd-toolkit/xychart-no-extra-value

英語版: [xychart-no-extra-value.md](./xychart-no-extra-value.md)

x 軸のカテゴリーを超えるプロットの値を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

x 軸にカテゴリーがあるとき、 mermaid.js はプロットの各値を、
その位置のカテゴリーに与える。
最後のカテゴリーを超える値はカテゴリーを持たず、
mermaid.js はそれをエラーなしに捨てる。
`x-axis [jan, feb]` と `bar [10, 20, 30]` は 2 本の棒を描く。

## 規則の詳細

この規則は、`line` や `bar` の値のうち、 x 軸のカテゴリーの数を超えるものを、
1 つずつ報告する。
対象の図種は `xychart` である。

カテゴリーは、チャートの、データを持つ最後の `x-axis` の文のものであり、
その文より後のプロットをそれと比べる。
タイトルだけの `x-axis` の文はカテゴリーを残し、
カテゴリーの代わりの範囲はカテゴリーを与えないので、どのプロットも調べない。
その文より前のプロットは調べない。
mermaid.js は各プロットに、それぞれの所の x 軸を与えるので、
`bar [1, 2, 3]` の後の `x-axis [a, b]` はその値を捨てない。
[#7798](https://github.com/mermaid-js/mermaid/pull/7798)（open）は、
プロットに最後の x 軸を与え、そうしたプロットが捨てるものを変える。
これは、データの後に書いた `x-axis` がチャートを壊すという、
承認された issue のためのものである。
`x-axis [a, b, c, d]`、`bar [1]`、
`x-axis [a, b]` の後のプロット `bar [1, 2, 3]` は 3 つ目の値を捨て、報告する。
カテゴリーより少ない値は報告しない。
値のないカテゴリーは点も棒も持たず、書いたものは何も失われない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/xychart-no-extra-value: error
xychart
  x-axis [jan, feb]
  bar [10, 20, 30]
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/xychart-no-extra-value: error
xychart
  x-axis [jan, feb, mar]
  bar [10, 20, 30]
```

```mmd
%% eslint @mmd-toolkit/xychart-no-extra-value: error
xychart
  x-axis [jan, feb, mar]
  bar [10, 20]
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [xychart-no-redefined-axis](./xychart-no-redefined-axis.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/xychart-no-extra-value.ts)
- [テストのソース](../../tests/rules/xychart-no-extra-value.test.ts)

<!-- end auto-generated rule resources -->
