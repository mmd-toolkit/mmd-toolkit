# @mmd-toolkit/gitgraph-no-duplicate-title

英語版: [gitgraph-no-duplicate-title.md](./gitgraph-no-duplicate-title.md)

前に設定したタイトルを置き換える `title` や `accTitle` を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

git グラフは、`title` が設定する表示タイトルと、
`accTitle` が設定するアクセシブルなタイトルを 1 つずつ持つ。
mermaid.js は後の文をエラーなしに受理し、同じ種類の前のタイトルを置き換える。

## 規則の詳細

この規則は、Git グラフ（`gitGraph`）に当てる。
同じ種類の直前の文が設定した空でないタイトルを変える `title` や `accTitle`
を報告する。
表示タイトルとアクセシブルなタイトルは別々に比べる。
同じタイトルの繰り返しや、空のタイトルの後の設定は報告しない。
`title a`、`title b` の後の 3 つ目の `title a` は、
`b` を置き換えるので報告する。

空か空白だけの `title` や `accTitle:` は次の行を取らずにタイトルを空にし、
空でないタイトルの後では報告する。
フロントマターのタイトルは比べず、その置換は報告しないが、
前のタイトルを空にする `title` は、
フロントマターが同じタイトルを表示させても報告する。

比較では、両端の空白を除き、2 つ以上の空白やタブの連なりを 1 つの空白とする。
ほかは書いたとおりに比べるので、
文字参照や HTML 属性の引用符の違いを mermaid.js が同じに読んでも、
この規則は異なるとすることがある。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/gitgraph-no-duplicate-title: error
gitGraph
  title First
  title Second
  commit
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/gitgraph-no-duplicate-title: error
gitGraph
  title Second
  commit
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [gitgraph-no-duplicate-description](./gitgraph-no-duplicate-description.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/gitgraph-no-duplicate-title.ts)
- [テストのソース](../../tests/rules/gitgraph-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
