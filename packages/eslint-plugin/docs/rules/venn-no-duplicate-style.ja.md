# @mmd-toolkit/venn-no-duplicate-style

英語版: [venn-no-duplicate-style.md](./venn-no-duplicate-style.md)

同じ対象の前の値を置き換えるスタイルを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

mermaid.js は同じ対象の `style` 文を合わせ、各プロパティの最後の値を保つ。
同じ文でも別々の文でも、後の値は前の値をエラーなしに置き換える。

## 規則の詳細

この規則は、ベン図（`venn-beta`）に当てる。
同じ文か別の文の、同じ対象の直前の値を変える `fill`、`color`、`stroke`、
`stroke-width`、`fill-opacity` のプロパティを報告する。
新しいプロパティや同じ値の繰り返しは報告しない。
ほかのプロパティは、
[venn-no-invalid-style-key](./venn-no-invalid-style-key.ja.md) が調べる。

対象は名前の並びを順によらず比べるので、
`style B, A` と `style A, B` は同じ対象を持つ。
値は周りの引用符を除き、書いたとおりに比べ、引用符の中の空白は数える。
引用符のない `2px` と `2 px` は、mermaid.js が各部分を同じ値につないでも、
この規則では異なる。

mermaid.js は名前と値の文字参照や HTML 属性の引用符を変換する。
これらの変換によって、mermaid.js の照合がこの規則の比較と異なることがある。

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

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/venn-no-duplicate-style.ts)
- [テストのソース](../../tests/rules/venn-no-duplicate-style.test.ts)

<!-- end auto-generated rule resources -->
