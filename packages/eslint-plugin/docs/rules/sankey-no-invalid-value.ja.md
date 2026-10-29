# @mmd-toolkit/sankey-no-invalid-value

英語版: [sankey-no-invalid-value.md](./sankey-no-invalid-value.md)

mermaid.js が書いたとおりに読まないリンクの値を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

🔧
[`--fix` オプション](https://eslint.org/docs/latest/use/command-line-interface#--fix)
で自動修正できる。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

レコードの 3 つ目の欄は、リンクの値、つまり流れの大きさである。
mermaid.js は、欄の先頭から数として読み、残りをエラーなしに捨てる。
桁区切りのある `"1,234"` は値 1 であり、
`abc` のように先頭に数のない欄はまったく数でないので、リンクは大きさを持たない。

## 規則の詳細

この規則は、Sankey 図（`sankey`、`sankey-beta`）に当てる。
引用符の有無にかかわらず、両端の空白を除いて、
先頭から終わりまでが数でないリンクの値を報告する。
数とは、省略できる符号に続く、小数点と指数を持ってもよい数字か、
`Infinity` である。
そのため、`5 TWh`、`1_000`、`0x10`、`infinity` と、空白だけの値を報告する。

`+5`、`.5`、`5.`、`1e3`、`-2`、`-0`、`Infinity` のような値は報告しない。
`1 %% note` のように数の後の `%%` で始まるテキストは、
コメントとして書いたもので mermaid.js も捨てるので、報告しない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/sankey-no-invalid-value: error
sankey
Electricity grid,Homes,"1,234"
```

```mmd
%% eslint @mmd-toolkit/sankey-no-invalid-value: error
sankey
Electricity grid,Homes,unknown
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/sankey-no-invalid-value: error
sankey
Electricity grid,Homes,1234
```

```mmd
%% eslint @mmd-toolkit/sankey-no-invalid-value: error
sankey
Electricity grid,Homes,113.726 %% estimate
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [journey-no-invalid-score](./journey-no-invalid-score.ja.md)
- [sankey-no-empty-node](./sankey-no-empty-node.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/sankey-no-invalid-value.ts)
- [テストのソース](../../tests/rules/sankey-no-invalid-value.test.ts)

<!-- end auto-generated rule resources -->
