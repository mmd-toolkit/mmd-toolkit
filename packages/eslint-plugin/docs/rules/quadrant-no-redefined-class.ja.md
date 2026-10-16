# @mmd-toolkit/quadrant-no-redefined-class

英語版: [quadrant-no-redefined-class.md](./quadrant-no-redefined-class.md)

クラスのスタイルを置き換える `classDef` の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`classDef` は、点が `:::` で取るクラスを定義する。
mermaid.js は同じ名前の 2 つ目の `classDef` を受理し、
クラスは最後の定義のスタイルだけを持つ。
前の定義のスタイルは、後の定義が名前を挙げないものも含めて、
エラーなしに失われる。

## 規則の詳細

この規則は、同じ名前の最初のものより後の `classDef` の文を、
クラスが持っていたものと違うスタイルを与えるときに報告する。
対象の図種は `quadrantChart` である。

`classDef c color: #f00` の後の `classDef c radius: 9` は、
クラス `c` に半径 9 を与え、色を与えない。
クラスの名前は大文字小文字を区別して比べるので、
`classDef C` は `classDef c` と別のクラスを定義する。
キーワードは大文字小文字を問わず読む。
点の位置は数えない。
点は、先に書いてあっても、最後の定義のクラスを取る。

同じスタイルを与える定義は報告しない。
スタイルは、mermaid.js が持つとおりに比べる。
スタイルの順は数えず、半径は数なので `radius: 05` は `radius: 5` であり、
1 つの定義に 2 度書いたスタイルは最後の値を数える。
色と線の幅は書いたとおりに比べるので、`#f00` の後の `#F00` は報告する。
間に `classDef d` があっても、`classDef c` は前の `classDef c` と比べる。
`color: #f00` と `color: #00f` の `classDef c` の後の、
`color: #f00` の 3 つ目は、`#00f` を置き換えるので報告する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/quadrant-no-redefined-class: error
quadrantChart
  A:::c: [0.3, 0.6]
  classDef c color: #f00
  classDef c radius: 9
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/quadrant-no-redefined-class: error
quadrantChart
  A:::c: [0.3, 0.6]
  classDef c color: #f00, radius: 9
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [quadrant-no-duplicate-style](./quadrant-no-duplicate-style.ja.md)
- [quadrant-no-undef](./quadrant-no-undef.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/quadrant-no-redefined-class.ts)
- [テストのソース](../../tests/rules/quadrant-no-redefined-class.test.ts)

<!-- end auto-generated rule resources -->
