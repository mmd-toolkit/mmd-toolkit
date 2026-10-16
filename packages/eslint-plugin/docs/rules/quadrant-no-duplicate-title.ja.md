# @mmd-toolkit/quadrant-no-duplicate-title

英語版: [quadrant-no-duplicate-title.md](./quadrant-no-duplicate-title.md)

タイトルをもう一度設定する `title` か `accTitle` の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

四象限チャートには 2 つのタイトルがある。
`title` が設定し、チャートの上に描くタイトルと、
`accTitle` が設定するアクセシブルなタイトルである。
mermaid.js は、どちらかを設定する文をすべて受理し、
それぞれが前に設定された値を黙って置き換える。
2 つ目のタイトルは、たいてい、テキストを書き直した残りか、
一部を 2 度貼り付けた残りである。

## 規則の詳細

この規則は、最初のものより後の `title` の文と、
最初のものより後の `accTitle` の文を、前と違う値を設定するときに報告する。
対象の図種は `quadrantChart` である。

`title first` と `title second` の後、タイトルは `second` で、
`accTitle` も同じである。
キーワードは大文字小文字を問わず読む。
テキストのない `title` は空のタイトルを設定し、`title T` の後では報告する。
行にテキストのない `accTitle:` は、空行、コメント行、指令を越えて、
テキストを持つ次の行を、それが文であっても、アクセシブルなタイトルにする。
`accTitle: a` の後の `accTitle:` と `title U` の 2 行は、
アクセシブルなタイトル `title U` を与え、2 つ目の `accTitle` を報告する。
2 つのタイトルは別の値である。
`title first` と `accTitle: second` は両方を設定し、どちらも報告しない。

`title` の文は、フロントマターのタイトルもエラーなしに置き換える。
フロントマターに `title: Front` があるとき、`title T` はタイトル `T` を与える。
この規則は、これを報告しない。

チャートがすでに持つタイトルを設定する文は、報告しない。
`title Sales` の後の、空白の多い 2 つ目の `title   Sales` は、何も失わない。
タイトルは、mermaid.js が持つとおりに、両端の空白を除いて比べる。
タイトルは行の残りをすべてテキストにし、引用符も `;` も含む。
`title Sales` の後の `title "Sales"` は、
引用符を含むタイトル `"Sales"` を設定するので報告し、
`title a; title b` は 1 つのタイトル `a; title b` である。
`title a` と `title b` の後の 3 つ目の `title a` は、
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
