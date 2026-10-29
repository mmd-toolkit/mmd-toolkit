# @mmd-toolkit/requirement-no-duplicate-title

英語版: [requirement-no-duplicate-title.md](./requirement-no-duplicate-title.md)

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

この規則は、要求図（`requirementDiagram`）に当てる。
現在のタイトルを別の値に置き換える `accTitle` の文を報告する。
現在のタイトルを繰り返す文は報告しない。
タイトルは両端の空白を除いて比べる。

行にテキストのない `accTitle:` もタイトルを設定するので数える。
その文は、空行、コメント行、ディレクティブを飛ばして、
テキストを持つ次の行を取る。
フロントマターのタイトルは別の値であり、数えない。

`accTitle: a` と `accTitle: b` の後の 3 つ目の `accTitle: a` は、
`b` を置き換えるので報告する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/requirement-no-duplicate-title: error
requirementDiagram
  accTitle: first
  accTitle: second
  requirement r {
    id: 1
  }
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/requirement-no-duplicate-title: error
requirementDiagram
  accTitle: first
  accDescr: second
  requirement r {
    id: 1
  }
```

```mmd
%% eslint @mmd-toolkit/requirement-no-duplicate-title: error
requirementDiagram
  accTitle: first
  accTitle: first
  requirement r {
    id: 1
  }
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [er-no-duplicate-title](./er-no-duplicate-title.ja.md)
- [requirement-no-duplicate-description](./requirement-no-duplicate-description.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/requirement-no-duplicate-title.ts)
- [テストのソース](../../tests/rules/requirement-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
