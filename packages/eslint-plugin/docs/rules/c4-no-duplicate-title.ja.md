# @mmd-toolkit/c4-no-duplicate-title

英語版: [c4-no-duplicate-title.md](./c4-no-duplicate-title.md)

別の title 文が設定した異なるタイトルを置き換える title 文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

2 つ目の `title` は、図全体の表示タイトルを置き換える。
mermaid.js は両方をエラーなしに受理し、前のタイトルは失われる。

## 規則の詳細

この規則は、直前にタイトルを設定した文が別の `title` で、
保存される値が異なるとき、その `title` を報告する。
対象の図種は `c4` である。

最初の文ではなく、最後に設定した文と比べる。
`First`、`Second`、`First` なら 2 件報告する。
境界内のタイトルも、図全体のタイトルを設定する。
同じ値の繰り返しは報告しない。
タイトルは引用符と最初の区切りの後の空白を残す。
`title "Banking"` は `title Banking` と異なり、値の余分な空白も意味を持つ。

`accTitle:` は報告せず、その前の `title` との比較もそこで終える。
mermaid 12.0.0 は、この形式をアクセシブルなタイトルではなく、
表示タイトルへ誤って保存する。
AST で形式を区別できるため、`title` と混ぜた並びも含め、
このアクセシビリティの不具合を作者の誤りとして報告しない。

図にはタイトルを 1 つ書く。

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

## 背景

[issue #8040](https://github.com/mermaid-js/mermaid/issues/8040) は、
`accTitle:` の不具合を記録する。
設定先を直す [PR #8041](https://github.com/mermaid-js/mermaid/pull/8041)（open）がある。
普通の `title` 同士の報告は、その不具合に依存しない。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/c4-no-duplicate-title.ts)
- [テストのソース](../../tests/rules/c4-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
