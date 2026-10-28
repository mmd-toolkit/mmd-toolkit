# @mmd-toolkit/venn-no-undef

英語版: [venn-no-undef.md](./venn-no-undef.md)

どの集合も和も宣言しない領域への文字のノードやスタイルを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`text` は、名指す集合の領域に文字のノードを置き、 `style` は、
名指す領域か文字のノードにスタイルを付ける。
名前を書き誤ったときのように、どの `set` も `union` もその領域を宣言しなければ、
mermaid.js はその文をエラーなしに保ち、描画は文字のノードを示さず、
何にもスタイルを付けない。

## 規則の詳細

この規則は、どの集合も和もその名前として持たない `text` の後の名前と、
どの集合も和も持たず、
文字のノードの 1 つの id でもない `style` の後の名前を報告する。
対象の図種は `venn` である。

領域は、図のどこで宣言しても数える。
mermaid.js は図全体を読んでから描くので、
その `set` より前の `text` や `style` は報告しない。
名前は、和の名前と同じく、順を問わず、繰り返しを含めて比べる。
`style A, B` は、2 つの集合ではなく A と B の和にスタイルを付けるので、
`set A` と `set B` があり、`union A, B` がなければ報告する。
3 つ以上の集合の和は、描画が足すその間の組の領域も持つ。
`union A, B, C` の後の `text A, B x` は報告しない。

名前が 1 つの `style` は、 mermaid.js の文書の `style A1 color:red` のように、
その id の文字のノードにもスタイルを付ける。
文字のノードの id は、`text` にも、名前がより多い `style` にも領域ではない。
字下げした `text` は、すぐ前の集合か和に属し、調べない。

名前は、大文字小文字を区別し、引用符の有無を問わず、書いたとおりに比べる。
mermaid.js は、`#35;` のような文字参照と HTML の属性の引用符を、
名前を読む前にほかの文字に変えるので、それだけが違う 2 つの名前は、
mermaid.js には 1 つで、この規則には 2 つのことがある。
描画は領域をその名前を `|` でつないで探すので、
`style A, B` は `"A|B"` という名前の集合にスタイルを付ける。
この規則は名前を比べて、それを報告する。

名前を直すか、`set` や `union` で領域を宣言する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/venn-no-undef: error
venn-beta
set A
text Typo A1[Review]
```

```mmd
%% eslint @mmd-toolkit/venn-no-undef: error
venn-beta
set A
set B
style A, B fill:red
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/venn-no-undef: error
venn-beta
set A
set B
union A, B
text A, B AB1[Shared]
style A, B fill:red
```

```mmd
%% eslint @mmd-toolkit/venn-no-undef: error
venn-beta
set A
text A A1[React]
style A1 color:red
```

## オプション

この規則にはオプションがない。

## 背景

描画は、
レイアウトがその領域を持つところにだけ [領域の文字のノードを置き](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/venn/vennRenderer.ts#L259-L276)、
[集合か和](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/venn/vennRenderer.ts#L121-L125) の名前か、
[文字のノードの id](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/venn/vennRenderer.ts#L354-L354) でスタイルを探す。
[`ensurePairwiseSubsets`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/venn/vennRenderer.ts#L393-L435) は、
より大きな和の組を足す。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/venn-no-undef.ts)
- [テストのソース](../../tests/rules/venn-no-undef.test.ts)

<!-- end auto-generated rule resources -->
