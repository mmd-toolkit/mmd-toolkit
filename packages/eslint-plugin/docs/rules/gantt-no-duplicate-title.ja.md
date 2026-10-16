# @mmd-toolkit/gantt-no-duplicate-title

英語版: [gantt-no-duplicate-title.md](./gantt-no-duplicate-title.md)

タイトルをもう一度設定する `title` か `accTitle` の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

ガントチャートには 2 つのタイトルがある。
`title` が設定し、チャートの上に描くタイトルと、
`accTitle` が設定するアクセシビリティ用のタイトルである。
mermaid.js は、どちらかを設定する文をすべて受理し、
それぞれが前に設定した値を黙って置き換える。
2 つ目のタイトルは、たいてい、テキストを書き直した残りか、
一部分を 2 回貼り付けたものである。

## 規則の詳細

この規則は、最初のものより後の `title` の文と、
最初のものより後の `accTitle` の文を、前と違う値を設定するときに報告する。
対象の図種は `gantt` である。

`title first` と `title second` の後、タイトルは `second` になり、
`accTitle` も同じである。
行にテキストのない `accTitle:` は、空行、コメント行、指令を飛ばして、
テキストを持つ次の行をアクセシビリティ用のタイトルにする。
`accTitle: a` の後の行 `accTitle:` と `T` は、
アクセシビリティ用のタイトルを `T` にする。
規則は 2 つ目の文を報告する。
2 つのタイトルは別の値である。
`title first` と `accTitle: second` は両方を設定し、どちらも報告しない。

`title` の文は、フロントマターのタイトルも、エラーなしに置き換える。
フロントマターに `title: Frontmatter title` があると、
`title Statement title` はタイトルを `Statement title` にする。
規則はこれを報告しない。

図がすでに持つタイトルを設定する文は、報告しない。
`accTitle: a` の後の 2 つ目の `accTitle: a` は、何も失わない。
タイトルは、mermaid.js が持つとおりに、両端の空白を除いて比べるので、
`accTitle:  a` も同じタイトルを設定する。
`accTitle: a` と `accTitle: b` の後の 3 つ目の `accTitle: a` は、
`b` を置き換えるので報告する。
`title` も同じであり、そのテキストは空白を保つ。
`title T` の後の、空白が 2 つの `title  T` は、別のタイトルを設定し、
描いたときに 2 つのタイトルが同じに見えても報告する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/gantt-no-duplicate-title: error
gantt
  title first
  title second
  dateFormat YYYY-MM-DD
  Design :2024-01-06, 3d
```

```mmd
%% eslint @mmd-toolkit/gantt-no-duplicate-title: error
gantt
  accTitle: first
  accTitle: second
  dateFormat YYYY-MM-DD
  Design :2024-01-06, 3d
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/gantt-no-duplicate-title: error
gantt
  title first
  accTitle: second
  dateFormat YYYY-MM-DD
  Design :2024-01-06, 3d
```

```mmd
%% eslint @mmd-toolkit/gantt-no-duplicate-title: error
gantt
  title first
  title first
  dateFormat YYYY-MM-DD
  Design :2024-01-06, 3d
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart-no-duplicate-title](./flowchart-no-duplicate-title.ja.md)
- [sequence-no-duplicate-title](./sequence-no-duplicate-title.ja.md)
- [gantt-no-duplicate-description](./gantt-no-duplicate-description.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/gantt-no-duplicate-title.ts)
- [テストのソース](../../tests/rules/gantt-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
