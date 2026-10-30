# @mmd-toolkit/venn-no-undef

英語版: [venn-no-undef.md](./venn-no-undef.md)

どの集合も和も宣言しない領域への文字のノードやスタイルを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`text` は名指した領域に文字を置き、
`style` は領域や文字のノードにスタイルを付ける。
どの `set` も `union` もその領域を宣言しなければ、
mermaid.js は文をエラーなしに受理するが、文字を描かず、スタイルも付けない。

## 規則の詳細

この規則は、ベン図（`venn-beta`）に当てる。
どの集合も和も宣言しない `text` の後の名前と、
領域でも文字のノードの単独の id でもない `style` の後の名前を報告する。
図のどこでの宣言も数えるので、宣言より前の文も報告しない。

領域の名前は順によらず、繰り返しを含めて比べる。
`style A, B` は和を指すので、別々の `set A` と `set B` の宣言だけでは足りない。
3 つ以上の集合の和は各組の領域も与えるので、
`union A, B, C` の後の `text A, B x` は報告しない。

名前が 1 つの `style` は文字のノードの id を指せるが、
その id は `text` や複数名の `style` には領域ではない。
字下げした `text` は直前の集合や和に属し、調べない。

名前は大文字小文字を区別し、周りの引用符を除いて書いたとおりに比べる。
文字参照や HTML 属性の引用符によって、mermaid.js と照合が異なることがある。

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

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/venn-no-undef.ts)
- [テストのソース](../../tests/rules/venn-no-undef.test.ts)

<!-- end auto-generated rule resources -->
