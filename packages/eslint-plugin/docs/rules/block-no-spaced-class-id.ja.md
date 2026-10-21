# @mmd-toolkit/block-no-spaced-class-id

英語版: [block-no-spaced-class-id.md](./block-no-spaced-class-id.md)

`class` の文の id の、コンマの前後の空白を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`class A,B c` は、ブロック `A` と `B` にクラス `c` を与える。
mermaid.js は、それぞれの id をコンマの間に書いたとおりに、空白も含めて探す。
そのため `class A, B c` では id ` B` を探してブロックを見つけず、
置かれない新しいブロック `B` を作り、
図のブロック `B` はエラーなしにクラスを得ない。

## 規則の詳細

この規則は、`class` の文の id のうち空白で始まるものと、
コンマで始まるクラスの名前を報告する。
対象の図種は `block` である。

コンマの前の空白は id を終える。
`class A ,B c` の id は `A` だけで、行の残りの `,B c` はクラスの名前である。
ブロック `A` は、どの `classDef` も定義しないクラス `,B c` を得て、
どちらのブロックもクラス `c` を得ない。

コンマの後の空白、タブ、改行は同じように働き、`root` の前でも同じである。
コンマと id の間の指令は取り除かれ、
`class A,%%{init: {}}%%B c` は両方のブロックにクラスを与え、
`class A,%%{init: {}}%% B c` のような指令の後の空白は id を始め、報告する。
id は、mermaid.js の文書が `class Backend,Database back` と書くとおり、
コンマの前後に空白を置かずに書く。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/block-no-spaced-class-id: error
block
  A B
  classDef c fill:#f00
  class A, B c
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/block-no-spaced-class-id: error
block
  A B
  classDef c fill:#f00
  class A,B c
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [block-no-undef](./block-no-undef.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/block-no-spaced-class-id.ts)
- [テストのソース](../../tests/rules/block-no-spaced-class-id.test.ts)

<!-- end auto-generated rule resources -->
