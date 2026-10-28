# @mmd-toolkit/timeline-no-duplicate-title

英語版: [timeline-no-duplicate-title.md](./timeline-no-duplicate-title.md)

タイトルをもう一度設定する `title` か `accTitle` の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

タイムラインには 2 つのタイトルがある。
`title` が設定し、タイムラインの上に描くタイトルと、
`accTitle` が設定するアクセシブルなタイトルである。
mermaid.js は、どちらかを設定する文をすべて受理し、
それぞれが前に設定された値を黙って置き換える。
2 つ目のタイトルは、たいてい、テキストを書き直した残りか、
一部を 2 度貼り付けた残りである。

## 規則の詳細

この規則は、最初のものより後の `title` の文と、
最初のものより後の `accTitle` の文を、前と違う値を設定するときに報告する。
対象の図種は `timeline` である。

`title first` と `title second` の後、タイトルは `second` で、
`accTitle` も同じである。
行にテキストのない `accTitle:` は、空行、コメント行、指令を越えて、
テキストを持つ次の行をアクセシブルなタイトルにする。
`accTitle: a` の後の `accTitle:` と `b` の行は、
アクセシブルなタイトルを `b` にし、2 つ目の文を報告する。
2 つのタイトルは別の値である。
`title first` と `accTitle: second` は両方を設定し、どちらも報告しない。
フロントマターのタイトルは別の値であり、数えない。

語 `title` は、大文字小文字を問わず、改行でもよい 1 つの空白文字と、
空白だけでもよい行の残りとともに、タイトルの文を始める。
そのため、行の終わりの `title` は、次の行の全体をタイトルにする。
`title My life` の後の `title` と `2020 : a` の行は、
その行の字下げを含むタイトル `  2020 : a` を与え、年 `2020` はない。
規則は 2 つ目のタイトルを報告する。
その語で始まる、年のつもりの行も同じである。
`title My life` の後の `Title page : x` の行は、タイトル `page : x` を与え、
年はない。
`title` と次の行の間のコメント行は取り除かれ、その次の行を取る。
次の行の指令は、その行の一部でない。
空白だけの行と、空白と指令の行は、その空白のタイトルを与え、
`%%{init: {}}%%x` の行は、タイトル `x` を与える。
前にタイトルがなければ、そうした行は唯一のタイトルであり、報告しない。

1 つの空白文字の後に文字が続けられないところでは、 `title` は年であり、
数えない。
その文字の後に行の終わりがあるときは、 `title` と空白やタブのように、
`title` とその文字の年になる。
テキストの終わりと、改行の後に指令を除くと空になる行、つまり空行か、
1 列目から指令だけの行があるときは、年 `title` になる。
後に 2 つ以上の空白文字があれば、
`title` は最初の 1 つより後の空白のタイトルであり、数える。
`title` と空白 2 つは、空白 1 つのタイトルを与える。

図がすでに持つタイトルを設定する文は、報告しない。
`accTitle: a` の後の 2 つ目の `accTitle: a` は、何も失わない。
タイトルは、mermaid.js が持つとおりに比べる。
アクセシブルなタイトルは両端の空白を除いて比べるので、
`accTitle:  a` も同じタイトルを設定する。
`title` のテキストは空白も含めて書いたとおりに比べるので、 `title T` の後の、
空白が 2 つの `title  T` は、別のタイトルを設定し、
描いたときに 2 つのタイトルが同じに見えても報告する。
`accTitle: a` と `accTitle: b` の後の 3 つ目の `accTitle: a` は、
`b` を置き換えるので報告する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/timeline-no-duplicate-title: error
timeline
  title first
  title second
  2020 : Launch
```

```mmd
%% eslint @mmd-toolkit/timeline-no-duplicate-title: error
timeline
  accTitle: first
  accTitle: second
  2020 : Launch
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/timeline-no-duplicate-title: error
timeline
  title first
  accTitle: second
  2020 : Launch
```

```mmd
%% eslint @mmd-toolkit/timeline-no-duplicate-title: error
timeline
  title first
  title first
  2020 : Launch
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [journey-no-duplicate-title](./journey-no-duplicate-title.ja.md)
- [timeline-no-duplicate-description](./timeline-no-duplicate-description.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/timeline-no-duplicate-title.ts)
- [テストのソース](../../tests/rules/timeline-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
