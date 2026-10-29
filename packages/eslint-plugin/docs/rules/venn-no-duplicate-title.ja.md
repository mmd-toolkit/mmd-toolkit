# @mmd-toolkit/venn-no-duplicate-title

英語版: [venn-no-duplicate-title.md](./venn-no-duplicate-title.md)

別のタイトルを置き換えるタイトルを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

`title` は図全体のタイトルを設定する。
mermaid.js は後の `title` をエラーなしに受理して後のタイトルだけを表示し、
前のタイトルは失われる。

## 規則の詳細

この規則は、ベン図（`venn-beta`）に当てる。
前の `title` 文が設定したタイトルを変える `title` を報告する。
現在のタイトルの繰り返しは報告しない。
フロントマターのタイトルの置換も報告しない。

キーワードは大文字小文字を問わない。
タイトルは最初の空白かタブの後の行の残りを引用符や余分な空白も含めて取るので、
`title "Audience"` は `title Audience` と異なる。
行の終わりの `title` は、次の行をタイトルとして取る。

タイトルは書いたとおりに比べるので、
文字参照や HTML 属性の引用符の違いを mermaid.js が同じに読んでも、
この規則は異なるとすることがある。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/venn-no-duplicate-title: error
venn-beta
title Audience
title Coverage
set A
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/venn-no-duplicate-title: error
venn-beta
title Audience
set A
```

## オプション

この規則にはオプションがない。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/venn-no-duplicate-title.ts)
- [テストのソース](../../tests/rules/venn-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
