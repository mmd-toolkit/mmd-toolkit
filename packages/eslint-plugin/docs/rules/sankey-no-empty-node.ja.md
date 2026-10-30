# @mmd-toolkit/sankey-no-empty-node

英語版: [sankey-no-empty-node.md](./sankey-no-empty-node.md)

名前のないノードを作る、空白だけの source や target を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

レコードの最初の 2 つの欄は、リンクの source と target を名指す。
mermaid.js はそれぞれを両端の空白を除いて読むので、
空白だけの欄は空の id を名指す。
mermaid.js はそれをエラーなしに受理し、名前のないノードを、
そこへのリンクとともに図に加える。
そうした欄は、たいてい、名前を消して空白を残した残りである。

## 規則の詳細

この規則は、Sankey 図（`sankey`、`sankey-beta`）に当てる。
両端の空白を除くと空になる source と target を、
引用符の中の空白だけか改行だけの欄も含めて、それぞれ報告する。
複数の欄が同じ空のノードを名指しても、それぞれ報告する。

`"  a  "` のように、周囲に空白のある空でない名前は報告しない。

`a,,1` のように何もない欄は、mermaid.js がエラーにするので報告しない。
空白だけのリンクの値は、
[sankey-no-invalid-value](./sankey-no-invalid-value.ja.md) が報告する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/sankey-no-empty-node: error
sankey
Electricity grid, ,104.453
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/sankey-no-empty-node: error
sankey
Electricity grid,Homes,104.453
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [journey-no-empty-person](./journey-no-empty-person.ja.md)
- [sankey-no-invalid-value](./sankey-no-invalid-value.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/sankey-no-empty-node.ts)
- [テストのソース](../../tests/rules/sankey-no-empty-node.test.ts)

<!-- end auto-generated rule resources -->
