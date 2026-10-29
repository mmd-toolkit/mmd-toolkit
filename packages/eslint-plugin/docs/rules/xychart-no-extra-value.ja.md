# @mmd-toolkit/xychart-no-extra-value

英語版: [xychart-no-extra-value.md](./xychart-no-extra-value.md)

x 軸のカテゴリーを超えるプロットの値を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

x 軸にカテゴリーがあるとき、mermaid.js はプロットの各値を、
その位置のカテゴリーに与える。
最後のカテゴリーを超える値はカテゴリーを持たず、
mermaid.js はそれをエラーなしに捨てる。
`x-axis [jan, feb]` と `bar [10, 20, 30]` は 2 本の棒を描く。

## 規則の詳細

この規則は、XY チャート（`xychart`、`xychart-beta`）に当てる。
`line` か `bar` の値のうち、x 軸のカテゴリーの数を超えるものを、
それぞれ報告する。

カテゴリーは、カテゴリーか範囲を与える最後の `x-axis` の文のものである。
タイトルだけの `x-axis` はそれを残し、最後が範囲ならどのプロットも調べない。
調べるのは、その文より後のプロットだけである。
その文より前のプロットは調べない。
mermaid.js はいま、各プロットにその前に設定した x 軸を与えるので、
`bar [1, 2, 3]` の後の `x-axis [a, b]` は値を捨てないが、
開いているプルリクエスト（参考を参照）は、
代わりに最後の x 軸を与えるからである。

カテゴリーより少ない値は、書いたものが何も失われないので報告しない。

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

## 参考

- [#7798](https://github.com/mermaid-js/mermaid/pull/7798)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/xychart-no-extra-value.ts)
- [テストのソース](../../tests/rules/xychart-no-extra-value.test.ts)

<!-- end auto-generated rule resources -->
