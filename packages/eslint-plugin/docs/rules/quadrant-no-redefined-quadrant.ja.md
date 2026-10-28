# @mmd-toolkit/quadrant-no-redefined-quadrant

英語版:
[quadrant-no-redefined-quadrant.md](./quadrant-no-redefined-quadrant.md)

象限のテキストを置き換える象限の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`quadrant-1` から `quadrant-4` は、4 つの象限のテキストを設定する。
mermaid.js は同じ象限の 2 つ目の文を受理し、
最初の文が設定したテキストを黙って置き換える。
2 つ目の文は、たいてい、テキストを書き直した残りか、
行を貼り付けた後に番号を変え忘れたものである。

## 規則の詳細

この規則は、同じ番号の最初のものより後の `quadrant-1`、`quadrant-2`、
`quadrant-3`、`quadrant-4` の文を、
その象限の前の文が設定したテキストを別の値に置き換えるときに報告する。
対象の図種は `quadrantChart` である。

`quadrant-1 We should expand` の後の `quadrant-1 Need to promote` は、
1 つ目の象限にテキスト `Need to promote` を与え、
テキスト `We should expand` は失われる。
空白だけを持つ引用符の中のテキストは空のテキストを設定し、
`quadrant-1 A` の後の `quadrant-1 "  "` は報告する。
キーワードは大文字小文字を問わず読む。
`quadrant-10 B` は、テキスト `0 B` を持つ 1 つ目の象限の文なので、
`quadrant-1 A` の後では報告する。
間にあるほかの象限の文は数えない。

何も失わない文は報告しない。
空だったテキストは失われない。
テキストは、mermaid.js が持つとおりに、両端の空白と、
文字列の引用符とバッククォートを除いて比べる。
そのため、`quadrant-1 A` の後の `quadrant-1 " A "` と ``quadrant-1 "`A`"`` は、
同じテキストを設定する。
語の間の空白は数える。
`quadrant-1 A` と `quadrant-1 B` の後の 3 つ目の `quadrant-1 A` は、
`B` を置き換えるので報告する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/quadrant-no-redefined-quadrant: error
quadrantChart
  quadrant-1 We should expand
  quadrant-2 Need to promote
  quadrant-2 Re-evaluate
  A: [0.3, 0.6]
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/quadrant-no-redefined-quadrant: error
quadrantChart
  quadrant-1 We should expand
  quadrant-2 Need to promote
  quadrant-3 Re-evaluate
  A: [0.3, 0.6]
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [quadrant-no-redefined-axis](./quadrant-no-redefined-axis.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/quadrant-no-redefined-quadrant.ts)
- [テストのソース](../../tests/rules/quadrant-no-redefined-quadrant.test.ts)

<!-- end auto-generated rule resources -->
