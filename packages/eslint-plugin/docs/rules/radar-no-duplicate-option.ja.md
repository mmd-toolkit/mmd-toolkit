# @mmd-toolkit/radar-no-duplicate-option

英語版:
[radar-no-duplicate-option.md](./radar-no-duplicate-option.md)

前の同じオプションの値を置き換えるオプションを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`showLegend`、`ticks`、`min`、`max`、`graticule` は、それぞれ 1 つの値を持つ。
図がそのどれかを 2 度与えると、mermaid.js はエラーなしに後の値を使い、
前の値は失われる。

## 規則の詳細

この規則は、図の前の同じオプションと違う値を、
同じ文か別の文で与えるオプションを報告する。
対象の図種は `radar` である。

`ticks 2, ticks 3, ticks 2` の後では、図は 2 つの輪を描き、
2 つ目と 3 つ目を報告する。
どちらもその前の値を置き換えるからである。

図がすでに持つ値を与えるオプションは報告しない。
数は数として比べ、`ticks 3` と `ticks 03.00` は 1 つの値である。
mermaid.js は輪を 32 までしか描かないので、
32 を越える `ticks` の数は 32 として比べ、
`ticks 33` の後の `ticks 34` は報告せず、`ticks 3` は報告する。

オプションごとに値を 1 つ与える。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/radar-no-duplicate-option: error
radar-beta
  axis A, B, C
  curve sales{1, 2, 3}
  ticks 2, ticks 3, ticks 2
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/radar-no-duplicate-option: error
radar-beta
  axis A, B, C
  curve sales{1, 2, 3}
  showLegend true, ticks 3, min 0, max 5, graticule circle
```

## オプション

この規則にはオプションがない。

## 背景

[`setOptions`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/radar/db.ts#L93-L117) は、
オプションごとに最後の値を保ち、輪を 32 までしか描かない。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/radar-no-duplicate-option.ts)
- [テストのソース](../../tests/rules/radar-no-duplicate-option.test.ts)

<!-- end auto-generated rule resources -->
