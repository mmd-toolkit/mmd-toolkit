# @mmd-toolkit/venn-no-invalid-style-key

英語版: [venn-no-invalid-style-key.md](./venn-no-invalid-style-key.md)

描画が読まないスタイルのプロパティを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

🔧
[`--fix` オプション](https://eslint.org/docs/latest/use/command-line-interface#--fix)
で自動修正できる。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

mermaid.js の描画は `fill`、`color`、`stroke`、`stroke-width`、
`fill-opacity` の 5 つのスタイルのプロパティを使う。
`Fill`、`colour`、`opacity` のようなほかの名前もエラーなしに受理するが、
描画には使わない。

## 規則の詳細

この規則は、ベン図（`venn-beta`）に当てる。
`style` 文の各プロパティ名のうち、その 5 つのどれでもないものを報告する。
名前は大文字小文字を区別し、`Fill` は報告する。
2 度書いたプロパティは 2 度報告する。

この規則は名前だけを調べ、対象は調べない。
描画は、和には `fill` と `color` だけを、文字のノードには `color` だけを使う。
文字のノードへの `style A1 fill:red` のように、
それらに 5 つのうちのほかのプロパティを書いても報告しない。
mermaid.js の文書が、5 つを集合、和、文字のノードに共通に挙げるからである。

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

## 参考

- [venn 図の構文: スタイル](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/syntax/venn.md#L125-L145)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/venn-no-invalid-style-key.ts)
- [テストのソース](../../tests/rules/venn-no-invalid-style-key.test.ts)

<!-- end auto-generated rule resources -->
