# @mmd-toolkit/venn-no-duplicate-subset

英語版: [venn-no-duplicate-subset.md](./venn-no-duplicate-subset.md)

もう一度宣言する集合や和を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

mermaid.js は、前の文が宣言する領域の文も含めて、
すべての `set` 文と `union` 文をエラーなしに保ち、
描画は文ごとに 1 度その領域を描く。
2 度宣言した集合は、1 つの場所に、それぞれの色の 2 つの円として描かれ、
その後の集合は、その後の色を取る。
後の空でないラベルは前のラベルを置き換え、
後の `set` の大きさは前の大きさを置き換え、 1 つの和の 2 つの大きさは、
その間の重なりとして描かれる。

## 規則の詳細

この規則は、
前の `set` 文か `union` 文がすでに持つ名前を持つ `set` 文と `union`
文を報告する。
対象の図種は `venn` である。

描画は、空でない最後のラベルを保つ。
ラベルの省略と `[""]` は Db にラベルを足さず、
`[" "]` は両端の空白を除いた空のラベルを保つ。
いずれも、描画では前の空でないラベルを置き換えない。

名前は、順を問わず、繰り返しを含めて比べる。
`union B, A` は `union A, B` の和をもう一度宣言し、
`union A, A, B` は別の和である。
同じ文を 2 度書いたものも、領域が 2 度描かれるので報告する。
3 つ以上の集合の和は、どの文も宣言しないその間の組も描画に与える。
その前か後に書いたそのうちの 2 つの和は、その組を宣言し、報告しない。

名前は、大文字小文字を区別し、引用符の有無を問わず、書いたとおりに比べる。
`set "A"` は `set A` をもう一度宣言し、`set " A "` は別の集合である。
mermaid.js は、`#35;` のような文字参照と HTML の属性の引用符を、
名前を読む前にほかの文字に変えるので、それだけが違う 2 つの名前は、
mermaid.js には 1 つで、この規則には 2 つのことがある。

字下げした `text` は、すぐ前の集合か和に属する。
図の後のほうで集合に文字のノードを足すには、集合をもう一度宣言する代わりに、
`text A A3` のように、行の初めに集合の名前とともに `text` を書く。

集合と和は、それぞれ 1 度だけ宣言する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/venn-no-duplicate-subset: error
venn-beta
set A[Alpha]:20
set B[Beta]
set A[Gamma]:5
```

```mmd
%% eslint @mmd-toolkit/venn-no-duplicate-subset: error
venn-beta
set A
set B
union A, B[Shared]
union B, A[Both]
```

```mmd
%% eslint @mmd-toolkit/venn-no-duplicate-subset: error
venn-beta
set A["Frontend"]:20
  text A1["React"]
set B
set A
  text A3["Vue"]
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/venn-no-duplicate-subset: error
venn-beta
set A[Alpha]:20
set B[Beta]
union A, B[Shared]
```

```mmd
%% eslint @mmd-toolkit/venn-no-duplicate-subset: error
venn-beta
set A["Frontend"]:20
  text A1["React"]
set B
text A A3["Vue"]
```

## オプション

この規則にはオプションがない。

## 背景

[`addSubsetData`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/venn/vennDB.ts#L23-L36)
は文をそれぞれ足し、
[`draw`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/venn/vennRenderer.ts#L52-L61)
はそのすべてを @upsetjs/venn.js 2.0.0 に渡す。
それは
[それぞれに領域を描き](https://github.com/upsetjs/venn.js/blob/350c835aab4a92a7570963c28f725cf9f6e5f258/src/diagram.js#L164-L176)、
[領域の空でない最後のラベルを保ち](https://github.com/upsetjs/venn.js/blob/350c835aab4a92a7570963c28f725cf9f6e5f258/src/diagram.js#L102-L107)、
[集合の大きさをその最後の文から取る](https://github.com/upsetjs/venn.js/blob/350c835aab4a92a7570963c28f725cf9f6e5f258/src/layout.js#L330-L340)。
mermaid.js は、
円のそれぞれに
[その位置の色](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/venn/vennRenderer.ts#L121-L130)
を与える。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/venn-no-duplicate-subset.ts)
- [テストのソース](../../tests/rules/venn-no-duplicate-subset.test.ts)

<!-- end auto-generated rule resources -->
