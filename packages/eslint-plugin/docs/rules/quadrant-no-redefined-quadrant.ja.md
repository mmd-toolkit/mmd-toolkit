# @mmd-toolkit/quadrant-no-redefined-quadrant

英語版: [quadrant-no-redefined-quadrant.md](./quadrant-no-redefined-quadrant.md)

象限のテキストを置き換える象限の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

`quadrant-1` から `quadrant-4` は、4 つの象限のテキストを設定する。
mermaid.js は同じ象限の別の文をエラーなしに受理してそのテキストを使うので、
前のテキストは失われる。

## 規則の詳細

この規則は、象限チャート（`quadrantChart`）に当てる。
その象限の現在の空でないテキストを別の値に置き換える `quadrant-1`、
`quadrant-2`、`quadrant-3`、`quadrant-4` の文を報告する。
現在のテキストを繰り返す文と、空だったテキストを設定する文は報告せず、
ほかの象限の文は別々に調べる。

テキストは周囲の空白、引用符、マークダウン文字列のバッククォートを除いて比べ、
語の間の空白は数える。
引用符の中の空白だけのテキストは空のテキストを設定するので、
`quadrant-1 A` の後の `quadrant-1 "  "` は報告する。
キーワードは大文字小文字を問わず読み、
`quadrant-10 B` は 1 つ目の象限のテキストを `0 B` にするので、
`quadrant-1 A` の後では報告する。
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
