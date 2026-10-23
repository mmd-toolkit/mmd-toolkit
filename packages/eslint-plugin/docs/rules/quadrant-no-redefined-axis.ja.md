# @mmd-toolkit/quadrant-no-redefined-axis

英語版: [quadrant-no-redefined-axis.md](./quadrant-no-redefined-axis.md)

軸のテキストを置き換える軸の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`x-axis` は x 軸の左と右のテキストを、
`y-axis` は y 軸の下と上のテキストを設定する。
mermaid.js は同じ軸の 2 つ目の文を受理し、
最初の文が設定したものを黙って置き換える。
どの文も 1 つ目のテキストを設定し、
テキストを 2 つ持つ文は 2 つ目も設定する。

## 規則の詳細

この規則は、同じ軸の最初のものより後の `x-axis` や `y-axis` の文を、
その軸の前の文が設定したテキストを別の値に置き換えるときに報告する。
対象の図種は `quadrantChart` である。

`x-axis Low --> High` の後の `x-axis Cost --> Value` は、
両方のテキストを置き換え、
`x-axis Cheap` は左のテキストを置き換えて `High` を残す。
後にテキストのない矢印は、1 つ目のテキストに矢印を足す。
`x-axis L --> R` の後の `x-axis L -->` は、
左のテキストを `L ⟶` にするので報告する。
空白だけを持つ引用符の中のテキストは、空のテキストを設定する。
`x-axis L --> R` の後の `x-axis "  " --> R` は、
左のテキストを空にするので報告する。
キーワードは大文字小文字を問わず読み、x 軸と y 軸は別々に数える。

何も失わない文は報告しない。
`x-axis Low --> High` の後の `x-axis Low` は両方のテキストを残し、
`x-axis Low` の後の `x-axis Low --> High` は、左のテキストを残して右を足す。
空だったテキストも失われない。
テキストは、mermaid.js が持つとおりに、両端の空白を除いて比べるので、
`x-axis Low --> High` の後の `x-axis "Low" --> " High "` は、
同じテキストを設定する。
語の間の空白は数えるので、
`x-axis Low  cost` の後の `x-axis Low cost` は報告する。
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
