# @mmd-toolkit/c4-no-duplicate-title

英語版: [c4-no-duplicate-title.md](./c4-no-duplicate-title.md)

別の title 文が設定した異なるタイトルを置き換える title 文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

2 つ目の `title` は、図全体の表示タイトルを置き換える。
mermaid.js は両方の文をエラーなしに受理し、前のタイトルは失われる。

## 規則の詳細

この規則は、C4 図（`C4Context`、`C4Container`、`C4Component`、`C4Dynamic`、
`C4Deployment`）に当てる。
直前にタイトルを設定した文も `title` で、その値と異なる `title` を報告する。
境界内のタイトルも図全体のタイトルを設定する。
同じ値の繰り返しは報告しない。
`title First`、`title Second` の後の 3 つ目の `title First` も報告する。

引用符と最初の区切りの後の空白は意味を持つので、
`title "Banking"` は `title Banking` と異なる。
`accTitle:` は報告せず、前の `title` との比較も終える。
mermaid.js は、この形式を誤って表示タイトルに使う。
この規則は、そのアクセシビリティの不具合を作者の誤りとして報告しない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/c4-no-duplicate-title: error
C4Context
  title Banking
  title Payments
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/c4-no-duplicate-title: error
C4Context
  title Banking
  title Banking
```

```mmd
%% eslint @mmd-toolkit/c4-no-duplicate-title: error
C4Context
  title Banking
  accTitle: Accessible banking
```

```mmd
%% eslint @mmd-toolkit/c4-no-duplicate-title: error
C4Context
  accTitle: Accessible banking
  title Banking
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [c4-no-duplicate-description](./c4-no-duplicate-description.ja.md)

## 参考

- [issue #8040: C4: accTitle sets the visible title instead of the accessible title](https://github.com/mermaid-js/mermaid/issues/8040)
- [プルリクエスト #8041: fix(c4): send accTitle to the accessible title](https://github.com/mermaid-js/mermaid/pull/8041)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/c4-no-duplicate-title.ts)
- [テストのソース](../../tests/rules/c4-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
