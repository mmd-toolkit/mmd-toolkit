# @mmd-toolkit/radar-no-duplicate-title

英語版: [radar-no-duplicate-title.md](./radar-no-duplicate-title.md)

前に設定したタイトルを置き換える `title` や `accTitle` を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

レーダーチャートは、`title` が設定するタイトルと、
`accTitle` が設定するアクセシブルなタイトルを 1 つずつ持つ。
後の文は、前に設定したタイトルをエラーなしに置き換え、前のタイトルは失われる。

## 規則の詳細

この規則は、レーダーチャート（`radar-beta`）に当てる。
直前の `title` が設定した空でないタイトルを変える `title` と、
直前の `accTitle` が設定した空でないアクセシブルなタイトルを変える `accTitle`
を報告する。
2 つのタイトルは別であり、一方を設定しても他方を置き換えない。
文字がないか空白だけの `title` や `accTitle:`
は次の行を取らずにそのタイトルを空にし、空でないタイトルの後では報告する。

空のタイトルの後の文と、現在のタイトルを繰り返す文は報告しない。
前のタイトルに戻す文は報告する。
`title a` と `title b` の後の 3 つ目の `title a` は報告する。

この規則はフロントマターを読まないので、そのタイトルを置き換える文は報告しない。
`title first` の後の空の `title` は、図がフロントマターのタイトルを示すときも、
そのタイトルが同じ `first` であるときも報告する。

タイトルは、両端の空白を除き、
2 つ以上の空白やタブの連なりを 1 つの空白として比べる。
そのほかは書いたとおりに比べる。
mermaid.js は、
タイトルを読む前に `#35;` のような文字参照と HTML の属性の引用符を変換する。
それらだけが違うタイトルは、mermaid.js には同じでも、
この規則には違うことがある。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/radar-no-duplicate-title: error
radar-beta
  title First
  title Second
  axis A, B, C
  curve sales{1, 2, 3}
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/radar-no-duplicate-title: error
radar-beta
  title Second
  axis A, B, C
  curve sales{1, 2, 3}
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [radar-no-duplicate-description](./radar-no-duplicate-description.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/radar-no-duplicate-title.ts)
- [テストのソース](../../tests/rules/radar-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
