# @mmd-toolkit/architecture-no-duplicate-title

英語版:
[architecture-no-duplicate-title.md](./architecture-no-duplicate-title.md)

前に設定したタイトルを置き換える `accTitle` を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

architecture の図は、`accTitle` が設定するアクセシブルなタイトルを 1 つ持つ。
後の `accTitle` は、前に設定したタイトルをエラーなしに置き換え、
前のタイトルは失われる。

## 規則の詳細

この規則は、
前の `accTitle` が設定した空でないアクセシブルなタイトルを変える `accTitle`
文を報告する。
対象の図種は `architecture` である。

`accTitle: first` と `accTitle: second` の後では、
アクセシブルなタイトルは `second` である。
文字のない、または空白だけの `accTitle:` はタイトルを空にする。
`accTitle: first` の後では `first` が失われるので報告する。
次の行をタイトルとして取ることはない。
空のタイトルの後の文は何も失わず、報告しない。

`title` 文は比べない。
mermaid.js は architecture の図のタイトルを描かないので、
後の `title` は描かれるものを何も置き換えない。

図がすでに持つタイトルを設定する文は報告しない。
タイトルは mermaid.js が保つとおりに、両端の空白を除き、
2 つ以上の空白やタブの連なりを 1 つの空白として比べるので、
`accTitle:  first  report` は、
`accTitle: first report` と同じタイトルを設定する。
`accTitle: a` と `accTitle: b` の後の 3 つ目の `accTitle: a` は、
`b` を置き換えるので報告する。
タイトルはそのほかは書いたとおりに比べる。
mermaid.js は、`#35;` のような文字参照と HTML の属性の引用符を、
タイトルを読む前にほかの文字に変えるので、それだけが違う 2 つのタイトルは、
mermaid.js には 1 つで、この規則には 2 つのことがある。

`accTitle` 文は 1 つにする。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/architecture-no-duplicate-title: error
architecture-beta
  accTitle: First
  accTitle: Second
  service api(server)[API]
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/architecture-no-duplicate-title: error
architecture-beta
  accTitle: Second
  service api(server)[API]
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [architecture-no-duplicate-description](./architecture-no-duplicate-description.ja.md)

## 背景

[値の変換](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/common/valueConverter.ts#L57-L60)
は、タイトルの両端の空白を除き、
2 つ以上の空白やタブの連なりを 1 つの空白にする。
パーサーは最後のアクセシブルなタイトルを保ち、
[`populateCommonDb`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/populateCommonDb.ts#L4-L14)
は、それが空でないときだけそれを設定する。
[描画](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/architecture/architectureRenderer.ts#L610-L642)
は、まだタイトルを描かない。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/architecture-no-duplicate-title.ts)
- [テストのソース](../../tests/rules/architecture-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
