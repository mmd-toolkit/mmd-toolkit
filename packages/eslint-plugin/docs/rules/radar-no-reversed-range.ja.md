# @mmd-toolkit/radar-no-reversed-range

英語版: [radar-no-reversed-range.md](./radar-no-reversed-range.md)

図の `max` より大きい `min` を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

`min` と `max` は、中心と外側の輪の値を設定する。
最小値が最大値より大きいと、mermaid.js はエラーなしに受理し、
すべての曲線のすべての点を、値によらず外側の輪の上に描き、曲線の値は失われる。

## 規則の詳細

この規則は、レーダーチャート（`radar-beta`）に当てる。
最小値が最大値より大きく、図が描かれる曲線を持つとき、
最後の `min` と最後の `max` のうち後のものを報告する。
比べるのは最後の `min` と最後の `max` だけなので、
`min 10, max 5` の後に `min 0` や `max 20` があれば何も報告しない。

`max` のない図は、mermaid.js が曲線の最大の値を最大値とし、
この規則はそれを計算しないので報告しない。
mermaid.js が曲線を 1 つも描かない図も報告しない。
軸のない図や、値だけの曲線がどれも軸の数と違う数の値を持つ図がそうである。
最大値と等しい最小値と、
値 9 のある `min 2, max 8` のように範囲の外の値を切る範囲も報告しない。

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

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/radar-no-reversed-range.ts)
- [テストのソース](../../tests/rules/radar-no-reversed-range.test.ts)

<!-- end auto-generated rule resources -->
