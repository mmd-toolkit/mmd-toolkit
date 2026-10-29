# @mmd-toolkit/gitgraph-no-duplicate-option

英語版: [gitgraph-no-duplicate-option.md](./gitgraph-no-duplicate-option.md)

1 つの文の中で、前の同じオプションの値を置き換えるオプションを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

`commit` と `merge` の `id:` と `type:`、
`cherry-pick` の `id:` と `parent:` は、それぞれ 1 つの値を持つ。
mermaid.js は同じオプションの別の値をエラーなしに受理して最後のものを使い、
前の値は失われる。

## 規則の詳細

この規則は、Git グラフ（`gitGraph`）に当てる。
同じ文の同じオプションが直前に与えた空でない値を変える `id:`、`type:`、
`parent:` を報告する。
同じ値の繰り返しや、空の値の後の設定は報告しない。
`commit id: "a" id: "b" id: "a"` では、2 つ目と 3 つ目の `id:` を報告する。
`id: "a"` の後の `id: ""` のように空でない値を空に置き換えると報告する。
`a` は失われ、mermaid.js がコミットに独自の id を与える。

`cherry-pick id: "missing" id: "B"` の `missing` のように、
それだけなら mermaid.js がエラーを出す値も、前の値として数える。
タグはすべて保たれるので比べず、メッセージは mermaid.js が描かないので比べない。

値は大文字小文字を区別し、周りの引用符は除いて比べる。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/gitgraph-no-duplicate-option: error
gitGraph
  commit id: "a" id: "b"
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/gitgraph-no-duplicate-option: error
gitGraph
  commit id: "b"
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [gitgraph-no-redefined-commit](./gitgraph-no-redefined-commit.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/gitgraph-no-duplicate-option.ts)
- [テストのソース](../../tests/rules/gitgraph-no-duplicate-option.test.ts)

<!-- end auto-generated rule resources -->
