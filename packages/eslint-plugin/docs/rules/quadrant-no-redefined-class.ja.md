# @mmd-toolkit/quadrant-no-redefined-class

英語版: [quadrant-no-redefined-class.md](./quadrant-no-redefined-class.md)

クラスのスタイルを置き換える `classDef` の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

`classDef` は、点が `:::` で取るクラスを定義する。
mermaid.js は同じ名前の 2 つ目の `classDef` を受理し、
クラスは最後の定義のスタイルだけを持つ。
前の定義のスタイルは、後の定義が名前を挙げないものも含めて、
エラーなしに失われる。

## 規則の詳細

この規則は、象限チャート（`quadrantChart`）に当てる。
同じクラスのスタイルを落とすか、値を変える `classDef` を報告する。
既存のスタイルをすべて保つ定義は、スタイルを足しても報告しない。
クラス名は大文字小文字を区別し、キーワードは大文字小文字を問わず読む。

スタイルの順は数えず、半径は数として比べ、
1 つの定義に繰り返すスタイルは最後の値を使う。
色と線の幅は書いたとおりに比べるので、`#f00` から `#F00` に変えると報告する。
間の別のクラスの定義は比較に影響しない。
点はどこに書いても最後の定義を取るので、
そのクラスを取る点より後の定義も報告する。
クラス `c` を `color: #f00`、`color: #00f` と定義した後、
`color: #f00` とする 3 つ目の定義は、`#00f` を置き換えるので報告する。

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
