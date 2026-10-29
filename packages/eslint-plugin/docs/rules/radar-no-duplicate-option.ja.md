# @mmd-toolkit/radar-no-duplicate-option

英語版: [radar-no-duplicate-option.md](./radar-no-duplicate-option.md)

前の同じオプションの値を置き換えるオプションを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

`showLegend`、`ticks`、`min`、`max`、`graticule` は、それぞれ 1 つの値を持つ。
図がそのどれかを 2 度与えると、mermaid.js はエラーなしに後の値を使い、
前の値は失われる。

## 規則の詳細

この規則は、レーダーチャート（`radar-beta`）に当てる。
前の同じオプションと違う値を、同じ文か別の文で与えるオプションを報告する。
図がすでに持つ値を繰り返すオプションは報告しない。

数は数として比べるので、`ticks 03.00` は `ticks 3` の繰り返しである。
mermaid.js は輪を 32 までしか描かないので、
`ticks 33` の後の `ticks 34` は報告せず、`ticks 3` は報告する。

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

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/radar-no-duplicate-option.ts)
- [テストのソース](../../tests/rules/radar-no-duplicate-option.test.ts)

<!-- end auto-generated rule resources -->
