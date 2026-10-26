# @mmd-toolkit/radar-no-duplicate-entry

英語版:
[radar-no-duplicate-entry.md](./radar-no-duplicate-entry.md)

曲線の前の値が持つ軸に、別の値を与える曲線の値を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

曲線は軸ごとに 1 つの値を持つ。
曲線が軸を別の値で 2 度名指すと、mermaid.js はエラーなしに最初の値を使い、
後の値は失われる。

## 規則の詳細

この規則は、同じ曲線のその軸の最初の値と違う値を軸に与える曲線の値を報告する。
対象の図種は `radar` である。

1 つの曲線の `A: 1, A: 9, A: 9, A: 1` の後では、曲線は `A` に値 `1` を持ち、
`9` を持つ 2 つの値を報告する。
それぞれの値は、その前の値ではなく最初の値と比べる。
曲線はそれぞれ自分の値を持つ。

最初の値と同じ値を与える値は何も失わず、報告しない。
値は数として比べ、`1.0` と `01.00` は 1 つの値である。
どの軸も宣言しない名前の値は、
代わりに [radar-no-undef](./radar-no-undef.ja.md) が報告する。

曲線ごとに、軸ごとに値を 1 つ与える。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/radar-no-duplicate-entry: error
radar-beta
  axis A, B, C
  curve sales{A: 1, B: 2, C: 3, A: 9}
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/radar-no-duplicate-entry: error
radar-beta
  axis A, B, C
  curve sales{A: 9, B: 2, C: 3}
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [radar-no-undef](./radar-no-undef.ja.md)

## 背景

[`computeCurveEntries`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/radar/db.ts#L75-L91)
は、宣言した軸ごとにそれを名指す最初の値を取る。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/radar-no-duplicate-entry.ts)
- [テストのソース](../../tests/rules/radar-no-duplicate-entry.test.ts)

<!-- end auto-generated rule resources -->
