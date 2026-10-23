# @mmd-toolkit/xychart-no-duplicate-title

英語版: [xychart-no-duplicate-title.md](./xychart-no-duplicate-title.md)

タイトルをもう一度設定する `title` か `accTitle` の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

XY チャートには 2 つのタイトルがある。
`title` が設定し、チャートの上に描くタイトルと、
`accTitle` が設定するアクセシブルなタイトルである。
mermaid.js は、どちらかを設定する文をすべて受理し、
それぞれが前に設定された値を黙って置き換える。
2 つ目のタイトルは、たいてい、テキストを書き直した残りか、
一部を 2 度貼り付けた残りである。

## 規則の詳細

この規則は、最初のものより後の `title` の文と、
最初のものより後の `accTitle` の文を、前と違う値を設定するときに報告する。
対象の図種は `xychart` である。

`title first` と `title second` の後、タイトルは `second` で、
`accTitle` も同じである。
キーワードは大文字小文字を問わず読み、1 行の 2 つのタイトルの文は 2 つと数える。
行にテキストのない `accTitle:` は、空行、コメント行、指令を越えて、
テキストを持つ次の行をアクセシブルなタイトルにし、
テキストの終わりまでにそうした行がなければ、
空のアクセシブルなタイトルを設定する。
`accTitle: a` の後では、どちらも報告する。
2 つのタイトルは別の値である。
`title first` と `accTitle: second` は両方を設定し、どちらも報告しない。
フロントマターのタイトルは別の値であり、数えない。

チャートがすでに持つタイトルを設定する文は、報告しない。
`title Sales` の後の 2 つ目の `title "Sales"` は、何も失わない。
タイトルは、mermaid.js が持つとおりに比べる。
引用符のない語は、その間の空白を除いてつなぐので、
`title Two words` はタイトル `Twowords` を設定し、
`title Twowords` と同じである。
引用符の中のテキストとアクセシブルなタイトルは、両端の空白を除いて読む。
`title a` と `title b` の後の 3 つ目の `title a` は、
`b` を置き換えるので報告する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/xychart-no-duplicate-title: error
xychart
  title first
  title second
  line [1, 2]
```

```mmd
%% eslint @mmd-toolkit/xychart-no-duplicate-title: error
xychart
  accTitle: first
  accTitle: second
  line [1, 2]
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/xychart-no-duplicate-title: error
xychart
  title first
  accTitle: second
  line [1, 2]
```

```mmd
%% eslint @mmd-toolkit/xychart-no-duplicate-title: error
xychart
  title Sales
  title "Sales"
  line [1, 2]
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [timeline-no-duplicate-title](./timeline-no-duplicate-title.ja.md)
- [xychart-no-duplicate-description](./xychart-no-duplicate-description.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/xychart-no-duplicate-title.ts)
- [テストのソース](../../tests/rules/xychart-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
