# @mmd-toolkit/usecase-no-duplicate-metadata

英語版: [usecase-no-duplicate-metadata.md](./usecase-no-duplicate-metadata.md)

同じキーで前に設定した値を置き換えるメタデータの値を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`User@{ type: hollow }` のようなメタデータの更新は、それが名指すアクター、
ユースケース、システム境界、関係のプロパティを設定する。
更新が、前の更新が同じ要素に与えたものと違う値をキーに与えると、
mermaid.js はエラーなしに後の値を使い、前の値は失われる。

## 規則の詳細

この規則は、メタデータの更新のプロパティ `type`、`business`、`icon`、
`animation` のうち、
前の更新が同じキーで要素に与えた値と違う値を与えるものを報告する。
対象の図種は `usecase` である。

1 つの要素の更新は、1 つの更新の中の同じキーの 2 つのプロパティも、
要素の宣言より前に書いた更新も含めて、書いた順に比べる。
更新は、`"A"@{ type: hollow }` が `A` を更新するように、
引用符の有無を問わず id で要素を名指す。
mermaid.js が 1 つの id に変える 2 つの名前は、この規則には 2 つの要素である。
`"Place order"@{ business: true }` と `Place_order@{ business: false }` は 1
つのユースケースを更新するが、後の値は報告しない。
`systemBoundary` の見出しのメタデータも書いた順に加わる。
境界の 2 つ目の見出しが別の `type` を持つと報告し、
置き換える更新の後の見出しも報告する。
見出しの後の更新は報告しない。
[mermaid.js の文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/usecase.md#L223-L223)
が書くとおり、それは見出しが与えた型を変える。
要素がまだ持たないキーと、すでに持つ値は報告しない。
値は、引用符の有無を問わず書いたとおりに比べ、
`type: hollow` と `type: "hollow"` は同じである。
`icon: ""` のような前の空の値は、失われるものを持たない。
値はそのほかは書いたとおりに比べる。
mermaid.js は、`#35;` のような文字参照と HTML の属性の引用符を、
値を読む前にほかの文字に変えるので、それだけが違う 2 つの値は、
mermaid.js には 1 つで、この規則には 2 つのことがある。

`actor A@{ type: hollow }`
のようなアクターやユースケースの宣言のメタデータは比べない。
mermaid.js は更新をどこに書いてもその上に当て、
それは文書がインラインのメタデータを変えるために書く方法であり、
違う値を持つ 2 つの宣言は受理されない。
`animate` は比べない。
`animation: slow` の後では、
文書がアニメーションを止めるために書く `animate: false` の後も、
mermaid.js は関係をアニメーション付きで描く。

要素のキーごとに値を 1 つ与える。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/usecase-no-duplicate-metadata: error
usecase-beta
  actor User
  User@{ type: hollow }
  User@{ type: awesome }
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/usecase-no-duplicate-metadata: error
usecase-beta
  actor User
  User@{ type: hollow }
```

## オプション

この規則にはオプションがない。

## 背景

[`applyMetadataAssignments`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/usecase/parser/usecaseModelBuilder.ts#L620-L688)
は更新を順に当て、それぞれの値は前の値を置き換える。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/usecase-no-duplicate-metadata.ts)
- [テストのソース](../../tests/rules/usecase-no-duplicate-metadata.test.ts)

<!-- end auto-generated rule resources -->
