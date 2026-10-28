# @mmd-toolkit/radar-no-reversed-range

英語版:
[radar-no-reversed-range.md](./radar-no-reversed-range.md)

図の `max` より大きい `min` を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`min` と `max` は、中心と外側の輪の値を設定する。
最小値が最大値より大きいと、mermaid.js はエラーなしに受理し、
すべての曲線のすべての点を、値によらず外側の輪の上に描き、曲線の値は失われる。

## 規則の詳細

この規則は、最小値が最大値より大きく、図が描かれる曲線を持つとき、
図の最後の `min` と最後の `max` のうち後のものを報告する。
対象の図種は `radar` である。

`min 10, max 5` の後では、曲線 `{1, 2, 3}` と `{8, 4, 2}` は、
どの点も外側の輪の上にあり、同じに描かれる。
範囲を増える向きにする後の `min 0` や `max 20` は報告しない。

`max` のない図は報告しない。
そのとき mermaid.js は曲線の最大の値を最大値とし、規則はそれを計算しないので、
`max` がなく値が 3 までで `min 10` のときは、点は外側の輪に来るが、
規則は何も報告しない。
軸の数と違う数の値の曲線のように、描かれる曲線のない図も報告しない。
最大値と等しい最小値は報告せず、
値 9 のある `min 2, max 8` のように範囲の外の値を切る範囲も報告しない。

`max` より小さい `min` を書く。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/radar-no-reversed-range: error
radar-beta
  axis A, B, C
  curve sales{1, 2, 3}
  min 10, max 5
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/radar-no-reversed-range: error
radar-beta
  axis A, B, C
  curve sales{1, 2, 3}
  min 0, max 5
```

## オプション

この規則にはオプションがない。

## 背景

[`relativeRadius`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/radar/renderer.ts#L175-L184) は、
値をまず最小値で、次に最大値で抑えるので、
最小値が最大値より大きいとすべての値が最大値になり、外側の輪に来る。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/radar-no-reversed-range.ts)
- [テストのソース](../../tests/rules/radar-no-reversed-range.test.ts)

<!-- end auto-generated rule resources -->
