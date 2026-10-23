# @mmd-toolkit/venn-no-duplicate-style

英語版: [venn-no-duplicate-style.md](./venn-no-duplicate-style.md)

同じ対象の前の値を置き換えるスタイルを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`style A fill:red, fill:blue` では、mermaid.js は `blue` だけを保つ。
後の `style A fill:blue` 文も、同じように `red` を置き換える。
描画は 1 つの対象の `style` 文を合わせ、
プロパティの後の値が前の値を置き換える。
mermaid.js はエラーを出さない。

## 規則の詳細

この規則は、同じ文か前の文で同じプロパティが対象に与えた値と違う値を
その対象に与える `fill`、`color`、`stroke`、`stroke-width`、
`fill-opacity` のプロパティを報告する。
対象の図種は `venn` である。

対象は `style` の後の名前の並びで、順を問わずに比べる。
`style B, A` は `style A, B` の対象にスタイルを付ける。
対象がまだ持たないプロパティは報告しない。
`style A fill:red` と `style A stroke:blue` は A に両方を与える。
ほかのプロパティは描画で何も変えない。
それらは比べず、
[venn-no-invalid-style-key](./venn-no-invalid-style-key.ja.md)
が報告する。

対象がすでに持つ値を与えるプロパティは報告しない。
値は、引用符の有無を問わず、書いたとおりに比べる。
`fill:red` の後の `fill:"red"` は同じで、引用符の中の空白は数える。
`fill:red` と `fill:blue` の後の 3 つ目の `fill:red` は、
`blue` を置き換えるので報告する。
mermaid.js は、引用符のない値の部分を、
空白で区切られていないところでも 1 つの空白でつなぐので、
`2px` と `2 px` は、mermaid.js には 1 つの値で、この規則には 2 つの値である。

mermaid.js は、名前と値を読む前に文字参照と HTML の属性の引用符を変え、
描画は対象の名前を `|` でつなぐので、2 つの綴りは、
mermaid.js には 1 つの値や対象で、この規則には 2 つのことがあり、
その逆もある。

対象のプロパティは、それぞれ 1 度だけ与える。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/venn-no-duplicate-style: error
venn-beta
set A
style A fill:red, fill:blue
```

```mmd
%% eslint @mmd-toolkit/venn-no-duplicate-style: error
venn-beta
set A
style A fill:red, stroke:black
style A fill:blue
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/venn-no-duplicate-style: error
venn-beta
set A
style A fill:red, stroke:black
style A color:white
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [venn-no-invalid-style-key](./venn-no-invalid-style-key.ja.md)

## 背景

[`addStyleData`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/venn/vennDB.ts#L63-L70)
は 1 つの文のプロパティの最後の値を保ち、
[`buildStyleByKey`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/venn/vennRenderer.ts#L17-L29)
は 1 つの対象の文を合わせ、後の値が前の値を置き換える。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/venn-no-duplicate-style.ts)
- [テストのソース](../../tests/rules/venn-no-duplicate-style.test.ts)

<!-- end auto-generated rule resources -->
