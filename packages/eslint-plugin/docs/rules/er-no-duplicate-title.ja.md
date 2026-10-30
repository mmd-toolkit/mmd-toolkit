# @mmd-toolkit/er-no-duplicate-title

英語版: [er-no-duplicate-title.md](./er-no-duplicate-title.md)

タイトルをもう一度設定する `accTitle` の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

図のアクセシビリティ用のタイトルは 1 つである。
別の `accTitle` の文がタイトルを設定すると、
mermaid.js はエラーなしに後のタイトルを使い、前のタイトルは失われる。

## 規則の詳細

この規則は、ER 図（`erDiagram`）に当てる。
現在のタイトルを別の値に置き換える `accTitle` の文を報告する。
現在のタイトルを繰り返す文は報告しない。
タイトルは両端の空白を除いて比べる。

行にテキストのない `accTitle:` もタイトルを設定するので数える。
その文は、空行、コメント行、ディレクティブを飛ばして、
テキストを持つ次の行を取る。
テキストの終わりでは、mermaid.js がエラーを出す。
subgraph の中の文も、図全体のタイトルを設定するので、数える。

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
