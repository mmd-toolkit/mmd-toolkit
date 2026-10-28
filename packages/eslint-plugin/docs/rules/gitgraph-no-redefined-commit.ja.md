# @mmd-toolkit/gitgraph-no-redefined-commit

英語版:
[gitgraph-no-redefined-commit.md](./gitgraph-no-redefined-commit.md)

前に書いたコミットやマージの id を持つ `commit` を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

git グラフは id ごとに 1 つのコミットを持つ。
前のコミットの id を持つ後の `commit` は、エラーなしにそれを置き換え、
前のコミットは失われる。
mermaid.js はログに警告を書くだけで、既定の設定ではそれは示されない。

## 規則の詳細

この規則は、前の `commit` 文や `merge` 文の id を持つ `commit` 文を報告する。
対象の図種は `gitgraph` である。

`commit id: "A" tag: "first"` と `commit id: "A" tag: "second"` の後では、
図はタグ `second` を持ち、自分自身を親とする 1 つのコミット `A` を持つ。
後のコミットはコミットの順で前のコミットの場所を取り、
前のコミットの後に来たコミットがその親になりうる。
`merge` の id を持つ `commit` も、同じようにそのマージを置き換える。
2 つ目のコミットは、1 つ目と同じオプションを与えるときも報告する。

文の id は、mermaid.js が読むとおり、その最後の `id:` オプションの値である。
`commit id: "A" id: "B"` の後では、後の `commit id: "B"` を報告し、
後の `commit id: "A"` は報告しない。
`id:` のない `commit` や `id: ""` の `commit` は mermaid.js が作る id を得て、
比べない。
前のコミットの id を持つ `merge` は mermaid.js が受理せず、
`cherry-pick` は `id:` で写すコミットを名指し、何も宣言しない。
id は大文字小文字を区別して比べ、その周りの引用符は数えないので、
`id: 'A'` と `id: "A"` は 1 つの id である。
id の中のすべての改行（LF、CRLF、CR）は LF として読む。
id はそのほかは書いたとおりに比べる。
mermaid.js は、`\q` のようなエスケープを解き、HTML の属性の引用符を、
id を読む前にほかの文字に変えるので、それだけが違う 2 つの id は、
mermaid.js には 1 つで、この規則には 2 つのことがある。

コミットごとに自分の id を与える。

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

## 背景

[`commit`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/git/gitGraphAst.ts#L114-L134) は、
ログに警告を書いた後、同じ id のコミットの上にそのコミットを保つ。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/gitgraph-no-redefined-commit.ts)
- [テストのソース](../../tests/rules/gitgraph-no-redefined-commit.test.ts)

<!-- end auto-generated rule resources -->
