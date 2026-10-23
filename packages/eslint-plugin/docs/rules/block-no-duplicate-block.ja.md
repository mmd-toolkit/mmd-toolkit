# @mmd-toolkit/block-no-duplicate-block

英語版: [block-no-duplicate-block.md](./block-no-duplicate-block.md)

ブロックをもう一度宣言することを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

id はそれぞれ 1 つのブロックを名指し、ブロックは最初に宣言した位置に置かれる。
mermaid.js は同じ id の 2 つ目の宣言をエラーなしに受理するが、
2 つ目のブロックは置かない。
`A B A` は `A` を 1 度だけ描く。
もう一度書いたラベルや形は最初の宣言のものを置き換え、
幅、複合ブロックの子、その `columns` は失われる。

## 規則の詳細

この規則は、前の文が宣言した id の宣言を報告する。
対象の図種は `block` である。

ブロックを宣言するのは、`A` や `A["Label"]:2` のように単独で書いたブロック、
`block:G` のような複合ブロックの頭、2 つのブロックを宣言する辺である。
id は大文字小文字を区別し、複合ブロックをまたいで比べ、
図の id である `root` は初めから宣言されている。
連なりやリンクを持つ複合ブロックの頭が失うブロックは宣言されない。

前に宣言した id の、単独で書いたブロックや複合ブロックの頭は、
何も置かないので報告する。
`A --> B` の後の行 `A` は何も置かず、
`block:G`、そのブロック、`end` の後の 2 つ目の `block:G` は、
そのブロックを置かずに残す。
例外は、ブロックに最初の形を与えるものである。
`A --> B` の後の文 `B["Output"]` は `B` にラベルと形を与え、報告しない。
`B["Output"]:2` のように幅を添えると、幅は失われ、その文は報告する。
ブロック矢印は例外にならない。
後の宣言は、ブロックに矢印の種類とラベルを与えるが、向きは与えない。
そのため `A` の後の文 `A<["Next"]>(down)` は、
どこも指さない矢印を与え、報告する。

前に宣言した辺のブロックはブロックそのものであり、
ブロックが持つ形と違う形のときだけ報告する。
`A["First"]` の後の辺 `A["Second"] --> B` はラベル `First` を置き換え、
`A["First"] --> B` は報告しない。
形のなかったブロックへの、辺のブロック矢印も同じく向きを失い、報告する。
形はラベルと種類で比べ、ブロック矢印は描画が使うとおりに向きでも比べる。
`(x)` は `(left, right)` と同じである。
`A["x"]`、`A["y"] --> B`、`A["x"] --> B` の後では、両方の辺を報告する。

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
