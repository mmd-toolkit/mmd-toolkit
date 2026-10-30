# @mmd-toolkit/quadrant-no-duplicate-title

英語版: [quadrant-no-duplicate-title.md](./quadrant-no-duplicate-title.md)

タイトルをもう一度設定する `title` か `accTitle` の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

`title` は図の上に描くタイトルを、
`accTitle` はアクセシビリティ用のタイトルを設定する。
どちらも、もう一度設定すると、mermaid.js はエラーなしに後の値を使い、
前の値は失われる。

## 規則の詳細

この規則は、象限チャート（`quadrantChart`）に当てる。
同じ種類の現在のタイトルを別の値に置き換える `title` か `accTitle`
の文を報告する。
2 つのタイトルは別々に調べ、現在の値を繰り返す文は報告しない。

行にテキストのない `accTitle:`
もアクセシビリティ用のタイトルを設定するので数える。
その文は、空行、コメント行、ディレクティブを飛ばして、テキストを持つ次の行を、
それが文でも取る。
`accTitle: a` の後の `accTitle:` と `title U` の行は、
アクセシビリティ用のタイトルを `title U` にするので報告する。
`title` の文がフロントマターのタイトルを置き換えても報告しない。

キーワードは大文字小文字を問わず読む。
テキストのない `title` は空のタイトルを設定し、
別のタイトルを置き換えるときに報告する。
タイトルは両端の空白を除いて比べるが、
`title` の引用符と `;` はテキストの一部である。
`title "Sales"` は `title Sales` と異なり、
`title a; title b` は 1 つのタイトルである。

`accTitle: a` と `accTitle: b` の後の 3 つ目の `accTitle: a` は、
`b` を置き換えるので報告する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/quadrant-no-duplicate-title: error
quadrantChart
  title first
  title second
  A: [0.3, 0.6]
```

```mmd
%% eslint @mmd-toolkit/quadrant-no-duplicate-title: error
quadrantChart
  accTitle: first
  accTitle: second
  A: [0.3, 0.6]
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/quadrant-no-duplicate-title: error
quadrantChart
  title first
  accTitle: second
  A: [0.3, 0.6]
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [quadrant-no-duplicate-description](./quadrant-no-duplicate-description.ja.md)
- [xychart-no-duplicate-title](./xychart-no-duplicate-title.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/quadrant-no-duplicate-title.ts)
- [テストのソース](../../tests/rules/quadrant-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
