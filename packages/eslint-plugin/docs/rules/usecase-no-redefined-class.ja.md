# @mmd-toolkit/usecase-no-redefined-class

英語版: [usecase-no-redefined-class.md](./usecase-no-redefined-class.md)

前に定義したクラスのスタイルを落とすか変える `classDef` を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`classDef` はクラスのスタイルを定義する。
同じクラスの後の `classDef` は、スタイルを足す flowchart と違い、
定義全体をエラーなしに置き換える。
`classDef hot fill:red` と `classDef hot stroke:blue` の後では、
クラスは塗りを持たない。

## 規則の詳細

この規則は、`classDef` のクラスのうち、
前の定義が持つスタイルを後の定義が落とすか別の値にするものを報告する。
対象の図種は `usecase` である。
`classDef hot,cold fill:red` のように複数のクラスを持つ `classDef` は、
クラスごとに調べる。

前の定義のスタイルをすべて保つ定義は、スタイルを足しても、
別の順に書いても報告しない。
スタイルは mermaid.js が描くとおりに比べる。
1 つの定義に 2 度書いたプロパティは最後の値が数える。
プロパティの名前は大文字小文字を区別し、書いたとおりに比べる。
mermaid.js はラベルのスタイルと図形のスタイルを書いた名前で分けるからであり、
`color:red` の後の `COLOR:red` は図形に行き、ラベルはもう赤くない。
値は CSS が読むとおりに、両端の空白を除き、
引用符で囲んだ文字列の外の空白の連なりを 1 つの空白とし、
そのほかは書いたとおりに比べる。
`font-family:"A  B"` と `font-family:"A B"` は 2 つのフォントを名指す。
`fill:red` と `fill:blue` の後の `fill:red` の 3 つ目の定義は、
`blue` を変えるので報告する。

`style` 文は要素にスタイルを足し、比べない。

クラスごとに、すべてのスタイルを持つ `classDef` を 1 つ書く。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/usecase-no-redefined-class: error
usecase-beta
  A:::hot
  classDef hot fill:red
  classDef hot stroke:blue
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/usecase-no-redefined-class: error
usecase-beta
  A:::hot
  classDef hot fill:red, stroke:blue
```

## オプション

この規則にはオプションがない。

## 背景

[`applyClassDefinitions`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/usecase/parser/usecaseModelBuilder.ts#L846-L852)
は各クラスの最後の定義を丸ごと保ち、
[`getCompiledStyles`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/usecase/usecaseDb.ts#L118-L134)
はその中のプロパティの最後の値を取る。
[`styles2String`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/rendering-util/rendering-elements/shapes/handDrawnShapeStyles.ts#L53-L104)
は、書いた名前が `color`、
`font-size` などの文字のプロパティであるスタイルをラベルに、
ほかのスタイルを図形に与える。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/usecase-no-redefined-class.ts)
- [テストのソース](../../tests/rules/usecase-no-redefined-class.test.ts)

<!-- end auto-generated rule resources -->
