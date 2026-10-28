# @mmd-toolkit/er-no-duplicate-title

英語版: [er-no-duplicate-title.md](./er-no-duplicate-title.md)

タイトルをもう一度設定する `accTitle` の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

図のアクセシビリティ用のタイトルは 1 つである。
mermaid.js はどの `accTitle` の文も受理し、それぞれの文は、
それより前に設定したタイトルを黙って置き換える。
2 つ目のタイトルは、たいてい、テキストを書き直した残りか、
同じ部分を 2 回貼り付けたものである。

## 規則の詳細

この規則は、`accTitle` の文のうち、最初のもの以外を、
前と違うタイトルを設定するときに報告する。
対象の図種は `er` である。

`accTitle: a` と `accTitle: b` の後、タイトルは `b` になる。
行にテキストのない `accTitle:` は、空行、コメント行、ディレクティブを飛ばして、
テキストを持つ次の行をタイトルにする。
テキストの終わりでは、mermaid.js はそれを拒否する。
subgraph の中の文も、図全体のタイトルを設定するので、数える。
mermaid.js は、そのテキストを subgraph の要素にも加える。

図がすでに持つタイトルを設定する文は、報告しない。
`accTitle: a` の後の 2 つ目の `accTitle: a` は、何も失わない。
タイトルは、mermaid.js が持つとおりに、両端の空白を除いて比べるので、
`accTitle:  a` も同じタイトルを設定する。
`accTitle: a` と `accTitle: b` の後の 3 つ目の `accTitle: a` は、
`b` を置き換えるので報告する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/er-no-duplicate-title: error
erDiagram
  accTitle: first
  accTitle: second
  A
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/er-no-duplicate-title: error
erDiagram
  accTitle: first
  accDescr: second
  A
```

```mmd
%% eslint @mmd-toolkit/er-no-duplicate-title: error
erDiagram
  accTitle: first
  accTitle: first
  A
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart-no-duplicate-title](./flowchart-no-duplicate-title.ja.md)
- [er-no-duplicate-description](./er-no-duplicate-description.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/er-no-duplicate-title.ts)
- [テストのソース](../../tests/rules/er-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
