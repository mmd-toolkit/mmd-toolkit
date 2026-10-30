# @mmd-toolkit/venn-no-duplicate-subset

英語版: [venn-no-duplicate-subset.md](./venn-no-duplicate-subset.md)

もう一度宣言する集合や和を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

mermaid.js は `set` と `union` の重複する宣言をエラーなしに受理し、
文ごとに 1 度その領域を描く。
集合の重複は同じ場所に円を描き、後の集合の色をずらす。
後の空でないラベルと集合の大きさは前のものを置き換え、
和の重複する大きさはその間の重なりとして描かれる。

## 規則の詳細

この規則は、ベン図（`venn-beta`）に当てる。
前の宣言と同じ名前を持つ `set` や `union` を、文が同じときも報告する。
名前の順は数えず、繰り返しは数えるので、
`union B, A` は `union A, B` の重複であり、`union A, A, B` は別である。

3 つ以上の集合の和は、各組を宣言せずに、その領域を描画に足す。
大きな和の前か後で、そのような組を宣言しても報告しない。

名前は大文字小文字を区別し、周りの引用符を除いて書いたとおりに比べるので、
`set " A "` は `set A` と異なる。
文字参照や HTML 属性の引用符の違いを mermaid.js が同じに読んでも、
この規則は異なるとすることがある。

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

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/venn-no-duplicate-subset.ts)
- [テストのソース](../../tests/rules/venn-no-duplicate-subset.test.ts)

<!-- end auto-generated rule resources -->
