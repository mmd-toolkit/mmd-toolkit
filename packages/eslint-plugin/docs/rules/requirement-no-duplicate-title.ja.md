# @mmd-toolkit/requirement-no-duplicate-title

英語版: [requirement-no-duplicate-title.md](./requirement-no-duplicate-title.md)

タイトルをもう一度設定する `accTitle` の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

要求図のアクセシビリティ用のタイトルは 1 つである。
mermaid.js は `accTitle` の文をすべて受理し、
それぞれが前に設定したタイトルを黙って置き換える。
2 つ目のタイトルは、たいてい、テキストを書き直した残りか、
一部分を 2 回貼り付けたものである。

## 規則の詳細

この規則は、`accTitle` の文のうち、最初のもの以外を、
前と違うタイトルを設定するときに報告する。
対象の図種は `requirement` である。

`accTitle: a` と `accTitle: b` の後、タイトルは `b` になる。
行にテキストのない `accTitle:` は、空行、コメント行、ディレクティブを飛ばして、
テキストを持つ次の行をタイトルにする。
`accTitle: a` の後の行 `accTitle:` と `T` は、タイトルを `T` にする。
規則は 2 つ目の文を報告する。
フロントマターのタイトルは別の値で、数えない。

図がすでに持つタイトルを設定する文は、報告しない。
`accTitle: a` の後の 2 つ目の `accTitle: a` は、何も失わない。
タイトルは、mermaid.js が持つとおりに、両端の空白を除いて比べるので、
`accTitle:  a` も同じタイトルを設定する。
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
