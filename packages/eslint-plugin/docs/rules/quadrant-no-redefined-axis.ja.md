# @mmd-toolkit/quadrant-no-redefined-axis

英語版: [quadrant-no-redefined-axis.md](./quadrant-no-redefined-axis.md)

軸のテキストを置き換える軸の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`x-axis` は x 軸の左と右のテキストを、
`y-axis` は y 軸の下と上のテキストを設定する。
mermaid.js は同じ軸の別の文をエラーなしに受理し、
その文が設定するテキストを置き換えるので、前のラベルが失われることがある。

## 規則の詳細

この規則は、象限チャート（`quadrantChart`）に当てる。
その軸に設定済みの空でないテキストを別の値に置き換える `x-axis` か `y-axis`
の文を報告する。
軸は別々に調べ、キーワードは大文字小文字を問わず読む。

既存のテキストを保つことや、未設定のところにテキストを足すことは報告しない。
テキストが 1 つの文は 2 つ目のテキストを保つ。
引用符の中の空白だけのテキストは空のテキストを設定するので、
`x-axis L --> R` の後の `x-axis "  " --> R` は報告する。
後にテキストのない矢印は 1 つ目のテキストの一部になるので、
`x-axis L --> R` の後の `x-axis L -->` は報告する。

テキストは周囲の空白と引用符を除いて比べ、語の間の空白は数えるが、
矢印の長さは数えない。
`x-axis A --> B` と `x-axis C --> D` の後の 3 つ目の `x-axis A --> B` は、
`C` と `D` を置き換えるので報告する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/quadrant-no-redefined-axis: error
quadrantChart
  x-axis Low Reach --> High Reach
  x-axis Low Cost --> High Cost
  A: [0.3, 0.6]
```

```mmd
%% eslint @mmd-toolkit/quadrant-no-redefined-axis: error
quadrantChart
  y-axis Low --> High
  y-axis Small
  A: [0.3, 0.6]
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/quadrant-no-redefined-axis: error
quadrantChart
  x-axis Low Reach --> High Reach
  y-axis Low Engagement --> High Engagement
  A: [0.3, 0.6]
```

```mmd
%% eslint @mmd-toolkit/quadrant-no-redefined-axis: error
quadrantChart
  x-axis Low Reach
  x-axis Low Reach --> High Reach
  A: [0.3, 0.6]
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [quadrant-no-redefined-quadrant](./quadrant-no-redefined-quadrant.ja.md)
- [xychart-no-redefined-axis](./xychart-no-redefined-axis.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/quadrant-no-redefined-axis.ts)
- [テストのソース](../../tests/rules/quadrant-no-redefined-axis.test.ts)

<!-- end auto-generated rule resources -->
