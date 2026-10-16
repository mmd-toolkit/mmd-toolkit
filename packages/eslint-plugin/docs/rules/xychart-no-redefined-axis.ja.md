# @mmd-toolkit/xychart-no-redefined-axis

英語版: [xychart-no-redefined-axis.md](./xychart-no-redefined-axis.md)

軸のタイトルやデータを置き換える軸の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`x-axis` と `y-axis` は、軸のタイトルとデータ（カテゴリーか範囲）を設定する。
mermaid.js は同じ軸の 2 つ目の文を受理し、
最初の文が設定したものを黙って置き換える。
どの文もタイトルを設定し、タイトルを持たなければ空のタイトルを設定する。
データを持つ文は、データを置き換える。

## 規則の詳細

この規則は、同じ軸の最初のものより後の `x-axis` や `y-axis` の文を、
その軸の前の文が設定したタイトルやデータを別の値に置き換えるときに報告する。
対象の図種は `xychart` である。

`x-axis Month [jan, feb]` の後の `x-axis Year [2023, 2024]` は、
軸にタイトル `Year` とカテゴリー `2023`、`2024` を与える。
`y-axis Revenue` の後の `y-axis 0 --> 100` は、範囲と空のタイトルを与え、
タイトル `Revenue` は失われる。
`x-axis [a, b]` の後の `x-axis 0 --> 10` は、カテゴリーを範囲に置き換える。
キーワードは大文字小文字を問わず読み、x 軸と y 軸は別々に数える。

何も失わない文は報告しない。
`x-axis [a, b]` の後の `x-axis Month` は、タイトルを足してカテゴリーを残し、
`y-axis T` の後の `y-axis T 0 --> 10` は、タイトルを残して範囲を足す。
値は、mermaid.js が持つとおりに比べる。
語のタイトルやカテゴリーは語の間の空白を除いてつなぎ、
引用符の中のテキストは両端の空白を除いて読むので、
`x-axis T [a]` の後の `x-axis "T" ["a"]` は同じ軸を設定する。
`x-axis A [a]` と `x-axis B [b]` の後の 3 つ目の `x-axis A [a]` は、
`B` と `b` を置き換えるので報告する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/xychart-no-redefined-axis: error
xychart
  x-axis Month [jan, feb]
  x-axis Year [2023, 2024]
  line [1, 2]
```

```mmd
%% eslint @mmd-toolkit/xychart-no-redefined-axis: error
xychart
  y-axis Revenue
  y-axis 0 --> 100
  line [1, 2]
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/xychart-no-redefined-axis: error
xychart
  x-axis Month [jan, feb]
  y-axis Revenue 0 --> 100
  line [1, 2]
```

```mmd
%% eslint @mmd-toolkit/xychart-no-redefined-axis: error
xychart
  x-axis [jan, feb]
  x-axis Month
  line [1, 2]
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [xychart-no-duplicate-title](./xychart-no-duplicate-title.ja.md)
- [xychart-no-extra-value](./xychart-no-extra-value.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/xychart-no-redefined-axis.ts)
- [テストのソース](../../tests/rules/xychart-no-redefined-axis.test.ts)

<!-- end auto-generated rule resources -->
