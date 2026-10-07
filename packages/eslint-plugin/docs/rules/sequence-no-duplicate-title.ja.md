# @mmd-toolkit/sequence-no-duplicate-title

英語版: [sequence-no-duplicate-title.md](./sequence-no-duplicate-title.md)

タイトルをもう一度設定する `title` か `accTitle` の文を禁止する。

<!-- begin auto-generated rule notice -->

`recommended` の設定は、この規則を有効にしない。

<!-- end auto-generated rule notice -->

sequence の図にはタイトルが 2 つある。
`title` が設定するタイトルと、
`accTitle` が設定するアクセシビリティ用のタイトルである。
mermaid.js はそのどちらを設定する文も受理し、
それぞれの文は、それより前に設定した値を黙って置き換える。
2 つ目のタイトルは、たいてい、テキストを書き直した残りか、
同じ部分を 2 回貼り付けたものである。

## 規則の詳細

この規則は、`title` の文（`title` か `title:` と書く）のうち最初のもの以外と、
`accTitle` の文のうち最初のもの以外を、すべて報告する。
対象の図種は `sequence` である。

`title first` と `title second` の後、タイトルは `second` になり、
`accTitle` でも同じである。
2 つのタイトルは別の値で、`title first` と `accTitle: second` は両方を設定し、
どちらも報告しない。
`loop` のようなブロックの中の文も、図全体のタイトルを設定するので、数える。

`title` の文は、フロントマターのタイトルもエラーなしに置き換える。
フロントマターに `title: From frontmatter` があると、
`title From statement` のタイトルは `From statement` になる。
規則はこれを報告しない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/sequence-no-duplicate-title: error
sequenceDiagram
  title first
  title second
  A ->> B: x
```

```mmd
%% eslint @mmd-toolkit/sequence-no-duplicate-title: error
sequenceDiagram
  A ->> B: x
  accTitle: first
  accTitle: second
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/sequence-no-duplicate-title: error
sequenceDiagram
  title first
  accTitle: second
  A ->> B: x
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart-no-duplicate-title](./flowchart-no-duplicate-title.ja.md)
- [sequence-no-duplicate-description](./sequence-no-duplicate-description.ja.md)
