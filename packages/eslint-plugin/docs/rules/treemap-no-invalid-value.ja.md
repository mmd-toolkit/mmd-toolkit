# @mmd-toolkit/treemap-no-invalid-value

英語版: [treemap-no-invalid-value.md](./treemap-no-invalid-value.md)

mermaid.js が別の数として読む葉の値を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

🔧
[`--fix` オプション](https://eslint.org/docs/latest/use/command-line-interface#--fix)
で自動修正できる。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

mermaid.js は、葉の値のカンマを除き、その先頭から数を読む。
エラーはなく、値の残りは捨てられ、小数点のつもりのカンマもほかとともに失われ、
葉は書いたのと違う値を得る。

## 規則の詳細

この規則は、ツリーマップ（`treemap`、`treemap-beta`）に当てる。
カンマを除いた後に `_` か 2 つ以上の `.` を持つ葉の値と、
数字を持たない葉の値を報告する。
`1.5,5` のように `.` より後に、後に数字の続くカンマがある値と、
`1,00` のように `.` より前で、
後に数字の続く最後のカンマの後が 3 桁でない値も報告する。

`1000`、`.5`、`5.`、0 のような整数や小数は報告しない。
`1,000`、`1,234.5`、`1,00,000` のような桁区切りと、
`5,` や `1.5,` のように後に数字の続かないカンマは報告しない。
`0,125` のように 3 桁の前の小数点のカンマは 125 と読まれるが、
桁区切りと同じ形なので報告しない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/treemap-no-invalid-value: error
treemap
  "Revenue": 1_000
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/treemap-no-invalid-value: error
treemap
  "Revenue": 1,000
```

## オプション

この規則にはオプションがない。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/treemap-no-invalid-value.ts)
- [テストのソース](../../tests/rules/treemap-no-invalid-value.test.ts)

<!-- end auto-generated rule resources -->
