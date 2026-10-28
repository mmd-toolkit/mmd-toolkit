# @mmd-toolkit/usecase-no-duplicate-title

英語版: [usecase-no-duplicate-title.md](./usecase-no-duplicate-title.md)

前に設定したタイトルを置き換える `accTitle` を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

ユースケース図は、`accTitle` が設定するアクセシブルなタイトルを 1 つ持つ。
後の `accTitle` は、前に設定したタイトルをエラーなしに置き換え、
前のタイトルは失われる。

## 規則の詳細

この規則は、
前の `accTitle` が設定した空でないタイトルを変える `accTitle` 文を報告する。
対象の図種は `usecase` である。

`accTitle: first` と `accTitle: second` の後では、タイトルは `second` である。
文字のない、または空白だけの `accTitle:` は空のタイトルを設定し、
`accTitle: first` の後では `first` が失われるので報告する。
次の行をタイトルとして取ることはない。
空のタイトルの後の `accTitle` は何も失わず、報告しない。

図がすでに持つタイトルを設定する文は報告しない。
タイトルは、mermaid.js が取り除く両端の空白を除いて比べるので、
`accTitle:  first` は `accTitle: first` と同じタイトルを設定する。
`accTitle: a` と `accTitle: b` の後の 3 つ目の `accTitle: a` は、
`b` を置き換えるので報告する。
タイトルはそのほかは書いたとおりに比べる。
mermaid.js は、`#35;` のような文字参照と HTML の属性の引用符を、
タイトルを読む前にほかの文字に変えるので、それだけが違う 2 つのタイトルは、
mermaid.js には 1 つで、この規則には 2 つのことがある。

`accTitle` 文は 1 つにする。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/usecase-no-duplicate-title: error
usecase-beta
  accTitle: first
  accTitle: second
  A
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/usecase-no-duplicate-title: error
usecase-beta
  accTitle: first
  A
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [usecase-no-duplicate-description](./usecase-no-duplicate-description.ja.md)

## 背景

[`accTitle` 文](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/usecase/parser/usecase.visitor.ts#L127-L131) は両端の空白を除いたタイトルを与え、
[モデル](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/usecase/parser/usecaseModelBuilder.ts#L240-L242) は最後のものだけを保つ。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/usecase-no-duplicate-title.ts)
- [テストのソース](../../tests/rules/usecase-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
