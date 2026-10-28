# @mmd-toolkit/block-no-undef

英語版: [block-no-undef.md](./block-no-undef.md)

どのブロックも持たない id への `class` の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`class A c` は、ブロック `A` にクラス `c` を与える。
書き誤ったときのように、その id を図のどのブロックも持たないとき、
mermaid.js はエラーを出さない。
その id の置かれない新しいブロックを作り、クラスは図のどのブロックにも行かない。

## 規則の詳細

この規則は、`class` の文の id のうち、図のどの文も宣言しないものを報告する。
対象の図種は `block` である。

ブロックを宣言するのは、単独で書いたブロック、複合ブロックの頭、辺であり、
図のどこでも、複合ブロックの中でも外でもよい。
図の id である `root` は初めから宣言されている。
`class` の文の後でだけ宣言する id も報告しないが、
mermaid.js はそのブロックを置かない。
class の文が先にブロックを作り、後の宣言は何も置かないからである。
これは、flowchart の頂点 `A` より前の `class A foo` と同じく、
mermaid.js の不具合に見えるものとして決めており、どの規則も報告しない。
id は大文字小文字を区別して比べるので、`class a c` はブロック `A` に届かない。
連なりやリンクを持つ複合ブロックの頭が失うブロックは宣言されない。
`A --> B --> C` の後の `class A c` は報告する。
並びの id はそれぞれ確かめ、同じ id への文はそれぞれ報告する。

クラスの名前は確かめない。
どの `classDef` も定義しないクラスも CSS のクラスとしてブロックに残り、
ページのスタイルが使える。
空白で始まる id は [block-no-spaced-class-id](./block-no-spaced-class-id.ja.md) が報告する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/block-no-undef: error
block
  A
  classDef c fill:#f00
  class Typo c
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/block-no-undef: error
block
  A
  classDef c fill:#f00
  class A c
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [block-no-spaced-class-id](./block-no-spaced-class-id.ja.md)
- [block-no-duplicate-block](./block-no-duplicate-block.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/block-no-undef.ts)
- [テストのソース](../../tests/rules/block-no-undef.test.ts)

<!-- end auto-generated rule resources -->
