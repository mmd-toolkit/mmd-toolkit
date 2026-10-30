# @mmd-toolkit/xychart-no-redefined-axis

英語版: [xychart-no-redefined-axis.md](./xychart-no-redefined-axis.md)

軸のタイトルやデータを置き換える軸の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`x-axis` と `y-axis` は、軸のタイトルとデータ（カテゴリーか範囲）を設定する。
mermaid.js は同じ軸の別の文をエラーなしに受理し、
どの文もタイトルを設定し（なければ空のタイトル）、
データがあればデータを置き換えるので、前の値が失われることがある。

## 規則の詳細

この規則は、XY チャート（`xychart`、`xychart-beta`）に当てる。
同じ軸に設定済みのタイトルかデータを別の値に置き換える `x-axis` か `y-axis`
の文を報告する。
軸は別々に調べ、キーワードは大文字小文字を問わず読む。

タイトルのない文は、タイトルを空にするので、タイトルの後では報告する。
タイトルだけの文は、カテゴリーや範囲を保つので、それについては報告しない。
既存の値を失わずにタイトルやデータを足しても報告しない。
カテゴリーを範囲に置き換えると報告する。

タイトルとカテゴリーの引用符のない語は空白なしにつなぎ、
引用符の中のテキストは周囲の空白を除いて比べる。
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
