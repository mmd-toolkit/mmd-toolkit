# @mmd-toolkit/pie-no-duplicate-title

英語版: [pie-no-duplicate-title.md](./pie-no-duplicate-title.md)

前に設定したタイトルを置き換える `title` や `accTitle` を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

円グラフは、`title` が設定するタイトルと、
`accTitle` が設定するアクセシブルなタイトルを 1 つずつ持つ。
後の文は、前に設定したタイトルをエラーなしに置き換え、前のタイトルは失われる。

## 規則の詳細

この規則は、前の `title` が設定した空でないタイトルを変える `title` 文と、
前の `accTitle` が設定した空でないアクセシブルなタイトルを変える `accTitle` 文を報告する。
対象の図種は `pie` である。

`title first` と `title second` の後では、タイトルは `second` であり、
`accTitle` も同じである。
2 つのタイトルは別の値であり、
`title first` と `accTitle: second` は両方を設定し、どちらも報告しない。
文字のない `title` と `accTitle:`、または空白だけのものは、タイトルを空にする。
`title first` の後では `first` が失われるので報告する。
次の行をタイトルとして取ることはない。
空のタイトルの後の文は何も失わず、報告しない。

`title` 文は、フロントマターのタイトルもエラーなしに置き換える。
フロントマターに `title: Front` があると、`title T` はタイトル `T` を与える。
この規則はフロントマターを読まないので、これを報告しない。
同じ理由で、`title first` の後の文字のない `title` は、
フロントマターがタイトルを与え、図が `first` の代わりにそれを示すときも、
そのタイトルが `first` であるときも報告する。

図がすでに持つタイトルを設定する文は報告しない。
タイトルは mermaid.js が保つとおりに、両端の空白を除き、
2 つ以上の空白やタブの連なりを 1 つの空白として比べるので、
`title  first  report` は `title first report` と同じタイトルを設定する。
`title a` と `title b` の後の 3 つ目の `title a` は、
`b` を置き換えるので報告する。
タイトルはそのほかは書いたとおりに比べる。
mermaid.js は、`#35;` のような文字参照と HTML の属性の引用符を、
タイトルを読む前にほかの文字に変えるので、それだけが違う 2 つのタイトルは、
mermaid.js には 1 つで、この規則には 2 つのことがある。

`title` 文と `accTitle` 文はそれぞれ 1 つにする。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/pie-no-duplicate-title: error
pie
  title First
  title Second
  "A" : 1
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/pie-no-duplicate-title: error
pie
  title Second
  "A" : 1
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [pie-no-duplicate-description](./pie-no-duplicate-description.ja.md)

## 背景

[値の変換](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/common/valueConverter.ts#L57-L60) は、
タイトルの両端の空白を除き、 2 つ以上の空白やタブの連なりを 1 つの空白にする。
パーサーは種類ごとに最後のタイトルを保ち、
[`populateCommonDb`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/populateCommonDb.ts#L4-L14) は、
それが空でないときだけそれを設定する。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/pie-no-duplicate-title.ts)
- [テストのソース](../../tests/rules/pie-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
