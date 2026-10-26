# @mmd-toolkit/treemap-no-invalid-value

英語版:
[treemap-no-invalid-value.md](./treemap-no-invalid-value.md)

mermaid.js が別の数として読む葉の値を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

mermaid.js は、葉の値のカンマを除き、その先頭から数を読む。
エラーはなく、値の残りは捨てられ、小数点のつもりのカンマもほかとともに失われ、
葉は書いたのと違う値を得る。

## 規則の詳細

この規則は、カンマを除いた後に `_` か 2 つ以上の `.` を持つ葉の値と、
数字を持たない葉の値を報告する。
また、桁区切りのどの書き方もカンマを置かない場所にカンマを持つ値、
つまり後に数字の続く `.` の後のカンマか、
数字が続く最後のカンマの後が 3 桁でない値を報告する。
対象の図種は `treemap` である。

`1_000` は 1 と、`1.2.3` は 1.2 と読まれ、`.` は数でないと読まれて、
葉は面積も値の文字も持たない。
カンマはどこにあっても除かれるので、小数点のカンマは失われ、
`0,5` は 5、`3,14` は 314、`1.234,5` は 1.2345 と読まれる。

mermaid.js が全体を読む値は報告しない。`1000`、`.5`、`5.`、0 がそうである。
`1,000`、`1,234.5`、`1,00,000` のような桁区切りのカンマは報告せず、
`5,` や `1.5,` のように後に数字の続かないカンマも、
何も区切らないので報告しない。
`0,125` のように 3 桁の前の小数点のカンマは 125 と読まれるが、
桁区切りと同じ書き方なので、この規則は報告しない。

数は、数字と 1 つの `.` と、桁区切りのカンマで書く。

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

## 背景

[値の変換](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/treemap/valueConverter.ts#L13-L15)
は、数のカンマを除き、残りを JavaScript の `parseFloat` で読む。
`parseFloat` は、数を続けない最初の文字で止まる。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/treemap-no-invalid-value.ts)
- [テストのソース](../../tests/rules/treemap-no-invalid-value.test.ts)

<!-- end auto-generated rule resources -->
