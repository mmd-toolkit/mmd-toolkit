# @mmd-toolkit/block-no-undef

英語版: [block-no-undef.md](./block-no-undef.md)

どのブロックも持たない id への `class` の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`class A c` は、ブロック `A` にクラス `c` を与える。
id が書き誤りや未定義でも、mermaid.js はエラーを出さない。
その id の置かれないブロックを作り、意図したブロックにはクラスが付かない。

## 規則の詳細

この規則は、ブロック図（`block-beta`、`block`）に当てる。
`class` の文の各 id のうち、図のどの文も宣言しないものを、
同じ未定義の id を繰り返す参照も含めて報告する。
id は大文字小文字を区別する。

単独のブロック、複合ブロックの頭、辺は図のどこでもブロックを宣言し、
`root` は初めから宣言されている。
`class` の文の後の宣言も報告を防ぐが、mermaid.js はそのブロックを置かない。
辺の連なりやリンクを持つ複合ブロックの頭が失うブロックは、宣言済みと数えない。

クラス名は確かめない。
`classDef` のないクラスも、ページの CSS が使えるからである。
空白で始まる id は、
[block-no-spaced-class-id](./block-no-spaced-class-id.ja.md) が報告する。

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
