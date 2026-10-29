# @mmd-toolkit/block-no-duplicate-block

英語版: [block-no-duplicate-block.md](./block-no-duplicate-block.md)

ブロックをもう一度宣言することを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

id はそれぞれ、最初に宣言した位置に置かれる 1 つのブロックを名指す。
mermaid.js は再宣言をエラーなしに受理するが、2 つ目のブロックは置かない。
後のラベルや形は前のものを置き換え、幅、複合ブロックの子、
その `columns` は失われる。

## 規則の詳細

この規則は、ブロック図（`block-beta`、`block`）に当てる。
単独で書いたブロックや複合ブロックの頭の、重複する宣言を報告する。
単独の宣言、複合ブロックの頭、辺がブロックを宣言し、
id は複合ブロックをまたいで大文字小文字を区別して比べ、
`root` は初めから宣言されている。
辺の連なりやリンクを持つ複合ブロックの頭が失うブロックは宣言されない。

`A --> B` の後の `B["Output"]` のように、
ブロックに最初の形を与える宣言は報告しない。
そこで幅を添えると、幅は失われるので報告する。
ブロック矢印はこの例外に当たらない。
単独でも辺でも、ブロックに最初の形を与えるときは、向きが失われるので報告する。

辺に書いた、前に宣言したブロックは、
書いた形がその時点でブロックが持つ形と違うときだけ報告する。
形はラベルと種類で比べ、ブロック矢印は描かれる向きでも比べるので、
`(x)` は `(left, right)` と同じである。
`A["x"]` の後の `A["y"] --> B` と、さらに続く `A["x"] --> B` は両方報告する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/block-no-duplicate-block: error
block
  columns 2
  A B
  A
```

```mmd
%% eslint @mmd-toolkit/block-no-duplicate-block: error
block
  A["First"]
  A["Second"]
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/block-no-duplicate-block: error
block
  A --> B
  B["Output"]
```

```mmd
%% eslint @mmd-toolkit/block-no-duplicate-block: error
block
  A["First"]
  A["First"] --> B
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [block-no-useless-width](./block-no-useless-width.ja.md)
- [block-no-undef](./block-no-undef.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/block-no-duplicate-block.ts)
- [テストのソース](../../tests/rules/block-no-duplicate-block.test.ts)

<!-- end auto-generated rule resources -->
