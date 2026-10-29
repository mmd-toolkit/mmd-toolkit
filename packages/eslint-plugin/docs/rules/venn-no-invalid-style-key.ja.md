# @mmd-toolkit/venn-no-invalid-style-key

英語版: [venn-no-invalid-style-key.md](./venn-no-invalid-style-key.md)

描画が読まないスタイルのプロパティを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

venn の図の描画は、mermaid.js の文書が挙げる 5 つのスタイルのプロパティ `fill`、
`color`、`stroke`、`stroke-width`、`fill-opacity` を読む。
mermaid.js は、`Fill`、`colour`、
`opacity` のようなほかのプロパティもエラーなしに保ち、描画はそれを使わない。

## 規則の詳細

この規則は、`style` 文のプロパティのうち、 5 つのどれでもないものの名前を、
それぞれ報告する。
対象の図種は `venn` である。
名前は大文字小文字を区別して比べ、`Fill` は報告する。
2 度書いたプロパティは 2 度報告する。

この規則は、どのプロパティを対象が使うかを調べない。
描画は文字のノードには `color` だけを読むが、 mermaid.js の文書は、
文字のノードがどのプロパティを取るかを述べていない。

5 つのプロパティのどれかを、小文字で書く。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/venn-no-invalid-style-key: error
venn-beta
set A
style A Fill:red, opacity:0.5
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/venn-no-invalid-style-key: error
venn-beta
set A
style A fill:red, fill-opacity:0.5
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [venn-no-duplicate-style](./venn-no-duplicate-style.ja.md)

## 背景

[`addStyleData`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/venn/vennDB.ts#L63-L70)
は、すべてのプロパティを書いたとおりの名前で保つ。
描画は、
[集合](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/venn/vennRenderer.ts#L121-L168)、
[和](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/venn/vennRenderer.ts#L171-L230)、
[文字のノード](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/venn/vennRenderer.ts#L354-L371)
について 5 つのプロパティを読む。
[mermaid.js の文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/venn.md#L125-L145)
はそれらを挙げる。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/venn-no-invalid-style-key.ts)
- [テストのソース](../../tests/rules/venn-no-invalid-style-key.test.ts)

<!-- end auto-generated rule resources -->
