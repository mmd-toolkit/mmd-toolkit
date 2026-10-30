# @mmd-toolkit/gitgraph-no-redefined-commit

英語版: [gitgraph-no-redefined-commit.md](./gitgraph-no-redefined-commit.md)

前に書いたコミットやマージの id を持つ `commit` を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

git グラフは id ごとに 1 つのコミットを持つ。
mermaid.js は前のコミットの id を持つ後の `commit` をエラーなしに受理し、
前のコミットを置き換える。
ログに警告を書くだけで、既定の設定では示されない。

## 規則の詳細

この規則は、Git グラフ（`gitGraph`）に当てる。
前の `commit` や `merge` の id を持つ `commit` を、
オプションが同じときも報告する。
最後の `id:` が id を与え、`id:` がないか空のコミットは、
作られた id を得るので比べない。

前のコミットの id を使う `merge` は、mermaid.js がエラーを出すので報告しない。
`cherry-pick` は報告せず、前の id としても数えない。
その `id:` は写すコミットを名指すだけで、id を宣言しない。

id は大文字小文字を区別し、周りの引用符は除いて比べる。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/gitgraph-no-redefined-commit: error
gitGraph
  commit id: "A" tag: "first"
  commit id: "A" tag: "second"
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/gitgraph-no-redefined-commit: error
gitGraph
  commit id: "A" tag: "first"
  commit id: "B" tag: "second"
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [gitgraph-no-duplicate-option](./gitgraph-no-duplicate-option.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/gitgraph-no-redefined-commit.ts)
- [テストのソース](../../tests/rules/gitgraph-no-redefined-commit.test.ts)

<!-- end auto-generated rule resources -->
