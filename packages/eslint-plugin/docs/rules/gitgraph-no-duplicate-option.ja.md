# @mmd-toolkit/gitgraph-no-duplicate-option

英語版:
[gitgraph-no-duplicate-option.md](./gitgraph-no-duplicate-option.md)

1 つの文の中で、前の同じオプションの値を置き換えるオプションを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`commit` と `merge` の `id:` と `type:`、
`cherry-pick` の `id:` と `parent:` は、
それぞれ 1 つの値を持つ。
文がそのどれかを 2 度与えると、mermaid.js はエラーなしに後の値を使い、
前の値は失われる。

## 規則の詳細

この規則は、同じ文の前の同じオプションと違う値を与える
`id:`、`type:`、`parent:` のオプションを報告する。
対象の図種は `gitgraph` である。

`commit id: "a" id: "b"` の後では、コミットは id `b` を持ち、
コミット `a` は描かれない。
`commit id: "a" id: "b" id: "a"` では 2 つ目と 3 つ目を報告する。
どちらもその前の値を置き換えるからである。
`id: "a"` の後の `id: ""` も報告する。
コミットは mermaid.js が作る id を得て、`a` は失われる。
`id: ""` の後の `id: "b"` のように、空の値の後のオプションは何も失わず、
報告しない。
前の値は、mermaid.js が受理しなかったはずの値でも失われる。
`cherry-pick id: "missing" id: "B"` では、mermaid.js は `missing` を探さない。

文がすでに持つ値を与えるオプションは報告しない。
`tag:` は、すべてのタグが保たれるので比べず、
メッセージも、mermaid.js が描かないので比べない。
値は大文字小文字を区別して比べ、その周りの引用符は数えないので、
`id: "a"` と `id: 'a'` は 1 つの値である。
値の中のすべての改行（LF、CRLF、CR）は LF として読む。
値はそのほかは書いたとおりに比べる。
mermaid.js は、`\q` のようなエスケープを解き、HTML の属性の引用符を、
値を読む前にほかの文字に変えるので、
それだけが違う 2 つの値は、
mermaid.js には 1 つで、この規則には 2 つのことがある。

オプションごとに値を 1 つ与える。

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

## 背景

[文法](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/gitGraph/gitGraph.langium#L26-L56)
は `id`、`type`、`parent` にそれぞれ 1 つの値を当てるので、
最後に書いたものが保たれ、`tag` はすべてをリストに足す。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/gitgraph-no-duplicate-option.ts)
- [テストのソース](../../tests/rules/gitgraph-no-duplicate-option.test.ts)

<!-- end auto-generated rule resources -->
