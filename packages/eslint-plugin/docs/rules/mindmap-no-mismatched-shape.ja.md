# @mmd-toolkit/mindmap-no-mismatched-shape

英語版: [mindmap-no-mismatched-shape.md](./mindmap-no-mismatched-shape.md)

開きと合わない閉じを持つ形を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

形は、`[text]` や `((text))` のように、開きとその閉じで書く。
閉じが合わないと、mermaid.js はエラーを出さず、開きが書く形を描き、
開き `(` では雲を描く。
2 つのどちらかを書き間違えており、描く形は意図したものでないことがある。

## 規則の詳細

この規則は、マインドマップ（`mindmap`）に当てる。
形の閉じが開きと合わないときに報告する。
対応する閉じは、`[` の `]`、`(` の `)`、`((` の `))`、`))` の `((`、`)` の `(`、
`{{` の `}}` である。
引用符の中や複数行のラベル、前にノードのテキストがない形も、同じように調べる。

開き `(-` と `-)` は、mermaid.js が閉じにかかわらず既定の形を描き、
その文書も形を挙げていないので調べない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/mindmap-no-mismatched-shape: error
mindmap
  Plans
    Write[draft)
```

```mmd
%% eslint @mmd-toolkit/mindmap-no-mismatched-shape: error
mindmap
  Plans
    Review(notes))
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/mindmap-no-mismatched-shape: error
mindmap
  Plans
    Write[draft]
```

```mmd
%% eslint @mmd-toolkit/mindmap-no-mismatched-shape: error
mindmap
  Plans
    Review((notes))
```

## オプション

この規則にはオプションがない。

## 参考

- [syntax/mindmap.md](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/mindmap.md#L56-L109)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/mindmap-no-mismatched-shape.ts)
- [テストのソース](../../tests/rules/mindmap-no-mismatched-shape.test.ts)

<!-- end auto-generated rule resources -->
