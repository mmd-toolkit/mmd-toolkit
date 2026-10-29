# @mmd-toolkit/mindmap-no-mismatched-shape

英語版: [mindmap-no-mismatched-shape.md](./mindmap-no-mismatched-shape.md)

開きと合わない閉じを持つ形を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

形は、`[text]` や `((text))` のように、開きとその閉じで書く。
閉じが合わないと、mermaid.js はエラーを出さず、開きが書く形を描き、
開き `(` では雲を描く。
2 つのどちらかを書き間違えており、描く形は意図したものでないことがある。

## 規則の詳細

この規則は、形の閉じが開きの閉じでないときに、その閉じを報告する。
`[` の `]`、`(` の `)`、`((` の `))`、`))` の `((`、`)` の `(`、
`{{` の `}}` である。
対象の図種は `mindmap` である。

`Write[draft)` は四角、`a((x)` は円、`a))x(` は爆発、`a)x)` は雲、
`a{{x]` は六角形になる。
開き `(` では、`)` でない閉じはどれも雲を与える。
`Review(notes))` と `a(x]` は、角丸の四角でなく雲である。
ラベルが文字列のものや行をまたぐもの、
`((x)` のようにノードのテキストのない形も、同じように報告する。
開き `(-` と `-)` は調べない。
mermaid.js は閉じにかかわらずそれらに既定の形を描き、
その文書もそれらに形を挙げていない。

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

## 背景

mermaid.js は、
[`getType`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/mindmap/mindmapDb.ts#L127-L145)
で、形の種類を開きから取り、閉じは `(` のときだけ見る。
その文書は、
[syntax/mindmap.md](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/mindmap.md#L56-L109)
で、それぞれの形を、開きと閉じとともに挙げる。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/mindmap-no-mismatched-shape.ts)
- [テストのソース](../../tests/rules/mindmap-no-mismatched-shape.test.ts)

<!-- end auto-generated rule resources -->
